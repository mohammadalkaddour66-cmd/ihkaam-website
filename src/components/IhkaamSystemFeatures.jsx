import { motion } from 'framer-motion'
import {
  Smartphone, Zap, ShieldCheck, RefreshCw,
  FileDown, UserCog,
} from 'lucide-react'

const FEATURES = [
  {
    icon : Smartphone,
    title: 'يعمل على جميع الأجهزة',
    desc : 'سواء كنت على حاسوبك أو جهازك اللوحي أو هاتفك، يعمل نظام إحكام بكفاءة كامل لأندرويد وآيفون.',
    color: '#6ABDB2',
    glow : 'rgba(106,189,178,0.12)',
  },
  {
    icon : Zap,
    title: 'سهل الاستخدام',
    desc : 'لا يتطلب النظام أي خبرة تقنية مسبقة. صُمّم بحيث يتعلمه المعلم في دقائق ويستخدمه يومياً دون أي تعقيد.',
    color: '#D9ACA3',
    glow : 'rgba(217,172,163,0.12)',
  },
  {
    icon : ShieldCheck,
    title: 'الأمن والحماية',
    desc : 'بُني النظام وفق أفضل معايير الأمن السحابي، مع تشفير البيانات وصلاحيات محكمة تضمن خصوصية كل معهد ومستخدم.',
    color: '#6ABDB2',
    glow : 'rgba(106,189,178,0.12)',
  },
  {
    icon : RefreshCw,
    title: 'تحديثات مستمرة',
    desc : 'يحصل كل معهد تلقائياً على كل تحديث وتطوير جديد دون أي تدخل منه — النظام يتطور معك باستمرار.',
    color: '#D9ACA3',
    glow : 'rgba(217,172,163,0.12)',
  },
 
  {
    icon : FileDown,
    title: 'تقارير قابلة للتصدير',
    desc : 'صدّر أي تقرير — حضور، تسميع، درجات — بصيغة PDF بضغطة واحدة، مع إمكانية التصفية حسب الطالب أو الفترة الزمنية.',
    color: '#6ABDB2',
    glow : 'rgba(106,189,178,0.12)',
  },
 
  {
    icon : UserCog,
    title: 'صلاحيات متعددة المستويات',
    desc : 'أدر فريق عملك بثقة — مدير، مشرف، معلم، إداري — كل دور له صلاحياته الدقيقة دون أي تداخل أو تعارض.',
    color: '#6ABDB2',
    glow : 'rgba(106,189,178,0.12)',
  },
]

const containerVariants = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const cardVariants = {
  hidden : { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.50, ease: [0.22, 1, 0.36, 1] } },
}

function FeatureRow({ feature }) {
  const Icon = feature.icon
  return (
    <motion.div
      variants={cardVariants}
      className="flex items-start gap-5 rounded-2xl px-6 py-5 cursor-default"
      style={{
        background: 'rgba(1,16,16,0.55)',
        border    : `1px solid rgba(229,211,179,0.06)`,
        borderRight: `3px solid ${feature.color}50`,
      }}
      whileHover={{ x: -4 }}
      transition={{ duration: 0.20, ease: 'easeOut' }}
      onMouseEnter={e => {
        e.currentTarget.style.background   = 'rgba(1,22,22,0.80)'
        e.currentTarget.style.borderRight  = `3px solid ${feature.color}`
        e.currentTarget.style.boxShadow    = `4px 0 24px ${feature.color}18`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background   = 'rgba(1,16,16,0.55)'
        e.currentTarget.style.borderRight  = `3px solid ${feature.color}50`
        e.currentTarget.style.boxShadow    = 'none'
      }}
    >
      {/* Round icon */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: feature.glow,
          border    : `1px solid ${feature.color}35`,
        }}
      >
        <Icon size={20} style={{ color: feature.color }} strokeWidth={1.65} />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <h3
          className="font-black leading-snug"
          style={{ color: '#EAE4DF', fontSize: '0.95rem' }}
        >
          {feature.title}
        </h3>
        <p
          className="text-sm leading-[1.85]"
          style={{ color: '#6A9490' }}
        >
          {feature.desc}
        </p>
      </div>
    </motion.div>
  )
}

export default function IhkaamSystemFeatures() {
  return (
    <section className="relative z-10 py-24 px-6 overflow-hidden">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(2,115,104,0.07) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
            style={{ color: '#4A7A72' }}
          >
            المنصة التقنية
          </span>
          <h2
            className="font-black leading-tight mx-auto mb-5"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', maxWidth: '600px' }}
          >
            خصائص النظام
          </h2>
          <p
            className="text-sm mx-auto leading-[2]"
            style={{ color: '#7A9E96', maxWidth: '540px' }}
          >
            بُني نظام إحكام على أسس تقنية راسخة تجعله موثوقاً وسهلاً وآمناً،
            ليس فقط يوم تشغيله — بل لسنوات قادمة.
          </p>
        </motion.div>

        {/* Two-column list of horizontal rows */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {FEATURES.map((f, i) => (
            <FeatureRow key={i} feature={f} />
          ))}
        </motion.div>

      </div>
    </section>
  )
}
