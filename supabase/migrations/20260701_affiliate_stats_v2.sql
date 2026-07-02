-- ══════════════════════════════════════════════════════════════
-- Migration: Affiliate Stats v2 — commission summary + referral details
-- Run in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Payouts table — tracks what's been paid to each affiliate
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id  uuid         NOT NULL REFERENCES affiliate_applications(id) ON DELETE CASCADE,
  amount        numeric(10,2) NOT NULL CHECK (amount > 0),
  paid_at       timestamptz  NOT NULL DEFAULT now(),
  note          text,
  created_by    text,
  created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ap_affiliate_id ON affiliate_payouts (affiliate_id);

ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_payouts"
  ON affiliate_payouts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Enrich affiliate_referrals with subscription detail columns
--    (populated when a tenant_request is linked to this referral)
ALTER TABLE affiliate_referrals
  ADD COLUMN IF NOT EXISTS institute_id    uuid,          -- FK to institutes — groups all renewals per client
  ADD COLUMN IF NOT EXISTS institute_name  text,          -- denormalized for fast display
  ADD COLUMN IF NOT EXISTS plan_label      text,          -- 'اشتراك سنوي', 'اشتراك ربع سنوي', etc.
  ADD COLUMN IF NOT EXISTS plan_months     int,           -- 12, 3, 1 ...
  ADD COLUMN IF NOT EXISTS order_amount    numeric(10,2), -- original subscription price in USD
  ADD COLUMN IF NOT EXISTS commission_type text           -- 'first' | 'renewal'
    CHECK (commission_type IN ('first', 'renewal')),
  ADD COLUMN IF NOT EXISTS commission_amount numeric(10,2); -- computed commission amount

CREATE INDEX IF NOT EXISTS idx_ar_institute_id
  ON affiliate_referrals (institute_id) WHERE institute_id IS NOT NULL;

-- 3. Updated get_affiliate_stats — returns full dashboard data
CREATE OR REPLACE FUNCTION get_affiliate_stats(p_code text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_affiliate   affiliate_applications%ROWTYPE;
  v_paid_out    numeric(10,2);
  v_earned      numeric(10,2);
  v_referrals   json;
BEGIN
  -- Fetch affiliate row
  SELECT * INTO v_affiliate
  FROM affiliate_applications
  WHERE referral_code = upper(trim(p_code))
  LIMIT 1;

  IF v_affiliate.id IS NULL THEN
    RETURN json_build_object('affiliate', null);
  END IF;

  -- Total paid out
  SELECT COALESCE(SUM(amount), 0) INTO v_paid_out
  FROM affiliate_payouts
  WHERE affiliate_id = v_affiliate.id;

  -- Total earned (sum of all commission_amount in referrals)
  SELECT COALESCE(SUM(commission_amount), 0) INTO v_earned
  FROM affiliate_referrals
  WHERE referral_code = upper(trim(p_code))
    AND status = 'active';

  -- Per-referral details (include institute_id for reliable client grouping)
  SELECT json_agg(
    json_build_object(
      'id',               r.id,
      'institute_id',     r.institute_id,           -- groups renewals under same client
      'name',             COALESCE(r.institute_name, '—'),
      'tier',             COALESCE(r.plan_label, '—'),
      'plan_months',      r.plan_months,
      'order_amount',     r.order_amount,
      'commission',       r.commission_amount,
      'commission_type',  r.commission_type,        -- 'first' | 'renewal'
      'date',             r.created_at,
      'status',           r.status                  -- active | expired | cancelled | pending
    )
    ORDER BY r.created_at DESC
  )
  INTO v_referrals
  FROM affiliate_referrals r
  WHERE r.referral_code = upper(trim(p_code));

  RETURN json_build_object(
    'affiliate',      json_build_object(
                        'id',        v_affiliate.id,
                        'name',      v_affiliate.full_name,
                        'joined_at', v_affiliate.created_at,
                        'status',    v_affiliate.status
                      ),
    'total',          (SELECT COUNT(*)    FROM affiliate_referrals WHERE referral_code = upper(trim(p_code))),
    'active',         (SELECT COUNT(*)    FROM affiliate_referrals WHERE referral_code = upper(trim(p_code)) AND status = 'active'),
    'pending',        (SELECT COUNT(*)    FROM affiliate_referrals WHERE referral_code = upper(trim(p_code)) AND status = 'pending'),
    'earned',         v_earned,
    'paid_out',       v_paid_out,
    'pending_payout', (v_earned - v_paid_out),
    'referrals',      COALESCE(v_referrals, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_affiliate_stats(text) TO anon;

-- ══════════════════════════════════════════════════════════════
-- HOW COMMISSION IS COMPUTED PER REFERRAL (app ayoubi logic):
--
-- When tenant_request is marked active for the first time:
--   commission_type   = 'first'
--   commission_amount = order_amount * (locked_first_pct / 100)
--
-- When same client renews (new tenant_request row with same referral_code):
--   commission_type   = 'renewal'
--   commission_amount = order_amount * (locked_recurring_pct / 100)
--
-- locked_first_pct / locked_recurring_pct come from affiliate_commission_rates
-- at the time of the ORIGINAL referral (rate locking — see migration 20260701).
-- ══════════════════════════════════════════════════════════════
