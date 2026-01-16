# 🔐 Modelo de Permisos - Ner LaTalmud

**Sistema de Roles y Permisos**

---

## 📋 Resumen

El sistema utiliza un modelo de permisos basado en **roles**. Cada usuario tiene un rol que determina sus permisos y acceso a funcionalidades.

---

## 👥 Roles Disponibles

### SUPER_ADMIN
Administrador principal del sistema con acceso completo.

**Permisos:**
- ✅ Acceso a todas las rutas y funcionalidades
- ✅ Gestión completa de usuarios (crear, editar, eliminar)
- ✅ Gestión completa de alumnos (crear, editar, eliminar)
- ✅ Gestión completa de escuelas
- ✅ Ver todas las evaluaciones (de todos los evaluadores)
- ✅ Generar reportes globales
- ✅ Configuración del sistema
- ✅ Acceso a estadísticas globales

**Rutas protegidas:**
- `/admin-dashboard`
- `/alumnos/*`
- `/usuarios/*`
- `/evaluaciones/*`
- `/reportes/*`
- `/configuracion/*`

### EVALUADOR
Usuario que realiza evaluaciones de alumnos.

**Permisos:**
- ✅ Ver sus alumnos asignados
- ✅ Crear evaluaciones para sus alumnos
- ✅ Ver sus propias evaluaciones
- ✅ Generar reportes de sus alumnos
- ❌ NO puede gestionar usuarios
- ❌ NO puede gestionar escuelas
- ❌ NO puede ver evaluaciones de otros evaluadores
- ❌ NO puede acceder a configuración del sistema

**Rutas protegidas:**
- `/evaluador-dashboard`
- `/mis-alumnos/*`
- `/evaluar/*`
- `/perfil-diagnostico/*`
- `/reporte-progreso/*`
- `/centro-reportes/*`

---

## 🔒 Implementación Técnica

### Asignación de Roles

Los roles se asignan automáticamente según:

1. **SUPER_ADMIN**: 
   - Emails definidos en variable de entorno `SUPER_ADMIN_EMAILS`
   - Separados por comas: `email1@example.com,email2@example.com`
   - Se asigna automáticamente al crear/usar cuenta

2. **EVALUADOR**:
   - Todos los demás usuarios
   - Asignado por defecto si no está en `SUPER_ADMIN_EMAILS`

### Validación de Permisos

#### En Middleware (`src/middleware.ts`):
- Valida JWT y rol
- Redirige según rol
- NO consulta BD (Edge Runtime)

#### En API Routes:
- Usa `requireRole()` de `src/lib/auth.ts`
- Valida rol y estado del usuario
- Consulta BD para estado actual

#### En Páginas:
- Usa `protectPage()` de `src/lib/page-protection.ts`
- Valida rol y estado
- Redirige si no tiene permisos

---

## 🛡️ Protección de Rutas

### Rutas Públicas:
- `/login` - Página de login
- `/api/auth/login` - Endpoint de login
- `/api/auth/logout` - Endpoint de logout

### Rutas Protegidas por SUPER_ADMIN:
```
/admin-dashboard
/alumnos/*
/usuarios/*
/evaluaciones/*
/reportes/*
/configuracion/*
```

### Rutas Protegidas por EVALUADOR:
```
/evaluador-dashboard
/mis-alumnos/*
/evaluar/*
/perfil-diagnostico/*
/reporte-progreso/*
/centro-reportes/*
```

---

## 🔍 Scoping de Datos

### SUPER_ADMIN:
- Ve **todos** los datos del sistema
- Puede acceder a cualquier alumno, evaluación o reporte

### EVALUADOR:
- Ve **solo** sus alumnos asignados
- Puede crear evaluaciones **solo** para:
  - Alumnos de su misma escuela (si tiene escuela)
  - Alumnos independientes (si no tiene escuela)
- NO puede ver evaluaciones de otros evaluadores
- NO puede acceder a alumnos de otras escuelas

---

## ⚠️ Limitaciones Conocidas

### Role Staleness en Middleware
**Problema**: Si un usuario es degradado/desactivado, el JWT sigue válido hasta expirar (7 días).

**Mitigación**:
- Las rutas API validan el estado actual usando `getCurrentUser()`
- Solo el middleware (redirección) puede permitir acceso temporal
- Las páginas protegidas también validan con `getCurrentUser()`

**Aceptable**: Trade-off necesario para Edge Runtime compatibility.

---

## 📝 Helpers de Permisos

### `requireRole(rol: Rol)`
Valida que el usuario actual tenga el rol especificado.

```typescript
import { requireRole } from '@/lib/auth';
import { Rol } from '@prisma/client';

const user = await requireRole(Rol.SUPER_ADMIN);
// Si no tiene el rol, lanza error automáticamente
```

### `protectPage(rol: Rol)`
Protege una página server component.

```typescript
import { protectPage } from '@/lib/page-protection';
import { Rol } from '@prisma/client';

export default async function MiPage() {
  await protectPage(Rol.EVALUADOR);
  // Si no tiene el rol, redirige automáticamente
  // ...
}
```

### `getCurrentUser()`
Obtiene el usuario actual validando JWT y consultando BD.

```typescript
import { getCurrentUser } from '@/lib/auth';

const user = await getCurrentUser();
if (!user) {
  redirect('/login');
}
```

---

## 🔄 Flujo de Validación

```
1. Usuario hace request
   ↓
2. Middleware valida JWT y rol (sin BD)
   ↓
3. Si válido → Permite acceso a ruta
   ↓
4. API Route / Page valida con requireRole() / protectPage()
   ↓
5. Consulta BD para estado actual del usuario
   ↓
6. Si válido → Ejecuta lógica
   Si inválido → Retorna 403 / Redirige
```

---

## 📚 Referencias

- **Autenticación**: `02_SECURITY/SECURITY_FINAL.md`
- **Arquitectura**: `01_ARCHITECTURE/ARQUITECTURA.md`
- **Base de datos**: `01_ARCHITECTURE/DATABASE_ARCHITECTURE.md`

---

**Última actualización**: 2025-01-XX  
**Versión**: 1.0
