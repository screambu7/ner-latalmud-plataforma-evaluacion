import { cookies } from 'next/headers';
import { db } from './db';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return null;
  }

  try {
    const user = await db.usuario.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user || user.estado !== 'ACTIVO') {
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

