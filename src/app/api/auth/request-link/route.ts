/**
 * API Route: Request Magic Link (PR1)
 * 
 * POST /api/auth/request-link
 * Body: { correo: string }
 * 
 * Genera un magic link y lo "envía" (por ahora solo loguea en consola).
 * Siempre retorna éxito para evitar enumeración de usuarios.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken, hashToken, buildMagicLink, redactEmail } from '@/lib/magic-link';

const MAGIC_LINK_TTL_MINUTES = parseInt(process.env.MAGIC_LINK_TTL_MINUTES || '15', 10);

export async function POST(request: Request) {
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

    // "Enviar" link (por ahora solo loguear)
    if (process.env.NODE_ENV === 'development') {
      // En desarrollo: loguear link completo
      console.log('[MAGIC-LINK] Link generado para:', correoNormalizado);
      console.log('[MAGIC-LINK] Link:', magicLink);
    } else {
      // En staging/production: loguear pero redactando email
      console.log('[MAGIC-LINK] Link generado para:', redactEmail(correoNormalizado));
      // TODO: Enviar email real aquí
      // await sendMagicLinkEmail(correoNormalizado, magicLink);
    }

    // Siempre retornar éxito (para evitar enumeración de usuarios)
    return NextResponse.json({
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás un link de acceso en breve.',
    });
  } catch (error: any) {
    console.error('[MAGIC-LINK] Error al procesar solicitud:', error);
    
    // En caso de error, también retornar éxito genérico
    return NextResponse.json({
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás un link de acceso en breve.',
    });
  }
}
