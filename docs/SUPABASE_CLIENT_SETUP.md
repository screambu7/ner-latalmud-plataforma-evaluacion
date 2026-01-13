# 🔧 Configuración de Cliente Supabase

## 📋 Resumen

Integración de Supabase como cliente SSR (Server-Side Rendering) para Next.js 16.

---

## 📦 Dependencias

```bash
npm install @supabase/ssr
```

---

## 🔐 Variables de Entorno

### Requeridas

Agregar a `.env.local` (local) y Vercel Environment Variables (producción):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xfpfveqoqwjxpggjpqwb.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_Y5NYe2TXwZnf1OjbcWKqWQ_QJ69CKnU
```

### Configuración en Vercel

1. Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Agregar ambas variables para **Preview** y **Production**
3. Redeploy después de agregar

---

## 📁 Archivos Creados

### `src/utils/supabase/server.ts`

Cliente para Server Components y Server Actions.

**Uso:**
```typescript
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data } = await supabase.from('tabla').select()
  // ...
}
```

### `src/utils/supabase/client.ts`

Cliente para Client Components.

**Uso:**
```typescript
'use client'
import { createClient } from '@/utils/supabase/client'

export default function Component() {
  const supabase = createClient()
  // ...
}
```

### `src/utils/supabase/middleware.ts`

Cliente para Middleware (si se necesita).

**Uso:**
```typescript
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const supabase = createClient(request)
  // ...
}
```

---

## ⚠️ Notas Importantes

1. **No reemplaza Prisma**: 
   - Supabase cliente es para funcionalidades adicionales (storage, realtime, etc.)
   - Prisma sigue siendo el ORM principal para la base de datos

2. **Autenticación**:
   - El sistema de autenticación actual (JWT + Magic Link) sigue funcionando
   - Supabase puede usarse para otras funcionalidades sin interferir

3. **Variables Públicas**:
   - `NEXT_PUBLIC_*` son variables públicas (expuestas al cliente)
   - No incluyen información sensible (solo URL y key pública)

---

## 🚀 Próximos Pasos

1. **Configurar en Vercel**: Agregar variables de entorno
2. **Usar en componentes**: Importar `createClient` según el contexto
3. **Documentar uso**: Agregar ejemplos específicos según necesidades

---

**Última actualización**: 2024-03-15
