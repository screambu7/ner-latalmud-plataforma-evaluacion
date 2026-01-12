# 📝 Estrategia de Commits - Primer Deploy a Staging

## 📋 Lista Exacta de Archivos a Committear

### Archivos Modificados (26 archivos)

```
next.config.ts
package-lock.json
package.json
prisma/schema.prisma
prisma/seed.ts
src/app/(admin)/admin-dashboard/page.tsx
src/app/(admin)/configuracion/page.tsx
src/app/(admin)/evaluaciones/page.tsx
src/app/(admin)/reportes/page.tsx
src/app/(admin)/usuarios/page.tsx
src/app/(auth)/login/page.tsx
src/app/(evaluador)/evaluador-dashboard/page.tsx
src/app/(evaluador)/evaluar/page.tsx
src/app/(evaluador)/mis-alumnos/page.tsx
src/app/api/alumnos/[id]/route.ts
src/app/api/alumnos/route.ts
src/app/api/auth/route.ts
src/app/api/evaluaciones/route.ts
src/app/globals.css
src/app/layout.tsx
src/lib/auth.ts
src/lib/db.ts
src/lib/mock-data.ts
src/lib/permissions.ts
src/lib/rubricas.ts
src/middleware.ts
.gitignore
```

### Archivos Nuevos (Sin Trackear) (30+ archivos)

```
.cursorrules-domain
.cursorrules-ui-integrator
AGENTS.md
env.example
docs/ARQUITECTURA.md
docs/CAMBIOS_SCHEMA_V1.md
docs/DEPLOY.md
docs/DEPLOY_CHECKLIST.md
docs/DISENO_SISTEMA.md
docs/ESTADO_ACTUAL.md
docs/ESTRUCTURA_CARPETAS.md
docs/INTEGRACION_UI_COMPLETADA.md
docs/PLAN_TRABAJO.md
docs/RESUMEN_ARQUITECTURA.md
docs/RESUMEN_INICIAL.md
docs/TODOS_RUBRICAS.md
docs/UI_INTEGRATION_RULES.md
docs/UI_INTEGRATOR_PROMPT.md
src/app/(evaluador)/centro-reportes/page.tsx
src/app/(evaluador)/evaluar/[id]/page.tsx
src/app/(evaluador)/perfil-diagnostico/[id]/page.tsx
src/app/(evaluador)/reporte-progreso/[id]/DescargarPDFButton.tsx
src/app/(evaluador)/reporte-progreso/[id]/page.tsx
src/app/actions/evaluador.ts
src/app/actions/reportes.ts
src/app/api/archivos/[id]/descargar/route.ts
src/config/super-admins.ts
src/lib/calculos.ts
src/lib/page-protection.ts
src/lib/pdf-service.ts
src/lib/types/evaluador-dtos.ts
```

---

## 🚫 Lista Exacta de Archivos a EXCLUIR

### Archivos Sensibles (NUNCA committear)

```
.env
.env.local
.env.production
.env.staging
.env.development
.env.test
.env.*
```

**Verificación:**
```bash
# Verificar que NO están en git
git ls-files | grep -E "\.env" 
# Debe retornar vacío
```

### Archivos Generados (ya en .gitignore)

```
node_modules/
.next/
out/
build/
*.tsbuildinfo
next-env.d.ts
.vercel/
.DS_Store
*.pem
```

---

## 📝 Mensajes de Commit Sugeridos

### Commit 1: Seguridad - Sistema de Permisos

```bash
git add prisma/schema.prisma src/lib/auth.ts src/lib/page-protection.ts src/middleware.ts src/config/super-admins.ts src/lib/permissions.ts .gitignore

git commit -m "feat(security): implementar sistema de permisos con roles SUPER_ADMIN y EVALUADOR

- Agregar enum Rol con SUPER_ADMIN y EVALUADOR en schema
- Implementar helpers requireRole() y protectPage()
- Actualizar middleware para proteger rutas por rol
- Configurar SUPER_ADMIN_EMAILS desde variable de entorno
- Eliminar roles antiguos (ADMIN_PRINCIPAL, ADMIN_GENERAL)
- Actualizar .gitignore para permitir env.example

Breaking changes:
- Schema Prisma actualizado: enum Rol cambió
- Requiere migración: npx prisma migrate deploy
- Requiere variable de entorno SUPER_ADMIN_EMAILS"
```

---

### Commit 2: Seguridad - Protección de Server Actions y API Routes

```bash
git add src/app/actions/evaluador.ts src/app/actions/reportes.ts src/app/api/auth/route.ts src/app/api/alumnos/route.ts src/app/api/alumnos/[id]/route.ts src/app/api/evaluaciones/route.ts src/app/api/archivos/[id]/descargar/route.ts

git commit -m "feat(security): proteger Server Actions y API Routes con requireRole

- Actualizar todas las Server Actions para usar requireRole()
- Actualizar todas las API Routes para validar roles con SUPER_ADMIN
- Eliminar validaciones manuales de roles
- Usar helper canónico requireRole() en todo el código

Archivos afectados:
- Server Actions: evaluador.ts, reportes.ts
- API Routes: auth, alumnos, evaluaciones, archivos"
```

---

### Commit 3: Seguridad - Protección de Páginas

```bash
git add src/app/(admin)/admin-dashboard/page.tsx src/app/(admin)/configuracion/page.tsx src/app/(admin)/evaluaciones/page.tsx src/app/(admin)/reportes/page.tsx src/app/(admin)/usuarios/page.tsx src/app/(evaluador)/evaluador-dashboard/page.tsx src/app/(evaluador)/mis-alumnos/page.tsx src/app/(auth)/login/page.tsx

git commit -m "feat(security): proteger páginas con validación de roles

- Agregar protectPage() a todas las páginas server components
- Proteger rutas de admin con SUPER_ADMIN
- Proteger rutas de evaluador con EVALUADOR
- Middleware ya protege, esto es capa adicional de seguridad

Nota: Algunas páginas tienen fallbacks a mocks que deben
corregirse antes de production (ver RELEASE_PREPARATION.md)"
```

---

### Commit 4: DevOps - Configuración de Deploy

```bash
git add env.example src/lib/db.ts src/config/super-admins.ts next.config.ts docs/DEPLOY.md docs/DEPLOY_CHECKLIST.md

git commit -m "feat(devops): configurar variables de entorno y eliminar mocks en staging

- Agregar env.example con todas las variables requeridas
- Actualizar src/lib/db.ts para fallar sin DATABASE_URL en staging/production
- Actualizar src/config/super-admins.ts para leer de variable de entorno
- Actualizar next.config.ts con configuración para Vercel
- Agregar documentación de deploy (DEPLOY.md, DEPLOY_CHECKLIST.md)

Breaking changes:
- Requiere DATABASE_URL en staging/production
- Requiere SUPER_ADMIN_EMAILS en staging/production
- Mocks solo permitidos en NODE_ENV=development"
```

---

### Commit 5: Database - Schema y Seed

```bash
git add prisma/seed.ts src/lib/mock-data.ts

git commit -m "feat(database): actualizar seed con nuevos roles y SUPER_ADMIN_EMAILS

- Actualizar seed.ts para usar SUPER_ADMIN_EMAILS desde variable de entorno
- Asegurar que emails en SUPER_ADMIN_EMAILS tengan rol SUPER_ADMIN
- Actualizar mock-data.ts con nuevos roles (SUPER_ADMIN, EVALUADOR)

Requiere:
- Ejecutar seed después de migración: npm run db:seed"
```

---

### Commit 6: Features - Evaluaciones y Reportes

```bash
git add src/app/actions/evaluador.ts src/app/actions/reportes.ts src/app/(evaluador)/perfil-diagnostico/ src/app/(evaluador)/reporte-progreso/ src/app/(evaluador)/centro-reportes/ src/app/api/archivos/ src/lib/pdf-service.ts

git commit -m "feat(evaluations): agregar Server Actions y páginas de evaluaciones

- Implementar Server Actions para evaluador (dashboard, perfil, reportes)
- Implementar Server Actions para reportes y generación de PDFs
- Agregar páginas de evaluación y reportes
- Integrar con sistema de permisos

Archivos nuevos:
- Server Actions: evaluador.ts, reportes.ts
- Páginas: perfil-diagnostico, reporte-progreso, centro-reportes
- API: archivos para descarga de PDFs
- Servicio: pdf-service.ts con Playwright"
```

---

### Commit 7: Domain - Lógica de Dominio

```bash
git add src/lib/calculos.ts src/lib/types/evaluador-dtos.ts src/lib/rubricas.ts

git commit -m "feat(domain): agregar lógica de dominio y cálculos

- Implementar cálculos de promedios y estadísticas
- Definir tipos DTOs para evaluador
- Mantener separación de responsabilidades

Archivos:
- calculos.ts: funciones puras de cálculo
- evaluador-dtos.ts: tipos y DTOs
- rubricas.ts: definición de rúbricas"
```

---

### Commit 8: Docs - Documentación del Proyecto

```bash
git add AGENTS.md docs/ .cursorrules-domain .cursorrules-ui-integrator

git commit -m "docs: agregar documentación de arquitectura y agentes

- Agregar AGENTS.md con definición de roles y responsabilidades
- Agregar documentación de arquitectura en docs/
- Agregar reglas de cursor (.cursorrules-*)
- Documentar estructura de carpetas y decisiones

Archivos:
- AGENTS.md: definición de agentes
- docs/: documentación completa del proyecto
- .cursorrules-*: reglas para diferentes agentes"
```

---

### Commit 9: Chore - Dependencias y Configuración

```bash
git add package.json package-lock.json src/app/globals.css src/app/layout.tsx src/app/(admin)/alumnos/ src/app/(evaluador)/evaluar/

git commit -m "chore: actualizar dependencias y configuración

- Actualizar package.json y package-lock.json
- Actualizar estilos globales y layout
- Actualizar páginas restantes con protección de roles

Archivos:
- package.json, package-lock.json
- globals.css, layout.tsx
- Páginas restantes de admin y evaluador"
```

---

## ⚠️ Advertencias Críticas

### 1. Fallbacks a Mocks NO Condicionados

**Archivos con fallbacks problemáticos:**
- `src/app/(evaluador)/evaluador-dashboard/page.tsx` (línea 13)
- `src/app/(evaluador)/perfil-diagnostico/[id]/page.tsx` (línea 20)
- `src/app/(evaluador)/reporte-progreso/[id]/page.tsx` (línea 17)

**Riesgo:** En staging, si hay errores, pueden mostrar datos mock.

**Acción:** Documentar en issues/tickets para corregir antes de production.

### 2. Verificaciones Pre-Commit

```bash
# 1. Verificar que no hay archivos .env en git
git ls-files | grep -E "\.env"
# Debe retornar vacío

# 2. Verificar que env.example está listo para commit
git check-ignore -v env.example
# Debe retornar vacío (no ignorado)

# 3. Build debe pasar
npm run build

# 4. Linter debe pasar
npm run lint
```

---

## 📋 Comandos de Ejecución Rápida

### Opción 1: Commits Individuales (Recomendado)

```bash
# Seguir los 9 commits en orden
# Ver sección "Mensajes de Commit Sugeridos" arriba
```

### Opción 2: Verificación Rápida

```bash
# Ver todos los archivos modificados
git status

# Ver archivos que se agregarán
git add -n <archivos>

# Verificar que env.example NO está ignorado
git check-ignore -v env.example
```

---

**Última actualización:** 2025-01-XX  
**Versión:** 1.0
