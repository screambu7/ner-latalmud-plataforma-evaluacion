interface CalendarDay {
  dia: number;
  esDiaActual: boolean;
}

interface CalendarProps {
  mes: string;
  primerDiaSemana: number;
  dias: CalendarDay[];
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
}

/**
 * Calendar - Calendario del dashboard
 * Mantiene la estructura exacta del HTML original
 */
export function Calendar({
  mes,
  primerDiaSemana,
  dias,
  onPreviousMonth,
  onNextMonth,
}: CalendarProps) {
  const diasSemana = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const espaciosVacios = primerDiaSemana;
  const diasCalendario: (number | null)[] = [
    ...Array.from({ length: espaciosVacios }, () => null),
    ...dias.map((d) => d.dia),
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-4">
      <div className="flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
        <div className="flex items-center p-1 justify-between">
          <button onClick={onPreviousMonth}>
            <div
              className="text-[color:var(--color-text-primary)] flex size-10 items-center justify-center"
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
          <p className="text-[color:var(--color-text-primary)] text-base font-bold leading-tight flex-1 text-center">
            {mes}
          </p>
          <button onClick={onNextMonth}>
            <div
              className="text-[color:var(--color-text-primary)] flex size-10 items-center justify-center"
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
              className="text-[color:var(--color-text-primary)] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5"
            >
              {dia}
            </p>
          ))}
          {diasCalendario.map((dia, idx) => {
            if (dia === null) {
              return <div key={`empty-${idx}`} className="h-12 w-full"></div>;
            }
            const diaData = dias.find((d) => d.dia === dia);
            const esDiaActual = diaData?.esDiaActual || false;
            const esPrimerDia = idx === espaciosVacios;
            const colStartClass =
              esPrimerDia && primerDiaSemana === 3
                ? 'col-start-4'
                : esPrimerDia && primerDiaSemana === 0
                  ? 'col-start-1'
                  : esPrimerDia && primerDiaSemana === 1
                    ? 'col-start-2'
                    : esPrimerDia && primerDiaSemana === 2
                      ? 'col-start-3'
                      : esPrimerDia && primerDiaSemana === 4
                        ? 'col-start-5'
                        : esPrimerDia && primerDiaSemana === 5
                          ? 'col-start-6'
                          : esPrimerDia && primerDiaSemana === 6
                            ? 'col-start-7'
                            : '';
            return (
              <button
                key={dia}
                className={`h-12 w-full text-[color:var(--color-text-primary)] text-sm font-medium leading-normal ${colStartClass}`}
              >
                <div
                  className={`flex size-full items-center justify-center rounded-full ${
                    esDiaActual ? 'bg-primary text-[color:var(--color-text-inverse)]' : ''
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
  );
}
