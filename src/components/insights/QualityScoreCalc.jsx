import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Mic, BookOpen, Bell, TrendingUp, ClipboardCheck, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

/* ── Score ring ── */
function ScoreRing({ score, networkAvg = 64, size = 140 }) {
  const r     = size * 0.372
  const circ  = 2 * Math.PI * r
  const color = score >= 80 ? '#6ABDB2' : score >= 65 ? '#D9C8A3' : '#D9ACA3'
  const level = score >= 80 ? 'مستوى ممتاز' : score >= 70 ? 'مستوى متقدم' : score >= 55 ? 'مستوى متوسط' : 'يحتاج تحسيناً'

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.07} />
        {/* Network avg (ghost) */}
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={size * 0.07}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - networkAvg / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* User score */}
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.07}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            filter    : `drop-shadow(0 0 8px ${color}60)`,
            transition: 'stroke-dashoffset 0.8s cubic-bezier(.22,1,.36,1), stroke 0.4s',
          }}
        />
        <text x={size / 2} y={size / 2 - size * 0.045}
          textAnchor="middle" fill={color}
          style={{ fontSize: size * 0.2, fontWeight: 900, fontFamily: 'Tajawal,sans-serif' }}>
          {score}
        </text>
        <text x={size / 2} y={size / 2 + size * 0.13}
          textAnchor="middle" fill="rgba(255,255,255,0.28)"
          style={{ fontSize: size * 0.08, fontFamily: 'Tajawal,sans-serif' }}>
          / 100
        </text>
      </svg>
      <div className="text-center">
        <p className="font-black text-sm" style={{ color }}>{level}</p>
        <p className="text-[11px] mt-0.5" style={{ color: '#3D5050' }}>
          متوسط الشبكة: <span style={{ color: 'rgba(255,255,255,0.2)' }}>▌</span> {networkAvg}
        </p>
      </div>
    </div>
  )
}

/* ── Radar chart (5 axes) ── */
function RadarChart({ factorScores, networkScores, size = 200 }) {
  const N  = factorScores.length
  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.36

  const angle = (i) => (i / N) * 2 * Math.PI - Math.PI / 2
  const pt    = (i, frac) => ({
    x: cx + r * Math.max(0.01, frac) * Math.cos(angle(i)),
    y: cy + r * Math.max(0.01, frac) * Math.sin(angle(i)),
  })
  const poly  = (fracs) => fracs.map((f, i) => {
    const p = pt(i, f)
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
  }).join(' ')

  const LABELS = ['التسميع', 'الحلقات', 'تفاعل الأهل', 'الاحتفاظ', 'الخطط']

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Rings */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon key={f}
          points={poly(new Array(N).fill(f))}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5}
        />
      ))}
      {/* Axes */}
      {Array.from({ length: N }).map((_, i) => {
        const p = pt(i, 1)
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
        )
      })}
      {/* Network polygon */}
      <polygon
        points={poly(networkScores.map(v => v / 100))}
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={0.8}
      />
      {/* User polygon */}
      <polygon
        points={poly(factorScores.map(v => v / 100))}
        fill="rgba(106,189,178,0.12)"
        stroke="#6ABDB2"
        strokeWidth={1.2}
      />
      {/* Labels */}
      {LABELS.map((l, i) => {
        const p = pt(i, 1.28)
        return (
          <text key={i} x={p.x} y={p.y}
            textAnchor="middle" dominantBaseline="middle"
            fill="#5A8A78" fontSize={size < 200 ? 7.5 : 9}
            fontFamily="Tajawal,sans-serif">
            {l}
          </text>
        )
      })}
    </svg>
  )
}

/* ── Factor definitions ── */
const FACTORS = [
  {
    key        : 'recitation',
    icon       : Mic,
    label      : 'انتظام التسميع',
    weight     : 35,
    color      : '#6ABDB2',
    desc       : 'جلسات تسميع لكل طالب في الشهر',
    min        : 0, max: 20, step: 1,
    init       : 6,
    networkAvg : 10,
    unit       : 'جلسة/طالب/شهر',
    score      : (v) => Math.min(100, (v / 12) * 100),
    hint       : (v) => v < 4 ? 'منخفض — الهدف 8+' : v >= 12 ? 'ممتاز ✓' : 'جيد',
  },
  {
    key        : 'groupSize',
    icon       : BookOpen,
    label      : 'كثافة الحلقات',
    weight     : 25,
    color      : '#D9ACA3',
    desc       : 'متوسط الطلاب في الحلقة الواحدة',
    min        : 3, max: 25, step: 1,
    init       : 12,
    networkAvg : null, /* computed from raw */
    unit       : 'طالب/حلقة',
    score      : (v) => Math.max(0, Math.min(100, 100 - Math.pow(Math.max(0, v - 10), 1.4) * 3.8)),
    hint       : (v) => v <= 6 ? 'صغير جداً' : v <= 15 ? 'مثالي ✓' : 'كبير — قسّم الحلقة',
  },
  {
    key        : 'parentEngagement',
    icon       : Bell,
    label      : 'تفاعل أولياء الأمور',
    weight     : 20,
    color      : '#A3C4D9',
    desc       : '% من أولياء الأمور راجعوا تقرير ابنهم',
    min        : 0, max: 100, step: 5,
    init       : 40,
    networkAvg : 65,
    unit       : '٪ من أولياء الأمور',
    score      : (v) => v,
    hint       : (v) => v < 30 ? 'منخفض' : v >= 70 ? 'ممتاز ✓' : 'متوسط',
  },
  {
    key        : 'retention',
    icon       : TrendingUp,
    label      : 'الاحتفاظ بالطلاب',
    weight     : 15,
    color      : '#D9C8A3',
    desc       : '% من الطلاب باقون بعد 3 أشهر',
    min        : 50, max: 100, step: 5,
    init       : 75,
    networkAvg : 82,
    unit       : '٪ من الطلاب',
    score      : (v) => ((v - 50) / 50) * 100,
    hint       : (v) => v < 65 ? 'يحتاج مراجعة' : v >= 88 ? 'ممتاز ✓' : 'جيد',
  },
  {
    key        : 'plans',
    icon       : ClipboardCheck,
    label      : 'استكمال الخطط',
    weight     : 5,
    color      : '#B5A3D9',
    desc       : '% من الطلاب أنجزوا هدف حفظهم الشهري',
    min        : 0, max: 100, step: 5,
    init       : 55,
    networkAvg : 72,
    unit       : '٪ من الطلاب',
    score      : (v) => v,
    hint       : (v) => v < 40 ? 'منخفض' : v >= 75 ? 'ممتاز ✓' : 'متوسط',
  },
]

const NETWORK_TOTAL = 64 /* approx composite network score */

export default function QualityScoreCalc({ raw }) {
  const init = Object.fromEntries(FACTORS.map(f => [f.key, f.init]))
  const [vals, setVals] = useState(init)
  const set = (k) => (e) => setVals(p => ({ ...p, [k]: Number(e.target.value) }))

  /* Inject live network avg for groupSize */
  const factors = useMemo(() => FACTORS.map(f => {
    if (f.key === 'groupSize' && raw.students && raw.groups) {
      return { ...f, networkAvg: Math.round(raw.students / raw.groups) }
    }
    return f
  }), [raw.students, raw.groups])

  const factorScores  = factors.map(f => Math.round(f.score(vals[f.key])))
  const networkScores = factors.map(f => Math.round(f.score(f.networkAvg ?? (f.min + f.max) / 2)))
  const total = Math.min(100, Math.round(
    factors.reduce((sum, f, i) => sum + (f.weight * factorScores[i]) / 100, 0)
  ))

  const whatsappUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ihkaam.sa'
    const level  = total >= 80 ? 'ممتاز' : total >= 70 ? 'متقدم' : total >= 55 ? 'متوسط' : 'يحتاج تحسيناً'
    const text   = `حسبت نقطة جودة مركزي على مرصد إحكام وحصلت على ${total}/100 — مستوى ${level}\n\nجرّب احسب نقطة مركزك مجاناً (بدون تسجيل):\n${origin}/insights`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }, [total])

  return (
    <section id="quality-score" dir="rtl" className="py-20"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto px-6">

        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#B5A3D9' }}>
            حاسبة الجودة التفاعلية
          </span>
          <h2 className="font-black mt-1 mb-2"
            style={{ fontSize: 'clamp(1.3rem,2.2vw,1.9rem)', color: '#EAE4DF' }}>
            احسب نقطة جودة مركزك الآن
          </h2>
          <p className="text-sm" style={{ color: '#7A9E96', maxWidth: 500 }}>
            حرّك السلايدرات بأرقامك الفعلية — النقطة تتغير لحظياً · لا يُحفظ شيء
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6">

          {/* Left: sliders */}
          <div className="rounded-2xl p-6 lg:p-8 flex flex-col gap-7"
            style={{ background: '#011E1E', border: '1px solid rgba(181,163,217,0.10)' }}>

            {factors.map((f) => {
              const rawScore  = Math.round(f.score(vals[f.key]))
              const fillPct   = ((vals[f.key] - f.min) / (f.max - f.min)) * 100

              return (
                <div key={f.key}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ background: f.color + '18' }}>
                        <f.icon size={14} style={{ color: f.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none mb-0.5" style={{ color: '#C8B8B0' }}>
                          {f.label}
                          <span className="font-normal text-[10px] mr-2" style={{ color: '#3D5050' }}>
                            ({f.weight}٪ من النقطة)
                          </span>
                        </p>
                        <p className="text-[10px]" style={{ color: '#2A4040' }}>{f.desc}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-black tabular-nums" style={{ fontSize: 17, color: f.color }}>
                        {vals[f.key]}
                      </span>
                      <span className="text-[9px] block" style={{ color: '#3D5050' }}>{f.unit}</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min={f.min} max={f.max} step={f.step}
                    value={vals[f.key]}
                    onChange={set(f.key)}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none"
                    style={{
                      accentColor: f.color,
                      background : `linear-gradient(90deg, ${f.color} 0%, ${f.color} ${fillPct}%, rgba(255,255,255,0.08) ${fillPct}%, rgba(255,255,255,0.08) 100%)`,
                    }}
                  />

                  <div className="flex justify-between mt-1.5 text-[10px]">
                    <span style={{ color: '#2A4040' }}>{f.min}</span>
                    <span style={{ color: rawScore >= 70 ? f.color : '#D9ACA3' }}>
                      {f.hint(vals[f.key])}
                    </span>
                    {f.networkAvg != null && (
                      <span style={{ color: '#2A4040' }}>شبكة: {f.networkAvg}</span>
                    )}
                    <span style={{ color: '#2A4040' }}>{f.max}</span>
                  </div>
                </div>
              )
            })}

          </div>

          {/* Right: score + radar */}
          <div className="flex flex-col gap-5">

            <div className="rounded-2xl p-7 flex flex-col items-center gap-1"
              style={{ background: '#011E1E', border: '1px solid rgba(181,163,217,0.10)' }}>
              <ScoreRing score={total} networkAvg={NETWORK_TOTAL} size={150} />

              {/* Factor breakdown (mini bars) */}
              <div className="w-full mt-5 flex flex-col gap-2.5">
                {factors.map((f, i) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <span className="text-[10px] w-24 text-right flex-shrink-0" style={{ color: '#5A8A78' }}>
                      {f.label}
                    </span>
                    <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: f.color }}
                        animate={{ width: `${factorScores[i]}%` }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="text-[10px] w-6 tabular-nums" style={{ color: f.color }}>
                      {factorScores[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar */}
            <div className="rounded-2xl p-4 flex flex-col items-center gap-2"
              style={{ background: '#011E1E', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3 text-[10px] self-start">
                <span><span style={{ color: '#6ABDB2' }}>◆</span> مركزك</span>
                <span><span style={{ color: 'rgba(255,255,255,0.2)' }}>◆</span> متوسط الشبكة</span>
              </div>
              <RadarChart factorScores={factorScores} networkScores={networkScores} size={190} />
            </div>

            {/* CTA */}
            <div className="rounded-2xl p-5 text-center"
              style={{ background: 'rgba(181,163,217,0.05)', border: '1px solid rgba(181,163,217,0.12)' }}>
              <p className="text-[11px] mb-3 leading-relaxed" style={{ color: '#5A8A78' }}>
                هذه تقديرية — نقطتك الحقيقية تُحسب تلقائياً كل شهر من بيانات مركزك الفعلية في إحكام
              </p>
              <Link to="/request"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(181,163,217,0.14)', border: '1px solid rgba(181,163,217,0.22)', color: '#B5A3D9' }}>
                <Award size={13} />
                احصل على نقطتك الفعلية
              </Link>
            </div>

            {/* WhatsApp share */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-4 flex flex-col items-center gap-3 text-center"
              style={{ background: 'rgba(37,211,102,0.04)', border: '1px solid rgba(37,211,102,0.16)' }}
            >
              <p className="text-[11px] leading-relaxed" style={{ color: '#5A8A78' }}>
                شارك نتيجة مركزك مع زملائك المديرين
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                style={{
                  background    : 'rgba(37,211,102,0.10)',
                  border        : '1px solid rgba(37,211,102,0.26)',
                  color         : '#25D366',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background   = 'rgba(37,211,102,0.18)'
                  e.currentTarget.style.borderColor  = 'rgba(37,211,102,0.45)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background   = 'rgba(37,211,102,0.10)'
                  e.currentTarget.style.borderColor  = 'rgba(37,211,102,0.26)'
                }}
              >
                <WhatsAppIcon />
                شارك نقطة {total}/100 على واتساب
              </a>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
