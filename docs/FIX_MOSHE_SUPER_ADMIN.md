# 🔧 Fix: Moshe como SUPER_ADMIN

## Problema
Moshe está configurado como EVALUADOR pero también debería ser SUPER_ADMIN según `SUPER_ADMIN_EMAILS`.

## Solución

Ejecuta este SQL en Supabase:

```sql
-- Actualizar Moshe a SUPER_ADMIN
UPDATE "Usuario"
SET rol = 'SUPER_ADMIN'
WHERE "correo" = 'moshe@nerlatalmud.com';

-- Verificar el cambio
SELECT 
  id,
  nombre,
  correo,
  rol,
  estado,
  "escuelaId"
FROM "Usuario"
WHERE "correo" = 'moshe@nerlatalmud.com';
```

## Verificación

Después de ejecutar el UPDATE, verifica:
- `rol` debe ser `'SUPER_ADMIN'`
- `estado` debe ser `'ACTIVO'`

## Nota

El sistema también verifica `SUPER_ADMIN_EMAILS` en Vercel. Asegúrate de que:
- `SUPER_ADMIN_EMAILS` incluye `moshe@nerlatalmud.com`
- La variable está configurada en Vercel (Production, Preview, Development)
