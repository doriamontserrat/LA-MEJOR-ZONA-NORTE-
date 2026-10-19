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
const juegoRoutes = require('./routes/juego');
const logosRoutes = require('./routes/logos');
const quizRoutes = require('./routes/quiz');
const checklistRoutes = require('./routes/checklist');

// 1. Configuración de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Middlewares de parsing (JSON y URL Encoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. RUTAS DE API (Van PRIMERO para evitar conflictos con archivos estáticos)
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/monedas', monedasRoutes);
app.use('/api/juego', juegoRoutes);
app.use('/api/logos', logosRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/checklist', checklistRoutes);

// Ruta de salud/verificación de BD
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');

    res.json({ 
      status: 'OK', 
      mensaje: 'Servidor y BD funcionando correctamente',
      db: 'Conectada',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Error en health check:', error);
    // Solo el código del error: no se expone host, usuario ni mensajes internos
    res.status(503).json({ 
      status: 'ERROR', 
      mensaje: 'Error conectando a la base de datos',
      codigo: error.code || 'DESCONOCIDO',
      timestamp: new Date().toISOString()
    });
  }
});

// 4. ARCHIVOS ESTÁTICOS (solo para desarrollo local; en Vercel los sirve su CDN)
app.use(express.static(path.join(__dirname, 'Procesamiento de imagen')));

// Ruta raíz (servir index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Procesamiento de imagen', 'index.html'));
});

// 5. Manejo de rutas no encontradas (404)
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// 6. Manejo global de errores (500)
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

// 7. Iniciar el servidor localmente (SÓLO si el archivo se ejecuta directamente con Node)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('--------------------------------------------------');
    console.log(` Servidor corriendo en http://localhost:${PORT}/`);
    console.log(` API disponible en http://localhost:${PORT}/api/`);
    console.log('--------------------------------------------------');
  });

  server.on('error', (err) => {
    console.error('Error en servidor:', err);
  });
}

module.exports = app; // Requerido para Vercel