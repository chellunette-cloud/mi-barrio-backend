ALTER TABLE lugar
  ADD COLUMN IF NOT EXISTS codigo TEXT;

COMMENT ON COLUMN lugar.codigo IS 'Identificador externo verificable, por ejemplo el código SITP del paradero';
