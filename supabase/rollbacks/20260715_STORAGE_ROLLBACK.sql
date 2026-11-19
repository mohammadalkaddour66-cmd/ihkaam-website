-- ══════════════════════════════════════════════════════════════════
-- تراجع — إلغاء 20260715_STORAGE_lock.sql بالكامل
-- يعيد سياسات storage.objects إلى حالتها قبل الإغلاق تماماً (الـ13 سياسة
-- المفتوحة لـ public)، بلا زيادة ولا نقصان. مبنيّ على لقطة STORAGE_STEP0.
--
-- ⚠️ تحذير: تشغيله يُعيد فتح التخزين للزائر (رفع/حذف/تحويل QR الدفع).
-- لا تشغّله إلا إن ظهر خلل فعلي بعد الإغلاق وأردت العودة الفورية.
--
-- معاملة ذرّية. لا يعتمد على أي دالة (سياسات USING بسيطة).
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- حذف سياسات الإغلاق
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname); END LOOP;
END $$;

-- إعادة السياسات الأصلية الـ13 حرفياً (من لقطة STORAGE_STEP0)
CREATE POLICY "Allow deleting" ON storage.objects
  FOR DELETE TO public USING (bucket_id = 'gallery'::text);
CREATE POLICY "Allow insert to system_assets" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'system_assets'::text);
CREATE POLICY "Allow public uploads to archives" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'archives'::text);
CREATE POLICY "Allow public uploads to profiles" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'profiles'::text);
CREATE POLICY "Allow public viewing" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'gallery'::text);
CREATE POLICY "Allow update to system_assets" ON storage.objects
  FOR UPDATE TO public USING (bucket_id = 'system_assets'::text);
CREATE POLICY "Allow updates and deletes" ON storage.objects
  FOR UPDATE TO public USING (bucket_id = 'gallery'::text);
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'gallery'::text);
CREATE POLICY "Branding_Delete" ON storage.objects
  FOR DELETE TO public USING (bucket_id = 'branding'::text);
CREATE POLICY "Branding_Insert" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'branding'::text);
CREATE POLICY "Branding_Select" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'branding'::text);
CREATE POLICY "Branding_Update" ON storage.objects
  FOR UPDATE TO public USING (bucket_id = 'branding'::text);
CREATE POLICY "Public Access" ON storage.objects
  FOR ALL TO public
  USING (bucket_id = 'system_assets'::text)
  WITH CHECK (bucket_id = 'system_assets'::text);

COMMIT;
