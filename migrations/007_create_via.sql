CREATE TABLE IF NOT EXISTS via (
  id SERIAL PRIMARY KEY,
  nombre TEXT,
  highway TEXT NOT NULL,
  geom GEOMETRY(LineString, 4326) NOT NULL,
  dentro_barrio BOOLEAN NOT NULL DEFAULT FALSE,
  fuente_principal TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT via_geom_srid CHECK (ST_SRID(geom) = 4326)
);

CREATE TABLE IF NOT EXISTS via_fuente (
  id SERIAL PRIMARY KEY,
  via_id INTEGER NOT NULL REFERENCES via(id) ON DELETE CASCADE,
  fuente_id INTEGER NOT NULL REFERENCES fuente(id) ON DELETE RESTRICT,
  campo TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT via_fuente_unica UNIQUE (via_id, fuente_id, campo)
);

CREATE INDEX IF NOT EXISTS idx_via_geom ON via USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_via_highway ON via(highway);