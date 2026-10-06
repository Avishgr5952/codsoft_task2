import EmbeddedPostgres from 'embedded-postgres';
import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import fs from 'fs';

function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function start() {
  const port = parseInt(process.env.PG_PORT || '5432', 10);
  const alreadyRunning = await isPortOpen(port);

  let pgInstance: any = null;

  if (!alreadyRunning) {
    console.log(`[DineDesk Dev] PostgreSQL server not detected on port ${port}. Starting embedded PostgreSQL...`);
    const pgDir = path.resolve(process.cwd(), 'pgdata');
    const isInit = fs.existsSync(path.join(pgDir, 'PG_VERSION'));

    pgInstance = new EmbeddedPostgres({
      port,
      databaseDir: pgDir,
      user: 'postgres',
      password: 'password',
      persistent: true,
    });

    if (!isInit) {
      console.log(`[DineDesk Dev] Initializing PostgreSQL cluster in ${pgDir}...`);
      await pgInstance.initialise();
    }

    await pgInstance.start();

    try {
      await pgInstance.createDatabase('dinedesk');
    } catch {}

    console.log(`[DineDesk Dev] Embedded PostgreSQL running at postgresql://postgres:password@localhost:${port}/dinedesk`);

    const cleanup = async () => {
      console.log('[DineDesk Dev] Stopping embedded PostgreSQL...');
      try {
        await pgInstance.stop();
      } catch {}
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } else {
    console.log(`[DineDesk Dev] PostgreSQL service is already active on port ${port}.`);
  }

  console.log('[DineDesk Dev] Starting Next.js development server on port 3000...');
  const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
    stdio: 'inherit',
    shell: true,
  });

  nextProcess.on('exit', (code) => {
    if (pgInstance) {
      pgInstance.stop().catch(() => {});
    }
    process.exit(code || 0);
  });
}

start().catch((err) => {
  console.error('[DineDesk Dev] Startup error:', err);
  process.exit(1);
});
