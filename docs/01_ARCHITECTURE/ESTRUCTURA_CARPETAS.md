# Estructura de Carpetas - Ner LaTalmud

**Árbol de carpetas comentado con justificación de cada capa.**

---

## 📁 Árbol Completo

```
ner-latalmud-plataforma-evaluacion/
│
├── prisma/                                    # ═══════════════════════════════
│   │                                          # PRISMA ORM - Esquema y Migraciones
│   ├── schema.prisma                         # ✅ Esquema de BD (única fuente de verdad)
│   │                                          #    Define modelos, relaciones, enums
│   ├── migrations/                            # ✅ Migraciones versionadas de BD
│   │   └── ...                                #    Historial de cambios en esquema
│   └── seed.ts                                # ✅ Datos iniciales para desarrollo
│                                               #    Poblar BD con datos de prueba
│
├── public/                                    # ═══════════════════════════════
│   │                                          # ASSETS ESTÁTICOS
│   ├── images/                               # Imágenes, logos, iconos
│   └── ...                                   # Otros assets estáticos
│
├── src/                                       # ═══════════════════════════════
│   │                                          # CÓDIGO FUENTE PRINCIPAL
│   │
│   ├── app/                                   # ───────────────────────────────
│   │   │                                      # NEXT.JS APP ROUTER
│   │   │                                      # Rutas, layouts, páginas
│   │   │
│   │   ├── layout.tsx                         # ✅ Layout raíz de la aplicación
│   │   ├── page.tsx                           # ✅ Home/Redirect inicial
│   │   ├── globals.css                        # ✅ Estilos globales (Tailwind)
│   │   │
│   │   ├── (auth)/                            # ───────────────────────────────
│   │   │   │                                  # GRUPO: Rutas Públicas
│   │   │   │                                  # No requiere autenticación
│   │   │   └── login/
│   │   │       └── page.tsx                  # ✅ Página de login
│   │   │                                      #    Ruta: /login
│   │   │
│   │   ├── (dg)/                              # ───────────────────────────────
│   │   │   │                                  # GRUPO: Director General
│   │   │   │                                  # Layout específico para DG
│   │   │   ├── layout.tsx                     # ✅ Layout con sidebar/navbar DG
│   │   │   └── dashboard/
│   │   │       └── page.tsx                  # ✅ Dashboard del Director General
│   │   │                                      #    Ruta: /dashboard (si aplica)
│   │   │
│   │   ├── (admin)/                           # ───────────────────────────────
│   │   │   │                                  # GRUPO: Administradores (ADM)
│   │   │   │                                  # ADMIN_PRINCIPAL + ADMIN_GENERAL
│   │   │   ├── layout.tsx                     # ✅ Layout con sidebar/navbar admin
│   │   │   │                                  #    Navegación, header, footer
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                  # ✅ Dashboard principal admin
│   │   │   │                                  #    Ruta: /admin-dashboard
│   │   │   ├── alumnos/                       # ─────────────────────────────
│   │   │   │   │                              # GESTIÓN DE ALUMNOS
│   │   │   │   ├── page.tsx                  # ✅ Lista de alumnos
│   │   │   │   │                              #    Ruta: /alumnos
│   │   │   │   ├── nuevo/
│   │   │   │   │   └── page.tsx              # ✅ Crear nuevo alumno
│   │   │   │   │                              #    Ruta: /alumnos/nuevo
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx              # ✅ Editar alumno existente
│   │   │   │                                  #    Ruta: /alumnos/:id
│   │   │   ├── evaluaciones/
│   │   │   │   └── page.tsx                  # ✅ Lista de evaluaciones
│   │   │   │                                  #    Ruta: /evaluaciones
│   │   │   ├── reportes/
│   │   │   │   └── page.tsx                  # ✅ Reportes y análisis
│   │   │   │                                  #    Ruta: /reportes
│   │   │   ├── usuarios/
│   │   │   │   └── page.tsx                  # ✅ Gestión de usuarios
│   │   │   │                                  #    Ruta: /usuarios
│   │   │   └── configuracion/
│   │   │       └── page.tsx                  # ✅ Configuración del sistema
│   │   │                                      #    Ruta: /configuracion
│   │   │
│   │   ├── (evaluador)/                       # ───────────────────────────────
│   │   │   │                                  # GRUPO: Evaluadores (EVAL)
│   │   │   ├── layout.tsx                     # ✅ Layout con sidebar/navbar evaluador
│   │   │   │                                  #    Navegación específica para evaluadores
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                  # ✅ Dashboard del evaluador
│   │   │   │                                  #    Ruta: /evaluador-dashboard
│   │   │   ├── evaluar/
│   │   │   │   └── page.tsx                  # ✅ Formulario de evaluación
│   │   │   │                                  #    Ruta: /evaluar
│   │   │   └── mis-alumnos/
│   │   │       └── page.tsx                  # ✅ Alumnos asignados al evaluador
│   │   │                                      #    Ruta: /mis-alumnos
│   │   │
│   │   └── api/                               # ───────────────────────────────
│   │       │                                  # API ROUTES (Backend)
│   │       │                                  # Endpoints REST
│   │       ├── auth/
│   │       │   ├── route.ts                  # ✅ POST /api/auth (login)
│   │       │   └── logout/
│   │       │       └── route.ts              # ✅ POST /api/auth/logout
│   │       ├── alumnos/
│   │       │   ├── route.ts                  # ✅ GET, POST /api/alumnos
│   │       │   └── [id]/
│   │       │       └── route.ts              # ✅ GET, PUT, DELETE /api/alumnos/:id
│   │       ├── evaluaciones/
│   │       │   ├── route.ts                  # ✅ GET, POST /api/evaluaciones
│   │       │   └── [id]/
│   │       │       └── route.ts              # ✅ GET, PUT /api/evaluaciones/:id
│   │       ├── reportes/
│   │       │   └── route.ts                  # ✅ GET /api/reportes (query params)
│   │       └── usuarios/
│   │           ├── route.ts                  # ✅ GET, POST /api/usuarios
│   │           └── [id]/
│   │               └── route.ts              # ✅ GET, PUT, DELETE /api/usuarios/:id
│   │
│   ├── components/                            # ═══════════════════════════════
│   │   │                                      # COMPONENTES REACT REUTILIZABLES
│   │   │
│   │   ├── ui/                                # ───────────────────────────────
│   │   │   │                                  # COMPONENTES UI BASE
│   │   │   │                                  # Atoms/Molecules (Design System)
│   │   │   ├── Button.tsx                     # ✅ Botón reutilizable
│   │   │   │                                  #    Variantes: primary, secondary, etc.
│   │   │   ├── Input.tsx                      # ✅ Input de texto reutilizable
│   │   │   ├── Select.tsx                     # ✅ Select/Dropdown reutilizable
│   │   │   ├── Card.tsx                       # ✅ Card container reutilizable
│   │   │   ├── Table.tsx                      # ✅ Tabla de datos reutilizable
│   │   │   ├── Badge.tsx                      # ✅ Badge/etiqueta reutilizable
│   │   │   ├── Modal.tsx                     # ✅ Modal/Dialog reutilizable
│   │   │   └── Loading.tsx                    # ✅ Spinner/loading indicator
│   │   │
│   │   ├── layout/                            # ───────────────────────────────
│   │   │   │                                  # COMPONENTES DE LAYOUT
│   │   │   ├── Header.tsx                     # ✅ Header principal de la app
│   │   │   │                                  #    Logo, navegación, usuario
│   │   │   ├── Sidebar.tsx                    # ✅ Sidebar de navegación
│   │   │   │                                  #    Menú lateral por rol
│   │   │   ├── Footer.tsx                     # ✅ Footer (si aplica)
│   │   │   └── Navbar.tsx                     # ✅ Navbar móvil (responsive)
│   │   │
│   │   ├── forms/                             # ───────────────────────────────
│   │   │   │                                  # FORMULARIOS REUTILIZABLES
│   │   │   ├── AlumnoForm.tsx                 # ✅ Formulario de alumno (crear/editar)
│   │   │   ├── EvaluacionForm.tsx             # ✅ Formulario de evaluación
│   │   │   └── UsuarioForm.tsx                # ✅ Formulario de usuario
│   │   │
│   │   ├── features/                          # ───────────────────────────────
│   │   │   │                                  # COMPONENTES ESPECÍFICOS DE FEATURES
│   │   │   │                                  # Organizados por dominio
│   │   │   ├── evaluaciones/
│   │   │   │   ├── RubricaForm.tsx            # ✅ Formulario de rúbrica dinámico
│   │   │   │   └── EvaluacionCard.tsx        # ✅ Card de evaluación en lista
│   │   │   ├── reportes/
│   │   │   │   ├── ReporteChart.tsx          # ✅ Gráfico de reporte
│   │   │   │   └── ReporteTable.tsx           # ✅ Tabla de reporte
│   │   │   └── alumnos/
│   │   │       └── AlumnoCard.tsx             # ✅ Card de alumno en lista
│   │   │
│   │   └── html-integration/                  # ───────────────────────────────
│   │       │                                  # COMPONENTES DERIVADOS DE HTML EXISTENTE
│   │       │                                  # Integración de HTML/Tailwind sin modificar original
│   │       ├── LoginForm.tsx                 # ✅ Basado en HTML de login
│   │       ├── DashboardAdmin.tsx            # ✅ Basado en HTML de dashboard admin
│   │       └── ...                           # Otros componentes HTML integrados
│   │
│   ├── domain/                                # ═══════════════════════════════
│   │   │                                      # LÓGICA DE DOMINIO (Business Logic)
│   │   │                                      # Independiente de UI y BD
│   │   │
│   │   ├── entities/                          # ───────────────────────────────
│   │   │   │                                  # ENTIDADES DE DOMINIO
│   │   │   │                                  # Tipos e interfaces de negocio
│   │   │   ├── Usuario.ts                     # ✅ Tipo Usuario (no Prisma)
│   │   │   ├── Alumno.ts                      # ✅ Tipo Alumno (no Prisma)
│   │   │   ├── Evaluacion.ts                  # ✅ Tipo Evaluacion (no Prisma)
│   │   │   └── Rubrica.ts                     # ✅ Tipos de rúbrica
│   │   │
│   │   ├── services/                          # ───────────────────────────────
│   │   │   │                                  # SERVICIOS DE DOMINIO
│   │   │   │                                  # Lógica de negocio pura
│   │   │   ├── evaluacion/
│   │   │   │   ├── EvaluacionService.ts      # ✅ Lógica de evaluaciones
│   │   │   │   │                              #    Cálculos, validaciones de negocio
│   │   │   │   └── RubricaService.ts         # ✅ Lógica de rúbricas
│   │   │   │                                  #    Mapeo de subhabilidades, niveles
│   │   │   ├── reporte/
│   │   │   │   └── ReporteService.ts         # ✅ Cálculos de reportes
│   │   │   │                                  #    Agregaciones, promedios, etc.
│   │   │   └── alumno/
│   │   │       └── AlumnoService.ts          # ✅ Validaciones de alumnos
│   │   │                                      #    Reglas de negocio específicas
│   │   │
│   │   ├── validators/                        # ───────────────────────────────
│   │   │   │                                  # VALIDADORES DE DOMINIO
│   │   │   ├── evaluacionValidator.ts         # ✅ Validaciones de evaluación
│   │   │   └── alumnoValidator.ts            # ✅ Validaciones de alumno
│   │   │
│   │   └── rules/                             # ───────────────────────────────
│   │       │                                  # REGLAS DE NEGOCIO COMPLEJAS
│   │       └── evaluacionRules.ts            # ✅ Reglas complejas de evaluación
│   │                                          #    Si son muy complejas, separar aquí
│   │
│   ├── data/                                  # ═══════════════════════════════
│   │   │                                      # CAPA DE ACCESO A DATOS
│   │   │                                      # Abstracción sobre Prisma
│   │   │
│   │   ├── prisma/                            # ───────────────────────────────
│   │   │   │                                  # PRISMA CLIENT Y CONFIGURACIÓN
│   │   │   ├── client.ts                      # ✅ Cliente Prisma singleton
│   │   │   │                                  #    Instancia única, reutilizable
│   │   │   └── types.ts                       # ✅ Tipos derivados de Prisma
│   │   │                                      #    Helpers de tipos
│   │   │
│   │   ├── repositories/                      # ───────────────────────────────
│   │   │   │                                  # REPOSITORIOS
│   │   │   │                                  # Abstracción sobre Prisma
│   │   │   ├── AlumnoRepository.ts           # ✅ CRUD de alumnos
│   │   │   ├── EvaluacionRepository.ts       # ✅ CRUD de evaluaciones
│   │   │   ├── UsuarioRepository.ts           # ✅ CRUD de usuarios
│   │   │   └── ReporteRepository.ts          # ✅ Queries de reportes
│   │   │
│   │   └── mock/                              # ───────────────────────────────
│   │       │                                  # DATOS MOCK (solo desarrollo)
│   │       └── mockData.ts                    # ✅ Datos en memoria para desarrollo
│   │                                          #    Sin BD requerida
│   │
│   ├── lib/                                   # ═══════════════════════════════
│   │   │                                      # UTILIDADES Y HELPERS COMPARTIDOS
│   │   │
│   │   ├── auth/                              # ───────────────────────────────
│   │   │   │                                  # AUTENTICACIÓN
│   │   │   ├── auth.ts                        # ✅ Funciones de autenticación
│   │   │   ├── auth-utils.ts                 # ✅ Utilidades (cookies, etc.)
│   │   │   └── permissions.ts                # ✅ Permisos por rol
│   │   │
│   │   ├── utils/                             # ───────────────────────────────
│   │   │   │                                  # UTILIDADES GENERALES
│   │   │   ├── format.ts                      # ✅ Formateo de datos
│   │   │   │                                  #    Fechas, números, etc.
│   │   │   ├── validation.ts                 # ✅ Validaciones genéricas
│   │   │   └── errors.ts                     # ✅ Manejo de errores
│   │   │
│   │   └── constants/                         # ───────────────────────────────
│   │       │                                  # CONSTANTES DEL SISTEMA
│   │       ├── roles.ts                       # ✅ Roles y permisos
│   │       └── routes.ts                      # ✅ Rutas de la aplicación
│   │
│   ├── types/                                 # ───────────────────────────────
│   │   │                                      # TIPOS TYPESCRIPT GLOBALES
│   │   ├── api.ts                             # ✅ Tipos de respuestas API
│   │   ├── database.ts                        # ✅ Tipos de BD (si no vienen de Prisma)
│   │   └── global.d.ts                        # ✅ Tipos globales
│   │
│   └── middleware.ts                          # ───────────────────────────────
│                                               # MIDDLEWARE DE NEXT.JS
│                                               # ✅ Autenticación, protección de rutas
│
├── docs/                                      # ═══════════════════════════════
│   │                                          # DOCUMENTACIÓN DEL PROYECTO
│   ├── ARQUITECTURA.md                        # ✅ Documento de arquitectura
│   ├── ESTRUCTURA_CARPETAS.md                 # ✅ Este documento
│   ├── ESTADO_ACTUAL.md                       # ✅ Estado actual del proyecto
│   ├── PLAN_TRABAJO.md                        # ✅ Plan de trabajo
│   └── ...                                    # Otros documentos
│
├── .env.example                               # ✅ Variables de entorno de ejemplo
├── .gitignore                                 # ✅ Archivos ignorados por git
├── next.config.ts                             # ✅ Configuración de Next.js
├── package.json                               # ✅ Dependencias del proyecto
├── tsconfig.json                              # ✅ Configuración de TypeScript
└── README.md                                  # ✅ Documentación principal
```

---

## 📊 Resumen por Capa

| Capa | Propósito | Ubicación | Dependencias |
|------|-----------|-----------|--------------|
| **UI** | Presentación y eventos | `app/`, `components/` | Domain (tipos) |
| **API** | Orquestación y validación | `app/api/` | Domain, Data |
| **Domain** | Lógica de negocio | `domain/` | Ninguna (pura) |
| **Data** | Acceso a datos | `data/` | Prisma |
| **Infra** | Utilidades y config | `lib/`, `types/` | Ninguna |

---

## 🎯 Convenciones Clave

### Rutas por Rol
- `(auth)` → Públicas (login)
- `(dg)` → Director General
- `(admin)` → Administradores
- `(evaluador)` → Evaluadores

### Componentes
- `ui/` → Base (reutilizables)
- `layout/` → Estructura
- `forms/` → Formularios
- `features/` → Específicos de dominio
- `html-integration/` → Derivados de HTML

### Lógica
- `domain/entities/` → Tipos
- `domain/services/` → Lógica de negocio
- `data/repositories/` → Acceso a datos

---

**Última actualización:** 2025-01-XX
