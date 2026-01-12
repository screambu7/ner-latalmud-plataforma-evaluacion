/**
 * Server Actions para Generación de Reportes y PDFs
 * 
 * Maneja la generación de PDFs a partir de reportes guardados.
 * 
 * Arquitectura:
 * - Usa payload guardado del reporte (no recalcula)
 * - Genera PDF usando HTML real
 * - Guarda archivo y metadata en tabla Archivo
 * - Versiona PDFs (cada generación crea nuevo archivo)
 */

'use server';

import { getCurrentUser, requireAnyRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { Rol } from '@prisma/client';
import { generarPDFReporte } from '@/lib/pdf-service';
import type { ReporteProgresoData } from '@/lib/types/evaluador-dtos';
import type { ActionResult } from './evaluador';

// ============================================
// GENERAR PDF DE REPORTE
// ============================================

/**
 * Genera un PDF a partir de un reporte existente.
 * 
 * El PDF usa el contenido JSON guardado del reporte (no recalcula).
 * Cada generación crea un nuevo archivo versionado.
 * 
 * @param reporteId - ID del reporte
 * @returns ID del archivo creado o error
 */
export async function generarPDFReporteAction(
  reporteId: number
): Promise<ActionResult<{ archivoId: number }>> {
  try {
    // Requiere autenticación (cualquier rol autenticado puede ser owner)
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    // Obtener reporte con sus relaciones
    const reporte = await db.reporte.findUnique({
      where: { id: reporteId },
      include: {
        generadoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        alumno: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            escuela: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!reporte) {
      return { success: false, error: 'Reporte no encontrado' };
    }

    // Verificar permisos: solo el generador o SUPER_ADMIN puede generar PDF
    const isSuperAdmin = user.rol === Rol.SUPER_ADMIN;
    const isOwner = reporte.generadoPorId === user.id;
    
    if (!isSuperAdmin && !isOwner) {
      return { success: false, error: 'No autorizado' };
    }

    // Validar que el reporte tiene contenido
    if (!reporte.contenido) {
      return {
        success: false,
        error: 'El reporte no tiene contenido guardado',
      };
    }

    // Parsear contenido del reporte
    let datosReporte: ReporteProgresoData;
    try {
      datosReporte = reporte.contenido as unknown as ReporteProgresoData;
    } catch (error) {
      return {
        success: false,
        error: 'Error al parsear contenido del reporte',
      };
    }

    // Validar estructura de datos
    if (!datosReporte.alumno || !datosReporte.habilidadesClave) {
      return {
        success: false,
        error: 'El contenido del reporte no tiene la estructura esperada',
      };
    }

    // Generar PDF
    const resultadoPDF = await generarPDFReporte({
      data: datosReporte,
      reporteId: reporte.id,
      nombreArchivo: `reporte-${reporte.id}-${Date.now()}`,
    });

    // Guardar archivo en la base de datos
    const archivo = await db.archivo.create({
      data: {
        nombre: resultadoPDF.nombreArchivo,
        nombreOriginal: `Reporte_Academico_${reporte.alumno?.nombre || 'Alumno'}_${new Date().toISOString().split('T')[0]}.pdf`,
        tipo: 'PDF_REPORTE',
        mimeType: resultadoPDF.mimeType,
        tamaño: resultadoPDF.tamaño,
        ruta: resultadoPDF.ruta,
        reporteId: reporte.id,
        subidoPorId: user.id,
      },
    });

    return { success: true, data: { archivoId: archivo.id } };
  } catch (error) {
    console.error('Error en generarPDFReporteAction:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error al generar PDF del reporte',
    };
  }
}

/**
 * Obtiene la URL de descarga de un archivo PDF.
 * 
 * @param archivoId - ID del archivo
 * @returns URL de descarga o error
 */
export async function obtenerURLDescargaPDF(
  archivoId: number
): Promise<ActionResult<{ url: string }>> {
  try {
    // Requiere autenticación (cualquier rol autenticado puede ser owner)
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    // Obtener archivo
    const archivo = await db.archivo.findUnique({
      where: { id: archivoId },
      include: {
        reporte: {
          include: {
            generadoPor: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!archivo) {
      return { success: false, error: 'Archivo no encontrado' };
    }

    // Verificar permisos: solo el generador o SUPER_ADMIN puede descargar
    const isSuperAdmin = user.rol === Rol.SUPER_ADMIN;
    const isOwner = archivo.reporte?.generadoPor.id === user.id || archivo.subidoPorId === user.id;
    
    if (!isSuperAdmin && !isOwner) {
      return { success: false, error: 'No autorizado' };
    }

    // Generar URL de descarga
    // ⚠️ TODO: Implementar endpoint de descarga seguro
    const url = `/api/archivos/${archivoId}/descargar`;

    return { success: true, data: { url } };
  } catch (error) {
    console.error('Error en obtenerURLDescargaPDF:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Error al obtener URL de descarga',
    };
  }
}

/**
 * Lista los PDFs generados para un reporte.
 * 
 * @param reporteId - ID del reporte
 * @returns Lista de archivos PDF o error
 */
export async function listarPDFsReporte(
  reporteId: number
): Promise<
  ActionResult<
    Array<{
      id: number;
      nombre: string;
      nombreOriginal: string;
      tamaño: number;
      creadoEn: Date;
    }>
  >
> {
  try {
    // Requiere autenticación (cualquier rol autenticado puede ser owner)
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    // Obtener reporte
    const reporte = await db.reporte.findUnique({
      where: { id: reporteId },
      include: {
        generadoPor: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!reporte) {
      return { success: false, error: 'Reporte no encontrado' };
    }

    // Verificar permisos: solo el generador o SUPER_ADMIN puede listar PDFs
    const isSuperAdmin = user.rol === Rol.SUPER_ADMIN;
    const isOwner = reporte.generadoPorId === user.id;
    
    if (!isSuperAdmin && !isOwner) {
      return { success: false, error: 'No autorizado' };
    }

    // Obtener archivos PDF del reporte
    const archivos = await db.archivo.findMany({
      where: {
        reporteId: reporteId,
        tipo: 'PDF_REPORTE',
      },
      orderBy: {
        creadoEn: 'desc',
      },
      select: {
        id: true,
        nombre: true,
        nombreOriginal: true,
        tamaño: true,
        creadoEn: true,
      },
    });

    return { success: true, data: archivos };
  } catch (error) {
    console.error('Error en listarPDFsReporte:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Error al listar PDFs del reporte',
    };
  }
}
