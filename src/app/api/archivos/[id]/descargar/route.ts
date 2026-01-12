/**
 * API Route para descargar archivos
 * 
 * Proporciona acceso seguro a archivos guardados en el sistema.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Rol } from '@prisma/client';

const PDF_STORAGE_DIR = process.env.PDF_STORAGE_DIR || './storage/pdfs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const archivoId = parseInt(id, 10);

    if (isNaN(archivoId)) {
      return NextResponse.json({ error: 'ID de archivo inválido' }, { status: 400 });
    }

    // Verificar autenticación
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await db.usuario.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user || user.estado !== 'ACTIVO') {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
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
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Verificar permisos: SUPER_ADMIN o owner pueden descargar
    const isSuperAdmin = user.rol === Rol.SUPER_ADMIN;
    const isOwner = archivo.reporte?.generadoPor.id === user.id || archivo.subidoPorId === user.id;
    
    if (!isSuperAdmin && !isOwner) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Leer archivo del sistema de archivos
    const rutaCompleta = join(PDF_STORAGE_DIR, archivo.ruta);
    const buffer = await readFile(rutaCompleta);

    // Retornar archivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': archivo.mimeType,
        'Content-Disposition': `attachment; filename="${archivo.nombreOriginal}"`,
        'Content-Length': archivo.tamaño.toString(),
      },
    });
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    return NextResponse.json(
      { error: 'Error al descargar archivo' },
      { status: 500 }
    );
  }
}
