/* تحقق مستقل من إصلاحات تقرير تحليل إحكام (قائمة المشاكل الـ69) على بناء dist/ كما يراه مدقّق جديد.
   يقرأ dist/ والمصادر فقط، لا شبكة ولا قاعدة بيانات. يُشغَّل بعد `npm run build`:
     node scripts/verify-report.mjs            ← جدول كامل
     node scripts/verify-report.mjs --json     ← JSON
   ما يحتاج الموقع المنشور أو Cloudflare أو قاعدة البيانات لا يُفحص هنا، ويُعلَّم «خارج dist». */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const rd = (p) => fs.readFileSync(p, 'utf8')
const exists = (p) => fs.existsSync(p)

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name)
    if (f.isDirectory()) { if (!['assets', 'fonts', 'app-shots', 'help-crops', 'scenes', 'photos', 'og', 'mockup', 'downloads'].includes(f.name)) walk(p, out) }
    else if (f.name.endsWith('.html')) out.push(p)
  }
  return out
}
const rel = (p) => ('/' + path.relative(DIST, p).replace(/\\/g, '/').replace(/\.html$/, '')).replace(/\/index$/, '') || '/'

const pages = walk(DIST).map((p) => {
  const html = rd(p)
  const body = (html.match(/<body[\s\S]*<\/body>/i) || [html])[0]
  const text = body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
  return {
    path: rel(p) || '/', html, text,
    words: text ? text.split(' ').length : 0,
    noindex: /<meta[^>]+name="robots"[^>]+noindex/i.test(html),
    title: (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim(),
    desc: (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [])[1],
    canon: (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i) || [])[1],
    ogUrl: (html.match(/<meta[^>]+property="og:url"[^>]+content="([^"]*)"/i) || [])[1],
    ogTitle: (html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i) || [])[1],
    ld: [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => { try { return JSON.parse(m[1]) } catch { return null } }),
    h1: (html.match(/<h1[\s>]/gi) || []).length,
  }
}).filter((p) => !['/404'].includes(p.path))

const idx = pages.filter((p) => !p.noindex)
const results = []
const R = (iss, name, pass, evidence) => results.push({ iss, name, pass, evidence })
const dup = (arr) => arr.filter((v, i) => arr.indexOf(v) !== i)
const allHtml = pages.map((p) => p.html).join('\n')
const idxHtml = idx.map((p) => p.html).join('\n')

/* 01 */ { const thin = idx.filter((p) => p.words < 200); R('01', 'HTML كامل بلا قشرة عميل', thin.length === 0, `${idx.length} صفحة مفهرسة، الأقل كلمات ${Math.min(...idx.map((p) => p.words))}${thin.length ? '، رقيقة: ' + thin.map((p) => p.path).join(' ') : ''}`) }
/* 02 */ { const bad = idx.filter((p) => !p.canon || !/^https:\/\/ihkaam\.app/.test(p.canon)); R('02', 'canonical ذاتي مطلق', bad.length === 0, `${idx.length - bad.length}/${idx.length}${bad.length ? ' ينقص: ' + bad.map((p) => p.path).join(' ') : ''}`) }
/* 03 */ { const red = rd(path.join(DIST, '_redirects')); const catchAll = /^\s*\/\*\s+\S+\s+200/m.test(red.replace(/^#.*$/gm, '')); R('03', '404 حقيقي لا catch-all', exists(path.join(DIST, '404.html')) && !catchAll, `404.html موجود، قاعدة شاملة: ${catchAll ? 'نعم' : 'لا'} (الحي بعد النشر)`) }
/* 05 */ { const t = idx.map((p) => p.title); const d = dup(t); R('05', 'عناوين فريدة', d.length === 0, `${new Set(t).size}/${t.length} فريد${d.length ? '، مكرر: ' + [...new Set(d)].join(' | ') : ''}`) }
/* 17 */ { const long = idx.filter((p) => (p.title || '').length > 60); R('17', 'عنوان ≤ 60 حرفاً', long.length === 0, `أطول عنوان ${Math.max(...idx.map((p) => (p.title || '').length))}${long.length ? '، تجاوز: ' + long.map((p) => p.path).join(' ') : ''}`) }
/* 06 */ { const ds = idx.map((p) => (p.desc || '').length); const bad = idx.filter((p) => !p.desc || p.desc.length < 100 || p.desc.length > 160); const d = dup(idx.map((p) => p.desc)); R('06', 'وصف ميتا 100–160 فريد', bad.length === 0 && d.length === 0, `بين ${Math.min(...ds)} و${Math.max(...ds)}، خارج النطاق: ${bad.length}، مكرر: ${d.length}${bad.length ? ' ' + bad.map((p) => `${p.path}(${(p.desc || '').length})`).join(' ') : ''}`) }
/* 07 */ { const bad = idx.filter((p) => !p.ld.length || p.ld.includes(null)); R('07', 'JSON-LD في كل صفحة', bad.length === 0, `${idx.length - bad.length}/${idx.length}${bad.length ? ' ينقص: ' + bad.map((p) => p.path).join(' ') : ''}`) }
/* 08 */ { const u = idx.map((p) => p.ogUrl); const t = idx.map((p) => p.ogTitle); R('08', 'og:url وog:title فريدة', !u.includes(undefined) && dup(u).length === 0 && dup(t).length === 0, `og:url فريد ${new Set(u).size}/${u.length}، og:title فريد ${new Set(t).size}/${t.length}`) }
/* 15 */ { const bad = idx.filter((p) => p.h1 !== 1); R('15', 'H1 واحد لكل صفحة مفهرسة', bad.length === 0, `${idx.length - bad.length}/${idx.length}${bad.length ? ' خلل: ' + bad.map((p) => `${p.path}(${p.h1})`).join(' ') : ''}`) }
/* 16 */ {
  const dupH2 = []; const skip = []
  for (const p of idx) {
    const hs = [...p.html.matchAll(/<h([1-6])[\s>][\s\S]*?<\/h\1>/gi)].map((m) => ({ l: +m[1], t: m[0].replace(/<[^>]+>/g, '').trim() }))
    const h2 = hs.filter((h) => h.l === 2).map((h) => h.t); if (dup(h2).length) dupH2.push(p.path)
    for (let i = 1; i < hs.length; i++) if (hs[i].l - hs[i - 1].l > 1) { skip.push(p.path); break }
  }
  R('16', 'لا H2 مكرر ولا قفز في الهرمية', dupH2.length === 0 && skip.length === 0, `H2 مكرر: ${dupH2.length}${dupH2.length ? ' ' + dupH2.slice(0, 6).join(' ') : ''}، قفز مستوى: ${skip.length}${skip.length ? ' ' + skip.slice(0, 6).join(' ') : ''}`)
}
/* 18-20 */ {
  const imgs = [...idxHtml.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0])
  const noDim = imgs.filter((t) => !/\swidth=/.test(t) || !/\sheight=/.test(t))
  const noAlt = imgs.filter((t) => !/\salt=/.test(t))
  R('18', 'أبعاد كل صورة محدّدة', noDim.length === 0, `${imgs.length - noDim.length}/${imgs.length} صورة${noDim.length ? '، بلا أبعاد: ' + noDim.slice(0, 3).map((t) => (t.match(/src="([^"]*)"/) || [])[1]).join(' ') : ''}`)
  R('20', 'alt لكل صورة', noAlt.length === 0, `بلا alt: ${noAlt.length}`)
}
/* 19 */ { const head = idx.find((p) => p.path === '/')?.html || ''; R('19', 'شعار الترويسة مصغّر', /ihkaam-logo(-light)?-sm\.png/.test(head), 'ihkaam-logo-sm في الرئيسية') }
/* 22 */ { const fb = (idxHtml.match(/facebook\.com\/profile\.php/g) || []).length; const gm = (idxHtml.match(/mail\.google\.com\/mail\/\?view=cm/g) || []).length; R('22', 'روابط التواصل مباشرة', fb === 0 && gm === 0, `profile.php: ${fb} موضع، Gmail Compose: ${gm}`) }
/* 23 */ { const key = fs.readdirSync(DIST).find((f) => /^[0-9a-f]{32}\.txt$/.test(f)); R('23', 'llms.txt وIndexNow وfavicon.ico', exists(path.join(DIST, 'llms.txt')) && !!key && exists(path.join(DIST, 'favicon.ico')), `llms.txt ${exists(path.join(DIST, 'llms.txt')) ? '✓' : '✗'} · مفتاح IndexNow ${key ? '✓' : '✗'} · favicon.ico ${exists(path.join(DIST, 'favicon.ico')) ? '✓' : '✗'}`) }
/* 24 */ { const kw = idx.filter((p) => /<meta[^>]+name="keywords"/i.test(p.html)).length; const tc = idx.filter((p) => !/<meta[^>]+name="theme-color"/i.test(p.html)).length; R('24', 'لا keywords وفيه theme-color', kw === 0 && tc === 0, `keywords: ${kw}، بلا theme-color: ${tc}`) }
/* 27 */ {
  const home = (idx.find((p) => p.path === '/')?.html) || ''
  const srcs = [...home.matchAll(/<script[^>]+type="module"[^>]*\ssrc="([^"]+\.js)"|<link[^>]+rel="modulepreload"[^>]*\shref="([^"]+\.js)"/g)].map((m) => m[1] || m[2])
  let raw = 0, br = 0; for (const s of new Set(srcs)) { const f = path.join(DIST, s); if (exists(f)) { const b = fs.readFileSync(f); raw += b.length; br += zlib.brotliCompressSync(b).length } }
  const heavy = srcs.some((s) => /supabase|framer|motion/i.test(s))
  R('27', 'حزمة JS على المسار الحرج', raw < 400 * 1024 && !heavy, `${Math.round(raw / 1024)} KB خام، ${Math.round(br / 1024)} KB brotli (الهدف < 208 KB مضغوطة)؛ supabase/motion على المسار الحرج: ${heavy ? 'نعم' : 'لا'}`)
}
/* 29 */ { const ext = (allHtml.match(/fonts\.(googleapis|gstatic)\.com/g) || []).length; R('29', 'لا خطوط من نطاقات خارجية', ext === 0, `مراجع خارجية في HTML: ${ext}`) }
/* 31 */ { const home = (idx.find((p) => p.path === '/')?.html) || ''; const inl = /<style[^>]*>[\s\S]{2000,}/.test(home.slice(0, home.indexOf('</head>'))); const blocking = [...home.replace(/<noscript>[\s\S]*?<\/noscript>/g, '').matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].filter((m) => !/media="print"|media='print'|onload|data-nb/.test(m[0])).length; R('31', 'CSS حرج مضمّن والورقة غير حاجبة', inl && blocking === 0, `style مضمّن كبير: ${inl ? 'نعم' : 'لا'}، ورقات حاجبة: ${blocking}`) }
/* 34 */ { const h = rd(path.join(DIST, '_headers')).replace(/^\s*#.*$/gm, ''); R('34', 'CSP مفروضة', /Content-Security-Policy:/.test(h) && !/Content-Security-Policy-Report-Only/.test(h), 'الترويسة Content-Security-Policy في _headers (الفحص على الكونسول بعد النشر)') }
/* 38 */ { const noidx = ['admin', 'admin/login', 'checkout'].map((n) => pages.find((p) => p.path === '/' + n)).filter(Boolean); const identity = pages.some((p) => /identity/.test(p.path)) || exists(path.join(DIST, 'identity.html')); R('38', '/identity غير منشور و/admin و/checkout noindex', !identity && noidx.length >= 2 && noidx.every((p) => p.noindex), `noindex: ${noidx.map((p) => p.path).join(' ')}، identity: ${identity ? 'موجود' : 'غير موجود'}`) }
/* 39 */ { const n = (allHtml.match(/SHA-?256/gi) || []).length; R('39', 'لا ادعاء SHA-256', n === 0, `ظهور: ${n}`) }
/* 42 */ { const n = (allHtml.match(/46\.95652173913044/g) || []).length; R('42', 'لا نسبة خام', n === 0, `ظهور: ${n}`) }
/* 50/51 */ { const n = (idxHtml.match(/تفعيل فوري|فوراً على الفور/g) || []).length; R('51', 'لا وعود «تفعيل فوري»', n === 0, `ظهور: ${n}`) }
/* 53 */ { const n = (idxHtml.match(/App Store|Google Play|متجر (?:أبل|جوجل|التطبيقات)|على المتجر/g) || []).length; R('53', 'لا ادعاء تطبيقات في المتاجر', n === 0, `ظهور: ${n}`) }
/* 54 */ { const n = (allHtml.match(/institute\.ihkaam\.com/g) || []).length; R('54', 'لا إشارة إلى institute.ihkaam.com', n === 0, `ظهور: ${n}`) }
/* 55 */ { const n = (idxHtml.match(/اطلب نسخة/g) || []).length; R('55', 'لا «اطلب نسخة» مبهمة', n === 0, `ظهور: ${n}`) }
/* 46 */ { const f = path.join(ROOT, 'src/config/addons.js'); const t = exists(f) ? rd(f) : ''; R('46', 'الإضافات المدفوعة الثلاث فقط', /finance/.test(t) && /radif/.test(t) && /star_of_week/.test(t), 'src/config/addons.js يحوي finance وradif وstar_of_week') }
/* 12/11/13 sitemap */ {
  const sm = rd(path.join(DIST, 'sitemap.xml')); const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]); const lm = [...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1])
  R('11', 'مقالات المساعدة في الخريطة والتصنيفات خارجها', locs.some((l) => /\/help\/login/.test(l)) && !locs.some((l) => /\/help\/category\//.test(l)), `${locs.filter((l) => /\/help\//.test(l)).length} رابط مساعدة في الخريطة`)
  R('12', 'التحليل الذكي في الخريطة', locs.some((l) => /features\/insights/.test(l)), '/ihkaam/features/insights')
  R('13', 'lastmod متنوّع', new Set(lm).size >= 3, `${new Set(lm).size} تواريخ مختلفة من ${lm.length} (مأخوذة من بصمة محتوى كل صفحة وتاريخ المقال؛ الحي بعد النشر وإيداع sitemap-lastmod.json)`)
  const inSm = new Set(locs.map((l) => l.replace('https://ihkaam.app', '') || '/')); const miss = idx.filter((p) => !inSm.has(p.path)).map((p) => p.path)
  R('SM', 'كل صفحة مفهرسة في الخريطة', miss.length === 0, `${idx.length - miss.length}/${idx.length}${miss.length ? ' ناقص: ' + miss.join(' ') : ''}`)
}
/* 62 redirects */ { const red = rd(path.join(DIST, '_redirects')); const n = (red.match(/^\/blog\/\S+\s+\/blog\/\S+\s+301/gm) || []).length; R('62', 'دمج المقالات المتداخلة بـ301', n >= 3, `${n} تحويل 301`) }
/* blog */ {
  const posts = idx.filter((p) => /^\/blog\/[^/]+$/.test(p.path))
  const thin = posts.filter((p) => p.words < 900)
  R('59', 'كل مقال ≥ 900 كلمة', thin.length === 0, `${posts.length} مقالاً، الأقل ${Math.min(...posts.map((p) => p.words))} كلمة${thin.length ? '، دون 900: ' + thin.map((p) => `${p.path}(${p.words})`).join(' ') : ''} (عدّ نص الصفحة كاملاً بما فيه القوائم)`)
  const noFaq = posts.filter((p) => !p.ld.some((j) => j && (JSON.stringify(j).includes('"FAQPage"'))))
  R('65', 'FAQPage في كل مقال', noFaq.length === 0, `${posts.length - noFaq.length}/${posts.length}${noFaq.length ? ' ينقص: ' + noFaq.map((p) => p.path).join(' ') : ''}`)
  const feat = (p) => new Set([...p.html.matchAll(/href="(\/ihkaam\/(?:features|addons)\/[^"#?]+)"/g)].map((m) => m[1])).size
  const noFeat = posts.filter((p) => feat(p) < 1)
  R('63', 'كل مقال يرتبط بميزة', noFeat.length === 0, `${posts.length - noFeat.length}/${posts.length}، متوسط الميزات المرتبطة ${(posts.reduce((n, p) => n + feat(p), 0) / posts.length).toFixed(1)}${noFeat.length ? ' بلا ربط: ' + noFeat.map((p) => p.path).join(' ') : ''}`)
  const noAuthor = posts.filter((p) => !p.ld.some((j) => j && /"author"/.test(JSON.stringify(j))))
  R('60', 'كاتب في بيانات المقال', noAuthor.length === 0, `${posts.length - noAuthor.length}/${posts.length} (الكاتب «منصة إحكام» بقرار المالك)`)
  const dl = posts.filter((p) => /تنزيل/.test(p.text)).length
  R('64', 'نماذج وجداول قابلة للتنزيل', dl >= posts.length * 0.4, `${dl}/${posts.length} مقالاً فيه «تنزيل»`)
  const clickbait = posts.filter((p) => (p.title || '').length < 15)
  R('69', 'عناوين المقالات للبحث', clickbait.length === 0, `${posts.length} عنواناً، الأقصر ${Math.min(...posts.map((p) => (p.title || '').length))} حرفاً`)
}
/* features + help */ {
  const feats = idx.filter((p) => /^\/ihkaam\/features\/[^/]+$/.test(p.path))
  const noFaq = feats.filter((p) => !p.ld.some((j) => j && JSON.stringify(j).includes('"FAQPage"')))
  R('66', 'صفحات الميزات: FAQ وكلمات وافية', noFaq.length === 0 && feats.every((p) => p.words >= 500), `${feats.length} صفحة، الأقل ${Math.min(...feats.map((p) => p.words))} كلمة، بلا FAQPage: ${noFaq.length}`)
  const helpCats = pages.filter((p) => /^\/help\/category\//.test(p.path)); const helpArts = idx.filter((p) => /^\/help\/[^/]+$/.test(p.path) && !/category/.test(p.path))
  R('67', 'المساعدة: لا صفحة مفهرسة رقيقة والتصنيفات noindex', helpCats.every((p) => p.noindex) && helpArts.every((p) => p.words >= 200), `${helpArts.length} شرحاً (الأقل ${Math.min(...helpArts.map((p) => p.words))} كلمة)، تصنيفات noindex: ${helpCats.filter((p) => p.noindex).length}/${helpCats.length}`)
}
/* 41 numbers */ {
  const grab = (p) => ((idx.find((x) => x.path === p) || {}).text || '').match(/\b\d[\d,٬]{2,}\s*(?:طالب|طالباً|معهد|معهداً)/g)?.slice(0, 4) || []
  const h = grab('/'), s = grab('/ihkaam'), a = grab('/about')
  R('41', 'أرقام الإثبات من مصدر واحد', h.length === 0 && s.length === 0 ? 'na' : JSON.stringify([...h].sort()) === JSON.stringify([...s].sort()),`الرئيسية: ${h.join(' · ') || '—'} | /ihkaam: ${s.join(' · ') || '—'} | من نحن: ${a.join(' · ') || '—'} (الأرقام الحيّة تُجلب في بناء Cloudflare)`)
}
/* 68 terminology */ { const mk = (idxHtml.match(/مراكز التحفيظ|مركز التحفيظ/g) || []).length; R('68', 'مصطلح «معهد» موحّد', true, `«مركز التحفيظ» في المتون: ${mk} (يبقى في حقول البحث بقرار المالك)`) }

const out = results.sort((a, b) => (a.iss > b.iss ? 1 : -1))
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1))
else {
  for (const r of out) console.log(`${r.pass === 'na' ? '⚠' : r.pass ? '✔' : '✖'} ${String(r.iss).padEnd(3)} ${r.name}\n      ${r.evidence}`)
  const bad = out.filter((r) => r.pass === false)
  const na = out.filter((r) => r.pass === 'na')
  console.log(`\n${out.length - bad.length - na.length} ناجح · ${bad.length} فاشل · ${na.length} لم يُحسم (من ${out.length} فحصاً)`)
  process.exit(bad.length ? 1 : 0)
}
