const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());

// 1. Servir la carpeta 'html' como estática (para que /principal.html busque automáticamente en /html)
app.use(express.static(path.join(__dirname, 'html')));

// 2. Servir recursos de la raíz y subcarpetas (js, img, style.css, etc.)
app.use(express.static(__dirname));

// Ruta raíz (abre index.html por defecto)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// En el entorno de Vercel es crítico usar process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('--------------------------------------------------');
    console.log(` Servidor corriendo en http://localhost:${PORT}/escaner.html`);
    console.log('--------------------------------------------------');
});

module.exports = app; // Necesario para despliegues Serverless/Vercel