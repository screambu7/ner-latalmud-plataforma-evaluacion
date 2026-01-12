/**
 * Funciones Canónicas de Cálculo - Ner LaTalmud
 * 
 * Funciones puras para calcular promedios del sistema de diagnóstico.
 * 
 * Arquitectura:
 * - Funciones puras (sin efectos secundarios)
 * - Independientes de Prisma/BD
 * - Testeables unitariamente
 * - Sin dependencias de UI
 * - Solo usan Nivel interno (1-4), nunca etiquetas
 * 
 * Reglas de negocio:
 * - "Herramientas para entender la Guemará" NO se promedia con las demás
 * - Los niveles se promedian como números (1-4)
 * - No se asumen pesos si no están definidos
 * - No se muestran números al usuario (eso es responsabilidad de UI)
 */

import type { Nivel, TipoDiagnostico, HabilidadGeneral } from './rubricas';

// ============================================
// TIPOS DE DATOS (INDEPENDIENTES DE PRISMA)
// ============================================

/**
 * Detalle de evaluación (representación pura, sin dependencias de BD).
 * 
 * Corresponde a EvaluacionDetalle en el schema de Prisma,
 * pero aquí es un tipo plano para uso en funciones puras.
 */
export interface DetalleEvaluacion {
  /** Clave de la subhabilidad evaluada */
  subhabilidad: string;
  
  /** Nivel asignado (1-4) */
  nivel: Nivel;
}

/**
 * Evaluación completa (representación pura, sin dependencias de BD).
 * 
 * Corresponde a Evaluacion + EvaluacionDetalle[] en el schema de Prisma,
 * pero aquí es un tipo plano para uso en funciones puras.
 */
export interface EvaluacionCompleta {
  /** ID de la evaluación */
  id: number;
  
  /** ID del alumno */
  alumnoId: number;
  
  /** Tipo de diagnóstico */
  tipo: TipoDiagnostico;
  
  /** Fecha de la evaluación */
  fecha: Date;
  
  /** Detalles de la evaluación */
  detalles: DetalleEvaluacion[];
}

/**
 * Resultado de un cálculo de promedio.
 * 
 * Solo contiene el valor numérico (1-4), nunca etiquetas.
 * La conversión a etiquetas (NL, PA, PB, RI) es responsabilidad de la UI.
 */
export interface ResultadoPromedio {
  /** Promedio calculado (número entre 1 y 4) */
  promedio: number;
  
  /** Cantidad de elementos promediados */
  cantidad: number;
  
  /** Indica si el promedio es válido (tiene al menos un elemento) */
  valido: boolean;
}

/**
 * Resultado de promedio por habilidad general.
 */
export interface PromedioPorHabilidad {
  /** Clave de la habilidad general */
  habilidadKey: string;
  
  /** Etiqueta de la habilidad general (solo para identificación, no para UI) */
  habilidadLabel: string;
  
  /** Promedio calculado (1-4) */
  promedio: number;
  
  /** Cantidad de subhabilidades evaluadas */
  cantidad: number;
  
  /** Indica si el promedio es válido */
  valido: boolean;
}

/**
 * Resultado de promedio por subhabilidad.
 */
export interface PromedioPorSubhabilidad {
  /** Clave de la subhabilidad */
  subhabilidadKey: string;
  
  /** Etiqueta de la subhabilidad (solo para identificación, no para UI) */
  subhabilidadLabel: string;
  
  /** Promedio calculado (1-4) */
  promedio: number;
  
  /** Cantidad de evaluaciones que incluyen esta subhabilidad */
  cantidad: number;
  
  /** Indica si el promedio es válido */
  valido: boolean;
}

// ============================================
// CONSTANTES DE DOMINIO
// ============================================

/**
 * Clave de la subhabilidad "Herramientas para entender la Guemará".
 * 
 * Esta subhabilidad NO se promedia con las demás según reglas de negocio.
 * 
 * ⚠️ TODO: Confirmar clave exacta con especificación maestra.
 * Posibles variantes:
 * - 'herramientas_guemara'
 * - 'herramientas_entender_guemara'
 * - 'herramientas_para_entender_guemara'
 */
export const SUBHABILIDAD_EXCLUIDA_PROMEDIO = 'herramientas_para_entender_guemara';

/**
 * Verifica si una subhabilidad debe ser excluida del promedio.
 * 
 * @param subhabilidadKey - Clave de la subhabilidad
 * @returns true si debe ser excluida
 */
export function esSubhabilidadExcluida(subhabilidadKey: string): boolean {
  return subhabilidadKey === SUBHABILIDAD_EXCLUIDA_PROMEDIO;
}

// ============================================
// HELPERS INTERNOS
// ============================================

/**
 * Filtra detalles de evaluación excluyendo la subhabilidad especial.
 * 
 * @param detalles - Array de detalles de evaluación
 * @returns Array filtrado sin la subhabilidad excluida
 */
function filtrarDetallesParaPromedio(
  detalles: DetalleEvaluacion[]
): DetalleEvaluacion[] {
  return detalles.filter(
    (detalle) => !esSubhabilidadExcluida(detalle.subhabilidad)
  );
}

/**
 * Obtiene los niveles de un array de detalles.
 * 
 * @param detalles - Array de detalles de evaluación
 * @returns Array de niveles
 */
function extraerNiveles(detalles: DetalleEvaluacion[]): Nivel[] {
  return detalles.map((detalle) => detalle.nivel);
}

/**
 * Calcula el promedio de un array de números.
 * 
 * Maneja casos edge:
 * - Array vacío → retorna valido: false
 * - Un solo elemento → retorna ese valor
 * 
 * @param valores - Array de números a promediar
 * @returns Resultado del promedio
 */
function calcularPromedioNumerico(valores: number[]): ResultadoPromedio {
  if (valores.length === 0) {
    return {
      promedio: 0,
      cantidad: 0,
      valido: false,
    };
  }

  const suma = valores.reduce((acc, val) => acc + val, 0);
  const promedio = suma / valores.length;

  return {
    promedio,
    cantidad: valores.length,
    valido: true,
  };
}

// ============================================
// FUNCIONES CANÓNICAS
// ============================================

/**
 * Calcula el promedio por evaluación.
 * 
 * Excluye automáticamente la subhabilidad "Herramientas para entender la Guemará".
 * 
 * Casos edge manejados:
 * - Sin detalles → retorna valido: false
 * - Solo Herramientas → retorna valido: false (no hay nada que promediar)
 * - Un solo detalle válido → retorna ese nivel
 * 
 * @param detalles - Array de detalles de evaluación
 * @returns Resultado del promedio (1-4) o inválido si no hay datos
 */
export function promedioPorEvaluacion(
  detalles: DetalleEvaluacion[]
): ResultadoPromedio {
  // Filtrar excluyendo la subhabilidad especial
  const detallesFiltrados = filtrarDetallesParaPromedio(detalles);
  
  // Si no hay detalles válidos después del filtro, retornar inválido
  if (detallesFiltrados.length === 0) {
    return {
      promedio: 0,
      cantidad: 0,
      valido: false,
    };
  }
  
  // Extraer niveles y calcular promedio
  const niveles = extraerNiveles(detallesFiltrados);
  return calcularPromedioNumerico(niveles);
}

/**
 * Calcula el promedio por habilidad general.
 * 
 * Agrupa los detalles por habilidad general y calcula un promedio para cada una.
 * Excluye automáticamente la subhabilidad "Herramientas para entender la Guemará".
 * 
 * Casos edge manejados:
 * - Sin detalles → retorna array vacío
 * - Sin habilidades generales → retorna array vacío
 * - Detalles sin habilidad general asignada → se ignoran
 * 
 * ⚠️ NOTA: Requiere que las habilidades generales estén definidas en rubricas.ts
 * 
 * @param detalles - Array de detalles de evaluación
 * @param tipoDiagnostico - Tipo de diagnóstico de la evaluación
 * @param habilidadesGenerales - Array de habilidades generales disponibles
 * @returns Array de promedios por habilidad general
 */
export function promedioPorHabilidadGeneral(
  detalles: DetalleEvaluacion[],
  tipoDiagnostico: TipoDiagnostico,
  habilidadesGenerales: HabilidadGeneral[]
): PromedioPorHabilidad[] {
  // Filtrar detalles excluyendo la subhabilidad especial
  const detallesFiltrados = filtrarDetallesParaPromedio(detalles);
  
  if (detallesFiltrados.length === 0 || habilidadesGenerales.length === 0) {
    return [];
  }

  // Obtener habilidades generales que aplican a este tipo
  const habilidadesAplicables = habilidadesGenerales.filter((hab) =>
    hab.aplicaATipos.includes(tipoDiagnostico)
  );

  if (habilidadesAplicables.length === 0) {
    return [];
  }

  // Crear mapa de subhabilidad -> habilidad general
  const mapaSubhabilidadAHabilidad = new Map<string, string>();
  
  for (const habilidad of habilidadesAplicables) {
    for (const subhabilidad of habilidad.subhabilidades) {
      mapaSubhabilidadAHabilidad.set(subhabilidad.key, habilidad.key);
    }
  }

  // Agrupar detalles por habilidad general
  const agrupados = new Map<string, DetalleEvaluacion[]>();
  
  for (const detalle of detallesFiltrados) {
    const habilidadKey = mapaSubhabilidadAHabilidad.get(detalle.subhabilidad);
    
    if (habilidadKey) {
      const detallesHabilidad = agrupados.get(habilidadKey) || [];
      detallesHabilidad.push(detalle);
      agrupados.set(habilidadKey, detallesHabilidad);
    }
  }

  // Calcular promedio para cada habilidad general
  const resultados: PromedioPorHabilidad[] = [];
  
  for (const [habilidadKey, detallesHabilidad] of Array.from(agrupados.entries())) {
    const habilidad = habilidadesGenerales.find((h) => h.key === habilidadKey);
    
    if (habilidad) {
      const niveles = extraerNiveles(detallesHabilidad);
      const resultado = calcularPromedioNumerico(niveles);
      
      resultados.push({
        habilidadKey: habilidad.key,
        habilidadLabel: habilidad.label,
        promedio: resultado.promedio,
        cantidad: resultado.cantidad,
        valido: resultado.valido,
      });
    }
  }

  return resultados;
}

/**
 * Calcula el promedio global del alumno.
 * 
 * Considera todas las evaluaciones del alumno y calcula un promedio general,
 * excluyendo la subhabilidad "Herramientas para entender la Guemará".
 * 
 * Casos edge manejados:
 * - Sin evaluaciones → retorna valido: false
 * - Una sola evaluación → calcula promedio de esa evaluación
 * - Evaluaciones sin detalles válidos → retorna valido: false
 * 
 * @param evaluaciones - Array de todas las evaluaciones del alumno
 * @returns Resultado del promedio global (1-4) o inválido si no hay datos
 */
export function promedioGlobalAlumno(
  evaluaciones: EvaluacionCompleta[]
): ResultadoPromedio {
  // Caso edge: sin evaluaciones
  if (evaluaciones.length === 0) {
    return {
      promedio: 0,
      cantidad: 0,
      valido: false,
    };
  }

  // Obtener todos los detalles de todas las evaluaciones
  const todosDetalles = evaluaciones.flatMap((evaluacion) => evaluacion.detalles);
  
  // Filtrar excluyendo la subhabilidad especial
  const detallesFiltrados = filtrarDetallesParaPromedio(todosDetalles);
  
  // Si no hay detalles válidos, retornar inválido
  if (detallesFiltrados.length === 0) {
    return {
      promedio: 0,
      cantidad: 0,
      valido: false,
    };
  }
  
  // Calcular promedio
  const niveles = extraerNiveles(detallesFiltrados);
  return calcularPromedioNumerico(niveles);
}

/**
 * Calcula el promedio por subhabilidad.
 * 
 * Agrupa todas las evaluaciones por subhabilidad y calcula un promedio
 * para cada subhabilidad a lo largo del tiempo.
 * 
 * Excluye automáticamente la subhabilidad "Herramientas para entender la Guemará"
 * de los resultados (no se promedia, pero puede aparecer en los datos).
 * 
 * Casos edge manejados:
 * - Sin evaluaciones → retorna array vacío
 * - Subhabilidad evaluada una sola vez → retorna ese nivel
 * - Subhabilidad sin evaluaciones → no aparece en resultados
 * 
 * ⚠️ NOTA: Si se necesita incluir "Herramientas" en los resultados (sin promediar),
 * se debe hacer explícitamente en la capa de servicio/UI.
 * 
 * @param evaluaciones - Array de todas las evaluaciones del alumno
 * @param subhabilidades - Array de subhabilidades disponibles (para obtener labels)
 * @returns Array de promedios por subhabilidad
 */
export function promedioPorSubhabilidad(
  evaluaciones: EvaluacionCompleta[],
  subhabilidades: Array<{ key: string; label: string }>
): PromedioPorSubhabilidad[] {
  // Caso edge: sin evaluaciones
  if (evaluaciones.length === 0) {
    return [];
  }

  // Obtener todos los detalles de todas las evaluaciones
  const todosDetalles = evaluaciones.flatMap((evaluacion) => evaluacion.detalles);
  
  // Filtrar excluyendo la subhabilidad especial (no se promedia)
  const detallesFiltrados = filtrarDetallesParaPromedio(todosDetalles);
  
  if (detallesFiltrados.length === 0) {
    return [];
  }

  // Agrupar detalles por subhabilidad
  const agrupados = new Map<string, DetalleEvaluacion[]>();
  
  for (const detalle of detallesFiltrados) {
    const detallesSubhabilidad = agrupados.get(detalle.subhabilidad) || [];
    detallesSubhabilidad.push(detalle);
    agrupados.set(detalle.subhabilidad, detallesSubhabilidad);
  }

  // Calcular promedio para cada subhabilidad
  const resultados: PromedioPorSubhabilidad[] = [];
  
  for (const [subhabilidadKey, detallesSubhabilidad] of Array.from(agrupados.entries())) {
    // Buscar label de la subhabilidad
    const subhabilidad = subhabilidades.find((s) => s.key === subhabilidadKey);
    const label = subhabilidad?.label || subhabilidadKey;
    
    const niveles = extraerNiveles(detallesSubhabilidad);
    const resultado = calcularPromedioNumerico(niveles);
    
    resultados.push({
      subhabilidadKey,
      subhabilidadLabel: label,
      promedio: resultado.promedio,
      cantidad: resultado.cantidad,
      valido: resultado.valido,
    });
  }

  return resultados;
}

// ============================================
// FUNCIONES DE CONVENIENCIA (MANTENIDAS PARA COMPATIBILIDAD)
// ============================================

/**
 * Calcula el promedio de una evaluación individual.
 * 
 * @deprecated Usar promedioPorEvaluacion() en su lugar
 * @param evaluacion - Evaluación completa con detalles
 * @returns Resultado del promedio
 */
export function calcularPromedioPorEvaluacion(
  evaluacion: EvaluacionCompleta
): ResultadoPromedio {
  return promedioPorEvaluacion(evaluacion.detalles);
}

/**
 * Calcula el promedio por habilidad general para una evaluación.
 * 
 * @deprecated Usar promedioPorHabilidadGeneral() en su lugar
 * @param evaluacion - Evaluación completa
 * @param habilidadesGenerales - Array de habilidades generales disponibles
 * @returns Array de promedios por habilidad general
 */
export function calcularPromedioPorHabilidadGeneral(
  evaluacion: EvaluacionCompleta,
  habilidadesGenerales: HabilidadGeneral[]
): PromedioPorHabilidad[] {
  return promedioPorHabilidadGeneral(
    evaluacion.detalles,
    evaluacion.tipo,
    habilidadesGenerales
  );
}

/**
 * Calcula el promedio global de un alumno.
 * 
 * @deprecated Usar promedioGlobalAlumno() en su lugar
 * @param evaluaciones - Array de todas las evaluaciones del alumno
 * @returns Resultado del promedio global
 */
export function calcularPromedioGlobalAlumno(
  evaluaciones: EvaluacionCompleta[]
): ResultadoPromedio {
  return promedioGlobalAlumno(evaluaciones);
}

/**
 * Calcula el promedio por habilidad general para múltiples evaluaciones.
 * 
 * @param evaluaciones - Array de evaluaciones
 * @param habilidadesGenerales - Array de habilidades generales disponibles
 * @returns Array de promedios por habilidad general
 */
export function calcularPromedioPorHabilidadGeneralMultiples(
  evaluaciones: EvaluacionCompleta[],
  habilidadesGenerales: HabilidadGeneral[]
): PromedioPorHabilidad[] {
  if (evaluaciones.length === 0 || habilidadesGenerales.length === 0) {
    return [];
  }

  // Agrupar todos los detalles por evaluación y habilidad general
  const acumuladores = new Map<string, { niveles: Nivel[]; label: string }>();

  for (const evaluacion of evaluaciones) {
    const promediosPorHabilidad = promedioPorHabilidadGeneral(
      evaluacion.detalles,
      evaluacion.tipo,
      habilidadesGenerales
    );

    for (const promedioHabilidad of promediosPorHabilidad) {
      // Obtener detalles de esta habilidad en esta evaluación
      const detallesFiltrados = filtrarDetallesParaPromedio(evaluacion.detalles);
      const detallesHabilidad = detallesFiltrados.filter((detalle) => {
        const habilidad = habilidadesGenerales.find((h) => h.key === promedioHabilidad.habilidadKey);
        return habilidad?.subhabilidades.some((s) => s.key === detalle.subhabilidad) || false;
      });

      const niveles = extraerNiveles(detallesHabilidad);
      const acumulador = acumuladores.get(promedioHabilidad.habilidadKey);
      
      if (acumulador) {
        acumulador.niveles.push(...niveles);
      } else {
        acumuladores.set(promedioHabilidad.habilidadKey, {
          niveles: [...niveles],
          label: promedioHabilidad.habilidadLabel,
        });
      }
    }
  }

  // Calcular promedio para cada habilidad general
  const resultados: PromedioPorHabilidad[] = [];
  
  for (const [habilidadKey, acumulador] of Array.from(acumuladores.entries())) {
    const resultado = calcularPromedioNumerico(acumulador.niveles);
    
    resultados.push({
      habilidadKey,
      habilidadLabel: acumulador.label,
      promedio: resultado.promedio,
      cantidad: resultado.cantidad,
      valido: resultado.valido,
    });
  }

  return resultados;
}

/**
 * Calcula el promedio global del alumno por habilidad general.
 * 
 * @param evaluaciones - Array de todas las evaluaciones del alumno
 * @param habilidadesGenerales - Array de habilidades generales disponibles
 * @returns Array de promedios por habilidad general
 */
export function calcularPromedioGlobalPorHabilidad(
  evaluaciones: EvaluacionCompleta[],
  habilidadesGenerales: HabilidadGeneral[]
): PromedioPorHabilidad[] {
  return calcularPromedioPorHabilidadGeneralMultiples(
    evaluaciones,
    habilidadesGenerales
  );
}

// ============================================
// HELPERS DE TRANSFORMACIÓN
// ============================================

/**
 * Convierte datos de Prisma a tipos puros para cálculos.
 * 
 * Esta función permite transformar datos de la BD (Prisma) a los tipos
 * puros usados en las funciones de cálculo, manteniendo la separación
 * de responsabilidades.
 * 
 * @param evaluacionPrisma - Evaluación desde Prisma (con detalles incluidos)
 * @returns Evaluación en formato puro
 */
export function transformarEvaluacionPrisma(
  evaluacionPrisma: {
    id: number;
    alumnoId: number;
    tipo: TipoDiagnostico;
    fecha: Date;
    detalles: Array<{
      subhabilidad: string;
      nivel: number;
    }>;
  }
): EvaluacionCompleta {
  return {
    id: evaluacionPrisma.id,
    alumnoId: evaluacionPrisma.alumnoId,
    tipo: evaluacionPrisma.tipo,
    fecha: evaluacionPrisma.fecha,
    detalles: evaluacionPrisma.detalles.map((detalle) => ({
      subhabilidad: detalle.subhabilidad,
      nivel: detalle.nivel as Nivel,
    })),
  };
}

/**
 * Convierte múltiples evaluaciones de Prisma a tipos puros.
 * 
 * @param evaluacionesPrisma - Array de evaluaciones desde Prisma
 * @returns Array de evaluaciones en formato puro
 */
export function transformarEvaluacionesPrisma(
  evaluacionesPrisma: Array<{
    id: number;
    alumnoId: number;
    tipo: TipoDiagnostico;
    fecha: Date;
    detalles: Array<{
      subhabilidad: string;
      nivel: number;
    }>;
  }>
): EvaluacionCompleta[] {
  return evaluacionesPrisma.map(transformarEvaluacionPrisma);
}
