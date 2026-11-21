/* مراجعة الروابط الداخلية (ISS-10 / ISS-63): تُشغَّل بعد "npm run build".
   تقرأ dist/**\/*.html، وتبني رسم الروابط بين الصفحات (روابط <a href> الداخلية
   فقط، من مصدر مختلف عن الهدف)، وتطبع عدد الروابط الواردة لكل عنوان.
   - يتيمة: صفحة بلا أي رابط وارد.
   - ضعيفة: صفحة ميزة أو مقال بأقل من 3 روابط واردة.
   تخرج برمز 1 إن وُجدت صفحة يتيمة أو ضعيفة، وإلا 0.
   الاستعمال: node scripts/audit-links.mjs [--min=3] [--all] */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const MIN  = Number((process.argv.find(a => a.startsWith('--min=')) || '--min=3').split('=')[1])
const ALL  = process.argv.includes('--all')

if (!fs.existsSync(DIST)) { console.error('لا يوجد dist/. شغّل npm run build أولاً.'); process.exit(2) }

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}

/* dist/a/b/index.html -> /a/b ، dist/a.html -> /a ، dist/index.html -> / */
function urlOf(file) {
  let rel = path.relative(DIST, file).split(path.sep).join('/').replace(/\.html$/, '')
  rel = rel.replace(/(^|\/)index$/, '')
  return '/' + rel
}

function norm(href) {
  let h = href.trim()
  if (!h || h.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(h)) return null
  if (/^https?:\/\//i.test(h)) {
    try { const u = new URL(h); if (!/(^|\.)ihkaam\.app$/.test(u.hostname)) return null; h = u.pathname } catch { return null }
  }
  if (!h.startsWith('/')) return null
  h = h.split('#')[0].split('?')[0]
  if (/\.[a-z0-9]{2,5}$/i.test(h) && !h.endsWith('.html')) return null  // ملفات ثابتة
  h = h.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '')
  return h === '' ? '/' : h
}

const files = walk(DIST).filter(f => urlOf(f) !== '/404' && !/^\/(admin|checkout)(\/|$)/.test(urlOf(f)))
const pages = new Map(files.map(f => [urlOf(f), f]))
const inbound = new Map([...pages.keys()].map(u => [u, new Set()]))
const broken = new Map()

for (const [url, file] of pages) {
  const html = fs.readFileSync(file, 'utf8')
  for (const m of html.matchAll(/<a\b[^>]*?\shref=("([^"]*)"|'([^']*)')/gi)) {
    const t = norm(m[2] ?? m[3] ?? '')
    if (!t || t === url) continue
    if (inbound.has(t)) inbound.get(t).add(url)
    else (broken.get(t) || broken.set(t, new Set()).get(t)).add(url)
  }
}

const kindOf = u => u.startsWith('/blog/') ? 'مقال'
  : /^\/ihkaam\/(features|addons)\//.test(u) ? 'ميزة'
  : u.startsWith('/help/') ? 'مساعدة' : 'صفحة'

const rows = [...inbound].map(([u, s]) => ({ url: u, kind: kindOf(u), n: s.size }))
  .sort((a, b) => a.n - b.n || a.url.localeCompare(b.url))

console.log(`صفحات مفحوصة: ${rows.length}\n`)
console.log('الروابط الواردة لكل عنوان (الأقل أولاً):')
for (const r of rows) if (ALL || r.n < MIN || r.kind === 'ميزة' || r.kind === 'مقال')
  console.log(`  ${String(r.n).padStart(3)}  ${r.kind.padEnd(6)} ${r.url}`)

const orphans = rows.filter(r => r.n === 0 && r.url !== '/')
const weak    = rows.filter(r => r.n > 0 && r.n < MIN && r.kind !== 'صفحة')

console.log(`\nصفحات يتيمة (0 واردة): ${orphans.length}`)
orphans.forEach(r => console.log('  - ' + r.url))
console.log(`ميزات ومقالات بأقل من ${MIN} واردة: ${weak.length}`)
weak.forEach(r => console.log(`  - ${r.url} (${r.n})`))

if (broken.size) {
  console.log(`\nروابط داخلية إلى عناوين غير مولّدة (قد تكون مسارات SPA بلا HTML): ${broken.size}`)
  for (const [t, s] of broken) console.log(`  - ${t}  <-  ${[...s].slice(0, 3).join(', ')}${s.size > 3 ? ' ...' : ''}`)
}

/* رابط مكسور إلى مقال: يفشل الفحص (مقال مجدول لم يحن موعده يظهر رابطه في مقال سابق). */
const brokenPosts = [...broken.keys()].filter(t => t.startsWith('/blog/'))
if (brokenPosts.length) console.log(`
✖ روابط إلى مقالات غير موجودة: ${brokenPosts.length}`)

process.exit(orphans.length || weak.length || brokenPosts.length ? 1 : 0)
