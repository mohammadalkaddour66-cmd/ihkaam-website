-- ══════════════════════════════════════════════════════════════════
-- تشخيص — قراءة فقط، لا يغيّر شيئاً. شغّله كاملاً دفعة واحدة في SQL Editor.
-- انسخ ناتج JSON كاملاً وأرسله لي لأصلح ملف الـ migration بدقّة.
-- ══════════════════════════════════════════════════════════════════
WITH t AS (
  SELECT unnest(ARRAY['tenant_requests','demo_requests','testimonials',
                      'affiliate_applications','lead_magnet_subscribers',
                      'institute_settings']) AS tbl
),
cols AS (  -- الأعمدة وأنواعها (لمعرفة نوع status وأسماء أعمدة institute_settings)
  SELECT jsonb_agg(jsonb_build_object(
           'table', table_name, 'column', column_name, 'type', data_type)
           ORDER BY table_name, ordinal_position) AS data
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name IN (SELECT tbl FROM t)
),
rls AS (
  SELECT jsonb_agg(jsonb_build_object(
           'table', relname, 'rls_enabled', relrowsecurity) ORDER BY relname) AS data
  FROM pg_class WHERE relnamespace='public'::regnamespace
    AND relname IN (SELECT tbl FROM t)
),
policies AS (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'table', tablename, 'policy', policyname, 'command', cmd,
           'roles', roles, 'using', qual, 'with_check', with_check)
           ORDER BY tablename, policyname), '[]'::jsonb) AS data
  FROM pg_policies WHERE schemaname='public' AND tablename IN (SELECT tbl FROM t)
),
grants AS (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'table', table_name, 'grantee', grantee, 'privileges', privs)
           ORDER BY table_name, grantee), '[]'::jsonb) AS data
  FROM (
    SELECT table_name, grantee,
           string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privs
    FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name IN (SELECT tbl FROM t)
      AND grantee IN ('anon','authenticated')
    GROUP BY table_name, grantee
  ) g
)
SELECT jsonb_pretty(jsonb_build_object(
  'columns',   (SELECT data FROM cols),
  'rls_state', (SELECT data FROM rls),
  'policies',  (SELECT data FROM policies),
  'grants',    (SELECT data FROM grants)
)) AS diagnosis;
