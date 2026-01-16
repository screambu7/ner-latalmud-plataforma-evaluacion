# 📋 Documentación de Cambios - Schema Prisma v1.0

**Fecha:** 2025-01-XX  
**Versión:** 1.0  
**Objetivo:** Alinear schema.prisma con especificación técnica v1.0

---

## 🎯 Resumen Ejecutivo

El schema ha sido actualizado para cumplir con la especificación técnica v1.0, agregando modelos faltantes, mejorando relaciones y asegurando escalabilidad futura.

**Estado:** ✅ Completado  
**Migraciones requeridas:** Sí (nuevas tablas y campos)

---

## 📊 Cambios Realizados

### ✅ 1. Modelo `Escuela` (NUEVO)

**Justificación:** La especificación requiere gestión de escuelas. El código existente ya usa `escuelaId` pero no tenía modelo.

**Campos agregados:**
- `id` (Int, PK)
- `nombre` (String, requerido)
- `direccion` (String, opcional)
- `telefono` (String, opcional)
- `correo` (String, opcional)
- `estado` (EstadoCuenta, default: ACTIVO)
- `creadoEn` (DateTime)
- `actualizadoEn` (DateTime, auto-update)

**Relaciones:**
- `usuarios Usuario[]` - Usuarios asociados a la escuela
- `alumnos Alumno[]` - Alumnos de la escuela

**Impacto en código existente:**
- ✅ Compatible: `escuelaId` ya existía en `Usuario` y `Alumno`
- ⚠️ Requiere migración para crear tabla `Escuela`
- ⚠️ Código existente puede usar `usuario.escuela` y `alumno.escuela` después de migración

---

### ✅ 2. Modelo `Reporte` (NUEVO)

**Justificación:** Especificación técnica v1.0 requiere sistema de reportes.

**Campos agregados:**
- `id` (Int, PK)
- `tipo` (TipoReporte, enum nuevo)
- `evaluacionId` (Int, opcional, FK a Evaluacion)
- `alumnoId` (Int, opcional, FK a Alumno)
- `generadoPorId` (Int, requerido, FK a Usuario)
- `contenido` (Json, opcional) - Datos estructurados del reporte
- `fechaInicio` (DateTime, opcional)
- `fechaFin` (DateTime, opcional)
- `creadoEn` (DateTime)
- `actualizadoEn` (DateTime, auto-update)

**Relaciones:**
- `evaluacion Evaluacion?` - Reporte puede estar asociado a una evaluación
- `alumno Alumno?` - Reporte puede estar asociado a un alumno
- `generadoPor Usuario` - Usuario que generó el reporte (required)
- `archivos Archivo[]` - Archivos asociados al reporte

**Estrategia de onDelete:**
- `evaluacion`: `SetNull` - Si se elimina evaluación, reporte queda sin evaluación
- `alumno`: `SetNull` - Si se elimina alumno, reporte queda sin alumno
- `generadoPor`: `Restrict` - No se puede eliminar usuario que generó reportes

**Impacto:**
- ✅ Nuevo modelo, no rompe código existente
- ⚠️ Requiere migración

---

### ✅ 3. Modelo `Archivo` (NUEVO)

**Justificación:** Especificación técnica v1.0 requiere gestión de archivos (PDFs, documentos, etc.).

**Campos agregados:**
- `id` (Int, PK)
- `nombre` (String) - Nombre interno del archivo
- `nombreOriginal` (String) - Nombre original del archivo subido
- `tipo` (TipoArchivo, enum nuevo)
- `mimeType` (String) - Tipo MIME del archivo
- `tamaño` (Int) - Tamaño en bytes
- `ruta` (String) - Ruta de almacenamiento
- `reporteId` (Int, opcional, FK a Reporte)
- `subidoPorId` (Int, requerido, FK a Usuario)
- `creadoEn` (DateTime)
- `actualizadoEn` (DateTime, auto-update)

**Relaciones:**
- `reporte Reporte?` - Archivo puede estar asociado a un reporte
- `subidoPor Usuario` - Usuario que subió el archivo (required)

**Estrategia de onDelete:**
- `reporte`: `Cascade` - Si se elimina reporte, se eliminan sus archivos
- `subidoPor`: `Restrict` - No se puede eliminar usuario que subió archivos

**Impacto:**
- ✅ Nuevo modelo, no rompe código existente
- ⚠️ Requiere migración

---

### ✅ 4. Mejoras en Modelo `Usuario`

**Cambios:**
1. ✅ Agregada relación explícita `escuela Escuela?` con foreign key
2. ✅ Agregado campo `actualizadoEn` (DateTime, auto-update)
3. ✅ Agregadas relaciones:
   - `evaluacionesCreadas Evaluacion[]` - Evaluaciones creadas por el usuario
   - `reportesGenerados Reporte[]` - Reportes generados por el usuario
   - `archivosSubidos Archivo[]` - Archivos subidos por el usuario

**Estrategia de onDelete:**
- `escuela`: `SetNull` - Si se elimina escuela, usuarios quedan sin escuela

**Impacto:**
- ✅ Compatible: `escuelaId` ya existía
- ⚠️ Requiere migración para agregar foreign key y campo `actualizadoEn`

---

### ✅ 5. Mejoras en Modelo `Alumno`

**Cambios:**
1. ✅ Agregada relación explícita `escuela Escuela?` con foreign key
2. ✅ Agregado campo `actualizadoEn` (DateTime, auto-update)
3. ✅ Agregadas relaciones:
   - `evaluaciones Evaluacion[]` - Evaluaciones del alumno
   - `reportes Reporte[]` - Reportes del alumno

**Estrategia de onDelete:**
- `escuela`: `SetNull` - Si se elimina escuela, alumnos quedan sin escuela

**Impacto:**
- ✅ Compatible: `escuelaId` ya existía
- ⚠️ Requiere migración para agregar foreign key y campo `actualizadoEn`

---

### ✅ 6. Mejoras en Modelo `Evaluacion`

**Cambios:**
1. ✅ Agregadas relaciones explícitas:
   - `alumno Alumno` - Relación con alumno (required)
   - `evaluador Usuario` - Relación con usuario evaluador (required)
2. ✅ Agregado campo `creadoEn` (DateTime)
3. ✅ Agregado campo `actualizadoEn` (DateTime, auto-update)
4. ✅ Campo `fecha` ahora tiene default `now()`
5. ✅ Agregada relación `reportes Reporte[]`

**Estrategia de onDelete:**
- `alumno`: `Cascade` - Si se elimina alumno, se eliminan sus evaluaciones
- `evaluador`: `Restrict` - No se puede eliminar usuario que tiene evaluaciones

**Impacto:**
- ✅ Compatible: `alumnoId` y `evaluadorId` ya existían
- ⚠️ Requiere migración para agregar foreign keys y campos de auditoría

---

### ✅ 7. Mejoras en Modelo `EvaluacionDetalle`

**Cambios:**
1. ✅ Agregado campo `creadoEn` (DateTime)
2. ✅ Relación con `Evaluacion` ya estaba correcta

**Impacto:**
- ✅ Compatible: No rompe código existente
- ⚠️ Requiere migración para agregar campo `creadoEn`

---

### ✅ 8. Nuevos Enums

#### `TipoReporte`
```prisma
enum TipoReporte {
  EVALUACION_INDIVIDUAL
  EVALUACION_GRUPAL
  PROGRESO_ALUMNO
  ESTADISTICAS_ESCUELA
  REPORTE_GENERAL
}
```

#### `TipoArchivo`
```prisma
enum TipoArchivo {
  PDF_REPORTE
  PDF_EVALUACION
  EXCEL_DATOS
  IMAGEN
  DOCUMENTO
  OTRO
}
```

**Impacto:**
- ✅ Nuevos enums, no rompen código existente
- ⚠️ Requieren migración

---

## 🔗 Resumen de Relaciones

### Relaciones Agregadas/Mejoradas:

1. **Usuario ↔ Escuela**
   - `Usuario.escuela` (opcional)
   - `Escuela.usuarios[]`

2. **Alumno ↔ Escuela**
   - `Alumno.escuela` (opcional)
   - `Escuela.alumnos[]`

3. **Usuario ↔ Evaluacion**
   - `Usuario.evaluacionesCreadas[]`
   - `Evaluacion.evaluador` (required)

4. **Alumno ↔ Evaluacion**
   - `Alumno.evaluaciones[]`
   - `Evaluacion.alumno` (required)

5. **Usuario ↔ Reporte**
   - `Usuario.reportesGenerados[]`
   - `Reporte.generadoPor` (required)

6. **Alumno ↔ Reporte**
   - `Alumno.reportes[]`
   - `Reporte.alumno` (opcional)

7. **Evaluacion ↔ Reporte**
   - `Evaluacion.reportes[]`
   - `Reporte.evaluacion` (opcional)

8. **Usuario ↔ Archivo**
   - `Usuario.archivosSubidos[]`
   - `Archivo.subidoPor` (required)

9. **Reporte ↔ Archivo**
   - `Reporte.archivos[]`
   - `Archivo.reporte` (opcional)

---

## 🛡️ Estrategias de Integridad Referencial (onDelete)

### `Cascade` (Eliminación en cascada)
- `EvaluacionDetalle` cuando se elimina `Evaluacion`
- `Evaluacion` cuando se elimina `Alumno`
- `Archivo` cuando se elimina `Reporte`

**Justificación:** Son datos dependientes que no tienen sentido sin su padre.

### `SetNull` (Establecer NULL)
- `Usuario.escuelaId` cuando se elimina `Escuela`
- `Alumno.escuelaId` cuando se elimina `Escuela`
- `Reporte.evaluacionId` cuando se elimina `Evaluacion`
- `Reporte.alumnoId` cuando se elimina `Alumno`
- `Archivo.reporteId` cuando se elimina `Reporte`

**Justificación:** Permite mantener registros históricos aunque se elimine la entidad relacionada.

### `Restrict` (Prevenir eliminación)
- `Evaluacion` cuando se intenta eliminar `Usuario` (evaluador)
- `Reporte` cuando se intenta eliminar `Usuario` (generador)
- `Archivo` cuando se intenta eliminar `Usuario` (subidor)

**Justificación:** Protege la integridad histórica. Si se necesita eliminar, primero se deben eliminar o reasignar los registros dependientes.

---

## 📝 Campos de Auditoría

Todos los modelos ahora incluyen:
- `creadoEn` (DateTime) - Fecha de creación
- `actualizadoEn` (DateTime, @updatedAt) - Fecha de última actualización (auto-update)

**Excepciones:**
- `EvaluacionDetalle` solo tiene `creadoEn` (no cambia después de crearse)

---

## ⚠️ Consideraciones de Migración

### Migraciones Requeridas:

1. **Crear tabla `Escuela`**
   ```sql
   CREATE TABLE "Escuela" (...)
   ```

2. **Agregar foreign keys a `Usuario` y `Alumno`**
   ```sql
   ALTER TABLE "Usuario" ADD CONSTRAINT ... FOREIGN KEY ...
   ALTER TABLE "Alumno" ADD CONSTRAINT ... FOREIGN KEY ...
   ```

3. **Crear tabla `Reporte`**
   ```sql
   CREATE TABLE "Reporte" (...)
   ```

4. **Crear tabla `Archivo`**
   ```sql
   CREATE TABLE "Archivo" (...)
   ```

5. **Agregar campos de auditoría**
   ```sql
   ALTER TABLE "Usuario" ADD COLUMN "actualizadoEn" ...
   ALTER TABLE "Alumno" ADD COLUMN "actualizadoEn" ...
   ALTER TABLE "Evaluacion" ADD COLUMN "creadoEn" ...
   ALTER TABLE "Evaluacion" ADD COLUMN "actualizadoEn" ...
   ALTER TABLE "EvaluacionDetalle" ADD COLUMN "creadoEn" ...
   ```

6. **Agregar foreign keys a `Evaluacion`**
   ```sql
   ALTER TABLE "Evaluacion" ADD CONSTRAINT ... FOREIGN KEY ...
   ```

### Comandos Prisma:

```bash
# Generar migración
npx prisma migrate dev --name add_especificacion_v1_models

# O si prefieres crear la migración manualmente
npx prisma migrate dev --create-only --name add_especificacion_v1_models
# Luego revisar y ajustar el SQL generado
```

---

## ✅ Validación de Especificación v1.0

### Requisitos de Especificación:

- ✅ **users** → `Usuario` (mejorado con relaciones)
- ✅ **schools** → `Escuela` (NUEVO)
- ✅ **students** → `Alumno` (mejorado con relaciones)
- ✅ **evaluations** → `Evaluacion` (mejorado con relaciones)
- ✅ **evaluation_details** → `EvaluacionDetalle` (mejorado)
- ✅ **reports** → `Reporte` (NUEVO)
- ✅ **files** → `Archivo` (NUEVO)
- ✅ **access control** → `Rol` enum + relaciones de permisos

**Estado:** ✅ Todos los requisitos cumplidos

---

## 🔍 Compatibilidad con Código Existente

### ✅ Compatible (sin cambios requeridos):
- Uso de `usuario.escuelaId` y `alumno.escuelaId` (sigue funcionando)
- Uso de `evaluacion.alumnoId` y `evaluacion.evaluadorId` (sigue funcionando)
- Todos los enums existentes (`Rol`, `EstadoCuenta`, `TipoAlumno`, `StatusAlumno`, `TipoDiagnostico`)

### ⚠️ Mejoras Disponibles (opcionales):
- Usar `usuario.escuela` en lugar de solo `escuelaId`
- Usar `alumno.escuela` en lugar de solo `escuelaId`
- Usar `evaluacion.alumno` y `evaluacion.evaluador` para incluir datos relacionados
- Usar `alumno.evaluaciones` para obtener todas las evaluaciones de un alumno

### ❌ No Compatible (requiere actualización):
- Ninguno. Todos los cambios son aditivos o mejoran relaciones existentes.

---

## 🎯 Próximos Pasos Recomendados

1. **Ejecutar migración:**
   ```bash
   npx prisma migrate dev --name add_especificacion_v1_models
   ```

2. **Regenerar cliente Prisma:**
   ```bash
   npx prisma generate
   ```

3. **Actualizar seed.ts** (opcional):
   - Agregar datos de ejemplo para `Escuela`
   - Agregar datos de ejemplo para `Reporte` y `Archivo`

4. **Actualizar código de aplicación** (opcional):
   - Usar relaciones explícitas en lugar de solo IDs
   - Implementar funcionalidad de reportes
   - Implementar funcionalidad de archivos

---

## 📚 Referencias

- Especificación Técnica v1.0
- Prisma Schema Documentation: https://www.prisma.io/docs/concepts/components/prisma-schema
- PostgreSQL Foreign Key Constraints: https://www.postgresql.org/docs/current/ddl-constraints.html

---

**Documentado por:** Backend Architect  
**Revisado:** Pendiente  
**Aprobado:** Pendiente
