-- ══════════════════════════════════════════════════════════════════
-- ISS-35 (تقرير خالد إدريس، 9 نوفمبر 2026) — الخطوة 1 من 2: إضافية فقط
--
-- المشكلة كما فُحصت قراءةً في 2026-11-20:
--   الدور anon يملك SELECT على 10 أعمدة من public.institute_settings
--   (institute_id, name, domain, theme_config, form_config, active_features,
--   active_features_metadata, star_criteria, support_whatsapp_number,
--   is_deleted)، والسياسة inst_public_read_display تسمح بكل صف
--   is_deleted = false. أي أن زائراً بلا تسجيل يستطيع حصر قائمة العملاء
--   كاملة بطلب واحد إلى /rest/v1/institute_settings.
--
-- لماذا لا يُسحب المنح مباشرة: تطبيق المعاهد (D:\app ayoubi) يقرأ هذا
-- الجدول قبل تسجيل الدخول (InstituteContext وغيره) ليعرف اسم المعهد
-- وشعاره وإعداداته من رابطه. السحب الآن يكسر شاشة الدخول لكل المعاهد.
--
-- الحل على خطوتين:
--   1) (هذا الملف) دالتان تعيدان ما يلزم «لمعهد معروف المعرّف» فقط،
--      بلا إمكانية سرد القائمة:
--        • get_institute_public_config(p_institute_id)  ← للتطبيق قبل الدخول
--        • get_institute_logos(p_ids)                   ← لشعارات الشهادات في الموقع
--      مع المنظر public_partners (ملف 20260816_partners_paid_only.sql)
--      لشريط الشركاء.
--   2) (20261120c) سحب قراءة anon من الجدول، بعد أن يتحوّل التطبيق والموقع.
--
-- إضافيٌّ بالكامل: لا يمسّ منحة أو سياسة قائمة. آمن للتطبيق في أي وقت.
-- التراجع: DROP FUNCTION للدالتين.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- معهد واحد بمعرّفه: الأعمدة التي يحتاجها التطبيق قبل الدخول، لا أكثر.
-- لا يقبل نمطاً ولا قائمة، فلا يصلح لسرد المعاهد.
CREATE OR REPLACE FUNCTION public.get_institute_public_config(p_institute_id text)
RETURNS TABLE (
  institute_id            text,
  name                    text,
  theme_config            jsonb,
  form_config             jsonb,
  active_features         jsonb,
  active_features_metadata jsonb,
  star_criteria           jsonb,
  support_whatsapp_number text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT s.institute_id, s.name, s.theme_config::jsonb, s.form_config::jsonb,
         s.active_features::jsonb, s.active_features_metadata::jsonb,
         s.star_criteria::jsonb, s.support_whatsapp_number
  FROM public.institute_settings s
  WHERE s.institute_id = lower(btrim(p_institute_id))
    AND s.is_deleted = false
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_institute_public_config(text) IS
  'ISS-35: إعدادات العرض لمعهد واحد بمعرّفه (شاشة الدخول في التطبيق). بديل القراءة المجهولة لجدول institute_settings.';

-- شعارات واسماء معاهد بعينها (المعرّفات تأتي من الشهادات المعتمدة)،
-- بحدّ أقصى 50 معرّفاً في الطلب. الشعار والاسم فقط.
CREATE OR REPLACE FUNCTION public.get_institute_logos(p_ids text[])
RETURNS TABLE (institute_id text, name text, logo_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT s.institute_id, s.name, s.theme_config->>'logo_url'
  FROM public.institute_settings s
  WHERE s.institute_id = ANY (p_ids[1:50])
    AND s.is_deleted = false;
$$;

COMMENT ON FUNCTION public.get_institute_logos(text[]) IS
  'ISS-35: الاسم والشعار لمعاهد معيّنة بمعرّفاتها (شهادات الموقع التسويقي).';

REVOKE ALL     ON FUNCTION public.get_institute_public_config(text) FROM PUBLIC;
REVOKE ALL     ON FUNCTION public.get_institute_logos(text[])       FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_institute_public_config(text) TO anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_institute_logos(text[])       TO anon, authenticated;

COMMIT;

-- تحقّق بعد التطبيق (قراءة فقط):
--   SELECT * FROM public.get_institute_public_config('<معرّف معهد>');   -- صف واحد
--   SELECT * FROM public.get_institute_logos(ARRAY['<معرّف>']);          -- اسم وشعار
