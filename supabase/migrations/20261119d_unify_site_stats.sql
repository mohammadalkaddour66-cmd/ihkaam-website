-- ══════════════════════════════════════════════════════════════════
-- توحيد أرقام الموقع (2026-11-19، قرار المالك) — مطبَّق على الإنتاج
--
-- 1) compute_public_quran_stats (20261119b) صار يعيد أيضاً groups وsessions
--    وsessions_30d، والموقع يقرأ منها الطلاب والكادر والحلقات والجلسات في
--    الرئيسية (IhkaamTrustStats) وصفحة المنصة معاً. النطاق واحد: كل معهدٍ
--    عمل شهراً فأكثر ببيانات حقيقية ولو توقّف، دون المحذوف والتجريبي.
--    get_public_landing_stats القديمة (تعدّ كل صفٍّ بلا تصفية: 324 معلماً
--    مقابل 239) لم تُمسّ، وتبقى احتياطاً في الموقع إن تعذّر الجلب.
--
-- 2) بطاقات «أرقام كل معهد» (compute_success_story_metrics) كانت تعدّ جلسات
--    التسميع المحذوفة (1,713 جلسة في المعاهد العاملة) ومتوسط درجاتها؛ صارت
--    تستبعدها كبقية الأرقام. وتحديث ذاكرتها صار كل ساعة لا كل أسبوع.
-- ══════════════════════════════════════════════════════════════════
-- (نص compute_public_quran_stats الكامل في 20261119b_public_quran_stats.sql)

CREATE OR REPLACE FUNCTION private.compute_success_story_metrics()
 RETURNS TABLE(institute_id text, students bigint, groups bigint, recs bigint, recent_rec bigint, early_rec bigint, absent bigint, tardiness bigint, avg_grade numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH bounds AS (
    SELECT (current_date - 60)::text  AS d60,
           (current_date - 120)::text AS d120
  ),
  student_counts AS (
    SELECT s.institute_id, count(*) AS students
    FROM students s WHERE s.is_deleted = false GROUP BY 1
  ),
  group_counts AS (
    SELECT g.institute_id, count(*) AS groups
    FROM groups g WHERE g.is_deleted = false GROUP BY 1
  ),
  rec_counts AS (
    SELECT r.institute_id,
           count(*) AS recs,
           count(*) FILTER (WHERE r.record_date::text >= (SELECT d60 FROM bounds))  AS recent_rec,
           count(*) FILTER (WHERE r.record_date::text >= (SELECT d120 FROM bounds)
                               AND r.record_date::text <  (SELECT d60 FROM bounds)) AS early_rec
    FROM recitations r WHERE coalesce(r.is_deleted, false) = false GROUP BY 1
  ),
  grade_stats AS (
    SELECT v.institute_id, avg(v.g) AS avg_grade
    FROM (
      SELECT r.institute_id, r.grade::numeric AS g
      FROM recitations r
      WHERE coalesce(r.is_deleted, false) = false
        AND r.grade IS NOT NULL
        AND r.grade::text ~ '^[0-9]+(\.[0-9]+)?$'
    ) v
    WHERE v.g > 0 AND v.g <= 10
    GROUP BY 1
    HAVING count(*) >= 10
  ),
  attendance_counts AS (
    SELECT a.institute_id,
           count(*) FILTER (WHERE a.record_type = 'غياب')                    AS absent,
           count(*) FILTER (WHERE a.record_type IN ('تأخر','إذن تأخر دائم')) AS tardiness
    FROM attendance a WHERE a.is_deleted = false GROUP BY 1
  ),
  ids AS (
    SELECT institute_id FROM student_counts
    UNION SELECT institute_id FROM group_counts
    UNION SELECT institute_id FROM rec_counts
    UNION SELECT institute_id FROM attendance_counts
  )
  SELECT
    ids.institute_id,
    COALESCE(sc.students, 0),
    COALESCE(gc.groups, 0),
    COALESCE(rc.recs, 0),
    COALESCE(rc.recent_rec, 0),
    COALESCE(rc.early_rec, 0),
    COALESCE(ac.absent, 0),
    COALESCE(ac.tardiness, 0),
    gs.avg_grade
  FROM ids
  LEFT JOIN student_counts    sc ON sc.institute_id = ids.institute_id
  LEFT JOIN group_counts      gc ON gc.institute_id = ids.institute_id
  LEFT JOIN rec_counts        rc ON rc.institute_id = ids.institute_id
  LEFT JOIN grade_stats       gs ON gs.institute_id = ids.institute_id
  LEFT JOIN attendance_counts ac ON ac.institute_id = ids.institute_id;
$function$;

SELECT private.refresh_success_story_metrics();
SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'refresh-success-story-metrics'), schedule := '22 * * * *');
