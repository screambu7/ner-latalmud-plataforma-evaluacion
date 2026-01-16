import { protectPageWithAnyRole } from '@/lib/page-protection';
import { Rol } from '@prisma/client';

export default async function MisAlumnosPage() {
  // SUPER_ADMIN puede acceder para testing/auditoría
  await protectPageWithAnyRole([Rol.EVALUADOR, Rol.SUPER_ADMIN]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Mis Alumnos
      </h1>
    </div>
  );
}



