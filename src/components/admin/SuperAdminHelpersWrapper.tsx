'use client';

import { useState, useEffect } from 'react';
import { Rol } from '@prisma/client';
import { SuperAdminHelpers } from './SuperAdminHelpers';

interface SuperAdminHelpersWrapperProps {
  currentAlumnoId?: number;
  showBadge?: boolean;
  showSelector?: boolean;
  showQuickLinks?: boolean;
}

/**
 * Wrapper que obtiene el rol del usuario y renderiza SuperAdminHelpers
 * Solo para componentes client-side que no tienen acceso directo al rol
 */
export function SuperAdminHelpersWrapper(props: SuperAdminHelpersWrapperProps) {
  const [userRol, setUserRol] = useState<Rol | null>(null);

  useEffect(() => {
    // Obtener rol desde endpoint API
    const getRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserRol(data.rol);
        }
      } catch {
        // Error silencioso
        setUserRol(null);
      }
    };

    getRole();
  }, []);

  // Si no tenemos rol, no renderizar (seguridad por defecto)
  if (!userRol) {
    return null;
  }

  return <SuperAdminHelpers userRol={userRol} {...props} />;
}
