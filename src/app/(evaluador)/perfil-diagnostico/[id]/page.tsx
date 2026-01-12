import { mockPerfilDiagnostico } from '@/lib/types/evaluador-dtos';
import type { PerfilDiagnosticoData } from '@/lib/types/evaluador-dtos';
import { getPerfilDiagnostico } from '@/app/actions/evaluador';
import { protectPage } from '@/lib/page-protection';
import { Rol } from '@prisma/client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PerfilDiagnosticoPage({ params }: PageProps) {
  await protectPage(Rol.EVALUADOR);
  const { id } = await params;
  
  // Validar ID del alumno
  const alumnoId = parseInt(id, 10);
  if (isNaN(alumnoId)) {
    throw new Error(`ID de alumno inválido: ${id}`);
  }
  
  // Obtener datos reales del perfil de diagnóstico
  const result = await getPerfilDiagnostico(alumnoId);
  
  // ⚠️ PRODUCTION READINESS: Mocks solo permitidos en development
  // En staging/production, fallar explícitamente si no hay datos reales
  if (!result.success) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // En development, permitir fallback a mock para desarrollo local
      console.warn('[DEV] Fallback a mock data - Error:', result.error);
    } else {
      // En staging/production, fallar explícitamente
      throw new Error(
        `Error al obtener perfil de diagnóstico: ${result.error}. ` +
        'Los datos mock no están permitidos en staging/production.'
      );
    }
  }
  
  const data: PerfilDiagnosticoData =
    result.success ? result.data : mockPerfilDiagnostico;

  // Convertir habilidades a coordenadas del radar
  const radarToCoords = (value: number, index: number, radius: number = 80) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const normalizedValue = value / 100;
    const x = 100 + radius * normalizedValue * Math.cos(angle);
    const y = 100 + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };

  const habilidades = [
    data.mapaHabilidades.logica,
    data.mapaHabilidades.vocabulario,
    data.mapaHabilidades.estructura,
    data.mapaHabilidades.rashi,
    data.mapaHabilidades.arameo,
  ];

  const coords = habilidades.map((val, idx) => radarToCoords(val, idx));
  const radarPath = `M${coords[0].x} ${coords[0].y} L${coords[1].x} ${coords[1].y} L${coords[2].x} ${coords[2].y} L${coords[3].x} ${coords[3].y} L${coords[4].x} ${coords[4].y} Z`;

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'sobresaliente':
        return 'bg-green-100 text-green-700';
      case 'avanzado':
        return 'bg-blue-100 text-blue-700';
      case 'bueno':
        return 'bg-yellow-100 text-yellow-700';
      case 'regular':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-md mx-auto bg-paper shadow-2xl overflow-x-hidden border-x border-neutral-100/50">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-paper/95 backdrop-blur-sm p-4 pb-2 justify-between border-b border-neutral-200/50">
        <button className="text-slate-800 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-slate-800 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Perfil de Diagnóstico
        </h2>
        <div className="flex size-10 items-center justify-end">
          <button className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </button>
        </div>
      </div>

      {/* Student Profile Header */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <div className="relative mb-4 group cursor-pointer">
          <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-primary to-blue-300 opacity-70 blur-sm"></div>
          <div
            className="relative bg-center bg-no-repeat bg-cover rounded-full h-28 w-28 border-4 border-paper shadow-sm"
            style={{ backgroundImage: `url("${data.alumno.avatarUrl}")` }}
          ></div>
          <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-neutral-100">
            <span className="material-symbols-outlined text-primary text-[18px] block">school</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-[#0f0d1b] text-2xl font-bold leading-tight tracking-[-0.015em]">
            {data.alumno.nombre}
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-semibold mt-1">
            <span>{data.alumno.grupo}</span>
            <span className="w-1 h-1 rounded-full bg-primary"></span>
            <span>{data.alumno.anio}</span>
          </div>
          <p className="text-slate-500 text-xs font-normal mt-1">ID Estudiante: {data.alumno.idEstudiante}</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <hr className="border-neutral-200" />
      </div>

      {/* Skills Map */}
      <div className="pt-2 px-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">radar</span>
            <h2 className="text-[#0f0d1b] text-lg font-bold leading-tight">Mapa de Habilidades</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-paper border border-neutral-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-primary/5 to-transparent rounded-bl-3xl"></div>
          <div className="relative w-72 h-72 my-2">
            <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 200 200">
              <g className="stroke-neutral-200 stroke-1 fill-none">
                <path d="M100 20 L176 75 L147 165 H53 L24 75 Z"></path>
                <path d="M100 52 L145 85 L128 139 H72 L55 85 Z"></path>
                <path d="M100 84 L115 95 L109 113 H91 L85 95 Z"></path>
              </g>
              <g className="stroke-neutral-200 stroke-[0.5]">
                <line x1="100" x2="100" y1="100" y2="20"></line>
                <line x1="100" x2="176" y1="100" y2="75"></line>
                <line x1="100" x2="147" y1="100" y2="165"></line>
                <line x1="100" x2="53" y1="100" y2="165"></line>
                <line x1="100" x2="24" y1="100" y2="75"></line>
              </g>
              <path className="fill-primary/20 stroke-primary stroke-2" d={radarPath}></path>
              {coords.map((coord, idx) => (
                <circle
                  key={idx}
                  className="fill-primary"
                  cx={coord.x}
                  cy={coord.y}
                  r="3"
                ></circle>
              ))}
            </svg>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 text-xs font-bold text-slate-700 bg-paper/90 border border-neutral-100 px-2 py-0.5 rounded-md shadow-sm">
              Lógica
            </div>
            <div className="absolute top-[32%] right-0 translate-x-1 text-xs font-bold text-slate-700 bg-paper/90 border border-neutral-100 px-2 py-0.5 rounded-md shadow-sm">
              Vocabulario
            </div>
            <div className="absolute bottom-[12%] right-[5%] text-xs font-bold text-slate-700 bg-paper/90 border border-neutral-100 px-2 py-0.5 rounded-md shadow-sm">
              Estructura
            </div>
            <div className="absolute bottom-[12%] left-[5%] text-xs font-bold text-slate-700 bg-paper/90 border border-neutral-100 px-2 py-0.5 rounded-md shadow-sm">
              Rashi
            </div>
            <div className="absolute top-[32%] left-0 -translate-x-3 text-xs font-bold text-slate-700 bg-paper/90 border border-neutral-100 px-2 py-0.5 rounded-md shadow-sm">
              Arameo
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></span>
            <span className="text-xs text-slate-500 font-medium">Diagnóstico Actual</span>
          </div>
        </div>
      </div>

      {/* Evaluation History */}
      <div className="pt-2 px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">history</span>
            <h2 className="text-[#0f0d1b] text-lg font-bold leading-tight">Historial de Evaluaciones</h2>
          </div>
          <button className="text-xs font-semibold text-primary hover:underline">Ver todo</button>
        </div>
        <div className="bg-white rounded-xl shadow-paper border border-neutral-100 max-h-72 overflow-y-auto">
          <div className="divide-y divide-neutral-100">
            {data.historialEvaluaciones.map((evaluacion) => (
              <div
                key={evaluacion.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-2 flex flex-col items-center justify-center w-14 h-14 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">
                      {evaluacion.fecha.mes}
                    </span>
                    <span className="text-lg font-bold text-slate-800 leading-none">
                      {evaluacion.fecha.dia}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{evaluacion.titulo}</h3>
                    <p className="text-xs text-slate-500">{evaluacion.materia}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`inline-flex items-center justify-center w-10 h-6 ${getNivelColor(evaluacion.nivel)} text-xs font-bold rounded-full`}
                  >
                    {evaluacion.puntaje}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 capitalize">
                    {evaluacion.nivel.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Notes */}
      <div className="pt-8 px-5 pb-8">
        <div className="bg-[#F0F4FF] rounded-xl border border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-[18px] block">edit_note</span>
              </div>
              <h3 className="text-[#0f0d1b] text-base font-bold leading-tight">Notas Académicas</h3>
            </div>
            <div className="bg-white/60 p-3 rounded-lg border border-primary/5 mb-4">
              <p className="text-slate-700 text-sm font-normal leading-relaxed text-justify">
                {data.notasAcademicas.contenido}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-primary/10 pt-3">
              <div className="flex items-center gap-2">
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 border border-white shadow-sm"
                  style={{ backgroundImage: `url("${data.notasAcademicas.more.avatarUrl}")` }}
                ></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">
                    {data.notasAcademicas.more.nombre}
                  </span>
                  <span className="text-[10px] text-slate-500">{data.notasAcademicas.more.cargo}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium italic">
                Actualizado {data.notasAcademicas.fechaActualizacion}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-5 pb-6 pt-2">
        <div className="flex flex-col items-center justify-center opacity-60">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Ner LaTalmud • Sistema de Diagnóstico
          </p>
          <p className="text-[10px] text-slate-300 mt-1">v2.4.0</p>
        </div>
      </div>
    </div>
  );
}
