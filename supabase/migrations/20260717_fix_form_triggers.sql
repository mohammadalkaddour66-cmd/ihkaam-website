-- ══════════════════════════════════════════════════════════════════
-- إصلاح دوال الـ triggers — تفعيل SECURITY DEFINER للالتفافة حول قيود RLS
--
-- المشكلة: عند إدراج الزائر صفّاً في tenant_requests/demo_requests/testimonials،
-- يُشغّل الـ trigger دالة (trigger_new_*) بصلاحيات الزائر → محاولة كتابة في
-- admin_notifications → permission denied (الزائر لا يملك INSERT فيها).
--
-- الحل: إعادة تعريف الدوال الثلاث بـ SECURITY DEFINER — تُشغّل بصلاحيات
-- مالكها (postgres)، فتتجاوز نقص صلاحية الزائر وتُنشئ الإشعار بنجاح.
--
-- مشكلة فنية ثانوية: demo_requests.id من نوع bigint لكن reference_id
-- من نوع uuid. الحل: رمز عشوائي + حفظ المعرّف الأصلي في body.
--
-- شغّله كاملاً دفعة واحدة. معاملة ذرّية.
-- بعده اختبر الأزرار الثلاثة (طلب معهد، نسخة تجريبية، تقييم).
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────
-- إعادة تعريف: trigger_new_tenant_request — طلب تفعيل معهد
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_new_tenant_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER  -- ← المفتاح: عمّال بصلاحيات postgres، ليس الزائر
AS $function$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO admin_notifications (type, reference_id, title, body)
    VALUES (
      'tenant_request',
      gen_random_uuid(),
      'طلب انضمام معهد جديد',
      COALESCE(NEW.institute_name, 'معهد') || ' • ' || COALESCE(NEW.supervisor_name, 'مدير')
        || E'\nID: ' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- ─────────────────────────────────────────────────────────────────
-- إعادة تعريف: trigger_new_demo_request — طلب نسخة تجريبية
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_new_demo_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO admin_notifications (type, reference_id, title, body)
    VALUES (
      'demo_request',
      gen_random_uuid(),
      'طلب تجربة جديد',
      'من: ' || COALESCE(NEW.name, 'مستخدم') || ' • ' || COALESCE(NEW.phone, 'بدون هاتف')
        || E'\nID: ' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- ─────────────────────────────────────────────────────────────────
-- إعادة تعريف: trigger_new_testimonial — تقييم عميل
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_new_testimonial()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO admin_notifications (type, reference_id, title, body)
    VALUES (
      'testimonial',
      gen_random_uuid(),
      'تقييم جديد بانتظار الموافقة',
      'من: ' || COALESCE(NEW.client_name, 'مستخدم') || ' (' || COALESCE(NEW.client_role, 'غير محدد') || ')'
        || E'\nID: ' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

COMMIT;

-- ── بعد التطبيق: الاختبار ─────────────────────────────────────
-- من الموقع (بمفتاح الزائر):
--   1. أرسل طلب تفعيل معهد من صفحة Checkout
--   2. أرسل طلب نسخة تجريبية
--   3. أرسل تقييماً
-- المتوقع: كل الطلبات تُدرج بنجاح بلا أخطاء، وتظهر إشعارات في
-- admin_notifications بـ reference_id عشوائي.
