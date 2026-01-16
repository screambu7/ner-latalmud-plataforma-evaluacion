'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Rol } from '@prisma/client';

interface Alumno {
  id: number;
  nombre: string;
}

interface SuperAdminHelpersProps {
  userRol: Rol;
  currentAlumnoId?: number;
  showBadge?: boolean;
  showSelector?: boolean;
  showQuickLinks?: boolean;
}

/**
 * Helpers internos para SUPER_ADMIN
 * Solo se renderizan si el usuario tiene rol SUPER_ADMIN
 * 
 * Incluye:
 * - Badge discreto "Modo Administrador"
 * - Selector rápido de alumno (dropdown)
 * - Links rápidos (Ver perfil, Evaluar, Generar reporte)
 */
export function SuperAdminHelpers({
  userRol,
  currentAlumnoId,
  showBadge = true,
  showSelector = true,
  showQuickLinks = true,
}: SuperAdminHelpersProps) {
  const router = useRouter();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<number | null>(
    currentAlumnoId || null
  );

  // Cargar lista de alumnos (solo si es SUPER_ADMIN)
  useEffect(() => {
    if (userRol !== Rol.SUPER_ADMIN) {
      setLoading(false);
      return;
    }

    const cargarAlumnos = async () => {
      try {
        const response = await fetch('/api/alumnos');
        if (response.ok) {
          const data = await response.json();
          setAlumnos(data.alumnos || []);
        }
      } catch {
        // Error silencioso
      } finally {
        setLoading(false);
      }
    };

    if (showSelector) {
      cargarAlumnos();
    } else {
      setLoading(false);
    }
  }, [userRol, showSelector]);

  // No renderizar si no es SUPER_ADMIN
  if (userRol !== Rol.SUPER_ADMIN) {
    return null;
  }

  const handleAlumnoSelect = (alumnoId: number) => {
    setSelectedAlumnoId(alumnoId);
  };

  const handleQuickLink = (action: 'perfil' | 'evaluar' | 'reporte') => {
    if (!selectedAlumnoId) {
      return;
    }

    const routes = {
      perfil: `/perfil-diagnostico/${selectedAlumnoId}`,
      evaluar: `/evaluar/${selectedAlumnoId}`,
      reporte: `/reporte-progreso/${selectedAlumnoId}`,
    };

    router.push(routes[action]);
  };

  return (
    <div className="space-y-2">
      {/* Badge discreto */}
      {showBadge && (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full border border-slate-200">
            <span className="material-symbols-outlined text-[12px]">admin_panel_settings</span>
            Modo Administrador
          </span>
        </div>
      )}

      {/* Selector rápido de alumno */}
      {showSelector && (
        <div className="px-4">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Selección Rápida (Admin)
          </label>
          <select
            value={selectedAlumnoId || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                handleAlumnoSelect(Number(value));
              } else {
                setSelectedAlumnoId(null);
              }
            }}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            disabled={loading}
          >
            <option value="">Seleccionar alumno...</option>
            {alumnos.map((alumno) => (
              <option key={alumno.id} value={alumno.id}>
                {alumno.nombre} (ID: {alumno.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Links rápidos */}
      {showQuickLinks && selectedAlumnoId && (
        <div className="px-4 flex gap-2 flex-wrap">
          <button
            onClick={() => handleQuickLink('perfil')}
            className="flex-1 min-w-[100px] px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">person</span>
            Ver Perfil
          </button>
          <button
            onClick={() => handleQuickLink('evaluar')}
            className="flex-1 min-w-[100px] px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Evaluar
          </button>
          <button
            onClick={() => handleQuickLink('reporte')}
            className="flex-1 min-w-[100px] px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">description</span>
            Reporte
          </button>
        </div>
      )}
    </div>
  );
}
