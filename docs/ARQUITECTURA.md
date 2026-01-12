# Arquitectura del Proyecto - Ner LaTalmud

**Versión:** 1.0  
**Fecha:** 2025-01-XX  
**Stack:** Next.js 16 (App Router) + Prisma + PostgreSQL

---

## 🎯 Principios Arquitectónicos

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

4. **Integración sin Romper**
   - Prisma como única fuente de verdad para BD
   - HTML/Tailwind existente se integra como componentes
   - Migración incremental

---

## 📁 Estructura de Carpetas Propuesta

```
ner-latalmud-plataforma-evaluacion/
│
├── prisma/                          # Prisma ORM
│   ├── schema.prisma                # Esquema de BD (única fuente de verdad)
│   ├── migrations/                   # Migraciones versionadas
│   └── seed.ts                      # Datos iniciales
│
├── public/                          # Assets estáticos
│   ├── images/
│   └── ...
│
├── src/
│   │
│   ├── app/                         # Next.js App Router (Rutas y Layouts)
│   │   ├── layout.tsx               # Layout raíz
│   │   ├── page.tsx                 # Home/Redirect
│   │   ├── globals.css              # Estilos globales
│   │   │
│   │   ├── (auth)/                  # Grupo: Rutas públicas de autenticación
│   │   │   └── login/
│   │   │       └── page.tsx         # Página de login
│   │   │
│   │   ├── (dg)/                    # Grupo: Director General (si aplica)
│   │   │   ├── layout.tsx           # Layout con sidebar/navbar para DG
│   │   │   └── dashboard/
│   │   │       └── page.tsx         # Dashboard DG
│   │   │
│   │   ├── (admin)/                 # Grupo: Administradores (ADM)
│   │   │   ├── layout.tsx           # Layout con sidebar/navbar para admin
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # Dashboard admin
│   │   │   ├── alumnos/
│   │   │   │   ├── page.tsx        # Lista de alumnos
│   │   │   │   ├── nuevo/
│   │   │   │   │   └── page.tsx    # Crear alumno
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Editar alumno
│   │   │   ├── evaluaciones/
│   │   │   │   └── page.tsx        # Lista de evaluaciones
│   │   │   ├── reportes/
│   │   │   │   └── page.tsx        # Reportes y análisis
│   │   │   ├── usuarios/
│   │   │   │   └── page.tsx        # Gestión de usuarios
│   │   │   └── configuracion/
│   │   │       └── page.tsx        # Configuración del sistema
│   │   │
│   │   ├── (evaluador)/            # Grupo: Evaluadores (EVAL)
│   │   │   ├── layout.tsx          # Layout con sidebar/navbar para evaluador
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # Dashboard evaluador
│   │   │   ├── evaluar/
│   │   │   │   └── page.tsx        # Formulario de evaluación
│   │   │   └── mis-alumnos/
│   │   │       └── page.tsx        # Alumnos asignados
│   │   │
│   │   └── api/                     # API Routes (Backend)
│   │       ├── auth/
│   │       │   ├── route.ts        # POST /api/auth (login)
│   │       │   └── logout/
│   │       │       └── route.ts    # POST /api/auth/logout
│   │       ├── alumnos/
│   │       │   ├── route.ts        # GET, POST /api/alumnos
│   │       │   └── [id]/
│   │       │       └── route.ts    # GET, PUT, DELETE /api/alumnos/:id
│   │       ├── evaluaciones/
│   │       │   ├── route.ts        # GET, POST /api/evaluaciones
│   │       │   └── [id]/
│   │       │       └── route.ts    # GET, PUT /api/evaluaciones/:id
│   │       ├── reportes/
│   │       │   └── route.ts        # GET /api/reportes (con query params)
│   │       └── usuarios/
│   │           ├── route.ts        # GET, POST /api/usuarios
│   │           └── [id]/
│   │               └── route.ts   # GET, PUT, DELETE /api/usuarios/:id
│   │
│   ├── components/                  # Componentes React reutilizables
│   │   │
│   │   ├── ui/                      # Componentes UI base (atoms/molecules)
│   │   │   ├── Button.tsx          # Botón reutilizable
│   │   │   ├── Input.tsx           # Input reutilizable
│   │   │   ├── Select.tsx          # Select reutilizable
│   │   │   ├── Card.tsx            # Card container
│   │   │   ├── Table.tsx           # Tabla de datos
│   │   │   ├── Badge.tsx           # Badge/etiqueta
│   │   │   ├── Modal.tsx           # Modal/Dialog
│   │   │   └── Loading.tsx         # Spinner/loading
│   │   │
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── Header.tsx          # Header principal
│   │   │   ├── Sidebar.tsx         # Sidebar de navegación
│   │   │   ├── Footer.tsx          # Footer (si aplica)
│   │   │   └── Navbar.tsx          # Navbar móvil
│   │   │
│   │   ├── forms/                   # Componentes de formularios
│   │   │   ├── AlumnoForm.tsx      # Formulario de alumno
│   │   │   ├── EvaluacionForm.tsx  # Formulario de evaluación
│   │   │   └── UsuarioForm.tsx     # Formulario de usuario
│   │   │
│   │   ├── features/                # Componentes específicos de features
│   │   │   ├── evaluaciones/
│   │   │   │   ├── RubricaForm.tsx # Formulario de rúbrica
│   │   │   │   └── EvaluacionCard.tsx
│   │   │   ├── reportes/
│   │   │   │   ├── ReporteChart.tsx
│   │   │   │   └── ReporteTable.tsx
│   │   │   └── alumnos/
│   │   │       └── AlumnoCard.tsx
│   │   │
│   │   └── html-integration/        # Componentes derivados de HTML existente
│   │       ├── LoginForm.tsx       # Integración de HTML de login
│   │       ├── DashboardAdmin.tsx   # Integración de HTML de dashboard
│   │       └── ...                 # Otros componentes HTML integrados
│   │
│   ├── domain/                      # Lógica de dominio (Business Logic)
│   │   │
│   │   ├── entities/                # Entidades de dominio (tipos/interfaces)
│   │   │   ├── Usuario.ts          # Tipo Usuario
│   │   │   ├── Alumno.ts           # Tipo Alumno
│   │   │   ├── Evaluacion.ts       # Tipo Evaluacion
│   │   │   └── Rubrica.ts          # Tipos de rúbrica
│   │   │
│   │   ├── services/                # Servicios de dominio (lógica de negocio)
│   │   │   ├── evaluacion/
│   │   │   │   ├── EvaluacionService.ts    # Lógica de evaluaciones
│   │   │   │   └── RubricaService.ts        # Lógica de rúbricas
│   │   │   ├── reporte/
│   │   │   │   └── ReporteService.ts       # Cálculos de reportes
│   │   │   └── alumno/
│   │   │       └── AlumnoService.ts        # Validaciones de alumnos
│   │   │
│   │   ├── validators/              # Validadores de dominio
│   │   │   ├── evaluacionValidator.ts
│   │   │   └── alumnoValidator.ts
│   │   │
│   │   └── rules/                   # Reglas de negocio (si son complejas)
│   │       └── evaluacionRules.ts
│   │
│   ├── data/                        # Capa de acceso a datos
│   │   │
│   │   ├── prisma/                  # Cliente y configuración Prisma
│   │   │   ├── client.ts           # Cliente Prisma singleton
│   │   │   └── types.ts            # Tipos derivados de Prisma
│   │   │
│   │   ├── repositories/            # Repositorios (abstracción sobre Prisma)
│   │   │   ├── AlumnoRepository.ts
│   │   │   ├── EvaluacionRepository.ts
│   │   │   ├── UsuarioRepository.ts
│   │   │   └── ReporteRepository.ts
│   │   │
│   │   └── mock/                    # Datos mock (solo desarrollo)
│   │       └── mockData.ts
│   │
│   ├── lib/                         # Utilidades y helpers compartidos
│   │   ├── auth/                    # Autenticación
│   │   │   ├── auth.ts             # Funciones de auth
│   │   │   ├── auth-utils.ts       # Utilidades (cookies, etc.)
│   │   │   └── permissions.ts      # Permisos por rol
│   │   │
│   │   ├── utils/                   # Utilidades generales
│   │   │   ├── format.ts           # Formateo de datos
│   │   │   ├── validation.ts        # Validaciones genéricas
│   │   │   └── errors.ts           # Manejo de errores
│   │   │
│   │   └── constants/              # Constantes del sistema
│   │       ├── roles.ts            # Roles y permisos
│   │       └── routes.ts           # Rutas de la aplicación
│   │
│   ├── types/                       # Tipos TypeScript globales
│   │   ├── api.ts                  # Tipos de respuestas API
│   │   ├── database.ts             # Tipos de BD (si no vienen de Prisma)
│   │   └── global.d.ts             # Tipos globales
│   │
│   └── middleware.ts                # Middleware de Next.js (auth, etc.)
│
├── docs/                            # Documentación del proyecto
│   ├── ARQUITECTURA.md             # Este documento
│   ├── ESTADO_ACTUAL.md
│   ├── PLAN_TRABAJO.md
│   └── ...
│
├── .env.example                     # Variables de entorno de ejemplo
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🏗️ Justificación de Capas

### 1. `/app` - Next.js App Router

**Propósito:** Define las rutas y layouts de la aplicación.

**Organización por grupos de rutas:**
- `(auth)` - Rutas públicas (login)
- `(dg)` - Rutas del Director General (si aplica)
- `(admin)` - Rutas de administradores
- `(evaluador)` - Rutas de evaluadores

**Ventajas:**
- ✅ Separación clara por rol
- ✅ Layouts específicos por grupo
- ✅ Protección de rutas en middleware
- ✅ Convención de Next.js App Router

**Nota:** Los grupos `(nombre)` no afectan la URL, solo organizan el código.

---

### 2. `/components` - Componentes React

**Propósito:** Componentes reutilizables de UI.

**Estructura:**
- `ui/` - Componentes base (atoms/molecules)
- `layout/` - Componentes de estructura
- `forms/` - Formularios reutilizables
- `features/` - Componentes específicos de features
- `html-integration/` - Componentes derivados de HTML existente

**Ventajas:**
- ✅ Reutilización clara
- ✅ Separación por responsabilidad
- ✅ Fácil localización
- ✅ Integración de HTML sin modificar original

---

### 3. `/domain` - Lógica de Dominio

**Propósito:** Contiene toda la lógica de negocio independiente de la UI y la BD.

**Estructura:**
- `entities/` - Tipos e interfaces de dominio
- `services/` - Servicios con lógica de negocio
- `validators/` - Validaciones de dominio
- `rules/` - Reglas de negocio complejas

**Ventajas:**
- ✅ Separación de responsabilidades (SoC)
- ✅ Lógica testeable independientemente
- ✅ No depende de Prisma directamente
- ✅ Escalable y mantenible

**Ejemplo:**
```typescript
// domain/services/evaluacion/EvaluacionService.ts
export class EvaluacionService {
  calcularPromedio(evaluacion: Evaluacion): number {
    // Lógica de negocio pura
  }
}
```

---

### 4. `/data` - Capa de Acceso a Datos

**Propósito:** Abstrae el acceso a datos (Prisma).

**Estructura:**
- `prisma/` - Cliente y configuración
- `repositories/` - Abstracción sobre Prisma
- `mock/` - Datos mock (solo desarrollo)

**Ventajas:**
- ✅ Prisma como única fuente de verdad
- ✅ Repositorios permiten cambiar implementación
- ✅ Fácil testing con mocks
- ✅ Separación de concerns

**Ejemplo:**
```typescript
// data/repositories/AlumnoRepository.ts
export class AlumnoRepository {
  async findAll(): Promise<Alumno[]> {
    return prisma.alumno.findMany();
  }
}
```

---

### 5. `/lib` - Utilidades Compartidas

**Propósito:** Funciones y utilidades compartidas.

**Estructura:**
- `auth/` - Autenticación y permisos
- `utils/` - Utilidades generales
- `constants/` - Constantes del sistema

**Ventajas:**
- ✅ Código compartido organizado
- ✅ Fácil de encontrar
- ✅ Evita duplicación

---

## 🔄 Flujo de Datos

```
UI (components) 
  ↓ (llama)
API Routes (app/api)
  ↓ (usa)
Domain Services (domain/services)
  ↓ (usa)
Repositories (data/repositories)
  ↓ (usa)
Prisma Client (data/prisma)
  ↓ (accede)
PostgreSQL
```

**Principio:** Cada capa solo conoce la capa inmediatamente inferior.

---

## 🔐 Integración con Prisma

### Ubicación del Schema
- **`prisma/schema.prisma`** - Única fuente de verdad del esquema de BD

### Cliente Prisma
- **`src/data/prisma/client.ts`** - Cliente singleton
  ```typescript
  import { PrismaClient } from '@prisma/client';
  
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };
  
  export const prisma = globalForPrisma.prisma ?? new PrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
  ```

### Repositorios
- Abstraen Prisma para que el dominio no dependa directamente
- Permiten cambiar implementación si es necesario
- Facilitan testing

---

## 📦 Integración de HTML Existente

### Estrategia
1. **No modificar HTML original** - Mantener como referencia
2. **Crear componentes en `components/html-integration/`**
3. **Convertir HTML a JSX manteniendo clases Tailwind**
4. **Extraer lógica a hooks o servicios**

### Ejemplo:
```typescript
// components/html-integration/LoginForm.tsx
// Basado en HTML original, sin modificar el original
export function LoginForm() {
  // JSX derivado del HTML, manteniendo clases Tailwind
  return (
    <form className="..."> {/* Clases del HTML original */}
      {/* ... */}
    </form>
  );
}
```

---

## 🚀 Migración Incremental

### Fase 1: Estructura Base
1. Crear carpetas vacías según estructura propuesta
2. Mover código existente a nuevas ubicaciones
3. Actualizar imports

### Fase 2: Separación de Capas
1. Extraer lógica de negocio a `domain/services`
2. Crear repositorios en `data/repositories`
3. Refactorizar API routes para usar servicios

### Fase 3: Componentes
1. Crear componentes UI base
2. Integrar HTML existente como componentes
3. Reutilizar en páginas

---

## ✅ Checklist de Implementación

- [ ] Crear estructura de carpetas
- [ ] Mover código existente
- [ ] Configurar cliente Prisma en `data/prisma/client.ts`
- [ ] Crear repositorios base
- [ ] Refactorizar API routes para usar repositorios
- [ ] Extraer lógica de negocio a servicios
- [ ] Crear componentes UI base
- [ ] Integrar HTML existente como componentes
- [ ] Actualizar imports en todo el proyecto
- [ ] Validar que todo funciona

---

## 📝 Convenciones

### Nomenclatura
- **Componentes:** PascalCase (`Button.tsx`)
- **Funciones:** camelCase (`getAlumnos()`)
- **Tipos/Interfaces:** PascalCase (`Alumno`, `Evaluacion`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_EVALUACIONES`)

### Imports
- Orden: externos → internos
- Agrupar por tipo: React, Next.js, Prisma, locales

### Archivos
- Un componente por archivo
- Un servicio por archivo
- Un repositorio por entidad

---

## 🎯 Beneficios de esta Estructura

1. **Escalabilidad:** Fácil agregar nuevas features sin refactor masivo
2. **Mantenibilidad:** Código organizado y fácil de encontrar
3. **Testabilidad:** Capas separadas facilitan testing
4. **Claridad:** Separación de responsabilidades evidente
5. **Integración:** HTML existente se integra sin romper estructura
6. **Prisma:** Integrado sin acoplar todo el código a Prisma

---

**Última actualización:** 2025-01-XX  
**Mantenedor:** Equipo de Arquitectura
