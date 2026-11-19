-- ═══════════════════════════════════════════════════════════════════
--  التراجع عن بيانات العرض في معهد instf6avr (جامع عمار بن ياسر)
--
--  يمسح ما زرعه سكربت الزراعة **فقط** — بحسب المعرّفات المسجّلة في
--  public.demo_seed_ledger. أي طالب أو حلقة أو سجل أدخله العميل
--  بيده أثناء التجربة يبقى سليمًا ولا يُمَسّ.
--
--  الترتيب يحترم المفاتيح الأجنبية:
--  exam_results ← exams ← subjects،  و group_subjects ← subjects.
--
--  التنفيذ: Supabase Dashboard ← SQL Editor ← الصق ← Run
--  آمن للتشغيل أكثر من مرة (الثانية لا تجد شيئًا فلا تفعل شيئًا).
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ١) الجداول ذات المفتاح النصّي/uuid والمعتمِدة أولًا
DELETE FROM public.exam_results       WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='exam_results');
DELETE FROM public.stars_of_the_week  WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='stars_of_the_week');
DELETE FROM public.transactions       WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='transactions');
DELETE FROM public.tuitions           WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='tuitions');
DELETE FROM public.monthly_evaluations WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='monthly_evaluations');
DELETE FROM public.tests              WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='tests');
DELETE FROM public.attendance         WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='attendance');
DELETE FROM public.recitations        WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='recitations');

-- ٢) ثم ما تعتمد عليه
DELETE FROM public.exams              WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='exams');
DELETE FROM public.group_subjects     WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='group_subjects');
DELETE FROM public.subjects           WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='subjects');

-- ٣) وأخيرًا الكيانات الأساسية
DELETE FROM public.students           WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='students');
DELETE FROM public.groups             WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='groups');
DELETE FROM public.staff              WHERE id::text IN (SELECT row_id FROM public.demo_seed_ledger WHERE institute_id='instf6avr' AND table_name='staff');

-- ٤) استعادة الإعدادات كما كانت قبل الزراعة
UPDATE public.institute_settings s
SET active_features           = (b.snap->'active_features'),
    active_features_metadata  = (b.snap->'active_features_metadata'),
    gender_separation_enabled = (b.snap->>'gender_separation_enabled')::boolean,
    star_criteria             = (b.snap->'star_criteria')
FROM (
  SELECT row_id::jsonb AS snap
  FROM public.demo_seed_ledger
  WHERE institute_id='instf6avr' AND table_name='_settings_backup'
  ORDER BY seeded_at DESC LIMIT 1
) b
WHERE s.institute_id = 'instf6avr';

-- ٥) تنظيف الدفتر
DELETE FROM public.demo_seed_ledger WHERE institute_id = 'instf6avr';

COMMIT;

-- ── التحقق: المفروض تكون كلها أصفارًا أو أرقام العميل الحقيقية فقط ──
SELECT
 (SELECT count(*) FROM public.students    WHERE institute_id='instf6avr') AS students_left,
 (SELECT count(*) FROM public.staff       WHERE institute_id='instf6avr') AS staff_left,
 (SELECT count(*) FROM public.groups      WHERE institute_id='instf6avr') AS groups_left,
 (SELECT count(*) FROM public.recitations WHERE institute_id='instf6avr') AS recitations_left,
 (SELECT count(*) FROM public.demo_seed_ledger WHERE institute_id='instf6avr') AS ledger_left;
