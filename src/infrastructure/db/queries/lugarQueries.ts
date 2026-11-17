export const CATEGORIAS_SQL = `
  SELECT id, codigo, nombre, descripcion, activa
  FROM categoria
  WHERE activa = TRUE
  ORDER BY nombre;
`;

export const LUGARES_SQL = `
  SELECT l.id, l.categoria_id, c.codigo AS categoria_codigo, l.nombre,
         l.descripcion, l.direccion, l.sector, l.tipo, l.codigo, l.lat, l.lon,
         l.dentro_barrio, l.distancia_m, l.publicado, l.fuente_principal,
         COALESCE(string_agg(f.codigo, ','), '') AS fuentes
  FROM lugar l
  JOIN categoria c ON c.id = l.categoria_id
  LEFT JOIN lugar_fuente lf ON lf.lugar_id = l.id
  LEFT JOIN fuente f ON f.id = lf.fuente_id
  WHERE l.publicado = TRUE
    AND ($1::text IS NULL OR c.codigo = $1)
    AND ($2::text IS NULL OR l.nombre ILIKE $2 OR COALESCE(l.direccion, '') ILIKE $2)
  GROUP BY l.id, c.codigo
  ORDER BY l.distancia_m ASC NULLS LAST, l.nombre ASC
  LIMIT $3;
`;

export const LUGAR_SQL = `
  SELECT l.id, l.categoria_id, c.codigo AS categoria_codigo, l.nombre,
         l.descripcion, l.direccion, l.sector, l.tipo, l.codigo, l.lat, l.lon,
         l.dentro_barrio, l.distancia_m, l.publicado, l.fuente_principal,
         COALESCE(string_agg(f.codigo, ','), '') AS fuentes
  FROM lugar l
  JOIN categoria c ON c.id = l.categoria_id
  LEFT JOIN lugar_fuente lf ON lf.lugar_id = l.id
  LEFT JOIN fuente f ON f.id = lf.fuente_id
  WHERE l.id = $1 AND l.publicado = TRUE
  GROUP BY l.id, c.codigo;
`;