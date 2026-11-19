/* فحص ما بعد البناء: يقرأ dist/ ويتحقق من الحدود التي يطلبها تقرير التحليل
   (عنوان فريد ≤ 60 حرفاً، وصف فريد 120–155، H1 واحد، canonical صحيح، نصّ كافٍ
   في HTML الخام، وسوم مشاركة فريدة، بيانات منظَّمة سليمة، خريطة موقع تغطي كل
   صفحة مفهرسة، وملفات llms.txt وIndexNow والأيقونة). يُشغَّل يدوياً بعد
   `npm run build`:  node scripts/audit-seo.mjs
   ويخرج برمز 1 إن وُجدت مخالفة. ALL=1 يطبع كل القوائم بدل أول 12. */
import fs from 'node:fs'
import path from 'node:path'

const ROOT   = path.resolve(import.meta.dirname, '..')
const DIST   = path.join(ROOT, 'dist')
const ORIGIN = 'https://ihkaam.app'
const files  = []
;(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) { if (e.name !== 'assets') walk(p) }
    else if (e.name.endsWith('.html')) files.push(p)
  }
})(DIST)

const attr = (h, re) => (h.match(re) || [])[1]
const rows = []
const byTitle = new Map()
const byDesc = new Map()
const byOgUrl = new Map()
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8')
  const rel = path.relative(DIST, f).split(path.sep).join('/')
  /* قشرة مسارات التطبيق (CLIENT_ONLY في prerender.mjs): فارغة و noindex عمداً */
  if (['admin.html', 'admin/login.html', 'checkout.html'].includes(rel)) continue
  const title = attr(h, /<title>([^<]*)<\/title>/)
  const desc  = attr(h, /<meta name="description" content="([^"]*)"/)
  const canon = attr(h, /<link rel="canonical" href="([^"]*)"/)
  const body  = h.slice(h.indexOf('<div id="root">'))
  const text  = body
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
  const ldRaw = [...h.matchAll(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g)]
  let ldBad = false
  const ldText = ldRaw.map(m => m[2]).join('\n')
  for (const m of ldRaw) { try { JSON.parse(m[2]) } catch { ldBad = true } }
  rows.push({
    rel, title, desc, canon,
    ogTitle: attr(h, /<meta property="og:title" content="([^"]*)"/),
    ogDesc : attr(h, /<meta property="og:description" content="([^"]*)"/),
    ogUrl  : attr(h, /<meta property="og:url" content="([^"]*)"/),
    ogImg  : attr(h, /<meta property="og:image" content="([^"]*)"/),
    words: text.trim().split(' ').length,
    h1: (body.match(/<h1[\s>]/g) || []).length,
    ld: /data-page-ld/.test(h),
    ldBad,
    ldForbidden: /"(offers|price|priceCurrency|aggregateRating|Person)"/.test(ldText),
    keywords: /<meta name="keywords"/.test(h),
    noindex: /<meta name="robots" content="[^"]*noindex/.test(h),
  })
  byTitle.set(title, (byTitle.get(title) || []).concat(rel))
  byDesc.set(desc, (byDesc.get(desc) || []).concat(rel))
}

const issues = []
const notes = []
const add = (label, list) => { if (list.length) issues.push([label, list]) }
const real = rows.filter(r => r.rel !== '404.html')
const indexable = real.filter(r => !r.noindex)
const expectedCanon = (rel) => ORIGIN + '/' + (rel === 'index.html' ? '' : rel.replace(/\/?index\.html$/, '').replace(/\.html$/, ''))

add('عنوان مكرر', [...byTitle].filter(([t, v]) => v.length > 1 && v.every(x => x !== '404.html')).map(([t, v]) => `${t} ×${v.length}`))
add('وصف مكرر', [...byDesc].filter(([t, v]) => v.length > 1 && v.every(x => x !== '404.html')).map(([t, v]) => `${(t || '').slice(0, 40)}… ×${v.length}`))
add('H1 ≠ 1', real.filter(r => r.h1 !== 1).map(r => `${r.rel}: ${r.h1}`))
add('عنوان > 60', real.filter(r => r.title && r.title.length > 60).map(r => `${r.rel}: ${r.title.length}`))
add('وصف خارج 120–155', real.filter(r => r.desc && (r.desc.length < 120 || r.desc.length > 155)).map(r => `${r.rel}: ${r.desc.length}`))
add('نص خام < 120 كلمة', real.filter(r => r.words < 120).map(r => `${r.rel}: ${r.words}`))
add('canonical خاطئ', real.filter(r => r.canon !== expectedCanon(r.rel)).map(r => `${r.rel} → ${r.canon}`))
add('وسوم og لا تطابق الصفحة (title/description/url)', real.filter(r =>
  r.ogTitle !== r.title || r.ogDesc !== r.desc || r.ogUrl !== r.canon).map(r => r.rel))
add('og:image غير مطلقة', real.filter(r => !r.ogImg || !r.ogImg.startsWith('https://')).map(r => r.rel))
add('وسم keywords متبقٍّ', real.filter(r => r.keywords).map(r => r.rel))
add('صفحة مفهرسة بلا بيانات منظَّمة', indexable.filter(r => !r.ld).map(r => r.rel))
add('JSON-LD غير صالح', real.filter(r => r.ldBad).map(r => r.rel))
add('JSON-LD فيه سعر/تقييم/شخص (ممنوع)', real.filter(r => r.ldForbidden).map(r => r.rel))

/* ── خريطة الموقع: كل صفحة مفهرسة فيها، ولا شيء غير مفهرس ── */
const sitemapFile = path.join(DIST, 'sitemap.xml')
if (!fs.existsSync(sitemapFile)) {
  issues.push(['sitemap.xml غائب', ['dist/sitemap.xml']])
} else {
  const xml  = fs.readFileSync(sitemapFile, 'utf8')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  const mods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1])
  const set  = new Set(locs)
  add('صفحة مفهرسة خارج الخريطة', indexable.filter(r => !set.has(r.canon)).map(r => r.canon))
  add('رابط في الخريطة ليس صفحةً مفهرسة', locs.filter(l => !indexable.some(r => r.canon === l)))
  add('رابط مكرر في الخريطة', locs.filter((l, i) => locs.indexOf(l) !== i))
  if (mods.length && new Set(mods).size === 1 && locs.length > 5) {
    notes.push(`كل تواريخ lastmod متطابقة (${mods[0]}): طبيعي في أول بناء، ويتمايز لاحقاً مع تغيّر الصفحات`)
  }
  if (!mods.length) notes.push('الخريطة بلا lastmod (بناءٌ آلي بلا scripts/sitemap-lastmod.json في git)')
  notes.push(`الخريطة: ${locs.length} رابط`)
}

/* ── ملفات الظهور ── */
const must = (cond, label) => { if (!cond) issues.push([label, ['']]) }
const robots = fs.existsSync(path.join(DIST, 'robots.txt')) ? fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8') : ''
must(/Sitemap:\s*https:\/\/ihkaam\.app\/sitemap\.xml/.test(robots), 'robots.txt لا يشير إلى الخريطة')
must(fs.existsSync(path.join(DIST, 'llms.txt')), 'llms.txt غائب من dist')
const ico = fs.existsSync(path.join(DIST, 'favicon.ico')) ? fs.readFileSync(path.join(DIST, 'favicon.ico')) : null
must(ico && ico.readUInt16LE(0) === 0 && ico.readUInt16LE(2) === 1, 'favicon.ico ليس ملف ICO حقيقياً')
const keyFile = fs.readdirSync(DIST).find(f => /^[0-9a-f]{8,128}\.txt$/i.test(f))
must(keyFile && fs.readFileSync(path.join(DIST, keyFile), 'utf8').trim() === keyFile.replace(/\.txt$/, ''), 'ملف مفتاح IndexNow غائب أو لا يطابق اسمه')

console.log(`صفحات HTML: ${rows.length} (منها 404.html)`)
console.log(`بيانات منظَّمة خاصة بالصفحة: ${real.filter(r => r.ld).length} من ${real.length} (المفهرسة: ${indexable.filter(r => r.ld).length} من ${indexable.length})`)
for (const n of notes) console.log(`ℹ ${n}`)
if (!issues.length) { console.log('✔ لا مخالفات'); process.exit(0) }
for (const [label, list] of issues) console.log(`✖ ${label} (${list.length}):\n   ` + (process.env.ALL ? list : list.slice(0, 12)).join('\n   '))
process.exit(1)
