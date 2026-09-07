const express = require('express');
const path = require('path');

const app = express();

// Carpeta raíz de archivos estáticos
const publicPath = path.join(__dirname, 'Procesamiento de imagen');

// Middleware para servir archivos estáticos
app.use(express.static(publicPath));
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'index.html'));
});

// Ruta catch-all para archivos HTML
app.get('/:page.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', `${req.params.page}.html`));
});

// Iniciar servidor HTTP en el puerto 3000
app.listen(3000, '0.0.0.0', () => {
    console.log('--------------------------------------------------');
    console.log(' Aqui es el link papu:');
    console.log(' http://localhost:3000/escaner.html');
    console.log('--------------------------------------------------');
    console.log(' Poner en otraterminal pal teléfono');
    console.log(' lt --port 3000');
    console.log('--------------------------------------------------');
});