/**
 * Demo Seed Script - Ner LaTalmud
 * 
 * ⚠️ IMPORTANTE: Este script crea datos de DEMOSTRACIÓN.
 * NO es para datos de prueba ni producción.
 * 
 * Requiere dos variables de entorno para seguridad:
 * - DEMO_SEED_ENABLED=true
 * - DEMO_SEED_CONFIRM=YES_I_KNOW_WHAT_I_AM_DOING
 * 
 * Ejecutar: npm run db:seed:demo
 */

import { PrismaClient, Rol, EstadoCuenta, TipoAlumno, StatusAlumno, TipoDiagnostico, TipoReporte } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

// ============================================
// VALIDACIÓN DE SEGURIDAD
// ============================================

function validateSafetyFlags(): void {
  const enabled = process.env.DEMO_SEED_ENABLED === 'true';
  const confirmed = process.env.DEMO_SEED_CONFIRM === 'YES_I_KNOW_WHAT_I_AM_DOING';

  if (!enabled || !confirmed) {
    console.error('❌ ERROR: Flags de seguridad no configurados correctamente.');
    console.error('');
    console.error('Este script requiere AMBAS variables de entorno:');
    console.error('  DEMO_SEED_ENABLED=true');
    console.error('  DEMO_SEED_CONFIRM=YES_I_KNOW_WHAT_I_AM_DOING');
    console.error('');
    console.error('Por favor, configura estas variables antes de ejecutar el script.');
    process.exit(1);
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Genera un hash aleatorio para passwordHash (no se usará, pero es seguro)
 */
function generateRandomPasswordHash(): string {
  const bytes = randomBytes(32);
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Genera un email demo único
 */
function generateDemoEmail(prefix: string, index?: number): string {
  const suffix = index !== undefined ? `${index}` : '';
  return `demo.${prefix}${suffix}@demo.nerlatalmud.local`;
}

/**
 * Selecciona un valor aleatorio de un array
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Genera un número aleatorio entre min y max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genera una fecha aleatoria en el pasado (últimos 6 meses)
 */
function randomPastDate(): Date {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
}

// ============================================
// DATOS DE DEMO
// ============================================

const SUBHABILIDADES_DEMO = [
  'lectura_basica',
  'comprension_textual',
  'analisis_logico',
  'vocabulario_arameo',
  'traduccion_precisa',
  'identificacion_conceptos',
  'aplicacion_reglas',
  'sintesis_informacion',
  'interpretacion_contextual',
  'razonamiento_deductivo',
];

const TIPOS_DIAGNOSTICO: TipoDiagnostico[] = [
  'GV_EXP_DEF_FACIL',
  'GV_EXP_FACIL',
  'GV_HA_FACIL_NK',
  'GV_HA_FACIL_SN',
  'GN_EXP_DEF_FACIL',
  'GN_EXP_FACIL',
  'GN_HA_FACIL_NK',
  'GN_HA_FACIL_SN',
];

const TIPOS_REPORTE: TipoReporte[] = [
  'EVALUACION_INDIVIDUAL',
  'PROGRESO_ALUMNO',
  'ESTADISTICAS_ESCUELA',
];

const NOMBRES_ALUMNOS = [
  'David Cohen',
  'Sarah Levy',
  'Moshe Ben-David',
  'Rivka Goldstein',
  'Yosef Mizrahi',
  'Miriam Ashkenazi',
  'Avraham Sephardi',
  'Chana Rosen',
  'Shlomo Katz',
  'Leah Friedman',
];

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🌱 Iniciando demo seed...');
  console.log('');

  // Validar flags de seguridad
  validateSafetyFlags();

  // Obtener email de admin desde env
  const adminEmail = process.env.DEMO_ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('❌ ERROR: DEMO_ADMIN_EMAIL no está configurado.');
    console.error('Por favor, configura DEMO_ADMIN_EMAIL en las variables de entorno.');
    process.exit(1);
  }

  console.log('✅ Flags de seguridad validados');
  console.log(`📧 Email de admin demo: ${adminEmail}`);
  console.log('');

  // ============================================
  // 1. CREAR SUPER_ADMIN
  // ============================================
  console.log('👤 Creando SUPER_ADMIN...');
  const admin = await prisma.usuario.upsert({
    where: { correo: adminEmail },
    update: {
      nombre: 'Admin Demo',
      rol: Rol.SUPER_ADMIN,
      estado: EstadoCuenta.ACTIVO,
      passwordHash: generateRandomPasswordHash(), // Hash aleatorio, no se usará
    },
    create: {
      nombre: 'Admin Demo',
      correo: adminEmail,
      rol: Rol.SUPER_ADMIN,
      estado: EstadoCuenta.ACTIVO,
      passwordHash: generateRandomPasswordHash(),
    },
  });
  console.log(`  ✅ ${admin.nombre} (${admin.correo}) - ${admin.rol}`);
  console.log('');

  // ============================================
  // 2. CREAR EVALUADOR DEMO
  // ============================================
  console.log('👤 Creando Evaluador demo...');
  const evaluadorEmail = generateDemoEmail('evaluador');
  const evaluador = await prisma.usuario.upsert({
    where: { correo: evaluadorEmail },
    update: {
      nombre: 'Evaluador Demo',
      rol: Rol.EVALUADOR,
      estado: EstadoCuenta.ACTIVO,
      passwordHash: generateRandomPasswordHash(),
    },
    create: {
      nombre: 'Evaluador Demo',
      correo: evaluadorEmail,
      rol: Rol.EVALUADOR,
      estado: EstadoCuenta.ACTIVO,
      passwordHash: generateRandomPasswordHash(),
    },
  });
  console.log(`  ✅ ${evaluador.nombre} (${evaluador.correo}) - ${evaluador.rol}`);
  console.log('');

  // ============================================
  // 3. CREAR ESCUELA DEMO
  // ============================================
  console.log('🏫 Creando Escuela demo...');
  const escuela = await prisma.escuela.upsert({
    where: { id: 1 }, // Usar ID fijo para idempotencia
    update: {
      nombre: 'Yeshiva Demo Ner LaTalmud',
      direccion: '123 Calle Demo, Ciudad Demo',
      telefono: '+1-555-0100',
      correo: generateDemoEmail('escuela'),
      estado: EstadoCuenta.ACTIVO,
    },
    create: {
      id: 1, // ID fijo para idempotencia
      nombre: 'Yeshiva Demo Ner LaTalmud',
      direccion: '123 Calle Demo, Ciudad Demo',
      telefono: '+1-555-0100',
      correo: generateDemoEmail('escuela'),
      estado: EstadoCuenta.ACTIVO,
    },
  });
  console.log(`  ✅ ${escuela.nombre} (ID: ${escuela.id})`);
  console.log('');

  // Asociar evaluador a la escuela
  await prisma.usuario.update({
    where: { id: evaluador.id },
    data: { escuelaId: escuela.id },
  });
  console.log(`  ✅ Evaluador asociado a escuela`);
  console.log('');

  // ============================================
  // 4. CREAR ALUMNOS (5-10)
  // ============================================
  console.log('👥 Creando Alumnos demo...');
  const numAlumnos = randomInt(5, 10);
  const alumnos = [];

  for (let i = 0; i < numAlumnos; i++) {
    const nombre = NOMBRES_ALUMNOS[i] || `Alumno Demo ${i + 1}`;
    const correoDemo = generateDemoEmail('alumno', i + 1);
    const tipo = randomChoice([TipoAlumno.ESCUELA, TipoAlumno.INDEPENDIENTE]);
    const status = randomChoice([
      StatusAlumno.ACTIVO,
      StatusAlumno.ACTIVO,
      StatusAlumno.ACTIVO, // Más probabilidad de ACTIVO
      StatusAlumno.EN_PAUSA,
      StatusAlumno.NIVEL_LOGRADO,
    ]);

    // Buscar si ya existe un alumno con este correo demo
    let alumno = await prisma.alumno.findFirst({
      where: { correo: correoDemo },
    });

    if (!alumno) {
      // Crear nuevo alumno
      alumno = await prisma.alumno.create({
        data: {
          nombre,
          correo: correoDemo,
          tipo,
          status,
          escuelaId: tipo === TipoAlumno.ESCUELA ? escuela.id : null,
        },
      });
      console.log(`  ✅ Creado: ${alumno.nombre} - ${alumno.tipo} - ${alumno.status}`);
    } else {
      // Actualizar alumno existente
      alumno = await prisma.alumno.update({
        where: { id: alumno.id },
        data: {
          nombre,
          tipo,
          status,
          escuelaId: tipo === TipoAlumno.ESCUELA ? escuela.id : null,
        },
      });
      console.log(`  🔄 Actualizado: ${alumno.nombre} - ${alumno.tipo} - ${alumno.status}`);
    }

    alumnos.push(alumno);
  }
  console.log(`  ✅ Total: ${alumnos.length} alumnos procesados`);
  console.log('');

  // ============================================
  // 5. CREAR EVALUACIONES (2-3 por alumno)
  // ============================================
  console.log('📊 Creando Evaluaciones demo...');
  const evaluaciones = [];

  for (const alumno of alumnos) {
    const numEvaluaciones = randomInt(2, 3);

    for (let i = 0; i < numEvaluaciones; i++) {
      const tipo = randomChoice(TIPOS_DIAGNOSTICO);
      const fecha = randomPastDate();

      const evaluacion = await prisma.evaluacion.create({
        data: {
          alumnoId: alumno.id,
          evaluadorId: evaluador.id,
          tipo,
          fecha,
        },
      });

      evaluaciones.push(evaluacion);
      console.log(`  ✅ Evaluación ${evaluacion.id} - ${alumno.nombre} - ${tipo}`);

      // ============================================
      // 6. CREAR EVALUACION_DETALLE
      // ============================================
      const numDetalles = randomInt(3, 6); // 3-6 subhabilidades por evaluación
      const subhabilidadesUsadas = new Set<string>();

      for (let j = 0; j < numDetalles; j++) {
        // Seleccionar subhabilidad que no hayamos usado en esta evaluación
        let subhabilidad: string;
        do {
          subhabilidad = randomChoice(SUBHABILIDADES_DEMO);
        } while (subhabilidadesUsadas.has(subhabilidad));
        subhabilidadesUsadas.add(subhabilidad);

        const nivel = randomInt(1, 4) as 1 | 2 | 3 | 4;

        await prisma.evaluacionDetalle.create({
          data: {
            evaluacionId: evaluacion.id,
            subhabilidad,
            nivel,
          },
        });
      }
      console.log(`    ✅ ${numDetalles} detalles creados`);
    }
  }
  console.log(`  ✅ Total: ${evaluaciones.length} evaluaciones creadas`);
  console.log('');

  // ============================================
  // 7. CREAR REPORTES (2-3 por evaluación)
  // ============================================
  console.log('📄 Creando Reportes demo...');
  const reportes = [];

  for (const evaluacion of evaluaciones) {
    const numReportes = randomInt(2, 3);

    for (let i = 0; i < numReportes; i++) {
      const tipo = randomChoice(TIPOS_REPORTE);
      const fechaInicio = randomPastDate();
      const fechaFin = new Date(fechaInicio.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000);

      const reporte = await prisma.reporte.create({
        data: {
          tipo,
          evaluacionId: evaluacion.id,
          alumnoId: evaluacion.alumnoId,
          generadoPorId: evaluador.id,
          contenido: {
            resumen: `Reporte demo de tipo ${tipo}`,
            fechaGeneracion: new Date().toISOString(),
            datos: {
              evaluacionId: evaluacion.id,
              tipoEvaluacion: evaluacion.tipo,
            },
          },
          fechaInicio,
          fechaFin,
        },
      });

      reportes.push(reporte);
      console.log(`  ✅ Reporte ${reporte.id} - ${tipo} - Evaluación ${evaluacion.id}`);
    }
  }
  console.log(`  ✅ Total: ${reportes.length} reportes creados`);
  console.log('');

  // ============================================
  // RESUMEN
  // ============================================
  console.log('🎉 Demo seed completado exitosamente!');
  console.log('');
  console.log('📊 Resumen:');
  console.log(`  👤 Usuarios: 2 (1 SUPER_ADMIN, 1 EVALUADOR)`);
  console.log(`  🏫 Escuelas: 1`);
  console.log(`  👥 Alumnos: ${alumnos.length}`);
  console.log(`  📊 Evaluaciones: ${evaluaciones.length}`);
  console.log(`  📄 Reportes: ${reportes.length}`);
  console.log('');
  console.log('⚠️  RECORDATORIO: Estos son datos de DEMOSTRACIÓN.');
  console.log('   No usar en producción ni como datos de prueba.');
  console.log('');
}

// ============================================
// EJECUCIÓN
// ============================================

main()
  .catch((e) => {
    console.error('❌ Error en demo seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
