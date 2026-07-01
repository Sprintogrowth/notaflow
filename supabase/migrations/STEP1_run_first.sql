-- ============================================================
-- NotaFlow — STEP 1 of 2
-- Run this first, wait for success, then run STEP 2
-- ============================================================

-- Base schema (001)
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('notario', 'oficial', 'gestoria');

CREATE TABLE IF NOT EXISTS profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre     TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'oficial',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id         BIGSERIAL PRIMARY KEY,
  nombre     TEXT NOT NULL,
  tipo       TEXT NOT NULL,
  canal      TEXT NOT NULL DEFAULT 'Web',
  estado     TEXT NOT NULL DEFAULT 'nuevo',
  tel        TEXT,
  email      TEXT,
  msg        TEXT,
  urgencia   TEXT NOT NULL DEFAULT 'media',
  oficial_id UUID REFERENCES profiles(id),
  notas      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expedientes (
  id             TEXT PRIMARY KEY,
  cliente        TEXT NOT NULL,
  tipo           TEXT NOT NULL,
  valor          NUMERIC,
  estado         TEXT NOT NULL DEFAULT 'documentacion',
  oficial_id     UUID REFERENCES profiles(id),
  gestoria_id    UUID REFERENCES profiles(id),
  fecha_apertura DATE DEFAULT CURRENT_DATE,
  notas          TEXT,
  urgente        BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expediente_docs (
  id             BIGSERIAL PRIMARY KEY,
  expediente_id  TEXT NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  nombre         TEXT NOT NULL,
  recibido       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agenda (
  id         BIGSERIAL PRIMARY KEY,
  hora       TIME NOT NULL,
  fecha      DATE NOT NULL DEFAULT CURRENT_DATE,
  cliente    TEXT NOT NULL,
  tipo       TEXT NOT NULL,
  sala       TEXT NOT NULL DEFAULT 'Despacho 1',
  estado     TEXT NOT NULL DEFAULT 'pendiente',
  tel        TEXT,
  exp_id     TEXT REFERENCES expedientes(id),
  notas      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facturas (
  id             TEXT PRIMARY KEY,
  expediente_id  TEXT REFERENCES expedientes(id),
  cliente        TEXT NOT NULL,
  tipo           TEXT NOT NULL,
  base           NUMERIC NOT NULL,
  total          NUMERIC NOT NULL,
  estado         TEXT NOT NULL DEFAULT 'pendiente',
  fecha          DATE DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS expedientes_updated_at ON expedientes;
CREATE TRIGGER expedientes_updated_at BEFORE UPDATE ON expedientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add v4 enum values (must commit before use)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'notario_titular';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'auxiliar';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'solo_lectura';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
