-- ══════════════════════════════════════════════════════════════════
-- تشخيص #2 — قراءة فقط. شغّله كاملاً دفعة واحدة وانسخ ناتج JSON كاملاً.
-- يكشف triggers على جداول النماذج + مصدر دوالّها + بنية admin_notifications.
-- ══════════════════════════════════════════════════════════════════
WITH t AS (
  SELECT unnest(ARRAY['tenant_requests','demo_requests','testimonials',
                      'affiliate_applications','lead_magnet_subscribers']) AS tbl
),
trigs AS (  -- triggers على جداول النماذج + اسم الدالة ونوعها
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'table', c.relname,
           'trigger', tg.tgname,
           'func', p.proname,
           'security_definer', p.prosecdef,
           'func_owner', pg_get_userbyid(p.proowner),
           'enabled', tg.tgenabled) ORDER BY c.relname, tg.tgname), '[]'::jsonb) AS data
  FROM pg_trigger tg
  JOIN pg_class c ON c.oid = tg.tgrelid
  JOIN pg_proc  p ON p.oid = tg.tgfoid
  WHERE NOT tg.tgisinternal
    AND c.relnamespace = 'public'::regnamespace
    AND c.relname IN (SELECT tbl FROM t)
),
funcsrc AS (  -- المصدر الكامل لكل دالة trigger مذكورة أعلاه
  SELECT COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
           'func', p.proname,
           'definition', pg_get_functiondef(p.oid))), '[]'::jsonb) AS data
  FROM pg_trigger tg
  JOIN pg_class c ON c.oid = tg.tgrelid
  JOIN pg_proc  p ON p.oid = tg.tgfoid
  WHERE NOT tg.tgisinternal
    AND c.relnamespace = 'public'::regnamespace
    AND c.relname IN (SELECT tbl FROM t)
),
notif_cols AS (  -- أعمدة admin_notifications وأنواعها (لخطأ reference_id)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'column', column_name, 'type', data_type, 'nullable', is_nullable)
           ORDER BY ordinal_position), '[]'::jsonb) AS data
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='admin_notifications'
),
notif_grants AS (  -- صلاحيات admin_notifications للزائر/المسجّل
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'grantee', grantee, 'privileges', privs) ORDER BY grantee), '[]'::jsonb) AS data
  FROM (
    SELECT grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privs
    FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name='admin_notifications'
      AND grantee IN ('anon','authenticated')
    GROUP BY grantee
  ) g
)
SELECT jsonb_pretty(jsonb_build_object(
  'triggers',            (SELECT data FROM trigs),
  'trigger_functions',   (SELECT data FROM funcsrc),
  'admin_notif_columns', (SELECT data FROM notif_cols),
  'admin_notif_grants',  (SELECT data FROM notif_grants)
)) AS diagnosis;
