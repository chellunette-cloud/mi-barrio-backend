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

export const FUENTE_F04: FuenteMeta = {
  codigo: 'F-04',
  entidad: 'Secretaría de Educación (SED)',
  url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/educacion/infraestructuraeducativa/MapServer/0',
  fechaConsulta: '2026-11-15',
  licencia: 'CC BY-SA 4.0',
  descripcion: 'Infraestructura educativa; 28 sedes en la ventana documentada'
};

export const FUENTE_F06: FuenteMeta = {
  codigo: 'F-06',
  entidad: 'Secretaría Distrital de Planeación (SDP)',
  url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/recreaciondeporte/parquesyescenarios/MapServer/1',
  fechaConsulta: '2026-11-15',
  licencia: 'CC BY 4.0',
  descripcion: 'Parques y escenarios recreativos del POT'
};

export const FUENTE_F16: FuenteMeta = {
  codigo: 'F-16',
  entidad: 'OpenStreetMap contributors',
  url: 'https://www.openstreetmap.org',
  fechaConsulta: '2026-11-15',
  licencia: 'ODbL 1.0',
  descripcion: 'Establecimientos con etiqueta shop en la ventana documentada'
};

export const FUENTE_F05: FuenteMeta = {
  codigo: 'F-05',
  entidad: 'Secretaría Distrital de Salud (SDS)',
  url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/salud/instituciones/MapServer',
  fechaConsulta: '2026-11-15',
  licencia: 'CC BY 4.0',
  descripcion: 'Instituciones prestadoras de salud, consultorios y farmacias'
};

export const FUENTE_F15: FuenteMeta = {
  codigo: 'F-15',
  entidad: 'Transmilenio / IDECA',
  url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/movilidad/transportepublico/MapServer',
  fechaConsulta: '2026-11-15',
  licencia: 'Términos IDECA',
  descripcion: 'Paraderos SITP, estaciones y portales de TransMilenio'
};
