import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';

const token = 'health-service-token-1234567890';
const app = createApp({
  serviceToken: token,
  jwtSecret: 'health-jwt-secret-1234567890',
  jwtRefreshSecret: 'health-refresh-secret-1234567890'
} as any);

describe('Health interno protegido', () => {
  it('rechaza la petición sin token de servicio', async () => {
    const response = await request(app).get('/internal/v1/health');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('NO_AUTORIZADO');
  });

  it('rechaza la petición con token incorrecto', async () => {
    const response = await request(app)
      .get('/internal/v1/health')
      .set('X-Service-Token', 'token-incorrecto');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('NO_AUTORIZADO');
  });

  it('responde con el token de servicio válido', async () => {
    const response = await request(app)
      .get('/internal/v1/health')
      .set('X-Service-Token', token);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'mi-barrio-backend' });
  });
});
