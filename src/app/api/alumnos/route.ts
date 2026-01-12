import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Rol, StatusAlumno } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // SUPER_ADMIN y evaluadores pueden ver alumnos
    if (user.rol !== Rol.SUPER_ADMIN && user.rol !== Rol.EVALUADOR) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Evaluadores solo ven alumnos activos
    const whereClause = user.rol === Rol.EVALUADOR 
      ? { status: StatusAlumno.ACTIVO }
      : {};

    const alumnos = await db.alumno.findMany({
      where: whereClause,
    });

    return NextResponse.json({ alumnos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener alumnos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo SUPER_ADMIN puede crear alumnos
    if (user.rol !== Rol.SUPER_ADMIN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, correo, tipo, escuelaId } = body;

    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json(
        { error: 'Nombre es requerido' },
        { status: 400 }
      );
    }

    if (!tipo || (tipo !== 'ESCUELA' && tipo !== 'INDEPENDIENTE')) {
      return NextResponse.json(
        { error: 'Tipo de alumno inválido' },
        { status: 400 }
      );
    }

    const alumno = await db.alumno.create({
      data: {
        nombre: nombre.trim(),
        correo: correo?.trim() || null,
        tipo,
        escuelaId: escuelaId || null,
        status: 'ACTIVO',
      },
    });

    return NextResponse.json({ alumno }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear alumno' },
      { status: 500 }
    );
  }
}


