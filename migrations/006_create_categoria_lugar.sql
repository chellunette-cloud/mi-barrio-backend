CREATE TABLE IF NOT EXISTS categoria (
  id SERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lugar (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  direccion TEXT,
  sector TEXT,
  tipo TEXT,
  lat NUMERIC(10, 7) NOT NULL,
  lon NUMERIC(10, 7) NOT NULL,
  geom GEOMETRY(Point, 4326) NOT NULL,
  dentro_barrio BOOLEAN NOT NULL DEFAULT FALSE,
  distancia_m NUMERIC(12, 2),
  publicado BOOLEAN NOT NULL DEFAULT TRUE,
  fuente_principal TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lugar_geom_srid CHECK (ST_SRID(geom) = 4326)
);

CREATE TABLE IF NOT EXISTS lugar_fuente (
  id SERIAL PRIMARY KEY,
  lugar_id INTEGER NOT NULL REFERENCES lugar(id) ON DELETE CASCADE,
  fuente_id INTEGER NOT NULL REFERENCES fuente(id) ON DELETE RESTRICT,
  campo TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lugar_fuente_unica UNIQUE (lugar_id, fuente_id, campo)
);

CREATE INDEX IF NOT EXISTS idx_lugar_categoria ON lugar(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lugar_geom ON lugar USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_lugar_publicado ON lugar(publicado);
CREATE INDEX IF NOT EXISTS idx_lugar_dentro ON lugar(dentro_barrio);