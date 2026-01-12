# PR1: Autenticación con Magic Link + Sesión JWT

Este documento describe la implementación de PR1: Autenticación real con Magic Link y sesión segura con JWT.

## 📋 Resumen

PR1 reemplaza el sistema de autenticación anterior (email-only con auto-creación sin verificación) por un sistema seguro basado en:

1. **Magic Links**: Links temporales enviados por email (o logueados en consola durante desarrollo)
2. **JWT firmado**: Tokens JWT en cookies httpOnly para sesiones
3. **Verificación de email**: Usuario solo se crea cuando se valida el magic link

## 🔐 Cambios Implementados

### 1. Modelo de Datos

**Nuevo modelo `LoginToken`** en Prisma:
- `email`: Email del usuario
- `tokenHash`: Hash SHA-256 del token (no se guarda el token en claro)
- `expiresAt`: Fecha de expiración (15 minutos por defecto)
- `usedAt`: Fecha de uso (null si no ha sido usado)
- `ip`, `userAgent`: Metadatos para auditoría

**Migración**: `add_login_tokens_magic_link`

### 2. Endpoints de Autenticación

#### POST `/api/auth/request-link`
- **Input**: `{ correo: string }`
- **Comportamiento**:
  - Valida y normaliza email
  - Genera token aleatorio seguro
  - Guarda hash del token en BD
  - Construye magic link
  - En desarrollo: loguea link completo en consola
  - En staging/production: loguea link pero redactando email
  - Siempre retorna éxito (evita enumeración de usuarios)

#### GET `/api/auth/callback?token=...`
- **Comportamiento**:
  - Valida token (hash, expiración, uso único)
  - Marca token como usado
  - Upsert usuario:
    - Si existe: actualiza estado a ACTIVO
    - Si no existe: crea con rol según `SUPER_ADMIN_EMAILS`
  - Crea JWT session cookie
  - Redirige según rol

#### POST `/api/auth` (DEPRECADO)
- Retorna 410 Gone
- Redirige al nuevo flujo

#### POST `/api/auth/forgot`
- Se comporta igual que `request-link`
- No revela si el usuario existe

#### POST `/api/auth/logout`
- Borra cookie `session`

### 3. Sesión JWT

**Cookie**: `session` (httpOnly, secure en prod, sameSite=lax)

**Payload JWT**:
```typescript
{
  sub: number,        // userId
  rol: Rol,          // SUPER_ADMIN | EVALUADOR
  escuelaId?: number, // Opcional
  iat: number,        // Issued at
  exp: number         // Expiration
}
```

**Expiración**: 7 días

### 4. Middleware

- **Edge Runtime**: Compatible con Edge
- **Sin Prisma**: Solo valida JWT, no toca BD
- **Protección por rol**: Redirige según rol del JWT
- **Rutas públicas**: `/login`, `/api/auth/callback`

### 5. Librerías

#### `src/lib/jwt.ts`
- `signSessionJWT(userId, rol, escuelaId?)`: Genera JWT firmado
- `verifySessionJWT(token)`: Verifica y decodifica JWT

#### `src/lib/magic-link.ts`
- `generateToken()`: Genera token aleatorio base64url
- `hashToken(token)`: Hashea token con SHA-256
- `buildMagicLink(token)`: Construye URL completa
- `redactEmail(email)`: Redacta email para logs (PII protection)

## 🧪 Cómo Probar

### Desarrollo Local

1. **Configurar variables de entorno**:
   ```bash
   JWT_SECRET="tu-secreto-aleatorio-de-al-menos-32-caracteres"
   MAGIC_LINK_TTL_MINUTES=15
   ```

2. **Ejecutar migración**:
   ```bash
   npm run db:migrate
   ```

3. **Iniciar servidor**:
   ```bash
   npm run dev
   ```

4. **Probar flujo**:
   - Ir a `/login`
   - Ingresar email
   - Revisar consola del servidor para ver el magic link
   - Abrir el link en el navegador
   - Debería redirigir al dashboard según rol

### Verificar Cookies

En DevTools → Application → Cookies:
- Debe existir cookie `session` (httpOnly)
- No debe existir cookie `user_id`

### Verificar JWT

El JWT puede decodificarse en [jwt.io](https://jwt.io) (solo para debugging, no en producción):
- Payload debe contener `sub`, `rol`, `iat`, `exp`
- Opcionalmente `escuelaId`

## 📝 Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/request-link` | POST | Solicita magic link |
| `/api/auth/callback` | GET | Valida magic link y crea sesión |
| `/api/auth/logout` | POST | Cierra sesión |
| `/api/auth/forgot` | POST | Solicita magic link (mismo que request-link) |
| `/api/auth` | POST | Deprecado (410 Gone) |

## ⚠️ Riesgos Pendientes

### Rate Limiting
**Estado**: TODO explícito, no implementado

**Riesgo**: Sin rate limiting, un atacante puede:
- Generar muchos tokens para un email
- Llenar la BD con tokens
- Hacer DDoS en el endpoint

**Recomendación**: Implementar rate limiting por IP y por email:
```typescript
// TODO: Implementar rate limiting
// - Máximo 3 requests por email cada 15 minutos
// - Máximo 10 requests por IP cada 15 minutos
```

### Email Provider Real
**Estado**: TODO explícito, no implementado

**Riesgo**: En producción, los links solo se loguean. No se envían emails reales.

**Recomendación**: Integrar con servicio de email (SendGrid, Resend, etc.):
```typescript
// TODO: Enviar email real
// await sendMagicLinkEmail(email, magicLink);
```

### Limpieza de Tokens Expirados
**Estado**: No implementado

**Riesgo**: Tokens expirados se acumulan en BD.

**Recomendación**: Implementar job periódico para limpiar tokens expirados:
```typescript
// TODO: Implementar limpieza periódica
// DELETE FROM LoginToken WHERE expiresAt < NOW() AND usedAt IS NULL
```

## 🔒 Seguridad

### ✅ Implementado
- Tokens hasheados en BD (no se guardan en claro)
- Tokens de un solo uso (marcados con `usedAt`)
- Tokens expiran (15 minutos por defecto)
- JWT firmado con secreto
- Cookies httpOnly y secure en producción
- No se revela si el usuario existe (evita enumeración)
- Emails redactados en logs de producción

### ⚠️ Pendiente
- Rate limiting (ver arriba)
- Email provider real (ver arriba)
- Limpieza de tokens expirados (ver arriba)

## 📦 Variables de Entorno

```bash
# REQUERIDO en staging/production
JWT_SECRET="tu-secreto-aleatorio-de-al-menos-32-caracteres"

# Opcional (default: 15)
MAGIC_LINK_TTL_MINUTES=15

# Requerido para construir magic links
APP_BASE_URL="http://localhost:3000"  # o URL de producción
```

## 🚀 Deploy Checklist

- [ ] Configurar `JWT_SECRET` en Vercel
- [ ] Configurar `APP_BASE_URL` en Vercel
- [ ] Ejecutar migración en producción: `npm run db:migrate:deploy`
- [ ] Verificar que no existe cookie `user_id` en producción
- [ ] Verificar que cookie `session` se crea correctamente
- [ ] Probar flujo completo de login
- [ ] Configurar email provider (cuando esté listo)
- [ ] Implementar rate limiting (cuando esté listo)

## 📚 Referencias

- [JWT.io](https://jwt.io) - Decodificar JWT (solo desarrollo)
- [jose library](https://github.com/panva/jose) - Librería JWT usada
- [Magic Link Best Practices](https://www.ory.sh/magic-link-best-practices/)
