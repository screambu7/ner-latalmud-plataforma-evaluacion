import { NextResponse } from 'next/server';
import { PrismaClient, Rol } from '@prisma/client';
import { SUPER_ADMIN_EMAILS, isSuperAdminEmail } from '@/config/super-admins';

/**
 * Endpoint temporal para ejecutar seed de base de datos
 * 
 * ⚠️ SEGURIDAD:
 * - Solo funciona en entornos de staging/preview (no production)
 * - Requiere token secreto en header: X-Seed-Token
 * - Token debe coincidir con SEED_SECRET_TOKEN en variables de entorno
 * 
 * USO:
 * POST /api/seed
 * Headers: { "X-Seed-Token": "tu-token-secreto" }
 */
export async function POST(request: Request) {
  try {
    // Verificar que no estemos en production
    if (process.env.VERCEL_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seed no permitido en production' },
        { status: 403 }
      );
    }

    // Verificar token secreto (REQUERIDO)
    const seedToken = request.headers.get('X-Seed-Token');
    const expectedToken = process.env.SEED_SECRET_TOKEN;
    
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'SEED_SECRET_TOKEN no está configurado. El endpoint está deshabilitado por seguridad.' },
        { status: 403 }
      );
    }
    
    if (!seedToken || seedToken !== expectedToken) {
      return NextResponse.json(
        { error: 'Token inválido o faltante' },
        { status: 401 }
      );
    }

    const prisma = new PrismaClient();

    try {
      console.log('🌱 Iniciando seed desde API...');

      // Definir usuarios a crear/actualizar
      const usuariosSeed = [
        {
          correo: '[REDACTED_EMAIL_1]',
          nombre: 'Teddy',
          rol: Rol.SUPER_ADMIN,
        },
        {
          correo: '[REDACTED_EMAIL_2]',
          nombre: 'Moshe',
          rol: Rol.SUPER_ADMIN,
        },
        {
          correo: '[REDACTED_EMAIL_3]',
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
        // No loguear email completo en producción (PII)
        if (process.env.NODE_ENV === 'development') {
          console.log(`  ✅ ${usuario.nombre} (${usuario.correo}) - Rol: ${usuario.rol}`);
        } else {
          console.log(`  ✅ ${usuario.nombre} - Rol: ${usuario.rol}`);
        }
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
          if (process.env.NODE_ENV === 'development') {
            console.log(`  🔄 Actualizado ${email} a SUPER_ADMIN`);
          } else {
            console.log(`  🔄 Actualizado usuario a SUPER_ADMIN`);
          }
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
          if (process.env.NODE_ENV === 'development') {
            console.log(`  ✅ Creado ${email} como SUPER_ADMIN`);
          } else {
            console.log(`  ✅ Creado usuario como SUPER_ADMIN`);
          }
        }
      }

      console.log('✅ Usuarios procesados');

      // Crear algunos alumnos de ejemplo (solo si no existen)
      const existingAlumnos = await prisma.alumno.findMany({
        where: {
          OR: [
            { correo: 'juan@ejemplo.com' },
            { correo: 'maria@ejemplo.com' },
          ],
        },
      });

      const alumnosCreados = [];
      if (!existingAlumnos.find(a => a.correo === 'juan@ejemplo.com')) {
        const alumno1 = await prisma.alumno.create({
          data: {
            nombre: 'Juan Pérez',
            correo: 'juan@ejemplo.com',
            tipo: 'ESCUELA',
            status: 'ACTIVO',
          },
        });
        alumnosCreados.push(alumno1);
      }

      if (!existingAlumnos.find(a => a.correo === 'maria@ejemplo.com')) {
        const alumno2 = await prisma.alumno.create({
          data: {
            nombre: 'María González',
            correo: 'maria@ejemplo.com',
            tipo: 'INDEPENDIENTE',
            status: 'ACTIVO',
          },
        });
        alumnosCreados.push(alumno2);
      }

      console.log('✅ Alumnos procesados');
      console.log('🎉 Seed completado!');

      await prisma.$disconnect();

      return NextResponse.json({
        success: true,
        message: 'Seed ejecutado exitosamente',
        usuarios: usuariosCreados.length,
        alumnos: alumnosCreados.length,
      });
    } catch (error: any) {
      await prisma.$disconnect();
      console.error('❌ Error en seed:', error);
      return NextResponse.json(
        {
          error: 'Error al ejecutar seed',
          details: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error general:', error);
    return NextResponse.json(
      {
        error: 'Error al procesar solicitud',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
