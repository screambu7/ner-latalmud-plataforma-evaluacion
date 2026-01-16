# 🎨 Documentación de Diseño: Ner LaTalmud

**Sistema de Diagnóstico Académico de Guemará**

---

## 1. Visión del Producto

Ner LaTalmud es una plataforma profesional diseñada para transformar la evaluación de la Guemará en un proceso basado en datos, sin perder la esencia académica y humana del estudio tradicional. El sistema facilita a rabinos y directores la identificación de brechas de aprendizaje y el seguimiento del progreso individual y grupal.

### Objetivos Principales
- **Evaluación Basada en Datos**: Transformar evaluaciones subjetivas en métricas objetivas
- **Preservar la Tradición**: Mantener la esencia académica y humana del estudio tradicional
- **Identificación Proactiva**: Detectar brechas de aprendizaje antes de que se conviertan en problemas
- **Seguimiento Continuo**: Monitorear progreso individual y grupal en tiempo real

---

## 2. Identidad Visual

La paleta y tipografía han sido seleccionadas para evocar autoridad, tradición y precisión analítica.

### Paleta de Colores

#### Colores Principales (Paleta Oficial)

| Color | Código | Uso | Significado |
|-------|--------|-----|-------------|
| **Negro** | `#000000` | Color primario | Autoridad, elegancia y contraste máximo |
| **Amarillo** | `#f6aa1b` | Acentos, éxito, advertencias | Energía, logros y estados destacados |
| **Naranja** | `#ed6738` | Errores, alertas críticas | Urgencia, atención requerida |
| **Blanco** | `#ffffff` | Fondo principal | Limpieza, espacio y legibilidad |

#### Colores del Sistema (Tailwind)

```css
primary: #000000        /* Negro - Color primario */
paper: #ffffff          /* Blanco - Fondo principal */
yellow: #f6aa1b         /* Amarillo - Éxito y advertencias */
orange: #ed6738         /* Naranja - Errores y alertas */
black: #000000          /* Negro - Texto principal */
white: #ffffff          /* Blanco - Fondos y texto inverso */
background-light: #F5F5F5
background-card: #FAFAFA
```

### Tipografía

#### Títulos y Encabezados
- **Fuente**: Playfair Display o EB Garamond (Serif)
- **Propósito**: Transmitir sensación de "Libro de Kodesh" y tradición
- **Uso**: Títulos principales, encabezados de secciones importantes

#### Cuerpo de Texto y Datos
- **Fuente**: Inter o Roboto (Sans-Serif)
- **Propósito**: Máxima legibilidad en dispositivos móviles
- **Uso**: 
  - Cuerpo de texto general
  - Métricas numéricas
  - Datos tabulares
  - Contenido interactivo

#### Fuentes Actuales del Sistema
- **Display**: Lexend (300, 400, 500, 600, 700)
- **Body**: Noto Sans (400, 500, 700)

**Nota**: Las fuentes actuales (Lexend y Noto Sans) pueden ser reemplazadas por las fuentes recomendadas (Playfair Display/EB Garamond para títulos, Inter/Roboto para cuerpo) en futuras iteraciones del diseño.

---

## 3. Principios de UX

### 3.1 Jerarquía de Datos

Los KPIs (Alumnos evaluados, Promedio) siempre aparecen primero para dar una visión de estado inmediata.

**Orden de Prioridad Visual:**
1. **Métricas Clave** (Stats Cards) - Primera sección visible
2. **Alertas Críticas** - Destacadas visualmente
3. **Actividad Reciente** - Contexto inmediato
4. **Calendario/Agenda** - Planificación
5. **Detalles y Análisis** - Información profunda

### 3.2 Contexto Dual

Soporte para términos en hebreo (Aramit, Sugiá, Rashi) integrados naturalmente en una interfaz en español.

**Estrategia de Integración:**
- Términos técnicos en hebreo se mantienen en su forma original
- Explicaciones y contexto en español
- Glosario disponible para términos menos comunes
- Ejemplos:
  - "Sugiá" (no "Sugya" o "Sugia")
  - "Aramit" (no "Arameo" en contexto académico)
  - "Rashi" (mantener nombre propio)

### 3.3 Accionabilidad

Cada alerta debe llevar a una acción clara y directa.

**Flujo de Acciones:**
```
Alerta Crítica 
  → Ver Perfil del Alumno 
    → Identificar Problema Específico 
      → Programar Refuerzo / Intervención
```

**Principios:**
- Cada elemento interactivo debe tener un propósito claro
- Las acciones deben ser inmediatas y accesibles
- Feedback visual inmediato en todas las interacciones
- Navegación intuitiva entre pantallas relacionadas

---

## 4. Flujo del Usuario (User Flow)

### A. Acceso y Control

#### 1. Login
- El evaluador accede con credenciales institucionales
- Autenticación segura con roles diferenciados
- Redirección automática según rol (Evaluador/Admin)

#### 2. Dashboard Principal
- Vista de pájaro del estado de sus grupos
- Calendario de exámenes programados
- Métricas clave (KPIs)
- Alertas y notificaciones

### B. Proceso de Evaluación

#### 1. Selección de Alumno
- Desde el buscador global
- Desde la lista de grupos asignados
- Desde el calendario (exámenes programados)

#### 2. Evaluación Activa
- El evaluador utiliza el formulario optimizado
- Ratings (estrellas) y sliders para captura rápida
- Evaluación en tiempo real mientras escucha la lectura/explicación
- Notas rápidas con sugerencias predefinidas
- Timer de evaluación visible

#### 3. Cierre de Sesión
- El sistema calcula automáticamente el impacto en el promedio
- Actualiza el gráfico de radar de habilidades
- Guarda la evaluación en el historial
- Muestra resumen antes de confirmar

### C. Diagnóstico y Reportes

#### 1. Perfil del Alumno
- Revisión de la evolución histórica
- Identificación de debilidades específicas
- Ejemplo: "Dificultad en lógica de Tosafot"
- Gráfico de radar de habilidades
- Recomendaciones del Moré

#### 2. Generación de Reporte
- Selección de métricas a incluir
- Vista previa del documento
- Exportación a PDF profesional
- Opciones de envío:
  - Correo electrónico
  - WhatsApp
  - Descarga directa

---

## 5. Especificaciones de Pantallas Clave

### 5.1 Dashboard

| Propósito Principal | Gestión diaria y visión general |
|---------------------|--------------------------------|
| Elemento Clave | Tarjetas de métricas y Calendario de exámenes |
| Componentes | Stats Cards, Recent Activity, Calendar, Navigation |
| Acciones Principales | Ver métricas, Navegar a evaluaciones, Revisar calendario |

**Elementos Visuales:**
- 4 Stats Cards principales (Alumnos Evaluados, Promedio, Alertas, Sugiá)
- Lista de actividad reciente
- Calendario mensual interactivo
- Navegación inferior fija

### 5.2 Perfil Alumno

| Propósito Principal | Diagnóstico profundo individual |
|---------------------|----------------------------------|
| Elemento Clave | Gráfico de Radar (Habilidades de Guemará) |
| Componentes | Radar Chart, Historial, Notas Académicas, Progreso |
| Acciones Principales | Ver evolución, Generar reporte, Programar intervención |

**Elementos Visuales:**
- Gráfico radar pentagonal (5 habilidades)
- Timeline de progreso semestral
- Historial de evaluaciones
- Notas y recomendaciones del Moré

### 5.3 Evaluación Activa

| Propósito Principal | Captura de datos en tiempo real |
|---------------------|--------------------------------|
| Elemento Clave | Inputs de selección rápida para tiempo real |
| Componentes | Timer, Criterios (Lectura, Lógica, Traducción), Notas |
| Acciones Principales | Evaluar criterios, Agregar notas, Finalizar evaluación |

**Elementos Visuales:**
- Timer visible en header
- Sistema de estrellas (1-5) para lectura
- Slider (1-10) para lógica
- Botones numéricos (1-5) para traducción
- Campo de notas rápidas con sugerencias

### 5.4 Reporte PDF

| Propósito Principal | Comunicación externa profesional |
|---------------------|----------------------------------|
| Elemento Clave | Narrativa humana + Gráficas de progreso |
| Componentes | Resumen ejecutivo, Radar chart, Timeline, Recomendaciones |
| Acciones Principales | Descargar PDF, Enviar por email/WhatsApp, Vista previa |

**Elementos Visuales:**
- Header con sello oficial
- Resumen ejecutivo narrativo
- Gráficos de habilidades y progreso
- Recomendaciones del Moré
- Footer con firma autorizada

---

## 6. Guías de Implementación

### 6.1 Uso de Colores

```tsx
// Colores primarios (Paleta oficial)
className="bg-primary text-white"        // Negro - Color primario
className="bg-paper"                     // Blanco - Fondo principal
className="text-yellow"                  // Amarillo - Éxito y advertencias
className="text-orange"                  // Naranja - Errores y alertas
className="text-white"                   // Blanco - Texto inverso

// Colores semánticos
className="text-success"                 // Amarillo (#f6aa1b)
className="text-error"                   // Naranja (#ed6738)
className="text-warning"                 // Amarillo (#f6aa1b)
className="text-info"                    // Negro (#000000)

// Colores específicos del diseño
style={{ color: '#f6aa1b' }}            // Amarillo (logros, éxito)
style={{ color: '#ed6738' }}            // Naranja (errores, alertas)
style={{ color: '#000000' }}            // Negro (texto principal)
```

### 6.2 Tipografía

```tsx
// Títulos (cuando se implementen fuentes serif)
<h1 className="font-serif text-2xl">    // Playfair Display / EB Garamond

// Cuerpo de texto
<p className="font-sans text-base">     // Inter / Roboto

// Actual (Lexend y Noto Sans)
<h1 className="font-display">            // Lexend
<p className="font-body">                // Noto Sans
```

### 6.3 Componentes Reutilizables

**Stats Card:**
```tsx
<div className="bg-[color:var(--color-background-card)] rounded-lg p-6">
  <p className="text-[color:var(--color-text-primary)] text-base font-medium">Título</p>
  <p className="text-[color:var(--color-text-primary)] text-2xl font-bold">Valor</p>
  <p className="text-[color:var(--color-success)] text-base font-medium">+10%</p>
</div>
```

**Alerta Crítica:**
```tsx
<div className="bg-[color:var(--color-alert-error-bg)] border border-[color:var(--color-alert-error-border)]">
  <span className="text-[color:var(--color-alert-error)]">⚠️ Alerta</span>
  <p className="text-[color:var(--color-text-primary)]">Mensaje de alerta</p>
</div>
```

---

## 7. Checklist de Diseño

Antes de implementar cualquier pantalla, verificar:

- [ ] Colores siguen la paleta definida
- [ ] Tipografía apropiada (serif para títulos, sans-serif para cuerpo)
- [ ] Jerarquía visual clara (KPIs primero)
- [ ] Términos en hebreo integrados naturalmente
- [ ] Cada elemento tiene acción clara
- [ ] Feedback visual en interacciones
- [ ] Responsive en dispositivos móviles
- [ ] Accesibilidad (contraste, tamaño de texto)

---

## 8. Referencias y Recursos

### Documentación Relacionada
- **Reglas de Integración UI**: `docs/UI_INTEGRATION_RULES.md`
- **Prompt UI Integrator**: `docs/UI_INTEGRATOR_PROMPT.md`
- **Arquitectura del Sistema**: `docs/ARQUITECTURA.md`

### Archivos de Configuración
- **Tailwind Config**: `app/globals.css`
- **Layout Principal**: `src/app/layout.tsx`
- **DTOs**: `src/lib/types/evaluador-dtos.ts`

### Fuentes Recomendadas
- **Playfair Display**: [Google Fonts](https://fonts.google.com/specimen/Playfair+Display)
- **EB Garamond**: [Google Fonts](https://fonts.google.com/specimen/EB+Garamond)
- **Inter**: [Google Fonts](https://fonts.google.com/specimen/Inter)
- **Roboto**: [Google Fonts](https://fonts.google.com/specimen/Roboto)

---

**Última actualización**: 2024-03-15  
**Versión**: 1.0  
**Mantenedor**: Equipo de Desarrollo Ner LaTalmud

---

## 9. Notas de Implementación

### Estado Actual vs. Diseño Ideal

**Colores:**
- ✅ Paleta oficial implementada (Negro, Amarillo, Naranja, Blanco)
- ✅ Tokens centralizados en `design-tokens.ts` y `globals.css`
- ✅ Variables CSS disponibles para uso en componentes

**Tipografía:**
- ✅ Fuentes actuales: Lexend (display) y Noto Sans (body)
- ⏳ Fuentes recomendadas (Playfair Display/EB Garamond para títulos) pendientes

**Componentes:**
- ✅ Stats Cards implementados
- ✅ Gráficos radar implementados
- ✅ Calendario implementado
- ✅ Sistema de evaluación implementado

### Próximos Pasos

1. **Refinar Uso de Colores**
   - Optimizar contraste de texto sobre fondos amarillos/naranjas
   - Ajustar variantes de grises para textos secundarios
   - Validar accesibilidad (WCAG AA) con nueva paleta

2. **Actualizar Tipografía**
   - Evaluar migración a Playfair Display/EB Garamond para títulos
   - Mantener Inter/Roboto para cuerpo o actualizar Noto Sans

3. **Refinar Componentes**
   - Ajustar Stats Cards con nuevos colores
   - Mejorar jerarquía visual en todas las pantallas
   - Optimizar accionabilidad de elementos interactivos
