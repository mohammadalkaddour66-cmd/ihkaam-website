-- ══════════════════════════════════════════════════════════════════
-- get_success_story_metrics(p_ids text[])
--
-- Replaces the N-institutes × 8-queries-per-institute pattern that
-- IhkaamSuccessStories.jsx used to build its "success stories"
-- carousel. With ~25+ real institutes that pattern fired 200+
-- simultaneous requests on every homepage load, which queued up and
-- starved other requests on the same page (including the hero's own
-- screenshot fetch, observed stuck behind the pile-up for ~12s).
--
-- This does the same aggregation server-side in one query per
-- institute batch (one RPC call total, not one per institute).
--
-- ⚠️ صُحِّحت الأنواع (2026-07-13): كانت النسخة الأولى تأخذ uuid[] وتقارن
-- record_date بـ date، وكلاهما خطأ — معرّفات المعاهد نصّية ('hasana')
-- و record_date نصّي بصيغة ISO. لذلك كانت الدالة تفشل عند الإنشاء ولم
-- تُطبَّق على القاعدة إطلاقاً، فكانت قصص النجاح تعرض أصفاراً. شغّل هذا
-- الملف في Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_success_story_metrics(p_ids text[])
RETURNS TABLE (
  institute_id text,
  students     bigint,
  groups       bigint,
  recs         bigint,
  recent_rec   bigint,
  early_rec    bigint,
  absent       bigint,
  tardiness    bigint,
  avg_grade    numeric
)
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  WITH ids AS (
    SELECT unnest(p_ids) AS institute_id
  ),
  bounds AS (
    SELECT (current_date - 60)::text  AS d60,
           (current_date - 120)::text AS d120
  ),
  student_counts AS (
    SELECT institute_id, count(*) AS students
    FROM students
    WHERE institute_id = ANY(p_ids) AND is_deleted = false
    GROUP BY institute_id
  ),
  group_counts AS (
    SELECT institute_id, count(*) AS groups
    FROM groups
    WHERE institute_id = ANY(p_ids) AND is_deleted = false
    GROUP BY institute_id
  ),
  rec_counts AS (
    SELECT institute_id,
           count(*) AS recs,
           count(*) FILTER (WHERE record_date::text >= (SELECT d60 FROM bounds))  AS recent_rec,
           count(*) FILTER (WHERE record_date::text >= (SELECT d120 FROM bounds)
                               AND record_date::text <  (SELECT d60 FROM bounds)) AS early_rec
    FROM recitations
    WHERE institute_id = ANY(p_ids)
    GROUP BY institute_id
  ),
  grade_stats AS (
    SELECT institute_id, avg(g) AS avg_grade
    FROM (
      SELECT institute_id, grade::numeric AS g
      FROM recitations
      WHERE institute_id = ANY(p_ids)
        AND grade IS NOT NULL
        AND grade::text ~ '^[0-9]+(\.[0-9]+)?$'
    ) valid_grades
    WHERE g > 0 AND g <= 10
    GROUP BY institute_id
    HAVING count(*) >= 10
  ),
  attendance_counts AS (
    SELECT institute_id,
           count(*) FILTER (WHERE record_type = 'غياب')                          AS absent,
           count(*) FILTER (WHERE record_type IN ('تأخر','إذن تأخر دائم')) AS tardiness
    FROM attendance
    WHERE institute_id = ANY(p_ids) AND is_deleted = false
    GROUP BY institute_id
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
$$;

REVOKE ALL     ON FUNCTION get_success_story_metrics(text[]) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_success_story_metrics(text[]) TO anon, authenticated;
