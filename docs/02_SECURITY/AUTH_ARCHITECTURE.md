# 🔐 Sistema de Autenticación - Ner LaTalmud

> **⚠️ ACTUALIZADO**: Este documento describe el sistema de autenticación actual.
> **REFERENCIA PRINCIPAL:** Ver `.cursorrules-auth` para reglas completas y actualizadas.

## 📋 Resumen

Sistema de autenticación con **Password Auth** (único método activo) y sesión JWT. Implementado con Next.js App Router, Prisma y cookies JWT httpOnly.

**Estado:**
- ✅ Password Auth: ACTIVO (único método permitido)
- ❌ Magic Link: CONGELADO (no usar, ampliar ni reactivar)

---

## 🏗️ Arquitectura del Sistema

### Flujo General (Password Auth - ÚNICO MÉTODO ACTIVO)

```
Usuario → Login (correo + password) → Validación bcrypt → JWT Cookie → Middleware → Páginas Protegidas
```

### Flujo de Signup

```
Usuario → Signup (nombre + correo + password) → Hash bcrypt → Usuario con passwordHash → Estado ACTIVO
```

### Componentes Principales

1. **Páginas de Autenticación** (`src/app/(auth)/`)
   - `/login` - Inicio de sesión
   - `/signup` - Registro de usuarios
   - `/forgot-password` - Recuperación de contraseña

2. **API Routes** (`src/app/api/auth/`)
   - `POST /api/auth/login` - Login con password (ACTIVO)
   - `POST /api/auth/signup` - Registro con password (ACTIVO)
   - `POST /api/auth/logout` - Cerrar sesión (ACTIVO)
   - `POST /api/auth/forgot-password` - Solicitar reset de password (ACTIVO)
   - `POST /api/auth/request-link` - **CONGELADO** (Magic Link, código comentado)
   - `GET /api/auth/callback` - **CONGELADO** (Magic Link, código comentado)
   - `POST /api/auth/forgot` - **CONGELADO** (Magic Link, código comentado)
   - `POST /api/auth` - **DEPRECADO** (410 Gone)

3. **Middleware** (`src/middleware.ts`)
   - Protección de rutas
   - Redirección según rol
   - Validación de sesión

4. **Utilidades de Auth** (`src/lib/auth.ts`, `src/lib/auth-utils.ts`, `src/lib/jwt.ts`)
   - `getCurrentUser()` - Obtener usuario actual (valida JWT y BD)
   - `requireRole()` - Validar rol específico
   - `signSessionJWT()` - Generar JWT firmado (PR1)
   - `verifySessionJWT()` - Verificar JWT (PR1)
   - `setSessionCookie()` - Establecer cookie JWT (PR1)

---

## 📁 Estructura de Archivos

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Página de login
│   │   ├── signup/
│   │   │   └── page.tsx               # Página de registro
│   │   └── forgot-password/
│   │       └── page.tsx               # Página de recuperación
│   ├── api/
│   │   └── auth/
│   │       ├── route.ts               # POST /api/auth (login)
│   │       ├── signup/
│   │       │   └── route.ts           # POST /api/auth/signup
│   │       └── forgot-password/
│   │           └── route.ts           # POST /api/auth/forgot-password
│   └── page.tsx                        # Redirige a /login
├── lib/
│   ├── auth.ts                        # Funciones de autenticación
│   ├── auth-utils.ts                  # Utilidades de cookies
│   └── page-protection.ts             # Protección de páginas
└── middleware.ts                      # Middleware de Next.js
```

---

## 🔑 Base de Datos

### Schema de Usuario

```prisma
model Usuario {
  id            Int          @id @default(autoincrement())
  nombre        String
  correo        String       @unique
  passwordHash  String?      // Hash de contraseña (opcional para migración)
  celular       String?
  rol           Rol
  estado        EstadoCuenta
  escuelaId     Int?
  // ... otros campos
}
```

### Migración Requerida

```bash
# Generar migración para agregar passwordHash
npm run db:migrate

# O crear manualmente:
# npx prisma migrate dev --name add_password_hash
```

---

## 🔐 Flujo de Autenticación

### 1. Login

**Frontend** (`src/app/(auth)/login/page.tsx`):
```tsx
// Usuario ingresa correo y contraseña
const response = await fetch('/api/auth', {
  method: 'POST',
  body: JSON.stringify({ correo, password }),
});
```

**Backend** (`src/app/api/auth/request-link/route.ts`):
1. Valida correo
2. Genera token aleatorio seguro
3. Guarda hash del token en BD (LoginToken)
4. Construye magic link
5. En desarrollo: loguea link en consola
6. En producción: TODO - enviar email real
7. Retorna éxito (evita enumeración de usuarios)

**Callback** (`src/app/api/auth/callback/route.ts`):
1. Valida token del magic link (hash, expiración, uso único)
2. Marca token como usado
3. Upsert usuario (crea si no existe, actualiza si existe)
4. Asigna rol según SUPER_ADMIN_EMAILS
5. Establece cookie de sesión JWT (`session`)
6. Redirige según rol

**Redirección**:
- `SUPER_ADMIN` → `/admin-dashboard`
- `EVALUADOR` → `/evaluador-dashboard`

### 2. Sign Up

**Frontend** (`src/app/(auth)/signup/page.tsx`):
```tsx
// Usuario ingresa nombre, correo y contraseña
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ nombre, correo, password }),
});
```

**Backend** (`src/app/api/auth/signup/route.ts`):
1. Valida datos (nombre, correo, contraseña mínima 6 caracteres)
2. Verifica que el correo no exista
3. Hash de contraseña con bcrypt
4. Determina rol (SUPER_ADMIN si está en config, sino EVALUADOR)
5. Crea usuario en BD
6. Retorna éxito

### 3. Forgot Password

**Frontend** (`src/app/(auth)/forgot-password/page.tsx`):
```tsx
// Usuario ingresa correo
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ correo }),
});
```

**Backend** (`src/app/api/auth/forgot-password/route.ts`):
1. Valida correo
2. Busca usuario
3. ⚠️ **TODO**: Generar token de reset y enviar email
4. Retorna éxito (por seguridad, siempre retorna éxito)

---

## 🛡️ Protección de Rutas

### Middleware (`src/middleware.ts`)

Protege rutas automáticamente:

```typescript
// Rutas de admin
/admin-dashboard
/alumnos/*
/evaluaciones/*
/reportes/*
/usuarios/*
/configuracion/*

// Rutas de evaluador
/evaluador-dashboard
/mis-alumnos/*
/evaluar/*
```

**Comportamiento**:
- Si no hay cookie `session` (JWT) → Redirige a `/login`
- Si el JWT es inválido o expirado → Redirige a `/login`
- Si el rol del JWT no coincide → Redirige a `/login`
- ⚠️ Nota: El middleware valida el rol del JWT, pero no consulta la BD.
  Si un usuario es degradado, el JWT seguirá siendo válido hasta que expire (7 días).
  La validación completa del estado se hace en `getCurrentUser()` en las rutas API.

### Protección en Páginas (`src/lib/page-protection.ts`)

**Nota**: Las páginas usan `getCurrentUser()` que valida el JWT y consulta la BD para verificar el estado actual del usuario. Esto asegura que cambios de rol o estado se reflejen inmediatamente, a diferencia del middleware que solo valida el JWT.

```typescript
import { protectPage } from '@/lib/page-protection';
import { Rol } from '@prisma/client';

export default async function MiPage() {
  await protectPage(Rol.EVALUADOR);
  // ... resto del código
}
```

---

## 🔧 Configuración Requerida

### 1. Instalar bcryptjs

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2. Actualizar APIs

Descomentar las importaciones y código de hash en:
- `src/app/api/auth/route.ts`
- `src/app/api/auth/signup/route.ts`

**Ejemplo**:
```typescript
import bcrypt from 'bcryptjs';

// En signup:
const passwordHash = await bcrypt.hash(password, 10);

// En login:
const isValidPassword = await bcrypt.compare(password, usuario.passwordHash);
```

### 3. Migración de Base de Datos

```bash
# Generar migración
npm run db:migrate

# O manualmente:
npx prisma migrate dev --name add_password_hash
```

### 4. Configurar Envío de Emails (Forgot Password)

**Opción 1: Resend (Recomendado)**
```bash
npm install resend
```

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@nerlatalmud.com',
  to: correo,
  subject: 'Recuperar contraseña',
  html: `<a href="${resetUrl}">Restablecer contraseña</a>`,
});
```

**Opción 2: Nodemailer**
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

## 📝 Endpoints de API

### POST `/api/auth`

**Request**:
```json
{
  "correo": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "usuario": {
    "id": 1,
    "nombre": "Usuario",
    "correo": "usuario@ejemplo.com",
    "rol": "EVALUADOR"
  },
  "redirectUrl": "/evaluador-dashboard"
}
```

**Errores**:
- `400`: Correo/contraseña faltantes o inválidos
- `401`: Credenciales incorrectas
- `403`: Cuenta inactiva
- `500`: Error del servidor

### POST `/api/auth/signup`

**Request**:
```json
{
  "nombre": "Usuario Nuevo",
  "correo": "nuevo@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Cuenta creada exitosamente"
}
```

**Errores**:
- `400`: Datos inválidos o faltantes
- `409`: Usuario ya existe
- `500`: Error del servidor

### POST `/api/auth/forgot-password`

**Request**:
```json
{
  "correo": "usuario@ejemplo.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Si el correo está registrado, recibirás instrucciones..."
}
```

**Nota**: Siempre retorna éxito por seguridad (no revela si el email existe).

---

## 🔄 Migración de Usuarios Existentes

### Usuarios sin passwordHash

Los usuarios existentes que no tienen `passwordHash` pueden:
1. Hacer login sin contraseña (temporal, solo para migración)
2. ⚠️ **TODO**: Forzar cambio de contraseña en primer login

### Script de Migración (Opcional)

```typescript
// scripts/migrate-passwords.ts
import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function migratePasswords() {
  const usuarios = await db.usuario.findMany({
    where: { passwordHash: null },
  });

  for (const usuario of usuarios) {
    // Generar contraseña temporal o usar email como contraseña inicial
    const tempPassword = usuario.correo; // O generar aleatoria
    const hash = await bcrypt.hash(tempPassword, 10);
    
    await db.usuario.update({
      where: { id: usuario.id },
      data: { passwordHash: hash },
    });
  }
}
```

---

## 🚨 Seguridad

### ✅ Implementado

- Validación de correo y contraseña
- Hash de contraseñas (requiere bcryptjs)
- Cookies de sesión
- Protección de rutas con middleware
- Validación de roles

### ⚠️ Pendiente de Implementar

1. **Hash de Contraseñas**
   - Instalar `bcryptjs`
   - Descomentar código de hash en APIs

2. **Envío de Emails**
   - Configurar servicio de email (Resend/SendGrid)
   - Implementar generación de tokens de reset
   - Crear endpoint `/api/auth/reset-password`

3. **Tokens de Reset**
   - Crear modelo `PasswordResetToken` en Prisma
   - Generar tokens con expiración (1 hora)
   - Validar tokens en endpoint de reset

4. **Rate Limiting**
   - Limitar intentos de login fallidos
   - Limitar solicitudes de forgot-password

5. **2FA (Opcional)**
   - Autenticación de dos factores
   - Códigos SMS o TOTP

---

## 📚 Uso en Componentes

### Obtener Usuario Actual

```typescript
import { getCurrentUser } from '@/lib/auth';

export default async function MiPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <div>Hola {user.nombre}</div>;
}
```

### Requerir Rol Específico

```typescript
import { requireRole } from '@/lib/auth';
import { Rol } from '@prisma/client';

export default async function AdminPage() {
  const user = await requireRole(Rol.SUPER_ADMIN);
  // Si no tiene el rol, lanza error automáticamente
  
  return <div>Panel de Admin</div>;
}
```

### Protección de Página

```typescript
import { protectPage } from '@/lib/page-protection';
import { Rol } from '@prisma/client';

export default async function EvaluadorPage() {
  await protectPage(Rol.EVALUADOR);
  // Redirige automáticamente si no está autenticado o no tiene el rol
  
  return <div>Dashboard Evaluador</div>;
}
```

---

## 🔗 Enlaces entre Páginas

### Desde Login
- "¿Olvidaste tu contraseña?" → `/forgot-password`
- "Crear cuenta" → `/signup`

### Desde Signup
- "Iniciar sesión" → `/login`

### Desde Forgot Password
- "Volver al inicio de sesión" → `/login`

---

## 📋 Checklist de Implementación

### Fase 1: Básico ✅
- [x] Schema actualizado con `passwordHash`
- [x] Página de login con contraseña
- [x] Página de signup
- [x] Página de forgot password
- [x] APIs creadas (estructura básica)

### Fase 2: Seguridad ⏳
- [ ] Instalar bcryptjs
- [ ] Implementar hash en signup
- [ ] Implementar verificación en login
- [ ] Migrar usuarios existentes

### Fase 3: Recuperación ⏳
- [ ] Configurar servicio de email
- [ ] Crear modelo `PasswordResetToken`
- [ ] Implementar generación de tokens
- [ ] Crear endpoint `/api/auth/reset-password`
- [ ] Crear página `/reset-password/[token]`

### Fase 4: Mejoras ⏳
- [ ] Rate limiting
- [ ] Logs de seguridad
- [ ] Forzar cambio de contraseña en primer login
- [ ] 2FA (opcional)

---

## 🎯 Próximos Pasos

1. **Instalar bcryptjs**:
   ```bash
   npm install bcryptjs @types/bcryptjs
   ```

2. **Descomentar código de hash** en:
   - `src/app/api/auth/route.ts`
   - `src/app/api/auth/signup/route.ts`

3. **Ejecutar migración**:
   ```bash
   npm run db:migrate
   ```

4. **Configurar email** para forgot-password

5. **Probar flujo completo**:
   - Signup → Login → Dashboard
   - Forgot Password → Reset

---

**Última actualización**: 2024-03-15  
**Estado**: ✅ Estructura completa, ⏳ Requiere bcryptjs y email service
