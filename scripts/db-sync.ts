import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Parse CLI flags
const args: string[] = process.argv.slice(2);
const isDev: boolean = args.includes('--dev') || args.includes('-d');
const isProd: boolean = args.includes('--prod') || args.includes('-p');

if (!isDev && !isProd) {
  console.log(`
\x1b[33m[DB Sync CLI Utility]\x1b[0m
Please specify an environment target flag:

  \x1b[36m--dev  (or -d)\x1b[0m  : Sync schema with DEV database (.env -> upsc_dev)
  \x1b[36m--prod (or -p)\x1b[0m  : Sync schema with PROD database (.env.production -> upsc_prod)

Examples:
  \x1b[32mnpm run db:sync:dev\x1b[0m   (or \x1b[32mnpx tsx scripts/db-sync.ts --dev\x1b[0m)
  \x1b[32mnpm run db:sync:prod\x1b[0m  (or \x1b[32mnpx tsx scripts/db-sync.ts --prod\x1b[0m)
`);
  process.exit(0);
}

const rootDir: string = path.resolve(__dirname, '..');
const envFile: string = isProd ? '.env.production' : '.env';
const envPath: string = path.join(rootDir, envFile);

if (!fs.existsSync(envPath)) {
  console.error(`\x1b[31m[ERROR]\x1b[0m Environment file "${envFile}" not found at ${envPath}`);
  process.exit(1);
}

// Read env file and load variables
const envContent: string = fs.readFileSync(envPath, 'utf8');
const envVars: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: isProd ? 'production' : 'development',
};

envContent.split('\n').forEach((line: string) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      let val = trimmed.substring(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      envVars[key] = val;
    }
  }
});

const targetDbName: string = isProd ? 'upsc_prod (PROD)' : 'upsc_dev (DEV)';
console.log(`\n\x1b[34m==========================================\x1b[0m`);
console.log(`\x1b[1m\x1b[36m🚀 Starting Manual Database Schema Sync\x1b[0m`);
console.log(`\x1b[33mTarget Environment:\x1b[0m ${targetDbName}`);
console.log(`\x1b[33mLoaded Config File:\x1b[0m ${envFile}`);
console.log(`\x1b[34m==========================================\x1b[0m\n`);

try {
  console.log(`\x1b[35m[1/2] Running Prisma DB Push...\x1b[0m`);
  execSync('npx prisma db push', {
    stdio: 'inherit',
    cwd: rootDir,
    env: envVars,
  });

  console.log(`\n\x1b[35m[2/2] Generating Prisma Client...\x1b[0m`);
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: rootDir,
    env: envVars,
  });

  console.log(`\n\x1b[32m\x1b[1m✅ Successfully synced database schema & generated Prisma client for ${targetDbName}!\x1b[0m\n`);
} catch (err: any) {
  console.error(`\n\x1b[31m\x1b[1m❌ DB Sync failed:\x1b[0m`, err?.message || err);
  process.exit(1);
}
