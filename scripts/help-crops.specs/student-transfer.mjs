/* مواصفة اقتطاعات شرح «نقل طالب بين الحلقات». الصيغة في رأس scripts/help-crops.mjs.
   النقل يتم من «الصفوف والحلقات». لا يضغط زر «نقل» ولا أيقونته (قراءة فقط): يمرّر المؤشر ويضع علامة اختيار محلية فقط. */

/* نص شفاف صفر الحجم داخل العنصر يحمل اسم الخانة ليجده المحدِّد (حقل بلا label، أيقونة بلا نص). لا يظهر في الصورة. */
const tag = (page, selector, text, { parent = false, index = 0 } = {}) => page.evaluate(({ selector, text, parent, index }) => {
  const el = document.querySelectorAll(selector)[index]
  if (!el) throw new Error('لا عنصر: ' + selector)
  const host = parent ? el.parentElement : el
  const s = document.createElement('span')
  s.textContent = text
  s.style.cssText = 'position:absolute;opacity:0;width:1px;height:1px;overflow:hidden;pointer-events:none'
  host.appendChild(s)
}, { selector, text, parent, index })

export default {
  slug: 'student-transfer',
  screen: 'الصفوف والحلقات',
  title: 'الصفوف والحلقات',
  steps: {
    1: { targets: ['el:إدارة الحلقات والأفواج'], pad: [48, 6] },
    2: {
      targets: ['field:بحث عن طالب، حلقة، أو فوج'], pad: [8, 10],
      prepare: async (page) => { await tag(page, 'input[placeholder="بحث عن طالب، حلقة، أو فوج..."]', 'بحث عن طالب، حلقة، أو فوج', { parent: true }) },
    },
    3: {
      targets: ['el:سطر الطالب', 'el:نقل الطالب', 'el:إزالة من الحلقة'], pad: [6, 6],
      prepare: async (page) => {
        await tag(page, 'button[title="نقل الطالب"]', 'نقل الطالب')
        await tag(page, 'button[title="إزالة من الحلقة"]', 'إزالة من الحلقة')
        await tag(page, 'li.group', 'سطر الطالب')
        await page.evaluate(() => document.querySelector('li.group').setAttribute('role', 'tab'))
        await page.locator('li.group').first().hover()
        await page.waitForTimeout(600)
      },
    },
    6: {
      targets: ['el:إلغاء التحديد', 'el:نقل', 'el:إزالة'], pad: [24, 14],
      prepare: async (page) => {
        await page.mouse.move(700, 5)
        await page.locator('input[type=checkbox]').nth(1).check()
        await page.waitForTimeout(700)
      },
    },
  },
}
