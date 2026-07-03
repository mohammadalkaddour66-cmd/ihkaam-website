import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../config/supabaseClient'

// ── Animated counter — starts only when `trigger` becomes true ────────────────
// Glow effect uses textShadow (not absolute positioning) so it never gets clipped
function CountUp({ to, duration = 1600, trigger, color }) {
  const [val, setVal]       = useState(0)
  const [glowing, setGlowing] = useState(false)
  const raf = useRef(null)

  useEffect(() => {
    if (!trigger || !to) return
    cancelAnimationFrame(raf.current)
    const t0 = performance.now()
    const tick = now => {
      const p     = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      setVal(Math.round(to * eased))
      if (p < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        // Trigger glow burst then clear it
        setGlowing(true)
        setTimeout(() => setGlowing(false), 900)
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [to, trigger])

  return (
    <motion.span
      animate={glowing ? {
        textShadow: [
          `0 0 0px ${color}00`,
          `0 0 18px ${color}, 0 0 36px ${color}88`,
          `0 0 8px  ${color}44`,
          `0 0 0px  ${color}00`,
        ],
        scale: [1, 1.07, 1],
      } : {}}
      transition={{ duration: 0.75, ease: 'easeOut' }}
    >
      {val.toLocaleString('en-US')}
    </motion.span>
  )
}

// ── Single stat card ──────────────────────────────────────────────────────────
function StatCard({ value, prefix = '+', label, desc, color, index, trigger }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className="relative flex flex-col gap-3 rounded-2xl p-6 h-full"
      style={{ background: 'rgba(1,28,28,0.60)', border: `1px solid ${color}20` }}
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[60px] pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${color}14, transparent 70%)` }} />

      {/* Value */}
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span className="font-black" style={{ fontSize: 'clamp(1.2rem,2vw,1.6rem)', color: color + 'cc' }}>
            {prefix}
          </span>
        )}
        <span className="font-black tabular-nums leading-none"
          style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)', color }}>
          <CountUp to={value} trigger={trigger} color={color} />
        </span>
      </div>

      {/* Label */}
      <p className="font-bold text-sm" style={{ color: '#C8B8B0' }}>{label}</p>

      {/* Desc */}
      <p className="text-xs leading-relaxed" style={{ color: '#5A8A78' }}>{desc}</p>
    </motion.div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 animate-pulse h-44"
      style={{ background: 'rgba(1,28,28,0.60)', border: '1px solid rgba(255,255,255,0.06)' }} />
  )
}

// ── Group label bar ───────────────────────────────────────────────────────────
function GroupLabel({ children, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 mb-4"
    >
      <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[11px] font-bold tracking-[0.20em] uppercase" style={{ color }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}25)` }} />
    </motion.div>
  )
}

// ── Smart grid: 1 col mobile, 2 cols tablet, 3 cols desktop ────────────────────
function SmartGrid({ cards, loading, trigger }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading
        ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        : cards.map((card, i) => (
            <StatCard key={i} index={i} trigger={trigger} {...card} />
          ))
      }
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IhkaamByNumbers() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Trigger counters only when section enters viewport (native IntersectionObserver)
  const sectionRef = useRef(null)
  const [sectionVisible, setSectionVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setSectionVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const trigger = sectionVisible && !loading

  useEffect(() => {
    Promise.all([
      // Group 1 — recitation breakdown
      supabase.from('recitations').select('*', { count: 'exact', head: true }),
      supabase.from('recitations').select('*', { count: 'exact', head: true }).eq('category', 'قرآن'),
      supabase.from('recitations').select('*', { count: 'exact', head: true }).eq('category', 'حديث'),
      // Group 2 — achievement
      supabase.from('tests').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('stars_of_the_week').select('*', { count: 'exact', head: true }),
      supabase.from('subjects').select('*', { count: 'exact', head: true }),
      // Group 3 — institute
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('staff').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('attendance').select('*', { count: 'exact', head: true })
        .eq('record_type', 'غياب').eq('is_deleted', false),
    ]).then(([rAll, rQuran, rHadith, rTests, rStars, rSubj, rStud, rStaff, rAbs]) => {
      setData({
        recitations : rAll.count    ?? 0,
        quranRecs   : rQuran.count  ?? 0,
        hadithRecs  : rHadith.count ?? 0,
        tests       : rTests.count  ?? 0,
        stars       : rStars.count  ?? 0,
        subjects    : rSubj.count   ?? 0,
        students    : rStud.count   ?? 0,
        staff       : rStaff.count  ?? 0,
        absences    : rAbs.count    ?? 0,
      })
      setLoading(false)
    })
  }, [])

  const group1 = data ? [
    {
      value : data.recitations,
      label : 'جلسة تسميع موثقة',
      desc  : 'كل جلسة مسجلة رقمياً — بتاريخها ودرجتها ومادتها، لكل طالب على حدة',
      color : '#6ABDB2',
    },
    {
      value : data.quranRecs,
      label : 'جلسة تسميع قرآن كريم',
      desc  : 'حفظاً ومراجعةً وتلاوةً — كل جلسة موثقة بصفحاتها ونتيجتها',
      color : '#A3D9B5',
    },
    {
      value : data.hadithRecs,
      label : 'جلسة تسميع حديث نبوي',
      desc  : 'المعلم يوثّق تسميع الأحاديث بنفس دقة القرآن — لا فرق في الأهمية',
      color : '#B5A3D9',
    },
  ] : []

  const group2 = data ? [
    {
      value : data.tests,
      label : 'اختبار موثق',
      desc  : 'اختبارات المراحل والأجزاء مسجلة رقمياً — بالنتيجة والتاريخ والمادة',
      color : '#D9C4A3',
    },
    {
      value : data.stars,
      label : 'نجم حلقة تم تتويجه',
      desc  : 'كل أسبوع يُختار نجم — يُعلَم أهله، يُسجَّل إنجازه، ويبقى في سجله للأبد',
      color : '#F5D87A',
    },
    {
      value  : data.subjects,
      prefix : '',
      label  : 'مادة شرعية رديفة تُدار',
      desc   : 'الفقه، العقيدة، التجويد، السيرة وغيرها — تُتابَع بنفس دقة القرآن',
      color  : '#C4D9A3',
    },
  ] : []

  const group3 = data ? [
    {
      value : data.students,
      label : 'طالب يُتابَع يومياً',
      desc  : 'لكل طالب سجله الكامل: الحضور، التسميع، الملاحظات — بدون ورقة واحدة',
      color : '#A3C4D9',
    },
    {
      value : data.staff,
      label : 'معلم يوثّق بدون ورق',
      desc  : 'وقتهم للتعليم، لا لملء السجلات — إحكام يتولى الباقي',
      color : '#D9C8A3',
    },
    {
      value : data.absences,
      label : 'حالة غياب وثّقت',
      desc  : 'ولي الأمر يعلم في دقائق — لا في نهاية الأسبوع، ولا حين يسأل',
      color : '#D9ACA3',
    },
  ] : []

  return (
    <section ref={sectionRef} dir="rtl" className="relative py-20 overflow-hidden" style={{ background: '#010D0D' }}>

      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0" aria-hidden style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(2,115,104,0.06) 0%, transparent 70%)',
      }} />

      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.60, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <span className="text-xs font-bold tracking-[0.22em] uppercase" style={{ color: '#6ABDB2' }}>
            إحكام بالأرقام
          </span>
          <h2 className="font-black mt-2 mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#EAE4DF', lineHeight: 1.2 }}>
            هذا ما فعله إحكام{' '}
            <span style={{ color: '#6ABDB2' }}>حتى اليوم</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#7A9E96', maxWidth: 480 }}>
            أرقام حقيقية من قاعدة البيانات — لا متوسطات، لا مقارنات، فقط ما تم فعلاً
          </p>
        </motion.div>

        {/* Group 1 — التسميع والحفظ */}
        <GroupLabel color="#6ABDB2">التسميع والحفظ</GroupLabel>
        <div className="mb-4">
          <SmartGrid cards={group1} loading={loading} trigger={trigger} />
        </div>

        {/* Group 2 — الإنجاز والتميز */}
        <GroupLabel color="#F5D87A">الإنجاز والتميز</GroupLabel>
        <div className="mb-4">
          <SmartGrid cards={group2} loading={loading} trigger={trigger} />
        </div>

        {/* Group 3 — إدارة المعهد */}
        <GroupLabel color="#D9ACA3">إدارة المعهد</GroupLabel>
        <SmartGrid cards={group3} loading={loading} trigger={trigger} />

      </div>
    </section>
  )
}
