/* مواصفة اقتطاعات شرح «استخراج التقارير وتصديرها». الصيغة في رأس scripts/help-crops.mjs.
   الخطوة 9 و10 تضغطان «توليد التقرير» (قراءة فقط، لا تغيّر بيانات)، والاقتطاع يشمل شريط الأدوات فقط بلا صفوف الطلاب. */
import { overlay } from './smart-insights.mjs'
const pick = (label) => async (page, h) => {
  await page.locator(`select:has(option:text-is("${label}"))`).first().selectOption({ label })
  await h.sleep(900)
}
const generate = async (page, h) => {
  await pick('المحصلة الشهرية للحلقة')(page, h)
  await page.locator('select:has(option:text-is("جميع الحلقات"))').first().selectOption({ label: 'حلقة النور' })
  await h.sleep(400)
  await page.getByRole('button', { name: /توليد التقرير/ }).click()
  await h.sleep(5000)
  await overlay(page, () => document.querySelector('input[placeholder*="بحث داخل"]'), 'بحث داخل النتائج...')
}
export default {
    slug: 'reports-overview',
    screen: 'التقارير',
    title: 'منشئ التقارير',
    steps: {
      1: { targets: ['el:التقارير والإحصائيات', 'el:منشئ التقارير المرن — صمم تقريرك واطبعه فوراً'], pad: [24, 20] },
      2: { targets: ['field:نوع التقرير'], pad: [24, 16] },
      3: { targets: ['field:اسم الطالب', 'field:الحلقة', 'field:من تاريخ', 'field:إلى تاريخ'], prepare: pick('سجل تسميع طالب') },
      4: { targets: ['field:الحلقة', 'field:الشهر', 'field:السنة'], prepare: pick('المحصلة الشهرية للحلقة') },
      5: { targets: ['el:صمم تقريرك (اختر الأعمدة / المواد التي تود عرضها)', 'el:أخلاق المنزل'], prepare: pick('المحصلة الشهرية للحلقة'), pad: [24, 20] },
      6: { targets: ['field:إظهار خانة "توقيع المعلم"', 'field:تثبيت الختم والمدير للمرات القادمة'], pad: [24, 12] },
      7: { targets: ['field:اسم المعلم', 'field:صورة التوقيع', 'field:اسم مدير المعهد', 'field:ختم المعهد'], pad: [24, 44] },
      8: { targets: ['el:توليد التقرير'], pad: [160, 24] },
      9: { targets: ['el:بحث داخل النتائج...', 'el:طباعة / PDF', 'el:تصدير Excel'], pad: [24, 14], prepare: generate },
      10: { targets: ['el:طباعة / PDF', 'el:تصدير Excel'], pad: [24, 14] },
    },
}
