-- ============================================
-- Script de Verificación de Datos Demo
-- ============================================
-- Ejecuta este script en Supabase SQL Editor para verificar qué datos demo existen

-- 1. Verificar usuarios
SELECT 
  id,
  nombre,
  correo,
  rol,
  estado,
  "escuelaId",
  "passwordHash" IS NOT NULL as tiene_password
FROM "Usuario"
ORDER BY rol, nombre;

-- 2. Verificar escuelas
SELECT 
  id,
  nombre,
  "creadoEn"
FROM "Escuela"
ORDER BY nombre;

-- 3. Verificar alumnos
SELECT 
  id,
  nombre,
  correo,
  tipo,
  status,
  "escuelaId",
  "creadoEn"
FROM "Alumno"
ORDER BY nombre;

-- 4. Verificar evaluaciones
SELECT 
  e.id,
  e."alumnoId",
  a.nombre as alumno_nombre,
  e."tipoDiagnostico",
  e."fechaEvaluacion",
  e."creadoEn"
FROM "Evaluacion" e
LEFT JOIN "Alumno" a ON e."alumnoId" = a.id
ORDER BY e."fechaEvaluacion" DESC
LIMIT 20;

-- 5. Verificar detalles de evaluaciones
SELECT 
  ed.id,
  ed."evaluacionId",
  ed."subhabilidad",
  ed.puntuacion,
  ed."creadoEn"
FROM "EvaluacionDetalle" ed
ORDER BY ed."creadoEn" DESC
LIMIT 20;

-- 6. Verificar reportes
SELECT 
  r.id,
  r."evaluacionId",
  r.tipo,
  r."fechaGeneracion",
  r."creadoEn"
FROM "Reporte" r
ORDER BY r."fechaGeneracion" DESC
LIMIT 20;

-- 7. Resumen de datos
SELECT 
  'Usuarios' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN rol = 'SUPER_ADMIN' THEN 1 END) as super_admins,
  COUNT(CASE WHEN rol = 'EVALUADOR' THEN 1 END) as evaluadores
FROM "Usuario"
UNION ALL
SELECT 
  'Escuelas' as tabla,
  COUNT(*) as total,
  NULL as super_admins,
  NULL as evaluadores
FROM "Escuela"
UNION ALL
SELECT 
  'Alumnos' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN tipo = 'ESCUELA' THEN 1 END) as super_admins,
  COUNT(CASE WHEN tipo = 'INDEPENDIENTE' THEN 1 END) as evaluadores
FROM "Alumno"
UNION ALL
SELECT 
  'Evaluaciones' as tabla,
  COUNT(*) as total,
  NULL as super_admins,
  NULL as evaluadores
FROM "Evaluacion"
UNION ALL
SELECT 
  'EvaluacionDetalle' as tabla,
  COUNT(*) as total,
  NULL as super_admins,
  NULL as evaluadores
FROM "EvaluacionDetalle"
UNION ALL
SELECT 
  'Reportes' as tabla,
  COUNT(*) as total,
  NULL as super_admins,
  NULL as evaluadores
FROM "Reporte";
