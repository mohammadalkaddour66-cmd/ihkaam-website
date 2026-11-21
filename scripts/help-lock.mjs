/* قفل بسيط لتسلسل التعديلات على ملفات مركز المساعدة المشتركة (helpContent.js, helpExtras.js)
   حين يعمل أكثر من وكيل معاً:
       node scripts/help-lock.mjs acquire     ينتظر حتى يحصل على القفل (حتى 180 ثانية)
       node scripts/help-lock.mjs release     يفكّ القفل
   قاعدة: احصل على القفل، عدّل الملف، ثم فكّه فوراً. ولا تُبقِه أكثر من دقيقة. */
import fs from 'node:fs'
import path from 'node:path'
const dir = path.resolve(import.meta.dirname, '..', '.scratch')
const lock = path.join(dir, 'help.lock')
fs.mkdirSync(dir, { recursive: true })

export async function acquire(maxMs = 180000) {
  const t0 = Date.now()
  for (;;) {
    try { fs.mkdirSync(lock); return } catch (e) {
      if (e.code !== 'EEXIST') throw e
      // قفل قديم (أكثر من 3 دقائق) يُعدّ متروكاً
      try { if (Date.now() - fs.statSync(lock).mtimeMs > 180000) fs.rmdirSync(lock) } catch { /* ignore */ }
      if (Date.now() - t0 > maxMs) throw new Error('انتهت مهلة انتظار القفل')
      await new Promise(r => setTimeout(r, 400 + Math.random() * 600))
    }
  }
}
export function release() { try { fs.rmdirSync(lock) } catch { /* ignore */ } }

if (import.meta.url === new URL(process.argv[1], 'file:///').href || process.argv[1]?.endsWith('help-lock.mjs')) {
  const cmd = process.argv[2]
  if (cmd === 'acquire') { await acquire(); console.log('lock acquired') }
  else if (cmd === 'release') { release(); console.log('lock released') }
}
