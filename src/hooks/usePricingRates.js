import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'

// Fallback values used when Supabase is unreachable or returns empty data.
// Mirrors the example DB row: {"1":0,"3":10,"6":15,"12":20}
const FALLBACK_DISCOUNTS = { 1: 0, 3: 0.10, 6: 0.15, 12: 0.20 }

/** Every term the platform can sell. What it *does* sell is `enabledDurations`,
 *  controlled by the Super Admin (لوحة التحكم → إعدادات الدفع). */
export const ALL_DURATIONS = [1, 3, 6, 12]

const FALLBACK = {
  baseFee  : 10,
  perStudent: 0.05,
  discounts : FALLBACK_DISCOUNTS,
  enabledDurations: ALL_DURATIONS,
}

/**
 * Coerce the `enabled_durations` row into a usable list.
 *
 * Every failure mode — missing key, bad JSON, not an array, unknown numbers,
 * or an array that filters down to nothing — collapses to all four rather than
 * to an empty list. An empty duration picker makes buying impossible, and one
 * malformed settings row must never be able to close the shop.
 */
function sanitizeDurations(raw) {
  let parsed = raw
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw) } catch { return ALL_DURATIONS }
  }
  if (!Array.isArray(parsed)) return ALL_DURATIONS

  const kept = ALL_DURATIONS.filter(m => parsed.includes(m))
  return kept.length > 0 ? kept : ALL_DURATIONS
}

// Accepts both integer (20) and decimal (0.20) storage formats.
function toDecimal(raw) {
  const n = Number(raw)
  if (isNaN(n)) return 0
  return n > 1 ? n / 100 : n
}

/**
 * Fetches pricing parameters from the `system_settings` key-value table.
 *
 * Keys queried:
 *   'base_platform_fee'   → fixed monthly platform fee
 *   'per_student_fee'     → monthly fee per active student
 *   'duration_discounts'  → JSONB like {"1":0,"3":10,"6":15,"12":20}
 *
 *   'enabled_durations'   → JSON array like [1,3,12] — terms offered for sale
 *
 * Returns:
 *   baseFee           – number
 *   perStudent        – number
 *   discounts         – { 1, 3, 6, 12 } normalised to decimals (0.20 = 20 %)
 *   enabledDurations  – subset of [1,3,6,12], never empty
 *   annualDiscountPct – alias for discounts[12] (backward compat for IhkaamCheckout)
 *   loading           – boolean
 */
export function usePricingRates() {
  const [rates, setRates] = useState(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['base_platform_fee', 'per_student_fee', 'duration_discounts', 'enabled_durations'])
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const kv = Object.fromEntries(data.map(r => [r.key, r.value]))

          const baseFee    = parseFloat(kv['base_platform_fee']) || FALLBACK.baseFee
          const perStudent = parseFloat(kv['per_student_fee'])   || FALLBACK.perStudent

          let discounts = { ...FALLBACK_DISCOUNTS }

          if (kv['duration_discounts'] != null) {
            try {
              const raw = typeof kv['duration_discounts'] === 'string'
                ? JSON.parse(kv['duration_discounts'])
                : kv['duration_discounts']

              discounts = {
                1 : toDecimal(raw?.['1']  ?? 0),
                3 : toDecimal(raw?.['3']  ?? FALLBACK_DISCOUNTS[3]),
                6 : toDecimal(raw?.['6']  ?? FALLBACK_DISCOUNTS[6]),
                12: toDecimal(raw?.['12'] ?? FALLBACK_DISCOUNTS[12]),
              }
            } catch {
              // Malformed JSON — keep fallback discounts
            }
          }

          setRates({
            baseFee,
            perStudent,
            discounts,
            enabledDurations: sanitizeDurations(kv['enabled_durations']),
          })
        }
        // On network error or empty result, rates stay at FALLBACK silently.
        setLoading(false)
      })
  }, [])

  return {
    ...rates,
    annualDiscountPct: rates.discounts[12], // backward compat alias
    loading,
  }
}
