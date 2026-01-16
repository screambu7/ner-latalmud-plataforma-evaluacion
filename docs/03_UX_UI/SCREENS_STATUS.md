# 📱 Estado de Pantallas - Ner LaTalmud

**Inventario de pantallas y su estado de implementación**

---

## 📋 Resumen

Este documento lista todas las pantallas del sistema, su estado de implementación y qué funcionalidad falta.

---

## ✅ Pantallas Implementadas

### 1. Login (`/login`)
**Estado**: ✅ Completo

**Funcionalidad:**
- ✅ Formulario de login con correo y contraseña
- ✅ Validación de credenciales
- ✅ Redirección según rol
- ✅ Manejo de errores
- ✅ Links a "¿Olvidaste tu contraseña?" y "Crear cuenta"

**Pendiente**: Ninguno

---

### 2. Dashboard del Evaluador (`/evaluador-dashboard`)
**Estado**: ⚠️ Parcial

**Funcionalidad implementada:**
- ✅ Stats cards (Grupos Activos, Exámenes Pendientes)
- ✅ Alertas de Estancamiento
- ✅ Agenda del día
- ✅ Student Insights con gráficos de tendencia
- ✅ Navegación inferior

**Pendiente:**
- ⚠️ Conectar con datos reales de BD (actualmente usa mocks)
- ⚠️ Implementar actualización en tiempo real

---

### 3. Reporte de Progreso (`/reporte-progreso/[id]`)
**Estado**: ⚠️ Parcial

**Funcionalidad implementada:**
- ✅ Perfil del estudiante
- ✅ Resumen ejecutivo
- ✅ Gráfico radar de habilidades (SVG)
- ✅ Progreso semestral (gráfico de línea)
- ✅ Recomendaciones del Moré
- ✅ Footer oficial con sello

**Pendiente:**
- ⚠️ Conectar con datos reales de BD (actualmente usa mocks)
- ⚠️ Implementar generación de PDF real

---

### 4. Perfil de Diagnóstico (`/perfil-diagnostico/[id]`)
**Estado**: ⚠️ Parcial

**Funcionalidad implementada:**
- ✅ Mapa de habilidades (gráfico radar)
- ✅ Historial de evaluaciones
- ✅ Notas académicas
- ✅ Sistema de puntuación por niveles

**Pendiente:**
- ⚠️ Conectar con datos reales de BD (actualmente usa mocks)

---

### 5. Evaluación Activa (`/evaluar/[id]`)
**Estado**: ⚠️ Parcial

**Funcionalidad implementada:**
- ✅ Timer de evaluación
- ✅ Criterios de Lectura (estrellas)
- ✅ Criterios de Lógica (slider)
- ✅ Criterios de Traducción (botones)
- ✅ Notas rápidas con sugerencias
- ✅ Estado interactivo (client component)

**Pendiente:**
- ⚠️ Guardar evaluación en BD
- ⚠️ Validaciones de negocio
- ⚠️ Actualizar promedios del alumno

---

### 6. Centro de Generación de Reportes (`/centro-reportes`)
**Estado**: ⚠️ Parcial

**Funcionalidad implementada:**
- ✅ Selección de grupo
- ✅ Tipo de reporte (Individual/Grupal)
- ✅ Opciones de contenido (checkboxes)
- ✅ Vista previa del documento
- ✅ Exportación batch PDF

**Pendiente:**
- ⚠️ Generar PDF real
- ⚠️ Conectar con datos reales de BD

---

### 7. Dashboard del Admin (`/admin-dashboard`)
**Estado**: ✅ Completo (B2-3)

**Funcionalidad implementada:**
- ✅ Métricas globales (total alumnos, alumnos activos, total evaluaciones, evaluaciones últimos 30 días, total reportes, total PDFs)
- ✅ Métricas por escuela (total alumnos, alumnos activos, total evaluaciones, última evaluación)
- ✅ Métricas por evaluador (total evaluaciones, alumnos evaluados, promedio general, última actividad)
- ✅ Evaluaciones recientes (últimas 10)
- ✅ Alertas ejecutivas (alumnos con promedio bajo, alumnos sin evaluación reciente, escuelas inactivas)
- ✅ Accesos rápidos
- ✅ Autorización estricta (solo SUPER_ADMIN)

**Pendiente**: Ninguno

---

### 8. Gestión de Alumnos (`/alumnos`)
**Estado**: ✅ Completo

**Funcionalidad:**
- ✅ Lista de alumnos
- ✅ Crear alumno
- ✅ Editar alumno
- ✅ Eliminar alumno (baja lógica)
- ✅ Filtros y búsqueda

**Pendiente**: Ninguno

---

## ❌ Pantallas Pendientes

### 1. Sign Up (`/signup`)
**Estado**: ❌ No implementado

**Funcionalidad requerida:**
- Formulario de registro
- Validación de datos
- Creación de cuenta
- Redirección a login

---

### 2. Forgot Password (`/forgot-password`)
**Estado**: ❌ No implementado

**Funcionalidad requerida:**
- Formulario de recuperación
- Envío de email de reset
- Página de reset de contraseña

---

### 3. Mis Alumnos (`/mis-alumnos`)
**Estado**: ❌ No implementado

**Funcionalidad requerida:**
- Lista de alumnos asignados al evaluador
- Filtros y búsqueda
- Acceso rápido a evaluación

---

### 4. Gestión de Usuarios (`/usuarios`)
**Estado**: ❌ No implementado

**Funcionalidad requerida:**
- Lista de usuarios
- Crear usuario
- Editar usuario
- Asignar roles
- Activar/desactivar usuarios

---

### 5. Gestión de Escuelas (`/escuelas`)
**Estado**: ❌ No implementado

**Funcionalidad requerida:**
- Lista de escuelas
- Crear escuela
- Editar escuela
- Asociar usuarios y alumnos

---

### 6. Configuración (`/configuracion`)
**Estado**: ❌ No implementado

**Funcionalidad requerida:**
- Configuración de rúbricas
- Configuración de sistema
- Variables de entorno (solo lectura)

---

## 📊 Resumen por Estado

| Estado | Cantidad | Pantallas |
|--------|----------|-----------|
| ✅ Completo | 2 | Login, Gestión de Alumnos |
| ⚠️ Parcial | 6 | Dashboard Evaluador, Reporte, Perfil, Evaluación, Centro Reportes, Dashboard Admin |
| ❌ Pendiente | 6 | Sign Up, Forgot Password, Mis Alumnos, Usuarios, Escuelas, Configuración |

---

## 🎯 Prioridades

### Alta:
1. Conectar dashboards con datos reales
2. Implementar guardado de evaluaciones
3. Implementar generación de PDFs

### Media:
1. Implementar Sign Up
2. Implementar Forgot Password
3. Implementar Mis Alumnos

### Baja:
1. Implementar Gestión de Usuarios
2. Implementar Gestión de Escuelas
3. Implementar Configuración

---

## 📚 Referencias

- **Checklist UX/UI**: `03_UX_UI/UX_UI_CHECKLIST.md`
- **Diseño del sistema**: `01_ARCHITECTURE/DISENO_SISTEMA.md`

---

## 🧪 Pruebas Manuales - Guardado de Evaluación Activa

**Fecha**: 2025-01-XX  
**Funcionalidad**: Guardado real de evaluaciones en DB desde `/evaluar/[id]`

### Casos de Prueba

#### Caso 1: Evaluador con escuelaId evalúa alumno de su escuela ✅
**Precondiciones:**
- Usuario con rol `EVALUADOR` y `escuelaId` asignado
- Alumno con `tipo: ESCUELA` y `escuelaId` igual al del evaluador

**Pasos:**
1. Iniciar sesión como evaluador con escuela
2. Navegar a `/evaluar/[id]` donde `id` es un alumno de su escuela
3. Completar todos los campos requeridos (fluidez, precisión, lógica, vocabulario)
4. Hacer clic en "Finalizar Evaluación"

**Resultado esperado:**
- ✅ Evaluación guardada en DB
- ✅ Redirección a `/perfil-diagnostico/[id]`
- ✅ Registro `Evaluacion` creado con `evaluadorId` correcto
- ✅ Registros `EvaluacionDetalle` creados (N items)

**Verificación en DB:**
```sql
SELECT e.*, ed.* 
FROM "Evaluacion" e
LEFT JOIN "EvaluacionDetalle" ed ON e.id = ed."evaluacionId"
WHERE e."alumnoId" = [id_alumno]
ORDER BY e."creadoEn" DESC
LIMIT 1;
```

---

#### Caso 2: Evaluador con escuelaId evalúa alumno INDEPENDIENTE ✅
**Precondiciones:**
- Usuario con rol `EVALUADOR` y `escuelaId` asignado
- Alumno con `tipo: INDEPENDIENTE`

**Pasos:**
1. Iniciar sesión como evaluador con escuela
2. Navegar a `/evaluar/[id]` donde `id` es un alumno independiente
3. Completar todos los campos requeridos
4. Hacer clic en "Finalizar Evaluación"

**Resultado esperado:**
- ✅ Evaluación guardada en DB (debe permitir)
- ✅ Redirección exitosa

---

#### Caso 3: Evaluador sin escuelaId evalúa alumno de escuela ❌
**Precondiciones:**
- Usuario con rol `EVALUADOR` y `escuelaId: NULL`
- Alumno con `tipo: ESCUELA` y `escuelaId` asignado

**Pasos:**
1. Iniciar sesión como evaluador sin escuela
2. Navegar a `/evaluar/[id]` donde `id` es un alumno de escuela
3. Completar todos los campos requeridos
4. Hacer clic en "Finalizar Evaluación"

**Resultado esperado:**
- ❌ Error 403: "No autorizado: solo puedes evaluar alumnos independientes"
- ❌ No se crea registro en DB
- ❌ No hay redirección

---

#### Caso 4: Evaluador sin escuelaId evalúa alumno INDEPENDIENTE ✅
**Precondiciones:**
- Usuario con rol `EVALUADOR` y `escuelaId: NULL`
- Alumno con `tipo: INDEPENDIENTE`

**Pasos:**
1. Iniciar sesión como evaluador sin escuela
2. Navegar a `/evaluar/[id]` donde `id` es un alumno independiente
3. Completar todos los campos requeridos
4. Hacer clic en "Finalizar Evaluación"

**Resultado esperado:**
- ✅ Evaluación guardada en DB
- ✅ Redirección exitosa

---

#### Caso 5: SUPER_ADMIN evalúa cualquier alumno ✅
**Precondiciones:**
- Usuario con rol `SUPER_ADMIN`
- Alumno (cualquier tipo)

**Pasos:**
1. Iniciar sesión como SUPER_ADMIN
2. Navegar a `/evaluar/[id]` donde `id` es cualquier alumno
3. Completar todos los campos requeridos
4. Hacer clic en "Finalizar Evaluación"

**Resultado esperado:**
- ✅ Evaluación guardada en DB (sin restricciones de scoping)
- ✅ Redirección exitosa

---

#### Caso 6: Payload inválido - campos faltantes ❌
**Precondiciones:**
- Usuario autenticado con rol válido
- Alumno válido

**Pasos:**
1. Navegar a `/evaluar/[id]`
2. Dejar campos requeridos sin completar (ej: fluidez = 0)
3. Hacer clic en "Finalizar Evaluación"

**Resultado esperado:**
- ❌ Error de validación: "Debe seleccionar la fluidez de lectura"
- ❌ Botón deshabilitado si validación frontend funciona
- ❌ No se envía request al servidor si validación frontend funciona

---

#### Caso 7: Payload inválido - nivel fuera de rango ❌
**Precondiciones:**
- Usuario autenticado
- Alumno válido

**Pasos:**
1. Navegar a `/evaluar/[id]`
2. Modificar payload manualmente (si es posible) para enviar `nivel: 5` o `nivel: 0`
3. Intentar guardar

**Resultado esperado:**
- ❌ Error 400: "Nivel debe ser un entero entre 1 y 4"
- ❌ `fieldErrors` con clave `detalles.[index].nivel`
- ❌ No se crea registro en DB

---

#### Caso 8: Alumno inexistente ❌
**Precondiciones:**
- Usuario autenticado

**Pasos:**
1. Navegar a `/evaluar/99999` (ID que no existe)
2. Completar formulario
3. Intentar guardar

**Resultado esperado:**
- ❌ Error: "Alumno no encontrado"
- ❌ No se crea registro en DB

---

### Comandos de Verificación (PostgreSQL/Supabase)

```sql
-- Ver última evaluación creada
SELECT 
  e.id,
  e."alumnoId",
  e."evaluadorId",
  e.tipo,
  e.fecha,
  COUNT(ed.id) as total_detalles
FROM "Evaluacion" e
LEFT JOIN "EvaluacionDetalle" ed ON e.id = ed."evaluacionId"
GROUP BY e.id
ORDER BY e."creadoEn" DESC
LIMIT 5;

-- Ver detalles de una evaluación específica
SELECT 
  ed.id,
  ed."evaluacionId",
  ed.subhabilidad,
  ed.nivel,
  ed."creadoEn"
FROM "EvaluacionDetalle" ed
WHERE ed."evaluacionId" = [id_evaluacion]
ORDER BY ed."creadoEn";
```

### Pruebas con cURL (opcional)

```bash
# Caso exitoso (requiere cookie de sesión válida)
curl -X POST http://localhost:3000/api/evaluaciones \
  -H "Content-Type: application/json" \
  -H "Cookie: session=[JWT_TOKEN]" \
  -d '{
    "alumnoId": 1,
    "tipo": "GV_HA_FACIL_NK",
    "detalles": [
      {"subhabilidad": "fluidez_lectura", "nivel": 3},
      {"subhabilidad": "precision_dikduk", "nivel": 2}
    ]
  }'
```

---

---

## 🧪 Pruebas Manuales - Admin Dashboard (B2-3)

**Fecha**: 2025-01-XX  
**Funcionalidad**: Dashboard administrativo con datos reales de Prisma

### Casos de Prueba

#### Caso 1: SUPER_ADMIN accede al dashboard ✅
**Precondiciones:**
- Usuario con rol `SUPER_ADMIN` autenticado
- Base de datos con datos de prueba (alumnos, evaluaciones, escuelas, etc.)

**Pasos:**
1. Iniciar sesión como SUPER_ADMIN
2. Navegar a `/admin-dashboard`

**Resultado esperado:**
- ✅ Dashboard carga sin errores
- ✅ Métricas globales muestran números reales
- ✅ Tabla de métricas por escuela muestra datos reales
- ✅ Tabla de métricas por evaluador muestra datos reales
- ✅ Evaluaciones recientes muestra últimas 10 evaluaciones
- ✅ Alertas ejecutivas muestran alertas si aplican

**Verificación en DB:**
```sql
-- Verificar métricas globales
SELECT 
  (SELECT COUNT(*) FROM "Alumno") as total_alumnos,
  (SELECT COUNT(*) FROM "Alumno" WHERE status = 'ACTIVO') as alumnos_activos,
  (SELECT COUNT(*) FROM "Evaluacion") as total_evaluaciones,
  (SELECT COUNT(*) FROM "Evaluacion" WHERE fecha >= NOW() - INTERVAL '30 days') as evaluaciones_30_dias,
  (SELECT COUNT(*) FROM "Reporte") as total_reportes,
  (SELECT COUNT(*) FROM "Archivo" WHERE tipo = 'PDF_REPORTE') as total_pdfs;
```

---

#### Caso 2: EVALUADOR intenta acceder al dashboard ❌
**Precondiciones:**
- Usuario con rol `EVALUADOR` autenticado

**Pasos:**
1. Iniciar sesión como EVALUADOR
2. Intentar navegar a `/admin-dashboard` (directamente o por URL)

**Resultado esperado:**
- ❌ Error 403: "Acceso Denegado"
- ❌ Mensaje: "No tienes permisos para acceder a esta página"
- ❌ No se muestran datos del dashboard
- ❌ No se ejecutan queries a la base de datos

---

#### Caso 3: Usuario no autenticado intenta acceder ❌
**Precondiciones:**
- Sin sesión activa

**Pasos:**
1. Cerrar sesión (o no iniciar sesión)
2. Intentar navegar a `/admin-dashboard`

**Resultado esperado:**
- ❌ Redirección a `/login`
- ❌ No se muestran datos del dashboard

---

### Verificación de Queries SQL

#### Query 1: Métricas por Escuela
```sql
SELECT 
  e.id,
  e.nombre,
  COUNT(DISTINCT a.id) as total_alumnos,
  COUNT(DISTINCT CASE WHEN a.status = 'ACTIVO' THEN a.id END) as alumnos_activos,
  COUNT(DISTINCT ev.id) as total_evaluaciones,
  MAX(ev.fecha) as ultima_evaluacion
FROM "Escuela" e
LEFT JOIN "Alumno" a ON a."escuelaId" = e.id
LEFT JOIN "Evaluacion" ev ON ev."alumnoId" = a.id
GROUP BY e.id, e.nombre
ORDER BY MAX(ev.fecha) DESC NULLS LAST;
```

#### Query 2: Métricas por Evaluador
```sql
SELECT 
  u.id,
  u.nombre,
  u.correo,
  COUNT(DISTINCT ev.id) as total_evaluaciones,
  COUNT(DISTINCT ev."alumnoId") as alumnos_evaluados,
  MAX(ev.fecha) as ultima_actividad
FROM "Usuario" u
LEFT JOIN "Evaluacion" ev ON ev."evaluadorId" = u.id
WHERE u.rol = 'EVALUADOR'
GROUP BY u.id, u.nombre, u.correo
ORDER BY MAX(ev.fecha) DESC NULLS LAST;
```

#### Query 3: Evaluaciones Recientes
```sql
SELECT 
  e.id,
  e.fecha,
  e.tipo,
  a.nombre as alumno_nombre,
  u.nombre as evaluador_nombre,
  u.correo as evaluador_correo
FROM "Evaluacion" e
JOIN "Alumno" a ON e."alumnoId" = a.id
JOIN "Usuario" u ON e."evaluadorId" = u.id
ORDER BY e.fecha DESC
LIMIT 10;
```

### Comparación de Resultados

**Verificación manual:**
1. Ejecutar las queries SQL anteriores en la base de datos
2. Comparar los resultados con los números mostrados en el dashboard
3. Verificar que los conteos coincidan
4. Verificar que el ordenamiento sea correcto (última evaluación/actividad DESC NULLS LAST)

**Nota:** El promedio general por evaluador se calcula usando las funciones canónicas de `calculos.ts`, por lo que puede diferir ligeramente de un cálculo SQL directo. Esto es esperado y correcto.

---

**Última actualización**: 2025-01-XX  
**Versión**: 1.1
