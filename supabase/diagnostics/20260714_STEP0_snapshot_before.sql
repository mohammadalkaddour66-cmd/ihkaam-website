-- ══════════════════════════════════════════════════════════════════
-- الخطوة 0 — التقاط الحالة الراهنة بدقّة قبل أي تعديل
--
-- شغّل هذا *أولاً* في Supabase SQL Editor. قراءة فقط — لا يغيّر شيئاً.
-- يُخرج كل شيء في نتيجة JSON واحدة قابلة للنسخ (لأن المحرّر يعرض نتيجة
-- آخر استعلام فقط). انسخ الناتج كاملاً وأرسله لي: بناءً عليه أُثبّت ملف
-- التراجع ليعيدك إلى هذه الحالة بالضبط، بلا زيادة ولا نقصان.
-- ══════════════════════════════════════════════════════════════════

WITH tables AS (
  SELECT unnest(ARRAY['institutes','system_settings','store_features',
                      'gallery_items','testimonials','affiliate_applications']) AS t
),
rls AS (
  SELECT jsonb_agg(jsonb_build_object(
           'table', relname,
           'rls_enabled', relrowsecurity,
           'rls_forced',  relforcerowsecurity) ORDER BY relname) AS data
  FROM pg_class
  WHERE relnamespace = 'public'::regnamespace
    AND relname IN (SELECT t FROM tables)
),
policies AS (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'table', tablename,
           'policy', policyname,
           'command', cmd,
           'permissive', permissive,
           'roles', roles,
           'using', qual,
           'with_check', with_check) ORDER BY tablename, policyname), '[]'::jsonb) AS data
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (SELECT t FROM tables)
),
grants AS (
  SELECT jsonb_agg(jsonb_build_object(
           'table', table_name,
           'grantee', grantee,
           'privileges', privs) ORDER BY table_name, grantee) AS data
  FROM (
    SELECT table_name, grantee,
           string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privs
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND table_name IN (SELECT t FROM tables)
      AND grantee IN ('anon','authenticated')
    GROUP BY table_name, grantee
  ) g
)
SELECT jsonb_pretty(jsonb_build_object(
  'rls_state', (SELECT data FROM rls),
  'policies',  (SELECT data FROM policies),
  'grants',    (SELECT data FROM grants)
)) AS snapshot;
