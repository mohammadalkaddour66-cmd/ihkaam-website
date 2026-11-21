/* مواصفة اقتطاعات شرح «تسجيل التسميع اليومي». الصيغة في رأس scripts/help-crops.mjs.
   ovl: طبقة شفافة فوق حقل بلا نص (placeholder) تحمل نصّه الظاهر ليمكن تحديده بالنص؛ لا تغيّر ما يراه المستخدم. */
const ovl = async (page, selector, text, nth = 0) => page.evaluate(({ selector, text, nth }) => {
  const el = [...document.querySelectorAll(selector)].filter(e => e.getBoundingClientRect().width > 0)[nth]
  if (!el) throw new Error('لا عنصر: ' + selector)
  const r = el.getBoundingClientRect(); const s = document.createElement('span'); s.setAttribute('data-ov', '1'); s.textContent = text
  Object.assign(s.style, { position: 'fixed', left: r.x + 'px', top: r.y + 'px', width: r.width + 'px', height: r.height + 'px', color: 'transparent', pointerEvents: 'none', overflow: 'hidden', fontSize: '1px', zIndex: '0' })
  document.body.appendChild(s)
}, { selector, text, nth })
const clear = (page) => page.evaluate(() => document.querySelectorAll('[data-ov]').forEach(e => e.remove()))
const tab = async (page, h, name) => { h.safe(name); await page.getByRole('button', { name, exact: true }).first().click(); await page.waitForTimeout(1200) }
const cat = async (page, label) => { await page.locator('select:visible').first().selectOption({ label }); await page.waitForTimeout(700) }

export default {
  slug: 'daily-recitation',
  screen: 'التسميع اليومي',
  title: 'التسميع اليومي',
  steps: {
    1: { targets: ['el:التسميع اليومي'], pad: [140, 36] },
    2: { targets: ['el:قرآن كريم', 'el:القراءة العربية', 'el:حديث شريف', 'el:تحويل للمختبر'], pad: [30, 20] },
    3: {
      targets: ['field:اسم الطالب', 'el:لم يسمّع', 'el:أنجز التسميع'], pad: [24, 8],
      prepare: async (page) => { await clear(page); await page.locator('input[placeholder="ابحث أو اختر من القائمة..."]').first().click(); await page.waitForTimeout(1200) },
    },
    4: {
      targets: ['field:التصنيف', 'field:الصفحة / المقطع', 'field:عدد الصفحات المسموعة'], pad: [24, 10],
      prepare: async (page) => { await page.evaluate(() => document.activeElement?.blur()); await page.mouse.click(700, 110); await page.waitForTimeout(600) },
    },
    5: {
      targets: ['field:التصنيف', 'field:كمية / حصة المراجعة', 'field:عدد الأجزاء المراجعة'], pad: [24, 10],
      prepare: async (page) => { await cat(page, 'مراجعة حاضراً') },
    },
    6: {
      targets: ['field:التقدير', 'field:الدرجة'], pad: [24, 10],
      prepare: async (page) => { await cat(page, 'اختر نوع التسميع...') },
    },
    7: { targets: ['field:التاريخ'], pad: [24, 10] },
    8: {
      targets: ['el:تحضير القرآن', 'el:رقم الصفحة...', 'el:+'], pad: [24, 14],
      prepare: async (page) => {
        await clear(page)
        await ovl(page, 'input[placeholder="رقم الصفحة..."]', 'رقم الصفحة...')
        await page.evaluate(() => { const b = document.querySelector('button[aria-label="إضافة الصفحة"]'); const r = b.getBoundingClientRect(); const s = document.createElement('span'); s.setAttribute('data-ov', '1'); s.textContent = '+'; Object.assign(s.style, { position: 'fixed', left: r.x + 'px', top: r.y + 'px', width: r.width + 'px', height: r.height + 'px', color: 'transparent', pointerEvents: 'none', overflow: 'hidden', fontSize: '1px' }); document.body.appendChild(s) })
      },
    },
    9: {
      targets: ['field:ملاحظات (اختياري)', 'el:أضف أي ملاحظات حول أداء الطالب...'], pad: [24, 10],
      prepare: async (page) => { await clear(page); await ovl(page, 'textarea[placeholder="أضف أي ملاحظات حول أداء الطالب..."]', 'أضف أي ملاحظات حول أداء الطالب...') },
    },
    10: { targets: ['el:حفظ التسميع', 'el:إلغاء'], pad: [24, 24], prepare: async (page) => { await clear(page) } },
    11: { targets: ['el:سجل التسميع', 'el:الإجراءات'], pad: [24, 14] },
    12: {
      targets: ['field:التصنيف', 'field:الصفحة/الاختبار', 'field:الكمية المسمعة', 'field:حصة مراجعة (النتيجة والدرجة اختياريتان)'], pad: [24, 10],
      prepare: async (page, h) => { await tab(page, h, 'القراءة العربية') },
    },
    13: {
      targets: ['field:اسم الكتاب', 'field:من حديث - إلى حديث', 'field:عدد الأحاديث المسموعة', 'field:حصة مراجعة (النتيجة والدرجة اختياريتان)'], pad: [24, 10],
      prepare: async (page, h) => { await tab(page, h, 'حديث شريف') },
    },
    14: {
      targets: ['field:المقطع المراد اختباره', 'el:تأكيد التحويل للمختبر'], pad: [24, 14],
      prepare: async (page, h) => { await tab(page, h, 'تحويل للمختبر') },
    },
  },
}
