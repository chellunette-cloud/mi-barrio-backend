import { mapBarrio } from '../src/infrastructure/db/mappers/mapBarrio.js';
import { mapGeometria } from '../src/infrastructure/db/mappers/mapGeometria.js';
import type { BarrioRow, FuenteRow, GeometriaRow } from '../src/infrastructure/db/queries/rowTypes.js';

export const fuenteRows: FuenteRow[] = [
  {
    codigo: 'F-01', entidad: 'SDP/UAECD', url: 'https://example.test/f01',
    fecha_consulta: '2026-11-15', licencia: 'CC BY 4.0',
    campos: ['area', 'centroide', 'codigo_id', 'geometria', 'localidad', 'lotes', 'nombre', 'poblacion', 'upz', 'upl']
  },
  {
    codigo: 'F-02', entidad: 'SDP/UAECD', url: 'https://example.test/f02',
    fecha_consulta: '2026-11-15', licencia: 'CC BY 4.0', campos: ['estrato', 'manzanas_estrato2']
  }
];

export const barrioRow: BarrioRow = {
  slug: 'ciudad-granada', nombre: 'URBANIZACION CIUDAD GRANADA', nombre_mostrar: 'Ciudad Granada',
  codigo_id: 'LEG00645', localidad_codigo: '08', localidad_nombre: 'Kennedy',
  upz_codigo: '82', upz_nombre: 'Patio Bonito', upl: 'UPL14',
  area_ha: 9.1, area_m2: 94551.13, lotes: 705, poblacion_estimada: 3807,
  densidad: 77.4725, estrato_predominante: 2, manzanas_estrato2: 34,
  centroide_lat: 4.641833, centroide_lon: -74.171758,
  norte: 4.6431, sur: 4.6405, este: -74.1701, oeste: -74.1734,
  actualizado_en: '2026-11-15T12:00:00Z'
};

export const geometriaRow: GeometriaRow = {
  slug: barrioRow.slug, nombre: barrioRow.nombre, codigo_id: barrioRow.codigo_id,
  area_ha: barrioRow.area_ha, area_m2: barrioRow.area_m2,
  geometria: {
    type: 'Polygon',
    coordinates: [[[-74.1734, 4.6405], [-74.1701, 4.6405], [-74.1701, 4.6431], [-74.1734, 4.6431], [-74.1734, 4.6405]]]
  },
  centroide_lat: barrioRow.centroide_lat, centroide_lon: barrioRow.centroide_lon,
  norte: barrioRow.norte, sur: barrioRow.sur, este: barrioRow.este, oeste: barrioRow.oeste,
  vertices: 58, srid: 4326, actualizado_en: barrioRow.actualizado_en
};

export const barrio = mapBarrio(barrioRow, fuenteRows);
export const geometria = mapGeometria(geometriaRow, fuenteRows);
