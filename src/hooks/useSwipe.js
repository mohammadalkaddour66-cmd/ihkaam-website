import { useRef } from 'react'

const THRESHOLD = 40

/**
 * Detects a horizontal swipe gesture. Vertical scrolling is left untouched —
 * the swipe only fires when horizontal movement clearly dominates.
 */
export function useSwipe(onSwipeLeft, onSwipeRight) {
  const start = useRef(null)

  const onTouchStart = (e) => {
    const t = e.touches[0]
    start.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchMove = () => {}

  const onTouchEnd = (e) => {
    if (!start.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.current.x
    const dy = t.clientY - start.current.y
    start.current = null

    if (Math.abs(dx) < THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) onSwipeLeft?.()
    else onSwipeRight?.()
  }

  return { onTouchStart, onTouchMove, onTouchEnd }
}
