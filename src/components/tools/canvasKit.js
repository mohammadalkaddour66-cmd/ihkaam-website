/* ══════════════════════════════════════════════════════════════════
   رسم صور الأدوات على canvas: بطاقة «خطة هذا الأسبوع» لواتساب، والشهادة.
   كل شيء في المتصفح: الصورة تُولَّد من الذاكرة وتُحفظ أو تُشارك، ولا يُرفع
   شيء إلى خادم.

   الخط: قمرة (والأرقام اللاتينية من Cairo بنفس اسم العائلة، كما في
   index.css). canvas لا ينتظر الخط، فتُحمَّل الأوجه صراحةً قبل الرسم.
   ══════════════════════════════════════════════════════════════════ */
import { TOOL_CREDIT_LEAD, TOOL_CREDIT_LINK, TOOL_SHARE_TAIL } from '../../config/tools'

export const FONT = "Qomra, 'Qomra Fallback', 'Segoe UI', Tahoma, sans-serif"
export const C = {
  canvas: '#F8F5EC', paper: '#FFFFFF', ink: '#0B3B33', inkDeep: '#082C26', green: '#1F6F52',
  gold: '#B8863A', goldSoft: '#E0B562', goldDeep: '#8A6425', text: '#1A2E28', text2: '#4A5D56',
  text3: '#5E6E67', line: '#E6DFCF', cream2: '#F1ECDF',
}

export async function ensureFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  const sample = 'إحكام 0123456789'
  try {
    await Promise.all([
      document.fonts.load(`700 40px Qomra`, sample),
      document.fonts.load(`400 40px Qomra`, sample),
      document.fonts.load(`300 40px Qomra`, sample),
    ])
  } catch { /* يرسم بخط النظام إن تعذّر */ }
}

export function font(weight, size) {
  return `${weight} ${size}px ${FONT}`
}

/* يقسم النص إلى أسطر لا يتجاوز كلٌّ منها العرض المطلوب */
export function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width <= maxWidth || !line) line = test
    else { lines.push(line); line = w }
  }
  if (line) lines.push(line)
  return lines
}

/* يصغّر الخط حتى يدخل النص في عدد أسطر وعرض محدّدين */
export function fitText(ctx, text, { weight = 700, max, min, width, lines = 1 }) {
  for (let s = max; s >= min; s -= 1) {
    ctx.font = font(weight, s)
    const ls = wrapText(ctx, text, width)
    if (ls.length <= lines && ls.every((l) => ctx.measureText(l).width <= width)) return { size: s, lines: ls }
  }
  ctx.font = font(weight, min)
  return { size: min, lines: wrapText(ctx, text, width).slice(0, lines) }
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/* النجمة الثُّمانية: مربعان متراكبان، كنقش الموقع */
export function khatam(ctx, cx, cy, r, { stroke, fill, width = 1 } = {}) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.beginPath()
  for (let i = 0; i < 16; i++) {
    const ang = (Math.PI / 8) * i - Math.PI / 2
    const rad = i % 2 === 0 ? r : r * 0.7654
    const x = Math.cos(ang) * rad
    const y = Math.sin(ang) * rad
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke() }
  ctx.restore()
}

/* نقش البلاطة (مربعان ودائرة وخطوط الزوايا) يغطي مساحة، بشفافية خفيفة */
export function patternFill(ctx, x, y, w, h, { tile = 80, color = C.goldSoft, alpha = 0.12, width = 1 } = {}) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  const k = tile / 80
  for (let ty = y; ty < y + h; ty += tile) {
    for (let tx = x; tx < x + w; tx += tile) {
      ctx.save()
      ctx.translate(tx, ty)
      ctx.scale(k, k)
      ctx.lineWidth = width / k
      ctx.strokeRect(22, 22, 36, 36)
      ctx.save(); ctx.translate(40, 40); ctx.rotate(Math.PI / 4); ctx.strokeRect(-18, -18, 36, 36); ctx.restore()
      ctx.beginPath(); ctx.arc(40, 40, 7, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, 0); ctx.lineTo(22, 22); ctx.moveTo(80, 0); ctx.lineTo(58, 22)
      ctx.moveTo(0, 80); ctx.lineTo(22, 58); ctx.moveTo(80, 80); ctx.lineTo(58, 58)
      ctx.moveTo(40, 0); ctx.lineTo(40, 14.5); ctx.moveTo(40, 80); ctx.lineTo(40, 65.5)
      ctx.moveTo(0, 40); ctx.lineTo(14.5, 40); ctx.moveTo(80, 40); ctx.lineTo(65.5, 40)
      ctx.stroke()
      ctx.restore()
    }
  }
  ctx.restore()
}

/* ── سطر إحكام أسفل كل مخرَج ──
   «نظام إحكام لإدارة المعاهد القرآنية ihkaam.app»: مقطعان، العربي على اليمين
   والرابط (لاتيني، أغمق وتحته خط) على يساره، بلا إطار (قرار 2026-11-24).
   يعيد مستطيل السطر كله بإحداثيات الـcanvas ليضع ملف PDF منطقة نقر فوقه.
   pill اختياري ولا يستعمله أحد الآن. */
export function drawCredit(ctx, { cx, baseline, size = 28, color, linkColor, pill, padX, padY }) {
  const px = padX ?? size * 1.1
  const py = padY ?? size * 0.5
  ctx.save()
  ctx.direction = 'rtl'
  ctx.textBaseline = 'alphabetic'
  ctx.font = font(400, size)
  const wLead = ctx.measureText(TOOL_CREDIT_LEAD).width
  ctx.font = font(700, size)
  const wLink = ctx.measureText(TOOL_CREDIT_LINK).width
  const gap = size * 0.5
  const total = wLead + gap + wLink
  const xR = cx + total / 2
  const xL = cx - total / 2
  const boxY = baseline - size * 0.95 - py
  const boxH = size * 1.45 + py * 2

  if (pill) {
    roundRect(ctx, xL - px, boxY, total + px * 2, boxH, boxH / 2)
    if (pill.fill) { ctx.fillStyle = pill.fill; ctx.fill() }
    if (pill.stroke) { ctx.strokeStyle = pill.stroke; ctx.lineWidth = pill.width || 2; ctx.stroke() }
  }

  ctx.fillStyle = color
  ctx.font = font(400, size)
  ctx.textAlign = 'right'
  ctx.fillText(TOOL_CREDIT_LEAD, xR, baseline)

  ctx.fillStyle = linkColor || color
  ctx.font = font(700, size)
  ctx.direction = 'ltr'
  ctx.textAlign = 'left'
  ctx.fillText(TOOL_CREDIT_LINK, xL, baseline)
  ctx.fillRect(xL, baseline + size * 0.14, wLink, Math.max(2, size * 0.06))
  ctx.restore()

  /* منطقة النقر تشمل السطر كله (العبارة والرابط) لا الرابط وحده */
  return { x: xL - size * 0.3, y: baseline - size * 1.05, w: total + size * 0.6, h: size * 1.5 }
}

export function canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('تعذّر إنشاء الصورة'))), type, quality)
  })
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/* هل يدعم الجهاز مشاركة ملف صورة (الهاتف غالباً)؟ */
let shareSupport
export function canShareFiles() {
  if (shareSupport !== undefined) return shareSupport
  shareSupport = detectShare()
  return shareSupport
}
function detectShare() {
  if (typeof navigator === 'undefined' || !navigator.canShare) return false
  try {
    return navigator.canShare({ files: [new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' })] })
  } catch { return false }
}

/* المشاركة (واتساب وغيره): الصورة مع نص مقترح يُلحق به دائماً اسم إحكام ورابطه،
   فيصل الرابط إلى من يستلم الصورة لا إلى المدير وحده. */
export async function shareBlob(blob, filename, text) {
  const file = new File([blob], filename, { type: blob.type })
  await navigator.share({ files: [file], text: [text, TOOL_SHARE_TAIL].filter(Boolean).join('\n\n') })
}

export function safeFileName(s, fallback) {
  const clean = String(s || '').replace(/[\\/:*?"<>|]+/g, '').trim().replace(/\s+/g, '-')
  return clean || fallback
}

/* ── بطاقة الشبكة (1080×1350): أيام الختمة خلايا، لكل خلية رقم اليوم وورده ──
   cells: [{ top, main, sub, done }] حتى 30 خلية */
export async function drawGridCard({ eyebrow, title, headline, cells, note }) {
  await ensureFonts()
  const W = 1080
  const H = 1350
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')
  ctx.direction = 'rtl'
  ctx.fillStyle = C.canvas
  ctx.fillRect(0, 0, W, H)

  const HEAD = 330
  const g = ctx.createLinearGradient(0, 0, 0, HEAD)
  g.addColorStop(0, C.ink)
  g.addColorStop(1, C.inkDeep)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, HEAD)
  patternFill(ctx, 0, 0, W, HEAD, { tile: 96, alpha: 0.10, width: 1.4 })
  ctx.fillStyle = C.goldSoft
  ctx.fillRect(0, HEAD - 6, W, 6)

  const R = W - 72
  ctx.textAlign = 'right'
  ctx.fillStyle = C.goldSoft
  ctx.font = font(700, 30)
  ctx.fillText(eyebrow, R, 90)
  ctx.fillStyle = '#F8F5EC'
  const t = fitText(ctx, title, { weight: 700, max: 60, min: 36, width: W - 144 })
  ctx.font = font(700, t.size)
  ctx.fillText(t.lines[0], R, 170)
  ctx.fillStyle = C.goldSoft
  const h = fitText(ctx, headline, { weight: 700, max: 44, min: 28, width: W - 144 })
  ctx.font = font(700, h.size)
  ctx.fillText(h.lines[0], R, 248)

  const n = Math.min(cells.length, 30)
  const cols = n <= 10 ? 2 : n <= 18 ? 3 : 5
  const rowsN = Math.ceil(n / cols)
  const top = HEAD + 40
  const bottom = H - (note ? 200 : 160)
  const gap = 12
  const cw = (W - 112 - gap * (cols - 1)) / cols
  const ch = Math.min(170, (bottom - top - gap * (rowsN - 1)) / rowsN)
  for (let i = 0; i < n; i++) {
    const c = cells[i]
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = W - 56 - (col + 1) * cw - col * gap
    const y = top + row * (ch + gap)
    roundRect(ctx, x, y, cw, ch, 18)
    ctx.fillStyle = c.done ? '#FBF1DD' : C.paper
    ctx.fill()
    ctx.strokeStyle = c.done ? 'rgba(184,134,58,.55)' : C.line
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.textAlign = 'center'
    const cx = x + cw / 2
    const k = Math.min(1, ch / 150)
    ctx.fillStyle = C.goldDeep
    ctx.font = font(700, 22 * k + 4)
    ctx.fillText(c.top, cx, y + ch * 0.3)
    ctx.fillStyle = C.text
    const m = fitText(ctx, c.main, { weight: 700, max: Math.round(34 * k + 4), min: 16, width: cw - 20 })
    ctx.font = font(700, m.size)
    ctx.fillText(m.lines[0], cx, y + ch * 0.62)
    if (c.sub) {
      ctx.fillStyle = C.text3
      const sb = fitText(ctx, c.sub, { weight: 400, max: Math.round(20 * k + 3), min: 13, width: cw - 20 })
      ctx.font = font(400, sb.size)
      ctx.fillText(sb.lines[0], cx, y + ch * 0.86)
    }
  }

  ctx.textAlign = 'center'
  if (note) {
    ctx.fillStyle = C.text2
    ctx.font = font(400, 27)
    ctx.fillText(fitText(ctx, note, { weight: 400, max: 27, min: 20, width: W - 140 }).lines[0], W / 2, H - 150)
  }
  drawCredit(ctx, { cx: W / 2, baseline: H - 66, size: 24, color: C.goldDeep, linkColor: C.ink })
  return cv
}

/* ── بطاقة القائمة (1080×1350): «خطة هذا الأسبوع» وأمثالها ──
   rows: [{ badge, badgeSub, text, sub, soft }] */
export async function drawListCard({ eyebrow, title, name, range, rows, note, emptyText }) {
  await ensureFonts()
  const W = 1080
  const H = 1350
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')
  ctx.direction = 'rtl'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = C.canvas
  ctx.fillRect(0, 0, W, H)

  /* الرأس الداكن */
  const HEAD = 300
  const g = ctx.createLinearGradient(0, 0, 0, HEAD)
  g.addColorStop(0, C.ink)
  g.addColorStop(1, C.inkDeep)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, HEAD)
  patternFill(ctx, 0, 0, W, HEAD, { tile: 96, alpha: 0.10, width: 1.4 })
  ctx.fillStyle = C.goldSoft
  ctx.fillRect(0, HEAD - 6, W, 6)

  const R = W - 72
  ctx.textAlign = 'right'
  ctx.fillStyle = C.goldSoft
  ctx.font = font(700, 30)
  ctx.fillText(eyebrow, R, 92)
  ctx.fillStyle = '#F8F5EC'
  const t = fitText(ctx, title, { weight: 700, max: 64, min: 40, width: W - 144 })
  ctx.font = font(700, t.size)
  ctx.fillText(t.lines[0], R, 176)
  ctx.font = font(400, 30)
  ctx.fillStyle = 'rgba(248,245,236,.82)'
  const meta = [name, range].filter(Boolean).join('  ·  ')
  if (meta) ctx.fillText(fitText(ctx, meta, { weight: 400, max: 30, min: 22, width: W - 144 }).lines[0], R, 238)

  /* الصفوف */
  const top = HEAD + 44
  const bottom = H - (note ? 200 : 160)
  const n = Math.max(rows.length, 1)
  const gap = 14
  const rowH = Math.min(150, (bottom - top - gap * (n - 1)) / n)
  const textSize = Math.max(24, Math.min(36, rowH * 0.3))
  const subSize = Math.max(19, Math.min(26, rowH * 0.2))

  if (!rows.length) {
    ctx.textAlign = 'center'
    ctx.fillStyle = C.text3
    ctx.font = font(400, 34)
    ctx.fillText(emptyText || 'لا شيء في هذا الأسبوع', W / 2, (top + bottom) / 2)
  }

  rows.forEach((r, i) => {
    const y = top + i * (rowH + gap)
    const x = 56
    const w = W - 112
    roundRect(ctx, x, y, w, rowH, 22)
    ctx.fillStyle = r.soft ? '#FBF1DD' : C.paper
    ctx.fill()
    ctx.strokeStyle = r.soft ? 'rgba(184,134,58,.45)' : C.line
    ctx.lineWidth = 2
    ctx.stroke()

    /* شارة اليوم على اليمين */
    const bw = Math.min(190, rowH * 1.45)
    const bx = x + w - bw - 14
    roundRect(ctx, bx, y + 14, bw, rowH - 28, 16)
    ctx.fillStyle = r.soft ? C.goldSoft : C.ink
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = r.soft ? C.ink : '#F8F5EC'
    const badgeSize = Math.max(22, Math.min(32, rowH * 0.24))
    ctx.font = font(700, badgeSize)
    const mid = y + rowH / 2
    if (r.badgeSub) {
      ctx.fillText(r.badge, bx + bw / 2, mid - 2)
      ctx.font = font(400, badgeSize * 0.72)
      ctx.fillStyle = r.soft ? 'rgba(11,59,51,.75)' : 'rgba(248,245,236,.75)'
      ctx.fillText(r.badgeSub, bx + bw / 2, mid + badgeSize * 0.85)
    } else {
      ctx.fillText(r.badge, bx + bw / 2, mid + badgeSize * 0.35)
    }

    /* النص */
    ctx.textAlign = 'right'
    const tx = bx - 26
    const tw = tx - (x + 26)
    const main = fitText(ctx, r.text, { weight: 700, max: textSize, min: 20, width: tw, lines: r.sub ? 1 : 2 })
    ctx.fillStyle = r.soft ? C.goldDeep : C.text
    ctx.font = font(700, main.size)
    if (r.sub) {
      ctx.fillText(main.lines[0], tx, mid - 4)
      ctx.font = font(400, subSize)
      ctx.fillStyle = C.text3
      ctx.fillText(fitText(ctx, r.sub, { weight: 400, max: subSize, min: 16, width: tw }).lines[0], tx, mid + subSize + 6)
    } else if (main.lines.length === 2) {
      ctx.fillText(main.lines[0], tx, mid - 6)
      ctx.fillText(main.lines[1], tx, mid + main.size + 2)
    } else {
      ctx.fillText(main.lines[0], tx, mid + main.size * 0.35)
    }
  })

  /* الملاحظة والسطر الثابت */
  ctx.textAlign = 'center'
  if (note) {
    ctx.fillStyle = C.text2
    ctx.font = font(400, 27)
    ctx.fillText(fitText(ctx, note, { weight: 400, max: 27, min: 20, width: W - 140 }).lines[0], W / 2, H - 150)
  }
  drawCredit(ctx, { cx: W / 2, baseline: H - 66, size: 24, color: C.goldDeep, linkColor: C.ink })
  return cv
}
