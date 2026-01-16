# 🚀 Guía de Deploy - Ner LaTalmud

Esta guía documenta el proceso completo de despliegue a **STAGING** y **PRODUCTION**.

---

## 📋 Prerrequisitos

- Cuenta en Vercel configurada
- Base de datos PostgreSQL (staging y production separadas)
- Acceso a configuración de variables de entorno en Vercel
- Git configurado con acceso al repositorio

---

## 🔐 Variables de Entorno Requeridas

### Variables Críticas (REQUERIDAS)

| Variable | Descripción | Ejemplo | Dónde Configurar |
|----------|-------------|---------|------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@host:5432/db?schema=public` | Vercel Environment Variables |
| `SUPER_ADMIN_EMAILS` | Emails de super admins (comma-separated) | `teddy@nerlatalmud.com,moshe@nerlatalmud.com` | Vercel Environment Variables |
| `APP_BASE_URL` | URL pública de la aplicación | `https://staging.nerlatalmud.com` | Vercel Environment Variables |
| `NEXT_PUBLIC_APP_URL` | URL pública (para cliente) | `https://staging.nerlatalmud.com` | Vercel Environment Variables |

### Variables Opcionales

| Variable | Descripción | Default | Cuándo Usar |
|----------|-------------|---------|-------------|
| `PDF_STORAGE_DIR` | Directorio para almacenar PDFs | `./storage/pdfs` | Solo si necesitas almacenamiento local |
| `NODE_ENV` | Entorno de ejecución | `development` | Automático en Vercel |

---

## ✅ Checklist Pre-Deploy

### 1. Verificación de Código

- [ ] **No hay lógica hardcodeada de usuarios**
  - ✅ Verificado: `src/config/super-admins.ts` lee de `SUPER_ADMIN_EMAILS`
  - ✅ Verificado: No hay emails hardcodeados en lógica de negocio

- [ ] **No hay mocks silenciosos en staging/production**
  - ✅ Verificado: `src/lib/db.ts` falla si no hay `DATABASE_URL` en staging/production
  - ✅ Verificado: Mocks solo permitidos en `NODE_ENV=development`

- [ ] **Playwright configurado correctamente**
  - ✅ Verificado: Playwright solo se usa en `src/lib/pdf-service.ts` (server-side)
  - ✅ Verificado: No se importa en componentes cliente

- [ ] **Build pasa sin errores**
  ```bash
  npm run build
  ```

### 2. Configuración de Base de Datos

- [ ] **Base de datos staging creada**
- [ ] **Migraciones aplicadas**
  ```bash
  npx prisma migrate deploy
  ```
- [ ] **Seed ejecutado** (ver sección de Seed)

### 3. Variables de Entorno en Vercel

- [ ] **Todas las variables críticas configuradas**
- [ ] **Variables diferentes para staging y production**
- [ ] **SUPER_ADMIN_EMAILS contiene emails reales**

---

## 🚀 Proceso de Deploy a STAGING

### Paso 1: Configurar Variables de Entorno en Vercel

1. Ir a **Project Settings > Environment Variables** en Vercel
2. Configurar las siguientes variables para **Preview** (staging):

```env
DATABASE_URL=postgresql://user:password@staging-host:5432/ner_latalmud_staging?schema=public
SUPER_ADMIN_EMAILS=teddy@nerlatalmud.com,moshe@nerlatalmud.com
APP_BASE_URL=https://staging.nerlatalmud.com
NEXT_PUBLIC_APP_URL=https://staging.nerlatalmud.com
PDF_STORAGE_DIR=/tmp
NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- Reemplazar `staging-host` con el host real de tu base de datos staging
- Reemplazar los emails con los emails reales de Teddy y Moshe
- `PDF_STORAGE_DIR=/tmp` porque Vercel tiene sistema de archivos efímero

### Paso 2: Preparar Base de Datos Staging

```bash
# Conectar a base de datos staging
export DATABASE_URL="postgresql://user:password@staging-host:5432/ner_latalmud_staging?schema=public"

# Aplicar migraciones
npx prisma migrate deploy

# Ejecutar seed (ver sección de Seed)
npm run db:seed
```

### Paso 3: Deploy en Vercel

1. **Push a branch de staging** (ej: `staging` o `develop`)
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **O crear un Preview Deployment**
   - Ir a Vercel Dashboard
   - Seleccionar el proyecto
   - Hacer click en "Deploy" o crear un nuevo deployment desde un branch

3. **Verificar build**
   - Revisar logs de build en Vercel
   - Asegurar que no hay errores

### Paso 4: Verificar Deploy

- [ ] **Aplicación accesible en URL de staging**
- [ ] **Login funciona**
- [ ] **Base de datos conectada** (no usa mocks)
- [ ] **Super admins pueden acceder**

---

## 🌱 Seed de Base de Datos

### Cuándo Ejecutar Seed

- ✅ **Primera vez** que se configura la base de datos
- ✅ **Después de migraciones** que requieren datos iniciales
- ✅ **Reset de base de datos** (staging/testing)

### Cómo Ejecutar Seed

#### Opción 1: Desde Local (conectado a BD remota)

```bash
# Configurar DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Ejecutar seed
npm run db:seed
```

#### Opción 2: Desde Vercel (usando Vercel CLI)

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Conectar al proyecto
vercel link

# Ejecutar seed en el entorno remoto
vercel env pull .env.local
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2)
npm run db:seed
```

#### Opción 3: Desde Base de Datos Directamente

```bash
# Conectar a PostgreSQL
psql postgresql://user:password@host:5432/database

# Ejecutar seed manualmente (no recomendado, usar script)
```

### Qué Hace el Seed

El seed (`prisma/seed.ts`):

1. **Crea/actualiza usuarios SUPER_ADMIN**
   - Lee emails de `SUPER_ADMIN_EMAILS`
   - Asegura que esos emails tengan rol `SUPER_ADMIN`
   - Crea usuarios si no existen

2. **Crea usuarios de prueba**
   - Usuario evaluador de prueba (opcional)

3. **Crea alumnos de ejemplo** (opcional, solo para desarrollo)

### Verificar Seed Exitoso

```bash
# Conectar a base de datos
psql $DATABASE_URL

# Verificar usuarios creados
SELECT id, nombre, correo, rol, estado FROM "Usuario";

# Verificar que super admins tienen rol correcto
SELECT correo, rol FROM "Usuario" WHERE rol = 'SUPER_ADMIN';
```

---

## 🔑 Acceso como SUPER_ADMIN

### Paso 1: Verificar que el Usuario Existe

El seed debe haber creado/actualizado los usuarios con emails en `SUPER_ADMIN_EMAILS`.

### Paso 2: Login

1. Ir a la URL de staging: `https://staging.nerlatalmud.com/login`
2. Ingresar el **email** de uno de los super admins
   - Ejemplo: `teddy@nerlatalmud.com` o `moshe@nerlatalmud.com`
3. El sistema redirigirá automáticamente al dashboard de admin

### Paso 3: Verificar Permisos

- [ ] Puede acceder a `/admin-dashboard`
- [ ] Puede acceder a `/alumnos`
- [ ] Puede acceder a `/usuarios`
- [ ] Puede crear/editar/eliminar alumnos
- [ ] Puede ver todas las evaluaciones

### Troubleshooting

**Problema:** "No autorizado" al intentar acceder a rutas de admin

**Solución:**
1. Verificar que el email está en `SUPER_ADMIN_EMAILS`
2. Verificar que el usuario tiene rol `SUPER_ADMIN` en la BD:
   ```sql
   SELECT correo, rol FROM "Usuario" WHERE correo = 'teddy@nerlatalmud.com';
   ```
3. Si el rol es incorrecto, ejecutar seed nuevamente:
   ```bash
   npm run db:seed
   ```

---

## 🏗️ Build y Configuración de Vercel

### Configuración de Build

Vercel detecta automáticamente Next.js y usa estos comandos:

- **Build Command:** `next build` (automático)
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install` (automático)

### Variables de Entorno por Entorno

En Vercel, puedes configurar variables diferentes para:

- **Development:** Variables para desarrollo local
- **Preview:** Variables para staging/preview deployments
- **Production:** Variables para producción

**Recomendación:** Usar bases de datos diferentes para cada entorno.

### Playwright en Vercel

Playwright se usa solo en server-side (`src/lib/pdf-service.ts`). Vercel:

- ✅ Instala Playwright automáticamente durante build
- ✅ Incluye Chromium en el runtime
- ✅ No requiere configuración adicional

**Nota:** Para producción, considera usar un servicio externo para almacenamiento de PDFs (S3, etc.) ya que Vercel tiene sistema de archivos efímero.

---

## 🔍 Verificación Post-Deploy

### Checklist de Verificación

- [ ] **Build exitoso** (sin errores en logs)
- [ ] **Aplicación accesible** (responde en URL)
- [ ] **Base de datos conectada** (no hay errores de conexión)
- [ ] **Login funciona** (puedes iniciar sesión)
- [ ] **Super admins pueden acceder** (verificar permisos)
- [ ] **Rutas protegidas funcionan** (middleware activo)
- [ ] **No hay mocks activos** (verificar logs, no debe decir "using mock")
- [ ] **PDFs se generan** (si aplica, probar generación de PDF)

### Comandos de Verificación

```bash
# Verificar que no se usan mocks
# En los logs de Vercel, buscar:
# ❌ NO debe aparecer: "using mock data"
# ✅ Debe aparecer: conexión a PostgreSQL exitosa

# Verificar variables de entorno
# En Vercel Dashboard > Deployments > [último deploy] > Runtime Logs
# Verificar que DATABASE_URL está configurada
```

---

## 🚨 Troubleshooting Común

### Error: "DATABASE_URL no está configurada"

**Causa:** Variable de entorno no configurada en Vercel

**Solución:**
1. Ir a Vercel > Project Settings > Environment Variables
2. Agregar `DATABASE_URL` con el valor correcto
3. Re-deploy

### Error: "SUPER_ADMIN_EMAILS no está configurado"

**Causa:** Variable de entorno no configurada en Vercel

**Solución:**
1. Ir a Vercel > Project Settings > Environment Variables
2. Agregar `SUPER_ADMIN_EMAILS` con emails separados por comas
3. Re-deploy

### Error: "No autorizado" al acceder como SUPER_ADMIN

**Causa:** Usuario no tiene rol SUPER_ADMIN en la base de datos

**Solución:**
1. Verificar que el email está en `SUPER_ADMIN_EMAILS`
2. Ejecutar seed:
   ```bash
   npm run db:seed
   ```
3. Verificar en BD:
   ```sql
   SELECT correo, rol FROM "Usuario" WHERE correo = 'tu-email@example.com';
   ```

### Error: Playwright no funciona en Vercel

**Causa:** Playwright requiere dependencias del sistema

**Solución:**
- Vercel instala Playwright automáticamente
- Si hay problemas, verificar que `playwright` está en `dependencies` (no `devDependencies`)
- Verificar logs de build para errores de instalación

---

## 📝 Notas Importantes

1. **NUNCA commitees `.env`** - Usar `env.example` como template
2. **Usar bases de datos diferentes** para staging y production
3. **SUPER_ADMIN_EMAILS debe contener emails reales** - No usar emails de prueba en staging/production
4. **PDF_STORAGE_DIR=/tmp en Vercel** - Los archivos se pierden al reiniciar
5. **Ejecutar seed después de migraciones** - Asegurar datos iniciales correctos

---

## 🔄 Proceso de Deploy a PRODUCTION

El proceso es similar a staging, pero:

1. **Usar variables de entorno de PRODUCTION** en Vercel
2. **Usar base de datos de PRODUCTION** (diferente a staging)
3. **Verificar doblemente** todas las configuraciones
4. **Ejecutar seed en producción** con emails reales
5. **Monitorear logs** después del deploy

---

**Última actualización:** 2025-01-XX  
**Versión:** 1.0
