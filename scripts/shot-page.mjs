/* لقطة لصفحة من الموقع المحلي للمراجعة البصرية (أداة تطوير، لا تدخل البناء):
     node scripts/shot-page.mjs <مسار> <ملف-الخرج.png> [عرض] [ارتفاع] [fullPage] */
import { chromium } from 'playwright'
const [route, out, w = '1280', h = '900', full = 'full'] = process.argv.slice(2)
const base = process.env.SITE_URL || 'http://localhost:5199'
const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: +w, height: +h }, locale: 'ar' })).newPage()
await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(3500)
// تمرير بطيء حتى تُحمَّل الصور الكسولة
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)) } window.scrollTo(0, 0) })
await page.waitForTimeout(800)
await page.screenshot({ path: out, fullPage: full === 'full' })
await browser.close()
