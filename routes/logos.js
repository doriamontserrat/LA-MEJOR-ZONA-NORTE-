const express = require('express');
const router = express.Router();
const pool = require('../db');
const {
  COSTO_LOGO,
  LOGOS_ALBUM,
  transaccion,
  obtenerEstado,
  usuarioNoExiste
} = require('../lib/juego');

// Comprar un logo del álbum con monedas. El costo lo define el servidor, no el cliente.
router.post('/comprar', async (req, res) => {
  try {
    const usuarioId = parseInt(req.body.usuario_id, 10);
    const logoId = String(req.body.logo_id || '');

    if (isNaN(usuarioId) || !LOGOS_ALBUM.includes(logoId)) {
      return res.status(400).json({ error: 'usuario_id y un logo_id válido son requeridos' });
    }

    const respuesta = await transaccion(async (conexion) => {
      const [monedas] = await conexion.query(
        'SELECT cantidad FROM monedas_usuario WHERE usuario_id = ? FOR UPDATE',
        [usuarioId]
      );
      if (monedas.length === 0) {
        const [usuarios] = await conexion.query('SELECT id FROM usuarios WHERE id = ?', [usuarioId]);
        if (usuarios.length === 0) return { status: 404, cuerpo: { error: 'Usuario no encontrado' } };
      }

      const [existente] = await conexion.query(
        'SELECT id FROM logos_desbloqueados WHERE usuario_id = ? AND logo_id = ?',
        [usuarioId, logoId]
      );
      if (existente.length > 0) {
        return { status: 409, cuerpo: { error: 'Ya tienes este logo' } };
      }

      const saldo = monedas.length ? monedas[0].cantidad : 0;
      if (saldo < COSTO_LOGO) {
        return { status: 400, cuerpo: { error: 'No tienes suficientes monedas' } };
      }

      await conexion.query(
        'INSERT INTO logos_desbloqueados (usuario_id, logo_id) VALUES (?, ?)',
        [usuarioId, logoId]
      );
      await conexion.query(
        'UPDATE monedas_usuario SET cantidad = cantidad - ? WHERE usuario_id = ?',
        [COSTO_LOGO, usuarioId]
      );

      const estado = await obtenerEstado((sql, params) => conexion.query(sql, params), usuarioId);
      return { status: 200, cuerpo: { success: true, ...estado } };
    });

    res.status(respuesta.status).json(respuesta.cuerpo);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya tienes este logo' });
    }
    if (usuarioNoExiste(error)) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error('Error comprando logo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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
