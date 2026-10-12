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
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', mensaje: 'Servidor y BD funcionando correctamente' });
});

// En el entorno de Vercel es crítico usar process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('--------------------------------------------------');
    console.log(` Servidor corriendo en http://localhost:${PORT}/`);
    console.log(' API disponible en http://localhost:' + PORT + '/api/');
    console.log('--------------------------------------------------');
});

module.exports = app; // Necesario para despliegues Serverless/Vercel