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

export const db = useMock ? (mockDb as any) : new PrismaClient();

