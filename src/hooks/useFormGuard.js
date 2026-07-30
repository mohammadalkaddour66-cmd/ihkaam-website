import { useRef, useState, useMemo, useEffect } from 'react'

/*
 * Abuse guard for the public forms.
 *
 * Every public form writes straight into the shared production database with
 * the anon key, and an insert into demo_requests / tenant_requests /
 * testimonials fires a trigger that pushes a notification to the admin's
 * phone. Without a guard, anyone can flood that from the browser console.
 *
 * Three cheap layers, no third-party service:
 *   1. Honeypot  — a field only a bot fills. Fake success, never inserted.
 *   2. Time trap — instant submits are scripted, not typed.
 *   3. Cooldown  — one submission per form per minute, per browser.
 *
 * This is friction, not enforcement — a determined attacker with the anon key
 * bypasses all of it. Real enforcement belongs in the database (rate limit or
 * Turnstile on an edge function); this stops the drive-by case.
 */

const STORAGE_PREFIX = 'ihkaam_fg_'

/* localStorage throws in some private-browsing modes — never let that break a submit */
function readLast(key) {
  try {
    return Number(window.localStorage.getItem(STORAGE_PREFIX + key)) || 0
  } catch {
    return 0
  }
}

function writeLast(key, ts) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, String(ts))
  } catch {
    /* ignore — the other two layers still apply */
  }
}

/**
 * @param {string} formKey      unique per form, namespaces the cooldown
 * @param {object} [opts]
 * @param {number} [opts.cooldownMs] minimum gap between two submissions
 * @param {number} [opts.minFillMs]  minimum time on the form before submitting
 */
export function useFormGuard(formKey, { cooldownMs = 60_000, minFillMs = 1_200 } = {}) {
  /* Stamped in an effect, not at render — Date.now() is impure */
  const mountedAt = useRef(0)
  useEffect(() => { mountedAt.current = Date.now() }, [])

  const [trap, setTrap] = useState('')

  /* Off-screen rather than display:none — some bots skip hidden fields */
  const honeypotProps = useMemo(() => ({
    type          : 'text',
    name          : 'company_website',
    value         : trap,
    onChange      : e => setTrap(e.target.value),
    tabIndex      : -1,
    autoComplete  : 'off',
    'aria-hidden' : true,
    style         : {
      position     : 'absolute',
      width        : 1,
      height       : 1,
      padding      : 0,
      border       : 0,
      opacity      : 0,
      pointerEvents: 'none',
      insetInlineStart: '-9999px',
    },
  }), [trap])

  /**
   * Call before writing to the database.
   * @returns {{ok: true} | {ok: false, silent: true} | {ok: false, message: string}}
   */
  function guardSubmit() {
    /* 1. Honeypot — no human reaches this field */
    if (trap) return { ok: false, silent: true }

    /* 2. Time trap — heuristic, so it asks for a retry instead of dropping */
    if (Date.now() - mountedAt.current < minFillMs) {
      return { ok: false, message: 'تمهّل لحظة ثم أعد الإرسال.' }
    }

    /* 3. Cooldown */
    const elapsed = Date.now() - readLast(formKey)
    if (elapsed < cooldownMs) {
      const wait = Math.ceil((cooldownMs - elapsed) / 1000)
      return { ok: false, message: `أرسلت طلباً للتو — انتظر ${wait} ثانية.` }
    }

    return { ok: true }
  }

  /* Call only after the insert succeeds, so a failed attempt costs no cooldown */
  function markSubmitted() {
    writeLast(formKey, Date.now())
  }

  return { honeypotProps, guardSubmit, markSubmitted }
}
