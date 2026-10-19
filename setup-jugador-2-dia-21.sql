-- Query para poner al jugador con ID 2 en el día 21 y desbloqueado completamente
-- Este script simula que el jugador ha completado todos los 21 días del juego

USE beisbol_app;

-- 1. Primero, asegúrate de que el usuario con ID 2 existe
-- (si no existe, descomenta las siguientes líneas)
-- INSERT INTO usuarios (id, nombre, email, password_hash) 
-- VALUES (2, 'Jugador Test', 'test@example.com', 'hash_placeholder')
-- ON DUPLICATE KEY UPDATE nombre = 'Jugador Test';

-- 2. Asegurar que tiene monedas inicializadas (210 = 21 días × 10 monedas por día)
INSERT INTO monedas_usuario (usuario_id, cantidad) 
VALUES (2, 210)
ON DUPLICATE KEY UPDATE cantidad = 210;

-- 3. Desbloquear todos los 21 logos del álbum (logos 1-21, según LOGO_POR_DIA en lib/juego.js)
INSERT INTO logos_desbloqueados (usuario_id, logo_id, fecha_desbloqueado) 
VALUES 
  (2, 'logo1', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
  (2, 'logo2', DATE_SUB(CURDATE(), INTERVAL 19 DAY)),
  (2, 'logo3', DATE_SUB(CURDATE(), INTERVAL 18 DAY)),
  (2, 'logo4', DATE_SUB(CURDATE(), INTERVAL 17 DAY)),
  (2, 'logo5', DATE_SUB(CURDATE(), INTERVAL 16 DAY)),
  (2, 'logo7', DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
  (2, 'logo8', DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
  (2, 'logo9', DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
  (2, 'logo10', DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
  (2, 'logo12', DATE_SUB(CURDATE(), INTERVAL 11 DAY)),
  (2, 'logo13', DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
  (2, 'logo14', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
  (2, 'logo15', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
  (2, 'logo16', DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
  (2, 'logo18', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
  (2, 'logo19', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
  (2, 'logo20', DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
  (2, 'logo21', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
  (2, 'logo22', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
  (2, 'logo23', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (2, 'logo24', CURDATE())
ON DUPLICATE KEY UPDATE fecha_desbloqueado = VALUES(fecha_desbloqueado);

-- 4. Registrar los 21 días completados en el checklist diario
-- Estos son los mismos logos según LOGO_POR_DIA
INSERT INTO checklist_diarios (usuario_id, fecha, completado) 
VALUES 
  (2, DATE_SUB(CURDATE(), INTERVAL 20 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 19 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 18 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 17 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 16 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 15 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 14 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 13 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 12 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 11 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 9 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 8 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 7 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), TRUE),
  (2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), TRUE),
  (2, CURDATE(), TRUE)
ON DUPLICATE KEY UPDATE completado = TRUE;

-- 5. Verificar el estado del jugador 2
SELECT 
  'Monedas' AS campo,
  COALESCE((SELECT cantidad FROM monedas_usuario WHERE usuario_id = 2), 0) AS valor
UNION ALL
SELECT 
  'Logos Desbloqueados',
  (SELECT COUNT(*) FROM logos_desbloqueados WHERE usuario_id = 2)
UNION ALL
SELECT 
  'Días Completados',
  (SELECT COUNT(*) FROM checklist_diarios WHERE usuario_id = 2)
UNION ALL
SELECT 
  'Juego Completado',
  IF((SELECT COUNT(*) FROM checklist_diarios WHERE usuario_id = 2) >= 21, 'SÍ', 'NO');
