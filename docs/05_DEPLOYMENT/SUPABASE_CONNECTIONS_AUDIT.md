# 🔍 Auditoría de Conexiones Supabase

**Fecha**: 2024-03-15  
**Estado**: ✅ Revisado y Mejorado

---

## 📋 Resumen Ejecutivo

La aplicación tiene **2 tipos de conexiones a Supabase**:

1. **Conexión a Base de Datos PostgreSQL** (vía Prisma) - `DATABASE_URL`
2. **Cliente Supabase SSR** (vía @supabase/ssr) - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

---

## 🔌 Conexión 1: Base de Datos PostgreSQL (Prisma)

### Configuración

**Variable de Entorno**: `DATABASE_URL`

**Ubicación**: `src/lib/db.ts`

**Estado**: ✅ **Correctamente configurado**

### Detalles

- **ORM**: Prisma Client
- **Tipo de Conexión**: Connection Pooler (requerido para Vercel)
- **Host**: `aws-0-us-west-2.pooler.supabase.com` (Session Mode, puerto 6543)
- **Validación**: ✅ Validación en `shouldUseMock()` - falla si no hay `DATABASE_URL` en staging/production
- **Singleton Pattern**: ✅ Implementado para evitar múltiples conexiones en serverless

### Archivos Relacionados

- `src/lib/db.ts` - Cliente Prisma singleton
- `prisma/schema.prisma` - Schema de base de datos
- `docs/SUPABASE_SETUP.md` - Documentación de configuración

### Validaciones Implementadas

```typescript
// src/lib/db.ts
function shouldUseMock(): boolean {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // En runtime, validar estrictamente
  if (!hasDatabaseUrl && !isDevelopment) {
    throw new Error('DATABASE_URL no está configurada...');
  }
  
  return !hasDatabaseUrl && isDevelopment;
}
```

✅ **Estado**: Validación correcta, falla rápido en staging/production

---

## 🔌 Conexión 2: Cliente Supabase SSR

### Configuración

**Variables de Entorno**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

**Ubicación**: `src/utils/supabase/`

**Estado**: ⚠️ **Mejoras necesarias** (validación faltante)

### Archivos

1. **`src/utils/supabase/server.ts`** - Server Components
2. **`src/utils/supabase/client.ts`** - Client Components  
3. **`src/utils/supabase/middleware.ts`** - Middleware (no usado actualmente)

### Problemas Detectados

#### 🔴 CRÍTICO: Falta Validación de Variables

**Problema**: Uso de `!` (non-null assertion) sin validación previa:

```typescript
// ❌ ACTUAL (sin validación)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

return createServerClient(
  supabaseUrl!,  // ⚠️ Puede ser undefined
  supabaseKey!,  // ⚠️ Puede ser undefined
  // ...
);
```

**Riesgo**: 
- Si las variables no están configuradas, el cliente fallará en runtime con error críptico
- No hay fallback o mensaje de error claro

#### 🟡 MEDIO: No hay Validación en env-validation.ts

**Problema**: Las variables de Supabase no están validadas en `src/lib/env-validation.ts`

**Impacto**: 
- No falla rápido si faltan en staging/production
- Depende de que el usuario se dé cuenta cuando use el cliente

#### 🟢 BAJO: Middleware no usa Supabase

**Estado**: El middleware actual (`src/middleware.ts`) usa JWT, no Supabase. Esto es correcto para Edge Runtime.

---

## ✅ Mejoras Implementadas

### 1. Validación de Variables en Clientes Supabase

**Archivo**: `src/utils/supabase/server.ts`, `client.ts`, `middleware.ts`

**Cambio**: Agregar validación antes de usar variables:

```typescript
// ✅ MEJORADO
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ' +
    'deben estar configuradas. Ver docs/SUPABASE_CLIENT_SETUP.md'
  );
}
```

### 2. Validación en env-validation.ts

**Archivo**: `src/lib/env-validation.ts`

**Cambio**: Agregar funciones de validación para variables de Supabase:

```typescript
/**
 * Valida NEXT_PUBLIC_SUPABASE_URL
 * Opcional (solo si se usa cliente Supabase)
 */
export function validateSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/**
 * Valida NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
 * Opcional (solo si se usa cliente Supabase)
 */
export function validateSupabaseKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
}
```

**Nota**: Estas son opcionales porque el cliente Supabase es para funcionalidades adicionales, no crítico para el core.

---

## 📊 Matriz de Conexiones

| Conexión | Variable | Requerida | Validación | Estado |
|----------|----------|-----------|------------|--------|
| PostgreSQL (Prisma) | `DATABASE_URL` | ✅ Sí | ✅ Implementada | ✅ OK |
| Supabase SSR (Server) | `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ Opcional* | ⚠️ Pendiente | 🔄 Mejorando |
| Supabase SSR (Server) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ⚠️ Opcional* | ⚠️ Pendiente | 🔄 Mejorando |
| Supabase SSR (Client) | `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ Opcional* | ⚠️ Pendiente | 🔄 Mejorando |
| Supabase SSR (Client) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ⚠️ Opcional* | ⚠️ Pendiente | 🔄 Mejorando |

\* **Opcional**: Solo requeridas si se usa el cliente Supabase para funcionalidades adicionales (storage, realtime, etc.)

---

## 🔒 Seguridad

### Variables Públicas (`NEXT_PUBLIC_*`)

✅ **Correcto**: Las variables `NEXT_PUBLIC_*` son públicas por diseño (expuestas al cliente).

⚠️ **Nota**: Solo contienen:
- URL del proyecto (no sensible)
- Publishable key (no es secreto, diseñado para ser público)

❌ **No incluyen**:
- Service role key (secreto)
- Database password
- JWT secrets

### Variables Privadas

✅ **Correcto**: `DATABASE_URL` es privada (no `NEXT_PUBLIC_*`)

---

## 🚀 Checklist de Configuración

### En Vercel Environment Variables

- [x] `DATABASE_URL` - ✅ Configurada (Connection Pooler)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - ⚠️ Pendiente verificar
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - ⚠️ Pendiente verificar

### En `.env.local` (Local)

- [x] `DATABASE_URL` - ✅ Configurada
- [x] `NEXT_PUBLIC_SUPABASE_URL` - ✅ Agregada
- [x] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - ✅ Agregada

---

## 📝 Recomendaciones

### Inmediatas (Alta Prioridad)

1. ✅ **Agregar validación en clientes Supabase** - Prevenir errores crípticos
2. ✅ **Documentar uso del cliente Supabase** - Clarificar cuándo es necesario

### Futuras (Media Prioridad)

1. **Health check endpoint para Supabase** - Similar a `/api/health/db`
2. **Manejo de errores específicos** - Detectar problemas de conexión a Supabase
3. **Logging estructurado** - Registrar intentos de conexión a Supabase

### Opcionales (Baja Prioridad)

1. **Feature flag para Supabase** - Permitir deshabilitar sin código
2. **Retry logic** - Reintentar conexiones fallidas
3. **Connection pooling metrics** - Monitorear uso de conexiones

---

## 🔗 Referencias

- `docs/SUPABASE_SETUP.md` - Configuración de base de datos
- `docs/SUPABASE_CLIENT_SETUP.md` - Configuración de cliente SSR
- `docs/SUPABASE_PASSWORD_SETUP.md` - Configuración de password
- `src/lib/db.ts` - Cliente Prisma
- `src/utils/supabase/` - Clientes Supabase SSR

---

**Última actualización**: 2024-03-15
