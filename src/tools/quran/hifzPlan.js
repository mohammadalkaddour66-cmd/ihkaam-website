// مولّد خطة الحفظ: يقسم المقدار المطلوب حفظه إلى مقاطع يومية بالتواريخ.
import {
  QuranToolError, ayahIndex, rangeSeq, chunkSequence, describeChunk, EPS,
} from './core.js'
import { studyDays, weekday, daysBetween } from './dates.js'

/** المقادير اليومية المعروضة في الأداة. */
export const HIFZ_AMOUNTS = [
  { id: 'l3', unit: 'lines', value: 3, label: '3 أسطر' },
  { id: 'l5', unit: 'lines', value: 5, label: '5 أسطر' },
  { id: 'l7', unit: 'lines', value: 7, label: '7 أسطر' },
  { id: 'p0.5', unit: 'pages', value: 0.5, label: 'نصف صفحة' },
  { id: 'p1', unit: 'pages', value: 1, label: 'صفحة' },
  { id: 'p1.5', unit: 'pages', value: 1.5, label: 'صفحة ونصف' },
  { id: 'p2', unit: 'pages', value: 2, label: 'صفحتان' },
]

/**
 * يبني تسلسل الآيات المطلوب حفظها.
 * forward: من نقطة البدء نحو آخر المصحف.
 * reverse: بالسور من نقطة البدء نزولاً (الناس ثم الفلق…)، وكل سورة تُقرأ من أولها.
 */
export function buildHifzSequence(ix, { direction = 'forward', start, target }) {
  const startIdx = ayahIndex(ix, start.surah, start.ayah || 1)
  const startAyah = ix.ayat[startIdx]
  const t = target || { type: 'all' }

  if (direction === 'forward') {
    let endIdx
    if (t.type === 'all') endIdx = ix.N - 1
    else if (t.type === 'juzEnd') endIdx = ix.juzLast[startAyah.j]
    else if (t.type === 'surah') {
      if (!(t.surah >= startAyah.s && t.surah <= 114)) throw new QuranToolError('BAD_TARGET', 'سورة الهدف قبل نقطة البدء')
      endIdx = ix.surahEnd[t.surah]
    } else if (t.type === 'pages') {
      endIdx = endByPages(ix, rangeSeq(startIdx, ix.N - 1), t.pages)
      return rangeSeq(startIdx, startIdx + endIdx)
    } else throw new QuranToolError('BAD_TARGET', `هدف غير معروف: ${t.type}`)
    return rangeSeq(startIdx, endIdx)
  }

  if (direction === 'reverse') {
    let lastSurah
    if (t.type === 'all' || t.type === 'pages') lastSurah = 1
    else if (t.type === 'surah') {
      if (!(t.surah >= 1 && t.surah <= startAyah.s)) throw new QuranToolError('BAD_TARGET', 'سورة الهدف بعد نقطة البدء في الاتجاه العكسي')
      lastSurah = t.surah
    } else if (t.type === 'juzEnd') {
      // إتمام الجزء: نزولاً إلى أول سورة تبدأ فيه، وتُحفظ كاملة ولو بدأت في الجزء السابق
      lastSurah = ix.ayat[ix.juzFirst[startAyah.j]].s
    } else throw new QuranToolError('BAD_TARGET', `هدف غير معروف: ${t.type}`)
    const seq = []
    for (let s = startAyah.s; s >= lastSurah; s--) {
      const from = s === startAyah.s ? startIdx : ix.surahStart[s]
      for (let i = from; i <= ix.surahEnd[s]; i++) seq.push(i)
    }
    if (t.type === 'pages') return seq.slice(0, endByPages(ix, seq, t.pages) + 1)
    return seq
  }
  throw new QuranToolError('BAD_DIRECTION', `اتجاه غير معروف: ${direction}`)
}

function endByPages(ix, seq, pages) {
  if (!(pages > 0)) throw new QuranToolError('BAD_TARGET', 'عدد الصفحات يجب أن يكون أكبر من صفر')
  let c = 0
  for (let k = 0; k < seq.length; k++) {
    c += ix.wPages[seq[k]]
    if (c >= pages - EPS) return k
  }
  return seq.length - 1
}

/**
 * @param {object} ix فهرس buildIndex
 * @param {object} input
 * @param {'forward'|'reverse'} input.direction
 * @param {{surah:number, ayah?:number}} input.start
 * @param {{type:'all'|'juzEnd'|'surah'|'pages', surah?:number, pages?:number}} input.target
 * @param {{unit:'lines'|'pages', value:number}} input.amount
 * @param {string} input.startDate 'YYYY-MM-DD'
 * @param {number[]} input.weekdays أيام الدراسة (0 = الأحد)
 * @param {number|null} [input.consolidationDay] يوم تثبيت أسبوعي بلا جديد (من أيام الدراسة)
 * @param {boolean} [input.surahAware] احترام نهايات السور؛ الافتراضي: نعم في الأسطر ونصف الصفحة والاتجاه العكسي
 */
export function generateHifzPlan(ix, input) {
  const { direction = 'forward', amount, startDate, weekdays, consolidationDay = null } = input
  if (!amount || !(amount.value > 0)) throw new QuranToolError('BAD_AMOUNT', 'اختر المقدار اليومي')
  const newDays = weekdays.filter((d) => d !== consolidationDay)
  if (!newDays.length) throw new QuranToolError('NO_DAYS', 'يجب أن يبقى يوم حفظ واحد على الأقل غير يوم التثبيت')

  const seq = buildHifzSequence(ix, input)
  const surahAware = input.surahAware ?? (
    amount.unit === 'lines' || amount.value < 1 || direction === 'reverse'
  )
  const chunks = chunkSequence(ix, seq, { unit: amount.unit, amount: amount.value, surahAware })
  const segments = chunks.map((c) => describeChunk(ix, seq, c.start, c.end))

  const rows = []
  let k = 0
  let sinceConsolidation = []
  const days = studyDays(startDate, weekdays)
  while (k < segments.length) {
    const date = days.next().value
    const wd = weekday(date)
    if (wd === consolidationDay) {
      // لا يوم تثبيت قبل أي حفظ جديد
      if (!sinceConsolidation.length) continue
      rows.push({ date, weekday: wd, type: 'consolidate', reviewOf: sinceConsolidation })
      sinceConsolidation = []
      continue
    }
    const seg = segments[k++]
    rows.push({ date, weekday: wd, type: 'new', index: k, ...seg })
    sinceConsolidation.push(k)
  }

  const newRows = rows.filter((r) => r.type === 'new')
  const endDate = newRows.length ? newRows[newRows.length - 1].date : startDate
  let totalPages = 0
  let totalLines = 0
  for (const a of seq) { totalPages += ix.wPages[a]; totalLines += ix.wLines[a] }
  return {
    rows,
    summary: {
      startDate,
      endDate,
      calendarDays: daysBetween(startDate, endDate) + 1,
      newDays: newRows.length,
      consolidationDays: rows.length - newRows.length,
      totalPages: Math.round(totalPages * 10) / 10,
      totalLines: Math.round(totalLines),
      totalAyat: seq.length,
      surahAware,
    },
  }
}

/** صفوف أسبوع واحد يبدأ من تاريخ معيّن (لصورة «خطة هذا الأسبوع»). */
export function weekRows(plan, fromDate) {
  return plan.rows.filter((r) => {
    const d = daysBetween(fromDate, r.date)
    return d >= 0 && d < 7
  })
}
