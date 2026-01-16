import { NextResponse } from 'next/server';

/**
 * Endpoint para solicitar recuperación de contraseña
 * 
 * ⚠️ DESHABILITADO (B2-2 Hardening)
 * 
 * La recuperación de contraseña está deshabilitada por seguridad.
 * Los usuarios deben contactar al administrador para restablecer su contraseña.
 * 
 * CONTRATO:
 * - POST /api/auth/forgot-password
 * - Respuesta: 410 Gone
 * - Mensaje: "Recuperación de contraseña deshabilitada. Contacta al administrador."
 * 
 * Se reabrirá solo cuando exista:
 * - Proveedor de correo confiable
 * - Tokens firmados seguros
 * - Rate limiting implementado
 */
export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Recuperación de contraseña deshabilitada. Contacta al administrador.' },
    { status: 410 }
  );
}
