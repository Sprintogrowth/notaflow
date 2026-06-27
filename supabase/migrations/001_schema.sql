-- ═══════════════════════════════════════════════════════════════
-- NotaFlow — Schema inicial
-- Ejecutar en: Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('notario', 'oficial', 'gestoria');

-- ── Profiles (extiende auth.users) ──────────────────────────────
CREATE TABLE profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre     TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'oficial',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Leads ───────────────────────────────────────────────────────
CREATE TABLE leads (
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

-- ── Expedientes ─────────────────────────────────────────────────
CREATE TABLE expedientes (
  id             TEXT PRIMARY KEY,           -- formato EXP-2024-XXXX
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

-- ── Documentos de expediente ────────────────────────────────────
CREATE TABLE expediente_docs (
  id             BIGSERIAL PRIMARY KEY,
  expediente_id  TEXT NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  nombre         TEXT NOT NULL,
  recibido       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Agenda ──────────────────────────────────────────────────────
CREATE TABLE agenda (
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

-- ── Facturas ────────────────────────────────────────────────────
CREATE TABLE facturas (
  id             TEXT PRIMARY KEY,           -- formato FAC-2024-XXX
  expediente_id  TEXT REFERENCES expedientes(id),
  cliente        TEXT NOT NULL,
  tipo           TEXT NOT NULL,
  base           NUMERIC NOT NULL,
  total          NUMERIC NOT NULL,
  estado         TEXT NOT NULL DEFAULT 'pendiente',
  fecha          DATE DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Triggers updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER expedientes_updated_at
  BEFORE UPDATE ON expedientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Auto-crear profile al registrar usuario ─────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, nombre, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'oficial')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
