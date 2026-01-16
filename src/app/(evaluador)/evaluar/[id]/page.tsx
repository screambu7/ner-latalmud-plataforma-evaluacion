'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getDatosEvaluacionActiva, guardarEvaluacionActiva } from '@/app/actions/evaluador';
import type { TipoDiagnostico } from '@/lib/rubricas';
import type { EvaluacionActivaData } from '@/lib/types/evaluador-dtos';
import {
  prepararPayload,
  validarCriterios,
  type EvaluacionPayload,
} from '@/lib/utils/evaluacion-payload';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EvaluacionActivaPage({ params }: PageProps) {
  const router = useRouter();
  const [alumnoId, setAlumnoId] = useState<number | null>(null);
  const [tipoDiagnostico, setTipoDiagnostico] = useState<TipoDiagnostico | null>(null);
  const [subhabilidades, setSubhabilidades] = useState<Array<{ key: string; label: string }>>([]);
  const [data, setData] = useState<EvaluacionActivaData | null>(null);
  const [notasRapidas, setNotasRapidas] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Estado para validaciones visuales
  const [validacionesTocadas, setValidacionesTocadas] = useState({
    lecturaFluidez: false,
    lecturaPrecision: false,
    traduccionVocabulario: false,
  });

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
      } catch {
        setError('Error al cargar datos de evaluación');
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [params]);

  // Handlers con estado controlado y validaciones visuales
  const handleStarClick = (section: 'lectura', field: 'fluidez' | 'precision', value: number) => {
    if (!data) return;
    
    // Marcar como tocado para validación visual
    if (field === 'fluidez') {
      setValidacionesTocadas((prev) => ({ ...prev, lecturaFluidez: true }));
    } else if (field === 'precision') {
      setValidacionesTocadas((prev) => ({ ...prev, lecturaPrecision: true }));
    }
    
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
    
    // Marcar como tocado para validación visual
    setValidacionesTocadas((prev) => ({ ...prev, traduccionVocabulario: true }));
    
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

  // Validación en tiempo real (solo visual)
  const validacion = useMemo(() => {
    if (!data) return null;
    return validarCriterios(data.criterios);
  }, [data]);

  // Preparar payload (NO se envía aún)
  const payload: EvaluacionPayload | null = useMemo(() => {
    if (!alumnoId || !tipoDiagnostico || !data) return null;
    return prepararPayload(alumnoId, tipoDiagnostico, data.criterios, subhabilidades);
  }, [alumnoId, tipoDiagnostico, data, subhabilidades]);

  // Verificar si el formulario está completo y válido
  const isFormValid = payload !== null && validacion?.esValido === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!alumnoId || !tipoDiagnostico || !data) {
      setError('Datos incompletos');
      return;
    }

    // Validar criterios
    const validacionResult = validarCriterios(data.criterios);
    if (!validacionResult.esValido) {
      setError(validacionResult.errores.join('. '));
      // Marcar todos los campos como tocados para mostrar validaciones
      setValidacionesTocadas({
        lecturaFluidez: true,
        lecturaPrecision: true,
        traduccionVocabulario: true,
      });
      return;
    }

    // Preparar payload
    const payloadPreparado = prepararPayload(alumnoId, tipoDiagnostico, data.criterios, subhabilidades);
    
    if (!payloadPreparado) {
      setError('No se pudieron mapear los criterios a subhabilidades');
      return;
    }

    // Guardar evaluación
    setSaving(true);
    setError('');

    try {
      const result = await guardarEvaluacionActiva(payloadPreparado);

      if (!result.success) {
        // Mapear errores de campo si existen
        if (result.fieldErrors) {
          const erroresTexto = Object.values(result.fieldErrors).join('. ');
          setError(erroresTexto || result.error || 'Error al guardar evaluación');
        } else {
          setError(result.error || 'Error al guardar evaluación');
        }
        setSaving(false);
        return;
      }

      // Éxito: redirigir al perfil de diagnóstico
      router.push(`/perfil-diagnostico/${alumnoId}`);
    } catch (err) {
      console.error('Error al guardar evaluación:', err);
      setError('Error de conexión al guardar evaluación');
      setSaving(false);
    }
  };

  // Helper para obtener estado de validación visual
  const getValidationState = (field: 'lecturaFluidez' | 'lecturaPrecision' | 'traduccionVocabulario', value: number) => {
    const isTouched = validacionesTocadas[field];
    const isEmpty = value === 0;
    const showError = isTouched && isEmpty;
    return { isTouched, isEmpty, showError };
  };

  const renderStars = (
    section: 'lectura',
    field: 'fluidez' | 'precision',
    currentValue: number
  ) => {
    const validationKey = field === 'fluidez' ? 'lecturaFluidez' : 'lecturaPrecision';
    const validation = getValidationState(validationKey, currentValue);

    return (
      <div>
        <div className="flex justify-between items-center gap-1 px-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="group p-1 focus:outline-none"
              type="button"
              onClick={() => handleStarClick(section, field, star)}
            >
              <span
                className={`material-symbols-outlined text-[32px] transition-transform active:scale-90 ${
                  star <= currentValue ? 'text-[#fbbf24] fill-1' : 'text-slate-200'
                }`}
              >
                star
              </span>
            </button>
          ))}
        </div>
        {validation.showError && (
          <p className="text-xs text-[color:var(--color-alert-error)] mt-1 px-1">Este campo es requerido</p>
        )}
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
            <span className="material-symbols-outlined text-[color:var(--color-alert-error)] text-5xl mb-4 block">error</span>
            <p className="text-[color:var(--color-alert-error)] font-semibold mb-2">Error</p>
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
        <div className="mx-5 mt-4 p-3 bg-[color:var(--color-alert-error-bg)] border border-[color:var(--color-alert-error-border)] rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[color:var(--color-alert-error)] text-[18px]">error</span>
            <p className="text-[color:var(--color-alert-error)] text-sm font-medium">{error}</p>
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
            <div className="absolute -bottom-1 -right-1 bg-[color:var(--color-alert-success-bg)] border border-white p-1 rounded-full">
              <span className="material-symbols-outlined text-[color:var(--color-alert-success)] text-[14px] block font-bold">
                check
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[#0f0d1b] text-lg font-bold truncate">{data.alumno.nombre}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
              <span className="bg-[color:var(--color-alert-info-bg)] text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {data.alumno.grupo}
              </span>
              <span className="truncate">
                {data.alumno.sugia}, {data.alumno.perek}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form id="evaluacion-form" className="px-5 space-y-5" onSubmit={handleSubmit}>
        {/* Lectura */}
        <div
          className={`bg-white rounded-2xl p-5 shadow-paper border transition-colors ${
            validacion && !validacion.esValido && (validacionesTocadas.lecturaFluidez || validacionesTocadas.lecturaPrecision)
              ? 'border-[color:var(--color-alert-error-border)]'
              : 'border-neutral-100'
          }`}
        >
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
              <label className="text-sm font-semibold text-slate-700">
                Fluidez
                {getValidationState('lecturaFluidez', data.criterios.lectura.fluidez).showError && (
                  <span className="text-[color:var(--color-alert-error)] ml-1">*</span>
                )}
              </label>
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
              <label className="text-sm font-semibold text-slate-700">
                Precisión (Dikduk)
                {getValidationState('lecturaPrecision', data.criterios.lectura.precision).showError && (
                  <span className="text-[color:var(--color-alert-error)] ml-1">*</span>
                )}
              </label>
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
        <div
          className={`bg-white rounded-2xl p-5 shadow-paper border transition-colors ${
            validacion && !validacion.esValido && validacionesTocadas.traduccionVocabulario
              ? 'border-[color:var(--color-alert-error-border)]'
              : 'border-neutral-100'
          }`}
        >
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
                {getValidationState('traduccionVocabulario', data.criterios.traduccion.vocabularioArameo).showError && (
                  <span className="text-[color:var(--color-alert-error)] ml-1">*</span>
                )}
              </label>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleVocabularioClick(val)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg hover:bg-white hover:shadow-sm transition-all ${
                      data.criterios.traduccion.vocabularioArameo === val
                        ? 'text-primary bg-white shadow-sm ring-1 ring-black/5 font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              {getValidationState('traduccionVocabulario', data.criterios.traduccion.vocabularioArameo).showError && (
                <p className="text-xs text-[color:var(--color-alert-error)] mt-1">Este campo es requerido</p>
              )}
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
          ></textarea>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {data.notasRapidasSugeridas.map((nota, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleNotaRapidaClick(nota)}
                className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors border border-slate-200"
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
          type="submit"
          form="evaluacion-form"
          disabled={!isFormValid || saving}
          className={`w-full text-white font-bold text-lg h-14 rounded-xl shadow-lg active:scale-[0.99] active:shadow-sm transition-all flex items-center justify-center gap-2 ${
            isFormValid && !saving
              ? 'bg-primary hover:bg-[color:var(--color-primary-dark)] shadow-primary/30'
              : 'bg-[color:var(--color-border-medium)] cursor-not-allowed'
          }`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span>Finalizar Evaluación</span>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </>
          )}
        </button>
        {!isFormValid && validacion && validacion.errores.length > 0 && (
          <p className="text-xs text-slate-500 text-center mt-2">
            Completa todos los campos requeridos
          </p>
        )}
      </div>
    </div>
  );
}
