/**
 * @deprecated Este módulo está deprecado. Usar JWT (src/lib/jwt.ts) en su lugar.
 * 
 * Este archivo se mantiene solo para referencia histórica.
 * El sistema ahora usa JWT firmado con jose (compatible con Edge Runtime).
 * 
 * Ver: src/lib/jwt.ts para la implementación actual.
 */

// Este archivo ya no se usa. Se mantiene para evitar romper imports si existen.
// TODO: Eliminar este archivo después de verificar que no hay referencias.

export type SessionPayload = never;
export type SessionResult = never;

export function createSessionCookie(): never {
  throw new Error('createSessionCookie está deprecado. Usar signSessionJWT de src/lib/jwt.ts');
}

export function verifySessionCookie(): never {
  throw new Error('verifySessionCookie está deprecado. Usar verifySessionJWT de src/lib/jwt.ts');
}
