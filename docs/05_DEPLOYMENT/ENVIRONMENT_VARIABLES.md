# 🔐 Variables de Entorno - Ner LaTalmud

**Guía completa de variables de entorno requeridas y opcionales**

---

## 📋 Resumen

Este documento lista todas las variables de entorno del sistema, su propósito, valores requeridos y dónde configurarlas.

---

## ⚠️ Variables Críticas (REQUERIDAS)

Estas variables **DEBEN** estar configuradas o la aplicación fallará.

### `DATABASE_URL`
**Descripción**: URL de conexión a PostgreSQL.

**Formato**: `postgresql://usuario:password@host:puerto/database?schema=public`

**Ejemplo**:
```
postgresql://postgres.xfpfveqoqwjxpggjpqwb:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Dónde configurar**: Vercel Environment Variables

**Entornos**: Production, Preview, Development

---

### `JWT_SECRET`
**Descripción**: Secreto para firmar tokens JWT de sesión.

**Cómo generar**:
```bash
openssl rand -base64 32
```

**Ejemplo de valor generado**:
```
K8j3mN9pQ2rT5vX8zA1bC4dE6fG9hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC0dE
```

**Dónde configurar**: Vercel Environment Variables

**Entornos**: Production, Preview, Development

**Validación**: Fail-fast si falta en staging/production

---

### `SUPER_ADMIN_EMAILS`
**Descripción**: Lista de emails de super administradores (separados por comas).

**Formato**: `email1@example.com,email2@example.com` (sin espacios)

**Ejemplo**:
```
teddy@nerlatalmud.com,moshe@nerlatalmud.com
```

**Dónde configurar**: Vercel Environment Variables

**Entornos**: Production, Preview, Development

**Validación**: Fail-fast si falta en staging/production

---

### `APP_BASE_URL`
**Descripción**: URL pública de la aplicación (sin trailing slash).

**Ejemplo**:
```
https://ner-latalmud-plataforma-evaluacion.vercel.app
```

**Dónde configurar**: Vercel Environment Variables

**Entornos**: Production, Preview, Development

**Validación**: Fail-fast si falta en staging/production

---

### `NEXT_PUBLIC_APP_URL`
**Descripción**: URL pública para el cliente (sin trailing slash).

**Ejemplo**:
```
https://ner-latalmud-plataforma-evaluacion.vercel.app
```

**Dónde configurar**: Vercel Environment Variables

**Entornos**: Production, Preview, Development

**Validación**: Fail-fast si falta en staging/production

---

## 📝 Variables Opcionales

### `MAGIC_LINK_TTL_MINUTES`
**Descripción**: Tiempo de expiración de magic links (en minutos).

**Default**: `15`

**Nota**: ⚠️ Magic Link está deprecado. Esta variable no se usa actualmente.

---

### `PDF_STORAGE_DIR`
**Descripción**: Directorio para almacenar PDFs generados.

**Default**: `./storage/pdfs`

**Nota**: En Vercel, usar `/tmp` (sistema de archivos efímero).

**Ejemplo para Vercel**:
```
/tmp
```

---

### `NODE_ENV`
**Descripción**: Entorno de ejecución.

**Valores**: `development`, `staging`, `production`

**Nota**: Automático en Vercel (no configurar manualmente).

---

## 🧪 Variables de Desarrollo

### `DEMO_SEED_ENABLED`
**Descripción**: Habilita el seed demo.

**Valor requerido**: `true`

**Solo para**: Desarrollo local

---

### `DEMO_SEED_CONFIRM`
**Descripción**: Confirmación explícita para ejecutar seed demo.

**Valor requerido**: `YES_I_KNOW_WHAT_I_AM_DOING`

**Solo para**: Desarrollo local

---

### `DEMO_ADMIN_EMAIL`
**Descripción**: Email del admin demo.

**Ejemplo**:
```
admin@demo.nerlatalmud.local
```

**Solo para**: Desarrollo local

---

## 📋 Checklist de Configuración

Antes de hacer deploy, verifica:

- [ ] `DATABASE_URL` configurada (Connection Pooler de Supabase)
- [ ] `JWT_SECRET` generado y configurado
- [ ] `SUPER_ADMIN_EMAILS` configurada (emails reales, separados por comas)
- [ ] `APP_BASE_URL` configurada (URL de Vercel)
- [ ] `NEXT_PUBLIC_APP_URL` configurada (URL de Vercel)
- [ ] `PDF_STORAGE_DIR` configurada (`/tmp` para Vercel)
- [ ] Todas las variables aplican a Production, Preview, Development

---

## 🔒 Seguridad

### ⚠️ NUNCA:
- ❌ Commitees variables de entorno en el código
- ❌ Hardcodees emails o secretos en el código
- ❌ Compartas valores de variables de entorno en texto plano

### ✅ SIEMPRE:
- ✅ Usa variables de entorno para datos sensibles
- ✅ Verifica que las variables estén configuradas antes de deploy
- ✅ Usa `.env.example` como template (sin valores reales)

---

## 🚨 Problemas Comunes

### Error: "JWT_SECRET es REQUERIDO"
**Causa**: `JWT_SECRET` no está configurada en Vercel.

**Solución**:
1. Genera un nuevo secreto: `openssl rand -base64 32`
2. Agrega la variable en Vercel Dashboard → Settings → Environment Variables
3. Haz un nuevo deploy

---

### Error: "SUPER_ADMIN_EMAILS no está configurado"
**Causa**: `SUPER_ADMIN_EMAILS` no está configurada en Vercel.

**Solución**:
1. Agrega la variable en Vercel Dashboard → Settings → Environment Variables
2. Formato: `email1@example.com,email2@example.com` (sin espacios)
3. Haz un nuevo deploy

---

### Error: "DATABASE_URL no está configurada"
**Causa**: `DATABASE_URL` no está configurada o es incorrecta.

**Solución**:
1. Verifica que estés usando Connection Pooler de Supabase
2. Formato: `postgresql://...pooler.supabase.com:6543/...?pgbouncer=true`
3. Verifica que la password sea correcta
4. Haz un nuevo deploy

---

## 📚 Referencias

- **Checklist de deploy**: `05_DEPLOYMENT/DEPLOY_CHECKLIST.md`
- **Configuración de Vercel**: `05_DEPLOYMENT/VERCEL_ENV_SETUP.md`
- **Configuración de Supabase**: `05_DEPLOYMENT/SUPABASE_SETUP.md`

---

**Última actualización**: 2025-01-XX  
**Versión**: 1.0
