import type { PoolClient } from 'pg';
import { upsertFuente } from './fuentes.js';
import { FUENTE_F04, FUENTE_F06, FUENTE_F16 } from './fuentes.js';
import { loadSchoolSeeds } from './schoolMapper.js';
import { loadParkSeeds } from './parkMapper.js';
import { loadCommerceSeeds } from './commerceMapper.js';
import type { PlaceSeed } from './schoolMapper.js';

const CATEGORIAS = [
  ['educacion', 'Instituciones educativas', 'Colegios y sedes educativas del entorno'],
  ['parques', 'Parques y zonas verdes', 'Parques y zonas verdes cercanas'],
  ['comercio', 'Establecimientos comerciales', 'Comercio con cobertura parcial']
] as const;

export async function loadLugares(client: PoolClient): Promise<void> {
  const fuentes = {
    'F-04': await upsertFuente(client, FUENTE_F04),
    'F-06': await upsertFuente(client, FUENTE_F06),
    'F-16': await upsertFuente(client, FUENTE_F16)
  };
  const categoriaIds = new Map<string, number>();
  for (const [codigo, nombre, descripcion] of CATEGORIAS) {
    const result = await client.query<{ id: number }>(
      `INSERT INTO categoria (codigo, nombre, descripcion)
       VALUES ($1, $2, $3)
       ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre,
         descripcion = EXCLUDED.descripcion, actualizado_en = now()
       RETURNING id`,
      [codigo, nombre, descripcion]
    );
    const id = result.rows[0]?.id;
    if (!id) throw new Error(`No se pudo registrar la categoría ${codigo}`);
    categoriaIds.set(codigo, id);
  }
  await client.query('DELETE FROM lugar');
  const seeds: PlaceSeed[] = [
    ...(await loadSchoolSeeds()),
    ...(await loadParkSeeds()),
    ...(await loadCommerceSeeds())
  ];
  for (const seed of seeds) {
    const categoriaId = categoriaIds.get(seed.categoria);
    if (!categoriaId) throw new Error(`Categoría desconocida: ${seed.categoria}`);
    const lugar = await client.query<{ id: number }>(
      `INSERT INTO lugar (categoria_id, nombre, descripcion, direccion, sector, tipo, lat, lon, geom, fuente_principal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_MakePoint($9, $10), 4326), $11)
       RETURNING id`,
      [
        categoriaId,
        seed.nombre,
        seed.descripcion,
        seed.direccion,
        seed.sector,
        seed.tipo,
        seed.lat,
        seed.lon,
        seed.lon,
        seed.lat,
        seed.fuente
      ]
    );
    const lugarId = lugar.rows[0]?.id;
    if (!lugarId) throw new Error(`No se pudo registrar ${seed.nombre}`);
    await client.query(
      `INSERT INTO lugar_fuente (lugar_id, fuente_id, campo)
       VALUES ($1, $2, 'registro')
       ON CONFLICT (lugar_id, fuente_id, campo) DO NOTHING`,
      [lugarId, fuentes[seed.fuente as keyof typeof fuentes]]
    );
  }
  await client.query(`
    UPDATE lugar
    SET dentro_barrio = ST_Contains((SELECT geom FROM barrio LIMIT 1), geom),
        distancia_m = ST_Distance(geom::geography, (SELECT centroide FROM barrio LIMIT 1)::geography)
  `);
  console.log(`lugares OK: ${seeds.length} registros`);
}