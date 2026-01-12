/**
 * Sistema de Rúbricas - Ner LaTalmud
 * 
 * Estructura canónica de rúbricas para el sistema de diagnóstico talmúdico.
 * 
 * Arquitectura:
 * - TipoDiagnostico (16 tipos) → define habilidades generales
 * - HabilidadGeneral → agrupa subhabilidades evaluables
 * - Subhabilidad → evaluable con escala 1-4 (NL, PA, PB, RI)
 * 
 * ⚠️ IMPORTANTE: Este archivo contiene la estructura completa pero requiere
 * ESPECIFICACIÓN MAESTRA v1.4 para completar el contenido de habilidades y subhabilidades.
 * 
 * Ver: docs/TODOS_RUBRICAS.md para más detalles.
 */

// ============================================
// TIPOS FUNDAMENTALES
// ============================================

/**
 * Nivel de evaluación (escala interna 1-4).
 * 
 * Mapeo a escala externa:
 * - 1 = NL (Nivel Logrado)
 * - 2 = PA (Parcialmente Alcanzado)
 * - 3 = PB (Parcialmente Básico)
 * - 4 = RI (Requiere Intervención)
 * 
 * ⚠️ TODO: Validar mapeo exacto con especificación maestra.
 */
export type Nivel = 1 | 2 | 3 | 4;

/**
 * Etiqueta de nivel en escala externa.
 * 
 * ⚠️ TODO: Confirmar nombres exactos y orden con especificación maestra.
 */
export type EtiquetaNivel = 'NL' | 'PA' | 'PB' | 'RI';

/**
 * Mapeo de nivel interno a etiqueta externa.
 * 
 * ⚠️ TODO: Validar mapeo exacto con especificación maestra.
 * Posible mapeo (requiere confirmación):
 * - 1 → NL (Nivel Logrado)
 * - 2 → PA (Parcialmente Alcanzado)
 * - 3 → PB (Parcialmente Básico)
 * - 4 → RI (Requiere Intervención)
 */
export const MAPEO_NIVELES: Record<Nivel, EtiquetaNivel> = {
  1: 'NL', // TODO: Confirmar mapeo
  2: 'PA', // TODO: Confirmar mapeo
  3: 'PB', // TODO: Confirmar mapeo
  4: 'RI', // TODO: Confirmar mapeo
};

/**
 * Mapeo inverso: etiqueta externa a nivel interno.
 */
export const MAPEO_ETIQUETAS: Record<EtiquetaNivel, Nivel> = {
  NL: 1, // TODO: Confirmar mapeo
  PA: 2, // TODO: Confirmar mapeo
  PB: 3, // TODO: Confirmar mapeo
  RI: 4, // TODO: Confirmar mapeo
};

/**
 * Tipos de diagnóstico del sistema (16 total).
 * 
 * Estructura del código:
 * - GV/GN: Gemara Vilna / Gemara Nashim
 * - EXP/HA: Explicación / Hacer
 * - DEF: Definición (solo en EXP)
 * - FACIL/DIFICIL: Nivel de dificultad
 * - NK/SN: Sin Nikud / Sin Nikud (solo en HA)
 * 
 * ⚠️ TODO: Confirmar significado exacto de cada componente con especificación maestra.
 */
export type TipoDiagnostico =
  | 'GV_EXP_DEF_FACIL'
  | 'GV_EXP_FACIL'
  | 'GV_HA_FACIL_NK'
  | 'GV_HA_FACIL_SN'
  | 'GN_EXP_DEF_FACIL'
  | 'GN_EXP_FACIL'
  | 'GN_HA_FACIL_NK'
  | 'GN_HA_FACIL_SN'
  | 'GV_EXP_DEF_DIFICIL'
  | 'GV_EXP_DIFICIL'
  | 'GV_HA_DIFICIL_NK'
  | 'GV_HA_DIFICIL_SN'
  | 'GN_EXP_DEF_DIFICIL'
  | 'GN_EXP_DIFICIL'
  | 'GN_HA_DIFICIL_NK'
  | 'GN_HA_DIFICIL_SN';

// ============================================
// ESTRUCTURA DE HABILIDADES
// ============================================

/**
 * Subhabilidad evaluable.
 * 
 * Representa una subhabilidad específica que puede ser evaluada
 * con un nivel (1-4) en el contexto de un tipo de diagnóstico.
 */
export interface Subhabilidad {
  /** Clave única de la subhabilidad (snake_case, usado en BD) */
  key: string;
  
  /** Etiqueta legible para mostrar en UI */
  label: string;
  
  /** Descripción opcional de la subhabilidad */
  descripcion?: string;
  
  /** Tipos de diagnóstico a los que aplica esta subhabilidad */
  aplicaATipos: TipoDiagnostico[];
  
  /** 
   * Criterios de evaluación por nivel (opcional).
   * 
   * ⚠️ TODO: Completar con criterios específicos del dominio talmúdico
   * según especificación maestra.
   */
  criterios?: {
    [K in Nivel]?: string;
  };
}

/**
 * Habilidad general.
 * 
 * Agrupa subhabilidades relacionadas bajo un concepto general.
 * Cada tipo de diagnóstico define un conjunto de habilidades generales.
 */
export interface HabilidadGeneral {
  /** Clave única de la habilidad general (snake_case) */
  key: string;
  
  /** Etiqueta legible para mostrar en UI */
  label: string;
  
  /** Descripción opcional de la habilidad general */
  descripcion?: string;
  
  /** Tipos de diagnóstico a los que aplica esta habilidad general */
  aplicaATipos: TipoDiagnostico[];
  
  /** Subhabilidades que pertenecen a esta habilidad general */
  subhabilidades: Subhabilidad[];
  
  /**
   * Orden de presentación (opcional).
   * Si no se especifica, se usa el orden del array.
   */
  orden?: number;
}

/**
 * Configuración completa de un tipo de diagnóstico.
 * 
 * Define todas las habilidades generales y subhabilidades
 * que aplican a un tipo específico.
 */
export interface ConfiguracionTipoDiagnostico {
  /** Tipo de diagnóstico */
  tipo: TipoDiagnostico;
  
  /** Etiqueta legible del tipo */
  label: string;
  
  /** Descripción del tipo de diagnóstico */
  descripcion?: string;
  
  /** Habilidades generales que aplican a este tipo */
  habilidadesGenerales: HabilidadGeneral[];
  
  /**
   * Metadatos adicionales del tipo (opcional).
   * 
   * ⚠️ TODO: Definir estructura según necesidades del dominio.
   * Ejemplos posibles:
   * - nivelDificultad: 'FACIL' | 'DIFICIL'
   * - categoria: 'GV' | 'GN'
   * - modalidad: 'EXP' | 'HA'
   */
  metadata?: Record<string, unknown>;
}

// ============================================
// DATOS DE RÚBRICAS
// ============================================

/**
 * Lista completa de subhabilidades del sistema.
 * 
 * ⚠️ TODO: Completar según ESPECIFICACIÓN MAESTRA v1.4
 * 
 * Estado actual: Solo contiene 1 subhabilidad de ejemplo.
 * Se requiere mapear todas las subhabilidades para los 16 tipos de diagnóstico.
 * 
 * IMPORTANTE: No inventar criterios fuera del dominio talmúdico.
 * Todas las subhabilidades deben venir de la especificación maestra.
 */
export const SUBHABILIDADES: Subhabilidad[] = [
  {
    key: 'lectura_basica',
    label: 'Lectura básica',
    descripcion: undefined, // TODO: Agregar descripción según especificación
    aplicaATipos: ['GV_HA_FACIL_NK', 'GV_HA_FACIL_SN'],
    criterios: undefined, // TODO: Agregar criterios por nivel según especificación
  },
  // TODO: Agregar todas las subhabilidades según especificación maestra
  // Estructura esperada:
  // {
  //   key: 'nombre_subhabilidad',
  //   label: 'Nombre Legible',
  //   descripcion: 'Descripción del dominio talmúdico',
  //   aplicaATipos: ['TIPO_1', 'TIPO_2', ...],
  //   criterios: {
  //     1: 'Criterio para nivel 1 (NL)',
  //     2: 'Criterio para nivel 2 (PA)',
  //     3: 'Criterio para nivel 3 (PB)',
  //     4: 'Criterio para nivel 4 (RI)',
  //   },
  // },
];

/**
 * Lista completa de habilidades generales del sistema.
 * 
 * ⚠️ TODO: Completar según ESPECIFICACIÓN MAESTRA v1.4
 * 
 * IMPORTANTE: 
 * - Cada habilidad general debe agrupar subhabilidades relacionadas
 * - Las subhabilidades referenciadas deben existir en SUBHABILIDADES
 * - No inventar habilidades fuera del dominio talmúdico
 */
export const HABILIDADES_GENERALES: HabilidadGeneral[] = [
  // TODO: Definir habilidades generales según especificación maestra
  // Ejemplo de estructura esperada:
  // {
  //   key: 'comprension_textual',
  //   label: 'Comprensión Textual',
  //   descripcion: 'Habilidad para comprender textos talmúdicos',
  //   aplicaATipos: ['GV_EXP_FACIL', 'GN_EXP_FACIL', ...],
  //   subhabilidades: [
  //     // Referencias a subhabilidades de SUBHABILIDADES
  //     SUBHABILIDADES.find(s => s.key === 'lectura_basica')!,
  //     // ... más subhabilidades
  //   ],
  //   orden: 1,
  // },
];

/**
 * Configuraciones completas por tipo de diagnóstico.
 * 
 * ⚠️ TODO: Completar según ESPECIFICACIÓN MAESTRA v1.4
 * 
 * Esta estructura permite obtener toda la información de rúbricas
 * para un tipo de diagnóstico específico de manera eficiente.
 */
export const CONFIGURACIONES_TIPOS: ConfiguracionTipoDiagnostico[] = [
  // TODO: Completar configuración para cada uno de los 16 tipos
  // Ejemplo de estructura esperada:
  // {
  //   tipo: 'GV_EXP_DEF_FACIL',
  //   label: 'Gemara Vilna - Explicación Definición - Fácil',
  //   descripcion: 'Descripción del tipo de diagnóstico',
  //   habilidadesGenerales: [
  //     // Filtrar de HABILIDADES_GENERALES según aplicaATipos
  //   ],
  //   metadata: {
  //     nivelDificultad: 'FACIL',
  //     categoria: 'GV',
  //     modalidad: 'EXP',
  //   },
  // },
];

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Obtiene las subhabilidades que aplican a un tipo de diagnóstico específico.
 * 
 * @param tipo - Tipo de diagnóstico
 * @returns Array de subhabilidades aplicables
 */
export function getSubhabilidadesPorTipo(tipo: TipoDiagnostico): Subhabilidad[] {
  return SUBHABILIDADES.filter((sub) => sub.aplicaATipos.includes(tipo));
}

/**
 * Obtiene las habilidades generales que aplican a un tipo de diagnóstico específico.
 * 
 * @param tipo - Tipo de diagnóstico
 * @returns Array de habilidades generales aplicables
 */
export function getHabilidadesGeneralesPorTipo(tipo: TipoDiagnostico): HabilidadGeneral[] {
  return HABILIDADES_GENERALES.filter((hab) => hab.aplicaATipos.includes(tipo));
}

/**
 * Obtiene la configuración completa para un tipo de diagnóstico.
 * 
 * @param tipo - Tipo de diagnóstico
 * @returns Configuración del tipo o undefined si no existe
 */
export function getConfiguracionTipo(tipo: TipoDiagnostico): ConfiguracionTipoDiagnostico | undefined {
  return CONFIGURACIONES_TIPOS.find((config) => config.tipo === tipo);
}

/**
 * Obtiene todas las subhabilidades de una habilidad general.
 * 
 * @param habilidadKey - Clave de la habilidad general
 * @returns Array de subhabilidades
 */
export function getSubhabilidadesPorHabilidad(habilidadKey: string): Subhabilidad[] {
  const habilidad = HABILIDADES_GENERALES.find((h) => h.key === habilidadKey);
  return habilidad?.subhabilidades ?? [];
}

/**
 * Convierte un nivel numérico a su etiqueta externa.
 * 
 * @param nivel - Nivel interno (1-4)
 * @returns Etiqueta externa (NL, PA, PB, RI)
 */
export function nivelAEtiqueta(nivel: Nivel): EtiquetaNivel {
  return MAPEO_NIVELES[nivel];
}

/**
 * Convierte una etiqueta externa a nivel numérico.
 * 
 * @param etiqueta - Etiqueta externa (NL, PA, PB, RI)
 * @returns Nivel interno (1-4)
 */
export function etiquetaANivel(etiqueta: EtiquetaNivel): Nivel {
  return MAPEO_ETIQUETAS[etiqueta];
}

/**
 * Valida que un nivel esté en el rango permitido (1-4).
 * 
 * @param nivel - Nivel a validar
 * @returns true si es válido
 */
export function esNivelValido(nivel: number): nivel is Nivel {
  return nivel >= 1 && nivel <= 4;
}

/**
 * Valida que una etiqueta sea válida.
 * 
 * @param etiqueta - Etiqueta a validar
 * @returns true si es válida
 */
export function esEtiquetaValida(etiqueta: string): etiqueta is EtiquetaNivel {
  return etiqueta === 'NL' || etiqueta === 'PA' || etiqueta === 'PB' || etiqueta === 'RI';
}

/**
 * Obtiene todos los tipos de diagnóstico únicos.
 * Útil para validaciones y listados.
 */
export const TODOS_LOS_TIPOS: TipoDiagnostico[] = [
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

/**
 * Obtiene todos los tipos de diagnóstico agrupados por categoría.
 * 
 * ⚠️ TODO: Validar agrupación con especificación maestra.
 */
export function getTiposPorCategoria(): {
  GV: TipoDiagnostico[];
  GN: TipoDiagnostico[];
} {
  return {
    GV: TODOS_LOS_TIPOS.filter((t) => t.startsWith('GV_')),
    GN: TODOS_LOS_TIPOS.filter((t) => t.startsWith('GN_')),
  };
}

/**
 * Obtiene todos los tipos de diagnóstico agrupados por dificultad.
 * 
 * ⚠️ TODO: Validar agrupación con especificación maestra.
 */
export function getTiposPorDificultad(): {
  FACIL: TipoDiagnostico[];
  DIFICIL: TipoDiagnostico[];
} {
  return {
    FACIL: TODOS_LOS_TIPOS.filter((t) => t.includes('FACIL')),
    DIFICIL: TODOS_LOS_TIPOS.filter((t) => t.includes('DIFICIL')),
  };
}

/**
 * Obtiene todos los tipos de diagnóstico agrupados por modalidad.
 * 
 * ⚠️ TODO: Validar agrupación con especificación maestra.
 */
export function getTiposPorModalidad(): {
  EXP: TipoDiagnostico[];
  HA: TipoDiagnostico[];
} {
  return {
    EXP: TODOS_LOS_TIPOS.filter((t) => t.includes('EXP')),
    HA: TODOS_LOS_TIPOS.filter((t) => t.includes('HA')),
  };
}

// ============================================
// VALIDACIONES
// ============================================

/**
 * Valida la integridad de las rúbricas.
 * 
 * Verifica que:
 * - Todas las subhabilidades referenciadas en habilidades generales existan
 * - Todos los tipos de diagnóstico tengan al menos una habilidad general
 * - No haya subhabilidades huérfanas (sin habilidad general)
 * 
 * @returns Array de errores encontrados (vacío si todo está correcto)
 */
export function validarIntegridadRubricas(): string[] {
  const errores: string[] = [];

  // Validar que todas las subhabilidades referenciadas existan
  for (const habilidad of HABILIDADES_GENERALES) {
    for (const subhabilidad of habilidad.subhabilidades) {
      const existe = SUBHABILIDADES.some((s) => s.key === subhabilidad.key);
      if (!existe) {
        errores.push(
          `Habilidad general "${habilidad.key}" referencia subhabilidad inexistente: "${subhabilidad.key}"`
        );
      }
    }
  }

  // Validar que todos los tipos tengan al menos una habilidad general
  for (const tipo of TODOS_LOS_TIPOS) {
    const tieneHabilidades = HABILIDADES_GENERALES.some((h) =>
      h.aplicaATipos.includes(tipo)
    );
    if (!tieneHabilidades) {
      errores.push(
        `Tipo de diagnóstico "${tipo}" no tiene habilidades generales definidas`
      );
    }
  }

  // Validar que todas las subhabilidades tengan al menos un tipo
  for (const subhabilidad of SUBHABILIDADES) {
    if (subhabilidad.aplicaATipos.length === 0) {
      errores.push(
        `Subhabilidad "${subhabilidad.key}" no tiene tipos de diagnóstico asignados`
      );
    }
  }

  return errores;
}
