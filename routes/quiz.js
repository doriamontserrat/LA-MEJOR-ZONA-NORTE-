const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las preguntas
router.get('/preguntas', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT id, pregunta, opcion_1, opcion_2, opcion_3, opcion_4 FROM quiz_preguntas ORDER BY id'
    );

    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo preguntas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Guardar respuesta de quiz
router.post('/guardar-respuesta', async (req, res) => {
  try {
    const { usuario_id, pregunta_id, respuesta_seleccionada } = req.body;
    
    if (!usuario_id || !pregunta_id || respuesta_seleccionada === undefined) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const connection = await pool.getConnection();
    
    // Obtener respuesta correcta
    const [pregunta] = await connection.query(
      'SELECT respuesta_correcta FROM quiz_preguntas WHERE id = ?',
      [pregunta_id]
    );

    if (pregunta.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    const es_correcta = pregunta[0].respuesta_correcta === respuesta_seleccionada;

    // Guardar respuesta
    const [result] = await connection.query(
      'INSERT INTO quiz_respuestas_usuario (usuario_id, pregunta_id, respuesta_seleccionada, es_correcta) VALUES (?, ?, ?, ?)',
      [usuario_id, pregunta_id, respuesta_seleccionada, es_correcta]
    );

    connection.release();

    res.json({ success: true, es_correcta });
  } catch (error) {
    console.error('Error guardando respuesta:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas de quiz del usuario
router.get('/estadisticas/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      `SELECT 
        COUNT(*) as total_respuestas,
        SUM(CASE WHEN es_correcta = 1 THEN 1 ELSE 0 END) as respuestas_correctas
      FROM quiz_respuestas_usuario 
      WHERE usuario_id = ?`,
      [usuario_id]
    );

    connection.release();

    const stats = rows[0];
    const porcentaje = stats.total_respuestas > 0 
      ? Math.round((stats.respuestas_correctas / stats.total_respuestas) * 100)
      : 0;

    res.json({
      total_respuestas: stats.total_respuestas,
      respuestas_correctas: stats.respuestas_correctas,
      porcentaje_acierto: porcentaje
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
