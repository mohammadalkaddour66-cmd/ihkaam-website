-- ══════════════════════════════════════════════════════════════════
-- استعادة عمل نماذج الموقع العامة أمام الزائر (anon) — إصلاح تعطّل وظيفي
--
-- ثبت بالاختبار الحيّ (بمفتاح anon) أن تحصين RLS الشامل في تطبيق إحكام سحب
-- صلاحيات الزائر عن جداول الموقع التسويقي، فتعطّلت نماذجه العامة كلها.
-- الـmigrations السابقة (lock_platform_tables) استعادت جزءاً فقط
-- (system_settings / store_features / gallery_items للقراءة)، وبقيت جداول
-- النماذج نفسها مقطوعة. الأعراض المؤكَّدة بالاختبار (خطأ 42501):
--
--   ❌ tenant_requests        → «طلب تفعيل معهد» يفشل (permission denied)
--   ❌ demo_requests          → «طلب نسخة تجريبية» يفشل
--   ❌ testimonials (INSERT)  → «إرسال تقييم» يفشل (violates RLS)
--   ❌ affiliate_applications → «طلب الانضمام للإحالة» يفشل (لا GRANT)
--   ❌ lead_magnet_subscribers→ «الاشتراك البريدي» يفشل
--   ❌ institute_settings     → قسم الشركاء وقصص النجاح لا يظهر (SELECT مرفوض)
--
-- نموذج الوصول الصحيح (أقل صلاحية): الزائر يُدرِج ما تُرسله النماذج فقط، ولا
-- يقرأ صفوف غيره ولا يعدّل ولا يحذف. القراءة الوحيدة الممنوحة هي أعمدة العرض
-- العامة في institute_settings (الاسم/الشعار المعروضة أصلاً على الموقع).
-- الحالة (status) تُثبَّت على 'pending' في الإدراج فيمنع الزائر «اعتماد» طلبه.
--
-- شغّله في Supabase SQL Editor. معاملة ذرّية.
-- اختبر بعده: أرسل طلب تفعيل معهد، نسخة تجريبية، تقييماً، طلب إحالة، واشتراكاً
-- بريدياً؛ وافتح الصفحة الرئيسية وتحقّق من ظهور الشركاء وقصص النجاح.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- دالة مساعدة: حذف كل سياسات جدول قبل إعادة بنائها (idempotent)
CREATE OR REPLACE FUNCTION _drop_all_policies(tbl text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = tbl
  LOOP EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, tbl); END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- tenant_requests — «طلب تفعيل معهد» (IhkaamCheckout): إدراج فقط، بحالة pending.
-- لا قراءة/تعديل/حذف للزائر — الإدارة عبر لوحة المدير (authenticated).
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.tenant_requests ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('tenant_requests');
GRANT INSERT ON public.tenant_requests TO anon;
CREATE POLICY "tenant_public_insert" ON public.tenant_requests
  FOR INSERT TO anon WITH CHECK (status = 'pending');
CREATE POLICY "tenant_staff_all" ON public.tenant_requests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────
-- demo_requests — «طلب نسخة تجريبية» (DemoRequestForm): إدراج فقط، pending.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('demo_requests');
GRANT INSERT ON public.demo_requests TO anon;
CREATE POLICY "demo_public_insert" ON public.demo_requests
  FOR INSERT TO anon WITH CHECK (status = 'pending');
CREATE POLICY "demo_staff_all" ON public.demo_requests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────
-- testimonials — «إرسال تقييم» (ClientReviewForm): الزائر يقرأ المعتمَد فقط،
-- ويُدرج بحالة pending إجبارياً. (نُعيد بناءها كما في lock_platform_tables
-- لضمان وجود سياسة الإدراج التي ثبت غيابها بالاختبار.)
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('testimonials');
GRANT SELECT, INSERT ON public.testimonials TO anon;
CREATE POLICY "testi_public_read_approved" ON public.testimonials
  FOR SELECT TO anon USING (status = 'approved');
CREATE POLICY "testi_public_insert_pending" ON public.testimonials
  FOR INSERT TO anon WITH CHECK (status = 'pending');
CREATE POLICY "testi_staff_all" ON public.testimonials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────
-- affiliate_applications — «طلب الانضمام للإحالة» (AffiliatePage): السياسة
-- كانت موجودة لكن GRANT INSERT كان مفقوداً (لذا permission denied). نستعيده.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('affiliate_applications');
GRANT INSERT ON public.affiliate_applications TO anon;
CREATE POLICY "affil_public_insert" ON public.affiliate_applications
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "affil_staff_read"   ON public.affiliate_applications
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "affil_staff_update" ON public.affiliate_applications
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "affil_staff_delete" ON public.affiliate_applications
  FOR DELETE TO authenticated USING (true);

-- ─────────────────────────────────────────────────────────────────
-- lead_magnet_subscribers — «الاشتراك البريدي» (LeadMagnetSection/BlogArticle):
-- إدراج فقط. لا قراءة للزائر (يمنع حصاد قائمة البريد).
-- ملاحظة: IhkaamCheckout يحاول UPDATE(converted_at) بعد الطلب كـ
-- fire-and-forget؛ لا نمنح UPDATE للزائر (غير جوهري ولا يعطّل الطلب).
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.lead_magnet_subscribers ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('lead_magnet_subscribers');
GRANT INSERT ON public.lead_magnet_subscribers TO anon;
CREATE POLICY "lead_public_insert" ON public.lead_magnet_subscribers
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "lead_staff_all" ON public.lead_magnet_subscribers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────
-- institute_settings — قسم الشركاء وقصص النجاح: قراءة أعمدة العرض العامة فقط
-- (institute_id / name / theme_config = الاسم والشعار المعروضان أصلاً على
-- الموقع)، وللصفوف غير المحذوفة. لا كتابة للزائر.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.institute_settings ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('institute_settings');
GRANT SELECT (institute_id, name, theme_config, is_deleted)
  ON public.institute_settings TO anon;
CREATE POLICY "inst_public_read_display" ON public.institute_settings
  FOR SELECT TO anon USING (is_deleted = false);
CREATE POLICY "inst_staff_all" ON public.institute_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP FUNCTION _drop_all_policies(text);

COMMIT;

-- ── تحقّق بعد التطبيق (بمفتاح الزائر): كل ما يلي يجب أن ينجح ──────────
--   • POST /rest/v1/tenant_requests        {status:'pending', ...}  → 201
--   • POST /rest/v1/demo_requests          {status:'pending', ...}  → 201
--   • POST /rest/v1/testimonials           {status:'pending', ...}  → 201
--   • POST /rest/v1/affiliate_applications {...}                    → 201
--   • POST /rest/v1/lead_magnet_subscribers{email:'x@x.com'}        → 201
--   • GET  /rest/v1/institute_settings?select=institute_id,name,theme_config → 200
--
-- ── للتراجع (rollback) إن لزم — يعيد قطع الزائر عن هذه الجداول: ─────────
--   REVOKE INSERT ON public.tenant_requests, public.demo_requests,
--     public.affiliate_applications, public.lead_magnet_subscribers FROM anon;
--   REVOKE SELECT, INSERT ON public.testimonials FROM anon;
--   REVOKE SELECT (institute_id, name, theme_config, is_deleted)
--     ON public.institute_settings FROM anon;
--   ثم احذف السياسات المُنشأة أعلاه.
