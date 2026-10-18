const mysql = require('mysql2/promise');
require('dotenv').config();

// Log de las variables (debug) para confirmar que no digan "undefined"
console.log('DB Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  env: process.env.NODE_ENV
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beisbol_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ESTO ES CLAVE: Muchos servidores remotos exigen SSL
  ssl: process.env.NODE_ENV === 'production' || process.env.DB_HOST !== 'localhost' ? {
    rejectUnauthorized: false
  } : undefined
});

// Probar la conexión (sin bloquear la inicialización del servidor)
pool.getConnection()
  .then(connection => {
    console.log('✓ Conectado a MySQL exitosamente');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Error conectando a MySQL:', err.message);
    console.error('Detalles:', err);
  });

module.exports = pool;