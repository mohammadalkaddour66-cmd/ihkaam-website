-- ══════════════════════════════════════════════════════════════════
-- شريط «شركاء النجاح» — المشتركون فعلاً فقط، لا التجريبيّون
--
-- المشكلة: IhkaamPartners.jsx يقرأ كل صفوف institute_settings غير
-- المحذوفة، وحالة الاشتراك ليست في هذا الجدول أصلاً — فيظهر في الشريط
-- كلُّ من فتح نسخة تجريبية. القياس وقت كتابة الملف: 27 صفّاً معروضاً،
-- منها 15 لم تشترك قطّ (17 معهداً حالتهم trial في جدول institutes).
--
-- مكان الحقيقة: public.institutes (subscription_status / trial_end_date /
-- subscription_end_date) — وهو مقفل تماماً أمام الزائر (anon)، ويجب أن
-- يبقى كذلك: فيه phone وmanager_name وmonthly_price. أي منح مباشر عليه
-- يسرّب أسعار العملاء وأرقامهم.
--
-- الحل: منظرٌ ضيّق يكشف أعمدة العرض وحدها (الاسم/الشعار/اللون) للصفوف
-- المؤهَّلة، ولا يكشف عمود اشتراكٍ واحداً. الزائر يقرأ المنظر لا الجدول.
--
-- قاعدة التأهيل — «اشترك فعلاً» لا «جرّب»:
--   يُستبعَد الصفُّ إذا كانت حالته trial ولم يمتدّ اشتراكه بعد نهاية
--   التجربة (subscription_end_date <= trial_end_date). هذا هو توقيع
--   التجريبيّ في البيانات الحيّة: التاريخان متطابقان في 17 صفّاً من 17،
--   لأن التجربة نفسها هي كلُّ اشتراكه.
--   ويبقى ظاهراً — كما هو المطلوب —:
--     • العامل الآن (active)
--     • من اشترك فترةً ثم توقّف (suspended، أو انتهى subscription_end_date)
--   لأن المعيار «هل اشترى يوماً» لا «هل اشتراكه سارٍ الآن».
--
-- حدٌّ معروف: لو رُدَّ عميلٌ دافعٌ إلى trial بتجربةٍ جديدة تُلغي أثر
-- اشتراكه السابق، فسيختفي — لا يوجد جدول سجلّ دفعات نستند إليه. لا صفَّ
-- بهذا الوصف اليوم؛ إن ظهر، فالعلاج إضافة عمود/سجلّ «اشترك سابقاً».
--
-- security_invoker = false مقصود: المنظر يعمل بصلاحيات مالكه فيتجاوز RLS
-- على institutes، وهو الغرض — الزائر يرى 11 صفّاً بثلاثة حقول تجميلية
-- ولا شيء غيرها. الشرط محفورٌ في المنظر فلا يستطيع العميل توسيعه.
--
-- إضافيٌّ بالكامل: لا يمسّ منحة أو سياسة قائمة، وقرّاء institute_settings
-- الآخرون (قصص النجاح، شعارات التقييمات) يعملون كما هم.
--
-- التراجع: 20260816_ROLLBACK_partners_paid_only.sql
-- معاملة ذرّية: إن فشل شيء لا يُطبَّق شيء.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

CREATE OR REPLACE VIEW public.public_partners
WITH (security_invoker = false) AS
SELECT
  s.institute_id,
  s.name,
  -- نُعيد بناء theme_config من الحقول الثلاثة التي ترسمها البطاقة وحدها،
  -- بدل تمرير الكائن كاملاً: ما لا يُعرض لا يُرسَل.
  jsonb_build_object(
    'app_title',    s.theme_config->>'app_title',
    'logo_url',     s.theme_config->>'logo_url',
    'accent_color', s.theme_config->>'accent_color'
  ) AS theme_config
FROM public.institute_settings s
JOIN public.institutes i ON i.id = s.institute_id
WHERE s.is_deleted = false
  AND i.is_deleted = false
  AND NOT (
        i.subscription_status = 'trial'
    AND (i.subscription_end_date IS NULL
         OR i.subscription_end_date <= i.trial_end_date)
  );

COMMENT ON VIEW public.public_partners IS
  'أعمدة العرض للمعاهد المشتركة فعلاً (لا التجريبية) — لشريط شركاء النجاح في الموقع التسويقي.';

-- قراءة فقط، ولا شيء غيرها.
REVOKE ALL    ON public.public_partners FROM anon, authenticated;
GRANT  SELECT ON public.public_partners TO   anon, authenticated;

COMMIT;
