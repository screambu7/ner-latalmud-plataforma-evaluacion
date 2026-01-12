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
 * 
 * ⚠️ IMPORTANTE: Esta función se llama de forma lazy para evitar errores
 * en tiempo de importación si la variable no está configurada.
 */
let _superAdminEmails: string[] | null = null;

function getSuperAdminEmails(): string[] {
  if (_superAdminEmails === null) {
    try {
      _superAdminEmails = getSuperAdminEmailsFromEnv();
    } catch (error) {
      // Si falla en tiempo de importación, usar valores por defecto
      // y loguear el error para debugging
      console.error('[SUPER_ADMINS] Error al obtener emails desde env:', error);
      if (process.env.NODE_ENV === 'development') {
        _superAdminEmails = ['[REDACTED_EMAIL_1]', '[REDACTED_EMAIL_2]'];
        console.warn('[SUPER_ADMINS] Usando valores por defecto en desarrollo');
      } else {
        // En staging/production, si no está configurado, usar array vacío
        // Esto evitará que el sistema falle, pero ningún email será SUPER_ADMIN
        _superAdminEmails = [];
        console.error('[SUPER_ADMINS] SUPER_ADMIN_EMAILS no configurado en staging/production. Ningún email será SUPER_ADMIN.');
      }
    }
  }
  return _superAdminEmails;
}

/**
 * Exporta la lista de emails (para compatibilidad con código existente)
 * ⚠️ Usar con precaución, puede estar vacía si no está configurado
 */
export const SUPER_ADMIN_EMAILS = getSuperAdminEmails();

/**
 * Verifica si un correo corresponde a un super administrador.
 * 
 * @param email - Correo a verificar
 * @returns true si el correo está en la lista de super admins
 */
export function isSuperAdminEmail(email: string): boolean {
  const emails = getSuperAdminEmails();
  if (emails.length === 0) {
    // Si no hay emails configurados, loguear warning pero no fallar
    if (process.env.NODE_ENV !== 'development') {
      console.warn('[SUPER_ADMINS] SUPER_ADMIN_EMAILS no configurado. Verificar variables de entorno.');
    }
    return false;
  }
  return emails.includes(email.toLowerCase().trim());
}
