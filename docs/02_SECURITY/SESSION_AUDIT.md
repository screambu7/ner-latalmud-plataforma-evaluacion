# 🔍 Auditoría de Sesión y Cookies - Diagnóstico

**Fecha**: 2025-01-XX  
**Objetivo**: Identificar y corregir inconsistencias en el flujo de autenticación y sesión

---

## 🩺 DIAGNÓSTICO GENERAL

### Flujo Actual de Autenticación

```
1. Login (POST /api/auth/login)
   ↓
2. setSessionCookie() → Crea JWT y establece cookie httpOnly
   ↓
3. Middleware (Edge Runtime) → Verifica JWT (sin BD)
   ↓
4. Página Server Component → getCurrentUser() → Verifica JWT + BD
   ↓
5. Server Actions → requireRole() → getCurrentUser() → Verifica JWT + BD
```

### Problemas Identificados

#### 🔴 CRÍTICO: Logout Incompleto
- **Ubicación**: `src/app/api/auth/logout/route.ts`
- **Problema**: 
  - `clearSessionCookie()` solo hace `cookieStore.delete('session')`
  - No establece `maxAge=0` explícitamente
  - No redirige al frontend
  - El frontend no tiene forma de llamar al logout
- **Impacto**: Sesiones zombie, cookies viejas persisten

#### 🔴 CRÍTICO: Hard Refresh Sin Datos
- **Ubicación**: Dashboards (admin/evaluador)
- **Problema**:
  - Middleware permite acceso si JWT es válido
  - Pero `getCurrentUser()` puede retornar `null` si:
    - Usuario fue desactivado
    - Rol cambió
    - Error en BD
  - Página se renderiza sin datos (error silencioso)
- **Impacto**: Dashboard vacío después de hard refresh

#### 🟠 MEDIO: Inconsistencia Middleware vs getCurrentUser
- **Ubicación**: `src/middleware.ts` vs `src/lib/auth.ts`
- **Problema**:
  - Middleware solo valida JWT (sin BD)
  - `getCurrentUser()` valida JWT + BD
  - Gap temporal: middleware permite acceso, pero página no tiene datos
- **Impacto**: Experiencia inconsistente

#### 🟡 BAJO: No Hay Botón de Logout
- **Ubicación**: Dashboards
- **Problema**: Usuario no puede cerrar sesión desde la UI
- **Impacto**: UX deficiente

---

## 🔍 HALLAZGOS DETALLADOS

### 1. setSessionCookie ✅
**Archivo**: `src/lib/auth-utils.ts:12-27`

**Estado**: ✅ CORRECTO
- Establece cookie con `httpOnly: true`
- `secure` en producción
- `sameSite: 'lax'`
- `maxAge: 7 días`
- Path: `/`

### 2. getSessionFromCookie ❌
**Archivo**: No existe función con este nombre

**Estado**: ⚠️ NO EXISTE
- Se usa `cookies().get('session')` directamente en:
  - `getCurrentUser()` (línea 26)
  - `middleware.ts` (línea 36)

**Recomendación**: No es necesario crear función separada, el uso directo es correcto.

### 3. getCurrentUser ✅/⚠️
**Archivo**: `src/lib/auth.ts:24-65`

**Estado**: ✅ CORRECTO (lógica) / ⚠️ FALTA PROTECCIÓN
- Verifica JWT correctamente
- Valida estado en BD
- Valida rol en BD
- **PROBLEMA**: No hay garantía de que las páginas usen esto antes de renderizar

**Uso en páginas**:
- ✅ `admin-dashboard/page.tsx`: Usa `getCurrentUser()` y redirige si null
- ✅ `evaluador-dashboard/page.tsx`: Usa `protectPage()` que llama `requireRole()` que llama `getCurrentUser()`

**Problema**: Si `getCurrentUser()` retorna null después de que el middleware permitió acceso, la página puede renderizarse sin datos.

### 4. middleware.ts ⚠️
**Archivo**: `src/middleware.ts:35-94`

**Estado**: ⚠️ LIMITACIÓN POR DISEÑO
- Solo valida JWT (sin BD) - **por diseño** (Edge Runtime)
- Redirige correctamente según rol
- **PROBLEMA**: No puede validar estado del usuario en BD
- **TRADE-OFF ACEPTADO**: Documentado en comentarios

**Protección**:
- Rutas admin: Requiere JWT + rol SUPER_ADMIN
- Rutas evaluador: Requiere JWT + rol EVALUADOR
- Rutas públicas: Permite acceso

### 5. clearSessionCookie ❌
**Archivo**: `src/lib/auth-utils.ts:32-35`

**Estado**: ❌ INCOMPLETO
```typescript
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
```

**Problemas**:
1. Solo hace `delete()`, no establece `maxAge=0`
2. No especifica `path`, `domain`, `sameSite` (debería coincidir con setSessionCookie)

**Corrección necesaria**:
```typescript
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // ← CRÍTICO: Borrar inmediatamente
  });
}
```

### 6. Logout Route ❌
**Archivo**: `src/app/api/auth/logout/route.ts:4-7`

**Estado**: ❌ INCOMPLETO
```typescript
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
```

**Problemas**:
1. No redirige al frontend
2. Frontend no tiene forma de llamarlo (no hay botón)
3. No valida que haya sesión antes de borrar

**Corrección necesaria**:
- Mantener `NextResponse.json({ success: true })` (el frontend manejará redirect)
- O mejor: retornar redirect si se llama desde navegador

---

## 🛠 RECOMENDACIONES ACCIONABLES

### Prioridad ALTA (Crítico)

1. **Corregir `clearSessionCookie()`**
   - Establecer cookie con `maxAge=0`
   - Coincidir opciones con `setSessionCookie()`

2. **Mejorar logout route**
   - Mantener JSON response (para llamadas fetch)
   - Asegurar que borre cookie correctamente

3. **Agregar botón logout**
   - En Header (evaluador)
   - En admin dashboard
   - Client component que llama `/api/auth/logout` y redirige

4. **Blindaje de dashboards**
   - Asegurar que `getCurrentUser()` se llame ANTES de obtener datos
   - Si retorna null → redirect inmediato
   - No renderizar contenido sin sesión válida

### Prioridad MEDIA

5. **Documentar trade-off middleware**
   - Ya está documentado en comentarios
   - Asegurar que todas las páginas usen `protectPage()` o `getCurrentUser()`

---

## ✨ PLAN DE CORRECCIÓN

### Paso 1: Corregir `clearSessionCookie()`
- Establecer cookie con `maxAge=0`
- Coincidir opciones con `setSessionCookie()`

### Paso 2: Mejorar logout route
- Mantener JSON response
- Validar que borre cookie correctamente

### Paso 3: Agregar botón logout
- Crear componente client-side para logout
- Agregar en Header (evaluador)
- Agregar en admin dashboard

### Paso 4: Blindaje de dashboards
- Verificar que todas las páginas usen `protectPage()` o `getCurrentUser()`
- Asegurar redirect si sesión inválida

### Paso 5: Verificación
- Login → dashboard con datos ✅
- Hard reload → dashboard con datos ✅
- Logout → login ✅
- Back button después de logout → NO acceso ✅
- Cookie borrada correctamente ✅

---

## 📋 ARCHIVOS A MODIFICAR

1. `src/lib/auth-utils.ts` - Corregir `clearSessionCookie()`
2. `src/app/api/auth/logout/route.ts` - Mejorar respuesta
3. `src/components/evaluador-dashboard/Header.tsx` - Agregar botón logout
4. `src/app/(admin)/admin-dashboard/page.tsx` - Agregar botón logout
5. Verificar uso de `getCurrentUser()` en todas las páginas protegidas

---

**Última actualización**: 2025-01-XX
