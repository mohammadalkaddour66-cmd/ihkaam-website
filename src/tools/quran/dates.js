// تواريخ بصيغة 'YYYY-MM-DD' تُحسب على UTC، فلا يؤثر فيها التوقيت الصيفي ولا منطقة المستخدم.
import { QuranToolError } from './core.js'

export const WEEKDAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

const RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseDate(str) {
  const m = RE.exec(str || '')
  if (!m) throw new QuranToolError('BAD_DATE', `تاريخ غير صالح: ${str}`)
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  if (d.getUTCMonth() !== +m[2] - 1) throw new QuranToolError('BAD_DATE', `تاريخ غير صالح: ${str}`)
  return d
}

export function toDateStr(d) {
  return d.toISOString().slice(0, 10)
}

export function addDays(str, n) {
  const d = parseDate(str)
  d.setUTCDate(d.getUTCDate() + n)
  return toDateStr(d)
}

/** 0 = الأحد … 6 = السبت */
export function weekday(str) {
  return parseDate(str).getUTCDay()
}

/** عدد الأيام من a إلى b (b − a). */
export function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / 86400000)
}

/** تاريخ اليوم المحلي للمستخدم بصيغة YYYY-MM-DD. */
export function todayStr(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

let hijriPartsFmt
/** التاريخ الهجري (أم القرى) كأرقام: { y, m, d }. */
export function hijriParts(str) {
  hijriPartsFmt ||= new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
    timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric',
  })
  const parts = hijriPartsFmt.formatToParts(parseDate(str))
  const get = (t) => +parts.find((p) => p.type === t).value
  return { y: get('year'), m: get('month'), d: get('day') }
}

export const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
]
export const GREGORIAN_MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

/** «3 رمضان 1448هـ» */
export function formatHijri(str, { withYear = true } = {}) {
  const { y, m, d } = hijriParts(str)
  return `${d} ${HIJRI_MONTHS_AR[m - 1]}${withYear ? ` ${y}هـ` : ''}`
}

/** «8 فبراير 2027» */
export function formatGregorian(str, { withYear = true } = {}) {
  const d = parseDate(str)
  return `${d.getUTCDate()} ${GREGORIAN_MONTHS_AR[d.getUTCMonth()]}${withYear ? ` ${d.getUTCFullYear()}` : ''}`
}

/**
 * بداية شهر هجري وطوله بحسب تقويم أم القرى.
 * @returns {{start:string, days:number}}
 */
export function hijriMonth(hijriYear, month) {
  // تقدير أولي: السنة الهجرية ≈ 354.367 يوماً، و1 محرم 1446 = 2024-07-07
  const approx = addDays('2024-07-07', Math.round((hijriYear - 1446) * 354.367 + (month - 1) * 29.53))
  let d = addDays(approx, -20)
  for (let k = 0; k < 60; k++, d = addDays(d, 1)) {
    const h = hijriParts(d)
    if (h.y === hijriYear && h.m === month && h.d === 1) {
      let len = 29
      while (hijriParts(addDays(d, len)).m === month) len++
      return { start: d, days: len }
    }
  }
  throw new QuranToolError('BAD_HIJRI', `تعذّر حساب الشهر ${month} من ${hijriYear}`)
}

/** رمضان القادم (أو الجاري) بالنسبة إلى تاريخ ما. */
export function nextRamadan(fromStr) {
  const h = hijriParts(fromStr)
  const year = h.m <= 9 ? h.y : h.y + 1
  const r = hijriMonth(year, 9)
  if (daysBetween(fromStr, addDays(r.start, r.days - 1)) < 0) return { year: year + 1, ...hijriMonth(year + 1, 9) }
  return { year, ...r }
}

/**
 * يولّد أيام الدراسة بدءاً من تاريخ، على أيام الأسبوع المختارة.
 * @param {string} startDate
 * @param {number[]} weekdays أيام الأسبوع (0 = الأحد)
 */
export function* studyDays(startDate, weekdays) {
  const set = new Set(weekdays)
  if (!set.size) throw new QuranToolError('NO_DAYS', 'اختر يوماً واحداً على الأقل في الأسبوع')
  let d = startDate
  parseDate(d)
  for (;;) {
    if (set.has(weekday(d))) yield d
    d = addDays(d, 1)
  }
}
