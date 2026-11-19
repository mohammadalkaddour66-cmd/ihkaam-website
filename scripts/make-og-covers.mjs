/* ══════════════════════════════════════════════════════════════════
   صور المشاركة لكل مقال (ISS-08) — تُشغَّل يدوياً حين يُضاف مقال أو يتغيّر
   عنوانه، والصور تُودَع في public/og/blog/ مع المقال:

       node scripts/make-og-covers.mjs            كل المقالات (ومنها المسودات)
       node scripts/make-og-covers.mjs <slug>…    مقالات بعينها

   لماذا: كل صفحات الموقع كانت تُشارَك بصورةٍ واحدة (og-cover.jpg)، فيبدو
   المقال في واتساب وفيسبوك كأنه الصفحة الرئيسية. الآن لكل مقالٍ صورةٌ
   1200×630 تحمل عنوانه وتصنيفه فوق خلفية og-cover.jpg نفسها، بلون التصنيف
   (coverColor) وبخط Cairo المستضاف — لا لون جديد ولا تصميم جديد.

   لا يعمل في البناء: يحتاج Playwright (متصفح محلي)، وبيئة Cloudflare لا
   تملكه. والمقال يشير إلى صورته بحقل cover في ملفه.
   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT  = path.join(ROOT, 'public', 'og', 'blog')
const only = process.argv.slice(2)

const vite = await createServer({ root: ROOT, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
let data
try {
  data = await vite.ssrLoadModule('/src/data/blogContent.js')
} finally {
  await vite.close()
}
const { BLOG_POSTS, BLOG_DRAFTS, BLOG_CATEGORIES } = data
const posts = [...BLOG_POSTS, ...BLOG_DRAFTS].filter(p => !only.length || only.includes(p.slug))
if (!posts.length) throw new Error('لا مقال بهذا الاسم')

const file = (p) => pathToFileURL(path.join(ROOT, 'public', p)).href
const esc  = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function html(post) {
  const cat    = BLOG_CATEGORIES.find(c => c.id === post.category)
  const accent = post.coverColor || cat?.color || '#E3A93F'
  const size   = post.title.length > 60 ? 50 : post.title.length > 40 ? 58 : 66
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<style>
  @font-face { font-family: Cairo; src: url('${file('fonts/cairo-arabic.woff2')}') format('woff2'); font-weight: 200 1000; }
  @font-face { font-family: Cairo; src: url('${file('fonts/cairo-latin.woff2')}') format('woff2'); font-weight: 200 1000; unicode-range: U+0000-00FF; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #020F0E; font-family: Cairo, sans-serif; }
  .bg { position: absolute; inset: 0; background: url('${file('og-cover.jpg')}') center / cover; }
  .shade { position: absolute; inset: 0; background: linear-gradient(to left, rgba(2,15,14,0.92) 0%, rgba(2,15,14,0.86) 55%, rgba(2,15,14,0.55) 100%); }
  .wrap { position: absolute; inset: 0; padding: 64px 72px; display: flex; flex-direction: column; }
  .top { display: flex; align-items: center; gap: 16px; }
  .top img { width: 76px; height: 76px; }
  .brand { color: #EAE4DF; font-weight: 800; font-size: 30px; }
  .cat { margin-top: auto; color: ${accent}; font-weight: 700; font-size: 26px; display: flex; align-items: center; gap: 14px; }
  .cat::before { content: ''; width: 44px; height: 3px; background: ${accent}; border-radius: 2px; }
  h1 { margin-top: 18px; color: #EAE4DF; font-weight: 900; font-size: ${size}px; line-height: 1.45; max-width: 1000px; }
  .foot { margin-top: 30px; color: #E5D3B3; font-size: 24px; font-weight: 600; direction: ltr; text-align: right; }
</style></head><body>
  <div class="bg"></div><div class="shade"></div>
  <div class="wrap">
    <div class="top"><img src="${file('ihkaam-logo.png')}" alt=""><span class="brand">مدونة إحكام</span></div>
    <div class="cat">${esc(cat?.label || '')}</div>
    <h1>${esc(post.title)}</h1>
    <div class="foot">ihkaam.app/blog</div>
  </div>
</body></html>`
}

fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  for (const post of posts) {
    /* ملفٌّ مؤقت لا setContent: صفحة about:blank لا تُحمِّل الخط والصور من file://. */
    const tmp = path.join(os.tmpdir(), `ihkaam-og-${post.slug}.html`)
    fs.writeFileSync(tmp, html(post))
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' })
    fs.rmSync(tmp)
    await page.evaluate(() => document.fonts.ready)
    const target = path.join(OUT, `${post.slug}.jpg`)
    await page.screenshot({ path: target, type: 'jpeg', quality: 82 })
    console.log('✓', path.relative(ROOT, target))
  }
} finally {
  await browser.close()
}
