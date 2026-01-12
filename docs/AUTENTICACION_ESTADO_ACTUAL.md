# 🔐 Estado Actual del Sistema de Autenticación

## 📋 Resumen

El sistema ahora soporta **DOS métodos de autenticación**:

1. **Magic Link** (PR1) - Sistema principal
2. **Login con Contraseña** - Sistema restaurado para UX tradicional

---

## 🎯 Métodos de Autenticación Disponibles

### 1. Magic Link (PR1) - Sistema Principal

**Endpoint**: `POST /api/auth/request-link`

**Flujo**:
```
Usuario ingresa correo → Sistema genera magic link → Usuario hace click → Sesión JWT
```

**Características**:
- Sin contraseña
- Link temporal (15 minutos)
- Usuario se crea automáticamente al validar link
- Más seguro (no hay contraseñas que comprometer)

### 2. Login con Contraseña - Sistema Restaurado

**Endpoint**: `POST /api/auth/login`

**Flujo**:
```
Usuario ingresa correo + contraseña → Validación → Sesión JWT
```

**Características**:
- Requiere contraseña (passwordHash en BD)
- Usuario debe existir previamente
- Compatible con signup y forgot-password
- UX tradicional

---

## 📁 Páginas de Autenticación

### `/login` - Página de Login

**Diseño Restaurado**:
- ✅ Campo de correo electrónico
- ✅ Campo de contraseña (con botón mostrar/ocultar)
- ✅ Link "¿Olvidaste tu contraseña?" → `/forgot-password`
- ✅ Link "Crear cuenta" → `/signup`
- ✅ Mensaje de éxito si viene de signup
- ✅ Manejo de errores

**Endpoints que usa**:
- `POST /api/auth/login` - Login con contraseña

### `/signup` - Página de Registro

**Diseño**:
- ✅ Campo nombre completo
- ✅ Campo correo electrónico
- ✅ Campo contraseña (con mostrar/ocultar)
- ✅ Campo confirmar contraseña (con mostrar/ocultar)
- ✅ Validaciones (mínimo 6 caracteres, coincidencia)
- ✅ Link "Iniciar sesión" → `/login`

**Endpoints que usa**:
- `POST /api/auth/signup` - Crear cuenta con contraseña

### `/forgot-password` - Recuperación de Contraseña

**Diseño**:
- ✅ Campo correo electrónico
- ✅ Mensaje de éxito (siempre muestra éxito por seguridad)
- ✅ Link "Volver al inicio de sesión" → `/login`

**Endpoints que usa**:
- `POST /api/auth/forgot-password` - Solicitar reset

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

### POST `/api/auth/signup` (Existente)

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

### POST `/api/auth/request-link` (PR1 - Magic Link)

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

### POST `/api/auth/forgot-password` (Existente)

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

---

## 🔄 Flujo de Usuario

### Opción 1: Magic Link (PR1)

1. Usuario va a `/login`
2. Ingresa correo
3. Hace click en "Enviar Link de Acceso" (si se implementa botón alternativo)
4. Recibe magic link por email/consola
5. Hace click en link
6. Redirige a dashboard según rol

### Opción 2: Login con Contraseña (Restaurado)

1. Usuario va a `/login`
2. Ingresa correo y contraseña
3. Hace click en "Iniciar Sesión"
4. Sistema valida credenciales
5. Redirige a dashboard según rol

### Opción 3: Sign Up → Login

1. Usuario va a `/signup`
2. Completa formulario (nombre, correo, contraseña, confirmar)
3. Hace click en "Crear cuenta"
4. Redirige a `/login?registered=true`
5. Login muestra mensaje de éxito
6. Usuario inicia sesión con sus credenciales

### Opción 4: Forgot Password

1. Usuario va a `/forgot-password`
2. Ingresa correo
3. Hace click en "Enviar enlace de recuperación"
4. ⚠️ **TODO**: Recibe email con link de reset
5. ⚠️ **TODO**: Hace click en link → `/reset-password/[token]`
6. ⚠️ **TODO**: Ingresa nueva contraseña
7. Redirige a `/login`

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
- Si `passwordHash` existe → Usuario puede hacer login con contraseña
- Si `passwordHash` es `null` → Usuario debe usar magic link

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
