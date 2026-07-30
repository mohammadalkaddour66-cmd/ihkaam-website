-- ══════════════════════════════════════════════════════════════════
-- إقفال كتابة الزائر (anon) على platform_settings
--
-- المشكلة: أي حامل لمفتاح anon — وهو منشور داخل حزمة الموقع التسويقي
-- وحزمة تطبيق إحكام — يقدر يكتب في هذا الجدول:
--     anon_upsert_settings : FOR INSERT TO anon WITH CHECK (true)
--     anon_update_settings : FOR UPDATE TO anon USING (true) WITH CHECK (true)
--     + منحة GRANT INSERT, UPDATE TO anon
-- والجدول يحمل نِسَب عمولة برنامج الشراكة، فالتلاعب به تلاعب مالي.
--
-- لماذا الحذف آمن (من سجلّ التنفيذ الفعلي pg_stat_statements، 2026-07-27):
--   • استعلام الكتابة (upsert من PostgREST مع ON CONFLICT) موجود مرّتين
--     بنصّ متطابق حرفياً: تحت anon (5 استدعاءات، أول ظهور 2026-07-01)
--     وتحت authenticated (أول ظهور 2026-07-23 — أي بعد ترحيل الإقفال).
--     نفس الشاشة، نفس الكود، هاجرت إلى Supabase Auth.
--   • لوحة إدارة إحكام تكتب الآن كـauthenticated، ولها منحتها وسياستها
--     superadmin_write_platform_settings.
--   • الموقع التسويقي لا يكتب في هذا الجدول إطلاقاً — قراءة فقط
--     (src/pages/AffiliatePage.jsx).
--
-- ما يبقى كما هو (لا تلمسه — الموقع يعتمد عليه):
--   • منحة SELECT للزائر
--   • anon_select_settings و public_read_platform_settings
--   • superadmin_write_platform_settings للمستخدم المسجّل
--
-- القيم الصحيحة وقت كتابة هذا الملف، للاستعادة لو عُبث بها:
--   commission_first_rate     = 10
--   commission_recurring_rate = 10
--
-- التراجع: 20260727_ROLLBACK_platform_settings_anon_write.sql
-- معاملة ذرّية: إن فشل شيء لا يُطبَّق شيء.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- ── (1) حذف سياستَي الكتابة المجهولة ──────────────────────────────
DROP POLICY IF EXISTS "anon_upsert_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "anon_update_settings" ON public.platform_settings;

-- ── (2) سحب منح الكتابة (الطبقة الثانية) ─────────────────────────
-- السياسة وحدها لا تكفي: لو أضاف أحدهم سياسة جديدة لاحقاً بالخطأ،
-- غياب المنحة يبقى حاجزاً.
REVOKE INSERT, UPDATE ON TABLE public.platform_settings FROM anon;

COMMIT;

-- ══════════════════════════════════════════════════════════════════
-- تحقّق بعد التطبيق — شغّل هذا وتأكّد من النتيجة
-- ══════════════════════════════════════════════════════════════════
-- المتوقّع: صفّان فقط، كلاهما SELECT، ولا أثر لـ INSERT/UPDATE للزائر.
--
--   SELECT policyname, cmd, roles::text
--   FROM   pg_policies
--   WHERE  schemaname = 'public' AND tablename = 'platform_settings'
--     AND  roles::text LIKE '%anon%'
--   ORDER  BY cmd, policyname;
--
-- والمتوقّع هنا: SELECT فقط.
--
--   SELECT a.privilege_type
--   FROM   pg_class c
--   JOIN   pg_namespace n ON n.oid = c.relnamespace,
--   LATERAL aclexplode(c.relacl) a
--   WHERE  n.nspname = 'public' AND c.relname = 'platform_settings'
--     AND  a.grantee::regrole::text = 'anon';
--
-- ثم افتح /affiliate على الموقع وتأكّد أن نِسَب العمولة ما زالت تظهر.
-- ══════════════════════════════════════════════════════════════════
