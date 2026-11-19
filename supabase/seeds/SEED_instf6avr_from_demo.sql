-- ═══════════════════════════════════════════════════════════════════
--  زراعة بيانات العرض في معهد التجربة
--  المصدر : institute_id = 'demo'   (النسخة التجريبية الداخلية)
--  الهدف  : institute_id = 'instf6avr'  (جامع عمار بن ياسر)
--
--  كل سطر يُزرع يُسجَّل في public.demo_seed_ledger، فيصير التراجع
--  جرّاحيًا: يمسح المزروع فقط، ولا يلمس أي بيانات يدخلها العميل
--  بيده أثناء التجربة.
--
--  التنفيذ: Supabase Dashboard ← SQL Editor ← الصق ← Run
--  لا تشغّله مرتين. للتحقق: انظر آخر استعلام في نهاية الملف.
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ── دفتر القيد: يبقى دائمًا، وعليه يعتمد التراجع ──────────────────
CREATE TABLE IF NOT EXISTS public.demo_seed_ledger (
  id            bigserial PRIMARY KEY,
  batch_id      uuid        NOT NULL,
  institute_id  text        NOT NULL,
  table_name    text        NOT NULL,
  row_id        text        NOT NULL,
  seeded_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS demo_seed_ledger_inst_idx
  ON public.demo_seed_ledger (institute_id, table_name);

ALTER TABLE public.demo_seed_ledger ENABLE ROW LEVEL SECURITY;
-- بلا سياسات: لا anon ولا authenticated يقرأه. service_role فقط
-- (وهو يتجاوز RLS أصلًا). جدول تشغيلي داخلي بحت.

CREATE TEMP TABLE batch AS SELECT gen_random_uuid() AS id;

-- إزاحة زمنية: تدفع كل التواريخ للأمام حتى يبدو السجل مستمرًا لليوم
CREATE TEMP TABLE clone_offset AS
SELECT (CURRENT_DATE - (SELECT MAX(record_date::date)
                        FROM public.recitations
                        WHERE institute_id = 'demo')) AS days;

-- ── الكادر ───────────────────────────────────────────────────────
--  auth_id = NULL دائمًا: لا تُنقل هويات Supabase Auth الحقيقية
--  لفريقكم إلى حساب عميل خارجي.
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS _clone_src_id bigint;

CREATE TEMP TABLE staff_map AS
WITH ins AS (
  INSERT INTO public.staff (
    full_name, father_name, mother_name, national_id, birth_info, degree,
    phone, gender, location, start_date, role, personal_photo, certificate_photo,
    password, created_at, institute_id, is_deleted, permissions, auth_id,
    is_super_admin, username, gender_access_override, _clone_src_id
  )
  SELECT
    full_name, father_name, mother_name, national_id, birth_info, degree,
    phone, gender, location, start_date, role, personal_photo, certificate_photo,
    password, created_at + (SELECT days FROM clone_offset) * interval '1 day',
    'instf6avr', is_deleted, permissions, NULL,
    is_super_admin, username, gender_access_override, id
  FROM public.staff
  WHERE institute_id = 'demo' AND is_deleted = false
  RETURNING id AS new_id, _clone_src_id AS old_id
)
SELECT old_id, new_id FROM ins;

ALTER TABLE public.staff DROP COLUMN _clone_src_id;

INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'staff', new_id::text FROM staff_map;

-- ── الحلقات (مع إعادة ربط معرّفات المعلمين داخل JSON) ─────────────
WITH ins AS (
  INSERT INTO public.groups (
    name, teacher_name, creation_date, notes, created_at, institute_id, cohort,
    is_deleted, secondary_teacher, main_teacher_ids, secondary_teacher_ids, supervision_section
  )
  SELECT
    g.name,
    (
      SELECT COALESCE(jsonb_agg(
        CASE WHEN elem ? 'staff_id'
          THEN jsonb_set(elem, '{staff_id}', to_jsonb(sm.new_id))
          ELSE elem
        END
      ), '[]'::jsonb)::text
      FROM jsonb_array_elements(g.teacher_name::jsonb) elem
      LEFT JOIN staff_map sm ON sm.old_id = NULLIF(elem->>'staff_id','')::bigint
    ),
    g.creation_date, g.notes,
    g.created_at + (SELECT days FROM clone_offset) * interval '1 day',
    'instf6avr', g.cohort, g.is_deleted, g.secondary_teacher,
    (SELECT array_agg(sm.new_id) FROM unnest(g.main_teacher_ids) o(old_id)
       JOIN staff_map sm ON sm.old_id = o.old_id),
    (SELECT array_agg(sm.new_id) FROM unnest(g.secondary_teacher_ids) o(old_id)
       JOIN staff_map sm ON sm.old_id = o.old_id),
    g.supervision_section
  FROM public.groups g
  WHERE g.institute_id = 'demo' AND g.is_deleted = false
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'groups', id::text FROM ins;

-- ── الطلاب (مع معرّفات عائلات جديدة تحفظ رابطة الإخوة) ────────────
CREATE TEMP TABLE family_map AS
SELECT DISTINCT family_id AS old_family_id, gen_random_uuid() AS new_family_id
FROM public.students
WHERE institute_id = 'demo' AND is_deleted = false AND family_id IS NOT NULL;

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS _clone_src_id bigint;

CREATE TEMP TABLE student_map AS
WITH ins AS (
  INSERT INTO public.students (
    full_name, father_name, mother_name, birth_date, residence, phone, father_job,
    registration_date, personal_photo, family_book_photo, is_orphan, circle_name,
    created_at, gender, institute_id, is_deleted, family_id, _clone_src_id
  )
  SELECT
    s.full_name, s.father_name, s.mother_name, s.birth_date, s.residence, s.phone, s.father_job,
    s.registration_date, s.personal_photo, s.family_book_photo, s.is_orphan, s.circle_name,
    s.created_at + (SELECT days FROM clone_offset) * interval '1 day',
    s.gender, 'instf6avr', s.is_deleted, fm.new_family_id, s.id
  FROM public.students s
  LEFT JOIN family_map fm ON fm.old_family_id = s.family_id
  WHERE s.institute_id = 'demo' AND s.is_deleted = false
  RETURNING id AS new_id, _clone_src_id AS old_id
)
SELECT old_id, new_id FROM ins;

ALTER TABLE public.students DROP COLUMN _clone_src_id;

INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'students', new_id::text FROM student_map;

-- ── المواد ───────────────────────────────────────────────────────
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS _clone_src_id uuid;

CREATE TEMP TABLE subject_map AS
WITH ins AS (
  INSERT INTO public.subjects (institute_id, name, max_mark, pass_mark, created_at, _clone_src_id)
  SELECT 'instf6avr', name, max_mark, pass_mark,
         created_at + (SELECT days FROM clone_offset) * interval '1 day', id
  FROM public.subjects WHERE institute_id = 'demo'
  RETURNING id AS new_id, _clone_src_id AS old_id
)
SELECT old_id, new_id FROM ins;

ALTER TABLE public.subjects DROP COLUMN _clone_src_id;

INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'subjects', new_id::text FROM subject_map;

-- ── ربط المواد بالحلقات ──────────────────────────────────────────
WITH ins AS (
  INSERT INTO public.group_subjects (institute_id, group_name, subject_id)
  SELECT 'instf6avr', gs.group_name, sm.new_id
  FROM public.group_subjects gs
  JOIN subject_map sm ON sm.old_id = gs.subject_id
  WHERE gs.institute_id = 'demo'
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'group_subjects', id::text FROM ins;

-- ── الامتحانات ───────────────────────────────────────────────────
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS _clone_src_id uuid;

CREATE TEMP TABLE exam_map AS
WITH ins AS (
  INSERT INTO public.exams (institute_id, subject_id, group_name, title, exam_type,
                            exam_date, max_mark, pass_mark, created_at, _clone_src_id)
  SELECT 'instf6avr', sm.new_id, e.group_name, e.title, e.exam_type,
         e.exam_date + (SELECT days FROM clone_offset), e.max_mark, e.pass_mark,
         e.created_at + (SELECT days FROM clone_offset) * interval '1 day', e.id
  FROM public.exams e
  JOIN subject_map sm ON sm.old_id = e.subject_id
  WHERE e.institute_id = 'demo'
  RETURNING id AS new_id, _clone_src_id AS old_id
)
SELECT old_id, new_id FROM ins;

ALTER TABLE public.exams DROP COLUMN _clone_src_id;

INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'exams', new_id::text FROM exam_map;

-- ── نتائج الامتحانات (student_id هنا نصّي لا bigint) ──────────────
WITH ins AS (
  INSERT INTO public.exam_results (institute_id, exam_id, student_id, student_name, mark, notes)
  SELECT 'instf6avr', em.new_id, stm.new_id::text, er.student_name, er.mark, er.notes
  FROM public.exam_results er
  JOIN exam_map em ON em.old_id = er.exam_id
  LEFT JOIN student_map stm ON stm.old_id = NULLIF(er.student_id,'')::bigint
  WHERE er.institute_id = 'demo'
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'exam_results', id::text FROM ins;

-- ── التسميع ──────────────────────────────────────────────────────
WITH ins AS (
  INSERT INTO public.recitations (
    student_name, recitation_type, part_or_page, pages_count, result, grade,
    record_date, notes, created_at, institute_id, category, book_name, from_to,
    prep_pages, prep_category, is_deleted, student_id
  )
  SELECT
    r.student_name, r.recitation_type, r.part_or_page, r.pages_count, r.result, r.grade,
    (r.record_date::date + (SELECT days FROM clone_offset))::text, r.notes,
    r.created_at + (SELECT days FROM clone_offset) * interval '1 day',
    'instf6avr', r.category, r.book_name, r.from_to, r.prep_pages, r.prep_category,
    r.is_deleted, stm.new_id
  FROM public.recitations r
  JOIN student_map stm ON stm.old_id = r.student_id
  WHERE r.institute_id = 'demo'
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'recitations', id::text FROM ins;

-- ── الحضور ───────────────────────────────────────────────────────
WITH ins AS (
  INSERT INTO public.attendance (
    record_type, person_category, circle_name, person_name, record_date, delay_duration,
    notes, created_at, institute_id, is_justified, is_deleted, student_id, staff_id
  )
  SELECT
    a.record_type, a.person_category, a.circle_name, a.person_name,
    (a.record_date::date + (SELECT days FROM clone_offset))::text, a.delay_duration,
    a.notes, a.created_at + (SELECT days FROM clone_offset) * interval '1 day',
    'instf6avr', a.is_justified, a.is_deleted, stm.new_id, stfm.new_id
  FROM public.attendance a
  LEFT JOIN student_map stm  ON stm.old_id  = a.student_id
  LEFT JOIN staff_map   stfm ON stfm.old_id = a.staff_id
  WHERE a.institute_id = 'demo'
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'attendance', id::text FROM ins;

-- ── السبر ────────────────────────────────────────────────────────
WITH ins AS (
  INSERT INTO public.tests (
    circle_name, student_name, test_type, score, result, test_date, notes,
    created_at, institute_id, test_portion, is_deleted, teacher_name, major_test_type, student_id
  )
  SELECT
    t.circle_name, t.student_name, t.test_type, t.score, t.result,
    (t.test_date::date + (SELECT days FROM clone_offset))::text, t.notes,
    t.created_at + (SELECT days FROM clone_offset) * interval '1 day',
    'instf6avr', t.test_portion, t.is_deleted, t.teacher_name, t.major_test_type, stm.new_id
  FROM public.tests t
  JOIN student_map stm ON stm.old_id = t.student_id
  WHERE t.institute_id = 'demo'
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'tests', id::text FROM ins;

-- ── التقييمات الشهرية ────────────────────────────────────────────
WITH ins AS (
  INSERT INTO public.monthly_evaluations (
    institute_id, student_name, circle_name, month, year, mosque_behavior,
    home_behavior, created_at, is_deleted, student_id
  )
  SELECT
    'instf6avr', me.student_name, me.circle_name, me.month, me.year, me.mosque_behavior,
    me.home_behavior, me.created_at + (SELECT days FROM clone_offset) * interval '1 day',
    me.is_deleted, stm.new_id
  FROM public.monthly_evaluations me
  JOIN student_map stm ON stm.old_id = me.student_id
  WHERE me.institute_id = 'demo'
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'monthly_evaluations', id::text FROM ins;

-- ── الأقساط ──────────────────────────────────────────────────────
WITH ins AS (
  INSERT INTO public.tuitions (
    institute_id, student_name, circle_name, month, year, total_amount, discount,
    paid_amount, status, payment_date, received_by, created_at, is_deleted, currency, student_id
  )
  SELECT
    'instf6avr', tu.student_name, tu.circle_name, tu.month, tu.year, tu.total_amount, tu.discount,
    tu.paid_amount, tu.status,
    tu.payment_date + (SELECT days FROM clone_offset) * interval '1 day',
    tu.received_by, tu.created_at + (SELECT days FROM clone_offset) * interval '1 day',
    tu.is_deleted, tu.currency, stm.new_id
  FROM public.tuitions tu
  JOIN student_map stm ON stm.old_id = tu.student_id
  WHERE tu.institute_id = 'demo'
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'tuitions', id::text FROM ins;

-- ── الحركات المالية ──────────────────────────────────────────────
WITH ins AS (
  INSERT INTO public.transactions (
    institute_id, type, category, amount, description, transaction_date, receipt_number,
    entered_by, created_at, is_deleted, currency, student_id
  )
  SELECT
    'instf6avr', tr.type, tr.category, tr.amount, tr.description,
    tr.transaction_date + (SELECT days FROM clone_offset) * interval '1 day',
    tr.receipt_number, tr.entered_by,
    tr.created_at + (SELECT days FROM clone_offset) * interval '1 day',
    tr.is_deleted, tr.currency, stm.new_id
  FROM public.transactions tr
  LEFT JOIN student_map stm ON stm.old_id = tr.student_id
  WHERE tr.institute_id = 'demo'
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'transactions', id::text FROM ins;

-- ── نجوم الأسبوع ─────────────────────────────────────────────────
WITH ins AS (
  INSERT INTO public.stars_of_the_week (
    institute_id, group_name, student_id, student_name, teacher_name,
    week_start_date, total_score, stats, teacher_note, created_at
  )
  SELECT
    'instf6avr', sw.group_name, stm.new_id, sw.student_name, sw.teacher_name,
    sw.week_start_date + (SELECT days FROM clone_offset), sw.total_score, sw.stats,
    sw.teacher_note, sw.created_at + (SELECT days FROM clone_offset) * interval '1 day'
  FROM public.stars_of_the_week sw
  JOIN student_map stm ON stm.old_id = sw.student_id
  WHERE sw.institute_id = 'demo'
  RETURNING id
)
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', 'stars_of_the_week', id::text FROM ins;

-- ── الإعدادات: تفعيل نفس حزمة مزايا الديمو ───────────────────────
--  الإعدادات السابقة تُحفظ في الدفتر قبل الكتابة، ليعيدها التراجع.
INSERT INTO public.demo_seed_ledger (batch_id, institute_id, table_name, row_id)
SELECT (SELECT id FROM batch), 'instf6avr', '_settings_backup',
       jsonb_build_object(
         'active_features',           active_features,
         'active_features_metadata',  active_features_metadata,
         'gender_separation_enabled', gender_separation_enabled,
         'star_criteria',             star_criteria
       )::text
FROM public.institute_settings WHERE institute_id = 'instf6avr';

UPDATE public.institute_settings dst
SET
  active_features           = src.active_features,
  gender_separation_enabled = src.gender_separation_enabled,
  star_criteria             = src.star_criteria,
  active_features_metadata  = (
    SELECT jsonb_object_agg(
      key,
      jsonb_set(
        jsonb_set(value, '{start_date}', to_jsonb(CURRENT_DATE::text)),
        '{expiry_date}',
        to_jsonb(to_char(
          (SELECT trial_end_date FROM public.institutes WHERE id = 'instf6avr') + interval '30 days',
          'YYYY-MM-DD"T23:59:59.000Z"'))
      )
    )
    FROM jsonb_each(src.active_features_metadata)
  )
FROM public.institute_settings src
WHERE src.institute_id = 'demo' AND dst.institute_id = 'instf6avr';

COMMIT;

-- ── التحقق ───────────────────────────────────────────────────────
SELECT table_name, count(*) AS rows
FROM public.demo_seed_ledger
WHERE institute_id = 'instf6avr'
GROUP BY table_name
ORDER BY table_name;
