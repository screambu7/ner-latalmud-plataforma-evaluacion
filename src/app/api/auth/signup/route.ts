import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Rol, EstadoCuenta } from '@prisma/client';
import { isSuperAdminEmail } from '@/config/super-admins';
import { generateToken, hashToken, buildMagicLink, redactEmail } from '@/lib/magic-link';

/**
 * Endpoint de registro de usuarios
 * 
 * NOTA: Auth uses Magic Link. Password fields are ignored intentionally.
 * 
 * CONTRATO:
 * - POST /api/auth/signup
 * - Body: { nombre: string, correo: string, password?: string } (password se ignora)
 * - Respuesta exitosa (200): { success: true, message: string }
 * - Errores:
 *   - 400: Datos inválidos o faltantes
 *   - 409: Usuario ya existe
 *   - 500: Error del servidor
 */
export async function POST(request: Request) {
  console.log('[SIGNUP] Iniciando proceso de registro');
  
  // Verificar que DATABASE_URL esté configurada
  if (!process.env.DATABASE_URL) {
    console.error('[SIGNUP] DATABASE_URL no está configurada');
    return NextResponse.json(
      { error: 'Error de configuración del servidor. Contacta al administrador.' },
      { status: 500 }
    );
  }
  
  // Verificar que no estemos usando mocks en producción
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
  if (isProduction && !process.env.DATABASE_URL) {
    console.error('[SIGNUP] Intentando usar mocks en producción');
    return NextResponse.json(
      { error: 'Error de configuración del servidor. Contacta al administrador.' },
      { status: 500 }
    );
  }
  
  console.log('[SIGNUP] DATABASE_URL configurada:', process.env.DATABASE_URL ? 'Sí' : 'No');
  console.log('[SIGNUP] DATABASE_URL preview:', process.env.DATABASE_URL 
    ? `${process.env.DATABASE_URL.substring(0, 50)}...` 
    : 'not configured');
  
  const MAGIC_LINK_TTL_MINUTES = parseInt(process.env.MAGIC_LINK_TTL_MINUTES || '15', 10);

  try {
    const body = await request.json();
    const { nombre, correo } = body;
    // Auth uses Magic Link. Password fields are ignored intentionally.
    console.log('[SIGNUP] Datos recibidos:', { nombre, correo: correo ? `${correo.substring(0, 3)}***` : 'undefined' });

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
    console.log('[SIGNUP] Verificando si usuario existe...');
    let usuarioExistente;
    try {
      // Test de conexión básica antes de la query real
      await db.$queryRaw`SELECT 1`;
      console.log('[SIGNUP] Conexión a BD verificada');
      
      usuarioExistente = await db.usuario.findUnique({
        where: { correo: correoNormalizado },
      });
      console.log('[SIGNUP] Query de usuario completada');
    } catch (dbError: any) {
      console.error('[SIGNUP] Error al verificar usuario existente:', {
        message: dbError.message,
        code: dbError.code,
        name: dbError.name,
        meta: dbError.meta,
      });
      
      // Si es error de conexión, retornar error específico
      if (
        dbError.code === 'P1001' || // Can't reach database server
        dbError.code === 'P1000' || // Authentication failed
        dbError.code === 'P1002' || // Database server closed the connection
        dbError.message?.includes('connect') || 
        dbError.message?.includes('connection') ||
        dbError.message?.includes('ECONNREFUSED') ||
        dbError.message?.includes('timeout')
      ) {
        return NextResponse.json(
          { 
            error: 'Error de conexión a la base de datos. Por favor, intenta más tarde.',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
          },
          { status: 503 }
        );
      }
      // Re-lanzar para que se maneje en el catch general
      throw dbError;
    }

    if (usuarioExistente) {
      console.log('[SIGNUP] Usuario ya existe');
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    // Determinar rol basado en SUPER_ADMIN_EMAILS
    let rol: Rol = Rol.EVALUADOR; // Por defecto
    try {
      if (isSuperAdminEmail(correoNormalizado)) {
        console.log('[SIGNUP] Email es SUPER_ADMIN');
        rol = Rol.SUPER_ADMIN;
      }
    } catch (error: any) {
      // Si hay error, continuar con rol por defecto
      console.warn('[SIGNUP] Error al verificar SUPER_ADMIN, usando rol por defecto:', error.message);
    }

    // Crear usuario (sin passwordHash - Auth uses Magic Link)
    console.log('[SIGNUP] Creando usuario en BD...', { correo: correoNormalizado, rol });
    let nuevoUsuario;
    try {
      nuevoUsuario = await db.usuario.create({
        data: {
          nombre: nombre.trim(),
          correo: correoNormalizado,
          rol: rol,
          estado: EstadoCuenta.ACTIVO,
          // passwordHash NO se incluye - Auth uses Magic Link
        },
      });
      console.log('[SIGNUP] Usuario creado exitosamente, ID:', nuevoUsuario.id);
    } catch (createError: any) {
      console.error('[SIGNUP] Error al crear usuario:', {
        message: createError.message,
        code: createError.code,
        meta: createError.meta,
      });
      // Re-lanzar para que se maneje en el catch general
      throw createError;
    }

    // Generar magic link para el nuevo usuario (reutilizando lógica de request-link)
    console.log('[SIGNUP] Generando magic link para nuevo usuario...');
    try {
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

      // Guardar token en BD
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
        console.log('[SIGNUP] Magic link generado para nuevo usuario:', correoNormalizado);
        console.log('[SIGNUP] Magic link:', magicLink);
      } else {
        // En staging/production: loguear pero redactando email
        console.log('[SIGNUP] Magic link generado para nuevo usuario:', redactEmail(correoNormalizado));
        // TODO: Enviar email real aquí
        // await sendMagicLinkEmail(correoNormalizado, magicLink);
      }
    } catch (magicLinkError: any) {
      // Si falla la generación del magic link, loguear pero no fallar el signup
      console.error('[SIGNUP] Error al generar magic link (no crítico):', magicLinkError.message);
      // El usuario ya fue creado, así que continuamos
    }

    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente. Revisa tu correo para el link de acceso.',
    });
  } catch (error: any) {
    console.error('[SIGNUP] Error completo:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
      meta: error.meta,
      cause: error.cause,
    });

    // Error de constraint (email duplicado)
    if (error.code === 'P2002') {
      console.log('[SIGNUP] Error: Email duplicado');
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    // Error de conexión a BD (Prisma error codes)
    if (
      error.code === 'P1001' || // Can't reach database server
      error.code === 'P1000' || // Authentication failed
      error.code === 'P1002' || // Database server closed the connection
      error.message?.includes('connect') || 
      error.message?.includes('connection') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('timeout')
    ) {
      console.error('[SIGNUP] Error de conexión a base de datos:', error.code, error.message);
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos. Por favor, intenta más tarde.' },
        { status: 503 }
      );
    }

    // Error de Prisma (schema, constraint, etc.)
    if (error.code?.startsWith('P')) {
      console.error('[SIGNUP] Error de Prisma:', error.code, error.message);
      // P2002 ya está manejado arriba
      if (error.code !== 'P2002') {
        return NextResponse.json(
          { error: 'Error al procesar la solicitud en la base de datos.', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error al crear la cuenta', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
