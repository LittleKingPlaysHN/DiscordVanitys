require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

console.log(`[DATABASE] - Pool MySQL ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);

async function query(...args) {
  try {
    return await pool.query(...args);
  } catch (error) {
    console.error('[DATABASE] -  Error en query MySQL', error.code || error);
    throw error;
  }
}

module.exports = { pool, query };
