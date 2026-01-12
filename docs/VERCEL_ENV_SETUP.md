# 🔐 Configuración de Variables de Entorno en Vercel

## Opción 1: Vía CLI (Recomendado)

### Paso 1: Linkear Proyecto (si no está linkeado)

```bash
cd "/Users/tedcherem/Desktop/Ner LaTalmud Plataforma/ner-latalmud-plataforma-evaluacion"
vercel link
```

Cuando pregunte:
- **Set up and deploy?** → `Y` (o Enter)
- **Which scope?** → Seleccionar tu cuenta/team
- **Link to existing project?** → `Y` (si ya existe) o `N` (si es nuevo)
- **What's your project's name?** → Nombre del proyecto
- **In which directory is your code located?** → `./` (Enter)

### Paso 2: Agregar Variables de Entorno

Para cada variable, ejecutar (presionar ENTER cuando pregunte por branch):

```bash
# SUPER_ADMIN_EMAILS
vercel env add SUPER_ADMIN_EMAILS preview
# Valor: teddy@nerlatalmud.com,moshe@nerlatalmud.com
# Branch: (Enter para todos)

# APP_BASE_URL
vercel env add APP_BASE_URL preview
# Valor: https://staging.nerlatalmud.com (o tu URL de staging)
# Branch: (Enter para todos)

# NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_URL preview
# Valor: https://staging.nerlatalmud.com (o tu URL de staging)
# Branch: (Enter para todos)

# PDF_STORAGE_DIR
vercel env add PDF_STORAGE_DIR preview
# Valor: /tmp
# Branch: (Enter para todos)
```

**Nota:** Cuando pregunte "Which Environments should it be available for?", seleccionar `Preview` (staging).

---

## Opción 2: Vía Dashboard Web

1. Ir a: https://vercel.com/dashboard
2. Seleccionar el proyecto
3. Ir a **Settings** > **Environment Variables**
4. Para cada variable, hacer click en **Add New**
5. Configurar:

### SUPER_ADMIN_EMAILS
- **Key:** `SUPER_ADMIN_EMAILS`
- **Value:** `teddy@nerlatalmud.com,moshe@nerlatalmud.com`
- **Environment:** Seleccionar `Preview` (staging)
- **Save**

### APP_BASE_URL
- **Key:** `APP_BASE_URL`
- **Value:** `https://staging.nerlatalmud.com` (o tu URL de staging)
- **Environment:** Seleccionar `Preview` (staging)
- **Save**

### NEXT_PUBLIC_APP_URL
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://staging.nerlatalmud.com` (o tu URL de staging)
- **Environment:** Seleccionar `Preview` (staging)
- **Save**

### PDF_STORAGE_DIR
- **Key:** `PDF_STORAGE_DIR`
- **Value:** `/tmp`
- **Environment:** Seleccionar `Preview` (staging)
- **Save**

---

## ⚠️ IMPORTANTE

- **DATABASE_URL** también debe estar configurada (ya debería estar)
- Todas las variables deben estar en **Preview** (staging)
- Para production, crear las mismas variables pero con valores de production
- Después de agregar variables, hacer un nuevo deploy para que se apliquen

---

## Verificación

Después de configurar, verificar que todas las variables estén:

```bash
vercel env ls
```

Debe mostrar todas las variables configuradas para Preview.
