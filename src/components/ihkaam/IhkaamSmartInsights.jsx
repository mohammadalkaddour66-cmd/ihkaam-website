import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Scale, PenLine, ShieldCheck, Sparkles } from 'lucide-react'

/* ══════════════════════════════════════════════════════════════════
   التحليل الذكي (إعادة تصميم 2026-11-19 هـ)

   كان بطاقة حكمٍ جامدة وثلاث فقراتٍ طويلة («ممل ومو مفهوم» كما قال
   المالك). صار يشرح الفكرة بالصورة قبل الكلمة، في ثلاث خطوات متصلة:
     ١ سجلات الحلقة اليومية (مربّع لكل يوم تسميع، كما يسجّلها المعلم)
     ٢ المقارنة: منحنى الصفحات أسبوعاً بأسبوع، والأسابيع الستة السابقة
        مظلّلة «ماضي الحلقة»، ومتوسّطها خطٌّ يقاس عليه متوسّط آخر 4 أسابيع
        — نافذة التطبيق نفسها (insightsEngine: deep = 28 مقابل 42 يوماً)
     ٣ الحكم مكتوباً بصيغة التطبيق الحرفية («انخفض من … إلى … — يستحق
        وقفة ومتابعة»)
   وأربع حالات يبدّل بينها الزائر (أو تتبدّل وحدها): تراجع، تقدّم، ثبات،
   ونقص البيانات حيث يسكت التحليل. الأرقام مثالٌ توضيحي معلَن.
   ══════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1]
const INK = '#0B3B33', GOLD = '#B8863A', CREAM = '#F8F5EC'

const SCENARIOS = [
  {
    key: 'down', tab: 'حلقة تتراجع', dot: '#B4533F',
    base: [12, 13, 11.5, 12.8, 12, 13.2], recent: [9.5, 7.2, 6.4, 5.3],
    chip: 'تراجع 43%', badge: 'يحتاج متابعة',
    sentence: 'تسميع القرآن: انخفض من 12.4 صفحة/أسبوع إلى 7.1 صفحة/أسبوع — يستحق وقفة ومتابعة.',
    tone: { fg: '#8E3B2C', bg: 'rgba(180, 83, 63, 0.09)', bd: 'rgba(180, 83, 63, 0.28)', line: '#B4533F' },
  },
  {
    key: 'up', tab: 'حلقة تتقدّم', dot: '#1F6F52',
    base: [6, 7, 6.5, 7.2, 6.8, 6.7], recent: [7.5, 8.6, 9.2, 9.9],
    chip: 'تحسّن 31%', badge: 'إنجاز: الحلقة تتقدم',
    sentence: 'تسميع القرآن: ارتفع من 6.7 صفحة/أسبوع إلى 8.8 صفحة/أسبوع — استمروا، هذا تقدم حقيقي.',
    tone: { fg: '#1F6F52', bg: 'rgba(31, 111, 82, 0.08)', bd: 'rgba(31, 111, 82, 0.26)', line: '#1F6F52' },
  },
  {
    key: 'flat', tab: 'حلقة مستقرّة', dot: '#8A6425',
    base: [9, 9.6, 8.8, 9.4, 9.1, 9.3], recent: [9.5, 8.9, 9.4, 9.0],
    chip: 'مستقر', badge: 'مستقر',
    sentence: 'تسميع القرآن: 9.2 صفحة/أسبوع في الفترتين — لا تغيّر يستحق التنبيه.',
    tone: { fg: '#6B5020', bg: 'rgba(184, 134, 58, 0.09)', bd: 'rgba(184, 134, 58, 0.28)', line: '#B8863A' },
  },
  {
    key: 'none', tab: 'بيانات قليلة', dot: '#9AA59F',
    base: [0, 0, 1.5, 0, 0, 0], recent: [0, 2, 0, 0],
    chip: 'بيانات غير كافية', badge: 'لا بيانات كافية بعد', silent: true,
    sentence: 'النشاط المسجَّل بهذه الفترة أقل من الحد الأدنى الموثوق — استمروا بالتسجيل اليومي وستظهر الإشارات تلقائياً.',
    tone: { fg: '#5E6E67', bg: 'rgba(94, 110, 103, 0.07)', bd: 'rgba(94, 110, 103, 0.22)', line: '#9AA59F' },
  },
]

const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length

/* ── المنحنى: الزمن يجري من اليمين (الأقدم) إلى اليسار (الأحدث) ── */
const W = 420, H = 220, TOP = 26, BOT = 186, MAX = 14
const xAt = (w) => W - 26 - w * ((W - 52) / 9)
const yAt = (v) => BOT - (v / MAX) * (BOT - TOP)
const SPLIT = (xAt(5) + xAt(6)) / 2

function Chart({ s }) {
  const pts = [...s.base, ...s.recent]
  const d = pts.map((v, w) => `${w ? 'L' : 'M'} ${xAt(w).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')
  const bA = yAt(avg(s.base)), rA = yAt(avg(s.recent))
  const spring = { duration: 0.9, ease }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
         aria-label={`منحنى صفحات التسميع أسبوعياً: ${s.sentence}`}>
      {/* ماضي الحلقة */}
      <rect x={SPLIT} y={TOP - 14} width={W - 8 - SPLIT} height={BOT - TOP + 14} rx="10" fill="rgba(11,59,51,0.045)" />
      <text x={(SPLIT + W - 8) / 2} y={TOP - 1} textAnchor="middle" fontSize="11" fontWeight="700" fill="#5E6E67">ماضي الحلقة · 6 أسابيع</text>
      <text x={SPLIT / 2 + 4} y={TOP - 1} textAnchor="middle" fontSize="11" fontWeight="700" fill={INK}>آخر 4 أسابيع</text>
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f} x1="8" x2={W - 8} y1={TOP + (BOT - TOP) * f} y2={TOP + (BOT - TOP) * f} stroke="rgba(11,59,51,0.07)" />
      ))}
      <line x1="8" x2={W - 8} y1={BOT} y2={BOT} stroke="rgba(11,59,51,0.18)" />

      {/* متوسّط الماضي يمتدّ مقياساً تحت الأسابيع الأخيرة أيضاً */}
      <motion.line x1="12" x2={W - 12} stroke={GOLD} strokeWidth="1.5" strokeDasharray="5 5"
        initial={false} animate={{ y1: bA, y2: bA, opacity: s.silent ? 0 : 0.9 }} transition={spring} />
      <motion.line x1="12" x2={SPLIT - 6} stroke={s.tone.line} strokeWidth="3" strokeLinecap="round"
        initial={false} animate={{ y1: rA, y2: rA, opacity: s.silent ? 0 : 1 }} transition={spring} />

      {/* الفرق بين المتوسّطين */}
      <motion.line x1="34" x2="34" stroke={s.tone.line} strokeWidth="1.5"
        initial={false} animate={{ y1: bA, y2: rA, opacity: s.silent || s.key === 'flat' ? 0 : 1 }} transition={spring} />

      <motion.path fill="none" stroke={s.silent ? 'transparent' : INK} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"
        initial={false} animate={{ d }} transition={spring} />
      {pts.map((v, w) => (
        <motion.circle key={w} cx={xAt(w)} r="4.5" stroke="#fff" strokeWidth="2"
          initial={false}
          animate={{ cy: yAt(v), fill: w >= 6 ? s.tone.line : INK, opacity: s.silent && v === 0 ? 0.18 : 1 }}
          transition={{ ...spring, delay: w * 0.03 }} />
      ))}
      <text x={W - 10} y={H - 10} textAnchor="start" direction="rtl" fontSize="10.5" fill="#5E6E67">الأقدم</text>
      <text x="10" y={H - 10} textAnchor="end" direction="rtl" fontSize="10.5" fill="#5E6E67">هذا الأسبوع</text>
    </svg>
  )
}

/* ── سجلات الحلقة: مربّعٌ لكل يوم (5 أيام × 10 أسابيع) ── */
function Records({ s }) {
  const weeks = [...s.base, ...s.recent]
  return (
    <div className="grid gap-[5px]" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }} dir="rtl" aria-hidden>
      {weeks.map((v, w) => {
        const filled = v === 0 ? 0 : Math.max(1, Math.min(5, Math.round(v / 2.6)))
        return (
          <div key={w} className="grid gap-[5px]">
            {Array.from({ length: 5 }).map((_, day) => {
              const on = day < filled
              return (
                <motion.span key={day} className="block aspect-square rounded-[4px]"
                  initial={false}
                  animate={{ backgroundColor: on ? (w >= 6 ? s.tone.line : INK) : 'rgba(11,59,51,0.07)', scale: on ? 1 : 0.86 }}
                  transition={{ duration: 0.45, delay: (w * 5 + day) * 0.006, ease }} />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/* الجملة تُكتب أمام القارئ حرفاً حرفاً، كما يكتبها التحليل */
function Typed({ text, run }) {
  const [n, setN] = useState(run ? 0 : text.length)
  useEffect(() => {
    if (!run) return
    const t0 = performance.now()
    let raf
    const tick = (now) => {
      const k = Math.min(text.length, Math.round((now - t0) / 22))
      setN(k)
      if (k < text.length) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, run])
  return (
    <span>
      {text.slice(0, n)}
      {n < text.length && <span className="inline-block w-[2px] h-[1em] align-middle mr-0.5" style={{ background: 'currentColor', opacity: 0.6 }} />}
    </span>
  )
}

function Step({ n, title, children, className = '' }) {
  return (
    <div className={`relative rounded-[22px] bg-white p-5 sm:p-6 ${className}`} style={{ boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold" style={{ background: INK, color: '#E0B562' }}>{n}</span>
        <span className="text-[15px] font-bold" style={{ color: INK }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex items-center justify-center py-1 lg:py-0" aria-hidden>
      <svg width="34" height="34" viewBox="0 0 34 34" className="-rotate-90 lg:rotate-0">
        <motion.path d="M28 17 H7 M13 10 L6 17 L13 24" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }} />
      </svg>
    </div>
  )
}

const PRINCIPLES = [
  [Scale,       'يقارن الحلقة بماضيها', 'لا بجاراتها، ولا ترتيب بين المعلمين'],
  [PenLine,     'يكتب لك السبب',        'جملةٌ واضحة بدل رقمٍ يحتاج من يفسّره'],
  [ShieldCheck, 'يسكت حين لا دليل',     'لا إنذار قبل حدٍّ أدنى من الجلسات'],
]

export default function IhkaamSmartInsights() {
  const [k, setK] = useState(0)
  const [auto, setAuto] = useState(true)
  const [hover, setHover] = useState(false)
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, margin: '-120px' })
  const s = SCENARIOS[k]

  useEffect(() => {
    if (!auto || hover || !seen) return
    const t = setTimeout(() => setK(x => (x + 1) % SCENARIOS.length), 7000)
    return () => clearTimeout(t)
  }, [k, auto, hover, seen])

  const pick = (n) => { setAuto(false); setK(n) }

  return (
    <section id="insights" className="relative z-10 py-24 px-6" style={{ scrollMarginTop: '140px' }} dir="rtl">
      <div className="max-w-6xl mx-auto">

        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }} transition={{ duration: 0.6, ease }}>
          <span className="eyebrow inline-flex items-center gap-1.5"><Sparkles size={13} /> جديد · ضمن النسخة الأساسية</span>
          <h2 className="font-bold leading-tight mx-auto mt-5 mb-5" style={{ color: '#1A2E28', fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', maxWidth: 760 }}>
            التحليل الذكي <span className="title-mark">يرى التراجع قبل أن تراه</span>
          </h2>
          <p className="text-lg mx-auto" style={{ color: '#4A5D56', maxWidth: 620, lineHeight: 1.9 }}>
            من سجلات التسميع والحضور التي يدخلها معلموك كل يوم، بلا إدخالٍ إضافي واحد. اختر حالةً وشاهد ما يفعله.
          </p>
        </motion.div>

        {/* الحالات */}
        <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist" aria-label="أمثلة على أحكام التحليل الذكي">
          {SCENARIOS.map((x, n) => {
            const on = n === k
            return (
              <button key={x.key} type="button" role="tab" aria-selected={on} onClick={() => pick(n)}
                className="relative rounded-full px-4 py-2.5 text-sm font-bold transition-colors"
                style={{ color: on ? CREAM : INK, boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-warm)', background: on ? 'transparent' : '#fff' }}>
                {on && <motion.span layoutId="ins-tab" className="absolute inset-0 rounded-full" style={{ background: INK }} transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: x.dot }} />
                  {x.tab}
                </span>
                {on && auto && seen && !hover && (
                  <motion.span key={'p' + k} className="absolute bottom-1 right-4 left-4 h-[2px] rounded-full origin-right" style={{ background: '#E0B562' }}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 7, ease: 'linear' }} />
                )}
              </button>
            )
          })}
        </div>

        {/* الخطوات الثلاث */}
        <div ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1.35fr)_auto_minmax(0,1fr)] gap-3 lg:gap-4 items-stretch">

          <Step n="1" title="يقرأ ما سجّله المعلم">
            <Records s={s} />
            <p className="text-sm mt-4" style={{ color: '#5E6E67', lineHeight: 1.8 }}>
              كل مربّعٍ يوم تسميع مسجَّل. عشرة أسابيع من حلقةٍ واحدة.
            </p>
          </Step>

          <Arrow />

          <Step n="2" title="يقارنها بماضيها هي">
            <Chart s={s} />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12.5px]" style={{ color: '#5E6E67' }}>
              <span className="inline-flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed" style={{ borderColor: GOLD }} /> متوسّط الماضي</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-5 h-[3px] rounded" style={{ background: s.tone.line }} /> متوسّط آخر 4 أسابيع</span>
            </div>
          </Step>

          <Arrow />

          <Step n="3" title="ويكتب لك الحكم وسببه" className="flex flex-col">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 pb-3 mb-3" style={{ borderBottom: '1px solid #EFEADF' }}>
                <div className="min-w-0">
                  <div className="font-bold text-[15px] truncate" style={{ color: '#1A2E28' }}>حلقة الإمام النووي</div>
                  <div className="text-xs" style={{ color: '#5E6E67' }}>تسميع القرآن · صفحة/أسبوع</div>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={s.key} className="text-xs font-bold rounded-full px-2.5 py-1 whitespace-nowrap"
                    style={{ color: s.tone.fg, background: s.tone.bg, boxShadow: `inset 0 0 0 1px ${s.tone.bd}` }}
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.25 }}>
                    {s.chip}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="rounded-2xl p-4 flex-1 transition-colors duration-500" style={{ background: s.tone.bg, boxShadow: `inset 0 0 0 1px ${s.tone.bd}` }}>
                <div className="font-bold mb-2 transition-colors duration-500" style={{ color: s.tone.fg }}>{s.badge}</div>
                <p className="text-[15px] min-h-[5.4em]" style={{ color: '#1A2E28', lineHeight: 1.85 }}>
                  <Typed key={s.key + (seen ? 1 : 0)} text={s.sentence} run={seen} />
                </p>
              </div>
              <p className="text-[11.5px] mt-3" style={{ color: '#5E6E67' }}>مثال توضيحي بصيغة التطبيق نفسها.</p>
            </div>
          </Step>
        </div>

        {/* الركائز: سطرٌ لكلّ واحدة */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10">
          {PRINCIPLES.map(([Icon, t, d], n) => (
            <motion.div key={t} className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: 'rgba(11,59,51,0.04)', boxShadow: 'inset 0 0 0 1px rgba(11,59,51,0.08)' }}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: n * 0.08 }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: INK, color: '#E0B562' }}>
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-[15px]" style={{ color: INK }}>{t}</span>
                <span className="block text-[13px]" style={{ color: '#5E6E67' }}>{d}</span>
              </span>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/ihkaam/features/insights" className="btn-outline inline-flex items-center gap-2 rounded-full px-6 py-3" style={{ fontSize: '0.95rem' }}>
            كيف يعمل التحليل الذكي بالتفصيل <ArrowLeft size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}
