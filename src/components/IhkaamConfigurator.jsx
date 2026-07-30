import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet, Award, Headphones, Crosshair, Inbox, Library, ArrowLeft,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const MotionLink = motion(Link)

/* ── Each add-on has its own visual DNA ────────────────────────────── */
const ADDONS = [
  {
    id     : 1,
    slug   : 'finance',
    icon   : Wallet,
    badge  : 'المالية',
    title  : 'الإدارة المالية',
    desc   : 'تتسرب أموال المعهد بين ملفات الإكسل والأقساط المنسية؟ تحكم كامل بالميزانية، القيود، والكفالات.',
    accent : 'var(--cat-3)',
    bgTop  : 'linear-gradient(155deg, #09201E 0%, #09201E 60%, #020F0E 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-3) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-3) 25%, transparent)',
  },
  {
    id     : 3,
    slug   : 'subjects',
    icon   : Library,
    badge  : 'التعليم',
    title  : 'إدارة المواد الرديفة',
    desc   : 'الفقه، العقيدة، والتجويد تعاني من التهميش؟ نظام رصد ذكي يشمل كل مادة بنفس دقة القرآن.',
    accent : 'var(--cat-5)',
    bgTop  : 'linear-gradient(155deg, #09201E 0%, #09201E 60%, #020F0E 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-5) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-5) 25%, transparent)',
  },
  {
    id     : 4,
    slug   : 'star',
    icon   : Award,
    badge  : 'التحفيز',
    title  : 'نجم الحلقة',
    desc   : 'محرك ذكي يستخرج المتفوق آلياً ويولد بطاقات تكريم فخمة جاهزة للنشر فوراً.',
    accent : 'var(--cat-1)',
    bgTop  : 'linear-gradient(155deg, #09201E 0%, #09201E 60%, #020F0E 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-1) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-1) 25%, transparent)',
    featured: true,
  },
  {
    id     : 5,
    slug   : 'library',
    icon   : Headphones,
    badge  : 'المكتبة',
    title  : 'المكتبة الصوتية والمعلم الافتراضي',
    desc   : 'وفر وقت المعلم. ربط ذكي لصفحات القرآن بمقاطع تلقينية ومكتبة مرجعية متكاملة.',
    accent : 'var(--cat-6)',
    bgTop  : 'linear-gradient(155deg, #09201E 0%, #09201E 60%, #020F0E 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-6) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-6) 25%, transparent)',
  },
  {
    id     : 6,
    slug   : 'exams',
    icon   : Crosshair,
    badge  : 'الاختبارات',
    title  : 'طابور الاختبارات الذكي',
    desc   : 'لوحة حية تنهي فوضى التنقل. راقب سير الطلاب واكتشف المتأخرين فوراً عبر رادار ذكي.',
    accent : 'var(--cat-4)',
    bgTop  : 'linear-gradient(155deg, #09201E 0%, #09201E 60%, #020F0E 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-4) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-4) 25%, transparent)',
  },
  {
    id     : 7,
    slug   : 'messages',
    icon   : Inbox,
    badge  : 'التواصل',
    title  : 'ملاحظات أولياء الأمور',
    desc   : 'تخلص من فوضى الواتساب. قناة إرسال منظمة وسرية بين أولياء الأمور والإدارة.',
    accent : 'var(--cat-2)',
    bgTop  : 'linear-gradient(155deg, #09201E 0%, #09201E 60%, #020F0E 100%)',
    bgBody : 'var(--canvas)',
    border : 'color-mix(in srgb, var(--cat-2) 22%, transparent)',
    glow   : 'color-mix(in srgb, var(--cat-2) 25%, transparent)',
  },
]

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
      to={`/ihkaam/addons/${addon.slug}`}
      variants={cardVariants}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`relative flex flex-col rounded-[22px] overflow-hidden${center ? ' xl:col-start-2' : ''}`}
      style={{
        background    : addon.bgBody,
        border        : `1px solid ${hov ? addon.border : 'rgba(255,255,255,0.05)'}`,
        boxShadow     : hov
          ? `0 28px 60px rgba(0,0,0,0.55), 0 0 40px ${addon.glow}`
          : '0 4px 24px rgba(0,0,0,0.35)',
        transform     : hov ? 'translateY(-7px)' : 'translateY(0)',
        transition    : 'all 260ms ease',
        textDecoration: 'none',
        cursor        : 'pointer',
      }}
    >
      {/* ── Top visual area ─────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center pt-8 pb-7 px-6 overflow-hidden"
        style={{ background: addon.bgTop, minHeight: 160 }}
      >
        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(color-mix(in srgb, ${addon.accent} 13%, transparent) 1px, transparent 1px)`,
            backgroundSize : '18px 18px',
          }}
          aria-hidden
        />

        {/* Ambient radial glow behind icon */}
        <div
          className="pointer-events-none absolute"
          style={{
            width      : 140,
            height     : 140,
            borderRadius: '50%',
            background : `radial-gradient(circle, ${addon.glow} 0%, transparent 70%)`,
            opacity    : hov ? 1 : 0.55,
            transition : 'opacity 280ms ease',
          }}
          aria-hidden
        />

        {/* Category badge */}
        <span
          className="absolute top-4 right-5 text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
          style={{
            color     : addon.accent,
            background: `color-mix(in srgb, ${addon.accent} 9%, transparent)`,
            border    : `1px solid color-mix(in srgb, ${addon.accent} 21%, transparent)`,
          }}
        >
          {addon.badge}
        </span>

        {/* Featured badge */}
        {addon.featured && (
          <span
            className="absolute top-4 left-5 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{
              color     : '#0A0800',
              background: addon.accent,
            }}
          >
            الأكثر طلباً
          </span>
        )}

        {/* Large icon */}
        <motion.div
          className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center"
          animate={hov ? { scale: 1.12, rotate: 4 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            background: `color-mix(in srgb, ${addon.accent} 9%, transparent)`,
            border    : `1.5px solid color-mix(in srgb, ${addon.accent} 27%, transparent)`,
            boxShadow : hov ? `0 0 28px ${addon.glow}, 0 0 56px ${addon.glow}` : `0 0 12px ${addon.glow}`,
            transition: 'box-shadow 280ms ease',
          }}
        >
          <Icon size={28} style={{ color: addon.accent }} strokeWidth={1.5} />
        </motion.div>
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
            color   : '#EAE4DF',
            fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)',
          }}
        >
          {addon.title}
        </h3>

        <p
          className="text-sm flex-1"
          style={{ color: '#96BCBE', lineHeight: '1.95' }}
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
            color     : hov ? addon.accent : `color-mix(in srgb, ${addon.accent} 44%, transparent)`,
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
        style={{ background: 'radial-gradient(ellipse at top, rgba(26,148,155,0.06) 0%, transparent 70%)' }}
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
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
            style={{ color: '#A6756A' }}
          >
            مكوّنات اختيارية
          </span>
          <h2
            className="font-black leading-tight mx-auto mb-5"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', maxWidth: '640px' }}
          >
            وحدات التوسعة المخصصة{' '}
            <span style={{ color: '#D9ACA3' }}>Premium Add-ons</span>
          </h2>
          <p
            className="text-sm mx-auto"
            style={{ color: '#509492', maxWidth: '520px', lineHeight: '2' }}
          >
            أدوات هندسية دقيقة مصممة لحل أعمق المشاكل الإدارية. يمكنك إضافتها لباقتك أثناء إتمام الطلب.
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

      </div>
    </section>
  )
}
