export const BARRIO_SQL = `
SELECT
  b.slug, b.nombre, b.nombre_mostrar, b.codigo_id,
  b.localidad_codigo, b.localidad_nombre, b.upz_codigo, b.upz_nombre, b.upl,
  b.area_ha::float8 AS area_ha, b.area_m2::float8 AS area_m2,
  b.lotes, b.poblacion_estimada, b.densidad::float8 AS densidad,
  b.estrato_predominante, b.manzanas_estrato2,
  ST_Y(b.centroide)::float8 AS centroide_lat,
  ST_X(b.centroide)::float8 AS centroide_lon,
  ST_YMax(b.geom)::float8 AS norte,
  ST_YMin(b.geom)::float8 AS sur,
  ST_XMax(b.geom)::float8 AS este,
  ST_XMin(b.geom)::float8 AS oeste,
  to_char(b.actualizado_en AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS actualizado_en
FROM barrio b
WHERE b.slug = $1
`;

export const GEOMETRIA_SQL = `
SELECT
  b.slug, b.nombre, b.codigo_id,
  b.area_ha::float8 AS area_ha, b.area_m2::float8 AS area_m2,
  ST_AsGeoJSON(b.geom)::json AS geometria,
  ST_Y(b.centroide)::float8 AS centroide_lat,
  ST_X(b.centroide)::float8 AS centroide_lon,
  ST_YMax(b.geom)::float8 AS norte,
  ST_YMin(b.geom)::float8 AS sur,
  ST_XMax(b.geom)::float8 AS este,
  ST_XMin(b.geom)::float8 AS oeste,
  ST_NPoints(b.geom)::int AS vertices,
  ST_SRID(b.geom)::int AS srid,
  to_char(b.actualizado_en AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS actualizado_en
FROM barrio b
WHERE b.slug = $1
`;

export const FUENTES_SQL = `
SELECT
  f.codigo, f.entidad, f.url,
  to_char(f.fecha_consulta, 'YYYY-MM-DD') AS fecha_consulta,
  f.licencia,
  array_agg(bf.campo ORDER BY bf.campo) AS campos
FROM fuente f
JOIN barrio_fuente bf ON bf.fuente_id = f.id
JOIN barrio b ON b.id = bf.barrio_id
WHERE b.slug = $1
GROUP BY f.id
ORDER BY f.codigo
`;
