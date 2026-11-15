import type { PoolClient } from 'pg';
import type { AtributosOficiales, BarrioProperties, FeatureCollection } from './types.js';
import { FUENTE_F01, FUENTE_F02, upsertFuente } from './fuentes.js';
import { readVerifiedJson } from './sources.js';
import {
  BARRIO_NOMBRE_MOSTRAR,
  BARRIO_SLUG,
  CENTROIDE_ESPERADO,
  LOCALIDADES,
  MANZANAS_ESPERADAS,
  UPZ,
  VERTICES_ESPERADOS
} from './catalogos.js';
import { UPSERT_BARRIO_SQL, VALIDATE_BARRIO_SQL } from './barrioSql.js';

const CAMPOS_F01 = [
  'codigo_id', 'nombre', 'localidad', 'upz', 'upl', 'area', 'lotes',
  'poblacion', 'densidad', 'geometria', 'centroide'
];

interface Validacion {
  lat: number;
  lon: number;
  vertices: number;
  srid: number;
  valida: boolean;
  coincide: boolean;
  centroide_m: number;
}

export async function loadBarrio(client: PoolClient): Promise<void> {
  const geo = await readVerifiedJson<FeatureCollection<BarrioProperties>>(
    'barrio-ciudad-granada.geojson'
  );
  const oficial = await readVerifiedJson<AtributosOficiales>('barrio-atributos-oficial.json');
  const feature = geo.features[0];
  if (geo.features.length !== 1 || !feature) {
    throw new Error('El snapshot del barrio debe contener exactamente un polígono');
  }
  const attrs = oficial.atributos;
  if (feature.properties.NOMBRE !== attrs.NOMBRE) {
    throw new Error('El nombre del GeoJSON no coincide con el registro oficial');
  }
  const localidad = LOCALIDADES[feature.properties.CODIGO_LOCALIDAD];
  const upz = UPZ[String(feature.properties.CODIGO_UPZ)];
  if (!localidad || !upz) throw new Error('Código de localidad o UPZ sin catálogo verificado');

  await upsertFuente(client, FUENTE_F01);
  await upsertFuente(client, FUENTE_F02);
  const fuentes = await client.query<{ codigo: string; id: number }>(
    'SELECT codigo, id FROM fuente WHERE codigo IN ($1, $2)',
    [FUENTE_F01.codigo, FUENTE_F02.codigo]
  );
  const fuenteId = (codigo: string): number => {
    const row = fuentes.rows.find((item) => item.codigo === codigo);
    if (!row) throw new Error(`Fuente ${codigo} no registrada`);
    return row.id;
  };

  const geojson = JSON.stringify(feature.geometry);
  const inserted = await client.query<{ id: number }>(UPSERT_BARRIO_SQL, [
    geojson, BARRIO_SLUG, attrs.NOMBRE, BARRIO_NOMBRE_MOSTRAR, attrs.CODIGO_ID,
    feature.properties.CODIGO_LOCALIDAD, localidad, String(feature.properties.CODIGO_UPZ),
    upz, attrs.CODIGO_UPL, attrs.AREA_TOTAL, attrs.LOTES_TOTAL,
    attrs.POBLACION_ESTIMADA, attrs.DENSIDAD, 2, MANZANAS_ESPERADAS
  ]);
  const barrioId = inserted.rows[0]?.id;
  if (!barrioId) throw new Error('No se pudo insertar el barrio');

  await client.query('DELETE FROM barrio_fuente WHERE barrio_id = $1', [barrioId]);
  for (const campo of CAMPOS_F01) {
    await client.query(
      'INSERT INTO barrio_fuente (barrio_id, fuente_id, campo) VALUES ($1, $2, $3)',
      [barrioId, fuenteId('F-01'), campo]
    );
  }
  for (const campo of ['estrato', 'manzanas_estrato2']) {
    await client.query(
      'INSERT INTO barrio_fuente (barrio_id, fuente_id, campo) VALUES ($1, $2, $3)',
      [barrioId, fuenteId('F-02'), campo]
    );
  }

  const validation = await client.query<Validacion>(VALIDATE_BARRIO_SQL, [
    geojson, CENTROIDE_ESPERADO.lon, CENTROIDE_ESPERADO.lat, barrioId
  ]);
  const check = validation.rows[0];
  if (!check || !check.valida || !check.coincide || check.srid !== 4326) {
    throw new Error('Validación geográfica fallida: geometría inválida, SRID o snapshot distinto');
  }
  if (check.vertices !== VERTICES_ESPERADOS || check.centroide_m > 5) {
    throw new Error(`Validación geográfica fallida: vértices=${check.vertices}, centroide=${check.centroide_m}m`);
  }
  console.log(
    `barrio OK: ${attrs.NOMBRE} · ${check.vertices} vértices · centroide ${check.lat}, ${check.lon}`
  );
}
