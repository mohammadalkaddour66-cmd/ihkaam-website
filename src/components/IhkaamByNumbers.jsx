import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { fetchLandingStats } from '../config/landingStats'

/* ══════════════════════════════════════════════════════
   لونٌ واحد لكل مجموعة، لا لونٌ لكل بطاقة.

   كانت تسع بطاقاتٍ بستّة ألوان: ‎#D9ACA3‎ ثلاثاً، و‎#E0C79A‎ مرّتين،
   و‎#C9A67E‎ و‎#F0C97A‎ و‎#96BCBE‎ و‎#48D6CD‎. سبعٌ من التسع دافئة —
   أي أنّ الثانويّ كان يحكم أكبر قسمٍ رقميّ في الصفحة، والأساسيّ
   ضيفاً فيه. ولم تكن الستّة تعني شيئاً: بطاقتان بلونين مختلفين
   داخل المجموعة الواحدة، وبطاقتان بلونٍ واحد عبر مجموعتين.

   المجموعة هي وحدة المعنى هنا، فهي وحدة اللون:
     ١ التسميع والحفظ   → الأساسيّ. جوهر المنتج.
     ٢ الإنجاز والتميّز  → الدفء. هذه دلالته، وهذا موضعه الوحيد
                          في القسم — ثلاث بطاقاتٍ متجاورة تُقرأ
                          كتلةً مقصودة، لا كسبعٍ مبثوثةٍ عشواءً.
     ٣ إدارة المعهد     → محايد. تشغيلٌ يوميّ لا إنجاز.

   المجموعة الثانية كانت الذهبَ ‎#E3A93F‎: درجته 39° وتشبّعه 76%،
   فتُقرأ برتقالياً صاخباً — وثلاث بطاقاتٍ متجاورة تضاعف الصخب.
   ثم صارت ‎--warm #D9B29C‎ (درجة 22°) بنفس الدلالة.

   وفي 2026-07-30 صارت الثلاث درجاتٍ من اللكنة الواحدة، بعد ما
   استُقرّ في بطاقات الشهادات: الدفءُ فوق سطحٍ درجتُه 174° يشدّ
   الأخضر إلى الأمام — اللونان شبه متقابلين على العجلة، فيزيد كلٌّ
   منهما تشبّعَ الآخر في العين. وثلاث بطاقاتٍ دافئة في المنتصف
   كانت أكبرَ رقعةٍ يقع فيها هذا في الصفحة.

   والمجموعة تبقى وحدةَ اللون كما هي، لكن **التمايز بالإضاءة داخل
   العائلة** لا بدرجةٍ لونية جديدة:
     ١ التسميع والحفظ  → ‎#48D6CD‎  اللكنة نفسها. جوهر المنتج ولون القسم.
     ٢ الإنجاز والتميّز → ‎#6FE7DE‎  أعلى إضاءة — الإنجاز يلمع.
     ٣ إدارة المعهد    → ‎#2FAEB4‎  أخفتها — تشغيلٌ يوميّ لا إنجاز.
   وثلاثتها ≥7:1 على ‎--canvas‎، والرقم نصٌّ بلون المجموعة.

   glowRgb ثلاثيةٌ صريحة لأن وميض العدّاد يُحرَّك عبر framer:
   الحركة تستبدل السلاسل بينياً، وسلسلةُ color-mix لا تقبل ذلك. */
const GROUPS = {
  recite : { color: 'var(--accent)',       glowRgb: '72,214,205'  },
  achieve: { color: 'var(--accent-hover)', glowRgb: '111,231,222' },
  manage : { color: 'var(--accent-deep)',  glowRgb: '47,174,180'  },
}

// ── Animated counter — starts only when `trigger` becomes true ────────────────
// Glow effect uses textShadow (not absolute positioning) so it never gets clipped
function CountUp({ to, duration = 1600, trigger, glowRgb }) {
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
          `0 0 0px  rgba(${glowRgb},0)`,
          `0 0 18px rgba(${glowRgb},1), 0 0 36px rgba(${glowRgb},0.53)`,
          `0 0 8px  rgba(${glowRgb},0.27)`,
          `0 0 0px  rgba(${glowRgb},0)`,
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
function StatCard({ value, prefix = '+', label, desc, color, glowRgb, index, trigger }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className="stat-card flex flex-col gap-2.5 px-6 pt-7 pb-6 h-full"
      style={{ '--gc': color }}
    >
      {/* وهجُ الزاوية */}
      <div className="pointer-events-none absolute top-0 end-0 w-28 h-28" aria-hidden
        style={{ background: 'radial-gradient(circle at top left, color-mix(in srgb, var(--gc) 11%, transparent), transparent 70%)' }} />

      {/* بلورةُ الضوء تحت الشريط العلويّ — الشريط 2px مصمت يُقرأ
          خطاً مطبوعاً؛ وهذه هالته، فيُقرأ باثّاً للضوء. الشهادات
          نالت نفسها خطاً داخلياً على الحرف الأعلى، ولا يصلح هنا
          لأن الشريط يغطّيه. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10" aria-hidden
        style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--gc) 9%, transparent), transparent)' }} />

      {/* الرقم. الزائدةُ أصغرُ وأخفتُ فلا تُقرأ جزءاً من العدد،
          و‏.num-seq تعزلها عن اتجاه الفقرة فلا تنقلب. */}
      <div className="relative flex items-baseline gap-0.5 num-seq">
        <span className="font-black tabular-nums leading-none"
          style={{ fontSize: 'clamp(1.9rem,3.2vw,2.6rem)', color: 'var(--gc)' }}>
          <CountUp to={value} trigger={trigger} glowRgb={glowRgb} />
        </span>
        {prefix && (
          <span className="font-black leading-none"
            style={{ fontSize: '0.95rem', color: 'color-mix(in srgb, var(--gc) 55%, transparent)' }}>
            {prefix}
          </span>
        )}
      </div>

      {/* العنوان صار --text-1: كان --text-2 فيقرأ بوزن الوصف نفسه،
          فلا هرميّة داخل البطاقة — رقمٌ ثم سطران متساويان. */}
      <p className="relative font-bold text-sm leading-snug" style={{ color: 'var(--text-1)' }}>{label}</p>

      <p className="relative text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{desc}</p>
    </motion.article>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 animate-pulse h-44"
      style={{
        background: 'linear-gradient(145deg, color-mix(in srgb, var(--canvas-2) 70%, transparent), color-mix(in srgb, var(--canvas) 95%, transparent))',
        border    : '1px solid rgba(255,255,255,0.06)',
      }} />
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
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, color-mix(in srgb, ${color} 16%, transparent))` }} />
    </motion.div>
  )
}

// ── Smart grid: 1 col mobile, 2 cols tablet, 3 cols desktop.
// A leftover card at the 2-col tablet breakpoint (odd count) spans both
// columns so it doesn't strand itself next to an empty gap.
function SmartGrid({ cards, loading, trigger }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading
        ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        : cards.map((card, i) => {
            const isOrphanAt2Col = i === cards.length - 1 && cards.length % 2 === 1
            return (
              <div key={i} className={isOrphanAt2Col ? 'sm:col-span-2 lg:col-span-1' : undefined}>
                <StatCard index={i} trigger={trigger} {...card} />
              </div>
            )
          })
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
    fetchLandingStats().then(s => {
      setData({
        recitations : s.recitations,        // المجموعة 1 — تفصيل التسميع
        quranRecs   : s.recitationsQuran,
        hadithRecs  : s.recitationsHadith,
        tests       : s.tests,              // المجموعة 2 — الإنجاز
        stars       : s.stars,
        subjects    : s.subjects,
        students    : s.students,           // المجموعة 3 — المعهد
        staff       : s.staff,
        absences    : s.absences,
      })
      setLoading(false)
    })
  }, [])

  const group1 = data ? [
    {
      value : data.recitations,
      label : 'جلسة تسميع موثقة',
      desc  : 'كل جلسة مسجلة رقمياً — بتاريخها ودرجتها ومادتها، لكل طالب على حدة',
      ...GROUPS.recite,
    },
    {
      value : data.quranRecs,
      label : 'جلسة تسميع قرآن كريم',
      desc  : 'حفظاً ومراجعةً وتلاوةً — كل جلسة موثقة بصفحاتها ونتيجتها',
      ...GROUPS.recite,
    },
    {
      value : data.hadithRecs,
      label : 'جلسة تسميع حديث نبوي',
      desc  : 'المعلم يوثّق تسميع الأحاديث بنفس دقة القرآن — لا فرق في الأهمية',
      ...GROUPS.recite,
    },
  ] : []

  const group2 = data ? [
    {
      value : data.tests,
      label : 'اختبار موثق',
      desc  : 'اختبارات المراحل والأجزاء مسجلة رقمياً — بالنتيجة والتاريخ والمادة',
      ...GROUPS.achieve,
    },
    {
      value : data.stars,
      label : 'نجم حلقة تم تتويجه',
      desc  : 'كل أسبوع يُختار نجم — يُعلَم أهله، يُسجَّل إنجازه، ويبقى في سجله للأبد',
      ...GROUPS.achieve,
    },
    {
      value  : data.subjects,
      prefix : '',
      label  : 'مادة شرعية رديفة تُدار',
      desc   : 'الفقه، العقيدة، التجويد، السيرة وغيرها — تُتابَع بنفس دقة القرآن',
      ...GROUPS.achieve,
    },
  ] : []

  const group3 = data ? [
    {
      value : data.students,
      label : 'طالب يُتابَع يومياً',
      desc  : 'لكل طالب سجله الكامل: الحضور، التسميع، الملاحظات — بدون ورقة واحدة',
      ...GROUPS.manage,
    },
    {
      value : data.staff,
      label : 'معلم يوثّق بدون ورق',
      desc  : 'وقتهم للتعليم، لا لملء السجلات — إحكام يتولى الباقي',
      ...GROUPS.manage,
    },
    {
      value : data.absences,
      label : 'حالة غياب وثّقت',
      desc  : 'ولي الأمر يعلم في دقائق — لا في نهاية الأسبوع، ولا حين يسأل',
      ...GROUPS.manage,
    },
  ] : []

  return (
    <section ref={sectionRef} dir="rtl" className="relative py-20 overflow-hidden" style={{ background: 'var(--canvas)' }}>

      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0" aria-hidden style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(26, 148, 155,0.06) 0%, transparent 70%)',
      }} />

      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.60, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          {/* كان هذا القسم وحده غير موسّط بين أقسام الرئيسية الستّة —
             الخمسة الأخرى تُوسّط ترويستها. والتوسيط هنا ليس ذوقاً
             فحسب: العمود على الجوال ضيّق، والترويسة سطران أو ثلاثة،
             فالتوسيط يوازنها. أما المتن الطويل فيبقى محاذى للبداية
             حيث كان — النصّ الموسّط الطويل يُتعب العين لأن بداية كل
             سطر تتزحزح فيضيع مكان الاستئناف. وهذه فقرة سطرين. */}
          <span className="text-xs font-bold tracking-[0.22em] uppercase" style={{ color: 'var(--accent)' }}>
            إحكام بالأرقام
          </span>
          <h2 className="font-black mt-2 mb-3" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.1rem)', lineHeight: 1.28, color: 'var(--text-1)' }}>
            هذا ما فعله إحكام{' '}
            <span style={{ color: 'var(--accent)' }}>حتى اليوم</span>
          </h2>
          <p className="text-sm leading-relaxed mx-auto" style={{ color: 'var(--text-2)', maxWidth: 480 }}>
            أرقام حقيقية من قاعدة البيانات — لا متوسطات، لا مقارنات، فقط ما تم فعلاً
          </p>
        </motion.div>

        {/* Group 1 — التسميع والحفظ */}
        <GroupLabel color={GROUPS.recite.color}>التسميع والحفظ</GroupLabel>
        <div className="mb-4">
          <SmartGrid cards={group1} loading={loading} trigger={trigger} />
        </div>

        {/* Group 2 — الإنجاز والتميز */}
        <GroupLabel color={GROUPS.achieve.color}>الإنجاز والتميز</GroupLabel>
        <div className="mb-4">
          <SmartGrid cards={group2} loading={loading} trigger={trigger} />
        </div>

        {/* Group 3 — إدارة المعهد */}
        <GroupLabel color={GROUPS.manage.color}>إدارة المعهد</GroupLabel>
        <SmartGrid cards={group3} loading={loading} trigger={trigger} />

      </div>
    </section>
  )
}
