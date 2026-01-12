// Datos mock para desarrollo sin base de datos

export interface MockUsuario {
  id: number;
  nombre: string;
  correo: string;
  celular?: string;
  rol: 'ADMIN_PRINCIPAL' | 'ADMIN_GENERAL' | 'EVALUADOR';
  estado: 'ACTIVO' | 'INACTIVO';
  escuelaId?: number;
  creadoEn: Date;
}

export interface MockAlumno {
  id: number;
  nombre: string;
  correo?: string;
  tipo: 'ESCUELA' | 'INDEPENDIENTE';
  escuelaId?: number;
  status: 'ACTIVO' | 'EN_PAUSA' | 'NO_ACTIVO' | 'NIVEL_LOGRADO';
  creadoEn: Date;
}

// Datos mock de usuarios
export const mockUsuarios: MockUsuario[] = [
  {
    id: 1,
    nombre: 'Admin Principal',
    correo: 'admin@nerlatalmud.com',
    rol: 'ADMIN_PRINCIPAL',
    estado: 'ACTIVO',
    creadoEn: new Date(),
  },
  {
    id: 2,
    nombre: 'Admin General',
    correo: 'admin2@nerlatalmud.com',
    rol: 'ADMIN_GENERAL',
    estado: 'ACTIVO',
    creadoEn: new Date(),
  },
  {
    id: 3,
    nombre: 'Evaluador Test',
    correo: 'evaluador@nerlatalmud.com',
    rol: 'EVALUADOR',
    estado: 'ACTIVO',
    creadoEn: new Date(),
  },
];

// Datos mock de alumnos
export let mockAlumnos: MockAlumno[] = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    correo: 'juan@ejemplo.com',
    tipo: 'ESCUELA',
    status: 'ACTIVO',
    creadoEn: new Date('2024-01-15'),
  },
  {
    id: 2,
    nombre: 'María González',
    correo: 'maria@ejemplo.com',
    tipo: 'INDEPENDIENTE',
    status: 'ACTIVO',
    creadoEn: new Date('2024-01-20'),
  },
  {
    id: 3,
    nombre: 'Carlos Rodríguez',
    correo: 'carlos@ejemplo.com',
    tipo: 'ESCUELA',
    status: 'EN_PAUSA',
    creadoEn: new Date('2024-02-01'),
  },
];

// Funciones helper para simular operaciones de BD
export const mockDb = {
  usuario: {
    findUnique: async (args: { where: { id?: number; correo?: string } }) => {
      const { where } = args;
      if (where.id) {
        return mockUsuarios.find((u) => u.id === where.id) || null;
      }
      if (where.correo) {
        const correoLower = where.correo.toLowerCase();
        return mockUsuarios.find((u) => u.correo.toLowerCase() === correoLower) || null;
      }
      return null;
    },
    findMany: async () => {
      return mockUsuarios;
    },
  },
  alumno: {
    findUnique: async (args: { where: { id: number } }) => {
      const { where } = args;
      return mockAlumnos.find((a) => a.id === where.id) || null;
    },
    findMany: async () => {
      return [...mockAlumnos].sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime());
    },
    create: async (args: { data: Omit<MockAlumno, 'id' | 'creadoEn'> }) => {
      const newId = Math.max(...mockAlumnos.map((a) => a.id), 0) + 1;
      const newAlumno: MockAlumno = {
        ...args.data,
        id: newId,
        creadoEn: new Date(),
      };
      mockAlumnos.push(newAlumno);
      return newAlumno;
    },
    update: async (args: { where: { id: number }; data: Partial<MockAlumno> }) => {
      const index = mockAlumnos.findIndex((a) => a.id === args.where.id);
      if (index === -1) {
        throw new Error('Alumno no encontrado');
      }
      mockAlumnos[index] = { ...mockAlumnos[index], ...args.data };
      return mockAlumnos[index];
    },
    delete: async (args: { where: { id: number } }) => {
      const index = mockAlumnos.findIndex((a) => a.id === args.where.id);
      if (index === -1) {
        throw new Error('Alumno no encontrado');
      }
      // Baja lógica: cambiar status a NO_ACTIVO
      mockAlumnos[index].status = 'NO_ACTIVO';
      return mockAlumnos[index];
    },
  },
};

