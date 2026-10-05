const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const mysql = require('mysql2/promise');

// O pool reutiliza conexões com o banco entre as requisições.
const database = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'helpdesk_api',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = database;
