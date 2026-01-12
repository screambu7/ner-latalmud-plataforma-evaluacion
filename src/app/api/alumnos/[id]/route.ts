import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await db.usuario.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user || user.estado !== 'ACTIVO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin puede ver detalles
    if (user.rol !== 'ADMIN_PRINCIPAL' && user.rol !== 'ADMIN_GENERAL') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const alumno = await db.alumno.findUnique({
      where: { id: parseInt(id) },
    });

    if (!alumno) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ alumno });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener alumno' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await db.usuario.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user || user.estado !== 'ACTIVO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin puede actualizar alumnos
    if (user.rol !== 'ADMIN_PRINCIPAL' && user.rol !== 'ADMIN_GENERAL') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, correo, tipo, escuelaId, status } = body;

    const alumnoExistente = await db.alumno.findUnique({
      where: { id: parseInt(id) },
    });

    if (!alumnoExistente) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 });
    }

    const datosActualizados: any = {};
    if (nombre !== undefined) datosActualizados.nombre = nombre.trim();
    if (correo !== undefined) datosActualizados.correo = correo?.trim() || null;
    if (tipo !== undefined) {
      if (tipo !== 'ESCUELA' && tipo !== 'INDEPENDIENTE') {
        return NextResponse.json(
          { error: 'Tipo de alumno inválido' },
          { status: 400 }
        );
      }
      datosActualizados.tipo = tipo;
    }
    if (escuelaId !== undefined) datosActualizados.escuelaId = escuelaId || null;
    if (status !== undefined) {
      if (!['ACTIVO', 'EN_PAUSA', 'NO_ACTIVO', 'NIVEL_LOGRADO'].includes(status)) {
        return NextResponse.json(
          { error: 'Status inválido' },
          { status: 400 }
        );
      }
      datosActualizados.status = status;
    }

    const alumno = await db.alumno.update({
      where: { id: parseInt(id) },
      data: datosActualizados,
    });

    return NextResponse.json({ alumno });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar alumno' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await db.usuario.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user || user.estado !== 'ACTIVO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin puede dar de baja alumnos
    if (user.rol !== 'ADMIN_PRINCIPAL' && user.rol !== 'ADMIN_GENERAL') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const alumnoExistente = await db.alumno.findUnique({
      where: { id: parseInt(id) },
    });

    if (!alumnoExistente) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 });
    }

    // Baja lógica: cambiar status a NO_ACTIVO
    const alumno = await db.alumno.update({
      where: { id: parseInt(id) },
      data: { status: 'NO_ACTIVO' },
    });

    return NextResponse.json({ alumno });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar alumno' },
      { status: 500 }
    );
  }
}

