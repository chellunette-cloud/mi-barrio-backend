import { describe, expect, it } from 'vitest';
import { loadCommerceSeeds } from '../../src/infrastructure/etl/commerceMapper.js';

describe('loadCommerceSeeds', () => {
  it('conserva el shop de OSM como subcategoría verificable', async () => {
    const seeds = await loadCommerceSeeds();
    expect(seeds.length).toBe(25);
    expect(seeds.every((seed) => seed.categoria === 'comercio')).toBe(true);
    expect(seeds.every((seed) => typeof seed.tipo === 'string' && seed.tipo.length > 0)).toBe(true);
    expect(seeds.every((seed) => seed.fuente === 'F-16')).toBe(true);
    expect(new Set(seeds.map((seed) => seed.tipo)).has('supermarket')).toBe(true);
  });
});
