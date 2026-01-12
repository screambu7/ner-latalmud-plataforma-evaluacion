/**
 * Configuración de Super Administradores
 * 
 * Este archivo define los correos electrónicos de los usuarios
 * que deben tener rol SUPER_ADMIN.
 * 
 * ⚠️ IMPORTANTE: 
 * - En staging/production, los emails vienen de la variable de entorno SUPER_ADMIN_EMAILS
 * - En desarrollo, se usan valores por defecto (solo para desarrollo local)
 * - NUNCA hardcodear emails en lógica de negocio
 */

/**
 * Obtiene la lista de emails de super administradores desde variable de entorno.
 * 
 * Formato esperado: "email1@example.com,email2@example.com"
 * 
 * @returns Array de emails de super administradores
 */
function getSuperAdminEmailsFromEnv(): string[] {
  const envEmails = process.env.SUPER_ADMIN_EMAILS;
  
  if (!envEmails) {
    // En desarrollo, usar valores por defecto
    if (process.env.NODE_ENV === 'development') {
      return ['[REDACTED_EMAIL_1]', '[REDACTED_EMAIL_2]'];
    }
    
    // En staging/production, fallar si no está configurado
    throw new Error(
      'SUPER_ADMIN_EMAILS no está configurado. ' +
      'Configura la variable de entorno SUPER_ADMIN_EMAILS con los emails separados por comas.'
    );
  }
  
  return envEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

/**
 * Lista de emails de super administradores.
 * 
 * Se obtiene de la variable de entorno SUPER_ADMIN_EMAILS.
 * En desarrollo, usa valores por defecto si no está configurado.
 */
export const SUPER_ADMIN_EMAILS = getSuperAdminEmailsFromEnv();

/**
 * Verifica si un correo corresponde a un super administrador.
 * 
 * @param email - Correo a verificar
 * @returns true si el correo está en la lista de super admins
 */
export function isSuperAdminEmail(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim() as any);
}
