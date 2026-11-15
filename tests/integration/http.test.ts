import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { GetBarrio } from '../../src/application/barrio/GetBarrio.js';
import { GetBarrioGeometria } from '../../src/application/barrio/GetBarrioGeometria.js';
import type { BarrioRepository } from '../../src/domain/barrio/types.js';
import { barrio, geometria } from '../fixtures.js';

const token = 'test-service-token-1234567890';
const repository: BarrioRepository = {
  findBarrio: async () => barrio,
  findGeometria: async () => geometria
};
const app = createApp({
  getBarrio: new GetBarrio(repository),
  getBarrioGeometria: new GetBarrioGeometria(repository),
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
