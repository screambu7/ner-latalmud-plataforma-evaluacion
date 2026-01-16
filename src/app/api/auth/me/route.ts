import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * Endpoint para obtener información del usuario actual
 * Útil para componentes client-side que necesitan verificar el rol
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Solo devolver información básica (rol, id, nombre)
    return NextResponse.json({
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}
