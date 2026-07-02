import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMagnetic } from '../hooks/useMagnetic'

export default function RippleButton({ children, className = '', style = {}, onClick, as: Tag = 'button', ...props }) {
  const [ripples, setRipples] = useState([])
  const containerRef = useRef(null)
  const { ref: magRef, x, y, onMouseMove, onMouseLeave } = useMagnetic(0.28)

  const setRef = (el) => {
    containerRef.current = el
    magRef.current = el
  }

  const addRipple = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const size = Math.max(rect.width, rect.height) * 2
    const ripple = {
      id: Date.now(),
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top  - size / 2,
      size,
    }
    setRipples(rs => [...rs, ripple])
    setTimeout(() => {
      setRipples(rs => rs.filter(r => r.id !== ripple.id))
    }, 700)

    onClick?.(e)
  }

  return (
    <motion.div
      ref={setRef}
      style={{ x, y, display: 'inline-block', ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Tag
        className={`relative overflow-hidden select-none ${className}`}
        onClick={addRipple}
        {...props}
      >
        {children}
        {ripples.map(r => (
          <span
            key={r.id}
            className="absolute rounded-full pointer-events-none animate-ripple"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
              background: 'rgba(255,255,255,0.18)',
            }}
          />
        ))}
      </Tag>
    </motion.div>
  )
}
