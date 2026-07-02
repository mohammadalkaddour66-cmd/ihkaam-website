-- ══════════════════════════════════════════════════════════════
-- Migration: Monthly network stats — for /insights trends chart
-- Run this in the Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- Monthly recitation counts for area chart
CREATE OR REPLACE FUNCTION get_monthly_network_stats(months_back int DEFAULT 12)
RETURNS TABLE(
  month            text,
  recitation_count bigint
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
    COUNT(*) AS recitation_count
  FROM recitations
  WHERE created_at >= (NOW() - ((months_back || ' months')::interval))
  GROUP BY date_trunc('month', created_at)
  ORDER BY date_trunc('month', created_at);
$$;

-- Allow anonymous callers (public insights page)
GRANT EXECUTE ON FUNCTION get_monthly_network_stats(int) TO anon;

-- ══════════════════════════════════════════════════════════════
-- Network-level quality index view (read-only, no PII)
-- Computed from aggregate counts — safe to expose via RLS-free view
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW network_quality_summary AS
SELECT
  (SELECT COUNT(*) FROM institutes WHERE is_deleted = false)                  AS institute_count,
  (SELECT COUNT(*) FROM students   WHERE is_deleted = false)                  AS student_count,
  (SELECT COUNT(*) FROM staff      WHERE is_deleted = false)                  AS staff_count,
  (SELECT COUNT(*) FROM groups     WHERE is_deleted = false)                  AS group_count,
  (SELECT COUNT(*) FROM recitations)                                          AS recitation_count,
  ROUND(
    (SELECT COUNT(*) FROM students WHERE is_deleted = false)::numeric /
    NULLIF((SELECT COUNT(*) FROM institutes WHERE is_deleted = false), 0), 1
  ) AS avg_students_per_institute,
  ROUND(
    (SELECT COUNT(*) FROM students WHERE is_deleted = false)::numeric /
    NULLIF((SELECT COUNT(*) FROM groups WHERE is_deleted = false), 0), 1
  ) AS avg_students_per_group,
  ROUND(
    (SELECT COUNT(*) FROM students WHERE is_deleted = false)::numeric /
    NULLIF((SELECT COUNT(*) FROM staff WHERE is_deleted = false), 0), 1
  ) AS avg_students_per_staff;
