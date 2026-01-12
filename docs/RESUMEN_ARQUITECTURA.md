# Resumen Ejecutivo - Propuesta de Arquitectura

**Proyecto:** Ner LaTalmud – Diagnostic Platform  
**Stack:** Next.js 16 (App Router) + Prisma + PostgreSQL  
**Fecha:** 2025-01-XX

---

## 🎯 Objetivo

Proponer estructura de carpetas ideal que:
1. ✅ Organice rutas por rol (DG / ADM / EVAL)
2. ✅ Separe componentes UI de lógica de dominio
3. ✅ Integre Prisma sin romper lo existente
4. ✅ Priorice claridad y escalabilidad

---

## 📋 Estructura Propuesta (Resumen)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas públicas
│   ├── (dg)/              # Director General
│   ├── (admin)/           # Administradores
│   ├── (evaluador)/       # Evaluadores
│   └── api/               # API Routes
│
├── components/            # Componentes React
│   ├── ui/               # Base (Button, Input, etc.)
│   ├── layout/           # Header, Sidebar, etc.
│   ├── forms/             # Formularios
│   ├── features/         # Específicos de dominio
│   └── html-integration/ # Derivados de HTML existente
│
├── domain/                # Lógica de negocio
│   ├── entities/         # Tipos de dominio
│   ├── services/         # Servicios de negocio
│   └── validators/       # Validaciones
│
├── data/                  # Acceso a datos
│   ├── prisma/           # Cliente Prisma
│   └── repositories/     # Abstracción sobre Prisma
│
└── lib/                   # Utilidades
    ├── auth/             # Autenticación
    └── utils/            # Helpers generales
```

---

## 🏗️ Justificación de Capas

### 1. `/app` - Rutas y Layouts
**Propósito:** Define rutas de la aplicación organizadas por rol.

**Grupos de rutas:**
- `(auth)` - Login (público)
- `(dg)` - Director General
- `(admin)` - Administradores
- `(evaluador)` - Evaluadores

**Ventaja:** Separación clara por rol, layouts específicos, protección en middleware.

---

### 2. `/components` - UI Reutilizable
**Propósito:** Componentes React organizados por responsabilidad.

**Estructura:**
- `ui/` - Componentes base (Button, Input, Card, etc.)
- `layout/` - Header, Sidebar, Footer
- `forms/` - Formularios reutilizables
- `features/` - Componentes específicos de dominio
- `html-integration/` - **Componentes derivados de HTML existente**

**Ventaja:** HTML existente se integra sin modificar, reutilización clara.

---

### 3. `/domain` - Lógica de Negocio
**Propósito:** Lógica de negocio pura, independiente de UI y BD.

**Estructura:**
- `entities/` - Tipos e interfaces de dominio
- `services/` - Servicios con lógica de negocio
- `validators/` - Validaciones de dominio

**Ventaja:** Separación de responsabilidades (SoC), testeable, escalable.

**Ejemplo:**
```typescript
// domain/services/evaluacion/EvaluacionService.ts
export class EvaluacionService {
  calcularPromedio(evaluacion: Evaluacion): number {
    // Lógica pura, sin Prisma, sin UI
  }
}
```

---

### 4. `/data` - Acceso a Datos
**Propósito:** Abstrae Prisma, permite cambiar implementación.

**Estructura:**
- `prisma/client.ts` - Cliente singleton
- `repositories/` - Abstracción sobre Prisma

**Ventaja:** Prisma como única fuente de verdad, fácil testing, separación de concerns.

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

## 🔄 Flujo de Datos

```
UI (components)
  ↓
API Routes (app/api)
  ↓
Domain Services (domain/services)
  ↓
Repositories (data/repositories)
  ↓
Prisma Client
  ↓
PostgreSQL
```

**Principio:** Cada capa solo conoce la capa inmediatamente inferior.

---

## 🔐 Integración con Prisma

### Ubicación
- **Schema:** `prisma/schema.prisma` (única fuente de verdad)
- **Cliente:** `src/data/prisma/client.ts` (singleton)

### Estrategia
1. Prisma como única fuente de verdad del esquema
2. Repositorios abstraen Prisma
3. Dominio no depende directamente de Prisma
4. Fácil testing con mocks

---

## 📦 Integración de HTML Existente

### Estrategia
1. **NO modificar HTML original** - Mantener como referencia
2. Crear componentes en `components/html-integration/`
3. Convertir HTML a JSX manteniendo clases Tailwind
4. Extraer lógica a hooks o servicios

### Ejemplo
```typescript
// components/html-integration/LoginForm.tsx
// Basado en HTML original, sin modificar el original
export function LoginForm() {
  return (
    <form className="..."> {/* Clases del HTML original */}
      {/* ... */}
    </form>
  );
}
```

---

## ✅ Checklist de Implementación

- [ ] Crear estructura de carpetas
- [ ] Mover código existente a nuevas ubicaciones
- [ ] Configurar cliente Prisma en `data/prisma/client.ts`
- [ ] Crear repositorios base
- [ ] Refactorizar API routes para usar repositorios
- [ ] Extraer lógica de negocio a servicios
- [ ] Crear componentes UI base
- [ ] Integrar HTML existente como componentes
- [ ] Actualizar imports en todo el proyecto
- [ ] Validar que todo funciona

---

## 🎯 Beneficios

1. **Escalabilidad:** Fácil agregar features sin refactor masivo
2. **Mantenibilidad:** Código organizado y fácil de encontrar
3. **Testabilidad:** Capas separadas facilitan testing
4. **Claridad:** Separación de responsabilidades evidente
5. **Integración:** HTML existente se integra sin romper estructura
6. **Prisma:** Integrado sin acoplar todo el código

---

## 📚 Documentación Completa

- **`ARQUITECTURA.md`** - Documento completo con justificaciones detalladas
- **`ESTRUCTURA_CARPETAS.md`** - Árbol de carpetas comentado línea por línea

---

## 🚀 Próximos Pasos

1. Revisar propuesta
2. Aprobar estructura
3. Implementar migración incremental
4. Validar funcionamiento

---

**Propuesto por:** Equipo de Arquitectura  
**Estado:** ✅ Listo para implementación
