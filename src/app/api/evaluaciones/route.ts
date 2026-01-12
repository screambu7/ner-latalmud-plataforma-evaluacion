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

    // Evaluadores solo ven sus propias evaluaciones, admins ven todas
    let evaluaciones;
    if (user.rol === 'EVALUADOR') {
      evaluaciones = await db.evaluacion.findMany({
        where: { evaluadorId: user.id },
        include: {
          EvaluacionDetalle: true,
        },
        orderBy: { fecha: 'desc' },
      });
    } else if (user.rol === 'ADMIN_PRINCIPAL' || user.rol === 'ADMIN_GENERAL') {
      evaluaciones = await db.evaluacion.findMany({
        include: {
          EvaluacionDetalle: true,
        },
        orderBy: { fecha: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json({ evaluaciones });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones' },
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

    // Solo evaluadores pueden crear evaluaciones
    if (user.rol !== 'EVALUADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { alumnoId, tipo, detalles } = body;

    if (!alumnoId || typeof alumnoId !== 'number') {
      return NextResponse.json(
        { error: 'alumnoId es requerido' },
        { status: 400 }
      );
    }

    if (!tipo || typeof tipo !== 'string') {
      return NextResponse.json(
        { error: 'tipo es requerido' },
        { status: 400 }
      );
    }

    // Validar que el tipo existe en el enum
    const tiposValidos = [
      'GV_EXP_DEF_FACIL',
      'GV_EXP_FACIL',
      'GV_HA_FACIL_NK',
      'GV_HA_FACIL_SN',
      'GN_EXP_DEF_FACIL',
      'GN_EXP_FACIL',
      'GN_HA_FACIL_NK',
      'GN_HA_FACIL_SN',
      'GV_EXP_DEF_DIFICIL',
      'GV_EXP_DIFICIL',
      'GV_HA_DIFICIL_NK',
      'GV_HA_DIFICIL_SN',
      'GN_EXP_DEF_DIFICIL',
      'GN_EXP_DIFICIL',
      'GN_HA_DIFICIL_NK',
      'GN_HA_DIFICIL_SN',
    ];

    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de diagnóstico inválido' },
        { status: 400 }
      );
    }

    // Validar que el alumno existe
    const alumno = await db.alumno.findUnique({
      where: { id: alumnoId },
    });

    if (!alumno) {
      return NextResponse.json(
        { error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    // Validar detalles
    if (!Array.isArray(detalles)) {
      return NextResponse.json(
        { error: 'detalles debe ser un array' },
        { status: 400 }
      );
    }

    for (const detalle of detalles) {
      if (!detalle.subhabilidad || typeof detalle.subhabilidad !== 'string') {
        return NextResponse.json(
          { error: 'Cada detalle debe tener subhabilidad (string)' },
          { status: 400 }
        );
      }
      if (
        typeof detalle.nivel !== 'number' ||
        detalle.nivel < 1 ||
        detalle.nivel > 4
      ) {
        return NextResponse.json(
          { error: 'Cada detalle debe tener nivel (1-4)' },
          { status: 400 }
        );
      }
    }

    // Crear evaluación con detalles en transacción
    const evaluacion = await db.evaluacion.create({
      data: {
        alumnoId,
        evaluadorId: user.id,
        tipo: tipo as any,
        fecha: new Date(),
        EvaluacionDetalle: {
          create: detalles.map((d: any) => ({
            subhabilidad: d.subhabilidad,
            nivel: d.nivel,
          })),
        },
      },
      include: {
        EvaluacionDetalle: true,
      },
    });

    return NextResponse.json({ evaluacion }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear evaluación' },
      { status: 500 }
    );
  }
}


