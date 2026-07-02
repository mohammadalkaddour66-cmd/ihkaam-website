import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const STORAGE_KEY = 'ihkaam_ref'
const TTL_MS      = 30 * 24 * 60 * 60 * 1000  // 30 days

export function useAffiliateRef() {
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const ref    = params.get('ref')
    if (!ref) return

    /* Persist with expiry so a 30-day-old click still gets attributed */
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      code   : ref.trim().toUpperCase(),
      capturedAt: Date.now(),
    }))
  }, [location.search])
}

/* Read the stored ref code (call from checkout) */
export function getStoredRef() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { code, capturedAt } = JSON.parse(raw)
    if (Date.now() - capturedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return code
  } catch {
    return null
  }
}
