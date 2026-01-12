# Security Final: Authentication Surface Freeze

Este documento describe el estado final del sistema de autenticación después del hardening de producción.

## 🔒 Estado Final del Sistema

### Autenticación
- ✅ **Magic Link Login**: Único método de autenticación permitido
- ✅ **JWT Session**: Tokens firmados con jose (Edge-compatible)
- ✅ **Email Verification**: Usuario solo se crea cuando se valida magic link
- ❌ **Email-only login**: NO PERMITIDO (endpoint deprecado, retorna 410 Gone)

### Flujo de Autenticación

```
1. Usuario → POST /api/auth/request-link { correo }
   ↓
2. Sistema genera token aleatorio, hashea y guarda en BD
   ↓
3. Sistema construye magic link y lo "envía" (console en dev, TODO: email en prod)
   ↓
4. Usuario hace click en magic link → GET /api/auth/callback?token=...
   ↓
5. Sistema valida token (hash, expiración, uso único)
   ↓
6. Sistema marca token como usado
   ↓
7. Sistema upsert usuario (crea si no existe, actualiza si existe)
   ↓
8. Sistema crea JWT session cookie (httpOnly, secure en prod)
   ↓
9. Sistema redirige según rol (SUPER_ADMIN → /admin-dashboard, EVALUADOR → /evaluador-dashboard)
```

### Sesión JWT

**Cookie**: `session` (httpOnly, secure en production, sameSite=lax, path=/, maxAge=7 días)

**Payload JWT**:
```typescript
{
  sub: number,        // userId
  rol: Rol,          // SUPER_ADMIN | EVALUADOR
  escuelaId?: number, // Opcional
  iat: number,        // Issued at
  exp: number         // Expiration (7 días desde iat)
}
```

**Validación**:
- Middleware: Solo verifica JWT (firma, expiración, rol) - NO consulta BD
- API Routes: Valida JWT Y consulta BD para estado actual (getCurrentUser)

### Middleware Edge

**Constraints**:
- NO Database Access (Edge Runtime no soporta Prisma)
- NO Node APIs (solo Web APIs)
- Stateless (no side effects)

**Trade-off aceptado**:
- Si un usuario es degradado/desactivado, el JWT sigue válido hasta expirar (7 días)
- Las rutas API SÍ validan el estado actual usando getCurrentUser()
- Esto es aceptable para mantener Edge compatibility

## 🛡️ Seguridad Implementada

### Magic Link
- ✅ Tokens hasheados en BD (SHA-256, no se guardan en claro)
- ✅ Tokens de un solo uso (marcados con usedAt)
- ✅ Tokens expiran (15 minutos por defecto)
- ✅ No se revela si el usuario existe (evita enumeración)

### JWT Session
- ✅ Firmado con secreto (JWT_SECRET)
- ✅ Expiración configurada (7 días)
- ✅ Cookie httpOnly (no accesible desde JavaScript)
- ✅ Cookie secure en production (solo HTTPS)
- ✅ Cookie sameSite=lax (protección CSRF)

### Variables de Entorno
- ✅ Validación fail-fast en staging/production
- ✅ JWT_SECRET requerido
- ✅ APP_BASE_URL requerido
- ✅ SUPER_ADMIN_EMAILS requerido

## 📋 Endpoints

| Endpoint | Método | Estado | Descripción |
|----------|--------|--------|-------------|
| `/api/auth/request-link` | POST | ✅ Activo | Solicita magic link |
| `/api/auth/callback` | GET | ✅ Activo | Valida magic link y crea sesión |
| `/api/auth/logout` | POST | ✅ Activo | Cierra sesión |
| `/api/auth/forgot` | POST | ✅ Activo | Alias de request-link |
| `/api/auth` | POST | ❌ Deprecado | Retorna 410 Gone |

## ⚠️ Limitaciones Conocidas

1. **Role Staleness**: Cambios de rol no se reflejan en middleware hasta que expire JWT (7 días)
   - **Mitigación**: Rutas API validan estado actual
   - **Aceptable**: Trade-off por Edge compatibility

2. **Email Provider**: Magic links solo se loguean en consola (no se envían emails reales)
   - **Estado**: TODO explícito
   - **Impacto**: Solo funciona en desarrollo/staging con acceso a logs

3. **Rate Limiting**: No implementado
   - **Estado**: TODO explícito
   - **Riesgo**: Posible abuso de request-link endpoint

4. **Token Cleanup**: Tokens expirados se acumulan en BD
   - **Estado**: No implementado
   - **Impacto**: Acumulación de datos (no crítico)

## 🚫 Prohibiciones Explícitas

- ❌ **Email-only login**: NO PERMITIDO
- ❌ **Auto-creación sin verificación**: NO PERMITIDO
- ❌ **Cookies sin firma**: NO PERMITIDO
- ❌ **Prisma en middleware**: NO PERMITIDO (Edge incompatible)
- ❌ **Node crypto en Edge**: NO PERMITIDO

## 📚 Archivos Clave

- `src/lib/jwt.ts`: JWT signing/verification
- `src/lib/magic-link.ts`: Magic link utilities
- `src/lib/auth.ts`: getCurrentUser (valida JWT + BD)
- `src/lib/auth-utils.ts`: Cookie management
- `src/lib/env-validation.ts`: Env var validation (fail-fast)
- `src/middleware.ts`: Edge middleware (JWT only, no BD)
- `src/app/api/auth/request-link/route.ts`: Request magic link
- `src/app/api/auth/callback/route.ts`: Validate magic link

## ✅ Checklist de Hardening

- [x] session.ts eliminado (deprecado)
- [x] Variables de entorno validadas (fail-fast en staging/production)
- [x] Cookies hardened (httpOnly, secure en prod, sameSite=lax, path=/, maxAge=7 días)
- [x] JWT expiración alineada con cookie maxAge (7 días)
- [x] Middleware documentado (Edge constraints, trade-offs)
- [x] Documentación actualizada (SECURITY_FINAL.md, PRODUCTION_CHECKLIST.md)
- [x] Endpoints deprecados retornan 410 Gone con mensaje claro
- [x] No referencias a user_id cookie en código
- [x] No referencias a session.ts en código
- [x] Logout borra cookie correctamente
