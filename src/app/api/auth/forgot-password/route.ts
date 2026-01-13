import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken, hashToken, buildMagicLink, redactEmail } from '@/lib/magic-link';

const MAGIC_LINK_TTL_MINUTES = parseInt(process.env.MAGIC_LINK_TTL_MINUTES || '15', 10);

/**
 * Endpoint para solicitar recuperación de contraseña
 * 
 * CONTRATO:
 * - POST /api/auth/forgot-password
 * - Body: { correo: string }
 * - Respuesta exitosa (200): { success: true, message: string, magicLink?: string }
 * - Errores:
 *   - 400: Correo inválido o faltante
 *   - 500: Error del servidor
 * 
 * NOTA: Por seguridad, siempre retorna éxito aunque el email no exista.
 * Usa magic links para acceso (mismo sistema que request-link).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { correo } = body;

    // Validaciones
    if (!correo || typeof correo !== 'string') {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
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
        console.log('[FORGOT-PASSWORD] Link generado para:', redactEmail(correoNormalizado));
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
      message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
    };

    // Incluir magicLink en respuesta SOLO si ambos flags están habilitados
    if (canExposeMagicLink) {
      response.magicLink = magicLink;
    }

    // Por seguridad, siempre retornar éxito
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[FORGOT-PASSWORD] Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
