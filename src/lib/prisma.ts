import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const rawConnectionString = process.env.DATABASE_URL || '';
const connectionString = rawConnectionString
  .replace(/\?sslmode=require.*/, '')
  .replace(/&sslmode=require.*/, '');

function getSslConfig(): pg.PoolConfig['ssl'] {
  if (process.env.AIVEN_CA_CERT) {
    const ca = process.env.AIVEN_CA_CERT.replace(/\\n/g, '\n');
    return { ca, rejectUnauthorized: true };
  }
  const caFilePath = path.join(process.cwd(), 'ca.pem');
  if (fs.existsSync(caFilePath)) {
    const ca = fs.readFileSync(caFilePath, 'utf-8');
    return { ca, rejectUnauthorized: true };
  }
  return { rejectUnauthorized: false };
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: pg.Pool;
};

if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new pg.Pool({
    connectionString,
    ssl: getSslConfig(),
    max: 2,
    idleTimeoutMillis: 2000,
    connectionTimeoutMillis: 5000,
  });
}

const pool = globalForPrisma.pgPool;

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(pool);
  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: ['error'],
  });
}

export const prisma = globalForPrisma.prisma;
export default prisma;
