import type { PoolClient } from 'pg';
import { readVerifiedJson } from './sources.js';
import { upsertFuente } from './fuentes.js';
import { FUENTE_F16 } from './fuentes.js';

export async function loadVias(client: PoolClient): Promise<void> {
  const fuenteId = await upsertFuente(client, FUENTE_F16);
  const data = await readVerifiedJson<any>('vias-ciudad-granada.geojson');
  await client.query('DELETE FROM via');
  for (const f of data.features) {
    const nombre = f.properties?.nombre ?? null;
    const highway = f.properties?.highway ?? 'unknown';
    const result = await client.query<{ id: number }>(
      `INSERT INTO via (nombre, highway, geom, fuente_principal)
       VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), $4)
       RETURNING id`,
      [nombre, highway, JSON.stringify(f.geometry), 'F-16']
    );
    const viaId = result.rows[0]?.id;
    if (viaId) {
      await client.query(
        `INSERT INTO via_fuente (via_id, fuente_id, campo) VALUES ($1, $2, 'registro')
         ON CONFLICT (via_id, fuente_id, campo) DO NOTHING`,
        [viaId, fuenteId]
      );
    }
  }
  await client.query(`
    UPDATE via
    SET dentro_barrio = ST_Intersects(geom, (SELECT geom FROM barrio LIMIT 1))
  `);
  console.log(`vias OK: ${data.features.length} tramos`);
}