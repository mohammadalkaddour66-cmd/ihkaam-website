-- ══════════════════════════════════════════════════════════════════
-- ISS-35 — الخطوة 2 من 2: إغلاق القراءة المجهولة لجدول institute_settings
--
-- ⚠ لا تطبّق هذا الملف قبل أن تتحقق الشروط الثلاثة كلها:
--   1) طُبّق 20261120b_iss35_public_institute_reads.sql
--      و 20260816_partners_paid_only.sql (المنظر public_partners).
--   2) تطبيق المعاهد (D:\app ayoubi) نُشر وهو يقرأ إعدادات ما قبل الدخول
--      من get_institute_public_config(p_institute_id) لا من الجدول.
--      الملفات التي تقرأ الجدول اليوم وتحتاج مراجعة: contexts/InstituteContext.tsx
--      (قبل الدخول)، والباقي يعمل بعد الدخول بدور authenticated فلا يتأثر.
--   3) الموقع التسويقي نُشر وهو:
--      • يبني بـ VITE_PARTNERS_VIEW=1 (شريط الشركاء من public_partners)،
--      • ويقرأ شعارات الشهادات من get_institute_logos(p_ids)
--        (TestimonialsSection.jsx وsrc/config/partners.js).
--
-- بعد التطبيق: طلب /rest/v1/institute_settings بالمفتاح العام يعيد خطأ
-- صلاحية بدل قائمة المعاهد. القراءة بعد الدخول (inst_staff_all وغيرها)
-- لا تتغير.
--
-- التراجع (إن انكسر شيء): أعِد المنح والسياسة بالأمرين في آخر الملف.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

DROP POLICY IF EXISTS inst_public_read_display ON public.institute_settings;

REVOKE SELECT ON public.institute_settings FROM anon;
-- المنح كان على مستوى الأعمدة، فيُسحب صراحة أيضاً:
REVOKE SELECT (institute_id, name, domain, theme_config, form_config,
               active_features, active_features_metadata, star_criteria,
               support_whatsapp_number, is_deleted)
  ON public.institute_settings FROM anon;

COMMIT;

-- تحقّق بعد التطبيق (يجب أن يعيد false):
--   SELECT has_any_column_privilege('anon', 'public.institute_settings', 'SELECT');

-- التراجع:
--   GRANT SELECT (institute_id, name, domain, theme_config, form_config, active_features,
--                 active_features_metadata, star_criteria, support_whatsapp_number, is_deleted)
--     ON public.institute_settings TO anon;
--   CREATE POLICY inst_public_read_display ON public.institute_settings
--     FOR SELECT TO anon USING (is_deleted = false);
