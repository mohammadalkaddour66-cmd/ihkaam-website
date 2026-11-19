import { motion } from 'framer-motion'
import { Users, BookOpen, ClipboardList, Bell, BarChart3, Brain, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

/* ─── Feature data ───────────────────────────────────────────────── */
const FEATURES = [
  {
    id    : 1,
    slug  : 'admin',
    icon  : Users,
    title : 'الإدارة المتكاملة',
    tag   : 'تحكم كامل بالمعهد',
    desc  : 'أدر الطلاب والكادر التعليمي والإداري من لوحة تحكم واحدة تمنحك رؤية شاملة، وتنظم جميع العمليات اليومية بكفاءة وثقة.',
    slogan: 'كل شيء تحت السيطرة.',
  },
  {
    id    : 2,
    slug  : 'academic',
    icon  : BookOpen,
    title : 'التنظيم الأكاديمي',
    tag   : 'تنظيم يبدأ بضغطة زر',
    desc  : 'أنشئ الصفوف والحلقات ووزّع الطلاب بسهولة، لتبقى العملية التعليمية منظمة ومرنة مهما ازداد عدد الطلاب.',
    slogan: 'تنظيم ذكي يبدأ من أول طالب.',
  },
  {
    id    : 3,
    slug  : 'daily',
    icon  : ClipboardList,
    title : 'المتابعة اليومية',
    tag   : 'كل ما يحتاجه المعلم',
    desc  : 'سجّل التسميع والحضور والاختبارات والملاحظات من واجهة واحدة، لتصبح متابعة الطالب أسرع وأكثر دقة وأقل جهدًا.',
    slogan: 'لا تفوت أي تفصيل.',
  },
  {
    id    : 4,
    slug  : 'insights',
    icon  : Brain,
    title : 'التحليل الذكي',
    tag   : 'إنذار مبكر قبل أن يتفاقم',
    desc  : 'يقارن كل حلقة وكل طالب بماضيه، فيكشف التراجع مبكراً ويكتب لك سببه — من سجلاتك اليومية نفسها، بلا إدخال إضافي.',
    slogan: 'لا تكتشف التراجع بعد شهرين.',
    isNew : true,
  },
  {
    id    : 5,
    slug  : 'parents',
    icon  : Bell,
    title : 'بوابة أولياء الأمور',
    tag   : 'تواصل مستمر وثقة أكبر',
    desc  : 'امنح ولي الأمر نافذة مباشرة لمتابعة تقدم ابنه، والاطلاع على سجلاته وتقاريره في أي وقت.',
    slogan: 'الثقة تبدأ بالشفافية.',
  },
  {
    id    : 6,
    slug  : 'reports',
    icon  : BarChart3,
    title : 'التقارير والأرشفة',
    tag   : 'بيانات تدعم القرار',
    desc  : 'استخرج تقارير دقيقة، واحتفظ بجميع البيانات في أرشيف سحابي آمن، لتحويل المعلومات اليومية إلى قرارات مدروسة.',
    slogan: 'كل قرار يبدأ من البيانات.',
  },
]

const COVERAGE_CHIPS = [
  'تسجيل الطلاب', 'تسجيل الكادر', 'الصفوف والحلقات',
  'التسميع اليومي', 'الغياب والتأخر', 'سلوك الطلاب', 'الاختبارات',
  'التقارير', 'التحليل الذكي', 'الأرشفة', 'بوابة ولي الأمر',
]

/* ─── Animation variants ─────────────────────────────────────────── */
const gridVariants = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}
const cardVariants = {
  hidden : { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.54, ease: [0.22, 1, 0.36, 1] } },
}

/* ─── Feature card ───────────────────────────────────────────────── */
function FeatureCard({ feature }) {
  const Icon = feature.icon
  const num  = String(feature.id).padStart(2, '0')
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`relative rounded-[22px] flex flex-col overflow-hidden${feature.wide ? ' md:col-span-2 lg:col-span-2' : ''}`}
      style={{
        background: 'linear-gradient(160deg, rgba(72,214,205,0.06) 0%, rgba(2,15,14,0.95) 55%)',
        border    : '1px solid rgba(72,214,205,0.12)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(72,214,205,0.28)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(72,214,205,0.12)' }}
    >
      {/* Watermark number — decorative, top-left (LTR corner = left in RTL context) */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-3 left-5 font-black leading-none select-none"
        style={{ fontSize: '4.5rem', color: 'rgba(72,214,205,0.07)', lineHeight: 1 }}
      >
        {num}
      </span>

      {/* Left accent stripe */}
      <div
        className="absolute top-0 right-0 bottom-0 w-[3px] rounded-r-[22px]"
        style={{ background: 'linear-gradient(to bottom, #48D6CD 0%, transparent 100%)' }}
      />

      <div className="p-7 flex flex-col gap-5 flex-1">

        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(26,148,155,0.18)',
            border    : '1px solid rgba(72,214,205,0.16)',
          }}
        >
          <Icon size={20} style={{ color: '#48D6CD' }} strokeWidth={1.55} />
        </div>

        {/* Title + tagline */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-black leading-snug"
              style={{ color: '#EAE4DF', fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}
            >
              {feature.title}
            </h3>
            {feature.isNew && (
              <span
                className="text-[0.6rem] font-black px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  color     : '#D9ACA3',
                  background: 'rgba(217,172,163,0.10)',
                  border    : '1px solid rgba(217,172,163,0.28)',
                }}
              >
                جديد
              </span>
            )}
          </div>
          <span
            className="text-xs font-bold"
            style={{ color: '#48D6CD', letterSpacing: '0.025em' }}
          >
            {feature.tag}
          </span>
        </div>

        {/* Description */}
        <p
          className="text-sm leading-[2] flex-1"
          style={{ color: '#8AAFA8' }}
        >
          {feature.desc}
        </p>

        {/* Slogan */}
        <p
          className="text-xs font-black tracking-wide"
          style={{ color: 'rgba(72,214,205,0.50)', letterSpacing: '0.04em' }}
        >
          {feature.slogan}
        </p>

        {/* Learn more */}
        <Link
          to={`/ihkaam/features/${feature.slug}`}
          className="inline-flex items-center gap-2 text-xs font-bold w-fit px-3.5 py-2 rounded-lg transition-all duration-200"
          style={{
            color      : '#48D6CD',
            background : 'rgba(72,214,205,0.07)',
            border     : '1px solid rgba(72,214,205,0.18)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background  = 'rgba(72,214,205,0.14)'
            e.currentTarget.style.borderColor  = 'rgba(72,214,205,0.45)'
            e.currentTarget.style.color        = '#8FDFD6'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = 'rgba(72,214,205,0.07)'
            e.currentTarget.style.borderColor  = 'rgba(72,214,205,0.18)'
            e.currentTarget.style.color        = '#48D6CD'
          }}
        >
          اعرف المزيد
          <ArrowLeft size={12} strokeWidth={2.5} />
        </Link>

      </div>
    </motion.div>
  )
}

/* ─── Main export ────────────────────────────────────────────────── */
export default function IhkaamCoreFeatures() {
  return (
    <section className="relative z-10 py-24 px-6">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(217,172,163,0.05) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-14">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
            style={{ color: '#A6756A' }}
          >
            النسخة الأساسية
          </span>
          <h2
            className="font-black leading-tight mx-auto mb-5"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', maxWidth: '560px' }}
          >
            المنظومة الأساسية لإدارة المعهد
          </h2>
          <p
            className="text-sm mx-auto"
            style={{ color: '#509492', maxWidth: '580px', lineHeight: '2' }}
          >
            تحتوي النسخة الأساسية على جميع الأدوات اليومية اللازمة لإدارة المعهد القرآني بكفاءة،
            بدءًا من تسجيل الطلاب وتنظيم الحلقات، وصولًا إلى المتابعة اليومية والتقارير وبوابة أولياء الأمور.
          </p>
        </div>

        {/* Bento grid — 5 cards, last spans 2 cols */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {FEATURES.map(f => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </motion.div>

        {/* Coverage strip */}
        <motion.div
          className="mt-8 rounded-[20px] p-6"
          style={{
            background: 'rgba(72,214,205,0.04)',
            border    : '1px solid rgba(72,214,205,0.12)',
          }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.50, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <p
            className="text-xs font-semibold tracking-[0.20em] uppercase text-center mb-3.5"
            style={{ color: 'var(--text-3)' }}
          >
            النسخة الأساسية تغطي
          </p>
          {/* أُزيلت علامة الصحّ من كل شريحة.
             إحدى عشرة علامةً متطابقة لا تحمل معلومة: العنوان فوقها
             يقول «تغطي» أصلاً، فكلّ ما تحتها مغطّى بالتعريف. وكانت
             تكلّف 16px عرضاً لكل شريحة (أيقونة 10 + فجوة 6)، وهو
             ما يحشر الصفّ في ثلاث شرائح بدل أربع فيطول الصندوق. */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {COVERAGE_CHIPS.map(chip => (
              <span
                key={chip}
                className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{
                  background: 'rgba(72,214,205,0.09)',
                  border    : '1px solid rgba(72,214,205,0.18)',
                  color     : 'var(--accent)',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
