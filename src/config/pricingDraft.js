/* ─────────────────────────────────────────────────────────────────────────
   PRICING DRAFT
   The configurator's state (duration / students / add-ons) survives a trip to
   checkout and back. Without this, pressing "العودة لتعديل الباقة" — or the
   browser's own back gesture — remounted the configurator at its defaults and
   the user had to rebuild their plan from scratch.

   sessionStorage, not localStorage: a plan is scoped to the visit, and it
   should not greet the user weeks later as if it were still current.
   ───────────────────────────────────────────────────────────────────────── */

const KEY = 'ihkaam:pricing-draft'

const ALLOWED_DURATIONS = [1, 3, 6, 12]
const MIN_STUDENTS = 10
const MAX_STUDENTS = 1000

/* Anything on the client can be edited by hand, so treat a stored draft as
   untrusted input and fall back rather than propagate a bad value into the
   price math. */
export function readPricingDraft() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null

    const draft = JSON.parse(raw)
    if (!draft || typeof draft !== 'object') return null

    const duration = ALLOWED_DURATIONS.includes(draft.duration) ? draft.duration : null
    const students = Number.isFinite(draft.students)
      ? Math.min(MAX_STUDENTS, Math.max(MIN_STUDENTS, Math.round(draft.students / 10) * 10))
      : null
    const selectedFeatureIds = Array.isArray(draft.selectedFeatureIds)
      ? draft.selectedFeatureIds.filter(id => typeof id === 'string' || Number.isFinite(id))
      : []

    if (duration === null && students === null && !selectedFeatureIds.length) return null
    return { duration, students, selectedFeatureIds }
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
