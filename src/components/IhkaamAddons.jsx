import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Library, Trophy, Check, Sparkles } from 'lucide-react'

/* ── Each addon is a standalone product with its own visual identity ── */
const ADDONS = [
  {
    id      : 'finance',
    icon    : DollarSign,
    badge   : 'الإدارة المالية',
    title   : 'معهدك يستحق نظاماً مالياً بمستوى المؤسسات',
    outcome : 'توقف عن تتبع الأقساط يدوياً — النظام يُحاسب، يُذكّر، ويُقيّد تلقائياً.',
    bullets : [
      'إدارة الأقساط والواردات مع قيود آلية',
      'صناديق الكفالات وتقارير مالية لحظية',
      'تنبيهات التأخر وكشوف الحسابات دون جهد',
    ],
    price   : '25$',
    period  : 'شهرياً',
    bgFrom  : '#060E1C',
    bgMid   : '#0A1628',
    bgTo    : '#050D18',
    accent  : '#7BAFD4',
    border  : 'rgba(123,175,212,0.22)',
    glow    : 'rgba(123,175,212,0.18)',
    priceGlow: 'rgba(123,175,212,0.30)',
  },
  {
    id      : 'media',
    icon    : Library,
    badge   : 'المركز الصوتي',
    title   : 'اجعل كل درس أثراً يبقى — لا معلومة تضيع بعد اليوم',
    outcome : 'مكتبة صوتية وتعليمية تتراكم مع الوقت وتخدم طلابك إلى الأبد.',
    bullets : [
      'مكتبة شروحات وتسجيلات مرتبطة بكل مادة',
      'تحضير إلكتروني شامل للمعلم',
      'وصول الطلاب للمراجعة في أي وقت',
    ],
    price   : '15$',
    period  : 'شهرياً',
    bgFrom  : '#0A0618',
    bgMid   : '#130D2A',
    bgTo    : '#080415',
    accent  : '#A78FD4',
    border  : 'rgba(167,143,212,0.22)',
    glow    : 'rgba(167,143,212,0.18)',
    priceGlow: 'rgba(167,143,212,0.30)',
    featured: true,
  },
  {
    id      : 'gamification',
    icon    : Trophy,
    badge   : 'التحفيز الذكي',
    title   : 'حوّل الحلقة إلى بيئة تنافسية يعشقها الطلاب',
    outcome : 'أتمتة التكريم، الاختبارات، والجوائز — بدون تنسيق يدوي أسبوعياً.',
    bullets : [
      'نجم الأسبوع الآلي — يظهر تلقائياً في بوابة ولي الأمر',
      'طابور اختبارات ذكي وحجز أدوار التسميع',
      'جوائز وشارات تحفيزية مرئية للطلاب',
    ],
    price   : '20$',
    period  : 'شهرياً',
    bgFrom  : '#120A00',
    bgMid   : '#1E1000',
    bgTo    : '#0E0700',
    accent  : '#D4B87A',
    border  : 'rgba(212,184,122,0.22)',
    glow    : 'rgba(212,184,122,0.18)',
    priceGlow: 'rgba(212,184,122,0.30)',
  },
]

const containerVariants = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
}
const cardVariants = {
  hidden : { opacity: 0, y: 36, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1] } },
}

function AddonCard({ addon }) {
  const [hov, setHov] = useState(false)
  const Icon = addon.icon

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      animate={hov ? { y: -10 } : { y: 0 }}
      transition={{ duration: 0.30, ease: 'easeOut' }}
      className="relative flex flex-col rounded-[24px] overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${addon.bgFrom} 0%, ${addon.bgMid} 45%, ${addon.bgTo} 100%)`,
        border    : `1px solid ${hov ? addon.border : 'rgba(255,255,255,0.06)'}`,
        boxShadow : hov
          ? `0 40px 80px rgba(0,0,0,0.60), 0 0 0 1px ${addon.border}, 0 0 60px ${addon.priceGlow}`
          : '0 8px 32px rgba(0,0,0,0.40)',
        transition: 'border 240ms ease, box-shadow 240ms ease',
      }}
    >
      {/* Dot-grid texture overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${addon.accent}18 1px, transparent 1px)`,
          backgroundSize : '22px 22px',
          opacity        : hov ? 0.7 : 0.35,
          transition     : 'opacity 300ms ease',
        }}
        aria-hidden
      />

      {/* Shimmer sweep on hover */}
      {hov && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ x: '110%', skewX: '-18deg' }}
          animate={{ x: '-110%' }}
          transition={{ duration: 0.75, ease: 'easeInOut' }}
          style={{
            width     : '45%',
            background: `linear-gradient(90deg, transparent, ${addon.accent}12, transparent)`,
          }}
          aria-hidden
        />
      )}

      {/* ── Top header band ─────────────────────── */}
      <div
        className="relative px-7 pt-8 pb-7"
        style={{ borderBottom: `1px solid ${addon.accent}18` }}
      >
        {/* Featured badge */}
        {addon.featured && (
          <div
            className="absolute top-5 left-5 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: `${addon.accent}20`,
              border    : `1px solid ${addon.accent}50`,
            }}
          >
            <Sparkles size={10} style={{ color: addon.accent }} />
            <span className="text-[10px] font-bold" style={{ color: addon.accent }}>
              الأكثر طلباً
            </span>
          </div>
        )}

        {/* Price — top-right, prominent */}
        <div className="absolute top-6 right-7 text-right">
          <div
            className="font-black leading-none"
            style={{
              fontSize : '2.1rem',
              color    : addon.accent,
              textShadow: hov ? `0 0 20px ${addon.priceGlow}` : 'none',
              transition: 'text-shadow 300ms ease',
            }}
          >
            {addon.price}
          </div>
          <div className="text-[10px] font-semibold mt-0.5" style={{ color: `${addon.accent}80` }}>
            {addon.period}
          </div>
        </div>

        {/* Icon */}
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          animate={hov ? { scale: 1.08 } : { scale: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            background: `radial-gradient(circle at 35% 35%, ${addon.accent}30, ${addon.glow} 70%)`,
            border    : `1px solid ${addon.accent}40`,
            boxShadow : hov ? `0 0 28px ${addon.priceGlow}` : 'none',
            transition: 'box-shadow 300ms ease',
          }}
        >
          <Icon size={28} style={{ color: addon.accent }} strokeWidth={1.5} />
        </motion.div>

        {/* Module badge */}
        <span
          className="inline-block text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full mb-3"
          style={{
            color     : addon.accent,
            background: `${addon.accent}12`,
            border    : `1px solid ${addon.accent}30`,
          }}
        >
          {addon.badge}
        </span>

        {/* Headline */}
        <h3
          className="font-black leading-[1.4] mb-2"
          style={{
            color    : '#EAE4DF',
            fontSize : 'clamp(0.95rem, 1.5vw, 1.08rem)',
            maxWidth : '88%',
          }}
        >
          {addon.title}
        </h3>

        {/* Outcome */}
        <p
          className="text-xs leading-[1.85]"
          style={{ color: `${addon.accent}90`, maxWidth: '90%' }}
        >
          {addon.outcome}
        </p>
      </div>

      {/* ── Body: bullets ─────────────────────── */}
      <div className="relative flex flex-col gap-3.5 px-7 py-6 flex-1">
        {addon.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: `${addon.accent}18`,
                border    : `1px solid ${addon.accent}40`,
              }}
            >
              <Check size={9} style={{ color: addon.accent }} strokeWidth={3} />
            </div>
            <span className="text-sm leading-[1.75]" style={{ color: '#9ABFB8' }}>
              {b}
            </span>
          </div>
        ))}
      </div>

      {/* ── Footer CTA ─────────────────────────── */}
      <div
        className="relative px-7 pb-7"
        style={{ borderTop: `1px solid ${addon.accent}12` }}
      >
        <button
          className="w-full mt-5 py-3 rounded-xl font-bold text-sm transition-all duration-250"
          style={{
            background: hov
              ? `linear-gradient(135deg, ${addon.accent}30, ${addon.accent}18)`
              : `${addon.accent}10`,
            border : `1px solid ${addon.accent}${hov ? '60' : '28'}`,
            color  : addon.accent,
            boxShadow: hov ? `0 0 18px ${addon.priceGlow}` : 'none',
            cursor : 'pointer',
          }}
        >
          أضف للخطة
        </button>
      </div>
    </motion.div>
  )
}

export default function IhkaamAddons() {
  return (
    <section className="relative z-10 py-24 px-6 overflow-hidden" id="addons">

      {/* Deep ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[340px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(2,60,80,0.18) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto">

        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
            style={{ color: '#A6756A' }}
          >
            وحدات التوسعة
          </span>
          <h2
            className="font-black leading-tight mx-auto mb-4"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', maxWidth: '560px' }}
          >
            وحدات متخصصة —{' '}
            <span style={{ color: '#7BAFD4' }}>كل واحدة نظام قائم بذاته</span>
          </h2>
          <p
            className="text-sm mx-auto leading-[1.9]"
            style={{ color: '#5A8A7E', maxWidth: '440px' }}
          >
            لا تدفع مقابل ما لا تحتاجه — أضف فقط ما يخدم معهدك، متى تريد
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {ADDONS.map(addon => (
            <AddonCard key={addon.id} addon={addon} />
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          className="text-center text-xs mt-10"
          style={{ color: '#3D6A62' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          جميع الوحدات تُفعَّل فورياً — لا إعداد تقني، لا انتظار
        </motion.p>

      </div>
    </section>
  )
}
