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
