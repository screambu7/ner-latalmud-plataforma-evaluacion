/**
 * Endpoint temporal para configurar passwordHash de un usuario
 * 
 * ⚠️ SOLO PARA CONFIGURACIÓN INICIAL
 * Debe ser removido o protegido después de configurar usuarios
 * 
 * POST /api/admin/set-password
 * Body: { email: string, password: string }
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // ⚠️ SEGURIDAD: Solo permitir en desarrollo o con flag especial
    const isDev = process.env.NODE_ENV === 'development';
    const allowPasswordSetup = process.env.ALLOW_PASSWORD_SETUP === 'true';
    
    if (!isDev && !allowPasswordSetup) {
      return NextResponse.json(
        { error: 'Este endpoint solo está disponible en desarrollo o con flag ALLOW_PASSWORD_SETUP=true' },
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
