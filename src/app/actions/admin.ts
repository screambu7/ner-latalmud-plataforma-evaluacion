/**
 * Server Actions para el módulo de Admin
 * 
 * Proporciona métricas ejecutivas de alto nivel para el dashboard administrativo.
 * 
 * Todas las acciones:
 * - Requieren rol SUPER_ADMIN
 * - Retornan datos agregados de alto nivel
 * - No exponen datos sensibles individuales
 */

'use server';

import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { Rol, StatusAlumno } from '@prisma/client';
import { transformarEvaluacionesPrisma, calcularPromedioGlobalAlumno } from '@/lib/calculos';
import type { ActionResult } from './evaluador';

// ============================================
// TIPOS DE RESPUESTA
// ============================================

export interface MetricasGlobales {
  totalAlumnos: number;
  alumnosActivos: number;
  totalEvaluaciones: number;
  evaluacionesUltimos30Dias: number;
  totalReportes: number;
  totalPDFs: number;
}

export interface MetricasPorEscuela {
  id: number;
  nombre: string;
  totalAlumnos: number;
  alumnosActivos: number;
  totalEvaluaciones: number;
  ultimaEvaluacion: Date | null;
}

export interface MetricasPorEvaluador {
  id: number;
  nombre: string;
  correo: string;
  totalEvaluaciones: number;
  alumnosEvaluados: number;
  promedioGeneral: number; // 0-100
  ultimaActividad: Date | null;
}

export interface AlertaEjecutiva {
  tipo: 'promedio_bajo' | 'sin_evaluacion' | 'escuela_inactiva';
  titulo: string;
  descripcion: string;
  cantidad: number;
  severidad: 'alta' | 'media' | 'baja';
}

export interface AdminDashboardData {
  metricasGlobales: MetricasGlobales;
  metricasPorEscuela: MetricasPorEscuela[];
  metricasPorEvaluador: MetricasPorEvaluador[];
  alertasEjecutivas: AlertaEjecutiva[];
  evaluacionesRecientes: Array<{
    id: number;
    alumno: { id: number; nombre: string };
    evaluador: { id: number; nombre: string; correo: string };
    tipo: string;
    fecha: Date;
  }>;
  usuariosPorRol: {
    superAdmins: number;
    evaluadores: number;
  };
}

// ============================================
// DASHBOARD ADMINISTRATIVO
// ============================================

/**
 * Obtiene todas las métricas ejecutivas para el dashboard administrativo.
 * 
 * Solo accesible por SUPER_ADMIN.
 * 
 * @returns Datos completos del dashboard o error
 */
export async function getAdminDashboardData(): Promise<ActionResult<AdminDashboardData>> {
  try {
    // 1. Autorización: SOLO SUPER_ADMIN
    await requireRole(Rol.SUPER_ADMIN);

    // 2. Obtener métricas globales
    const fechaLimite30Dias = new Date();
    fechaLimite30Dias.setDate(fechaLimite30Dias.getDate() - 30);

    const [
      totalAlumnos,
      alumnosActivos,
      totalEvaluaciones,
      evaluacionesUltimos30Dias,
      totalReportes,
      totalPDFs,
    ] = await Promise.all([
      db.alumno.count(),
      db.alumno.count({
        where: { status: StatusAlumno.ACTIVO },
      }),
      db.evaluacion.count(),
      db.evaluacion.count({
        where: {
          fecha: {
            gte: fechaLimite30Dias,
          },
        },
      }),
      db.reporte.count(),
      db.archivo.count({
        where: {
          tipo: 'PDF_REPORTE',
        },
      }),
    ]);

    const metricasGlobales: MetricasGlobales = {
      totalAlumnos,
      alumnosActivos,
      totalEvaluaciones,
      evaluacionesUltimos30Dias,
      totalReportes,
      totalPDFs,
    };

    // 3. Obtener métricas por escuela
    const escuelas = await db.escuela.findMany({
      select: {
        id: true,
        nombre: true,
        alumnos: {
          select: {
            id: true,
            status: true,
            evaluaciones: {
              select: {
                id: true,
                fecha: true,
              },
            },
          },
        },
      },
    });

    const metricasPorEscuela: MetricasPorEscuela[] = escuelas.map((escuela) => {
      const totalAlumnos = escuela.alumnos.length;
      const alumnosActivos = escuela.alumnos.filter((a) => a.status === StatusAlumno.ACTIVO).length;
      
      // Contar evaluaciones de todos los alumnos de la escuela
      const todasEvaluaciones = escuela.alumnos.flatMap((a) => a.evaluaciones);
      const totalEvaluaciones = todasEvaluaciones.length;
      
      // Obtener última evaluación (más reciente de todas)
      const ultimaEvaluacion = todasEvaluaciones.length > 0
        ? todasEvaluaciones.reduce((latest, evaluacion) => {
            return evaluacion.fecha > latest.fecha ? evaluacion : latest;
          }, todasEvaluaciones[0]).fecha
        : null;

      return {
        id: escuela.id,
        nombre: escuela.nombre,
        totalAlumnos,
        alumnosActivos,
        totalEvaluaciones,
        ultimaEvaluacion,
      };
    });

    // Ordenar por actividad reciente (última evaluación)
    metricasPorEscuela.sort((a, b) => {
      if (!a.ultimaEvaluacion && !b.ultimaEvaluacion) return 0;
      if (!a.ultimaEvaluacion) return 1;
      if (!b.ultimaEvaluacion) return -1;
      return b.ultimaEvaluacion.getTime() - a.ultimaEvaluacion.getTime();
    });

    // 4. Obtener métricas por evaluador
    const usuariosEvaluadores = await db.usuario.findMany({
      where: {
        rol: Rol.EVALUADOR,
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        evaluacionesCreadas: {
          select: {
            id: true,
            alumnoId: true,
            tipo: true,
            fecha: true,
            detalles: {
              select: {
                subhabilidad: true,
                nivel: true,
              },
            },
          },
        },
      },
    });

    const metricasPorEvaluador: MetricasPorEvaluador[] = usuariosEvaluadores.map((evaluador) => {
      const totalEvaluaciones = evaluador.evaluacionesCreadas.length;
      
      // Alumnos únicos evaluados
      const alumnosUnicos = new Set(evaluador.evaluacionesCreadas.map((e) => e.alumnoId));
      const alumnosEvaluados = alumnosUnicos.size;

      // Calcular promedio general
      const evaluacionesPuras = transformarEvaluacionesPrisma(
        evaluador.evaluacionesCreadas.map((e) => ({
          id: e.id,
          alumnoId: e.alumnoId,
          tipo: e.tipo,
          fecha: e.fecha,
          detalles: e.detalles.map((d) => ({
            subhabilidad: d.subhabilidad,
            nivel: d.nivel,
          })),
        }))
      );

      const promedioGlobal = calcularPromedioGlobalAlumno(evaluacionesPuras);
      const promedioPorcentaje = promedioGlobal.valido
        ? Math.round((promedioGlobal.promedio / 4) * 100)
        : 0;

      // Última actividad
      const ultimaActividad = evaluador.evaluacionesCreadas.length > 0
        ? evaluador.evaluacionesCreadas.reduce((latest, evaluacion) => {
            return evaluacion.fecha > latest.fecha ? evaluacion : latest;
          }, evaluador.evaluacionesCreadas[0]).fecha
        : null;

      return {
        id: evaluador.id,
        nombre: evaluador.nombre,
        correo: evaluador.correo,
        totalEvaluaciones,
        alumnosEvaluados,
        promedioGeneral: promedioPorcentaje,
        ultimaActividad,
      };
    });

    // Ordenar por última actividad (más reciente primero)
    metricasPorEvaluador.sort((a, b) => {
      if (!a.ultimaActividad && !b.ultimaActividad) return 0;
      if (!a.ultimaActividad) return 1;
      if (!b.ultimaActividad) return -1;
      return b.ultimaActividad.getTime() - a.ultimaActividad.getTime();
    });

    // 5. Detectar alertas ejecutivas
    const alertasEjecutivas: AlertaEjecutiva[] = [];

    // Alerta: Alumnos con promedio < 2.0
    const alumnosConEvaluaciones = await db.alumno.findMany({
      where: {
        evaluaciones: {
          some: {},
        },
      },
      include: {
        evaluaciones: {
          include: {
            detalles: true,
          },
        },
      },
    });

    let alumnosPromedioBajo = 0;
    for (const alumno of alumnosConEvaluaciones) {
      const evaluacionesPuras = transformarEvaluacionesPrisma(
        alumno.evaluaciones.map((e) => ({
          id: e.id,
          alumnoId: e.alumnoId,
          tipo: e.tipo,
          fecha: e.fecha,
          detalles: e.detalles.map((d) => ({
            subhabilidad: d.subhabilidad,
            nivel: d.nivel,
          })),
        }))
      );

      const promedioGlobal = calcularPromedioGlobalAlumno(evaluacionesPuras);
      if (promedioGlobal.valido && promedioGlobal.promedio < 2.0) {
        alumnosPromedioBajo++;
      }
    }

    if (alumnosPromedioBajo > 0) {
      alertasEjecutivas.push({
        tipo: 'promedio_bajo',
        titulo: 'Alumnos con promedio bajo',
        descripcion: `${alumnosPromedioBajo} alumno(s) tienen un promedio general menor a 2.0`,
        cantidad: alumnosPromedioBajo,
        severidad: 'alta',
      });
    }

    // Alerta: Alumnos sin evaluación en últimos 6 meses
    const fechaLimite6Meses = new Date();
    fechaLimite6Meses.setMonth(fechaLimite6Meses.getMonth() - 6);

    const alumnosSinEvaluacionReciente = await db.alumno.count({
      where: {
        status: StatusAlumno.ACTIVO,
        OR: [
          {
            evaluaciones: {
              none: {},
            },
          },
          {
            evaluaciones: {
              none: {
                fecha: {
                  gte: fechaLimite6Meses,
                },
              },
            },
          },
        ],
      },
    });

    if (alumnosSinEvaluacionReciente > 0) {
      alertasEjecutivas.push({
        tipo: 'sin_evaluacion',
        titulo: 'Alumnos sin evaluación reciente',
        descripcion: `${alumnosSinEvaluacionReciente} alumno(s) activo(s) no tienen evaluaciones en los últimos 6 meses`,
        cantidad: alumnosSinEvaluacionReciente,
        severidad: 'media',
      });
    }

    // Alerta: Escuelas sin actividad reciente
    const escuelasInactivas = metricasPorEscuela.filter(
      (escuela) => !escuela.ultimaEvaluacion || escuela.ultimaEvaluacion < fechaLimite6Meses
    );

    if (escuelasInactivas.length > 0) {
      alertasEjecutivas.push({
        tipo: 'escuela_inactiva',
        titulo: 'Escuelas sin actividad reciente',
        descripcion: `${escuelasInactivas.length} escuela(s) no tienen evaluaciones en los últimos 6 meses`,
        cantidad: escuelasInactivas.length,
        severidad: 'baja',
      });
    }

    // 6. Obtener evaluaciones recientes (últimas 10)
    const evaluacionesRecientes = await db.evaluacion.findMany({
      take: 10,
      orderBy: { fecha: 'desc' },
      select: {
        id: true,
        tipo: true,
        fecha: true,
        alumno: {
          select: {
            id: true,
            nombre: true,
          },
        },
        evaluador: {
          select: {
            id: true,
            nombre: true,
            correo: true,
          },
        },
      },
    });

    // 7. Contar usuarios por rol
    const usuariosPorRol = await db.usuario.groupBy({
      by: ['rol'],
      _count: true,
    });

    const superAdmins = usuariosPorRol.find((u) => u.rol === 'SUPER_ADMIN')?._count || 0;
    const totalEvaluadores = usuariosPorRol.find((u) => u.rol === 'EVALUADOR')?._count || 0;

    const data: AdminDashboardData = {
      metricasGlobales,
      metricasPorEscuela,
      metricasPorEvaluador,
      alertasEjecutivas,
      evaluacionesRecientes,
      usuariosPorRol: {
        superAdmins,
        evaluadores: totalEvaluadores,
      },
    };

    return { success: true, data };
  } catch (error) {
    console.error('Error en getAdminDashboardData:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Error al obtener datos del dashboard administrativo',
    };
  }
}
