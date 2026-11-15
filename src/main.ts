import 'dotenv/config';
import { Pool } from 'pg';
import { loadEnv } from './config/env.js';
import { GetBarrio } from './application/barrio/GetBarrio.js';
import { GetBarrioGeometria } from './application/barrio/GetBarrioGeometria.js';
import { PostgresBarrioRepository } from './infrastructure/db/PostgresBarrioRepository.js';
import { createApp } from './infrastructure/http/app.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const repository = new PostgresBarrioRepository(pool);
  const app = createApp({
    getBarrio: new GetBarrio(repository),
    getBarrioGeometria: new GetBarrioGeometria(repository),
    serviceToken: env.SERVICE_TOKEN
  });
  const server = app.listen(env.PORT, env.HOST, () => {
    console.log(`mi-barrio-backend escuchando en ${env.HOST}:${env.PORT}`);
  });
  const shutdown = (): void => {
    server.close(() => {
      void pool.end().finally(() => process.exit(0));
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  console.error('No se pudo iniciar mi-barrio-backend:', error);
  process.exit(1);
});
