import { PrismaClient, Rol } from '@prisma/client';
import { SUPER_ADMIN_EMAILS, isSuperAdminEmail } from '../src/config/super-admins';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Obtener emails desde variable de entorno (NO hardcodear)
  const superAdminEmails = SUPER_ADMIN_EMAILS;
  
  if (superAdminEmails.length === 0) {
    console.error('❌ SUPER_ADMIN_EMAILS no está configurado. Configura la variable de entorno antes de ejecutar el seed.');
    console.error('   Ejemplo: export SUPER_ADMIN_EMAILS="email1@example.com,email2@example.com"');
    process.exit(1);
  }

  // Crear usuarios desde SUPER_ADMIN_EMAILS
  const usuariosCreados = [];
  for (const email of superAdminEmails) {
    const nombre = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1); // Capitalizar nombre

    const usuario = await prisma.usuario.upsert({
      where: { correo: email },
      update: {
        rol: Rol.SUPER_ADMIN, // Siempre asegurar SUPER_ADMIN
        nombre,
        estado: 'ACTIVO',
      },
      create: {
        nombre,
        correo: email,
        rol: Rol.SUPER_ADMIN,
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



