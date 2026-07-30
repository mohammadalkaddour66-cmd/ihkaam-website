-- ══════════════════════════════════════════════════════════════════
-- إغلاق جداول المنصّة والتسويق أمام الزائر (anon) — إصلاح أمني حرج
--
-- تحصين RLS في تطبيق إحكام (rls_hardening/01b) غطّى جداول المعاهد
-- التشغيلية فقط (students, staff, recitations …) ولم يمسّ جداول المنصّة
-- والموقع التسويقي. فبقيت هذه مفتوحة لأي شخص يملك مفتاح anon العلني
-- (وهو ظاهر في حزمة الجافاسكربت). ثبت بالاختبار الحيّ أن الزائر يستطيع:
--
--   • قراءة كل طلبات برنامج الإحالة بأسمائها وإيميلاتها وأرقامها (تسريب PII)
--   • قراءة قائمة المعاهد كاملةً (كشف قائمة العملاء)
--   • تعديل جدول institutes → تمديد اشتراكه مجاناً أو تعطيل اشتراك غيره
--   • تعديل system_settings → أخطرها: تغيير shamcash_account_code إلى حسابه
--     هو، فتُحوَّل كل مدفوعات العملاء إليه (احتيال مباشر)
--   • تعديل أسعار store_features
--   • إدراج/تعديل/حذف صور المعرض (تشويه أو مسح كامل)
--   • إدراج تقييمات مزيّفة (بحالة approved) وحذف التقييمات الحقيقية
--
-- نموذج الوصول الصحيح: الزائر لا يقرأ إلا ما يُعرض على الموقع فعلاً، ولا
-- يكتب إلا ما تُرسله النماذج، والكتابة الإدارية للمحتوى الحسّاس (الأسعار،
-- الاشتراكات، حساب الدفع) مقصورة على المدير العام للمنصّة.
--
-- شغّله في Supabase SQL Editor. معاملة ذرّية — إن فشل شيء لا يُطبَّق شيء.
-- اختبر بعده: عرض المعرض/التقييمات/الأسعار على الموقع، إرسال نموذج تقييم،
-- إرسال طلب إحالة، ولوحة المدير العام في التطبيق.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- دالة مساعدة: حذف كل سياسات جدول قبل إعادة بنائها
CREATE OR REPLACE FUNCTION _drop_all_policies(tbl text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = tbl
  LOOP EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, tbl); END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- institutes: لا شيء للزائر إطلاقاً (الموقع يأخذ الأعداد من RPC مجمّعة).
-- كل معهد يرى صفّه، والمدير العام يرى الجميع.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('institutes');
CREATE POLICY "institutes_tenant_rw" ON public.institutes
  FOR ALL TO authenticated
  USING      (id = get_current_institute_id() OR is_platform_super_admin())
  WITH CHECK (id = get_current_institute_id() OR is_platform_super_admin());

-- ─────────────────────────────────────────────────────────────────
-- system_settings: الزائر يقرأ (الموقع يعرض الأسعار وبيانات الدفع)، لكن
-- الكتابة للمدير العام فقط — هذا ما يسدّ تحويل حساب شام كاش.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('system_settings');
CREATE POLICY "settings_public_read"  ON public.system_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings_superadmin_write" ON public.system_settings
  FOR ALL TO authenticated
  USING (is_platform_super_admin()) WITH CHECK (is_platform_super_admin());

-- ─────────────────────────────────────────────────────────────────
-- store_features: قراءة عامة للظاهر منها، الكتابة للمدير العام.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.store_features ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('store_features');
CREATE POLICY "store_public_read" ON public.store_features
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "store_superadmin_write" ON public.store_features
  FOR ALL TO authenticated
  USING (is_platform_super_admin()) WITH CHECK (is_platform_super_admin());

-- ─────────────────────────────────────────────────────────────────
-- gallery_items: قراءة عامة، الكتابة للمدير العام (تُدار من بوابته).
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('gallery_items');
CREATE POLICY "gallery_public_read" ON public.gallery_items
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "gallery_superadmin_write" ON public.gallery_items
  FOR ALL TO authenticated
  USING (is_platform_super_admin()) WITH CHECK (is_platform_super_admin());

-- ─────────────────────────────────────────────────────────────────
-- testimonials: الزائر يقرأ المعتمَد فقط، ويُدرج تقييماً بحالة pending
-- إجبارياً (WITH CHECK)، ولا يعدّل ولا يحذف.
-- الاعتماد/التعديل متاح لأي مستخدم مسجّل — عمداً: لوحتا الإدارة (مدير الموقع
-- في AdminDashboard.jsx ومدير التطبيق في TestimonialsManager.tsx) قد تكونان
-- بحسابين مختلفين، فقصر الصلاحية على المدير العام وحده كان يكسر اعتماد
-- التقييمات في إحداهما. الخطر الحقيقي (الزائر المجهول) مُغلق أعلاه.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('testimonials');
CREATE POLICY "testi_public_read_approved" ON public.testimonials
  FOR SELECT TO anon USING (status = 'approved');
CREATE POLICY "testi_public_insert_pending" ON public.testimonials
  FOR INSERT TO anon WITH CHECK (status = 'pending');
CREATE POLICY "testi_staff_all" ON public.testimonials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────
-- affiliate_applications: الزائر يُدرج طلباً فقط، ولا يقرأ ولا يعدّل ولا
-- يحذف (كان يقرأ أسماء وإيميلات وأرقام المتقدمين). الإدارة عبر المدير العام
-- ومدير الموقع (authenticated). لا قراءة anon إطلاقاً.
-- ملاحظة: قراءة/إدارة هذه الطلبات متاحة لأي مستخدم authenticated — إن أردت
-- قصرها على مدير الموقع وحده أخبرني بإيميله لأضبطها عليه (انظر التقرير).
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;
SELECT _drop_all_policies('affiliate_applications');
CREATE POLICY "affil_public_insert" ON public.affiliate_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "affil_staff_read"   ON public.affiliate_applications
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "affil_staff_update" ON public.affiliate_applications
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "affil_staff_delete" ON public.affiliate_applications
  FOR DELETE TO authenticated USING (true);

DROP FUNCTION _drop_all_policies(text);

-- ══════════════════════════════════════════════════════════════════
-- الطبقة الثانية — سحب صلاحيات الكتابة الزائدة عن دور الزائر (anon) فقط.
--
-- RLS أعلاه يكفي وحده لمنع الكتابة، لكن هذا يمنعها على مستوى الصلاحيات
-- أيضاً — فلو أُلغي RLS يوماً بالخطأ يبقى الزائر عاجزاً عن الكتابة.
-- لا نمسّ دور authenticated إطلاقاً (به يكتب التطبيق والمدير العام).
-- نُبقي للزائر ما تحتاجه واجهة الموقع فقط:
--   • system_settings / store_features / gallery_items → SELECT فقط
--   • testimonials → SELECT + INSERT (إرسال تقييم)
--   • affiliate_applications → INSERT فقط (نموذج الانضمام)
--   • institutes → لا شيء (الموقع يأخذ الأعداد من RPC)
-- ══════════════════════════════════════════════════════════════════

REVOKE ALL ON public.institutes FROM anon;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.system_settings FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.store_features  FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.gallery_items   FROM anon;

REVOKE UPDATE, DELETE ON public.testimonials          FROM anon;
REVOKE SELECT, UPDATE ON public.affiliate_applications FROM anon;

COMMIT;

-- ── بعد التطبيق: تحقّق سريع أن anon لم يعد يكتب ──────────────────────
-- من الطرفية (استبدل URL و KEY):
--   curl -X PATCH "$URL/rest/v1/system_settings?key=eq.base_platform_fee" \
--        -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
--        -H "Content-Type: application/json" -d '{"value":"1"}'
--   المتوقع الآن: 401 / صفر صفوف متأثرة (بدل 200 ونجاح التعديل).
