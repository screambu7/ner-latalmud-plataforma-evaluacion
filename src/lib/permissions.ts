import { Rol } from '@prisma/client';

/**
 * Verifica si un rol puede exportar PDFs.
 * 
 * @param rol - Rol del usuario
 * @returns true si el rol puede exportar PDFs
 */
export function canExportPDF(rol: Rol): boolean {
  return rol === Rol.SUPER_ADMIN;
}



