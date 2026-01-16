# Production Deployment Checklist

Este checklist debe completarse antes de cada deploy a producción.

## 🔐 Variables de Entorno Requeridas

### Críticas (Sistema no funciona sin ellas)

- [ ] `JWT_SECRET`
  - **Tipo**: String aleatorio
  - **Longitud mínima**: 32 caracteres
  - **Generar**: `openssl rand -base64 32`
  - **Validación**: Fail-fast si falta en staging/production

- [ ] `APP_BASE_URL`
  - **Tipo**: URL completa (sin trailing slash)
  - **Ejemplo**: `https://app.nerlatalmud.com`
  - **Uso**: Construcción de magic links
  - **Validación**: Fail-fast si falta en staging/production

- [ ] `NEXT_PUBLIC_APP_URL`
  - **Tipo**: URL completa (sin trailing slash)
  - **Ejemplo**: `https://app.nerlatalmud.com`
  - **Uso**: URLs públicas en frontend
  - **Validación**: Fail-fast si falta en staging/production

- [ ] `SUPER_ADMIN_EMAILS`
  - **Tipo**: Comma-separated emails
  - **Ejemplo**: `teddy@nerlatalmud.com,moshe@nerlatalmud.com`
  - **Uso**: Asignación de rol SUPER_ADMIN
  - **Validación**: Fail-fast si falta en staging/production

### Opcionales (con defaults)

- [ ] `MAGIC_LINK_TTL_MINUTES`
  - **Default**: 15
  - **Uso**: Tiempo de expiración de magic links

- [ ] `DATABASE_URL`
  - **Tipo**: PostgreSQL connection string
  - **Requerido**: Sí (sistema no funciona sin BD)

- [ ] `SEED_SECRET_TOKEN`
  - **Tipo**: String aleatorio
  - **Requerido**: Solo si se usa `/api/seed`
  - **Generar**: `openssl rand -hex 32`

## ✅ Verificaciones Post-Deploy

### Autenticación

- [ ] Cookie `session` se crea correctamente (httpOnly, secure)
- [ ] Cookie `user_id` NO existe (deprecada)
- [ ] Magic link flow funciona end-to-end
- [ ] Login redirige según rol correctamente
- [ ] Logout borra cookie correctamente
- [ ] Endpoint `/api/auth` retorna 410 Gone

### Seguridad

- [ ] Middleware protege rutas correctamente
- [ ] Usuarios sin sesión son redirigidos a `/login`
- [ ] Usuarios con rol incorrecto son redirigidos a `/login`
- [ ] Magic links expiran después de 15 minutos
- [ ] Magic links son de un solo uso
- [ ] JWT expira después de 7 días

### Base de Datos

- [ ] Migración `add_login_tokens_magic_link` aplicada
- [ ] Tabla `LoginToken` existe
- [ ] Usuarios SUPER_ADMIN tienen rol correcto
- [ ] No hay usuarios con cookie `user_id` activa (migración)

## 🔄 Rotación de JWT_SECRET

### Procedimiento Seguro

1. **Preparación**:
   ```bash
   # Generar nuevo secreto
   openssl rand -base64 32
   ```

2. **Actualizar en Vercel**:
   - Ir a Project Settings → Environment Variables
   - Actualizar `JWT_SECRET` con nuevo valor
   - Aplicar a Production environment

3. **Efecto**:
   - Todos los usuarios existentes serán deslogueados (JWT inválido)
   - Usuarios deben hacer login nuevamente
   - No hay downtime

4. **Verificación**:
   - Intentar acceder con sesión antigua → debe redirigir a login
   - Hacer login nuevo → debe funcionar correctamente

### ⚠️ Consideraciones

- **Impacto**: Todos los usuarios activos serán deslogueados
- **Timing**: Hacer en horario de bajo tráfico si es posible
- **Comunicación**: Notificar a usuarios si es necesario

## 👥 Agregar Nuevo SUPER_ADMIN

### Procedimiento

1. **Obtener email del nuevo super admin**

2. **Actualizar variable de entorno**:
   ```bash
   # En Vercel: Project Settings → Environment Variables
   SUPER_ADMIN_EMAILS="email1@example.com,email2@example.com,nuevo@example.com"
   ```

3. **Aplicar cambios**:
   - Redeploy o esperar próximo deploy
   - O ejecutar seed manualmente (si está disponible)

4. **Verificar**:
   - Usuario hace login con magic link
   - Sistema asigna rol SUPER_ADMIN automáticamente
   - Usuario puede acceder a `/admin-dashboard`

### Notas

- El rol se asigna automáticamente en el callback del magic link
- Si el usuario ya existe, el rol se actualiza en el próximo login
- No requiere migración de BD

## ⚠️ Limitaciones Aceptables

### 1. Role Staleness en Middleware

**Problema**: Si un usuario es degradado/desactivado, el JWT sigue válido hasta expirar (7 días).

**Mitigación**:
- Las rutas API validan el estado actual usando `getCurrentUser()`
- Solo el middleware (redirección) puede permitir acceso temporal
- Las páginas protegidas también validan con `getCurrentUser()`

**Aceptable**: Trade-off necesario para Edge Runtime compatibility.

### 2. Email Provider No Implementado

**Problema**: Magic links solo se loguean en consola, no se envían por email.

**Estado**: TODO explícito en código.

**Workaround**: En staging, revisar logs de Vercel para obtener magic links.

**Impacto**: No funcional en producción sin email provider.

### 3. Rate Limiting No Implementado

**Problema**: No hay límite de requests a `/api/auth/request-link`.

**Estado**: TODO explícito en código.

**Riesgo**: Posible abuso/DDoS del endpoint.

**Mitigación temporal**: Monitorear logs y bloquear IPs manualmente si es necesario.

### 4. Token Cleanup No Implementado

**Problema**: Tokens expirados se acumulan en BD.

**Estado**: No implementado.

**Impacto**: Acumulación de datos (no crítico, pero debería limpiarse periódicamente).

**Solución futura**: Job periódico para limpiar tokens expirados.

## 🚨 Troubleshooting

### Usuarios no pueden hacer login

1. Verificar que `JWT_SECRET` está configurado
2. Verificar que `APP_BASE_URL` está configurado
3. Revisar logs de Vercel para magic links
4. Verificar que migración de BD está aplicada

### Middleware no protege rutas

1. Verificar que `runtime = 'edge'` está en middleware.ts
2. Verificar que JWT se crea correctamente (revisar cookie)
3. Verificar que `JWT_SECRET` es el mismo en todos los entornos

### Magic links no funcionan

1. Verificar que `APP_BASE_URL` es correcto
2. Verificar que token no está expirado (15 min)
3. Verificar que token no ha sido usado (usedAt null)
4. Revisar logs para errores de validación

## 📞 Contacto

Para problemas de seguridad o autenticación, contactar al Security Lead.
