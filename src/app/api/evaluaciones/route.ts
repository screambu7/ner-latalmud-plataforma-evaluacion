import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Rol } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Evaluadores solo ven sus propias evaluaciones, SUPER_ADMIN ve todas
    let evaluaciones;
    if (user.rol === Rol.EVALUADOR) {
      evaluaciones = await db.evaluacion.findMany({
        where: { evaluadorId: user.id },
        include: {
          EvaluacionDetalle: true,
        },
        orderBy: { fecha: 'desc' },
      });
    } else if (user.rol === Rol.SUPER_ADMIN) {
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo evaluadores pueden crear evaluaciones
    if (user.rol !== Rol.EVALUADOR) {
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

    // Validar que el alumno existe y obtener datos completos para scoping
    const alumno = await db.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        escuela: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!alumno) {
      return NextResponse.json(
        { error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    // Scoping: Evaluadores solo pueden crear evaluaciones para alumnos de su escuela
    // o alumnos independientes si el evaluador no tiene escuela asignada
    // SUPER_ADMIN puede crear evaluaciones para cualquier alumno
    if (user.rol === Rol.EVALUADOR) {
      // Obtener escuela del evaluador
      const evaluador = await db.usuario.findUnique({
        where: { id: user.id },
        select: {
          escuelaId: true,
        },
      });

      const evaluadorEscuelaId = evaluador?.escuelaId;

      // Si el alumno tiene escuela, debe coincidir con la del evaluador
      if (alumno.escuelaId) {
        if (alumno.escuelaId !== evaluadorEscuelaId) {
          return NextResponse.json(
            { error: 'No autorizado: solo puedes crear evaluaciones para alumnos de tu escuela' },
            { status: 403 }
          );
        }
      } else {
        // Alumno independiente: solo permitir si el evaluador tampoco tiene escuela
        // (evaluadores sin escuela pueden evaluar alumnos independientes)
        if (evaluadorEscuelaId !== null) {
          return NextResponse.json(
            { error: 'No autorizado: solo puedes crear evaluaciones para alumnos de tu escuela' },
            { status: 403 }
          );
        }
      }
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


