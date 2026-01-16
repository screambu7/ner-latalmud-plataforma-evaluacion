/**
 * ⚠️ DEPRECATED - MAGIC LINK CONGELADO
 * 
 * Este archivo está deprecado. Magic Link está CONGELADO y NO debe usarse.
 * 
 * Todas las funciones lanzan errores explícitos para prevenir uso accidental.
 * 
 * @deprecated Magic Link está congelado. Usar Password Auth únicamente.
 */

const ERROR_MSG = 'MAGIC LINK CONGELADO — NO USAR. El sistema usa Password Auth únicamente.';

/**
 * @deprecated Magic Link está congelado
 * @throws {Error} Siempre lanza error
 */
export function generateToken(): never {
  throw new Error(ERROR_MSG);
}

/**
 * @deprecated Magic Link está congelado
 * @throws {Error} Siempre lanza error
 */
export function hashToken(_token: string): never {
  throw new Error(ERROR_MSG);
}

/**
 * @deprecated Magic Link está congelado
 * @throws {Error} Siempre lanza error
 */
export function buildMagicLink(_token: string): never {
  throw new Error(ERROR_MSG);
}

/**
 * @deprecated Magic Link está congelado
 * @throws {Error} Siempre lanza error
 */
export function redactEmail(_email: string): never {
  throw new Error(ERROR_MSG);
}
