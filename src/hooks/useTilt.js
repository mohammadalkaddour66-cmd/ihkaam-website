import { useRef } from 'react'
import { useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

export function useTilt(strength = 10) {
  const ref = useRef(null)
  /* الإمالة ثلاثية الأبعاد من أكثر ما يثير الدوار عند الحساسين للحركة،
     وهي زينة محضة لا تنقل معنى — فتُطفأ كاملةً عند الطلب. */
  const reduce = useReducedMotion()
  const active = strength > 0 && !reduce

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const s = active ? strength : 0
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [s, -s]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-s, s]), { stiffness: 200, damping: 20 })
  const scale   = useSpring(1, { stiffness: 250, damping: 22 })

  const onMouseMove = (e) => {
    if (!active) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set((e.clientX - rect.left) / rect.width  - 0.5)
    rawY.set((e.clientY - rect.top)  / rect.height - 0.5)
  }
  const onMouseEnter = () => { if (active) scale.set(1.025) }
  const onMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
    scale.set(1)
  }

  return { ref, rotateX, rotateY, scale, onMouseMove, onMouseEnter, onMouseLeave }
}
