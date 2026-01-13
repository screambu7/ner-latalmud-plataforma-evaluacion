import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Endpoint de health check para verificar conexión a base de datos
 * 
 * GET /api/health/db
 * 
 * Retorna:
 * - 200: Conexión exitosa
 * - 503: Error de conexión
 */
export async function GET() {
  try {
    // Intentar una query simple para verificar conexión
    const result = await db.$queryRaw`SELECT 1 as test`;
    
    // Verificar que la respuesta sea correcta
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Conexión a BD establecida pero query falló',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Intentar una query más real: contar usuarios
    let userCount = 0;
    try {
      userCount = await db.usuario.count();
    } catch (countError: any) {
      console.error('[HEALTH-DB] Error al contar usuarios:', countError);
      // No fallar si solo falla el count, la conexión básica funciona
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Conexión a base de datos exitosa',
      database: {
        connected: true,
        userCount,
        timestamp: new Date().toISOString(),
      },
      connectionInfo: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPreview: process.env.DATABASE_URL 
          ? `${process.env.DATABASE_URL.substring(0, 30)}...` 
          : 'not configured',
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    console.error('[HEALTH-DB] Error de conexión:', {
      message: error.message,
      code: error.code,
      name: error.name,
    });

    // Detectar tipo de error
    let errorType = 'unknown';
    let errorMessage = error.message || 'Error desconocido';

    if (error.code === 'P1001') {
      errorType = 'connection_refused';
      errorMessage = 'No se puede alcanzar el servidor de base de datos';
    } else if (error.code === 'P1000') {
      errorType = 'authentication_failed';
      errorMessage = 'Error de autenticación (usuario/password incorrecto)';
    } else if (error.code === 'P1002') {
      errorType = 'connection_closed';
      errorMessage = 'El servidor cerró la conexión';
    } else if (error.message?.includes('connect') || error.message?.includes('connection')) {
      errorType = 'connection_error';
    } else if (error.message?.includes('timeout')) {
      errorType = 'timeout';
      errorMessage = 'Timeout al conectar a la base de datos';
    }

    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
        errorType,
        code: error.code,
        database: {
          connected: false,
          timestamp: new Date().toISOString(),
        },
        connectionInfo: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlPreview: process.env.DATABASE_URL 
            ? `${process.env.DATABASE_URL.substring(0, 30)}...` 
            : 'not configured',
          nodeEnv: process.env.NODE_ENV,
        },
        troubleshooting: {
          checkDatabaseUrl: 'Verifica que DATABASE_URL esté configurada en Vercel',
          checkSupabase: 'Si usas Supabase, asegúrate de usar Connection Pooler (pooler.supabase.com)',
          checkPassword: 'Verifica que la password en DATABASE_URL sea correcta (no [PASSWORD] literal)',
          checkNetwork: 'Verifica que el servidor de BD esté accesible desde internet',
        },
      },
      { status: 503 }
    );
  }
}
