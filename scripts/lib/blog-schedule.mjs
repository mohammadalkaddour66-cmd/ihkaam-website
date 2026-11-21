/* ══════════════════════════════════════════════════════════════════
   جدولة المقالات: مصدرٌ واحد لقاعدة «متى يظهر المقال».

   القاعدة: المقال يظهر في الموقع حين تتحقق شروطه كلها:
     status ≠ 'draft'   (المسودة لا تُنشر وحدها أبداً)
     date ≤ اليوم       (اليوم بتوقيت دمشق وقت البناء، أو SITE_TODAY إن وُضع)
   ما عدا ذلك «مجدول»: لا صفحة له ولا مدخل في الخريطة ولا llms.txt ولا
   روابط ذات صلة، ونصّه لا يدخل حزمة JS التي يحمّلها الزائر (vite.config.js
   يستبدل ملفه بمدخل فارغ وقت البناء).

   يقرؤه vite.config.js (الحزمة والتعريفات) و due-posts.mjs (فحص يوم النشر)
   و check-scheduled.mjs (الفحص قبل الموعد). بلا اعتماديات: يعمل بـ node خالص.
   ══════════════════════════════════════════════════════════════════ */
import fs from 'node:fs'
import path from 'node:path'

export const BLOG_DIR = path.resolve(import.meta.dirname, '..', '..', 'src', 'data', 'blog')

const DATE = /^\d{4}-\d{2}-\d{2}$/

/* اليوم بتوقيت دمشق (مؤقّت النشر يعمل 06:00 دمشق = 03:00 UTC).
   SITE_TODAY=YYYY-MM-DD يحاكي يوماً آخر: للمعاينة والفحص قبل الموعد. */
export function siteToday(env = process.env) {
  if (env.SITE_TODAY) {
    if (!DATE.test(env.SITE_TODAY)) throw new Error(`SITE_TODAY يجب أن يكون YYYY-MM-DD، وجاء «${env.SITE_TODAY}»`)
    return env.SITE_TODAY
  }
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Damascus', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

/* حقول المقال الأساسية من نص الملف (بلا تنفيذه). الأخطاء تُرمى عالياً: مقال
   بلا slug أو تاريخ يُفشل البناء بدل أن يختفي بصمت. */
export function readMeta(code, file = '') {
  const pick = (key) => code.match(new RegExp(String.raw`^\s*${key}\s*:\s*'([^']*)'`, 'm'))?.[1]
  const meta = { slug: pick('slug'), status: pick('status'), date: pick('date'), title: pick('title') }
  const where = file ? ` في ${path.basename(file)}` : ''
  if (!meta.slug) throw new Error(`مقال بلا slug${where}`)
  if (!['published', 'draft'].includes(meta.status)) throw new Error(`status يجب أن يكون 'published' أو 'draft'${where}`)
  if (!DATE.test(meta.date || '')) throw new Error(`date يجب أن يكون 'YYYY-MM-DD'${where}`)
  return meta
}

export const isLive = (meta, today) => meta.status !== 'draft' && meta.date <= today

export function listPosts(dir = BLOG_DIR) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => {
    const file = path.join(dir, f)
    const code = fs.readFileSync(file, 'utf8')
    return { file, code, ...readMeta(code, file) }
  })
}
