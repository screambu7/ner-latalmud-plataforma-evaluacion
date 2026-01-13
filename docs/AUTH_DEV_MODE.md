# 🔐 Modo Desarrollo para Magic Links

## 📋 Resumen

Este documento describe el sistema de flags de desarrollo para exposición segura de magic links durante el desarrollo, cuando no hay proveedor de email configurado.

## ⚠️ IMPORTANTE: Seguridad

**Los magic links NUNCA deben exponerse en producción o preview a menos que ambos flags estén explícitamente habilitados.**

El sistema utiliza **dos flags independientes** que deben estar **ambos en `true`** para exponer magic links:

1. `AUTH_DEV_MODE=true` - Indica que estamos en modo desarrollo
2. `AUTH_DEV_EXPOSE_MAGIC_LINK=true` - Permite exposición de magic links

**`NODE_ENV` por sí solo NO es suficiente** para determinar si se debe exponer magic links.

---

## 🚩 Variables de Entorno

### Flags Requeridos

```bash
# Flag 1: Modo desarrollo
AUTH_DEV_MODE=true

# Flag 2: Permitir exposición de magic links
AUTH_DEV_EXPOSE_MAGIC_LINK=true
```

### Comportamiento

| AUTH_DEV_MODE | AUTH_DEV_EXPOSE_MAGIC_LINK | Magic Link Expuesto | Logging |
|---------------|---------------------------|---------------------|---------|
| `false` o no definido | `false` o no definido | ❌ NO | Solo email redactado (si no es dev) |
| `true` | `false` o no definido | ❌ NO | Sin logging de magic link |
| `false` o no definido | `true` | ❌ NO | Sin logging de magic link |
| `true` | `true` | ✅ SÍ | `[DEV-ONLY][MAGIC-LINK]` prefix |

---

## 🔧 Backend

### Endpoints Afectados

Los siguientes endpoints incluyen `magicLink` en la respuesta **solo si ambos flags están habilitados**:

1. **POST `/api/auth/request-link`**
   - Genera magic link para login
   - Incluye `magicLink` en respuesta si flags habilitados

2. **POST `/api/auth/forgot`**
   - Genera magic link para recuperación
   - Incluye `magicLink` en respuesta si flags habilitados

3. **POST `/api/auth/forgot-password`**
   - Genera magic link para recuperación de contraseña
   - Incluye `magicLink` en respuesta si flags habilitados

### Respuesta de API

**Cuando flags están habilitados:**
```json
{
  "success": true,
  "message": "Si el correo existe en nuestro sistema, recibirás un link de acceso en breve.",
  "magicLink": "https://app.example.com/api/auth/callback?token=..."
}
```

**Cuando flags NO están habilitados:**
```json
{
  "success": true,
  "message": "Si el correo existe en nuestro sistema, recibirás un link de acceso en breve."
}
```

### Logging

**Con flags habilitados:**
```
[DEV-ONLY][MAGIC-LINK] Link generado para: usuario@ejemplo.com
[DEV-ONLY][MAGIC-LINK] Link: https://app.example.com/api/auth/callback?token=...
```

**Sin flags habilitados:**
- No se loguea el magic link
- Solo se loguea email redactado en producción (si no es dev mode)

---

## 🎨 Frontend

### Páginas Afectadas

1. **`/login`** - Página de inicio de sesión
2. **`/forgot-password`** - Página de recuperación de contraseña

### Comportamiento

Cuando la respuesta de la API incluye `magicLink` (solo con flags habilitados), se muestra un **bloque de desarrollo** con:

- **Título**: "Modo desarrollo: acceso temporal"
- **Contenido**: Magic link como texto seleccionable (no auto-redirect)
- **Estilo**: Fondo ámbar claro, borde ámbar, claramente diferenciado del contenido normal

### Ejemplo Visual

```
┌─────────────────────────────────────────┐
│ Modo desarrollo: acceso temporal        │
│                                         │
│ Magic Link:                             │
│ ┌─────────────────────────────────────┐ │
│ │ https://app.example.com/api/auth/...│ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Características de Seguridad

- ✅ **No auto-navegación**: El link es solo texto seleccionable
- ✅ **No localStorage**: No se almacena el magic link
- ✅ **Renderizado condicional**: Solo se muestra si `magicLink` está en la respuesta
- ✅ **No altera layout**: El bloque se integra sin afectar el diseño existente

---

## 🚀 Configuración para Desarrollo

### Local Development

En tu archivo `.env.local`:

```bash
# Habilitar modo desarrollo
AUTH_DEV_MODE=true

# Permitir exposición de magic links
AUTH_DEV_EXPOSE_MAGIC_LINK=true
```

### Verificación

1. Inicia el servidor de desarrollo
2. Navega a `/login` o `/forgot-password`
3. Ingresa un correo y envía la solicitud
4. Si los flags están correctamente configurados, verás el bloque de desarrollo con el magic link

---

## 🛡️ Despliegue a Producción

### Checklist Pre-Deploy

Antes de desplegar a producción o preview:

- [ ] Verificar que `AUTH_DEV_MODE` NO está definido o está en `false`
- [ ] Verificar que `AUTH_DEV_EXPOSE_MAGIC_LINK` NO está definido o está en `false`
- [ ] Confirmar que los magic links NO aparecen en logs
- [ ] Confirmar que los magic links NO aparecen en respuestas de API
- [ ] Confirmar que el bloque de desarrollo NO se renderiza en frontend

### Variables de Entorno en Vercel

En el dashboard de Vercel:

1. Ve a **Settings** → **Environment Variables**
2. Para cada ambiente (Production, Preview, Development):
   - **NO** definir `AUTH_DEV_MODE` o establecerlo en `false`
   - **NO** definir `AUTH_DEV_EXPOSE_MAGIC_LINK` o establecerlo en `false`

### Verificación Post-Deploy

Después del despliegue:

1. Hacer una solicitud a `/api/auth/request-link` o `/api/auth/forgot-password`
2. Verificar que la respuesta **NO** incluye `magicLink`
3. Verificar que los logs **NO** contienen magic links
4. Verificar que el frontend **NO** muestra el bloque de desarrollo

---

## 🔍 Por Qué Dos Flags

### Separación de Responsabilidades

- **`AUTH_DEV_MODE`**: Indica contexto de desarrollo (puede usarse para otras features de dev)
- **`AUTH_DEV_EXPOSE_MAGIC_LINK`**: Control explícito para exposición de magic links

### Seguridad Defensa en Profundidad

Requiriendo **ambos flags en `true`**, reducimos el riesgo de:
- Exposición accidental por un solo flag mal configurado
- Confusión entre "modo desarrollo" y "exponer datos sensibles"
- Errores de configuración en diferentes ambientes

### Claridad

Dos flags explícitos hacen más obvio cuándo y por qué se están exponiendo magic links, facilitando:
- Code reviews
- Auditorías de seguridad
- Troubleshooting

---

## 📝 Notas Adicionales

### ¿Por Qué No Usar Solo NODE_ENV?

`NODE_ENV` puede ser:
- `development` en local
- `production` en Vercel (incluso en preview branches)
- `test` en tests

Usar solo `NODE_ENV` no es suficiente porque:
- Preview deployments en Vercel tienen `NODE_ENV=production`
- No queremos exponer magic links en preview
- Necesitamos control explícito y granular

### Integración con Email Provider

Cuando se implemente un proveedor de email real (Resend, SendGrid, etc.):

1. Los magic links se enviarán por email automáticamente
2. Los flags de desarrollo seguirán funcionando para desarrollo local
3. En producción, los magic links **nunca** se expondrán en respuestas API o frontend

---

## 🐛 Troubleshooting

### El magic link no aparece en desarrollo

**Verificar:**
1. ¿Ambos flags están en `true`?
   ```bash
   echo $AUTH_DEV_MODE
   echo $AUTH_DEV_EXPOSE_MAGIC_LINK
   ```
2. ¿El servidor se reinició después de cambiar las variables?
3. ¿Estás usando `.env.local` (no `.env`)?

### El magic link aparece en producción

**Acción inmediata:**
1. Verificar variables de entorno en Vercel
2. Deshabilitar ambos flags
3. Redesplegar
4. Revisar logs para detectar exposición

---

## 📚 Referencias

- [Magic Link Authentication (PR1)](./SECURITY_PR1.md)
- [Estado Actual de Autenticación](./AUTENTICACION_ESTADO_ACTUAL.md)
- [Configuración de Vercel](./VERCEL_ENV_SETUP.md)
