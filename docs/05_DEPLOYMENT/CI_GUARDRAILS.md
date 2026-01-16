# 🛡️ Guardrails CI/CD

> **⚠️ REFERENCIA PRINCIPAL:** Ver `.cursorrules-quality` para reglas completas y actualizadas.

Este documento explica los **guardrails automáticos** implementados para evitar que errores de TypeScript/build lleguen a `main` y rompan Vercel.

**Principio Supremo:** CUALQUIER WARNING ES UN BUG. CUALQUIER BUG BLOQUEA MERGE.

---

## 🎯 Qué Bloquea

Los guardrails previenen que se haga push/merge de código con:

- ❌ **Errores de TypeScript** (`tsc --noEmit`)
- ❌ **Warnings de TypeScript** (tratados como errores)
- ❌ **Errores de ESLint** (`next lint`)
- ❌ **Warnings de ESLint** (tratados como errores)
- ❌ **Errores de build** (`next build`)
- ❌ **Warnings de build** (tratados como errores)
- ❌ **Errores de Prisma** (generación de cliente)
- ❌ **Tests fallando** (si aplica)

---

## 🔧 Cómo Funciona

### 1. Pre-commit (Local)

**Cuándo se ejecuta:** Antes de cada `git commit`

**Qué hace:**
- Ejecuta `lint-staged` solo en archivos modificados
- Para archivos `*.ts` y `*.tsx`: ejecuta `eslint --fix`
- Si hay errores, **bloquea el commit**

**Cómo funciona:**
```bash
# Automático al hacer commit
git commit -m "mi cambio"
# → Se ejecuta .husky/pre-commit
# → Si falla, el commit se cancela
```

---

### 2. Pre-push (Local)

**Cuándo se ejecuta:** Antes de cada `git push`

**Qué hace:**
- Ejecuta `npm run ci` (lint + typecheck + build)
- Si hay errores, **bloquea el push**

**Cómo funciona:**
```bash
# Automático al hacer push
git push origin main
# → Se ejecuta .husky/pre-push
# → Si falla, el push se cancela
```

---

### 3. GitHub Actions CI (Server)

**Cuándo se ejecuta:**
- En cada **Pull Request** hacia `main` o `staging`
- En cada **push** directo a `main` o `staging`

**Qué hace:**
- Instala dependencias (`npm ci`)
- Ejecuta `npm run ci` (lint + typecheck + build)
- Si hay errores, **bloquea el merge**

**Dónde ver resultados:**
- En la pestaña "Actions" de GitHub
- En el PR, aparece un check de estado

---

## 🚀 Cómo Correr Local

### Ejecutar todas las verificaciones

```bash
npm run ci
```

Esto ejecuta:
1. `npm run lint` - Verifica ESLint
2. `npm run typecheck` - Verifica TypeScript
3. `npm run build` - Verifica build completo

---

## ⚠️ Qué Hacer Si Falla

### Pre-commit falla

**Síntoma:** El commit se cancela con errores de ESLint

**Solución:**
```bash
# Ver errores específicos
npm run lint

# Corregir automáticamente (si es posible)
npm run lint -- --fix

# Luego intentar commit de nuevo
git commit -m "mi cambio"
```

---

### Pre-push falla

**Síntoma:** El push se cancela con errores de TypeScript/build

**Solución:**
```bash
# Ver errores específicos
npm run typecheck  # Errores de TypeScript
npm run build      # Errores de build

# Corregir errores en el código
# Luego intentar push de nuevo
git push origin main
```

---

### GitHub Actions CI falla

**Síntoma:** El PR muestra un check rojo en "CI"

**Solución:**
1. Ver los logs en la pestaña "Actions" de GitHub
2. Corregir los errores localmente
3. Ejecutar `npm run ci` localmente para verificar
4. Hacer push de nuevo (el CI se ejecutará automáticamente)

---

## 🔐 Regla de Oro

### ⛔ NUNCA pushear directo a `main`

**Proceso correcto:**
1. Crear una branch: `git checkout -b feature/mi-feature`
2. Hacer cambios y commits
3. **Verificar localmente:** `npm run ci` (debe pasar 100%)
4. Push a la branch: `git push origin feature/mi-feature`
5. Crear Pull Request en GitHub
6. Esperar que CI pase (check verde, 0 warnings, 0 errors)
7. Merge del PR (solo si CI pasa completamente)

**Por qué:**
- Los guardrails protegen `main` y `staging`
- El CI en GitHub valida antes del merge
- Permite revisión de código antes de merge
- **Warnings = errores, no se permiten excepciones**

### Quality Gate Obligatorio

**Antes de cualquier commit/push/merge:**
- ✅ `npm run lint` → 0 warnings, 0 errors
- ✅ `npm run typecheck` → 0 errors
- ✅ `npm run build` → 0 warnings, 0 errors
- ✅ Tests (si aplica) → 100% pass

**Si cualquiera falla:**
- ❌ NO commit
- ❌ NO push
- ❌ NO merge

---

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica TypeScript sin compilar |
| `npm run build` | Genera Prisma client + build de Next.js |
| `npm run ci` | Ejecuta lint + typecheck + build (todo) |

---

## 🛠️ Instalación de Hooks (Primera Vez)

Si clonas el repo por primera vez, los hooks se instalan automáticamente con:

```bash
npm install
```

El script `prepare` en `package.json` ejecuta `husky install` automáticamente.

**Si los hooks no funcionan:**
```bash
# Instalar manualmente
npx husky install

# Verificar que los hooks existen
ls -la .husky/
```

---

## 📝 Notas Técnicas

- **Husky:** Gestiona los Git hooks (pre-commit, pre-push)
- **lint-staged:** Ejecuta linters solo en archivos modificados (más rápido)
- **GitHub Actions:** CI en el servidor (backup si alguien bypassa hooks locales)
- **Node.js 20:** Versión usada en CI (debe coincidir con Vercel)

---

## 🔍 Verificación

Para verificar que todo está configurado correctamente:

```bash
# 1. Verificar que los hooks existen
ls -la .husky/

# 2. Verificar que npm run ci funciona
npm run ci

# 3. Verificar que husky está instalado
npx husky --version
```

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo saltarme los hooks con `--no-verify`?**
- Técnicamente sí, pero **NO debes hacerlo**
- El CI en GitHub siempre se ejecutará y bloqueará el merge
- Es mejor corregir los errores

**P: ¿Qué pasa si el CI falla en GitHub pero funciona local?**
- Verifica que estás usando la misma versión de Node.js
- Verifica que las dependencias están actualizadas (`npm ci`)
- Revisa los logs de GitHub Actions para ver el error específico

**P: ¿Los hooks funcionan en Windows/Mac/Linux?**
- Sí, Husky es multiplataforma
- Los hooks usan `#!/usr/bin/env sh` para compatibilidad

---

**Última actualización:** 2025-01-XX
