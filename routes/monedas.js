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

// Las monedas solo cambian desde el servidor (checklist, quiz y compra de logos)

module.exports = router;
