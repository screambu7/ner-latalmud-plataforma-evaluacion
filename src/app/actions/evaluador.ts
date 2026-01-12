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

import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { Rol } from '@prisma/client';
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
 * 
 * @returns Datos del dashboard o error
 */
export async function getEvaluadorDashboard(): Promise<
  ActionResult<EvaluadorDashboardDataV2>
> {
  try {
    const user = await requireRole(Rol.EVALUADOR);

    // Obtener todas las evaluaciones del evaluador
    const evaluaciones = await db.evaluacion.findMany({
      where: {
        evaluadorId: user.id,
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

    // Calcular estadísticas
    const stats = calcularStatsDashboard(evaluacionesPuras, evaluaciones);

    // Obtener actividad reciente
    const recentActivity = obtenerActividadReciente(evaluaciones);

    // Generar calendario del mes actual
    const calendar = generarCalendarioMesActual();

    // Obtener datos del evaluador
    const evaluadorData = await db.usuario.findUnique({
      where: { id: user.id },
      select: {
        nombre: true,
      },
    });

    const data: EvaluadorDashboardDataV2 = {
      evaluador: {
        nombre: evaluadorData?.nombre || 'Evaluador',
        avatarUrl: '', // TODO: Agregar campo avatarUrl al schema si es necesario
      },
      saludo: `Shalom, ${evaluadorData?.nombre || 'Evaluador'}`,
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
  for (const [alumnoId, evaluacionesAlumno] of Array.from(
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
 * Obtiene la actividad reciente de evaluaciones.
 */
function obtenerActividadReciente(
  evaluaciones: Array<{
    id: number;
    fecha: Date;
    alumno: { id: number; nombre: string };
  }>
): RecentActivity[] {
  // Tomar las últimas 3 evaluaciones
  const ultimasEvaluaciones = evaluaciones.slice(0, 3);

  return ultimasEvaluaciones.map((evaluacion) => {
    const diasAtras = Math.floor(
      (Date.now() - evaluacion.fecha.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: evaluacion.id.toString(),
      estudianteNombre: evaluacion.alumno.nombre,
      estudianteAvatarUrl: '', // TODO: Agregar avatar si es necesario
      examenNombre: `Evaluación #${evaluacion.id}`,
      tiempoAtras: diasAtras === 0 ? 'hoy' : `${diasAtras}d`,
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
 * @param alumnoId - ID del alumno
 * @returns Datos del perfil o error
 */
export async function getPerfilDiagnostico(
  alumnoId: number
): Promise<ActionResult<PerfilDiagnosticoData>> {
  try {
    const user = await requireRole(Rol.EVALUADOR);

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

    // Obtener todas las evaluaciones del alumno
    const evaluaciones = await db.evaluacion.findMany({
      where: {
        alumnoId: alumnoId,
      },
      include: {
        detalles: true,
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

    // Calcular mapa de habilidades (radar chart)
    const mapaHabilidades = calcularMapaHabilidades(
      evaluacionesPuras,
      HABILIDADES_GENERALES
    );

    // Generar historial de evaluaciones
    const historialEvaluaciones = generarHistorialEvaluaciones(evaluaciones);

    // Obtener notas académicas (si existen)
    const notasAcademicas = await obtenerNotasAcademicas(alumnoId, user.id);

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
 * @param alumnoId - ID del alumno
 * @returns Datos del reporte o error
 */
export async function getReporteProgreso(
  alumnoId: number
): Promise<ActionResult<ReporteProgresoData>> {
  try {
    const user = await requireRole(Rol.EVALUADOR);

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

    // Obtener todas las evaluaciones del alumno
    const evaluaciones = await db.evaluacion.findMany({
      where: {
        alumnoId: alumnoId,
      },
      include: {
        detalles: true,
      },
      orderBy: {
        fecha: 'asc',
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

    // Calcular habilidades clave (radar chart)
    const habilidadesClave = calcularMapaHabilidades(
      evaluacionesPuras,
      HABILIDADES_GENERALES
    );

    // Determinar nivel según promedio
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

    // Calcular progreso semestral (últimos 6 meses)
    const progresoSemestral = calcularProgresoSemestral(evaluaciones);

    // Generar resumen ejecutivo
    const resumenEjecutivo = generarResumenEjecutivo(
      habilidadesClave,
      promedioPorcentaje,
      evaluacionesPuras
    );

    // Obtener recomendación del Moré
    const recomendacionMore = await obtenerRecomendacionMore(alumnoId, user.id);

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
  promedioPorcentaje: number,
  evaluaciones: EvaluacionCompleta[]
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
        tipo: tipo as any,
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
    const user = await requireRole(Rol.EVALUADOR);

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
    const subhabilidades = getSubhabilidadesPorTipo(tipo as any);

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
