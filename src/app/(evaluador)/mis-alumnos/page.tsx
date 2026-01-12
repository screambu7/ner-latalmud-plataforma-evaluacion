import { protectPage } from '@/lib/page-protection';
import { Rol } from '@prisma/client';

export default async function MisAlumnosPage() {
  await protectPage(Rol.EVALUADOR);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Mis Alumnos
      </h1>
    </div>
  );
}



