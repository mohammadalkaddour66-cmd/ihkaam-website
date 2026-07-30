-- ══════════════════════════════════════════════════════════════════
-- إصلاح تتبّع تحويل المشتركين (converted_at)
--
-- المشكلة: بعد نجاح طلب اشتراك، كانت الواجهة تحاول تعليم المشترك
-- كـ"محوَّل" مباشرةً:
--     supabase.from('lead_magnet_subscribers')
--             .update({ converted_at: ... })
-- لكن الزائر (anon) يملك INSERT فقط على ذلك الجدول، بلا UPDATE.
-- والاستدعاء كان fire-and-forget بـ .then(() => {}) فابتلع الخطأ.
-- النتيجة: converted_at ظلّ NULL دائماً، والرقم يبدو مجموعاً وهو ليس كذلك.
--
-- الحل: لا نمنح الزائر UPDATE — ذلك يفتح ثغرة تعديل صفوف المشتركين.
-- بدل ذلك trigger بصلاحية المالك (SECURITY DEFINER) على tenant_requests.
-- المزايا:
--   • لا حاجة لأي صلاحية إضافية للزائر
--   • لا يمكن استدعاؤه وحده — يتطلّب إنشاء طلب اشتراك فعلي
--   • يعمل أياً كان العميل الذي أدرج الطلب (الموقع، لوحة الإدارة، أي أداة)
--
-- التراجع: 20260727_ROLLBACK_lead_conversion_tracking.sql
-- معاملة ذرّية: إن فشل شيء لا يُطبَّق شيء.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- ── (1) الدالة ────────────────────────────────────────────────────
-- search_path = '' مع تأهيل كل الأسماء — تحصين قياسي لدوال
-- SECURITY DEFINER ضد اختطاف مسار البحث.
CREATE OR REPLACE FUNCTION public.mark_lead_converted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND btrim(NEW.email) <> '' THEN
    UPDATE public.lead_magnet_subscribers
       SET converted_at = now()
     WHERE lower(email) = lower(btrim(NEW.email))
       AND converted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- ── (2) الرابط على tenant_requests ───────────────────────────────
DROP TRIGGER IF EXISTS trigger_mark_lead_converted ON public.tenant_requests;
CREATE TRIGGER trigger_mark_lead_converted
  AFTER INSERT ON public.tenant_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_lead_converted();

-- ── (3) تعويض ما فات ─────────────────────────────────────────────
-- يستخدم تاريخ أول طلب اشتراك فعلي، لا now() — حتى يبقى الرقم صادقاً
-- تاريخياً بدل ما تتكدّس كل التحويلات على لحظة تشغيل هذا الملف.
UPDATE public.lead_magnet_subscribers l
   SET converted_at = t.first_request
  FROM (
    SELECT lower(btrim(email)) AS email, min(created_at) AS first_request
    FROM   public.tenant_requests
    WHERE  email IS NOT NULL AND btrim(email) <> ''
    GROUP  BY 1
  ) t
 WHERE lower(l.email) = t.email
   AND l.converted_at IS NULL;

COMMIT;

-- ══════════════════════════════════════════════════════════════════
-- تحقّق بعد التطبيق
-- ══════════════════════════════════════════════════════════════════
--   SELECT count(*) AS total,
--          count(converted_at) AS converted
--   FROM   public.lead_magnet_subscribers;
--
-- (وقت كتابة هذا الملف الجدول فارغ — 0 مشترك — فالتعويض لا يغيّر شيئاً.
--  قيمته تظهر مع أول اشتراك يتبعه طلب.)
-- ══════════════════════════════════════════════════════════════════
