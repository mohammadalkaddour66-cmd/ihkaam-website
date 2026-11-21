/* ══════════════════════════════════════════════════════════════════
   فحص المقالات المجدولة قبل موعدها:  npm run check:scheduled

   المقال المجدول لا يدخل أي بناءٍ قبل يومه، فلا يمرّ على audit-seo ولا على
   فحص الروابط إلا إن حاكينا يومه. هذا السكربت يفعل ذلك:

   ١) فحص ثابت (بلا بناء): كل رابط /blog/<slug> داخل مقالٍ يجب أن يشير إلى مقالٍ
      موجود، غير مسودة، وتاريخه ≤ تاريخ المقال الذي يحمله. وإلا ظهر رابطٌ مكسور
      في الأيام بين نشر المقالين.
   ٢) بناء كامل بتاريخ بعيد (SITE_TODAY=2099-12-31) فتظهر كل المقالات المجدولة،
      ثم audit-seo (العنوان ≤ 60، والوصف 120–155، وH1، والبيانات المنظَّمة...)
      و audit-links. المسودات تبقى مخفية.

   ينتهي برمز 1 عند أي مخالفة. البناء يكتب في dist/ محلياً فقط (النشر يبنيه
   Cloudflare من git)، ولا يكتب sitemap-lastmod.json. شغّل npm run build بعده
   إن أردت معاينة الموقع كما هو اليوم.

     node scripts/check-scheduled.mjs --static     الفحص الثابت وحده (ثوانٍ)
   ══════════════════════════════════════════════════════════════════ */
import { spawnSync } from 'node:child_process'
import { listPosts, siteToday } from './lib/blog-schedule.mjs'

const staticOnly = process.argv.includes('--static')
const today = siteToday()
const posts = listPosts()
const bySlug = new Map(posts.map(p => [p.slug, p]))
const scheduled = posts.filter(p => p.status !== 'draft' && p.date > today)
const drafts = posts.filter(p => p.status === 'draft')

console.log(`اليوم (دمشق): ${today} · ظاهرة ${posts.length - scheduled.length - drafts.length} · مجدولة ${scheduled.length} · مسودات ${drafts.length}`)
for (const p of scheduled) console.log(`  مجدول ${p.date}  ${p.slug}`)

/* ١) الروابط الأمامية. (?<!og) يستثني غلاف /og/blog/<slug>.jpg، والنظرة الأمامية
   تمنع التقاط slug مبتور من اسم ملف. */
const problems = []
for (const p of posts.filter(q => q.status !== 'draft')) {
  const seen = new Set()
  for (const m of p.code.matchAll(/(?<!og)\/blog\/([a-z0-9-]+)(?![a-z0-9.-])/g)) {
    const to = m[1]
    if (to === p.slug || seen.has(to)) continue
    seen.add(to)
    const t = bySlug.get(to)
    if (!t) problems.push(`${p.slug}: رابط إلى /blog/${to} وليس في المدونة مقال بهذا الاسم`)
    else if (t.status === 'draft') problems.push(`${p.slug}: رابط إلى /blog/${to} وهو مسودة`)
    else if (t.date > today && t.date > p.date) problems.push(`${p.slug} (${p.date}): رابط إلى /blog/${to} الذي يُنشر بعده (${t.date}): يبقى مكسوراً بينهما`)
  }
}
if (problems.length) {
  console.log(`\n✖ روابط بين المقالات (${problems.length}):\n   ` + problems.join('\n   '))
  process.exit(1)
}
console.log('✔ الروابط بين المقالات سليمة')

if (staticOnly) process.exit(0)

/* ٢) بناء بتاريخ بعيد ثم الفحوص. */
const env = { ...process.env, SITE_TODAY: '2099-12-31' }
const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', env, shell: process.platform === 'win32' }).status
if (run('npm', ['run', 'build'])) { console.error('✖ فشل البناء بتاريخ بعيد'); process.exit(1) }
const seo = run('node', ['scripts/audit-seo.mjs'])
const links = run('node', ['scripts/audit-links.mjs'])
console.log(seo || links ? '\n✖ مخالفات في المقالات المجدولة (انظر أعلاه)' : '\n✔ المقالات المجدولة تمرّ على audit-seo وaudit-links')
process.exit(seo || links ? 1 : 0)
