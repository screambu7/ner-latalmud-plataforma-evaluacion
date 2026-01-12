/**
 * API Route para descargar archivos
 * 
 * Proporciona acceso seguro a archivos guardados en el sistema.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
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

    // Verificar autenticación usando sesión firmada
    const user = await getCurrentUser();
    if (!user) {
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

    // Sanitizar ruta del archivo para prevenir path traversal
    // Normalizar y validar que la ruta no contenga .. o rutas absolutas
    const rutaNormalizada = archivo.ruta
      .replace(/\\/g, '/') // Normalizar separadores
      .replace(/\/+/g, '/') // Eliminar separadores duplicados
      .replace(/^\/+/, '') // Eliminar leading slashes
      .replace(/\.\./g, ''); // Eliminar path traversal
    
    if (!rutaNormalizada || rutaNormalizada.includes('..') || rutaNormalizada.startsWith('/')) {
      console.error('[ARCHIVO] Intento de path traversal detectado:', archivo.ruta);
      return NextResponse.json({ error: 'Ruta de archivo inválida' }, { status: 400 });
    }

    // Construir ruta completa de forma segura
    const rutaCompleta = join(PDF_STORAGE_DIR, rutaNormalizada);
    
    // Validar que la ruta resuelta esté dentro del directorio permitido
    const rutaResuelta = resolve(rutaCompleta);
    const dirResuelto = resolve(PDF_STORAGE_DIR);
    if (!rutaResuelta.startsWith(dirResuelto)) {
      console.error('[ARCHIVO] Intento de acceso fuera del directorio permitido:', rutaResuelta);
      return NextResponse.json({ error: 'Ruta de archivo inválida' }, { status: 400 });
    }

    const buffer = await readFile(rutaCompleta);

    // Sanitizar nombre de archivo para headers HTTP
    // Eliminar caracteres peligrosos y path traversal
    const nombreSanitizado = archivo.nombreOriginal
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales
      .replace(/\.\./g, '') // Eliminar path traversal
      .substring(0, 255); // Limitar longitud
    
    // Retornar archivo con headers sanitizados
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': archivo.mimeType,
        'Content-Disposition': `attachment; filename="${nombreSanitizado}"; filename*=UTF-8''${encodeURIComponent(nombreSanitizado)}`,
        'Content-Length': archivo.tamaño.toString(),
        'X-Content-Type-Options': 'nosniff',
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
