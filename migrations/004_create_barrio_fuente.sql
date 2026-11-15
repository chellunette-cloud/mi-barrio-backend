CREATE TABLE IF NOT EXISTS barrio_fuente (
  id SERIAL PRIMARY KEY,
  barrio_id INTEGER NOT NULL REFERENCES barrio(id) ON DELETE CASCADE,
  fuente_id INTEGER NOT NULL REFERENCES fuente(id) ON DELETE RESTRICT,
  campo TEXT NOT NULL,
  CONSTRAINT barrio_fuente_unica UNIQUE (barrio_id, fuente_id, campo)
);

CREATE INDEX IF NOT EXISTS barrio_fuente_barrio_idx ON barrio_fuente (barrio_id);
