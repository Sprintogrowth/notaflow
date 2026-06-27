-- Add contact fields to agenda for reminders
ALTER TABLE agenda
  ADD COLUMN IF NOT EXISTS email    TEXT,
  ADD COLUMN IF NOT EXISTS telefono TEXT;

-- Add WhatsApp number to notarías (for inbound routing)
ALTER TABLE notarias
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Index for WhatsApp inbound routing
CREATE INDEX IF NOT EXISTS idx_notarias_whatsapp ON notarias(whatsapp_number);
