'use client';

import { useState } from 'react';
import { mockCentroReportes } from '@/lib/types/evaluador-dtos';
import type { CentroReportesData, TipoReporte } from '@/lib/types/evaluador-dtos';

export default function CentroReportesPage() {
  const [data, setData] = useState<CentroReportesData>(mockCentroReportes);

  // TODO: Reemplazar con datos reales de API/DB

  const handleTipoReporteChange = (tipo: TipoReporte) => {
    setData((prev) => ({ ...prev, tipoReporte: tipo }));
  };

  const handleOpcionToggle = (id: string) => {
    setData((prev) => ({
      ...prev,
      opcionesContenido: prev.opcionesContenido.map((opcion) =>
        opcion.id === id ? { ...opcion, seleccionado: !opcion.seleccionado } : opcion
      ),
    }));
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-paper shadow-2xl overflow-x-hidden border-x border-neutral-100/50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-paper/95 backdrop-blur-sm p-4 pb-2 justify-between border-b border-neutral-200/50">
        <button className="text-slate-800 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-slate-800 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Centro de Reportes
        </h2>
        <div className="flex size-10 items-center justify-end">
          <button className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </button>
        </div>
      </div>

      {/* Grupo Selection */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Seleccionar Grupo
          </label>
          <span className="text-xs font-medium text-primary cursor-pointer hover:underline">
            Ver todos
          </span>
        </div>
        <div className="relative group cursor-pointer">
          <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:border-primary/50 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                {data.grupoSeleccionado.inicial}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">
                  {data.grupoSeleccionado.nombre} - {data.grupoSeleccionado.anio}
                </h3>
                <p className="text-xs text-slate-500">
                  {data.grupoSeleccionado.cantidadEstudiantes} Estudiantes • {data.grupoSeleccionado.more}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">expand_more</span>
          </div>
        </div>
      </div>

      {/* Tipo de Reporte */}
      <div className="px-5 pt-8">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 block">
          Tipo de Reporte
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleTipoReporteChange('individual')}
            className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
              data.tipoReporte === 'individual'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            {data.tipoReporte === 'individual' && (
              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]">check</span>
              </div>
            )}
            <span
              className={`material-symbols-outlined text-[28px] mb-2 ${
                data.tipoReporte === 'individual' ? 'text-primary' : 'text-slate-400'
              }`}
            >
              person_outline
            </span>
            <span
              className={`font-bold text-sm ${
                data.tipoReporte === 'individual' ? 'text-slate-900' : 'text-slate-700'
              }`}
            >
              Individual
            </span>
            <span
              className={`text-[10px] leading-tight mt-1 ${
                data.tipoReporte === 'individual' ? 'text-slate-600' : 'text-slate-500'
              }`}
            >
              Detalle por alumno
            </span>
          </button>

          <button
            onClick={() => handleTipoReporteChange('resumen_grupal')}
            className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
              data.tipoReporte === 'resumen_grupal'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            {data.tipoReporte === 'resumen_grupal' && (
              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]">check</span>
              </div>
            )}
            <span
              className={`material-symbols-outlined text-[28px] mb-2 ${
                data.tipoReporte === 'resumen_grupal' ? 'text-primary' : 'text-slate-400'
              }`}
            >
              groups
            </span>
            <span
              className={`font-bold text-sm ${
                data.tipoReporte === 'resumen_grupal' ? 'text-slate-900' : 'text-slate-700'
              }`}
            >
              Resumen Grupal
            </span>
            <span
              className={`text-[10px] leading-tight mt-1 ${
                data.tipoReporte === 'resumen_grupal' ? 'text-slate-600' : 'text-slate-500'
              }`}
            >
              Estadísticas generales
            </span>
          </button>
        </div>
      </div>

      {/* Contenido a Incluir */}
      <div className="px-5 pt-8">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 block">
          Contenido a Incluir
        </label>
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          {data.opcionesContenido.map((opcion, idx) => (
            <label
              key={opcion.id}
              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors ${
                idx < data.opcionesContenido.length - 1 ? 'border-b border-neutral-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  {opcion.icono}
                </span>
                <span className="text-sm font-semibold text-slate-700">{opcion.label}</span>
              </div>
              <input
                type="checkbox"
                checked={opcion.seleccionado}
                onChange={() => handleOpcionToggle(opcion.id)}
                className="custom-checkbox h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary/20 transition duration-150 ease-in-out cursor-pointer appearance-none border bg-white grid place-content-center checked:bg-primary checked:border-primary"
                style={{
                  backgroundImage: opcion.seleccionado
                    ? 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGbcLmuu33temalmLrEfEtS1l4zX77SmMzLFk0tK3vWoQf4PyAQaGzTgWhh-iULGxaeUuEhSqWvCGoZOSEj8vj1nailZ4sCd-93MTI5vlgM8IcFDtRU3UG0jFVPl86ixpY0xypWX601V7rysaoZsZcxMyBI1On0p5gAq3RRdbVP2qX_C5N8F8g_h-r_F1uyR73AJW83qjCOTbTR48UTOGDYhUrbuHgucMx0VPHFHjIh8KWvMosELrCbBRl0CuvY5oZO9cXoi0pXXnM")'
                    : 'none',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Vista Previa */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Vista Previa del Documento
          </label>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">visibility</span>
        </div>
        <div className="bg-neutral-100/50 rounded-xl p-4 border border-neutral-200 flex justify-center">
          <div className="bg-white w-40 aspect-[1/1.4] shadow-md border border-neutral-100 p-2 flex flex-col items-center gap-1.5 transform hover:scale-105 transition-transform duration-300 cursor-zoom-in">
            <div className="w-full h-8 bg-neutral-50 border-b border-neutral-100 flex items-center px-1 gap-1">
              <div className="h-5 w-5 rounded-full bg-neutral-200"></div>
              <div className="flex flex-col gap-0.5">
                <div className="h-1.5 w-16 bg-neutral-200 rounded-sm"></div>
                <div className="h-1 w-10 bg-neutral-100 rounded-sm"></div>
              </div>
            </div>
            <div className="w-full px-1 space-y-1">
              <div className="h-1 w-full bg-neutral-100 rounded-sm"></div>
              <div className="h-1 w-3/4 bg-neutral-100 rounded-sm"></div>
              <div className="h-1 w-5/6 bg-neutral-100 rounded-sm"></div>
            </div>
            <div className="w-16 h-16 rounded-full border border-neutral-100 mt-1 relative flex items-center justify-center">
              <div
                className="w-10 h-10 bg-primary/10 rounded-full"
                style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
              ></div>
            </div>
            <div className="mt-auto w-full border-t border-neutral-100 pt-1 flex justify-center">
              <div className="h-0.5 w-10 bg-neutral-200"></div>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Vista aproximada del formato final
        </p>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-neutral-200 p-5 max-w-md mx-auto">
        <button className="group w-full flex items-center justify-between rounded-xl h-14 bg-primary px-5 text-white shadow-float active:scale-[0.98] transition-all duration-200">
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold tracking-wide">Batch Export PDF</span>
            <span className="text-[10px] font-medium text-white/80">
              {data.cantidadReportes} Reportes {data.tipoReporte === 'individual' ? 'Individuales' : 'Grupales'}
            </span>
          </div>
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <span className="material-symbols-outlined text-[20px]">file_upload</span>
          </div>
        </button>
      </div>
    </div>
  );
}
