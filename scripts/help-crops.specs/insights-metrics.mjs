/* مواصفة اقتطاعات شرح «ماذا يقيس التحليل الذكي». من «معهد النموذج» (وضع العرض للقراءة فقط). */
import { enterShowcase, hideFrame, overlay } from './smart-insights.mjs'

const clickText = (page, text) => page.getByText(text, { exact: true }).first().click()
/* سطر مؤشر داخل بطاقة حلقة بعينها (أو أول بطاقة): غطاء بنصّ اسم المؤشر يُقدَّم في ترتيب المستند */
const row = (page, label, circle) => overlay(page, `() => {
  const root = ${circle ? `[...document.querySelectorAll('h3')].find(e => e.textContent.trim() === ${JSON.stringify(circle)})?.closest('.shadow-sm')` : 'document'}
  const sp = [...root.querySelectorAll('span.text-xs.font-bold')].find(e => e.textContent.trim() === ${JSON.stringify(label)})
  return sp?.closest('div.justify-between')
}`, label)
const chip = (page, text, circle) => overlay(page, `() => {
  const root = [...document.querySelectorAll('h3')].find(e => e.textContent.trim() === ${JSON.stringify(circle)})?.closest('.shadow-sm')
  return [...root.querySelectorAll('span')].find(e => e.textContent.trim() === ${JSON.stringify(text)})
}`, text)

export default {
  slug: 'insights-metrics',
  title: 'التحليل الذكي',
  screen: 'التحليل الذكي',
  prepare: async (page, h) => {
    await enterShowcase(page)
    await h.openScreen('التحليل الذكي')
    await hideFrame(page)
    for (const l of ['تسميع القرآن', 'القراءة العربية', 'تسميع الحديث', 'جودة التسميع', 'معدل الاختبارات', 'نسبة الغياب', 'نسبة التأخر']) await row(page, l)
    await chip(page, 'بيانات غير كافية', 'حلقة النور')
    await chip(page, 'الحضور غير مسجَّل', 'حلقة النور')
  },
  steps: {
    1: { targets: ['el:تسميع القرآن'], pad: [10, 10] },
    2: { targets: ['el:القراءة العربية'], pad: [10, 10] },
    3: { targets: ['el:تسميع الحديث'], pad: [10, 10] },
    4: { targets: ['el:جودة التسميع'], pad: [10, 10] },
    5: { targets: ['el:معدل الاختبارات'], pad: [10, 10] },
    6: { targets: ['el:نسبة الغياب'], pad: [10, 10] },
    7: { targets: ['el:نسبة التأخر'], pad: [10, 10] },
    8: { targets: ['el:بيانات غير كافية', 'el:الحضور غير مسجَّل'], pad: [60, 20] },
    9: { prepare: async (page) => { await clickText(page, 'مروان حازم'); await page.waitForTimeout(800) },
         targets: ['el:تحسن 26%', 'el:تراجع 20.5 نقطة', 'el:تحسن 15.3 نقطة'], pad: [700, 24] },
  },
}
