'use client';

import { useEffect, useState } from 'react';
import { getUsuarios, createUsuario, updateUsuario, sendInvitation, getEscuelas, type UsuarioListItem } from '@/app/actions/usuarios';
import { Rol, EstadoCuenta } from '@prisma/client';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const [escuelas, setEscuelas] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioListItem | null>(null);
  
  // Filtros y búsqueda
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState<Rol | ''>('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoCuenta | ''>('');

  // Form create
  const [createForm, setCreateForm] = useState<{
    correo: string;
    nombre: string;
    rol: Rol;
    estado: EstadoCuenta;
    escuelaId: string;
  }>({
    correo: '',
    nombre: '',
    rol: Rol.EVALUADOR,
    estado: EstadoCuenta.ACTIVO,
    escuelaId: '',
  });

  useEffect(() => {
    cargarUsuarios();
    cargarEscuelas();
  }, [search, rolFilter, estadoFilter]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const result = await getUsuarios(
        search || undefined,
        rolFilter || undefined,
        estadoFilter || undefined
      );
      
      if (!result.success) {
        setError(result.error);
        return;
      }
      
      setUsuarios(result.data);
      setError('');
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const cargarEscuelas = async () => {
    const result = await getEscuelas();
    if (result.success) {
      setEscuelas(result.data);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await createUsuario(
      createForm.correo,
      createForm.nombre,
      createForm.rol,
      createForm.estado,
      createForm.escuelaId ? parseInt(createForm.escuelaId) : null
    );

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Mostrar magic link en desarrollo
    if (process.env.NODE_ENV === 'development') {
      alert(`Usuario creado. Magic link: ${result.data.magicLink}`);
    } else {
      alert('Usuario creado. El link de invitación ha sido generado (revisar logs del servidor).');
    }

    setShowCreateModal(false);
    setCreateForm({
      correo: '',
      nombre: '',
      rol: Rol.EVALUADOR,
      estado: EstadoCuenta.ACTIVO,
      escuelaId: '',
    });
    cargarUsuarios();
  };

  const handleEdit = (usuario: UsuarioListItem) => {
    setEditingUsuario(usuario);
    setShowEditModal(true);
  };

  const handleUpdate = async (updates: { rol?: Rol; estado?: EstadoCuenta }) => {
    if (!editingUsuario) return;

    setError('');
    const result = await updateUsuario(editingUsuario.id, updates);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setShowEditModal(false);
    setEditingUsuario(null);
    cargarUsuarios();
  };

  const handleInvite = async (usuarioId: number) => {
    setError('');
    const result = await sendInvitation(usuarioId);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Mostrar magic link en desarrollo
    if (process.env.NODE_ENV === 'development') {
      alert(`Link de invitación generado: ${result.data.magicLink}`);
    } else {
      alert('Link de invitación generado (revisar logs del servidor).');
    }
  };

  const getRolColor = (rol: Rol) => {
    switch (rol) {
      case Rol.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800';
      case Rol.EVALUADOR:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: EstadoCuenta) => {
    switch (estado) {
      case EstadoCuenta.ACTIVO:
        return 'bg-green-100 text-green-800';
      case EstadoCuenta.INACTIVO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Crear Usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Búsqueda</label>
          <input
            type="text"
            placeholder="Email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value as Rol | '')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Todos</option>
            <option value={Rol.SUPER_ADMIN}>Super Admin</option>
            <option value={Rol.EVALUADOR}>Evaluador</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as EstadoCuenta | '')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Todos</option>
            <option value={EstadoCuenta.ACTIVO}>Activo</option>
            <option value={EstadoCuenta.INACTIVO}>Inactivo</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Nombre</th>
                <th className="border p-2 text-left">Rol</th>
                <th className="border p-2 text-left">Estado</th>
                <th className="border p-2 text-left">Escuela</th>
                <th className="border p-2 text-left">Creado</th>
                <th className="border p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="border p-2">{usuario.correo}</td>
                  <td className="border p-2">{usuario.nombre}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-sm ${getRolColor(usuario.rol)}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-sm ${getEstadoColor(usuario.estado)}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="border p-2">
                    {usuario.escuela ? usuario.escuela.nombre : '-'}
                  </td>
                  <td className="border p-2">{formatDate(usuario.creadoEn)}</td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleInvite(usuario.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Invitar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Crear Usuario</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={createForm.correo}
                  onChange={(e) => setCreateForm({ ...createForm, correo: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={createForm.rol}
                  onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value as Rol })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={Rol.EVALUADOR}>Evaluador</option>
                  <option value={Rol.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={createForm.estado}
                  onChange={(e) => setCreateForm({ ...createForm, estado: e.target.value as EstadoCuenta })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={EstadoCuenta.ACTIVO}>Activo</option>
                  <option value={EstadoCuenta.INACTIVO}>Inactivo</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Escuela (opcional)</label>
                <select
                  value={createForm.escuelaId}
                  onChange={(e) => setCreateForm({ ...createForm, escuelaId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Sin escuela</option>
                  {escuelas.map((escuela) => (
                    <option key={escuela.id} value={escuela.id}>
                      {escuela.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {showEditModal && editingUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Email:</strong> {editingUsuario.correo}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Nombre:</strong> {editingUsuario.nombre}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                value={editingUsuario.rol}
                onChange={(e) => {
                  const nuevoRol = e.target.value as Rol;
                  handleUpdate({ rol: nuevoRol });
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={Rol.EVALUADOR}>Evaluador</option>
                <option value={Rol.SUPER_ADMIN}>Super Admin</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={editingUsuario.estado}
                onChange={(e) => {
                  const nuevoEstado = e.target.value as EstadoCuenta;
                  handleUpdate({ estado: nuevoEstado });
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={EstadoCuenta.ACTIVO}>Activo</option>
                <option value={EstadoCuenta.INACTIVO}>Inactivo</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUsuario(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
