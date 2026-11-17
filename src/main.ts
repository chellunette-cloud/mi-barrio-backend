import 'dotenv/config';
import { Pool } from 'pg';
import { loadEnv } from './config/env.js';
import { GetBarrio } from './application/barrio/GetBarrio.js';
import { GetBarrioGeometria } from './application/barrio/GetBarrioGeometria.js';
import { ListCategorias } from './application/places/ListCategorias.js';
import { ListLugares } from './application/places/ListLugares.js';
import { GetLugar } from './application/places/GetLugar.js';
import { ListVias } from './application/vias/ListVias.js';
import { GetDemografia } from './application/stats/GetDemografia.js';
import { GetSeguridad } from './application/stats/GetSeguridad.js';
import { LoginAdmin } from './application/auth/LoginAdmin.js';
import { RefreshSession } from './application/auth/RefreshSession.js';
import { PostgresBarrioRepository } from './infrastructure/db/PostgresBarrioRepository.js';
import { PostgresLugarRepository } from './infrastructure/db/PostgresLugarRepository.js';
import { PostgresCategoriaRepository } from './infrastructure/db/PostgresCategoriaRepository.js';
import { PostgresViaRepository } from './infrastructure/db/PostgresViaRepository.js';
import { PostgresAdminRepository } from './infrastructure/db/PostgresAdminRepository.js';
import { StaticStatsRepository } from './infrastructure/stats/StaticStatsRepository.js';
import { JwtService } from './infrastructure/auth/JwtService.js';
import { createApp } from './infrastructure/http/app.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const repository = new PostgresBarrioRepository(pool);
  const lugarRepository = new PostgresLugarRepository(pool);
  const categoriaRepository = new PostgresCategoriaRepository(pool);
  const viaRepository = new PostgresViaRepository(pool);
  const statsRepository = new StaticStatsRepository();
  const adminRepository = new PostgresAdminRepository(pool);
  const jwt = new JwtService(env.JWT_SECRET, env.JWT_REFRESH_SECRET);
  if (env.ADMIN_USERNAME && env.ADMIN_PASSWORD) {
    const argon2 = await import('argon2');
    const hash = await argon2.hash(env.ADMIN_PASSWORD);
    await adminRepository.createUser(env.ADMIN_USERNAME, hash, 'admin').catch(() => undefined);
  }
  const app = createApp({
    getBarrio: new GetBarrio(repository),
    getBarrioGeometria: new GetBarrioGeometria(repository),
    listCategorias: new ListCategorias(lugarRepository),
    listLugares: new ListLugares(lugarRepository),
    getLugar: new GetLugar(lugarRepository),
    listVias: new ListVias(viaRepository),
    getDemografia: new GetDemografia(statsRepository),
    getSeguridad: new GetSeguridad(statsRepository),
    login: new LoginAdmin(adminRepository, jwt),
    refresh: new RefreshSession(adminRepository, jwt),
    lugares: lugarRepository,
    categorias: categoriaRepository,
    admin: adminRepository,
    jwtSecret: env.JWT_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
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
