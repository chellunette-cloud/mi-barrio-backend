import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { ListCategorias } from '../../src/application/places/ListCategorias.js';
import { ListLugares } from '../../src/application/places/ListLugares.js';
import { GetLugar } from '../../src/application/places/GetLugar.js';

const capturados: unknown[] = [];
const lugares: any = {
  listCategorias: async () => [],
  listLugares: async (filtro: unknown) => { capturados.push(filtro); return []; }
};
const app = createApp({
  listCategorias: new ListCategorias(lugares),
  listLugares: new ListLugares(lugares),
  getLugar: new GetLugar(lugares),
  lugares,
  serviceToken: 'test-service-token'
} as any);

describe('Filtros HTTP internos de lugares', () => {
  it('propaga búsqueda y subcategoría verificable al repositorio', async () => {
    const response = await request(app)
      .get('/internal/v1/lugares?q=ni%C3%B1o&tipo=supermarket')
      .set('X-Service-Token', 'test-service-token');
    expect(response.status).toBe(200);
    expect(capturados.at(-1)).toMatchObject({ q: 'niño', tipo: 'supermarket' });
  });

  it('acepta q ausente y q vacío', async () => {
    const base = '/internal/v1/lugares';
    const headers = { 'X-Service-Token': 'test-service-token' };
    expect((await request(app).get(base).set(headers)).status).toBe(200);
    expect((await request(app).get(`${base}?q=`).set(headers)).status).toBe(200);
  });

  it('acepta exactamente 60 caracteres en q', async () => {
    const response = await request(app)
      .get(`/internal/v1/lugares?q=${'x'.repeat(60)}`)
      .set('X-Service-Token', 'test-service-token');
    expect(response.status).toBe(200);
    expect(capturados.at(-1)).toMatchObject({ q: 'x'.repeat(60) });
  });

  it('rechaza una búsqueda fuera de la longitud del contrato', async () => {
    const response = await request(app)
      .get(`/internal/v1/lugares?q=${'x'.repeat(61)}`)
      .set('X-Service-Token', 'test-service-token');
    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('FILTRO_INVALIDO');
  });

  it('rechaza una subcategoría fuera de la longitud permitida', async () => {
    const response = await request(app)
      .get(`/internal/v1/lugares?tipo=${'x'.repeat(61)}`)
      .set('X-Service-Token', 'test-service-token');
    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('FILTRO_INVALIDO');
  });
});
