-- ══════════════════════════════════════════════════════════════════
-- تراجع — إلغاء 20260714_lock_platform_tables.sql بالكامل
-- يعيد الجداول الستة إلى حالتها قبل الإصلاح تماماً، بلا زيادة ولا نقصان.
--
-- مبنيّ على لقطة STEP0 الفعلية (2026-07-15): الجداول الستة كان RLS
-- مُفعّلاً عليها أصلاً، وعليها سياسات مفتوحة (USING true لدور public/anon)
-- هي ما كان يسمح للزائر بالعبث. هذا الملف:
--   1. يحذف سياسات الإصلاح.
--   2. يُعيد السياسات الأصلية الـ19 حرفياً كما كانت.
--   3. يُبقي RLS مُفعّلاً (كما كان — لا يعطّله).
--   4. يُعيد صلاحيات الزائر (anon) التي سحبها الإصلاح، بقيمها الأصلية.
--
-- النتيجة: حالة مطابقة للّقطة تماماً.
--
-- ⚠️ تحذير: تشغيله يُعيد فتح الثغرات. لا تشغّله إلا إن ظهر خلل فعلي بعد
-- الإصلاح وأردت العودة الفورية ريثما نعالج السبب.
--
-- معاملة ذرّية: إن فشل شيء لا يُطبَّق شيء.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- ── (1) حذف كل سياسات الإصلاح على الجداول الستة ───────────────────
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT tablename, policyname FROM pg_policies
             WHERE schemaname = 'public'
               AND tablename IN ('institutes','system_settings','store_features',
                                 'gallery_items','testimonials','affiliate_applications')
  LOOP EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename); END LOOP;
END $$;

-- ── (2) إعادة السياسات الأصلية حرفياً (من لقطة STEP0) ─────────────

-- affiliate_applications (5 سياسات)
CREATE POLICY "admin_select" ON public.affiliate_applications
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_update" ON public.affiliate_applications
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "anon read affiliate_applications" ON public.affiliate_applications
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon update affiliate_applications" ON public.affiliate_applications
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_insert" ON public.affiliate_applications
  FOR INSERT TO anon WITH CHECK (true);

-- gallery_items (4 سياسات — دور public)
CREATE POLICY "Allow deleting gallery"  ON public.gallery_items
  FOR DELETE TO public USING (true);
CREATE POLICY "Allow inserting gallery" ON public.gallery_items
  FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow reading gallery"   ON public.gallery_items
  FOR SELECT TO public USING (true);
CREATE POLICY "Allow updating gallery"  ON public.gallery_items
  FOR UPDATE TO public USING (true);

-- institutes (سياسة واحدة — دور public)
CREATE POLICY "Global Access for Institute" ON public.institutes
  FOR ALL TO public USING (true);

-- store_features (سياستان — دور public)
CREATE POLICY "Allow all on store_features" ON public.store_features
  FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public reading of store features" ON public.store_features
  FOR SELECT TO public USING (true);

-- system_settings (سياستان — دور public)
CREATE POLICY "Allow all operations on system_settings" ON public.system_settings
  FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access on system_settings" ON public.system_settings
  FOR SELECT TO public USING (true);

-- testimonials (5 سياسات)
CREATE POLICY "anon can delete" ON public.testimonials
  FOR DELETE TO anon USING (true);
CREATE POLICY "anon can update status" ON public.testimonials
  FOR UPDATE TO anon USING (true);
CREATE POLICY "anon full select" ON public.testimonials
  FOR SELECT TO anon USING (true);
CREATE POLICY "anyone can insert" ON public.testimonials
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "service role full access" ON public.testimonials
  FOR ALL TO service_role USING (true);

-- ── (3) RLS يبقى مُفعّلاً كما كان (تأكيد صريح، لا تعطيل) ──────────
ALTER TABLE public.institutes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_features         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;

-- ── (4) إعادة صلاحيات الزائر (anon) بقيمها الأصلية من اللقطة ──────
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON public.institutes      TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON public.system_settings TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON public.store_features  TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON public.gallery_items   TO anon;
GRANT DELETE, INSERT, SELECT, UPDATE
  ON public.testimonials    TO anon;
GRANT INSERT, SELECT, UPDATE
  ON public.affiliate_applications TO anon;

COMMIT;
