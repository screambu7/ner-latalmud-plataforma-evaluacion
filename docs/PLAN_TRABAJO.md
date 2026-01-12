# Plan de Trabajo - Ner LaTalmud Plataforma

**Objetivo:** Construir web app profesional que implemente exactamente la lógica definida en las especificaciones.

---

## 🎯 Principios de Trabajo

1. **Nunca inventar lógica funcional nueva**
2. **Nunca cambiar escalas, rúbricas o flujos definidos**
3. **HTML proporcionado es la fuente visual de verdad (UI contract)**
4. **Toda lógica debe mapearse a: BD → API → Estado UI**
5. **Ambigüedades se documentan como TODO, no se resuelven arbitrariamente**
6. **Priorizar claridad, legibilidad y separación de responsabilidades**

---

## 📋 Fases de Desarrollo

### FASE 0: Preparación y Documentación ⚠️ CRÍTICA

**Objetivo:** Asegurar que tenemos toda la información necesaria

#### Tareas:
- [ ] Localizar ESPECIFICACIÓN MAESTRA funcional v1.4
- [ ] Localizar ESPECIFICACIÓN TÉCNICA v1.0
- [ ] Localizar diseños HTML + Tailwind (mobile-first)
- [ ] Crear documento de mapeo: Especificación → Código
- [ ] Documentar TODOs y ambigüedades encontradas

**Salida:** Documentación completa y accesible para el equipo

---

### FASE 1: Completar Modelo de Datos

**Objetivo:** Asegurar que el schema de Prisma refleja exactamente la especificación

#### Tareas:
- [ ] Revisar schema actual vs especificación
- [ ] Agregar campos faltantes
- [ ] Validar relaciones (foreign keys)
- [ ] Crear migraciones necesarias
- [ ] Actualizar seed con datos de prueba completos

**Salida:** Schema de BD completo y validado

---

### FASE 2: Sistema de Rúbricas Completo

**Objetivo:** Implementar todas las rúbricas según tipos de diagnóstico

#### Tareas:
- [ ] Mapear todas las subhabilidades por tipo de diagnóstico
- [ ] Definir escalas y niveles (1-4) para cada subhabilidad
- [ ] Crear estructura de datos tipada
- [ ] Implementar validaciones de rúbricas
- [ ] Crear helpers para cálculo de promedios/niveles

**Salida:** Sistema de rúbricas completo y funcional

---

### FASE 3: Integración de Diseños HTML

**Objetivo:** Convertir HTML/Tailwind proporcionado en componentes React reutilizables

#### Tareas:
- [ ] Analizar estructura HTML proporcionada
- [ ] Identificar componentes reutilizables
- [ ] Crear componentes UI base (botones, inputs, cards, etc.)
- [ ] Implementar layout principal (header, sidebar, footer)
- [ ] Aplicar mobile-first responsive design
- [ ] Validar fidelidad visual con HTML original

**Salida:** Componentes UI listos para usar

---

### FASE 4: Dashboards Funcionales

**Objetivo:** Implementar dashboards con datos reales y funcionalidad completa

#### Tareas Admin Dashboard:
- [ ] Métricas principales (KPIs)
- [ ] Gráficos y visualizaciones
- [ ] Lista de evaluaciones recientes
- [ ] Accesos rápidos a funciones principales

#### Tareas Evaluador Dashboard:
- [ ] Mis evaluaciones pendientes
- [ ] Mis alumnos asignados
- [ ] Estadísticas personales
- [ ] Acceso rápido a nueva evaluación

**Salida:** Dashboards funcionales y conectados a datos

---

### FASE 5: Flujo de Evaluación Completo

**Objetivo:** Implementar flujo completo de evaluación según especificación

#### Tareas:
- [ ] Selección de alumno y tipo de diagnóstico
- [ ] Formulario de rúbrica dinámico según tipo
- [ ] Validaciones de negocio
- [ ] Guardado de evaluación con detalles
- [ ] Confirmación y redirección
- [ ] Manejo de errores completo

**Salida:** Flujo de evaluación funcional y validado

---

### FASE 6: Gestión de Usuarios y Configuración

**Objetivo:** CRUD completo de usuarios y configuración del sistema

#### Tareas:
- [ ] Listar usuarios
- [ ] Crear/editar usuario
- [ ] Asignar roles y permisos
- [ ] Gestión de escuelas (si aplica)
- [ ] Configuración de sistema
- [ ] Validaciones de permisos

**Salida:** Gestión completa de usuarios

---

### FASE 7: Reportes y Exportación

**Objetivo:** Generar reportes según especificación y exportar a PDF

#### Tareas:
- [ ] Lógica de cálculo de reportes
- [ ] Visualizaciones de datos
- [ ] Filtros y búsqueda
- [ ] Generación de PDF fiel al diseño
- [ ] Exportación de datos (CSV/Excel si aplica)

**Salida:** Sistema de reportes completo

---

### FASE 8: Validación y Testing

**Objetivo:** Asegurar que todo funciona según especificación

#### Tareas:
- [ ] Validar flujos completos end-to-end
- [ ] Verificar cálculos y lógica de negocio
- [ ] Validar permisos y seguridad
- [ ] Testing de UI responsive
- [ ] Validación de generación de PDF
- [ ] Documentar casos edge encontrados

**Salida:** Sistema validado y listo para producción

---

## 🔄 Metodología de Trabajo

### Por cada tarea:
1. **Leer especificación relevante**
2. **Identificar componentes afectados**
3. **Implementar cambios incrementales**
4. **Validar contra especificación**
5. **Documentar decisiones técnicas**
6. **No romper funcionalidad existente**

### Principios:
- ✅ Un cambio a la vez
- ✅ Commits pequeños y descriptivos
- ✅ No saltar pasos
- ✅ Documentar ambigüedades como TODO
- ✅ Validar antes de avanzar

---

## 📝 Documentación Requerida

### Por cada módulo:
- [ ] Mapeo: Especificación → Implementación
- [ ] Decisiones técnicas documentadas
- [ ] TODOs y limitaciones conocidas
- [ ] Guía de uso (si aplica)

---

## ⚠️ Bloqueadores Actuales

1. **Especificaciones no encontradas** - Necesario para validar implementación
2. **Diseños HTML no encontrados** - Necesario para UI fiel
3. **Rúbricas incompletas** - Necesario para funcionalidad core

---

## 🎯 Criterios de Éxito

- ✅ Toda la lógica mapea a especificación
- ✅ UI fiel a diseños HTML proporcionados
- ✅ Código claro, mantenible y escalable
- ✅ Separación de responsabilidades correcta
- ✅ Sin lógica inventada arbitrariamente
- ✅ Documentación completa
