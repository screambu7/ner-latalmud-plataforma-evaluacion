interface AgendaItemProps {
  estudianteNombre: string;
  estudianteAvatarUrl: string;
  examenNombre: string;
  tiempoAtras: string;
}

/**
 * AgendaItem - Item de actividad reciente
 * Mantiene la estructura exacta del HTML original
 */
export function AgendaItem({
  estudianteNombre,
  estudianteAvatarUrl,
  examenNombre,
  tiempoAtras,
}: AgendaItemProps) {
  return (
    <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
          style={{ backgroundImage: `url("${estudianteAvatarUrl}")` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[color:var(--color-text-primary)] text-base font-medium leading-normal line-clamp-1">
            {estudianteNombre}
          </p>
          <p className="text-[color:var(--color-text-tertiary)] text-sm font-normal leading-normal line-clamp-2">
            {examenNombre}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <p className="text-[color:var(--color-text-tertiary)] text-sm font-normal leading-normal">
          {tiempoAtras}
        </p>
      </div>
    </div>
  );
}
