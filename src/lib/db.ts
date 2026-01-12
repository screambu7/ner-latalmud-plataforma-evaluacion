import { PrismaClient } from '@prisma/client';
import { mockDb } from './mock-data';

/**
 * Determina si se deben usar datos mock.
 * 
 * ⚠️ IMPORTANTE: Los mocks SOLO se permiten en desarrollo local.
 * En staging/production, DATABASE_URL es REQUERIDO.
 */
function shouldUseMock(): boolean {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Solo permitir mocks en desarrollo local
  if (!hasDatabaseUrl && !isDevelopment) {
    throw new Error(
      'DATABASE_URL no está configurada. ' +
      'Los datos mock solo están permitidos en desarrollo local. ' +
      'Configura DATABASE_URL en staging/production.'
    );
  }
  
  // En desarrollo, permitir mocks si no hay DATABASE_URL
  return !hasDatabaseUrl && isDevelopment;
}

const useMock = shouldUseMock();

export const db = useMock ? (mockDb as any) : new PrismaClient();

