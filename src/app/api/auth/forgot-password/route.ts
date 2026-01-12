import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * ⚠️ IMPORTANTE: Implementar envío de emails
 * 
 * Opciones recomendadas:
 * - Resend (https://resend.com)
 * - SendGrid
 * - Nodemailer con SMTP
 * 
 * También se puede implementar con tokens de reset en BD
 */

/**
 * Endpoint para solicitar recuperación de contraseña
 * 
 * CONTRATO:
 * - POST /api/auth/forgot-password
 * - Body: { correo: string }
 * - Respuesta exitosa (200): { success: true, message: string }
 * - Errores:
 *   - 400: Correo inválido o faltante
 *   - 500: Error del servidor
 * 
 * NOTA: Por seguridad, siempre retorna éxito aunque el email no exista
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

    // Buscar usuario
    const usuario = await db.usuario.findUnique({
      where: { correo: correoNormalizado },
    });

    // ⚠️ TODO: Implementar lógica de recuperación
    // 1. Generar token de reset (UUID o similar)
    // 2. Guardar token en BD con expiración (ej: 1 hora)
    // 3. Enviar email con enlace de reset
    // 4. Crear endpoint /api/auth/reset-password para procesar el reset

    // Por ahora, solo loguear (no enviar email real)
    // No loguear email completo en producción (PII)
    if (usuario) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[FORGOT-PASSWORD] Token de reset generado para:', correoNormalizado);
      } else {
        console.log('[FORGOT-PASSWORD] Token de reset generado');
      }
      // TODO: Generar token y enviar email
    } else {
      // No loguear email en ningún caso por seguridad
      console.log('[FORGOT-PASSWORD] Email no encontrado (no revelar)');
    }

    // Por seguridad, siempre retornar éxito
    return NextResponse.json({
      success: true,
      message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
    });
  } catch (error: any) {
    console.error('[FORGOT-PASSWORD] Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
