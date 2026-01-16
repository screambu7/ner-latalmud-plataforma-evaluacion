import type { ReporteProgresoData } from '@/lib/types/evaluador-dtos';
import { calcularCoordenadasRadar, generarRadarPath } from '@/lib/utils/radar-chart';

interface ReporteProgresoViewProps {
  data: ReporteProgresoData;
  radarCoordinates?: Array<{ x: number; y: number }>;
  radarPath?: string;
  // Secciones opcionales
  showHeader?: boolean;
  showDownloadButton?: boolean;
  showFooter?: boolean;
  // Modo PDF (oculta elementos interactivos)
  isPDFMode?: boolean;
}

/**
 * ReporteProgresoView - Vista del reporte de progreso
 * 
 * Componente Server Component PDF-ready:
 * - Sin dependencias de window
 * - Sin interacciones
 * - Renderizable completamente sin JavaScript
 * - Estilos exactos mantenidos
 */
export function ReporteProgresoView({
  data,
  radarCoordinates = [],
  radarPath = '',
  showHeader = true,
  showDownloadButton = false,
  showFooter = true,
  isPDFMode = false,
}: ReporteProgresoViewProps) {
  // Calcular coordenadas si no vienen pre-calculadas
  const habilidades = [
    data.habilidadesClave.logica,
    data.habilidadesClave.vocabulario,
    data.habilidadesClave.estructura,
    data.habilidadesClave.rashi,
    data.habilidadesClave.arameo,
  ];

  const finalRadarCoordinates = radarCoordinates.length > 0 
    ? radarCoordinates 
    : calcularCoordenadasRadar(habilidades);
  
  const finalRadarPath = radarPath || generarRadarPath(finalRadarCoordinates);

  // Calcular puntos del gráfico de progreso
  // Distribuir puntos uniformemente en el ancho disponible (300px)
  const maxWidth = 300;
  const startX = 30;
  const endX = 270;
  const totalPoints = data.progresoSemestral.length;
  
  const progresoPoints = totalPoints > 0
    ? data.progresoSemestral.map((item, idx) => {
        // Distribuir puntos uniformemente
        const x = totalPoints === 1 
          ? startX + (endX - startX) / 2
          : startX + (idx / (totalPoints - 1)) * (endX - startX);
        // Normalizar valor a rango 0-120 (para que quepa en el viewBox)
        const normalizedValor = Math.min(Math.max(item.valor, 0), 120);
        const y = 130 - normalizedValor;
        return { x, y, mes: item.mes, valor: item.valor };
      })
    : [];

  const progresoPath = progresoPoints.length > 0
    ? progresoPoints
        .map((point, idx) => idx === 0 ? `M${point.x} ${point.y}` : `L${point.x} ${point.y}`)
        .join(' ')
    : '';

  const progresoAreaPath = progresoPoints.length > 0
    ? `${progresoPath} V130 H${progresoPoints[0].x} Z`
    : '';

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-md mx-auto bg-paper shadow-2xl overflow-x-hidden border-x border-neutral-100/50">
      {/* Top Navigation - Opcional */}
      {showHeader && !isPDFMode && (
        <div className="sticky top-0 z-50 flex items-center bg-paper/95 backdrop-blur-sm p-4 pb-2 justify-between border-b border-neutral-200/50">
          <button className="text-slate-800 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="text-slate-800 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Reporte Académico
          </h2>
          <div className="flex size-10 items-center justify-end">
            <button className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
              <span className="material-symbols-outlined text-[24px]">more_vert</span>
            </button>
          </div>
        </div>
      )}

      {/* Download Action - Opcional */}
      {showDownloadButton && !isPDFMode && (
        <div className="px-5 pt-6 pb-2">
          {/* El botón se renderiza desde el componente cliente separado */}
        </div>
      )}

      {/* Student Profile Header */}
      <div className="flex flex-col items-center pt-6 pb-6 px-4">
        <div className="relative mb-4">
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
          <p className="text-primary font-medium text-sm tracking-wide">
            {data.alumno.grupo} - {data.alumno.anio}{' '}
            <span className="mx-1 opacity-50">|</span> Ner LaTalmud
          </p>
          <p className="text-slate-500 text-xs font-normal">ID Estudiante: {data.alumno.idEstudiante}</p>
        </div>
      </div>

      <div className="px-4">
        <hr className="border-neutral-200" />
      </div>

      {/* Executive Summary */}
      <div className="pt-6 px-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary text-[20px]">article</span>
          <h2 className="text-[#0f0d1b] text-lg font-bold leading-tight">Resumen Ejecutivo</h2>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-paper border border-neutral-100">
          <p className="text-slate-700 text-[15px] font-normal leading-relaxed text-justify font-body">
            {data.resumenEjecutivo}
          </p>
        </div>
      </div>

      {/* Skills Radar Chart */}
      <div className="pt-8 px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">radar</span>
            <h2 className="text-[#0f0d1b] text-lg font-bold leading-tight">Habilidades Clave</h2>
          </div>
          <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
            Nivel {data.nivel === 'avanzado' ? 'Avanzado' : data.nivel === 'intermedio' ? 'Intermedio' : 'Básico'}
          </span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-paper border border-neutral-100 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 200 200">
              {/* Background Grid (Pentagon) */}
              <g className="stroke-neutral-200 stroke-1 fill-none">
                <path d="M100 20 L176 75 L147 165 H53 L24 75 Z"></path>
                <path d="M100 52 L145 85 L128 139 H72 L55 85 Z"></path>
                <path d="M100 84 L115 95 L109 113 H91 L85 95 Z"></path>
              </g>
              {/* Axes */}
              <g className="stroke-neutral-200 stroke-[0.5]">
                <line x1="100" x2="100" y1="100" y2="20"></line>
                <line x1="100" x2="176" y1="100" y2="75"></line>
                <line x1="100" x2="147" y1="100" y2="165"></line>
                <line x1="100" x2="53" y1="100" y2="165"></line>
                <line x1="100" x2="24" y1="100" y2="75"></line>
              </g>
              {/* Data Shape */}
              {finalRadarPath && (
                <path
                  className="fill-primary/20 stroke-primary stroke-2"
                  d={finalRadarPath}
                ></path>
              )}
              {/* Data Points */}
              {finalRadarCoordinates.map((coord, idx) => (
                <circle
                  key={idx}
                  className="fill-primary"
                  cx={coord.x}
                  cy={coord.y}
                  r="3"
                ></circle>
              ))}
            </svg>
            {/* Labels */}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">
              Lógica
            </span>
            <span className="absolute top-[35%] right-0 translate-x-1 text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">
              Vocabulario
            </span>
            <span className="absolute bottom-[15%] right-[10%] text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">
              Estructura
            </span>
            <span className="absolute bottom-[15%] left-[10%] text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">
              Rashi
            </span>
            <span className="absolute top-[35%] left-0 -translate-x-3 text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">
              Arameo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            Datos basados en evaluaciones mensuales.
          </p>
        </div>
      </div>

      {/* Timeline Progress */}
      {data.progresoSemestral.length > 0 && (
        <div className="pt-8 px-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">monitoring</span>
            <h2 className="text-[#0f0d1b] text-lg font-bold leading-tight">Progreso Semestral</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-paper border border-neutral-100">
            <div className="w-full h-40">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                {/* Grid Lines */}
                <line className="stroke-neutral-100 stroke-1" x1="0" x2="300" y1="130" y2="130"></line>
                <line className="stroke-neutral-100 stroke-1" x1="0" x2="300" y1="90" y2="90"></line>
                <line className="stroke-neutral-100 stroke-1" x1="0" x2="300" y1="50" y2="50"></line>
                <line className="stroke-neutral-100 stroke-1" x1="0" x2="300" y1="10" y2="10"></line>
                {/* Path */}
                {progresoPath && (
                  <path
                    className="fill-none stroke-primary stroke-3"
                    d={progresoPath}
                  ></path>
                )}
                {/* Area Gradient - ID único para evitar conflictos en múltiples reportes */}
                <defs>
                  <linearGradient id={`gradientArea-${data.alumno.id.replace(/[^a-zA-Z0-9]/g, '-')}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#000000" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                {progresoAreaPath && (
                  <path
                    d={progresoAreaPath}
                    fill={`url(#gradientArea-${data.alumno.id.replace(/[^a-zA-Z0-9]/g, '-')})`}
                  ></path>
                )}
                {/* Dots */}
                {progresoPoints.map((point, idx) => (
                  <circle
                    key={idx}
                    className="fill-white stroke-primary stroke-2"
                    cx={point.x}
                    cy={point.y}
                    r="4"
                  ></circle>
                ))}
                {/* Labels X Axis */}
                {progresoPoints.map((point, idx) => {
                  const isLast = idx === progresoPoints.length - 1;
                  return (
                    <text
                      key={idx}
                      className={`fill-slate-400 text-[10px] font-sans ${isLast ? 'font-bold text-primary' : ''}`}
                      textAnchor="middle"
                      x={point.x}
                      y="145"
                    >
                      {point.mes}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Teacher's Recommendation */}
      <div className="pt-8 px-5 pb-8">
        <div className="bg-[#F0F4FF] rounded-xl border border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-[18px] block">lightbulb</span>
              </div>
              <h3 className="text-[#0f0d1b] text-base font-bold leading-tight">
                Recomendación del Moré
              </h3>
            </div>
            <p className="text-slate-700 text-sm font-normal leading-relaxed mb-4">
              {data.recomendacionMore.contenido}
            </p>
            <div className="flex items-center gap-2">
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 border border-white shadow-sm"
                style={{ backgroundImage: `url("${data.recomendacionMore.more.avatarUrl}")` }}
              ></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">
                  {data.recomendacionMore.more.nombre}
                </span>
                <span className="text-[10px] text-slate-500">{data.recomendacionMore.more.cargo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Footer - Opcional */}
      {showFooter && (
        <div className="mt-auto px-5 pb-10 pt-4 border-t border-neutral-200">
          <div className="flex flex-col items-center justify-center opacity-80">
            <div className="w-24 h-24 mb-4 relative opacity-90">
              <svg className="w-full h-full fill-primary/10 stroke-primary/30 stroke-1" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48"></circle>
                <circle
                  className="stroke-dashed stroke-primary/20"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeDasharray="4 2"
                ></circle>
                <path className="fill-primary/20" d="M50 25 L60 40 L50 65 L40 40 Z"></path>
                <text
                  className="text-[8px] fill-primary font-serif font-bold tracking-widest uppercase"
                  style={{ fontSize: '8px' }}
                  textAnchor="middle"
                  x="50"
                  y="85"
                >
                  Ner LaTalmud
                </text>
              </svg>
            </div>
            <div className="w-48 border-b border-slate-300 mb-2"></div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Firma Autorizada
            </p>
            <p className="text-[10px] text-slate-300 mt-1">Generado el {data.fechaGeneracion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
