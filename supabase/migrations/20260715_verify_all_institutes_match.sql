-- ══════════════════════════════════════════════════════════════════
-- تأكيد: هل كل معهد يطابق دالة التعرّف؟ (قراءة فقط — لا يغيّر شيئاً)
--
-- سياسة institutes الجديدة تسمح للمستخدم إن تحقّق:
--     id = get_current_institute_id()  OR  is_platform_super_admin()
--
-- و get_current_institute_id() = الجزء الأول من نطاق إيميله:
--     split_part(split_part(email, '@', 2), '.', 1)
--
-- هذا الاستعلام يطبّق نفس المعادلة على إيميلات كل موظفي كل معهد، ويقارنها
-- بـ institutes.id — فيُظهر لك أن التطابق يعمّ الجميع، لا الثلاثة الذين جرّبتهم.
--
-- كيف تقرأ الناتج:
--   • staff_accounts   = عدد حسابات الدخول المرتبطة بالمعهد
--   • matches_via_id   = كم منها تطابق id مباشرةً (الطريق الأول للسياسة)
--   • is_super_admin   = كم منها مدير عام (الطريق الثاني — يمرّ بأي حال)
--   • ⚠️_unexplained   = حسابات لا تطابق id ولا هي مدير عام. يجب أن يكون 0
--                        لكل الصفوف. أي رقم أكبر من 0 هنا فقط يستحق انتباهاً.
-- ══════════════════════════════════════════════════════════════════

SELECT
  i.id                          AS institute_id,
  i.name                        AS institute_name,
  count(u.id)                   AS staff_accounts,
  count(u.id) FILTER (
    WHERE split_part(split_part(u.email, '@', 2), '.', 1) = i.id
  )                             AS matches_via_id,
  count(u.id) FILTER (
    WHERE coalesce(s.is_super_admin, false) = true
  )                             AS is_super_admin,
  count(u.id) FILTER (
    WHERE split_part(split_part(u.email, '@', 2), '.', 1) <> i.id
      AND coalesce(s.is_super_admin, false) = false
  )                             AS "⚠️_unexplained"
FROM institutes i
LEFT JOIN staff s      ON s.institute_id = i.id
                      AND s.is_deleted = false
                      AND s.auth_id IS NOT NULL
LEFT JOIN auth.users u ON u.id = s.auth_id
WHERE i.is_deleted = false
GROUP BY i.id, i.name
ORDER BY i.id;
