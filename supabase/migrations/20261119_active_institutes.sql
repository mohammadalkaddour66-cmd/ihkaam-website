-- ══════════════════════════════════════════════════════════════════
-- المعاهد «المفعّلة» للموقع العام (2026-11-19)
--
-- طلب المالك: المعهد المفعّل هو الذي مضى على بدء عمله شهرٌ على الأقل
-- وما زال يعمل، لا كل معهد مسجّل (كثيرٌ من المسجّلين تجريبيّ).
--
-- التعريف المطبَّق:
--   • أول نشاطٍ (تسميع أو حضور) قبل 30 يوماً أو أكثر
--   • وآخر نشاطٍ خلال آخر 30 يوماً
--   • ويُستثنى demo و!showcase وأي معرّف تجريبيّ
--
-- الدالة تعيد المعرّفات وحدها (وهي ظاهرة أصلاً في institute_settings)،
-- فلا تكشف بيانات طلاب ولا أعداداً خاصة بمعهد.
-- لا تُطبَّق على الإنتاج إلا بقرار المالك. حتى ذلك الحين يستعمل الموقع
-- لقطةً مؤرَّخة في src/config/activeInstitutes.js
-- ══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_active_institute_ids()
RETURNS TABLE(institute_id text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH act AS (
    SELECT r.institute_id, r.created_at FROM recitations r WHERE coalesce(r.is_deleted, false) = false
    UNION ALL
    SELECT a.institute_id, a.created_at FROM attendance a WHERE coalesce(a.is_deleted, false) = false
  ), per AS (
    SELECT act.institute_id, min(act.created_at) AS first_at, max(act.created_at) AS last_at
    FROM act GROUP BY act.institute_id
  )
  SELECT per.institute_id
  FROM per
  JOIN institutes i ON i.id = per.institute_id AND i.is_deleted = false
  WHERE per.first_at <= now() - interval '30 days'
    AND per.last_at  >= now() - interval '30 days'
    AND per.institute_id NOT IN ('demo', '!showcase')
    AND per.institute_id !~* '(demo|test|showcase|ihkam|superadmin|system)';
$$;

REVOKE ALL ON FUNCTION public.get_active_institute_ids() FROM public;
GRANT EXECUTE ON FUNCTION public.get_active_institute_ids() TO anon, authenticated;
