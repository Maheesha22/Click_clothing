require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config/config.js')['development'];

console.log('Using config:', {
  ...config,
  password: config.password ? '****' : 'null'
});

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

async function test() {
  try {
    console.log('Attempting to authenticate...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

test();
