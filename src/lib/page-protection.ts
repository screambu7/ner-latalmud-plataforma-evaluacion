/**
 * Helpers para protección de páginas
 * 
 * Estas funciones validan permisos en las páginas y redirigen
 * si el usuario no tiene el rol requerido.
 * 
 * ⚠️ IMPORTANTE: Estas funciones son una capa adicional de seguridad.
 * El middleware también protege las rutas, pero esta validación
 * asegura protección incluso si el middleware falla.
 */

import { redirect } from 'next/navigation';
import { getCurrentUser, requireRole } from './auth';
import { Rol } from '@prisma/client';

/**
 * Protege una página requiriendo un rol específico.
 * 
 * Si el usuario no está autenticado o no tiene el rol requerido,
 * redirige a /login.
 * 
 * @param requiredRole - Rol requerido para acceder a la página
 * @returns Usuario autenticado con el rol requerido
 */
export async function protectPage(requiredRole: Rol) {
  try {
    return await requireRole(requiredRole);
  } catch (error) {
    redirect('/login');
  }
}

/**
 * Protege una página requiriendo uno de varios roles.
 * 
 * @param allowedRoles - Array de roles permitidos
 * @returns Usuario autenticado con uno de los roles permitidos
 */
export async function protectPageWithAnyRole(allowedRoles: Rol[]) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (!allowedRoles.includes(user.rol)) {
    redirect('/login');
  }
  
  return user;
}
