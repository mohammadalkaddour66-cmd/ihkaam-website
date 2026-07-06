-- ══════════════════════════════════════════════════════════════════
-- get_success_story_metrics(p_ids uuid[])
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
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_success_story_metrics(p_ids uuid[])
RETURNS TABLE (
  institute_id uuid,
  students     bigint,
  groups       bigint,
  recs         bigint,
  recent_rec   bigint,
  early_rec    bigint,
  absent       bigint,
  tardiness    bigint,
  avg_grade    numeric
)
LANGUAGE sql SECURITY DEFINER AS $$
  WITH ids AS (
    SELECT unnest(p_ids) AS institute_id
  ),
  bounds AS (
    SELECT (current_date - interval '60 days')::date  AS d60,
           (current_date - interval '120 days')::date AS d120
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
           count(*) FILTER (WHERE record_date >= (SELECT d60 FROM bounds))  AS recent_rec,
           count(*) FILTER (WHERE record_date >= (SELECT d120 FROM bounds)
                               AND record_date <  (SELECT d60 FROM bounds)) AS early_rec
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

GRANT EXECUTE ON FUNCTION get_success_story_metrics(uuid[]) TO anon;
