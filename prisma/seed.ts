import { PrismaClient, Rol } from '@prisma/client';
import { SUPER_ADMIN_EMAILS, isSuperAdminEmail } from '../src/config/super-admins';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Definir usuarios a crear/actualizar
  const usuariosSeed = [
    {
      correo: 'teddy@nerlatalmud.com',
      nombre: 'Teddy',
      rol: Rol.SUPER_ADMIN,
    },
    {
      correo: 'moshe@nerlatalmud.com',
      nombre: 'Moshe',
      rol: Rol.SUPER_ADMIN,
    },
    {
      correo: 'evaluador@nerlatalmud.com',
      nombre: 'Evaluador Test',
      rol: Rol.EVALUADOR,
    },
  ];

  // Crear/actualizar usuarios
  const usuariosCreados = [];
  for (const usuarioData of usuariosSeed) {
    // Determinar rol: si el correo está en SUPER_ADMIN_EMAILS, forzar SUPER_ADMIN
    const rolFinal = isSuperAdminEmail(usuarioData.correo)
      ? Rol.SUPER_ADMIN
      : usuarioData.rol;

    const usuario = await prisma.usuario.upsert({
      where: { correo: usuarioData.correo },
      update: {
        // Actualizar rol si el correo está en la lista de super admins
        rol: isSuperAdminEmail(usuarioData.correo) ? Rol.SUPER_ADMIN : undefined,
        nombre: usuarioData.nombre,
        estado: 'ACTIVO',
      },
      create: {
        nombre: usuarioData.nombre,
        correo: usuarioData.correo,
        rol: rolFinal,
        estado: 'ACTIVO',
      },
    });

    usuariosCreados.push(usuario);
    console.log(`  ✅ ${usuario.nombre} (${usuario.correo}) - Rol: ${usuario.rol}`);
  }

  // Asegurar que todos los correos en SUPER_ADMIN_EMAILS tengan rol SUPER_ADMIN
  for (const email of SUPER_ADMIN_EMAILS) {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: email },
    });

    if (usuario && usuario.rol !== Rol.SUPER_ADMIN) {
      await prisma.usuario.update({
        where: { correo: email },
        data: { rol: Rol.SUPER_ADMIN },
      });
      console.log(`  🔄 Actualizado ${email} a SUPER_ADMIN`);
    } else if (!usuario) {
      // Si no existe, crear con rol SUPER_ADMIN
      await prisma.usuario.create({
        data: {
          correo: email,
          nombre: email.split('@')[0], // Usar parte antes del @ como nombre
          rol: Rol.SUPER_ADMIN,
          estado: 'ACTIVO',
        },
      });
      console.log(`  ✅ Creado ${email} como SUPER_ADMIN`);
    }
  }

  console.log('✅ Usuarios procesados');

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



