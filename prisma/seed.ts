import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear usuarios de prueba
  const adminPrincipal = await prisma.usuario.upsert({
    where: { correo: 'admin@nerlatalmud.com' },
    update: {},
    create: {
      nombre: 'Admin Principal',
      correo: 'admin@nerlatalmud.com',
      rol: 'ADMIN_PRINCIPAL',
      estado: 'ACTIVO',
    },
  });

  const adminGeneral = await prisma.usuario.upsert({
    where: { correo: 'admin2@nerlatalmud.com' },
    update: {},
    create: {
      nombre: 'Admin General',
      correo: 'admin2@nerlatalmud.com',
      rol: 'ADMIN_GENERAL',
      estado: 'ACTIVO',
    },
  });

  const evaluador = await prisma.usuario.upsert({
    where: { correo: 'evaluador@nerlatalmud.com' },
    update: {},
    create: {
      nombre: 'Evaluador Test',
      correo: 'evaluador@nerlatalmud.com',
      rol: 'EVALUADOR',
      estado: 'ACTIVO',
    },
  });

  console.log('✅ Usuarios creados:');
  console.log('  - Admin Principal:', adminPrincipal.correo);
  console.log('  - Admin General:', adminGeneral.correo);
  console.log('  - Evaluador:', evaluador.correo);

  // Crear algunos alumnos de ejemplo
  const alumno1 = await prisma.alumno.create({
    data: {
      nombre: 'Juan Pérez',
      correo: 'juan@ejemplo.com',
      tipo: 'ESCUELA',
      status: 'ACTIVO',
    },
  });

  const alumno2 = await prisma.alumno.create({
    data: {
      nombre: 'María González',
      correo: 'maria@ejemplo.com',
      tipo: 'INDEPENDIENTE',
      status: 'ACTIVO',
    },
  });

  console.log('✅ Alumnos de ejemplo creados:', alumno1.nombre, alumno2.nombre);
  console.log('🎉 Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



