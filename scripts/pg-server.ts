import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'pglite-server';
import path from 'path';
import fs from 'fs';

const port = parseInt(process.env.PG_PORT || '5432', 10);
const dataDir = path.join(process.cwd(), 'pgdata');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log(`[PG-Server] Initializing embedded PostgreSQL storage at: ${dataDir}`);
const db = new PGlite(dataDir);
const server = createServer(db);

server.listen(port, () => {
  console.log(`[PG-Server] Embedded PostgreSQL server listening on port ${port}`);
  console.log(`[PG-Server] Database URL: postgresql://postgres:postgres@localhost:${port}/dinedesk`);
});

process.on('SIGINT', async () => {
  console.log('[PG-Server] Shutting down embedded PostgreSQL...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[PG-Server] Shutting down embedded PostgreSQL...');
  server.close();
  process.exit(0);
});
