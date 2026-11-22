import { describe, expect, it } from 'vitest';
import { LUGARES_SQL } from '../../src/infrastructure/db/queries/lugarQueries.js';

describe('LUGARES_SQL', () => {
  it('normaliza tildes y mayúsculas acentuadas sin extensiones de PostgreSQL', () => {
    expect(LUGARES_SQL).toContain('translate(lower(l.nombre)');
    expect(LUGARES_SQL).toContain('Ñ');
    expect(LUGARES_SQL).not.toContain('ILIKE');
  });

  it('aplica la misma normalización a la dirección, incluida la ñ', () => {
    expect(LUGARES_SQL).toContain("translate(lower(COALESCE(l.direccion, ''))");
    expect(LUGARES_SQL).toContain('ñ');
    expect(LUGARES_SQL).toContain('Ñ');
  });

  it('admite el filtro por subcategoría verificable sin romper la búsqueda', () => {
    expect(LUGARES_SQL).toContain('$4::text IS NULL OR l.tipo = $4');
    expect(LUGARES_SQL).toContain('$2::text IS NULL');
  });
});
