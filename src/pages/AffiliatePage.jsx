import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2, ChevronDown, ShieldCheck, Ban, Clock, Link2, BadgeCheck, ArrowLeft, Handshake,
} from 'lucide-react'
import ApplyForm from '../components/affiliate/ApplyForm'
import TrackPanel from '../components/affiliate/TrackPanel'
import { AFFILIATE_PCT, AFFILIATE_WINDOW_D, AFFILIATE_EXAMPLES } from '../config/affiliate'
import { TRIAL_DAYS, PLANS } from '../config/plans'
import { DESKTOP_SHOTS } from '../data/appShots'

/* صفحة برنامج الشراكة. الصورة تشرح قبل النص: كل قسم يحمل مشهداً أو رسماً.
   الأرقام كلها من config/affiliate.js و plans.js، لا نسخة مكتوبة هنا. */

const INK = '#0B3B33', GOLD = '#B8863A'
const ease = [0.22, 1, 0.36, 1]
const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' }, transition: { duration: 0.6, ease, delay: i * 0.08 },
})

const FREE_MAX = PLANS.find(p => p.kind === 'free')?.max
const DASH = DESKTOP_SHOTS.find(s => s.id === 'dashboard')

const STEPS = [
  { img: 'share',     n: 1, t: 'تشارك رابطك',        d: 'تأخذ رمزاً خاصاً بك ورابطاً جاهزاً، وترسله لمدير معهد تعرفه على واتساب أو أي قناة.' },
  { img: 'subscribe', n: 2, t: 'معهدٌ يشترك سنوياً', d: `يفتح المعهد رابطك، ويجرّب ${TRIAL_DAYS} يوماً مجاناً، ثم يدفع اشتراكه السنوي.` },
  { img: 'earn',      n: 3, t: 'تصلك عمولتك',        d: `${AFFILIATE_PCT}% من أول دفعة سنوية، بعد أن تصلنا الدفعة فعلاً. وتتابعها من صفحتك.` },
]

const AUDIENCES = [
  { img: '/scenes/role-director.webp', t: 'مدير معهد يستخدم إحكام', d: 'تعرف زميلاً ما زال على الدفاتر. أنت أصدق من يحدّثه عن النظام لأنك تعمل به.' },
  { img: '/scenes/role-teacher.webp',  t: 'معلم أو مشرف تربوي',   d: 'تزور المعاهد وتسمع شكواها من الورق والتقارير. عندك الآن ما تقترحه عليها.' },
  { img: '/scenes/feat-messages.webp', t: 'صاحب محتوى أو مجتمع',  d: 'جمهورك من معلمي القرآن ومديري الحلقات. رابطٌ واحد يخدمهم ويعود عليك.' },
]

const RULES = [
  { icon: Clock,       t: 'بعد الدفع لا قبله',  d: 'لا تُحتسب عمولة عند التسجيل أو أثناء التجربة، بل بعد أن تصلنا الدفعة الفعلية.' },
  { icon: Ban,         t: 'سنوي لمرة واحدة',    d: 'العمولة على أول اشتراك سنوي فقط. لا عمولة على الشهري ولا على الباقة المجانية ولا على التجديد.' },
  { icon: Link2,       t: `رابطك يبقى ${AFFILIATE_WINDOW_D} يوماً`, d: 'من نقرة المعهد على رابطك، إن طلب النظام خلال هذه المدة سُجّل لك.' },
  { icon: ShieldCheck, t: 'لا إحالة لنفسك',     d: 'يُرفض أي طلب من معهدك أو من رقمك أنت. نراجع كل إحالة قبل احتسابها.' },
]

const FAQ = [
  { q: 'متى أستلم عمولتي وكيف؟', a: 'بعد أن يدفع المعهد ونتحقق من وصول الدفعة. نتفق معك على طريقة التحويل عند قبول طلبك، ويُسجَّل كل تحويل في حسابك لدينا وتراه في صفحتك.' },
  { q: 'هل أربح إن اشترك المعهد شهرياً؟', a: 'لا. العمولة على أول اشتراك سنوي فقط، لأن الاشتراك الشهري مبلغه صغير لا يستحق منك العناء. وإن بدأ المعهد شهرياً ثم انتقل إلى السنوي فراسلنا لننظر في حالته.' },
  { q: 'هل تتكرر العمولة كل سنة؟', a: 'لا. هي مرة واحدة على أول اشتراك سنوي لكل معهد تحيله. هكذا يبقى الاتفاق واضحاً لك ولنا.' },
  { q: 'ضاع رمزي، ماذا أفعل؟', a: 'راسلنا من صفحة التواصل بالاسم والبريد الذي قدّمت به طلبك، ونعيده إليك بعد التحقق. لا نعرضه بالبريد وحده كي لا يطّلع عليه غيرك.' },
  { q: 'هل أستطيع أن أحيل معهدي أنا؟', a: 'لا. الإحالة لمعهدٍ تملكه أو تديره أو بنفس رقمك لا تُحتسب. الشراكة لمن يعرّف بإحكام لغيره.' },
  { q: 'كيف أعرف أن معهداً سجّل برمزي؟', a: 'اكتب رمزك في قسم «تابع إحالاتك» أسفل الصفحة، فترى كل معهد سجّل وحالته وعمولتك عليه.' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--line-warm)' }} className="last:border-0">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-start cursor-pointer">
        <span className="font-bold text-[16px] text-[#1A2E28]">{q}</span>
        <ChevronDown size={18} className="shrink-0 transition-transform" style={{ color: GOLD, transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <p className="pb-5 text-[15px] leading-[2] text-[#4A5D56]">{a}</p>}
    </div>
  )
}

/* ── محاكي العمولة: يرسم المعاهد ويحسب المجموع ── */
function Simulator() {
  const [planId, setPlanId] = useState(AFFILIATE_EXAMPLES.find(e => e.popular)?.id ?? AFFILIATE_EXAMPLES[0].id)
  const [count,  setCount]  = useState(4)
  const plan  = AFFILIATE_EXAMPLES.find(e => e.id === planId)
  const total = plan.earn * count

  return (
    <div className="rounded-[28px] p-6 sm:p-9 section-dark">
      <div className="pattern-layer pattern-khatam" aria-hidden />
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center">
        <div>
          <span className="eyebrow">جرّب الحساب</span>
          <h3 className="font-black text-[24px] sm:text-[28px] mt-4 mb-3" style={{ color: '#F8F5EC' }}>
            كم تربح إن رشّحت {count} {count <= 10 ? 'معاهد' : 'معهداً'}؟
          </h3>
          <p className="text-[15px] leading-[1.9]" style={{ color: 'rgba(248,245,236,.78)' }}>
            اختر حجم المعهد وعدد المعاهد. الحساب {AFFILIATE_PCT}% من الاشتراك السنوي.
          </p>

          <div className="flex flex-wrap gap-2 mt-6" role="radiogroup" aria-label="باقة المعهد">
            {AFFILIATE_EXAMPLES.map(e => (
              <button key={e.id} type="button" role="radio" aria-checked={e.id === planId} onClick={() => setPlanId(e.id)}
                className="rounded-full px-4 py-2 text-[13.5px] font-bold cursor-pointer transition-colors"
                style={e.id === planId
                  ? { background: '#E0B562', color: INK }
                  : { background: 'rgba(248,245,236,.08)', color: '#F8F5EC', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.3)' }}>
                {e.name}
              </button>
            ))}
          </div>

          <label className="block mt-6 text-[13px] font-bold" style={{ color: '#F8F5EC' }} htmlFor="sim-count">عدد المعاهد: {count}</label>
          <input id="sim-count" type="range" min={1} max={12} value={count} onChange={e => setCount(+e.target.value)}
            className="w-full mt-2 accent-[#E0B562]" style={{ direction: 'rtl' }} />
        </div>

        <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,.05)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.22)' }}>
          <div className="flex flex-wrap justify-center gap-2.5 min-h-[44px] mb-5" aria-hidden>
            {Array.from({ length: count }, (_, i) => (
              <motion.span key={i} initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .3, ease }}
                className="w-10 h-10 rounded-xl grid place-items-center"
                style={{ background: 'rgba(224,181,98,.14)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.4)' }}>
                <Building2 size={19} color="#E0B562" />
              </motion.span>
            ))}
          </div>
          <div className="text-[13px] font-bold" style={{ color: 'rgba(248,245,236,.7)' }}>
            {count} × {plan.earn}$ عمولة على «{plan.name}»
          </div>
          <div className="font-black leading-none mt-2" style={{ color: '#E0B562', fontSize: 'clamp(2.8rem, 7vw, 4rem)' }} aria-live="polite">{total}$</div>
          <div className="text-[12.5px] mt-2" style={{ color: 'rgba(248,245,236,.6)' }}>مرة واحدة عن هذه المعاهد، بعد استلام دفعاتها</div>
        </div>
      </div>
    </div>
  )
}

export default function AffiliatePage() {
  const [freshCode, setFreshCode] = useState('')

  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>

      {/* ─── الهيرو ─── */}
      <section className="relative pt-28 sm:pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" aria-hidden
          style={{ opacity: 0.035, maskImage: 'radial-gradient(ellipse 60% 55% at 50% 10%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 10%, #000, transparent 75%)' }} />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
          <div className="page-enter">
            <span className="eyebrow"><Handshake size={14} /> برنامج الشراكة</span>
            <h1 className="font-bold text-[#1A2E28] mt-5 mb-5" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.9rem)', lineHeight: 1.3 }}>
              رشّح إحكام لمعهدٍ تعرفه، <span className="title-mark">واربح {AFFILIATE_PCT}%</span> من أول اشتراك سنوي
            </h1>
            <p className="text-[17px] leading-[1.95] text-[#4A5D56] max-w-xl">
              أنت تعرف مديراً ما زال يكتب الحضور على الدفاتر. عرّفه بنظامٍ صُنع لحلقات التحفيظ، وإن اشترك سنوياً فلك عمولتك. بلا رسوم ولا التزام، وتتابع كل شيء من صفحة واحدة.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href="#apply" className="btn-cta rounded-xl">قدّم طلب الشراكة <ArrowLeft size={16} className="ms-2" /></a>
              <a href="#track" className="btn-outline rounded-xl">تابع إحالاتك</a>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-7 text-[13.5px] font-bold text-[#4A5D56]">
              {['بلا رسوم اشتراك', 'عمولة بعد الدفع الفعلي', 'متابعة مباشرة برمزك'].map(t => (
                <li key={t} className="inline-flex items-center gap-1.5"><BadgeCheck size={15} color="#1F6F52" /> {t}</li>
              ))}
            </ul>
          </div>

          <motion.div {...reveal(1)} className="relative">
            <div className="rounded-[28px] overflow-hidden" style={{ boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }}>
              <img src="/affiliate/hero.webp" srcSet="/affiliate/hero-sm.webp 720w, /affiliate/hero.webp 1280w" sizes="(min-width:1024px) 560px, 92vw"
                alt="يدٌ تسلّم مفتاحاً نحاسياً بشرّابة خضراء ليدٍ ممدودة، تعبيراً عن تسليم النظام لمعهدٍ جديد"
                width="1280" height="720" fetchPriority="high" className="w-full h-auto block" />
            </div>
            <div className="absolute -bottom-5 right-5 sm:right-8 rounded-2xl px-5 py-3.5 flex items-center gap-3"
              style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
              <span className="font-black text-[30px] leading-none" style={{ color: '#8A6425' }}>{AFFILIATE_PCT}%</span>
              <span className="text-[12.5px] font-bold leading-snug text-[#1A2E28]">من أول اشتراك<br />سنوي لكل معهد</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── كيف يعمل ─── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div {...reveal()} className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow">كيف يعمل</span>
            <h2 className="font-bold text-[#1A2E28] mt-5" style={{ fontSize: 'clamp(1.7rem, 3.6vw, 2.5rem)', lineHeight: 1.3 }}>ثلاث خطوات، <span className="title-mark">وأنت لا تدير شيئاً</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {STEPS.map((s, i) => (
              <motion.article key={s.n} {...reveal(i)} className="relative rounded-[24px] overflow-hidden"
                style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
                <div className="relative">
                  <img src={`/affiliate/${s.img}-sm.webp`} srcSet={`/affiliate/${s.img}-sm.webp 720w, /affiliate/${s.img}.webp 1280w`} sizes="(min-width:768px) 360px, 92vw"
                    alt="" width="1280" height="720" loading="lazy" className="w-full aspect-[4/3] object-cover" />
                  <span className="absolute -bottom-5 right-6 w-11 h-11 rounded-full grid place-items-center font-black text-[17px]"
                    style={{ background: INK, color: '#E0B562', boxShadow: '0 0 0 5px #FDFBF7' }}>{s.n}</span>
                </div>
                <div className="p-6 pt-9">
                  <h3 className="font-black text-[19px] text-[#1A2E28] mb-2">{s.t}</h3>
                  <p className="text-[15px] leading-[1.95] text-[#4A5D56]">{s.d}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── كم تربح ─── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div {...reveal()} className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">عمولتك</span>
            <h2 className="font-bold text-[#1A2E28] mt-5 mb-3" style={{ fontSize: 'clamp(1.7rem, 3.6vw, 2.5rem)', lineHeight: 1.3 }}>كم تربح من <span className="title-mark">كل معهد؟</span></h2>
            <p className="text-[16px] leading-[1.9] text-[#4A5D56]">الجزء الذهبي في كل شريط هو نصيبك من اشتراك المعهد السنوي.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {AFFILIATE_EXAMPLES.map((e, i) => (
              <motion.div key={e.id} {...reveal(i)} className="rounded-[22px] p-6"
                style={{ background: '#FDFBF7', boxShadow: e.popular ? `var(--shadow-md), inset 0 0 0 1.5px ${GOLD}` : 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="font-black text-[18px] text-[#1A2E28]">{e.name}</div>
                    <div className="text-[12.5px] text-[#5E6E67]">حتى {e.max} طالب</div>
                  </div>
                  {e.popular && <span className="rounded-full px-3 py-1 text-[11.5px] font-bold" style={{ background: 'rgba(184,134,58,.12)', color: '#8A6425' }}>الأكثر اشتراكاً</span>}
                </div>
                <div className="flex h-11 rounded-xl overflow-hidden" role="img" aria-label={`من ${e.annual} دولاراً سنوياً، لك ${e.earn} دولاراً`}>
                  <div className="grid place-items-center text-[13px] font-bold" style={{ width: `${100 - AFFILIATE_PCT}%`, background: INK, color: '#F8F5EC' }}>{e.annual}$</div>
                  <div className="grid place-items-center text-[13px] font-black" style={{ width: `${AFFILIATE_PCT}%`, background: '#E0B562', color: INK }}>{AFFILIATE_PCT}%</div>
                </div>
                <div className="flex items-end justify-between mt-5">
                  <span className="text-[12.5px] font-bold text-[#5E6E67]">يدفع المعهد {e.annual}$ سنوياً</span>
                  <span dir="ltr" className="font-black leading-none" style={{ fontSize: '2rem', color: '#8A6425' }}>+{e.earn}$</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...reveal()}><Simulator /></motion.div>
        </div>
      </section>

      {/* ─── ماذا يقول للمعهد + لقطة التطبيق ─── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <motion.figure {...reveal()} className="m-0">
            <div className="rounded-[22px] overflow-hidden" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }}>
              <div className="flex items-center gap-1.5 px-4 py-3" style={{ background: '#EFE9DC' }} aria-hidden>
                {[0, 1, 2].map(i => <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? '#E0B562' : 'rgba(11,59,51,.18)' }} />)}
              </div>
              <img src="/app-shots/dashboard-sm.webp" srcSet="/app-shots/dashboard-sm.webp 720w, /app-shots/dashboard.webp 1440w" sizes="(min-width:1024px) 600px, 92vw"
                alt={DASH.title} width="1440" height="900" loading="lazy" className="w-full h-auto block" />
            </div>
            <figcaption className="text-[13.5px] leading-[1.9] text-[#5E6E67] mt-3">{DASH.caption}</figcaption>
          </motion.figure>

          <motion.div {...reveal(1)}>
            <span className="eyebrow">حجتك سهلة</span>
            <h2 className="font-bold text-[#1A2E28] mt-5 mb-5" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)', lineHeight: 1.3 }}>ما تقوله لصديقك المدير</h2>
            <ul className="space-y-4">
              {[
                `جرّب ${TRIAL_DAYS} يوماً مجاناً قبل أن تدفع شيئاً.`,
                `إن كانت حلقتك واحدة، فباقة «حلقة» مجانية حتى ${FREE_MAX} طالباً.`,
                'الحضور والتسميع والأقساط والتقارير في مكان واحد، بدل الدفاتر وملفات الإكسل.',
                'نرافقه في أول أسبوع خطوةً بخطوة حتى يعمل النظام في معهده.',
              ].map(t => (
                <li key={t} className="flex gap-3 text-[16px] leading-[1.9] text-[#1A2E28]">
                  <span className="mt-1.5 w-5 h-5 rounded-full grid place-items-center shrink-0" style={{ background: INK }}><BadgeCheck size={12} color="#E0B562" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/ihkaam" className="inline-flex items-center gap-2 mt-7 font-bold text-[15px]" style={{ color: '#1F6F52' }}>
              تعرّف على النظام قبل أن تعرّف به <ArrowLeft size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── لمن البرنامج ─── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div {...reveal()} className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">لمن هذا البرنامج</span>
            <h2 className="font-bold text-[#1A2E28] mt-5" style={{ fontSize: 'clamp(1.7rem, 3.6vw, 2.5rem)', lineHeight: 1.3 }}>إن كنت قريباً من <span className="title-mark">حلقات القرآن</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {AUDIENCES.map((a, i) => (
              <motion.article key={a.t} {...reveal(i)} className="rounded-[22px] overflow-hidden"
                style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                <img src={a.img} alt="" width="1280" height="720" loading="lazy" className="w-full aspect-[16/10] object-cover" />
                <div className="p-6">
                  <h3 className="font-black text-[18px] text-[#1A2E28] mb-2">{a.t}</h3>
                  <p className="text-[15px] leading-[1.95] text-[#4A5D56]">{a.d}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── القواعد ─── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto section-dark rounded-[28px] p-8 sm:p-12">
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <motion.div {...reveal()} className="max-w-2xl mb-10">
            <span className="eyebrow">قواعد واضحة</span>
            <h2 className="font-bold mt-5" style={{ color: '#F8F5EC', fontSize: 'clamp(1.7rem, 3.6vw, 2.4rem)', lineHeight: 1.3 }}>اتفاقٌ بسيط، <span className="title-mark">لا بنود مخفية</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {RULES.map((r, i) => (
              <motion.div key={r.t} {...reveal(i)} className="card-on-dark p-6 flex gap-4">
                <span className="shrink-0 w-11 h-11 rounded-xl grid place-items-center" style={{ background: 'rgba(224,181,98,.12)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.32)' }}>
                  <r.icon size={20} color="#E0B562" />
                </span>
                <div>
                  <h3 className="font-bold text-[16px] mb-1" style={{ color: '#F8F5EC' }}>{r.t}</h3>
                  <p className="text-[14.5px] leading-[1.9]" style={{ color: 'rgba(248,245,236,.78)' }}>{r.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── التقديم ─── */}
      <section id="apply" className="px-4 sm:px-6 py-16 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal()} className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">ابدأ الآن</span>
            <h2 className="font-bold text-[#1A2E28] mt-5 mb-3" style={{ fontSize: 'clamp(1.7rem, 3.6vw, 2.5rem)', lineHeight: 1.3 }}>احصل على <span className="title-mark">رمزك الخاص</span></h2>
            <p className="text-[16px] leading-[1.9] text-[#4A5D56]">دقيقة واحدة، وتأخذ رمزك ورابطك على الشاشة مباشرة.</p>
          </motion.div>
          <motion.div {...reveal(1)}><ApplyForm onCode={setFreshCode} /></motion.div>
        </div>
      </section>

      {/* ─── المتابعة ─── */}
      <section id="track" className="px-4 sm:px-6 py-16 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...reveal()} className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">لوحة الشريك</span>
            <h2 className="font-bold text-[#1A2E28] mt-5 mb-3" style={{ fontSize: 'clamp(1.7rem, 3.6vw, 2.5rem)', lineHeight: 1.3 }}>تابع <span className="title-mark">إحالاتك وعمولتك</span></h2>
            <p className="text-[16px] leading-[1.9] text-[#4A5D56]">اكتب رمزك لترى المعاهد التي سجّلت عبره وما استحققته عليها.</p>
          </motion.div>
          <TrackPanel prefill={freshCode} />
        </div>
      </section>

      {/* ─── الأسئلة ─── */}
      <section className="px-4 sm:px-6 py-16 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.h2 {...reveal()} className="font-bold text-[#1A2E28] text-center mb-8" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)' }}>أسئلة عن البرنامج</motion.h2>
          <motion.div {...reveal(1)} className="rounded-[22px] px-6 sm:px-8" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
            {FAQ.map(f => <FaqItem key={f.q} {...f} />)}
          </motion.div>
          <p className="text-center text-[14px] text-[#5E6E67] mt-6">
            سؤالٌ آخر؟ <Link to="/contact" className="font-bold" style={{ color: '#1F6F52' }}>راسلنا من صفحة التواصل</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
