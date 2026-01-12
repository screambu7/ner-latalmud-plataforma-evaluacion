'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NuevoAlumnoPage() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipo, setTipo] = useState<'ESCUELA' | 'INDEPENDIENTE'>('ESCUELA');
  const [escuelaId, setEscuelaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/alumnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          correo: correo || null,
          tipo,
          escuelaId: escuelaId ? parseInt(escuelaId) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear alumno');
        setLoading(false);
        return;
      }

      router.push('/alumnos');
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nuevo Alumno</h1>

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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
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



