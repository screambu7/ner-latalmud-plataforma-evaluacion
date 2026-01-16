'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Alumno {
  id: number;
  nombre: string;
  correo: string | null;
  tipo: 'ESCUELA' | 'INDEPENDIENTE';
  escuelaId: number | null;
  status: 'ACTIVO' | 'EN_PAUSA' | 'NO_ACTIVO' | 'NIVEL_LOGRADO';
  creadoEn: string;
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const cargarAlumnos = async () => {
    try {
      const response = await fetch('/api/alumnos');
      if (!response.ok) {
        throw new Error('Error al cargar alumnos');
      }
      const data = await response.json();
      setAlumnos(data.alumnos || []);
    } catch {
      setError('Error al cargar alumnos');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de dar de baja a este alumno?')) {
      return;
    }

    try {
      const response = await fetch(`/api/alumnos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar alumno');
      }

      cargarAlumnos();
    } catch {
      alert('Error al eliminar alumno');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO':
        return 'bg-[color:var(--color-alert-success-bg)] text-[color:var(--color-status-active)]';
      case 'EN_PAUSA':
        return 'bg-[color:var(--color-alert-warning-bg)] text-[color:var(--color-status-paused)]';
      case 'NO_ACTIVO':
        return 'bg-[color:var(--color-alert-error-bg)] text-[color:var(--color-status-inactive)]';
      case 'NIVEL_LOGRADO':
        return 'bg-[color:var(--color-background-card)] text-[color:var(--color-status-completed)]';
      default:
        return 'bg-[color:var(--color-background-card)] text-[color:var(--color-text-secondary)]';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Alumnos</h1>
          <div className="h-10 w-32 bg-[color:var(--color-background-light)] rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-[color:var(--color-background-card)] rounded-lg animate-pulse"></div>
          <div className="h-12 bg-[color:var(--color-background-card)] rounded-lg animate-pulse"></div>
          <div className="h-12 bg-[color:var(--color-background-card)] rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alumnos</h1>
        <button
          onClick={() => router.push('/alumnos/nuevo')}
          className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-text-inverse)] rounded-md hover:opacity-90"
        >
          Nuevo Alumno
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[color:var(--color-alert-error-bg)] text-[color:var(--color-alert-error)] rounded-md">
          {error}
        </div>
      )}

      {alumnos.length === 0 ? (
        <div className="bg-[color:var(--color-background-card)] border border-[color:var(--color-border-light)] rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <span className="material-symbols-outlined text-[48px] text-[color:var(--color-text-tertiary)] opacity-50">
              school
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">
            No hay alumnos registrados
          </h3>
          <p className="text-sm text-[color:var(--color-text-secondary)] mb-6">
            Comienza agregando el primer alumno al sistema.
          </p>
          <button
            onClick={() => router.push('/alumnos/nuevo')}
            className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-text-inverse)] rounded-md hover:opacity-90 text-sm font-medium"
          >
            Agregar Primer Alumno
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[color:var(--color-border-light)]">
            <thead>
              <tr className="bg-[color:var(--color-background-light)]">
                <th className="border border-[color:var(--color-border-light)] p-2 text-left">ID</th>
                <th className="border border-[color:var(--color-border-light)] p-2 text-left">Nombre</th>
                <th className="border border-[color:var(--color-border-light)] p-2 text-left">Correo</th>
                <th className="border border-[color:var(--color-border-light)] p-2 text-left">Tipo</th>
                <th className="border border-[color:var(--color-border-light)] p-2 text-left">Status</th>
                <th className="border border-[color:var(--color-border-light)] p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno) => (
                <tr key={alumno.id}>
                  <td className="border border-[color:var(--color-border-light)] p-2">{alumno.id}</td>
                  <td className="border border-[color:var(--color-border-light)] p-2">{alumno.nombre}</td>
                  <td className="border border-[color:var(--color-border-light)] p-2">{alumno.correo || '-'}</td>
                  <td className="border border-[color:var(--color-border-light)] p-2">{alumno.tipo}</td>
                  <td className="border border-[color:var(--color-border-light)] p-2">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(alumno.status)}`}>
                      {alumno.status}
                    </span>
                  </td>
                  <td className="border border-[color:var(--color-border-light)] p-2">
                    <button
                      onClick={() => router.push(`/alumnos/${alumno.id}`)}
                      className="mr-2 px-3 py-1 bg-[color:var(--color-primary)] text-[color:var(--color-text-inverse)] rounded text-sm hover:opacity-90"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(alumno.id)}
                      className="px-3 py-1 bg-[color:var(--color-alert-error)] text-[color:var(--color-text-inverse)] rounded text-sm hover:opacity-90"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


