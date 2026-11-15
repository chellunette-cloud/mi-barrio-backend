import type { PoolClient } from 'pg';
import type { FuenteMeta } from './types.js';

export const FUENTE_F01: FuenteMeta = {
  codigo: 'F-01',
  entidad: 'SDP/UAECD',
  url: 'https://datosabiertos.bogota.gov.co/dataset/barrio-legalizado-bogota-d-c',
  fechaConsulta: '2026-11-15',
  licencia: 'CC BY 4.0',
  descripcion: 'Barrio legalizado y atributos oficiales del registro LEG00645'
};

export const FUENTE_F02: FuenteMeta = {
  codigo: 'F-02',
  entidad: 'SDP/UAECD',
  url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/ordenamientoterritorial/estratificacion/MapServer/1',
  fechaConsulta: '2026-11-15',
  licencia: 'CC BY 4.0',
  descripcion: 'Estratificación socioeconómica por manzana; 34 manzanas dentro del barrio'
};

export async function upsertFuente(client: PoolClient, fuente: FuenteMeta): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO fuente (codigo, entidad, url, fecha_consulta, licencia, descripcion)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (codigo) DO UPDATE SET
       entidad = EXCLUDED.entidad, url = EXCLUDED.url,
       fecha_consulta = EXCLUDED.fecha_consulta, licencia = EXCLUDED.licencia,
       descripcion = EXCLUDED.descripcion
     RETURNING id`,
    [fuente.codigo, fuente.entidad, fuente.url, fuente.fechaConsulta, fuente.licencia, fuente.descripcion]
  );
  const id = result.rows[0]?.id;
  if (!id) throw new Error(`No se pudo registrar la fuente ${fuente.codigo}`);
  return id;
}
