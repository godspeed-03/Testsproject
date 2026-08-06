import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

async function checkAivenDatabaseHealth() {
  const rawConnectionString = process.env.DATABASE_URL || '';
  const connectionString = rawConnectionString
    .replace(/\?sslmode=require.*/, '')
    .replace(/&sslmode=require.*/, '');

  let ssl: any = { rejectUnauthorized: false };
  const caFilePath = path.join(process.cwd(), 'ca.pem');
  if (process.env.AIVEN_CA_CERT) {
    ssl = { ca: process.env.AIVEN_CA_CERT.replace(/\\n/g, '\n'), rejectUnauthorized: true };
  } else if (fs.existsSync(caFilePath)) {
    ssl = { ca: fs.readFileSync(caFilePath, 'utf-8'), rejectUnauthorized: true };
  }

  const client = new pg.Client({ connectionString, ssl });
  const shouldKillIdle = process.argv.includes('--kill-idle');

  try {
    await client.connect();

    if (shouldKillIdle) {
      const killRes = await client.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE usename = 'avnadmin'
          AND state = 'idle'
          AND pid <> pg_backend_pid();
      `);
      console.log(`\n🧹 Terminated ${killRes.rowCount || 0} idle 'avnadmin' connections.\n`);
    }

    // 1. Connection Stats
    const maxRes = await client.query('SHOW max_connections;');
    const maxConnections = parseInt(maxRes.rows[0].max_connections, 10);

    const countRes = await client.query('SELECT count(*) FROM pg_stat_activity;');
    const totalOpenConnections = parseInt(countRes.rows[0].count, 10);
    const freeConnections = Math.max(0, maxConnections - totalOpenConnections);

    const userCountRes = await client.query("SELECT count(*) FROM pg_stat_activity WHERE usename = 'avnadmin';");
    const userOpenConnections = parseInt(userCountRes.rows[0].count, 10);
    const userFreeConnections = Math.max(0, maxConnections - userOpenConnections);

    const connDetailsRes = await client.query(`
      SELECT COALESCE(state, 'internal/system') as state, COALESCE(usename, 'system') as usename, client_addr, count(*) as count
      FROM pg_stat_activity
      GROUP BY state, usename, client_addr
      ORDER BY count DESC;
    `);

    // 2. Storage & Database Size Stats
    const dbSizeRes = await client.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size,
             pg_database_size(current_database()) as bytes_raw;
    `);
    const dbSizePretty = dbSizeRes.rows[0].size;
    const dbSizeBytes = parseInt(dbSizeRes.rows[0].bytes_raw, 10);
    const dbSizeMB = (dbSizeBytes / (1024 * 1024)).toFixed(2);

    const tableStatsRes = await client.query(`
      SELECT
        relname AS table_name,
        n_live_tup AS total_rows,
        pg_size_pretty(pg_total_relation_size(relid)) AS total_size
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC;
    `);

    console.log('\n==================================================');
    console.log('📊 AIVEN POSTGRESQL USED vs FREE STATS');
    console.log('==================================================');
    console.log(`💾 DB Storage Used        : ${dbSizePretty} (${dbSizeMB} MB)`);
    console.log('--------------------------------------------------');
    console.log(`🔌 Connection Limit (Max) : ${maxConnections} total slots`);
    console.log(`📱 App Used ('avnadmin')  : ${userOpenConnections} active | ${userFreeConnections} free slots available`);
    console.log(`⚡ Total DB Slots Used     : ${totalOpenConnections} used   | ${freeConnections} free slots remaining`);
    console.log('--------------------------------------------------');
    console.log('📑 TABLE STORAGE & ROW COUNTS:');
    console.table(tableStatsRes.rows);
    console.log('--------------------------------------------------');
    console.log('🔌 ACTIVE CONNECTION BREAKDOWN:');
    console.table(connDetailsRes.rows);
    console.log('==================================================');
    console.log('💡 Tip: Run "npx tsx scripts/check_connections.ts --kill-idle" to terminate stale idle connections.');
    console.log('==================================================\n');

    await client.end();
  } catch (err: any) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
}

checkAivenDatabaseHealth();
