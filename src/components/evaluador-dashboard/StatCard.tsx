interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  changePositive: boolean;
}

/**
 * StatCard - Tarjeta de estadística
 * Mantiene la estructura exacta del HTML original
 */
export function StatCard({ label, value, change, changePositive }: StatCardProps) {
  return (
    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[color:var(--color-background-card)]">
      <p className="text-[color:var(--color-text-primary)] text-base font-medium leading-normal">
        {label}
      </p>
      <p className="text-[color:var(--color-text-primary)] tracking-light text-2xl font-bold leading-tight">
        {value}
      </p>
      <p
        className={`text-base font-medium leading-normal ${
          changePositive ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-error)]'
        }`}
      >
        {change}
      </p>
    </div>
  );
}
