CREATE INDEX IF NOT EXISTS barrio_geom_gist ON barrio USING GIST (geom);
CREATE INDEX IF NOT EXISTS barrio_centroide_gist ON barrio USING GIST (centroide);
CREATE INDEX IF NOT EXISTS manzana_estrato_geom_gist ON manzana_estrato USING GIST (geom);
