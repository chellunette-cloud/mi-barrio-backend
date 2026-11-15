import type { Fuente } from '../../../domain/barrio/types.js';
import type { FuenteRow } from '../queries/rowTypes.js';

export function mapFuente(row: FuenteRow): Fuente {
  return {
    codigo: row.codigo,
    entidad: row.entidad,
    url: row.url,
    fechaConsulta: row.fecha_consulta,
    licencia: row.licencia,
    campos: row.campos
  };
}
