/**
 * Server Actions para gestión de usuarios (SUPER_ADMIN only)
 * 
 * Todas las acciones requieren rol SUPER_ADMIN.
 * Incluye protección para prevenir degradar último SUPER_ADMIN.
 */

'use server';

import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { Rol, EstadoCuenta } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { isSuperAdminEmail } from '@/config/super-admins';
import { validatePasswordPolicy, PasswordPolicyError } from '@/lib/security/password-policy';

/**
 * Tipo de resultado de acción
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Tipo de usuario para la UI
 */
export type UsuarioListItem = {
  id: number;
  correo: string;
  nombre: string;
  rol: Rol;
  estado: EstadoCuenta;
  escuelaId: number | null;
  escuela: {
    id: number;
    nombre: string;
  } | null;
  creadoEn: Date;
};

function redactEmail(correo: string): string {
  const [user, domain] = correo.split('@');
  if (!user || !domain) {
    return 'redacted';
  }
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Obtiene lista de usuarios con búsqueda y filtros
 */
export async function getUsuarios(
  search?: string,
  rolFilter?: Rol,
  estadoFilter?: EstadoCuenta
): Promise<ActionResult<UsuarioListItem[]>> {
  try {
    const user = await requireRole(Rol.SUPER_ADMIN);

    // Construir where clause
    const where: any = {};

    // Búsqueda por email o nombre
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      where.OR = [
        { correo: { contains: searchTerm, mode: 'insensitive' } },
        { nombre: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Filtro por rol
    if (rolFilter) {
      where.rol = rolFilter;
    }

    // Filtro por estado
    if (estadoFilter) {
      where.estado = estadoFilter;
    }

    const usuarios = await db.usuario.findMany({
      where,
      include: {
        escuela: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    return {
      success: true,
      data: usuarios.map((u) => ({
        id: u.id,
        correo: u.correo,
        nombre: u.nombre,
        rol: u.rol,
        estado: u.estado,
        escuelaId: u.escuelaId,
        escuela: u.escuela,
        creadoEn: u.creadoEn,
      })),
    };
  } catch (error) {
    console.error('[USUARIOS] Error al obtener usuarios:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error al obtener usuarios' };
  }
}

/**
 * Tipo de input para crear usuario
 * 
 * INVARIANTE: password es OBLIGATORIO (no opcional)
 * TypeScript fallará si se intenta llamar sin password
 */
export type CreateUsuarioInput = {
  correo: string;
  nombre: string;
  password: string; // OBLIGATORIO - no opcional
  rol?: Rol;
  estado?: EstadoCuenta;
  escuelaId?: number | null;
};

/**
 * Crea un nuevo usuario con passwordHash (password-only)
 * 
 * INVARIANTE: password es OBLIGATORIO desde la creación.
 * No es posible crear usuarios sin passwordHash.
 * 
 * @param correo - Correo electrónico del usuario
 * @param nombre - Nombre completo del usuario
 * @param password - Password del usuario (OBLIGATORIO, validado con password-policy)
 * @param rol - Rol del usuario (default: EVALUADOR)
 * @param estado - Estado de la cuenta (default: ACTIVO)
 * @param escuelaId - ID de la escuela (opcional)
 * @returns ActionResult con usuarioId del usuario creado
 */
export async function createUsuario(
  correo: string,
  nombre: string,
  password: string, // OBLIGATORIO - no opcional
  rol: Rol = Rol.EVALUADOR,
  estado: EstadoCuenta = EstadoCuenta.ACTIVO,
  escuelaId?: number | null
): Promise<ActionResult<{ usuarioId: number }>> {
  try {
    const admin = await requireRole(Rol.SUPER_ADMIN);

    // Validar email
    const correoNormalizado = correo.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoNormalizado)) {
      return { success: false, error: 'Formato de correo electrónico inválido' };
    }

    // Validar nombre
    if (!nombre || nombre.trim().length === 0) {
      return { success: false, error: 'Nombre es requerido' };
    }

    // Validar password usando política centralizada
    try {
      validatePasswordPolicy(password);
    } catch (error) {
      if (error instanceof PasswordPolicyError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Password inválido' };
    }

    // Validar que el email no exista
    const usuarioExistente = await db.usuario.findUnique({
      where: { correo: correoNormalizado },
    });

    if (usuarioExistente) {
      return { success: false, error: 'Este correo electrónico ya está registrado' };
    }

    // Validar escuela si se proporciona
    if (escuelaId) {
      const escuela = await db.escuela.findUnique({
        where: { id: escuelaId },
      });
      if (!escuela) {
        return { success: false, error: 'Escuela no encontrada' };
      }
    }

    // Determinar rol final (si está en SUPER_ADMIN_EMAILS, forzar SUPER_ADMIN)
    const rolFinal = isSuperAdminEmail(correoNormalizado) ? Rol.SUPER_ADMIN : rol;

    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const usuario = await db.usuario.create({
      data: {
        correo: correoNormalizado,
        nombre: nombre.trim(),
        rol: rolFinal,
        estado,
        escuelaId: escuelaId || null,
        passwordHash,
      },
    });

    // Audit log
    console.log('[AUDIT] Usuario creado:', {
      adminId: admin.id,
      adminEmail: admin.correo,
      nuevoUsuarioId: usuario.id,
      nuevoUsuarioEmail: redactEmail(correoNormalizado),
      rol: rolFinal,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        usuarioId: usuario.id,
      },
    };
  } catch (error: any) {
    console.error('[USUARIOS] Error al crear usuario:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Este correo electrónico ya está registrado' };
    }
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error al crear usuario' };
  }
}

/**
 * Actualiza rol y/o estado de un usuario
 */
export async function updateUsuario(
  usuarioId: number,
  updates: {
    rol?: Rol;
    estado?: EstadoCuenta;
  }
): Promise<ActionResult<{ usuario: UsuarioListItem }>> {
  try {
    const admin = await requireRole(Rol.SUPER_ADMIN);

    // Obtener usuario actual
    const usuario = await db.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        escuela: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Protección: Prevenir degradar último SUPER_ADMIN
    if (updates.rol && updates.rol !== Rol.SUPER_ADMIN && usuario.rol === Rol.SUPER_ADMIN) {
      // Contar cuántos SUPER_ADMIN activos hay
      const superAdminCount = await db.usuario.count({
        where: {
          rol: Rol.SUPER_ADMIN,
          estado: EstadoCuenta.ACTIVO,
        },
      });

      if (superAdminCount <= 1) {
        return {
          success: false,
          error: 'No se puede degradar el último SUPER_ADMIN activo',
        };
      }
    }

    // Determinar rol final (si está en SUPER_ADMIN_EMAILS, forzar SUPER_ADMIN)
    let rolFinal = updates.rol;
    if (updates.rol && !isSuperAdminEmail(usuario.correo)) {
      rolFinal = updates.rol;
    } else if (isSuperAdminEmail(usuario.correo)) {
      // Si el email está en SUPER_ADMIN_EMAILS, siempre debe ser SUPER_ADMIN
      rolFinal = Rol.SUPER_ADMIN;
    } else {
      rolFinal = usuario.rol; // Mantener rol actual si no se especifica
    }

    // Actualizar usuario
    const usuarioActualizado = await db.usuario.update({
      where: { id: usuarioId },
      data: {
        ...(updates.rol && { rol: rolFinal }),
        ...(updates.estado && { estado: updates.estado }),
      },
      include: {
        escuela: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // Audit log
    console.log('[AUDIT] Usuario actualizado:', {
      adminId: admin.id,
      adminEmail: admin.correo,
      usuarioId: usuario.id,
      usuarioEmail: redactEmail(usuario.correo),
      cambios: {
        rolAnterior: usuario.rol,
        rolNuevo: usuarioActualizado.rol,
        estadoAnterior: usuario.estado,
        estadoNuevo: usuarioActualizado.estado,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        usuario: {
          id: usuarioActualizado.id,
          correo: usuarioActualizado.correo,
          nombre: usuarioActualizado.nombre,
          rol: usuarioActualizado.rol,
          estado: usuarioActualizado.estado,
          escuelaId: usuarioActualizado.escuelaId,
          escuela: usuarioActualizado.escuela,
          creadoEn: usuarioActualizado.creadoEn,
        },
      },
    };
  } catch (error) {
    console.error('[USUARIOS] Error al actualizar usuario:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error al actualizar usuario' };
  }
}

/**
 * Obtiene lista de escuelas para dropdown
 */
export async function getEscuelas(): Promise<ActionResult<Array<{ id: number; nombre: string }>>> {
  try {
    await requireRole(Rol.SUPER_ADMIN);

    const escuelas = await db.escuela.findMany({
      where: {
        estado: EstadoCuenta.ACTIVO,
      },
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return {
      success: true,
      data: escuelas,
    };
  } catch (error) {
    console.error('[USUARIOS] Error al obtener escuelas:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error al obtener escuelas' };
  }
}
