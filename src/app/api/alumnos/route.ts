import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  try {
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

    // Admin y evaluadores pueden ver alumnos
    if (user.rol !== 'ADMIN_PRINCIPAL' && user.rol !== 'ADMIN_GENERAL' && user.rol !== 'EVALUADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Evaluadores solo ven alumnos activos
    const whereClause = user.rol === 'EVALUADOR' 
      ? { status: 'ACTIVO' }
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

    // Solo admin puede crear alumnos
    if (user.rol !== 'ADMIN_PRINCIPAL' && user.rol !== 'ADMIN_GENERAL') {
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


