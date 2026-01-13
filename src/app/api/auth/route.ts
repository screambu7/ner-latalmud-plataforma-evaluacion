import { NextResponse } from 'next/server';

/**
 * Endpoint de autenticación (DEPRECADO - PR1)
 * 
 * ⚠️ Este endpoint está deprecado. Usar /api/auth/request-link en su lugar.
 * 
 * CONTRATO:
 * - POST /api/auth (solo la ruta exacta, NO rutas hijas)
 * - Retorna 410 Gone con mensaje de redirección
 * 
 * COMPORTAMIENTO:
 * - Este endpoint ya no autentica directamente
 * - Redirige al nuevo flujo de magic link
 * - NO intercepta rutas hijas como /api/auth/signup, /api/auth/login, etc.
 */
export async function POST(request: Request) {
  // Solo manejar la ruta exacta /api/auth, no rutas hijas
  // Next.js App Router ya maneja esto correctamente, pero por claridad:
  return NextResponse.json(
    {
      error: 'Este endpoint está deprecado. Usa /api/auth/request-link para iniciar sesión con magic link.',
      redirect: '/api/auth/request-link',
    },
    { status: 410 } // 410 Gone
  );
}

