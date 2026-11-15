export const UPSERT_BARRIO_SQL = `
WITH g AS (
  SELECT ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) AS geom
)
INSERT INTO barrio (
  slug, nombre, nombre_mostrar, codigo_id,
  localidad_codigo, localidad_nombre, upz_codigo, upz_nombre, upl,
  area_ha, area_m2, lotes, poblacion_estimada, poblacion_tipo,
  densidad, estrato_predominante, manzanas_estrato2, centroide, geom
)
SELECT
  $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
  ST_Area(g.geom::geography), $12, $13, 'estimacion_registro_barrio',
  $14, $15, $16, ST_Centroid(g.geom), g.geom
FROM g
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_mostrar = EXCLUDED.nombre_mostrar,
  codigo_id = EXCLUDED.codigo_id,
  localidad_codigo = EXCLUDED.localidad_codigo,
  localidad_nombre = EXCLUDED.localidad_nombre,
  upz_codigo = EXCLUDED.upz_codigo,
  upz_nombre = EXCLUDED.upz_nombre,
  upl = EXCLUDED.upl,
  area_ha = EXCLUDED.area_ha,
  area_m2 = EXCLUDED.area_m2,
  lotes = EXCLUDED.lotes,
  poblacion_estimada = EXCLUDED.poblacion_estimada,
  poblacion_tipo = EXCLUDED.poblacion_tipo,
  densidad = EXCLUDED.densidad,
  estrato_predominante = EXCLUDED.estrato_predominante,
  manzanas_estrato2 = EXCLUDED.manzanas_estrato2,
  centroide = EXCLUDED.centroide,
  geom = EXCLUDED.geom,
  actualizado_en = now()
RETURNING id
`;

export const VALIDATE_BARRIO_SQL = `
SELECT
  ST_Y(centroide)::float8 AS lat,
  ST_X(centroide)::float8 AS lon,
  ST_NPoints(geom)::int AS vertices,
  ST_SRID(geom)::int AS srid,
  ST_IsValid(geom) AS valida,
  ST_Equals(geom, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS coincide,
  ST_Distance(
    centroide::geography,
    ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
  )::float8 AS centroide_m
FROM barrio
WHERE id = $4
`;
