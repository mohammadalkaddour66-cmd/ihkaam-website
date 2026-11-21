import { WEEKDAYS_AR, weekday, formatGregorian, formatHijri } from '../../tools/quran/dates.js'

/* تمييز العدد بالعربية: «يوم واحد، يومان، 3 أيام، 11 يوماً، 100 يوم». */
const NOUNS = {
  day: ['يوم واحد', 'يومان', 'أيام', 'يوماً', 'يوم'],
  page: ['صفحة واحدة', 'صفحتان', 'صفحات', 'صفحة', 'صفحة'],
  line: ['سطر واحد', 'سطران', 'أسطر', 'سطراً', 'سطر'],
  week: ['أسبوع واحد', 'أسبوعان', 'أسابيع', 'أسبوعاً', 'أسبوع'],
  month: ['شهر واحد', 'شهران', 'أشهر', 'شهراً', 'شهر'],
  juz: ['جزء واحد', 'جزءان', 'أجزاء', 'جزءاً', 'جزء'],
  khatma: ['ختمة واحدة', 'ختمتان', 'ختمات', 'ختمة', 'ختمة'],
  ayah: ['آية واحدة', 'آيتان', 'آيات', 'آية', 'آية'],
  hizb: ['حزب واحد', 'حزبان', 'أحزاب', 'حزباً', 'حزب'],
}

export function count(n, noun) {
  const [one, two, few, many, hundred] = NOUNS[noun]
  if (!Number.isInteger(n)) return `${n} ${hundred}`
  if (n === 1) return one
  if (n === 2) return two
  const r = n % 100
  if (r >= 3 && r <= 10) return `${n} ${few}`
  if (r >= 11) return `${n} ${many}`
  return `${n} ${hundred}`
}

export const dayName = (date) => WEEKDAYS_AR[weekday(date)]

/* «22 نوفمبر» و«22 نوفمبر 2026» */
export const gDate = (date, withYear = false) => formatGregorian(date, { withYear })
export const hDate = (date, withYear = false) => formatHijri(date, { withYear })

/* مدة تقويمية مقروءة: «67 يوماً (نحو شهرين)» */
export function spanLabel(days) {
  const base = count(days, 'day')
  if (days < 14) return base
  if (days < 60) return `${base} (نحو ${count(Math.round(days / 7), 'week')})`
  if (days < 730) return `${base} (نحو ${count(Math.round(days / 30.44), 'month')})`
  return `${base} (نحو ${Math.round((days / 365.25) * 10) / 10} سنة)`
}

/* «ص 22» أو «ص 22–23» */
export function pagesLabel(a, b) {
  const [x, y] = a <= b ? [a, b] : [b, a] // الحفظ من الناس يمشي نزولاً في الصفحات
  return x === y ? `ص ${x}` : `ص ${x}–${y}`
}

/* ترتيب الأجزاء بالكلمات، لعبارة الشهادة: «الجزء الثلاثون» */
const ORD = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر']
export function juzOrdinal(j) {
  if (j <= 10) return `الجزء ${ORD[j]}`
  if (j === 11) return 'الجزء الحادي عشر'
  if (j < 20) return `الجزء ${ORD[j - 10]} عشر`
  if (j === 20) return 'الجزء العشرون'
  if (j === 30) return 'الجزء الثلاثون'
  const unit = j - 20
  return `الجزء ${unit === 1 ? 'الحادي' : ORD[unit]} والعشرون`
}

/* أسماء الأجزاء المشهورة في الحلقات (والباقي برقمه) */
export const JUZ_NAMES = { 30: 'جزء عمّ', 29: 'جزء تبارك', 28: 'جزء قد سمع' }
export const juzLabel = (j) => (JUZ_NAMES[j] ? `${j}: ${JUZ_NAMES[j]}` : `الجزء ${j}`)
