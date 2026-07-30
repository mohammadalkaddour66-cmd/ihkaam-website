-- ══════════════════════════════════════════════════════════════════
-- get_public_landing_stats()
--
-- بعد تحصين RLS في تطبيق إحكام (rls_hardening/01b_policies_last.sql)
-- صارت سياسة tenant_rw على جداول المعاهد مقصورة على TO authenticated،
-- فأُغلق دور anon كلياً. الموقع التسويقي كان يعدّ الصفوف مباشرةً من
-- المتصفح (‎.from('students').select(count)‎)، فصار PostgREST يرجّع
-- count = null للزائر → ظهرت كل الأرقام أصفاراً.
--
-- الحل المتعارف عليه: الواجهة العامة لا تقرأ صفوفاً إطلاقاً، بل تستدعي
-- دالة SECURITY DEFINER تعمل بصلاحية مالكها (تتجاوز RLS داخلياً) ولا
-- تُخرج إلا أعداداً مجمّعة. الزائر يعرف "عدد الطلاب 1240" ولا يستطيع
-- استخراج اسم طالب واحد. نفس نمط get_success_story_metrics.
--
-- استدعاء واحد يغطّي كل أرقام الموقع (كانت 16 طلباً على الصفحة الواحدة).
-- شغّله في Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_public_landing_stats()
RETURNS TABLE (
  institutes           bigint,  -- IhkaamTrustStats / HeroSection / NetworkBenchmarks
  students             bigint,
  staff                bigint,
  groups               bigint,
  recitations          bigint,
  recitations_quran    bigint,  -- IhkaamByNumbers — تفصيل التسميع
  recitations_hadith   bigint,
  recitations_30d      bigint,  -- SectorReport — النمو الشهري
  recitations_prev_30d bigint,
  tests                bigint,
  stars                bigint,
  subjects             bigint,
  absences             bigint,
  absences_30d         bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM institutes  WHERE is_deleted = false),
    (SELECT count(*) FROM students    WHERE is_deleted = false),
    (SELECT count(*) FROM staff       WHERE is_deleted = false),
    (SELECT count(*) FROM groups      WHERE is_deleted = false),
    (SELECT count(*) FROM recitations),
    (SELECT count(*) FROM recitations WHERE category = 'قرآن'),
    (SELECT count(*) FROM recitations WHERE category = 'حديث'),
    -- record_date نصّي بصيغة ISO (‎YYYY-MM-DD‎) لا تاريخاً — نقارنه نصّياً كما
    -- كان يفعل الكود القديم تماماً (‎toISOString().slice(0,10)‎). الـ ::text
    -- على الطرفين يجعل المقارنة صحيحة حتى لو تغيّر نوع العمود لاحقاً إلى date.
    (SELECT count(*) FROM recitations
       WHERE record_date::text >= (current_date - 30)::text),
    (SELECT count(*) FROM recitations
       WHERE record_date::text >= (current_date - 60)::text
         AND record_date::text <  (current_date - 30)::text),
    (SELECT count(*) FROM tests       WHERE is_deleted = false),
    (SELECT count(*) FROM stars_of_the_week),
    (SELECT count(*) FROM subjects),
    (SELECT count(*) FROM attendance  WHERE record_type = 'غياب' AND is_deleted = false),
    (SELECT count(*) FROM attendance
       WHERE record_type = 'غياب' AND is_deleted = false
         AND record_date::text >= (current_date - 30)::text);
$$;

-- الدوال الجديدة تُمنح EXECUTE لـ PUBLIC تلقائياً — نسحبها ونمنحها صراحةً
REVOKE ALL     ON FUNCTION get_public_landing_stats() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_public_landing_stats() TO anon, authenticated;
