import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { GetBarrio } from '../../src/application/barrio/GetBarrio.js';
import { GetBarrioGeometria } from '../../src/application/barrio/GetBarrioGeometria.js';
import type { BarrioRepository } from '../../src/domain/barrio/types.js';
import type { LugarRepository } from '../../src/domain/places/types.js';
import type { AdminRepository } from '../../src/domain/auth/types.js';
import { ListCategorias } from '../../src/application/places/ListCategorias.js';
import { ListLugares } from '../../src/application/places/ListLugares.js';
import { GetLugar } from '../../src/application/places/GetLugar.js';
import { StaticStatsRepository } from '../../src/infrastructure/stats/StaticStatsRepository.js';
import { GetDemografia } from '../../src/application/stats/GetDemografia.js';
import { GetSeguridad } from '../../src/application/stats/GetSeguridad.js';
import { LoginAdmin } from '../../src/application/auth/LoginAdmin.js';
import { RefreshSession } from '../../src/application/auth/RefreshSession.js';
import { JwtService } from '../../src/infrastructure/auth/JwtService.js';
import { barrio, geometria } from '../fixtures.js';

const token = 'test-service-token-1234567890';
const repository: BarrioRepository = {
  findBarrio: async () => barrio,
  findGeometria: async () => geometria
};
const lugarRepository: LugarRepository = {
  listCategorias: async () => [],
  listLugares: async () => [],
  listLugaresAdmin: async () => [],
  findLugar: async () => null,
  findLugarAdmin: async () => null,
  createLugar: async () => ({}) as any,
  updateLugar: async () => null,
  deleteLugar: async () => false,
  setPublished: async () => null
};
const places = {
  listCategorias: new ListCategorias(lugarRepository),
  listLugares: new ListLugares(lugarRepository),
  getLugar: new GetLugar(lugarRepository)
};
const statsRepository = new StaticStatsRepository();
const adminRepository: AdminRepository = {
  findUser: async () => null,
  createUser: async () => ({ id: 1, username: 'admin', passwordHash: 'x', role: 'admin' }),
  audit: async () => undefined,
  listAudit: async () => []
};
const jwt = new JwtService('test-jwt-secret-1234567890', 'test-refresh-secret-1234567890');
const app = createApp({
  getBarrio: new GetBarrio(repository),
  getBarrioGeometria: new GetBarrioGeometria(repository),
  ...places,
  listVias: { execute: async () => [] } as any,
  getDemografia: new GetDemografia(statsRepository),
  getSeguridad: new GetSeguridad(statsRepository),
  login: new LoginAdmin(adminRepository, jwt),
  refresh: new RefreshSession(adminRepository, jwt),
  lugares: lugarRepository,
  categorias: {
    listCategoriasAdmin: async () => [],
    findCategoria: async () => null,
    createCategoria: async () => ({}) as any,
    updateCategoria: async () => null,
    deleteCategoria: async () => ({ status: 'not_found', lugares: 0 })
  },
  admin: adminRepository,
  jwtSecret: 'test-jwt-secret-1234567890',
  jwtRefreshSecret: 'test-refresh-secret-1234567890',
  serviceToken: token
});

describe('HTTP interno', () => {
  it('rechaza solicitudes sin token de servicio', async () => {
    const response = await request(app).get('/internal/v1/barrio');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('NO_AUTORIZADO');
  });

  it('devuelve la ficha con token y request id', async () => {
    const response = await request(app).get('/internal/v1/barrio').set('X-Service-Token', token);
    expect(response.status).toBe(200);
    expect(response.body.poblacion.valor).toBe(3807);
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('devuelve la geometría y el health sin token', async () => {
    const geo = await request(app)
      .get('/internal/v1/barrio/geometria')
      .set('X-Service-Token', token);
    expect(geo.status).toBe(200);
    expect(geo.body.srid).toBe(4326);
    const health = await request(app).get('/internal/v1/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');
  });
});
