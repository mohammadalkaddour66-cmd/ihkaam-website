-- ══════════════════════════════════════════════════════════════
-- Migration: Lead Funnel — Conversion Tracking
-- Run this in the Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Lead magnet subscribers (email capture from all pages)
CREATE TABLE IF NOT EXISTS lead_magnet_subscribers (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text        NOT NULL,
  source_page  text,                        -- '/insights', '/ihkaam', '/blog', '/'
  variant      text,                        -- 'pdf' | 'insights' | 'blog' | 'ihkaam'
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  referrer     text,
  sequence_step int        NOT NULL DEFAULT 0,  -- 0=just signed up, 1=email1 sent, etc.
  converted_at  timestamptz,                -- set when subscriber completes checkout
  unsubscribed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one entry per email (duplicates treated as success)
ALTER TABLE lead_magnet_subscribers
  ADD CONSTRAINT lead_magnet_subscribers_email_key UNIQUE (email);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_lms_created_at ON lead_magnet_subscribers (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lms_variant    ON lead_magnet_subscribers (variant);
CREATE INDEX IF NOT EXISTS idx_lms_converted  ON lead_magnet_subscribers (converted_at) WHERE converted_at IS NOT NULL;

-- RLS: allow public inserts, no public reads
ALTER TABLE lead_magnet_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_subscribers"
  ON lead_magnet_subscribers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "service_role_all_subscribers"
  ON lead_magnet_subscribers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Add referral_code column to tenant_requests (if it doesn't exist)
--    Tracks which affiliate referred this checkout
ALTER TABLE tenant_requests
  ADD COLUMN IF NOT EXISTS referral_code text;

-- 3. Mark subscriber as converted when they complete checkout
--    Call this from IhkaamCheckout.jsx after successful order insert:
--    supabase.from('lead_magnet_subscribers')
--      .update({ converted_at: new Date().toISOString() })
--      .eq('email', checkoutEmail)
--      .is('converted_at', null)
-- (No schema change needed — column already exists above)

-- 3. Helpful view for the admin dashboard
CREATE OR REPLACE VIEW lead_funnel_summary AS
SELECT
  COUNT(*)                                              AS total_subscribers,
  COUNT(*) FILTER (WHERE variant = 'pdf')              AS from_pdf,
  COUNT(*) FILTER (WHERE variant = 'insights')         AS from_insights,
  COUNT(*) FILTER (WHERE variant = 'blog')             AS from_blog,
  COUNT(*) FILTER (WHERE variant = 'ihkaam')           AS from_ihkaam,
  COUNT(*) FILTER (WHERE converted_at IS NOT NULL)     AS converted,
  ROUND(
    COUNT(*) FILTER (WHERE converted_at IS NOT NULL)::numeric
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                     AS conversion_rate_pct
FROM lead_magnet_subscribers;

-- ══════════════════════════════════════════════════════════════
-- Trigger: notify Edge Function on new subscriber
-- (Set up in Supabase Dashboard → Database → Webhooks)
--
-- URL: https://<project-ref>.supabase.co/functions/v1/send-lead-email
-- Event: INSERT on lead_magnet_subscribers
-- HTTP Method: POST
-- Headers: Authorization: Bearer <anon-key>
-- ══════════════════════════════════════════════════════════════
