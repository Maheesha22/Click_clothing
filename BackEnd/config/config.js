'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const toNumber = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

// Load ca.pem for Aiven SSL
// Priority: DB_SSL_CA env var (for Vercel) → ca.pem file (for local)
const getSslOptions = () => {
  // Skip SSL for local development (localhost)
  if (process.env.DB_HOST && (process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1')) {
    return {};
  }

  // If SSL is explicitly disabled
  if (process.env.DB_SSL === 'false') return {};

  // Use CA cert from environment variable (set this in Vercel dashboard)
  if (process.env.DB_SSL_CA) {
    return {
      ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA,
      },
    };
  }

  // Fall back to ca.pem file for local development
  const candidates = [
    path.resolve(__dirname, '..', 'ca.pem'),
    path.resolve(process.cwd(), 'ca.pem'),
    path.resolve(process.cwd(), 'BackEnd', 'ca.pem'),
  ];
  const caPemPath = candidates.find(p => fs.existsSync(p)) || null;

  if (caPemPath) {
    return {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(caPemPath).toString(),
      },
    };
  }

  // Aiven requires SSL — if no cert found, still enable SSL but skip verification
  // Remove this once DB_SSL_CA is set in Vercel
  if (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com')) {
    return {
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  return {};
};

const sslOptions = getSslOptions();

const common = {
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  dialectOptions: {
    ...sslOptions,
  },
};

const fromEnv = () => {
  if (process.env.DATABASE_URL) {
    return {
      ...common,
      use_env_variable: 'DATABASE_URL',
    };
  }

  return {
    ...common,
    username: process.env.DB_USER,
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: toNumber(process.env.DB_PORT, 3306),
  };
};

module.exports = {
  development: fromEnv(),
  test: fromEnv(),
  production: fromEnv(),
};
