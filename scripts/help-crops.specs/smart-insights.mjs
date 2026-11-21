/* مواصفة اقتطاعات شرح «قراءة صفحة التحليل الذكي». الشاشة من «معهد النموذج» (وضع العرض للقراءة فقط)
   لأن معهد العرض العادي تظهر فيه «لا بيانات كافية». الدخول بمفتاح الوضع نفسه في sessionStorage. */
export const enterShowcase = async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.evaluate(() => sessionStorage.setItem('ihkaam_showcase_mode', '1'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(6000)
  await page.addStyleTag({ content: 'a[href*="wa.me"], [class*="whatsapp"], .fixed.bottom-6.left-6 { display:none !important }' })
  await page.mouse.click(1400, 95)
  await page.waitForTimeout(1200)
}
export const hideFrame = (page) => page.evaluate(() => { document.querySelectorAll('div.fixed.inset-0').forEach(d => { if (String(d.className).includes('border-amber-500')) d.style.display = 'none' }) })
/* غطاء شفاف بنصٍّ فوق عنصر (أو عناصر) لا نصَّ له أو يلزم إبرازه معاً: حقل بحث، قائمة، كتلة صفوف.
   finder دالة تُنفَّذ في الصفحة وتُرجع عنصراً أو مصفوفة عناصر؛ مستطيل الغطاء اتحادها. */
export const overlay = (page, finder, text) => page.evaluate(({ finder, text }) => {
  let els = new Function('return (' + finder + ')')()()
  if (!els) return false
  if (!Array.isArray(els)) els = [els]
  els = els.filter(Boolean)
  if (!els.length) return false
  const rs = els.map(e => e.getBoundingClientRect())
  const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top))
  const rr = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom))
  const d = document.createElement('div')
  d.textContent = text
  Object.assign(d.style, { position: 'fixed', left: l + 'px', top: t + 'px', width: (rr - l) + 'px', height: (b - t) + 'px', color: 'transparent', fontSize: '1px', overflow: 'hidden', pointerEvents: 'none' })
  document.body.prepend(d)
  return true
}, { finder: finder.toString(), text })

const clickText = (page, text) => page.getByText(text, { exact: true }).first().click()

export default {
  slug: 'smart-insights',
  title: 'التحليل الذكي',
  screen: 'التحليل الذكي',
  prepare: async (page, h) => {
    await enterShowcase(page)
    await h.openScreen('التحليل الذكي')
    await hideFrame(page)
    await overlay(page, () => document.querySelector('input[placeholder="ابحث عن طالب بالاسم..."]'), 'ابحث عن طالب بالاسم...')
    await overlay(page, () => [...document.querySelectorAll('select')].find(s => [...s.options].some(o => o.text === 'كل الحلقات'))?.parentElement, 'كل الحلقات')
    // كتلة «الطلاب» في بطاقة الحلقة الأولى: العنوان والصفوف الأربعة الأولى
    await overlay(page, () => {
      const h4 = [...document.querySelectorAll('h4')].find(e => e.textContent.trim() === 'الطلاب')
      const wrap = h4.parentElement.parentElement
      const list = [...wrap.children].find(c => c.className.includes('space-y-1.5'))
      const rows = [...list.children].slice(0, 4)
      return [h4.parentElement, ...rows]
    }, 'قائمة الطلاب')
  },
  steps: {
    1: { targets: ['el:التحليل الذكي', 'el:كل حلقة وطالب يُقارَن بتاريخه هو فقط · آخر 4 أسابيع مقابل الـ6 أسابيع اللي قبلها'], pad: [70, 16] },
    2: { targets: ['el:ابحث عن طالب بالاسم...', 'el:كل الحلقات'], pad: [24, 6] },
    3: { prepare: async (page) => { await clickText(page, 'تخصيص الفترة ▾'); await page.waitForTimeout(500) },
         targets: ['el:لمحة سريعة', 'el:الاتجاه الحقيقي', 'el:نظرة معمّقة'], pad: [24, 16] },
    4: { prepare: async (page) => { await clickText(page, 'إخفاء خيارات الفترة ▲'); await page.waitForTimeout(500) },
         targets: ['el:حلقة سيف الله المسلول', 'el:إنجاز: الحلقة تتقدم'], pad: [24, 14] },
    5: { targets: ['el:نسبة الغياب: ارتفع من 3.8% إلى 13.8% (10 نقطة) — يستحق وقفة ومتابعة.'], pad: [24, 34] },
    6: { targets: ['el:قائمة الطلاب'], pad: [24, 14] },
    7: { prepare: async (page) => { await clickText(page, 'إياد جمال'); await page.waitForTimeout(800) },
         targets: ['el:تسميع القرآن: انخفض من 5.8 صفحة/أسبوع إلى 3.5 صفحة/أسبوع — يستحق وقفة ومتابعة.'], pad: [24, 34] },
    8: { prepare: async (page) => { await clickText(page, 'مروان حازم'); await page.waitForTimeout(800) },
         targets: ['el:تحسن 26%', 'el:تراجع 20.5 نقطة'], pad: [700, 24] },
    9: { targets: ['el:جودة التسميع: 69.8% مقابل وسطي الحلقة 84.7% (أدنى بـ15 نقطة)'], pad: [150, 6] },
  },
}
