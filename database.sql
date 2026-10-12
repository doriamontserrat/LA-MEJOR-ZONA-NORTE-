-- Crear base de datos
CREATE DATABASE IF NOT EXISTS beisbol_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE beisbol_app;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  avatar LONGTEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  equipo VARCHAR(100) NOT NULL,
  fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (usuario_id, equipo),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Monedas del Usuario
CREATE TABLE IF NOT EXISTS monedas_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  cantidad INT DEFAULT 0,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Logos Desbloqueados
CREATE TABLE IF NOT EXISTS logos_desbloqueados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  logo_id VARCHAR(100) NOT NULL,
  fecha_desbloqueado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_logo (usuario_id, logo_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Checklist Diario
CREATE TABLE IF NOT EXISTS checklist_diarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha DATE NOT NULL,
  completado BOOLEAN DEFAULT TRUE,
  UNIQUE KEY unique_checklist (usuario_id, fecha),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Preguntas Quiz
CREATE TABLE IF NOT EXISTS quiz_preguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pregunta TEXT NOT NULL,
  respuesta_correcta INT NOT NULL,
  opcion_1 VARCHAR(255) NOT NULL,
  opcion_2 VARCHAR(255) NOT NULL,
  opcion_3 VARCHAR(255) NOT NULL,
  opcion_4 VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Respuestas Quiz del Usuario
CREATE TABLE IF NOT EXISTS quiz_respuestas_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  pregunta_id INT NOT NULL,
  respuesta_seleccionada INT,
  es_correcta BOOLEAN,
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (pregunta_id) REFERENCES quiz_preguntas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Equipos/Estadios
CREATE TABLE IF NOT EXISTS equipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  estadio VARCHAR(100),
  fundacion INT,
  descripcion TEXT,
  logo_url VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Sesiones/Actividad
CREATE TABLE IF NOT EXISTS sesiones_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre TIMESTAMP NULL,
  dispositivo VARCHAR(100),
  ip_address VARCHAR(45),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear índices para mejor rendimiento
CREATE INDEX idx_usuario_favorito ON favoritos(usuario_id);
CREATE INDEX idx_usuario_logo ON logos_desbloqueados(usuario_id);
CREATE INDEX idx_usuario_checklist ON checklist_diarios(usuario_id, fecha);
CREATE INDEX idx_usuario_quiz ON quiz_respuestas_usuario(usuario_id, fecha_respuesta);

-- Insertar datos de equipos de ejemplo
INSERT INTO equipos (nombre, ciudad, estadio, fundacion) VALUES
('Sultanes de Monterrey', 'Monterrey', 'Estadio Tecnológico', 1939),
('Dorados de Chihuahua', 'Chihuahua', 'Estadio de Béisbol Chihuahua', 1936),
('Saraperos de Saltillo', 'Saltillo', 'Estadio Saraperos de Saltillo', 1924),
('Acereros de Monclova', 'Monclova', 'Estadio de Béisbol Monclova', 1945),
('Algodoneros de Unión Laguna', 'Torreón', 'Estadio Revolución', 1940),
('Toros de Tijuana', 'Tijuana', 'Estadio Caliente', 2004),
('Tecolotes de los Dos Laredos', 'Nuevo Laredo', 'Estadio Tecolotes', 1972),
('Rieleros de Aguascalientes', 'Aguascalientes', 'Estadio Rieleros', 1962),
('Charros de Jalisco', 'Guadalajara', 'Estadio Jalisco', 1954);
