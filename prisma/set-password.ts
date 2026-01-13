/**
 * Script de utilidad para configurar passwordHash de un usuario
 * 
 * Uso:
 *   PASSWORD="Ner2026!" EMAIL="moshe@nerlatalmud.com" npx tsx prisma/set-password.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    console.error('❌ ERROR: EMAIL y PASSWORD son requeridos');
    console.error('');
    console.error('Uso:');
    console.error('  EMAIL="moshe@nerlatalmud.com" PASSWORD="Ner2026!" npx tsx prisma/set-password.ts');
    process.exit(1);
  }

  const emailNormalizado = email.trim().toLowerCase();

  console.log(`🔐 Configurando contraseña para: ${emailNormalizado}`);
  console.log('');

  // Buscar usuario
  const usuario = await prisma.usuario.findUnique({
    where: { correo: emailNormalizado },
  });

  if (!usuario) {
    console.error(`❌ Usuario no encontrado: ${emailNormalizado}`);
    process.exit(1);
  }

  console.log(`✅ Usuario encontrado: ${usuario.nombre} (ID: ${usuario.id})`);
  console.log(`   Rol: ${usuario.rol}`);
  console.log('');

  // Hashear contraseña
  console.log('🔒 Hasheando contraseña...');
  const passwordHash = await bcrypt.hash(password, 10);
  console.log('✅ Contraseña hasheada');
  console.log('');

  // Actualizar usuario
  console.log('💾 Actualizando usuario en base de datos...');
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { passwordHash },
  });
  console.log('✅ Usuario actualizado exitosamente');
  console.log('');

  console.log('🎉 ¡Contraseña configurada!');
  console.log('');
  console.log(`Ahora puedes iniciar sesión con:`);
  console.log(`  Email: ${emailNormalizado}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
