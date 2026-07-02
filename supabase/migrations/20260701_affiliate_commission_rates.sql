-- ══════════════════════════════════════════════════════════════
-- Migration: Affiliate Commission Rates — admin-controlled
-- ══════════════════════════════════════════════════════════════

-- 1. Commission rates table (managed from admin dashboard)
--    Only one "active" row at a time; new rates don't erase history.
CREATE TABLE IF NOT EXISTS affiliate_commission_rates (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_commission_pct  numeric(5,2) NOT NULL CHECK (first_commission_pct BETWEEN 0 AND 100),
  recurring_commission_pct numeric(5,2) NOT NULL CHECK (recurring_commission_pct BETWEEN 0 AND 100),
  effective_from        timestamptz  NOT NULL DEFAULT now(),
  note                  text,                          -- e.g. 'تخفيض موسمي رمضان'
  created_by            text,                          -- admin user identifier
  created_at            timestamptz  NOT NULL DEFAULT now()
);

-- Index for fast "current rate" query (latest by effective_from)
CREATE INDEX IF NOT EXISTS idx_acr_effective
  ON affiliate_commission_rates (effective_from DESC);

-- RLS: public can read, only service_role can write
ALTER TABLE affiliate_commission_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_commission_rates"
  ON affiliate_commission_rates FOR SELECT
  TO anon
  USING (effective_from <= now());

CREATE POLICY "service_role_all_commission_rates"
  ON affiliate_commission_rates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Seed initial rates (matches current hardcoded values in AffiliatePage)
INSERT INTO affiliate_commission_rates
  (first_commission_pct, recurring_commission_pct, note, created_by)
VALUES
  (20, 10, 'معدل الإطلاق الافتراضي', 'system');

-- 3. Add locked-rate columns to affiliate_referrals
--    These are snapshotted when the referral is created — never change after.
ALTER TABLE affiliate_referrals
  ADD COLUMN IF NOT EXISTS locked_first_pct     numeric(5,2),
  ADD COLUMN IF NOT EXISTS locked_recurring_pct numeric(5,2);

-- 4. Helper function: get the current active commission rate
CREATE OR REPLACE FUNCTION get_current_commission_rate()
RETURNS TABLE(
  first_commission_pct     numeric,
  recurring_commission_pct numeric,
  effective_from           timestamptz
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT first_commission_pct, recurring_commission_pct, effective_from
  FROM affiliate_commission_rates
  WHERE effective_from <= now()
  ORDER BY effective_from DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_current_commission_rate() TO anon;

-- 5. Helper function: get rate that was active at a specific timestamp
--    Used to backfill locked_first_pct / locked_recurring_pct on old referrals.
CREATE OR REPLACE FUNCTION get_commission_rate_at(p_timestamp timestamptz)
RETURNS TABLE(
  first_commission_pct     numeric,
  recurring_commission_pct numeric
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT first_commission_pct, recurring_commission_pct
  FROM affiliate_commission_rates
  WHERE effective_from <= p_timestamp
  ORDER BY effective_from DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_commission_rate_at(timestamptz) TO service_role;

-- ══════════════════════════════════════════════════════════════
-- HOW TO USE FROM APP AYOUBI (admin dashboard):
--
-- To update commission rates:
--   INSERT INTO affiliate_commission_rates
--     (first_commission_pct, recurring_commission_pct, note, created_by)
--   VALUES (15, 7, 'تعديل Q3 2026', 'admin_user_id');
--
-- The new row becomes "current" automatically (effective_from = now()).
-- Old referrals keep their locked_first_pct / locked_recurring_pct unchanged.
-- New referrals should snapshot the current rate on creation:
--
--   const { data: rate } = await supabase.rpc('get_current_commission_rate')
--   await supabase.from('affiliate_referrals').insert({
--     ...,
--     locked_first_pct:     rate[0].first_commission_pct,
--     locked_recurring_pct: rate[0].recurring_commission_pct,
--   })
-- ══════════════════════════════════════════════════════════════
