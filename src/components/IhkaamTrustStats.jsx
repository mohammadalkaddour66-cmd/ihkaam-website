import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { supabase } from '../config/supabaseClient'

/* ── Animated count-up ── */
function CountUp({ to, duration = 1800 }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    if (to == null) return
    const start = performance.now()
    const tick  = (now) => {
      const p      = Math.min((now - start) / duration, 1)
      const eased  = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(to * eased))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [to])

  if (to == null) return (
    <span className="inline-block w-20 h-9 rounded-lg animate-pulse" style={{ background: 'rgba(0,168,150,0.15)' }} />
  )
  return <>{to >= 1000 ? '+' + val.toLocaleString('en-US') : '+' + val}</>
}

/* ── Single stat ── */
function StatItem({ stat, index, inView }) {
  return (
    <motion.div
      className="relative flex flex-col items-center text-center gap-2"
      initial={{ opacity: 0, y: 40, scale: 0.85, filter: 'blur(6px)' }}
      animate={inView ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow behind number */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,168,150,0.07) 0%, transparent 70%)' }}
      />

      <motion.span
        className="font-black leading-none tabular-nums relative"
        style={{ color: '#00A896', fontSize: 'clamp(1.75rem, 3.5vw, 2.6rem)' }}
        animate={inView ? { textShadow: ['0 0 0px #00A896', '0 0 20px #00A89688', '0 0 8px #00A89644'] } : {}}
        transition={{ duration: 1.2, delay: index * 0.12 + 0.3 }}
      >
        {inView ? <CountUp to={stat.value} duration={1600 + index * 100} /> : '0'}
      </motion.span>

      <span className="text-sm font-medium" style={{ color: '#C8B8B0' }}>
        {stat.label}
      </span>

      {/* Divider (not last) */}
      {index < 4 && (
        <div
          className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-10"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(229,211,179,0.12), transparent)' }}
        />
      )}
    </motion.div>
  )
}

export default function IhkaamTrustStats() {
  const [counts, setCounts] = useState({
    institutes: null, students: null, staff: null, circles: null, recitations: null,
  })

  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    Promise.all([
      supabase.from('institutes').select('*',   { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('students').select('*',     { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('staff').select('*',        { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('groups').select('*',       { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('recitations').select('*',  { count: 'exact', head: true }),
    ]).then(([r1, r2, r3, r4, r5]) => {
      setCounts({ institutes: r1.count, students: r2.count, staff: r3.count, circles: r4.count, recitations: r5.count })
    })
  }, [])

  const STATS = [
    { key: 'recitations', value: counts.recitations, label: 'جلسة تسميع' },
    { key: 'circles',     value: counts.circles,     label: 'حلقة مفعلة'  },
    { key: 'staff',       value: counts.staff,       label: 'معلم ومشرف'  },
    { key: 'students',    value: counts.students,    label: 'طالب نشط'    },
    { key: 'institutes',  value: counts.institutes,  label: 'مؤسسة قرآنية' },
  ]

  return (
    <div id="stats" className="relative z-10 px-6 -mt-16">
      <div className="max-w-6xl mx-auto">

        <motion.div
          ref={ref}
          className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 rounded-2xl px-8 py-10 overflow-hidden"
          style={{
            background          : 'rgba(1,38,38,0.62)',
            backdropFilter      : 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, y: 50, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.70, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Luxury glowing border */}
          <svg
            aria-hidden
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible', pointerEvents:'none' }}
          >
            <defs>
              <filter id="glow-stats" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur1"/>
                <feGaussianBlur stdDeviation="7" result="blur2"/>
                <feMerge>
                  <feMergeNode in="blur2"/>
                  <feMergeNode in="blur1"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Base border — always visible, dim */}
            <rect
              x="1" y="1"
              width="calc(100% - 2px)" height="calc(100% - 2px)"
              rx="15" ry="15"
              fill="none"
              stroke="rgba(0,168,150,0.18)"
              strokeWidth="1"
              pathLength="100"
            />

            {/* Glowing arc — travels the full perimeter */}
            <rect
              x="1" y="1"
              width="calc(100% - 2px)" height="calc(100% - 2px)"
              rx="15" ry="15"
              fill="none"
              stroke="#6AFFF5"
              strokeWidth="2"
              pathLength="100"
              strokeDasharray="55 45"
              strokeLinecap="round"
              filter="url(#glow-stats)"
              className="snake-rect"
              style={{ '--snake-dur': '4s', opacity: 0.85 }}
            />
          </svg>

          {/* Ambient glow inside */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(0,168,150,0.05) 0%, transparent 70%)' }}
          />

          {STATS.map((stat, i) => (
            <StatItem key={stat.key} stat={stat} index={i} inView={inView} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
