import { getActiveIds } from './activeInstitutes'
// كل أرقام الموقع تأتي من دالة تجميع واحدة (get_public_landing_stats) بدل
// عدّ الصفوف من المتصفح — الصفوف نفسها مقفلة على anon بعد تحصين RLS.
// الوعد مُخزَّن على مستوى الوحدة: الصفحة الواحدة قد تعرض HeroSection و
// IhkaamTrustStats و IhkaamByNumbers معاً، فتتشارك جميعها طلباً واحداً.
//
// supabaseClient يُستورد ديناميكياً داخل fetchLandingStats لا في أعلى الملف:
// ذاك الموديول يرمي عند التحميل إن غابت متغيرات البيئة، فاستيراده هنا كان
// يُسقط أي حزمة تضم IhkaamByNumbers أو IhkaamTrustStats — حتى لو لم يُطلب
// أي رقم. وكفائدة ثانية: مكتبة supabase (وهي ثقيلة) تخرج من المسار الحرج.

const EMPTY = {
  institutes: 0, students: 0, staff: 0, groups: 0,
  recitations: 0, recitationsQuran: 0, recitationsHadith: 0,
  recitations30d: 0, recitationsPrev30d: 0,
  tests: 0, stars: 0, subjects: 0,
  absences: 0, absences30d: 0,
  updatedAt: null,
}

let pending = null

/* توحيد الأرقام (2026-11-19، قرار المالك): الطلاب والكادر والحلقات والجلسات
   تُقرأ من get_public_quran_stats — نطاقٌ واحد في الموقع كله: كل معهدٍ عمل
   شهراً فأكثر ببيانات حقيقية، دون المحذوف والتجريبي. get_public_landing_stats
   القديمة كانت تعدّ كل صفٍّ بلا تصفية (المعاهد المحذوفة والعرض والتجريبي
   والجلسات المحذوفة)، فتقول الرئيسية 324 معلماً وصفحة المنصة 239.
   تبقى احتياطاً فقط إن تعذّر جلب الموحَّدة. */
function normalize(r) {
  const u = r.quran && typeof r.quran === 'object' ? r.quran : null
  const pick = (unified, legacy) => Number(u ? unified : legacy) || 0
  return {
    /* «معهد نشط» = العامل الآن (activeInstitutes.js) — عدّادٌ مختلف المعنى عن
       «عمل شهراً فأكثر» في «إحكام بالأرقام»، وكلاهما مسمّى بمعناه في الصفحة */
    institutes        : getActiveIds().size || Number(r.institutes) || 0,
    students          : pick(u?.students, r.students),
    staff             : pick(u?.staff, r.staff),
    groups            : pick(u?.groups, r.groups),
    recitations       : pick(u?.sessions, r.recitations),
    recitationsQuran  : Number(r.recitations_quran)    || 0,
    recitationsHadith : Number(r.recitations_hadith)   || 0,
    recitations30d    : pick(u?.sessions_30d, r.recitations_30d),
    recitationsPrev30d: Number(r.recitations_prev_30d) || 0,
    tests             : Number(r.tests)                || 0,
    stars             : Number(r.stars)                || 0,
    subjects          : Number(r.subjects)             || 0,
    absences          : Number(r.absences)             || 0,
    absences30d       : Number(r.absences_30d)         || 0,
    updatedAt         : typeof r.updated_at === 'string' ? r.updated_at : null,
    /* أرقام القرآن للمعاهد المفعّلة (get_public_quran_stats، 2026-11-19):
       تُخبز مع البقية تحت المفتاح quran، أو تُجلب في المتصفح */
    quran             : normalizeQuran(r.quran),
  }
}

export const KHATMA_PAGES = 604

function normalizeQuran(q) {
  if (!q || typeof q !== 'object') return null
  const n = (v) => Number(v) || 0
  return {
    institutes   : n(q.institutes),
    pages        : n(q.quran_pages),
    ghaybPages   : n(q.ghayb_pages),
    pages30d     : n(q.pages_30d),
    hadiths      : n(q.hadiths),
    juzPassed    : n(q.juz_passed),
    notifications: n(q.notifications),
    students     : n(q.students),
    staff        : n(q.staff),
    monthly      : Array.isArray(q.monthly) ? q.monthly.map(x => ({ m: String(x.m), pages: n(x.pages) })) : [],
  }
}

/* ISS-41: الأرقام المخبوزة وقت البناء. scripts/prerender.mjs يجلب الدالة مرة
   واحدة ويضعها في globalThis.__LANDING_STATS_RAW__ أثناء التصيير، ويكتبها في
   كل صفحة داخل <script type="application/json" id="landing-stats"> مع تاريخ
   البناء (updated_at). فتظهر القيم نفسها في HTML الرئيسية وصفحة المنصة،
   ويقرأ المتصفح الكتلة ذاتها فلا يختلف التهيئة عن التصيير. */
let baked
export function getBakedLandingStats() {
  if (baked !== undefined) return baked
  baked = null
  try {
    let raw = globalThis.__LANDING_STATS_RAW__
    if (!raw && typeof document !== 'undefined') {
      const el = document.getElementById('landing-stats')
      if (el) raw = JSON.parse(el.textContent)
    }
    if (raw) baked = normalize(raw)
  } catch { baked = null }
  return baked
}

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

/* "2026-11-13" ← «13 نوفمبر 2026». صياغة يدوية لا Intl، كي يطابق نصُّ
   الخادم نصَّ المتصفح حرفاً بحرف عند الإماهة. */
export function formatStatsDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  if (!m) return null
  return `${Number(m[3])} ${AR_MONTHS[Number(m[2]) - 1]} ${m[1]}`
}

export function fetchLandingStats() {
  if (pending) return pending

  /* نسخة البناء أولاً: الرقم والتاريخ يبقيان متطابقين في كل صفحة. الجلب
     الحيّ احتياطٌ لبيئة التطوير أو لبناءٍ فشل فيه الجلب. */
  const fromBuild = getBakedLandingStats()
  if (fromBuild) {
    pending = Promise.resolve(fromBuild)
    return pending
  }

  pending = import('./supabaseClient')
    .then(({ supabase }) => Promise.all([
      supabase.rpc('get_public_landing_stats'),
      supabase.rpc('get_public_quran_stats').then(x => x.data ?? null, () => null),
    ]).then(([res, quran]) => {
      const row = Array.isArray(res.data) ? res.data[0] : res.data
      return { ...res, data: row ? { ...row, quran } : row }
    }))
    .catch((err) => {
      // إعدادات ناقصة أو فشل تحميل العميل — نفس معالجة خطأ الـ RPC أدناه:
      // نسجّل بصوت عالٍ ونعيد الأصفار بدل أن نُسقط الصفحة كلها.
      console.error('[landingStats] تعذّر تحميل عميل supabase', err)
      pending = null
      return { data: null, error: err }
    })
    .then(({ data, error }) => {
      if (error) {
        console.error('[landingStats] RPC failed — شغّل supabase/migrations/20260713_public_landing_stats.sql', error)
        pending = null            // اسمح بإعادة المحاولة عند إعادة التركيب
        return EMPTY
      }
      const r = Array.isArray(data) ? data[0] : data
      if (!r) return EMPTY

      return { ...normalize(r), updatedAt: new Date().toISOString().slice(0, 10) }
    })

  return pending
}
