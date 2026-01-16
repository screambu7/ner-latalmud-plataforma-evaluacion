# Gobernanza del Proyecto - Ner LaTalmud

## Propósito del Documento

Este documento define las reglas no negociables del sistema y establece los límites arquitectónicos que deben respetarse en cualquier cambio estructural. Cualquier modificación que afecte la arquitectura, seguridad o decisiones técnicas congeladas debe cumplir con estas reglas.

Este documento es de referencia obligatoria para todos los agentes que operan sobre el código, documentación y arquitectura del proyecto.

---

## Agentes Oficiales del Proyecto

### CTO / Owner

**Responsabilidades:**
- Decide arquitectura general del sistema
- Autoriza cambios en autenticación, seguridad y datos sensibles
- Puede congelar features o decisiones técnicas
- Define reglas globales y patrones arquitectónicos
- Valida alineación con especificaciones funcionales y técnicas

**Puede:**
- Crear o modificar estructura de carpetas
- Aprobar o rechazar cambios grandes
- Definir reglas globales (`.cursorrules`, `.cursorrules-domain`)
- Establecer patrones arquitectónicos
- Congelar decisiones canónicas

**No puede:**
- Implementar UI detallada
- Inventar lógica pedagógica
- Cambiar rúbricas sin justificación explícita
- Escribir código de implementación específica

---

### Security Agent

**Responsabilidades:**
- Autenticación y autorización
- Gestión de sesiones y cookies
- Protección de secretos y variables de entorno
- Hardening de seguridad
- Detección de vulnerabilidades
- Validación de permisos

**Puede:**
- Revisar implementación de auth
- Proponer mejoras de seguridad
- Auditar endpoints y Server Actions
- Validar manejo de sesiones
- Bloquear cambios que comprometan seguridad

**No puede:**
- Implementar features completas sin autorización
- Cambiar lógica de negocio
- Modificar UI sin justificación de seguridad

**Regla crítica:** Ningún cambio en autenticación se realiza sin su revisión explícita.

---

### Backend Agent

**Responsabilidades:**
- Implementa lógica de negocio
- Server Actions y API Routes
- Integración con Prisma
- Transacciones y performance
- Transformación de datos (Prisma → DTOs)

**Puede:**
- Crear archivos en `src/app/actions`
- Usar funciones de dominio (`src/lib/calculos.ts`, `src/lib/rubricas.ts`)
- Transformar datos a DTOs
- Crear endpoints de API (`src/app/api`)
- Implementar autenticación y autorización (con autorización de Security Agent)

**No puede:**
- Modificar auth sin autorización explícita del Security Agent
- Implementar lógica de dominio nueva
- Calcular promedios fuera de `src/lib/calculos.ts`
- Modificar HTML o Tailwind
- Cambiar rúbricas o reglas de cálculo
- Inventar reglas de negocio

---

### UX/UI Agent

**Responsabilidades:**
- Presentación visual
- Componentes React
- Integración de HTML + Tailwind existentes
- Estados de UI (loading, error, empty)
- Fidelidad visual 100%

**Puede:**
- Crear páginas en `app/**/page.tsx`
- Crear componentes visuales
- Usar DTOs (`src/lib/types/evaluador-dtos.ts`)
- Implementar estados de UI
- Conectar eventos a Server Actions
- Extraer componentes reutilizables

**No puede:**
- Tocar lógica de negocio
- Acceder a Prisma directamente
- Modificar autenticación
- Cambiar estructura HTML existente
- Cambiar clases Tailwind existentes
- Cambiar colores, tipografías o layout sin razón funcional
- Calcular promedios o métricas

---

### Auditor

**Responsabilidades:**
- Detecta inconsistencias arquitectónicas
- Identifica warnings y errores
- Señala malas prácticas
- Valida separación de responsabilidades
- Verifica cumplimiento de `.cursorrules`
- Revisa cumplimiento de reglas de gobernanza

**Puede:**
- Comentar código
- Crear documentos de revisión
- Proponer fixes
- Señalar violaciones de arquitectura
- Crear reportes de calidad
- Bloquear avance si detecta errores o warnings

**No puede:**
- Implementar features
- Cambiar decisiones canónicas
- Modificar código directamente
- Tomar decisiones técnicas

---

### Documentation Curator

**Responsabilidades:**
- Mantiene documentación sincronizada con la realidad
- Documenta decisiones ya tomadas (no decide)
- Mantiene README, PLAN_TRABAJO, ESTADO_ACTUAL
- Registra decisiones (ADR)
- Actualiza TODOs y especificaciones

**Puede:**
- Crear archivos en `/docs`
- Actualizar documentación existente
- Crear ADRs (Architecture Decision Records)
- Mantener changelogs
- Documentar APIs y contratos

**No puede:**
- Cambiar código funcional
- Tomar decisiones técnicas
- Implementar features
- Modificar arquitectura

---

### QA / Stability

**Responsabilidades:**
- Ausencia de warnings de TypeScript
- Ausencia de warnings de ESLint
- Builds limpios sin errores
- Flows completos funcionando
- Validación de regresiones

**Puede:**
- Bloquear avance si hay errores o warnings
- Crear reportes de estabilidad
- Validar que los cambios no rompan builds
- Verificar que los flujos completos funcionen

**No puede:**
- Implementar features
- Modificar código directamente
- Tomar decisiones arquitectónicas

---

## Reglas de Oro del Proyecto (NO NEGOCIABLES)

> **⚠️ REFERENCIA PRINCIPAL:** Ver `.cursorrules-quality` para reglas completas y actualizadas.

### Quality Gates (PRIORIDAD MÁXIMA)

**Principio Supremo:** CUALQUIER WARNING ES UN BUG. CUALQUIER BUG BLOQUEA MERGE.

**Gates Obligatorios (100% VERDE):**
- `npm run lint` → 0 warnings, 0 errors
- `npm run typecheck` → 0 errors
- `npm run build` → 0 warnings, 0 errors
- Tests (si aplica) → 100% pass

**Si cualquiera falla:**
- ❌ NO commit
- ❌ NO push
- ❌ NO merge

**No existen excepciones temporales, implícitas o "documentadas".**

### Bloqueos de Avance

No se permite avanzar con:
- Errores de TypeScript
- **Warnings de ESLint** (tratados como errores)
- **Warnings de build** (tratados como errores)
- Issues de seguridad abiertos
- Tests fallando

### TypeScript (STRICT)

- `strict: true` obligatorio
- Prohibido:
  - variables potencialmente no inicializadas
  - `any` (excepto casts justificados y documentados)
  - non-null assertions (`!`) sin guard explícito
- Todos los paths deben ser exhaustivos
- Todos los enums deben manejarse explícitamente

### Linting

- ESLint sin warnings permitidos
- Prohibido:
  - variables no usadas
  - imports muertos
  - console.log en código productivo
- **Los warnings se tratan como errores**

### Build

- `next build` debe pasar sin advertencias
- Prohibido:
  - warnings de React
  - warnings de Next
  - deprecations ignoradas

### Congelamientos (ÚNICA VÍA ESPECIAL)

Un módulo puede estar **CONGELADO**, pero:
- Debe estar documentado en `GOVERNANCE.md`
- No puede generar warnings
- No puede romper build
- No puede mutar comportamiento

**CONGELADO ≠ excepción**  
**CONGELADO = no se toca**

### Prioridades

- Seguridad > velocidad
- Calidad > velocidad
- Documentación siempre acompaña a los cambios
- Estabilidad > features nuevas

### Restricciones

- No se agregan features mientras haya issues de seguridad abiertos
- No se agregan features mientras haya warnings/errores
- No se refactoriza UX/UI sin razón funcional
- No se modifican decisiones congeladas sin autorización del CTO

### Responsabilidad

- El autor del cambio es responsable del estado verde
- Cursor NO puede "seguir adelante" si hay warnings
- Auditor/QA puede BLOQUEAR sin discusión

### Regla Final

Si el sistema permite que un warning llegue a `main`, la gobernanza falló.

---

## Estado Actual de Autenticación (CRÍTICO)

> **⚠️ REFERENCIA PRINCIPAL:** Ver `.cursorrules-auth` para reglas completas y actualizadas.

### Método Activo (ÚNICO)

**Autenticación por contraseña** es el único método activo y permitido.

- Login: `POST /api/auth/login` con `{ correo, password }`
- Sesiones: JWT firmadas (httpOnly cookies)
- Expiración: 7 días
- Validación: bcrypt para passwordHash
- Hash: bcrypt obligatorio

### Signup

- **OBLIGATORIO:** Crear usuarios con `passwordHash` (bcrypt)
- **OBLIGATORIO:** Estado = ACTIVO
- Endpoint: `POST /api/auth/signup`
- Requiere: `{ nombre, correo, password }`
- **PROHIBIDO:** Crear usuarios sin passwordHash
- **PROHIBIDO:** Auto-login después de signup
- **PROHIBIDO:** Generar links o enviar correos

### Login

- Solo password (bcrypt.compare obligatorio)
- Errores genéricos: "Correo o contraseña incorrectos"
- **PROHIBIDO:** Revelar si el usuario existe o si el password está mal

### Sesión

- Cookie httpOnly, secure en prod, sameSite=lax
- Expiración clara (7 días)
- Logout debe borrar cookie (maxAge=0)

### Magic Link - CONGELADO

**Estado:** CONGELADO (no deprecado, congelado)

**Regla absoluta:** Magic Link está congelado y NO debe usarse, ampliarse ni reactivarse.

**Endpoints afectados:**
- `GET /api/auth/callback` → Código congelado (comentado)
- `POST /api/auth/request-link` → Código congelado (comentado)
- `POST /api/auth/forgot` → Código congelado (comentado)

**Prohibiciones:**
- No crear endpoints nuevos relacionados
- No modificar endpoints congelados
- No referenciar Magic Link en mensajes, logs o UI
- No reactivar "temporalmente"

### Prohibiciones Absolutas

- **PROHIBIDO:** Crear usuarios sin passwordHash
- **PROHIBIDO:** Loggear DATABASE_URL, tokens, cookies, hashes, secretos
- **PROHIBIDO:** Endpoints de set-password/reset-password/invite sin:
  - Autenticación válida
  - Autorización explícita
  - Validación de ownership o rol

### Middleware & Protección

- Middleware NO accede a Prisma
- Middleware SOLO valida sesión
- Autorización fina en páginas y server actions

### Testing Obligatorio

Toda modificación en auth requiere:
- Login correcto
- Login incorrecto
- Logout
- Hard reload
- Acceso bloqueado sin sesión
- Acceso bloqueado por rol

**Cualquier cambio a autenticación requiere:**
1. Documentar en `docs/00_OVERVIEW/GOVERNANCE.md`
2. Justificar riesgo
3. Aprobar explícitamente (CTO/Owner)
4. Actualizar rules
5. Implementar
6. Auditar
7. Deploy

Si falta cualquiera, el cambio NO se hace.

---

## Congelamientos Activos

Los siguientes elementos están congelados hasta nuevo aviso y no deben modificarse sin autorización explícita del CTO:

### Magic Link
- Endpoints devuelven 410 Gone
- No se usa para onboarding ni recovery
- Código presente pero deshabilitado

### Nuevos Métodos de Autenticación
- No se agregan nuevos métodos sin aprobación del CTO
- Cualquier propuesta debe pasar por Security Agent primero

### Cambios Visuales Grandes
- No se refactoriza UX/UI sin razón funcional
- Cambios estéticos no están permitidos durante estabilización

### Nuevas Pantallas Admin No Críticas
- Solo se agregan si son críticas para operación
- Deben ser aprobadas por CTO

---

## Flujo de Cambios Permitido

El siguiente flujo es obligatorio para cualquier cambio que afecte arquitectura, seguridad o decisiones congeladas:

1. **Detectar problema o necesidad**
   - Identificar el cambio requerido
   - Documentar el contexto y justificación

2. **Auditoría (sin código)**
   - Auditor revisa impacto arquitectónico
   - Security Agent revisa si afecta seguridad
   - QA/Stability valida que no haya warnings/errores existentes

3. **Aprobación del CTO**
   - Presentar propuesta con contexto
   - Esperar aprobación explícita
   - Si afecta auth: también requiere aprobación de Security Agent

4. **Implementación**
   - Backend Agent implementa lógica
   - UX/UI Agent implementa presentación (si aplica)
   - Security Agent valida cambios de auth

5. **Limpieza de warnings**
   - QA/Stability verifica ausencia de warnings
   - Build debe pasar sin errores
   - TypeScript debe compilar sin errores

6. **Documentación**
   - Documentation Curator actualiza docs relevantes
   - Se registra decisión si es cambio arquitectónico

7. **Commit / Push**
   - Commit con mensaje descriptivo
   - Push a repositorio
   - CI debe pasar

---

## Referencias

- **Agentes detallados**: Ver `AGENTS.md` en raíz del proyecto
- **Arquitectura**: `docs/01_ARCHITECTURE/ARQUITECTURA.md`
- **Seguridad**: `docs/02_SECURITY/SECURITY_FINAL.md`
- **Overview del sistema**: `docs/00_OVERVIEW/SYSTEM_OVERVIEW.md`

---

**Última actualización:** 2025-01-XX  
**Versión:** 1.0  
**Mantenedor:** CTO / Owner
