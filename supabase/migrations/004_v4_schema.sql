-- ============================================================
-- NotaFlow v4 — Schema upgrade
-- Run after 001_schema.sql, 002_rls.sql, 003_seed.sql
-- ============================================================

-- 1. Update user_role enum to v4 roles
DO $$ BEGIN
  -- Add new values if they don't exist
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'notario_titular';
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'auxiliar';
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'solo_lectura';
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Create notarias table
CREATE TABLE IF NOT EXISTS notarias (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  cif         TEXT,
  direccion   TEXT,
  telefono    TEXT,
  email       TEXT,
  web         TEXT,
  plan        TEXT NOT NULL DEFAULT 'pro' CHECK (plan IN ('starter','pro','elite')),
  mrr         INTEGER NOT NULL DEFAULT 397,
  estado      TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','prueba','cancelada')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Insert demo notaria
INSERT INTO notarias (id, nombre, cif, direccion, telefono, email, web, plan)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Notaría Barceló i Associats',
  'B12345678',
  'Pau Claris 162 4-1, 08008 Barcelona',
  '93 123 45 67',
  'info@barcelo-notaria.es',
  'www.barcelo-notaria.es',
  'elite'
) ON CONFLICT (id) DO NOTHING;

-- 4. Add notaria_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);

-- Update existing profiles to point to demo notaria
UPDATE profiles SET notaria_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
WHERE notaria_id IS NULL AND role != 'super_admin';

-- 5. Add notaria_id to all operational tables
ALTER TABLE leads        ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);
ALTER TABLE expedientes  ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);
ALTER TABLE agenda       ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);
ALTER TABLE facturas     ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES notarias(id);

-- Add v4-specific expediente columns
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS oficial_nombre TEXT;
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS itp_listo       BOOLEAN DEFAULT FALSE;
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS registro_enviado BOOLEAN DEFAULT FALSE;

-- Backfill notaria_id for existing rows
UPDATE leads       SET notaria_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE notaria_id IS NULL;
UPDATE expedientes SET notaria_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE notaria_id IS NULL;
UPDATE agenda      SET notaria_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE notaria_id IS NULL;
UPDATE facturas    SET notaria_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE notaria_id IS NULL;

-- 6. Create subscriptions table (for Stripe)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notaria_id          UUID NOT NULL REFERENCES notarias(id) ON DELETE CASCADE,
  stripe_customer_id  TEXT,
  stripe_sub_id       TEXT,
  plan                TEXT NOT NULL DEFAULT 'pro',
  status              TEXT NOT NULL DEFAULT 'trialing',
  current_period_end  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 7. RLS on notarias (only super_admin sees all, others see their own)
ALTER TABLE notarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notarias_own" ON notarias
  FOR SELECT USING (
    id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
    OR get_user_role() = 'super_admin'
  );

-- 8. Update existing RLS policies to include notaria_id isolation
-- Drop and recreate for leads
DROP POLICY IF EXISTS "leads_select" ON leads;
CREATE POLICY "leads_select" ON leads FOR SELECT
  USING (
    notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
    OR get_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "leads_insert" ON leads;
CREATE POLICY "leads_insert" ON leads FOR INSERT
  WITH CHECK (
    notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "leads_update" ON leads;
CREATE POLICY "leads_update" ON leads FOR UPDATE
  USING (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "leads_delete" ON leads;
CREATE POLICY "leads_delete" ON leads FOR DELETE
  USING (
    notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
    AND get_user_role() = 'notario_titular'
  );

-- Repeat for expedientes
DROP POLICY IF EXISTS "expedientes_select" ON expedientes;
CREATE POLICY "expedientes_select" ON expedientes FOR SELECT
  USING (
    notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid())
    OR get_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "expedientes_insert" ON expedientes;
CREATE POLICY "expedientes_insert" ON expedientes FOR INSERT
  WITH CHECK (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "expedientes_update" ON expedientes;
CREATE POLICY "expedientes_update" ON expedientes FOR UPDATE
  USING (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()));

-- Repeat for agenda
DROP POLICY IF EXISTS "agenda_select" ON agenda;
CREATE POLICY "agenda_select" ON agenda FOR SELECT
  USING (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()) OR get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "agenda_insert" ON agenda;
CREATE POLICY "agenda_insert" ON agenda FOR INSERT
  WITH CHECK (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "agenda_update" ON agenda;
CREATE POLICY "agenda_update" ON agenda FOR UPDATE
  USING (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "agenda_delete" ON agenda;
CREATE POLICY "agenda_delete" ON agenda FOR DELETE
  USING (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()));

-- Repeat for facturas
DROP POLICY IF EXISTS "facturas_select" ON facturas;
CREATE POLICY "facturas_select" ON facturas FOR SELECT
  USING (notaria_id = (SELECT notaria_id FROM profiles WHERE id = auth.uid()) OR get_user_role() = 'super_admin');

-- 9. Update the handle_new_user trigger to assign notaria from invite metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, nombre, role, notaria_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email,'@',1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'oficial'),
    (NEW.raw_user_meta_data->>'notaria_id')::UUID
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 10. Mock notarias for Sonia's super admin panel
INSERT INTO notarias (nombre, cif, ciudad, plan, mrr, estado, created_at)
SELECT 'Notaría García Martínez', 'B87654321', 'Madrid', 'pro', 397, 'activa', now() - interval '45 days'
WHERE NOT EXISTS (SELECT 1 FROM notarias WHERE nombre = 'Notaría García Martínez');

-- (Add ciudad column if needed)
ALTER TABLE notarias ADD COLUMN IF NOT EXISTS ciudad TEXT;
UPDATE notarias SET ciudad = 'Barcelona' WHERE nombre = 'Notaría Barceló i Associats';
