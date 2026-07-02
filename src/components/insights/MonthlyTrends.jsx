import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const MONTH_NAMES = [
  '', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

function SVGChart({ data, width, height, color = '#6ABDB2' }) {
  if (!data.length) return null

  const padT = 20, padB = 30, padL = 6, padR = 6
  const W = Math.max(width - padL - padR, 1)
  const H = Math.max(height - padT - padB, 1)
  const max = Math.max(...data.map(d => d.count), 1)

  const x = (i) => padL + (i / Math.max(data.length - 1, 1)) * W
  const y = (v) => padT + H - (v / max) * H

  const linePts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.count).toFixed(1)}`)
  const lineD   = linePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`).join(' ')
  const areaD   = `${lineD} L ${x(data.length - 1).toFixed(1)},${(padT + H).toFixed(1)} L ${padL},${(padT + H).toFixed(1)} Z`

  const gradId = `mg-${color.replace('#', '')}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full block"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f}
          x1={padL} y1={padT + H * (1 - f)}
          x2={padL + W} y2={padT + H * (1 - f)}
          stroke="rgba(255,255,255,0.04)" strokeWidth={1}
        />
      ))}

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradId})`} />

      {/* Line */}
      <path d={lineD} fill="none" stroke={color} strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.count)} r={2.5} fill={color} fillOpacity={0.85} />
      ))}

      {/* X-axis month labels */}
      {data.map((d, i) => {
        const skip = data.length > 9 && i % 2 !== 0
        if (skip) return null
        const [, mm] = (d.month || '----').split('-')
        return (
          <text key={i}
            x={x(i)} y={height - 4}
            textAnchor="middle"
            fill="#2A4040"
            fontSize={9}
            fontFamily="Tajawal, sans-serif"
          >
            {MONTH_NAMES[parseInt(mm)] || mm}
          </text>
        )
      })}
    </svg>
  )
}

export default function MonthlyTrends({ data = [], loading }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(640)

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  /* 3-month trend */
  const trendPct = (() => {
    if (data.length < 3) return null
    const recent = data.at(-1).count
    const base   = data.at(-Math.min(3, data.length)).count
    if (!base) return null
    return Math.round(((recent - base) / base) * 100)
  })()

  const TrendIcon = trendPct == null ? Minus : trendPct > 0 ? TrendingUp : TrendingDown
  const trendColor = trendPct == null ? '#3D5050' : trendPct > 0 ? '#6ABDB2' : '#D9ACA3'

  /* Total for the period */
  const periodTotal = data.reduce((s, d) => s + d.count, 0)

  return (
    <section dir="rtl" className="py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto px-6">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#6ABDB2' }}>
              نبض الشبكة
            </span>
            <h2 className="font-black mt-1 mb-1"
              style={{ fontSize: 'clamp(1.3rem,2.2vw,1.9rem)', color: '#EAE4DF' }}>
              جلسات التسميع — آخر 12 شهراً
            </h2>
            <p className="text-xs" style={{ color: '#7A9E96' }}>
              إجمالي جلسات التسميع المسجلة عبر كل مراكز الشبكة
            </p>
          </div>

          <div className="flex items-center gap-3">
            {periodTotal > 0 && (
              <div className="px-4 py-2 rounded-xl"
                style={{ background: 'rgba(106,189,178,0.07)', border: '1px solid rgba(106,189,178,0.14)' }}>
                <p className="font-black text-sm tabular-nums leading-none" style={{ color: '#6ABDB2' }}>
                  +{periodTotal.toLocaleString('en-US')}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: '#3D5050' }}>السنة الماضية</p>
              </div>
            )}
            {trendPct !== null && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{ background: trendColor + '12', border: `1px solid ${trendColor}20` }}>
                <TrendIcon size={13} style={{ color: trendColor }} />
                <span className="font-black text-sm" style={{ color: trendColor }}>
                  {trendPct > 0 ? '+' : ''}{trendPct}٪
                </span>
                <span className="text-[10px]" style={{ color: '#3D5050' }}>/ 3 أشهر</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart card */}
        <motion.div
          ref={wrapRef}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#011E1E', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center" style={{ height: 190 }}>
              <div className="w-7 h-7 rounded-full border-2 animate-spin"
                style={{ borderColor: '#6ABDB2', borderTopColor: 'transparent' }} />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-center p-10"
              style={{ height: 190 }}>
              <p className="text-xs" style={{ color: '#2A4040' }}>
                البيانات التاريخية الشهرية تظهر هنا بعد تشغيل الـ RPC في Supabase
              </p>
              <p className="text-[10px]" style={{ color: '#1A2E2E' }}>
                شغّل: <code style={{ color: '#5A8A78' }}>supabase/migrations/20260629_monthly_stats.sql</code>
              </p>
            </div>
          ) : (
            <div className="p-4 pt-6">
              <SVGChart data={data} width={width - 32} height={190} color="#6ABDB2" />
            </div>
          )}
        </motion.div>

      </div>
    </section>
  )
}
