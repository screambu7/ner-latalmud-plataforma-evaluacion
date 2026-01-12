import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Rol, EstadoCuenta } from '@prisma/client';
import { isSuperAdminEmail } from '@/config/super-admins';

/**
 * ⚠️ IMPORTANTE: Instalar bcryptjs para hash de contraseñas
 * 
 * npm install bcryptjs
 * npm install --save-dev @types/bcryptjs
 * 
 * Luego descomentar las importaciones y el código de hash
 */

// import bcrypt from 'bcryptjs';

/**
 * Endpoint de registro de usuarios
 * 
 * CONTRATO:
 * - POST /api/auth/signup
 * - Body: { nombre: string, correo: string, password: string }
 * - Respuesta exitosa (200): { success: true, message: string }
 * - Errores:
 *   - 400: Datos inválidos o faltantes
 *   - 409: Usuario ya existe
 *   - 500: Error del servidor
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, correo, password } = body;

    // Validaciones
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    if (!correo || typeof correo !== 'string') {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
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

    // Verificar si el usuario ya existe
    const usuarioExistente = await db.usuario.findUnique({
      where: { correo: correoNormalizado },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    // ⚠️ TODO: Descomentar cuando se instale bcryptjs
    // Hash de contraseña
    // const passwordHash = await bcrypt.hash(password, 10);

    // Por ahora, guardar contraseña en texto plano (TEMPORAL - NO PRODUCCIÓN)
    // ⚠️ ADVERTENCIA: Esto es solo para desarrollo. Debe usar hash en producción.
    const passwordHash = password; // TEMPORAL - Reemplazar con hash

    // Determinar rol basado en SUPER_ADMIN_EMAILS
    let rol: Rol = Rol.EVALUADOR; // Por defecto
    try {
      if (isSuperAdminEmail(correoNormalizado)) {
        rol = Rol.SUPER_ADMIN;
      }
    } catch (error) {
      // Continuar con rol por defecto
    }

    // Crear usuario
    await db.usuario.create({
      data: {
        nombre: nombre.trim(),
        correo: correoNormalizado,
        passwordHash: passwordHash,
        rol: rol,
        estado: EstadoCuenta.ACTIVO,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente',
    });
  } catch (error: any) {
    console.error('[SIGNUP] Error:', error);

    // Error de constraint (email duplicado)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    );
  }
}
