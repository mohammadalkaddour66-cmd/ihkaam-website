/* مواصفة اقتطاعات شرح «إدارة أقساط الطلاب». الشاشة من «معهد النموذج» (وضع العرض، قراءة فقط) لأن الوحدة المالية غير مفعّلة في معهد العرض.
   الاقتطاعات تستثني صفوف الطلاب عدا الصف الأول (اسم ظاهر في لقطات الموقع)؛ نافذة «تسديد قسط» تُفتح ولا يُضغط فيها شيء. */
import { enterShowcase, hideFrame } from './smart-insights.mjs'
const clickText = (page, text) => page.getByText(text, { exact: true }).first().click()
export default {
  slug: 'finance-tuitions',
  title: 'إدارة الأقساط',
  prepare: async (page, h) => {
    await enterShowcase(page)
    await h.openScreen('الإدارة المالية')
    await hideFrame(page)
    await clickText(page, 'إدارة الأقساط')
    await page.waitForTimeout(2500)
  },
  steps: {
    1: { targets: ['el:التحليل المالي', 'el:حركة الصندوق', 'el:إدارة الأقساط'], pad: [24, 14] },
    2: { targets: ['field:الحلقة', 'field:الشهر', 'field:السنة', 'field:بحث عن طالب'], pad: [24, 8] },
    3: { targets: ['el:المتأخرون', 'el:المسددون'], pad: [60, 8] },
    4: { targets: ['el:اسم الطالب', 'el:تاريخ السداد', 'el:الإجراء'], pad: [44, 4] },
    5: { targets: ['el:غير مسدد', 'el:تسديد القسط'], pad: [90, 12] },
    6: { prepare: async (page, h) => { await clickText(page, 'تسديد القسط'); await page.waitForTimeout(1200) },
         targets: ['el:تسديد قسط', 'el:العملة'], pad: [20, 8] },
    7: { targets: ['field:العملة', 'field:حالة القسط'], pad: [20, 10] },
    8: { targets: ['field:المبلغ (اختياري في حال العفو)', 'el:تأكيد الدفع', 'el:إلغاء'], pad: [2, 12] },
  },
}
