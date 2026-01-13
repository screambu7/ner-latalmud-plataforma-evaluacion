/**
 * Validación de variables de entorno (Fail Fast)
 * 
 * Este módulo valida que las variables de entorno requeridas estén configuradas
 * en staging/production. Se ejecuta al importar para fallar temprano.
 * 
 * ⚠️ IMPORTANTE: En desarrollo, algunas variables pueden tener fallbacks,
 * pero en staging/production son REQUERIDAS y el sistema fallará si faltan.
 */

/**
 * Valida que una variable de entorno esté configurada.
 * 
 * @param name - Nombre de la variable
 * @param value - Valor de la variable (puede ser undefined)
 * @param allowDevFallback - Si true, permite fallback en desarrollo
 * @param devFallback - Valor a usar en desarrollo si no está configurado
 * @returns Valor de la variable o fallback en desarrollo
 * @throws Error si la variable es requerida y no está configurada
 */
function validateEnvVar(
  name: string,
  value: string | undefined,
  allowDevFallback: boolean = false,
  devFallback?: string
): string {
  if (!value) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (allowDevFallback && isDevelopment && devFallback) {
      console.warn(
        `[ENV] ${name} no configurado. Usando valor por defecto en desarrollo: ${devFallback}`
      );
      return devFallback;
    }
    
    if (isDevelopment) {
      // En desarrollo, permitir pero advertir
      console.warn(
        `[ENV] ${name} no está configurado. Esto causará errores en staging/production.`
      );
      return devFallback || '';
    }
    
    // En staging/production, fallar explícitamente
    throw new Error(
      `${name} es REQUERIDO en staging/production pero no está configurado. ` +
      `Configura ${name} en las variables de entorno.`
    );
  }
  
  return value;
}

/**
 * Valida JWT_SECRET
 * Requerido en staging/production
 */
export function validateJWTSecret(): string {
  return validateEnvVar(
    'JWT_SECRET',
    process.env.JWT_SECRET,
    true, // Permitir fallback en desarrollo
    'dev-secret-change-in-production'
  );
}

/**
 * Valida APP_BASE_URL
 * Requerido en staging/production
 */
export function validateAppBaseUrl(): string {
  return validateEnvVar(
    'APP_BASE_URL',
    process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL,
    true, // Permitir fallback en desarrollo
    'http://localhost:3000'
  );
}

/**
 * Valida SUPER_ADMIN_EMAILS
 * Requerido en staging/production
 */
export function validateSuperAdminEmails(): string {
  return validateEnvVar(
    'SUPER_ADMIN_EMAILS',
    process.env.SUPER_ADMIN_EMAILS,
    true, // Permitir fallback en desarrollo (manejado por super-admins.ts)
    'teddy@nerlatalmud.com,moshe@nerlatalmud.com'
  );
}

/**
 * Valida NEXT_PUBLIC_SUPABASE_URL
 * Opcional (solo si se usa cliente Supabase)
 * 
 * @returns URL de Supabase o undefined si no está configurada
 */
export function validateSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/**
 * Valida NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
 * Opcional (solo si se usa cliente Supabase)
 * 
 * @returns Key pública de Supabase o undefined si no está configurada
 */
export function validateSupabaseKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
}

/**
 * Valida que ambas variables de Supabase estén configuradas.
 * Útil para verificar antes de usar el cliente Supabase.
 * 
 * @throws Error si alguna variable falta
 */
export function validateSupabaseConfig(): void {
  const url = validateSupabaseUrl();
  const key = validateSupabaseKey();
  
  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ' +
      'deben estar configuradas para usar el cliente Supabase. ' +
      'Ver docs/SUPABASE_CLIENT_SETUP.md'
    );
  }
}

/**
 * Valida todas las variables de entorno requeridas.
 * Se ejecuta al importar este módulo.
 * 
 * @throws Error si alguna variable requerida falta en staging/production
 */
export function validateRequiredEnvVars(): void {
  // Solo validar en staging/production
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.VERCEL_ENV === 'production' ||
                       process.env.VERCEL_ENV === 'preview';
  
  if (isProduction) {
    try {
      validateJWTSecret();
      validateAppBaseUrl();
      validateSuperAdminEmails();
      // Nota: Supabase es opcional, no validar aquí
    } catch (error) {
      console.error('[ENV] Error de validación de variables de entorno:', error);
      throw error;
    }
  }
}

// Validación se hace de forma lazy en jwt.ts y magic-link.ts
// No validar al importar para evitar problemas en build time
