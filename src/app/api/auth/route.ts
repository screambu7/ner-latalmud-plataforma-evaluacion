import { NextResponse } from 'next/server';

/**
 * Endpoint de autenticación (DEPRECADO - PR1)
 * 
 * ⚠️ Este endpoint está deprecado. Usar /api/auth/request-link en su lugar.
 * 
 * CONTRATO:
 * - POST /api/auth
 * - Retorna 410 Gone con mensaje de redirección
 * 
 * COMPORTAMIENTO:
 * - Este endpoint ya no autentica directamente
 * - Redirige al nuevo flujo de magic link
 */
export async function POST(request: Request) {
  return NextResponse.json(
    {
      error: 'Este endpoint está deprecado. Usa /api/auth/request-link para iniciar sesión con magic link.',
      redirect: '/api/auth/request-link',
    },
    { status: 410 } // 410 Gone
  );
}

