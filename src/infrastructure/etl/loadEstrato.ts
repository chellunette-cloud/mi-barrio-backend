import type { PoolClient } from 'pg';
import type { EstratoProperties, FeatureCollection } from './types.js';
import { BARRIO_SLUG, MANZANAS_ESPERADAS } from './catalogos.js';
import { readVerifiedJson } from './sources.js';

interface Conteo {
  total: number;
  estrato2: number;
  invalidas: number;
  srid_incorrecto: number;
  fuera: number;
}

export async function loadEstrato(client: PoolClient): Promise<void> {
  const collection = await readVerifiedJson<FeatureCollection<EstratoProperties>>(
    'estrato-ciudad-granada.geojson'
  );
  if (collection.features.length !== MANZANAS_ESPERADAS) {
    throw new Error(`Se esperaban ${MANZANAS_ESPERADAS} manzanas y llegaron ${collection.features.length}`);
  }
  if (collection.features.some((feature) => feature.properties.ESTRATO !== 2)) {
    throw new Error('El snapshot de estratificación contiene manzanas que no son estrato 2');
  }
  const barrio = await client.query<{ id: number }>('SELECT id FROM barrio WHERE slug = $1', [
    BARRIO_SLUG
  ]);
  const barrioId = barrio.rows[0]?.id;
  if (!barrioId) throw new Error('No existe el barrio; ejecute primero la carga del polígono');

  await client.query('DELETE FROM manzana_estrato WHERE barrio_id = $1', [barrioId]);
  for (const feature of collection.features) {
    await client.query(
      `INSERT INTO manzana_estrato (barrio_id, codigo_manzana, estrato, geom)
       VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326))`,
      [barrioId, feature.properties.CODIGO_MANZANA, feature.properties.ESTRATO, JSON.stringify(feature.geometry)]
    );
  }

  const result = await client.query<Conteo>(
    `SELECT
       count(*)::int AS total,
       count(*) FILTER (WHERE m.estrato = 2)::int AS estrato2,
       count(*) FILTER (WHERE NOT ST_IsValid(m.geom))::int AS invalidas,
       count(*) FILTER (WHERE ST_SRID(m.geom) <> 4326)::int AS srid_incorrecto,
       count(*) FILTER (WHERE NOT ST_Contains(b.geom, ST_Centroid(m.geom)))::int AS fuera
     FROM manzana_estrato m
     JOIN barrio b ON b.id = m.barrio_id
     WHERE m.barrio_id = $1`,
    [barrioId]
  );
  const count = result.rows[0];
  if (!count || count.total !== MANZANAS_ESPERADAS || count.estrato2 !== MANZANAS_ESPERADAS) {
    throw new Error('El conteo de estratificación no coincide con 34 manzanas estrato 2');
  }
  if (count.invalidas || count.srid_incorrecto || count.fuera) {
    throw new Error(
      `Integridad de manzanas fallida: invalidas=${count.invalidas}, srid=${count.srid_incorrecto}, fuera=${count.fuera}`
    );
  }
  await client.query(
    'UPDATE barrio SET manzanas_estrato2 = $1, estrato_predominante = 2 WHERE id = $2',
    [count.estrato2, barrioId]
  );
  console.log(`estrato OK: ${count.total} manzanas, todas estrato 2, todas dentro del polígono`);
}
