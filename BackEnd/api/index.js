// Force-require mysql2 before anything else so Vercel's bundler includes it
require('mysql2');
require('mysql2/promise');

const app = require('../index');

module.exports = app;
