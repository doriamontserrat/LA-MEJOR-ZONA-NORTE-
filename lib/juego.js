const pool = require('../db');

const TOTAL_DIAS = 21;
const MONEDAS_CHECKLIST = 10;
const COSTO_LOGO = 100;

// Logo del álbum que se gana cada día; el target del escáner del día N es el índice N - 1.
const LOGO_POR_DIA = [
  'logo1', 'logo2', 'logo3', 'logo4', 'logo5', 'logo7', 'logo8',
  'logo9', 'logo10', 'logo12', 'logo13', 'logo14', 'logo15', 'logo16',
  'logo18', 'logo19', 'logo20', 'logo21', 'logo22', 'logo23', 'logo24'
];

// Los 3 logos restantes del álbum (sin target en el escáner) solo se consiguen con monedas.
const LOGOS_ALBUM = Array.from({ length: 24 }, (_, i) => `logo${i + 1}`);

async function transaccion(trabajo) {
  const conexion = await pool.getDedicatedConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    try { await conexion.rollback(); } catch (_) { /* la conexión ya se perdió */ }
    throw error;
  } finally {
    conexion.release();
  }
}

async function sumarMonedas(conexion, usuarioId, cantidad) {
  await conexion.query(
    `INSERT INTO monedas_usuario (usuario_id, cantidad) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE cantidad = cantidad + ?`,
    [usuarioId, cantidad, cantidad]
  );
}

// `consultar` es pool.query o conexion.query, para poder leer dentro de una transacción.
async function obtenerEstado(consultar, usuarioId) {
  const [usuarios] = await consultar('SELECT id FROM usuarios WHERE id = ?', [usuarioId]);
  if (usuarios.length === 0) return null;

  const [monedas] = await consultar('SELECT cantidad FROM monedas_usuario WHERE usuario_id = ?', [usuarioId]);
  const [logos] = await consultar(
    'SELECT logo_id FROM logos_desbloqueados WHERE usuario_id = ? ORDER BY fecha_desbloqueado, id',
    [usuarioId]
  );
  const [dias] = await consultar(
    "SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, fecha = CURDATE() AS es_hoy FROM checklist_diarios WHERE usuario_id = ? ORDER BY fecha",
    [usuarioId]
  );

  const diasCompletados = dias.length;
  return {
    monedas: monedas.length ? monedas[0].cantidad : 0,
    logos_desbloqueados: logos.map((fila) => fila.logo_id),
    checklist_dias: dias.map((fila) => fila.fecha),
    dias_completados: diasCompletados,
    dia_actual: Math.min(diasCompletados + 1, TOTAL_DIAS),
    total_dias: TOTAL_DIAS,
    checklist_hecho_hoy: dias.some((fila) => Number(fila.es_hoy) === 1),
    juego_completado: diasCompletados >= TOTAL_DIAS
  };
}

const usuarioNoExiste = (error) => error && error.code === 'ER_NO_REFERENCED_ROW_2';

module.exports = {
  TOTAL_DIAS,
  MONEDAS_CHECKLIST,
  COSTO_LOGO,
  LOGO_POR_DIA,
  LOGOS_ALBUM,
  transaccion,
  sumarMonedas,
  obtenerEstado,
  usuarioNoExiste
};
