-- ══════════════════════════════════════════════════════════════════
-- علاج ضيّق لسباق التوقيت في SubscriptionGuard — دون فتح أي خطر
--
-- المشكلة: بعد إغلاق institutes أمام الزائر، صار SubscriptionGuard في
-- التطبيق — حين يسبق فحصُه جاهزيةَ الجلسة — يتلقّى permission denied
-- ويفسّره خطأً كـ"اشتراك منتهٍ" (السطر `if (error || !data)`)، فيعرض
-- حاجز الإيقاف لمعهد اشتراكه فعّال.
--
-- الحلّ: نسمح للزائر بقراءة أعمدة الاشتراك وحدها (التي يستعلم عنها الحارس)
-- عبر GRANT على مستوى الأعمدة + سياسة SELECT للزائر. هكذا:
--   • يعود الحارس يقرأ الحالة الصحيحة فيختفي الحاجز الزائف.
--   • تبقى كل الكتابة مقفلة (لا تعديل اشتراك، لا تحويل دفع).
--   • تبقى الأعمدة الحسّاسة محجوبة: name, monthly_price, max_students,
--     grace_period_end, currency … لا يراها الزائر (GRANT بالأعمدة فقط).
--
-- ملاحظة: هذا حلّ فوري لا يحتاج إعادة نشر التطبيق. العلاج الجذري لاحقاً هو
-- تصحيح SubscriptionGuard ليُعامِل خطأ الصلاحية كـ"غير محدَّد" لا "منتهٍ"
-- (fail-open)، وبعده يمكن إعادة تضييق هذه القراءة إن رغبت.
--
-- معاملة ذرّية.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- (1) صلاحية قراءة على أعمدة الاشتراك فقط — لا SELECT على كامل الجدول.
--     الأعمدة الخمسة هي بالضبط ما يستعلم عنه/يفلتر به الحارس.
GRANT SELECT (id, is_deleted, subscription_status, subscription_end_date, warning_days)
  ON public.institutes TO anon;

-- (2) سياسة RLS تسمح للزائر بمطابقة الصفوف (القراءة تُقيَّد بالأعمدة أعلاه).
DROP POLICY IF EXISTS "institutes_anon_subscription_read" ON public.institutes;
CREATE POLICY "institutes_anon_subscription_read" ON public.institutes
  FOR SELECT TO anon USING (true);

COMMIT;

-- ── تحقّق بعد التطبيق ───────────────────────────────────────────────
-- قراءة أعمدة الاشتراك (يجب أن تنجح الآن للزائر):
--   curl "$URL/rest/v1/institutes?select=id,subscription_status&id=eq.tawhid" \
--        -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
-- قراءة عمود حسّاس (يجب أن تبقى مرفوضة):
--   curl "$URL/rest/v1/institutes?select=monthly_price&id=eq.tawhid" ...  → 401/permission denied
-- تعديل معهد (يجب أن يبقى مرفوضاً):
--   curl -X PATCH "$URL/rest/v1/institutes?id=eq.tawhid" -d '{"name":"x"}' ... → 401
