/**
 * API Route: Request Magic Link (PR1)
 * 
 * ⚠️ MAGIC LINK FROZEN – password auth only.
 * 
 * POST /api/auth/request-link
 * Body: { correo: string }
 * 
 * Genera un magic link y lo "envía" (por ahora solo loguea en consola).
 * Siempre retorna éxito para evitar enumeración de usuarios.
 * 
 * STATUS: FROZEN - Este endpoint está deshabilitado.
 * El sistema ahora usa autenticación por contraseña únicamente.
 */

import { NextResponse } from 'next/server';
// MAGIC LINK FROZEN – password auth only.
// import { db } from '@/lib/db';
// import { generateToken, hashToken, buildMagicLink, redactEmail } from '@/lib/magic-link';

// const MAGIC_LINK_TTL_MINUTES = parseInt(process.env.MAGIC_LINK_TTL_MINUTES || '15', 10);

export async function POST(request: Request) {
  // MAGIC LINK FROZEN – password auth only.
  return NextResponse.json(
    { 
      error: 'Magic Link authentication is no longer available. Please use password authentication.',
      message: 'Este endpoint ha sido deshabilitado. Usa autenticación por contraseña.',
    },
    { status: 410 } // 410 Gone - Resource no longer available
  );

  /* MAGIC LINK FROZEN – password auth only.
  try {
    const body = await request.json();
    const { correo } = body;

    // Validar email
    if (!correo || typeof correo !== 'string') {
      return NextResponse.json(
        { error: 'Correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Normalizar email
    const correoNormalizado = correo.trim().toLowerCase();

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoNormalizado)) {
      return NextResponse.json(
        { error: 'Formato de correo electrónico inválido' },
        { status: 400 }
      );
    }

    // Generar token y hash
    const token = generateToken();
    const tokenHash = hashToken(token);

    // Calcular expiración
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + MAGIC_LINK_TTL_MINUTES);

    // Obtener IP y User-Agent (opcional, para auditoría)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               null;
    const userAgent = request.headers.get('user-agent') || null;

    // Guardar token en BD (incluso si el usuario no existe aún)
    await db.loginToken.create({
      data: {
        email: correoNormalizado,
        tokenHash,
        expiresAt,
        ip,
        userAgent,
      },
    });

    // Construir magic link
    const magicLink = buildMagicLink(token);

    // Verificar flags de desarrollo para exposición segura
    const isDevMode = process.env.AUTH_DEV_MODE === 'true';
    const shouldExposeMagicLink = process.env.AUTH_DEV_EXPOSE_MAGIC_LINK === 'true';
    const canExposeMagicLink = isDevMode && shouldExposeMagicLink;

    // Logging y exposición controlada por flags
    if (canExposeMagicLink) {
      // Solo loguear si AMBOS flags están habilitados
      console.log('[DEV-ONLY][MAGIC-LINK] Link generado para:', correoNormalizado);
      console.log('[DEV-ONLY][MAGIC-LINK] Link:', magicLink);
    } else {
      // En producción o sin flags: no loguear magic link
      // Solo loguear email redactado si no está en dev mode
      if (!isDevMode) {
        console.log('[MAGIC-LINK] Link generado para:', redactEmail(correoNormalizado));
      }
      // TODO: Enviar email real aquí
      // await sendMagicLinkEmail(correoNormalizado, magicLink);
    }

    // Construir respuesta base
    const response: {
      success: true;
      message: string;
      magicLink?: string;
    } = {
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás un link de acceso en breve.',
    };

    // Incluir magicLink en respuesta SOLO si ambos flags están habilitados
    if (canExposeMagicLink) {
      response.magicLink = magicLink;
    }

    // Siempre retornar éxito (para evitar enumeración de usuarios)
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[MAGIC-LINK] Error al procesar solicitud:', error);
    
    // En caso de error, también retornar éxito genérico
    return NextResponse.json({
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás un link de acceso en breve.',
    });
  }
  */
}
