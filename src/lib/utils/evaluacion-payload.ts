import type { TipoDiagnostico } from '@/lib/rubricas';
import type { Nivel } from '@/lib/rubricas';

/**
 * Payload para POST /api/evaluaciones
 */
export interface EvaluacionPayload {
  alumnoId: number;
  tipo: TipoDiagnostico;
  detalles: Array<{
    subhabilidad: string;
    nivel: Nivel;
  }>;
}

/**
 * Criterios de evaluación desde la UI
 */
export interface CriteriosEvaluacion {
  lectura: {
    fluidez: number; // 0-5 (0 = no seleccionado)
    precision: number; // 0-5 (0 = no seleccionado)
  };
  logica: {
    profundidadAnalisis: number; // 1-10
  };
  traduccion: {
    vocabularioArameo: number; // 0-5 (0 = no seleccionado)
  };
}

/**
 * Mapea valores de inputs visuales a Nivel interno (1-4).
 * 
 * ⚠️ TODO: Confirmar mapeo exacto con especificación maestra.
 */
export function mapearEstrellasANivel(estrellas: number): Nivel {
  if (estrellas <= 1) return 1;
  if (estrellas <= 2) return 1;
  if (estrellas <= 3) return 2;
  if (estrellas <= 4) return 3;
  return 4;
}

export function mapearSliderANivel(slider: number): Nivel {
  if (slider <= 3) return 1;
  if (slider <= 5) return 2;
  if (slider <= 7) return 3;
  return 4;
}

export function mapearBotonANivel(boton: number): Nivel {
  if (boton <= 1) return 1;
  if (boton <= 2) return 1;
  if (boton <= 3) return 2;
  if (boton <= 4) return 3;
  return 4;
}

/**
 * Mapea los criterios visuales a subhabilidades y niveles.
 * 
 * ⚠️ TODO: Confirmar mapeo exacto de criterios visuales a subhabilidades
 * con especificación maestra.
 */
export function mapearCriteriosASubhabilidades(
  criterios: CriteriosEvaluacion,
  subhabilidades: Array<{ key: string; label: string }>
): Array<{ subhabilidad: string; nivel: Nivel }> {
  const detalles: Array<{ subhabilidad: string; nivel: Nivel }> = [];

  // Mapear lectura - fluidez
  const subhabilidadFluidez = subhabilidades.find((s) =>
    s.key.toLowerCase().includes('fluidez') ||
    s.key.toLowerCase().includes('lectura') ||
    s.label.toLowerCase().includes('fluidez')
  );
  if (subhabilidadFluidez && criterios.lectura.fluidez > 0) {
    detalles.push({
      subhabilidad: subhabilidadFluidez.key,
      nivel: mapearEstrellasANivel(criterios.lectura.fluidez),
    });
  }

  // Mapear lectura - precisión
  const subhabilidadPrecision = subhabilidades.find((s) =>
    s.key.toLowerCase().includes('precision') ||
    s.key.toLowerCase().includes('dikduk') ||
    s.label.toLowerCase().includes('precision')
  );
  if (subhabilidadPrecision && criterios.lectura.precision > 0) {
    detalles.push({
      subhabilidad: subhabilidadPrecision.key,
      nivel: mapearEstrellasANivel(criterios.lectura.precision),
    });
  }

  // Mapear lógica - profundidad análisis
  const subhabilidadLogica = subhabilidades.find((s) =>
    s.key.toLowerCase().includes('logica') ||
    s.key.toLowerCase().includes('svarah') ||
    s.key.toLowerCase().includes('analisis') ||
    s.label.toLowerCase().includes('lógica')
  );
  if (subhabilidadLogica && criterios.logica.profundidadAnalisis > 0) {
    detalles.push({
      subhabilidad: subhabilidadLogica.key,
      nivel: mapearSliderANivel(criterios.logica.profundidadAnalisis),
    });
  }

  // Mapear traducción - vocabulario arameo
  const subhabilidadVocabulario = subhabilidades.find((s) =>
    s.key.toLowerCase().includes('vocabulario') ||
    s.key.toLowerCase().includes('arameo') ||
    s.key.toLowerCase().includes('targum') ||
    s.label.toLowerCase().includes('vocabulario')
  );
  if (subhabilidadVocabulario && criterios.traduccion.vocabularioArameo > 0) {
    detalles.push({
      subhabilidad: subhabilidadVocabulario.key,
      nivel: mapearBotonANivel(criterios.traduccion.vocabularioArameo),
    });
  }

  return detalles;
}

/**
 * Valida los criterios de evaluación
 */
export interface ValidacionResultado {
  esValido: boolean;
  errores: string[];
  advertencias: string[];
}

export function validarCriterios(criterios: CriteriosEvaluacion): ValidacionResultado {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // Validar lectura
  if (criterios.lectura.fluidez === 0) {
    errores.push('Debe seleccionar la fluidez de lectura');
  }
  if (criterios.lectura.precision === 0) {
    errores.push('Debe seleccionar la precisión de lectura');
  }

  // Validar lógica (siempre tiene valor mínimo 1, así que no necesita validación)

  // Validar traducción
  if (criterios.traduccion.vocabularioArameo === 0) {
    errores.push('Debe seleccionar el nivel de vocabulario arameo');
  }

  return {
    esValido: errores.length === 0,
    errores,
    advertencias,
  };
}

/**
 * Prepara el payload para POST /api/evaluaciones
 * 
 * ⚠️ NO envía datos, solo prepara el payload
 */
export function prepararPayload(
  alumnoId: number,
  tipo: TipoDiagnostico,
  criterios: CriteriosEvaluacion,
  subhabilidades: Array<{ key: string; label: string }>
): EvaluacionPayload | null {
  // Validar criterios
  const validacion = validarCriterios(criterios);
  if (!validacion.esValido) {
    return null;
  }

  // Mapear criterios a subhabilidades
  const detalles = mapearCriteriosASubhabilidades(criterios, subhabilidades);

  if (detalles.length === 0) {
    return null;
  }

  return {
    alumnoId,
    tipo,
    detalles,
  };
}
