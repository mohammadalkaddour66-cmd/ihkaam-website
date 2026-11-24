/* ══════════════════════════════════════════════════════════════════
   الشهادة: نصّها ورسمها.

   النص من صيغ مقال «شهادة تقدير حفظ القرآن» (src/data/blog/
   quran-certificate-wording.js): الجهة المانحة، واسم الطالب، والإنجاز بدقة،
   والتاريخ، والتوقيع. بلا ألقاب متضخمة، وبلا «أجزنا» (الشهادة تقدير لا
   إجازة)، والآية والحديث بنصّهما ومصدرهما.

   كل نص في الشهادة قابل للكتابة الحرة: الأداة تقترح صيغة (تُبنى من الجنس
   والإنجاز والتاريخ)، فإن كتب المستخدم فوقها صار نصّه هو المعتمد
   (o.text.intro / body / when / dua، وo.kicker، وo.title، والتوقيعان)، وقيمة
   null تعني «صيغة الأداة».

   الرسم على canvas بحجم A4 أفقي بدقة 200 نقطة في البوصة (2339×1654)، والطباعة
   وPDF والصورة كلها من هذه الصورة نفسها، فما يُرى هو ما يُطبع.

   التخطيط العمودي: عناصر الشهادة تُحسب ارتفاعاتها أولاً، ثم تُوزَّع داخل
   المساحة بين أعلى الإطار وأعلى التوقيعين (تلقائياً أو بتباعد يختاره المستخدم)
   وتتوسط المساحة، فلا يبقى فراغ كبير فوق التوقيعين.
   ══════════════════════════════════════════════════════════════════ */
import { C, font, fitText, khatam, patternFill, ensureFonts, drawCredit } from './canvasKit'
import { juzOrdinal, JUZ_NAMES } from './format'
import { formatHijri, formatGregorian, GREGORIAN_MONTHS_LEVANT } from '../../tools/quran/dates.js'
import { reasonWithLam, reasonPlain } from '../../tools/files/reason.js'

export const CERT_W = 2339
export const CERT_H = 1654

/* التصاميم: الثلاثة الأولى إطارات فنية مولَّدة (ElevenLabs) بمساحة وسط صافية،
   والبقية تُرسم بالكود. safe = حدود الكتابة بالبكسل، creditBottom = أسفل كبسولة
   إحكام (داخل الإطار بمسافة مريحة من خطه). */
export const DESIGNS = [
  { id: 'art-gold', label: 'إطار ذهبي', sub: 'نجوم زاوية خضراء', art: '/tools/cert/frame-gold.webp', thumb: '/tools/cert/thumb-gold.webp',
    safe: { l: 260, r: 2079, t: 200 }, creditBottom: 1490, sigGap: 36 },
  { id: 'art-ink', label: 'إطار أخضر حبري', sub: 'نقش هندسي بالذهب', art: '/tools/cert/frame-ink.webp', thumb: '/tools/cert/thumb-ink.webp',
    safe: { l: 290, r: 2049, t: 230 }, creditBottom: 1465, sigGap: 36 },
  { id: 'art-floral', label: 'إطار نباتي', sub: 'زخرفة خضراء وذهبية', art: '/tools/cert/frame-floral.webp', thumb: '/tools/cert/thumb-floral.webp',
    safe: { l: 250, r: 2089, t: 335 }, creditBottom: 1338, sigGap: 22 },
  { id: 'classic', label: 'كلاسيكي', sub: 'ورق كريمي وإطار ذهبي', star: true,
    safe: { l: 260, r: 2079, t: 165 }, creditBottom: 1514, sigGap: 36 },
  { id: 'ink', label: 'حبري', sub: 'أخضر داكن وذهب', star: true,
    safe: { l: 260, r: 2079, t: 165 }, creditBottom: 1514, sigGap: 36 },
  { id: 'band', label: 'بشريط', sub: 'أبيض بشريط جانبي',
    safe: { l: 200, r: 1840, t: 160 }, creditBottom: 1540, sigGap: 36 },
]
const DESIGN_BY_ID = Object.fromEntries(DESIGNS.map((d) => [d.id, d]))

export const TITLES = ['شهادة تقدير', 'شهادة شكر وتقدير', 'شهادة إتمام حفظ', 'شهادة تفوّق', 'شهادة فخر']

/* نصوص الرأس الجاهزة: تُملأ في الحقل الحر ويعدّلها المستخدم كما يشاء */
export const KICKERS = [
  { id: 'basmala', label: 'بسم الله الرحمن الرحيم', text: 'بسم الله الرحمن الرحيم' },
  { id: 'verse', label: 'آية الحفظ (الحجر 9)', text: '«إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ»\n(سورة الحجر، الآية 9)' },
  { id: 'hadith', label: 'حديث «خيركم»', text: 'قال رسول الله ﷺ: «خيركم من تعلّم القرآن وعلّمه»\n(رواه البخاري، حديث 5027)' },
]

export const SPACINGS = [
  { id: 'auto', label: 'تلقائي' },
  { id: 'tight', label: 'متقارب' },
  { id: 'normal', label: 'متوازن' },
  { id: 'wide', label: 'متباعد' },
]
/* متقارب ومتباعد بفرق ظاهر عن التلقائي: يحدّه الحاجز أدناه إن لم يتسع المتن */
const SPACING_K = { tight: 0.35, normal: 1, wide: 2.6 }

const G = {
  m: { student: 'الطالب', hifz: 'لحفظه', lahu: 'له', ilm: 'علمه', zada: 'وزاده', yuthabbit: 'يثبّته', yajal: 'ويجعله' },
  f: { student: 'الطالبة', hifz: 'لحفظها', lahu: 'لها', ilm: 'علمها', zada: 'وزادها', yuthabbit: 'يثبّتها', yajal: 'ويجعلها' },
}

/* «لـ» + سبب حرّ: «تميّزه…» ← «لتميّزه…»، و«الانتظام…» ← «للانتظام…»، وما كُتب بلامه أو
   بـ«تقديراً» أو بنقطة في آخره يُضبط (reason.js) فلا يحفظ المستخدم قاعدة. */
const withLam = reasonWithLam

/* raw=true: العبارة بلا لام ولا ضمير («حفظ جزء عمّ كاملاً») لتُدرج في صيغة يكتبها المدير بنفسه */
export function achievementText(a, g, raw = false) {
  const w = raw ? { ...G[g], hifz: 'حفظ' } : G[g]
  switch (a.type) {
    case 'juz': {
      const j = a.juz
      return JUZ_NAMES[j] ? `${w.hifz} ${JUZ_NAMES[j]} كاملاً، وهو ${juzOrdinal(j)}` : `${w.hifz} ${juzOrdinal(j)} كاملاً`
    }
    case 'juzRange': {
      const a1 = Math.min(a.from, a.to)
      const b1 = Math.max(a.from, a.to)
      const n = b1 - a1 + 1
      if (n === 1) return achievementText({ type: 'juz', juz: a1 }, g, raw)
      const nTxt = n === 2 ? 'جزأين' : n <= 10 ? `${n} أجزاء` : `${n} جزءاً`
      return `${w.hifz} ${nTxt} من كتاب الله، من الجزء ${a1} إلى الجزء ${b1}`
    }
    case 'surah':
      return `${w.hifz} سورة ${a.surahName} كاملة`
    case 'quran':
      return `${w.hifz} القرآن الكريم كاملاً`
    case 'custom':
      return (raw ? reasonPlain(a.text) : withLam(a.text)) || `${w.hifz} ........`
    default:
      return ''
  }
}

export function dateText(date, mode) {
  if (!date) return ''
  const h = formatHijri(date)
  /* الشهر الميلادي بالاسم الشامي: «24 تشرين الثاني 2026م» لا «24 نوفمبر» */
  const gr = `${formatGregorian(date, { months: GREGORIAN_MONTHS_LEVANT })}م`
  if (mode === 'hijri') return h
  if (mode === 'gregorian') return gr
  return `${h}، الموافق ${gr}`
}

/* صيغة الأداة المقترحة (قبل أي كتابة حرة) */
export function certificateLines(o) {
  const w = G[o.gender]
  const inst = o.institute?.trim() || 'المعهد'
  const intro = `يمنح ${inst} ${w.student}`
  const halaqa = o.halaqa?.trim() ? ` في حلقة ${o.halaqa.trim()}` : ''
  const date = dateText(o.date, o.dateMode)
  /* التاريخ أسفل الشهادة (الافتراضي): «حُرّر في الرياض بتاريخ …». داخل المتن: تتصل به جملة المتن بفاصلة. */
  const inline = o.datePos === 'inline'
  const place = o.place?.trim()
  const body = `هذه الشهادة تقديراً ${achievementText(o.achievement, o.gender)}${halaqa}${date && inline ? '،' : '.'}`
  const when = date ? `${place || !inline ? `حُرّر${place ? ` في ${place}` : ''} ` : ''}بتاريخ ${date}.` : ''
  const dua = o.achievement.type === 'quran'
    ? `نسأل الله أن ${w.yuthabbit} ${w.yajal} من أهل القرآن.`
    : `بارك الله ${w.lahu} في ${w.ilm} ${w.zada} حرصاً.`
  return { intro, name: o.name?.trim() || '........', body, when, dua }
}

/* سطر العلامة أو التقدير: «98 من 100» ← «العلامة: 98 من 100»، و«امتياز» ← «التقدير: امتياز».
   وإن بدأ النص المكتوب بكلمة العلامة أو التقدير فهو سطرٌ كامل يبقى كما كُتب. */
export function gradeText(g) {
  const t = String(g || '').trim()
  if (!t) return ''
  if (/^(ال)?(علامة|درجة|تقدير|بتقدير|بعلامة|بدرجة)/.test(t)) return t
  return /\d/.test(t) ? `العلامة: ${t}` : `التقدير: ${t}`
}

/* النصوص النهائية: ما كتبه المستخدم (إن وُجد) فوق صيغة الأداة */
export function resolveTexts(o) {
  const L = certificateLines(o)
  const t = o.text || {}
  const pick = (k) => (t[k] != null ? t[k] : L[k])
  let body = pick('body')
  const when = pick('when')
  /* إن مُسح سطر التاريخ تنتهي الجملة بنقطة لا بفاصلة معلّقة */
  if (t.body == null && !when.trim()) body = body.replace(/،$/, '.')
  return {
    kicker: o.kicker || '',
    title: o.title != null ? o.title : 'شهادة تقدير',
    intro: pick('intro'),
    name: L.name,
    body,
    when,
    grade: gradeText(o.grade),
    dua: pick('dua'),
    sig1: { role: o.sig1?.role ?? 'المعلم', name: o.sig1?.name ?? '' },
    sig2: { role: o.sig2?.role ?? 'مدير المعهد', name: o.sig2?.name ?? '' },
    /* توقيع ثالث اختياري في الوسط: فارغ افتراضياً فلا يظهر */
    sig3: { role: o.sig3?.role ?? '', name: o.sig3?.name ?? '' },
  }
}

/* ── الرسم ── */
/* لون الشهادة: منتقي لون حر (o.color بصيغة #RRGGBB، وفارغ = الأخضر الحبري الأصلي).
   اللون المختار يحلّ محل الأخضر الحبري في كل التصاميم: العنوان والزخارف والخلفية الحبرية
   والشريط الجانبي، ويبقى الذهب لون الزخرفة. وفي الإطارات الفنية (صور) يُحوَّل الأخضر
   فيها وحده إلى اللون المختار ويبقى الذهب كما هو. يُغمَّق اللون المختار إلى حدٍّ يبقى معه
   النص مقروءاً: العنوان عليه فوق الورق الفاتح، والنص الأبيض فوقه في التصميم الحبري. */
export const DEFAULT_COLOR = '#0B3B33'
const DEFAULT_COL = { ink: '#0B3B33', mid: '#0E4A40', deep: '#082C26', body: '#2F4540', soft: '#5E6E67', rgb: '11,59,51', h: 169, s: 0.69, l: 0.14, isDefault: true }

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
/* بلا تخصيص مصفوفات داخل الحلقة: النتيجة تُكتب في o (ثلاث خانات) */
function toHsl(r, g, b, o) {
  r /= 255; g /= 255; b /= 255
  const mx = Math.max(r, g, b); const mn = Math.min(r, g, b); const d = mx - mn
  const l = (mx + mn) / 2
  if (!d) { o[0] = 0; o[1] = 0; o[2] = l; return }
  const s = d / (1 - Math.abs(2 * l - 1))
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  o[0] = (h * 60 + 360) % 360; o[1] = s; o[2] = l
}
function fromHsl(h, s, l, o) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const k = Math.floor(h / 60) % 6
  const r = k === 0 || k === 5 ? c : k === 1 || k === 4 ? x : 0
  const g = k === 0 || k === 3 ? x : k === 1 || k === 2 ? c : 0
  const b = k === 3 || k === 4 ? c : k === 2 || k === 5 ? x : 0
  o[0] = Math.round((r + m) * 255); o[1] = Math.round((g + m) * 255); o[2] = Math.round((b + m) * 255)
}
const hslHex = (h, s, l) => {
  const o = [0, 0, 0]
  fromHsl(h, s, l, o)
  return `#${o.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function colorFrom(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb || hex.toLowerCase() === DEFAULT_COLOR.toLowerCase()) return DEFAULT_COL
  const o = [0, 0, 0]
  toHsl(rgb[0], rgb[1], rgb[2], o)
  const [h, s] = o
  const l = Math.min(o[2], 0.36)
  const ink = hslHex(h, s, l)
  fromHsl(h, s, l, o)
  return {
    ink, h, s, l, isDefault: false,
    mid: hslHex(h, s, Math.min(0.5, l * 1.2 + 0.02)),
    deep: hslHex(h, s, l * 0.72),
    body: hslHex(h, s * 0.3, 0.22),
    soft: hslHex(h, s * 0.15, 0.42),
    rgb: o.join(','),
  }
}

/* تحويل أخضر الإطار الفني إلى اللون المختار: بكسلات الأخضر والفيروزي (درجة 100–200) تأخذ
   درجة اللون المختار وإشباعه وتُزاح إضاءتها بقدر فرق الإضاءة، والذهب والكريمي لا يُمسّان.
   الانتقال بين الذهب والأخضر (75–100 و200–215) متدرّج فلا يظهر حدّ حاد. النتيجة تُخزَّن
   (آخر أربع) فتُحسب مرة واحدة للمعاينة وللتوليد الجماعي كله. */
const artCache = new Map()
function recolorImage(img, col) {
  const cv = document.createElement('canvas')
  cv.width = img.width; cv.height = img.height
  const x = cv.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, 0, 0)
  const id = x.getImageData(0, 0, cv.width, cv.height)
  const d = id.data
  const hsl = [0, 0, 0]; const rgb = [0, 0, 0]
  const sk = col.s / 0.69
  const dl = (col.l - 0.14) * 0.7
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]; const g = d[i + 1]; const b = d[i + 2]
    if (Math.max(r, g, b) - Math.min(r, g, b) < 14) continue
    toHsl(r, g, b, hsl)
    const h = hsl[0]
    if (h < 75 || h > 215 || hsl[1] < 0.1) continue
    const w = h < 100 ? (h - 75) / 25 : h > 200 ? (215 - h) / 15 : 1
    const nh = (col.h + (h - 169) * 0.4 + 360) % 360
    const ns = Math.min(1, hsl[1] * sk)
    const nl = Math.min(0.95, Math.max(0.02, hsl[2] + dl))
    fromHsl(nh, ns, nl, rgb)
    d[i] = r + (rgb[0] - r) * w
    d[i + 1] = g + (rgb[1] - g) * w
    d[i + 2] = b + (rgb[2] - b) * w
  }
  x.putImageData(id, 0, 0)
  return cv
}
async function loadArt(src, col) {
  const img = await loadBg(src)
  if (!img || col.isDefault) return img
  const key = `${src}|${col.ink}`
  if (!artCache.has(key)) {
    if (artCache.size >= 4) artCache.delete(artCache.keys().next().value)
    artCache.set(key, recolorImage(img, col))
  }
  return artCache.get(key)
}

function buildPalette(kind, c) {
  const line = `rgba(${c.rgb},.35)`
  if (kind === 'ink') {
    return { bg: c.ink, title: '#F8F5EC', name: C.goldSoft, text: 'rgba(248,245,236,.9)', soft: 'rgba(248,245,236,.7)', frame: C.goldSoft, frame2: 'rgba(224,181,98,.5)', star: C.goldSoft, starLine: c.ink, line: 'rgba(224,181,98,.55)', credit: 'rgba(224,181,98,.92)', link: '#F8F5EC' }
  }
  const band = kind === 'band'
  return { bg: band ? '#FFFFFF' : '#FBF7EE', title: c.ink, name: C.goldDeep, text: c.body, soft: c.soft, frame: C.gold, frame2: band ? 'rgba(184,134,58,.4)' : 'rgba(184,134,58,.55)', star: band ? C.goldSoft : c.ink, starLine: band ? c.ink : C.goldSoft, line, credit: C.goldDeep, link: c.ink }
}

const bgCache = new Map()
function loadBg(src) {
  if (!bgCache.has(src)) {
    bgCache.set(src, new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => { bgCache.delete(src); resolve(null) }
      img.src = src
    }))
  }
  return bgCache.get(src)
}
/* تحميل مسبق عند اختيار التصميم ليظهر الإطار فوراً */
export function preloadDesign(id) {
  const d = DESIGN_BY_ID[id]
  if (d?.art) loadBg(d.art)
}

function ornamentLine(ctx, cx, y, half, color) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx - half, y); ctx.lineTo(cx - 34, y)
  ctx.moveTo(cx + 34, y); ctx.lineTo(cx + half, y)
  ctx.stroke()
  khatam(ctx, cx, y, 20, { fill: color })
  ctx.restore()
}

function logoSize(img, boxW, boxH) {
  const k = Math.min(boxW / img.width, boxH / img.height)
  return { w: img.width * k, h: img.height * k }
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/* يرسم الشهادة ويعيد { link }: مستطيل رابط إحكام بالبكسل (لمنطقة النقر في PDF) */
export async function drawCertificate(canvas, o) {
  await ensureFonts()
  const W = CERT_W
  const H = CERT_H
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.direction = 'rtl'
  ctx.textBaseline = 'alphabetic'
  const design = DESIGN_BY_ID[o.design] || DESIGNS[0]
  const col = colorFrom(o.color)
  const P = buildPalette(design.id === 'ink' ? 'ink' : design.id === 'band' ? 'band' : 'classic', col)

  /* الخلفية والإطار */
  const art = design.art ? await loadArt(design.art, col) : null
  if (design.art) {
    if (art) ctx.drawImage(art, 0, 0, W, H)
    else { ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H) }
  } else if (design.id === 'ink') {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, col.mid)
    g.addColorStop(1, col.deep)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    patternFill(ctx, 0, 0, W, H, { tile: 150, color: C.goldSoft, alpha: 0.07, width: 1.6 })
  } else {
    ctx.fillStyle = P.bg
    ctx.fillRect(0, 0, W, H)
    patternFill(ctx, 0, 0, W, H, { tile: 150, color: col.ink, alpha: design.id === 'band' ? 0.025 : 0.035, width: 1.6 })
  }

  let left = 0
  let right = W
  if (design.id === 'band') {
    /* شريط جانبي على اليمين (بداية السطر العربي) */
    left = 70
    const bw = 360
    const g = ctx.createLinearGradient(W - bw, 0, W, H)
    g.addColorStop(0, col.ink)
    g.addColorStop(1, col.deep)
    ctx.fillStyle = g
    ctx.fillRect(W - bw, 0, bw, H)
    patternFill(ctx, W - bw, 0, bw, H, { tile: 120, color: C.goldSoft, alpha: 0.14, width: 1.6 })
    ctx.fillStyle = C.goldSoft
    ctx.fillRect(W - bw - 10, 0, 10, H)
    right = W - bw - 10
    khatam(ctx, W - bw / 2, H - 230, 70, { stroke: C.goldSoft, width: 3 })
    khatam(ctx, W - bw / 2, H - 230, 46, { fill: 'rgba(224,181,98,.25)' })
    ctx.strokeStyle = P.frame2
    ctx.lineWidth = 3
    ctx.strokeRect(70, 70, right - 140, H - 140)
  } else if (!design.art) {
    ctx.strokeStyle = P.frame
    ctx.lineWidth = 8
    ctx.strokeRect(64, 64, W - 128, H - 128)
    ctx.strokeStyle = P.frame2
    ctx.lineWidth = 2.5
    ctx.strokeRect(92, 92, W - 184, H - 184)
    for (const [x, y] of [[92, 92], [W - 92, 92], [92, H - 92], [W - 92, H - 92]]) {
      khatam(ctx, x, y, 48, { fill: P.star })
      khatam(ctx, x, y, 30, { stroke: P.starLine, width: 3 })
    }
  }

  const cx = design.id === 'band' ? (left + right) / 2 : W / 2
  const textW = design.safe.r - design.safe.l
  const T = resolveTexts(o)
  ctx.textAlign = 'center'

  /* ── مواضع الكتلة السفلية: كبسولة إحكام ثم التوقيعان فوقها ── */
  const CREDIT_SIZE = 24
  const creditH = CREDIT_SIZE * 1.45 + CREDIT_SIZE
  const creditTop = design.creditBottom - creditH
  const SIG_H = 160
  const sigTop = creditTop - design.sigGap - SIG_H
  const topY = design.safe.t
  /* سطر «حُرّر في … بتاريخ …» أسفل الشهادة (الافتراضي): شريط فوق التوقيعين يُحجز له مكان من المتن */
  const dateBottom = o.datePos !== 'inline' && !!T.when.trim()
  const DATE_STRIP = dateBottom ? (design.id === 'art-floral' ? 78 : 100) : 0 // الإطار النباتي مساحته أضيق
  const botY = sigTop - 56 - DATE_STRIP
  const avail = botY - topY
  const text = (str, { weight = 400, max, min, width = textW, lines = 1 }) => fitText(ctx, str, { weight, max, min, width, lines })

  /* ── عناصر المتن: كل عنصر ارتفاعه، والمسافة بعده، ودالة رسمه.
     sc = مقياس الأحجام: يُصغَّر المتن كله درجة درجة إن لم يتسع في المساحة. ── */
  const kLines = T.kicker.split('\n').map((s) => s.trim()).filter(Boolean)
  function build(sc) {
    const items = []
    const add = (h, gap, draw, key) => items.push({ h, gap, draw, key })
    const S = (n) => Math.round(n * sc)

    if (o.logo && design.id !== 'band') {
      const s = logoSize(o.logo, S(420), S(170))
      add(s.h, 46, (y) => ctx.drawImage(o.logo, cx - s.w / 2, y, s.w, s.h))
    } else if (design.star && design.id !== 'band') {
      add(S(112), 46, (y) => {
        const cy = y + S(56)
        khatam(ctx, cx, cy, S(56), { fill: design.id === 'ink' ? 'rgba(224,181,98,.18)' : 'rgba(184,134,58,.14)' })
        khatam(ctx, cx, cy, S(56), { stroke: P.frame, width: 3 })
        khatam(ctx, cx, cy, S(26), { fill: P.frame })
      })
    }

    if (o.institute?.trim()) {
      const f = text(o.institute.trim(), { weight: 700, max: S(58), min: S(36) })
      add(f.size * 1.05, 26, (y) => { ctx.font = font(700, f.size); ctx.fillStyle = P.name; ctx.fillText(f.lines[0], cx, y + f.size * 0.82) }, 'institute')
    }

    if (kLines.length) {
      const fs = kLines.map((l, i) => text(l, { weight: 400, max: S(i === 0 ? 44 : 30), min: S(i === 0 ? 28 : 22) }))
      const h = fs.reduce((n, f) => n + f.size * 1.4, 0)
      add(h, 36, (y) => {
        ctx.fillStyle = P.soft
        let yy = y
        fs.forEach((f) => { ctx.font = font(400, f.size); ctx.fillText(f.lines[0], cx, yy + f.size * 0.95); yy += f.size * 1.4 })
      }, 'kicker')
    }

    if (T.title.trim()) {
      const tt = text(T.title.trim(), { weight: 700, max: S(150), min: S(72) })
      add(tt.size * 0.95, 22, (y) => { ctx.font = font(700, tt.size); ctx.fillStyle = P.title; ctx.fillText(tt.lines[0], cx, y + tt.size * 0.78) }, 'title')
      add(24, 62, (y) => ornamentLine(ctx, cx, y + 12, 300 * sc, P.frame))
    }

    if (T.intro.trim()) {
      const f = text(T.intro.trim(), { max: S(52), min: S(34) })
      add(f.size * 1.1, 38, (y) => { ctx.font = font(400, f.size); ctx.fillStyle = P.text; ctx.fillText(f.lines[0], cx, y + f.size * 0.85) }, 'intro')
    }

    const nm = text(T.name, { weight: 700, max: S(124), min: S(64) })
    add(nm.size * 1.05, 44, (y) => { ctx.font = font(700, nm.size); ctx.fillStyle = P.name; ctx.fillText(nm.lines[0], cx, y + nm.size * 0.85) }, 'name')

    let bodySize = S(46)
    if (T.body.trim()) {
      const bd = text(T.body.trim(), { max: S(52), min: S(32), lines: 3 })
      bodySize = bd.size
      const lh = bd.size * 1.5
      add((bd.lines.length - 1) * lh + bd.size * 1.05, 14, (y) => {
        ctx.font = font(400, bd.size); ctx.fillStyle = P.text
        bd.lines.forEach((l, i) => ctx.fillText(l, cx, y + bd.size * 0.85 + i * lh))
      }, 'body')
    }
    if (T.when.trim() && !dateBottom) {
      const wn = text(T.when.trim(), { max: bodySize, min: S(30) })
      add(wn.size * 1.05, 22, (y) => { ctx.font = font(400, wn.size); ctx.fillStyle = P.text; ctx.fillText(wn.lines[0], cx, y + wn.size * 0.85) }, 'when')
    }
    if (T.grade) {
      const gr = text(T.grade, { weight: 700, max: S(46), min: S(30) })
      add(gr.size * 1.05, 22, (y) => { ctx.font = font(700, gr.size); ctx.fillStyle = P.name; ctx.fillText(gr.lines[0], cx, y + gr.size * 0.82) })
    }
    if (T.dua.trim()) {
      const f = text(T.dua.trim(), { weight: 300, max: S(44), min: S(28) })
      add(f.size * 1.1, 0, (y) => { ctx.font = font(300, f.size); ctx.fillStyle = P.soft; ctx.fillText(f.lines[0], cx, y + f.size * 0.85) }, 'dua')
    }
    const sumH = items.reduce((n, i) => n + i.h, 0)
    const gapsBase = items.slice(0, -1).reduce((n, i) => n + i.gap, 0)
    return { items, sumH, gapsBase }
  }

  /* أكبر مقياس يتسع معه المتن بمسافات لا تقل عن نصف الأساس */
  let laid = build(1)
  for (const sc of [0.93, 0.86, 0.8, 0.74, 0.68]) {
    if (laid.sumH + laid.gapsBase * 0.5 <= avail) break
    laid = build(sc)
  }
  if (o.logo && design.id === 'band') {
    const s = logoSize(o.logo, 240, 240)
    ctx.drawImage(o.logo, W - 190 - s.w / 2, 260 - s.h / 2, s.w, s.h)
  }

  /* ── التوزيع العمودي ── */
  const { items, sumH, gapsBase } = laid
  let k
  if (!o.spacing || o.spacing === 'auto') k = clamp((avail - sumH) / (gapsBase || 1), 0.4, 1.5)
  else k = SPACING_K[o.spacing] ?? 1
  if (sumH + gapsBase * k > avail) k = Math.max(0.3, (avail - sumH) / (gapsBase || 1))
  const used = sumH + gapsBase * k
  let y = topY + Math.max(0, (avail - used) / 2)
  const rects = {} // مواضع الأسطر على اللوحة: تُستعمل لتعديل السطر بالنقر عليه
  items.forEach((it, i) => {
    if (it.key) rects[it.key] = { x: cx - textW / 2, y, w: textW, h: it.h }
    it.draw(y)
    y += it.h + (i < items.length - 1 ? it.gap * k : 0)
  })

  /* ── سطر التاريخ أسفل الشهادة: وسطاً فوق التوقيعين ومكان الختم ── */
  if (dateBottom) {
    const wf = text(T.when.trim(), { max: 36, min: 26 })
    ctx.font = font(400, wf.size)
    ctx.fillStyle = P.text
    ctx.textAlign = 'center'
    ctx.fillText(wf.lines[0], cx, sigTop - DATE_STRIP + 16)
    rects.when = { x: cx - textW / 2, y: sigTop - DATE_STRIP - 10, w: textW, h: 62 }
  }

  /* ── التوقيعان ── */
  const dx = Math.min(560, (design.safe.r - design.safe.l) / 2 - 290)
  /* التوقيع الثالث (إن كُتب) يقع في الوسط فتضيق الخطوط قليلاً ليبقى بين الثلاثة فراغ، ويحلّ محل مكان الختم */
  const third = !!(T.sig3.role.trim() || T.sig3.name.trim())
  const half = third ? 200 : 230
  const sigs = [{ ...T.sig1, x: cx + dx }, { ...T.sig2, x: cx - dx }]
  if (third) sigs.push({ ...T.sig3, x: cx })
  sigs.forEach((s, si) => { rects[`sig${si === 2 ? 3 : si + 1}`] = { x: s.x - half, y: sigTop, w: half * 2, h: SIG_H } })
  for (const s of sigs) {
    if (!s.role.trim() && !s.name.trim()) continue
    ctx.textAlign = 'center'
    if (s.role.trim()) {
      ctx.fillStyle = P.soft
      const f = text(s.role.trim(), { weight: 700, max: 36, min: 26, width: half * 2 - (third ? 20 : 0) })
      ctx.font = font(700, f.size)
      ctx.fillText(f.lines[0], s.x, sigTop + 34)
    }
    ctx.strokeStyle = P.line
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(s.x - half, sigTop + 104); ctx.lineTo(s.x + half, sigTop + 104)
    ctx.stroke()
    if (s.name.trim()) {
      ctx.fillStyle = P.text
      const sn = text(s.name.trim(), { max: 42, min: 28, width: half * 2 - 20 })
      ctx.font = font(400, sn.size)
      ctx.fillText(sn.lines[0], s.x, sigTop + 150)
    }
  }
  /* مكان الختم */
  if (o.sealSpot && !third) {
    ctx.save()
    ctx.setLineDash([10, 12])
    ctx.strokeStyle = P.line
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(cx, sigTop + 70, 90, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    ctx.fillStyle = P.line
    ctx.textAlign = 'center'
    ctx.font = font(400, 28)
    ctx.fillText('ختم المعهد', cx, sigTop + 80)
  }

  /* ── سطر إحكام: كبسولة داخل الإطار بعيدة عن خطه، والرابط فيها قابل للنقر في PDF ── */
  const link = drawCredit(ctx, {
    cx, baseline: design.creditBottom - CREDIT_SIZE, size: CREDIT_SIZE, color: P.credit, linkColor: P.link,
  })
  return { link, rects }
}

export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) { reject(new Error('اختر ملف صورة')); return }
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('تعذّر فتح الصورة'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('تعذّر قراءة الملف'))
    reader.readAsDataURL(file)
  })
}

/* للاستعمال في الملخص النصي تحت المعاينة (قارئ الشاشة يقرأ نص الشهادة) */
export function certificatePlainText(o) {
  const T = resolveTexts(o)
  return [T.kicker.replace(/\n/g, ' '), T.title, T.intro, T.name, T.body, T.when, T.grade, T.dua].filter(Boolean).join(' ')
}
