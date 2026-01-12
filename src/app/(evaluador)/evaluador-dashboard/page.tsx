import { mockEvaluadorDashboardV2 } from '@/lib/types/evaluador-dtos';
import type { EvaluadorDashboardDataV2 } from '@/lib/types/evaluador-dtos';
import { getEvaluadorDashboard } from '@/app/actions/evaluador';
import { protectPage } from '@/lib/page-protection';
import { Rol } from '@prisma/client';

export default async function EvaluadorDashboardPage() {
  await protectPage(Rol.EVALUADOR);
  
  // Obtener datos reales del dashboard
  const result = await getEvaluadorDashboard();
  
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
        `Error al obtener datos del dashboard: ${result.error}. ` +
        'Los datos mock no están permitidos en staging/production.'
      );
    }
  }
  
  const data: EvaluadorDashboardDataV2 = result.success
    ? result.data
    : mockEvaluadorDashboardV2;

  // Generar días del calendario con espacios vacíos al inicio
  const diasSemana = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  // El primer día del mes empieza en la columna indicada por primerDiaSemana (0-6, domingo=0)
  // Pero en el HTML, el día 1 está en col-start-4, que corresponde a miércoles (índice 3)
  // Ajustamos: si primerDiaSemana es 3 (miércoles), necesitamos 3 espacios vacíos antes
  const espaciosVacios = data.calendar.primerDiaSemana;
  const diasCalendario: (number | null)[] = [
    ...Array.from({ length: espaciosVacios }, () => null),
    ...data.calendar.dias.map((d) => d.dia),
  ];

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-slate-50 p-4 pb-2 justify-between">
          <div className="flex size-12 shrink-0 items-center">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
              style={{ backgroundImage: `url("${data.evaluador.avatarUrl}")` }}
            ></div>
          </div>
          <h2 className="text-[#0d151b] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Dashboard
          </h2>
        </div>

        {/* Saludo */}
        <h3 className="text-[#0d151b] tracking-light text-2xl font-bold leading-tight px-4 text-left pb-2 pt-5">
          {data.saludo}
        </h3>

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#e7eef3]">
            <p className="text-[#0d151b] text-base font-medium leading-normal">Alumnos Evaluados</p>
            <p className="text-[#0d151b] tracking-light text-2xl font-bold leading-tight">
              {data.stats.alumnosEvaluados.valor}
            </p>
            <p
              className={`text-base font-medium leading-normal ${
                data.stats.alumnosEvaluados.cambioPositivo ? 'text-[#078838]' : 'text-[#e73908]'
              }`}
            >
              {data.stats.alumnosEvaluados.cambio}
            </p>
          </div>

          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#e7eef3]">
            <p className="text-[#0d151b] text-base font-medium leading-normal">Promedio General</p>
            <p className="text-[#0d151b] tracking-light text-2xl font-bold leading-tight">
              {data.stats.promedioGeneral.valor}%
            </p>
            <p
              className={`text-base font-medium leading-normal ${
                data.stats.promedioGeneral.cambioPositivo ? 'text-[#078838]' : 'text-[#e73908]'
              }`}
            >
              {data.stats.promedioGeneral.cambio}
            </p>
          </div>

          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#e7eef3]">
            <p className="text-[#0d151b] text-base font-medium leading-normal">Alertas Críticas</p>
            <p className="text-[#0d151b] tracking-light text-2xl font-bold leading-tight">
              {data.stats.alertasCriticas.valor}
            </p>
            <p
              className={`text-base font-medium leading-normal ${
                data.stats.alertasCriticas.cambioPositivo ? 'text-[#078838]' : 'text-[#e73908]'
              }`}
            >
              {data.stats.alertasCriticas.cambio}
            </p>
          </div>

          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#e7eef3]">
            <p className="text-[#0d151b] text-base font-medium leading-normal">Sugiá Actual</p>
            <p className="text-[#0d151b] tracking-light text-2xl font-bold leading-tight">
              {data.stats.sugiaActual.nombre}
            </p>
            <p
              className={`text-base font-medium leading-normal ${
                data.stats.sugiaActual.cambioPositivo ? 'text-[#078838]' : 'text-[#e73908]'
              }`}
            >
              {data.stats.sugiaActual.cambio}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <h2 className="text-[#0d151b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Recent Activity
        </h2>
        {data.recentActivity.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between"
          >
            <div className="flex items-center gap-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
                style={{ backgroundImage: `url("${activity.estudianteAvatarUrl}")` }}
              ></div>
              <div className="flex flex-col justify-center">
                <p className="text-[#0d151b] text-base font-medium leading-normal line-clamp-1">
                  {activity.estudianteNombre}
                </p>
                <p className="text-[#4c759a] text-sm font-normal leading-normal line-clamp-2">
                  {activity.examenNombre}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <p className="text-[#4c759a] text-sm font-normal leading-normal">{activity.tiempoAtras}</p>
            </div>
          </div>
        ))}

        {/* Calendar */}
        <h2 className="text-[#0d151b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Calendar
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-6 p-4">
          <div className="flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
            <div className="flex items-center p-1 justify-between">
              <button>
                <div
                  className="text-[#0d151b] flex size-10 items-center justify-center"
                  data-icon="CaretLeft"
                  data-size="18px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18px"
                    height="18px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                  </svg>
                </div>
              </button>
              <p className="text-[#0d151b] text-base font-bold leading-tight flex-1 text-center">
                {data.calendar.mes}
              </p>
              <button>
                <div
                  className="text-[#0d151b] flex size-10 items-center justify-center"
                  data-icon="CaretRight"
                  data-size="18px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18px"
                    height="18px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                  </svg>
                </div>
              </button>
            </div>
            <div className="grid grid-cols-7">
              {diasSemana.map((dia, idx) => (
                <p
                  key={idx}
                  className="text-[#0d151b] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5"
                >
                  {dia}
                </p>
              ))}
              {diasCalendario.map((dia, idx) => {
                if (dia === null) {
                  return <div key={`empty-${idx}`} className="h-12 w-full"></div>;
                }
                const diaData = data.calendar.dias.find((d) => d.dia === dia);
                const esDiaActual = diaData?.esDiaActual || false;
                // El primer día (índice igual a espaciosVacios) debe tener col-start basado en primerDiaSemana
                const esPrimerDia = idx === espaciosVacios;
                // Mapear primerDiaSemana a clases col-start de Tailwind
                const colStartClass =
                  esPrimerDia && data.calendar.primerDiaSemana === 3
                    ? 'col-start-4'
                    : esPrimerDia && data.calendar.primerDiaSemana === 0
                      ? 'col-start-1'
                      : esPrimerDia && data.calendar.primerDiaSemana === 1
                        ? 'col-start-2'
                        : esPrimerDia && data.calendar.primerDiaSemana === 2
                          ? 'col-start-3'
                          : esPrimerDia && data.calendar.primerDiaSemana === 4
                            ? 'col-start-5'
                            : esPrimerDia && data.calendar.primerDiaSemana === 5
                              ? 'col-start-6'
                              : esPrimerDia && data.calendar.primerDiaSemana === 6
                                ? 'col-start-7'
                                : '';
                return (
                  <button
                    key={dia}
                    className={`h-12 w-full text-[#0d151b] text-sm font-medium leading-normal ${colStartClass}`}
                  >
                    <div
                      className={`flex size-full items-center justify-center rounded-full ${
                        esDiaActual ? 'bg-[#1179d4] text-slate-50' : ''
                      }`}
                    >
                      {dia}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div>
        <div className="flex gap-2 border-t border-[#e7eef3] bg-slate-50 px-4 pb-3 pt-2">
          <a className="just flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-[#0d151b]" href="#">
            <div
              className="text-[#0d151b] flex h-8 items-center justify-center"
              data-icon="House"
              data-size="24px"
              data-weight="fill"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
              </svg>
            </div>
            <p className="text-[#0d151b] text-xs font-medium leading-normal tracking-[0.015em]">Dashboard</p>
          </a>
          <a className="just flex flex-1 flex-col items-center justify-end gap-1 text-[#4c759a]" href="#">
            <div
              className="text-[#4c759a] flex h-8 items-center justify-center"
              data-icon="Users"
              data-size="24px"
              data-weight="regular"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
              </svg>
            </div>
            <p className="text-[#4c759a] text-xs font-medium leading-normal tracking-[0.015em]">Alumnos</p>
          </a>
          <a className="just flex flex-1 flex-col items-center justify-end gap-1 text-[#4c759a]" href="#">
            <div
              className="text-[#4c759a] flex h-8 items-center justify-center"
              data-icon="File"
              data-size="24px"
              data-weight="regular"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"></path>
              </svg>
            </div>
            <p className="text-[#4c759a] text-xs font-medium leading-normal tracking-[0.015em]">Exámenes</p>
          </a>
          <a className="just flex flex-1 flex-col items-center justify-end gap-1 text-[#4c759a]" href="#">
            <div
              className="text-[#4c759a] flex h-8 items-center justify-center"
              data-icon="PresentationChart"
              data-size="24px"
              data-weight="regular"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176ZM104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"></path>
              </svg>
            </div>
            <p className="text-[#4c759a] text-xs font-medium leading-normal tracking-[0.015em]">Reportes</p>
          </a>
          <a className="just flex flex-1 flex-col items-center justify-end gap-1 text-[#4c759a]" href="#">
            <div
              className="text-[#4c759a] flex h-8 items-center justify-center"
              data-icon="Gear"
              data-size="24px"
              data-weight="regular"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path>
              </svg>
            </div>
            <p className="text-[#4c759a] text-xs font-medium leading-normal tracking-[0.015em]">Ajustes</p>
          </a>
        </div>
        <div className="h-5 bg-slate-50"></div>
      </div>
    </div>
  );
}
