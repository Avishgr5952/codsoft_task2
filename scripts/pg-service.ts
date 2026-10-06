import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import fs from 'fs';

const port = parseInt(process.env.PG_PORT || '5432', 10);
const pgDir = path.resolve(process.cwd(), 'pgdata');

async function run() {
  const isInit = fs.existsSync(path.join(pgDir, 'PG_VERSION'));
  const pg = new EmbeddedPostgres({
    port,
    databaseDir: pgDir,
    user: 'postgres',
    password: 'password',
    persistent: true,
  });

  if (!isInit) {
    console.log(`[pg-service] Initializing cluster in ${pgDir}...`);
    await pg.initialise();
  }

  console.log(`[pg-service] Starting PostgreSQL server on port ${port}...`);
  await pg.start();

  try {
    await pg.createDatabase('dinedesk');
    console.log('[pg-service] Database "dinedesk" ready.');
  } catch (e: any) {
    // Already created
  }

  console.log(`[pg-service] PostgreSQL is ready and accepting connections!`);
  console.log(`[pg-service] Connection string: postgresql://postgres:password@localhost:${port}/dinedesk`);

  const onExit = async () => {
    console.log('[pg-service] Stopping PostgreSQL...');
    try {
      await pg.stop();
    } catch {}
    process.exit(0);
  };

  process.on('SIGINT', onExit);
  process.on('SIGTERM', onExit);
}

run().catch((err) => {
  console.error('[pg-service] Error:', err);
  process.exit(1);
});
