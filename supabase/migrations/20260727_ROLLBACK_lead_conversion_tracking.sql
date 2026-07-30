-- ══════════════════════════════════════════════════════════════════
-- تراجع — إلغاء 20260727_fix_lead_conversion_tracking.sql
--
-- يحذف الرابط والدالة. لا يُرجع converted_at إلى NULL: القيم التي
-- كُتبت صحيحة، ومحوها يُتلف بيانات بلا سبب. إن أردت محوها فعلاً
-- شغّل السطر المعطّل في الأسفل يدوياً.
--
-- معاملة ذرّية: إن فشل شيء لا يُطبَّق شيء.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

DROP TRIGGER IF EXISTS trigger_mark_lead_converted ON public.tenant_requests;
DROP FUNCTION IF EXISTS public.mark_lead_converted();

COMMIT;

-- ⚠️ محو البيانات — معطّل عمداً. أزل التعليق فقط إن كنت متأكداً.
-- UPDATE public.lead_magnet_subscribers SET converted_at = NULL;
