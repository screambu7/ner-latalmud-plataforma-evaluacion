/**
 * Server Actions para el módulo de Evaluador
 * 
 * Estas acciones reemplazan progresivamente los datos mock
 * y proporcionan acceso a datos reales de la base de datos.
 * 
 * Todas las acciones manejan:
 * - Autenticación del usuario
 * - Validación de permisos (solo EVALUADOR)
 * - Estados empty / loading / error
 * - Transformación de datos Prisma a DTOs
 */

'use server';

import { requireRole, requireAnyRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { Rol, StatusAlumno, TipoAlumno, Prisma, TipoDiagnostico } from '@prisma/client';
import type { TipoDiagnostico as TipoDiagnosticoRubrica } from '@/lib/rubricas';
import type {
  EvaluadorDashboardDataV2,
  PerfilDiagnosticoData,
  RecentActivity,
  DashboardStatsV2,
  CalendarMonth,
  EvaluacionHistorial,
  RadarChartData,
  NotasAcademicas,
  ReporteProgresoData,
  ProgresoSemestral,
  RecomendacionMore,
} from '@/lib/types/evaluador-dtos';
import {
  calcularPromedioGlobalAlumno,
  calcularPromedioGlobalPorHabilidad,
  transformarEvaluacionesPrisma,
  type EvaluacionCompleta,
} from '@/lib/calculos';
import { HABILIDADES_GENERALES } from '@/lib/rubricas';
// Helpers de fecha (sin dependencias externas)
function formatDate(date: Date, formatStr: string): string {
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const monthsShort = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  if (formatStr === 'MMMM yyyy') {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
  if (formatStr === 'MMM') {
    return monthsShort[date.getMonth()];
  }
  return date.toLocaleDateString();
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDay(date: Date): number {
  return date.getDay();
}

// ============================================
// TIPOS DE RESPUESTA
// ============================================

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================
// DASHBOARD DEL EVALUADOR
// ============================================

/**
 * Obtiene los datos del dashboard del evaluador.
 * 
 * Calcula estadísticas basadas en las evaluaciones del evaluador actual.
 * Aplica scoping correcto según rol:
 * - SUPER_ADMIN: ve todos los datos
 * - EVALUADOR: solo alumnos de su escuela o alumnos independientes
 * 
 * @returns Datos del dashboard o error
 */
export async function getEvaluadorDashboard(): Promise<
  ActionResult<EvaluadorDashboardDataV2>
> {
  try {
    // Permitir tanto SUPER_ADMIN como EVALUADOR
    const user = await requireAnyRole([Rol.SUPER_ADMIN, Rol.EVALUADOR]);

    // Obtener usuario completo con escuelaId
    const usuarioCompleto = await db.usuario.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nombre: true,
        rol: true,
        escuelaId: true,
      },
    });

    if (!usuarioCompleto) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Construir filtro de scoping para alumnos
    let alumnoWhere: Prisma.AlumnoWhereInput = {};
    if (usuarioCompleto.rol === Rol.EVALUADOR) {
      // EVALUADOR: solo alumnos de su escuela o alumnos independientes
      if (usuarioCompleto.escuelaId) {
        alumnoWhere = {
          OR: [
            { escuelaId: usuarioCompleto.escuelaId },
            { tipo: TipoAlumno.INDEPENDIENTE },
          ],
        };
      } else {
        // Evaluador sin escuela: solo alumnos independientes
        alumnoWhere = {
          tipo: TipoAlumno.INDEPENDIENTE,
        };
      }
    }
    // SUPER_ADMIN: sin filtro (ve todos los alumnos)

    // Obtener todas las evaluaciones del evaluador con scoping correcto
    const evaluaciones = await db.evaluacion.findMany({
      where: {
        evaluadorId: user.id,
        alumno: alumnoWhere,
      },
      include: {
        detalles: true,
        alumno: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    // Transformar a formato puro
    const evaluacionesPuras = transformarEvaluacionesPrisma(
      evaluaciones.map((e: (typeof evaluaciones)[0]) => ({
        id: e.id,
        alumnoId: e.alumnoId,
        tipo: e.tipo,
        fecha: e.fecha,
        detalles: e.detalles.map((d: (typeof e.detalles)[0]) => ({
          subhabilidad: d.subhabilidad,
          nivel: d.nivel,
        })),
      }))
    );

    // Obtener total de alumnos asignados (según scoping)
    // Se usará más adelante
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const totalAlumnosAsignados = await db.alumno.count({
      where: alumnoWhere,
    });

    // Obtener alumnos activos (según scoping)
    // Se usará más adelante
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const alumnosActivos = await db.alumno.count({
      where: {
        ...alumnoWhere,
        status: StatusAlumno.ACTIVO,
      },
    });

    // Calcular estadísticas
    const stats = calcularStatsDashboard(
      evaluacionesPuras,
      evaluaciones
    );

    // Obtener actividad reciente
    const recentActivity = obtenerActividadReciente(evaluaciones);

    // Generar calendario del mes actual
    const calendar = generarCalendarioMesActual();

    const data: EvaluadorDashboardDataV2 = {
      evaluador: {
        nombre: usuarioCompleto.nombre || 'Evaluador',
        avatarUrl: '', // TODO: Agregar campo avatarUrl al schema si es necesario
      },
      saludo: `Shalom, ${usuarioCompleto.nombre || 'Evaluador'}`,
      stats,
      recentActivity,
      calendar,
    };

    return { success: true, data };
  } catch (error) {
    console.error('Error en getEvaluadorDashboard:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Error al obtener datos del dashboard',
    };
  }
}

/**
 * Calcula las estadísticas del dashboard.
 */
function calcularStatsDashboard(
  evaluaciones: EvaluacionCompleta[],
  evaluacionesPrisma: Array<{
    fecha: Date;
    alumno: { id: number; nombre: string };
  }>
): DashboardStatsV2 {
  // Alumnos únicos evaluados
  const alumnosUnicos = new Set(evaluaciones.map((e) => e.alumnoId));
  const alumnosEvaluados = alumnosUnicos.size;

  // Calcular promedio general
  const promedioGlobal = calcularPromedioGlobalAlumno(evaluaciones);
  const promedioPorcentaje = promedioGlobal.valido
    ? Math.round((promedioGlobal.promedio / 4) * 100)
    : 0;

  // Alertas críticas (alumnos con promedio bajo)
  // TODO: Definir umbral de "crítico" según especificación
  const umbralCritico = 2.0; // Promedio menor a 2.0
  let alertasCriticas = 0;

  // Agrupar evaluaciones por alumno
  const evaluacionesPorAlumno = new Map<number, EvaluacionCompleta[]>();
  for (const evaluacion of evaluaciones) {
    const evaluacionesAlumno = evaluacionesPorAlumno.get(evaluacion.alumnoId) || [];
    evaluacionesAlumno.push(evaluacion);
    evaluacionesPorAlumno.set(evaluacion.alumnoId, evaluacionesAlumno);
  }

  // Contar alertas críticas
  for (const [, evaluacionesAlumno] of Array.from(
    evaluacionesPorAlumno.entries()
  )) {
    const promedio = calcularPromedioGlobalAlumno(evaluacionesAlumno);
    if (promedio.valido && promedio.promedio < umbralCritico) {
      alertasCriticas++;
    }
  }

  // Sugia actual (última evaluación)
  const ultimaEvaluacion = evaluacionesPrisma[0];
  const sugiaActual = ultimaEvaluacion
    ? 'Última evaluación' // TODO: Agregar campo sugia al schema si es necesario
    : 'N/A';

  return {
    alumnosEvaluados: {
      valor: alumnosEvaluados,
      cambio: '+0%', // TODO: Calcular cambio comparando con período anterior
      cambioPositivo: true,
    },
    promedioGeneral: {
      valor: promedioPorcentaje,
      cambio: '+0%', // TODO: Calcular cambio comparando con período anterior
      cambioPositivo: true,
    },
    alertasCriticas: {
      valor: alertasCriticas,
      cambio: '0%', // TODO: Calcular cambio comparando con período anterior
      cambioPositivo: alertasCriticas === 0,
    },
    sugiaActual: {
      nombre: sugiaActual,
      cambio: '+0%', // TODO: Calcular cambio comparando con período anterior
      cambioPositivo: true,
    },
  };
}

/**
 * Formatea el tipo de diagnóstico para mostrarlo de manera legible.
 */
function formatearTipoDiagnostico(tipo: string): string {
  // Reemplazar guiones bajos por espacios y capitalizar
  return tipo
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Obtiene la actividad reciente de evaluaciones.
 * 
 * Devuelve las últimas 5 evaluaciones con fecha, alumno y tipo.
 */
function obtenerActividadReciente(
  evaluaciones: Array<{
    id: number;
    fecha: Date;
    tipo: string;
    alumno: { id: number; nombre: string };
  }>
): RecentActivity[] {
  // Tomar las últimas 5 evaluaciones
  const ultimasEvaluaciones = evaluaciones.slice(0, 5);

  // Si no hay evaluaciones, retornar array vacío
  if (ultimasEvaluaciones.length === 0) {
    return [];
  }

  return ultimasEvaluaciones.map((evaluacion) => {
    const diasAtras = Math.floor(
      (Date.now() - evaluacion.fecha.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Formatear tiempo atrás
    let tiempoAtras: string;
    if (diasAtras === 0) {
      tiempoAtras = 'hoy';
    } else if (diasAtras === 1) {
      tiempoAtras = 'ayer';
    } else {
      tiempoAtras = `${diasAtras}d`;
    }

    // Formatear nombre del examen con tipo
    const tipoFormateado = formatearTipoDiagnostico(evaluacion.tipo);
    const examenNombre = `${tipoFormateado}`;

    return {
      id: evaluacion.id.toString(),
      estudianteNombre: evaluacion.alumno.nombre,
      estudianteAvatarUrl: '', // TODO: Agregar avatar si es necesario
      examenNombre,
      tiempoAtras,
    };
  });
}

/**
 * Genera el calendario del mes actual.
 */
function generarCalendarioMesActual(): CalendarMonth {
  const hoy = new Date();
  const primerDia = startOfMonth(hoy);
  const diasEnMes = getDaysInMonth(hoy);
  const primerDiaSemana = getDay(primerDia); // 0 = domingo, 6 = sábado

  const dias: CalendarMonth['dias'] = [];
  for (let i = 1; i <= diasEnMes; i++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), i);
    dias.push({
      dia: i,
      esDiaActual: fecha.toDateString() === hoy.toDateString(),
      tieneEvento: false, // TODO: Agregar lógica para detectar eventos
    });
  }

  return {
    mes: formatDate(hoy, 'MMMM yyyy'),
    primerDiaSemana: primerDiaSemana,
    dias,
  };
}

// ============================================
// PERFIL DE DIAGNÓSTICO
// ============================================

/**
 * Obtiene el perfil de diagnóstico de un alumno.
 * 
 * Implementa:
 * - Autorización (EVALUADOR o SUPER_ADMIN)
 * - Scoping correcto según rol y escuela
 * - Queries Prisma eficientes
 * - Cálculos usando utilidades existentes
 * 
 * @param alumnoId - ID del alumno
 * @returns Datos del perfil o error
 */
export async function getPerfilDiagnostico(
  alumnoId: number
): Promise<ActionResult<PerfilDiagnosticoData>> {
  try {
    // 1. Autorización: Requerir EVALUADOR o SUPER_ADMIN
    const user = await requireAnyRole([Rol.SUPER_ADMIN, Rol.EVALUADOR]);

    // 2. Obtener usuario completo con escuelaId para scoping
    const usuarioCompleto = await db.usuario.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        rol: true,
        escuelaId: true,
      },
    });

    if (!usuarioCompleto) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // 3. Obtener alumno con datos necesarios
    const alumno = await db.alumno.findUnique({
      where: { id: alumnoId },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        escuelaId: true,
        escuela: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!alumno) {
      return { success: false, error: 'Alumno no encontrado' };
    }

    // 4. Aplicar scoping según reglas (igual que guardarEvaluacionActiva):
    // - SUPER_ADMIN: acceso total
    // - EVALUADOR con escuelaId: alumno de su escuela O INDEPENDIENTE
    // - EVALUADOR sin escuelaId: solo INDEPENDIENTE
    if (usuarioCompleto.rol === Rol.EVALUADOR) {
      if (usuarioCompleto.escuelaId) {
        // Evaluador con escuela: puede ver alumnos de su escuela O independientes
        if (alumno.escuelaId !== null && alumno.escuelaId !== usuarioCompleto.escuelaId) {
          return {
            success: false,
            error: 'No autorizado: solo puedes ver perfiles de alumnos de tu escuela o alumnos independientes',
          };
        }
        // Si alumno.escuelaId === usuarioCompleto.escuelaId: OK
        // Si alumno.tipo === INDEPENDIENTE: OK
      } else {
        // Evaluador sin escuela: solo alumnos independientes
        if (alumno.tipo !== TipoAlumno.INDEPENDIENTE) {
          return {
            success: false,
            error: 'No autorizado: solo puedes ver perfiles de alumnos independientes',
          };
        }
      }
    }
    // SUPER_ADMIN: sin restricciones (continúa)

    // 5. Obtener evaluaciones del alumno (ordenadas ASC para timeline)
    const evaluaciones = await db.evaluacion.findMany({
      where: {
        alumnoId: alumnoId,
      },
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
      orderBy: {
        fecha: 'asc', // ASC para timeline histórico
      },
    });

    // 6. Transformar a formato puro para cálculos
    const evaluacionesPuras = transformarEvaluacionesPrisma(
      evaluaciones.map((e) => ({
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

    // 7. Calcular mapa de habilidades (radar chart) usando utilidades existentes
    const mapaHabilidades = calcularMapaHabilidades(
      evaluacionesPuras,
      HABILIDADES_GENERALES
    );

    // 8. Generar historial de evaluaciones (ordenado DESC para mostrar más recientes primero)
    const evaluacionesParaHistorial = evaluaciones.slice().reverse(); // Revertir para mostrar más recientes primero
    const historialEvaluaciones = generarHistorialEvaluaciones(evaluacionesParaHistorial);

    // 9. Obtener notas académicas
    const notasAcademicas = await obtenerNotasAcademicas(alumnoId, usuarioCompleto.id);

    // 10. Construir respuesta
    const data: PerfilDiagnosticoData = {
      alumno: {
        id: alumno.id.toString(),
        nombre: alumno.nombre,
        avatarUrl: '', // TODO: Agregar avatar si es necesario
        grupo: alumno.escuela?.nombre || 'Sin grupo',
        anio: new Date().getFullYear().toString(),
        idEstudiante: alumno.id.toString(),
      },
      mapaHabilidades,
      historialEvaluaciones,
      notasAcademicas,
    };

    return { success: true, data };
  } catch (error) {
    console.error('Error en getPerfilDiagnostico:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Error al obtener perfil de diagnóstico',
    };
  }
}

/**
 * Calcula el mapa de habilidades (radar chart) a partir de las evaluaciones.
 * 
 * ⚠️ TODO: Mapear habilidades generales a las 5 dimensiones del radar:
 * - logica
 * - vocabulario
 * - estructura
 * - rashi
 * - arameo
 * 
 * Por ahora, calcula promedios por habilidad general y los mapea.
 */
function calcularMapaHabilidades(
  evaluaciones: EvaluacionCompleta[],
  habilidadesGenerales: typeof HABILIDADES_GENERALES
): RadarChartData {
  // Calcular promedios por habilidad general
  const promediosPorHabilidad = calcularPromedioGlobalPorHabilidad(
    evaluaciones,
    habilidadesGenerales
  );

  // Mapear a las 5 dimensiones del radar
  // TODO: Implementar mapeo real cuando se definan las habilidades generales
  // Por ahora, usar valores por defecto o calcular desde promedios
  const logica = obtenerValorHabilidad(promediosPorHabilidad, 'logica') || 0;
  const vocabulario = obtenerValorHabilidad(promediosPorHabilidad, 'vocabulario') || 0;
  const estructura = obtenerValorHabilidad(promediosPorHabilidad, 'estructura') || 0;
  const rashi = obtenerValorHabilidad(promediosPorHabilidad, 'rashi') || 0;
  const arameo = obtenerValorHabilidad(promediosPorHabilidad, 'arameo') || 0;

  // Convertir promedio (1-4) a porcentaje (0-100)
  const convertirAPorcentaje = (promedio: number) => {
    return Math.round((promedio / 4) * 100);
  };

  return {
    logica: convertirAPorcentaje(logica),
    vocabulario: convertirAPorcentaje(vocabulario),
    estructura: convertirAPorcentaje(estructura),
    rashi: convertirAPorcentaje(rashi),
    arameo: convertirAPorcentaje(arameo),
  };
}

/**
 * Obtiene el valor de una habilidad específica del radar.
 */
function obtenerValorHabilidad(
  promediosPorHabilidad: Array<{ habilidadKey: string; promedio: number }>,
  habilidadKey: string
): number | null {
  const habilidad = promediosPorHabilidad.find(
    (h) => h.habilidadKey === habilidadKey
  );
  return habilidad?.promedio || null;
}

/**
 * Genera el historial de evaluaciones.
 */
function generarHistorialEvaluaciones(
  evaluaciones: Array<{
    id: number;
    fecha: Date;
    tipo: string;
    detalles: Array<{ nivel: number }>;
  }>
): EvaluacionHistorial[] {
  return evaluaciones.map((evaluacion) => {
    // Calcular promedio de la evaluación
    const niveles = evaluacion.detalles.map((d) => d.nivel);
    const promedio =
      niveles.length > 0
        ? niveles.reduce((sum, n) => sum + n, 0) / niveles.length
        : 0;

    // Convertir promedio a puntaje (0-100)
    const puntaje = Math.round((promedio / 4) * 100);

    // Determinar nivel según puntaje
    let nivel: EvaluacionHistorial['nivel'];
    if (puntaje >= 90) {
      nivel = 'sobresaliente';
    } else if (puntaje >= 80) {
      nivel = 'avanzado';
    } else if (puntaje >= 70) {
      nivel = 'bueno';
    } else if (puntaje >= 60) {
      nivel = 'regular';
    } else {
      nivel = 'necesita_mejora';
    }

    return {
      id: evaluacion.id.toString(),
      fecha: {
        mes: formatDate(evaluacion.fecha, 'MMM'),
        dia: evaluacion.fecha.getDate(),
      },
      titulo: `Evaluación ${evaluacion.tipo}`,
      materia: evaluacion.tipo,
      puntaje,
      nivel,
    };
  });
}

/**
 * Obtiene las notas académicas del alumno.
 * 
 * ⚠️ TODO: Implementar cuando se agregue modelo de Notas o Comentarios
 */
async function obtenerNotasAcademicas(
  alumnoId: number,
  evaluadorId: number
): Promise<NotasAcademicas> {
  // Por ahora, retornar estructura vacía
  // TODO: Consultar tabla de notas/comentarios cuando exista
  const evaluador = await db.usuario.findUnique({
    where: { id: evaluadorId },
    select: { nombre: true },
  });

  return {
    contenido: '', // TODO: Obtener de BD
    more: {
      nombre: evaluador?.nombre || 'Evaluador',
      avatarUrl: '', // TODO: Agregar avatar
      cargo: 'Evaluador',
    },
    fechaActualizacion: 'nunca', // TODO: Obtener fecha real
  };
}

// ============================================
// REPORTE DE PROGRESO
// ============================================

/**
 * Obtiene el reporte de progreso de un alumno.
 * 
 * Implementa:
 * - Autorización (EVALUADOR o SUPER_ADMIN)
 * - Scoping correcto según rol y escuela
 * - Queries Prisma eficientes (últimos 6 meses)
 * - Cálculos usando utilidades existentes
 * 
 * @param alumnoId - ID del alumno
 * @returns Datos del reporte o error
 */
export async function getReporteProgreso(
  alumnoId: number
): Promise<ActionResult<ReporteProgresoData>> {
  try {
    // 1. Autorización: Requerir EVALUADOR o SUPER_ADMIN
    const user = await requireAnyRole([Rol.SUPER_ADMIN, Rol.EVALUADOR]);

    // 2. Obtener usuario completo con escuelaId para scoping
    const usuarioCompleto = await db.usuario.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        rol: true,
        escuelaId: true,
      },
    });

    if (!usuarioCompleto) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // 3. Obtener alumno con datos necesarios
    const alumno = await db.alumno.findUnique({
      where: { id: alumnoId },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        escuelaId: true,
        escuela: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!alumno) {
      return { success: false, error: 'Alumno no encontrado' };
    }

    // 4. Aplicar scoping según reglas (igual que guardarEvaluacionActiva y getPerfilDiagnostico):
    // - SUPER_ADMIN: acceso total
    // - EVALUADOR con escuelaId: alumno de su escuela O INDEPENDIENTE
    // - EVALUADOR sin escuelaId: solo INDEPENDIENTE
    if (usuarioCompleto.rol === Rol.EVALUADOR) {
      if (usuarioCompleto.escuelaId) {
        // Evaluador con escuela: puede ver alumnos de su escuela O independientes
        if (alumno.escuelaId !== null && alumno.escuelaId !== usuarioCompleto.escuelaId) {
          return {
            success: false,
            error: 'No autorizado: solo puedes ver reportes de alumnos de tu escuela o alumnos independientes',
          };
        }
        // Si alumno.escuelaId === usuarioCompleto.escuelaId: OK
        // Si alumno.tipo === INDEPENDIENTE: OK
      } else {
        // Evaluador sin escuela: solo alumnos independientes
        if (alumno.tipo !== TipoAlumno.INDEPENDIENTE) {
          return {
            success: false,
            error: 'No autorizado: solo puedes ver reportes de alumnos independientes',
          };
        }
      }
    }
    // SUPER_ADMIN: sin restricciones (continúa)

    // 5. Calcular fecha límite (últimos 6 meses)
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 6);

    // 6. Obtener evaluaciones del alumno (últimos 6 meses, ordenadas ASC)
    const evaluaciones = await db.evaluacion.findMany({
      where: {
        alumnoId: alumnoId,
        fecha: {
          gte: fechaLimite,
        },
      },
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
      orderBy: {
        fecha: 'asc',
      },
    });

    // 7. Transformar a formato puro para cálculos
    const evaluacionesPuras = transformarEvaluacionesPrisma(
      evaluaciones.map((e) => ({
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

    // 8. Calcular habilidades clave (radar chart) usando utilidades existentes
    const habilidadesClave = calcularMapaHabilidades(
      evaluacionesPuras,
      HABILIDADES_GENERALES
    );

    // 9. Determinar nivel según promedio global
    const promedioGlobal = calcularPromedioGlobalAlumno(evaluacionesPuras);
    const promedioPorcentaje = promedioGlobal.valido
      ? Math.round((promedioGlobal.promedio / 4) * 100)
      : 0;

    let nivel: 'basico' | 'intermedio' | 'avanzado';
    if (promedioPorcentaje >= 80) {
      nivel = 'avanzado';
    } else if (promedioPorcentaje >= 60) {
      nivel = 'intermedio';
    } else {
      nivel = 'basico';
    }

    // 10. Calcular progreso semestral (últimos 6 meses) usando función existente
    const progresoSemestral = calcularProgresoSemestral(evaluaciones);

    // 11. Generar resumen ejecutivo usando función existente
    const resumenEjecutivo = generarResumenEjecutivo(
      habilidadesClave,
      promedioPorcentaje
    );

    // 12. Obtener recomendación del Moré
    const recomendacionMore = await obtenerRecomendacionMore(alumnoId, usuarioCompleto.id);

    const data: ReporteProgresoData = {
      alumno: {
        id: alumno.id.toString(),
        nombre: alumno.nombre,
        avatarUrl: '', // TODO: Agregar avatar si es necesario
        grupo: alumno.escuela?.nombre || 'Sin grupo',
        anio: new Date().getFullYear().toString(),
        idEstudiante: alumno.id.toString(),
      },
      resumenEjecutivo,
      habilidadesClave,
      nivel,
      progresoSemestral,
      recomendacionMore,
      fechaGeneracion: formatDate(new Date(), 'MMMM yyyy'),
    };

    return { success: true, data };
  } catch (error) {
    console.error('Error en getReporteProgreso:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Error al obtener reporte de progreso',
    };
  }
}

/**
 * Guarda un reporte de progreso en la base de datos.
 * 
 * Esta función guarda el payload del reporte para poder generar PDFs
 * versionados sin recalcular datos.
 * 
 * @param alumnoId - ID del alumno
 * @param datosReporte - Datos del reporte a guardar
 * @returns ID del reporte creado o error
 */
export async function guardarReporteProgreso(
  alumnoId: number,
  datosReporte: ReporteProgresoData
): Promise<ActionResult<{ reporteId: number }>> {
  try {
    // 1. Autorización: Requerir EVALUADOR o SUPER_ADMIN
    const user = await requireAnyRole([Rol.SUPER_ADMIN, Rol.EVALUADOR]);

    // 2. Obtener usuario completo con escuelaId para scoping
    const usuarioCompleto = await db.usuario.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        rol: true,
        escuelaId: true,
      },
    });

    if (!usuarioCompleto) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // 3. Obtener alumno para validar scoping
    const alumno = await db.alumno.findUnique({
      where: { id: alumnoId },
      select: {
        id: true,
        tipo: true,
        escuelaId: true,
      },
    });

    if (!alumno) {
      return { success: false, error: 'Alumno no encontrado' };
    }

    // 4. Aplicar scoping (igual que getReporteProgreso)
    if (usuarioCompleto.rol === Rol.EVALUADOR) {
      if (usuarioCompleto.escuelaId) {
        if (alumno.escuelaId !== null && alumno.escuelaId !== usuarioCompleto.escuelaId) {
          return {
            success: false,
            error: 'No autorizado: solo puedes guardar reportes de alumnos de tu escuela o alumnos independientes',
          };
        }
      } else {
        if (alumno.tipo !== TipoAlumno.INDEPENDIENTE) {
          return {
            success: false,
            error: 'No autorizado: solo puedes guardar reportes de alumnos independientes',
          };
        }
      }
    }

    // 5. Calcular fechas del período (últimos 6 meses)
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 6);

    // 6. Guardar reporte en BD
    const reporte = await db.reporte.create({
      data: {
        tipo: 'PROGRESO_ALUMNO',
        alumnoId: alumnoId,
        generadoPorId: usuarioCompleto.id,
        contenido: datosReporte as unknown as Prisma.InputJsonValue, // Guardar como JSON
        fechaInicio,
        fechaFin,
      },
    });

    return { success: true, data: { reporteId: reporte.id } };
  } catch (error) {
    console.error('Error en guardarReporteProgreso:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Error al guardar reporte de progreso',
    };
  }
}

/**
 * Calcula el progreso semestral del alumno.
 */
function calcularProgresoSemestral(
  evaluaciones: Array<{
    fecha: Date;
    detalles: Array<{ nivel: number }>;
  }>
): ProgresoSemestral[] {
  const hoy = new Date();
  const meses: ProgresoSemestral[] = [];

  // Obtener últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const mesNombre = formatDate(fecha, 'MMM');

    // Filtrar evaluaciones del mes
    const evaluacionesMes = evaluaciones.filter((e) => {
      const evalFecha = new Date(e.fecha);
      return (
        evalFecha.getMonth() === fecha.getMonth() &&
        evalFecha.getFullYear() === fecha.getFullYear()
      );
    });

    // Calcular promedio del mes
    let promedioMes = 0;
    if (evaluacionesMes.length > 0) {
      const todosNiveles = evaluacionesMes.flatMap((e) =>
        e.detalles.map((d) => d.nivel)
      );
      const suma = todosNiveles.reduce((sum, n) => sum + n, 0);
      promedioMes = todosNiveles.length > 0 ? suma / todosNiveles.length : 0;
    }

    // Convertir a porcentaje (0-100)
    const porcentaje = Math.round((promedioMes / 4) * 100);

    meses.push({
      mes: mesNombre,
      valor: porcentaje,
    });
  }

  return meses;
}

/**
 * Genera el resumen ejecutivo del alumno.
 */
function generarResumenEjecutivo(
  habilidades: RadarChartData,
  promedioPorcentaje: number
): string {
  // Analizar fortalezas y debilidades
  const habilidadesArray = [
    { nombre: 'lógica', valor: habilidades.logica },
    { nombre: 'vocabulario', valor: habilidades.vocabulario },
    { nombre: 'estructura', valor: habilidades.estructura },
    { nombre: 'Rashi', valor: habilidades.rashi },
    { nombre: 'arameo', valor: habilidades.arameo },
  ];

  const mejorHabilidad = habilidadesArray.reduce((max, h) =>
    h.valor > max.valor ? h : max
  );
  const peorHabilidad = habilidadesArray.reduce((min, h) =>
    h.valor < min.valor ? h : min
  );

  // Generar texto narrativo
  let resumen = `El alumno ha demostrado `;

  if (promedioPorcentaje >= 80) {
    resumen += 'un crecimiento excepcional ';
  } else if (promedioPorcentaje >= 60) {
    resumen += 'un progreso constante ';
  } else {
    resumen += 'un desarrollo gradual ';
  }

  resumen += `en la comprensión de la lógica talmúdica (Svarah). `;

  if (mejorHabilidad.valor >= 80) {
    resumen += `Su capacidad para ${mejorHabilidad.nombre} ha mejorado significativamente, `;
  }

  resumen += `mostrando mayor independencia en el aprendizaje de la Sugya. `;

  if (peorHabilidad.valor < 60) {
    resumen += `Aunque su participación es activa, se recomienda práctica adicional enfocada en ${peorHabilidad.nombre} para consolidar su autonomía.`;
  } else {
    resumen +=
      'Su participación activa y comprensión general muestran un buen desarrollo académico.';
  }

  return resumen;
}

/**
 * Obtiene la recomendación del Moré para el alumno.
 */
async function obtenerRecomendacionMore(
  alumnoId: number,
  evaluadorId: number
): Promise<RecomendacionMore> {
  // Por ahora, generar recomendación genérica
  // TODO: Implementar cuando se agregue modelo de Recomendaciones
  const evaluador = await db.usuario.findUnique({
    where: { id: evaluadorId },
    select: { nombre: true },
  });

  return {
    contenido:
      'Se sugiere repasar vocabulario arameo 15 minutos al día. Enfocarse en las palabras clave de la Mishná para mejorar la fluidez en la lectura.',
    more: {
      nombre: evaluador?.nombre || 'Evaluador',
      avatarUrl: '', // TODO: Agregar avatar
      cargo: 'Coordinador de Estudios',
    },
  };
}

// ============================================
// GUARDAR EVALUACIÓN
// ============================================

/**
 * Guarda una nueva evaluación.
 * 
 * @param alumnoId - ID del alumno
 * @param tipo - Tipo de diagnóstico
 * @param detalles - Array de detalles (subhabilidad, nivel)
 * @returns ID de la evaluación creada o error
 */
export async function guardarEvaluacion(
  alumnoId: number,
  tipo: string,
  detalles: Array<{ subhabilidad: string; nivel: number }>
): Promise<ActionResult<{ evaluacionId: number }>> {
  try {
    const user = await requireRole(Rol.EVALUADOR);

    // Validar tipo
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
      return { success: false, error: 'Tipo de diagnóstico inválido' };
    }

    // Validar que el alumno existe
    const alumno = await db.alumno.findUnique({
      where: { id: alumnoId },
    });

    if (!alumno) {
      return { success: false, error: 'Alumno no encontrado' };
    }

    // Validar detalles
    if (!Array.isArray(detalles) || detalles.length === 0) {
      return { success: false, error: 'Debe haber al menos un detalle' };
    }

    for (const detalle of detalles) {
      if (!detalle.subhabilidad || typeof detalle.subhabilidad !== 'string') {
        return {
          success: false,
          error: 'Cada detalle debe tener subhabilidad (string)',
        };
      }
      if (
        typeof detalle.nivel !== 'number' ||
        detalle.nivel < 1 ||
        detalle.nivel > 4
      ) {
        return {
          success: false,
          error: 'Cada detalle debe tener nivel (1-4)',
        };
      }
    }

    // Crear evaluación con detalles en transacción
    const evaluacion = await db.evaluacion.create({
      data: {
        alumnoId,
        evaluadorId: user.id,
        tipo: tipo as TipoDiagnostico,
        fecha: new Date(),
        detalles: {
          create: detalles.map((d) => ({
            subhabilidad: d.subhabilidad,
            nivel: d.nivel,
          })),
        },
      },
    });

    return { success: true, data: { evaluacionId: evaluacion.id } };
  } catch (error) {
    console.error('Error en guardarEvaluacion:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Error al guardar evaluación',
    };
  }
}

// ============================================
// GUARDAR EVALUACIÓN ACTIVA
// ============================================

/**
 * Guarda una evaluación activa desde la UI.
 * 
 * Esta función implementa:
 * - Validaciones server-side completas
 * - Autorización (EVALUADOR o SUPER_ADMIN)
 * - Scoping correcto según rol y escuela
 * - Transacción para garantizar atomicidad
 * 
 * @param payload - Payload de evaluación (alumnoId, tipo, detalles)
 * @returns Resultado con evaluacionId o errores
 */
export async function guardarEvaluacionActiva(
  payload: {
    alumnoId: number | string;
    tipo: string;
    detalles: Array<{ subhabilidad: string; nivel: number }>;
  }
): Promise<
  | { success: true; evaluacionId: number }
  | { success: false; error: string; fieldErrors?: Record<string, string> }
> {
  try {
    // 1. Autorización: Requerir EVALUADOR o SUPER_ADMIN
    const user = await requireAnyRole([Rol.EVALUADOR, Rol.SUPER_ADMIN]);

    // 2. Validaciones de entrada
    const fieldErrors: Record<string, string> = {};

    // Validar alumnoId
    let alumnoIdNum: number | undefined;
    if (typeof payload.alumnoId === 'string') {
      alumnoIdNum = parseInt(payload.alumnoId, 10);
      if (isNaN(alumnoIdNum)) {
        fieldErrors.alumnoId = 'ID de alumno inválido';
        alumnoIdNum = undefined;
      }
    } else if (typeof payload.alumnoId === 'number') {
      alumnoIdNum = payload.alumnoId;
    } else {
      fieldErrors.alumnoId = 'ID de alumno es requerido';
      alumnoIdNum = undefined;
    }

    // Validar tipo
    const tiposValidos: string[] = [
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
    if (!payload.tipo || typeof payload.tipo !== 'string') {
      fieldErrors.tipo = 'Tipo de diagnóstico es requerido';
    } else if (!tiposValidos.includes(payload.tipo)) {
      fieldErrors.tipo = 'Tipo de diagnóstico inválido';
    }

    // Validar detalles
    if (!Array.isArray(payload.detalles) || payload.detalles.length === 0) {
      fieldErrors.detalles = 'Debe haber al menos un detalle';
    } else {
      payload.detalles.forEach((detalle, index) => {
        if (!detalle.subhabilidad || typeof detalle.subhabilidad !== 'string' || detalle.subhabilidad.trim() === '') {
          fieldErrors[`detalles.${index}.subhabilidad`] = 'Subhabilidad es requerida';
        }
        if (
          typeof detalle.nivel !== 'number' ||
          !Number.isInteger(detalle.nivel) ||
          detalle.nivel < 1 ||
          detalle.nivel > 4
        ) {
          fieldErrors[`detalles.${index}.nivel`] = 'Nivel debe ser un entero entre 1 y 4';
        }
      });
    }

    // Si hay errores de validación, retornar
    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        error: 'Errores de validación en los datos',
        fieldErrors,
      };
    }

    // Verificar que alumnoIdNum esté definido (TypeScript guard)
    if (alumnoIdNum === undefined) {
      return {
        success: false,
        error: 'ID de alumno es requerido',
        fieldErrors: { alumnoId: 'ID de alumno es requerido' },
      };
    }

    // 3. Obtener usuario completo con escuelaId para scoping
    const usuarioCompleto = await db.usuario.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        rol: true,
        escuelaId: true,
      },
    });

    if (!usuarioCompleto) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // 4. Obtener alumno con datos completos para scoping
    const alumno = await db.alumno.findUnique({
      where: { id: alumnoIdNum },
      select: {
        id: true,
        tipo: true,
        escuelaId: true,
      },
    });

    if (!alumno) {
      return { success: false, error: 'Alumno no encontrado' };
    }

    // 5. Aplicar scoping según reglas:
    // - SUPER_ADMIN: puede evaluar cualquier alumno
    // - EVALUADOR con escuelaId: puede evaluar alumnos de su escuela O alumnos INDEPENDIENTES
    // - EVALUADOR sin escuelaId: solo alumnos INDEPENDIENTES
    if (usuarioCompleto.rol === Rol.EVALUADOR) {
      if (usuarioCompleto.escuelaId) {
        // Evaluador con escuela: puede evaluar alumnos de su escuela O independientes
        if (alumno.escuelaId !== null && alumno.escuelaId !== usuarioCompleto.escuelaId) {
          return {
            success: false,
            error: 'No autorizado: solo puedes evaluar alumnos de tu escuela o alumnos independientes',
          };
        }
        // Si alumno.escuelaId === usuarioCompleto.escuelaId: OK
        // Si alumno.tipo === INDEPENDIENTE: OK
      } else {
        // Evaluador sin escuela: solo alumnos independientes
        if (alumno.tipo !== TipoAlumno.INDEPENDIENTE) {
          return {
            success: false,
            error: 'No autorizado: solo puedes evaluar alumnos independientes',
          };
        }
      }
    }
    // SUPER_ADMIN: sin restricciones (continúa)

    // 6. Persistencia en transacción
    const evaluacion = await db.$transaction(async (tx) => {
      // Crear evaluación
      const nuevaEvaluacion = await tx.evaluacion.create({
        data: {
          alumnoId: alumnoIdNum,
          evaluadorId: usuarioCompleto.id,
          tipo: payload.tipo as TipoDiagnostico, // Cast a TipoDiagnostico enum
          fecha: new Date(),
        },
      });

      // Crear detalles con createMany (más eficiente)
      await tx.evaluacionDetalle.createMany({
        data: payload.detalles.map((d) => ({
          evaluacionId: nuevaEvaluacion.id,
          subhabilidad: d.subhabilidad.trim(),
          nivel: d.nivel,
        })),
      });

      return nuevaEvaluacion;
    });

    return { success: true, evaluacionId: evaluacion.id };
  } catch (error) {
    console.error('Error en guardarEvaluacionActiva:', error);

    // Manejar errores de autorización
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }

    // Manejar errores de constraint/DB
    if (error instanceof Error) {
      // Errores de Prisma (constraints, etc.)
      if (error.message.includes('Unique constraint') || error.message.includes('Foreign key constraint')) {
        return {
          success: false,
          error: 'Error al guardar evaluación: conflicto de datos',
        };
      }
    }

    // Error genérico
    return {
      success: false,
      error: 'Error al guardar evaluación',
    };
  }
}

// ============================================
// OBTENER DATOS PARA EVALUACIÓN ACTIVA
// ============================================

/**
 * Obtiene los datos necesarios para iniciar una evaluación activa.
 * 
 * @param alumnoId - ID del alumno
 * @param tipoDiagnostico - Tipo de diagnóstico (opcional, puede venir de la evaluación)
 * @returns Datos del alumno y tipo de diagnóstico
 */
export async function getDatosEvaluacionActiva(
  alumnoId: number,
  tipoDiagnostico?: string
): Promise<
  ActionResult<{
    alumno: {
      id: string; // String para compatibilidad con EvaluacionActivaData
      nombre: string;
      avatarUrl: string;
      grupo: string;
      sugia: string;
      perek: string;
    };
    tipoDiagnostico: string;
    subhabilidades: Array<{ key: string; label: string }>;
  }>
> {
  try {
    await requireRole(Rol.EVALUADOR);

    // Obtener alumno
    const alumno = await db.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        escuela: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!alumno) {
      return { success: false, error: 'Alumno no encontrado' };
    }

    // Si no se proporciona tipo, usar un tipo por defecto
    // ⚠️ TODO: Obtener tipo de diagnóstico desde contexto de evaluación o selección del usuario
    const tipo = tipoDiagnostico || 'GV_HA_FACIL_NK';

    // Obtener subhabilidades para este tipo
    const { getSubhabilidadesPorTipo } = await import('@/lib/rubricas');
    const subhabilidades = getSubhabilidadesPorTipo(tipo as TipoDiagnosticoRubrica);

    return {
      success: true,
      data: {
        alumno: {
          id: alumno.id.toString(), // Convertir number a string para compatibilidad con tipos
          nombre: alumno.nombre,
          avatarUrl: '', // TODO: Agregar avatar si es necesario
          grupo: alumno.escuela?.nombre || 'Sin grupo',
          sugia: 'Bava Metzia', // TODO: Obtener desde contexto de evaluación
          perek: 'Perek 2', // TODO: Obtener desde contexto de evaluación
        },
        tipoDiagnostico: tipo,
        subhabilidades: subhabilidades.map((s) => ({
          key: s.key,
          label: s.label,
        })),
      },
    };
  } catch (error) {
    console.error('Error en getDatosEvaluacionActiva:', error);
    if (error instanceof Error && (error.message === 'No autenticado' || error.message === 'No autorizado')) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Error al obtener datos de evaluación',
    };
  }
}
