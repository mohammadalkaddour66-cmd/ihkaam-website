import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Brain, ArrowLeft, ShieldCheck, Activity, MessageSquare, Sparkles,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   التحليل الذكي — القسم المميّز.
   بقية أقسام الصفحة تعدّ ما يفعله النظام. هذا القسم وحده يُري
   المخرَج نفسه: بطاقة الحكم كما تظهر للمشرف حرفياً. الادعاء
   ("يكشف التراجع مبكراً") لا يُصدَّق بالوصف — يُصدَّق حين يرى
   القارئ الأرقام والسبب مكتوبَين أمامه.
═══════════════════════════════════════════════════════════════ */

/* الأرقام هنا مثال توضيحي بوحدات المنتج الحقيقية وعتباته — لا لقطة
   من معهد. حافظ عليها متسقة مع src/data/featureDetails.js (insights). */
const METRICS = [
  { label: 'تسميع القرآن',    from: '١٢٫٤', to: '٧٫١',  tone: 'down', chip: 'تراجع ٤٣٪'      },
  { label: 'نسبة الغياب',     from: '٦٪',   to: '٢١٪',  tone: 'down', chip: 'تراجع ١٥ نقطة' },
  { label: 'جودة التسميع',    from: '٨٤٪',  to: '٨٦٪',  tone: 'flat', chip: 'مستقر'          },
  { label: 'معدل الاختبارات', from: '٧١٪',  to: '٨٣٪',  tone: 'up',   chip: 'تحسن ١٢ نقطة'  },
]

const TONE = {
  down: { fg: '#F08A8A', bg: 'rgba(239,100,100,0.10)', bd: 'rgba(239,100,100,0.24)' },
  up  : { fg: '#5FD3A8', bg: 'rgba(95,211,168,0.10)',  bd: 'rgba(95,211,168,0.24)'  },
  flat: { fg: '#6FA5A8', bg: 'rgba(72,214,205,0.05)',  bd: 'rgba(72,214,205,0.12)'  },
}

const PILLARS = [
  {
    icon : Activity,
    title: 'يقارن الحلقة بماضيها، لا بجاراتها',
    desc : 'كل حلقة تُقاس بنفسها قبل أسابيع، وكل طالب بنفسه. لا ترتيب بين المعلمين — لأن الترتيب يدفع لتجميل البيانات، فيفسد المصدر الذي تقوم عليه التقارير وبوابة الأهل كلها.',
  },
  {
    icon : MessageSquare,
    title: 'يكتب لك السبب، لا الرقم وحده',
    desc : '«تسميع القرآن: انخفض من ١٢٫٤ إلى ٧٫١ صفحة/أسبوع — يستحق وقفة ومتابعة». جملة عربية جاهزة تشرح ماذا تغيّر وبكم، فلا تحتاج من يفسّر لك الشاشة.',
  },
  {
    icon : ShieldCheck,
    title: 'يسكت حين لا يملك دليلاً',
    desc : 'قبل أي إنذار يمرّ الرقم على حواجز ضجيج: حدّ أدنى من الجلسات، ونطاق ثبات، وفرق مطلق. «لا بيانات كافية» أصدق من إنذار كاذب — أول إنذار خاطئ يُفقد المعلم ثقته بالميزة إلى الأبد.',
  },
]

const sectionIn = {
  hidden : { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
}
const listIn = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.10 } },
}
const itemIn = {
  hidden : { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } },
}

/* ─── بطاقة الحكم ─────────────────────────────────────────────── */
function VerdictCard() {
  return (
    <motion.div
      variants={itemIn}
      className="relative rounded-[26px] p-5 sm:p-7 w-full"
      style={{
        background: 'linear-gradient(165deg, rgba(72,214,205,0.07) 0%, rgba(2,15,14,0.97) 55%)',
        border    : '1px solid rgba(72,214,205,0.18)',
        boxShadow : '0 34px 80px rgba(0,0,0,0.55)',
      }}
    >
      {/* توهّج خلفي خفيف يفصل البطاقة عن خلفية الصفحة السوداء */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -top-8 h-40 -z-10"
        style={{ background: 'radial-gradient(ellipse at top, rgba(72,214,205,0.10) 0%, transparent 70%)' }}
      />

      {/* ترويسة الحلقة */}
      <div
        className="flex items-center justify-between gap-3 pb-4 mb-4"
        style={{ borderBottom: '1px solid rgba(72,214,205,0.10)' }}
      >
        <div className="text-right min-w-0">
          <p className="font-black truncate" style={{ color: '#EAE4DF', fontSize: '0.92rem' }}>
            حلقة الإمام النووي
          </p>
          <p className="mt-1" style={{ color: '#6FA5A8', fontSize: '0.68rem' }}>
            أ. عبد الرحمن · ١٤ طالباً
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(26,148,155,0.20)', border: '1px solid rgba(72,214,205,0.18)' }}
        >
          <Brain size={17} style={{ color: '#48D6CD' }} strokeWidth={1.7} />
        </div>
      </div>

      {/* الحكم + سببه */}
      <div
        className="rounded-2xl px-4 py-3.5 mb-4"
        style={{ background: TONE.down.bg, border: `1px solid ${TONE.down.bd}` }}
      >
        <p className="font-black" style={{ color: TONE.down.fg, fontSize: '0.82rem' }}>
          تنبيه: تراجع ملحوظ بالحلقة
        </p>
        <p className="mt-2" style={{ color: '#96BCBE', fontSize: '0.7rem', lineHeight: 2 }}>
          تسميع القرآن: انخفض من ١٢٫٤ إلى ٧٫١ صفحة/أسبوع — يستحق وقفة ومتابعة.
        </p>
      </div>

      {/* صفوف المؤشرات */}
      <div className="flex flex-col gap-1.5">
        {METRICS.map(m => {
          const t = TONE[m.tone]
          return (
            <div
              key={m.label}
              className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(72,214,205,0.04)', border: '1px solid rgba(72,214,205,0.09)' }}
            >
              <span
                className="font-bold whitespace-nowrap"
                style={{ color: '#EAE4DF', fontSize: '0.72rem' }}
              >
                {m.label}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                {/* dir=ltr مقصود: القارئ يمسح السطر يميناً-ليساراً فيلقى القيمة
                    القديمة أولاً، ثم يقوده السهم للحديثة — "كان كذا وصار كذا".
                    عكسها يروي القصة مقلوبة. */}
                <span
                  dir="ltr"
                  className="whitespace-nowrap tabular-nums"
                  style={{ color: '#6FA5A8', fontSize: '0.66rem' }}
                >
                  {m.to} ← {m.from}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 font-black whitespace-nowrap"
                  style={{
                    color     : t.fg,
                    background: t.bg,
                    border    : `1px solid ${t.bd}`,
                    fontSize  : '0.58rem',
                  }}
                >
                  {m.chip}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center mt-4" style={{ color: '#4E7E80', fontSize: '0.6rem' }}>
        مثال توضيحي · المقارنة دائماً بماضي الحلقة نفسها
      </p>
    </motion.div>
  )
}

/* ─── القسم ───────────────────────────────────────────────────── */
export default function IhkaamSmartInsights() {
  return (
    <section id="insights" className="relative z-10 py-24 px-6" style={{ scrollMarginTop: '90px' }} dir="rtl">

      {/* توهّج محيط */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[820px] h-[420px] max-w-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(72,214,205,0.07) 0%, transparent 68%)' }}
      />

      <div className="max-w-6xl mx-auto">

        {/* ترويسة القسم */}
        <motion.div
          className="text-center mb-14"
          variants={sectionIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-70px' }}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6"
            style={{ background: 'rgba(72,214,205,0.09)', border: '1px solid rgba(72,214,205,0.24)' }}
          >
            <Sparkles size={12} style={{ color: '#48D6CD' }} strokeWidth={2} />
            <span className="text-xs font-bold tracking-wide" style={{ color: '#48D6CD' }}>
              جديد · ضمن النسخة الأساسية
            </span>
          </div>

          <h2
            className="font-black leading-[1.25] mx-auto mb-5"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.55rem, 3.4vw, 2.35rem)', maxWidth: '640px' }}
          >
            التحليل الذكي —
            <br className="hidden sm:block" />
            <span style={{ color: '#48D6CD' }}> يقول لك أين تتراجع الحلقة قبل أن يسألك أحد.</span>
          </h2>

          <p
            className="mx-auto"
            style={{ color: '#96BCBE', maxWidth: '620px', fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)', lineHeight: 2.1 }}
          >
            لوحة التحكم تقول لك أين يقف معهدك اليوم.
            التحليل الذكي يقول لك إلى أين يتجه — يقارن كل حلقة وكل طالب بماضيه هو،
            ويكتب لك الحكم وسببه من سجلاتك اليومية نفسها. بلا إدخال إضافي واحد.
          </p>
        </motion.div>

        {/* البطاقة + الركائز */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 lg:gap-12 items-center"
          variants={listIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-70px' }}
        >
          <VerdictCard />

          <div className="flex flex-col gap-5">
            {PILLARS.map(p => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  variants={itemIn}
                  className="flex items-start gap-4 rounded-[20px] p-5"
                  style={{
                    background: 'rgba(72,214,205,0.035)',
                    border    : '1px solid rgba(72,214,205,0.10)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(26,148,155,0.18)', border: '1px solid rgba(72,214,205,0.16)' }}
                  >
                    <Icon size={18} style={{ color: '#48D6CD' }} strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black mb-2" style={{ color: '#EAE4DF', fontSize: '0.95rem' }}>
                      {p.title}
                    </h3>
                    <p style={{ color: '#8AAFA8', fontSize: '0.8rem', lineHeight: 2 }}>
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}

            <motion.div variants={itemIn}>
              <Link
                to="/ihkaam/features/insights"
                className="inline-flex items-center gap-2.5 text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200"
                style={{
                  color     : '#48D6CD',
                  background: 'rgba(72,214,205,0.08)',
                  border    : '1px solid rgba(72,214,205,0.22)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background  = 'rgba(72,214,205,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(72,214,205,0.48)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = 'rgba(72,214,205,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(72,214,205,0.22)'
                }}
              >
                كيف يعمل التحليل الذكي بالتفصيل
                <ArrowLeft size={14} strokeWidth={2.5} />
              </Link>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
