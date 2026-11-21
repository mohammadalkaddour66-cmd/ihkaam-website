/* مواصفة اقتطاعات شرح «تسجيل نتائج الاختبارات والسبر». الصيغة في رأس scripts/help-crops.mjs. */
export default {
    slug: 'tests',
    screen: 'الاختبارات',
    title: 'الاختبارات',
    // اختيار حلقة (قائمة محلية لا تحفظ شيئاً) ليُفتح حقل «الطالب»
    prepare: async (page, h) => {
      await page.locator('select').filter({ hasText: 'اختر الحلقة...' }).first().selectOption({ label: 'حلقة النور' })
      await h.sleep(800)
    },
    steps: {
      1: { targets: ['el:إدارة الاختبارات والسبر'], pad: [60, 44] },
      2: { targets: ['field:الحلقة', 'field:الطالب'], pad: [30, 20] },
      3: { targets: ['field:نوع الاختبار', 'field:المقطع المختبر'], pad: [30, 20] },
      4: { targets: ['field:المختبِر', 'field:تصنيف الاختبار (اختياري)'], pad: [30, 20] },
      5: { targets: ['field:الدرجة', 'field:التقدير', 'field:تاريخ الاختبار'], pad: [30, 20] },
      6: { targets: ['field:ملاحظات (اختياري)', 'el:حفظ البيانات', 'el:إلغاء'], pad: [24, 24] },
      7: { targets: ['el:سجل الاختبارات', 'field:من تاريخ', 'field:إلى تاريخ', 'field:التصنيف (مرحلة/جزء)', 'el:إرسال ملخص واتساب'], pad: [900, 16] },
    },
}
