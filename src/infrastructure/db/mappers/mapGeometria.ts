import type { BarrioGeometria } from '../../../domain/barrio/types.js';
import type { FuenteRow, GeometriaRow } from '../queries/rowTypes.js';
import { mapFuente } from './mapFuente.js';

export function mapGeometria(row: GeometriaRow, fuentes: FuenteRow[]): BarrioGeometria {
  const fuente = fuentes.find((item) => item.codigo === 'F-01');
  if (!fuente) throw new Error('La fuente F-01 del polígono no está registrada');
  return {
    slug: row.slug,
    nombre: row.nombre,
    codigoId: row.codigo_id,
    geometria: row.geometria,
    centroide: { lat: row.centroide_lat, lon: row.centroide_lon },
    limites: { norte: row.norte, sur: row.sur, este: row.este, oeste: row.oeste },
    area: { hectareas: row.area_ha, metrosCuadrados: row.area_m2 ?? 0 },
    vertices: row.vertices,
    srid: row.srid,
    actualizadoEn: row.actualizado_en,
    fuente: mapFuente(fuente)
  };
}
