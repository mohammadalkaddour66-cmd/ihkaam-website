/* مواصفة اقتطاعات شرح «تفقّد حضور الحلقة». الأسماء الظاهرة هي الطالبان المنشوران سابقاً فقط (أول صفين في حلقة الصديق). */
/* طبقة شفافة فوق حقل بلا نص (placeholder) تحمل نصّه الظاهر ليمكن تحديده بالنص؛ لا تغيّر ما يراه المستخدم. */
const ovl = async (page, selector, text, nth = 0) => page.evaluate(({ selector, text, nth }) => {
  const el = [...document.querySelectorAll(selector)].filter(e => e.getBoundingClientRect().width > 0)[nth]
  if (!el) throw new Error("لا عنصر: " + selector)
  const r = el.getBoundingClientRect(); const s = document.createElement("span"); s.setAttribute("data-ov", "1"); s.textContent = text
  Object.assign(s.style, { position: "fixed", left: r.x + "px", top: r.y + "px", width: r.width + "px", height: r.height + "px", color: "transparent", pointerEvents: "none", overflow: "hidden", fontSize: "1px", zIndex: "0" })
  document.body.appendChild(s)
}, { selector, text, nth })
const clear = (page) => page.evaluate(() => document.querySelectorAll("[data-ov]").forEach(e => e.remove()))
const status = async (page, label, nth) => { await page.locator("button:visible", { hasText: new RegExp("^" + label + "$") }).nth(nth).click(); await page.waitForTimeout(700) }

export default {
  slug: 'attendance-batch',
  screen: 'الغياب والتأخر',
  title: 'الغياب والتأخر',
  prepare: async (page) => { await page.locator('select:visible').first().selectOption({ label: 'حلقة الصديق' }); await page.waitForTimeout(2000) },
  steps: {
    1: { targets: ['el:الغياب والتأخر', 'el:تسجيل حضور الطلاب', 'el:تسجيل غياب/تأخر الكادر'], pad: [24, 24] },
    2: { targets: ['field:تاريخ التفقد', 'field:الحلقة المراد تحضيرها'], pad: [24, 10] },
    3: { targets: ['el:قائمة الطلاب', 'el:تسجيل الجميع حاضر'], pad: [24, 14] },
    4: { targets: ['el:حاضر', 'el:متأخر', 'el:غائب'], pad: [1000, 14] },
    5: {
      targets: ['el:مدة التأخر بالدقائق (مثال: 15)', 'el:مبرر (بعذر)', 'el:ملاحظة إضافية...'], pad: [24, 8],
      prepare: async (page, h) => {
        await status(page, 'متأخر', 0); await status(page, 'غائب', 1)
        await ovl(page, 'input[placeholder="مدة التأخر بالدقائق (مثال: 15)"]', 'مدة التأخر بالدقائق (مثال: 15)')
        await ovl(page, 'select', 'مبرر (بعذر)', 1)
        await ovl(page, 'input[placeholder="ملاحظة إضافية..."]', 'ملاحظة إضافية...')
      },
    },
    6: {
      targets: ['el:مبرر (بعذر)', 'el:سبب الغياب...'], pad: [24, 8],
      prepare: async (page) => { await clear(page); await ovl(page, 'select', 'مبرر (بعذر)', 2); await ovl(page, 'input[placeholder="سبب الغياب..."]', 'سبب الغياب...') },
    },
    7: { targets: ['el:اعتماد وحفظ التفقد'], pad: [24, 24], prepare: async (page) => { await clear(page) } },
  },
}
