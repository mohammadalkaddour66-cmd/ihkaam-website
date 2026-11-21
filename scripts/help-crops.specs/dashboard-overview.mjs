/* مواصفة اقتطاعات شرح «فهم لوحة التحكم الرئيسية».
   بعض العناصر (بطاقات وصناديق) بلا نص يخصّها، فتُوضَع فوقها «مرساة» شفافة تحمل عنوانها كي يُحدَّد
   مستطيلها بدقة؛ المرساة لا تظهر في الصورة (شفافة وبلا خلفية). */

const ANCHOR_UP = '[class*="rounded-2xl"]'

async function anchor(page, { find, up = ANCHOR_UP, label = find, starts = false }) {
  const ok = await page.evaluate(({ find, up, label, starts }) => {
    const clean = (t) => (t || '').replace(/\s+/g, ' ').trim()
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let target = null
    while (w.nextNode()) {
      const t = clean(w.currentNode.textContent)
      if (!(starts ? t.startsWith(find) : t === find)) continue
      const el = w.currentNode.parentElement
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height || r.x > 1180) continue
      const box = el.closest(up)
      if (!box) continue
      target = box; break
    }
    if (!target) return false
    const r = target.getBoundingClientRect()
    const a = document.createElement('div')
    a.textContent = label
    a.setAttribute('data-help-anchor', '1')
    a.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;color:transparent;background:none;font-size:1px;overflow:hidden;pointer-events:none;z-index:0`
    document.body.prepend(a)
    return true
  }, { find, up, label, starts })
  if (!ok) throw new Error('لا مرساة لـ ' + find)
}

/* فتح الشاشة بثبات حين يبطؤ الدخول: ننتظر ظهور الشريط الجانبي، ونفتحه إن لم يكن مفتوحاً */
async function openDashboard(page, h) {
  await page.setViewportSize({ width: 1440, height: 900 })
  const open = () => page.evaluate(() => [...document.querySelectorAll('button,a,div,span')]
    .some(e => e.textContent.trim() === 'لوحة التحكم' && e.getBoundingClientRect().x > 1100 && e.getBoundingClientRect().width > 20))
  for (let i = 0; i < 8 && !(await open()); i++) {
    await page.waitForTimeout(2500)
    if (i % 2 === 1 && !(await open())) await page.mouse.click(1400, 95)
  }
  await h.openScreen('لوحة التحكم')
}

export default {
  slug: 'dashboard-overview',
  title: 'لوحة التحكم',
  prepare: async (page, h) => {
    await openDashboard(page, h)
    await page.waitForTimeout(2500)
    for (const t of ['إجمالي الطلاب', 'طلاب ذكور', 'طالبات إناث', 'الطلاب الأيتام',
      'إجمالي الحلقات', 'حلقات الذكور', 'حلقات الإناث', 'إجمالي الكادر']) await anchor(page, { find: t })
    for (const t of ['مؤشر الانضباط الأسبوعي', 'حصاد الاختبارات اليومي', 'كثافة الطلاب في الحلقات', 'حصاد التسميع اليومي'])
      await anchor(page, { find: t })
    await anchor(page, { find: 'الاختبارات المتأخرة', starts: true, up: '[class*="border-2"]' })
    await anchor(page, { find: 'تحديث الحالة', up: 'button' })
    await anchor(page, { find: 'تحديث الحالة', up: '.border-t', label: 'تاريخ الرسالة' })
  },
  steps: {
    1: { targets: ['el:مركز القيادة والإحصائيات', 'el:إجمالي الطلاب', 'el:طلاب ذكور', 'el:طالبات إناث', 'el:الطلاب الأيتام'], pad: [24, 14] },
    2: { targets: ['el:إجمالي الحلقات', 'el:حلقات الذكور', 'el:حلقات الإناث', 'el:إجمالي الكادر'], pad: [24, 14] },
    3: { targets: ['el:مؤشر الانضباط الأسبوعي'], pad: [16, 14] },
    4: { targets: ['el:حصاد الاختبارات اليومي'], pad: [16, 14] },
    5: { targets: ['el:كثافة الطلاب في الحلقات'], pad: [16, 14] },
    6: { targets: ['el:حصاد التسميع اليومي'], pad: [16, 14] },
    7: { targets: ['el:صندوق رسائل وملاحظات الأهالي', 'el:الكل', 'el:جديدة', 'el:قيد المتابعة', 'el:مكتملة'], pad: [24, 22] },
    8: { targets: ['el:تاريخ الرسالة', 'el:تحديث الحالة'], pad: [10, 30] },
    9: { targets: ['el:الاختبارات المتأخرة'], pad: [24, 14] },
    10: { targets: ['el:الرئيسية', 'el:الطلاب', 'el:الحلقات', 'el:الكادر', 'el:الاختبارات'], pad: [30, 16] },
    11: {
      prepare: async (page) => {
        await page.getByText('الحلقات', { exact: true }).first().click()
        await page.waitForTimeout(2500)
        await anchor(page, { find: 'ترتيب', starts: true, up: 'button' })
      },
      targets: ['el:إدارة الحلقات', 'el:ترتيب'], pad: [24, 12],
    },
    12: {
      prepare: async (page) => {
        const p = await page.evaluate(() => {
          const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
          while (w.nextNode()) {
            if (w.currentNode.textContent.trim() !== 'عدد الطلاب:') continue
            const c = w.currentNode.parentElement.closest('[class*="cursor-pointer"]')
            if (c) { const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }
          }
          return null
        })
        if (!p) throw new Error('لا بطاقة حلقة')
        await page.mouse.click(p.x, p.y)
        await page.waitForTimeout(2500)
        await anchor(page, { find: 'طلاب حلقة:', starts: true, up: 'h4', label: 'طلاب حلقة:' })
      },
      targets: ['el:طلاب حلقة:', 'el:الاسم الكامل', 'el:يتيم؟'], pad: [24, 3],
    },
  },
}
