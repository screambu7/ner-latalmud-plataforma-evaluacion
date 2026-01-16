# D3 — SUPER_ADMIN "Modo Dios" — Documentación

## 🎯 Objetivo

Permitir que SUPER_ADMIN pueda probar, auditar y validar el sistema desde dentro, sin hacks, sin datos falsos y sin tocar UI base.

## ✅ Estado Actual

- ✅ **UI**: Homologada y congelada
- ✅ **Design System**: Gobierna
- ✅ **Auth**: Sellado
- ✅ **CI**: Estricto
- ✅ **SUPER_ADMIN**: Puede entrar y probar todo cómodamente

---

## 📋 D3.1 — Auditoría de Accesos Reales

### Rutas Verificadas y Ajustadas

SUPER_ADMIN puede acceder a:

- ✅ `/alumnos` - Lista de alumnos
- ✅ `/alumnos/[id]` - Detalle de alumno
- ✅ `/alumnos/nuevo` - Crear nuevo alumno
- ✅ `/evaluar/[id]` - Evaluar cualquier alumno (aunque no sea su alumno)
- ✅ `/perfil-diagnostico/[id]` - Ver perfil de diagnóstico de cualquier alumno
- ✅ `/reporte-progreso/[id]` - Generar reporte de progreso de cualquier alumno
- ✅ `/evaluador-dashboard` - Dashboard del evaluador (sin filtros de escuela)
- ✅ `/admin-dashboard` - Dashboard administrativo (sin filtros)

### Cambios Implementados

1. **Middleware** (`src/middleware.ts`):
   - Ajustado para permitir SUPER_ADMIN en rutas de evaluador
   - Agregadas rutas `/perfil-diagnostico` y `/reporte-progreso` al matcher

2. **Protección de Páginas**:
   - `evaluador-dashboard`: Usa `protectPageWithAnyRole([Rol.EVALUADOR, Rol.SUPER_ADMIN])`
   - `mis-alumnos`: Usa `protectPageWithAnyRole([Rol.EVALUADOR, Rol.SUPER_ADMIN])`
   - `perfil-diagnostico/[id]`: Ya permitía SUPER_ADMIN
   - `reporte-progreso/[id]`: Ya permitía SUPER_ADMIN

3. **Server Actions**:
   - Todas las acciones de evaluador ya permiten SUPER_ADMIN con acceso total (sin filtros de escuela)

---

## 🛠 D3.2 — Modo Diagnóstico (solo SUPER_ADMIN)

### Helpers Internos Implementados

#### Componente: `SuperAdminHelpers`

**Ubicación**: `src/components/admin/SuperAdminHelpers.tsx`

**Características**:
- Badge discreto: "Modo Administrador" (solo visible para SUPER_ADMIN)
- Selector rápido de alumno (dropdown con todos los alumnos)
- Links rápidos:
  - "Ver Perfil" → `/perfil-diagnostico/[id]`
  - "Evaluar" → `/evaluar/[id]`
  - "Reporte" → `/reporte-progreso/[id]`

**Reglas**:
- Solo se renderiza si `userRol === Rol.SUPER_ADMIN`
- Sin cambiar layout base
- Sin nuevos colores (usa design tokens existentes)
- Sin tocar evaluador UX

#### Endpoint API: `/api/auth/me`

**Ubicación**: `src/app/api/auth/me/route.ts`

**Propósito**: Obtener información del usuario actual (útil para componentes client-side)

**Respuesta**:
```json
{
  "id": 1,
  "nombre": "Admin",
  "rol": "SUPER_ADMIN"
}
```

### Páginas con Helpers

1. **`/evaluador-dashboard`**:
   - Badge: ✅
   - Selector: ✅
   - Links rápidos: ❌ (no aplica en dashboard)

2. **`/evaluar/[id]`**:
   - Badge: ✅ (vía SuperAdminHelpersWrapper)
   - Selector: ✅
   - Links rápidos: ✅

3. **`/perfil-diagnostico/[id]`**:
   - Badge: ✅
   - Selector: ✅
   - Links rápidos: ✅

4. **`/reporte-progreso/[id]`**:
   - Badge: ✅
   - Selector: ✅
   - Links rápidos: ✅

---

## 🧪 D3.3 — Flujo End-to-End Real

### Checklist de Pruebas para SUPER_ADMIN

#### 1. Crear Alumno
- [ ] Ir a `/alumnos/nuevo`
- [ ] Completar formulario (nombre, tipo, escuela opcional)
- [ ] Verificar que se crea correctamente
- [ ] Verificar que aparece en `/alumnos`

#### 2. Entrar a Evaluar
- [ ] Ir a `/evaluar/[id]` (usando ID del alumno creado)
- [ ] Verificar que se carga correctamente
- [ ] Verificar que aparecen los helpers de SUPER_ADMIN (badge, selector, links)
- [ ] Completar evaluación (lectura, lógica, traducción)
- [ ] Guardar evaluación

#### 3. Ver Perfil Diagnóstico
- [ ] Después de guardar evaluación, redirige a `/perfil-diagnostico/[id]`
- [ ] Verificar que se muestra el perfil completo
- [ ] Verificar que aparecen los helpers de SUPER_ADMIN
- [ ] Verificar que el radar chart se renderiza correctamente

#### 4. Generar Reporte
- [ ] Ir a `/reporte-progreso/[id]`
- [ ] Verificar que se genera el reporte
- [ ] Verificar que aparecen los helpers de SUPER_ADMIN
- [ ] Verificar que el botón de descargar PDF aparece

#### 5. Descargar PDF
- [ ] Hacer clic en "Descargar PDF"
- [ ] Verificar que se descarga el PDF correctamente
- [ ] Verificar que el PDF contiene la información correcta

#### 6. Ver Impacto en Dashboards

**Admin Dashboard** (`/admin-dashboard`):
- [ ] Verificar que el alumno aparece en "Total Alumnos"
- [ ] Verificar que la evaluación aparece en "Total Evaluaciones"
- [ ] Verificar que la evaluación aparece en "Evaluaciones Recientes"
- [ ] Verificar que no hay filtros por escuela (ve todo)

**Evaluador Dashboard** (`/evaluador-dashboard`):
- [ ] Verificar que aparece el badge "Modo Administrador"
- [ ] Verificar que el selector de alumnos muestra todos los alumnos
- [ ] Verificar que las estadísticas se calculan correctamente
- [ ] Verificar que no hay filtros por escuela (ve todo)

### Bugs Conocidos a Verificar

1. **Scoping de Datos**:
   - SUPER_ADMIN debe ver TODOS los datos sin filtros
   - Verificar que las queries no aplican `escuelaId` para SUPER_ADMIN

2. **Permisos de Evaluación**:
   - SUPER_ADMIN puede evaluar cualquier alumno
   - Verificar que no hay restricciones de "solo mis alumnos"

3. **Generación de Reportes**:
   - SUPER_ADMIN puede generar reportes para cualquier alumno
   - Verificar que no hay restricciones de propiedad

4. **Descarga de PDFs**:
   - SUPER_ADMIN puede descargar cualquier PDF
   - Verificar que no hay restricciones de propiedad

---

## 📝 Notas de Implementación

### Archivos Modificados

1. **Middleware**:
   - `src/middleware.ts` - Ajustado para permitir SUPER_ADMIN en rutas de evaluador

2. **Protección de Páginas**:
   - `src/app/(evaluador)/evaluador-dashboard/page.tsx`
   - `src/app/(evaluador)/mis-alumnos/page.tsx`

3. **Componentes**:
   - `src/components/admin/SuperAdminHelpers.tsx` - Componente principal
   - `src/components/admin/SuperAdminHelpersWrapper.tsx` - Wrapper para client-side

4. **API**:
   - `src/app/api/auth/me/route.ts` - Endpoint para obtener rol del usuario

5. **Páginas con Helpers**:
   - `src/app/(evaluador)/evaluar/[id]/page.tsx`
   - `src/app/(evaluador)/perfil-diagnostico/[id]/page.tsx`
   - `src/app/(evaluador)/reporte-progreso/[id]/page.tsx`
   - `src/app/(evaluador)/evaluador-dashboard/page.tsx`

### Commits Esperados

```bash
feat(admin): ensure super_admin full access across views
feat(admin): add internal testing helpers (super_admin only)
chore(admin): document super_admin test flows
```

---

## 🚨 Reglas de D3 (NO negociables)

### ✅ Sí
- Condicionales por rol
- Helpers internos
- Links ocultos
- Logs controlados
- Validaciones adicionales

### ❌ No
- Nuevos colores
- Nuevos layouts
- Refactors grandes
- Cambios a tokens
- "Ya que estamos..."

**UI está congelada.**

---

## 🔍 Verificación Final

### Checklist de Completitud

- [x] D3.1 - Rutas accesibles verificadas
- [x] D3.2 - Helpers implementados
- [x] D3.3 - Documentación del flujo end-to-end
- [ ] Pruebas manuales completadas
- [ ] Bugs identificados y documentados
- [ ] Commits realizados

---

## 📚 Referencias

- [Arquitectura de Permisos](./PERMISSIONS_MODEL.md)
- [Arquitectura de Autenticación](../02_SECURITY/AUTH_ARCHITECTURE.md)
- [Flujo de Autenticación](../02_SECURITY/AUTH_FLOW.md)
