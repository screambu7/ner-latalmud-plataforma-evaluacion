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
    let usuario;
    try {
      usuario = await db.usuario.findUnique({
        where: { correo: correoNormalizado },
      });
    } catch (dbError: unknown) {
      console.error('[LOGIN] Error al buscar usuario en BD:', dbError);
      // Si es error de columna faltante, dar mensaje específico
      if (dbError instanceof Error && dbError.message.includes('passwordHash')) {
        return NextResponse.json(
          { 
            error: 'Error de configuración: la migración de passwordHash no se ha aplicado. Contacta al administrador.',
          },
          { status: 500 }
        );
      }
      throw dbError;
    }

    if (!usuario) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Validar contraseña si el usuario tiene passwordHash
    if (usuario.passwordHash) {
      try {
        const isValidPassword = await bcrypt.compare(password, usuario.passwordHash);

        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Correo o contraseña incorrectos' },
            { status: 401 }
          );
        }
      } catch (bcryptError: unknown) {
        console.error('[LOGIN] Error en bcrypt.compare:', bcryptError);
        return NextResponse.json(
          { error: 'Error al validar contraseña' },
          { status: 500 }
        );
      }
    } else {
      // Usuario sin passwordHash - no puede autenticarse con contraseña
      // B2-2: Retornar 403 (Forbidden) en lugar de 401 (Unauthorized)
      return NextResponse.json(
        { 
          error: 'Cuenta no habilitada. Contacta al administrador.',
        },
        { status: 403 }
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
    try {
      await setSessionCookie(
        usuario.id,
        usuario.rol,
        usuario.escuelaId || undefined
      );
    } catch (sessionError: unknown) {
      console.error('[LOGIN] Error al crear sesión:', sessionError);
      return NextResponse.json(
        { error: 'Error al crear sesión. Verifica que JWT_SECRET esté configurado.' },
        { status: 500 }
      );
    }

    // Determinar URL de redirección según rol (defensivo)
    let redirectUrl = '/evaluador-dashboard'; // Default seguro
    if (usuario.rol === Rol.SUPER_ADMIN) {
      redirectUrl = '/admin-dashboard';
    } else {
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
    console.error('[LOGIN] Error no manejado:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[LOGIN] Stack:', errorStack);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        // Solo en desarrollo: incluir detalles del error
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage }),
      },
      { status: 500 }
    );
  }
}
