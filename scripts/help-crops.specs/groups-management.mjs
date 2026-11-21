/* مواصفة اقتطاعات شرح «إدارة الحلقات والمجموعات». الصيغة في رأس scripts/help-crops.mjs.
   لا يفتح إلا نافذتي «إضافة حلقة» و«إضافة طلاب» للمعاينة ويغلقهما بزر X (لا حفظ ولا تأكيد). */

/* يضيف إلى عنصر نصاً شفافاً صفر الحجم يحمل اسم الخانة، ليجد المحدِّد حقولاً بلا تسمية نصية
   (حقل بحث بلا label، صف معلم). لا يظهر في الصورة. */
const tag = (page, selector, text, { parent = false, index = 0 } = {}) => page.evaluate(({ selector, text, parent, index }) => {
  const el = document.querySelectorAll(selector)[index]
  if (!el) throw new Error('لا عنصر: ' + selector)
  const host = parent ? el.parentElement : el
  const s = document.createElement('span')
  s.textContent = text
  s.style.cssText = 'position:absolute;opacity:0;width:1px;height:1px;overflow:hidden;pointer-events:none'
  host.appendChild(s)
}, { selector, text, parent, index })

const clickByText = async (page, name) => {
  await page.getByRole('button', { name, exact: true }).first().click()
  await page.waitForTimeout(1200)
}
const closeModal = async (page) => {
  await page.locator('.fixed.inset-0 button:has(svg.lucide-x)').first().click()
  await page.waitForTimeout(800)
}
const SEARCH = '.fixed.inset-0 input[placeholder="ابحث عن طالب..."]'

export default {
  slug: 'groups-management',
  screen: 'الصفوف والحلقات',
  title: 'الصفوف والحلقات',
  steps: {
    1: {
      targets: ['el:إدارة الحلقات والأفواج', 'el:إضافة حلقة', 'el:غير الموزعين:'], pad: [24, 24],
      prepare: async (page) => {
        // يجعل شارة «غير الموزعين» كلها هي المستطيل المعلَّم لا الكلمة وحدها
        await page.evaluate(() => {
          const s = [...document.querySelectorAll('span')].find(e => e.textContent.trim() === 'غير الموزعين:')
          if (s && s.parentElement) s.parentElement.setAttribute('role', 'tab')
        })
      },
    },
    2: {
      targets: ['el:إضافة حلقة جديدة'], pad: [48, 24],
      prepare: async (page) => { await clickByText(page, 'إضافة حلقة') },
    },
    3: { targets: ['field:اسم الحلقة', 'field:القسم الإشرافي', 'field:الفوج (اختياري)'], pad: [24, 16] },
    4: {
      targets: ['el:المعلمون الرئيسيون', 'el:إضافة معلم رئيسي', 'field:اختر المعلم...'], pad: [24, 14],
      prepare: async (page) => { await tag(page, '.fixed.inset-0 select', 'اختر المعلم...', { parent: true, index: 1 }) },
    },
    5: { targets: ['el:المعلمون المساعدون', 'el:إضافة معلم مساعد', 'el:لا يوجد معلمون مساعدون حالياً.'], pad: [24, 14] },
    6: { targets: ['field:ملاحظات'], pad: [24, 14] },
    7: {
      targets: ['el:توزيع الطلاب', 'field:ابحث عن طالب...'], pad: [24, 12],
      prepare: async (page) => { await tag(page, SEARCH, 'ابحث عن طالب...', { parent: true }) },
    },
    8: { targets: ['el:حفظ الحلقة', 'el:إلغاء'], pad: [24, 24] },
    9: {
      targets: ['el:إضافة طلاب'], pad: [48, 18],
      prepare: async (page) => { await closeModal(page) },
    },
    10: {
      targets: ['el:الطلاب غير الموزعين', 'field:ابحث عن طالب...'], pad: [24, 12],
      prepare: async (page) => {
        await clickByText(page, 'إضافة طلاب')
        await tag(page, SEARCH, 'ابحث عن طالب...', { parent: true })
      },
    },
    11: { targets: ['el:إضافة الطلاب', 'el:إلغاء'], pad: [24, 24] },
  },
}
