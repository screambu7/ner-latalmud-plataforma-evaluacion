# 🔐 Configuración de Variables de Entorno en Vercel

Esta guía explica cómo configurar las variables de entorno **REQUERIDAS** en Vercel para que la aplicación funcione correctamente.

## ⚠️ Variables Críticas (REQUERIDAS)

Estas variables **DEBEN** estar configuradas o la aplicación fallará:

### 1. `JWT_SECRET`

**Descripción**: Secreto para firmar tokens JWT de sesión.

**Cómo generar**:
```bash
openssl rand -base64 32
```

**Ejemplo de valor generado**:
```
K8j3mN9pQ2rT5vX8zA1bC4dE6fG9hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC0dE
```

**Dónde configurar en Vercel**:
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega:
   - **Name**: `JWT_SECRET`
   - **Value**: (pega el valor generado)
   - **Environment**: Production, Preview, Development (selecciona todos)

### 2. `SUPER_ADMIN_EMAILS`

**Descripción**: Lista de emails de super administradores (separados por comas).

**Formato**: `email1@example.com,email2@example.com`

**Ejemplo**:
```
teddy@nerlatalmud.com,moshe@nerlatalmud.com
```

**Dónde configurar en Vercel**:
1. Settings → Environment Variables
2. Agrega:
   - **Name**: `SUPER_ADMIN_EMAILS`
   - **Value**: (tus emails separados por comas, SIN espacios)
   - **Environment**: Production, Preview, Development

### 3. `DATABASE_URL`

**Descripción**: URL de conexión a PostgreSQL (Supabase).

**Formato**: `postgresql://usuario:password@host:puerto/database?schema=public`

**Ejemplo para Supabase Connection Pooler**:
```
postgresql://postgres.xfpfveqoqwjxpggjpqwb:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Dónde configurar en Vercel**:
1. Settings → Environment Variables
2. Agrega:
   - **Name**: `DATABASE_URL`
   - **Value**: (tu connection string)
   - **Environment**: Production, Preview, Development

### 4. `APP_BASE_URL` (Opcional pero recomendado)

**Descripción**: URL pública de la aplicación (sin trailing slash).

**Ejemplo**:
```
https://ner-latalmud-plataforma-evaluacion.vercel.app
```

**Dónde configurar en Vercel**:
1. Settings → Environment Variables
2. Agrega:
   - **Name**: `APP_BASE_URL`
   - **Value**: (tu URL de Vercel)
   - **Environment**: Production, Preview, Development

### 5. `NEXT_PUBLIC_APP_URL` (Opcional pero recomendado)

**Descripción**: URL pública para el cliente (sin trailing slash).

**Ejemplo**:
```
https://ner-latalmud-plataforma-evaluacion.vercel.app
```

**Dónde configurar en Vercel**:
1. Settings → Environment Variables
2. Agrega:
   - **Name**: `NEXT_PUBLIC_APP_URL`
   - **Value**: (tu URL de Vercel)
   - **Environment**: Production, Preview, Development

## 📋 Checklist de Configuración

Antes de hacer deploy, verifica que tengas:

- [ ] `JWT_SECRET` generado y configurado
- [ ] `SUPER_ADMIN_EMAILS` configurado (emails reales, separados por comas)
- [ ] `DATABASE_URL` configurado (Connection Pooler de Supabase)
- [ ] `APP_BASE_URL` configurado (opcional)
- [ ] `NEXT_PUBLIC_APP_URL` configurado (opcional)

## 🚨 Problemas Comunes

### Error: "JWT_SECRET es REQUERIDO"

**Causa**: `JWT_SECRET` no está configurado en Vercel.

**Solución**: 
1. Genera un nuevo secreto: `openssl rand -base64 32`
2. Agrega la variable en Vercel Dashboard → Settings → Environment Variables
3. Haz un nuevo deploy

### Error: "SUPER_ADMIN_EMAILS no está configurado"

**Causa**: `SUPER_ADMIN_EMAILS` no está configurado en Vercel.

**Solución**:
1. Agrega la variable en Vercel Dashboard → Settings → Environment Variables
2. Formato: `email1@example.com,email2@example.com` (sin espacios)
3. Haz un nuevo deploy

### Error 500 en `/api/auth/login`

**Causa**: Faltan variables de entorno (`JWT_SECRET` o `SUPER_ADMIN_EMAILS`).

**Solución**:
1. Verifica que todas las variables estén configuradas en Vercel
2. Revisa los logs de Vercel para ver el error específico
3. Haz un nuevo deploy después de agregar las variables

## 🔒 Seguridad

- **NUNCA** commitees variables de entorno en el código
- **NUNCA** hardcodees emails o secretos en el código
- **SIEMPRE** usa variables de entorno para datos sensibles
- **SIEMPRE** verifica que las variables estén configuradas antes de hacer deploy

## 📚 Referencias

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
