-- AlterTable
-- Add passwordHash column to Usuario table
-- This column is nullable to support existing users without passwords
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
