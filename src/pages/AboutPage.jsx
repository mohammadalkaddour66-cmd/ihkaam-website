import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, FileSpreadsheet, Rocket, Landmark, MessageCircle, ArrowLeft, X, Check, Database, History, Gauge } from 'lucide-react'
import { Link } from 'react-router-dom'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import ClientReviewForm    from '../components/forms/ClientReviewForm'
import ShowcaseViewer      from '../components/about/ShowcaseViewer'
import { BrowserFrame }    from '../components/help/ShotFrame'
import { desk }            from '../data/helpVisuals'
import { IHKAAM_WHATSAPP, waLink } from '../config/whatsappOrder'
import AffiliateInvite from '../components/sections/AffiliateInvite'

const IhkaamTrustStats = lazy(() => import('../components/ihkaam/IhkaamTrustStats'))

/* ══════════════════════════════════════════════════════════════════
   من نحن (إعادة بناء 2026-11-20)

   كانت ثلاث فقراتٍ بلسان «الفريق» وصندوق تواصل مكرّر، بلا اسمٍ ولا وجه
   (ISS-44، قرار المالك سابقاً). صارت بنصّ المالك نفسه: مقدمة، ومسار التأسيس
   في أربع محطات، وشريط الأرقام الحيّ، والمعضلة التشغيلية، ومن يقف وراء
   المنصة باسمه وصورته (قرارٌ جديد من المالك يحلّ محلّ ISS-44)، وملف العرض
   «إحكام في ملف واحد» يُقرأ في الصفحة أو يُحمَّل، ثم ختامٌ بدعوة واحدة.
   ══════════════════════════════════════════════════════════════════ */

const INK = '#0B3B33', GOLD = '#B8863A', GOLD_TXT = '#8A6425'
const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' }, transition: { duration: 0.55, ease, delay },
})

const STATIONS = [
  { Icon: GraduationCap, title: 'الخبرة الميدانية', tag: 'الجذور التشغيلية',
    body: 'استندت البنية الوظيفية للنظام إلى معايشة عملية امتدت عامين ونصف في التدريس داخل الحلقات القرآنية، رافقها عمل مبكر على تحليل بيانات الطلاب إحصائياً، وضبط سجلات الحضور والتسميع ومكامن الهدر اليومي فيها.' },
  { Icon: FileSpreadsheet, title: 'النواة الأولى', tag: 'أتمتة المُحصّلات',
    body: 'وُلدت النسخة الأولية كأداة عملية لمعالجة تحدّي إدخال درجات الطلاب وإصدار التقارير في معهد جامع أحمد بن حنبل؛ إذ ألغت النقل اليدوي المُرهق من الدفاتر إلى الجداول الرقمية، وخفضت هامش الخطأ البشري إلى الحد الأدنى.' },
  { Icon: Rocket, title: 'الإطلاق الميداني المتكامل', tag: 'نظام شامل',
    body: 'نضجت الأداة لتصبح نظاماً تشغيلياً شاملاً بالتعاون مع معهد سليمان الأيوبي وإدارة الشيخ يوسف دبوس؛ حيث خضعت النسخة الإنتاجية الأولى لاختبار ميداني حيّ وتطوير متواصل ليتناغم كل تفصيل فيها مع سير العمل الفعلي للمعلمين والإدارة.' },
  { Icon: Landmark, title: 'التوسّع والاحتضان المؤسسي', tag: 'حاضنة الأعمال',
    body: 'مع ثبات التجربة الميدانية وكفاءتها، اتسع اعتماد المنصة ليشمل معاهد قرآنية متعددة، وانضمت «إحكام» إلى حاضنة الأعمال في مركز الريادة والابتكار؛ تعزيزاً لحوكمتها التشغيلية، وتطويراً لبنيتها التقنية بما يواكب التوسع طويل الأمد.' },
]

const WAYS = [
  { title: 'التطوير الخاص من الصفر',
    body: 'مسار يستنزف ميزانيات تأسيس مرتفعة، وشهوراً طويلة من التجربة وتصحيح الأخطاء البرمجية، تليها تكاليف صيانة وتطوير مستمرة لمواكبة تغيّر احتياجات المعهد عاماً بعد عام.' },
  { title: 'المبادرات الفردية التطوعية',
    body: 'حلول تقوم على همّة متطوع أو مبرمج واحد داخل المعهد؛ وما إن ينشغل أو تتغير ظروفه حتى يتجمد النظام، وتُضطر الإدارة إلى العودة مُجدداً إلى السجلات الورقية.' },
]

const HERO_POINTS = [
  { Icon: Database, text: 'قاعدة بيانات مؤسسية موحّدة' },
  { Icon: History,  text: 'ذاكرة المعهد عبر السنوات' },
  { Icon: Gauge,    text: 'دقة المتابعة اليومية' },
]

function Deferred({ children }) { return <Suspense fallback={null}>{children}</Suspense> }

/* ─── الرأس ─── */
function Hero() {
  const shot = desk('dashboard')
  return (
    <section className="relative px-4 sm:px-6 pt-28 sm:pt-32 pb-16 overflow-hidden" dir="rtl">
      <div className="absolute inset-x-0 top-0 h-[520px] pattern-khatam-ink pointer-events-none" aria-hidden
        style={{ opacity: 0.04, maskImage: 'radial-gradient(ellipse 60% 70% at 50% 0%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 50% 0%, #000, transparent 75%)' }} />
      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
        <div>
          <span className="eyebrow">عن منصة إحكام</span>
          <h1 className="font-bold text-[#1A2E28] mt-5 mb-5" style={{ fontSize: 'clamp(2rem, 4.4vw, 3.3rem)', lineHeight: 1.3 }}>
            البنية الرقمية لإدارة <span className="title-mark">المعاهد القرآنية</span>
          </h1>
          <p className="text-[17px] leading-[2.05] text-[#4A5D56] mb-7" style={{ maxWidth: 620 }}>
            «إحكام» نظام إداري وتعليمي سحابي صُمّم خصيصاً لإدارة الحلقات القرآنية، وتوثيق التسميع والاختبارات، وتنظيم التواصل مع أولياء الأمور.
            نضع بين يدي الإدارات قاعدة بيانات مؤسسية موحّدة تُنهي تشتّت السجلات الورقية، وتحفظ ذاكرة المعهد عبر السنوات،
            وترفع دقة المتابعة اليومية بأداء سلس يخلو من التعقيد التقني.
          </p>
          <ul className="flex flex-wrap gap-2.5">
            {HERO_POINTS.map(({ Icon, text }) => (
              <li key={text} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold"
                style={{ background: '#FDFBF7', color: INK, boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                <Icon size={16} style={{ color: GOLD }} /> {text}
              </li>
            ))}
          </ul>
        </div>
        {/* لقطة الهيرو أكبر عنصر مرئي: دخول CSS بالإزاحة فقط، لا شفافية تنتظر framer (ISS-25). */}
        <div className="hero-lift" style={{ '--rise-delay': '0.1s' }}>
          <BrowserFrame shot={shot} eager />
          <p className="mt-4 text-[13.5px] leading-[1.9] text-[#4A5D56]">
            <span className="font-bold" style={{ color: GOLD_TXT }}>{shot.title}: </span>{shot.caption}
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── مسار التأسيس: أربع محطات على خطٍّ واحد ─── */
function Journey() {
  return (
    <section className="relative section-dark overflow-hidden px-4 sm:px-6 py-20" dir="rtl">
      <div className="pattern-layer pattern-khatam" aria-hidden />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14 mx-auto" style={{ maxWidth: 780 }}>
          <span className="eyebrow">مسار التأسيس</span>
          <h2 className="font-bold mt-5 mb-4" style={{ color: '#F8F5EC', fontSize: 'clamp(1.8rem, 3.4vw, 2.7rem)', lineHeight: 1.35 }}>
            من واقع الحلقة إلى <span className="title-mark">البنية المؤسسية</span>
          </h2>
          <p className="text-[16.5px] leading-[2]" style={{ color: 'rgba(248,245,236,.8)' }}>
            لم تُبنَ «إحكام» كنظام إداري عام جرى تطويعه لاحقاً للمعاهد القرآنية، بل نشأت استجابةً مباشرة لفجوة تشغيلية مُعاشة داخل الميدان نفسه، وتدرّجت عبر أربع محطات واقعية:
          </p>
        </div>

        <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {/* الخط الذي يصل المحطات (سطح المكتب) */}
          <div aria-hidden className="hidden lg:block absolute top-[34px] right-[12%] left-[12%] h-px"
            style={{ background: 'linear-gradient(to left, transparent, rgba(224,181,98,.55) 12%, rgba(224,181,98,.55) 88%, transparent)' }} />
          {STATIONS.map(({ Icon, title, tag, body }, n) => (
            <motion.div key={title} {...rise(n * 0.08)} className="relative flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative z-10 w-[68px] h-[68px] rounded-2xl grid place-items-center shrink-0"
                  style={{ background: '#0B3B33', color: '#E0B562', boxShadow: '0 0 0 6px rgba(11,59,51,1), inset 0 0 0 1.5px rgba(224,181,98,.55)' }}>
                  <Icon size={28} strokeWidth={1.6} />
                </span>
                <span aria-hidden className="font-bold tabular-nums select-none" style={{ color: 'rgba(224,181,98,.35)', fontSize: '2.6rem', lineHeight: 1, fontFamily: 'cairo-latin, inherit' }}>
                  {n + 1}
                </span>
              </div>
              <div className="rounded-[22px] p-5 flex-1" style={{ background: 'rgba(248,245,236,.06)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.22)' }}>
                <div className="text-[12.5px] font-bold mb-1" style={{ color: '#E0B562' }}>{tag}</div>
                <h3 className="font-bold text-[19px] mb-3" style={{ color: '#F8F5EC' }}>{title}</h3>
                <p className="text-[14.5px] leading-[2]" style={{ color: 'rgba(248,245,236,.8)' }}>{body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── المعضلة التشغيلية ─── */
function Dilemma() {
  return (
    <section className="px-4 sm:px-6 py-20" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 mx-auto" style={{ maxWidth: 760 }}>
          <span className="eyebrow">المعضلة التشغيلية</span>
          <h2 className="font-bold text-[#1A2E28] mt-5 mb-4" style={{ fontSize: 'clamp(1.8rem, 3.4vw, 2.7rem)', lineHeight: 1.35 }}>
            لماذا تتعثر <span className="title-mark">الرقمنة في المعاهد؟</span>
          </h2>
          <p className="text-[16.5px] leading-[2] text-[#4A5D56]">
            عندما تقرر إدارة معهد قرآني الانتقال من الورق إلى الإدارة الرقمية، تجد نفسها غالباً أمام خيارين كلاهما محفوف بمخاطر التوقف:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {WAYS.map((w, n) => (
            <motion.div key={w.title} {...rise(n * 0.08)} className="rounded-[24px] p-6 sm:p-7"
              style={{ background: '#F6F1E6', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-xl grid place-items-center shrink-0" style={{ background: 'rgba(168,52,52,.10)', color: '#A83434' }}>
                  <X size={18} strokeWidth={2.6} />
                </span>
                <h3 className="font-bold text-[19px] text-[#1A2E28]">{w.title}</h3>
              </div>
              <p className="text-[15.5px] leading-[2] text-[#4A5D56]">{w.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...rise(0.1)} className="relative section-dark rounded-[28px] overflow-hidden p-7 sm:p-10" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <div aria-hidden className="absolute -top-24 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(closest-side, rgba(224,181,98,.22), transparent)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
            <span className="w-12 h-12 rounded-2xl grid place-items-center shrink-0" style={{ background: '#E0B562', color: INK }}>
              <Check size={24} strokeWidth={3} />
            </span>
            <div>
              <h3 className="font-bold text-[22px] mb-3" style={{ color: '#F8F5EC' }}>المسار الثالث المستدام</h3>
              <p className="text-[16px] leading-[2.05]" style={{ color: 'rgba(248,245,236,.85)', maxWidth: 820 }}>
                تقدّم «إحكام» المسار الثالث المستدام عبر نموذج الاشتراك السحابي: بنية رقمية جاهزة ومُختبرة ميدانياً، تتكفل بالاستضافة السحابية،
                وأمن السجلات، والتحديثات الدورية المستمرة؛ ليحصل المعهد على استقرار تقني طويل الأمد بتكلفة تشغيلية واضحة،
                ودون تحمّل أعباء التأسيس أو مخاطر الصيانة.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── القيادة التقنية وضمان الاستمرارية ─── */
function Leadership() {
  return (
    <section className="px-4 sm:px-6 pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 mx-auto" style={{ maxWidth: 760 }}>
          <span className="eyebrow">من يقف وراء إحكام</span>
          <h2 className="font-bold text-[#1A2E28] mt-5" style={{ fontSize: 'clamp(1.8rem, 3.4vw, 2.7rem)', lineHeight: 1.35 }}>
            القيادة التقنية و<span className="title-mark">ضمان الاستمرارية</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-5 lg:gap-6 items-stretch">
          {/* المؤسس */}
          <motion.div {...rise()} className="rounded-[28px] overflow-hidden grid sm:grid-cols-[260px_1fr]"
            style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
            <div className="relative min-h-[300px] sm:min-h-full" style={{ background: '#6F6C70' }}>
              <img src="/about/mohammad-alkaddour.webp" alt="محمد القدور، مؤسس منصة إحكام" width={720} height={720} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top" />
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-[13px] font-bold mb-1.5" style={{ color: GOLD_TXT }}>المؤسس</span>
              <h3 className="font-bold text-[26px] text-[#1A2E28] mb-4">محمد القدور</h3>
              <p className="text-[15.5px] leading-[2.05] text-[#4A5D56]">
                يجمع بين المعايشة المباشرة للتدريس والعمل الإداري داخل المعاهد القرآنية، وبين هندسة الأنظمة الرقمية وتحليل البيانات وتصميم تجربة المستخدم.
                يتولى الإشراف على الرؤية التشغيلية للمنصة، وضمان مواءمة كل تطوير تقني مع الاحتياجات الفعلية لإدارات المعاهد ومشرفي الحلقات.
              </p>
            </div>
          </motion.div>

          {/* الفريق */}
          <motion.div {...rise(0.08)} className="rounded-[28px] p-6 sm:p-8 flex flex-col justify-center"
            style={{ background: '#F6F1E6', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
            <span className="w-12 h-12 rounded-2xl grid place-items-center mb-4" style={{ background: INK, color: '#E0B562' }}>
              <Landmark size={22} />
            </span>
            <h3 className="font-bold text-[22px] text-[#1A2E28] mb-3">فريق منصة إحكام</h3>
            <p className="text-[15.5px] leading-[2.05] text-[#4A5D56]">
              يعمل الفريق على تطوير المنصة بشكل دوري، ومراقبة استقرار البنية التحتية وأمن السجلات، ومواكبة المعاهد الشريكة بالتأهيل والتدريب والدعم الفني المستمر.
              ويكفل هذا الهيكل المؤسسي — تحت مظلة حاضنة الأعمال في مركز الريادة والابتكار — استمرارية الخدمة وتطورها على المدى البعيد،
              بما يضع حداً لمخاطر الانقطاع المرتبطة بالمشاريع الفردية.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── ملف العرض ─── */
function Showcase() {
  return (
    <section className="px-4 sm:px-6 pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 mx-auto" style={{ maxWidth: 720 }}>
          <span className="eyebrow">اقرأ عن إحكام</span>
          <h2 className="font-bold text-[#1A2E28] mt-5 mb-3" style={{ fontSize: 'clamp(1.8rem, 3.4vw, 2.7rem)', lineHeight: 1.35 }}>
            إحكام <span className="title-mark">في ملف واحد</span>
          </h2>
          <p className="text-[16.5px] leading-[2] text-[#4A5D56]">اقرأه هنا شريحةً شريحة، أو حمّله وأرسله لمن يشاركك قرار المعهد.</p>
        </div>
        <ShowcaseViewer />
      </div>
    </section>
  )
}

/* ─── الختام ─── */
function Closing() {
  const wa = waLink(IHKAAM_WHATSAPP, 'السلام عليكم، أريد عرضاً تعريفياً لمعهدنا على منصة إحكام.')
  return (
    <section className="px-4 sm:px-6 pb-24" dir="rtl">
      <motion.div {...rise()} className="relative section-dark max-w-6xl mx-auto rounded-[32px] overflow-hidden px-6 sm:px-12 py-14 text-center" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="pattern-layer pattern-khatam" aria-hidden />
        <div aria-hidden className="absolute -top-28 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgba(224,181,98,.22), transparent)' }} />
        <div className="relative mx-auto" style={{ maxWidth: 720 }}>
          <h2 className="font-bold mb-4" style={{ color: '#F8F5EC', fontSize: 'clamp(1.7rem, 3.2vw, 2.5rem)', lineHeight: 1.4 }}>
            هل تستعدون لبناء <span className="title-mark">ذاكرة رقمية مستدامة</span> لمعهدكم؟
          </h2>
          <p className="text-[16.5px] leading-[2] mb-8" style={{ color: 'rgba(248,245,236,.82)' }}>
            نرافق إدارتكم خطوة بخطوة في الانتقال السلس من السجلات الورقية إلى منظومة «إحكام»، مع تدريب كامل للكوادر ودعم فني مستمر.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="btn-cta inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-bold text-[16px]">
              <MessageCircle size={19} /> اطلب عرضاً تعريفياً للمعهد
            </a>
            <Link to="/request" className="btn-outline inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 font-bold text-[15.5px] border">
              اختر باقة معهدك <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <Hero />
      <Journey />
      <Deferred><IhkaamTrustStats /></Deferred>
      <Dilemma />
      <Leadership />
      <Showcase />
      <TestimonialsSection titleLead="ماذا يقول" titleAccent="مديرو المعاهد عن إحكام" />
      <ClientReviewForm />
      <Closing />
      <AffiliateInvite tight />
    </>
  )
}
