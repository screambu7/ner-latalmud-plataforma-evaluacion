/**
 * API Route: Magic Link Callback (PR1)
 * 
 * GET /api/auth/callback?token=...
 * 
 * Valida el token del magic link, crea/actualiza usuario y establece sesión JWT.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/magic-link';
import { signSessionJWT } from '@/lib/jwt';
import { isSuperAdminEmail } from '@/config/super-admins';
import { Rol, EstadoCuenta } from '@prisma/client';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      );
    }

    // Hashear token para buscar en BD
    const tokenHash = hashToken(token);

    // Buscar token en BD
    const loginToken = await db.loginToken.findUnique({
      where: { tokenHash },
    });

    if (!loginToken) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Validar que no esté expirado
    if (loginToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Validar que no haya sido usado
    if (loginToken.usedAt) {
      return NextResponse.json(
        { error: 'Token ya utilizado' },
        { status: 400 }
      );
    }

    // Marcar token como usado (en transacción)
    await db.loginToken.update({
      where: { id: loginToken.id },
      data: { usedAt: new Date() },
    });

    // Upsert usuario
    // Si existe: usar existente
    // Si no existe: crear con estado ACTIVO, nombre derivado del email, rol según SUPER_ADMIN_EMAILS
    const email = loginToken.email;
    const nombre = email.split('@')[0]; // Usar parte antes del @ como nombre
    const rol = isSuperAdminEmail(email) ? Rol.SUPER_ADMIN : Rol.EVALUADOR;

    const usuario = await db.usuario.upsert({
      where: { correo: email },
      update: {
        // Si existe, actualizar estado a ACTIVO (por si estaba inactivo)
        estado: EstadoCuenta.ACTIVO,
        // Actualizar rol si cambió (ej: si se agregó a SUPER_ADMIN_EMAILS)
        rol: isSuperAdminEmail(email) ? Rol.SUPER_ADMIN : undefined,
      },
      create: {
        correo: email,
        nombre,
        rol,
        estado: EstadoCuenta.ACTIVO,
      },
    });

    // Crear JWT session cookie
    const sessionToken = await signSessionJWT(
      usuario.id,
      usuario.rol,
      usuario.escuelaId
    );

    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    // Redirigir según rol
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    if (usuario.rol === Rol.SUPER_ADMIN) {
      return NextResponse.redirect(new URL('/admin-dashboard', baseUrl));
    } else if (usuario.rol === Rol.EVALUADOR) {
      return NextResponse.redirect(new URL('/evaluador-dashboard', baseUrl));
    } else {
      return NextResponse.redirect(new URL('/login', baseUrl));
    }
  } catch (error: any) {
    console.error('[CALLBACK] Error al procesar callback:', error);
    return NextResponse.json(
      { error: 'Error al procesar autenticación' },
      { status: 500 }
    );
  }
}
