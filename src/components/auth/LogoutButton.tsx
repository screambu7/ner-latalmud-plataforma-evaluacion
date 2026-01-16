'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Botón de logout que llama a /api/auth/logout y redirige a /login
 * 
 * Componente client-side necesario porque:
 * - Necesita usar useRouter para navegación
 * - Necesita manejar estado de loading
 * - Necesita hacer fetch a API route
 */
export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[LOGOUT] Error al cerrar sesión:', response.statusText);
        // Continuar con logout incluso si hay error (cookie puede estar borrada)
      }

      // Redirigir a login
      router.push('/login');
      router.refresh(); // Forzar refresh para limpiar cache
    } catch (error) {
      console.error('[LOGOUT] Error al cerrar sesión:', error);
      // Redirigir a login incluso si hay error
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
      type="button"
    >
      {isLoading ? 'Cerrando...' : (children || 'Cerrar Sesión')}
    </button>
  );
}
