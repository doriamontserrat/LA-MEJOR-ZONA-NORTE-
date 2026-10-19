const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../db');

const COLUMNAS_PUBLICAS =
  "id, nombre, email, telefono, DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento, avatar, fecha_registro";

const MIN_PASSWORD = 6;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verificarPassword(password, almacenado) {
  const [salt, hash] = almacenado.split(':');
  if (!salt || !hash) return false;
  const calculado = crypto.scryptSync(password, salt, 64);
  const esperado = Buffer.from(hash, 'hex');
  return calculado.length === esperado.length && crypto.timingSafeEqual(calculado, esperado);
}

const normalizarEmail = (email) => String(email || '').trim().toLowerCase();

// Sanitizador de valores opcionales para tipos DATE o VARCHAR en MySQL
const limpiarOpcional = (val) => (val && String(val).trim() !== '' ? String(val).trim() : null);

// Registrar usuario
router.post('/crear', async (req, res) => {
  try {
    const { nombre, telefono, fecha_nacimiento, avatar, password } = req.body;
    const email = normalizarEmail(req.body.email);

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }
    if (String(password).length < MIN_PASSWORD) {
      return res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres` });
    }

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, telefono, fecha_nacimiento, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [
        String(nombre).trim(),
        email,
        hashPassword(String(password)),
        limpiarOpcional(telefono),
        limpiarOpcional(fecha_nacimiento),
        limpiarOpcional(avatar)
      ]
    );

    // Insertar registro inicial en la tabla monedas_usuario (cumple con la relación 1 a 1)
    try {
      await pool.query(
        'INSERT INTO monedas_usuario (usuario_id, cantidad) VALUES (?, ?)',
        [result.insertId, 0]
      );
    } catch (monedaErr) {
      console.warn('Advertencia al crear registro de monedas:', monedaErr.message);
    }

    const [rows] = await pool.query(
      `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      usuario_id: result.insertId,
      usuario: rows[0],
      mensaje: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error('Error en POST /api/usuarios/crear:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe una cuenta registrada con este correo' });
    }

    res.status(500).json({
      error: 'Error interno del servidor al crear usuario',
      detalle: error.message
    });
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const email = normalizarEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const [rows] = await pool.query(
      `SELECT ${COLUMNAS_PUBLICAS}, password_hash FROM usuarios WHERE email = ?`,
      [email]
    );

    if (rows.length === 0 || !verificarPassword(String(password), rows[0].password_hash)) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const { password_hash, ...usuario } = rows[0];
    res.json({ success: true, usuario });
  } catch (error) {
    console.error('Error en POST /api/usuarios/login:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
});

// Obtener usuario por ID
router.get('/id/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    const [rows] = await pool.query(
      `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error en GET /api/usuarios/id:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
});

// Actualizar perfil
router.put('/actualizar/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    const { nombre, telefono, fecha_nacimiento, avatar, password } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const campos = ['nombre = ?', 'telefono = ?', 'fecha_nacimiento = ?'];
    const valores = [
      String(nombre).trim(),
      limpiarOpcional(telefono),
      limpiarOpcional(fecha_nacimiento)
    ];

    if (avatar) {
      campos.push('avatar = ?');
      valores.push(avatar);
    }
    if (password && String(password).trim() !== '') {
      if (String(password).length < MIN_PASSWORD) {
        return res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres` });
      }
      campos.push('password_hash = ?');
      valores.push(hashPassword(String(password)));
    }

    const [result] = await pool.query(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
      [...valores, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const [rows] = await pool.query(
      `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`,
      [userId]
    );

    res.json({ success: true, usuario: rows[0], mensaje: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error en PUT /api/usuarios/actualizar:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
});

module.exports = router;