-- ============================================
-- Configurar Password para Teddy
-- ============================================
-- Contraseña: Ner2026! (misma que Moshe)

-- Actualizar passwordHash para Teddy
UPDATE "Usuario"
SET "passwordHash" = '$2b$10$sZ.rGKodPXICtkK19eDWEerZJ5NRk2sDD2sXW/Ppv2tk6ESX2MgU6'
WHERE "correo" = 'teddy@nerlatalmud.com';

-- Verificar que se actualizó correctamente
SELECT 
  id,
  nombre,
  correo,
  rol,
  estado,
  "passwordHash" IS NOT NULL as tiene_password,
  LENGTH("passwordHash") as hash_length
FROM "Usuario"
WHERE "correo" = 'teddy@nerlatalmud.com';

-- Verificar que ambos usuarios tienen el mismo hash
SELECT 
  nombre,
  correo,
  rol,
  "passwordHash" IS NOT NULL as tiene_password
FROM "Usuario"
WHERE "correo" IN ('teddy@nerlatalmud.com', 'moshe@nerlatalmud.com')
ORDER BY nombre;
