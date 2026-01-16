import type { PerfilDiagnosticoData } from '@/lib/types/evaluador-dtos';
import { getPerfilDiagnostico } from '@/app/actions/evaluador';
import { getCurrentUser } from '@/lib/auth';
import { Rol } from '@prisma/client';
import { redirect } from 'next/navigation';
import { PerfilDiagnosticoView } from '@/components/perfil-diagnostico/PerfilDiagnosticoView';
import { calcularCoordenadasRadar, generarRadarPath } from '@/lib/utils/radar-chart';
import { SuperAdminHelpers } from '@/components/admin/SuperAdminHelpers';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PerfilDiagnosticoPage({ params }: PageProps) {
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
    return (
      <PerfilDiagnosticoView
        data={undefined}
        error={`ID de alumno inválido: ${id}`}
        isLoading={false}
      />
    );
  }
  
  // 4. Obtener datos reales del perfil de diagnóstico
  // (getPerfilDiagnostico ya aplica scoping correcto)
  const result = await getPerfilDiagnostico(alumnoId);
  
  // 5. Manejar estados: error, empty, success
  if (!result.success) {
    return (
      <PerfilDiagnosticoView
        data={undefined}
        error={result.error || 'Error al cargar el perfil de diagnóstico'}
        isLoading={false}
      />
    );
  }

  const data: PerfilDiagnosticoData = result.data;

  // 6. Calcular coordenadas del radar (fuera del componente, en server)
  const habilidades = [
    data.mapaHabilidades.logica,
    data.mapaHabilidades.vocabulario,
    data.mapaHabilidades.estructura,
    data.mapaHabilidades.rashi,
    data.mapaHabilidades.arameo,
  ];

  const radarCoordinates = calcularCoordenadasRadar(habilidades);
  const radarPath = generarRadarPath(radarCoordinates);

  // 7. Renderizar componente con datos procesados
  return (
    <>
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
      <PerfilDiagnosticoView
        data={data}
        radarCoordinates={radarCoordinates}
        radarPath={radarPath}
        isLoading={false}
        error={null}
      />
    </>
  );
}
