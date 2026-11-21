-- ══════════════════════════════════════════════════════════════════
-- ISS-36 (تقرير خالد إدريس) — تقوية الدوال حسب نصائح أمان Supabase
--
-- ما وُجد بفحص قراءة في 2026-11-20 (get_advisors: security):
--   • لا جدول مكشوف بلا RLS، فجوهر ISS-36 سليم.
--   • 23 دالة trigger بصلاحية SECURITY DEFINER قابلة للتنفيذ من anon
--     (تنبيه 0028). دوال trigger لا تُستدعى عبر REST فعلياً، لكن المنح
--     لا لزوم له، وPostgreSQL لا يفحص صلاحية EXECUTE عند إطلاق الـtrigger
--     (يفحصها عند CREATE TRIGGER فقط)، فسحبها لا يوقف أي trigger.
--   • 6 دوال بلا search_path ثابت (تنبيه 0011). كلها تقرأ جداول public
--     أو auth.jwt() بأسماء مؤهّلة، ولا تستعمل امتدادات (فُحص ذلك)،
--     فتثبيت search_path = public, pg_temp لا يغيّر سلوكها.
--
-- ما لا يمسّه هذا الملف عمداً: الدوال العامة المقصودة للزائر
-- (verify_admin_credentials، login_lookup_*، get_public_*،
-- get_affiliate_stats، get_success_story_metrics، get_institute_locations).
-- تحتاج قراراً في مستودع التطبيق لأن شاشة الدخول تعتمد عليها.
--
-- التطبيق آمن في أي وقت. التراجع في آخر الملف.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- 1) سحب EXECUTE من anon وPUBLIC على كل دوال trigger ذات SECURITY DEFINER في public
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prorettype = 'trigger'::regtype
      AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', r.sig);
  END LOOP;
END $$;

-- 2) search_path ثابت للدوال الست
ALTER FUNCTION public.get_monthly_network_stats(integer)                 SET search_path = public, pg_temp;
ALTER FUNCTION public.get_current_commission_rate()                      SET search_path = public, pg_temp;
ALTER FUNCTION public.verify_admin_credentials(text, text, text)         SET search_path = public, pg_temp;
ALTER FUNCTION public.get_current_parent_phone9()                        SET search_path = public, pg_temp;
ALTER FUNCTION public.gender_section(text)                               SET search_path = public, pg_temp;
ALTER FUNCTION public.get_current_institute_id()                         SET search_path = public, pg_temp;

COMMIT;

-- تحقّق بعد التطبيق: أعد تشغيل نصائح الأمان؛ يجب أن يختفي تنبيه 0011 كله،
-- وأن ينزل عدد 0028 (anon) من 35 إلى 12.
--
-- التراجع:
--   GRANT EXECUTE ON FUNCTION <كل دالة trigger> TO PUBLIC;   -- الوضع الافتراضي السابق
--   ALTER FUNCTION <الدالة> RESET search_path;
