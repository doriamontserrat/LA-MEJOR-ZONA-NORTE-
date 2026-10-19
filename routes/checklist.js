const express = require('express');
const router = express.Router();
const pool = require('../db');
const {
  TOTAL_DIAS,
  MONEDAS_CHECKLIST,
  LOGO_POR_DIA,
  transaccion,
  sumarMonedas,
  obtenerEstado,
  usuarioNoExiste
} = require('../lib/juego');

// Registrar un escaneo. Solo cuenta si el target escaneado es el del día que le toca al usuario:
// entonces se guarda el checklist de hoy, se desbloquea el logo del día y se suman las monedas.
router.post('/escaneo', async (req, res) => {
  try {
    const usuarioId = parseInt(req.body.usuario_id, 10);
    const targetIndex = parseInt(req.body.target_index, 10);

    if (isNaN(usuarioId) || isNaN(targetIndex)) {
      return res.status(400).json({ error: 'usuario_id y target_index son requeridos' });
    }

    const respuesta = await transaccion(async (conexion) => {
      const consultar = (sql, params) => conexion.query(sql, params);

      // Bloquea la fila del usuario para que dos escaneos simultáneos no premien dos veces
      const [usuarios] = await conexion.query('SELECT id FROM usuarios WHERE id = ? FOR UPDATE', [usuarioId]);
      if (usuarios.length === 0) return { status: 404, cuerpo: { error: 'Usuario no encontrado' } };

      const antes = await obtenerEstado(consultar, usuarioId);

      if (antes.juego_completado) {
        return { status: 200, cuerpo: { success: true, desbloqueado: false, motivo: 'juego_completado', ...antes } };
      }
      if (antes.checklist_hecho_hoy) {
        return { status: 200, cuerpo: { success: true, desbloqueado: false, motivo: 'ya_completado_hoy', ...antes } };
      }

      const dia = antes.dia_actual;
      if (targetIndex !== dia - 1) {
        return { status: 200, cuerpo: { success: true, desbloqueado: false, motivo: 'otro_logo', ...antes } };
      }

      const logoId = LOGO_POR_DIA[dia - 1];
      await conexion.query(
        'INSERT INTO checklist_diarios (usuario_id, fecha, completado) VALUES (?, CURDATE(), TRUE)',
        [usuarioId]
      );
      const [logo] = await conexion.query(
        'INSERT IGNORE INTO logos_desbloqueados (usuario_id, logo_id) VALUES (?, ?)',
        [usuarioId, logoId]
      );
      await sumarMonedas(conexion, usuarioId, MONEDAS_CHECKLIST);

      const despues = await obtenerEstado(consultar, usuarioId);
      return {
        status: 200,
        cuerpo: {
          success: true,
          desbloqueado: true,
          dia,
          logo_id: logoId,
          logo_nuevo: logo.affectedRows === 1,
          monedas_ganadas: MONEDAS_CHECKLIST,
          juego_completado: dia === TOTAL_DIAS,
          ...despues
        }
      };
    });

    res.status(respuesta.status).json(respuesta.cuerpo);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.json({ success: true, desbloqueado: false, motivo: 'ya_completado_hoy' });
    }
    if (usuarioNoExiste(error)) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error('Error registrando escaneo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener dias completados del usuario
router.get('/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      "SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha FROM checklist_diarios WHERE usuario_id = ? ORDER BY fecha ASC",
      [usuario_id]
    );

    connection.release();

    res.json(rows.map(row => row.fecha));
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
    
    const [rows] = await connection.query(
      'SELECT id FROM checklist_diarios WHERE usuario_id = ? AND fecha = CURDATE()',
      [usuario_id]
    );

    connection.release();

    res.json({ completado_hoy: rows.length > 0 });
  } catch (error) {
    console.error('Error verificando checklist:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
