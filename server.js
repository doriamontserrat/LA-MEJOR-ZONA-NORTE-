const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());

// Servir archivos estáticos desde 'Procesamiento de imagen' y sus subcarpetas
app.use(express.static(path.join(__dirname, 'Procesamiento de imagen')));

// Servir recursos de la raíz también
app.use(express.static(__dirname));

// Ruta raíz (abre index.html por defecto)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Procesamiento de imagen', 'index.html'));
});

// En el entorno de Vercel es crítico usar process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('--------------------------------------------------');
    console.log(` Servidor corriendo en http://localhost:${PORT}/escaner.html`);
    console.log('--------------------------------------------------');
});

module.exports = app; // Necesario para despliegues Serverless/Vercel