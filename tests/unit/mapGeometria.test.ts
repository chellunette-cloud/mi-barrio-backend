import { describe, expect, it } from 'vitest';
import { geometria } from '../fixtures.js';

describe('mapGeometria', () => {
  it('publica el polígono y el centroide oficial', () => {
    expect(geometria.geometria.type).toBe('Polygon');
    expect(geometria.vertices).toBe(58);
    expect(geometria.srid).toBe(4326);
    expect(geometria.centroide.lat).toBeCloseTo(4.641833, 6);
    expect(geometria.centroide.lon).toBeCloseTo(-74.171758, 6);
    expect(geometria.fuente.codigo).toBe('F-01');
  });
});
