import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Rol } from '@prisma/client';
import { verifySessionJWT } from './lib/jwt';

/**
 * Middleware stateless que verifica sesiones JWT sin acceso a DB (PR1).
 * 
 * ⚠️ IMPORTANTE: Este middleware NO usa Prisma/DB para ser compatible con Edge Runtime.
 * Solo verifica el JWT y el rol. La validación completa del estado
 * del usuario (ACTIVO/INACTIVO) se hace en las rutas API usando getCurrentUser().
 * 
 * ⚠️ LIMITACIÓN: Si un usuario es degradado (cambio de rol) o desactivado,
 * el JWT seguirá siendo válido hasta que expire (7 días). El middleware
 * no puede detectar estos cambios sin consultar la BD. Las rutas API
 * sí validan el estado actual usando getCurrentUser().
 */
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const session = sessionCookie ? await verifySessionJWT(sessionCookie) : null;

  // Redirigir página principal al login
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rutas públicas
  if (request.nextUrl.pathname === '/login') {
    if (session) {
      // Si ya está logueado, redirigir según rol
      if (session.rol === Rol.SUPER_ADMIN) {
        return NextResponse.redirect(new URL('/admin-dashboard', request.url));
      } else if (session.rol === Rol.EVALUADOR) {
        return NextResponse.redirect(new URL('/evaluador-dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Proteger rutas de admin
  if (request.nextUrl.pathname.startsWith('/admin-dashboard') ||
      request.nextUrl.pathname.startsWith('/alumnos') ||
      request.nextUrl.pathname.startsWith('/evaluaciones') ||
      request.nextUrl.pathname.startsWith('/reportes') ||
      request.nextUrl.pathname.startsWith('/usuarios') ||
      request.nextUrl.pathname.startsWith('/configuracion')) {
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session.rol !== Rol.SUPER_ADMIN) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Proteger rutas de evaluador
  if (request.nextUrl.pathname.startsWith('/evaluador-dashboard') ||
      request.nextUrl.pathname.startsWith('/mis-alumnos') ||
      request.nextUrl.pathname.startsWith('/evaluar')) {
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session.rol !== Rol.EVALUADOR) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Permitir acceso a callback de magic link
  if (request.nextUrl.pathname === '/api/auth/callback') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin-dashboard',
    '/alumnos/:path*',
    '/evaluaciones/:path*',
    '/reportes/:path*',
    '/usuarios/:path*',
    '/configuracion/:path*',
    '/evaluador-dashboard',
    '/mis-alumnos/:path*',
    '/evaluar/:path*',
  ],
};

// Forzar Edge Runtime para compatibilidad
export const runtime = 'edge';

