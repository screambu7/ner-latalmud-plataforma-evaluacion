# ✅ Checklist de Deploy - STAGING

## 📋 Pre-Deploy

### Código y Configuración

- [ ] **Build pasa sin errores**
  ```bash
  npm run build
  ```

- [ ] **No hay lógica hardcodeada de usuarios**
  - [ ] Verificado: `src/config/super-admins.ts` lee de `SUPER_ADMIN_EMAILS`
  - [ ] Verificado: No hay emails hardcodeados en lógica de negocio

- [ ] **No hay mocks silenciosos en staging**
  - [ ] Verificado: `src/lib/db.ts` falla si no hay `DATABASE_URL` en staging
  - [ ] Verificado: Mocks solo permitidos en `NODE_ENV=development`

- [ ] **Playwright configurado correctamente**
  - [ ] Verificado: Solo se usa en server-side (`src/lib/pdf-service.ts`)
  - [ ] Verificado: No se importa en componentes cliente

### Base de Datos

- [ ] **Base de datos staging creada**
  - [ ] Host: `_________________`
  - [ ] Database: `_________________`
  - [ ] Usuario: `_________________`

- [ ] **Migraciones aplicadas**
  ```bash
  export DATABASE_URL="postgresql://..."
  npx prisma migrate deploy
  ```

- [ ] **Seed ejecutado**
  ```bash
  npm run db:seed
  ```

- [ ] **Usuarios SUPER_ADMIN verificados**
  ```sql
  SELECT correo, rol FROM "Usuario" WHERE rol = 'SUPER_ADMIN';
  ```

### Variables de Entorno en Vercel

- [ ] **DATABASE_URL configurada**
  - [ ] Valor: `postgresql://...`
  - [ ] Entorno: Preview (staging)

- [ ] **SUPER_ADMIN_EMAILS configurada**
  - [ ] Valor: `teddy@nerlatalmud.com,moshe@nerlatalmud.com`
  - [ ] Entorno: Preview (staging)
  - [ ] ⚠️ Emails reales (no de prueba)

- [ ] **APP_BASE_URL configurada**
  - [ ] Valor: `https://staging.nerlatalmud.com`
  - [ ] Entorno: Preview (staging)

- [ ] **NEXT_PUBLIC_APP_URL configurada**
  - [ ] Valor: `https://staging.nerlatalmud.com`
  - [ ] Entorno: Preview (staging)

- [ ] **PDF_STORAGE_DIR configurada**
  - [ ] Valor: `/tmp`
  - [ ] Entorno: Preview (staging)

- [ ] **NODE_ENV configurada** (automático en Vercel)
  - [ ] Valor: `production`
  - [ ] Entorno: Preview (staging)

---

## 🚀 Deploy

- [ ] **Branch de staging creado/push**
  ```bash
  git checkout -b staging
  git push origin staging
  ```

- [ ] **Deploy iniciado en Vercel**
  - [ ] Branch seleccionado: `staging`
  - [ ] Variables de entorno aplicadas

- [ ] **Build exitoso**
  - [ ] Revisar logs de build
  - [ ] Sin errores de compilación
  - [ ] Sin errores de dependencias

---

## ✅ Post-Deploy

### Verificación de Aplicación

- [ ] **Aplicación accesible**
  - [ ] URL: `https://staging.nerlatalmud.com`
  - [ ] Responde sin errores 500

- [ ] **Base de datos conectada**
  - [ ] No hay errores de conexión en logs
  - [ ] No se usan mocks (verificar logs)

- [ ] **Login funciona**
  - [ ] Página `/login` carga correctamente
  - [ ] Puedo iniciar sesión con email

### Verificación de Permisos

- [ ] **Super admin puede acceder**
  - [ ] Email: `teddy@nerlatalmud.com` o `moshe@nerlatalmud.com`
  - [ ] Login exitoso
  - [ ] Redirige a `/admin-dashboard`

- [ ] **Rutas de admin protegidas**
  - [ ] `/admin-dashboard` accesible como SUPER_ADMIN
  - [ ] `/alumnos` accesible como SUPER_ADMIN
  - [ ] `/usuarios` accesible como SUPER_ADMIN
  - [ ] `/evaluaciones` accesible como SUPER_ADMIN
  - [ ] `/reportes` accesible como SUPER_ADMIN
  - [ ] `/configuracion` accesible como SUPER_ADMIN

- [ ] **Rutas de evaluador protegidas**
  - [ ] `/evaluador-dashboard` accesible como EVALUADOR
  - [ ] `/mis-alumnos` accesible como EVALUADOR
  - [ ] `/evaluar` accesible como EVALUADOR

- [ ] **Rutas protegidas bloquean acceso no autorizado**
  - [ ] Usuario sin rol no puede acceder a rutas protegidas
  - [ ] Redirige a `/login` si no está autenticado

### Verificación de Funcionalidad

- [ ] **CRUD de alumnos funciona** (como SUPER_ADMIN)
  - [ ] Crear alumno
  - [ ] Ver lista de alumnos
  - [ ] Editar alumno
  - [ ] Eliminar alumno (baja lógica)

- [ ] **Evaluaciones funcionan** (como EVALUADOR)
  - [ ] Ver lista de evaluaciones
  - [ ] Crear evaluación
  - [ ] Ver perfil de diagnóstico

- [ ] **Reportes funcionan** (si aplica)
  - [ ] Generar reporte
  - [ ] Descargar PDF (si aplica)

### Verificación de Logs

- [ ] **No hay errores críticos en logs**
  - [ ] Revisar Runtime Logs en Vercel
  - [ ] No hay errores de conexión a BD
  - [ ] No hay errores de autenticación

- [ ] **No se usan mocks**
  - [ ] Logs no mencionan "using mock data"
  - [ ] Logs muestran conexión a PostgreSQL

---

## 📝 Documentación

- [ ] **Variables de entorno documentadas**
  - [ ] En `env.example`
  - [ ] En `docs/DEPLOY.md`

- [ ] **Proceso de seed documentado**
  - [ ] En `docs/DEPLOY.md`
  - [ ] Comandos verificados

- [ ] **Acceso como SUPER_ADMIN documentado**
  - [ ] En `docs/DEPLOY.md`
  - [ ] Emails verificados

---

## 🚨 Troubleshooting (si aplica)

- [ ] **Error resuelto:** `_________________`
  - [ ] Solución aplicada: `_________________`

- [ ] **Error resuelto:** `_________________`
  - [ ] Solución aplicada: `_________________`

---

## ✅ Firma de Aprobación

- [ ] **Deploy verificado por:** `_________________`
- [ ] **Fecha:** `_________________`
- [ ] **URL de staging:** `_________________`
- [ ] **Notas adicionales:** `_________________`

---

**Checklist completado:** [ ] Sí [ ] No  
**Listo para producción:** [ ] Sí [ ] No
