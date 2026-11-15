import type { Barrio } from '../../../domain/barrio/types.js';
import type { BarrioRow, FuenteRow } from '../queries/rowTypes.js';
import { mapFuente } from './mapFuente.js';

export function mapBarrio(row: BarrioRow, fuentes: FuenteRow[]): Barrio {
  return {
    slug: row.slug,
    nombre: row.nombre,
    nombreMostrar: row.nombre_mostrar,
    codigoId: row.codigo_id,
    localidad: { codigo: row.localidad_codigo, nombre: row.localidad_nombre },
    upz: { codigo: row.upz_codigo, nombre: row.upz_nombre },
    upl: row.upl,
    area: { hectareas: row.area_ha, metrosCuadrados: row.area_m2 ?? 0 },
    lotes: row.lotes,
    poblacion: {
      valor: row.poblacion_estimada,
      tipo: 'estimacion',
      etiqueta: 'Estimación del registro del barrio'
    },
    densidad: row.densidad,
    estratoPredominante: row.estrato_predominante,
    manzanasEstrato2: row.manzanas_estrato2,
    centroide: { lat: row.centroide_lat, lon: row.centroide_lon },
    limites: { norte: row.norte, sur: row.sur, este: row.este, oeste: row.oeste },
    actualizadoEn: row.actualizado_en,
    fuentes: fuentes.map(mapFuente)
  };
}
