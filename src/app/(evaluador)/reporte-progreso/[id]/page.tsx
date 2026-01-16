import type { ReporteProgresoData } from '@/lib/types/evaluador-dtos';
import { getCurrentUser } from '@/lib/auth';
import { Rol } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getReporteProgreso, guardarReporteProgreso } from '@/app/actions/evaluador';
import { ReporteProgresoView } from '@/components/reporte-progreso/ReporteProgresoView';
import { calcularCoordenadasRadar, generarRadarPath } from '@/lib/utils/radar-chart';
import DescargarPDFButton from './DescargarPDFButton';
import { SuperAdminHelpers } from '@/components/admin/SuperAdminHelpers';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReporteProgresoPage({ params }: PageProps) {
  // 1. Obtener usuario autenticado
  const user = await getCurrentUser();
  
  // 2. Validar autenticación y rol
  if (!user) {
    redirect('/login');
  }
  
  if (user.rol !== Rol.EVALUADOR && user.rol !== Rol.SUPER_ADMIN) {
    redirect('/login');
  }
  
  // 3. Obtener y validar ID del alumno
  const { id } = await params;
  const alumnoId = parseInt(id, 10);
  
  if (isNaN(alumnoId)) {
    throw new Error(`ID de alumno inválido: ${id}`);
  }
  
  // 4. Obtener datos reales del reporte de progreso
  // (getReporteProgreso ya aplica scoping correcto)
  const result = await getReporteProgreso(alumnoId);
  
  if (!result.success) {
    throw new Error(
      `Error al obtener reporte de progreso: ${result.error}`
    );
  }
  
  const data: ReporteProgresoData = result.data;
  
  // 5. Guardar reporte en BD para poder generar PDFs versionados
  const resultadoGuardado = await guardarReporteProgreso(alumnoId, data);
  
  if (!resultadoGuardado.success) {
    // Si falla el guardado, aún mostramos el reporte pero sin capacidad de generar PDF
    console.error('Error al guardar reporte:', resultadoGuardado.error);
  }
  
  const reporteId = resultadoGuardado.success ? resultadoGuardado.data.reporteId : null;

  // 6. Calcular coordenadas del radar (fuera del componente, en server)
  const habilidades = [
    data.habilidadesClave.logica,
    data.habilidadesClave.vocabulario,
    data.habilidadesClave.estructura,
    data.habilidadesClave.rashi,
    data.habilidadesClave.arameo,
  ];

  const radarCoordinates = calcularCoordenadasRadar(habilidades);
  const radarPath = generarRadarPath(radarCoordinates);

  // 7. Renderizar componente con datos procesados
  return (
    <div className="relative">
      {/* Super Admin Helpers - Solo visible para SUPER_ADMIN */}
      {user.rol === Rol.SUPER_ADMIN && (
        <div className="px-4 pt-4 pb-2">
          <SuperAdminHelpers
            userRol={user.rol}
            currentAlumnoId={alumnoId}
            showBadge={true}
            showSelector={true}
            showQuickLinks={true}
          />
        </div>
      )}
      <ReporteProgresoView
        data={data}
        radarCoordinates={radarCoordinates}
        radarPath={radarPath}
        showHeader={true}
        showDownloadButton={false}
        showFooter={true}
        isPDFMode={false}
      />
      {/* Download Button - Solo mostrar si el reporte se guardó correctamente */}
      {reporteId !== null && (
        <div className="fixed bottom-0 w-full max-w-md mx-auto pointer-events-none z-50">
          <div className="px-5 pb-4 pointer-events-auto">
            <DescargarPDFButton reporteId={reporteId} />
          </div>
        </div>
      )}
    </div>
  );
}
