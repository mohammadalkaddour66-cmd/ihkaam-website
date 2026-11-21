/* ══════════════════════════════════════════════════════════════════
   التوليد المسبق للصفحات (SSG) — يعمل بعد `vite build` و`vite build --ssr`.

   المشكلة التي يحلّها (تقرير التحليل ISS-01…08، 9 نوفمبر 2026):
   كل مسارٍ كان يُعيد قشرةً فارغة من 4 كيلوبايت، فلا يرى الزاحفُ الذي لا
   يشغّل JavaScript — روبوتاتُ الذكاء الاصطناعي، ومعاينةُ واتساب وتيليغرام —
   عنواناً ولا نصاً ولا رابطاً. الآن لكل مسارٍ ملفُّ HTML يحمل نصَّ الصفحة
   كاملاً وعنوانها ووصفها ورابطها المعياري وبياناتها المنظَّمة.

   ما يفعله:
     ١) يُصيّر كل مسارٍ عبر entry-server.jsx (React 19).
     ٢) يحقن الوسوم التي سجّلها PageMeta وأكملها finalizeMeta في <head>.
     ٣) يكتب dist/<المسار>.html، و dist/404.html (صفحة 404 حقيقية).
     ٤) يولّد dist/sitemap.xml من الصفحات المفهرسة فقط، بتاريخ تعديلٍ يتبع
        تغيّر محتوى الصفحة نفسها (scripts/sitemap-lastmod.json).
     ٥) يولّد dist/llms.txt من قائمة المسارات نفسها (ISS-23).

   لماذا about.html لا about/index.html (ISS-02 و ISS-14):
   الرابط المعياري وروابط الخريطة بلا شرطة ختامية. و Cloudflare (Pages
   و Workers Static Assets) يخدم about.html على /about ويحوّل /about/ إليه
   بتحويلٍ دائم، أما about/index.html فيخدمه على /about/ ويحوّل /about
   إليه — أي أن الرابط المعياري نفسه كان سيصير تحويلاً. الملف المسطّح
   يجعل النسخة بلا شرطة هي الأصل، والنسخة بالشرطة تتحوّل إليها.

   الفشل مرتفع الصوت عمداً: أيّ مسارٍ يتعذّر تصييره يوقف البناء، فلا
   يُنشَر موقعٌ نصفُه قشرةٌ فارغة دون أن يعلم أحد. (لا يُكتَب شيءٌ في
   dist قبل أن تنجح كل المسارات.)
   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { makeCriticalCss } from './critical-css.mjs'

const ROOT     = path.resolve(import.meta.dirname, '..')
const DIST     = path.join(ROOT, 'dist')
const SSR      = path.join(ROOT, 'dist-ssr', 'entry-server.js')
const ORIGIN   = 'https://ihkaam.app'
const OG_IMAGE = `${ORIGIN}/og-cover.jpg`

/* على جهازك المتغيّرات في .env؛ على Cloudflare تأتي من إعدادات المشروع. */
const envFile = path.join(ROOT, '.env')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const log  = (...a) => console.log('[prerender]', ...a)
const esc  = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/index.html غير موجود — شغّل vite build أولاً')
if (!fs.existsSync(SSR)) throw new Error('dist-ssr/entry-server.js غير موجود — شغّل vite build --ssr أولاً')

/* القالب النقيّ: dist/index.html بعد vite build جذرُه فارغ. وبعد تشغيلٍ سابق
   للسكربت يصير جذرُه مملوءاً بالرئيسية، فيُحفظ القالب النقيّ في dist-ssr أول
   مرة ويُقرأ منه — فيبقى السكربت آمناً حين يُعاد تشغيله دون إعادة البناء. */
const TEMPLATE_COPY = path.join(ROOT, 'dist-ssr', 'template.html')
const distIndex = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
let template
if (distIndex.includes('<div id="root"></div>')) {
  template = distIndex
  fs.writeFileSync(TEMPLATE_COPY, template)
} else if (fs.existsSync(TEMPLATE_COPY)) {
  template = fs.readFileSync(TEMPLATE_COPY, 'utf8')
} else {
  throw new Error('dist/index.html مُصيَّر مسبقاً ولا قالب نقيّ محفوظ — أعد vite build')
}
const { render, getRoutes, getSiteOutline } = await import(pathToFileURL(SSR).href)

/* ── الأنماط الحرجة (ISS-31) ──
   الورقة الكاملة لا تحجب الرسم في الصفحات المولَّدة: قواعد الصفحة نفسها في
   <style> بالرأس، والورقة الكاملة media="print" يقلبها main.jsx إلى all.
   التفاصيل في scripts/critical-css.mjs. صفحات التطبيق (الإدارة والدفع) تُرسم
   في المتصفح من الصفر فتبقى الورقة عندها حاجبةً كما هي. */
const CSS_LINK = /<link\s+rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/
const cssHref  = template.match(CSS_LINK)?.[1]
if (!cssHref) throw new Error('رابط ورقة الأنماط غير موجود في القالب')
const criticalFor = makeCriticalCss(fs.readFileSync(path.join(DIST, cssHref), 'utf8'))
function inlineCss(page, body) {
  const css = criticalFor(body).replace(/<\/style/gi, '<\\/style')
  return page.replace(CSS_LINK, (link) => [
    `<style data-critical>${css}</style>`,
    link.replace(/>$/, ' media="print" data-full-css>'),
    `<noscript>${link}</noscript>`,
  ].join('\n    '))
}

/* ── أرقام الصفحة الرئيسية: تُخبز في HTML لتظهر القيم الحقيقية قبل أول جلب ── */
async function fetchStats() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const base = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
    const res = await fetch(`${base}/rest/v1/rpc/get_public_landing_stats`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Content-Profile': 'public' },
      body: '{}',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data[0] : data
  } catch (err) {
    log('تعذّر جلب الأرقام الحيّة، تُترك الأرقام لتُجلب في المتصفح:', err.message)
    return null
  }
}
const stats = await fetchStats()
/* المعاهد المفعّلة (migration 20261119): تُجلب إن طُبّقت الدالة، وإلا تبقى
   لقطة src/config/activeInstitutes.js */
async function fetchActiveIds() {
  const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const base = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
    const res = await fetch(`${base}/rest/v1/rpc/get_active_institute_ids`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!res.ok) return null
    const rows = await res.json()
    return Array.isArray(rows) ? rows.map(r => r.institute_id) : null
  } catch { return null }
}
const activeIds = await fetchActiveIds()
/* أرقام القرآن (migration 20261119b): ختمات، صفحات يومية، نمو شهري — للمعاهد المفعّلة */
async function fetchQuranStats() {
  const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const base = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
    const res = await fetch(`${base}/rest/v1/rpc/get_public_quran_stats`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Content-Profile': 'public' },
      body: '{}',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    log('تعذّر جلب أرقام القرآن:', err.message)
    return null
  }
}
const quranStats = await fetchQuranStats()
if (stats && quranStats) stats.quran = quranStats
/* المعاهد الشريكة (قرار المالك 2026-11-19): كل معهدٍ عمل شهراً فأكثر ولو ترك —
   «اسمه كان شريك». تأتي من get_public_quran_stats أولاً، وإلا من الدالة القديمة. */
const partnerIds = Array.isArray(quranStats?.ids) && quranStats.ids.length ? quranStats.ids : activeIds
if (stats && partnerIds?.length) stats.active_ids = partnerIds
if (partnerIds?.length) globalThis.__ACTIVE_IDS__ = partnerIds
/* تاريخ البناء يُخبز مع الأرقام: «آخر تحديث» في الواجهة يقرؤه (ISS-41). */
if (stats) stats.updated_at = new Date().toISOString().slice(0, 10)
if (stats) globalThis.__LANDING_STATS_RAW__ = stats

/* ── لقطات الهيرو: تُخبز في الرئيسية مع preload للأولى (ISS-25) ──
   الهيرو كان يرسم إطاراً فارغاً حتى يُقلع الـJS ثم يسأل قاعدة البيانات عن
   صوره، فأكبر عنصر مرئي ينتظر سلسلة HTML ← JS ← Supabase ← صورة. الآن
   القائمة في الصفحة نفسها، والصورة الأولى في HTML ومعها preload.
   نفس استعلامَي HeroSection.jsx (صور الحاسوب وصور الهاتف كلٌّ على حدة). */
async function fetchHeroShots() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const base = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
    const phoneCat = encodeURIComponent('هاتف')
    const q = (filter) => fetch(
      `${base}/rest/v1/gallery_items?select=id,image_url,title,category&is_active=eq.true&category=${filter}&order=order_index.asc&limit=8`,
      { headers: { apikey: key, 'Accept-Profile': 'public' } },
    ).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    const [laptop, phone] = await Promise.all([q(`neq.${phoneCat}`), q(`eq.${phoneCat}`)])
    if (!laptop.length && !phone.length) return null
    return { laptop, phone }
  } catch (err) {
    log('تعذّر جلب لقطات الهيرو، تُترك لتُجلب في المتصفح:', err.message)
    return null
  }
}
const heroShots = await fetchHeroShots()
if (heroShots) globalThis.__HERO_SHOTS__ = heroShots

/* ── حقن الوسوم في القالب ──
   كل ما يخصّ الصفحة الواحدة يُنزَع من القالب ثم يُكتب من وسومها، فلا يبقى
   في أيّ صفحةٍ عنوانُ الرئيسية أو وصفها أو رابطها (ISS-05/06/08). */
const STRIP = [
  /<title>[\s\S]*?<\/title>\s*/i,
  /<meta\s+name="description"[^>]*>\s*/i,
  /<meta\s+name="keywords"[^>]*>\s*/i,
  /<link\s+rel="canonical"[^>]*>\s*/i,
  /<meta\s+property="og:(title|description|url|type|image)"[^>]*>\s*/gi,
  /<meta\s+name="twitter:(title|description|image)"[^>]*>\s*/gi,
]
/* أبعاد صورة المشاركة ونصّها البديل في القالب تصف og-cover.jpg وحدها. */
const STRIP_COVER_DETAILS = /<meta\s+property="og:image:(width|height|alt)"[^>]*>\s*/gi

const ldScript = (obj, attrs) =>
  `<script type="application/ld+json" ${attrs}>${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

function buildPage(htmlBody, meta) {
  let out = template
  for (const re of STRIP) out = out.replace(re, '')
  if (meta.image && meta.image !== OG_IMAGE) out = out.replace(STRIP_COVER_DETAILS, '')

  const m = meta
  const tags = [
    m.title       && `<title>${esc(m.title)}</title>`,
    m.description && `<meta name="description" content="${esc(m.description)}" />`,
    m.noindex     && `<meta name="robots" content="noindex, follow" />`,
    m.url         && `<link rel="canonical" href="${esc(m.url)}" />`,
    m.title       && `<meta property="og:title" content="${esc(m.title)}" />`,
    m.description && `<meta property="og:description" content="${esc(m.description)}" />`,
    m.url         && `<meta property="og:url" content="${esc(m.url)}" />`,
    m.type        && `<meta property="og:type" content="${esc(m.type)}" />`,
    m.image       && `<meta property="og:image" content="${esc(m.image)}" />`,
    /* غلاف المقال (make-og-covers.mjs) 1200×630 مثل الصورة العامة، ونصّه
       البديل يسمّي المقال (ISS-08). القالب يحمل تفاصيل الصورة العامة. */
    m.image && m.image !== OG_IMAGE && m.imageAlt && [
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />',
      `<meta property="og:image:alt" content="${esc(m.imageAlt)}" />`,
      `<meta name="twitter:image:alt" content="${esc(m.imageAlt)}" />`,
    ].join('\n    '),
    m.title       && `<meta name="twitter:title" content="${esc(m.title)}" />`,
    m.description && `<meta name="twitter:description" content="${esc(m.description)}" />`,
    m.image       && `<meta name="twitter:image" content="${esc(m.image)}" />`,
    /* data-ssr: علامةٌ يقرؤها PageMeta في المتصفح فلا يعيد كتابة <head> المولَّد. */
    m.jsonLd      && ldScript(m.jsonLd, 'data-page-ld data-ssr'),
    /* الأرقام الحيّة كتلةُ بيانات لا سكربت: type="application/json" لا يُنفَّذ،
       فلا تحجبه سياسة CSP حين تُفعَّل (ISS-34). تُقرأ في المتصفح هكذا:
       JSON.parse(document.getElementById('landing-stats').textContent) */
    stats         && `<script type="application/json" id="landing-stats">${JSON.stringify(stats).replace(/</g, '\\u003c')}</script>`,
    /* الهيرو (الرئيسية وحدها): قائمة لقطاته كتلةَ بيانات، و preload لأول صورة
       بحسب الشاشة. يسجّلها HeroSection أثناء التصيير، فلا تظهر إلا حيث يُرسم. */
    m.heroShots   && `<script type="application/json" id="hero-shots">${JSON.stringify(m.heroShots).replace(/</g, '\\u003c')}</script>`,
    ...(m.preloadImages || []).map((img) => `<link rel="preload" as="image" href="${esc(img.href)}"${img.media ? ` media="${esc(img.media)}"` : ''} fetchpriority="high" />`),
  ].filter(Boolean).join('\n    ')

  out = out.replace(/(<meta\s+name="viewport"[^>]*>)/i, `$1\n    ${tags}`)
  out = out.replace('<div id="root"></div>', `<div id="root">${htmlBody}</div>`)
  return inlineCss(out, htmlBody)
}

/* ── أبعاد الصور (ISS-18) ──
   كل <img> محلي بلا width/height يأخذ أبعاد ملفه الحقيقية، فيحجز المتصفح
   مكانه قبل التحميل ولا يزيح التخطيط (CLS). المكوّنات الجديدة تُنسى فيها
   الأبعاد بسهولة، فالضمان هنا في البناء لا في كل مكوّن. لا أثر بصري:
   preflight في Tailwind يجعل height:auto، والأصناف (w-6، h-full…) تتقدّم
   على السمتين. */
const { default: sharp } = await import('sharp')
const dimCache = new Map()
async function imgSize(src) {
  if (dimCache.has(src)) return dimCache.get(src)
  let size = null
  const file = path.join(DIST, decodeURIComponent(src.split(/[?#]/)[0]).replace(/^\//, ''))
  if (fs.existsSync(file)) {
    try { const m = await sharp(file).metadata(); if (m.width && m.height) size = [m.width, m.height] } catch { /* ليست صورة نقطية */ }
  }
  dimCache.set(src, size)
  return size
}
async function addImgDims(html) {
  const tags = [...new Set(html.match(/<img\b[^>]*>/g) || [])]
  for (const tag of tags) {
    if (/\swidth=/.test(tag) && /\sheight=/.test(tag)) continue
    const src = tag.match(/\ssrc="(\/[^"]+)"/)?.[1]
    if (!src) continue
    const size = await imgSize(src)
    if (!size) continue
    const fixed = tag.replace(/\s(width|height)="[^"]*"/g, '').replace(/^<img\b/, `<img width="${size[0]}" height="${size[1]}"`)
    html = html.split(tag).join(fixed)
  }
  return html
}

/* ── التصيير ── */
const routes   = getRoutes()
const rendered = []
const failures = []

for (const r of routes) {
  try {
    const { html: raw, meta } = await render(r.path)
    if (!raw || raw.length < 500) throw new Error('HTML فارغ أو قصير جداً')
    const html = await addImgDims(raw)
    if (!meta.title || !meta.description) throw new Error(`وسوم ناقصة (title=${!!meta.title}, description=${!!meta.description})`)
    if (meta.url !== ORIGIN + (r.path === '/' ? '/' : r.path)) throw new Error(`رابط معياري غير متوقَّع: ${meta.url}`)
    rendered.push({ route: r, page: buildPage(html, meta), meta })
  } catch (err) {
    failures.push({ path: r.path, error: err })
  }
}

let notFound
try {
  const { html, meta } = await render('/__not-found__')
  notFound = buildPage(await addImgDims(html),{ ...meta, noindex: true, url: undefined, jsonLd: undefined })
} catch (err) {
  failures.push({ path: '/__not-found__ (404.html)', error: err })
}

if (failures.length) {
  console.error(`\n[prerender] فشل تصيير ${failures.length} من ${routes.length + 1} مسار:`)
  for (const f of failures) console.error(`  ✖ ${f.path}\n     ${f.error?.stack?.split('\n').slice(0, 3).join('\n     ') || f.error}`)
  process.exit(1)
}

/* ── الكتابة (بعد نجاح الجميع) ── */
for (const { route, page } of rendered) {
  const rel  = route.path.replace(/^\//, '')
  const file = route.path === '/' ? path.join(DIST, 'index.html') : path.join(DIST, `${rel}.html`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, page)

  /* بقايا التخطيط القديم (<المسار>/index.html) من تشغيلٍ سابق دون إعادة بناء:
     لو بقيت لخدمها الخادم على النسخة ذات الشرطة الختامية. */
  if (route.path !== '/') {
    const stale = path.join(DIST, rel, 'index.html')
    if (fs.existsSync(stale)) {
      fs.rmSync(stale)
      const dir = path.dirname(stale)
      if (!fs.readdirSync(dir).length) fs.rmdirSync(dir)
    }
  }
}
fs.writeFileSync(path.join(DIST, '404.html'), notFound)

/* ── مسارات التطبيق (ISS-03) ──
   لوحة الإدارة والدفع تطبيقٌ عميلي لا يُصيَّر مسبقاً. ولأن _redirects لم تعد
   فيه قاعدةٌ شاملة تردّ index.html على كل مسار (وهي ما كان يجعل الروابط
   الوهمية تردّ 200)، يلزم كلَّ مسارٍ منها ملفٌّ حقيقي: القالب بجذرٍ فارغ
   يُقلع فيه التطبيق، بلا وصف ولا رابط معياري، وموسومٌ noindex.
   مسارٌ جديد لا يُولَّد مسبقاً يُضاف هنا، لا في _redirects. */
const CLIENT_ONLY = ['/admin', '/admin/login', '/checkout']
let shell = template
for (const re of STRIP) shell = shell.replace(re, '')
shell = shell
  .replace(STRIP_COVER_DETAILS, '')
  .replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, '')
  .replace(/(<meta\s+name="viewport"[^>]*>)/i, `$1\n    <title>إحكام</title>\n    <meta name="robots" content="noindex, nofollow" />`)
for (const p of CLIENT_ONLY) {
  const file = path.join(DIST, `${p.replace(/^\//, '')}.html`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, shell)
}

/* ── تاريخ آخر تعديل (ISS-13) ──
   التاريخ يتبع محتوى الصفحة لا تاريخَ البناء: يُحسب لكل صفحةٍ بصمةٌ من نصّها
   المصيَّر (ما بين <main> والتذييل، بلا أرقام — فالأرقام الحيّة تتغيّر كل
   يوم دون أن تتغيّر الصفحة)، وتُحفظ مع تاريخها في scripts/sitemap-lastmod.json.
   إن بقيت البصمة كما هي بقي التاريخ، وإن تغيّرت صار التاريخُ يومَ البناء.
   والمقال يأخذ تاريخه المكتوب في بياناته (updatedAt ثم date) لا البصمة.

   الملف يُودَع في git مع التعديلات: هو ذاكرة الخريطة بين بناءٍ وآخر. وإن
   غاب في بيئة بناءٍ آلية (CI) حُذف lastmod كله — فلا تاريخَ أصدقُ من
   تاريخٍ يجعل كل الصفحات «معدَّلة اليوم» عند كل نشر. */
const LASTMOD_FILE = path.join(ROOT, 'scripts', 'sitemap-lastmod.json')
const today = new Date().toISOString().slice(0, 10)

function contentHash(page) {
  const start = page.indexOf('<main')
  const end   = page.lastIndexOf('<footer')
  const body  = page.slice(start < 0 ? page.indexOf('<div id="root">') : start, end < 0 ? undefined : end)
  const text  = body
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 16)
}

const hadManifest = fs.existsSync(LASTMOD_FILE)
const previous    = hadManifest ? JSON.parse(fs.readFileSync(LASTMOD_FILE, 'utf8')) : {}
const inCI        = Boolean(process.env.CI || process.env.CF_PAGES || process.env.WORKERS_CI || process.env.NETLIFY)
const trustDates  = hadManifest || !inCI

const indexable = rendered.filter(({ meta }) => !meta.noindex)
const manifest  = {}
for (const { route, page } of indexable) {
  const hash = contentHash(page)
  const prev = previous[route.path]
  /* المقال: تاريخه التحريري (updatedAt ثم date) هو lastmod دائماً — هو نفسه
     dateModified في BlogPosting، فتتّفق الخريطة والبيانات المنظَّمة، ولا يصير
     المقال «معدَّلاً اليوم» لأن قائمة «مقالات ذات صلة» حوله تغيّرت.
     غير المقال: البصمة نفسها ← التاريخ السابق؛ صفحةٌ أول مرة أو تغيّر نصُّها
     ← يوم البناء. (قبل هذا كان البذر لا يُقرأ إلا إن كان أحدث من اليوم،
     فخرجت الخريطة الأولى بتاريخٍ واحد لكل الصفحات.) */
  let lastmod
  if (route.seed && route.seed <= today) lastmod = route.seed
  else lastmod = prev && prev.hash === hash ? prev.lastmod : today
  manifest[route.path] = { hash, lastmod }
}
/* لا يُكتب الملف في CI: نسخته هناك تُرمى بعد البناء، والمرجع نسخةُ git. */
/* ولا في بناء SITE_TODAY: محاكاةٌ ليومٍ آخر لا تُسجَّل في ذاكرة الخريطة. */
if (!inCI && !process.env.SITE_TODAY) fs.writeFileSync(LASTMOD_FILE, JSON.stringify(manifest, null, 2) + '\n')

/* ── خريطة الموقع (ISS-11/12/13) ──
   كل صفحةٍ مصيَّرة غير موسومة بـnoindex تدخل الخريطة: الرئيسية والمنصة
   والميزات (ومنها التحليل الذكي) والمدونة ومركز المساعدة ومقالاته. */
const loc = (p) => ORIGIN + (p === '/' ? '/' : p)
const urls = indexable.map(({ route }) => [
  '  <url>',
  `    <loc>${loc(route.path)}</loc>`,
  trustDates ? `    <lastmod>${manifest[route.path].lastmod}</lastmod>` : null,
  `    <priority>${(route.priority ?? 0.5).toFixed(1)}</priority>`,
  '  </url>',
].filter(Boolean).join('\n'))
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
)

/* ── llms.txt (ISS-23) ──
   تعريفٌ قصير بالمنصة ثم روابط صفحاتها بعناوينها وأوصافها كما هي في الصفحات
   نفسها، فلا يذكر الملف صفحةً حُذفت ولا يغفل صفحةً أُضيفت. التعريف الثابت
   أعلاه يطابق public/llms.txt (النسخة التي تُخدَم لو لم يعمل هذا السكربت). */
const byPath  = new Map(indexable.map(r => [r.route.path, r.meta]))
const outline = getSiteOutline()
const bare    = (t) => t.replace(/\s*\|\s*إحكام\s*$/, '')
const link    = (p) => {
  const m = byPath.get(p)
  return m ? `- [${bare(m.title)}](${loc(p)}): ${m.description}` : null
}
const section = (title, paths) => {
  const lines = paths.map(link).filter(Boolean)
  return lines.length ? `## ${title}\n\n${lines.join('\n')}\n` : null
}

const staticLlms = fs.readFileSync(path.join(ROOT, 'public', 'llms.txt'), 'utf8')
const intro = staticLlms.split(/^## /m)[0].trimEnd()
const llms = [
  intro + '\n',
  section('الصفحات الرئيسية', ['/', '/ihkaam', '/request', '/about', '/contact', '/affiliate', '/tools', '/blog', '/help', '/terms', '/privacy']),
  section('أدوات مجانية (تعمل في المتصفح بلا تسجيل)', outline.tools || []),
  section('ميزات النظام', [...outline.core, ...outline.addons]),
  section('مقالات المدونة', outline.blog),
  section('شروحات مركز المساعدة', outline.help),
].filter(Boolean).join('\n')
fs.writeFileSync(path.join(DIST, 'llms.txt'), llms)

log(
  `تم: ${rendered.length} صفحة + 404.html + sitemap.xml (${urls.length} رابط${trustDates ? '' : '، بلا lastmod: ملف التواريخ غائب'}) + llms.txt` +
  (stats ? ' · أرقام حيّة مخبوزة' : ' · بلا أرقام حيّة'),
)
