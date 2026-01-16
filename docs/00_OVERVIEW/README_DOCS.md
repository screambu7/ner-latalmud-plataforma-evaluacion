# 📚 Documentación del Sistema - Ner LaTalmud

**Plataforma de Diagnóstico Académico de Guemará**

---

## 🎯 ¿Qué es este sistema?

Ner LaTalmud es una plataforma SaaS profesional diseñada para transformar la evaluación de la Guemará en un proceso basado en datos, sin perder la esencia académica y humana del estudio tradicional.

El sistema facilita a rabinos y directores la identificación de brechas de aprendizaje y el seguimiento del progreso individual y grupal mediante:

- **Evaluaciones estructuradas** con rúbricas específicas
- **Dashboards analíticos** con métricas clave
- **Reportes profesionales** con visualizaciones y recomendaciones
- **Gestión de alumnos y usuarios** con control de acceso por roles

---

## 📖 Cómo leer esta documentación

### Orden recomendado de lectura

#### Para nuevos desarrolladores:
1. **`00_OVERVIEW/SYSTEM_OVERVIEW.md`** - Visión general del sistema
2. **`01_ARCHITECTURE/ARQUITECTURA.md`** - Arquitectura técnica
3. **`01_ARCHITECTURE/DATABASE_ARCHITECTURE.md`** - Modelo de datos
4. **`02_SECURITY/SECURITY_FINAL.md`** - Seguridad y autenticación
5. **`05_DEPLOYMENT/DEPLOY_CHECKLIST.md`** - Proceso de deploy

#### Para integradores UI:
1. **`03_UX_UI/UX_UI_CHECKLIST.md`** - Checklist de implementación
2. **`03_UX_UI/SCREENS_STATUS.md`** - Estado de pantallas
3. **`01_ARCHITECTURE/ARQUITECTURA.md`** - Sección de componentes

#### Para DevOps:
1. **`05_DEPLOYMENT/DEPLOY_CHECKLIST.md`** - Checklist de deploy
2. **`05_DEPLOYMENT/ENVIRONMENT_VARIABLES.md`** - Variables de entorno
3. **`02_SECURITY/SECURITY_FINAL.md`** - Configuración de seguridad

#### Para evaluar datos demo:
1. **`04_DEMO_AND_SEED/DEMO_SEED.md`** - Guía de seed demo
2. **`04_DEMO_AND_SEED/VERIFY_DEMO_DATA.md`** - Verificación de datos

---

## 🗂️ Estructura de la documentación

```
/docs
│
├─ 00_OVERVIEW/              # Visión general y guías de inicio
│   ├─ README_DOCS.md        ← Estás aquí
│   └─ SYSTEM_OVERVIEW.md    ← Arquitectura conceptual
│
├─ 01_ARCHITECTURE/          # Arquitectura técnica
│   ├─ ARQUITECTURA.md       ← Arquitectura completa del sistema
│   ├─ DATABASE_ARCHITECTURE.md
│   └─ PERMISSIONS_MODEL.md
│
├─ 02_SECURITY/              # Seguridad y autenticación
│   ├─ SECURITY_FINAL.md     ← Estado final del sistema de auth
│   ├─ AUTH_FLOW.md          ← Flujo de autenticación
│   └─ THREAT_MODEL.md       ← Modelo de amenazas
│
├─ 03_UX_UI/                 # Diseño y experiencia de usuario
│   ├─ UX_UI_CHECKLIST.md    ← Checklist de implementación
│   └─ SCREENS_STATUS.md     ← Estado de pantallas
│
├─ 04_DEMO_AND_SEED/         # Datos de demostración
│   ├─ DEMO_SEED.md         ← Guía de seed demo
│   └─ VERIFY_DEMO_DATA.md   ← Verificación de datos
│
├─ 05_DEPLOYMENT/            # Deploy y configuración
│   ├─ DEPLOY_CHECKLIST.md  ← Checklist de deploy
│   └─ ENVIRONMENT_VARIABLES.md
│
└─ 99_ARCHIVE/               # Documentos obsoletos
    └─ DEPRECATED.md         ← Lista de docs deprecados
```

---

## 🔒 Información sensible

### ⚠️ NO modificar sin permiso explícito:

- **Autenticación**: Sistema de auth está **congelado** (ver `02_SECURITY/SECURITY_FINAL.md`)
- **Modelo de permisos**: Roles y permisos están definidos (ver `01_ARCHITECTURE/PERMISSIONS_MODEL.md`)
- **Variables de entorno**: Requieren aprobación antes de cambios (ver `05_DEPLOYMENT/ENVIRONMENT_VARIABLES.md`)
- **Schema de base de datos**: Cambios requieren migraciones aprobadas

### ✅ Puedes modificar libremente:

- Documentación (excepto secciones marcadas como "frozen")
- Guías de desarrollo
- Checklists de implementación
- Documentos de estado

---

## 📝 Terminología normalizada

Para mantener consistencia en toda la documentación:

### Roles de usuario:
- **`SUPER_ADMIN`** - Administrador principal del sistema
- **`EVALUADOR`** - Usuario que realiza evaluaciones

### Entidades del dominio:
- **Alumno** - Estudiante que es evaluado
- **Evaluación** - Sesión de evaluación de un alumno
- **Reporte** - Documento generado con resultados y análisis

### Métodos de autenticación:
- **Password Auth** - Único método activo (login con correo + contraseña)
- **Magic Link** - ⚠️ **DEPRECADO** - No usar en código nuevo

---

## 🚫 Flujos congelados

Los siguientes flujos están **congelados** y no deben modificarse sin aprobación explícita:

1. **Magic Link Authentication** - Sistema deprecado, no implementar
2. **Email-only login** - No permitido (endpoint retorna 410 Gone)
3. **Auto-creación de usuarios sin verificación** - No permitido

**Estado actual**: Solo **Password Auth** está activo y soportado.

---

## 🔍 Dónde encontrar información específica

### Autenticación y seguridad:
→ `02_SECURITY/SECURITY_FINAL.md`

### Arquitectura del código:
→ `01_ARCHITECTURE/ARQUITECTURA.md`

### Base de datos y schema:
→ `01_ARCHITECTURE/DATABASE_ARCHITECTURE.md`

### Deploy y configuración:
→ `05_DEPLOYMENT/DEPLOY_CHECKLIST.md`

### Diseño UI/UX:
→ `03_UX_UI/UX_UI_CHECKLIST.md`

### Datos demo:
→ `04_DEMO_AND_SEED/DEMO_SEED.md`

---

## 📋 Documentos deprecados

Si un documento está marcado como deprecado, consulta `99_ARCHIVE/DEPRECATED.md` para:
- Razón de deprecación
- Documento de reemplazo
- Fecha de deprecación

---

## 🆘 ¿Necesitas ayuda?

### Para preguntas sobre:
- **Arquitectura**: Revisa `01_ARCHITECTURE/`
- **Seguridad**: Revisa `02_SECURITY/`
- **Deploy**: Revisa `05_DEPLOYMENT/`
- **UI/UX**: Revisa `03_UX_UI/`

### Si no encuentras la información:
1. Busca en el documento relevante de la sección
2. Revisa `99_ARCHIVE/DEPRECATED.md` para ver si fue movido
3. Consulta con el equipo de arquitectura

---

## ✅ Mantenimiento de esta documentación

Esta documentación es mantenida por el equipo de arquitectura.

**Principios:**
- ✅ Claridad sobre cleverness
- ✅ Actualización continua
- ✅ Deprecación explícita de documentos obsoletos
- ✅ Normalización de terminología

**Última actualización**: 2025-01-XX  
**Versión**: 1.0

---

**Ner LaTalmud Plataforma**  
*Sistema de Diagnóstico Académico de Guemará*
