# 🎯 Visión General del Sistema - Ner LaTalmud

**Plataforma de Diagnóstico Académico de Guemará**

---

## 📋 ¿Qué es Ner LaTalmud?

Ner LaTalmud es una plataforma SaaS profesional diseñada para transformar la evaluación de la Guemará en un proceso basado en datos, sin perder la esencia académica y humana del estudio tradicional.

### Objetivos principales:
- **Evaluación basada en datos**: Transformar evaluaciones subjetivas en métricas objetivas
- **Preservar la tradición**: Mantener la esencia académica y humana del estudio tradicional
- **Identificación proactiva**: Detectar brechas de aprendizaje antes de que se conviertan en problemas
- **Seguimiento continuo**: Monitorear progreso individual y grupal en tiempo real

---

## 🏗️ Arquitectura del Sistema

### Stack tecnológico:
- **Frontend**: Next.js 16 (App Router) + React 19 + TailwindCSS 4
- **Backend**: Next.js API Routes (Server Actions)
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: Password-based con JWT sessions
- **Deploy**: Vercel

### Principios arquitectónicos:
1. **Separación de Responsabilidades (SoC)**
   - UI → Presentación y eventos
   - Domain → Lógica de negocio
   - Data → Acceso a datos (Prisma)
   - API → Orquestación y validación

2. **Escalabilidad**
   - Estructura que crece sin refactor masivo
   - Módulos independientes por dominio
   - Reutilización de componentes

3. **Mantenibilidad**
   - Código claro y autodocumentado
   - Convenciones consistentes
   - Fácil localización de código

---

## 👥 Roles del Sistema

### SUPER_ADMIN
- Administrador principal del sistema
- Acceso completo a todas las funcionalidades
- Gestión de usuarios, escuelas y configuración
- Acceso a reportes globales

### EVALUADOR
- Usuario que realiza evaluaciones
- Acceso a sus alumnos asignados
- Creación de evaluaciones
- Generación de reportes individuales

---

## 🔐 Autenticación

### Método activo (ÚNICO):
- ✅ **Password Auth**: Login con correo electrónico + contraseña
- Hash con bcrypt (obligatorio)
- Sesiones JWT firmadas (httpOnly cookies)
- Expiración: 7 días

### Métodos congelados:
- ❌ **Magic Link** - CONGELADO (no usar, ampliar ni reactivar)
- ❌ Email-only login - No permitido
- ❌ Auto-login por token - No permitido

**Referencias:**
- **Reglas oficiales**: `.cursorrules-auth` (prioridad máxima)
- **Detalles técnicos**: `02_SECURITY/SECURITY_FINAL.md`

---

## ✅ Quality Gates

### Principio Supremo
**CUALQUIER WARNING ES UN BUG. CUALQUIER BUG BLOQUEA MERGE.**

### Gates Obligatorios (100% VERDE)
Antes de commit / push / merge:
- `npm run lint` → 0 warnings, 0 errors
- `npm run typecheck` → 0 errors
- `npm run build` → 0 warnings, 0 errors
- Tests (si aplica) → 100% pass

**No existen excepciones temporales, implícitas o "documentadas".**

**Referencias:**
- **Reglas oficiales**: `.cursorrules-quality` (prioridad máxima, NO EXCEPTIONS)
- **Gobernanza**: `00_OVERVIEW/GOVERNANCE.md` - Sección Quality Gates
- **CI/CD**: `05_DEPLOYMENT/CI_GUARDRAILS.md` - Guardrails automáticos

---

## 📊 Entidades principales

### Alumno
- Estudiante que es evaluado
- Tipos: `ESCUELA` o `INDEPENDIENTE`
- Estados: `ACTIVO`, `EN_PAUSA`, `NO_ACTIVO`, `NIVEL_LOGRADO`

### Evaluación
- Sesión de evaluación de un alumno
- Contiene múltiples `EvaluacionDetalle` (subhabilidades)
- Asociada a un evaluador y un alumno

### Reporte
- Documento generado con resultados y análisis
- Tipos: `EVALUACION_INDIVIDUAL`, `PROGRESO_ALUMNO`, `ESTADISTICAS_ESCUELA`
- Exportable a PDF

---

## 🎨 Diseño y UX

### Principios de diseño:
1. **Jerarquía de datos**: KPIs siempre aparecen primero
2. **Contexto dual**: Soporte para términos en hebreo integrados naturalmente
3. **Accionabilidad**: Cada alerta lleva a una acción clara

### Paleta de colores:
- **Azul Oxford** (`#1A237E`) - Color primario
- **Crema Pergamino** (`#FDFCF0`) - Fondo principal
- **Dorado Antiguo** (`#C5A059`) - Acentos y logros
- **Gris Pizarra** (`#455A64`) - Textos secundarios

**Ver detalles**: `03_UX_UI/UX_UI_CHECKLIST.md`

---

## 🔄 Flujos principales

### 1. Autenticación
```
Usuario → Login (correo + contraseña) → Validación → JWT Session → Dashboard según rol
```

### 2. Evaluación
```
Evaluador → Seleccionar Alumno → Formulario de Rúbrica → Guardar Evaluación → Actualizar Progreso
```

### 3. Reportes
```
Evaluador/Admin → Seleccionar Alumno/Grupo → Configurar Reporte → Generar PDF → Descargar/Enviar
```

---

## 📁 Estructura del código

```
src/
├── app/                    # Next.js App Router (Rutas y Layouts)
│   ├── (auth)/            # Rutas públicas de autenticación
│   ├── (admin)/           # Rutas de administradores
│   ├── (evaluador)/       # Rutas de evaluadores
│   └── api/               # API Routes (Backend)
│
├── components/            # Componentes React reutilizables
│   ├── ui/               # Componentes UI base
│   ├── layout/           # Componentes de layout
│   ├── forms/            # Formularios
│   └── features/         # Componentes específicos de features
│
├── domain/                # Lógica de dominio (Business Logic)
│   ├── entities/         # Tipos e interfaces de dominio
│   ├── services/         # Servicios de dominio
│   └── validators/       # Validadores de dominio
│
├── data/                  # Capa de acceso a datos
│   ├── prisma/           # Cliente Prisma
│   └── repositories/     # Repositorios (abstracción sobre Prisma)
│
└── lib/                   # Utilidades compartidas
    ├── auth/             # Autenticación
    └── utils/            # Utilidades generales
```

**Ver detalles**: `01_ARCHITECTURE/ARQUITECTURA.md`

---

## 🚀 Estado actual del proyecto

### ✅ Completado:
- Sistema de autenticación con password
- CRUD completo de alumnos
- Sistema de permisos por roles
- Dashboards básicos
- Generación de reportes PDF

### ⚠️ En progreso:
- Integración completa de datos reales en dashboards
- Completar sistema de rúbricas (requiere especificación)
- Optimizaciones de UI/UX

### 📋 Pendiente:
- Completar especificaciones de rúbricas
- Mejoras de performance
- Testing automatizado

---

## 📚 Documentación relacionada

- **Gobernanza y reglas del proyecto**: `00_OVERVIEW/GOVERNANCE.md`
- **Arquitectura técnica**: `01_ARCHITECTURE/ARQUITECTURA.md`
- **Seguridad**: `02_SECURITY/SECURITY_FINAL.md`
- **Deploy**: `05_DEPLOYMENT/DEPLOY_CHECKLIST.md`
- **UI/UX**: `03_UX_UI/UX_UI_CHECKLIST.md`

---

**Última actualización**: 2025-01-XX  
**Versión**: 1.0
