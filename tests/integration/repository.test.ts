import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { databaseUrl } from '../../src/config/database.js';
import { PostgresBarrioRepository } from '../../src/infrastructure/db/PostgresBarrioRepository.js';

const pool = new Pool({ connectionString: databaseUrl });
const repository = new PostgresBarrioRepository(pool);

beforeAll(async () => {
  await pool.query('SELECT 1 FROM barrio LIMIT 1');
});

afterAll(async () => {
  await pool.end();
});

describe('PostgresBarrioRepository', () => {
  it('lee la ficha y las fuentes desde PostgreSQL/PostGIS', async () => {
    const barrio = await repository.findBarrio();
    expect(barrio).not.toBeNull();
    expect(barrio?.codigoId).toBe('LEG00645');
    expect(barrio?.poblacion.valor).toBe(3807);
    expect(barrio?.manzanasEstrato2).toBe(34);
    expect(barrio?.fuentes.map((fuente) => fuente.codigo)).toEqual(['F-01', 'F-02']);
  });

  it('lee la geometría oficial con 58 vértices', async () => {
    const geometria = await repository.findGeometria();
    expect(geometria?.vertices).toBe(58);
    expect(geometria?.srid).toBe(4326);
    expect(geometria?.geometria.coordinates[0]?.length).toBe(58);
  });
});
