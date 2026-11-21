/* ══════════════════════════════════════════════════════════════════
   اقتطاعات خطوات مركز المساعدة من نسخة العرض (قراءة فقط):

       node scripts/help-crops.mjs                 كل المواصفات في scripts/help-crops.specs/
       node scripts/help-crops.mjs <slug> …        شروح بعينها
       node scripts/help-crops.mjs --check [slug]  فحص التطابق وحده بلا فتح المتصفح

   لكل خطوة: يفتح الشاشة في demo.ihkaam.app، ويحدّد عناصرها بنصها الظاهر، ويقتطع
   المنطقة التي تضمّها، ويحفظ صورة في public/help-crops/ وبيانات العلامات في
   src/data/help-crops/<slug>.json (ملف لكل شرح فلا تتعارض الكتابة المتوازية).
   لا يضغط أي زر حفظ ولا يغيّر بيانات (القائمة المحظورة FORBIDDEN_CLICK). ويفحص قبل أن يقبل الاقتطاع:

     ١) التطابق: كل نص عنصر مذكور في المواصفات يرد في عنوان الخطوة أو نصها،
        فلا تصف الصورةُ شيئاً لا يذكره النص.
     ٢) الخصوصية: لا رقم بطول 8 خانات فأكثر (هاتف أو هوية) داخل الاقتطاع.

   شكل المواصفة (ملف .mjs لكل شرح في scripts/help-crops.specs/<slug>.mjs):
     export default {
       slug: 'student-registration',
       title: 'تسجيل طالب جديد',        // اسم الشاشة في التعليق «من شاشة …»
       screen: 'تسجيل الطلاب',          // اسم بند الشريط الجانبي (اختياري)
       url: 'https://…', public: true,   // صفحة بلا دخول (اختياري)
       viewport: { width: 390, height: 1800 }, // مقاس غير الافتراضي 1440×2400 (اختياري)
       prepare: async (page, h) => {},   // تهيئة الشاشة بعد فتحها (نقرات آمنة وتعبئة بحث)
       steps: { 1: { targets: ['field:الاسم', 'el:حفظ'], pad: [24,12], prepare: async (page,h)=>{} } },
     }
   العناصر: field:<تسمية> (الحقل كاملاً مع عنصر إدخاله)، el:<نص> (العنصر نفسه).
   h = { sleep, safe(text) يتحقق أن النقر غير محظور، openScreen(label) }.
   الحساب والرابط من ذاكرة المشروع (نسخة العرض العامة).
   ══════════════════════════════════════════════════════════════════ */
import { chromium } from 'playwright'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'help-crops')
const DATA_DIR = path.join(ROOT, 'src', 'data', 'help-crops')
const SPEC_DIR = path.join(import.meta.dirname, 'help-crops.specs')
const args = process.argv.slice(2)
const CHECK_ONLY = args.includes('--check')
const only = args.filter(a => !a.startsWith('--'))

const URL = 'https://demo.ihkaam.app'
const USER = process.env.DEMO_USER || 'admin'
const PASS = process.env.DEMO_PASS || '123'
const FORBIDDEN_CLICK = /حفظ|اعتماد|حذف|إرسال|تأكيد|إلغاء|استيراد|تحديث الحالة|تتويج|دفع|سداد|إنشاء|إضافة|رفع|نقل/
const norm = (t) => (t || '').replace(/\s+/g, ' ').trim()
const labelOf = (t) => t.slice(t.indexOf(':') + 1)
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/* ── تحميل المواصفات ── */
const SPECS = {}
for (const f of fs.readdirSync(SPEC_DIR).filter(f => f.endsWith('.mjs'))) {
  const m = await import(pathToFileURL(path.join(SPEC_DIR, f)).href)
  if (!m.default?.slug) throw new Error(`المواصفة ${f} بلا slug`)
  SPECS[m.default.slug] = m.default
}

/* ── نص الخطوات من helpContent.js (بلا تحميل الوحدة) ── */
function stepTexts(slug) {
  const s = fs.readFileSync(path.join(ROOT, 'src/data/helpContent.js'), 'utf8')
  const i = s.indexOf(`slug    : '${slug}'`)
  if (i < 0) throw new Error(`لا شرح بهذا الاسم: ${slug}`)
  const a = s.indexOf('steps   : [', i)
  const j = s.indexOf('tips', a)
  const blk = s.slice(a, j)
  const re = /title:\s*'((?:[^'\\]|\\.)*)',\s*body\s*:\s*'((?:[^'\\]|\\.)*)'/g
  const out = []
  let m
  while ((m = re.exec(blk))) out.push(norm(`${m[1]} ${m[2]}`.replace(/\\n/g, ' ').replace(/\\'/g, "'")))
  return out
}

function checkMatch(slug, spec) {
  const texts = stepTexts(slug)
  const errs = []
  for (const [n, st] of Object.entries(spec.steps)) {
    const text = texts[Number(n) - 1]
    if (!text) { errs.push(`${slug} الخطوة ${n}: لا خطوة بهذا الرقم في النص`); continue }
    for (const t of st.targets) {
      const l = labelOf(t)
      if (!text.includes(l)) errs.push(`${slug} الخطوة ${n}: النص لا يذكر «${l}» وهو في الصورة`)
    }
  }
  return errs
}

let bad = 0
const wanted = Object.keys(SPECS).filter(k => !only.length || only.includes(k))
for (const slug of wanted) {
  for (const e of checkMatch(slug, SPECS[slug])) { console.log('✖', e); bad++ }
}
if (CHECK_ONLY || bad) {
  console.log(bad ? `\n✖ ${bad} عدم تطابق بين النص والصورة` : `✔ النصوص تذكر كل ما في الصور (${wanted.length} شرحاً)`)
  process.exit(bad ? 1 : 0)
}

/* ── المتصفح ── */
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.mkdirSync(DATA_DIR, { recursive: true })
const browser = await chromium.launch()

async function newPage(vp, scale = 2) {
  const ctx = await browser.newContext({ viewport: vp, locale: 'ar', deviceScaleFactor: scale })
  const page = await ctx.newPage()
  page.setDefaultTimeout(25000)
  return page
}
async function login(page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(3000)
  const inputs = page.locator('input:visible')
  await inputs.nth(0).fill(USER)
  await inputs.nth(1).fill(PASS)
  await page.getByRole('button', { name: /تسجيل الدخول/ }).first().click()
  await page.waitForTimeout(4000)
  await page.addStyleTag({ content: 'a[href*="wa.me"], [class*="whatsapp"], .fixed.bottom-6.left-6 { display:none !important }' })
  await page.mouse.click(1400, 95)               // فتح الشريط الجانبي بالأسماء
  await page.waitForTimeout(1200)
}

const helpers = (page) => ({
  sleep,
  safe: (text) => { if (FORBIDDEN_CLICK.test(text)) throw new Error('نقر محظور: ' + text); return text },
  async openScreen(label) {
    if (FORBIDDEN_CLICK.test(label)) throw new Error('نقر محظور: ' + label)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForTimeout(600)
    const box = await page.evaluate((l) => {
      const els = [...document.querySelectorAll('button,a,div,span')].filter(e => e.textContent.trim() === l && e.children.length <= 3)
      const r = els.map(e => e.getBoundingClientRect()).find(r => r.x > 1100 && r.width > 20 && r.height > 10 && r.height < 80)
      return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null
    }, label)
    if (!box) throw new Error('لا عنصر في الشريط الجانبي: ' + label)
    await page.mouse.click(box.x, box.y)
    await page.waitForTimeout(2500)
    await page.setViewportSize({ width: 1440, height: 2400 })   // الشاشة كاملة بلا تمرير
    await page.waitForTimeout(1200)
  },
})

/* مستطيل عنصر بنصه: field يشمل عنصر الإدخال، وel العنصر نفسه. maxX يستثني الشريط الجانبي */
async function rectOf(page, target, maxX) {
  const kind = target.slice(0, target.indexOf(':'))
  const text = labelOf(target)
  return page.evaluate(({ kind, text, maxX }) => {
    const clean = (t) => (t || '').replace(/\s+/g, ' ').trim()
    const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' }
    const own = (e) => clean([...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' '))
    const all = [...document.querySelectorAll('body *')].filter(e => vis(e) && e.getBoundingClientRect().right < maxX)
    let el = all.find(e => own(e) === text) || all.find(e => clean(e.textContent) === text && e.children.length <= 2)
    if (!el) return null
    if (kind === 'field') {
      let p = el
      while (p && p !== document.body) {
        if (p.querySelector('input,select,textarea,[type=file]') && p.getBoundingClientRect().height < 260 && p.getBoundingClientRect().width < 940) { el = p; break }
        p = p.parentElement
      }
    } else if (el.tagName === 'SPAN' || el.tagName === 'P') {
      const b = el.closest('button,a,[role=tab]'); if (b) el = b
    }
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  }, { kind, text, maxX })
}

const hasLongDigits = (page, clip) => page.evaluate((c) => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (w.nextNode()) {
    const n = w.currentNode
    const t = n.textContent
    if (!/\d{8,}/.test(t.replace(/[\s,٫.-]/g, ''))) continue
    const r = n.parentElement?.getBoundingClientRect()
    if (r && r.right > c.x && r.left < c.x + c.w && r.bottom > c.y && r.top < c.y + c.h) return true
  }
  return false
}, clip)

let failed = 0
let loggedIn = null
for (const slug of wanted) {
  const spec = SPECS[slug]
  const vp = spec.viewport || { width: 1440, height: 2400 }
  let page
  if (spec.public) {
    page = await newPage(vp)
    await page.goto(spec.url || URL, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(3500)
  } else {
    if (!loggedIn) { loggedIn = await newPage({ width: 1440, height: 900 }); await login(loggedIn) }
    page = loggedIn
    if (spec.viewport) await page.setViewportSize(vp)
  }
  const h = helpers(page)
  if (spec.screen) await h.openScreen(spec.screen)
  if (spec.url && !spec.public) { await page.goto(spec.url, { waitUntil: 'domcontentloaded', timeout: 45000 }); await page.waitForTimeout(3000) }
  if (spec.prepare) await spec.prepare(page, h)
  const maxX = (spec.public || vp.width < 1000) ? vp.width : 1180
  const data = {}
  for (const [n, st] of Object.entries(spec.steps)) {
    if (st.prepare) await st.prepare(page, h)
    const rects = []
    for (const t of st.targets) {
      const r = await rectOf(page, t, maxX)
      if (!r) { console.log(`✖ ${slug}/${n}: لم أجد «${labelOf(t)}» في الشاشة`); failed++; continue }
      rects.push({ ...r, t })
    }
    if (rects.length !== st.targets.length) continue
    const [px, py] = st.pad || [24, 12]   // هامش أفقي ورأسي؛ الرأسي صغير كي لا تدخل حروف الصف المجاور
    const x0 = Math.max(0, Math.min(...rects.map(r => r.x)) - px)
    const y0 = Math.max(0, Math.min(...rects.map(r => r.y)) - py)
    const x1 = Math.min(maxX, Math.max(...rects.map(r => r.x + r.w)) + px)
    const y1 = Math.min(vp.height, Math.max(...rects.map(r => r.y + r.h)) + py)
    const clip = { x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1 - x0), h: Math.ceil(y1 - y0) }
    if (await hasLongDigits(page, clip)) { console.log(`✖ ${slug}/${n}: في الاقتطاع رقم طويل (خصوصية)، أُسقط`); failed++; continue }
    const buf = await page.screenshot({ clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h } })
    const outW = Math.min(1100, clip.w * 2)
    const file = `${slug}-${n}.webp`
    await sharp(buf).resize({ width: outW }).webp({ quality: 82 }).toFile(path.join(OUT_DIR, file))
    const meta = await sharp(path.join(OUT_DIR, file)).metadata()
    data[n] = {
      src: `/help-crops/${file}`, w: meta.width, h: meta.height,
      marks: rects.map(r => ({
        x: +(((r.x - clip.x) / clip.w) * 100).toFixed(2), y: +(((r.y - clip.y) / clip.h) * 100).toFixed(2),
        w: +((r.w / clip.w) * 100).toFixed(2), h: +((r.h / clip.h) * 100).toFixed(2),
      })),
      labels: st.targets.map(labelOf), screen: spec.title,
    }
    console.log(`✔ ${slug}/${n}  ${meta.width}×${meta.height}  ${st.targets.map(labelOf).join(' | ')}`)
  }
  fs.writeFileSync(path.join(DATA_DIR, `${slug}.json`), JSON.stringify(data, null, 1))
  if (spec.public) await page.context().close()
}
await browser.close()
console.log(failed ? `\n✖ ${failed} اقتطاع لم يكتمل` : '\n✔ الاقتطاعات كلها اكتملت')
process.exit(failed ? 1 : 0)
