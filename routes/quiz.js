const express = require('express');
const router = express.Router();
const pool = require('../db');
const banco = require('../data/quiz-preguntas');
const { transaccion, sumarMonedas, usuarioNoExiste } = require('../lib/juego');

const PREGUNTAS_POR_QUIZ = 5;
const MONEDAS_PRIMERA_VEZ = 5;
const MONEDAS_REPETICION = 1;

// Copia a quiz_preguntas las preguntas del banco que todavía no estén en la base de datos
let sincronizacion = null;
function sincronizarBanco() {
  if (!sincronizacion) {
    sincronizacion = (async () => {
      const [existentes] = await pool.query('SELECT pregunta FROM quiz_preguntas');
      const textos = new Set(existentes.map((fila) => fila.pregunta));
      const faltantes = banco.filter((p) => !textos.has(p.pregunta));
      if (faltantes.length === 0) return;

      await pool.query(
        'INSERT INTO quiz_preguntas (pregunta, respuesta_correcta, opcion_1, opcion_2, opcion_3, opcion_4) VALUES ?',
        [faltantes.map((p) => [p.pregunta, p.respuestaCorrecta + 1, ...p.opciones])]
      );
    })().catch((error) => {
      sincronizacion = null;
      throw error;
    });
  }
  return sincronizacion;
}

async function respuestasDeHoy(consultar, usuarioId) {
  const [filas] = await consultar(
    'SELECT COUNT(*) AS total FROM quiz_respuestas_usuario WHERE usuario_id = ? AND DATE(fecha_respuesta) = CURDATE()',
    [usuarioId]
  );
  return filas[0].total;
}

// Preguntas al azar (sin la respuesta correcta). Las primeras 5 respuestas del día pagan más.
router.get('/preguntas', async (req, res) => {
  try {
    await sincronizarBanco();

    const [rows] = await pool.query(
      'SELECT id, pregunta, opcion_1, opcion_2, opcion_3, opcion_4 FROM quiz_preguntas ORDER BY RAND() LIMIT ?',
      [PREGUNTAS_POR_QUIZ]
    );

    const usuarioId = parseInt(req.query.usuario_id, 10);
    const repeticion = isNaN(usuarioId)
      ? false
      : (await respuestasDeHoy((sql, params) => pool.query(sql, params), usuarioId)) >= PREGUNTAS_POR_QUIZ;

    res.json({
      preguntas: rows.map((fila) => ({
        id: fila.id,
        pregunta: fila.pregunta,
        opciones: [fila.opcion_1, fila.opcion_2, fila.opcion_3, fila.opcion_4]
      })),
      repeticion,
      monedas_por_acierto: repeticion ? MONEDAS_REPETICION : MONEDAS_PRIMERA_VEZ
    });
  } catch (error) {
    console.error('Error obteniendo preguntas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Guardar una respuesta (1-4, o null si se acabó el tiempo) y pagar las monedas si es correcta
router.post('/guardar-respuesta', async (req, res) => {
  try {
    const usuarioId = parseInt(req.body.usuario_id, 10);
    const preguntaId = parseInt(req.body.pregunta_id, 10);
    const bruta = req.body.respuesta_seleccionada;
    const seleccionada = bruta === null || bruta === undefined ? null : parseInt(bruta, 10);

    if (isNaN(usuarioId) || isNaN(preguntaId) || (seleccionada !== null && !(seleccionada >= 1 && seleccionada <= 4))) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const respuesta = await transaccion(async (conexion) => {
      const consultar = (sql, params) => conexion.query(sql, params);

      // Bloquea al usuario para que el conteo de respuestas del día sea consistente
      const [usuarios] = await conexion.query('SELECT id FROM usuarios WHERE id = ? FOR UPDATE', [usuarioId]);
      if (usuarios.length === 0) return { status: 404, cuerpo: { error: 'Usuario no encontrado' } };

      const [preguntas] = await conexion.query(
        'SELECT respuesta_correcta FROM quiz_preguntas WHERE id = ?',
        [preguntaId]
      );
      if (preguntas.length === 0) return { status: 404, cuerpo: { error: 'Pregunta no encontrada' } };

      const correcta = preguntas[0].respuesta_correcta;
      const esCorrecta = seleccionada === correcta;
      const previas = await respuestasDeHoy(consultar, usuarioId);

      await conexion.query(
        'INSERT INTO quiz_respuestas_usuario (usuario_id, pregunta_id, respuesta_seleccionada, es_correcta) VALUES (?, ?, ?, ?)',
        [usuarioId, preguntaId, seleccionada, esCorrecta]
      );

      let monedasGanadas = 0;
      if (esCorrecta) {
        monedasGanadas = previas < PREGUNTAS_POR_QUIZ ? MONEDAS_PRIMERA_VEZ : MONEDAS_REPETICION;
        await sumarMonedas(conexion, usuarioId, monedasGanadas);
      }

      const [monedas] = await conexion.query('SELECT cantidad FROM monedas_usuario WHERE usuario_id = ?', [usuarioId]);
      return {
        status: 200,
        cuerpo: {
          success: true,
          es_correcta: esCorrecta,
          respuesta_correcta: correcta,
          monedas_ganadas: monedasGanadas,
          monedas_total: monedas.length ? monedas[0].cantidad : 0
        }
      };
    });

    res.status(respuesta.status).json(respuesta.cuerpo);
  } catch (error) {
    if (usuarioNoExiste(error)) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error('Error guardando respuesta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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
