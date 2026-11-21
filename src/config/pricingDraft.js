/* ─────────────────────────────────────────────────────────────────────────
   PRICING DRAFT
   The visitor's choice (plan / billing cycle / add-ons) survives a trip to
   checkout and back, so "العودة لتعديل الباقة" — or the browser's own back
   gesture — doesn't reset the page.

   sessionStorage, not localStorage: a plan is scoped to the visit, and it
   should not greet the user weeks later as if it were still current.

   2026-11-20: الباقات حلّت محلّ الحاسبة، فالمسوّدة تحمل planId وcycle بدل
   students وduration. مسوّدةٌ قديمة بالشكل السابق تُهمل بهدوء.
   ───────────────────────────────────────────────────────────────────────── */
import { getPlan, CYCLES } from './plans'

const KEY = 'ihkaam:pricing-draft'

/* Anything on the client can be edited by hand, so treat a stored draft as
   untrusted input and fall back rather than propagate a bad value into the
   price math. */
export function readPricingDraft() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null

    const draft = JSON.parse(raw)
    if (!draft || typeof draft !== 'object') return null

    const plan  = getPlan(draft.planId)
    const cycle = CYCLES[draft.cycle] ? draft.cycle : null
    const selectedFeatureIds = Array.isArray(draft.selectedFeatureIds)
      ? draft.selectedFeatureIds.filter(id => typeof id === 'string' || Number.isFinite(id))
      : []

    if (!plan && !cycle && !selectedFeatureIds.length) return null
    return { planId: plan?.id ?? null, cycle, selectedFeatureIds }
  } catch {
    /* Private-mode Safari throws on sessionStorage access; a lost draft is
       not worth breaking the page over. */
    return null
  }
}

export function writePricingDraft(draft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft))
  } catch { /* storage unavailable — the page still works, the draft just won't persist */ }
}

export function clearPricingDraft() {
  try {
    sessionStorage.removeItem(KEY)
  } catch { /* nothing to clean up if storage is unavailable */ }
}
