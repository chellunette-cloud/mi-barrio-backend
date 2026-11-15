CREATE TABLE IF NOT EXISTS manzana_estrato (
  id SERIAL PRIMARY KEY,
  barrio_id INTEGER NOT NULL REFERENCES barrio(id) ON DELETE CASCADE,
  codigo_manzana TEXT NOT NULL,
  estrato INTEGER NOT NULL CHECK (estrato BETWEEN 1 AND 6),
  geom GEOMETRY(Polygon, 4326) NOT NULL,
  CONSTRAINT manzana_estrato_srid CHECK (ST_SRID(geom) = 4326),
  CONSTRAINT manzana_estrato_unica UNIQUE (barrio_id, codigo_manzana)
);
