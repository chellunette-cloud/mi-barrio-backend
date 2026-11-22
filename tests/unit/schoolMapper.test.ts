import { describe, expect, it } from 'vitest';
import { loadSchoolSeeds } from '../../src/infrastructure/etl/schoolMapper.js';

describe('loadSchoolSeeds', () => {
  it('conserva sede, dirección y sector declarados por la fuente F-04', async () => {
    const seeds = await loadSchoolSeeds();
    expect(seeds.length).toBeGreaterThan(0);
    expect(seeds.every((seed) => seed.categoria === 'educacion')).toBe(true);
    expect(seeds.every((seed) => seed.tipo === 'colegio')).toBe(true);
    expect(seeds.every((seed) => seed.fuente === 'F-04')).toBe(true);
    expect(seeds.every((seed) => seed.direccion !== null)).toBe(true);
    expect(seeds.every((seed) => ['oficial', 'privado', 'no informado'].includes(seed.sector ?? ''))).toBe(true);
    expect(seeds.some((seed) => seed.nombre.includes('MAGNO'))).toBe(true);
  });
});
