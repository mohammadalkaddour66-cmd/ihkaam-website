/* استكشاف نسخة العرض demo.ihkaam.app (قراءة فقط): يسجّل الدخول، ويطبع النصوص الظاهرة
   في كل شاشة، ويحفظ لقطات كاملة بقياس 1440×900 في مجلد مؤقت.
   لا يضغط أي زر حفظ ولا يغيّر بيانات. الاستعمال:
     node scripts/demo-explore.mjs <مجلد-الخرج> [شاشة…]
   الحساب والرابط من ذاكرة المشروع (نسخة العرض العامة). */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve(process.argv[2] || 'demo-out')
const ONLY = process.argv.slice(3)
fs.mkdirSync(OUT, { recursive: true })

const URL = 'https://demo.ihkaam.app'
const USER = process.env.DEMO_USER || 'admin'
const PASS = process.env.DEMO_PASS || '123'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ar', deviceScaleFactor: 1 })
const page = await ctx.newPage()
page.setDefaultTimeout(25000)

const visibleText = async () => page.evaluate(() => {
  const out = []
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (w.nextNode()) {
    const n = w.currentNode
    const t = n.textContent.replace(/\s+/g, ' ').trim()
    if (!t) continue
    const el = n.parentElement
    if (!el) continue
    const r = el.getBoundingClientRect()
    const st = getComputedStyle(el)
    if (r.width === 0 || r.height === 0 || st.visibility === 'hidden' || st.display === 'none') continue
    out.push(t)
  }
  const ph = [...document.querySelectorAll('input,textarea,select')].map(i => `[${i.tagName.toLowerCase()}] ${i.placeholder || ''} ${i.getAttribute('aria-label') || ''}`.trim())
  return { text: [...new Set(out)], fields: ph }
})

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(3000); await page.screenshot({ path: path.join(OUT, 'login.png') })
console.log('## login screen')
console.log(JSON.stringify(await visibleText(), null, 1))

// تسجيل الدخول
const inputs = page.locator('input:visible')
const n = await inputs.count()
console.log('inputs on login:', n)
await inputs.nth(0).fill(USER)
await inputs.nth(1).fill(PASS)
await page.getByRole('button', { name: /تسجيل الدخول/ }).first().click()
await page.waitForTimeout(1500)
await page.waitForTimeout(2500)
await page.screenshot({ path: path.join(OUT, 'after-login.png') })

// إخفاء زر واتساب العائم، وفتح الشريط الجانبي بالأسماء
await page.addStyleTag({ content: 'a[href*="wa.me"], [class*="whatsapp"], .fixed.bottom-6.left-6 { display:none !important }' })
await page.mouse.click(1400, 95)
await page.waitForTimeout(1200)
await page.screenshot({ path: path.join(OUT, 'sidebar-open.png') })
// قائمة الشريط الجانبي
const side = await page.evaluate(() => [...document.querySelectorAll('aside button, aside a, nav button, nav a')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean))
console.log('## sidebar/nav items'); console.log(JSON.stringify([...new Set(side)]))

const SCREENS = [
  ['dashboard', /لوحة التحكم/], ['register', /تسجيل الطلاب/], ['staff-register', /تسجيل الكادر/],
  ['circles', /الصفوف والحلقات/], ['recite', /التسميع اليومي/], ['attendance', /الغياب والتأخر/],
  ['behavior', /سلوك الطلاب/], ['exams', /الاختبارات/], ['reports', /التقارير/],
  ['insights', /التحليل الذكي/], ['archive', /الأرشفة/],
]
for (const [id, label] of SCREENS) {
  if (ONLY.length && !ONLY.includes(id)) continue
  try {
    const box = await page.evaluate((src) => { const re = new RegExp(src); const els=[...document.querySelectorAll('button,a,div,span')].filter(e=>re.test(e.textContent.trim()) && e.children.length<=3); const c=els.map(e=>e.getBoundingClientRect()).filter(r=>r.x>1100&&r.width>20&&r.height>10&&r.height<80)[0]; return c?{x:c.x+c.width/2,y:c.y+c.height/2}:null }, label.source); if(!box) throw new Error('no sidebar item'); await page.mouse.click(box.x, box.y)
    await page.waitForTimeout(1500)
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(OUT, `${id}.png`) })
    const v = await visibleText()
    console.log(`\n## ${id}`)
    console.log(JSON.stringify(v, null, 1))
  } catch (e) { console.log(`\n## ${id} FAILED: ${e.message.split('\n')[0]}`) }
}
await browser.close()
