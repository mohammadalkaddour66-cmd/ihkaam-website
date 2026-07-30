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
