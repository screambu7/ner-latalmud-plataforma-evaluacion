# ✅ Checklist UX/UI - Ner LaTalmud

## 📋 Estado Actual

### Pantallas Implementadas ✅

1. **Dashboard del Evaluador** (`/evaluador-dashboard`)
   - ✅ Stats cards (Grupos Activos, Exámenes Pendientes)
   - ✅ Alertas de Estancamiento
   - ✅ Agenda del día
   - ✅ Student Insights con gráficos de tendencia
   - ✅ Navegación inferior
   - ⚠️ **Pendiente**: Conectar con datos reales de BD

2. **Reporte de Progreso** (`/reporte-progreso/[id]`)
   - ✅ Perfil del estudiante
   - ✅ Resumen ejecutivo
   - ✅ Gráfico radar de habilidades (SVG)
   - ✅ Progreso semestral (gráfico de línea)
   - ✅ Recomendaciones del Moré
   - ✅ Footer oficial con sello
   - ⚠️ **Pendiente**: Conectar con datos reales de BD

3. **Perfil de Diagnóstico** (`/perfil-diagnostico/[id]`)
   - ✅ Mapa de habilidades (gráfico radar)
   - ✅ Historial de evaluaciones
   - ✅ Notas académicas
   - ✅ Sistema de puntuación por niveles
   - ⚠️ **Pendiente**: Conectar con datos reales de BD

4. **Evaluación Activa** (`/evaluar/[id]`)
   - ✅ Timer de evaluación
   - ✅ Criterios de Lectura (estrellas)
   - ✅ Criterios de Lógica (slider)
   - ✅ Criterios de Traducción (botones)
   - ✅ Notas rápidas con sugerencias
   - ✅ Estado interactivo (client component)
   - ⚠️ **Pendiente**: Guardar evaluación en BD

5. **Centro de Generación de Reportes** (`/centro-reportes`)
   - ✅ Selección de grupo
   - ✅ Tipo de reporte (Individual/Grupal)
   - ✅ Opciones de contenido (checkboxes)
   - ✅ Vista previa del documento
   - ✅ Exportación batch PDF
   - ⚠️ **Pendiente**: Generar PDF real

---

## 🎨 Diseño según Documentación

### Colores ✅/⚠️

- ✅ `primary`: #2111d4 (implementado)
- ✅ `paper`: #FDFCF0 (implementado)
- ✅ `alert`: #ef4444 (implementado)
- ✅ `success`: #22c55e (implementado)
- ✅ `warning`: #eab308 (implementado)
- ⚠️ **Pendiente**: Dorado Antiguo `#C5A059` (para logros)
- ⚠️ **Pendiente**: Gris Pizarra `#455A64` (para textos secundarios)
- ⚠️ **Pendiente**: Azul Oxford `#1A237E` (color primario del diseño)

### Tipografía ✅/⚠️

- ✅ Lexend (display) - implementado
- ✅ Noto Sans (body) - implementado
- ⚠️ **Pendiente**: Playfair Display o EB Garamond para títulos (serif)
- ⚠️ **Pendiente**: Inter o Roboto para cuerpo (sans-serif)

### Componentes ✅

- ✅ Stats Cards
- ✅ Gráficos radar (SVG)
- ✅ Calendario
- ✅ Sistema de evaluación (estrellas, sliders, botones)
- ✅ Alertas críticas
- ✅ Navegación inferior

---

## 🔄 Funcionalidad Pendiente (Crítico)

### 1. Integración con Backend ⚠️ URGENTE

- [ ] **API Routes para Dashboard**
  - [ ] `/api/evaluador/dashboard` - Obtener métricas y actividad reciente
  - [ ] `/api/evaluador/alumnos` - Listar alumnos asignados
  - [ ] `/api/evaluador/alertas` - Obtener alertas de estancamiento

- [ ] **API Routes para Evaluación**
  - [ ] `POST /api/evaluaciones` - Crear nueva evaluación
  - [ ] `GET /api/evaluaciones/[id]` - Obtener evaluación
  - [ ] `PUT /api/evaluaciones/[id]` - Actualizar evaluación
  - [ ] `POST /api/evaluaciones/[id]/detalles` - Guardar detalles de evaluación

- [ ] **API Routes para Reportes**
  - [ ] `GET /api/reportes/[id]` - Obtener reporte
  - [ ] `POST /api/reportes/generar` - Generar reporte PDF
  - [ ] `GET /api/reportes/[id]/pdf` - Descargar PDF

- [ ] **API Routes para Perfil**
  - [ ] `GET /api/alumnos/[id]` - Obtener perfil completo
  - [ ] `GET /api/alumnos/[id]/historial` - Obtener historial de evaluaciones
  - [ ] `GET /api/alumnos/[id]/progreso` - Obtener datos de progreso

### 2. Datos Demo ⚠️ URGENTE

- [ ] **Verificar datos demo en BD**
  - [ ] Alumnos creados
  - [ ] Escuelas creadas
  - [ ] Evaluaciones creadas
  - [ ] EvaluacionDetalle creados
  - [ ] Reportes creados

- [ ] **Ejecutar seed demo si falta**
  ```bash
  DEMO_SEED_ENABLED=true DEMO_SEED_CONFIRM=YES_I_KNOW_WHAT_I_AM_DOING npm run db:seed:demo
  ```

### 3. Funcionalidad de Evaluación ⚠️ URGENTE

- [ ] **Guardar evaluación en BD**
  - [ ] Crear registro en `Evaluacion`
  - [ ] Crear registros en `EvaluacionDetalle`
  - [ ] Actualizar promedios del alumno
  - [ ] Generar alertas si hay estancamiento

- [ ] **Validaciones**
  - [ ] Validar que todos los criterios estén completos
  - [ ] Validar que el timer no haya expirado
  - [ ] Validar permisos del evaluador

### 4. Generación de PDFs ⚠️ URGENTE

- [ ] **Implementar generación de PDF**
  - [ ] Usar Playwright o similar
  - [ ] Seguir diseño del reporte
  - [ ] Incluir gráficos (radar, línea)
  - [ ] Incluir sello oficial
  - [ ] Opciones de envío (email, WhatsApp, descarga)

### 5. Dashboard Admin ⚠️ PENDIENTE

- [ ] **Crear dashboard para SUPER_ADMIN**
  - [ ] Ruta: `/admin-dashboard`
  - [ ] Métricas globales (todos los evaluadores)
  - [ ] Gestión de usuarios
  - [ ] Gestión de escuelas
  - [ ] Reportes globales

---

## 🎯 Principios UX según Documentación

### Jerarquía de Datos ✅

- ✅ KPIs aparecen primero
- ✅ Alertas críticas destacadas
- ✅ Actividad reciente visible
- ✅ Calendario accesible

### Contexto Dual ✅

- ✅ Términos en hebreo integrados (Sugiá, Aramit, Rashi)
- ✅ Explicaciones en español
- ⚠️ **Pendiente**: Glosario de términos

### Accionabilidad ⚠️

- ✅ Elementos interactivos tienen propósito claro
- ⚠️ **Pendiente**: Feedback visual en todas las interacciones
- ⚠️ **Pendiente**: Navegación intuitiva entre pantallas relacionadas
- ⚠️ **Pendiente**: Acciones inmediatas y accesibles

---

## 📝 Tareas Inmediatas (Prioridad Alta)

1. **Actualizar Moshe a SUPER_ADMIN** (ver `FIX_MOSHE_SUPER_ADMIN.md`)
2. **Verificar/crear datos demo** (alumnos, escuelas, evaluaciones)
3. **Conectar dashboards con datos reales** (reemplazar mocks)
4. **Implementar guardado de evaluaciones** (POST /api/evaluaciones)
5. **Implementar generación de PDFs** (reportes)

---

## 📚 Referencias

- **Diseño del Sistema**: `docs/DISENO_SISTEMA.md`
- **Integración UI**: `docs/INTEGRACION_UI_COMPLETADA.md`
- **Reglas de Integración**: `docs/UI_INTEGRATION_RULES.md`

---

**Última actualización**: 2026-01-13  
**Estado**: ⚠️ Pendiente integración con backend y datos reales
