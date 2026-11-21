/* مواصفة اقتطاعات شرح «بوابة الأهل». الشاشة جوال (390) من «معهد النموذج» (وضع العرض للقراءة فقط)
   عبر زر «شاشة ولي الأمر»؛ الخطوة الأولى من صفحة الدخول العامة. الطفل في الوضع يتبدّل، لذا لا يُقتطع
   إلا ما لا يحمل اسماً: بطاقات الأرقام وعناوين الأقسام والتبويبات، لا ترويسة الطفل ولا بطاقة النجم. */
let entered = false
const enter = async (page) => {
  if (entered) return
  const inputs = page.locator('input:visible')
  await inputs.nth(0).fill('admin'); await inputs.nth(1).fill('123')
  await page.getByRole('button', { name: /تسجيل الدخول/ }).first().click()
  await page.waitForTimeout(4000)
  await page.evaluate(() => sessionStorage.setItem('ihkaam_showcase_mode', '1'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(6000)
  await page.addStyleTag({ content: 'a[href*="wa.me"], [class*="whatsapp"], .fixed.bottom-6.left-6 { display:none !important }' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.mouse.click(1400, 95); await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'شاشة ولي الأمر' }).click()
  await page.waitForTimeout(5000)
  await page.setViewportSize({ width: 390, height: 1800 })
  await page.waitForTimeout(2000)
  // إخفاء كل ما خارج نافذة ولي الأمر كي لا يلتقط المحدِّد عناصر الشريط الجانبي
  await page.evaluate(() => {
    const ov = [...document.querySelectorAll('div')].find(d => String(d.className).includes('z-[120]') && String(d.className).includes('inset-0'))
    let n = ov
    while (n && n !== document.body) { [...n.parentElement.children].forEach(s => { if (s !== n) s.style.visibility = 'hidden' }); n = n.parentElement }
  })
  entered = true
}
/* بطاقة «نجم حلقة» فيها أسماء طلاب: تُخفى محلياً في الصفحة قبل التصوير */
const hideStar = (page) => page.evaluate(() => {
  const cands = [...document.querySelectorAll('div')].filter(d => d.textContent.includes('شجّعوا بطلنا') && d.textContent.includes('شاهد الإنجاز للتحدي'))
  const card = cands.sort((a, b) => a.textContent.length - b.textContent.length)[0]
  if (card) card.style.visibility = 'hidden'
})
let cur = 'نظرة عامة'
const openMenu = async (page) => { await page.locator('button:visible', { hasText: cur }).first().click(); await page.waitForTimeout(500) }
const pick = async (page, name) => {
  await page.locator('span.truncate:visible', { hasText: new RegExp('^' + name + '$') }).last().click()
  await page.waitForTimeout(1800); cur = name
}
const goTab = async (page, name) => { await openMenu(page); await pick(page, name) }

export default {
  slug: 'parent-portal',
  title: 'بوابة ولي الأمر',
  public: true,
  url: 'https://demo.ihkaam.app',
  viewport: { width: 390, height: 1800 },
  steps: {
    1: { targets: ['field:اسم المستخدم', 'field:كلمة المرور', 'el:تسجيل الدخول للنظام'], pad: [16, 16] },
    3: { prepare: async (page) => { await enter(page); await hideStar(page); await page.getByRole('button', { name: 'آخر 30 يوم' }).click(); await page.waitForTimeout(700) },
         targets: ['el:تصفية السجل', 'el:آخر أسبوع', 'el:آخر 3 أشهر', 'el:كامل السجل', 'el:نطاق مخصص'], pad: [16, 14] },
    4: { prepare: async (page) => { await page.keyboard.press('Escape'); await page.mouse.click(195, 1500); await page.waitForTimeout(400); await openMenu(page) },
         targets: ['el:نظرة عامة', 'el:المصادر التعليمية'], pad: [16, 14] },
    5: { prepare: async (page) => { await pick(page, 'نظرة عامة'); await hideStar(page) },
         targets: ['el:الغياب والتأخر', 'el:الاختبارات المؤداة'], pad: [90, 50] },
    6: { prepare: async (page) => { await goTab(page, 'سجل التسميع') },
         targets: ['el:المنحنى البياني للتسميع', 'el:سجل الحصص اليومي'], pad: [48, 14] },
    7: { prepare: async (page) => { await goTab(page, 'الاختبارات') },
         targets: ['el:سجل الاختبارات', 'el:الدرجة'], pad: [150, 10] },
    8: { prepare: async (page) => { await goTab(page, 'الغياب والانضباط') },
         targets: ['el:إحصائية الانضباط', 'el:سجل الحضور والتأخر'], pad: [48, 14] },
    9: { prepare: async (page) => { await goTab(page, 'بوصلة التركيز والملاحظات') },
         targets: ['el:بوصلة التركيز'], pad: [100, 26] },
    10: { prepare: async (page) => { await goTab(page, 'السجل المالي') },
          targets: ['el:إيصال قسط', 'el:حالة القسط'], pad: [300, 34] },
    11: { prepare: async (page) => { await goTab(page, 'المصادر التعليمية') },
          targets: ['el:التطبيقات والكتب', 'el:المكتبة الصوتية (تلاوات)'], pad: [24, 24] },
  },
}
