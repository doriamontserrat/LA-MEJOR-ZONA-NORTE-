const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener monedas del usuario
router.get('/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT cantidad FROM monedas_usuario WHERE usuario_id = ?',
      [usuario_id]
    );

    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ cantidad: rows[0].cantidad });
  } catch (error) {
    console.error('Error obteniendo monedas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar monedas
router.post('/actualizar', async (req, res) => {
  try {
    const { usuario_id, cantidad } = req.body;
    
    if (!usuario_id || cantidad === undefined) {
      return res.status(400).json({ error: 'usuario_id y cantidad son requeridos' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'UPDATE monedas_usuario SET cantidad = ? WHERE usuario_id = ?',
      [cantidad, usuario_id]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ success: true, cantidad });
  } catch (error) {
    console.error('Error actualizando monedas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sumar monedas
router.post('/sumar', async (req, res) => {
  try {
    const { usuario_id, cantidad } = req.body;
    
    if (!usuario_id || !cantidad) {
      return res.status(400).json({ error: 'usuario_id y cantidad son requeridos' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'UPDATE monedas_usuario SET cantidad = cantidad + ? WHERE usuario_id = ?',
      [cantidad, usuario_id]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ success: true, mensaje: 'Monedas sumadas' });
  } catch (error) {
    console.error('Error sumando monedas:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
