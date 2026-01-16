import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth-utils';

/**
 * Endpoint de logout
 * 
 * CONTRATO:
 * - POST /api/auth/logout
 * - Borra la cookie de sesión
 * - Respuesta: { success: true }
 * - El frontend debe manejar el redirect a /login
 */
export async function POST() {
  try {
    // Borrar cookie de sesión de forma segura
    await clearSessionCookie();
    
    return NextResponse.json({ 
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error: unknown) {
    console.error('[LOGOUT] Error al cerrar sesión:', error);
    
    // Intentar borrar cookie incluso si hay error
    try {
      await clearSessionCookie();
    } catch (clearError) {
      console.error('[LOGOUT] Error al borrar cookie después de error:', clearError);
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al cerrar sesión'
      },
      { status: 500 }
    );
  }
}



