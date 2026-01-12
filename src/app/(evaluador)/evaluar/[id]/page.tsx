'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { guardarEvaluacion, getDatosEvaluacionActiva } from '@/app/actions/evaluador';
import { getSubhabilidadesPorTipo, type Nivel, type TipoDiagnostico } from '@/lib/rubricas';
import type { EvaluacionActivaData } from '@/lib/types/evaluador-dtos';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Mapea valores de inputs visuales a Nivel interno (1-4).
 * 
 * ⚠️ TODO: Confirmar mapeo exacto con especificación maestra.
 * 
 * La UI actual tiene:
 * - Estrellas: 1-5 (lectura: fluidez, precisión)
 * - Slider: 1-10 (lógica: profundidad análisis)
 * - Botones: 1-5 (traducción: vocabulario arameo)
 * 
 * Mapeo temporal (requiere validación):
 * - Estrellas 1-5 → Nivel 1-4 (lineal: 1→1, 2→1, 3→2, 4→3, 5→4)
 * - Slider 1-10 → Nivel 1-4 (lineal: 1-3→1, 4-5→2, 6-7→3, 8-10→4)
 * - Botones 1-5 → Nivel 1-4 (lineal: 1→1, 2→1, 3→2, 4→3, 5→4)
 */
function mapearEstrellasANivel(estrellas: number): Nivel {
  // Mapeo lineal: 1→1, 2→1, 3→2, 4→3, 5→4
  if (estrellas <= 1) return 1;
  if (estrellas <= 2) return 1;
  if (estrellas <= 3) return 2;
  if (estrellas <= 4) return 3;
  return 4;
}

function mapearSliderANivel(slider: number): Nivel {
  // Mapeo lineal: 1-3→1, 4-5→2, 6-7→3, 8-10→4
  if (slider <= 3) return 1;
  if (slider <= 5) return 2;
  if (slider <= 7) return 3;
  return 4;
}

function mapearBotonANivel(boton: number): Nivel {
  // Mapeo lineal: 1→1, 2→1, 3→2, 4→3, 5→4
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
 * 
 * REQUIERE ESPECIFICACIÓN:
 * - ¿Qué subhabilidad corresponde a "lectura.fluidez"?
 * - ¿Qué subhabilidad corresponde a "lectura.precision"?
 * - ¿Qué subhabilidad corresponde a "logica.profundidadAnalisis"?
 * - ¿Qué subhabilidad corresponde a "traduccion.vocabularioArameo"?
 * 
 * Por ahora, se mapea de forma genérica buscando por palabras clave en el nombre.
 * Esto es TEMPORAL y debe reemplazarse con mapeo canónico.
 */
function mapearCriteriosASubhabilidades(
  criterios: {
    lectura: { fluidez: number; precision: number };
    logica: { profundidadAnalisis: number };
    traduccion: { vocabularioArameo: number };
  },
  subhabilidades: Array<{ key: string; label: string }>
): Array<{ subhabilidad: string; nivel: Nivel }> {
  const detalles: Array<{ subhabilidad: string; nivel: Nivel }> = [];

  // Mapear lectura - fluidez
  // ⚠️ TODO: Definir subhabilidad exacta para fluidez de lectura
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
  // ⚠️ TODO: Definir subhabilidad exacta para precisión de lectura
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
  // ⚠️ TODO: Definir subhabilidad exacta para profundidad de análisis lógico
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
  // ⚠️ TODO: Definir subhabilidad exacta para vocabulario arameo
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

  // Si no se encontraron mapeos, usar todas las subhabilidades disponibles
  // asignando valores basados en el promedio de los criterios
  // ⚠️ TODO: Eliminar este fallback cuando se defina el mapeo canónico
  if (detalles.length === 0 && subhabilidades.length > 0) {
    // Calcular promedio de criterios para asignar a subhabilidades sin mapeo
    const promedioCriterios =
      (criterios.lectura.fluidez +
        criterios.lectura.precision +
        criterios.logica.profundidadAnalisis / 2 +
        criterios.traduccion.vocabularioArameo) /
      4;
    
    const nivelPromedio = mapearEstrellasANivel(Math.round(promedioCriterios));

    // Asignar a todas las subhabilidades disponibles
    for (const subhabilidad of subhabilidades) {
      detalles.push({
        subhabilidad: subhabilidad.key,
        nivel: nivelPromedio,
      });
    }
  }

  return detalles;
}

export default function EvaluacionActivaPage({ params }: PageProps) {
  const router = useRouter();
  const [alumnoId, setAlumnoId] = useState<number | null>(null);
  const [tipoDiagnostico, setTipoDiagnostico] = useState<TipoDiagnostico | null>(null);
  const [subhabilidades, setSubhabilidades] = useState<Array<{ key: string; label: string }>>([]);
  const [data, setData] = useState<EvaluacionActivaData | null>(null);
  const [notasRapidas, setNotasRapidas] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    async function cargarDatos() {
      try {
        const { id } = await params;
        const alumnoIdNum = parseInt(id, 10);

        if (isNaN(alumnoIdNum)) {
          setError('ID de alumno inválido');
          setLoading(false);
          return;
        }

        setAlumnoId(alumnoIdNum);

        // Obtener datos de la evaluación
        const result = await getDatosEvaluacionActiva(alumnoIdNum);

        if (!result.success) {
          setError(result.error || 'Error al cargar datos');
          setLoading(false);
          return;
        }

        setTipoDiagnostico(result.data.tipoDiagnostico as TipoDiagnostico);
        setSubhabilidades(result.data.subhabilidades);

        // Inicializar datos de evaluación
        setData({
          alumno: result.data.alumno,
          tiempoTranscurrido: '00:00',
          criterios: {
            lectura: {
              fluidez: 0,
              precision: 0,
            },
            logica: {
              profundidadAnalisis: 1,
            },
            traduccion: {
              vocabularioArameo: 0,
            },
          },
          notasRapidas: '',
          notasRapidasSugeridas: [
            '+ Falta fluidez',
            '+ Buen vocabulario',
            '+ Excelente lógica',
          ],
        });
      } catch (err) {
        setError('Error al cargar datos de evaluación');
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [params]);

  const handleStarClick = (section: 'lectura', field: 'fluidez' | 'precision', value: number) => {
    if (!data) return;
    setData((prev) => ({
      ...prev!,
      criterios: {
        ...prev!.criterios,
        lectura: {
          ...prev!.criterios.lectura,
          [field]: value,
        },
      },
    }));
  };

  const handleSliderChange = (value: number) => {
    if (!data) return;
    setData((prev) => ({
      ...prev!,
      criterios: {
        ...prev!.criterios,
        logica: {
          profundidadAnalisis: value,
        },
      },
    }));
  };

  const handleVocabularioClick = (value: number) => {
    if (!data) return;
    setData((prev) => ({
      ...prev!,
      criterios: {
        ...prev!.criterios,
        traduccion: {
          vocabularioArameo: value,
        },
      },
    }));
  };

  const handleNotaRapidaClick = (nota: string) => {
    setNotasRapidas((prev) => (prev ? `${prev} ${nota}` : nota));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSuccess(false);

    if (!alumnoId || !tipoDiagnostico || !data) {
      setError('Datos incompletos');
      setSaving(false);
      return;
    }

    // Validar que los criterios estén completos
    if (
      data.criterios.lectura.fluidez === 0 ||
      data.criterios.lectura.precision === 0 ||
      data.criterios.traduccion.vocabularioArameo === 0
    ) {
      setError('Debe completar todos los criterios de evaluación');
      setSaving(false);
      return;
    }

    // Mapear criterios visuales a subhabilidades y niveles
    const detalles = mapearCriteriosASubhabilidades(data.criterios, subhabilidades);

    // Validar que todas las subhabilidades requeridas estén evaluadas
    if (detalles.length === 0) {
      setError('No se pudieron mapear los criterios a subhabilidades');
      setSaving(false);
      return;
    }

    // Validar que todas las subhabilidades del tipo estén presentes
    const subhabilidadesRequeridas = getSubhabilidadesPorTipo(tipoDiagnostico);
    const subhabilidadesEvaluadas = new Set(detalles.map((d) => d.subhabilidad));
    const faltantes = subhabilidadesRequeridas.filter(
      (s) => !subhabilidadesEvaluadas.has(s.key)
    );

    if (faltantes.length > 0) {
      // ⚠️ TODO: Decidir si es obligatorio evaluar todas las subhabilidades
      // Por ahora, solo se advierte pero se permite continuar
      console.warn('Subhabilidades no evaluadas:', faltantes.map((s) => s.label));
    }

    // Validar que todos los niveles estén en rango (1-4)
    const nivelesInvalidos = detalles.filter((d) => d.nivel < 1 || d.nivel > 4);
    if (nivelesInvalidos.length > 0) {
      setError('Algunos niveles están fuera del rango válido (1-4)');
      setSaving(false);
      return;
    }

    try {
      const result = await guardarEvaluacion(
        alumnoId,
        tipoDiagnostico,
        detalles.map((d) => ({
          subhabilidad: d.subhabilidad,
          nivel: d.nivel,
        }))
      );

      if (!result.success) {
        setError(result.error || 'Error al guardar evaluación');
        setSaving(false);
        return;
      }

      // Éxito: mostrar confirmación y redirigir
      setSuccess(true);
      setSaving(false);

      // Redirigir al perfil de diagnóstico del alumno después de 1.5 segundos
      setTimeout(() => {
        router.push(`/perfil-diagnostico/${alumnoId}`);
      }, 1500);
    } catch (err) {
      setError('Error de conexión al guardar evaluación');
      setSaving(false);
    }
  };

  const renderStars = (section: 'lectura', field: 'fluidez' | 'precision', currentValue: number) => {
    return (
      <div className="flex justify-between items-center gap-1 px-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className="group p-1 focus:outline-none"
            type="button"
            onClick={() => handleStarClick(section, field, star)}
            disabled={saving}
          >
            <span
              className={`material-symbols-outlined text-[32px] transition-transform active:scale-90 ${
                star <= currentValue ? 'text-[#fbbf24] fill-1' : 'text-slate-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              star
            </span>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-paper shadow-2xl overflow-x-hidden border-x border-neutral-100/50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando evaluación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-paper shadow-2xl overflow-x-hidden border-x border-neutral-100/50">
        <div className="flex items-center justify-center h-screen px-5">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-4 block">error</span>
            <p className="text-red-600 font-semibold mb-2">Error</p>
            <p className="text-slate-600 text-sm">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-paper shadow-2xl overflow-x-hidden border-x border-neutral-100/50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-paper/95 backdrop-blur-md px-4 py-3 justify-between border-b border-neutral-200/60 shadow-sm">
        <button
          onClick={() => router.back()}
          className="text-slate-600 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-slate-800 text-base font-bold leading-tight">Evaluación Activa</h2>
          <div className="flex items-center gap-1 text-primary text-xs font-medium bg-primary/5 px-2 py-0.5 rounded-full mt-0.5">
            <span className="material-symbols-outlined text-[14px] fill-1">timer</span>
            <span>{data.tiempoTranscurrido}</span>
          </div>
        </div>
        <button className="text-slate-600 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors active:scale-95">
          <span className="material-symbols-outlined text-[24px]">pause</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mx-5 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
            <p className="text-green-700 text-sm font-medium">
              Evaluación guardada exitosamente. Redirigiendo...
            </p>
          </div>
        </div>
      )}

      {/* Student Info */}
      <div className="px-5 pt-6 pb-4">
        <div className="bg-white rounded-2xl p-4 shadow-paper border border-neutral-100 flex items-center gap-4">
          <div className="relative shrink-0">
            <div
              className="size-16 rounded-full bg-cover bg-center border-2 border-white shadow-md"
              style={{ backgroundImage: `url("${data.alumno.avatarUrl}")` }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-green-100 border border-white p-1 rounded-full">
              <span className="material-symbols-outlined text-green-600 text-[14px] block font-bold">
                check
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[#0f0d1b] text-lg font-bold truncate">{data.alumno.nombre}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
              <span className="bg-blue-50 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {data.alumno.grupo}
              </span>
              <span className="truncate">
                {data.alumno.sugia}, {data.alumno.perek}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form className="px-5 space-y-5" onSubmit={handleSubmit}>
        {/* Lectura */}
        <div className="bg-white rounded-2xl p-5 shadow-paper border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-50 p-2 rounded-lg">
                <span className="material-symbols-outlined text-orange-600 text-[20px]">menu_book</span>
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Lectura <span className="text-slate-400 text-sm font-normal">(Kriá)</span>
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">
              Peso: 30%
            </span>
          </div>
          <div className="mb-5">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-slate-700">Fluidez</label>
              <span className="text-xs font-medium text-primary">
                {data.criterios.lectura.fluidez === 5
                  ? 'Excelente'
                  : data.criterios.lectura.fluidez === 4
                    ? 'Muy Bueno'
                    : data.criterios.lectura.fluidez === 3
                      ? 'Bueno'
                      : data.criterios.lectura.fluidez === 2
                        ? 'Regular'
                        : 'Seleccionar'}
              </span>
            </div>
            {renderStars('lectura', 'fluidez', data.criterios.lectura.fluidez)}
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-slate-700">Precisión (Dikduk)</label>
              <span className="text-xs font-medium text-slate-400">
                {data.criterios.lectura.precision > 0
                  ? data.criterios.lectura.precision === 5
                    ? 'Excelente'
                    : data.criterios.lectura.precision === 4
                      ? 'Muy Bueno'
                      : data.criterios.lectura.precision === 3
                        ? 'Bueno'
                        : data.criterios.lectura.precision === 2
                          ? 'Regular'
                          : 'Básico'
                  : 'Seleccionar'}
              </span>
            </div>
            {renderStars('lectura', 'precision', data.criterios.lectura.precision)}
          </div>
        </div>

        {/* Lógica */}
        <div className="bg-white rounded-2xl p-5 shadow-paper border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <span className="material-symbols-outlined text-indigo-600 text-[20px]">
                  psychology
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Lógica <span className="text-slate-400 text-sm font-normal">(Svará)</span>
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">
              Peso: 50%
            </span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between items-end mb-4">
              <label className="text-sm font-semibold text-slate-700">Profundidad del Análisis</label>
              <span className="text-sm font-bold text-primary">
                {data.criterios.logica.profundidadAnalisis}/10
              </span>
            </div>
            <div className="relative w-full h-8 flex items-center">
              <input
                className="w-full z-20 focus:outline-none"
                type="range"
                min="1"
                max="10"
                value={data.criterios.logica.profundidadAnalisis}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                disabled={saving}
              />
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full pointer-events-none z-10"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full pointer-events-none z-10"
                style={{
                  width: `${(data.criterios.logica.profundidadAnalisis / 10) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
              <span>Superficial</span>
              <span>Profundo</span>
            </div>
          </div>
        </div>

        {/* Traducción */}
        <div className="bg-white rounded-2xl p-5 shadow-paper border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-teal-50 p-2 rounded-lg">
                <span className="material-symbols-outlined text-teal-600 text-[20px]">translate</span>
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Traducción <span className="text-slate-400 text-sm font-normal">(Targum)</span>
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-5 mb-1">
              <label className="text-sm font-semibold text-slate-700 block mb-3">
                Vocabulario Arameo
              </label>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleVocabularioClick(val)}
                    disabled={saving}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg hover:bg-white hover:shadow-sm transition-all ${
                      data.criterios.traduccion.vocabularioArameo === val
                        ? 'text-primary bg-white shadow-sm ring-1 ring-black/5 font-bold'
                        : 'text-slate-500'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notas Rápidas */}
        <div className="bg-white rounded-2xl p-5 shadow-paper border border-neutral-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">edit_note</span>
            <label className="text-sm font-bold text-slate-800">Notas Rápidas</label>
          </div>
          <textarea
            className="w-full min-h-[100px] p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all resize-none placeholder:text-slate-400"
            placeholder="Escribe observaciones clave aquí..."
            value={notasRapidas}
            onChange={(e) => setNotasRapidas(e.target.value)}
            disabled={saving}
          ></textarea>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {data.notasRapidasSugeridas.map((nota, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleNotaRapidaClick(nota)}
                disabled={saving}
                className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nota}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-6 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleSubmit}
          disabled={saving || success}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.99] active:shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : success ? (
            <>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Guardado</span>
            </>
          ) : (
            <>
              <span>Finalizar Evaluación</span>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
