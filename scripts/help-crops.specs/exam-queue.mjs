/* مواصفة اقتطاعات شرح «استخدام طابور الاختبارات». الصيغة في رأس scripts/help-crops.mjs.
   الخطوات 1-3 في «التسميع اليومي» (تبويب تحويل للمختبر)، و4-8 في «الاختبارات».
   لا نقر على أي زر تحويل أو بدء أو حفظ: نفتح تبويباً ونطوي/نفتح صندوق الطابور ونختار خيارات محلية فقط.
   الاقتطاعان 4 و5 لا يُظهران صف أي طالب (الشارة والرؤوس فقط). */
export default {
    slug: 'exam-queue',
    title: 'التسميع اليومي والاختبارات',
    steps: {
      1: {
        targets: ['el:تحويل للمختبر'], pad: [900, 30],
        prepare: async (page, h) => {
          await h.openScreen('التسميع اليومي')
          await page.getByText('تحويل للمختبر', { exact: true }).first().click()
          await h.sleep(900)
        },
      },
      2: { targets: ['field:اسم الطالب', 'field:المقطع المراد اختباره'], pad: [30, 20] },
      3: { targets: ['el:تأكيد التحويل للمختبر'], pad: [4, 20] },
      4: {
        targets: ['el:طابور الاختبارات', 'el:الطلاب الجاهزون في انتظارك لتقييمهم'], pad: [900, 24],
        prepare: async (page, h) => {
          await h.openScreen('الاختبارات')
          await h.sleep(1500)
        },
      },
      5: {
        targets: ['el:الطالب', 'el:الحلقة', 'el:المقطع المطلوب', 'el:وقت الانتظار', 'el:إجراء'], pad: [24, 4],
        prepare: async (page, h) => {
          await page.getByText('طابور الاختبارات', { exact: true }).first().click()
          await h.sleep(1200)
        },
      },
      6: { targets: ['el:بدء الاختبار'], pad: [6, 14] },
      7: { targets: ['field:الدرجة', 'field:التقدير'], pad: [30, 20] },
      8: {
        targets: ['el:إعادته إلى آخر الطابور بعد الحفظ', 'el:لإعادة الاختبار بعد عدم النجاح', 'el:حفظ وإعادة للدور'], pad: [900, 16],
        prepare: async (page, h) => {
          await page.locator('select').filter({ hasText: 'اختر التقدير...' }).first().selectOption({ label: 'إعادة' })
          await h.sleep(600)
          await page.getByText('إعادته إلى آخر الطابور بعد الحفظ', { exact: true }).first().click()
          await h.sleep(600)
        },
      },
    },
}
