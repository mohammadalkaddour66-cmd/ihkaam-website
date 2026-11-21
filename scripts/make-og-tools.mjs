/* ══════════════════════════════════════════════════════════════════
   صور المشاركة للأدوات المجانية (1200×630) — على نمط أغلفة المقالات
   (make-og-covers.mjs): خلفية كريمية وإطار ذهبي وخط قمرة. تُشغَّل يدوياً حين
   تُضاف أداة أو يتغيّر اسمها، والصور تُودَع في public/og/tools/:

       node scripts/make-og-tools.mjs

   تحتاج Playwright (متصفح محلي)، فلا تعمل في البناء.
   ══════════════════════════════════════════════════════════════════ */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { TOOLS, TOOLS_HUB } from '../src/config/tools.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'og', 'tools')
const file = (p) => pathToFileURL(path.join(ROOT, 'public', p)).href
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const items = [
  { slug: 'tools', title: 'أدوات مجانية لمعلم القرآن ومدير الحلقة', sub: TOOLS.map(t => t.name).join(' · '), url: `ihkaam.app${TOOLS_HUB.path}` },
  ...TOOLS.map(t => ({ slug: t.slug, title: t.name, sub: t.tagline, url: `ihkaam.app${t.path}` })),
]

const star = `<svg viewBox="-60 -60 120 120" width="230" height="230"><g fill="none" stroke="#E0B562" stroke-width="2.5"><rect x="-40" y="-40" width="80" height="80"/><rect x="-40" y="-40" width="80" height="80" transform="rotate(45)"/><circle r="16"/></g></svg>`

function html(it) {
  const size = it.title.length > 30 ? 60 : 74
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<style>
  @font-face { font-family: Qomra; src: url('${file('fonts/qomra-bold.woff2')}') format('woff2'); font-weight: 550 1000; }
  @font-face { font-family: Qomra; src: url('${file('fonts/qomra-regular.woff2')}') format('woff2'); font-weight: 100 549; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #F8F5EC; font-family: Qomra, sans-serif; position: relative; }
  .bg { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 90% at 0% 100%, rgba(184,134,58,0.16), transparent 60%), radial-gradient(ellipse 60% 80% at 100% 0%, rgba(31,111,82,0.10), transparent 60%), #F8F5EC; }
  .shade { position: absolute; inset: 22px; border: 1.5px solid rgba(184,134,58,0.45); border-radius: 18px; }
  .side { position: absolute; left: 22px; top: 22px; bottom: 22px; width: 330px; border-radius: 18px 0 0 18px; background: linear-gradient(170deg, #0B3B33, #082C26); display: grid; place-items: center; }
  .wrap { position: absolute; top: 0; bottom: 0; right: 0; left: 352px; padding: 60px 64px; display: flex; flex-direction: column; }
  .top { display: flex; align-items: center; gap: 14px; }
  .top img { width: 70px; height: 70px; }
  .brand { color: #0B3B33; font-weight: 800; font-size: 28px; }
  .tag { margin-top: auto; display: inline-flex; align-self: flex-start; color: #8A6425; background: rgba(184,134,58,.12); border: 1.5px solid rgba(184,134,58,.35); border-radius: 999px; padding: 6px 20px; font-weight: 700; font-size: 24px; }
  h1 { margin-top: 18px; color: #0B3B33; font-weight: 900; font-size: ${size}px; line-height: 1.35; }
  .sub { margin-top: 12px; color: #4A5D56; font-size: 27px; line-height: 1.5; }
  .foot { margin-top: 26px; color: #8A6425; font-size: 22px; font-weight: 600; direction: ltr; text-align: right; }
</style></head><body>
  <div class="bg"></div><div class="shade"></div>
  <div class="side">${star}</div>
  <div class="wrap">
    <div class="top"><img src="${file('ihkaam-logo-light.png')}" alt=""><span class="brand">إحكام</span></div>
    <div class="tag">أداة مجانية · بلا تسجيل</div>
    <h1>${esc(it.title)}</h1>
    <div class="sub">${esc(it.sub)}</div>
    <div class="foot">${esc(it.url)}</div>
  </div>
</body></html>`
}

fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  for (const it of items) {
    const tmp = path.join(os.tmpdir(), `ihkaam-og-tool-${it.slug}.html`)
    fs.writeFileSync(tmp, html(it))
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' })
    fs.rmSync(tmp)
    await page.evaluate(() => document.fonts.ready)
    const target = path.join(OUT, `${it.slug}.jpg`)
    await page.screenshot({ path: target, type: 'jpeg', quality: 84 })
    console.log('✓', path.relative(ROOT, target))
  }
} finally {
  await browser.close()
}
