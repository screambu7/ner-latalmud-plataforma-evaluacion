import { cookies } from 'next/headers';
import { db } from './db';
import { Rol } from '@prisma/client';
import { verifySessionJWT } from './jwt';

/**
 * Tipo para el usuario autenticado
 */
export type AuthenticatedUser = {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  estado: 'ACTIVO' | 'INACTIVO';
};

/**
 * Obtiene el usuario actual desde la cookie de sesión JWT (PR1).
 * 
 * Verifica el JWT y luego valida el estado del usuario en la DB.
 * 
 * @returns Usuario autenticado o null si no hay sesión válida
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  // Verificar JWT
  const session = await verifySessionJWT(sessionCookie);
  if (!session) {
    return null;
  }

  // Validar estado del usuario en la DB (el JWT solo contiene sub, rol, escuelaId)
  try {
    const user = await db.usuario.findUnique({
      where: { id: session.sub },
    });

    if (!user || user.estado !== 'ACTIVO') {
      return null;
    }

    // Verificar que el rol en el JWT coincide con el de la DB
    // (por si el rol cambió después de crear la sesión)
    if (user.rol !== session.rol) {
      // Rol cambió, sesión inválida
      return null;
    }

    return {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      estado: user.estado,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Requiere que el usuario tenga un rol específico.
 * 
 * Si el usuario no está autenticado o no tiene el rol requerido,
 * lanza un error que debe ser manejado por el caller.
 * 
 * @param requiredRole - Rol requerido
 * @returns Usuario autenticado con el rol requerido
 * @throws Error si no está autenticado o no tiene el rol
 */
export async function requireRole(
  requiredRole: Rol
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('No autenticado');
  }

  if (user.rol !== requiredRole) {
    throw new Error('No autorizado');
  }

  return user;
}

/**
 * Requiere que el usuario tenga uno de los roles especificados.
 * 
 * @param allowedRoles - Array de roles permitidos
 * @returns Usuario autenticado con uno de los roles permitidos
 * @throws Error si no está autenticado o no tiene ninguno de los roles
 */
export async function requireAnyRole(
  allowedRoles: Rol[]
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('No autenticado');
  }

  if (!allowedRoles.includes(user.rol)) {
    throw new Error('No autorizado');
  }

  return user;
}

/**
 * Verifica si el usuario tiene un rol específico.
 * Útil para validaciones condicionales sin lanzar errores.
 * 
 * @param requiredRole - Rol a verificar
 * @returns true si el usuario tiene el rol, false en caso contrario
 */
export async function hasRole(requiredRole: Rol): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.rol === requiredRole || false;
}

