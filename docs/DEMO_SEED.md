# 🌱 Demo Seed - Datos de Demostración

## 📋 Resumen

Este documento describe el script de seed para datos de **DEMOSTRACIÓN** de la plataforma Ner LaTalmud. Estos datos están diseñados para mostrar la plataforma internamente, **NO** son datos de prueba ni de producción.

---

## ⚠️ IMPORTANTE: Seguridad

### Flags Requeridos

El script **requiere AMBAS** variables de entorno para ejecutarse:

```bash
DEMO_SEED_ENABLED=true
DEMO_SEED_CONFIRM=YES_I_KNOW_WHAT_I_AM_DOING
```

**Sin estas variables, el script se detendrá inmediatamente.**

### ¿Por Qué Dos Flags?

- **Defensa en profundidad**: Requerir dos flags reduce el riesgo de ejecución accidental
- **Confirmación explícita**: El segundo flag requiere una confirmación consciente
- **Claridad**: Hace obvio que este es un script especial que requiere atención

---

## 🚀 Cómo Ejecutar

### 1. Configurar Variables de Entorno

Crea o edita tu archivo `.env.local`:

```bash
# Flags de seguridad (REQUERIDOS)
DEMO_SEED_ENABLED=true
DEMO_SEED_CONFIRM=YES_I_KNOW_WHAT_I_AM_DOING

# Email del admin demo (REQUERIDO)
DEMO_ADMIN_EMAIL=admin@demo.nerlatalmud.local

# Database URL (debe estar configurada)
DATABASE_URL=postgresql://...
```

### 2. Ejecutar el Script

```bash
npm run db:seed:demo
```

### 3. Verificar Resultado

El script mostrará un resumen al finalizar:

```
🎉 Demo seed completado exitosamente!

📊 Resumen:
  👤 Usuarios: 2 (1 SUPER_ADMIN, 1 EVALUADOR)
  🏫 Escuelas: 1
  👥 Alumnos: 7
  📊 Evaluaciones: 18
  📄 Reportes: 42
```

---

## 📊 Datos Creados

### 1. Usuarios

- **1 SUPER_ADMIN**
  - Email: Desde `DEMO_ADMIN_EMAIL` (env)
  - Nombre: "Admin Demo"
  - Rol: `SUPER_ADMIN`
  - Estado: `ACTIVO`
  - Password: Hash aleatorio (no se usará, sistema usa magic links)

- **1 EVALUADOR**
  - Email: `demo.evaluador@demo.nerlatalmud.local`
  - Nombre: "Evaluador Demo"
  - Rol: `EVALUADOR`
  - Estado: `ACTIVO`
  - Asociado a la escuela demo
  - Password: Hash aleatorio

### 2. Escuela

- **1 Escuela Demo**
  - Nombre: "Yeshiva Demo Ner LaTalmud"
  - Dirección: "123 Calle Demo, Ciudad Demo"
  - Teléfono: "+1-555-0100"
  - Email: `demo.escuela@demo.nerlatalmud.local`
  - Estado: `ACTIVO`

### 3. Alumnos (5-10 aleatorios)

Cada alumno tiene:
- Nombre: De una lista predefinida de nombres realistas
- Email: `demo.alumno{N}@demo.nerlatalmud.local`
- Tipo: `ESCUELA` o `INDEPENDIENTE` (aleatorio)
- Status: `ACTIVO`, `EN_PAUSA`, `NO_ACTIVO`, o `NIVEL_LOGRADO` (aleatorio, con más probabilidad de `ACTIVO`)
- Escuela: Asociado si tipo es `ESCUELA`

### 4. Evaluaciones (2-3 por alumno)

Cada evaluación tiene:
- Alumno: Asociado a uno de los alumnos creados
- Evaluador: El evaluador demo
- Tipo: Aleatorio de los tipos de diagnóstico disponibles
- Fecha: Aleatoria en los últimos 6 meses
- Detalles: 3-6 `EvaluacionDetalle` con:
  - Subhabilidad: Aleatoria de una lista predefinida
  - Nivel: 1-4 (aleatorio)

### 5. Reportes (2-3 por evaluación)

Cada reporte tiene:
- Tipo: `EVALUACION_INDIVIDUAL`, `PROGRESO_ALUMNO`, o `ESTADISTICAS_ESCUELA`
- Evaluación: Asociada a una evaluación
- Alumno: Asociado al alumno de la evaluación
- Generado por: El evaluador demo
- Contenido: JSON con datos demo estructurados
- Fechas: `fechaInicio` y `fechaFin` aleatorias

---

## 🔄 Idempotencia

El script es **idempotente**: puedes ejecutarlo múltiples veces sin duplicar datos.

### Estrategia de Idempotencia

- **Usuarios**: Usan `upsert` por email (único)
- **Escuela**: Usa `upsert` por ID fijo (1)
- **Alumnos**: Usan `upsert` por ID fijo (1, 2, 3, ...)
- **Evaluaciones**: Se crean siempre (no hay upsert, pero no hay duplicación por diseño)
- **Detalles y Reportes**: Se crean siempre (relacionados a evaluaciones)

**Nota**: Si ejecutas el script múltiples veces, las evaluaciones y reportes se duplicarán. Esto es intencional para demostración, pero si necesitas limpiar, ver sección "Cómo Eliminar Datos Demo".

---

## 🗑️ Cómo Eliminar Datos Demo

### Opción 1: Eliminación Manual (Recomendada)

Ejecuta estas queries en Prisma Studio o directamente en la base de datos:

```sql
-- Eliminar reportes demo
DELETE FROM "Reporte" WHERE "generadoPorId" IN (
  SELECT id FROM "Usuario" WHERE correo LIKE 'demo.%@demo.nerlatalmud.local'
);

-- Eliminar detalles de evaluaciones demo
DELETE FROM "EvaluacionDetalle" WHERE "evaluacionId" IN (
  SELECT id FROM "Evaluacion" WHERE "evaluadorId" IN (
    SELECT id FROM "Usuario" WHERE correo LIKE 'demo.%@demo.nerlatalmud.local'
  )
);

-- Eliminar evaluaciones demo
DELETE FROM "Evaluacion" WHERE "evaluadorId" IN (
  SELECT id FROM "Usuario" WHERE correo LIKE 'demo.%@demo.nerlatalmud.local'
);

-- Eliminar alumnos demo
DELETE FROM "Alumno" WHERE correo LIKE 'demo.alumno%@demo.nerlatalmud.local';

-- Eliminar escuela demo (si no tiene otros datos)
DELETE FROM "Escuela" WHERE id = 1 AND nombre = 'Yeshiva Demo Ner LaTalmud';

-- Eliminar usuarios demo (excepto admin si es necesario)
DELETE FROM "Usuario" WHERE correo LIKE 'demo.%@demo.nerlatalmud.local';
```

### Opción 2: Script de Limpieza (Futuro)

Se puede crear un script `prisma/clean-demo.ts` que automatice la limpieza. Por ahora, usa la opción manual.

---

## 🔒 Seguridad

### ¿Por Qué Es Seguro?

1. **No hay credenciales conocidas**
   - Todos los passwords son hashes aleatorios
   - No se pueden usar para login
   - El sistema usa magic links, no passwords

2. **Emails demo claramente identificados**
   - Todos los emails demo terminan en `@demo.nerlatalmud.local`
   - Fácil de identificar y filtrar
   - No pueden confundirse con datos reales

3. **Flags de seguridad explícitos**
   - Requiere confirmación consciente
   - No se puede ejecutar accidentalmente

4. **No envía emails**
   - El script no tiene lógica de envío de emails
   - No se generan magic links reales

5. **No loguea datos sensibles**
   - Solo muestra emails demo (identificables)
   - No muestra passwords ni tokens

### ⚠️ Precauciones

- **NO ejecutar en producción**: Aunque tiene flags de seguridad, nunca ejecutar en producción
- **NO usar como datos de prueba**: Estos son datos de demostración, no para testing
- **Limpiar después de demostración**: Eliminar datos demo después de usar

---

## 🎯 Propósito

Este script está diseñado para:

✅ **Mostrar la plataforma internamente**
- Dashboards poblados
- Listas llenas de datos
- Flujos navegables
- Reportes visibles

❌ **NO está diseñado para:**
- Testing automatizado
- Datos de producción
- Desarrollo de features (usar seed normal)
- Performance testing

---

## 📝 Notas Técnicas

### Subhabilidades Demo

El script usa una lista predefinida de subhabilidades demo:
- `lectura_basica`
- `comprension_textual`
- `analisis_logico`
- `vocabulario_arameo`
- `traduccion_precisa`
- `identificacion_conceptos`
- `aplicacion_reglas`
- `sintesis_informacion`
- `interpretacion_contextual`
- `razonamiento_deductivo`

**Nota**: Estas son subhabilidades demo. Las subhabilidades reales deben venir de la especificación maestra (ver `docs/TODOS_RUBRICAS.md`).

### Niveles

Los niveles en `EvaluacionDetalle` son siempre 1-4:
- 1 = Nivel Logrado (NL)
- 2 = Parcialmente Alcanzado (PA)
- 3 = Parcialmente Básico (PB)
- 4 = Requiere Intervención (RI)

### Aleatoriedad

El script usa aleatoriedad controlada:
- Número de alumnos: 5-10 (aleatorio)
- Evaluaciones por alumno: 2-3 (aleatorio)
- Detalles por evaluación: 3-6 (aleatorio)
- Reportes por evaluación: 2-3 (aleatorio)
- Fechas: Últimos 6 meses (aleatorio)

Esto hace que cada ejecución cree datos ligeramente diferentes, útil para demostración.

---

## 🐛 Troubleshooting

### Error: "Flags de seguridad no configurados"

**Solución**: Asegúrate de tener ambas variables en `.env.local`:
```bash
DEMO_SEED_ENABLED=true
DEMO_SEED_CONFIRM=YES_I_KNOW_WHAT_I_AM_DOING
```

### Error: "DEMO_ADMIN_EMAIL no está configurado"

**Solución**: Agrega `DEMO_ADMIN_EMAIL` a `.env.local`:
```bash
DEMO_ADMIN_EMAIL=admin@demo.nerlatalmud.local
```

### Error: "Unique constraint violation"

**Causa**: Probablemente ya existen datos con los mismos IDs o emails.

**Solución**: 
- El script usa `upsert`, así que debería funcionar
- Si persiste, verifica que no haya conflictos manuales
- Considera limpiar datos demo antes de ejecutar de nuevo

### Los datos no se ven en la UI

**Verificar**:
1. ¿La base de datos está conectada correctamente?
2. ¿Los datos se crearon? (verificar con Prisma Studio: `npm run db:studio`)
3. ¿La aplicación está usando la misma base de datos?

---

## 📚 Referencias

- [Prisma Seed Documentation](https://www.prisma.io/docs/guides/database/seed-database)
- [Schema Prisma](./schema.prisma)
- [Seed Normal](./prisma/seed.ts) - Para datos de desarrollo/testing

---

## ✅ Checklist Pre-Demostración

Antes de una demostración:

- [ ] Ejecutar `npm run db:seed:demo`
- [ ] Verificar que los datos se crearon (Prisma Studio)
- [ ] Probar login con el admin demo (usar magic link)
- [ ] Navegar por dashboards y verificar que hay datos
- [ ] Verificar que los reportes se muestran correctamente
- [ ] Confirmar que los flujos de evaluación son navegables

Después de la demostración:

- [ ] Limpiar datos demo (ver sección "Cómo Eliminar Datos Demo")
- [ ] Documentar cualquier problema encontrado

---

**Última actualización**: 2025-01-XX
