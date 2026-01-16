# 🔐 Flujo de Autenticación - Ner LaTalmud

> **⚠️ REFERENCIA PRINCIPAL:** Ver `.cursorrules-auth` para reglas completas y actualizadas.

## 📋 Resumen

El sistema utiliza **Password Auth** como único método de autenticación activo.

**⚠️ IMPORTANTE**: 
- ❌ **Magic Link**: ELIMINADO - Código movido a `__deprecated__`, funciones lanzan errores
- ❌ **Signup público**: NO EXISTE - Sistema es admin-provisioned únicamente
- ❌ **Recovery por email**: NO EXISTE - Usuarios deben contactar al administrador
- ✅ **Password obligatorio**: Todo usuario DEBE tener passwordHash desde su creación

---

## 🎯 Método de Autenticación Activo

### Password Auth (Único método activo)

**Endpoint**: `POST /api/auth/login`

**Flujo**:
```
Usuario ingresa correo + contraseña → Validación → Sesión JWT
```

**Características**:
- Requiere contraseña (passwordHash en BD)
- Usuario debe existir previamente (creado por SUPER_ADMIN)
- Sistema admin-provisioned (no existe signup público)
- No existe recovery por email
- UX tradicional
- Sesiones JWT firmadas (httpOnly cookies)
- Expiración: 7 días

### ❌ Métodos Eliminados

**Magic Link**: ❌ **ELIMINADO** - No usar, ampliar ni reactivar
- Código movido a `src/__deprecated__/magic-link.ts`
- Funciones lanzan errores explícitos si se intentan usar
- Endpoint `/api/auth/request-link` retorna 410 Gone
- Endpoint `/api/auth/callback` retorna 410 Gone
- Endpoint `/api/auth/forgot` retorna 410 Gone
- Cualquier reactivación requiere aprobación explícita (CTO/Owner)

**Signup Público**: ❌ **NO EXISTE**
- Endpoint `/api/auth/signup` retorna 410 Gone
- Sistema es admin-provisioned únicamente
- Usuarios creados por SUPER_ADMIN con password obligatorio

**Recovery por Email**: ❌ **NO EXISTE**
- Endpoint `/api/auth/forgot-password` retorna 410 Gone
- Usuarios deben contactar al administrador

---

## 📁 Páginas de Autenticación

### `/login` - Página de Login

**Diseño**:
- ✅ Campo de correo electrónico
- ✅ Campo de contraseña (con botón mostrar/ocultar)
- ✅ Mensaje: "El acceso es proporcionado por el administrador"
- ✅ Manejo de errores
- ❌ NO incluye links a signup o forgot-password (no existen)

**Endpoints que usa**:
- `POST /api/auth/login` - Login con contraseña

### `/signup` - Página de Registro

**Estado**: ❌ **NO EXISTE**
- Endpoint `/api/auth/signup` retorna 410 Gone
- Sistema es admin-provisioned únicamente
- Usuarios creados por SUPER_ADMIN

### `/forgot-password` - Recuperación de Contraseña

**Estado**: ❌ **NO EXISTE** (endpoint deshabilitado)
- Endpoint `/api/auth/forgot-password` retorna 410 Gone
- Usuarios deben contactar al administrador
- Página muestra mensaje informativo

---

## 🔌 Endpoints de API

### POST `/api/auth/login` (NUEVO - Restaurado)

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
- `401`: Credenciales incorrectas o usuario sin contraseña
- `403`: Cuenta inactiva
- `500`: Error del servidor

### POST `/api/auth/signup` (Deshabilitado)

**Estado**: ❌ **NO EXISTE** - Retorna 410 Gone

**Response (410)**:
```json
{
  "error": "Registro público deshabilitado. Contacta al administrador."
}
```

### POST `/api/auth/request-link` (Eliminado - Magic Link)

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
  "message": "Link enviado (o logueado en consola en dev)"
}
```

### POST `/api/auth/forgot-password` (Deshabilitado)

**Estado**: ❌ **NO EXISTE** - Retorna 410 Gone

**Response (410)**:
```json
{
  "error": "Recuperación de contraseña deshabilitada. Contacta al administrador."
}
```

---

## 🔄 Flujo de Usuario

### Login con Contraseña (Único método activo)

1. Usuario va a `/login`
2. Ingresa correo y contraseña
3. Hace click en "Iniciar Sesión"
4. Sistema valida credenciales
5. Redirige a dashboard según rol

### Provisioning de Usuarios (Admin)

1. SUPER_ADMIN crea usuario desde `/admin-dashboard/usuarios`
2. Ingresa: nombre, correo, password (obligatorio), rol, escuela (opcional)
3. Sistema valida password usando `password-policy.ts`:
   - ≥8 caracteres
   - Al menos 1 letra
   - Al menos 1 número
4. Sistema hashea password con bcrypt
5. Sistema crea usuario con passwordHash y estado = ACTIVO
6. Usuario puede iniciar sesión con sus credenciales

**INVARIANTE**: Todo usuario DEBE tener passwordHash desde su creación.

---

## 🗄️ Base de Datos

### Campo `passwordHash`

```prisma
model Usuario {
  passwordHash  String?  // Hash de contraseña (opcional)
  // ...
}
```

**Comportamiento**:
- `passwordHash` es OBLIGATORIO (no puede ser null)
- Todo usuario DEBE tener passwordHash desde su creación
- No existe flujo alterno (magic link eliminado)

**Migración**:
- Campo ya existe en schema
- Ejecutar: `npm run db:migrate` si no se ha hecho

---

## ⚠️ Pendiente de Implementar

### 1. Hash de Contraseñas (CRÍTICO)

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

Luego descomentar en:
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/signup/route.ts`

### 2. Reset de Contraseña

**Falta**:
- Endpoint `/api/auth/reset-password`
- Página `/reset-password/[token]`
- Generación de tokens de reset
- Envío de emails

### 3. Opción Dual en Login

Actualmente el login solo tiene contraseña. Se podría agregar:
- Toggle entre "Login con contraseña" y "Login con magic link"
- O mantener ambos métodos disponibles

---

## 🎨 Diseño Visual

### Login (`/login`)

✅ **Restaurado**:
- Fondo decorativo (blur circles)
- Card blanco centrado
- Logo/icono de libro
- Título "Ner LaTalmud"
- Subtítulo descriptivo
- Campo correo
- Campo contraseña (con botón mostrar/ocultar)
- Botón "Iniciar Sesión" (primary)
- Link "¿Olvidaste tu contraseña?"
- Link "Crear cuenta"
- Footer informativo
- Mensajes de éxito/error estilizados

### Signup (`/signup`)

✅ **Completo**:
- Mismo diseño visual que login
- Formulario con 4 campos
- Validaciones visuales
- Link a login

### Forgot Password (`/forgot-password`)

✅ **Completo**:
- Mismo diseño visual que login
- Campo de correo
- Mensaje de éxito
- Link a login

---

## 🔗 Navegación entre Páginas

```
/login
  ├─ "¿Olvidaste tu contraseña?" → /forgot-password
  └─ "Crear cuenta" → /signup

/signup
  └─ "Iniciar sesión" → /login?registered=true

/forgot-password
  └─ "Volver al inicio de sesión" → /login
```

---

## ✅ Estado de Implementación

### Completado ✅
- [x] Login con contraseña (diseño restaurado)
- [x] Signup completo
- [x] Forgot password completo
- [x] Endpoint `/api/auth/login`
- [x] Endpoint `/api/auth/signup`
- [x] Endpoint `/api/auth/forgot-password`
- [x] Integración con JWT (setSessionCookie)
- [x] Navegación entre páginas
- [x] Mensajes de éxito/error

### Pendiente ⏳
- [ ] Instalar bcryptjs
- [ ] Implementar hash en login/signup
- [ ] Reset de contraseña (endpoint + página)
- [ ] Envío de emails (forgot-password y reset)
- [ ] Opción dual en login (magic link + contraseña)

---

## 🚀 Próximos Pasos

1. **Instalar bcryptjs**:
   ```bash
   npm install bcryptjs @types/bcryptjs
   ```

2. **Descomentar código de hash** en:
   - `src/app/api/auth/login/route.ts`
   - `src/app/api/auth/signup/route.ts`

3. **Implementar reset de contraseña**:
   - Crear modelo `PasswordResetToken` en Prisma
   - Crear endpoint `/api/auth/reset-password`
   - Crear página `/reset-password/[token]`

4. **Configurar envío de emails**:
   - Resend o SendGrid
   - Templates de email
   - Variables de entorno

---

**Última actualización**: 2024-03-15  
**Estado**: ✅ Diseño restaurado, ⏳ Requiere bcryptjs para producción
