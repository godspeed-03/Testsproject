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

const pool = new pg.Pool({
  connectionString,
  ssl: getSslConfig(),
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
