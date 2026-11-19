-- ══════════════════════════════════════════════════════════════════
-- لقطة التخزين — الحالة الراهنة قبل إغلاق Storage (قراءة فقط)
--
-- شغّلها في Supabase SQL Editor وأرسل لي الناتج (JSON واحد قابل للنسخ).
-- بناءً عليه أبني إصلاح التخزين وتراجعه على واقعك بالضبط.
--
-- خلفية: ثبت بالاختبار الحيّ أن الزائر (anon) يستطيع الرفع والحذف في
-- buckets مثل gallery و system_assets (حيث كود الدفع QR). كل الرفع
-- المشروع في التطبيق والموقع من مستخدمين مسجّلين (كادر/مدير عام)، فالزائر
-- وحده الدخيل. هذه اللقطة تُظهر الـbuckets وسياسات storage.objects الحالية.
-- ══════════════════════════════════════════════════════════════════

SELECT jsonb_pretty(jsonb_build_object(

  -- (1) كل الـbuckets: الاسم، وهل هو عام (قراءة عامة)، وحدود الحجم/النوع
  'buckets', (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'id', id,
             'name', name,
             'public', public,
             'file_size_limit', file_size_limit,
             'allowed_mime_types', allowed_mime_types) ORDER BY id), '[]'::jsonb)
    FROM storage.buckets
  ),

  -- (2) كل سياسات storage.objects (هي التي تحكم من يرفع/يقرأ/يحذف)
  'object_policies', (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'policy', policyname,
             'command', cmd,
             'permissive', permissive,
             'roles', roles,
             'using', qual,
             'with_check', with_check) ORDER BY policyname), '[]'::jsonb)
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  ),

  -- (3) حالة RLS على storage.objects
  'objects_rls', (
    SELECT jsonb_build_object('rls_enabled', relrowsecurity)
    FROM pg_class WHERE oid = 'storage.objects'::regclass
  ),

  -- (4) صلاحيات anon/authenticated على storage.objects
  'objects_grants', (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'grantee', grantee, 'privileges', privs) ORDER BY grantee), '[]'::jsonb)
    FROM (
      SELECT grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privs
      FROM information_schema.role_table_grants
      WHERE table_schema = 'storage' AND table_name = 'objects'
        AND grantee IN ('anon','authenticated')
      GROUP BY grantee
    ) g
  )
)) AS storage_snapshot;
