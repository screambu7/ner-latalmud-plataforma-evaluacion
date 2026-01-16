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
    // Obtener rol desde la sesión (cookie)
    // Nota: Esto es seguro porque solo se usa para mostrar/ocultar helpers internos
    const getRoleFromSession = async () => {
      try {
        // Intentar obtener rol desde una cookie o hacer una petición mínima
        // Por ahora, verificamos si existe una cookie de sesión y extraemos el rol
        // En producción, esto debería venir de un endpoint seguro
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find((c) => c.trim().startsWith('session='));
        
        if (sessionCookie) {
          // Si hay sesión, asumimos que podemos mostrar los helpers
          // El componente SuperAdminHelpers verificará el rol correctamente
          // Por ahora, hacemos una petición simple para obtener el rol
          const response = await fetch('/api/alumnos');
          if (response.ok) {
            // Si puede acceder a /api/alumnos, probablemente es SUPER_ADMIN o EVALUADOR
            // El componente SuperAdminHelpers hará la verificación final
            // Por simplicidad, intentamos obtener el rol de otra manera
            // Mejor: crear un endpoint /api/auth/me o pasar el rol desde el servidor
          }
        }
      } catch {
        // Error silencioso
      }
    };

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
