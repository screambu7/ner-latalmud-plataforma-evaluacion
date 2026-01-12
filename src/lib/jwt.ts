/**
 * Utilidades para JWT (JSON Web Tokens) - PR1: Magic Link Auth
 * 
 * Usa jose para compatibilidad con Edge Runtime.
 * Los tokens incluyen: sub (userId), rol, escuelaId opcional, iat, exp
 */

import { SignJWT, jwtVerify } from 'jose';
import { Rol } from '@prisma/client';

/**
 * Obtiene el secreto JWT desde variables de entorno.
 * 
 * @throws Error si JWT_SECRET no está configurado en staging/production
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[JWT] JWT_SECRET no configurado. Usando valor por defecto (INSEGURO).');
      return 'dev-secret-change-in-production';
    }
    
    // En staging/production, fallar explícitamente
    throw new Error(
      'JWT_SECRET es REQUERIDO en staging/production pero no está configurado. ' +
      'Configura JWT_SECRET en las variables de entorno. ' +
      'Debe ser una cadena aleatoria de al menos 32 caracteres.'
    );
  }
  
  return secret;
}

// Lazy evaluation para evitar errores en build time
let _jwtSecret: string | null = null;

function getJWTSecretLazy(): string {
  if (_jwtSecret === null) {
    _jwtSecret = getJWTSecret();
  }
  return _jwtSecret;
}

const JWT_EXPIRES_IN = '7d'; // 7 días por defecto

/**
 * Payload del token JWT de sesión
 */
export interface SessionJWTPayload {
  sub: number; // userId (usando 'sub' según estándar JWT)
  rol: Rol;
  escuelaId?: number | null;
  iat: number;
  exp: number;
}

/**
 * Convierte el tiempo de expiración (ej: "7d", "24h") a segundos
 */
function parseExpiration(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(`Formato de expiración inválido: ${expiresIn}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60;
    case 'h':
      return value * 60 * 60;
    case 'm':
      return value * 60;
    case 's':
      return value;
    default:
      throw new Error(`Unidad de tiempo inválida: ${unit}`);
  }
}

/**
 * Genera un token JWT firmado para una sesión de usuario (PR1)
 * 
 * @param userId - ID del usuario
 * @param rol - Rol del usuario
 * @param escuelaId - ID de la escuela (opcional)
 * @returns Token JWT firmado
 */
export async function signSessionJWT(
  userId: number,
  rol: Rol,
  escuelaId?: number | null
): Promise<string> {
  const secret = new TextEncoder().encode(getJWTSecretLazy());
  const expiresInSeconds = parseExpiration(JWT_EXPIRES_IN);
  const now = Math.floor(Date.now() / 1000);

  const payload: any = {
    sub: userId.toString(), // jose requiere sub como string
    rol,
  };
  if (escuelaId !== undefined && escuelaId !== null) {
    payload.escuelaId = escuelaId;
  }
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(secret);

  return token;
}

/**
 * Verifica y decodifica un token JWT de sesión (PR1)
 * 
 * @param token - Token JWT a verificar
 * @returns Payload del token si es válido, null si es inválido/expirado
 */
export async function verifySessionJWT(
  token: string
): Promise<SessionJWTPayload | null> {
  const secret = new TextEncoder().encode(getJWTSecretLazy());

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    // Validar estructura del payload
    // jose devuelve sub como string, pero lo convertimos a number
    if (
      !payload.sub ||
      !payload.rol ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number'
    ) {
      return null;
    }

    const userId = parseInt(payload.sub as string, 10);
    if (isNaN(userId)) {
      return null;
    }

    return {
      sub: userId,
      rol: payload.rol as Rol,
      escuelaId: payload.escuelaId as number | null | undefined,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error: any) {
    // Token expirado o inválido - retornar null (no lanzar error)
    return null;
  }
}
