import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet, Award, Headphones, Crosshair, Inbox, Library, ArrowLeft,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const MotionLink = motion(Link)

/* الإضافات المدفوعة ثلاث فقط وتحت /ihkaam/addons؛ البقية صفحات ميزات أساسية. */
const PAID_SLUGS = ['finance', 'subjects', 'star']
const featureHref = slug => (PAID_SLUGS.includes(slug) ? `/ihkaam/addons/${slug}` : `/ihkaam/features/${slug}`)

/* ── Each add-on has its own visual DNA ────────────────────────────── */
/* ISS-46: الإضافات المدفوعة ثلاث فقط (المالية، المواد الرديفة، نجم الحلقة).
   المكتبة الصوتية وطابور الاختبارات وملاحظات أولياء الأمور صارت ضمن النسخة
   الأساسية، فتُعرض في صفٍّ مستقل بعنوانٍ يقول ذلك صراحة. */
const ALL_MODULES = [
  {
    id     : 1,
    slug   : 'finance',
    img    : '/scenes/addon-finance.webp',
    icon   : Wallet,
    badge  : 'المالية',
    title  : 'الإدارة المالية',
    desc   : 'تتسرب أموال المعهد بين ملفات الإكسل والأقساط المنسية؟ تحكم كامل بالميزانية، القيود، والكفالات.',
    accent : 'var(--cat-3)',
    bgTop  : 'linear-gradient(155deg, #FFFFFF 0%, #FFFFFF 60%, #F8F5EC 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-3) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-3) 25%, transparent)',
  },
  {
    id     : 3,
    slug   : 'subjects',
    img    : '/scenes/addon-subjects.webp',
    icon   : Library,
    badge  : 'التعليم',
    title  : 'إدارة المواد الرديفة',
    desc   : 'الفقه، العقيدة، والتجويد تعاني من التهميش؟ نظام رصد ذكي يشمل كل مادة بنفس دقة القرآن.',
    accent : 'var(--cat-5)',
    bgTop  : 'linear-gradient(155deg, #FFFFFF 0%, #FFFFFF 60%, #F8F5EC 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-5) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-5) 25%, transparent)',
  },
  {
    id     : 4,
    slug   : 'star',
    img    : '/scenes/addon-star.webp',
    icon   : Award,
    badge  : 'التحفيز',
    title  : 'نجم الحلقة',
    desc   : 'محرك ذكي يستخرج المتفوق آلياً ويولد بطاقات تكريم فخمة جاهزة للنشر فوراً.',
    accent : 'var(--cat-1)',
    bgTop  : 'linear-gradient(155deg, #FFFFFF 0%, #FFFFFF 60%, #F8F5EC 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-1) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-1) 25%, transparent)',
    featured: true,
  },
  {
    id     : 5,
    slug   : 'library',
    img    : '/scenes/feat-library.webp',
    icon   : Headphones,
    badge  : 'المكتبة',
    title  : 'المكتبة الصوتية والمعلم الافتراضي',
    desc   : 'وفر وقت المعلم. ربط ذكي لصفحات القرآن بمقاطع تلقينية ومكتبة مرجعية متكاملة.',
    accent : 'var(--cat-6)',
    bgTop  : 'linear-gradient(155deg, #FFFFFF 0%, #FFFFFF 60%, #F8F5EC 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-6) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-6) 25%, transparent)',
    included: true,
  },
  {
    id     : 6,
    slug   : 'exams',
    img    : '/scenes/feat-exams.webp',
    icon   : Crosshair,
    badge  : 'الاختبارات',
    title  : 'طابور الاختبارات الذكي',
    desc   : 'لوحة حية تنهي فوضى التنقل. راقب سير الطلاب واكتشف المتأخرين فوراً عبر رادار ذكي.',
    accent : 'var(--cat-4)',
    bgTop  : 'linear-gradient(155deg, #FFFFFF 0%, #FFFFFF 60%, #F8F5EC 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-4) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-4) 25%, transparent)',
    included: true,
  },
  {
    id     : 7,
    slug   : 'messages',
    img    : '/scenes/feat-messages.webp',
    icon   : Inbox,
    badge  : 'التواصل',
    title  : 'ملاحظات أولياء الأمور',
    desc   : 'تخلص من فوضى الواتساب. قناة إرسال منظمة وسرية بين أولياء الأمور والإدارة.',
    accent : 'var(--cat-2)',
    bgTop  : 'linear-gradient(155deg, #FFFFFF 0%, #FFFFFF 60%, #F8F5EC 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-2) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-2) 25%, transparent)',
    included: true,
  },
]

const ADDONS   = ALL_MODULES.filter(m => !m.included)
const INCLUDED = ALL_MODULES.filter(m => m.included)

const containerVariants = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.10, delayChildren: 0.04 } },
}
const cardVariants = {
  hidden : { opacity: 0, y: 30, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] } },
}

function AddonCard({ addon, center }) {
  const [hov, setHov] = useState(false)
  const Icon = addon.icon

  return (
    <MotionLink
      to={featureHref(addon.slug)}
      variants={cardVariants}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`relative flex flex-col rounded-[22px] overflow-hidden${center ? ' xl:col-start-2' : ''}`}
      style={{
        background    : addon.bgBody,
        border        : `1px solid ${hov ? addon.border : 'rgba(11, 59, 51, 0.05)'}`,
        boxShadow     : hov
          ? `0 28px 60px rgba(11, 59, 51, 0.165), 0 0 40px ${addon.glow}`
          : '0 4px 24px rgba(11, 59, 51, 0.105)',
        transform     : hov ? 'translateY(-7px)' : 'translateY(0)',
        transition    : 'all 260ms ease',
        textDecoration: 'none',
        cursor        : 'pointer',
      }}
    >
      {/* ── Top visual area ─────────────────── */}
      {/* مشهدٌ مصوَّر بهوية إحكام بدل الأيقونة على نقاط (2026-11-19 ج) */}
      <div
        className="relative overflow-hidden"
        style={{ background: '#F1ECDF', aspectRatio: '16 / 9' }}
      >
        <img src={addon.img} alt="" aria-hidden width={1280} height={720} loading="lazy" decoding="async"
             className="absolute inset-0 w-full h-full object-cover"
             style={{ transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 900ms var(--ease-out)' }} />

        {/* Category badge */}
        <span
          className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
          style={{ color: '#0B3B33', background: 'rgba(253,251,247,0.92)', boxShadow: 'inset 0 0 0 1px rgba(184,134,58,0.35)' }}
        >
          <Icon size={13} strokeWidth={2} style={{ color: '#8A6425' }} />
          {addon.included ? 'ضمن النسخة الأساسية' : addon.badge}
        </span>

        {/* Featured badge */}
        {addon.featured && (
          <span
            className="absolute top-3.5 left-3.5 text-xs font-bold px-3 py-1 rounded-full"
            style={{ color: '#0B3B33', background: 'linear-gradient(145deg,#ECC77D,#B8863A)' }}
          >
            الأكثر طلباً
          </span>
        )}
      </div>

      {/* Divider with glow */}
      <div
        style={{
          height    : 1,
          background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${addon.accent} 21%, transparent), transparent)`,
        }}
      />

      {/* ── Body ─────────────────────────────── */}
      <div className="flex flex-col gap-4 p-6 flex-1">
        <h3
          className="font-black leading-snug"
          style={{
            color   : '#1A2E28',
            fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)',
          }}
        >
          {addon.title}
        </h3>

        <p
          className="text-sm flex-1"
          style={{ color: '#4A5D56', lineHeight: '1.95' }}
        >
          {addon.desc}
        </p>

        {/* ── "اعرف المزيد" pill ─────────────── */}
        <div
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold w-fit"
          style={{
            background: hov
              ? `color-mix(in srgb, ${addon.accent} 13%, transparent)`
              : `color-mix(in srgb, ${addon.accent} 5%, transparent)`,
            border    : `1px solid color-mix(in srgb, ${addon.accent} ${hov ? 33 : 16}%, transparent)`,
            color     : hov ? addon.accent : '#8A6425',
            boxShadow : hov ? `0 0 14px ${addon.glow}` : 'none',
            transition: 'all 240ms ease',
          }}
        >
          اعرف المزيد
          <ArrowLeft
            size={12}
            strokeWidth={2.5}
            style={{
              transform : hov ? 'translateX(-3px)' : 'translateX(0)',
              transition: 'transform 200ms ease',
            }}
          />
        </div>
      </div>
    </MotionLink>
  )
}

/* ─── Main export ────────────────────────────────────────────────── */
export default function IhkaamConfigurator() {
  return (
    <section className="relative z-10 py-24 px-6">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.30) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">الإضافات</span>
          <h2
            className="font-bold leading-tight mx-auto mt-5 mb-5"
            style={{ color: '#1A2E28', fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', maxWidth: '760px' }}
          >
            ثلاث إضافات مدفوعة،{' '}
            <span style={{ color: '#8A6425' }}>والباقي ضمن النسخة الأساسية</span>
          </h2>
          <p
            className="text-sm mx-auto"
            style={{ color: '#5E6E67', maxWidth: '520px', lineHeight: '2' }}
          >
            تختار من الإضافات الثلاث ما يحتاجه معهدك وتضيفه أثناء الطلب. أما المكتبة
            الصوتية وطابور الاختبارات وملاحظات أولياء الأمور فتأتي مع النسخة الأساسية
            دون رسوم إضافية.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-14"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
        >
          {ADDONS.map((addon, i) => (
            <AddonCard
              key={addon.id}
              addon={addon}
              center={ADDONS.length % 3 !== 0 && i === ADDONS.length - 1}
            />
          ))}
        </motion.div>

        <h3
          className="text-center font-bold mb-8"
          style={{ color: '#1A2E28', fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)' }}
        >
          مشمولة في النسخة الأساسية
        </h3>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-14"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
        >
          {INCLUDED.map((addon, i) => (
            <AddonCard
              key={addon.id}
              addon={addon}
              center={INCLUDED.length % 3 !== 0 && i === INCLUDED.length - 1}
            />
          ))}
        </motion.div>

      </div>
    </section>
  )
}
