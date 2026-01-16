import { NextResponse } from 'next/server';

/**
 * Endpoint de registro de usuarios
 * 
 * ⚠️ DESHABILITADO (B2-2 Hardening)
 * 
 * El registro público está deshabilitado por seguridad.
 * Los usuarios deben ser creados por un SUPER_ADMIN.
 * 
 * CONTRATO:
 * - POST /api/auth/signup
 * - Respuesta: 410 Gone
 * - Mensaje: "Registro público deshabilitado. Contacta al administrador."
 * 
 * Razón:
 * - Creaba usuarios sin passwordHash
 * - Rompía el modelo de seguridad
 * - No hay email confiable aún
 */
export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Registro público deshabilitado. Contacta al administrador.' },
    { status: 410 }
  );
}
