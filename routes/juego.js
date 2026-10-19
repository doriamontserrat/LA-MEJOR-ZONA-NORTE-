const express = require('express');
const router = express.Router();
const pool = require('../db');
const { obtenerEstado } = require('../lib/juego');

// Estado completo del jugador: monedas, logos, días completados y si ya terminó el juego
router.get('/estado/:usuario_id', async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuario_id, 10);
    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    const estado = await obtenerEstado((sql, params) => pool.query(sql, params), usuarioId);
    if (!estado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(estado);
  } catch (error) {
    console.error('Error obteniendo estado del juego:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
