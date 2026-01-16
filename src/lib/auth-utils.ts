import { cookies } from 'next/headers';
import { signSessionJWT } from './jwt';
import { Rol } from '@prisma/client';

/**
 * Establece una cookie de sesión JWT (PR1)
 * 
 * @param userId - ID del usuario
 * @param rol - Rol del usuario
 * @param escuelaId - ID de la escuela (opcional)
 */
export async function setSessionCookie(
  userId: number,
  rol: Rol,
  escuelaId?: number | null
) {
  const cookieStore = await cookies();
  const sessionToken = await signSessionJWT(userId, rol, escuelaId);
  
  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
}

/**
 * Borra la cookie de sesión de forma segura
 * 
 * Establece la cookie con maxAge=0 para asegurar que se borre inmediatamente
 * en todos los navegadores, incluso si hay problemas con delete().
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  
  // Establecer cookie vacía con maxAge=0 para borrado seguro
  // Debe coincidir con las opciones de setSessionCookie para asegurar borrado correcto
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Borrar inmediatamente
  });
}



