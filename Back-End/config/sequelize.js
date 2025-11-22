// config/sequelize.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,       // Tên DB
  process.env.DB_USER,       // User
  process.env.DB_PASSWORD,   // Password
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false, // Bật true nếu muốn log các query SQL
  }
);

module.exports = sequelize;
