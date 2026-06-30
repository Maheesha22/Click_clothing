'use strict';

require('dotenv').config();

const toNumber = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const common = {
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
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
