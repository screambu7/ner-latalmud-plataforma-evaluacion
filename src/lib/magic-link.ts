/**
 * Utilidades para Magic Link Authentication (PR1)
 * 
 * Genera tokens seguros para magic links y construye URLs.
 */

import { createHash } from 'crypto';

/**
 * Genera un token aleatorio seguro para magic link
 * 
 * @returns Token aleatorio en base64url (URL-safe)
 */
export function generateToken(): string {
  // Generar 32 bytes aleatorios (256 bits)
  // Usar crypto.randomBytes en Node.js (más seguro que crypto.getRandomValues)
  const crypto = require('crypto');
  const randomBytes = crypto.randomBytes(32);
  // Convertir a base64url (URL-safe)
  return randomBytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Hashea un token usando SHA-256 para almacenamiento seguro
 * 
 * @param token - Token en texto plano
 * @returns Hash hexadecimal del token
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Construye la URL del magic link
 * 
 * @param token - Token en texto plano
 * @returns URL completa del magic link
 */
export function buildMagicLink(token: string): string {
  const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/auth/callback?token=${token}`;
}

/**
 * Redacta un email para logs en producción (PII protection)
 * 
 * @param email - Email completo
 * @returns Email redactado (ej: "t***@dominio.com")
 */
export function redactEmail(email: string): string {
  if (process.env.NODE_ENV === 'development') {
    return email; // En desarrollo, mostrar completo
  }

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) {
    return '***@***';
  }

  // Mostrar primer carácter y ocultar el resto
  const redactedLocal = localPart.length > 1 
    ? `${localPart[0]}***`
    : '***';
  
  return `${redactedLocal}@${domain}`;
}
