import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from './lib/db';

export async function middleware(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value;

  // Rutas públicas
  if (request.nextUrl.pathname === '/login') {
    if (userId) {
      // Si ya está logueado, redirigir según rol
      try {
        const user = await db.usuario.findUnique({
          where: { id: parseInt(userId) },
        });

        if (user && user.estado === 'ACTIVO') {
          if (user.rol === 'ADMIN_PRINCIPAL' || user.rol === 'ADMIN_GENERAL') {
            return NextResponse.redirect(new URL('/admin-dashboard', request.url));
          } else if (user.rol === 'EVALUADOR') {
            return NextResponse.redirect(new URL('/evaluador-dashboard', request.url));
          }
        }
      } catch (error) {
        // Si hay error, permitir acceso a login
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
    
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const user = await db.usuario.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user || user.estado !== 'ACTIVO') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (user.rol !== 'ADMIN_PRINCIPAL' && user.rol !== 'ADMIN_GENERAL') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Proteger rutas de evaluador
  if (request.nextUrl.pathname.startsWith('/evaluador-dashboard') ||
      request.nextUrl.pathname.startsWith('/mis-alumnos') ||
      request.nextUrl.pathname.startsWith('/evaluar')) {
    
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const user = await db.usuario.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user || user.estado !== 'ACTIVO') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (user.rol !== 'EVALUADOR') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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

