import { getCurrentUser } from '@/lib/auth';
import { Rol } from '@prisma/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminDashboardData } from '@/app/actions/admin';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function AdminDashboardPage() {
  // 1. Autorización: SOLO SUPER_ADMIN
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (user.rol !== Rol.SUPER_ADMIN) {
    // Rechazar con 403 (no redirect silencioso)
    return (
      <div className="min-h-screen bg-[color:var(--color-background-light)] p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">Acceso Denegado</h1>
          <p className="text-[color:var(--color-text-secondary)]">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // 2. Obtener todas las métricas ejecutivas
  const result = await getAdminDashboardData();
  
  if (!result.success) {
    // Si hay error de autenticación, redirigir a login
    if (result.error === 'No autenticado' || result.error === 'No autorizado') {
      redirect('/login');
    }
    // Otros errores: mostrar mensaje
    return (
      <div className="min-h-screen bg-[color:var(--color-background-light)] p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">Error</h1>
          <p className="text-[color:var(--color-text-secondary)]">{result.error || 'Error al cargar datos del dashboard'}</p>
        </div>
      </div>
    );
  }

  const data = result.data;

  return (
    <div className="min-h-screen bg-[color:var(--color-background-light)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-text-primary)]">Dashboard Administrativo</h1>
              <p className="text-[color:var(--color-text-secondary)] mt-2">Vista general del sistema</p>
            </div>
            <LogoutButton className="px-4 py-2 text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] border border-[color:var(--color-border)] rounded-md hover:bg-[color:var(--color-background-light)] transition-colors">
              Cerrar Sesión
            </LogoutButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Alumnos"
            value={data.metricasGlobales.totalAlumnos}
            icon="👥"
            link="/alumnos"
            subtitle={`${data.metricasGlobales.alumnosActivos} activos`}
          />
          <StatCard
            title="Total Usuarios"
            value={data.usuariosPorRol.superAdmins + data.usuariosPorRol.evaluadores}
            icon="👤"
            link="/usuarios"
            subtitle={`${data.usuariosPorRol.superAdmins} admin, ${data.usuariosPorRol.evaluadores} evaluadores`}
          />
          <StatCard
            title="Total Evaluaciones"
            value={data.metricasGlobales.totalEvaluaciones}
            icon="📊"
            link="/evaluaciones"
            subtitle={`${data.metricasGlobales.evaluacionesUltimos30Dias} últimos 30 días`}
          />
          <StatCard
            title="Total Escuelas"
            value={data.metricasPorEscuela.length}
            icon="🏫"
            link="/configuracion"
          />
        </div>

        {/* Alertas Ejecutivas */}
        {data.alertasEjecutivas.length > 0 && (
          <div className="bg-[color:var(--color-background-white)] rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)] mb-4">Alertas Ejecutivas</h2>
            <div className="space-y-3">
              {data.alertasEjecutivas.map((alerta, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    alerta.severidad === 'alta'
                      ? 'bg-red-50 border-red-200'
                      : alerta.severidad === 'media'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[color:var(--color-text-primary)]">{alerta.titulo}</h3>
                      <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">{alerta.descripcion}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        alerta.severidad === 'alta'
                          ? 'bg-red-100 text-red-700'
                          : alerta.severidad === 'media'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {alerta.cantidad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Métricas por Escuela */}
        {data.metricasPorEscuela.length > 0 && (
          <div className="bg-[color:var(--color-background-white)] rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)] mb-4">Métricas por Escuela</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[color:var(--color-border-light)]">
                <thead className="bg-[color:var(--color-background-light)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Escuela
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Alumnos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Activos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Evaluaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Última Evaluación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[color:var(--color-background-white)] divide-y divide-[color:var(--color-border-light)]">
                  {data.metricasPorEscuela.map((escuela) => (
                    <tr key={escuela.id} className="hover:bg-[color:var(--color-background-light)]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[color:var(--color-text-primary)]">
                          {escuela.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-primary)]">
                        {escuela.totalAlumnos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-primary)]">
                        {escuela.alumnosActivos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-primary)]">
                        {escuela.totalEvaluaciones}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-tertiary)]">
                        {escuela.ultimaEvaluacion
                          ? new Date(escuela.ultimaEvaluacion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Métricas por Evaluador */}
        {data.metricasPorEvaluador.length > 0 && (
          <div className="bg-[color:var(--color-background-white)] rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)] mb-4">Métricas por Evaluador</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[color:var(--color-border-light)]">
                <thead className="bg-[color:var(--color-background-light)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Evaluador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Evaluaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Alumnos Evaluados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Promedio General
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Última Actividad
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[color:var(--color-background-white)] divide-y divide-[color:var(--color-border-light)]">
                  {data.metricasPorEvaluador.map((evaluador) => (
                    <tr key={evaluador.id} className="hover:bg-[color:var(--color-background-light)]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[color:var(--color-text-primary)]">
                          {evaluador.nombre}
                        </div>
                        <div className="text-sm text-[color:var(--color-text-tertiary)]">{evaluador.correo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-primary)]">
                        {evaluador.totalEvaluaciones}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-primary)]">
                        {evaluador.alumnosEvaluados}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                          {evaluador.promedioGeneral}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-tertiary)]">
                        {evaluador.ultimaActividad
                          ? new Date(evaluador.ultimaActividad).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-[color:var(--color-background-white)] rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)] mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionLink
              href="/alumnos"
              title="Gestión de Alumnos"
              description="Ver, crear y editar alumnos"
              icon="👥"
            />
            <QuickActionLink
              href="/usuarios"
              title="Gestión de Usuarios"
              description="Administrar usuarios y permisos"
              icon="👤"
            />
            <QuickActionLink
              href="/evaluaciones"
              title="Evaluaciones"
              description="Ver todas las evaluaciones"
              icon="📊"
            />
            <QuickActionLink
              href="/reportes"
              title="Reportes"
              description="Generar y ver reportes"
              icon="📄"
            />
            <QuickActionLink
              href="/configuracion"
              title="Configuración"
              description="Configuración del sistema"
              icon="⚙️"
            />
          </div>
        </div>

        {/* Evaluaciones Recientes */}
        <div className="bg-[color:var(--color-background-white)] rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">Evaluaciones Recientes</h2>
            <Link
              href="/evaluaciones"
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Ver todas →
            </Link>
          </div>

          {data.evaluacionesRecientes.length === 0 ? (
            <div className="text-center py-8 text-[color:var(--color-text-tertiary)]">
              <p>No hay evaluaciones registradas aún.</p>
              <p className="text-sm mt-2">Las evaluaciones aparecerán aquí cuando se creen.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[color:var(--color-border-light)]">
                <thead className="bg-[color:var(--color-background-light)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Alumno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Evaluador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[color:var(--color-background-white)] divide-y divide-[color:var(--color-border-light)]">
                  {data.evaluacionesRecientes.map((evaluacion) => (
                    <tr key={evaluacion.id} className="hover:bg-[color:var(--color-background-light)]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[color:var(--color-text-primary)]">
                          {evaluacion.alumno.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[color:var(--color-text-primary)]">{evaluacion.evaluador.nombre}</div>
                        <div className="text-sm text-[color:var(--color-text-tertiary)]">{evaluacion.evaluador.correo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                          {evaluacion.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-tertiary)]">
                        {new Date(evaluacion.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  link,
  subtitle,
}: {
  title: string;
  value: number;
  icon: string;
  link: string;
  subtitle?: string;
}) {
  return (
    <Link
      href={link}
      className="bg-[color:var(--color-background-white)] rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">{title}</p>
          <p className="text-3xl font-bold text-[color:var(--color-text-primary)] mt-2">{value}</p>
          {subtitle && <p className="text-xs text-[color:var(--color-text-tertiary)] mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </Link>
  );
}

function QuickActionLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="block p-4 border border-[color:var(--color-border-light)] rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
    >
      <div className="flex items-start">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <h3 className="font-semibold text-[color:var(--color-text-primary)]">{title}</h3>
          <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}