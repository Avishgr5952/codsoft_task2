import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'pglite-server';
import { execSync } from 'child_process';
import net from 'net';
import path from 'path';
import fs from 'fs';

function isPortOpen(port: number, host = 'localhost'): Promise<boolean> {
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

async function run() {
  const port = parseInt(process.env.PG_PORT || '5432', 10);
  let serverInstance: any = null;

  const alreadyRunning = await isPortOpen(port);
  if (!alreadyRunning) {
    console.log(`[setup-db] Starting embedded PostgreSQL on port ${port}...`);
    const dataDir = path.join(process.cwd(), 'pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const db = new PGlite(dataDir);
    serverInstance = createServer(db);
    await new Promise<void>((resolve) => {
      serverInstance.listen(port, () => {
        console.log(`[setup-db] Embedded PostgreSQL ready on port ${port}.`);
        resolve();
      });
    });
  } else {
    console.log(`[setup-db] PostgreSQL server already detected on port ${port}.`);
  }

  try {
    console.log('[setup-db] Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('[setup-db] Pushing Prisma schema to database...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

    console.log('[setup-db] Seeding database with demo data...');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });

    console.log('[setup-db] Database setup & seed finished successfully!');
  } catch (error) {
    console.error('[setup-db] Error during setup:', error);
    process.exitCode = 1;
  } finally {
    if (serverInstance) {
      console.log('[setup-db] Stopping temporary embedded PG server...');
      serverInstance.close();
    }
  }
}

run();
