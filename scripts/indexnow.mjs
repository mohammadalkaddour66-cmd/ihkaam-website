/* ══════════════════════════════════════════════════════════════════
   IndexNow — يُخبر Bing وYandex وNaver وSeznam بالروابط الجديدة أو المعدَّلة
   فور النشر بدل انتظار الزاحف (تقرير التحليل ISS-23).

   متى يُشغَّل: يدوياً بعد كل نشرٍ ناجح، وبعد أن يصير الموقع الجديد على
   ihkaam.app فعلاً (الخدمة تتحقق من ملف المفتاح على الموقع الحي):

     node scripts/indexnow.mjs                 كل روابط dist/sitemap.xml
     node scripts/indexnow.mjs --since 2026-11-13   ما تاريخ lastmod فيه ≥ هذا اليوم
     node scripts/indexnow.mjs --dry-run       يطبع ما سيُرسَل ولا يتصل بالشبكة
     node scripts/indexnow.mjs /blog/slug /help/login   روابط بعينها

   المفتاح: اسم الملف في public/ هو المفتاح نفسه ومحتواه كذلك
   (public/<key>.txt)، فيُقرأ من هناك ولا يُكتب في الكود. إن أردت تغييره
   فأنشئ ملفاً جديداً باسم المفتاح الجديد واحذف القديم.

   لا يعمل هذا السكربت أثناء البناء ولا يُستدعى منه.
   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs'
import path from 'node:path'

const ROOT   = path.resolve(import.meta.dirname, '..')
const ORIGIN = 'https://ihkaam.app'
const HOST   = new URL(ORIGIN).host
const ENDPOINT = 'https://api.indexnow.org/IndexNow'

const args   = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const sinceI = args.indexOf('--since')
const since  = sinceI >= 0 ? args[sinceI + 1] : null
const manual = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--since')

if (since && !/^\d{4}-\d{2}-\d{2}$/.test(since)) {
  console.error('صيغة --since يجب أن تكون YYYY-MM-DD')
  process.exit(1)
}

/* المفتاح: ملف public/<32 خانة سداسية>.txt يطابق محتواه اسمه. */
const keyFile = fs.readdirSync(path.join(ROOT, 'public'))
  .find(f => /^[0-9a-f]{8,128}\.txt$/i.test(f) &&
    fs.readFileSync(path.join(ROOT, 'public', f), 'utf8').trim() === f.replace(/\.txt$/, ''))
if (!keyFile) {
  console.error('لا ملف مفتاح صالح في public/ (اسمه <المفتاح>.txt ومحتواه المفتاح نفسه)')
  process.exit(1)
}
const key = keyFile.replace(/\.txt$/, '')

let urls
if (manual.length) {
  urls = manual.map(p => (p.startsWith('http') ? p : ORIGIN + (p.startsWith('/') ? p : '/' + p)))
} else {
  const sitemap = path.join(ROOT, 'dist', 'sitemap.xml')
  if (!fs.existsSync(sitemap)) {
    console.error('dist/sitemap.xml غير موجود: شغّل npm run build أولاً')
    process.exit(1)
  }
  const xml = fs.readFileSync(sitemap, 'utf8')
  urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(m => ({
      loc: m[1].match(/<loc>([^<]+)<\/loc>/)?.[1],
      lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
    }))
    .filter(u => u.loc && (!since || (u.lastmod && u.lastmod >= since)))
    .map(u => u.loc)
}

urls = [...new Set(urls)].filter(u => new URL(u).host === HOST)
if (!urls.length) {
  console.log('لا روابط للإرسال.')
  process.exit(0)
}

console.log(`${urls.length} رابط · المفتاح ${key.slice(0, 6)}… · ${dryRun ? 'تجربة بلا اتصال' : ENDPOINT}`)
if (dryRun) {
  for (const u of urls) console.log('  ' + u)
  process.exit(0)
}

/* الحدّ 10,000 رابط في الطلب الواحد؛ موقعنا أقل بكثير لكن التقطيع مجاني. */
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000)
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `${ORIGIN}/${key}.txt`, urlList: batch }),
  })
  /* 200 تمّ الاستلام، 202 استُلم والمفتاح قيد التحقق، 422/403 مفتاح أو روابط غير مطابقة. */
  console.log(`  دفعة ${i / 10000 + 1}: HTTP ${res.status}${res.ok ? '' : ' — ' + (await res.text()).slice(0, 200)}`)
  if (!res.ok && res.status !== 202) process.exitCode = 1
}
