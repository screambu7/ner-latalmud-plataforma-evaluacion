interface AlertCardProps {
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

/**
 * AlertCard - Tarjeta de alerta
 * Mantiene la estructura exacta del HTML original (preparado para futuras alertas)
 */
export function AlertCard({ title, message, type = 'error' }: AlertCardProps) {
  const bgColorClass =
    type === 'error'
      ? 'bg-[color:var(--color-alert-error-bg)]'
      : type === 'warning'
        ? 'bg-[color:var(--color-alert-warning-bg)]'
        : 'bg-[color:var(--color-alert-success-bg)]';

  const borderColorClass =
    type === 'error'
      ? 'border-[color:var(--color-alert-error-border)]'
      : type === 'warning'
        ? 'border-[color:var(--color-alert-warning-border)]'
        : 'border-[color:var(--color-alert-success-border)]';

  const textColorClass =
    type === 'error'
      ? 'text-[color:var(--color-alert-error)]'
      : type === 'warning'
        ? 'text-[color:var(--color-alert-warning)]'
        : 'text-[color:var(--color-alert-success)]';

  return (
    <div className={`rounded-lg ${bgColorClass} border ${borderColorClass} p-3`}>
      <div className="flex items-center gap-2">
        <svg
          className={`h-5 w-5 ${textColorClass}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className={`text-sm font-semibold ${textColorClass}`}>{title}</p>
          <p className={`text-sm ${textColorClass}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
