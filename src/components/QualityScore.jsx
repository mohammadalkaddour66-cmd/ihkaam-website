import { motion } from 'framer-motion'
import { Mic, Users, Bell, TrendingUp, ClipboardCheck, Award } from 'lucide-react'

/* ──────────────────────────────────────────────────────────
   Quality Score ring (SVG)
   r=52 → circumference ≈ 326.7
   dashoffset = circ * (1 - score/100)
────────────────────────────────────────────────────────── */
function ScoreRing({ score = 73 }) {
  const r    = 52
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)

  const hue = score >= 80 ? '#6ABDB2' : score >= 60 ? '#D9C8A3' : '#D9ACA3'

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="mx-auto">
      {/* Track */}
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      {/* Progress */}
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={hue}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ filter: `drop-shadow(0 0 8px ${hue}60)`, transition: 'stroke-dashoffset 1.2s ease' }}
      />
      {/* Score text */}
      <text x="70" y="66" textAnchor="middle" fill={hue}
        style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Tajawal, sans-serif' }}>
        {score}
      </text>
      <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.35)"
        style={{ fontSize: 11, fontFamily: 'Tajawal, sans-serif' }}>
        / 100
      </text>
    </svg>
  )
}

const FACTORS = [
  { icon: Mic,           label: 'انتظام التسميع',      weight: 35, color: '#6ABDB2',  desc: 'كم مرة يُسجَّل التسميع بانتظام' },
  { icon: ClipboardCheck,label: 'كثافة الحلقات',       weight: 25, color: '#D9ACA3',  desc: 'هل حجم الحلقات ضمن النطاق المثالي' },
  { icon: Bell,          label: 'تفاعل أولياء الأمور', weight: 20, color: '#A3C4D9',  desc: 'معدل استخدام بوابة الأهل' },
  { icon: TrendingUp,    label: 'الاحتفاظ بالطلاب',   weight: 15, color: '#D9C8A3',  desc: 'نسبة الطلاب الباقين بعد 3 أشهر' },
  { icon: Users,         label: 'استكمال الخطط',       weight: 5,  color: '#B5A3D9',  desc: 'نسبة إنجاز خطط الحفظ المحددة' },
]

function FactorBar({ icon: Icon, label, weight, color, desc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className="flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: color + '18' }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold" style={{ color: '#C8B8B0' }}>{label}</span>
          <span className="text-xs font-black tabular-nums" style={{ color }}>{weight}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}80)`, boxShadow: `0 0 6px ${color}50` }}
            initial={{ width: 0 }}
            whileInView={{ width: `${weight * 2.86}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 + index * 0.07 }}
          />
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: '#5A8A78' }}>{desc}</p>
      </div>
    </motion.div>
  )
}

export default function QualityScore() {
  return (
    <section id="quality-score" dir="rtl" className="relative py-20 overflow-hidden"
      style={{ background: '#010D0D', borderTop: '1px solid rgba(229,211,179,0.06)' }}>

      {/* Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]" aria-hidden style={{
        background: 'radial-gradient(ellipse at top, rgba(181,163,217,0.08) 0%, transparent 65%)',
      }} />

      <div className="max-w-6xl mx-auto px-6">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.60, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-bold"
            style={{ background: 'rgba(181,163,217,0.10)', border: '1px solid rgba(181,163,217,0.22)', color: '#B5A3D9' }}>
            <Award size={12} />
            نقطة جودة إحكام
          </div>
          <h2 className="font-black mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#EAE4DF', lineHeight: 1.2 }}>
            مركزك يستحق تقييماً{' '}
            <span style={{ color: '#B5A3D9' }}>موضوعياً ومستمراً</span>
          </h2>
          <p className="mx-auto text-sm leading-relaxed" style={{ color: '#7A9E96', maxWidth: 500 }}>
            نقطة الجودة تُحسب تلقائياً من بياناتك — تعكس صحة مركزك بشكل عملي لا تخميني
          </p>
        </motion.div>

        {/* ── Main card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-0 rounded-3xl overflow-hidden"
          style={{ background: '#011E1E', border: '1px solid rgba(229,211,179,0.09)' }}
        >
          {/* LEFT: Score display */}
          <div className="flex flex-col items-center justify-center gap-6 p-10"
            style={{ borderLeft: '1px solid rgba(229,211,179,0.07)' }}>

            {/* Sample badge */}
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(181,163,217,0.12)', color: '#B5A3D9', border: '1px solid rgba(181,163,217,0.22)' }}>
              مثال توضيحي
            </span>

            <ScoreRing score={73} />

            {/* Level label */}
            <div className="text-center">
              <p className="font-black text-base" style={{ color: '#D9C8A3' }}>مستوى متقدم</p>
              <p className="text-xs mt-1" style={{ color: '#5A8A78' }}>
                تُحدَّث تلقائياً كل شهر مع بياناتك
              </p>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full">
              {[
                { val: '٩١٪', lbl: 'انتظام' },
                { val: '٨٥٪', lbl: 'استبقاء' },
                { val: '٧٢٪', lbl: 'تفاعل أهل' },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="text-center rounded-xl py-2.5 px-1"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="font-black text-sm" style={{ color: '#B5A3D9' }}>{val}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#5A8A78' }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Factor breakdown + explanation */}
          <div className="flex flex-col justify-between p-8 lg:p-10">
            <div>
              <h3 className="font-black text-base mb-1" style={{ color: '#EAE4DF' }}>
                ما الذي تُقيسه النقطة؟
              </h3>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: '#7A9E96' }}>
                5 عوامل موزونة تُحلّل بيانات مركزك تلقائياً كل شهر
              </p>

              <div className="flex flex-col gap-4">
                {FACTORS.map((f, i) => (
                  <FactorBar key={i} index={i} {...f} />
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-bold mb-3" style={{ color: '#6ABDB2' }}>ما الذي تحصل عليه؟</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'مقارنة شهرية بمراكز مشابهة',
                  'تنبيهات عند انخفاض أي مؤشر',
                  'خارطة طريق للتحسين',
                  'شهادة مستوى الأداء السنوية',
                ].map(benefit => (
                  <div key={benefit} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#B5A3D9' }} />
                    <span className="text-xs" style={{ color: '#7A9E96' }}>{benefit}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('pricing')
                  if (el) {
                    let top = 0; let node = el
                    while (node) { top += node.offsetTop || 0; node = node.offsetParent }
                    window.scrollTo({ top: top - 112, behavior: 'smooth' })
                  } else {
                    window.location.href = '/request'
                  }
                }}
                className="inline-flex items-center gap-2 mt-5 text-xs font-bold cursor-pointer"
                style={{ background: 'none', border: 'none', padding: 0, color: '#B5A3D9' }}
              >
                انضم لشبكة إحكام واحصل على نقطتك
                <span style={{ fontSize: 14 }}>←</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}
