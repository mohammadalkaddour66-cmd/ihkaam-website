// نقطة الدخول للأدوات: تحمّل بيانات المصحف عند أول حساب فقط (import ديناميكي)،
// فلا تدخل 436 ك.ب. في الحزمة الرئيسية.
import { buildIndex } from './core.js'

let cached = null

export function loadQuranIndex() {
  cached ||= Promise.all([
    import('../../data/quran/ayat-lines.json'),
    import('../../data/quran/surahs.json'),
  ]).then(([a, s]) => buildIndex(a.default, s.default))
    .catch((e) => { cached = null; throw e })
  return cached
}

export * from './core.js'
export * from './dates.js'
export { HIFZ_AMOUNTS, buildHifzSequence, generateHifzPlan, weekRows } from './hifzPlan.js'
export { REVIEW_AMOUNTS, memorizedPages, reviewChunks, generateReviewPlan } from './reviewPlan.js'
export { PRAYERS_AR, generateKhatmPlan } from './khatm.js'
