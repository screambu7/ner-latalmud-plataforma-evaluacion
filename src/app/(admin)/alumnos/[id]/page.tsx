'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Alumno {
  id: number;
  nombre: string;
  correo: string | null;
  tipo: 'ESCUELA' | 'INDEPENDIENTE';
  escuelaId: number | null;
  status: 'ACTIVO' | 'EN_PAUSA' | 'NO_ACTIVO' | 'NIVEL_LOGRADO';
  creadoEn: string;
}

export default function AlumnoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipo, setTipo] = useState<'ESCUELA' | 'INDEPENDIENTE'>('ESCUELA');
  const [escuelaId, setEscuelaId] = useState('');
  const [status, setStatus] = useState<'ACTIVO' | 'EN_PAUSA' | 'NO_ACTIVO' | 'NIVEL_LOGRADO'>('ACTIVO');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarAlumno();
  }, [id]);

  const cargarAlumno = async () => {
    try {
      const response = await fetch(`/api/alumnos/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar alumno');
      }
      const data = await response.json();
      const alumnoData = data.alumno;
      setAlumno(alumnoData);
      setNombre(alumnoData.nombre);
      setCorreo(alumnoData.correo || '');
      setTipo(alumnoData.tipo);
      setEscuelaId(alumnoData.escuelaId?.toString() || '');
      setStatus(alumnoData.status);
    } catch (err) {
      setError('Error al cargar alumno');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/alumnos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          correo: correo || null,
          tipo,
          escuelaId: escuelaId ? parseInt(escuelaId) : null,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al actualizar alumno');
        setSaving(false);
        return;
      }

      router.push('/alumnos');
    } catch (err) {
      setError('Error de conexión');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Editar Alumno</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Alumno no encontrado</h1>
        <button
          onClick={() => router.push('/alumnos')}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Alumno</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium mb-1">
            Nombre *
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="correo" className="block text-sm font-medium mb-1">
            Correo
          </label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium mb-1">
            Tipo *
          </label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'ESCUELA' | 'INDEPENDIENTE')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="ESCUELA">Escuela</option>
            <option value="INDEPENDIENTE">Independiente</option>
          </select>
        </div>

        <div>
          <label htmlFor="escuelaId" className="block text-sm font-medium mb-1">
            ID Escuela
          </label>
          <input
            id="escuelaId"
            type="number"
            value={escuelaId}
            onChange={(e) => setEscuelaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status *
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="ACTIVO">Activo</option>
            <option value="EN_PAUSA">En Pausa</option>
            <option value="NO_ACTIVO">No Activo</option>
            <option value="NIVEL_LOGRADO">Nivel Logrado</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/alumnos')}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}


