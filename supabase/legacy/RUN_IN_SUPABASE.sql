-- ══════════════════════════════════════════════════════════════
-- شغّل هذا الـ SQL في Supabase SQL Editor مرة واحدة
-- ══════════════════════════════════════════════════════════════

-- 1. جدول affiliate_payouts (يُنشأ إذا لم يكن موجوداً)
--    يستخدم referral_code كما يكتب الأدمن في AffiliatesManager
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text         NOT NULL,
  amount        numeric(10,2) NOT NULL CHECK (amount > 0),
  currency      text         NOT NULL DEFAULT 'USD',
  notes         text,
  paid_at       timestamptz  NOT NULL DEFAULT now(),
  created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_code
  ON affiliate_payouts (upper(referral_code));

ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_payouts" ON affiliate_payouts;
CREATE POLICY "service_role_all_payouts"
  ON affiliate_payouts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────
-- 2. تجميد نسبة العمولة لكل اشتراك — commission_rate
--    يُحفظ وقت التفعيل، لا يتأثر بأي تعديل لاحق على الأسعار
-- ──────────────────────────────────────────────────────────────
ALTER TABLE tenant_requests
  ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2);

-- ──────────────────────────────────────────────────────────────
-- 3. get_current_commission_rate
--    يقرأ من platform_settings (مصدر الحقيقة الذي يكتب فيه الأدمن)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_current_commission_rate()
RETURNS TABLE(first_commission_pct numeric, recurring_commission_pct numeric)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    COALESCE(
      (SELECT value::numeric FROM platform_settings
       WHERE key = 'commission_first_rate' LIMIT 1), 20
    ),
    COALESCE(
      (SELECT value::numeric FROM platform_settings
       WHERE key = 'commission_recurring_rate' LIMIT 1), 10
    );
$$;

GRANT EXECUTE ON FUNCTION get_current_commission_rate() TO anon;

-- ──────────────────────────────────────────────────────────────
-- 4. get_affiliate_stats (النسخة المحدّثة)
--    - العمولة محسوبة من commission_rate المحفوظة في كل صف
--    - للصفوف القديمة التي لا تملك commission_rate تُستخدم النسبة الحالية كاحتياط
--    - paid_out من affiliate_payouts بـ referral_code
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_affiliate_stats(p_code text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_aff        affiliate_applications%ROWTYPE;
  v_first_rate numeric;
  v_rec_rate   numeric;
  v_earned     numeric;
  v_paid_out   numeric;
  v_refs       json;
  v_code       text := upper(trim(p_code));
BEGIN
  SELECT * INTO v_aff
  FROM affiliate_applications
  WHERE upper(referral_code) = v_code
  LIMIT 1;

  IF v_aff.id IS NULL THEN
    RETURN json_build_object('affiliate', null);
  END IF;

  -- النسبة الحالية من platform_settings — تُستخدم فقط للصفوف القديمة التي لا تملك commission_rate
  SELECT COALESCE(value::numeric, 20) INTO v_first_rate
  FROM platform_settings WHERE key = 'commission_first_rate' LIMIT 1;
  v_first_rate := COALESCE(v_first_rate, 20);

  SELECT COALESCE(value::numeric, 10) INTO v_rec_rate
  FROM platform_settings WHERE key = 'commission_recurring_rate' LIMIT 1;
  v_rec_rate := COALESCE(v_rec_rate, 10);

  -- إجمالي مستحق: كل صف يُحسب بنسبته المجمّدة (أو الحالية كاحتياط)
  SELECT COALESCE(
    ROUND(SUM(
      COALESCE(r.total_amount, 0)
      * COALESCE(r.commission_rate, v_first_rate)
      / 100.0
    ), 2),
    0
  )
  INTO v_earned
  FROM tenant_requests r
  WHERE upper(r.referral_code) = v_code AND r.status = 'approved';

  -- مدفوع للشريك من affiliate_payouts
  SELECT COALESCE(ROUND(SUM(amount)::numeric, 2), 0)
  INTO v_paid_out
  FROM affiliate_payouts
  WHERE upper(referral_code) = v_code;

  -- تفاصيل كل اشتراك — العمولة محسوبة بنسبة الصف المجمّدة
  SELECT json_agg(
    json_build_object(
      'id',              r.id,
      'name',            COALESCE(r.institute_name, '—'),
      'tier',            r.subscription_tier,
      'billing_cycle',   r.billing_cycle,
      'order_amount',    r.total_amount,
      'commission_rate', COALESCE(r.commission_rate, v_first_rate),
      'commission',      CASE WHEN r.status = 'approved'
                              THEN ROUND(
                                (COALESCE(r.total_amount, 0)
                                 * COALESCE(r.commission_rate, v_first_rate)
                                 / 100.0)::numeric,
                                2
                              )
                              ELSE NULL END,
      'date',            r.created_at,
      'status',          r.status
    )
    ORDER BY r.created_at DESC
  )
  INTO v_refs
  FROM tenant_requests r
  WHERE upper(r.referral_code) = v_code;

  RETURN json_build_object(
    'affiliate',      json_build_object(
                        'id',        v_aff.id,
                        'name',      v_aff.full_name,
                        'joined_at', v_aff.created_at,
                        'status',    v_aff.status
                      ),
    'total',          (SELECT COUNT(*) FROM tenant_requests WHERE upper(referral_code) = v_code),
    'active',         (SELECT COUNT(*) FROM tenant_requests WHERE upper(referral_code) = v_code AND status = 'approved'),
    'pending',        (SELECT COUNT(*) FROM tenant_requests WHERE upper(referral_code) = v_code AND status = 'pending'),
    'earned',         v_earned,
    'paid_out',       v_paid_out,
    'pending_payout', ROUND((v_earned - v_paid_out)::numeric, 2),
    'first_rate',     v_first_rate,
    'referrals',      COALESCE(v_refs, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_affiliate_stats(text) TO anon;
