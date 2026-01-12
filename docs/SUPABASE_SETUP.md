# 🔧 Configuración de Supabase para Vercel

## ⚠️ Problema Común

Si ves este error:
```
Can't reach database server at `db.xxxxx.supabase.co:5432`
```

**Causa**: Estás usando la conexión directa de Supabase, que no funciona bien con aplicaciones serverless (Vercel).

---

## ✅ Solución: Usar Connection Pooler

Supabase ofrece un **Connection Pooler** diseñado específicamente para aplicaciones serverless como Vercel.

### Paso 1: Obtener la URL del Connection Pooler

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **Database**
3. Busca la sección **Connection Pooling**
4. Copia la **Connection String** que dice **"Session mode"** o **"Transaction mode"**

**Formato esperado:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**O alternativamente:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true
```

### Paso 2: Configurar en Vercel

1. Ve a **Vercel Dashboard** → Tu Proyecto → **Settings** → **Environment Variables**
2. Edita la variable `DATABASE_URL`
3. Reemplaza el valor con la URL del Connection Pooler
4. Asegúrate de que esté configurada para **Preview** (staging) y **Production**

**Ejemplo de URL correcta:**
```env
DATABASE_URL="postgresql://postgres.xfpfveqoqwjxpggjpqwb:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public"
```

### Paso 3: Verificar la Configuración

**Importante**: La URL debe incluir:
- ✅ Host con `.pooler.supabase.com` (no `.supabase.co`)
- ✅ Puerto `6543` (Session mode) o `5432` con `pgbouncer=true`
- ✅ Parámetro `pgbouncer=true`
- ✅ Parámetro `schema=public` (si usas schema específico)

---

## 🔍 Diferencias entre Conexiones

### ❌ Conexión Directa (NO funciona con Vercel)
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```
- Host: `db.xxxxx.supabase.co`
- Puerto: `5432`
- **Problema**: Las conexiones se cierran rápidamente en serverless

### ✅ Connection Pooler (Recomendado para Vercel)
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```
- Host: `aws-0-[REGION].pooler.supabase.com`
- Puerto: `6543` (Session mode) o `5432` (Transaction mode)
- Parámetro: `pgbouncer=true`
- **Ventaja**: Diseñado para serverless, maneja conexiones eficientemente

---

## 📋 Modos del Connection Pooler

### Session Mode (Puerto 6543)
- ✅ Soporta transacciones
- ✅ Soporta prepared statements
- ✅ Recomendado para Prisma
- **URL**: `...pooler.supabase.com:6543/...?pgbouncer=true`

### Transaction Mode (Puerto 5432)
- ✅ Más rápido
- ⚠️ No soporta transacciones múltiples
- ⚠️ Limitado para algunas operaciones
- **URL**: `...pooler.supabase.com:5432/...?pgbouncer=true`

**Recomendación**: Usa **Session Mode (puerto 6543)** con Prisma.

---

## 🚀 Pasos Rápidos

1. **Supabase Dashboard** → Settings → Database → Connection Pooling
2. Copia la **Connection String** (Session mode)
3. **Vercel Dashboard** → Settings → Environment Variables
4. Actualiza `DATABASE_URL` con la URL del pooler
5. **Redeploy** el proyecto

---

## ✅ Verificación

Después de configurar, prueba:

1. **Signup** en la aplicación
2. Si funciona → ✅ Configuración correcta
3. Si sigue fallando → Revisa los logs de Vercel

**Logs esperados:**
- ✅ No debe aparecer: `Can't reach database server`
- ✅ Debe aparecer: `[SIGNUP] Usuario creado exitosamente`

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"
- **Causa**: Estás usando conexión directa
- **Solución**: Usa Connection Pooler (ver arriba)

### Error: "Authentication failed"
- **Causa**: Password incorrecto en la URL
- **Solución**: Verifica la password en Supabase Dashboard

### Error: "Connection timeout"
- **Causa**: Firewall o red bloqueando conexiones
- **Solución**: Verifica que Supabase permita conexiones desde Vercel (debería estar habilitado por defecto)

### Error: "Schema not found"
- **Causa**: Falta el parámetro `schema=public`
- **Solución**: Agrega `&schema=public` al final de la URL

---

## 📚 Referencias

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**Última actualización**: 2024-03-15
