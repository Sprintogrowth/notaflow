-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NotaFlow â€” Schema inicial
-- Ejecutar en: Supabase â†’ SQL Editor â†’ Run
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TYPE user_role AS ENUM ('notario', 'oficial', 'gestoria');

-- â”€â”€ Profiles (extiende auth.users) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre     TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'oficial',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€ Leads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ Expedientes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ Documentos de expediente â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE expediente_docs (
  id             BIGSERIAL PRIMARY KEY,
  expediente_id  TEXT NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  nombre         TEXT NOT NULL,
  recibido       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€ Agenda â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ Facturas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ Triggers updated_at â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER expedientes_updated_at
  BEFORE UPDATE ON expedientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- â”€â”€ Auto-crear profile al registrar usuario â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NotaFlow â€” Row Level Security (RLS)
-- Roles: notario (acceso total) Â· oficial (operativo) Â· gestoria (solo sus expedientes)
-- Ejecutar DESPUÃ‰S de 001_schema.sql
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE expediente_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda         ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas       ENABLE ROW LEVEL SECURITY;

-- Helper: rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- â”€â”€ PROFILES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Todos pueden leer perfiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Notario gestiona perfiles"
  ON profiles FOR ALL USING (get_user_role() = 'notario');

CREATE POLICY "Usuario edita su propio perfil"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- â”€â”€ LEADS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- GestorÃ­a no accede a leads
CREATE POLICY "Staff lee leads"
  ON leads FOR SELECT USING (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "Staff crea leads"
  ON leads FOR INSERT WITH CHECK (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "Staff actualiza leads"
  ON leads FOR UPDATE USING (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "Notario borra leads"
  ON leads FOR DELETE USING (get_user_role() = 'notario');

-- â”€â”€ EXPEDIENTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Notario/Oficial lee todos los expedientes"
  ON expedientes FOR SELECT
  USING (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "GestorÃ­a lee sus expedientes"
  ON expedientes FOR SELECT
  USING (get_user_role() = 'gestoria' AND gestoria_id = auth.uid());

CREATE POLICY "Staff crea expedientes"
  ON expedientes FOR INSERT
  WITH CHECK (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "Staff actualiza expedientes"
  ON expedientes FOR UPDATE
  USING (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "Notario cierra/borra expedientes"
  ON expedientes FOR DELETE
  USING (get_user_role() = 'notario');

-- â”€â”€ EXPEDIENTE DOCS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Lee docs segÃºn acceso al expediente"
  ON expediente_docs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expedientes e
      WHERE e.id = expediente_id
        AND (
          get_user_role() IN ('notario', 'oficial')
          OR (get_user_role() = 'gestoria' AND e.gestoria_id = auth.uid())
        )
    )
  );

CREATE POLICY "Staff gestiona docs"
  ON expediente_docs FOR ALL
  USING (get_user_role() IN ('notario', 'oficial'));

-- â”€â”€ AGENDA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Staff gestiona agenda"
  ON agenda FOR ALL
  USING (get_user_role() IN ('notario', 'oficial'));

-- â”€â”€ FACTURAS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Notario gestiona facturas"
  ON facturas FOR ALL
  USING (get_user_role() = 'notario');

CREATE POLICY "Oficial lee facturas"
  ON facturas FOR SELECT
  USING (get_user_role() = 'oficial');


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NotaFlow â€” Datos de demostraciÃ³n
-- Ejecutar DESPUÃ‰S de crear el primer usuario notario en Supabase Auth
-- Sustituir <NOTARIO_USER_ID> por el UUID real del usuario notario
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Leads de ejemplo
INSERT INTO leads (nombre, tipo, canal, estado, tel, email, msg, urgencia) VALUES
  ('Carmen Ruiz Medina',   'Compraventa',    'WhatsApp',    'nuevo',        '+34 612 345 678', 'carmen@email.com',  'Necesito escritura para venta de piso en Eixample, somos comprador y vendedor, hay hipoteca pendiente.', 'alta'),
  ('Javier Molina Torres', 'Testamento',     'Instagram',   'contactado',   '+34 623 456 789', 'jmolina@email.com', 'Quiero hacer testamento, tengo dos hijos y piso en propiedad.',                                         'media'),
  ('LucÃ­a FernÃ¡ndez Gil',  'Poder Notarial', 'Web',         'cita_agendada','+34 634 567 890', 'lucia.fg@email.com','Mi madre estÃ¡ en Valencia y necesita poder para que yo gestione la venta de su inmueble.',               'alta'),
  ('Inversiones BCN SL',   'ConstituciÃ³n SL','WhatsApp',    'nuevo',        '+34 645 678 901', 'admin@invbcn.com',  'Queremos constituir una sociedad limitada, somos 3 socios, capital inicial 15.000â‚¬.',                   'media'),
  ('Pedro SÃ¡nchez Vidal',  'Herencia',       'Google Maps', 'contactado',   '+34 656 789 012', 'pedro.sv@email.com','Ha fallecido mi padre, hay un piso y una cuenta bancaria. Somos dos herederos.',                       'alta');

-- Expedientes de ejemplo
INSERT INTO expedientes (id, cliente, tipo, valor, estado, fecha_apertura, notas, urgente) VALUES
  ('EXP-2024-0341', 'Carmen Ruiz Medina',   'Compraventa',    320000, 'documentacion',   '2024-06-14', 'Comprador con hipoteca BBVA pendiente de cancelar. Coordinar con banco.', true),
  ('EXP-2024-0339', 'Familia MartÃ­nez Roca','Herencia',       185000, 'revision',        '2024-06-10', 'Dos herederos. El testamento favorece al hijo mayor. Posible conflicto con hija.', false),
  ('EXP-2024-0337', 'Tech Startup SL',      'ConstituciÃ³n SL',  3000, 'pendiente_firma', '2024-06-06', '3 socios. Firma programada. Confirmar asistencia de todos.', true),
  ('EXP-2024-0335', 'Roberto Iglesias Prat','Testamento',     NULL,   'tramitacion',     '2024-06-12', 'Enviado al Registro General de Actos de Ãšltima Voluntad. Plazo 30 dÃ­as.', false),
  ('EXP-2024-0332', 'Inversiones BCN SL',   'Compraventa',    890000, 'cerrado',         '2024-05-27', 'Cerrado correctamente. InscripciÃ³n Registro confirmada.', false);

-- Documentos por expediente
INSERT INTO expediente_docs (expediente_id, nombre, recibido) VALUES
  ('EXP-2024-0341','DNI comprador', true),('EXP-2024-0341','DNI vendedor', true),('EXP-2024-0341','Nota simple Registro', true),
  ('EXP-2024-0341','Certificado IBI', false),('EXP-2024-0341','Ãšltimas 3 facturas suministros', false),
  ('EXP-2024-0341','Certificado comunidad al corriente', false),('EXP-2024-0341','TasaciÃ³n bancaria', false),
  ('EXP-2024-0339','Certificado defunciÃ³n', true),('EXP-2024-0339','Certificado Ãºltimas voluntades', true),
  ('EXP-2024-0339','Testamento', true),('EXP-2024-0339','DNI herederos', true),('EXP-2024-0339','Nota simple piso', true),
  ('EXP-2024-0337','DNI socios', true),('EXP-2024-0337','Certificado negativo de nombre (Registro Mercantil)', true),
  ('EXP-2024-0337','Estatutos sociales borrador', true),('EXP-2024-0337','Certificado depÃ³sito capital', true),
  ('EXP-2024-0335','DNI testador', true),('EXP-2024-0335','Libro de familia', true),('EXP-2024-0335','Certificado empadronamiento', true);

-- Agenda de hoy
INSERT INTO agenda (hora, cliente, tipo, sala, estado, tel, exp_id) VALUES
  ('09:30', 'Sra. LÃ³pez Vidal',    'Testamento',     'Despacho 1',    'confirmada', '+34 611 222 333', NULL),
  ('10:00', 'Sr. y Sra. Puig Mas', 'Compraventa',    'Sala de Firmas','confirmada', '+34 622 333 444', NULL),
  ('11:15', 'Inversiones BCN SL',  'ConstituciÃ³n SL','Despacho 2',    'pendiente',  '+34 633 444 555', 'EXP-2024-0337'),
  ('12:30', 'Familia Roca Mas',    'Herencia',       'Despacho 1',    'confirmada', '+34 644 555 666', NULL),
  ('16:00', 'Tech Startup SL',     'ConstituciÃ³n SL','Sala de Firmas','confirmada', '+34 655 666 777', 'EXP-2024-0337'),
  ('17:30', 'Dra. Marta Valls',    'Testamento',     'Despacho 2',    'pendiente',  '+34 666 777 888', NULL);

-- Facturas
INSERT INTO facturas (id, cliente, tipo, base, total, estado, fecha) VALUES
  ('FAC-2024-041', 'Familia Puig Mas',  'Compraventa',    1840, 2226, 'cobrada',  '2024-06-12'),
  ('FAC-2024-040', 'Tech Startup SL',   'ConstituciÃ³n SL', 480,  581, 'pendiente','2024-06-10'),
  ('FAC-2024-039', 'Roberto Iglesias',  'Testamento',      320,  387, 'cobrada',  '2024-06-08'),
  ('FAC-2024-038', 'Inversiones BCN SL','Compraventa',    2960, 3582, 'cobrada',  '2024-06-02');


-- ============================================================
-- NotaFlow v4 â€” Schema upgrade
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
  'NotarÃ­a BarcelÃ³ i Associats',
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
SELECT 'NotarÃ­a GarcÃ­a MartÃ­nez', 'B87654321', 'Madrid', 'pro', 397, 'activa', now() - interval '45 days'
WHERE NOT EXISTS (SELECT 1 FROM notarias WHERE nombre = 'NotarÃ­a GarcÃ­a MartÃ­nez');

-- (Add ciudad column if needed)
ALTER TABLE notarias ADD COLUMN IF NOT EXISTS ciudad TEXT;
UPDATE notarias SET ciudad = 'Barcelona' WHERE nombre = 'NotarÃ­a BarcelÃ³ i Associats';


-- Add Stripe columns to notarias
ALTER TABLE notarias
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Update estado enum to allow pago_fallido
-- (notarias.estado is TEXT so no enum change needed)

-- Index for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_notarias_stripe_customer ON notarias(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_notarias_stripe_sub      ON notarias(stripe_subscription_id);

-- subscriptions table (created in 004 but ensure columns exist)
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;


-- Add contact fields to agenda for reminders
ALTER TABLE agenda
  ADD COLUMN IF NOT EXISTS email    TEXT,
  ADD COLUMN IF NOT EXISTS telefono TEXT;

-- Add WhatsApp number to notarÃ­as (for inbound routing)
ALTER TABLE notarias
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Index for WhatsApp inbound routing
CREATE INDEX IF NOT EXISTS idx_notarias_whatsapp ON notarias(whatsapp_number);

