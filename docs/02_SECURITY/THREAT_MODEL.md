# 🛡️ Modelo de Amenazas - Ner LaTalmud

**Análisis de Seguridad y Amenazas**

---

## 📋 Resumen

Este documento describe las amenazas identificadas, mitigaciones implementadas y riesgos aceptables del sistema.

---

## 🔒 Amenazas Identificadas

### 1. Autenticación Débil
**Amenaza**: Acceso no autorizado mediante credenciales comprometidas o sesiones falsificadas.

**Mitigación implementada:**
- ✅ Password Auth con hash bcrypt
- ✅ JWT sessions firmadas (httpOnly cookies)
- ✅ Expiración de sesiones (7 días)
- ✅ Validación de estado de usuario en cada request

**Riesgo residual**: Bajo

---

### 2. Elevación de Privilegios
**Amenaza**: Usuario con rol EVALUADOR intenta acceder a funcionalidades de SUPER_ADMIN.

**Mitigación implementada:**
- ✅ Middleware valida rol en JWT
- ✅ API Routes validan rol con `requireRole()`
- ✅ Páginas validan rol con `protectPage()`
- ✅ Scoping de datos por rol

**Riesgo residual**: Bajo (limitado por role staleness en middleware)

---

### 3. Acceso No Autorizado a Datos
**Amenaza**: Evaluador accede a datos de alumnos de otras escuelas o evaluaciones de otros evaluadores.

**Mitigación implementada:**
- ✅ Scoping de evaluaciones por escuela
- ✅ Validación de relación evaluador-alumno
- ✅ SUPER_ADMIN puede ver todo, EVALUADOR solo sus datos

**Riesgo residual**: Bajo

---

### 4. Path Traversal en Descarga de Archivos
**Amenaza**: Acceso a archivos fuera del directorio permitido mediante path traversal.

**Mitigación implementada:**
- ✅ Normalización de rutas (eliminar `..`)
- ✅ Validación que ruta resuelta esté dentro del directorio permitido
- ✅ Sanitización de nombres de archivo para headers HTTP

**Riesgo residual**: Bajo

---

### 5. Rate Limiting No Implementado
**Amenaza**: Abuso de endpoints de autenticación mediante múltiples requests.

**Estado**: ⚠️ **NO implementado**

**Riesgo**: Medio

**Mitigación temporal**:
- Monitoreo de logs
- Bloqueo manual de IPs si es necesario

**Recomendación futura**:
- Implementar rate limiting por IP y por email
- Máximo 3 requests por email cada 15 minutos
- Máximo 10 requests por IP cada 15 minutos

---

### 6. Email Provider No Implementado
**Amenaza**: Magic links no se envían por email (solo se loguean).

**Estado**: ⚠️ **NO aplicable** - Magic Link está deprecado

**Nota**: El sistema actual usa Password Auth, no Magic Links.

---

### 7. Token Cleanup No Implementado
**Amenaza**: Tokens expirados se acumulan en BD.

**Estado**: ⚠️ **NO implementado**

**Riesgo**: Bajo (no crítico, pero debería limpiarse)

**Impacto**: Acumulación de datos en BD

**Recomendación futura**:
- Job periódico para limpiar tokens expirados
- `DELETE FROM LoginToken WHERE expiresAt < NOW() AND usedAt IS NULL`

---

## ✅ Controles de Seguridad Implementados

### Autenticación:
- ✅ Password Auth con hash bcrypt
- ✅ JWT sessions firmadas
- ✅ Cookies httpOnly y secure en producción
- ✅ Expiración de sesiones

### Autorización:
- ✅ Validación de roles en múltiples capas
- ✅ Scoping de datos por rol
- ✅ Protección de rutas por middleware y páginas

### Datos:
- ✅ Validación de inputs
- ✅ Sanitización de paths
- ✅ Protección contra SQL injection (Prisma)

### Logs:
- ✅ Emails redactados en logs de producción
- ✅ Logs estructurados sin datos sensibles

---

## ⚠️ Riesgos Aceptables

### 1. Role Staleness en Middleware
**Problema**: Cambios de rol no se reflejan en middleware hasta que expire JWT (7 días).

**Mitigación**: Rutas API validan estado actual.

**Aceptable**: Trade-off por Edge Runtime compatibility.

---

### 2. Rate Limiting No Implementado
**Problema**: No hay límite de requests a endpoints de autenticación.

**Mitigación temporal**: Monitoreo manual.

**Aceptable**: Para MVP, implementar en producción.

---

### 3. Token Cleanup No Implementado
**Problema**: Tokens expirados se acumulan en BD.

**Impacto**: Acumulación de datos (no crítico).

**Aceptable**: Para MVP, implementar job periódico en producción.

---

## 🔍 Recomendaciones Futuras

### Corto plazo:
1. Implementar rate limiting en endpoints de autenticación
2. Implementar job periódico para limpieza de tokens
3. Agregar logging de intentos de acceso no autorizado

### Mediano plazo:
1. Implementar 2FA (opcional)
2. Implementar auditoría de cambios críticos
3. Implementar alertas de seguridad

### Largo plazo:
1. Implementar WAF (Web Application Firewall)
2. Implementar DDoS protection
3. Implementar security scanning automatizado

---

## 📚 Referencias

- **Seguridad final**: `02_SECURITY/SECURITY_FINAL.md`
- **Flujo de autenticación**: `02_SECURITY/AUTH_FLOW.md`
- **Arquitectura de auth**: `02_SECURITY/AUTH_ARCHITECTURE.md`

---

**Última actualización**: 2025-01-XX  
**Versión**: 1.0
