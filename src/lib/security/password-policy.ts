/**
 * Password Policy - Fuente única de verdad
 * 
 * Este módulo define las reglas de validación de contraseñas.
 * TODAS las validaciones de password deben usar esta función.
 * 
 * Reglas mínimas obligatorias:
 * - ≥ 8 caracteres
 * - Al menos 1 letra
 * - Al menos 1 número
 * 
 * @throws {Error} Si el password no cumple con la política
 */

export class PasswordPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordPolicyError';
  }
}

/**
 * Valida que un password cumpla con la política del sistema
 * 
 * @param password - Password a validar
 * @throws {PasswordPolicyError} Si el password no cumple con la política
 */
export function validatePasswordPolicy(password: string): void {
  if (!password || typeof password !== 'string') {
    throw new PasswordPolicyError('Password es requerido');
  }

  const trimmed = password.trim();

  if (trimmed.length < 8) {
    throw new PasswordPolicyError('Password debe tener al menos 8 caracteres');
  }

  // Al menos 1 letra (a-z, A-Z, o caracteres Unicode de letras)
  const hasLetter = /[a-zA-Z\u00C0-\u017F]/.test(trimmed);
  if (!hasLetter) {
    throw new PasswordPolicyError('Password debe contener al menos una letra');
  }

  // Al menos 1 número
  const hasNumber = /\d/.test(trimmed);
  if (!hasNumber) {
    throw new PasswordPolicyError('Password debe contener al menos un número');
  }
}
