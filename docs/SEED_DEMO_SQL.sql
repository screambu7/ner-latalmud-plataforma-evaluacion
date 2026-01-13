-- ============================================
-- Seed Demo - SQL Directo para Supabase
-- ============================================
-- Ejecuta este script en Supabase SQL Editor
-- Este script crea datos demo completos para testing

-- IMPORTANTE: Ajusta los emails según necesites
-- Reemplaza 'admin@demo.nerlatalmud.local' con el email que quieras usar

BEGIN;

-- ============================================
-- 1. CREAR SUPER_ADMIN DEMO
-- ============================================
INSERT INTO "Usuario" (nombre, correo, rol, estado, "passwordHash", "creadoEn")
VALUES (
  'Admin Demo',
  'admin@demo.nerlatalmud.local',
  'SUPER_ADMIN',
  'ACTIVO',
  '$2b$10$sZ.rGKodPXICtkK19eDWEerZJ5NRk2sDD2sXW/Ppv2tk6ESX2MgU6', -- Hash aleatorio (no se usará)
  NOW()
)
ON CONFLICT (correo) DO UPDATE
SET 
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  estado = EXCLUDED.estado;

-- ============================================
-- 2. CREAR EVALUADOR DEMO
-- ============================================
INSERT INTO "Usuario" (nombre, correo, rol, estado, "passwordHash", "creadoEn")
VALUES (
  'Evaluador Demo',
  'demo.evaluador@demo.nerlatalmud.local',
  'EVALUADOR',
  'ACTIVO',
  '$2b$10$sZ.rGKodPXICtkK19eDWEerZJ5NRk2sDD2sXW/Ppv2tk6ESX2MgU6', -- Hash aleatorio
  NOW()
)
ON CONFLICT (correo) DO UPDATE
SET 
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  estado = EXCLUDED.estado;

-- ============================================
-- 3. CREAR ESCUELA DEMO
-- ============================================
INSERT INTO "Escuela" (id, nombre, direccion, telefono, correo, estado, "creadoEn")
VALUES (
  1,
  'Yeshiva Demo Ner LaTalmud',
  '123 Calle Demo, Ciudad Demo',
  '+1-555-0100',
  'demo.escuela@demo.nerlatalmud.local',
  'ACTIVO',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  nombre = EXCLUDED.nombre,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  correo = EXCLUDED.correo,
  estado = EXCLUDED.estado;

-- Asociar evaluador a la escuela
UPDATE "Usuario"
SET "escuelaId" = 1
WHERE correo = 'demo.evaluador@demo.nerlatalmud.local';

-- ============================================
-- 4. CREAR ALUMNOS DEMO (10 alumnos)
-- ============================================
INSERT INTO "Alumno" (nombre, correo, tipo, status, "escuelaId", "creadoEn")
VALUES
  ('Yosef Cohen', 'demo.alumno1@demo.nerlatalmud.local', 'ESCUELA', 'ACTIVO', 1, NOW()),
  ('David Levi', 'demo.alumno2@demo.nerlatalmud.local', 'ESCUELA', 'ACTIVO', 1, NOW()),
  ('Moshe Ben-David', 'demo.alumno3@demo.nerlatalmud.local', 'INDEPENDIENTE', 'ACTIVO', NULL, NOW()),
  ('Avi Goldstein', 'demo.alumno4@demo.nerlatalmud.local', 'ESCUELA', 'ACTIVO', 1, NOW()),
  ('Shmuel Katz', 'demo.alumno5@demo.nerlatalmud.local', 'ESCUELA', 'EN_PAUSA', 1, NOW()),
  ('Yitzchak Rosen', 'demo.alumno6@demo.nerlatalmud.local', 'INDEPENDIENTE', 'ACTIVO', NULL, NOW()),
  ('Yaakov Silver', 'demo.alumno7@demo.nerlatalmud.local', 'ESCUELA', 'ACTIVO', 1, NOW()),
  ('Chaim Weiss', 'demo.alumno8@demo.nerlatalmud.local', 'ESCUELA', 'NIVEL_LOGRADO', 1, NOW()),
  ('Eli Friedman', 'demo.alumno9@demo.nerlatalmud.local', 'INDEPENDIENTE', 'ACTIVO', NULL, NOW()),
  ('Daniel Schwartz', 'demo.alumno10@demo.nerlatalmud.local', 'ESCUELA', 'ACTIVO', 1, NOW())
ON CONFLICT (correo) DO UPDATE
SET 
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  status = EXCLUDED.status,
  "escuelaId" = EXCLUDED."escuelaId";

-- ============================================
-- 5. CREAR EVALUACIONES DEMO
-- ============================================
-- Nota: Esto requiere IDs de alumnos y evaluador
-- Ejecuta después de verificar que los alumnos fueron creados

-- Obtener IDs necesarios
DO $$
DECLARE
  evaluador_id INTEGER;
  alumno_ids INTEGER[];
  evaluacion_id INTEGER;
  i INTEGER;
  j INTEGER;
  tipo_diagnostico TEXT;
  fecha_eval DATE;
BEGIN
  -- Obtener ID del evaluador
  SELECT id INTO evaluador_id FROM "Usuario" WHERE correo = 'demo.evaluador@demo.nerlatalmud.local';
  
  -- Obtener IDs de alumnos
  SELECT ARRAY_AGG(id) INTO alumno_ids FROM "Alumno" WHERE correo LIKE 'demo.alumno%@demo.nerlatalmud.local';
  
  -- Crear 2-3 evaluaciones por alumno
  FOR i IN 1..array_length(alumno_ids, 1) LOOP
    FOR j IN 1..3 LOOP
      -- Tipo de diagnóstico aleatorio
      tipo_diagnostico := CASE (j % 3)
        WHEN 0 THEN 'INICIAL'
        WHEN 1 THEN 'SEGUIMIENTO'
        ELSE 'FINAL'
      END;
      
      -- Fecha aleatoria en los últimos 6 meses
      fecha_eval := CURRENT_DATE - (random() * 180)::INTEGER;
      
      -- Crear evaluación
      INSERT INTO "Evaluacion" ("alumnoId", "evaluadorId", "tipoDiagnostico", "fechaEvaluacion", "creadoEn")
      VALUES (alumno_ids[i], evaluador_id, tipo_diagnostico::"TipoDiagnostico", fecha_eval, NOW())
      RETURNING id INTO evaluacion_id;
      
      -- Crear detalles de evaluación (3-6 subhabilidades)
      INSERT INTO "EvaluacionDetalle" ("evaluacionId", subhabilidad, puntuacion, "creadoEn")
      VALUES
        (evaluacion_id, 'lectura_basica', (random() * 4 + 1)::INTEGER, NOW()),
        (evaluacion_id, 'comprension_textual', (random() * 4 + 1)::INTEGER, NOW()),
        (evaluacion_id, 'analisis_logico', (random() * 4 + 1)::INTEGER, NOW()),
        (evaluacion_id, 'vocabulario_arameo', (random() * 4 + 1)::INTEGER, NOW()),
        (evaluacion_id, 'traduccion_precisa', (random() * 4 + 1)::INTEGER, NOW())
      ON CONFLICT DO NOTHING;
      
      -- Crear reporte (50% de probabilidad)
      IF random() > 0.5 THEN
        INSERT INTO "Reporte" ("evaluacionId", tipo, "fechaGeneracion", "creadoEn")
        VALUES (evaluacion_id, 'PROGRESO'::"TipoReporte", fecha_eval, NOW())
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 
  'Usuarios' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN rol = 'SUPER_ADMIN' THEN 1 END) as super_admins,
  COUNT(CASE WHEN rol = 'EVALUADOR' THEN 1 END) as evaluadores
FROM "Usuario"
WHERE correo LIKE '%@demo.nerlatalmud.local'
UNION ALL
SELECT 
  'Escuelas' as tabla,
  COUNT(*) as total,
  NULL as super_admins,
  NULL as evaluadores
FROM "Escuela"
WHERE id = 1
UNION ALL
SELECT 
  'Alumnos' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN tipo = 'ESCUELA' THEN 1 END) as super_admins,
  COUNT(CASE WHEN tipo = 'INDEPENDIENTE' THEN 1 END) as evaluadores
FROM "Alumno"
WHERE correo LIKE '%@demo.nerlatalmud.local'
UNION ALL
SELECT 
  'Evaluaciones' as tabla,
  COUNT(*) as total,
  NULL as super_admins,
  NULL as evaluadores
FROM "Evaluacion" e
INNER JOIN "Alumno" a ON e."alumnoId" = a.id
WHERE a.correo LIKE '%@demo.nerlatalmud.local'
UNION ALL
SELECT 
  'EvaluacionDetalle' as tabla,
  COUNT(*) as total,
  NULL as super_admins,
  NULL as evaluadores
FROM "EvaluacionDetalle" ed
INNER JOIN "Evaluacion" e ON ed."evaluacionId" = e.id
INNER JOIN "Alumno" a ON e."alumnoId" = a.id
WHERE a.correo LIKE '%@demo.nerlatalmud.local'
UNION ALL
SELECT 
  'Reportes' as tabla,
  COUNT(*) as total,
  NULL as super_admins,
  NULL as evaluadores
FROM "Reporte" r
INNER JOIN "Evaluacion" e ON r."evaluacionId" = e.id
INNER JOIN "Alumno" a ON e."alumnoId" = a.id
WHERE a.correo LIKE '%@demo.nerlatalmud.local';
