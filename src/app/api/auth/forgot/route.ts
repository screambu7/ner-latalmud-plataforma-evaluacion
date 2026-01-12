import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Endpoint de recuperación de contraseña (STUB)
 * 
 * CONTRATO:
 * - POST /api/auth/forgot
 * - Body: { correo: string }
 * - Respuesta exitosa (200): { success: true, message: string }
 * - Errores:
 *   - 400: Correo inválido o faltante
 *   - 404: Usuario no encontrado (opcional, puede retornar 200 para seguridad)
 *   - 500: Error del servidor
 * 
 * NOTA: Este es un stub. No envía emails reales.
 * TODO: Implementar envío de email cuando se requiera funcionalidad completa.
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  console.log('[FORGOT] Iniciando proceso de recuperación de contraseña');
  
  try {
    // Validar request body
    let body;
    try {
      body = await request.json();
      console.log('[FORGOT] Request body recibido');
    } catch (parseError) {
      console.error('[FORGOT] Error al parsear request body:', parseError);
      return NextResponse.json(
        { error: 'Cuerpo de la solicitud inválido' },
        { status: 400 }
      );
    }

    const { correo } = body;
    console.log('[FORGOT] Email recibido:', correo ? `${correo.substring(0, 3)}***` : 'undefined');

    // Validar que correo existe y es string
    if (!correo || typeof correo !== 'string') {
      console.warn('[FORGOT] Validación fallida: correo faltante o inválido');
      return NextResponse.json(
        { error: 'Correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Normalizar email
    const correoNormalizado = correo.trim().toLowerCase();
    console.log('[FORGOT] Email normalizado:', correoNormalizado);

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoNormalizado)) {
      console.warn('[FORGOT] Validación fallida: formato de email inválido');
      return NextResponse.json(
        { error: 'Formato de correo electrónico inválido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    // Por seguridad, siempre retornamos éxito aunque el usuario no exista
    // (evita enumeración de usuarios)
    try {
      console.log('[FORGOT] Verificando existencia de usuario...');
      const usuario = await db.usuario.findUnique({
        where: { correo: correoNormalizado },
        select: { id: true, correo: true }, // Solo seleccionar campos necesarios
      });

      if (usuario) {
        // Usuario existe
        console.log('[FORGOT] Usuario encontrado, ID:', usuario.id);
        // TODO: Aquí se implementaría el envío de email con link de recuperación
        // Por ahora, solo logueamos (en producción no debería loguearse)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[FORGOT] [STUB] Se solicitaría recuperación de contraseña para: ${correoNormalizado}`);
        }
      } else {
        // Usuario no existe, pero retornamos éxito por seguridad
        console.log('[FORGOT] Usuario no encontrado (retornando éxito por seguridad)');
        if (process.env.NODE_ENV === 'development') {
          console.log(`[FORGOT] [STUB] Intento de recuperación para usuario inexistente: ${correoNormalizado}`);
        }
      }
    } catch (dbError) {
      // Error de base de datos
      console.error('[FORGOT] Error al verificar usuario:', {
        error: dbError instanceof Error ? dbError.message : String(dbError),
      });
      // Aún así retornamos éxito por seguridad
    }

    const duration = Date.now() - startTime;
    console.log('[FORGOT] Proceso completado:', { duration: `${duration}ms` });

    // Siempre retornar éxito (por seguridad, evita enumeración)
    return NextResponse.json({
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña.',
    });
  } catch (error: any) {
    // Error inesperado
    const duration = Date.now() - startTime;
    console.error('[FORGOT] Error inesperado:', {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
