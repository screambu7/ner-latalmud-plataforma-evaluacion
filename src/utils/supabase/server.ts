import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Validar variables de entorno
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ' +
    'deben estar configuradas para usar el cliente Supabase. ' +
    'Ver docs/SUPABASE_CLIENT_SETUP.md'
  );
}

export const createClient = async (cookieStore?: Awaited<ReturnType<typeof cookies>>) => {
  const cookieStoreResolved = cookieStore || await cookies();
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStoreResolved.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStoreResolved.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
