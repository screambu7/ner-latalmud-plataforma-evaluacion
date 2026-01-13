import { createBrowserClient } from "@supabase/ssr";

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

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
