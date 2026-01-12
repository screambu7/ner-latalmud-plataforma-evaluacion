import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setUserIdCookie } from '@/lib/auth-utils';
import { Rol, EstadoCuenta } from '@prisma/client';
import { isSuperAdminEmail } from '@/config/super-admins';

/**
 * Endpoint de autenticación
 * 
 * CONTRATO:
 * - POST /api/auth
 * - Body: { correo: string }
 * - Respuesta exitosa (200): { success: true, usuario: {...}, redirectUrl: string }
 * - Errores:
 *   - 400: Correo inválido o faltante
 *   - 403: Cuenta inactiva
 *   - 500: Error del servidor
 * 
 * COMPORTAMIENTO:
 * - Si el usuario no existe, se crea automáticamente
 * - El rol se asigna basado en SUPER_ADMIN_EMAILS
 * - Si el email está en SUPER_ADMIN_EMAILS → SUPER_ADMIN
 * - Si no → EVALUADOR (por defecto)
 * - El nombre se extrae del email (parte antes del @)
 * - Estado inicial: ACTIVO
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  console.log('[AUTH] Iniciando proceso de autenticación');
  
  // Verificar que las dependencias estén disponibles
  try {
    // Test de importación de isSuperAdminEmail (lazy)
    const testEmail = 'test@example.com';
    isSuperAdminEmail(testEmail);
    console.log('[AUTH] Dependencias verificadas correctamente');
  } catch (depError: any) {
    console.error('[AUTH] Error al verificar dependencias:', {
      error: depError.message,
      stack: depError.stack,
    });
    // Continuar de todas formas, pero loguear el error
  }
  
  try {
    // Validar request body
    let body;
    try {
      body = await request.json();
      console.log('[AUTH] Request body recibido');
    } catch (parseError) {
      console.error('[AUTH] Error al parsear request body:', parseError);
      return NextResponse.json(
        { error: 'Cuerpo de la solicitud inválido' },
        { status: 400 }
      );
    }

    const { correo } = body;
    console.log('[AUTH] Email recibido:', correo ? `${correo.substring(0, 3)}***` : 'undefined');

    // Validar que correo existe y es string
    if (!correo || typeof correo !== 'string') {
      console.warn('[AUTH] Validación fallida: correo faltante o inválido');
      return NextResponse.json(
        { error: 'Correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Normalizar email (trim y lowercase)
    const correoNormalizado = correo.trim().toLowerCase();
    console.log('[AUTH] Email normalizado:', correoNormalizado);

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoNormalizado)) {
      console.warn('[AUTH] Validación fallida: formato de email inválido');
      return NextResponse.json(
        { error: 'Formato de correo electrónico inválido' },
        { status: 400 }
      );
    }

    // Buscar usuario existente o crear uno nuevo
    let usuario;
    try {
      console.log('[AUTH] Buscando usuario en base de datos...');
      usuario = await db.usuario.findUnique({
        where: { correo: correoNormalizado },
      });

      // Si no existe, crear automáticamente
      if (!usuario) {
        console.log('[AUTH] Usuario no encontrado, creando nuevo usuario...');
        
        // Determinar rol basado en SUPER_ADMIN_EMAILS
        let rol = Rol.EVALUADOR; // Por defecto
        try {
          if (isSuperAdminEmail(correoNormalizado)) {
            rol = Rol.SUPER_ADMIN;
            console.log('[AUTH] Email identificado como SUPER_ADMIN');
          }
        } catch (superAdminError) {
          console.error('[AUTH] Error al verificar SUPER_ADMIN_EMAILS:', superAdminError);
          // Continuar con rol por defecto (EVALUADOR)
          console.warn('[AUTH] Usando rol por defecto (EVALUADOR) debido a error en configuración');
        }

        // Extraer nombre del email (parte antes del @)
        const nombre = correoNormalizado.split('@')[0];

        console.log('[AUTH] Creando usuario:', { correo: correoNormalizado, nombre, rol });

        // Crear usuario
        usuario = await db.usuario.create({
          data: {
            correo: correoNormalizado,
            nombre: nombre,
            rol: rol,
            estado: EstadoCuenta.ACTIVO,
          },
        });
        console.log('[AUTH] Usuario creado exitosamente, ID:', usuario.id);
      } else {
        console.log('[AUTH] Usuario encontrado, ID:', usuario.id, 'Rol:', usuario.rol);
      }
    } catch (dbError: any) {
      // Error de base de datos (ej: constraint violation, conexión)
      console.error('[AUTH] Error en base de datos:', {
        code: dbError.code,
        message: dbError.message,
        meta: dbError.meta,
      });
      
      // Si es error de constraint (email duplicado), intentar buscar de nuevo
      if (dbError.code === 'P2002') {
        console.log('[AUTH] Error de constraint (duplicado), reintentando búsqueda...');
        try {
          usuario = await db.usuario.findUnique({
            where: { correo: correoNormalizado },
          });
          console.log('[AUTH] Usuario encontrado después de retry, ID:', usuario?.id);
        } catch (retryError) {
          console.error('[AUTH] Error en retry de búsqueda:', retryError);
          return NextResponse.json(
            { error: 'Error al procesar la autenticación' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Error al procesar la autenticación' },
          { status: 500 }
        );
      }
    }

    // Verificar que el usuario existe (no debería fallar, pero por seguridad)
    if (!usuario) {
      console.error('[AUTH] Usuario es null después de búsqueda/creación');
      return NextResponse.json(
        { error: 'Error al crear o recuperar usuario' },
        { status: 500 }
      );
    }

    // Verificar estado de la cuenta
    // Nota: Prisma devuelve enums como strings, comparar con string para consistencia
    if (usuario.estado !== 'ACTIVO') {
      console.warn('[AUTH] Intento de login con cuenta inactiva, ID:', usuario.id);
      return NextResponse.json(
        { error: 'Tu cuenta está inactiva. Contacta al administrador.' },
        { status: 403 }
      );
    }

    // Establecer cookie de sesión
    try {
      console.log('[AUTH] Estableciendo cookie de sesión para usuario ID:', usuario.id);
      await setUserIdCookie(usuario.id);
      console.log('[AUTH] Cookie establecida exitosamente');
    } catch (cookieError) {
      console.error('[AUTH] Error al establecer cookie:', cookieError);
      return NextResponse.json(
        { error: 'Error al establecer sesión' },
        { status: 500 }
      );
    }

    // Determinar URL de redirección según rol
    let redirectUrl = '/';
    if (usuario.rol === Rol.SUPER_ADMIN) {
      redirectUrl = '/admin-dashboard';
    } else if (usuario.rol === Rol.EVALUADOR) {
      redirectUrl = '/evaluador-dashboard';
    }

    const duration = Date.now() - startTime;
    console.log('[AUTH] Autenticación exitosa:', {
      usuarioId: usuario.id,
      rol: usuario.rol,
      redirectUrl,
      duration: `${duration}ms`,
    });

    // Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      redirectUrl,
    });
  } catch (error: any) {
    // Error inesperado
    const duration = Date.now() - startTime;
    console.error('[AUTH] Error inesperado:', {
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

