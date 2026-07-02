import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function GlowCursor() {
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)
  const dotX   = useMotionValue(-200)
  const dotY   = useMotionValue(-200)

  const springX = useSpring(mouseX, { stiffness: 80,  damping: 18, mass: 0.5 })
  const springY = useSpring(mouseY, { stiffness: 80,  damping: 18, mass: 0.5 })
  const dotSX   = useSpring(dotX,   { stiffness: 280, damping: 22, mass: 0.2 })
  const dotSY   = useSpring(dotY,   { stiffness: 280, damping: 22, mass: 0.2 })

  const glowRef = useRef(null)
  const isTouch = useRef(typeof window !== 'undefined' && window.matchMedia('(pointer:coarse)').matches)

  useEffect(() => {
    if (isTouch.current) return
    const move = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      dotX.set(e.clientX)
      dotY.set(e.clientY)
    }
    const enter = () => { if (glowRef.current) glowRef.current.style.opacity = '1' }
    const leave = () => { if (glowRef.current) glowRef.current.style.opacity = '0' }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseenter', enter)
    document.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseenter', enter)
      document.removeEventListener('mouseleave', leave)
    }
  }, [])

  if (isTouch.current) return null

  return (
    <>
      {/* Outer glow ring — lags behind */}
      <motion.div
        ref={glowRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          zIndex: 99999,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid rgba(106,189,178,0.55)',
          boxShadow: '0 0 14px rgba(106,189,178,0.25)',
          background: 'transparent',
        }} />
      </motion.div>

      {/* Center dot — snappy */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: dotSX,
          y: dotSY,
          translateX: '-50%',
          translateY: '-50%',
          zIndex: 99999,
        }}
      >
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#6ABDB2',
          boxShadow: '0 0 8px rgba(106,189,178,0.9)',
        }} />
      </motion.div>
    </>
  )
}
