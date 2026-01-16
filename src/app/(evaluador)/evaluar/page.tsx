'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSubhabilidadesPorTipo, type Nivel, type TipoDiagnostico } from '@/lib/rubricas';
import { guardarEvaluacion } from '@/app/actions/evaluador';

interface Alumno {
  id: number;
  nombre: string;
  correo: string | null;
  tipo: 'ESCUELA' | 'INDEPENDIENTE';
  status: 'ACTIVO' | 'EN_PAUSA' | 'NO_ACTIVO' | 'NIVEL_LOGRADO';
}

// Tipo importado desde rubricas.ts para mantener consistencia

export default function EvaluarPage() {
  const router = useRouter();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [alumnoId, setAlumnoId] = useState<number | ''>('');
  const [tipo, setTipo] = useState<TipoDiagnostico | ''>('');
  const [temaTalmudico, setTemaTalmudico] = useState('');
  const [niveles, setNiveles] = useState<Record<string, Nivel>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const cargarAlumnos = async () => {
    try {
      const response = await fetch('/api/alumnos');
      if (!response.ok) {
        throw new Error('Error al cargar alumnos');
      }
      const data = await response.json();
      setAlumnos(data.alumnos || []);
    } catch {
      setError('Error al cargar alumnos');
    } finally {
      setLoading(false);
    }
  };

  // Obtener subhabilidades que aplican al tipo seleccionado
  const subhabilidadesAplicables = tipo
    ? getSubhabilidadesPorTipo(tipo)
    : [];

  // Inicializar niveles cuando cambia el tipo
  useEffect(() => {
    if (tipo) {
      const subhabilidadesAplicables = getSubhabilidadesPorTipo(tipo);
      if (subhabilidadesAplicables.length > 0) {
        const nuevosNiveles: Record<string, Nivel> = {};
        subhabilidadesAplicables.forEach((sub) => {
          if (!(sub.key in niveles)) {
            nuevosNiveles[sub.key] = 1;
          } else {
            nuevosNiveles[sub.key] = niveles[sub.key];
          }
        });
        setNiveles(nuevosNiveles);
      }
    }
  }, [tipo, niveles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!alumnoId || !tipo) {
      setError('Debe seleccionar alumno y tipo de diagnóstico');
      setSaving(false);
      return;
    }

    if (subhabilidadesAplicables.length === 0) {
      setError('No hay subhabilidades configuradas para este tipo de diagnóstico');
      setSaving(false);
      return;
    }

    // Validar que todos los niveles estén definidos
    const detalles = subhabilidadesAplicables.map((sub) => ({
      subhabilidad: sub.key,
      nivel: niveles[sub.key] || 1,
    }));

    try {
      const result = await guardarEvaluacion(
        Number(alumnoId),
        tipo,
        detalles
      );

      if (!result.success) {
        setError(result.error || 'Error al guardar evaluación');
        setSaving(false);
        return;
      }

      router.push('/evaluador-dashboard');
    } catch {
      setError('Error de conexión');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Nueva Evaluación</h1>
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-[color:var(--color-background-light)] rounded animate-pulse"></div>
            <div className="h-10 bg-[color:var(--color-background-card)] rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-[color:var(--color-background-light)] rounded animate-pulse"></div>
            <div className="h-10 bg-[color:var(--color-background-card)] rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-[color:var(--color-background-light)] rounded animate-pulse"></div>
            <div className="h-10 bg-[color:var(--color-background-card)] rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nueva Evaluación</h1>

      {error && (
        <div className="mb-4 p-3 bg-[color:var(--color-alert-error-bg)] text-[color:var(--color-alert-error)] rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label htmlFor="alumno" className="block text-sm font-medium mb-1">
            Alumno *
          </label>
          <select
            id="alumno"
            value={alumnoId}
            onChange={(e) => setAlumnoId(e.target.value ? Number(e.target.value) : '')}
            required
            className="w-full px-3 py-2 border border-[color:var(--color-border-light)] rounded-md focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)]"
          >
            <option value="">Seleccione un alumno</option>
            {alumnos.map((alumno) => (
              <option key={alumno.id} value={alumno.id}>
                {alumno.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium mb-1">
            Tipo de Diagnóstico *
          </label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoDiagnostico | '')}
            required
            className="w-full px-3 py-2 border border-[color:var(--color-border-light)] rounded-md focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)]"
          >
            <option value="">Seleccione un tipo</option>
            <optgroup label="GV - Fácil">
              <option value="GV_EXP_DEF_FACIL">GV_EXP_DEF_FACIL</option>
              <option value="GV_EXP_FACIL">GV_EXP_FACIL</option>
              <option value="GV_HA_FACIL_NK">GV_HA_FACIL_NK</option>
              <option value="GV_HA_FACIL_SN">GV_HA_FACIL_SN</option>
            </optgroup>
            <optgroup label="GN - Fácil">
              <option value="GN_EXP_DEF_FACIL">GN_EXP_DEF_FACIL</option>
              <option value="GN_EXP_FACIL">GN_EXP_FACIL</option>
              <option value="GN_HA_FACIL_NK">GN_HA_FACIL_NK</option>
              <option value="GN_HA_FACIL_SN">GN_HA_FACIL_SN</option>
            </optgroup>
            <optgroup label="GV - Difícil">
              <option value="GV_EXP_DEF_DIFICIL">GV_EXP_DEF_DIFICIL</option>
              <option value="GV_EXP_DIFICIL">GV_EXP_DIFICIL</option>
              <option value="GV_HA_DIFICIL_NK">GV_HA_DIFICIL_NK</option>
              <option value="GV_HA_DIFICIL_SN">GV_HA_DIFICIL_SN</option>
            </optgroup>
            <optgroup label="GN - Difícil">
              <option value="GN_EXP_DEF_DIFICIL">GN_EXP_DEF_DIFICIL</option>
              <option value="GN_EXP_DIFICIL">GN_EXP_DIFICIL</option>
              <option value="GN_HA_DIFICIL_NK">GN_HA_DIFICIL_NK</option>
              <option value="GN_HA_DIFICIL_SN">GN_HA_DIFICIL_SN</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label htmlFor="temaTalmudico" className="block text-sm font-medium mb-1">
            Tema Talmúdico
          </label>
          <input
            id="temaTalmudico"
            type="text"
            value={temaTalmudico}
            onChange={(e) => setTemaTalmudico(e.target.value)}
            className="w-full px-3 py-2 border border-[color:var(--color-border-light)] rounded-md focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)]"
            placeholder="Tema talmúdico evaluado"
          />
        </div>

        {tipo && subhabilidadesAplicables.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Rúbrica</h2>
            <div className="space-y-4">
              {subhabilidadesAplicables.map((sub) => (
                <div key={sub.key} className="border border-[color:var(--color-border-light)] rounded-md p-4">
                  <label className="block text-sm font-medium mb-2">
                    {sub.label}
                  </label>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((nivel) => (
                      <label key={nivel} className="flex items-center">
                        <input
                          type="radio"
                          name={`nivel_${sub.key}`}
                          value={nivel}
                          checked={niveles[sub.key] === nivel}
                          onChange={() =>
                            setNiveles({ ...niveles, [sub.key]: nivel as Nivel })
                          }
                          className="mr-2"
                        />
                        <span>Nivel {nivel}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tipo && subhabilidadesAplicables.length === 0 && (
          <div className="p-3 bg-[color:var(--color-alert-warning-bg)] text-[color:var(--color-alert-warning)] rounded-md">
            No hay subhabilidades configuradas para este tipo de diagnóstico.
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || !alumnoId || !tipo}
            className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-text-inverse)] rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Evaluación'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/evaluador-dashboard')}
            className="px-4 py-2 bg-[color:var(--color-background-light)] text-[color:var(--color-text-secondary)] rounded-md hover:bg-[color:var(--color-border-light)]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}


