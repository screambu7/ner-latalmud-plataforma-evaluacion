import { PrismaClient } from '@prisma/client';
import { mockDb } from './mock-data';

// Usar datos mock si no hay DATABASE_URL configurada
const useMock = !process.env.DATABASE_URL;

export const db = useMock ? (mockDb as any) : new PrismaClient();

