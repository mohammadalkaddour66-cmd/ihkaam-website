-- ══════════════════════════════════════════════════════════════════
-- أرقام القرآن للموقع العام (2026-11-19)
--
-- قرار المالك: «إحكام بالأرقام» يعرض الختمات (الصفحات ÷ 604) لا جلسات
-- التسميع، مع سطرٍ يومي، وعمودين، ورسمٍ لنمو الصفحات شهرياً.
-- النطاق (قرار المالك المعدَّل، 2026-11-19): كل معهدٍ عمل على المنصة شهراً
-- فأكثر ببيانات حقيقية، سواء ما زال يعمل أو توقّف — «ممكن يكون شغال وترك،
-- عادي جداً». أي: بين أول نشاطٍ وآخره 30 يوماً فأكثر، وفي 10 أيام عملٍ على
-- الأقل، والمعهد غير محذوف، دون demo و!showcase والمعرّفات التجريبية.
-- (عدّاد «معهد نشط» في الموقع شيءٌ آخر: المعاهد العاملة حالياً،
-- 20261119_active_institutes.sql.)
--
-- تنقية الأخطاء (مراجَعة بطلب المالك «لا ننقص صحيحاً»): صفحات القرآن هي
-- جلسات category='قرآن' دون التمهيد، وتُقبل الجلسة إن كانت:
--   • حتى 40 صفحة (جزءان) — كلها؛ أو
--   • 41–200 صفحة ووصفها يذكر اختباراً/سرداً/مرحلة/كامل/سبر/أجزاء
--     (اختبار 29،30،1،2 = 80 صفحة، مرحلة الخمسة الأولى = 101…)،
--     ما لم يكن اختبار جزءٍ واحد (لا يتجاوز 20 صفحة أصلاً).
-- ويُستبعد ما سواها: 41–200 بلا وصفٍ كهذا (غالباً رقم الصفحة كُتب مكان
-- عددها: «سورة المائدة 107»)، وكل ما فوق 200 («سورة محمد 508»، 5730…).
-- والحديث: 0–200 للجلسة (حالة واحدة فوقها: 575).
--
-- تعيد أرقاماً مجمّعة على مستوى المنصة فقط: لا أسماء ولا أعداد لكل معهد.
-- ══════════════════════════════════════════════════════════════════
-- مطبَّق على الإنتاج 2026-11-19 بقرار المالك (ثلاث خطوات: public_quran_stats،
-- public_quran_stats_fast، public_quran_stats_cached). الحالة النهائية:
--   compute_public_quran_stats()  الحساب (~1.6 ث) — غير متاح لـanon
--   public_stats_cache            جدول التخزين — RLS بلا سياسات، مقفل
--   refresh_public_quran_stats()  يكتب الصف 'quran' — cron كل ساعة (الدقيقة 17)
--   get_public_quran_stats()      للموقع: يقرأ الصف المخزَّن فقط
-- السبب: مهلة anon 3 ثوانٍ، والحساب المباشر عبر REST تجاوزها.

CREATE OR REPLACE FUNCTION public.compute_public_quran_stats()
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_ids text[];
  v json;
BEGIN
  SELECT coalesce(array_agg(per.institute_id), '{}') INTO v_ids
  FROM (
    SELECT institute_id, min(created_at) AS first_at, max(created_at) AS last_at,
           count(DISTINCT created_at::date) AS work_days
    FROM (
      SELECT institute_id, created_at FROM recitations WHERE coalesce(is_deleted, false) = false
      UNION ALL
      SELECT institute_id, created_at FROM attendance  WHERE coalesce(is_deleted, false) = false
    ) act GROUP BY institute_id
  ) per
  JOIN institutes i ON i.id = per.institute_id AND i.is_deleted = false
  WHERE per.last_at - per.first_at >= interval '30 days'   -- عمل شهراً فأكثر، ولو توقّف بعدها
    AND per.work_days >= 10                                 -- استعمالٌ فعليّ لا تجربة يومٍ أو يومين
    AND per.institute_id NOT IN ('demo', '!showcase')
    AND per.institute_id !~* '(demo|test|showcase|ihkam|superadmin|system)';

  WITH r AS MATERIALIZED (
    SELECT category, recitation_type, record_date,
           coalesce(part_or_page, '') || ' ' || coalesce(from_to, '') AS txt,
           CASE WHEN pages_count ~ '^\s*[0-9]+(\.[0-9]+)?\s*$' THEN pages_count::numeric END AS p
    FROM recitations
    WHERE institute_id = ANY (v_ids) AND coalesce(is_deleted, false) = false
      AND category IN ('قرآن', 'حديث')
  ), q AS MATERIALIZED (
    SELECT recitation_type, record_date, p FROM r
    WHERE category = 'قرآن' AND coalesce(recitation_type, '') !~ 'تمهيد' AND p > 0
      AND (p <= 40
           OR (p <= 200
               AND txt ~ '(اختبار|إختبار|اختيار|سرد|مرحل|كامل|سبر|أجزاء|اجزاء)'
               AND txt !~ '^[\s,،]*[إا]ختبار\s+(ال)?جزء\s*[0-9٠-٩]+\s*$'))
  ), m AS (
    SELECT left(record_date, 7) AS month, round(sum(p)) AS pages
    FROM q WHERE record_date ~ '^\d{4}-\d{2}-\d{2}' GROUP BY 1
  )
  SELECT json_build_object(
    'institutes',    cardinality(v_ids),
    'quran_pages',   (SELECT round(coalesce(sum(p), 0)) FROM q),
    'ghayb_pages',   (SELECT round(coalesce(sum(p), 0)) FROM q WHERE recitation_type ~ 'غيب'),
    'pages_30d',     (SELECT round(coalesce(sum(p), 0)) FROM q
                       WHERE record_date ~ '^\d{4}-\d{2}-\d{2}' AND record_date >= to_char(current_date - 30, 'YYYY-MM-DD')),
    'hadiths',       (SELECT round(coalesce(sum(p), 0)) FROM r WHERE category = 'حديث' AND p > 0 AND p <= 200),
    'juz_passed',    (SELECT count(*) FROM tests t
                       WHERE t.institute_id = ANY (v_ids) AND coalesce(t.is_deleted, false) = false
                         AND t.major_test_type LIKE 'اختبار جزء%' AND coalesce(t.result, '') NOT IN ('إعادة', '')),
    'notifications', (SELECT count(*) FROM notifications n WHERE n.institute_id = ANY (v_ids)),
    'students',      (SELECT count(*) FROM students s WHERE s.institute_id = ANY (v_ids) AND coalesce(s.is_deleted, false) = false),
    'staff',         (SELECT count(*) FROM staff st   WHERE st.institute_id = ANY (v_ids) AND coalesce(st.is_deleted, false) = false),
    'since',         (SELECT min(month) FROM m),
    'monthly',       (SELECT coalesce(json_agg(json_build_object('m', month, 'pages', pages) ORDER BY month), '[]'::json) FROM m)
  ) INTO v;
  RETURN v;
END;
$$;
REVOKE ALL ON FUNCTION public.compute_public_quran_stats() FROM public, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.public_stats_cache (
  key         text PRIMARY KEY,
  payload     json NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.public_stats_cache ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_stats_cache FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_public_quran_stats()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public_stats_cache (key, payload, computed_at)
  VALUES ('quran', compute_public_quran_stats(), now())
  ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, computed_at = EXCLUDED.computed_at;
$$;
REVOKE ALL ON FUNCTION public.refresh_public_quran_stats() FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_quran_stats()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (payload::jsonb || jsonb_build_object('computed_at', computed_at))::json
  FROM public_stats_cache WHERE key = 'quran';
$$;
REVOKE ALL ON FUNCTION public.get_public_quran_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_quran_stats() TO anon, authenticated;

SELECT public.refresh_public_quran_stats();
SELECT cron.schedule('refresh-public-quran-stats', '17 * * * *', 'SELECT public.refresh_public_quran_stats()');
