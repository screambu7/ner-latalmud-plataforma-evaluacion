'use client';

import { useState } from 'react';
import { generarPDFReporteAction } from '@/app/actions/reportes';

interface DescargarPDFButtonProps {
  reporteId: number;
}

export default function DescargarPDFButton({ reporteId }: DescargarPDFButtonProps) {
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [errorPDF, setErrorPDF] = useState('');

  const handleDescargarPDF = async () => {
    setGenerandoPDF(true);
    setErrorPDF('');

    try {
      const result = await generarPDFReporteAction(reporteId);

      if (!result.success) {
        setErrorPDF(result.error || 'Error al generar PDF');
        setGenerandoPDF(false);
        return;
      }

      // Redirigir a descarga
      window.location.href = `/api/archivos/${result.data.archivoId}/descargar`;
      setGenerandoPDF(false);
    } catch (error) {
      setErrorPDF('Error al generar PDF');
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-2">
      <button
        onClick={handleDescargarPDF}
        disabled={generandoPDF}
        className="group relative w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-primary text-white shadow-lg shadow-primary/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
        <span className="material-symbols-outlined mr-2 text-[20px]">
          {generandoPDF ? 'hourglass_empty' : 'download'}
        </span>
        <span className="text-sm font-bold tracking-wide">
          {generandoPDF ? 'Generando PDF...' : 'Descargar PDF Oficial'}
        </span>
      </button>
      {errorPDF && (
        <p className="text-red-600 text-sm mt-2 text-center">{errorPDF}</p>
      )}
    </div>
  );
}
