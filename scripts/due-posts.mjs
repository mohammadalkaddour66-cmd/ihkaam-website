/* ══════════════════════════════════════════════════════════════════
   مقالات حان موعدها ولم تظهر بعد على الموقع الحيّ. يعمل في
   .github/workflows/publish-scheduled.yml كل صباح، ويعمل يدوياً:

     node scripts/due-posts.mjs                 يطبع slugs المستحقة (فارغ = لا شيء)
     node scripts/due-posts.mjs --wait a b      ينتظر حتى تظهر a وb في الخريطة الحيّة
     node scripts/due-posts.mjs --dry-run       يطبع كل مقال وحالته، بلا شبكة
     SITE_TODAY=2026-12-08 node scripts/due-posts.mjs --dry-run   يحاكي يوماً آخر

   «مستحق»: live بقاعدة blog-schedule.mjs (ليس مسودة وتاريخه ≤ اليوم) ورابطه
   ليس في https://ihkaam.app/sitemap.xml. فمقالٌ نُشر سلفاً لا يُعاد، وفشل
   النشر أمس يُعاد اليوم. إن تعذّر جلب الخريطة يفشل السكربت (بريد من GitHub)
   ولا يُطلق بناءً أعمى.

   في GitHub Actions يكتب slugs=... في GITHUB_OUTPUT.
   ══════════════════════════════════════════════════════════════════ */
import fs from 'node:fs'
import { listPosts, isLive, siteToday } from './lib/blog-schedule.mjs'

const ORIGIN = 'https://ihkaam.app'
const args = process.argv.slice(2)
const today = siteToday()
const posts = listPosts()

async function liveSlugs() {
  const res = await fetch(`${ORIGIN}/sitemap.xml?t=${Date.now()}`, { headers: { 'cache-control': 'no-cache' } })
  if (!res.ok) throw new Error(`تعذّر جلب الخريطة: ${res.status}`)
  const xml = await res.text()
  return new Set([...xml.matchAll(/<loc>[^<]*\/blog\/([^<\/]+)<\/loc>/g)].map(m => m[1]))
}

if (args.includes('--dry-run')) {
  console.log(`اليوم (دمشق): ${today}`)
  for (const p of posts) console.log(`${isLive(p, today) ? 'يظهر  ' : p.status === 'draft' ? 'مسودة ' : 'مجدول '} ${p.date}  ${p.slug}`)
  process.exit(0)
}

if (args.includes('--wait')) {
  const want = args.slice(args.indexOf('--wait') + 1)
  const deadline = Date.now() + 20 * 60 * 1000
  for (;;) {
    const have = await liveSlugs()
    const missing = want.filter(s => !have.has(s))
    if (!missing.length) { console.log('ظهرت في الخريطة:', want.join(' ')); process.exit(0) }
    if (Date.now() > deadline) { console.error('لم تظهر بعد 20 دقيقة:', missing.join(' ')); process.exit(1) }
    console.log('بانتظار:', missing.join(' '))
    await new Promise(r => setTimeout(r, 30000))
  }
}

const have = await liveSlugs()
const due = posts.filter(p => isLive(p, today) && !have.has(p.slug)).map(p => p.slug)
console.log(due.length ? `مستحقة (${today}): ${due.join(' ')}` : `لا مقال مستحق (${today})`)
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `slugs=${due.join(' ')}\n`)
