/**
 * ============================================================================
 * EDGE MIDDLEWARE - AUTHENTICATION & AUTHORIZATION
 * ============================================================================
 * 
 * ⚠️ CRITICAL CONSTRAINTS (Edge Runtime):
 * 
 * 1. NO DATABASE ACCESS
 *    - Edge Runtime no soporta Prisma/PostgreSQL
 *    - No podemos consultar BD para validar estado del usuario
 *    - Solo podemos verificar el JWT (firma, expiración, estructura)
 * 
 * 2. NO NODE APIs
 *    - No usar Node.js crypto, fs, etc.
 *    - Usar solo Web APIs compatibles con Edge
 *    - jose library es compatible (usa Web Crypto API)
 * 
 * 3. ROLE STALENESS TRADE-OFF
 *    - El middleware valida el rol del JWT, no el de la BD
 *    - Si un usuario es degradado/desactivado, el JWT sigue válido hasta expirar (7 días)
 *    - Esto es un trade-off aceptable para mantener Edge compatibility
 *    - Las rutas API (server-side) SÍ validan el estado actual usando getCurrentUser()
 * 
 * 4. STATELESS BY DESIGN
 *    - No side effects (no logging a BD, no actualización de sesiones)
 *    - Solo lectura de cookie, verificación JWT, y redirección
 * 
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Rol } from '@prisma/client';
import { verifySessionJWT } from './lib/jwt';
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

