CREATE TABLE IF NOT EXISTS fuente (
  id SERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  entidad TEXT NOT NULL,
  url TEXT NOT NULL,
  fecha_consulta DATE NOT NULL,
  licencia TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
