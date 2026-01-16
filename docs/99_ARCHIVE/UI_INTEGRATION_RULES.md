# 🎨 Reglas de Integración UI - Ner LaTalmud

## 📋 Contexto

Este documento define las reglas y procedimientos para integrar diseños HTML estáticos en páginas Next.js funcionales dentro del proyecto Ner LaTalmud.

## 🎯 Objetivo

Convertir diseños HTML completos en componentes Next.js funcionales manteniendo:
- ✅ Fidelidad visual 100%
- ✅ Estructura HTML original
- ✅ Clases Tailwind sin modificar
- ✅ Preparación para datos reales (DTOs)

---

## 🛡️ REGLAS ABSOLUTAS

### 1. **NO Modificar Diseño Visual**
- ❌ **PROHIBIDO** cambiar clases Tailwind existentes
- ❌ **PROHIBIDO** alterar estructura HTML del diseño
- ❌ **PROHIBIDO** modificar colores, espaciados, o tipografía
- ✅ **PERMITIDO** reemplazar valores hardcodeados por props/variables

### 2. **Separación de Datos**
- ✅ Todos los datos mock deben estar en `src/lib/types/evaluador-dtos.ts`
- ✅ Cada pantalla debe tener su DTO (Data Transfer Object) tipado
- ✅ Los DTOs deben incluir datos mock temporales
- ✅ Los componentes deben recibir datos como props (preparado para API)

### 3. **Estructura de Archivos**
```
src/
├── app/
│   └── (evaluador)/
│       ├── evaluador-dashboard/
│       │   └── page.tsx
│       ├── reporte-progreso/
│       │   └── [id]/
│       │       └── page.tsx
│       ├── perfil-diagnostico/
│       │   └── [id]/
│       │       └── page.tsx
│       ├── evaluar/
│       │   └── [id]/
│       │       └── page.tsx
│       └── centro-reportes/
│           └── page.tsx
└── lib/
    └── types/
        └── evaluador-dtos.ts
```

---

## 📐 PROCESO DE INTEGRACIÓN

### Paso 1: Análisis del HTML
1. Identificar todos los valores hardcodeados (textos, números, URLs)
2. Identificar elementos repetitivos (listas, cards, etc.)
3. Identificar interacciones (botones, formularios, estados)

### Paso 2: Crear DTOs
1. Definir tipos TypeScript para todos los datos
2. Crear datos mock que reflejen el HTML original
3. Documentar cada campo del DTO

**Ejemplo:**
```typescript
export interface DashboardStats {
  gruposActivos: number;
  examenesPendientes: number;
  alertasEstancamiento: {
    count: number;
    message: string;
  };
}
```

### Paso 3: Convertir HTML a JSX
1. Copiar estructura HTML completa
2. Reemplazar valores hardcodeados por variables/props
3. Usar `.map()` para elementos repetitivos
4. Mantener todas las clases Tailwind originales

**Ejemplo:**
```tsx
// ❌ ANTES (HTML estático)
<span className="text-3xl font-bold">4</span>

// ✅ DESPUÉS (JSX dinámico)
<span className="text-3xl font-bold">{data.stats.gruposActivos}</span>
```

### Paso 4: Agregar Interactividad (si aplica)
1. Usar `'use client'` solo cuando sea necesario (estado, eventos)
2. Mantener lógica mínima (solo para UI, no business logic)
3. Preparar handlers para futura integración con API

---

## 🎨 CONVENCIONES DE CÓDIGO

### Nomenclatura
- **DTOs**: PascalCase con sufijo `Data` (ej: `EvaluadorDashboardData`)
- **Tipos**: PascalCase (ej: `DashboardStats`, `AgendaItem`)
- **Variables**: camelCase (ej: `data`, `agendaHoy`)
- **Componentes**: PascalCase (ej: `EvaluadorDashboardPage`)

### Comentarios
- ✅ Comentarios `// TODO:` para indicar integración futura
- ✅ Comentarios explicativos solo cuando la lógica es compleja
- ❌ No comentar código obvio

### Imports
```tsx
// 1. React/Next
import { useState } from 'react';

// 2. Tipos
import type { EvaluadorDashboardData } from '@/lib/types/evaluador-dtos';

// 3. Datos mock (temporal)
import { mockEvaluadorDashboard } from '@/lib/types/evaluador-dtos';
```

---

## 🔧 CONFIGURACIÓN REQUERIDA

### Layout Principal (`app/layout.tsx`)
- ✅ Fuentes: Lexend (display) y Noto Sans (body)
- ✅ Material Symbols Outlined cargado
- ✅ Idioma: `lang="es"`
- ✅ Clase: `className="light"` en `<html>`

### CSS Global (`app/globals.css`)
- ✅ Variables de color personalizadas (primary, paper, alert, etc.)
- ✅ Configuración de scrollbar personalizada
- ✅ Estilos para Material Symbols
- ✅ Selección de texto con color primary

### Tailwind Config
- ✅ Colores personalizados definidos
- ✅ Fuentes personalizadas (display, body)
- ✅ Sombras personalizadas (paper, float)
- ✅ Border radius personalizados

---

## 📝 CHECKLIST DE INTEGRACIÓN

Antes de marcar una pantalla como completada:

- [ ] DTOs creados con tipos TypeScript completos
- [ ] Datos mock reflejan el HTML original
- [ ] Estructura HTML preservada 100%
- [ ] Clases Tailwind sin modificar
- [ ] Valores hardcodeados reemplazados por props/variables
- [ ] Elementos repetitivos usando `.map()`
- [ ] Comentarios `// TODO:` donde se necesitará integración real
- [ ] Imports organizados correctamente
- [ ] Página renderiza sin errores
- [ ] Visualmente idéntica al diseño original

---

## 🚨 ERRORES COMUNES A EVITAR

### ❌ Modificar Clases Tailwind
```tsx
// ❌ MAL
<div className="bg-blue-500"> // Cambió de bg-primary

// ✅ BIEN
<div className="bg-primary"> // Mantiene clase original
```

### ❌ Hardcodear Valores
```tsx
// ❌ MAL
<span>4</span> // Valor hardcodeado

// ✅ BIEN
<span>{data.stats.gruposActivos}</span> // Valor dinámico
```

### ❌ Cambiar Estructura HTML
```tsx
// ❌ MAL - Cambió de div a section
<section className="px-5 pt-6">

// ✅ BIEN - Mantiene estructura original
<div className="px-5 pt-6">
```

### ❌ Lógica de Negocio en Componentes
```tsx
// ❌ MAL - Lógica de negocio en componente
const calcularPromedio = () => { /* ... */ }

// ✅ BIEN - Solo preparación para datos
const data = mockEvaluadorDashboard; // TODO: Reemplazar con API
```

---

## 🔄 FLUJO DE TRABAJO FUTURO

Cuando se integre con API/Base de Datos:

1. **Reemplazar datos mock:**
   ```tsx
   // Antes
   const data = mockEvaluadorDashboard;
   
   // Después
   const data = await fetchEvaluadorDashboard();
   ```

2. **Agregar manejo de estados:**
   - Loading states
   - Error states
   - Empty states

3. **Agregar interactividad real:**
   - Handlers de formularios
   - Navegación real
   - Actualización de datos

4. **Eliminar datos mock:**
   - Mantener tipos DTOs
   - Eliminar exports de mock data
   - Actualizar documentación

---

## 📚 REFERENCIAS

- **Documentación de Diseño**: `docs/DISENO_SISTEMA.md` - **REFERENCIA PRINCIPAL DE DISEÑO**
- **Tipos DTOs**: `src/lib/types/evaluador-dtos.ts`
- **Configuración Tailwind**: `app/globals.css`
- **Layout Principal**: `app/layout.tsx`

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Integración de todas las pantallas HTML → Next.js
2. ⏳ Integración con API/Base de Datos
3. ⏳ Implementación de lógica de negocio
4. ⏳ Testing y validación
5. ⏳ Optimización y performance

---

**Última actualización**: 2024-03-15  
**Mantenedor**: Equipo de Desarrollo Ner LaTalmud
