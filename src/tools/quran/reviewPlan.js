// مولّد جدول المراجعة: دورة تمرّ على المحفوظ كله بمقدار يومي ثابت، مع السبقي اختيارياً.
import { QuranToolError, TOTAL_PAGES, pageStart } from './core.js'
import { studyDays, weekday, daysBetween } from './dates.js'

export const REVIEW_AMOUNTS = [
  { id: 'p5', unit: 'pages', value: 5, label: '5 صفحات' },
  { id: 'p10', unit: 'pages', value: 10, label: '10 صفحات' },
  { id: 'j1', unit: 'juz', value: 1, label: 'جزء' },
  { id: 'j2', unit: 'juz', value: 2, label: 'جزءان' },
]

/** صفحات المحفوظ [from, to] من مدخل أجزاء أو صفحات. */
export function memorizedPages(ix, range) {
  if (range.type === 'juz') {
    const a = Math.min(range.from, range.to)
    const b = Math.max(range.from, range.to)
    if (!(a >= 1 && b <= 30)) throw new QuranToolError('BAD_RANGE', 'الأجزاء من 1 إلى 30')
    return { from: ix.ayat[ix.juzFirst[a]].p, to: ix.ayat[ix.juzLast[b]].p, juzFrom: a, juzTo: b }
  }
  if (range.type === 'pages') {
    const a = Math.min(range.from, range.to)
    const b = Math.max(range.from, range.to)
    if (!(a >= 1 && b <= TOTAL_PAGES)) throw new QuranToolError('BAD_RANGE', 'الصفحات من 1 إلى 604')
    return { from: a, to: b, juzFrom: ix.ayat[ix.pageFirst[a]].j, juzTo: ix.ayat[ix.pageLast[b]].j }
  }
  throw new QuranToolError('BAD_RANGE', `نوع نطاق غير معروف: ${range.type}`)
}

/** حدود الجزء بالصفحات (قد يبدأ الجزء في منتصف صفحة). */
function juzPages(ix, j) {
  return { from: ix.ayat[ix.juzFirst[j]].p, to: ix.ayat[ix.juzLast[j]].p }
}

/**
 * يقسم المحفوظ إلى وحدات مراجعة يومية.
 * @returns {Array<{fromPage:number,toPage:number,pages:number,juzFrom?:number,juzTo?:number}>}
 */
export function reviewChunks(ix, range, amount, order = 'asc') {
  const m = memorizedPages(ix, range)
  const out = []
  if (amount.unit === 'pages') {
    const n = amount.value
    if (!(n >= 1 && Number.isInteger(n))) throw new QuranToolError('BAD_AMOUNT', 'عدد صفحات المراجعة عدد صحيح')
    if (order === 'asc') {
      for (let p = m.from; p <= m.to; p += n) out.push(pagesChunk(p, Math.min(p + n - 1, m.to)))
    } else {
      for (let p = m.to; p >= m.from; p -= n) out.push(pagesChunk(Math.max(p - n + 1, m.from), p))
    }
  } else if (amount.unit === 'juz') {
    const n = amount.value
    if (!(n >= 1 && Number.isInteger(n))) throw new QuranToolError('BAD_AMOUNT', 'عدد أجزاء المراجعة عدد صحيح')
    const a = m.juzFrom
    const b = m.juzTo
    const make = (j1, j2) => {
      const from = Math.max(juzPages(ix, j1).from, m.from)
      const to = Math.min(juzPages(ix, j2).to, m.to)
      return { ...pagesChunk(from, to), juzFrom: j1, juzTo: j2 }
    }
    if (order === 'asc') for (let j = a; j <= b; j += n) out.push(make(j, Math.min(j + n - 1, b)))
    else for (let j = b; j >= a; j -= n) out.push(make(Math.max(j - n + 1, a), j))
  } else throw new QuranToolError('BAD_AMOUNT', `وحدة غير معروفة: ${amount.unit}`)
  return out.map((c) => ({ ...c, start: pageStart(ix, c.fromPage) }))
}

function pagesChunk(fromPage, toPage) {
  return { fromPage, toPage, pages: toPage - fromPage + 1 }
}

/**
 * @param {object} ix
 * @param {object} input
 * @param {{type:'juz'|'pages', from:number, to:number}} input.range المحفوظ
 * @param {{unit:'pages'|'juz', value:number}} input.amount المقدار اليومي
 * @param {'asc'|'desc'} [input.order] asc: من الفاتحة نحو الناس. desc: لمن حفظ من الناس صعوداً
 * @param {number} [input.sabaqiPages] السبقي: آخر N صفحات حُفظت، تُراجَع يومياً
 * @param {string} input.startDate
 * @param {number[]} input.weekdays
 * @param {number} [input.cycles] عدد الدورات المعروضة (الافتراضي 1)
 */
export function generateReviewPlan(ix, input) {
  const { range, amount, order = 'asc', sabaqiPages = 0, startDate, weekdays, cycles = 1 } = input
  const m = memorizedPages(ix, range)
  const chunks = reviewChunks(ix, range, amount, order)

  let sabaqi = null
  if (sabaqiPages > 0) {
    const n = Math.min(sabaqiPages, m.to - m.from + 1)
    // الأحدث حفظاً: آخر النطاق لمن يحفظ من البقرة، وأوّله لمن يحفظ من الناس
    sabaqi = order === 'asc'
      ? { fromPage: m.to - n + 1, toPage: m.to, pages: n }
      : { fromPage: m.from, toPage: m.from + n - 1, pages: n }
    sabaqi.start = pageStart(ix, sabaqi.fromPage)
  }

  const rows = []
  const days = studyDays(startDate, weekdays)
  let cycleEnd = null
  for (let c = 1; c <= cycles; c++) {
    chunks.forEach((chunk, i) => {
      const date = days.next().value
      rows.push({ date, weekday: weekday(date), cycle: c, index: i + 1, review: chunk, sabaqi })
      if (c === 1 && i === chunks.length - 1) cycleEnd = date
    })
  }
  return {
    rows,
    summary: {
      startDate,
      memorized: m,
      totalPages: m.to - m.from + 1,
      cycleStudyDays: chunks.length,
      // «تختم مراجعة محفوظك كل N يوماً» (أيام تقويمية)
      cycleCalendarDays: daysBetween(startDate, cycleEnd) + 1,
      cycleEndDate: cycleEnd,
    },
  }
}
