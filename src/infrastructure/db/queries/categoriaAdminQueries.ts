export const CATEGORIAS_ADMIN_SQL = `
  SELECT id, codigo, nombre, descripcion, activa
  FROM categoria
  ORDER BY nombre;
`;

export const CATEGORIA_ADMIN_SQL = `
  SELECT id, codigo, nombre, descripcion, activa
  FROM categoria
  WHERE id = $1;
`;

export const CATEGORIA_LOCK_SQL = `
  SELECT id, codigo, nombre, descripcion, activa
  FROM categoria
  WHERE id = $1
  FOR UPDATE;
`;

export const LUGARES_CATEGORIA_COUNT_SQL = `
  SELECT count(*)::int AS total
  FROM lugar
  WHERE categoria_id = $1;
`;

export const CATEGORIA_DESTINO_SQL = `
  SELECT id
  FROM categoria
  WHERE id = $1 AND activa = TRUE;
`;

export const REASIGNAR_LUGARES_SQL = `
  UPDATE lugar
  SET categoria_id = $1, actualizado_en = now()
  WHERE categoria_id = $2;
`;

export const DELETE_CATEGORIA_SQL = `
  DELETE FROM categoria
  WHERE id = $1;
`;
