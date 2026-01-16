import { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell - Contenedor principal del dashboard
 * Mantiene la estructura exacta del HTML original
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      {children}
    </div>
  );
}
