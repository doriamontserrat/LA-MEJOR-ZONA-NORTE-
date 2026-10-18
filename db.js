require('dotenv').config();
const mysql = require('mysql2/promise');

const env = process.env;

// Acepta DB_* o las variables MYSQL_ADDON_* que entrega Clever Cloud
const host = env.DB_HOST || env.MYSQL_ADDON_HOST || 'localhost';
const port = parseInt(env.DB_PORT || env.MYSQL_ADDON_PORT || '3306', 10);
const user = env.DB_USER || env.MYSQL_ADDON_USER || 'root';
const password = env.DB_PASSWORD || env.MYSQL_ADDON_PASSWORD || '';
const database = env.DB_NAME || env.MYSQL_ADDON_DB || 'beisbol_app';
const esLocal = ['localhost', '127.0.0.1'].includes(host);

// Clever Cloud limita a 5 conexiones simultáneas por usuario y en Vercel cada
// instancia serverless crea su propio pool, por eso el pool es pequeño.
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

// Las rutas solo usan query() y release(). Se ejecutan con pool.query() para que una
// consulta fallida nunca deje una conexión tomada.
pool.getDedicatedConnection = pool.getConnection.bind(pool);
pool.getConnection = async () => ({
  query: (...args) => pool.query(...args),
  release() {}
});

module.exports = pool;