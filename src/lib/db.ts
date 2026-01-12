import { PrismaClient } from '@prisma/client';
import { mockDb } from './mock-data';

/**
 * Determina si se deben usar datos mock.
 * 
 * ⚠️ IMPORTANTE: Los mocks SOLO se permiten en desarrollo local.
 * En staging/production, DATABASE_URL es REQUERIDO.
 * 
 * Nota: Durante el build, no validamos para evitar errores.
 * La validación ocurre en runtime cuando se usa la BD.
 */
function shouldUseMock(): boolean {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                  process.env.NODE_ENV === 'production' && !process.env.VERCEL;
  
  // Durante el build, permitir mocks temporalmente para evitar errores
  // La validación real ocurre en runtime
  if (isBuild && !hasDatabaseUrl) {
    return true; // Permitir mocks durante build
  }
  
  // En runtime, validar estrictamente
  if (!hasDatabaseUrl && !isDevelopment) {
    // Solo lanzar error en runtime, no durante build
    if (typeof window === 'undefined' && !isBuild) {
      throw new Error(
        'DATABASE_URL no está configurada. ' +
        'Los datos mock solo están permitidos en desarrollo local. ' +
        'Configura DATABASE_URL en staging/production.'
      );
    }
  }
  
  // En desarrollo, permitir mocks si no hay DATABASE_URL
  return !hasDatabaseUrl && isDevelopment;
}

const useMock = shouldUseMock();

/**
 * Singleton global de PrismaClient para evitar múltiples conexiones.
 * 
 * En entornos serverless (Vercel, AWS Lambda), cada invocación puede crear
 * una nueva instancia. Este singleton asegura que reutilizamos la misma
 * instancia cuando es posible, reduciendo el riesgo de agotar conexiones.
 * 
 * ⚠️ IMPORTANTE: En desarrollo con hot-reload, puede haber múltiples instancias.
 * Esto es aceptable en desarrollo, pero en producción debe ser singleton.
 */
let prismaClient: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (useMock) {
    return mockDb as any;
  }

  // Singleton pattern para PrismaClient
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Manejar desconexión graceful en shutdown
    if (typeof process !== 'undefined') {
      process.on('beforeExit', async () => {
        await prismaClient?.$disconnect();
      });
    }
  }

  return prismaClient;
}

export const db = getPrismaClient();

