# Security Final: Authentication Surface Freeze

> **⚠️ ACTUALIZADO:** Este documento describe el estado final del sistema de autenticación.
> **REFERENCIA PRINCIPAL:** Ver `.cursorrules-auth` para reglas completas y actualizadas.

## 🔒 Estado Final del Sistema

### Autenticación
- ✅ **Password Auth**: Único método de autenticación activo y permitido
- ✅ **JWT Session**: Tokens firmados con jose (Edge-compatible)
- ✅ **bcrypt**: Hash obligatorio para passwordHash
- ❌ **Magic Link**: CONGELADO (no deprecado, congelado)
- ❌ **Email-only login**: NO PERMITIDO
- ❌ **Auto-login por token**: NO PERMITIDO

### Flujo de Autenticación (Password Auth)

```
1. Usuario → POST /api/auth/login { correo, password }
   ↓
2. Sistema valida correo y password
   ↓
3. Sistema verifica passwordHash con bcrypt.compare
   ↓
4. Sistema valida estado del usuario (ACTIVO)
   ↓
5. Sistema crea JWT session cookie (httpOnly, secure en prod, sameSite=lax)
   ↓
6. Sistema redirige según rol (SUPER_ADMIN → /admin-dashboard, EVALUADOR → /evaluador-dashboard)
```

### Flujo de Provisioning (Admin)

```
1. SUPER_ADMIN → Crear usuario (UI/Server Action)
   ↓
2. Sistema valida datos y password usando password-policy.ts
   (Reglas: ≥8 caracteres, al menos 1 letra, al menos 1 número)
   ↓
3. Sistema hashea password con bcrypt
   ↓
4. Sistema crea usuario con passwordHash y estado = ACTIVO
```

**INVARIANTE CRÍTICO**: Todo usuario DEBE tener passwordHash desde su creación.
- `createUsuario` requiere password como parámetro obligatorio (TypeScript)
- No es posible crear usuarios sin passwordHash
- No existe signup público
- No existe recovery por email
- Sistema es admin-provisioned únicamente

### Magic Link - CONGELADO

**Estado:** CONGELADO (código comentado, no debe reactivarse)

El flujo anterior de Magic Link está congelado y no debe usarse.

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

### Password Auth
- ✅ Hash con bcrypt (obligatorio)
- ✅ bcrypt.compare para verificación
- ✅ Errores genéricos (no revela si usuario existe)
- ✅ Password Policy centralizada (`src/lib/security/password-policy.ts`)
  - Reglas: ≥8 caracteres, al menos 1 letra, al menos 1 número
  - Fuente única de verdad para todas las validaciones
- ✅ Usuarios siempre con passwordHash (prohibido crear sin password)
- ✅ `createUsuario` requiere password obligatorio (TypeScript)
- ✅ `set-password` protegido (solo SUPER_ADMIN autenticado)

### JWT Session
- ✅ Firmado con secreto (JWT_SECRET)
- ✅ Expiración configurada (7 días)
- ✅ Cookie httpOnly (no accesible desde JavaScript)
- ✅ Cookie secure en production (solo HTTPS)
- ✅ Cookie sameSite=lax (protección CSRF)
- ✅ Logout borra cookie (maxAge=0)

### Magic Link (Eliminado)
- ❌ Código movido a `src/__deprecated__/magic-link.ts`
- ❌ Funciones lanzan errores explícitos si se intentan usar
- ❌ NO debe reactivarse sin aprobación explícita
- ❌ Endpoints retornan 410 Gone

### Variables de Entorno
- ✅ Validación fail-fast en staging/production
- ✅ JWT_SECRET requerido
- ✅ APP_BASE_URL requerido
- ✅ SUPER_ADMIN_EMAILS requerido

## 📋 Endpoints

| Endpoint | Método | Estado | Descripción |
|----------|--------|--------|-------------|
| `/api/auth/login` | POST | ✅ Activo | Login con password (único método activo) |
| `/api/auth/logout` | POST | ✅ Activo | Cierra sesión (borra cookie) |
| `/api/admin/set-password` | POST | ✅ Protegido | Set password (solo SUPER_ADMIN autenticado) |
| `/api/auth/signup` | POST | ❌ Deshabilitado | Retorna 410 Gone (B2-2) |
| `/api/auth/forgot-password` | POST | ❌ Deshabilitado | Retorna 410 Gone (B2-2) |
| `/api/auth/request-link` | POST | ❌ Congelado | Magic Link (código comentado) |
| `/api/auth/callback` | GET | ❌ Congelado | Magic Link callback (código comentado) |
| `/api/auth/forgot` | POST | ❌ Congelado | Alias de request-link (código comentado) |
| `/api/auth` | POST | ❌ Deprecado | Retorna 410 Gone |

## 🔒 B2-2 Hardening (Password-Only)

**Estado:** ✅ Implementado

### Decisiones Canónicas

El único flujo válido es:
1. SUPER_ADMIN crea usuario
2. Usuario recibe credenciales iniciales
3. Usuario puede cambiar password (solo si autenticado)
4. Login por password

**Flujos CERRADOS:**
- ❌ Auto-signup público
- ❌ Magic link
- ❌ Forgot-password público
- ❌ Set-password sin autenticación

### Cambios Implementados

#### A. Signup Público — DESHABILITADO
- `/api/auth/signup` → Retorna 410 Gone
- Razón: Creaba usuarios sin passwordHash, rompía modelo de seguridad

#### B. Forgot Password — DESHABILITADO
- `/api/auth/forgot-password` → Retorna 410 Gone
- Se reabrirá solo cuando exista:
  - Proveedor de correo confiable
  - Tokens firmados seguros
  - Rate limiting implementado

#### C. Set-Password — PROTEGIDO
- `/api/admin/set-password` → Solo SUPER_ADMIN autenticado
- ❌ `ALLOW_PASSWORD_SETUP` eliminado
- ❌ Endpoint público eliminado

#### D. Login — ÚNICA PUERTA
- `/api/auth/login` → passwordHash obligatorio
- Si no existe → 403 (Cuenta no habilitada)
- ❌ No mencionar magic link
- ❌ No fallback
- ❌ No recovery implícito

### Invariantes de Base de Datos

**Todo Usuario debe tener passwordHash**

- Validación en código (auditoría al crear usuario)
- Logs de error si se intenta violar
- Constraint parcial futura (opcional)

### UI Ajustada

- ❌ Links removidos: "Crear cuenta", "¿Olvidaste tu contraseña?"
- ✅ Mensaje mostrado: "El acceso es proporcionado por el administrador"
- Sin cambios de layout, solo texto condicional

## ⚠️ Limitaciones Conocidas

1. **Role Staleness**: Cambios de rol no se reflejan en middleware hasta que expire JWT (7 días)
   - **Mitigación**: Rutas API validan estado actual
   - **Aceptable**: Trade-off por Edge compatibility

2. **Rate Limiting**: No implementado (BLOQUEADO hasta tener email provider)
   - **Estado**: Documentado como bloqueado
   - **Riesgo**: Mitigado al deshabilitar signup/forgot-password públicos

3. **Lockout por Intentos**: No implementado (BLOQUEADO)
   - **Estado**: Documentado como bloqueado

4. **Password Rotation**: No implementado (BLOQUEADO)
   - **Estado**: Documentado como bloqueado

5. **MFA (Multi-Factor Authentication)**: No implementado (BLOQUEADO)
   - **Estado**: Documentado como bloqueado

## 🚫 Prohibiciones Explícitas

- ❌ **Magic Link**: CONGELADO (no usar, ampliar ni reactivar)
- ❌ **Email-only login**: NO PERMITIDO
- ❌ **Auto-creación sin verificación**: NO PERMITIDO
- ❌ **Signup público**: DESHABILITADO (B2-2)
- ❌ **Forgot-password público**: DESHABILITADO (B2-2)
- ❌ **Usuarios sin passwordHash**: PROHIBIDO
- ❌ **Signup sin password**: PROHIBIDO
- ❌ **Auto-login después de signup**: PROHIBIDO
- ❌ **Set-password sin autenticación**: PROHIBIDO (B2-2)
- ❌ **ALLOW_PASSWORD_SETUP flag**: ELIMINADO (B2-2)
- ❌ **Logging sensible**: PROHIBIDO (DATABASE_URL, tokens, cookies, hashes, secretos)
- ❌ **Endpoints inseguros**: PROHIBIDO (set-password/reset-password/invite sin auth/autorización)
- ❌ **Cookies sin firma**: NO PERMITIDO
- ❌ **Prisma en middleware**: NO PERMITIDO (Edge incompatible)
- ❌ **Node crypto en Edge**: NO PERMITIDO

## 📚 Archivos Clave

- `src/lib/jwt.ts`: JWT signing/verification
- `src/lib/auth.ts`: getCurrentUser (valida JWT + BD)
- `src/lib/auth-utils.ts`: Cookie management
- `src/lib/env-validation.ts`: Env var validation (fail-fast)
- `src/middleware.ts`: Edge middleware (JWT only, no BD)
- `src/app/api/auth/login/route.ts`: Login con password
- `src/app/api/auth/signup/route.ts`: Signup deshabilitado (410 Gone)
- `src/app/api/auth/logout/route.ts`: Logout
- `.cursorrules-auth`: Reglas oficiales de autenticación (prioridad máxima)

### Archivos Deprecados (Magic Link)
- `src/__deprecated__/magic-link.ts`: Utilidades de Magic Link (funciones lanzan errores)
- `src/app/api/auth/request-link/route.ts`: Request magic link (retorna 410 Gone)
- `src/app/api/auth/callback/route.ts`: Validate magic link (retorna 410 Gone)
- `src/app/api/auth/forgot/route.ts`: Forgot password (retorna 410 Gone)

### Archivos Clave de Seguridad
- `src/lib/security/password-policy.ts`: Política centralizada de passwords (fuente única de verdad)

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
