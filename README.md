# Diagnóstico Ner Latalmud

Sistema de diagnóstico educativo para evaluación de alumnos.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Modo Mock (Sin Base de Datos) - RECOMENDADO PARA MVP

El sistema funciona **sin base de datos** usando datos mock en memoria. Perfecto para demostrar el MVP.

#### 1. Instalar dependencias

```bash
npm install
```

#### 2. Iniciar servidor

```bash
npm run dev
```

El servidor estará disponible en [http://localhost:3000](http://localhost:3000)

#### 3. Usuarios de prueba (ya incluidos)

- **Admin Principal**: `admin@nerlatalmud.com`
- **Admin General**: `admin2@nerlatalmud.com`
- **Evaluador**: `evaluador@nerlatalmud.com`

**Nota:** Los datos se resetean al reiniciar el servidor (son en memoria).

---

### Modo con Base de Datos (Opcional)

Si prefieres usar PostgreSQL real:

#### 1. Configurar base de datos

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/ner_latalmud?schema=public"
```

#### 2. Crear base de datos y tablas

```bash
# Generar cliente de Prisma
npm run db:generate

# Crear migraciones y aplicar esquema
npm run db:migrate

# Poblar datos de prueba
npm run db:seed
```

**Nota:** Si no hay `DATABASE_URL` en `.env`, el sistema automáticamente usa datos mock.

## 📋 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run start` - Inicia servidor de producción
- `npm run db:migrate` - Crea y aplica migraciones
- `npm run db:generate` - Genera cliente de Prisma
- `npm run db:seed` - Pobla base de datos con datos de prueba
- `npm run db:studio` - Abre Prisma Studio (GUI para BD)

## 🔐 Login

Usa cualquiera de estos correos para iniciar sesión:

- `admin@nerlatalmud.com` → Dashboard Admin
- `admin2@nerlatalmud.com` → Dashboard Admin
- `evaluador@nerlatalmud.com` → Dashboard Evaluador

**Nota:** 
- El login es solo por email (sin contraseña) para esta fase
- En modo mock, los datos se resetean al reiniciar el servidor

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (admin)/          # Rutas protegidas para admin
│   │   ├── alumnos/      # CRUD de alumnos
│   │   └── ...
│   ├── (evaluador)/      # Rutas protegidas para evaluador
│   ├── (auth)/           # Rutas de autenticación
│   │   └── login/
│   └── api/              # API Routes
│       ├── auth/         # Autenticación
│       └── alumnos/       # CRUD API de alumnos
├── lib/
│   ├── auth.ts           # Funciones de autenticación
│   ├── auth-utils.ts     # Utilidades de cookies
│   ├── db.ts             # Cliente Prisma
│   └── permissions.ts    # Permisos por rol
└── middleware.ts         # Middleware de protección de rutas

prisma/
└── schema.prisma         # Esquema de base de datos
```

## 🎯 Funcionalidades Implementadas (Sprint 1)

✅ Login por email  
✅ Autenticación con cookies  
✅ Protección de rutas por rol  
✅ CRUD completo de alumnos  
✅ Permisos: Solo admin puede modificar alumnos  

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL + Prisma ORM
- **TypeScript**: Tipado estático

## 📝 Notas

- El sistema está en fase de desarrollo (Sprint 1)
- La autenticación es básica (solo email, sin contraseña)
- Las evaluaciones y reportes están pendientes (Sprint 2+)
- **Modo Mock**: Funciona sin base de datos usando datos en memoria
- Los datos mock se resetean al reiniciar el servidor
- Para persistencia, configura PostgreSQL y crea el archivo `.env`
