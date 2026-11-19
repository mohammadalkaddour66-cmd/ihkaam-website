-- ══════════════════════════════════════════════════════════════════════════
-- APPLY_TO_PRODUCTION.sql  —  مُولّد آليًا 2026-07-17
-- يجمع الترحيلات السبعة الواجب تطبيقها على قاعدة الإنتاج بالترتيب الصحيح.
-- الطريقة: الصق كامل هذا الملف في Supabase → SQL Editor → Run.
-- شغّل أولًا استعلام التحقق — إن كان كل شيء جاهزًا (rpcs=6 وكل القيم true) فلا تشغّل هذا.
-- ملاحظة: كل قسم أدناه معاملة (BEGIN/COMMIT) مستقلة بذاتها كما وردت في ملفها الأصلي.
--         لذا لا يوجد غلاف معاملة خارجي. طبّقه على قاعدة لم تُطبَّق عليها هذه الترحيلات بعد.
-- ══════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │ [1/7]  20260713_public_landing_stats.sql
-- └──────────────────────────────────────────────────────────────────────┘

-- ══════════════════════════════════════════════════════════════════
-- get_public_landing_stats()
--
-- بعد تحصين RLS في تطبيق إحكام (rls_hardening/01b_policies_last.sql)
-- صارت سياسة tenant_rw على جداول المعاهد مقصورة على TO authenticated،
-- فأُغلق دور anon كلياً. الموقع التسويقي كان يعدّ الصفوف مباشرةً من
-- المتصفح (‎.from('students').select(count)‎)، فصار PostgREST يرجّع
-- count = null للزائر → ظهرت كل الأرقام أصفاراً.
--
-- الحل المتعارف عليه: الواجهة العامة لا تقرأ صفوفاً إطلاقاً، بل تستدعي
-- دالة SECURITY DEFINER تعمل بصلاحية مالكها (تتجاوز RLS داخلياً) ولا
-- تُخرج إلا أعداداً مجمّعة. الزائر يعرف "عدد الطلاب 1240" ولا يستطيع
-- استخراج اسم طالب واحد. نفس نمط get_success_story_metrics.
--
-- استدعاء واحد يغطّي كل أرقام الموقع (كانت 16 طلباً على الصفحة الواحدة).
-- شغّله في Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_public_landing_stats()
RETURNS TABLE (
  institutes           bigint,  -- IhkaamTrustStats / HeroSection / NetworkBenchmarks
  students             bigint,
  staff                bigint,
  groups               bigint,
  recitations          bigint,
  recitations_quran    bigint,  -- IhkaamByNumbers — تفصيل التسميع
  recitations_hadith   bigint,
  recitations_30d      bigint,  -- SectorReport — النمو الشهري
  recitations_prev_30d bigint,
  tests                bigint,
  stars                bigint,
  subjects             bigint,
  absences             bigint,
  absences_30d         bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM institutes  WHERE is_deleted = false),
    (SELECT count(*) FROM students    WHERE is_deleted = false),
    (SELECT count(*) FROM staff       WHERE is_deleted = false),
    (SELECT count(*) FROM groups      WHERE is_deleted = false),
    (SELECT count(*) FROM recitations),
    (SELECT count(*) FROM recitations WHERE category = 'قرآن'),
    (SELECT count(*) FROM recitations WHERE category = 'حديث'),
    -- record_date نصّي بصيغة ISO (‎YYYY-MM-DD‎) لا تاريخاً — نقارنه نصّياً كما
    -- كان يفعل الكود القديم تماماً (‎toISOString().slice(0,10)‎). الـ ::text
    -- على الطرفين يجعل المقارنة صحيحة حتى لو تغيّر نوع العمود لاحقاً إلى date.
    (SELECT count(*) FROM recitations
       WHERE record_date::text >= (current_date - 30)::text),
    (SELECT count(*) FROM recitations
       WHERE record_date::text >= (current_date - 60)::text
         AND record_date::text <  (current_date - 30)::text),
    (SELECT count(*) FROM tests       WHERE is_deleted = false),
    (SELECT count(*) FROM stars_of_the_week),
    (SELECT count(*) FROM subjects),
    (SELECT count(*) FROM attendance  WHERE record_type = 'غياب' AND is_deleted = false),
    (SELECT count(*) FROM attendance
       WHERE record_type = 'غياب' AND is_deleted = false
         AND record_date::text >= (current_date - 30)::text);
$$;

-- الدوال الجديدة تُمنح EXECUTE لـ PUBLIC تلقائياً — نسحبها ونمنحها صراحةً
REVOKE ALL     ON FUNCTION get_public_landing_stats() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_public_landing_stats() TO anon, authenticated;


-- ┌──────────────────────────────────────────────────────────────────────┐
-- │ [2/7]  20260714_lock_platform_tables.sql
-- └──────────────────────────────────────────────────────────────────────┘

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


-- ┌──────────────────────────────────────────────────────────────────────┐
-- │ [3/7]  20260715_STORAGE_lock.sql
-- └──────────────────────────────────────────────────────────────────────┘

-- ══════════════════════════════════════════════════════════════════
-- إغلاق التخزين (Storage) أمام الزائر — إصلاح أمني حرج
--
-- ثبت بالاختبار الحيّ أن الزائر (anon) يرفع ويحذف ملفات في كل الـbuckets،
-- لأن كل سياسات الكتابة على storage.objects ممنوحة لدور public (يشمل anon).
-- أخطرها system_assets حيث تُخزَّن صورة QR للدفع: الزائر يحذف الأصلية ويرفع
-- QR حسابه مكانها → تحويل المدفوعات (نفس هدف ثغرة قاعدة البيانات، عبر باب آخر).
--
-- نموذج الوصول الصحيح (كل الرفع المشروع من مستخدمين مسجّلين):
--   • القراءة: عامة للجميع — الـbuckets عامة أصلاً وتُعرض صورها على الموقع/التطبيق.
--   • الكتابة على archives/branding/gallery/profiles: للمستخدم المسجّل
--     (كادر المعهد يرفع مستنداته وصوره وشعاره، والمدير العام يرفع المعرض).
--   • الكتابة على system_assets: للمدير العام فقط — هذا يسدّ تحويل الدفع عبر QR.
--
-- شغّله في Supabase SQL Editor. معاملة ذرّية.
-- اختبر بعده: رفع مستند/صورة من داخل التطبيق (مسجّل)، وعرض الصور، ورفع QR
-- من بوابة المدير العام.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- حذف كل سياسات storage.objects الحالية (الـ13 المفتوحة لـ public)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname); END LOOP;
END $$;

-- ── القراءة: عامة لكل الـbuckets الخمسة (لعرض الصور) ──────────────
CREATE POLICY "public_read_all_buckets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id IN ('archives','branding','gallery','profiles','system_assets'));

-- ── الكتابة على buckets المستخدمين: للمسجّلين فقط (لا anon) ───────
CREATE POLICY "authenticated_insert_buckets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('archives','branding','gallery','profiles'));
CREATE POLICY "authenticated_update_buckets" ON storage.objects
  FOR UPDATE TO authenticated
  USING      (bucket_id IN ('archives','branding','gallery','profiles'))
  WITH CHECK (bucket_id IN ('archives','branding','gallery','profiles'));
CREATE POLICY "authenticated_delete_buckets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('archives','branding','gallery','profiles'));

-- ── system_assets (كود الدفع): كتابة للمدير العام فقط ────────────
CREATE POLICY "superadmin_insert_system_assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'system_assets' AND public.is_platform_super_admin());
CREATE POLICY "superadmin_update_system_assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING      (bucket_id = 'system_assets' AND public.is_platform_super_admin())
  WITH CHECK (bucket_id = 'system_assets' AND public.is_platform_super_admin());
CREATE POLICY "superadmin_delete_system_assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'system_assets' AND public.is_platform_super_admin());

COMMIT;

-- ── تحقّق بعد التطبيق (بمفتاح الزائر) ───────────────────────────────
-- رفع للزائر (يجب أن يُرفض الآن):
--   curl -X POST "$URL/storage/v1/object/gallery/x.txt" \
--        -H "apikey: $KEY" -H "Authorization: Bearer $KEY" --data "x"
--   المتوقع: 403 / new row violates row-level security (بدل 200).


-- ┌──────────────────────────────────────────────────────────────────────┐
-- │ [4/7]  20260715_fix_subscription_guard_read.sql
-- └──────────────────────────────────────────────────────────────────────┘

-- ══════════════════════════════════════════════════════════════════
-- علاج ضيّق لسباق التوقيت في SubscriptionGuard — دون فتح أي خطر
--
-- المشكلة: بعد إغلاق institutes أمام الزائر، صار SubscriptionGuard في
-- التطبيق — حين يسبق فحصُه جاهزيةَ الجلسة — يتلقّى permission denied
-- ويفسّره خطأً كـ"اشتراك منتهٍ" (السطر `if (error || !data)`)، فيعرض
-- حاجز الإيقاف لمعهد اشتراكه فعّال.
--
-- الحلّ: نسمح للزائر بقراءة أعمدة الاشتراك وحدها (التي يستعلم عنها الحارس)
-- عبر GRANT على مستوى الأعمدة + سياسة SELECT للزائر. هكذا:
--   • يعود الحارس يقرأ الحالة الصحيحة فيختفي الحاجز الزائف.
--   • تبقى كل الكتابة مقفلة (لا تعديل اشتراك، لا تحويل دفع).
--   • تبقى الأعمدة الحسّاسة محجوبة: name, monthly_price, max_students,
--     grace_period_end, currency … لا يراها الزائر (GRANT بالأعمدة فقط).
--
-- ملاحظة: هذا حلّ فوري لا يحتاج إعادة نشر التطبيق. العلاج الجذري لاحقاً هو
-- تصحيح SubscriptionGuard ليُعامِل خطأ الصلاحية كـ"غير محدَّد" لا "منتهٍ"
-- (fail-open)، وبعده يمكن إعادة تضييق هذه القراءة إن رغبت.
--
-- معاملة ذرّية.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- (1) صلاحية قراءة على أعمدة الاشتراك فقط — لا SELECT على كامل الجدول.
--     الأعمدة الخمسة هي بالضبط ما يستعلم عنه/يفلتر به الحارس.
GRANT SELECT (id, is_deleted, subscription_status, subscription_end_date, warning_days)
  ON public.institutes TO anon;

-- (2) سياسة RLS تسمح للزائر بمطابقة الصفوف (القراءة تُقيَّد بالأعمدة أعلاه).
DROP POLICY IF EXISTS "institutes_anon_subscription_read" ON public.institutes;
CREATE POLICY "institutes_anon_subscription_read" ON public.institutes
  FOR SELECT TO anon USING (true);

COMMIT;

-- ── تحقّق بعد التطبيق ───────────────────────────────────────────────
-- قراءة أعمدة الاشتراك (يجب أن تنجح الآن للزائر):
--   curl "$URL/rest/v1/institutes?select=id,subscription_status&id=eq.tawhid" \
--        -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
-- قراءة عمود حسّاس (يجب أن تبقى مرفوضة):
--   curl "$URL/rest/v1/institutes?select=monthly_price&id=eq.tawhid" ...  → 401/permission denied
-- تعديل معهد (يجب أن يبقى مرفوضاً):
--   curl -X PATCH "$URL/rest/v1/institutes?id=eq.tawhid" -d '{"name":"x"}' ... → 401


-- ┌──────────────────────────────────────────────────────────────────────┐
-- │ [5/7]  20260717_fix_form_triggers.sql
-- └──────────────────────────────────────────────────────────────────────┘

-- ══════════════════════════════════════════════════════════════════
-- إصلاح دوال الـ triggers — تفعيل SECURITY DEFINER للالتفافة حول قيود RLS
--
-- المشكلة: عند إدراج الزائر صفّاً في tenant_requests/demo_requests/testimonials،
-- يُشغّل الـ trigger دالة (trigger_new_*) بصلاحيات الزائر → محاولة كتابة في
-- admin_notifications → permission denied (الزائر لا يملك INSERT فيها).
--
-- الحل: إعادة تعريف الدوال الثلاث بـ SECURITY DEFINER — تُشغّل بصلاحيات
-- مالكها (postgres)، فتتجاوز نقص صلاحية الزائر وتُنشئ الإشعار بنجاح.
--
-- مشكلة فنية ثانوية: demo_requests.id من نوع bigint لكن reference_id
-- من نوع uuid. الحل: رمز عشوائي + حفظ المعرّف الأصلي في body.
--
-- شغّله كاملاً دفعة واحدة. معاملة ذرّية.
-- بعده اختبر الأزرار الثلاثة (طلب معهد، نسخة تجريبية، تقييم).
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────
-- إعادة تعريف: trigger_new_tenant_request — طلب تفعيل معهد
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_new_tenant_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER  -- ← المفتاح: عمّال بصلاحيات postgres، ليس الزائر
AS $function$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO admin_notifications (type, reference_id, title, body)
    VALUES (
      'tenant_request',
      gen_random_uuid(),
      'طلب انضمام معهد جديد',
      COALESCE(NEW.institute_name, 'معهد') || ' • ' || COALESCE(NEW.supervisor_name, 'مدير')
        || E'\nID: ' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- ─────────────────────────────────────────────────────────────────
-- إعادة تعريف: trigger_new_demo_request — طلب نسخة تجريبية
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_new_demo_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO admin_notifications (type, reference_id, title, body)
    VALUES (
      'demo_request',
      gen_random_uuid(),
      'طلب تجربة جديد',
      'من: ' || COALESCE(NEW.name, 'مستخدم') || ' • ' || COALESCE(NEW.phone, 'بدون هاتف')
        || E'\nID: ' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- ─────────────────────────────────────────────────────────────────
-- إعادة تعريف: trigger_new_testimonial — تقييم عميل
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_new_testimonial()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO admin_notifications (type, reference_id, title, body)
    VALUES (
      'testimonial',
      gen_random_uuid(),
      'تقييم جديد بانتظار الموافقة',
      'من: ' || COALESCE(NEW.client_name, 'مستخدم') || ' (' || COALESCE(NEW.client_role, 'غير محدد') || ')'
        || E'\nID: ' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

COMMIT;

-- ── بعد التطبيق: الاختبار ─────────────────────────────────────
-- من الموقع (بمفتاح الزائر):
--   1. أرسل طلب تفعيل معهد من صفحة Checkout
--   2. أرسل طلب نسخة تجريبية
--   3. أرسل تقييماً
-- المتوقع: كل الطلبات تُدرج بنجاح بلا أخطاء، وتظهر إشعارات في
-- admin_notifications بـ reference_id عشوائي.


-- ┌──────────────────────────────────────────────────────────────────────┐
-- │ [6/7]  20260717_restore_public_forms.sql
-- └──────────────────────────────────────────────────────────────────────┘

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


-- ┌──────────────────────────────────────────────────────────────────────┐
-- │ [7/7]  20260704_success_story_metrics_rpc.sql
-- └──────────────────────────────────────────────────────────────────────┘

-- ══════════════════════════════════════════════════════════════════
-- get_success_story_metrics(p_ids text[])
--
-- Replaces the N-institutes × 8-queries-per-institute pattern that
-- IhkaamSuccessStories.jsx used to build its "success stories"
-- carousel. With ~25+ real institutes that pattern fired 200+
-- simultaneous requests on every homepage load, which queued up and
-- starved other requests on the same page (including the hero's own
-- screenshot fetch, observed stuck behind the pile-up for ~12s).
--
-- This does the same aggregation server-side in one query per
-- institute batch (one RPC call total, not one per institute).
--
-- ⚠️ صُحِّحت الأنواع (2026-07-13): كانت النسخة الأولى تأخذ uuid[] وتقارن
-- record_date بـ date، وكلاهما خطأ — معرّفات المعاهد نصّية ('hasana')
-- و record_date نصّي بصيغة ISO. لذلك كانت الدالة تفشل عند الإنشاء ولم
-- تُطبَّق على القاعدة إطلاقاً، فكانت قصص النجاح تعرض أصفاراً. شغّل هذا
-- الملف في Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_success_story_metrics(p_ids text[])
RETURNS TABLE (
  institute_id text,
  students     bigint,
  groups       bigint,
  recs         bigint,
  recent_rec   bigint,
  early_rec    bigint,
  absent       bigint,
  tardiness    bigint,
  avg_grade    numeric
)
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  WITH ids AS (
    SELECT unnest(p_ids) AS institute_id
  ),
  bounds AS (
    SELECT (current_date - 60)::text  AS d60,
           (current_date - 120)::text AS d120
  ),
  student_counts AS (
    SELECT institute_id, count(*) AS students
    FROM students
    WHERE institute_id = ANY(p_ids) AND is_deleted = false
    GROUP BY institute_id
  ),
  group_counts AS (
    SELECT institute_id, count(*) AS groups
    FROM groups
    WHERE institute_id = ANY(p_ids) AND is_deleted = false
    GROUP BY institute_id
  ),
  rec_counts AS (
    SELECT institute_id,
           count(*) AS recs,
           count(*) FILTER (WHERE record_date::text >= (SELECT d60 FROM bounds))  AS recent_rec,
           count(*) FILTER (WHERE record_date::text >= (SELECT d120 FROM bounds)
                               AND record_date::text <  (SELECT d60 FROM bounds)) AS early_rec
    FROM recitations
    WHERE institute_id = ANY(p_ids)
    GROUP BY institute_id
  ),
  grade_stats AS (
    SELECT institute_id, avg(g) AS avg_grade
    FROM (
      SELECT institute_id, grade::numeric AS g
      FROM recitations
      WHERE institute_id = ANY(p_ids)
        AND grade IS NOT NULL
        AND grade::text ~ '^[0-9]+(\.[0-9]+)?$'
    ) valid_grades
    WHERE g > 0 AND g <= 10
    GROUP BY institute_id
    HAVING count(*) >= 10
  ),
  attendance_counts AS (
    SELECT institute_id,
           count(*) FILTER (WHERE record_type = 'غياب')                          AS absent,
           count(*) FILTER (WHERE record_type IN ('تأخر','إذن تأخر دائم')) AS tardiness
    FROM attendance
    WHERE institute_id = ANY(p_ids) AND is_deleted = false
    GROUP BY institute_id
  )
  SELECT
    ids.institute_id,
    COALESCE(sc.students, 0),
    COALESCE(gc.groups, 0),
    COALESCE(rc.recs, 0),
    COALESCE(rc.recent_rec, 0),
    COALESCE(rc.early_rec, 0),
    COALESCE(ac.absent, 0),
    COALESCE(ac.tardiness, 0),
    gs.avg_grade
  FROM ids
  LEFT JOIN student_counts    sc ON sc.institute_id = ids.institute_id
  LEFT JOIN group_counts      gc ON gc.institute_id = ids.institute_id
  LEFT JOIN rec_counts        rc ON rc.institute_id = ids.institute_id
  LEFT JOIN grade_stats       gs ON gs.institute_id = ids.institute_id
  LEFT JOIN attendance_counts ac ON ac.institute_id = ids.institute_id;
$$;

REVOKE ALL     ON FUNCTION get_success_story_metrics(text[]) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_success_story_metrics(text[]) TO anon, authenticated;

-- ── نهاية الملف الموحّد ──
