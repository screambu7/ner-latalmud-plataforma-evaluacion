# 🔐 SQL para Configurar Contraseña de Usuario

## Para Moshe (moshe@nerlatalmud.com)

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Configurar passwordHash para Moshe
-- Contraseña: Ner2026!
UPDATE "Usuario"
SET "passwordHash" = '$2b$10$sZ.rGKodPXICtkK19eDWEerZJ5NRk2sDD2sXW/Ppv2tk6ESX2MgU6'
WHERE "correo" = 'moshe@nerlatalmud.com';

-- Verificar que se actualizó correctamente
SELECT 
  id, 
  nombre, 
  correo, 
  rol, 
  "passwordHash" IS NOT NULL as tiene_password,
  LENGTH("passwordHash") as hash_length
FROM "Usuario"
WHERE "correo" = 'moshe@nerlatalmud.com';
```

## ⚠️ IMPORTANTE

El hash anterior puede no ser válido. Si el login sigue fallando después de ejecutar este SQL, genera un nuevo hash usando:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Ner2026!', 10).then(hash => console.log(hash));"
```

Y reemplaza el valor en el UPDATE.

## Verificación

Después de ejecutar el UPDATE, verifica:
1. `tiene_password` debe ser `true`
2. `hash_length` debe ser `60` (longitud estándar de bcrypt)

## Si necesitas configurar otro usuario

1. Genera el hash:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('TU_CONTRASEÑA', 10).then(hash => console.log(hash));"
   ```

2. Ejecuta el UPDATE con el nuevo hash y email.
