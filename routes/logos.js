const express = require('express');
const router = express.Router();
const pool = require('../db');

// Desbloquear logo
router.post('/desbloquear', async (req, res) => {
  try {
    const { usuario_id, logo_id } = req.body;
    
    if (!usuario_id || !logo_id) {
      return res.status(400).json({ error: 'usuario_id y logo_id son requeridos' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT IGNORE INTO logos_desbloqueados (usuario_id, logo_id) VALUES (?, ?)',
      [usuario_id, logo_id]
    );

    connection.release();

    res.json({ success: true, mensaje: 'Logo desbloqueado' });
  } catch (error) {
    console.error('Error desbloqueando logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener logos desbloqueados de un usuario
router.get('/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT logo_id FROM logos_desbloqueados WHERE usuario_id = ? ORDER BY fecha_desbloqueado DESC',
      [usuario_id]
    );

    connection.release();

    const logos = rows.map(row => row.logo_id);
    res.json(logos);
  } catch (error) {
    console.error('Error obteniendo logos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
