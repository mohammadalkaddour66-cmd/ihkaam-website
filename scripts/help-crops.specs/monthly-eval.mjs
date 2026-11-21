/* مواصفة اقتطاعات شرح «تقييم سلوك الطلاب الشهري». الأسماء الظاهرة: الطالب المنشور سابقاً فقط (أول صف). */
export default {
  slug: 'monthly-eval',
  screen: 'سلوك الطلاب',
  title: 'سلوك الطلاب',
  steps: {
    1: { targets: ['el:سلوك الطلاب', 'el:أدخل نسبة تقييم السلوك من 10 لكل طالب مرة واحدة شهرياً.'], pad: [24, 24] },
    2: {
      targets: ['field:اختر الحلقة', 'field:الشهر', 'field:السنة'], pad: [24, 12],
      prepare: async (page) => { await page.locator('select:visible').first().selectOption({ label: 'حلقة الصديق' }); await page.waitForTimeout(2500) },
    },
    3: {
      targets: ['el:اسم الطالب', 'el:أخلاق الجامع (من 10)', 'el:أخلاق المنزل (من 10)', 'el:-'], pad: [24, 10],
      prepare: async (page) => page.evaluate(() => {   // طبقة شفافة فوق أول حقل درجة تحمل شرطته الظاهرة ليمكن تحديده بالنص
        const el = [...document.querySelectorAll('input[type=number]')].find(e => e.getBoundingClientRect().width > 0)
        const r = el.getBoundingClientRect(); const s = document.createElement('span'); s.textContent = '-'
        Object.assign(s.style, { position: 'fixed', left: r.x + 'px', top: r.y + 'px', width: r.width + 'px', height: r.height + 'px', color: 'transparent', pointerEvents: 'none', overflow: 'hidden', fontSize: '1px' })
        document.body.appendChild(s)
      }),
    },
    4: { targets: ['el:حفظ التقييمات للكل'], pad: [24, 24] },
  },
}
