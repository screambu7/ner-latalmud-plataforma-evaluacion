# 🗄️ Arquitectura de Base de Datos - Ner LaTalmud

**Schema Prisma - Modelo de Datos**

---

## 📋 Resumen

El sistema utiliza **PostgreSQL** como base de datos con **Prisma ORM** como capa de abstracción. El schema está definido en `prisma/schema.prisma` como única fuente de verdad.

---

## 🏗️ Modelos Principales

### Usuario
Representa usuarios del sistema (SUPER_ADMIN y EVALUADOR).

**Campos clave:**
- `correo` (String, unique) - Email del usuario
- `passwordHash` (String?, optional) - Hash de contraseña (opcional para compatibilidad)
- `rol` (Rol) - SUPER_ADMIN o EVALUADOR
- `estado` (EstadoCuenta) - ACTIVO o INACTIVO
- `escuelaId` (Int?, optional) - Relación opcional con Escuela

**Relaciones:**
- `escuela Escuela?` - Escuela asociada (opcional)
- `evaluacionesCreadas Evaluacion[]` - Evaluaciones creadas por este usuario
- `reportesGenerados Reporte[]` - Reportes generados por este usuario
- `archivosSubidos Archivo[]` - Archivos subidos por este usuario

### Escuela
Representa instituciones educativas.

**Campos clave:**
- `nombre` (String) - Nombre de la escuela
- `estado` (EstadoCuenta) - ACTIVO o INACTIVO

**Relaciones:**
- `usuarios Usuario[]` - Usuarios asociados a la escuela
- `alumnos Alumno[]` - Alumnos de la escuela

### Alumno
Representa estudiantes que son evaluados.

**Campos clave:**
- `tipo` (TipoAlumno) - ESCUELA o INDEPENDIENTE
- `status` (StatusAlumno) - ACTIVO, EN_PAUSA, NO_ACTIVO, NIVEL_LOGRADO
- `escuelaId` (Int?, optional) - Relación opcional con Escuela

**Relaciones:**
- `escuela Escuela?` - Escuela asociada (si tipo es ESCUELA)
- `evaluaciones Evaluacion[]` - Evaluaciones del alumno
- `reportes Reporte[]` - Reportes del alumno

### Evaluacion
Representa una sesión de evaluación de un alumno.

**Campos clave:**
- `alumnoId` (Int) - Alumno evaluado
- `evaluadorId` (Int) - Usuario que realiza la evaluación
- `tipo` (TipoDiagnostico) - Tipo de diagnóstico (16 tipos disponibles)
- `fecha` (DateTime) - Fecha de la evaluación

**Relaciones:**
- `alumno Alumno` - Alumno evaluado
- `evaluador Usuario` - Evaluador que creó la evaluación
- `detalles EvaluacionDetalle[]` - Detalles de la evaluación (subhabilidades)
- `reportes Reporte[]` - Reportes asociados

### EvaluacionDetalle
Representa una subhabilidad evaluada dentro de una evaluación.

**Campos clave:**
- `evaluacionId` (Int) - Evaluación padre
- `subhabilidad` (String) - Nombre de la subhabilidad
- `nivel` (Int) - Nivel alcanzado (1-4)

**Relaciones:**
- `evaluacion Evaluacion` - Evaluación padre

### Reporte
Representa un reporte generado del sistema.

**Campos clave:**
- `tipo` (TipoReporte) - Tipo de reporte
- `contenido` (Json?, optional) - Datos estructurados del reporte
- `fechaInicio` (DateTime?, optional) - Fecha de inicio del período
- `fechaFin` (DateTime?, optional) - Fecha de fin del período

**Relaciones:**
- `evaluacion Evaluacion?` - Evaluación asociada (opcional)
- `alumno Alumno?` - Alumno asociado (opcional)
- `generadoPor Usuario` - Usuario que generó el reporte
- `archivos Archivo[]` - Archivos asociados (PDFs, etc.)

### Archivo
Representa archivos almacenados en el sistema.

**Campos clave:**
- `nombre` (String) - Nombre del archivo en el sistema
- `nombreOriginal` (String) - Nombre original del archivo
- `tipo` (TipoArchivo) - Tipo de archivo
- `ruta` (String) - Ruta de almacenamiento

**Relaciones:**
- `reporte Reporte?` - Reporte asociado (opcional)
- `subidoPor Usuario` - Usuario que subió el archivo

### LoginToken
Representa tokens de magic link para autenticación (deprecado, pero mantenido para compatibilidad).

**Campos clave:**
- `email` (String) - Email del usuario
- `tokenHash` (String, unique) - Hash del token
- `expiresAt` (DateTime) - Fecha de expiración
- `usedAt` (DateTime?, optional) - Fecha de uso

---

## 📊 Enums

### Rol
- `SUPER_ADMIN` - Administrador principal
- `EVALUADOR` - Usuario evaluador

### EstadoCuenta
- `ACTIVO` - Cuenta activa
- `INACTIVO` - Cuenta inactiva

### TipoAlumno
- `ESCUELA` - Alumno asociado a una escuela
- `INDEPENDIENTE` - Alumno independiente

### StatusAlumno
- `ACTIVO` - Alumno activo
- `EN_PAUSA` - Alumno en pausa temporal
- `NO_ACTIVO` - Alumno inactivo
- `NIVEL_LOGRADO` - Alumno que completó el nivel

### TipoDiagnostico
16 tipos disponibles:
- `GV_EXP_DEF_FACIL`, `GV_EXP_FACIL`, `GV_HA_FACIL_NK`, `GV_HA_FACIL_SN`
- `GN_EXP_DEF_FACIL`, `GN_EXP_FACIL`, `GN_HA_FACIL_NK`, `GN_HA_FACIL_SN`
- `GV_EXP_DEF_DIFICIL`, `GV_EXP_DIFICIL`, `GV_HA_DIFICIL_NK`, `GV_HA_DIFICIL_SN`
- `GN_EXP_DEF_DIFICIL`, `GN_EXP_DIFICIL`, `GN_HA_DIFICIL_NK`, `GN_HA_DIFICIL_SN`

### TipoReporte
- `EVALUACION_INDIVIDUAL` - Reporte de evaluación individual
- `EVALUACION_GRUPAL` - Reporte de evaluación grupal
- `PROGRESO_ALUMNO` - Reporte de progreso del alumno
- `ESTADISTICAS_ESCUELA` - Estadísticas de la escuela
- `REPORTE_GENERAL` - Reporte general

### TipoArchivo
- `PDF_REPORTE` - PDF de reporte
- `PDF_EVALUACION` - PDF de evaluación
- `EXCEL_DATOS` - Archivo Excel con datos
- `IMAGEN` - Imagen
- `DOCUMENTO` - Documento
- `OTRO` - Otro tipo

---

## 🔗 Relaciones Principales

```
Usuario
  ├─→ Escuela (opcional)
  ├─→ Evaluacion[] (como evaluador)
  ├─→ Reporte[] (como generador)
  └─→ Archivo[] (como subidor)

Escuela
  ├─→ Usuario[]
  └─→ Alumno[]

Alumno
  ├─→ Escuela (opcional, si tipo es ESCUELA)
  ├─→ Evaluacion[]
  └─→ Reporte[]

Evaluacion
  ├─→ Alumno (required)
  ├─→ Usuario (evaluador, required)
  ├─→ EvaluacionDetalle[] (subhabilidades)
  └─→ Reporte[] (opcional)

EvaluacionDetalle
  └─→ Evaluacion (required)

Reporte
  ├─→ Evaluacion (opcional)
  ├─→ Alumno (opcional)
  ├─→ Usuario (generador, required)
  └─→ Archivo[] (opcional)

Archivo
  ├─→ Reporte (opcional)
  └─→ Usuario (subidor, required)
```

---

## 🔒 Índices y Performance

### Índices definidos:
- `Usuario.escuelaId` - Búsqueda por escuela
- `Alumno.escuelaId` - Búsqueda por escuela
- `Evaluacion.alumnoId` - Búsqueda de evaluaciones por alumno
- `Evaluacion.evaluadorId` - Búsqueda de evaluaciones por evaluador
- `EvaluacionDetalle.evaluacionId` - Búsqueda de detalles por evaluación
- `Reporte.evaluacionId` - Búsqueda de reportes por evaluación
- `Reporte.alumnoId` - Búsqueda de reportes por alumno
- `Reporte.generadoPorId` - Búsqueda de reportes por generador
- `Archivo.reporteId` - Búsqueda de archivos por reporte
- `Archivo.subidoPorId` - Búsqueda de archivos por subidor
- `LoginToken.email` - Búsqueda de tokens por email
- `LoginToken.expiresAt` - Búsqueda de tokens expirados

---

## 🚀 Migraciones

Las migraciones se gestionan con Prisma:

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy
```

**Ubicación**: `prisma/migrations/`

---

## 📝 Convenciones

### Nomenclatura:
- **Modelos**: PascalCase (`Usuario`, `Alumno`)
- **Campos**: camelCase (`alumnoId`, `creadoEn`)
- **Enums**: PascalCase (`Rol`, `EstadoCuenta`)

### Timestamps:
- `creadoEn` - Fecha de creación (default: now())
- `actualizadoEn` - Fecha de actualización (auto-update)

### Foreign Keys:
- Nombres descriptivos: `alumnoId`, `evaluadorId`, `escuelaId`
- Relaciones opcionales usan `?` en el tipo

---

## 🔍 Consultas Comunes

### Obtener evaluaciones de un alumno:
```typescript
const evaluaciones = await prisma.evaluacion.findMany({
  where: { alumnoId: id },
  include: {
    evaluador: true,
    detalles: true,
  },
});
```

### Obtener alumnos de una escuela:
```typescript
const alumnos = await prisma.alumno.findMany({
  where: { escuelaId: id },
  include: { escuela: true },
});
```

### Obtener reportes de un alumno:
```typescript
const reportes = await prisma.reporte.findMany({
  where: { alumnoId: id },
  include: {
    generadoPor: true,
    archivos: true,
  },
});
```

---

## ⚠️ Notas Importantes

1. **Password Hash**: El campo `passwordHash` es opcional para compatibilidad con usuarios existentes. Nuevos usuarios deben tener password hash.

2. **LoginToken**: Modelo mantenido para compatibilidad. El sistema actual usa Password Auth, no Magic Links.

3. **Cascade Deletes**: 
   - Eliminar `Alumno` elimina sus `Evaluacion[]` y `EvaluacionDetalle[]`
   - Eliminar `Evaluacion` elimina sus `EvaluacionDetalle[]`
   - Eliminar `Reporte` elimina sus `Archivo[]`

4. **Restrict Deletes**:
   - No se puede eliminar `Usuario` si tiene `Evaluacion[]` o `Reporte[]` asociados
   - No se puede eliminar `Usuario` si tiene `Archivo[]` asociados

---

**Última actualización**: 2025-01-XX  
**Versión del Schema**: 1.0
