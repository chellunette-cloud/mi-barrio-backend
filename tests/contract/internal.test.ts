import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { GetBarrio } from '../../src/application/barrio/GetBarrio.js';
import { GetBarrioGeometria } from '../../src/application/barrio/GetBarrioGeometria.js';
import { ListCategorias } from '../../src/application/places/ListCategorias.js';
import { ListLugares } from '../../src/application/places/ListLugares.js';
import { GetLugar } from '../../src/application/places/GetLugar.js';
import type { BarrioRepository } from '../../src/domain/barrio/types.js';
import type { LugarRepository } from '../../src/domain/places/types.js';
import { barrio, geometria } from '../fixtures.js';

const repository: BarrioRepository = {
  findBarrio: async () => barrio,
  findGeometria: async () => geometria
};
const lugarRepository: LugarRepository = {
  listCategorias: async () => [],
  listLugares: async () => [],
  findLugar: async () => null
};
const places = {
  listCategorias: new ListCategorias(lugarRepository),
  listLugares: new ListLugares(lugarRepository),
  getLugar: new GetLugar(lugarRepository)
};
const app = createApp({
  getBarrio: new GetBarrio(repository),
  getBarrioGeometria: new GetBarrioGeometria(repository),
  ...places,
  serviceToken: 'contract-token-1234567890'
});

describe('Contrato interno', () => {
  it('declara las rutas internas y la seguridad por token', async () => {
    const contract = await readFile(join(process.cwd(), 'contracts/internal.openapi.yaml'), 'utf8');
    expect(contract).toContain('/internal/v1/barrio:');
    expect(contract).toContain('/internal/v1/barrio/geometria:');
    expect(contract).toContain('ServiceToken');
  });

  it('la respuesta real conserva los campos canónicos de Barrio', async () => {
    const response = await request(app)
      .get('/internal/v1/barrio')
      .set('X-Service-Token', 'contract-token-1234567890');
    expect(response.status).toBe(200);
    expect(Object.keys(response.body)).toEqual(
      expect.arrayContaining(['slug', 'nombre', 'localidad', 'upz', 'poblacion', 'fuentes'])
    );
  });
});
