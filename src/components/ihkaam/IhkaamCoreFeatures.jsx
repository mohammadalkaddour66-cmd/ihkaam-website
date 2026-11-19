import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Users, BookOpen, ClipboardList, Bell, BarChart3, Brain, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeatureCardVisual from '../sections/FeatureCardVisual'
import { useGalleryShots } from '../../hooks/useGalleryShots'

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

/* ══════════════════════════════════════════════════════════════════
   «المنظومة الأساسية» (إعادة تصميم 2026-11-19 ج)

   كانت ستّ بطاقاتٍ نصّية متشابهة برقمٍ باهت في الزاوية. صارت ستة صفوفٍ
   متعاقبة: في كلٍّ الشاشة الحقيقية للميزة (FeatureCardVisual، نفسها في
   الرئيسية) مقابل شرحها، وتتبادل الجهتين صفاً بعد صف.

   وعلى الحافة خطٌّ ذهبيّ يمتدّ مع التمرير ويمرّ على أرقام الصفوف،
   فيضيء كل رقمٍ حين يصله الخط — «الترقيم المرسوم» الذي طلبه المالك.
   حركةٌ مربوطة بالتمرير لا تعمل في الخلفية.
   ══════════════════════════════════════════════════════════════════ */

function FeatureRow({ feature, index, shots }) {
  const Icon = feature.icon
  const num  = String(feature.id).padStart(2, '0')
  const flip = index % 2 === 1
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
      {/* الرقم على الخط */}
      <motion.span
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-[-72px] w-11 h-11 rounded-full items-center justify-center text-sm font-bold tabular-nums z-10"
        initial={{ background: '#F1ECDF', color: '#8A6425', scale: 0.85 }}
        whileInView={{ background: '#B8863A', color: '#0B3B33', scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -50% 0px' }}
        transition={{ duration: 0.4 }}
        style={{ boxShadow: '0 0 0 6px #F8F5EC' }}
      >
        {num}
      </motion.span>

      <motion.div
        className={flip ? 'md:order-2' : ''}
        initial={{ opacity: 0, x: flip ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(31,111,82,0.08)', color: '#1F6F52', boxShadow: 'inset 0 0 0 1px rgba(31,111,82,0.16)' }}>
            <Icon size={21} strokeWidth={1.7} />
          </span>
          <span className="text-sm font-bold" style={{ color: '#8A6425' }}>{feature.tag}</span>
          {feature.isNew && <span className="text-xs font-bold rounded-full px-2.5 py-0.5" style={{ background: '#E0B562', color: '#0B3B33' }}>جديد</span>}
        </div>
        <h3 className="font-bold mb-3" style={{ color: '#0B3B33', fontSize: 'clamp(1.5rem, 2.6vw, 2rem)' }}>{feature.title}</h3>
        <p className="text-lg mb-4" style={{ color: 'var(--text-2)', lineHeight: 1.95 }}>{feature.desc}</p>
        <p className="text-base font-bold mb-6" style={{ color: '#1F6F52' }}>{feature.slogan}</p>
        <Link to={`/ihkaam/features/${feature.slug}`} className="btn-outline inline-flex items-center gap-2 rounded-full px-6 py-3" style={{ fontSize: '0.95rem' }}>
          اقرأ عن {feature.title} <ArrowLeft size={15} />
        </Link>
      </motion.div>

      <motion.div
        className={`relative rounded-[24px] overflow-hidden ${flip ? 'md:order-1' : ''}`}
        style={{ aspectRatio: '16 / 10', background: 'linear-gradient(160deg,#0B3B33,#082C26)', boxShadow: 'var(--shadow-lg)' }}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <div className="absolute inset-0 pattern-khatam" style={{ opacity: 0.08 }} aria-hidden />
        <FeatureCardVisual slug={feature.slug} shots={shots} />
      </motion.div>
    </div>
  )
}

/* ─── Main export ────────────────────────────────────────────────── */
export default function IhkaamCoreFeatures() {
  const shots = useGalleryShots(true)
  const rail  = useRef(null)
  const { scrollYProgress } = useScroll({ target: rail, offset: ['start 60%', 'end 50%'] })
  const fill  = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section className="relative z-10 py-24 px-6" dir="rtl">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-20">
          <span className="eyebrow">النسخة الأساسية</span>
          <h2 className="font-bold leading-tight mx-auto mt-5 mb-5" style={{ color: '#1A2E28', fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', maxWidth: 720 }}>
            ستّ وحدات <span className="title-mark">تدير يوم المعهد كلّه</span>
          </h2>
          <p className="text-lg mx-auto" style={{ color: '#4A5D56', maxWidth: 620, lineHeight: 1.9 }}>
            من تسجيل الطالب الأول إلى تقرير آخر الشهر. هذه شاشاتها الحقيقية كما يراها المدير والمعلم وولي الأمر.
          </p>
        </div>

        <div ref={rail} className="relative md:pr-[72px] flex flex-col gap-24">
          {/* الخطّ: أثرٌ خافت، وفوقه الذهب يمتدّ مع التمرير */}
          <span className="hidden md:block absolute top-0 bottom-0 right-[21px] w-[2px] rounded-full" style={{ background: 'rgba(184,134,58,0.18)' }} aria-hidden />
          <motion.span className="hidden md:block absolute top-0 bottom-0 right-[21px] w-[2px] rounded-full origin-top"
            style={{ scaleY: fill, background: 'linear-gradient(to bottom,#E0B562,#B8863A)', boxShadow: '0 0 10px rgba(224,181,98,0.6)' }} aria-hidden />
          {FEATURES.map((f, i) => <FeatureRow key={f.id} feature={f} index={i} shots={shots} />)}
        </div>

        {/* ما تغطّيه النسخة الأساسية */}
        <div className="mt-24 text-center">
          <p className="text-base font-bold mb-4" style={{ color: '#8A6425' }}>وكلّها ضمن النسخة الأساسية</p>
          <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
            {COVERAGE_CHIPS.map(chip => (
              <span key={chip} className="text-sm font-bold px-4 py-2 rounded-full bg-white" style={{ color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
