require('dotenv').config();
const mysql = require('mysql2/promise');

const env = process.env;

// Toma las variables DB_* o MYSQL_ADDON_* de Clever Cloud
const host = env.DB_HOST || env.MYSQL_ADDON_HOST || 'localhost';
const port = parseInt(env.DB_PORT || env.MYSQL_ADDON_PORT || '3306', 10);
const user = env.DB_USER || env.MYSQL_ADDON_USER || 'root';
const password = env.DB_PASSWORD || env.MYSQL_ADDON_PASSWORD || '';
const database = env.DB_NAME || env.MYSQL_ADDON_DB || 'beisbol_app';
const esLocal = ['localhost', '127.0.0.1'].includes(host);

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: parseInt(env.DB_CONNECTION_LIMIT || '2', 10),
  maxIdle: 1,
  idleTimeout: 10000,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  ssl: esLocal ? undefined : { rejectUnauthorized: false }
});

const zonaHoraria = /^[+-]\d{2}:\d{2}$/.test(env.DB_TIMEZONE || '') ? env.DB_TIMEZONE : '-06:00';

pool.pool.on('connection', (conexion) => {
  conexion.query('SET time_zone = ?', [zonaHoraria], (err) => {
    if (err) console.warn('No se pudo fijar la zona horaria de la sesión:', err.message);
  });
});

module.exports = pool;