const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Importar conexión a base de datos
const db = require('./db');

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const favoritosRoutes = require('./routes/favoritos');
const monedasRoutes = require('./routes/monedas');
const logosRoutes = require('./routes/logos');
const quizRoutes = require('./routes/quiz');
const checklistRoutes = require('./routes/checklist');

// Middleware CORS para permitir solicitudes desde cualquier origen
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
// El avatar viaja como base64, el límite por defecto (100kb) es insuficiente
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));

// Servir archivos estáticos desde 'Procesamiento de imagen' y sus subcarpetas
app.use(express.static(path.join(__dirname, 'Procesamiento de imagen')));

// Servir recursos de la raíz también
app.use(express.static(__dirname));

// Rutas de API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/monedas', monedasRoutes);
app.use('/api/logos', logosRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/checklist', checklistRoutes);

// Ruta raíz (abre index.html por defecto)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Procesamiento de imagen', 'index.html'));
});

// Ruta de salud para verificar la conexión a BD
app.get('/api/health', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query('SELECT 1');
    connection.release();
    
    res.json({ 
      status: 'OK', 
      mensaje: 'Servidor y BD funcionando correctamente',
      db: 'Conectada',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Error en health check:', error.message);
    res.status(503).json({ 
      status: 'ERROR', 
      mensaje: 'Error conectando a la base de datos',
      error: error.message,
      timestamp: new Date().toISOString(),
      debug: {
        dbHost: process.env.DB_HOST,
        dbPort: process.env.DB_PORT,
        dbUser: process.env.DB_USER,
        dbName: process.env.DB_NAME
      }
    });
  }
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

// En el entorno de Vercel es crítico usar process.env.PORT
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('--------------------------------------------------');
    console.log(` Servidor corriendo en http://localhost:${PORT}/`);
    console.log(' API disponible en http://localhost:' + PORT + '/api/');
    console.log('--------------------------------------------------');
});

// Manejo de conexiones
server.on('error', (err) => {
  console.error('Error en servidor:', err);
});

module.exports = app; // Necesario para despliegues Serverless/Vercel