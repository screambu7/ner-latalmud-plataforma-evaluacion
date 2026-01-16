# ✅ Verificación de Datos Demo - Ner LaTalmud

**Guía para verificar que los datos demo se crearon correctamente**

---

## 📋 Resumen

Este documento describe cómo verificar que los datos demo se crearon correctamente después de ejecutar el seed.

---

## 🔍 Verificación Rápida

### 1. Verificar Usuarios Demo

```sql
-- Ver todos los usuarios demo
SELECT id, nombre, correo, rol, estado 
FROM "Usuario" 
WHERE correo LIKE '%demo.%@demo.nerlatalmud.local' 
   OR correo = 'admin@demo.nerlatalmud.local';

-- Verificar SUPER_ADMIN demo
SELECT correo, rol FROM "Usuario" 
WHERE correo = 'admin@demo.nerlatalmud.local' 
  AND rol = 'SUPER_ADMIN';

-- Verificar EVALUADOR demo
SELECT correo, rol FROM "Usuario" 
WHERE correo = 'demo.evaluador@demo.nerlatalmud.local' 
  AND rol = 'EVALUADOR';
```

**Resultado esperado:**
- 1 usuario SUPER_ADMIN con email configurado en `DEMO_ADMIN_EMAIL`
- 1 usuario EVALUADOR con email `demo.evaluador@demo.nerlatalmud.local`

---

### 2. Verificar Escuela Demo

```sql
-- Ver escuela demo
SELECT id, nombre, estado 
FROM "Escuela" 
WHERE nombre = 'Yeshiva Demo Ner LaTalmud';
```

**Resultado esperado:**
- 1 escuela con nombre "Yeshiva Demo Ner LaTalmud" y estado ACTIVO

---

### 3. Verificar Alumnos Demo

```sql
-- Contar alumnos demo
SELECT COUNT(*) as total_alumnos
FROM "Alumno" 
WHERE correo LIKE 'demo.alumno%@demo.nerlatalmud.local';

-- Ver alumnos demo con detalles
SELECT id, nombre, correo, tipo, status, "escuelaId"
FROM "Alumno" 
WHERE correo LIKE 'demo.alumno%@demo.nerlatalmud.local'
ORDER BY id;
```

**Resultado esperado:**
- 5-10 alumnos (aleatorio según seed)
- Emails: `demo.alumno1@demo.nerlatalmud.local`, `demo.alumno2@demo.nerlatalmud.local`, etc.

---

### 4. Verificar Evaluaciones Demo

```sql
-- Contar evaluaciones demo
SELECT COUNT(*) as total_evaluaciones
FROM "Evaluacion" e
JOIN "Usuario" u ON e."evaluadorId" = u.id
WHERE u.correo LIKE 'demo.%@demo.nerlatalmud.local';

-- Ver evaluaciones con detalles
SELECT e.id, e.tipo, e.fecha, a.nombre as alumno, u.nombre as evaluador
FROM "Evaluacion" e
JOIN "Alumno" a ON e."alumnoId" = a.id
JOIN "Usuario" u ON e."evaluadorId" = u.id
WHERE u.correo LIKE 'demo.%@demo.nerlatalmud.local'
ORDER BY e.fecha DESC
LIMIT 10;
```

**Resultado esperado:**
- 18+ evaluaciones (2-3 por alumno)
- Asociadas al evaluador demo

---

### 5. Verificar Detalles de Evaluaciones

```sql
-- Contar detalles de evaluaciones demo
SELECT COUNT(*) as total_detalles
FROM "EvaluacionDetalle" ed
JOIN "Evaluacion" e ON ed."evaluacionId" = e.id
JOIN "Usuario" u ON e."evaluadorId" = u.id
WHERE u.correo LIKE 'demo.%@demo.nerlatalmud.local';

-- Ver detalles con información
SELECT ed.id, ed.subhabilidad, ed.nivel, e.id as evaluacion_id
FROM "EvaluacionDetalle" ed
JOIN "Evaluacion" e ON ed."evaluacionId" = e.id
JOIN "Usuario" u ON e."evaluadorId" = u.id
WHERE u.correo LIKE 'demo.%@demo.nerlatalmud.local'
ORDER BY e.id, ed.id
LIMIT 20;
```

**Resultado esperado:**
- 54+ detalles (3-6 por evaluación)
- Niveles entre 1-4

---

### 6. Verificar Reportes Demo

```sql
-- Contar reportes demo
SELECT COUNT(*) as total_reportes
FROM "Reporte" r
JOIN "Usuario" u ON r."generadoPorId" = u.id
WHERE u.correo LIKE 'demo.%@demo.nerlatalmud.local';

-- Ver reportes con detalles
SELECT r.id, r.tipo, r."creadoEn", a.nombre as alumno, u.nombre as generador
FROM "Reporte" r
LEFT JOIN "Alumno" a ON r."alumnoId" = a.id
JOIN "Usuario" u ON r."generadoPorId" = u.id
WHERE u.correo LIKE 'demo.%@demo.nerlatalmud.local'
ORDER BY r."creadoEn" DESC
LIMIT 10;
```

**Resultado esperado:**
- 42+ reportes (2-3 por evaluación)
- Tipos: `EVALUACION_INDIVIDUAL`, `PROGRESO_ALUMNO`, `ESTADISTICAS_ESCUELA`

---

## ✅ Checklist de Verificación

Antes de una demostración, verifica:

- [ ] Usuarios demo creados (SUPER_ADMIN y EVALUADOR)
- [ ] Escuela demo creada
- [ ] Alumnos demo creados (5-10)
- [ ] Evaluaciones demo creadas (18+)
- [ ] Detalles de evaluaciones creados (54+)
- [ ] Reportes demo creados (42+)

---

## 🐛 Troubleshooting

### Problema: No hay datos demo

**Solución:**
1. Verificar que se ejecutó el seed:
   ```bash
   DEMO_SEED_ENABLED=true DEMO_SEED_CONFIRM=YES_I_KNOW_WHAT_I_AM_DOING npm run db:seed:demo
   ```

2. Verificar variables de entorno:
   - `DEMO_SEED_ENABLED=true`
   - `DEMO_SEED_CONFIRM=YES_I_KNOW_WHAT_I_AM_DOING`
   - `DEMO_ADMIN_EMAIL=admin@demo.nerlatalmud.local`

3. Verificar conexión a BD:
   ```bash
   npx prisma studio
   ```

### Problema: Datos duplicados

**Solución:**
- El seed es idempotente para usuarios y escuela
- Las evaluaciones y reportes se crean siempre (pueden duplicarse)
- Si necesitas limpiar, ver `04_DEMO_AND_SEED/DEMO_SEED.md`

---

## 📚 Referencias

- **Guía de seed demo**: `04_DEMO_AND_SEED/DEMO_SEED.md`
- **Script SQL directo**: `04_DEMO_AND_SEED/SEED_DEMO_SQL.sql`

---

**Última actualización**: 2025-01-XX  
**Versión**: 1.0
