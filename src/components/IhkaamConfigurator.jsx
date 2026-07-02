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
    accent : '#C9A84C',
    bgTop  : 'linear-gradient(155deg, #1A1200 0%, #120D00 60%, #09080A 100%)',
    bgBody : '#09060A',
    border : 'rgba(201,168,76,0.22)',
    glow   : 'rgba(201,168,76,0.25)',
  },
  {
    id     : 3,
    slug   : 'subjects',
    icon   : Library,
    badge  : 'التعليم',
    title  : 'إدارة المواد الرديفة',
    desc   : 'الفقه، العقيدة، والتجويد تعاني من التهميش؟ نظام رصد ذكي يشمل كل مادة بنفس دقة القرآن.',
    accent : '#6ABDB2',
    bgTop  : 'linear-gradient(155deg, #001E1A 0%, #001410 60%, #030E0D 100%)',
    bgBody : '#030D0C',
    border : 'rgba(106,189,178,0.22)',
    glow   : 'rgba(106,189,178,0.22)',
  },
  {
    id     : 4,
    slug   : 'star',
    icon   : Award,
    badge  : 'التحفيز',
    title  : 'نجم الحلقة',
    desc   : 'محرك ذكي يستخرج المتفوق آلياً ويولد بطاقات تكريم فخمة جاهزة للنشر فوراً.',
    accent : '#F0C040',
    bgTop  : 'linear-gradient(155deg, #1E1600 0%, #141000 60%, #0C0A02 100%)',
    bgBody : '#0A0902',
    border : 'rgba(240,192,64,0.22)',
    glow   : 'rgba(240,192,64,0.28)',
    featured: true,
  },
  {
    id     : 5,
    slug   : 'library',
    icon   : Headphones,
    badge  : 'المكتبة',
    title  : 'المكتبة الصوتية والمعلم الافتراضي',
    desc   : 'وفر وقت المعلم. ربط ذكي لصفحات القرآن بمقاطع تلقينية ومكتبة مرجعية متكاملة.',
    accent : '#A78FD4',
    bgTop  : 'linear-gradient(155deg, #0E0820 0%, #08041A 60%, #060310 100%)',
    bgBody : '#050310',
    border : 'rgba(167,143,212,0.22)',
    glow   : 'rgba(167,143,212,0.25)',
  },
  {
    id     : 6,
    slug   : 'exams',
    icon   : Crosshair,
    badge  : 'الاختبارات',
    title  : 'طابور الاختبارات الذكي',
    desc   : 'لوحة حية تنهي فوضى التنقل. راقب سير الطلاب واكتشف المتأخرين فوراً عبر رادار ذكي.',
    accent : '#7FB4D4',
    bgTop  : 'linear-gradient(155deg, #031220 0%, #020C18 60%, #020A14 100%)',
    bgBody : '#020A14',
    border : 'rgba(127,180,212,0.22)',
    glow   : 'rgba(127,180,212,0.22)',
  },
  {
    id     : 7,
    slug   : 'messages',
    icon   : Inbox,
    badge  : 'التواصل',
    title  : 'ملاحظات أولياء الأمور',
    desc   : 'تخلص من فوضى الواتساب. قناة إرسال منظمة وسرية بين أولياء الأمور والإدارة.',
    accent : '#D4908A',
    bgTop  : 'linear-gradient(155deg, #1A0808 0%, #120404 60%, #0E0404 100%)',
    bgBody : '#0A0404',
    border : 'rgba(212,144,138,0.22)',
    glow   : 'rgba(212,144,138,0.22)',
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
            backgroundImage: `radial-gradient(${addon.accent}20 1px, transparent 1px)`,
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
            background: `${addon.accent}18`,
            border    : `1px solid ${addon.accent}35`,
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
            background: `${addon.accent}18`,
            border    : `1.5px solid ${addon.accent}45`,
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
          background: `linear-gradient(90deg, transparent, ${addon.accent}35, transparent)`,
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
          style={{ color: '#7A9E96', lineHeight: '1.95' }}
        >
          {addon.desc}
        </p>

        {/* ── "اعرف المزيد" pill ─────────────── */}
        <div
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold w-fit"
          style={{
            background: hov
              ? `${addon.accent}22`
              : `${addon.accent}0D`,
            border    : `1px solid ${addon.accent}${hov ? '55' : '28'}`,
            color     : hov ? addon.accent : `${addon.accent}70`,
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
        style={{ background: 'radial-gradient(ellipse at top, rgba(2,115,104,0.06) 0%, transparent 70%)' }}
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
            style={{ color: '#5A8A7E', maxWidth: '520px', lineHeight: '2' }}
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
