import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { databaseUrl } from '../../src/config/database.js';
import { PostgresLugarRepository } from '../../src/infrastructure/db/PostgresLugarRepository.js';

const pool = new Pool({ connectionString: databaseUrl });
const repository = new PostgresLugarRepository(pool);

beforeAll(async () => {
  await pool.query('SELECT 1 FROM lugar LIMIT 1');
});

afterAll(async () => {
  await pool.end();
});

describe('Búsqueda de lugares en PostgreSQL/PostGIS', () => {
  it('ignora tildes, mayúsculas y la ñ en el nombre', async () => {
    const lugares = await repository.listLugares({ q: 'nino' });
    expect(lugares.some((lugar) => lugar.nombre.includes('NIÑO'))).toBe(true);
  });

  it('tolera acentos en el texto buscado', async () => {
    const lugares = await repository.listLugares({ q: 'panadería' });
    expect(lugares.some((lugar) => lugar.nombre === 'Panaderia Tennesse')).toBe(true);
  });

  it('busca por dirección sin distinguir mayúsculas', async () => {
    const minusculas = await repository.listLugares({ q: 'cl 40 sur' });
    const mayusculas = await repository.listLugares({ q: 'CL 40 SUR' });
    expect(minusculas.some((lugar) => lugar.direccion?.includes('CL 40 SUR'))).toBe(true);
    expect(mayusculas.some((lugar) => lugar.direccion?.includes('CL 40 SUR'))).toBe(true);
    expect(mayusculas.length).toBe(minusculas.length);
  });

  it('no devuelve resultados cuando no existe coincidencia', async () => {
    const lugares = await repository.listLugares({ q: 'direccion-inexistente-xyz' });
    expect(lugares).toHaveLength(0);
  });

  it('filtra por la subcategoría real de la fuente OSM', async () => {
    const lugares = await repository.listLugares({ categoria: 'comercio', tipo: 'supermarket' });
    expect(lugares.length).toBeGreaterThan(0);
    expect(lugares.every((lugar) => lugar.tipo === 'supermarket')).toBe(true);
  });

  it('devuelve educación ordenada por cercanía', async () => {
    const lugares = await repository.listLugares({ categoria: 'educacion' });
    const distancias = lugares.map((lugar) => lugar.distanciaM ?? Infinity);
    expect([...distancias].sort((a, b) => a - b)).toEqual(distancias);
  });
});
