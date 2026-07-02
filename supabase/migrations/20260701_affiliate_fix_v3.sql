-- ══════════════════════════════════════════════════════════════
-- Migration v3: Fix affiliate system — correct table references
-- Run in Supabase SQL Editor (replaces v1 and v2 migrations)
-- ══════════════════════════════════════════════════════════════

-- 1. Fix affiliate_payouts: use referral_code (not affiliate_id)
--    The admin dashboard (AffiliatesManager) inserts by referral_code.
DROP TABLE IF EXISTS affiliate_payouts CASCADE;

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text         NOT NULL,               -- matches affiliate_applications.referral_code
  amount        numeric(10,2) NOT NULL CHECK (amount > 0),
  currency      text         NOT NULL DEFAULT 'USD',
  notes         text,
  paid_at       timestamptz  NOT NULL DEFAULT now(),
  created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apv3_referral_code
  ON affiliate_payouts (upper(referral_code));

ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_payouts_v3"
  ON affiliate_payouts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. get_current_commission_rate — reads from platform_settings (source of truth)
CREATE OR REPLACE FUNCTION get_current_commission_rate()
RETURNS TABLE(first_commission_pct numeric, recurring_commission_pct numeric)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    COALESCE(
      (SELECT value::numeric FROM platform_settings WHERE key = 'commission_first_rate' LIMIT 1),
      20
    ) AS first_commission_pct,
    COALESCE(
      (SELECT value::numeric FROM platform_settings WHERE key = 'commission_recurring_rate' LIMIT 1),
      10
    ) AS recurring_commission_pct;
$$;

GRANT EXECUTE ON FUNCTION get_current_commission_rate() TO anon;

-- 3. get_affiliate_stats — rebuilt from scratch using correct tables
--    Source tables:
--      affiliate_applications  → affiliate identity & status
--      tenant_requests         → referral events (subscription_tier, billing_cycle, total_amount)
--      affiliate_payouts       → payments made to affiliate (keyed by referral_code)
--      platform_settings       → commission rates
CREATE OR REPLACE FUNCTION get_affiliate_stats(p_code text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_aff        affiliate_applications%ROWTYPE;
  v_first_rate numeric;
  v_rec_rate   numeric;
  v_earned     numeric;
  v_paid_out   numeric;
  v_refs       json;
BEGIN
  SELECT * INTO v_aff
  FROM affiliate_applications
  WHERE upper(referral_code) = upper(trim(p_code))
  LIMIT 1;

  IF v_aff.id IS NULL THEN
    RETURN json_build_object('affiliate', null);
  END IF;

  -- Commission rates from platform_settings
  SELECT COALESCE(value::numeric, 20) INTO v_first_rate
  FROM platform_settings WHERE key = 'commission_first_rate' LIMIT 1;
  v_first_rate := COALESCE(v_first_rate, 20);

  SELECT COALESCE(value::numeric, 10) INTO v_rec_rate
  FROM platform_settings WHERE key = 'commission_recurring_rate' LIMIT 1;
  v_rec_rate := COALESCE(v_rec_rate, 10);

  -- Earned = SUM(total_amount of approved requests) × first_rate%
  --          (matches admin's computeEarnings logic exactly)
  SELECT COALESCE(ROUND(SUM(total_amount) * (v_first_rate / 100), 2), 0)
  INTO v_earned
  FROM tenant_requests
  WHERE upper(referral_code) = upper(trim(p_code))
    AND status = 'approved';

  -- Paid out = SUM(affiliate_payouts) keyed by referral_code
  SELECT COALESCE(ROUND(SUM(amount)::numeric, 2), 0)
  INTO v_paid_out
  FROM affiliate_payouts
  WHERE upper(referral_code) = upper(trim(p_code));

  -- Per-referral details from tenant_requests
  SELECT json_agg(
    json_build_object(
      'id',             r.id,
      'name',           COALESCE(r.institute_name, '—'),
      'tier',           r.subscription_tier,        -- plan name
      'billing_cycle',  r.billing_cycle,             -- 'monthly'|'annual'|'1'|'3'|'6'|'12'
      'order_amount',   r.total_amount,
      'commission',     CASE
                          WHEN r.status = 'approved'
                          THEN ROUND((COALESCE(r.total_amount,0) * v_first_rate / 100)::numeric, 2)
                          ELSE NULL
                        END,
      'date',           r.created_at,
      'status',         r.status                    -- approved | pending | rejected
    )
    ORDER BY r.created_at DESC
  )
  INTO v_refs
  FROM tenant_requests r
  WHERE upper(r.referral_code) = upper(trim(p_code));

  RETURN json_build_object(
    'affiliate',      json_build_object(
                        'id',        v_aff.id,
                        'name',      v_aff.full_name,
                        'joined_at', v_aff.created_at,
                        'status',    v_aff.status
                      ),
    'total',          (SELECT COUNT(*) FROM tenant_requests WHERE upper(referral_code) = upper(trim(p_code))),
    'active',         (SELECT COUNT(*) FROM tenant_requests WHERE upper(referral_code) = upper(trim(p_code)) AND status = 'approved'),
    'pending',        (SELECT COUNT(*) FROM tenant_requests WHERE upper(referral_code) = upper(trim(p_code)) AND status = 'pending'),
    'earned',         v_earned,
    'paid_out',       v_paid_out,
    'pending_payout', ROUND((v_earned - v_paid_out)::numeric, 2),
    'first_rate',     v_first_rate,
    'referrals',      COALESCE(v_refs, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_affiliate_stats(text) TO anon;
