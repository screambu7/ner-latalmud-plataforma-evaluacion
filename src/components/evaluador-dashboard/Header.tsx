import { LogoutButton } from '@/components/auth/LogoutButton';

interface HeaderProps {
  avatarUrl: string;
  title: string;
}

/**
 * Header - Header del dashboard con avatar y título
 * Mantiene la estructura exacta del HTML original
 */
export function Header({ avatarUrl, title }: HeaderProps) {
  return (
    <div className="flex items-center bg-slate-50 p-4 pb-2 justify-between">
      <div className="flex size-12 shrink-0 items-center">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
          style={{ backgroundImage: `url("${avatarUrl}")` }}
        ></div>
      </div>
      <h2 className="text-[color:var(--color-text-primary)] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
        {title}
      </h2>
      <div className="flex size-12 shrink-0 items-center justify-end">
        <LogoutButton className="text-[color:var(--color-text-secondary)] text-sm font-medium hover:text-[color:var(--color-text-primary)] transition-colors">
          Salir
        </LogoutButton>
      </div>
    </div>
  );
}
