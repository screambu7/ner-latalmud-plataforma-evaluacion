/**
 * Endpoint para configurar passwordHash de un usuario
 * 
 * ⚠️ PROTEGIDO (B2-2 Hardening)
 * 
 * SOLO permitido si:
 * - Usuario autenticado
 * - Rol = SUPER_ADMIN
 * - Usuario target existe
 * 
 * ❌ ALLOW_PASSWORD_SETUP eliminado
 * ❌ Endpoint público eliminado
 * 
 * POST /api/admin/set-password
 * Headers: Cookie con sesión JWT válida
 * Body: { email: string, password: string }
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { validatePasswordPolicy, PasswordPolicyError } from '@/lib/security/password-policy';

export async function POST(request: Request) {
  try {
    // B2-2: Requerir autenticación y rol SUPER_ADMIN
    let currentUser;
    try {
      currentUser = await requireRole(Rol.SUPER_ADMIN);
    } catch (authError) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere autenticación y rol SUPER_ADMIN.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password son requeridos' },
        { status: 400 }
      );
    }

    // Validar password usando política centralizada
    try {
      validatePasswordPolicy(password);
    } catch (error) {
      if (error instanceof PasswordPolicyError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Password inválido' },
        { status: 400 }
      );
    }

    const emailNormalizado = email.trim().toLowerCase();

    // Buscar usuario
    const usuario = await db.usuario.findUnique({
      where: { correo: emailNormalizado },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Actualizar usuario
    await db.usuario.update({
      where: { id: usuario.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: `Contraseña configurada para ${usuario.nombre} (${usuario.correo})`,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error: unknown) {
    console.error('[SET-PASSWORD] Error:', error);
    return NextResponse.json(
      { error: 'Error al configurar contraseña' },
      { status: 500 }
    );
  }
}
