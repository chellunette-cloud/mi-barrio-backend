import { describe, expect, it } from 'vitest';
import { barrio } from '../fixtures.js';

describe('mapBarrio', () => {
  it('mapea la ficha oficial y conserva sus fuentes', () => {
    expect(barrio.nombre).toBe('URBANIZACION CIUDAD GRANADA');
    expect(barrio.localidad).toEqual({ codigo: '08', nombre: 'Kennedy' });
    expect(barrio.upz).toEqual({ codigo: '82', nombre: 'Patio Bonito' });
    expect(barrio.area).toEqual({ hectareas: 9.1, metrosCuadrados: 94551.13 });
    expect(barrio.poblacion.valor).toBe(3807);
    expect(barrio.poblacion.tipo).toBe('estimacion');
    expect(barrio.manzanasEstrato2).toBe(34);
  });

  it('mantiene F-01 y F-02 con sus campos', () => {
    expect(barrio.fuentes).toHaveLength(2);
    expect(barrio.fuentes[0]?.codigo).toBe('F-01');
    expect(barrio.fuentes[1]?.campos).toContain('estrato');
  });
});
