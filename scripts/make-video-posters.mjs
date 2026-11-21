/* ══════════════════════════════════════════════════════════════════
   أغلفة فيديوهات يوتيوب (1280×720 → public/video/<مفتاح>.webp)

   لماذا نرسمها بدل لقطات يوتيوب التلقائية: اللقطة التلقائية تُؤخذ من منتصف
   الفيديو عشوائياً، وفي حلقات الشرح تقع على لوحة مفاتيح الهاتف ووجه صغير
   في الزاوية. الغلاف هنا بهوية الموقع (كريمي وإطار ذهبي وخط قمرة) وعليه
   عنوان الفيديو، ويُستعمل أيضاً thumbnailUrl في VideoObject.

   الفيديو التعريفي (intro) يأخذ صورته من لقطة يوتيوب نفسها (الأب وابنه وبطاقة
   المتابعة) بلا الترجمة المطبوعة في أسفلها.

   تُشغَّل يدوياً حين يُضاف فيديو إلى src/data/videos.js أو يتغيّر اسمه:

       node scripts/make-video-posters.mjs           كل الفيديوهات
       node scripts/make-video-posters.mjs ep3       فيديو بعينه

   تحتاج Playwright (متصفح محلي) وشبكة (للقطة intro)، فلا تعمل في البناء.
   ══════════════════════════════════════════════════════════════════ */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { VIDEOS } from '../src/data/videos.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT  = path.join(ROOT, 'public', 'video')
const file = (p) => pathToFileURL(path.join(ROOT, 'public', p)).href
const esc  = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const only = process.argv.slice(2)

const star = `<svg viewBox="-60 -60 120 120" width="100%" height="100%"><g fill="none" stroke="#B8863A" stroke-width="2"><rect x="-40" y="-40" width="80" height="80"/><rect x="-40" y="-40" width="80" height="80" transform="rotate(45)"/><circle r="16"/></g></svg>`

/* «الحلقة 3: عنوان» ← { tag: 'الحلقة 3', num: '3', title: 'عنوان' } */
function parts(v) {
  const m = v.name.match(/^الحلقة (\d+): (.+)$/)
  /* أرقام عربية: «1» في قمرة عمودٌ بلا قاعدة يشبه الألف، فيُقرأ «الحلقة ا» */
  if (m) { const n = Number(m[1]).toLocaleString('ar-EG', { useGrouping: false }); return { tag: 'شرح إحكام · الحلقة ' + n, num: n, title: m[2] } }
  if (v.key === 'intro') return { tag: 'فيديو تعريفي', num: null, title: v.name }
  return { tag: 'شرح إحكام', num: null, title: v.name }
}

function html(v, art) {
  const p = parts(v)
  const size = p.title.length > 40 ? 56 : p.title.length > 26 ? 64 : 74
  const intro = !!art
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<style>
  @font-face { font-family: Qomra; src: url('${file('fonts/qomra-bold.woff2')}') format('woff2'); font-weight: 550 1000; }
  @font-face { font-family: Qomra; src: url('${file('fonts/qomra-regular.woff2')}') format('woff2'); font-weight: 100 549; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1280px; height: 720px; overflow: hidden; background: #F8F5EC; font-family: Qomra, sans-serif; position: relative; }
  .bg { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 90% at 0% 100%, rgba(184,134,58,0.18), transparent 60%), radial-gradient(ellipse 60% 80% at 100% 0%, rgba(31,111,82,0.12), transparent 60%), #F8F5EC; }
  .frame { position: absolute; inset: 24px; border: 1.5px solid rgba(184,134,58,0.5); border-radius: 26px; }
  .num { position: absolute; left: 70px; bottom: -70px; font-size: 440px; font-weight: 900; line-height: 1; color: rgba(184,134,58,0.15); }
  .star { position: absolute; left: 64px; bottom: 56px; width: 120px; height: 120px; opacity: .55; }
  .art { position: absolute; left: 50px; top: 110px; width: 660px; height: 390px; border-radius: 26px; box-shadow: 0 18px 40px -18px rgba(11,59,51,.45), inset 0 0 0 1px rgba(184,134,58,.4); background: url('${art || ''}') center / cover no-repeat; }
  .col { position: absolute; top: 0; bottom: 0; right: 0; width: ${intro ? 560 : 1280}px; padding: 70px 84px; display: flex; flex-direction: column; }
  .top { display: flex; align-items: center; gap: 14px; }
  .top img { width: 64px; height: 64px; }
  .brand { color: #0B3B33; font-weight: 800; font-size: 30px; }
  .tag { margin-inline-start: auto; color: #8A6425; background: rgba(184,134,58,.12); border: 1.5px solid rgba(184,134,58,.38); border-radius: 999px; padding: 6px 22px; font-weight: 700; font-size: 24px; }
  h1 { margin-top: ${intro ? 130 : 46}px; max-width: ${intro ? 400 : 900}px; color: #0B3B33; font-weight: 900; font-size: ${intro ? 66 : size}px; line-height: 1.32; }
  .foot { margin-top: auto; align-self: flex-start; color: #8A6425; font-size: 24px; font-weight: 600; direction: ltr; }
</style></head><body>
  <div class="bg"></div><div class="frame"></div>
  ${intro ? '<div class="art"></div>' : (p.num ? `<div class="num">${esc(p.num)}</div>` : `<div class="star">${star}</div>`)}
  <div class="col">
    <div class="top"><img src="${file('ihkaam-logo-light.png')}" alt=""><span class="brand">إحكام</span><span class="tag">${esc(p.tag)}</span></div>
    <h1>${esc(p.title)}</h1>
    <div class="foot">ihkaam.app</div>
  </div>
</body></html>`
}

/* صورة intro: لقطة يوتيوب بدقتها الكاملة، مقصوصة فوق الترجمة المطبوعة في أسفلها. */
async function introArt(v) {
  const res = await fetch(`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`)
  if (!res.ok) throw new Error(`تعذّر تنزيل لقطة ${v.id}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const cropped = await sharp(buf).extract({ left: 0, top: 0, width: 1280, height: 600 }).png().toBuffer()
  const tmp = path.join(os.tmpdir(), `ihkaam-intro-art.png`)
  fs.writeFileSync(tmp, cropped)
  return pathToFileURL(tmp).href
}

fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })
  for (const v of Object.values(VIDEOS)) {
    if (only.length && !only.includes(v.key)) continue
    const art = v.key === 'intro' ? await introArt(v) : null
    const tmp = path.join(os.tmpdir(), `ihkaam-poster-${v.key}.html`)
    fs.writeFileSync(tmp, html(v, art))
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' })
    fs.rmSync(tmp)
    await page.evaluate(() => document.fonts.ready)
    const png = await page.screenshot({ type: 'png' })
    const target = path.join(OUT, `${v.key}.webp`)
    await sharp(png).webp({ quality: 80, effort: 5 }).toFile(target)
    console.log('✓', path.relative(ROOT, target), Math.round(fs.statSync(target).size / 1024) + ' ك.ب')
  }
} finally {
  await browser.close()
}
