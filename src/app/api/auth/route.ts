import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setUserIdCookie } from '@/lib/auth-utils';
import { Rol } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { correo } = body;

    if (!correo || typeof correo !== 'string') {
      return NextResponse.json(
        { error: 'Correo es requerido' },
        { status: 400 }
      );
    }

    const usuario = await db.usuario.findUnique({
      where: { correo: correo.trim().toLowerCase() },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (usuario.estado !== 'ACTIVO') {
      return NextResponse.json(
        { error: 'Cuenta inactiva' },
        { status: 403 }
      );
    }

    await setUserIdCookie(usuario.id);

    let redirectUrl = '/';
    if (usuario.rol === Rol.SUPER_ADMIN) {
      redirectUrl = '/admin-dashboard';
    } else if (usuario.rol === Rol.EVALUADOR) {
      redirectUrl = '/evaluador-dashboard';
    }

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      redirectUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

