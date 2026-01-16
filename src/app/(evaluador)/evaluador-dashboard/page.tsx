import type { EvaluadorDashboardDataV2 } from '@/lib/types/evaluador-dtos';
import { getEvaluadorDashboard } from '@/app/actions/evaluador';
import { protectPageWithAnyRole } from '@/lib/page-protection';
import { Rol } from '@prisma/client';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/evaluador-dashboard/AppShell';
import { Header } from '@/components/evaluador-dashboard/Header';
import { StatCard } from '@/components/evaluador-dashboard/StatCard';
import { AgendaItem } from '@/components/evaluador-dashboard/AgendaItem';
import { Calendar } from '@/components/evaluador-dashboard/Calendar';
import { BottomNavigation } from '@/components/evaluador-dashboard/BottomNavigation';
import { SuperAdminHelpers } from '@/components/admin/SuperAdminHelpers';

export default async function EvaluadorDashboardPage() {
  // SUPER_ADMIN puede acceder para testing/auditoría
  const user = await protectPageWithAnyRole([Rol.EVALUADOR, Rol.SUPER_ADMIN]);
  
  // Obtener datos reales del dashboard
  const result = await getEvaluadorDashboard();
  
  // Si hay error de autenticación, redirigir a login
  if (!result.success) {
    if (result.error === 'No autenticado' || result.error === 'No autorizado') {
      redirect('/login');
    }
    // Otros errores: lanzar excepción
    throw new Error(
      `Error al obtener datos del dashboard: ${result.error}`
    );
  }
  
  const data: EvaluadorDashboardDataV2 = result.data;

  // Configurar navegación inferior
  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/evaluador-dashboard',
      iconType: 'house' as const,
      isActive: true,
    },
    {
      label: 'Alumnos',
      href: '/mis-alumnos',
      iconType: 'users' as const,
      isActive: false,
    },
    {
      label: 'Exámenes',
      href: '/evaluar',
      iconType: 'file' as const,
      isActive: false,
    },
    {
      label: 'Reportes',
      href: '/centro-reportes',
      iconType: 'presentation-chart' as const,
      isActive: false,
    },
    {
      label: 'Ajustes',
      href: '#',
      iconType: 'gear' as const,
      isActive: false,
    },
  ];

  return (
    <AppShell>
      <div>
        {/* Super Admin Helpers - Solo visible para SUPER_ADMIN */}
        {user.rol === Rol.SUPER_ADMIN && (
          <div className="px-4 pt-4 pb-2">
            <SuperAdminHelpers
              userRol={user.rol}
              showBadge={true}
              showSelector={true}
              showQuickLinks={false}
            />
          </div>
        )}
        {/* Header */}
        <Header avatarUrl={data.evaluador.avatarUrl} title="Dashboard" />

        {/* Saludo */}
        <h3 className="text-[color:var(--color-text-primary)] tracking-light text-2xl font-bold leading-tight px-4 text-left pb-2 pt-5">
          {data.saludo}
        </h3>

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 p-4">
          <StatCard
            label="Alumnos Evaluados"
            value={data.stats.alumnosEvaluados.valor}
            change={data.stats.alumnosEvaluados.cambio}
            changePositive={data.stats.alumnosEvaluados.cambioPositivo}
          />
          <StatCard
            label="Promedio General"
            value={`${data.stats.promedioGeneral.valor}%`}
            change={data.stats.promedioGeneral.cambio}
            changePositive={data.stats.promedioGeneral.cambioPositivo}
          />
          <StatCard
            label="Alertas Críticas"
            value={data.stats.alertasCriticas.valor}
            change={data.stats.alertasCriticas.cambio}
            changePositive={data.stats.alertasCriticas.cambioPositivo}
          />
          <StatCard
            label="Sugiá Actual"
            value={data.stats.sugiaActual.nombre}
            change={data.stats.sugiaActual.cambio}
            changePositive={data.stats.sugiaActual.cambioPositivo}
          />
        </div>

        {/* Recent Activity */}
        <h2 className="text-[color:var(--color-text-primary)] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Recent Activity
        </h2>
        {data.recentActivity.length > 0 ? (
          data.recentActivity.map((activity) => (
            <AgendaItem
              key={activity.id}
              estudianteNombre={activity.estudianteNombre}
              estudianteAvatarUrl={activity.estudianteAvatarUrl}
              examenNombre={activity.examenNombre}
              tiempoAtras={activity.tiempoAtras}
            />
          ))
        ) : (
          <div className="px-4 py-4">
            <p className="text-[color:var(--color-text-tertiary)] text-sm font-normal leading-normal">
              No hay evaluaciones recientes
            </p>
          </div>
        )}

        {/* Calendar */}
        <h2 className="text-[color:var(--color-text-primary)] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Calendar
        </h2>
        <Calendar
          mes={data.calendar.mes}
          primerDiaSemana={data.calendar.primerDiaSemana}
          dias={data.calendar.dias}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation items={navigationItems} />
    </AppShell>
  );
}
