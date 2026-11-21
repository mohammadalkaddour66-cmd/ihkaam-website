// حاسبة الختم والورد اليومي: صفحات كاملة لكل يوم، مع تقسيم اختياري على الصلوات الخمس.
import { QuranToolError, TOTAL_PAGES, pageStart, splitSeqEvenly, describeChunk } from './core.js'
import { addDays, daysBetween, weekday } from './dates.js'

export const PRAYERS_AR = ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء']

/** الصفحة العامة g (عبر ختمات متعددة) → { khatma, page } */
const unwrap = (g) => ({ khatma: Math.ceil(g / TOTAL_PAGES), page: ((g - 1) % TOTAL_PAGES) + 1 })

/** صفحات عامة [a..b] → قطع داخل كل ختمة. */
function pageRuns(a, b) {
  const runs = []
  let g = a
  while (g <= b) {
    const u = unwrap(g)
    const endInKhatma = u.khatma * TOTAL_PAGES
    const e = Math.min(b, endInKhatma)
    runs.push({ khatma: u.khatma, fromPage: u.page, toPage: unwrap(e).page })
    g = e + 1
  }
  return runs
}

function evenSplit(total, parts) {
  // حدود الأجزاء: الجزء d من (floor((d-1)·P/D)+1) إلى floor(d·P/D)
  const out = []
  for (let d = 1; d <= parts; d++) {
    out.push([Math.floor(((d - 1) * total) / parts) + 1, Math.floor((d * total) / parts)])
  }
  return out
}

function prayerSplit(ix, a, b) {
  const n = b - a + 1
  if (n >= PRAYERS_AR.length) {
    return evenSplit(n, PRAYERS_AR.length).map(([x, y], i) => ({
      prayer: PRAYERS_AR[i],
      runs: pageRuns(a + x - 1, a + y - 1),
      pages: y - x + 1,
    }))
  }
  // أقل من 5 صفحات: تقسيم بالآيات على أوزان متقاربة
  const seq = []
  for (const r of pageRuns(a, b)) {
    for (let p = r.fromPage; p <= r.toPage; p++) {
      for (let i = ix.pageFirst[p]; i <= ix.pageLast[p]; i++) seq.push(i)
    }
  }
  return splitSeqEvenly(ix, seq, PRAYERS_AR.length).map((part, i) => {
    const d = describeChunk(ix, seq, part.start, part.end)
    return { prayer: PRAYERS_AR[i], pieces: d.pieces, pages: d.pages }
  })
}

/**
 * @param {object} ix
 * @param {object} input
 * @param {'duration'|'pace'} input.mode
 *   duration: input.days أو input.endDate (مع startDate)، وkhatmas
 *   pace: input.pagesPerDay، وkhatmas
 * @param {number} [input.khatmas] الافتراضي 1
 * @param {string} [input.startDate] لإظهار التواريخ
 * @param {boolean} [input.prayers] تقسيم ورد اليوم على الصلوات الخمس
 */
export function generateKhatmPlan(ix, input) {
  const { mode = 'duration', khatmas = 1, startDate = null, prayers = false } = input
  if (!(Number.isInteger(khatmas) && khatmas >= 1)) throw new QuranToolError('BAD_KHATMAS', 'عدد الختمات عدد صحيح من 1 فأكثر')
  const P = TOTAL_PAGES * khatmas
  let bounds // [[a,b], …] صفحات عامة لكل يوم

  if (mode === 'duration') {
    let D = input.days
    if (input.endDate) {
      if (!startDate) throw new QuranToolError('BAD_DATE', 'حدد تاريخ البدء')
      D = daysBetween(startDate, input.endDate) + 1
    }
    if (!(Number.isInteger(D) && D >= 1)) throw new QuranToolError('BAD_DAYS', 'المدة يجب أن تكون يوماً واحداً فأكثر')
    if (D > P) throw new QuranToolError('TOO_LONG', `المدة أطول من عدد الصفحات (${P})؛ أقل ورد صفحة في اليوم`)
    bounds = evenSplit(P, D)
  } else if (mode === 'pace') {
    const n = input.pagesPerDay
    if (!(Number.isInteger(n) && n >= 1)) throw new QuranToolError('BAD_PACE', 'عدد الصفحات في اليوم عدد صحيح من 1 فأكثر')
    const D = Math.ceil(P / n)
    bounds = []
    for (let d = 1; d <= D; d++) bounds.push([(d - 1) * n + 1, Math.min(d * n, P)])
  } else throw new QuranToolError('BAD_MODE', `نمط غير معروف: ${mode}`)

  // مدة تنقسم على الأجزاء أو الأحزاب (30، 15، 10، 20، 60 يوماً…): كل يوم أجزاء أو أحزاب كاملة
  // من أول آية فيها، لا صفحات تقريبية. هذا ما ينتظره من يختم في رمضان «جزءاً كل يوم».
  if (mode === 'duration') {
    const D = bounds.length
    const unit = (30 * khatmas) % D === 0 ? 'juz' : (60 * khatmas) % D === 0 ? 'hizb' : null
    if (unit) return alignedKhatm(ix, { unit, D, khatmas, startDate, prayers })
  }

  const rows = bounds.map(([a, b], i) => {
    const s = unwrap(a)
    const e = unwrap(b)
    const date = startDate ? addDays(startDate, i) : null
    const row = {
      day: i + 1,
      date,
      weekday: date ? weekday(date) : null,
      pages: b - a + 1,
      runs: pageRuns(a, b),
      start: { khatma: s.khatma, ...pageStart(ix, s.page) },
      endPage: e.page,
      endsKhatma: e.page === TOTAL_PAGES ? e.khatma : null,
    }
    if (prayers) row.prayers = prayerSplit(ix, a, b)
    return row
  })
  return { rows, summary: summarize(rows, { khatmas, startDate, unit: 'pages' }) }
}

function summarize(rows, { khatmas, startDate, unit }) {
  const P = TOTAL_PAGES * khatmas
  const pp = rows.map((r) => r.pages)
  return {
    days: rows.length,
    unit, // 'pages' | 'juz' | 'hizb'
    totalPages: P,
    khatmas,
    minPagesPerDay: Math.min(...pp),
    maxPagesPerDay: Math.max(...pp),
    avgPagesPerDay: Math.round((P / rows.length) * 10) / 10,
    startDate,
    endDate: startDate ? addDays(startDate, rows.length - 1) : null,
  }
}

function alignedKhatm(ix, { unit, D, khatmas, startDate, prayers }) {
  const per = unit === 'juz' ? 30 : 60
  const total = per * khatmas
  const step = total / D
  // أول آية وآخر آية لكل حزب
  const hizbFirst = new Int32Array(61).fill(-1)
  const hizbLast = new Int32Array(61)
  if (unit === 'hizb') {
    for (let i = 0; i < ix.N; i++) {
      const h = ix.ayat[i].h
      if (hizbFirst[h] < 0) hizbFirst[h] = i
      hizbLast[h] = i
    }
  }
  const firstOf = (u) => (unit === 'juz' ? ix.juzFirst[u] : hizbFirst[u])
  const lastOf = (u) => (unit === 'juz' ? ix.juzLast[u] : hizbLast[u])

  const rows = []
  for (let d = 0; d < D; d++) {
    const g1 = d * step + 1 // وحدة عامة عبر الختمات
    const g2 = (d + 1) * step
    const k1 = Math.ceil(g1 / per)
    const k2 = Math.ceil(g2 / per)
    const u1 = ((g1 - 1) % per) + 1
    const u2 = ((g2 - 1) % per) + 1
    // تسلسل الآيات (قد يعبر من ختمة إلى التي تليها)
    const seq = []
    const push = (i, j) => { for (let x = i; x <= j; x++) seq.push(x) }
    if (k1 === k2) push(firstOf(u1), lastOf(u2))
    else { push(firstOf(u1), ix.N - 1); push(0, lastOf(u2)) }
    let pages = 0
    for (const a of seq) pages += ix.wPages[a]
    const s = ix.ayat[seq[0]]
    const e = ix.ayat[seq[seq.length - 1]]
    const date = startDate ? addDays(startDate, d) : null
    const runs = k1 === k2
      ? [{ khatma: k1, fromPage: s.p, toPage: e.p }]
      : [{ khatma: k1, fromPage: s.p, toPage: TOTAL_PAGES }, { khatma: k2, fromPage: 1, toPage: e.p }]
    const row = {
      day: d + 1,
      date,
      weekday: date ? weekday(date) : null,
      [unit]: { from: u1, to: u2 },
      pages: Math.round(pages * 10) / 10,
      runs,
      start: { khatma: k1, page: s.p, surah: s.s, name: ix.surahs[s.s].name, ayah: s.a, juz: s.j, hizb: s.h },
      end: { surah: e.s, name: ix.surahs[e.s].name, ayah: e.a },
      endPage: e.p,
      endsKhatma: u2 === per ? k2 : null,
    }
    if (prayers) {
      row.prayers = splitSeqEvenly(ix, seq, PRAYERS_AR.length).map((part, i) => {
        const dd = describeChunk(ix, seq, part.start, part.end)
        return { prayer: PRAYERS_AR[i], pieces: dd.pieces, pages: dd.pages }
      })
    }
    rows.push(row)
  }
  return { rows, summary: summarize(rows, { khatmas, startDate, unit }) }
}
