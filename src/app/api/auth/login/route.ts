import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth-utils';
import { Rol, EstadoCuenta } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Endpoint de login con contraseña
 * 
 * CONTRATO:
 * - POST /api/auth/login
 * - Body: { correo: string, password: string }
 * - Respuesta exitosa (200): { success: true, usuario: {...}, redirectUrl: string }
 * - Errores:
 *   - 400: Correo/contraseña inválidos o faltantes
 *   - 401: Credenciales incorrectas
 *   - 403: Cuenta inactiva
 *   - 500: Error del servidor
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { correo, password } = body;

    // Validaciones
    if (!correo || typeof correo !== 'string') {
      return NextResponse.json(
        { error: 'Correo electrónico es requerido' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Contraseña es requerida' },
        { status: 400 }
      );
    }

    // Normalizar email
    const correoNormalizado = correo.trim().toLowerCase();

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoNormalizado)) {
      return NextResponse.json(
        { error: 'Formato de correo electrónico inválido' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const usuario = await db.usuario.findUnique({
      where: { correo: correoNormalizado },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Validar contraseña si el usuario tiene passwordHash
    if (usuario.passwordHash) {
      const isValidPassword = await bcrypt.compare(password, usuario.passwordHash);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Correo o contraseña incorrectos' },
          { status: 401 }
        );
      }
    } else {
      // Usuario sin passwordHash - no puede autenticarse con contraseña
      return NextResponse.json(
        { 
          error: 'Este usuario no tiene contraseña configurada. Contacta al administrador para configurar una contraseña.',
        },
        { status: 401 }
      );
    }

    // Verificar estado de la cuenta
    if (usuario.estado !== EstadoCuenta.ACTIVO) {
      return NextResponse.json(
        { error: 'Tu cuenta está inactiva. Contacta al administrador.' },
        { status: 403 }
      );
    }

    // Crear JWT de sesión y establecer cookie
    await setSessionCookie(
      usuario.id,
      usuario.rol,
      usuario.escuelaId || undefined
    );

    // Determinar URL de redirección según rol
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
  } catch (error: unknown) {
    console.error('[LOGIN] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
