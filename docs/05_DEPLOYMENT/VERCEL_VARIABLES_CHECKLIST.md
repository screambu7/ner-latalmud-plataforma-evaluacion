# 🔍 Checklist de Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Verificación de Variables

Este documento te ayuda a verificar y configurar las variables de entorno correctas en Vercel.

## 📋 Variables Requeridas

### 1. `JWT_SECRET` ✅ (CORRECTA - Esta es la que usa el código)

**Estado**: ⚠️ **DEBE estar configurada**

**Uso en código**: 
- `src/lib/jwt.ts` → `process.env.JWT_SECRET`
- Usado para firmar tokens JWT de sesión

**Cómo verificar en Vercel**:
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto: `ner-latalmud-plataforma-evaluacion`
3. Settings → Environment Variables
4. Busca `JWT_SECRET`

**Si NO existe**:
- Genera un nuevo secreto: `openssl rand -base64 32`
- Agrega la variable con el valor generado
- Aplica a: Production, Preview, Development

**Valor generado sugerido**:
```
TUY+JW7Vy9hydfS+IOwTUICkigSj0bpufPyS28q7klM=
```

---

### 2. `SUPABASE_JWT_SECRET` ❌ (NO SE USA - Puede eliminarse)

**Estado**: ⚠️ **Esta variable NO se usa en el código**

**Verificación**:
- Busca en el código: `grep -r "SUPABASE_JWT_SECRET" src/`
- Resultado esperado: **No se encuentra**

**Recomendación**: 
- Si existe en Vercel, puedes eliminarla (no afecta el funcionamiento)
- O renombrarla a `JWT_SECRET` si contiene el valor correcto

---

### 3. `SUPER_ADMIN_EMAILS` ✅ (REQUERIDA)

**Estado**: ⚠️ **DEBE estar configurada**

**Uso en código**:
- `src/config/super-admins.ts` → `process.env.SUPER_ADMIN_EMAILS`
- Usado para asignar rol SUPER_ADMIN

**Formato**: `email1@example.com,email2@example.com` (sin espacios)

**Valor sugerido**:
```
teddy@nerlatalmud.com,moshe@nerlatalmud.com
```

**Cómo verificar en Vercel**:
1. Settings → Environment Variables
2. Busca `SUPER_ADMIN_EMAILS`

**Si NO existe**:
- Agrega la variable con tus emails (separados por comas)
- Aplica a: Production, Preview, Development

---

### 4. `DATABASE_URL` ✅ (Ya configurada)

**Estado**: ✅ **Ya está configurada**

**Verificación**: Ya la tienes configurada según tu mensaje anterior.

---

## 🔧 Pasos para Configurar

### Paso 1: Verificar Variables Existentes

1. Ve a: https://vercel.com/dashboard
2. Proyecto: `ner-latalmud-plataforma-evaluacion`
3. Settings → Environment Variables
4. Anota qué variables tienes:
   - [ ] `JWT_SECRET` → ¿Existe? _______
   - [ ] `SUPABASE_JWT_SECRET` → ¿Existe? _______
   - [ ] `SUPER_ADMIN_EMAILS` → ¿Existe? _______
   - [ ] `DATABASE_URL` → ¿Existe? _______

### Paso 2: Configurar `JWT_SECRET`

**Opción A: Si `SUPABASE_JWT_SECRET` existe y tiene un valor válido**
1. Copia el valor de `SUPABASE_JWT_SECRET`
2. Agrega nueva variable: `JWT_SECRET`
3. Pega el valor copiado
4. Aplica a: Production, Preview, Development
5. (Opcional) Elimina `SUPABASE_JWT_SECRET` después de verificar que funciona

**Opción B: Si no existe ninguna**
1. Genera nuevo secreto: `openssl rand -base64 32`
2. Agrega variable: `JWT_SECRET`
3. Pega el valor generado
4. Aplica a: Production, Preview, Development

### Paso 3: Configurar `SUPER_ADMIN_EMAILS`

1. Agrega variable: `SUPER_ADMIN_EMAILS`
2. Valor: `teddy@nerlatalmud.com,moshe@nerlatalmud.com` (o tus emails)
3. Aplica a: Production, Preview, Development

### Paso 4: Verificar y Limpiar

1. Si `SUPABASE_JWT_SECRET` existe y ya configuraste `JWT_SECRET`:
   - Verifica que `JWT_SECRET` tiene el valor correcto
   - (Opcional) Elimina `SUPABASE_JWT_SECRET` si no se usa

---

## ✅ Checklist Final

Antes de hacer deploy, verifica:

- [ ] `JWT_SECRET` está configurada (no `SUPABASE_JWT_SECRET`)
- [ ] `SUPER_ADMIN_EMAILS` está configurada
- [ ] `DATABASE_URL` está configurada
- [ ] Todas las variables aplican a Production, Preview, Development
- [ ] Has hecho un nuevo deploy después de agregar las variables

---

## 🚨 Troubleshooting

### Error: "JWT_SECRET es REQUERIDO"

**Causa**: `JWT_SECRET` no está configurada o tiene un nombre incorrecto.

**Solución**:
1. Verifica que la variable se llama exactamente `JWT_SECRET` (no `SUPABASE_JWT_SECRET`)
2. Verifica que está aplicada a Production
3. Haz un nuevo deploy

### Error: "SUPER_ADMIN_EMAILS no está configurado"

**Causa**: `SUPER_ADMIN_EMAILS` no está configurada.

**Solución**:
1. Agrega la variable en Vercel
2. Formato: `email1@example.com,email2@example.com` (sin espacios)
3. Haz un nuevo deploy

### Login sigue fallando con 500

**Causa**: Faltan variables o tienen nombres incorrectos.

**Solución**:
1. Revisa los logs de Vercel para ver el error específico
2. Verifica que `JWT_SECRET` (no `SUPABASE_JWT_SECRET`) está configurada
3. Verifica que `SUPER_ADMIN_EMAILS` está configurada
4. Haz un nuevo deploy

---

## 📝 Notas

- **`JWT_SECRET`** es la variable correcta que usa el código
- **`SUPABASE_JWT_SECRET`** NO se usa en el código (puede eliminarse)
- Si tienes `SUPABASE_JWT_SECRET` con un valor válido, puedes copiarlo a `JWT_SECRET`
