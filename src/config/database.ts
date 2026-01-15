import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrisma();

export async function connectPostgres() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    console.warn('⚠️ Continuing without PostgreSQL connection');
  }
}

export async function disconnectPostgres() {
  await prisma.$disconnect();
}
