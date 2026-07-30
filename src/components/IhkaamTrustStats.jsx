import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { fetchLandingStats } from '../config/landingStats'

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
    <span className="inline-block w-20 h-9 rounded-lg animate-pulse" style={{ background: 'rgba(72, 214, 205,0.15)' }} />
  )
  return <>{to >= 1000 ? '+' + val.toLocaleString('en-US') : '+' + val}</>
}

/* ── Single stat ── */
function StatItem({ stat, index, inView, className = '' }) {
  return (
    <motion.div
      className={`relative flex flex-col items-center text-center gap-2 ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow behind number */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(72, 214, 205,0.07) 0%, transparent 70%)' }}
        aria-hidden
      />

      {/* textShadow حركةٌ تُعيد رسم النص في كل إطار — والوهج هنا
         لا يعني شيئاً، الرقم يعدّ أصلاً. أُبقي الوهج ثابتاً. */}
      <span
        className="font-black leading-none tabular-nums relative"
        style={{
          color     : 'var(--accent)',
          fontSize  : 'clamp(1.75rem, 3.5vw, 2.6rem)',
          textShadow: '0 0 24px rgba(72, 214, 205,0.28)',
        }}
      >
        {inView ? <CountUp to={stat.value} duration={1600 + index * 100} /> : '0'}
      </span>

      <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
        {stat.label}
      </span>

      {/* Divider (not last) — كان بيجاً. أربعة فواصل زخرفية تأكل من
          نصيب الثانويّ ما لا تعطي مقابله دلالةً: الفاصل بنيةٌ لا
          إنجاز، فلونُه لون البنية. */}
      {index < 4 && (
        <div
          className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-10"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--border-hi), transparent)' }}
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
    fetchLandingStats().then(s => {
      setCounts({
        institutes : s.institutes,
        students   : s.students,
        staff      : s.staff,
        circles    : s.groups,
        recitations: s.recitations,
      })
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
    <div id="stats" className="relative z-10 px-6 mt-8 sm:-mt-16">
      <div className="max-w-6xl mx-auto">

        <motion.div
          ref={ref}
          className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 rounded-2xl px-8 py-10 overflow-hidden"
          style={{
            background          : 'rgba(9,32,30,0.62)',
            backdropFilter      : 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
              stroke="rgba(72, 214, 205,0.18)"
              strokeWidth="1"
              pathLength="100"
            />

            {/* القوس الزاحف — كان #E5D3B3 نيوناً صريحاً على لوحة
               وُصفت بأنها «muted»، ويدور بلا توقّف بجوار أرقامٍ
               تعدّ. ضوءان متنافسان على العين في آنٍ واحد.
               صار بلون اللوحة، وبدورة أبطأ، وشدّة أقلّ. */}
            <rect
              x="1" y="1"
              width="calc(100% - 2px)" height="calc(100% - 2px)"
              rx="15" ry="15"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              pathLength="100"
              strokeDasharray="40 60"
              strokeLinecap="round"
              filter="url(#glow-stats)"
              className="snake-rect"
              style={{ '--snake-dur': '7s', opacity: 0.5 }}
            />
          </svg>

          {/* Ambient glow inside */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(72, 214, 205,0.05) 0%, transparent 70%)' }}
            aria-hidden
          />

          {/* خمسة عناصر في شبكةٍ من عمودين تترك الخامس يتيماً في
              آخر صف. يمتدّ على العمودين فيتوسّط بدل أن يعلَق جانباً.
              نفس العلّة عولجت في الشبكة الثلاثية قبل ذلك. */}
          {STATS.map((stat, i) => (
            <StatItem
              key={stat.key} stat={stat} index={i} inView={inView}
              className={i === STATS.length - 1 ? 'col-span-2 md:col-span-1' : ''}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
