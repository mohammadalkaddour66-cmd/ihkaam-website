import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowLeft, MessageCircle, Sparkles, Building2, Plus } from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { readPricingDraft, writePricingDraft } from '../../config/pricingDraft'
import { INCLUDED_IN_BASE_NOTE, withSitePrices, ADDON_PRICE_USD, ADDONS_BUNDLE_USD, ADDON_INFO } from '../../config/addons'
import { PLANS, CUSTOM_FROM_USD, TRIAL_DAYS, planPrice, addonPrice, usd, isPaid } from '../../config/plans'
import { IHKAAM_WHATSAPP, waLink, FREE_PLAN_MESSAGE } from '../../config/whatsappOrder'

/* ══════════════════════════════════════════════════════════════════
   صفحة الباقات /request (2026-11-20)

   كانت حاسبةً بمنزلق طلاب ومدد. صارت أربع باقاتٍ ثابتة (src/config/plans.js)
   ومفتاح شهري/سنوي، وسطرُ «عرض خاص» لما فوق 500 طالب. عدد الطلاب أكبر ما في
   كل بطاقة وتحته مقياسٌ مرسوم، و«معهد متوسط» الأكثر اختياراً بطاقةٌ داكنة. اختيار الباقة يفتح صفحة الطلب،
   وهناك تُضاف الإضافات المدفوعة.
   ══════════════════════════════════════════════════════════════════ */

const INK = '#0B3B33', GOLD_TXT = '#8A6425'
const ease = [0.22, 1, 0.36, 1]

/* امتلاء مقياس السعة لكل باقة: تدرّجٌ يقرأه العين لا نسبةٌ حسابية،
   وإلا لاختفت «حلقة» (30 من 500) في أول المقياس */
const FILL = { halaqa: 0.2, small: 0.4, medium: 0.7, large: 1 }

const INCLUDED = [
  'تسجيل الطلاب والكادر', 'الحلقات والأفواج', 'التسميع اليومي', 'الحضور والغياب',
  'الاختبارات والسبر', 'تقييم السلوك', 'التقارير', 'التحليل الذكي', 'الأرشفة السحابية', 'بوابة ولي الأمر',
]

/* ─── مفتاح الدورة ─── */
function CycleToggle({ cycle, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full p-1" role="tablist" aria-label="دورة الدفع"
      style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
      {[['monthly', 'شهري'], ['annual', 'سنوي']].map(([id, label]) => {
        const on = cycle === id
        return (
          <button key={id} type="button" role="tab" aria-selected={on} onClick={() => onChange(id)}
            className="relative rounded-full px-6 py-2.5 text-[15px] font-bold">
            {on && <motion.span layoutId="cycle-pill" className="absolute inset-0 rounded-full" style={{ background: INK }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="relative flex items-center gap-2" style={{ color: on ? '#F8F5EC' : '#2F4540' }}>
              {label}
              {id === 'annual' && (
                <span className="text-[11px] font-bold rounded-full px-2 py-0.5"
                  style={{ background: on ? '#E0B562' : 'rgba(184,134,58,.14)', color: on ? INK : GOLD_TXT }}>
                  شهران مجاناً
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* «30 طالباً» و«100 طالب» و«250 طالباً» و«500 طالب» */
function studentsWord(n) {
  const r = n % 100
  if (r >= 3 && r <= 10) return 'طلاب'
  if (r >= 11) return 'طالباً'
  return 'طالب'
}

/* ─── مقياس السعة: عشر خانات تمتلئ بحجم الباقة ─── */
function Capacity({ plan, dark }) {
  const filled = Math.round(FILL[plan.id] * 10)
  return (
    <div aria-hidden className="flex items-end gap-[3px] h-6">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="flex-1 rounded-[3px]"
          style={{
            height: `${30 + i * 7.5}%`,
            background: i < filled
              ? (dark ? 'linear-gradient(to top,#B8863A,#E0B562)' : 'linear-gradient(to top,#1F6F52,#3E8E6F)')
              : (dark ? 'rgba(248,245,236,.10)' : 'rgba(11,59,51,.07)'),
          }} />
      ))}
    </div>
  )
}

/* ─── عدد الطلاب: أكبر ما في البطاقة ─── */
function Seats({ plan, dark }) {
  return (
    <div>
      <div className="text-[13px] font-semibold mb-1" style={{ color: dark ? 'rgba(248,245,236,.66)' : '#5E6E67' }}>
        {plan.note ? `${plan.note} · حتى` : 'حتى'}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-bold leading-none tabular-nums" style={{ color: dark ? '#E0B562' : '#1F6F52', fontSize: 'clamp(3rem, 5vw, 3.6rem)', fontFamily: 'cairo-latin, inherit', letterSpacing: '-0.02em' }}>
          {plan.max}
        </span>
        <span className="text-[17px] font-bold" style={{ color: dark ? '#F8F5EC' : '#1A2E28' }}>{studentsWord(plan.max)}</span>
      </div>
    </div>
  )
}

/* ─── السعر ─── */
function Price({ plan, cycle, dark }) {
  const main = dark ? '#F8F5EC' : '#1A2E28'
  const sub  = dark ? 'rgba(248,245,236,.66)' : '#5E6E67'
  if (plan.kind === 'free') {
    return (
      <div>
        <div className="font-bold leading-none" style={{ color: main, fontSize: '1.9rem' }}>مجاناً</div>
        <div className="text-[13px] mt-2 h-5" style={{ color: sub }}>بلا مدّة ولا دفع</div>
      </div>
    )
  }
  const price = planPrice(plan, cycle)
  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={cycle} className="flex items-baseline gap-2"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease }}>
          <span dir="ltr" className="font-bold leading-none tabular-nums" style={{ color: main, fontSize: '1.9rem', fontFamily: 'cairo-latin, inherit' }}>
            {usd(price)}
          </span>
          <span className="text-[14px] font-semibold" style={{ color: sub }}>{cycle === 'annual' ? 'سنوياً' : 'شهرياً'}</span>
        </motion.div>
      </AnimatePresence>
      <div className="text-[13px] mt-2 h-5" style={{ color: sub }}>
        {cycle === 'annual'
          ? <>بدل <span dir="ltr" className="line-through tabular-nums">{usd(plan.monthly * 12)}</span> · شهران مجاناً</>
          : <>أو <span dir="ltr" className="tabular-nums">{usd(plan.annual)}</span> سنوياً</>}
      </div>
    </div>
  )
}

/* ─── بطاقة باقة ─── */
function PlanCard({ plan, cycle, index, onPick }) {
  const dark = !!plan.popular
  const cta = plan.kind === 'free' ? 'ابدأ مجاناً على واتساب' : `جرّبها ${TRIAL_DAYS} يوماً مجاناً`
  const line = dark ? 'rgba(248,245,236,.12)' : 'rgba(11,59,51,.08)'
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease, delay: index * 0.07 }}
      className={`relative flex flex-col rounded-[26px] p-6 overflow-hidden ${dark ? 'section-dark lg:-my-3' : ''}`}
      style={dark
        ? { boxShadow: '0 30px 60px -28px rgba(8,44,38,.7), inset 0 0 0 1px rgba(224,181,98,.35)' }
        : { background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
      {dark && <div className="pattern-layer pattern-khatam" aria-hidden />}
      {dark && (
        <div aria-hidden className="absolute -top-20 -left-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgba(224,181,98,.22), transparent)' }} />
      )}

      <div className="relative flex items-center justify-between gap-2 mb-5 min-h-[28px]">
        <h2 className="font-bold text-[20px]" style={{ color: dark ? '#F8F5EC' : '#1A2E28' }}>{plan.name}</h2>
        {dark && (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-bold rounded-full px-2.5 py-1 whitespace-nowrap" style={{ background: '#E0B562', color: INK }}>
            <Sparkles size={12} /> الأكثر اختياراً
          </span>
        )}
      </div>

      <div className="relative mb-4"><Seats plan={plan} dark={dark} /></div>
      <div className="relative mb-5"><Capacity plan={plan} dark={dark} /></div>

      <div className="relative pt-5 mb-4" style={{ borderTop: `1px solid ${line}` }}>
        <Price plan={plan} cycle={cycle} dark={dark} />
      </div>

      <p className="relative text-[14px] leading-[1.85] mb-6" style={{ color: dark ? 'rgba(248,245,236,.8)' : '#4A5D56' }}>{plan.pitch}</p>

      <button type="button" onClick={() => onPick(plan)}
        className={`relative mt-auto w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-[15px] ${dark ? 'btn-cta' : ''}`}
        style={dark ? undefined : { background: 'rgba(31,111,82,.08)', color: INK, boxShadow: 'inset 0 0 0 1px rgba(31,111,82,.22)' }}>
        {cta} <ArrowLeft size={16} />
      </button>
    </motion.div>
  )
}

/* ─── ما فوق 500 طالب: سطرٌ واحد تحت البطاقات لا بطاقة ─── */
function CustomOffer() {
  return (
    <div className="mt-6 rounded-[22px] px-5 sm:px-7 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
      style={{ background: '#F6F1E6', boxShadow: 'inset 0 0 0 1px rgba(184,134,58,.3)' }}>
      <div className="flex items-center gap-4">
        <span className="shrink-0 w-12 h-12 rounded-2xl grid place-items-center" style={{ background: INK, color: '#E0B562' }}>
          <Building2 size={22} />
        </span>
        <p className="text-[16px] leading-[1.8] text-[#1A2E28]">
          <span className="font-bold">أكثر من 500 طالب، أو جمعية، أو مكتب حلقات؟</span>{' '}
          عرض خاص يبدأ من <span dir="ltr" className="font-bold tabular-nums" style={{ color: '#1F6F52' }}>{usd(CUSTOM_FROM_USD)}</span> شهرياً.
        </p>
      </div>
      <Link to="/contact" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-[15px]"
        style={{ color: INK, boxShadow: 'inset 0 0 0 1.5px rgba(184,134,58,.5)', background: '#FDFBF7' }}>
        <MessageCircle size={16} /> اطلب عرضاً
      </Link>
    </div>
  )
}

/* ─── الإضافات: تُعرض هنا وتُختار في صفحة الطلب ─── */
function Addons({ features, cycle }) {
  if (!features.length) return null
  return (
    <div className="rounded-[26px] p-6 sm:p-8" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="font-bold text-[20px] text-[#1A2E28]">إضافات اختيارية</h2>
          <p className="text-[14px] text-[#4A5D56] mt-1">تضيفها إلى أي باقة مدفوعة في خطوة الطلب، وتلغيها متى شئت.</p>
        </div>
        {/* الحزمة: الثلاث معاً بسعرٍ أقل من مجموعها */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold"
          style={{ background: INK, color: '#F8F5EC' }}>
          الثلاث معاً
          <span dir="ltr" className="tabular-nums" style={{ color: '#E0B562' }}>{usd(addonPrice(ADDONS_BUNDLE_USD, cycle))}</span>
          <span className="text-[12.5px] font-semibold" style={{ color: 'rgba(248,245,236,.7)' }}>
            {cycle === 'annual' ? 'سنوياً' : 'شهرياً'} بدل <span dir="ltr" className="line-through tabular-nums">{usd(addonPrice(Object.values(ADDON_PRICE_USD).reduce((a, b) => a + b, 0), cycle))}</span>
          </span>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {features.map(f => (
          <div key={f.id} className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: '#F6F1E6', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={{ background: INK, color: '#E0B562' }}><Plus size={14} /></span>
              <span className="font-bold text-[15px] text-[#1A2E28]">{f.name}</span>
            </div>
            {/* سطرٌ واحد هنا، والتفاصيل في صفحة الإضافة. المسوّدة محفوظة،
                فالعودة من صفحة الإضافة تجد الدورة كما تركها الزائر. */}
            <p className="text-[13.5px] leading-[1.8] text-[#4A5D56]">{ADDON_INFO[f.id]?.line || f.description}</p>
            <div className="mt-auto pt-2 flex items-center justify-between gap-2">
              <span className="text-[14px] font-bold" style={{ color: '#1F6F52' }}>
                <span dir="ltr" className="tabular-nums">+{usd(addonPrice(f.price_usd_monthly, cycle))}</span>
                <span className="text-[12.5px] font-semibold text-[#5E6E67]"> {cycle === 'annual' ? 'سنوياً' : 'شهرياً'}</span>
              </span>
              {ADDON_INFO[f.id] && (
                <Link to={`/ihkaam/addons/${ADDON_INFO[f.id].slug}`} className="group inline-flex items-center gap-1 text-[13px] font-bold" style={{ color: GOLD_TXT }}>
                  اعرف المزيد <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function IhkaamPricing() {
  const [draft] = useState(readPricingDraft)
  const [cycle, setCycle] = useState(() => draft?.cycle ?? 'monthly')
  const [features, setFeatures] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('store_features')
      .select('id, name, description, price_usd_monthly')
      .eq('is_visible', true)
      .eq('is_deleted', false)
      /* ISS-46: الإضافات المدفوعة ثلاث فقط، مهما أعادت القاعدة. */
      .then(({ data }) => { if (data) setFeatures(withSitePrices(data)) })
  }, [])

  function pick(plan) {
    /* «حلقة» المجانية بلا استمارة: معلم الحلقة لا يملأ نموذجاً لخدمةٍ مجانية */
    if (!isPaid(plan)) { window.open(waLink(IHKAAM_WHATSAPP, FREE_PLAN_MESSAGE), '_blank', 'noopener'); return }
    const next = {
      planId: plan.id,
      cycle : isPaid(plan) ? cycle : 'monthly',
      selectedFeatureIds: isPaid(plan) ? (draft?.selectedFeatureIds ?? []) : [],
    }
    writePricingDraft(next)
    navigate('/checkout', { state: next })
  }

  return (
    <section className="relative z-10 pt-12 sm:pt-16 pb-16 px-4 sm:px-6" dir="rtl">
      <div className="absolute inset-x-0 top-0 h-[420px] pattern-khatam-ink pointer-events-none" aria-hidden
        style={{ opacity: 0.035, maskImage: 'radial-gradient(ellipse 60% 70% at 50% 0%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 50% 0%, #000, transparent 75%)' }} />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-9">
          <span className="eyebrow">باقات الاشتراك</span>
          {/* H1 الصفحة: IhkaamPricing لا يُركَّب إلا في /request */}
          <h1 className="font-bold text-[#1A2E28] mt-5 mb-4 mx-auto" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', lineHeight: 1.3, maxWidth: 760 }}>
            باقةٌ <span className="title-mark">على حجم معهدك</span>
          </h1>
          <p className="text-[17px] leading-[1.9] text-[#4A5D56] mx-auto mb-7" style={{ maxWidth: 600 }}>
            كل الباقات فيها النسخة الأساسية كاملة، والفرق بينها عدد الطلاب فقط. وكل باقة مدفوعة تبدأ بتجربة مجانية {TRIAL_DAYS} يوماً.
          </p>
          <CycleToggle cycle={cycle} onChange={setCycle} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {PLANS.map((p, i) => <PlanCard key={p.id} plan={p} cycle={cycle} index={i} onPick={pick} />)}
        </div>

        <CustomOffer />

        <p className="text-center text-[13px] text-[#5E6E67] mt-6">
          الأسعار بالدولار الأمريكي · بلا عقود ملزمة · تنتقل إلى باقة أكبر متى زاد طلابك
        </p>

        {/* ما في كل باقة */}
        <div className="mt-14 rounded-[26px] overflow-hidden section-dark relative px-6 sm:px-10 py-9" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <div className="relative grid lg:grid-cols-[1fr_1.6fr] gap-7 items-center">
            <div>
              <span className="eyebrow">في كل باقة</span>
              <h2 className="font-bold mt-4 mb-3" style={{ color: '#F8F5EC', fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)', lineHeight: 1.4 }}>
                النسخة الأساسية <span className="title-mark">كاملةً</span> في كل باقة
              </h2>
              <p className="text-[14.5px] leading-[1.9]" style={{ color: 'rgba(248,245,236,.75)' }}>{INCLUDED_IN_BASE_NOTE}</p>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {INCLUDED.map(t => (
                <li key={t} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-semibold"
                  style={{ background: 'rgba(248,245,236,.06)', color: '#F8F5EC', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.22)' }}>
                  <Check size={15} className="shrink-0" style={{ color: '#E0B562' }} /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6"><Addons features={features} cycle={cycle} /></div>

        <p className="text-center text-[14px] text-[#4A5D56] mt-8">
          لم تعرف أيّ باقة تناسبك؟ <Link to="/contact" className="font-bold underline underline-offset-4" style={{ color: '#1F6F52' }}>اسألنا على واتساب</Link>
        </p>
      </div>
    </section>
  )
}
