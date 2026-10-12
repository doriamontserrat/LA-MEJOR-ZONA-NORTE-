const express = require('express');
const router = express.Router();
const pool = require('../db');

// Marcar checklist completado
router.post('/marcar-completado', async (req, res) => {
  try {
    const { usuario_id } = req.body;
    
    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    const connection = await pool.getConnection();
    const hoy = new Date().toISOString().split('T')[0];
    
    const [result] = await connection.query(
      'INSERT IGNORE INTO checklist_diarios (usuario_id, fecha, completado) VALUES (?, ?, ?)',
      [usuario_id, hoy, true]
    );

    connection.release();

    res.json({ success: true, mensaje: 'Checklist marcado como completado' });
  } catch (error) {
    console.error('Error marcando checklist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener dias completados del usuario
router.get('/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT fecha FROM checklist_diarios WHERE usuario_id = ? ORDER BY fecha ASC',
      [usuario_id]
    );

    connection.release();

    const dias = rows.map(row => row.fecha.toISOString().split('T')[0]);
    res.json(dias);
  } catch (error) {
    console.error('Error obteniendo checklist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verificar si ya completó hoy
router.get('/completado-hoy/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    const hoy = new Date().toISOString().split('T')[0];
    
    const [rows] = await connection.query(
      'SELECT id FROM checklist_diarios WHERE usuario_id = ? AND fecha = ?',
      [usuario_id, hoy]
    );

    connection.release();

    res.json({ completado_hoy: rows.length > 0 });
  } catch (error) {
    console.error('Error verificando checklist:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
