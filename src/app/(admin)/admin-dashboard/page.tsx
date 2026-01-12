import { protectPage } from '@/lib/page-protection';
import { Rol } from '@prisma/client';

export default async function AdminDashboardPage() {
  await protectPage(Rol.SUPER_ADMIN);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Dashboard Admin
      </h1>
    </div>
  );
}

