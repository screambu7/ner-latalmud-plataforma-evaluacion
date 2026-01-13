/**
 * Endpoint de recuperación de contraseña (PR1)
 * 
 * CONTRATO:
 * - POST /api/auth/forgot
 * - Body: { correo: string }
 * - Respuesta exitosa (200): { success: true, message: string }
 * 
 * COMPORTAMIENTO:
 * - Se comporta igual que /api/auth/request-link
 * - No revela si el usuario existe (evita enumeración)
 * - Genera magic link para acceso
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
        console.log('[FORGOT] Link generado para:', redactEmail(correoNormalizado));
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
    console.error('[FORGOT] Error al procesar solicitud:', error);
    
    // En caso de error, también retornar éxito genérico
    return NextResponse.json({
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás un link de acceso en breve.',
    });
  }
}
