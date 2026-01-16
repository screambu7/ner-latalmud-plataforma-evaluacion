# 🔑 Configuración de Password en DATABASE_URL para Supabase

## ⚠️ Error Común

Si ves errores como:
- `500 Internal Server Error` en signup
- `Can't reach database server`
- `Authentication failed`

**Causa probable**: Estás usando `[PASSWORD]` o `[YOUR-PASSWORD]` como texto literal en lugar de tu password real.

---

## ✅ Solución: Usar tu Password Real

### Paso 1: Obtener tu Password de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Database**
4. Busca la sección **"Database password"** o **"Connection string"**
5. **Copia tu password real** (es la que configuraste cuando creaste el proyecto)

### Paso 2: Construir la URL Correcta

Con los datos que proporcionaste:
- **Host**: `aws-0-us-west-2.pooler.supabase.com`
- **Port**: `5432` (o `6543` para Session Mode)
- **Database**: `postgres`
- **User**: `postgres.xfpfveqoqwjxpggjpqwb`
- **Pool Mode**: `session`

**URL para Session Mode (Recomendado - Puerto 6543):**
```
postgresql://postgres.xfpfveqoqwjxpggjpqwb:TU_PASSWORD_REAL@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
```

**URL para Transaction Mode (Puerto 5432):**
```
postgresql://postgres.xfpfveqoqwjxpggjpqwb:TU_PASSWORD_REAL@aws-0-us-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true&schema=public
```

⚠️ **REEMPLAZA `TU_PASSWORD_REAL`** con tu password real de Supabase.

### Paso 3: Configurar en Vercel

1. Ve a **Vercel Dashboard** → Tu Proyecto → **Settings** → **Environment Variables**
2. Edita la variable `DATABASE_URL`
3. Pega la URL completa con tu password real
4. **Asegúrate de que NO tenga `[PASSWORD]` o `[YOUR-PASSWORD]` como texto literal**
5. Guarda
6. Espera el redeploy automático

---

## 🔍 Verificación

### Ejemplo Correcto ✅
```env
DATABASE_URL="postgresql://postgres.xfpfveqoqwjxpggjpqwb:miPassword123@aws-0-us-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true&schema=public"
```

### Ejemplo Incorrecto ❌
```env
DATABASE_URL="postgresql://postgres.xfpfveqoqwjxpggjpqwb:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true&schema=public"
```
**Problema**: `[PASSWORD]` es texto literal, no tu password real.

---

## 📝 Notas Importantes

1. **La password puede contener caracteres especiales**: Si tu password tiene `@`, `#`, `%`, etc., necesitas codificarla (URL encoding):
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`
   - `&` → `%26`

2. **Si olvidaste tu password**: 
   - Ve a Supabase Dashboard → Settings → Database
   - Puedes resetear la password si es necesario

3. **Seguridad**: 
   - Nunca commitees la password en código
   - Solo úsala en variables de entorno (Vercel Environment Variables)
   - La password está encriptada en Vercel

---

## 🚀 Después de Configurar

1. **Redeploy** (automático o manual)
2. **Prueba signup** nuevamente
3. **Revisa logs** si sigue fallando:
   - Vercel Dashboard → Deployments → [último deploy] → Runtime Logs
   - Busca `[SIGNUP]` para ver errores específicos

---

**Última actualización**: 2024-03-15
