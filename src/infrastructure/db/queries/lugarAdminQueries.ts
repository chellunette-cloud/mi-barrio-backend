export const LUGARES_ADMIN_SQL = `
  SELECT l.id, l.categoria_id, c.codigo AS categoria_codigo, l.nombre,
         l.descripcion, l.direccion, l.sector, l.tipo, l.codigo, l.lat, l.lon,
         l.dentro_barrio, l.distancia_m, l.publicado, l.fuente_principal,
         COALESCE(string_agg(f.codigo, ','), '') AS fuentes
  FROM lugar l
  JOIN categoria c ON c.id = l.categoria_id
  LEFT JOIN lugar_fuente lf ON lf.lugar_id = l.id
  LEFT JOIN fuente f ON f.id = lf.fuente_id
  GROUP BY l.id, c.codigo
  ORDER BY l.publicado DESC, l.distancia_m ASC NULLS LAST, l.nombre ASC
  LIMIT 1000;
`;

export const LUGAR_ADMIN_SQL = `
  SELECT l.id, l.categoria_id, c.codigo AS categoria_codigo, l.nombre,
         l.descripcion, l.direccion, l.sector, l.tipo, l.codigo, l.lat, l.lon,
         l.dentro_barrio, l.distancia_m, l.publicado, l.fuente_principal,
         COALESCE(string_agg(f.codigo, ','), '') AS fuentes
  FROM lugar l
  JOIN categoria c ON c.id = l.categoria_id
  LEFT JOIN lugar_fuente lf ON lf.lugar_id = l.id
  LEFT JOIN fuente f ON f.id = lf.fuente_id
  WHERE l.id = $1
  GROUP BY l.id, c.codigo;
`;
