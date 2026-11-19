import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { fetchLandingStats, getBakedLandingStats, KHATMA_PAGES } from '../../config/landingStats'

/* ══════════════════════════════════════════════════════════════════
   «إحكام بالأرقام» (2026-11-19 هـ، ثم و)

   قرار المالك: الرقم البطل هو الختمات لا جلسات التسميع — «255 ختمة
   سُمِّعت ووُثِّقت» (صفحات القرآن ÷ 604)، وتحته سطرٌ يومي (ما يعادل كم
   ختمة يُسمَّع كل يوم في آخر 30 يوماً)، ورسمٌ لنمو الصفحات شهراً بشهر،
   ثم عمودان مسطّران: الحفظ والتسميع، والمعهد وأولياء الأمور.

   النطاق: كل معهدٍ عمل شهراً فأكثر ببيانات حقيقية، ولو توقّف بعدها. المصدر
   get_public_quran_stats (migration 20261119b): يُحسب كل ساعة، ويُخبز في
   HTML وقت البناء (ISS-41). قاعدة تنقية الأخطاء في رأس ملف الترحيل.
   ══════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1]
const GOLD = '#E0B562', CREAM = '#F8F5EC'
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const fmt = (n) => Math.round(n || 0).toLocaleString('en-US')

/* يبدأ من القيمة النهائية لا من الصفر: HTML المولَّد مسبقاً يحمل الرقم الحقيقي
   (ISS-41). في المتصفح يُصفَّر قبل أول رسمٍ ما دام القسم لم يظهر، ثم يعدّ. */
function CountUp({ to, duration = 1700, trigger }) {
  const [val, setVal] = useState(to || 0)
  const raf = useRef(null)
  const counted = useRef(false)

  useLayoutEffect(() => {
    if (!counted.current && !trigger) setVal(0)
  }, [trigger])

  useEffect(() => {
    if (!trigger || !to) return
    counted.current = true
    cancelAnimationFrame(raf.current)
    const t0 = performance.now()
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1)
      setVal(Math.round(to * (1 - Math.pow(1 - p, 4))))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [to, trigger, duration])

  return <>{fmt(val)}</>
}

/* «ما يعادل قرابة ختمتين» — صياغة عربية للعدد اليومي */
function khatmaPhrase(perDay) {
  const r = perDay / KHATMA_PAGES
  if (r < 0.75) return `ما يعادل ${fmt(perDay / 20)} جزءاً`
  const n = Math.round(r)
  const near = Math.abs(r - n) > 0.05 ? 'قرابة ' : ''
  const word = n === 1 ? 'ختمة كاملة' : n === 2 ? 'ختمتين' : n <= 10 ? `${n} ختمات` : `${n} ختمة`
  return `ما يعادل ${near}${word}`
}

/* ── نموّ الصفحات شهرياً: عمود لكل شهر، الأقدم يميناً ── */
function Growth({ monthly, trigger }) {
  const [hover, setHover] = useState(null)
  /* على الجوال مساحة رسمٍ أضيق كي تبقى الخطوط مقروءة بحجمها الطبيعي */
  const [small, setSmall] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const fn = () => setSmall(mq.matches)
    fn(); mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  if (!monthly.length) return null
  const nowKey = new Date().toISOString().slice(0, 7)
  const max = Math.max(...monthly.map(x => x.pages), 1)
  const peak = monthly.reduce((a, b) => (b.pages > a.pages ? b : a))
  const W = small ? 360 : 640, H = 230, TOP = 34, BOT = 186
  const slot = (W - 20) / monthly.length
  const bw = Math.min(46, slot - 10)
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" direction="rtl"
           aria-label={`صفحات القرآن المسمَّعة شهرياً: ${monthly.map(x => `${MONTHS[Number(x.m.slice(5)) - 1]} ${fmt(x.pages)}`).join('، ')}`}>
        <line x1="10" x2={W - 10} y1={BOT} y2={BOT} stroke="rgba(248,245,236,0.22)" />
        {monthly.map((x, n) => {
          const cx = W - 10 - slot * (n + 0.5)
          const h = Math.max(4, (x.pages / max) * (BOT - TOP))
          const partial = x.m === nowKey
          const showLabel = hover === n || x === peak || (!small && n === 0)
          return (
            <g key={x.m} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(null)} onClick={() => setHover(h => (h === n ? null : n))} style={{ cursor: 'default' }}>
              <rect x={cx - slot / 2} y={TOP - 20} width={slot} height={BOT - TOP + 40} fill="transparent" />
              <motion.path
                fill={partial ? 'rgba(224,181,98,0.45)' : GOLD}
                opacity={hover === null || hover === n ? 1 : 0.55}
                initial={false}
                animate={{ d: barPath(cx - bw / 2, BOT, bw, trigger ? h : 0) }}
                transition={{ duration: 0.9, ease, delay: trigger ? 0.25 + n * 0.06 : 0 }}
              />
              {showLabel && trigger && (
                <text x={cx} y={BOT - h - 8} textAnchor="middle" fontSize="13" fontWeight="700" fill={CREAM}>{fmt(x.pages)}</text>
              )}
              <text x={cx} y={BOT + 18} textAnchor="middle" fontSize={small ? 11 : 12} fill="rgba(248,245,236,0.62)">
                {MONTHS[Number(x.m.slice(5)) - 1]}
              </text>
              {partial && <text x={cx} y={BOT + 33} textAnchor="middle" fontSize="10.5" fill="rgba(248,245,236,0.5)">حتى اليوم</text>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* عمودٌ بحافةٍ علوية مدوّرة 4px وقاعدةٍ مستقيمة على الخط */
function barPath(x, base, w, h) {
  const r = Math.min(4, h / 2, w / 2)
  const y = base - h
  return `M ${x} ${base} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${base} Z`
}

/* عمودٌ مسطّر: عنوان، ثم سطرٌ لكل رقم */
function Ledger({ title, rows, trigger, delay = 0 }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-bold" style={{ color: GOLD }}>{title}</span>
        <span className="flex-1 h-px" style={{ background: 'linear-gradient(to left, rgba(224,181,98,0.45), transparent)' }} />
      </div>
      {rows.map((r, n) => (
        <motion.div key={r.label}
          className="grid grid-cols-[minmax(7.5rem,auto)_1fr] sm:grid-cols-[10rem_1fr] items-baseline gap-x-5 py-5"
          style={{ borderBottom: '1px dashed rgba(224,181,98,0.22)' }}
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.55, ease, delay: delay + n * 0.08 }}>
          <span className="font-bold tabular-nums leading-none num-seq" style={{ color: CREAM, fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)' }}>
            <CountUp to={r.value} trigger={trigger} />
          </span>
          <span className="min-w-0">
            <span className="block font-bold" style={{ color: CREAM, fontSize: '1.02rem' }}>{r.label}</span>
            <span className="block text-sm mt-1" style={{ color: 'rgba(248,245,236,0.62)', lineHeight: 1.75 }}>{r.desc}</span>
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* العنوان يختلف بين الرئيسية وصفحة المنصة حتى لا يتكرر H2 واحد في صفحتين (ISS-16). */
export default function IhkaamByNumbers({ titleLead = 'هذا ما فعله إحكام', titleAccent = 'حتى اليوم' } = {}) {
  const [quran, setQuran] = useState(() => getBakedLandingStats()?.quran ?? null)

  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    fetchLandingStats().then(s => { if (s?.quran) setQuran(s.quran) })
  }, [])

  const trigger = visible && !!quran
  const q = quran || { pages: 0, ghaybPages: 0, pages30d: 0, hadiths: 0, juzPassed: 0, notifications: 0, students: 0, staff: 0, institutes: 0, monthly: [] }
  const khatmas = Math.floor(q.pages / KHATMA_PAGES)
  const perDay  = q.pages30d / 30

  const memorize = [
    { value: Math.floor(q.ghaybPages / KHATMA_PAGES), label: 'ختمة سُمِّعت غيباً', desc: `${fmt(q.ghaybPages)} صفحة يسمّعها الطلاب من حفظهم` },
    { value: q.hadiths,   label: 'حديث نبوي سُمِّع',    desc: 'يوثّقه المعلم بدقة القرآن نفسها' },
    { value: q.juzPassed, label: 'اختبار جزء اجتازه طالب', desc: 'بنتيجته وتاريخه ومُختبِره' },
  ]
  const community = [
    { value: q.students,      label: 'طالب يُتابَع يومياً',        desc: 'لكل طالب سجله الكامل: الحضور والتسميع والملاحظات' },
    { value: q.notifications, label: 'إشعار وصل لأولياء الأمور', desc: 'حضورٌ وتسميعٌ واختبار، يصل الأهل في وقته' },
    { value: q.staff,         label: 'معلم وإداري يوثّق بلا ورق', desc: 'وقتهم للتعليم، لا لملء الدفاتر' },
  ]

  return (
    <section ref={sectionRef} dir="rtl" className="section-dark relative py-24 overflow-hidden">
      <div className="pattern-layer pattern-khatam" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease }}>
          <span className="eyebrow">إحكام بالأرقام</span>
          <h2 className="font-bold mt-5 mb-4" style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', lineHeight: 1.3, color: CREAM }}>
            {titleLead} <span className="title-mark">{titleAccent}</span>
          </h2>
          <p className="text-base mx-auto" style={{ color: 'rgba(248,245,236,0.72)', maxWidth: 560, lineHeight: 1.9 }}>
            من سجلات {q.institutes ? `${fmt(q.institutes)} معهداً عمل على المنصة شهراً فأكثر` : 'المعاهد التي عملت على المنصة'}، كما سجّلها معلموها: لا تقديرات ولا متوسّطات.
          </p>
        </motion.div>

        {/* الرقم البطل: الختمات */}
        <motion.div className="text-center" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease }}>
          <div className="font-bold tabular-nums leading-none num-seq" style={{ color: GOLD, fontSize: 'clamp(4.5rem, 14vw, 9rem)', letterSpacing: '-0.02em' }}>
            {quran ? <CountUp to={khatmas} trigger={trigger} duration={2000} /> : '—'}
          </div>
          <div className="font-bold mt-3" style={{ color: CREAM, fontSize: 'clamp(1.35rem, 2.6vw, 1.9rem)' }}>
            ختمة سُمِّعت ووُثِّقت
          </div>
          <div className="mt-2 text-base" style={{ color: 'rgba(248,245,236,0.66)' }}>
            {fmt(q.pages)} صفحة من القرآن الكريم، صفحةً صفحة لكل طالب
          </div>
        </motion.div>

        {/* السطر اليومي */}
        {perDay > 0 && (
          <motion.div className="mx-auto mt-10 mb-14 w-fit max-w-full rounded-full px-6 py-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center"
            style={{ background: 'rgba(224,181,98,0.10)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,0.32)' }}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: 0.2 }}>
            <span className="relative flex w-2 h-2" aria-hidden>
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: GOLD, opacity: 0.6 }} />
              <span className="relative w-2 h-2 rounded-full" style={{ background: GOLD }} />
            </span>
            <span className="font-bold" style={{ color: CREAM }}>
              يُسمَّع في معاهد إحكام كل يوم {khatmaPhrase(perDay)}
            </span>
            <span className="text-sm" style={{ color: 'rgba(248,245,236,0.62)' }}>
              ({fmt(perDay)} صفحة يومياً في آخر 30 يوماً)
            </span>
          </motion.div>
        )}

        {/* النموّ */}
        {q.monthly.length > 1 && (
          <motion.div className="rounded-[24px] px-4 sm:px-8 pt-6 pb-4 mb-14" style={{ background: 'rgba(248,245,236,0.04)', boxShadow: 'inset 0 0 0 1px rgba(248,245,236,0.10)' }}
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, ease }}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <span className="font-bold" style={{ color: CREAM, fontSize: '1.08rem' }}>صفحات القرآن المسمَّعة كل شهر</span>
              <span className="text-sm" style={{ color: 'rgba(248,245,236,0.6)' }}>مرّر أو المس أي شهر لترى رقمه</span>
            </div>
            <Growth monthly={q.monthly} trigger={trigger} />
          </motion.div>
        )}

        {/* العمودان المسطّران */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
          <Ledger title="الحفظ والتسميع" rows={memorize} trigger={trigger} />
          <Ledger title="المعهد وأولياء الأمور" rows={community} trigger={trigger} delay={0.12} />
        </div>
      </div>
    </section>
  )
}
