-- ═══════════════════════════════════════════════════════════════
-- NotaFlow — Row Level Security (RLS)
-- Roles: notario (acceso total) · oficial (operativo) · gestoria (solo sus expedientes)
-- Ejecutar DESPUÉS de 001_schema.sql
-- ═══════════════════════════════════════════════════════════════

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

-- ── PROFILES ────────────────────────────────────────────────────
CREATE POLICY "Todos pueden leer perfiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Notario gestiona perfiles"
  ON profiles FOR ALL USING (get_user_role() = 'notario');

CREATE POLICY "Usuario edita su propio perfil"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- ── LEADS ───────────────────────────────────────────────────────
-- Gestoría no accede a leads
CREATE POLICY "Staff lee leads"
  ON leads FOR SELECT USING (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "Staff crea leads"
  ON leads FOR INSERT WITH CHECK (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "Staff actualiza leads"
  ON leads FOR UPDATE USING (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "Notario borra leads"
  ON leads FOR DELETE USING (get_user_role() = 'notario');

-- ── EXPEDIENTES ─────────────────────────────────────────────────
CREATE POLICY "Notario/Oficial lee todos los expedientes"
  ON expedientes FOR SELECT
  USING (get_user_role() IN ('notario', 'oficial'));

CREATE POLICY "Gestoría lee sus expedientes"
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

-- ── EXPEDIENTE DOCS ──────────────────────────────────────────────
CREATE POLICY "Lee docs según acceso al expediente"
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

-- ── AGENDA ──────────────────────────────────────────────────────
CREATE POLICY "Staff gestiona agenda"
  ON agenda FOR ALL
  USING (get_user_role() IN ('notario', 'oficial'));

-- ── FACTURAS ────────────────────────────────────────────────────
CREATE POLICY "Notario gestiona facturas"
  ON facturas FOR ALL
  USING (get_user_role() = 'notario');

CREATE POLICY "Oficial lee facturas"
  ON facturas FOR SELECT
  USING (get_user_role() = 'oficial');
