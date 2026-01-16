# 🚀 Preparación para Primer Deploy a Staging

## 📋 Estado del Repositorio

### ✅ Verificaciones de Seguridad

#### 1. Archivos Sensibles (.env*)

- [x] **`.gitignore` configurado correctamente**
  - Patrón `.env*` está en `.gitignore` (línea 34)
  - Esto excluye `.env`, `.env.local`, `.env.production`, etc.

- [x] **No hay archivos `.env*` en git**
  - Verificado: `git ls-files | grep -E "\.env|env\."` no retorna resultados
  - ✅ Seguro: No hay archivos sensibles versionados

- [ ] **`env.example` debe estar versionado**
  - Estado actual: `env.example` existe pero NO está en git (untracked)
  - ⚠️ ACCIÓN REQUERIDA: Agregar `env.example` a git
  - Solución: Actualizar `.gitignore` para permitir `env.example`

#### 2. Mocks y Fallbacks

- [x] **`src/lib/db.ts` - PROTEGIDO ✅**
  - Falla explícitamente si no hay `DATABASE_URL` en staging/production
  - Mocks solo permitidos en `NODE_ENV=development`
  - ✅ Seguro para staging/production

- [ ] **Fallbacks a mocks en páginas - ⚠️ PROBLEMA DETECTADO**
  
  **Archivos con fallbacks NO condicionados:**
  
  1. `src/app/(evaluador)/evaluador-dashboard/page.tsx`
     - Línea 13: `mockEvaluadorDashboardV2` como fallback
     - ⚠️ No está condicionado a `NODE_ENV=development`
     - **Riesgo:** En staging, si hay error, mostrará datos mock
  
  2. `src/app/(evaluador)/perfil-diagnostico/[id]/page.tsx`
     - Línea 20: `mockPerfilDiagnostico` como fallback
     - ⚠️ No está condicionado a `NODE_ENV=development`
     - **Riesgo:** En staging, si hay error, mostrará datos mock
  
  3. `src/app/(evaluador)/reporte-progreso/[id]/page.tsx`
     - Línea 17: `mockReporteProgreso` usado directamente (TODO)
     - ⚠️ No está condicionado a `NODE_ENV=development`
     - **Riesgo:** En staging, siempre mostrará datos mock
  
  **Recomendación:**
  - Estos fallbacks deben estar condicionados a `NODE_ENV=development`
  - En staging/production, deben mostrar error en lugar de mocks
  - ⚠️ **NOTA:** No se modifica en este release (según restricciones)

---

## 📁 Archivos a Committear

### Categoría 1: Seguridad y Autenticación

**Archivos de seguridad y permisos:**

```
src/lib/auth.ts
src/lib/page-protection.ts
src/middleware.ts
src/config/super-admins.ts
src/lib/permissions.ts
```

**Razón:** Sistema de permisos y autenticación crítico para staging.

---

### Categoría 2: Configuración y Deploy

**Archivos de configuración:**

```
env.example
next.config.ts
.gitignore (si se actualiza para permitir env.example)
docs/DEPLOY.md
docs/DEPLOY_CHECKLIST.md
```

**Razón:** Configuración necesaria para deploy y documentación.

---

### Categoría 3: Base de Datos y Schema

**Archivos de base de datos:**

```
prisma/schema.prisma
prisma/seed.ts
src/lib/db.ts
```

**Razón:** Schema actualizado con roles y seed actualizado.

---

### Categoría 4: API Routes y Server Actions

**API Routes actualizadas:**

```
src/app/api/auth/route.ts
src/app/api/alumnos/route.ts
src/app/api/alumnos/[id]/route.ts
src/app/api/evaluaciones/route.ts
src/app/api/archivos/[id]/descargar/route.ts
```

**Server Actions:**

```
src/app/actions/evaluador.ts
src/app/actions/reportes.ts
```

**Razón:** Todas las rutas y acciones actualizadas con nuevo sistema de permisos.

---

### Categoría 5: Páginas Protegidas

**Páginas de Admin:**

```
src/app/(admin)/admin-dashboard/page.tsx
src/app/(admin)/alumnos/page.tsx
src/app/(admin)/alumnos/[id]/page.tsx
src/app/(admin)/alumnos/nuevo/page.tsx
src/app/(admin)/evaluaciones/page.tsx
src/app/(admin)/reportes/page.tsx
src/app/(admin)/usuarios/page.tsx
src/app/(admin)/configuracion/page.tsx
```

**Páginas de Evaluador:**

```
src/app/(evaluador)/evaluador-dashboard/page.tsx
src/app/(evaluador)/mis-alumnos/page.tsx
src/app/(evaluador)/perfil-diagnostico/[id]/page.tsx
src/app/(evaluador)/reporte-progreso/[id]/page.tsx
src/app/(evaluador)/evaluar/page.tsx
src/app/(evaluador)/evaluar/[id]/page.tsx
src/app/(evaluador)/centro-reportes/page.tsx
```

**Páginas de Auth:**

```
src/app/(auth)/login/page.tsx
```

**Razón:** Todas las páginas actualizadas con protección de roles.

---

### Categoría 6: Lógica de Dominio y Utilidades

**Lógica de dominio:**

```
src/lib/calculos.ts
src/lib/rubricas.ts
src/lib/types/evaluador-dtos.ts
```

**Utilidades:**

```
src/lib/mock-data.ts (actualizado con nuevos roles)
src/lib/pdf-service.ts
```

**Razón:** Lógica de dominio y utilidades necesarias.

---

### Categoría 7: Documentación y Configuración de Proyecto

**Documentación:**

```
AGENTS.md
docs/
.cursorrules-domain
.cursorrules-ui-integrator
```

**Configuración:**

```
package.json
package-lock.json
```

**Razón:** Documentación y configuración del proyecto.

---

### Categoría 8: Estilos y Layout

```
src/app/globals.css
src/app/layout.tsx
```

**Razón:** Estilos y layout base.

---

## 🚫 Archivos a EXCLUIR del Commit

### Archivos Sensibles (ya en .gitignore)

```
.env
.env.local
.env.production
.env.staging
.env.*
```

**Razón:** Contienen información sensible, nunca deben estar en git.

---

### Archivos Generados

```
node_modules/
.next/
out/
build/
*.tsbuildinfo
next-env.d.ts
```

**Razón:** Archivos generados automáticamente, no deben versionarse.

---

### Archivos del Sistema

```
.DS_Store
*.pem
.vercel/
```

**Razón:** Archivos del sistema o configuración local.

---

## 📝 Estrategia de Commits

### Principio: Commits Atómicos y Semánticos

Cada commit debe:
- Ser atómico (una sola responsabilidad)
- Tener mensaje claro y descriptivo
- Agrupar cambios relacionados
- Ser fácil de revertir si es necesario

---

### Commit 1: Seguridad - Sistema de Permisos

**Mensaje:**
```
feat(security): implementar sistema de permisos con roles SUPER_ADMIN y EVALUADOR

- Agregar enum Rol con SUPER_ADMIN y EVALUADOR
- Implementar helpers requireRole() y protectPage()
- Actualizar middleware para proteger rutas por rol
- Configurar SUPER_ADMIN_EMAILS desde variable de entorno
- Eliminar roles antiguos (ADMIN_PRINCIPAL, ADMIN_GENERAL)

Breaking changes:
- Schema Prisma actualizado: enum Rol cambió
- Requiere migración de base de datos
- Requiere variable de entorno SUPER_ADMIN_EMAILS
```

**Archivos:**
```
prisma/schema.prisma
src/lib/auth.ts
src/lib/page-protection.ts
src/middleware.ts
src/config/super-admins.ts
src/lib/permissions.ts
```

---

### Commit 2: Seguridad - Protección de Server Actions y API Routes

**Mensaje:**
```
feat(security): proteger Server Actions y API Routes con requireRole

- Actualizar todas las Server Actions para usar requireRole()
- Actualizar todas las API Routes para validar roles
- Eliminar validaciones manuales de roles
- Usar helper canónico requireRole() en todo el código

Archivos afectados:
- src/app/actions/evaluador.ts
- src/app/actions/reportes.ts
- src/app/api/auth/route.ts
- src/app/api/alumnos/route.ts
- src/app/api/alumnos/[id]/route.ts
- src/app/api/evaluaciones/route.ts
- src/app/api/archivos/[id]/descargar/route.ts
```

**Archivos:**
```
src/app/actions/evaluador.ts
src/app/actions/reportes.ts
src/app/api/auth/route.ts
src/app/api/alumnos/route.ts
src/app/api/alumnos/[id]/route.ts
src/app/api/evaluaciones/route.ts
src/app/api/archivos/[id]/descargar/route.ts
```

---

### Commit 3: Seguridad - Protección de Páginas

**Mensaje:**
```
feat(security): proteger páginas con validación de roles

- Agregar protectPage() a todas las páginas server components
- Proteger rutas de admin con SUPER_ADMIN
- Proteger rutas de evaluador con EVALUADOR
- Middleware ya protege, esto es capa adicional de seguridad

Archivos afectados:
- Todas las páginas en src/app/(admin)/
- Todas las páginas en src/app/(evaluador)/
```

**Archivos:**
```
src/app/(admin)/admin-dashboard/page.tsx
src/app/(admin)/alumnos/page.tsx
src/app/(admin)/alumnos/[id]/page.tsx
src/app/(admin)/alumnos/nuevo/page.tsx
src/app/(admin)/evaluaciones/page.tsx
src/app/(admin)/reportes/page.tsx
src/app/(admin)/usuarios/page.tsx
src/app/(admin)/configuracion/page.tsx
src/app/(evaluador)/evaluador-dashboard/page.tsx
src/app/(evaluador)/mis-alumnos/page.tsx
src/app/(evaluador)/perfil-diagnostico/[id]/page.tsx
src/app/(evaluador)/reporte-progreso/[id]/page.tsx
src/app/(evaluador)/evaluar/page.tsx
src/app/(evaluador)/evaluar/[id]/page.tsx
src/app/(evaluador)/centro-reportes/page.tsx
src/app/(auth)/login/page.tsx
```

---

### Commit 4: DevOps - Configuración de Deploy

**Mensaje:**
```
feat(devops): configurar variables de entorno y eliminar mocks en staging

- Agregar env.example con todas las variables requeridas
- Actualizar src/lib/db.ts para fallar sin DATABASE_URL en staging/production
- Actualizar src/config/super-admins.ts para leer de variable de entorno
- Actualizar next.config.ts con configuración para Vercel
- Agregar documentación de deploy (DEPLOY.md, DEPLOY_CHECKLIST.md)

Breaking changes:
- Requiere DATABASE_URL en staging/production
- Requiere SUPER_ADMIN_EMAILS en staging/production
- Mocks solo permitidos en NODE_ENV=development
```

**Archivos:**
```
env.example
src/lib/db.ts
src/config/super-admins.ts
next.config.ts
docs/DEPLOY.md
docs/DEPLOY_CHECKLIST.md
.gitignore (si se actualiza)
```

---

### Commit 5: Database - Schema y Seed

**Mensaje:**
```
feat(database): actualizar schema y seed con nuevos roles

- Actualizar enum Rol en schema.prisma
- Actualizar seed.ts para usar SUPER_ADMIN_EMAILS
- Asegurar que Teddy y Moshe sean SUPER_ADMIN
- Actualizar mock-data.ts con nuevos roles

Breaking changes:
- Requiere migración: npx prisma migrate deploy
- Requiere seed: npm run db:seed
```

**Archivos:**
```
prisma/schema.prisma
prisma/seed.ts
src/lib/mock-data.ts
```

---

### Commit 6: Features - Evaluaciones y Reportes

**Mensaje:**
```
feat(evaluations): agregar Server Actions y páginas de evaluaciones

- Implementar Server Actions para evaluador
- Implementar Server Actions para reportes y PDFs
- Agregar páginas de evaluación y reportes
- Integrar con sistema de permisos

Archivos nuevos:
- src/app/actions/evaluador.ts
- src/app/actions/reportes.ts
- src/app/(evaluador)/perfil-diagnostico/
- src/app/(evaluador)/reporte-progreso/
- src/app/(evaluador)/centro-reportes/
- src/app/api/archivos/
```

**Archivos:**
```
src/app/actions/evaluador.ts
src/app/actions/reportes.ts
src/app/(evaluador)/perfil-diagnostico/
src/app/(evaluador)/reporte-progreso/
src/app/(evaluador)/centro-reportes/
src/app/api/archivos/
src/lib/pdf-service.ts
```

---

### Commit 7: Domain - Lógica de Dominio

**Mensaje:**
```
feat(domain): agregar lógica de dominio y cálculos

- Implementar cálculos de promedios y estadísticas
- Definir tipos DTOs para evaluador
- Mantener separación de responsabilidades

Archivos:
- src/lib/calculos.ts
- src/lib/types/evaluador-dtos.ts
- src/lib/rubricas.ts (actualizaciones)
```

**Archivos:**
```
src/lib/calculos.ts
src/lib/types/evaluador-dtos.ts
src/lib/rubricas.ts
```

---

### Commit 8: Docs - Documentación del Proyecto

**Mensaje:**
```
docs: agregar documentación de arquitectura y agentes

- Agregar AGENTS.md con definición de roles
- Agregar documentación de arquitectura
- Agregar reglas de cursor (.cursorrules-*)
- Documentar estructura de carpetas

Archivos:
- AGENTS.md
- docs/
- .cursorrules-domain
- .cursorrules-ui-integrator
```

**Archivos:**
```
AGENTS.md
docs/
.cursorrules-domain
.cursorrules-ui-integrator
```

---

### Commit 9: Chore - Dependencias y Configuración

**Mensaje:**
```
chore: actualizar dependencias y configuración

- Actualizar package.json y package-lock.json
- Configurar scripts de Prisma
- Actualizar estilos globales y layout

Archivos:
- package.json
- package-lock.json
- src/app/globals.css
- src/app/layout.tsx
```

**Archivos:**
```
package.json
package-lock.json
src/app/globals.css
src/app/layout.tsx
```

---

## ⚠️ Advertencias Importantes

### 1. Fallbacks a Mocks NO Condicionados

**Problema detectado:**
- Algunas páginas usan mocks como fallback sin verificar `NODE_ENV`
- Esto puede causar que se muestren datos mock en staging si hay errores

**Archivos afectados:**
- `src/app/(evaluador)/evaluador-dashboard/page.tsx`
- `src/app/(evaluador)/perfil-diagnostico/[id]/page.tsx`
- `src/app/(evaluador)/reporte-progreso/[id]/page.tsx`

**Recomendación:**
- Estos archivos se commitean como están (según restricciones)
- Deben corregirse en un commit posterior antes de production
- Documentar en issues/tickets

### 2. Migración de Base de Datos Requerida

**Acción requerida antes de deploy:**
```bash
npx prisma migrate deploy
npm run db:seed
```

### 3. Variables de Entorno Requeridas

**Configurar en Vercel antes de deploy:**
- `DATABASE_URL`
- `SUPER_ADMIN_EMAILS`
- `APP_BASE_URL`
- `NEXT_PUBLIC_APP_URL`

---

## 📋 Checklist Final Pre-Commit

- [ ] `.gitignore` actualizado (si es necesario para `env.example`)
- [ ] `env.example` agregado a git
- [ ] No hay archivos `.env*` en staging
- [ ] Build pasa: `npm run build`
- [ ] Linter pasa: `npm run lint`
- [ ] Todos los archivos sensibles excluidos
- [ ] Documentación actualizada

---

**Última actualización:** 2025-01-XX  
**Versión:** 1.0
