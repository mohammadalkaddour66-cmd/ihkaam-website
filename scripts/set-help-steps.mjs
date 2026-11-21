/* يستبدل خطوات شرح (وتلميحاته اختيارياً) في src/data/helpContent.js بنسخة من ملف JSON،
   بقفلٍ يمنع تضارب الوكلاء المتوازين، ثم يشغّل فحص التطابق.

       node scripts/set-help-steps.mjs <slug> <ملف.json>

   الملف: { "steps": [ { "title": "…", "body": "…", "note"?: "…", "warning"?: "…" }, … ],
            "tips"?: [ "…", … ] }
   كل نص بين «» لما يظهر في الواجهة حرفياً. السطر الجديد داخل body يُكتب \n (قوائم «• »). */
import fs from 'node:fs'
import path from 'node:path'
import { acquire, release } from './help-lock.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const [slug, file] = process.argv.slice(2)
if (!slug || !file) { console.error('الاستعمال: node scripts/set-help-steps.mjs <slug> <ملف.json>'); process.exit(2) }
const input = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'))
if (!Array.isArray(input.steps) || !input.steps.length) throw new Error('steps مطلوبة')
for (const [i, s] of input.steps.entries()) {
  if (typeof s.title !== 'string' || typeof s.body !== 'string') throw new Error(`الخطوة ${i + 1}: title وbody نصّان مطلوبان`)
  for (const k of Object.keys(s)) if (!['title', 'body', 'note', 'warning'].includes(k)) throw new Error(`الخطوة ${i + 1}: حقل غير مدعوم ${k}`)
}

const q = (t) => "'" + String(t).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'"
const stepSrc = (s) => {
  const lines = ['      {', `        title: ${q(s.title)},`, `        body : ${q(s.body)},`]
  if (s.note) lines.push(`        note : ${q(s.note)},`)
  if (s.warning) lines.push(`        warning: ${q(s.warning)},`)
  lines.push('      },')
  return lines.join('\n')
}

await acquire()
try {
  const p = path.join(ROOT, 'src/data/helpContent.js')
  let s = fs.readFileSync(p, 'utf8')
  const i = s.indexOf(`slug    : '${slug}'`)
  if (i < 0) throw new Error(`لا شرح بهذا الاسم: ${slug}`)
  const a = s.indexOf('steps   : [', i)
  const t = s.indexOf('    tips    : [', a)
  if (a < 0 || t < 0) throw new Error('لم أجد حدود الخطوات')
  const stepsSrc = `steps   : [\n${input.steps.map(stepSrc).join('\n')}\n    ],\n`
  let tail = s.slice(t)
  if (Array.isArray(input.tips)) {
    const e = tail.indexOf('\n    ],\n')
    if (e < 0) throw new Error('لم أجد نهاية التلميحات')
    tail = `    tips    : [\n${input.tips.map(x => `      ${q(x)},`).join('\n')}${tail.slice(e)}`
  }
  s = s.slice(0, a) + stepsSrc + tail
  fs.writeFileSync(p, s)
  console.log(`✔ ${slug}: ${input.steps.length} خطوات${Array.isArray(input.tips) ? ` و${input.tips.length} تلميحات` : ''}`)
} finally { release() }
