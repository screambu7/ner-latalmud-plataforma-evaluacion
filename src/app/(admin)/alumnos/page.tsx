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
  const [showForm, setShowForm] = useState(false);
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
    } catch (err) {
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
    } catch (err) {
      alert('Error al eliminar alumno');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800';
      case 'EN_PAUSA':
        return 'bg-yellow-100 text-yellow-800';
      case 'NO_ACTIVO':
        return 'bg-red-100 text-red-800';
      case 'NIVEL_LOGRADO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Alumnos</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alumnos</h1>
        <button
          onClick={() => router.push('/alumnos/nuevo')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nuevo Alumno
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {alumnos.length === 0 ? (
        <p>No hay alumnos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Nombre</th>
                <th className="border p-2 text-left">Correo</th>
                <th className="border p-2 text-left">Tipo</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno) => (
                <tr key={alumno.id}>
                  <td className="border p-2">{alumno.id}</td>
                  <td className="border p-2">{alumno.nombre}</td>
                  <td className="border p-2">{alumno.correo || '-'}</td>
                  <td className="border p-2">{alumno.tipo}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(alumno.status)}`}>
                      {alumno.status}
                    </span>
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => router.push(`/alumnos/${alumno.id}`)}
                      className="mr-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(alumno.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
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


