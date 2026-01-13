# 🔍 Auditoría Supabase vía MCP

**Fecha**: 2024-03-15  
**Proyecto**: `xfpfveqoqwjxpggjpqwb`  
**URL**: `https://xfpfveqoqwjxpggjpqwb.supabase.co`

---

## 📊 Estado General

### ✅ Conexión
- **Estado**: ✅ Conectado correctamente
- **MCP Server**: ✅ Funcionando
- **API URL**: `https://xfpfveqoqwjxpggjpqwb.supabase.co`

### 🔑 API Keys Disponibles

| Tipo | Key | Estado | Descripción |
|------|-----|--------|-------------|
| Legacy Anon | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Activo | Key legacy (JWT-based) |
| Publishable | `sb_publishable_Y5NYe2TXwZnf1OjbcWKqWQ_QJ69CKnU` | ✅ Activo | Key moderna (recomendada) |

**Nota**: La key publishable coincide con la configurada en `.env.local` ✅

---

## 📋 Tablas de Base de Datos

### Resumen

| Tabla | Columnas | Índices | Filas | RLS |
|-------|----------|---------|------|-----|
| `Usuario` | 9 | 236* | 0 | ❌ Deshabilitado |
| `Escuela` | 8 | 236* | 0 | ❌ Deshabilitado |
| `Alumno` | 8 | 236* | 0 | ❌ Deshabilitado |
| `Evaluacion` | 7 | 236* | 0 | ❌ Deshabilitado |
| `EvaluacionDetalle` | 5 | 236* | 0 | ❌ Deshabilitado |
| `Reporte` | 10 | 236* | 0 | ❌ Deshabilitado |
| `Archivo` | 11 | 236* | 0 | ❌ Deshabilitado |

\* **Nota**: El conteo de 236 índices parece incluir índices del sistema. Revisar índices específicos por tabla.

### Estructura de Tablas

#### `Usuario`
- **PK**: `id` (integer, autoincrement)
- **FK**: `escuelaId` → `Escuela.id`
- **Campos clave**: `correo` (text), `rol` (enum: SUPER_ADMIN, EVALUADOR), `estado` (enum: ACTIVO, INACTIVO)
- **Timestamps**: `creadoEn`, `actualizadoEn`

#### `Escuela`
- **PK**: `id` (integer, autoincrement)
- **Campos clave**: `nombre` (text), `estado` (enum: ACTIVO, INACTIVO)
- **Timestamps**: `creadoEn`, `actualizadoEn`

#### `Alumno`
- **PK**: `id` (integer, autoincrement)
- **FK**: `escuelaId` → `Escuela.id`
- **Campos clave**: `tipo` (enum: ESCUELA, INDEPENDIENTE), `status` (enum: ACTIVO, EN_PAUSA, NO_ACTIVO, NIVEL_LOGRADO)
- **Timestamps**: `creadoEn`, `actualizadoEn`

#### `Evaluacion`
- **PK**: `id` (integer, autoincrement)
- **FK**: `alumnoId` → `Alumno.id`, `evaluadorId` → `Usuario.id`
- **Campos clave**: `tipo` (enum: TipoDiagnostico - 16 valores)
- **Timestamps**: `fecha`, `creadoEn`, `actualizadoEn`

#### `EvaluacionDetalle`
- **PK**: `id` (integer, autoincrement)
- **FK**: `evaluacionId` → `Evaluacion.id`
- **Campos clave**: `subhabilidad` (text), `nivel` (integer)
- **Timestamps**: `creadoEn`

#### `Reporte`
- **PK**: `id` (integer, autoincrement)
- **FK**: `evaluacionId` → `Evaluacion.id`, `alumnoId` → `Alumno.id`, `generadoPorId` → `Usuario.id`
- **Campos clave**: `tipo` (enum: TipoReporte - 5 valores), `contenido` (jsonb)
- **Timestamps**: `fechaInicio`, `fechaFin`, `creadoEn`, `actualizadoEn`

#### `Archivo`
- **PK**: `id` (integer, autoincrement)
- **FK**: `reporteId` → `Reporte.id`, `subidoPorId` → `Usuario.id`
- **Campos clave**: `tipo` (enum: TipoArchivo - 6 valores), `ruta` (text)
- **Timestamps**: `creadoEn`, `actualizadoEn`

---

## 🔒 Problemas de Seguridad (CRÍTICO)

### ❌ Row Level Security (RLS) Deshabilitado

**Problema**: Todas las tablas tienen RLS deshabilitado.

**Impacto**: 
- Si se expone la API REST de Supabase directamente, cualquier usuario con la key pública puede leer/escribir todas las tablas
- **RIESGO CRÍTICO** si se usa el cliente Supabase SSR sin autenticación adicional

**Tablas afectadas**:
- `Usuario` ❌
- `Escuela` ❌
- `Alumno` ❌
- `Evaluacion` ❌
- `EvaluacionDetalle` ❌
- `Reporte` ❌
- `Archivo` ❌

**Recomendación**: 
1. **Si NO se usa API REST de Supabase directamente**: RLS no es crítico (solo Prisma)
2. **Si se usa API REST de Supabase**: Habilitar RLS y crear políticas

**Solución**:
```sql
-- Ejemplo para tabla Usuario
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden ver sus propios datos
CREATE POLICY "Users can view own data" ON "Usuario"
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Política: Solo super admins pueden ver todos
CREATE POLICY "Super admins can view all" ON "Usuario"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Usuario" u
      WHERE u.id::text = auth.uid()::text
      AND u.rol = 'SUPER_ADMIN'
    )
  );
```

**Nota**: Como actualmente usamos **Prisma** (no API REST directa), RLS no es crítico, pero es buena práctica habilitarlo.

---

## ⚡ Problemas de Performance (INFO)

### ⚠️ Foreign Keys sin Índices

**Problema**: Varias foreign keys no tienen índices dedicados, lo que puede impactar el rendimiento en JOINs y validaciones.

**Foreign Keys sin Índice**:

1. **`Alumno.escuelaId`** → `Escuela.id`
2. **`Archivo.reporteId`** → `Reporte.id`
3. **`Archivo.subidoPorId`** → `Usuario.id`
4. **`Evaluacion.alumnoId`** → `Alumno.id`
5. **`Evaluacion.evaluadorId`** → `Usuario.id`
6. **`EvaluacionDetalle.evaluacionId`** → `Evaluacion.id`
7. **`Reporte.alumnoId`** → `Alumno.id`
8. **`Reporte.evaluacionId`** → `Evaluacion.id`
9. **`Reporte.generadoPorId`** → `Usuario.id`
10. **`Usuario.escuelaId`** → `Escuela.id`

**Impacto**: 
- Queries con JOINs pueden ser más lentas
- Validaciones de foreign keys más lentas
- **Prioridad**: Media (optimización, no crítico)

**Solución**:
```sql
-- Ejemplo: Agregar índices a foreign keys
CREATE INDEX "idx_Alumno_escuelaId" ON "Alumno"("escuelaId");
CREATE INDEX "idx_Archivo_reporteId" ON "Archivo"("reporteId");
CREATE INDEX "idx_Archivo_subidoPorId" ON "Archivo"("subidoPorId");
CREATE INDEX "idx_Evaluacion_alumnoId" ON "Evaluacion"("alumnoId");
CREATE INDEX "idx_Evaluacion_evaluadorId" ON "Evaluacion"("evaluadorId");
CREATE INDEX "idx_EvaluacionDetalle_evaluacionId" ON "EvaluacionDetalle"("evaluacionId");
CREATE INDEX "idx_Reporte_alumnoId" ON "Reporte"("alumnoId");
CREATE INDEX "idx_Reporte_evaluacionId" ON "Reporte"("evaluacionId");
CREATE INDEX "idx_Reporte_generadoPorId" ON "Reporte"("generadoPorId");
CREATE INDEX "idx_Usuario_escuelaId" ON "Usuario"("escuelaId");
```

**Nota**: Prisma puede generar estos índices automáticamente si se configuran en el schema.

---

## 🔌 Extensiones Instaladas

### Extensiones Activas

| Extensión | Versión | Schema | Descripción |
|-----------|---------|--------|-------------|
| `pgcrypto` | 1.3 | `extensions` | Funciones criptográficas |
| `pg_stat_statements` | 1.11 | `extensions` | Estadísticas de queries SQL |
| `uuid-ossp` | 1.1 | `extensions` | Generación de UUIDs |
| `supabase_vault` | 0.3.1 | `vault` | Vault de Supabase |
| `pg_graphql` | 1.5.11 | `graphql` | Soporte GraphQL |
| `plpgsql` | 1.0 | `pg_catalog` | Lenguaje procedural |

**Estado**: ✅ Extensiones necesarias instaladas

---

## 📦 Migraciones

**Estado**: ⚠️ No hay migraciones registradas en Supabase

**Causa probable**: Las migraciones se aplican directamente vía Prisma (`prisma migrate deploy`), no se registran en el sistema de migraciones de Supabase.

**Nota**: Esto es normal si se usa Prisma como ORM principal.

---

## ✅ Checklist de Acciones

### Seguridad (Alta Prioridad)

- [ ] **Evaluar necesidad de RLS**:
  - [ ] Si se usa API REST de Supabase → Habilitar RLS y crear políticas
  - [ ] Si solo se usa Prisma → RLS opcional (pero recomendado)

### Performance (Media Prioridad)

- [ ] **Agregar índices a foreign keys**:
  - [ ] Crear migración Prisma con índices
  - [ ] Aplicar migración en staging
  - [ ] Verificar mejora en queries

### Monitoreo (Baja Prioridad)

- [ ] **Configurar alertas** en Supabase Dashboard
- [ ] **Revisar logs** periódicamente
- [ ] **Monitorear uso de conexiones** (Connection Pooler)

---

## 🔗 Referencias

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Prisma Indexes](https://www.prisma.io/docs/concepts/components/prisma-schema/indexes)

---

**Última actualización**: 2024-03-15
