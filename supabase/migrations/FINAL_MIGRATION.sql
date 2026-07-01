-- ============================================================
-- NotaFlow — Full Migration (run once in Supabase SQL Editor)
-- ============================================================

-- 1. Create base enum (skip if exists)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('notario', 'oficial', 'gestoria');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Base tables
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre     TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'oficial',
  notaria_id UUID,
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
  notaria_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expedientes (
  id               TEXT PRIMARY KEY,
  cliente          TEXT NOT NULL,
  tipo             TEXT NOT NULL,
  valor            NUMERIC,
  estado           TEXT NOT NULL DEFAULT 'documentacion',
  oficial_id       UUID REFERENCES profiles(id),
  gestoria_id      UUID REFERENCES profiles(id),
  fecha_apertura   DATE DEFAULT CURRENT_DATE,
  notas            TEXT,
  urgente          BOOLEAN DEFAULT FALSE,
  oficial_nombre   TEXT,
  itp_listo        BOOLEAN DEFAULT FALSE,
  registro_enviado BOOLEAN DEFAULT FALSE,
  notaria_id       UUID,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expediente_docs (
  id            BIGSERIAL PRIMARY KEY,
  expediente_id TEXT NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  recibido      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
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
  email      TEXT,
  telefono   TEXT,
  exp_id     TEXT REFERENCES expedientes(id),
  notas      TEXT,
  notaria_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facturas (
  id            TEXT PRIMARY KEY,
  expediente_id TEXT REFERENCES expedientes(id),
  cliente       TEXT NOT NULL,
  tipo          TEXT NOT NULL,
  base          NUMERIC NOT NULL,
  total         NUMERIC NOT NULL,
  estado        TEXT NOT NULL DEFAULT 'pendiente',
  fecha         DATE DEFAULT CURRENT_DATE,
  notaria_id    UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Notarias table
CREATE TABLE IF NOT EXISTS notarias (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre                 TEXT NOT NULL,
  cif                    TEXT,
  direccion              TEXT,
  telefono               TEXT,
  email                  TEXT,
  web                    TEXT,
  ciudad                 TEXT,
  plan                   TEXT NOT NULL DEFAULT 'pro',
  mrr                    INTEGER NOT NULL DEFAULT 397,
  estado                 TEXT NOT NULL DEFAULT 'activa',
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  whatsapp_number        TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);

-- 4. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notaria_id             UUID NOT NULL REFERENCES notarias(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_customer_id     TEXT,
  plan                   TEXT NOT NULL DEFAULT 'pro',
  estado                 TEXT NOT NULL DEFAULT 'trialing',
  trial_end              TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now(),
  UNIQUE(notaria_id)
);

-- 5. Add FK from profiles/tables to notarias
ALTER TABLE profiles   ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);
ALTER TABLE leads      ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);
ALTER TABLE agenda     ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);
ALTER TABLE facturas   ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_notarias_stripe_customer ON notarias(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_notarias_stripe_sub      ON notarias(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_notarias_whatsapp        ON notarias(whatsapp_number);

-- 7. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS expedientes_updated_at ON expedientes;
CREATE TRIGGER expedientes_updated_at BEFORE UPDATE ON expedientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. get_user_role helper
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role::TEXT FROM profiles WHERE id = auth.uid();
$$;

-- 9. RLS
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE expediente_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda          ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notarias        ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_own" ON profiles;
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (id = auth.uid() OR get_user_role() = 'super_admin');

-- Notarias
DROP POLICY IF EXISTS "notarias_own" ON notarias;
CREATE POLICY "notarias_own" ON notarias FOR SELECT USING (
  id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()) OR get_user_role() = 'super_admin'
);

-- Leads
DROP POLICY IF EXISTS "leads_select" ON leads;
CREATE POLICY "leads_select" ON leads FOR SELECT USING (
  notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()) OR get_user_role() = 'super_admin'
);
DROP POLICY IF EXISTS "leads_insert" ON leads;
CREATE POLICY "leads_insert" ON leads FOR INSERT WITH CHECK (
  notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
);
DROP POLICY IF EXISTS "leads_update" ON leads;
CREATE POLICY "leads_update" ON leads FOR UPDATE
  USING (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "leads_delete" ON leads;
CREATE POLICY "leads_delete" ON leads FOR DELETE
  USING (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()) AND get_user_role() = 'notario_titular');

-- Expedientes
DROP POLICY IF EXISTS "expedientes_select" ON expedientes;
CREATE POLICY "expedientes_select" ON expedientes FOR SELECT USING (
  notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()) OR get_user_role() = 'super_admin'
);
DROP POLICY IF EXISTS "expedientes_insert" ON expedientes;
CREATE POLICY "expedientes_insert" ON expedientes FOR INSERT WITH CHECK (
  notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
);
DROP POLICY IF EXISTS "expedientes_update" ON expedientes;
CREATE POLICY "expedientes_update" ON expedientes FOR UPDATE
  USING (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()));

-- Expediente docs
DROP POLICY IF EXISTS "docs_select" ON expediente_docs;
CREATE POLICY "docs_select" ON expediente_docs FOR SELECT USING (
  expediente_id IN (SELECT id FROM expedientes WHERE notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()))
);
DROP POLICY IF EXISTS "docs_insert" ON expediente_docs;
CREATE POLICY "docs_insert" ON expediente_docs FOR INSERT WITH CHECK (
  expediente_id IN (SELECT id FROM expedientes WHERE notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()))
);
DROP POLICY IF EXISTS "docs_update" ON expediente_docs;
CREATE POLICY "docs_update" ON expediente_docs FOR UPDATE USING (
  expediente_id IN (SELECT id FROM expedientes WHERE notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()))
);

-- Agenda
DROP POLICY IF EXISTS "agenda_select" ON agenda;
CREATE POLICY "agenda_select" ON agenda FOR SELECT USING (
  notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()) OR get_user_role() = 'super_admin'
);
DROP POLICY IF EXISTS "agenda_insert" ON agenda;
CREATE POLICY "agenda_insert" ON agenda FOR INSERT WITH CHECK (
  notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
);
DROP POLICY IF EXISTS "agenda_update" ON agenda;
CREATE POLICY "agenda_update" ON agenda FOR UPDATE USING (
  notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
);
DROP POLICY IF EXISTS "agenda_delete" ON agenda;
CREATE POLICY "agenda_delete" ON agenda FOR DELETE USING (
  notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
);

-- Facturas
DROP POLICY IF EXISTS "facturas_select" ON facturas;
CREATE POLICY "facturas_select" ON facturas FOR SELECT USING (
  notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()) OR get_user_role() = 'super_admin'
);

-- 10. Demo notaria
INSERT INTO notarias (id, nombre, cif, direccion, telefono, email, web, ciudad, plan, mrr, estado)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Notaria Barcelo i Associats',
  'B12345678',
  'Pau Claris 162 4-1, 08008 Barcelona',
  '93 123 45 67',
  'info@barcelo-notaria.es',
  'www.barcelo-notaria.es',
  'Barcelona',
  'elite',
  597,
  'activa'
) ON CONFLICT (id) DO NOTHING;

-- More demo notarias for super admin panel
INSERT INTO notarias (nombre, ciudad, plan, mrr, estado, created_at) VALUES
  ('Notaria Garcia Martinez',   'Madrid',    'pro',     397, 'activa',  now() - interval '45 days'),
  ('Notaria Ruiz & Asociados',  'Valencia',  'starter', 197, 'activa',  now() - interval '30 days'),
  ('Notaria Fernandez Lopez',   'Sevilla',   'elite',   597, 'activa',  now() - interval '60 days'),
  ('Notaria Sanchez Perez',     'Bilbao',    'pro',     397, 'activa',  now() - interval '15 days'),
  ('Notaria Torres Vidal',      'Zaragoza',  'starter', 197, 'prueba',  now() - interval '5 days'),
  ('Notaria Moreno Castillo',   'Malaga',    'pro',     397, 'prueba',  now() - interval '2 days')
ON CONFLICT DO NOTHING;

-- 11. handle_new_user trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, nombre, role, notaria_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email,'@',1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'oficial')::user_role,
    (NEW.raw_user_meta_data->>'notaria_id')::UUID
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 12. Seed demo users (after notaria exists)
-- These will be created via Supabase Auth; profiles auto-created by trigger
-- Super admin profile for sonia (insert manually after she signs up)
