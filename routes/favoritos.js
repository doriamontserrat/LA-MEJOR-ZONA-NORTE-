const express = require('express');
const router = express.Router();
const pool = require('../db');

// Agregar favorito
router.post('/agregar', async (req, res) => {
  try {
    const { usuario_id, equipo } = req.body;
    
    if (!usuario_id || !equipo) {
      return res.status(400).json({ error: 'usuario_id y equipo son requeridos' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT IGNORE INTO favoritos (usuario_id, equipo) VALUES (?, ?)',
      [usuario_id, equipo]
    );

    connection.release();

    res.json({ success: true, mensaje: 'Favorito agregado' });
  } catch (error) {
    console.error('Error agregando favorito:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar favorito
router.delete('/eliminar', async (req, res) => {
  try {
    const { usuario_id, equipo } = req.body;
    
    if (!usuario_id || !equipo) {
      return res.status(400).json({ error: 'usuario_id y equipo son requeridos' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'DELETE FROM favoritos WHERE usuario_id = ? AND equipo = ?',
      [usuario_id, equipo]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorito no encontrado' });
    }

    res.json({ success: true, mensaje: 'Favorito eliminado' });
  } catch (error) {
    console.error('Error eliminando favorito:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener favoritos de un usuario
router.get('/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT equipo FROM favoritos WHERE usuario_id = ? ORDER BY fecha_agregado DESC',
      [usuario_id]
    );

    connection.release();

    const favoritos = rows.map(row => row.equipo);
    res.json(favoritos);
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
