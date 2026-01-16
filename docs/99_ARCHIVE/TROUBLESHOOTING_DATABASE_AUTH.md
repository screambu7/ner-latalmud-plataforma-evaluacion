# 🔧 Troubleshooting: Error de Autenticación de Base de Datos

## 🔴 Error: "Authentication failed against database server"

**Mensaje completo**:
```
Invalid `prisma.$queryRaw()` invocation:
Authentication failed against database server, 
the provided database credentials for `postgres` are not valid.
```

---

## 📋 Diagnóstico

### Síntomas

- ✅ `DATABASE_URL` está configurada en Vercel
- ✅ El formato de la URL parece correcto (`postgresql://postgres.xfpfveqo...`)
- ❌ La conexión falla con error de autenticación
- ❌ El endpoint `/api/health/db` retorna `503` con `authentication_failed`

### Causas Probables

1. **Password incorrecta** (más común)
   - Estás usando `[PASSWORD]` o `[YOUR-PASSWORD]` como texto literal
   - La password en Vercel no coincide con la password real de Supabase
   - La password cambió y no se actualizó en Vercel

2. **Caracteres especiales sin codificar**
   - La password contiene `@`, `#`, `%`, `&`, etc.
   - No están codificados en URL encoding

3. **Usuario incorrecto**
   - Estás usando `postgres` en lugar de `postgres.xfpfveqoqwjxpggjpqwb`
   - El formato del usuario no es correcto para Connection Pooler

---

## ✅ Solución Paso a Paso

### Paso 1: Obtener tu Password Real de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto (`xfpfveqoqwjxpggjpqwb`)
3. Ve a **Settings** → **Database**
4. Busca la sección **"Connection string"** o **"Database password"**
5. **Copia tu password real** (la que configuraste al crear el proyecto)

⚠️ **IMPORTANTE**: 
- NO uses `[PASSWORD]` como texto literal
- NO uses `[YOUR-PASSWORD]` como texto literal
- Usa tu password REAL

### Paso 2: Verificar Formato de Usuario

Para Connection Pooler de Supabase, el usuario debe ser:
```
postgres.xfpfveqoqwjxpggjpqwb
```

**NO** uses solo `postgres`.

### Paso 3: Codificar Caracteres Especiales (si aplica)

Si tu password contiene caracteres especiales, codifícalos:

| Carácter | Codificación |
|---------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| `:` | `%3A` |

**Ejemplo**:
- Password: `miP@ss#123`
- Codificada: `miP%40ss%23123`

### Paso 4: Construir la URL Correcta

**Formato para Session Mode (Puerto 6543 - Recomendado)**:
```
postgresql://postgres.xfpfveqoqwjxpggjpqwb:TU_PASSWORD_REAL@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
```

**Formato para Transaction Mode (Puerto 5432)**:
```
postgresql://postgres.xfpfveqoqwjxpggjpqwb:TU_PASSWORD_REAL@aws-0-us-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true&schema=public
```

**Reemplaza `TU_PASSWORD_REAL`** con:
- Tu password real (si no tiene caracteres especiales)
- Tu password codificada (si tiene caracteres especiales)

### Paso 5: Actualizar en Vercel

1. Ve a **Vercel Dashboard** → Tu Proyecto
2. Ve a **Settings** → **Environment Variables**
3. Busca `DATABASE_URL`
4. Haz clic en **Edit** (o **Add** si no existe)
5. **Pega la URL completa** con tu password real
6. Asegúrate de seleccionar los entornos correctos:
   - ✅ **Preview** (para staging)
   - ✅ **Production** (para production)
7. Haz clic en **Save**
8. Espera el **redeploy automático** (o haz redeploy manual)

### Paso 6: Verificar

1. Espera a que termine el redeploy
2. Visita `/api/health/db` en tu aplicación desplegada
3. Deberías ver:
   ```json
   {
     "status": "ok",
     "message": "Conexión a base de datos exitosa",
     "database": {
       "connected": true,
       "userCount": 0,
       ...
     }
   }
   ```

---

## 🔍 Verificación de la URL

### ✅ Ejemplo Correcto

```env
DATABASE_URL="postgresql://postgres.xfpfveqoqwjxpggjpqwb:miPassword123@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public"
```

**Características**:
- ✅ Usuario: `postgres.xfpfveqoqwjxpggjpqwb` (con project ref)
- ✅ Password: `miPassword123` (password real, no literal)
- ✅ Host: `aws-0-us-west-2.pooler.supabase.com` (pooler, no directo)
- ✅ Puerto: `6543` (Session Mode) o `5432` (Transaction Mode)
- ✅ Parámetro: `?pgbouncer=true` (requerido)
- ✅ Schema: `&schema=public` (opcional pero recomendado)

### ❌ Ejemplos Incorrectos

#### 1. Password Literal
```env
DATABASE_URL="postgresql://postgres.xfpfveqoqwjxpggjpqwb:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public"
```
**Problema**: `[PASSWORD]` es texto literal, no tu password real.

#### 2. Usuario Incorrecto
```env
DATABASE_URL="postgresql://postgres:miPassword123@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public"
```
**Problema**: Usuario es `postgres` en lugar de `postgres.xfpfveqoqwjxpggjpqwb`.

#### 3. Conexión Directa (no pooler)
```env
DATABASE_URL="postgresql://postgres.xfpfveqoqwjxpggjpqwb:miPassword123@db.xfpfveqoqwjxpggjpqwb.supabase.co:5432/postgres?schema=public"
```
**Problema**: Host es `db.xxxxx.supabase.co` (directo) en lugar de `pooler.supabase.com`.

#### 4. Sin pgbouncer
```env
DATABASE_URL="postgresql://postgres.xfpfveqoqwjxpggjpqwb:miPassword123@aws-0-us-west-2.pooler.supabase.com:6543/postgres?schema=public"
```
**Problema**: Falta `pgbouncer=true` (requerido para Connection Pooler).

---

## 🛠️ Herramientas de Verificación

### 1. Verificar desde Terminal (Local)

```bash
# Reemplaza con tu DATABASE_URL completa
psql "postgresql://postgres.xfpfveqoqwjxpggjpqwb:TU_PASSWORD@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public"

# Si conecta exitosamente, verás:
# postgres=>
```

### 2. Verificar desde Código (Local)

Crea un archivo temporal `test-db.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexión exitosa:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
```

Ejecuta:
```bash
DATABASE_URL="tu_url_completa" node test-db.js
```

### 3. Verificar desde Vercel

1. Ve a **Vercel Dashboard** → Tu Proyecto → **Deployments**
2. Selecciona el último deployment
3. Ve a **Runtime Logs**
4. Busca errores relacionados con `DATABASE_URL` o `Prisma`

---

## 📝 Checklist de Verificación

Antes de reportar el problema, verifica:

- [ ] **Password real**: No estás usando `[PASSWORD]` como texto literal
- [ ] **Usuario correcto**: Usas `postgres.xfpfveqoqwjxpggjpqwb` (con project ref)
- [ ] **Host correcto**: Usas `pooler.supabase.com` (no `supabase.co`)
- [ ] **Puerto correcto**: `6543` (Session Mode) o `5432` (Transaction Mode)
- [ ] **Parámetro pgbouncer**: Incluyes `?pgbouncer=true`
- [ ] **Caracteres especiales**: Si tu password los tiene, están codificados
- [ ] **Entornos en Vercel**: `DATABASE_URL` está configurada para Preview y Production
- [ ] **Redeploy**: Hiciste redeploy después de cambiar la variable

---

## 🚨 Si el Problema Persiste

1. **Verifica que la password en Supabase no haya cambiado**:
   - Supabase Dashboard → Settings → Database
   - Si cambió, actualiza en Vercel

2. **Prueba con Transaction Mode** (puerto 5432):
   - A veces Session Mode tiene problemas
   - Cambia el puerto de `6543` a `5432`

3. **Verifica logs de Supabase**:
   - Supabase Dashboard → Logs → Postgres Logs
   - Busca intentos de conexión fallidos

4. **Contacta soporte**:
   - Si todo lo anterior está correcto, puede ser un problema de red o configuración de Supabase

---

## 🔗 Referencias

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection URLs](https://www.prisma.io/docs/concepts/database-connectors/postgresql#connection-details)
- [URL Encoding Reference](https://www.w3schools.com/tags/ref_urlencode.asp)
- `docs/SUPABASE_SETUP.md` - Configuración general
- `docs/SUPABASE_PASSWORD_SETUP.md` - Guía específica de password

---

**Última actualización**: 2024-03-15
