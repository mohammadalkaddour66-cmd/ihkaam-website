import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Loader2, ChevronDown,
  Server, MessageCircle, LayoutDashboard, ArrowRight, TrendingUp,
} from 'lucide-react'
import { supabase } from '../config/supabaseClient'
import { usePricingRates } from '../hooks/usePricingRates'
import { getStoredRef } from '../hooks/useAffiliateRef'

const TIERS = [
  { max: 200,  name: 'المراكز الناشئة'   },
  { max: 500,  name: 'المعاهد المتوسطة' },
  { max: 1000, name: 'المجمعات الكبرى'  },
]

function getTier(students) {
  return TIERS.find(t => students <= t.max) ?? TIERS[TIERS.length - 1]
}

const GOVERNORATES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية',
  'طرطوس', 'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'درعا',
  'السويداء', 'القنيطرة',
]

const ARAB_COUNTRIES = [
  { code: '+963', flag: '🇸🇾', name: 'سوريا',       placeholder: '9XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+966', flag: '🇸🇦', name: 'السعودية',    placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات',    placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+20',  flag: '🇪🇬', name: 'مصر',         placeholder: '1XXXXXXXXX', hint: 'بدون الصفر الأول'         },
  { code: '+962', flag: '🇯🇴', name: 'الأردن',      placeholder: '7XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+965', flag: '🇰🇼', name: 'الكويت',      placeholder: 'XXXXXXXX',   hint: 'رقم الهاتف مباشرةً'       },
  { code: '+974', flag: '🇶🇦', name: 'قطر',         placeholder: 'XXXXXXXX',   hint: 'رقم الهاتف مباشرةً'       },
  { code: '+968', flag: '🇴🇲', name: 'عُمان',       placeholder: '9XXXXXXX',   hint: 'رقم الهاتف مباشرةً'       },
  { code: '+973', flag: '🇧🇭', name: 'البحرين',     placeholder: '3XXXXXXX',   hint: 'رقم الهاتف مباشرةً'       },
  { code: '+964', flag: '🇮🇶', name: 'العراق',      placeholder: '7XXXXXXXXX', hint: 'بدون الصفر الأول'         },
  { code: '+967', flag: '🇾🇪', name: 'اليمن',       placeholder: '7XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+961', flag: '🇱🇧', name: 'لبنان',       placeholder: '7XXXXXXX',   hint: 'بدون الصفر الأول'         },
  { code: '+970', flag: '🇵🇸', name: 'فلسطين',      placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+212', flag: '🇲🇦', name: 'المغرب',      placeholder: '6XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+213', flag: '🇩🇿', name: 'الجزائر',     placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+216', flag: '🇹🇳', name: 'تونس',        placeholder: '2XXXXXXX',   hint: 'رقم الهاتف مباشرةً'       },
  { code: '+218', flag: '🇱🇾', name: 'ليبيا',       placeholder: '9XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+249', flag: '🇸🇩', name: 'السودان',     placeholder: '9XXXXXXXX',  hint: 'بدون الصفر الأول'         },
  { code: '+222', flag: '🇲🇷', name: 'موريتانيا',   placeholder: '2XXXXXXX',   hint: 'رقم الهاتف مباشرةً'       },
  { code: '+252', flag: '🇸🇴', name: 'الصومال',     placeholder: '6XXXXXXX',   hint: 'رقم الهاتف مباشرةً'       },
  { code: '+253', flag: '🇩🇯', name: 'جيبوتي',      placeholder: '7XXXXXXX',   hint: 'رقم الهاتف مباشرةً'       },
  { code: '+269', flag: '🇰🇲', name: 'جزر القمر',   placeholder: '3XXXXXXX',   hint: 'رقم الهاتف مباشرةً'       },
]

const NEXT_STEPS = [
  { icon: Server,          text: 'نتلقى طلبك ونحجز اسم مؤسستك في خوادمنا.' },
  { icon: MessageCircle,   text: 'نتواصل معك عبر الواتساب لتأكيد الباقة والتفاصيل.' },
  { icon: LayoutDashboard, text: 'نسلمك لوحة التحكم الخاصة بك لتبدأ العمل فوراً.' },
]

/* ─── Shared input styles ────────────────────────────────────────────── */
const inputBase = {
  background  : '#010D0D',
  border      : '1px solid rgba(2,115,104,0.22)',
  borderRadius: '12px',
  padding     : '0.82rem 1rem',
  color       : '#EAE4DF',
  caretColor  : '#6ABDB2',
  width       : '100%',
  outline     : 'none',
  fontSize    : '0.875rem',
  fontFamily  : 'Tajawal, sans-serif',
  transition  : 'border-color 200ms ease',
  textAlign   : 'right',
}
const iFocus = e => (e.target.style.borderColor = 'rgba(106,189,178,0.55)')
const iBlur  = e => (e.target.style.borderColor = 'rgba(2,115,104,0.22)')

/* ─── Field label wrapper ─────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: '#5A8A7E' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

/* ─── Invoice-style line item row ────────────────────────────────────── */
function SummaryRow({ label, value, suffix, labelColor = '#7A9E96', valueColor = '#C4D8D4', className = '' }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-3 rounded-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.025)' }}
    >
      <span style={{ color: labelColor, fontSize: '0.80rem', lineHeight: 1.4 }}>{label}</span>
      <div className="flex items-baseline gap-1.5 flex-shrink-0">
        <span dir="ltr" className="tabular-nums font-bold" style={{ color: valueColor, fontSize: '0.88rem' }}>
          {value}
        </span>
        {suffix && <span style={{ color: '#3A5050', fontSize: '0.65rem' }}>{suffix}</span>}
      </div>
    </div>
  )
}

/* ─── Order Summary block ─────────────────────────────────────────────── */
const CHECKOUT_PERIOD_LABEL = { 1: 'شهر', 3: '3 أشهر', 6: '6 أشهر', 12: 'سنة' }

function OrderSummary({ tierName, students, duration, addonsMonthlyTotal = 0, baseFee, perStudent, discounts }) {
  const discountFrac  = discounts[duration] ?? 0
  const discountPct   = Math.round(discountFrac * 100)
  const studentFeeM   = students * perStudent
  const monthlyTotal  = baseFee + studentFeeM + addonsMonthlyTotal
  const undiscounted  = monthlyTotal * duration
  const grandTotal    = undiscounted * (1 - discountFrac)
  const periodLabel   = CHECKOUT_PERIOD_LABEL[duration] ?? `${duration} أشهر`
  const isMonthly     = duration === 1

  return (
    <div className="flex flex-col h-full" dir="rtl">

      {/* ── HEADER: eyebrow + title + badges ── */}
      <div className="mb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-4" style={{ color: '#A6756A' }}>
          ملخص الطلب
        </p>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-black" style={{ color: '#EAE4DF', fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)' }}>
            تفاصيل باقة الاشتراك
          </h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: !isMonthly ? 'rgba(229,211,179,0.09)' : 'rgba(2,89,81,0.18)',
                border    : `1px solid ${!isMonthly ? 'rgba(229,211,179,0.22)' : 'rgba(2,115,104,0.22)'}`,
                color     : !isMonthly ? '#E5D3B3' : '#6ABDB2',
              }}
            >
              {periodLabel}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: 'rgba(0,168,150,0.10)', border: '1px solid rgba(0,168,150,0.28)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#00A896', boxShadow: '0 0 6px rgba(0,168,150,0.65)' }}
              />
              <span className="text-xs font-bold" style={{ color: '#00A896' }}>{tierName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE: each row is flex-1 — blocks expand to fill the card ── */}
      <div className="flex-1 flex flex-col gap-3 py-4">
        <SummaryRow
          className="flex-1"
          label="رسوم المنصة الثابتة"
          value={`$${baseFee.toFixed(2)}`}
          suffix="/ شهر"
        />
        <SummaryRow
          className="flex-1"
          label={`رسوم الطلاب النشطين (${students} طالب)`}
          value={`$${studentFeeM.toFixed(2)}`}
          suffix="/ شهر"
          valueColor="#00A896"
        />
        {addonsMonthlyTotal > 0
          ? (
            <SummaryRow
              className="flex-1"
              label="الميزات المتقدمة المخصصة"
              value={`+$${addonsMonthlyTotal.toFixed(2)}`}
              suffix="/ شهر"
              valueColor="#6ABDB2"
            />
          )
          : <div className="flex-1" />
        }
      </div>

      {/* ── FOOTER: grand total — mirrors SummaryRow's horizontal split ── */}
      <div
        className="flex items-center justify-between gap-4 pt-5 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >

        {/* Right (RTL start): stacked text labels */}
        <div className="flex flex-col gap-1 min-w-0">
          {discountPct > 0 && (
            <p style={{ color: '#3A5050', fontSize: '0.70rem', lineHeight: 1.4 }}>
              {isMonthly ? 'المجموع الأصلي' : `المجموع الأصلي لـ ${periodLabel}`}:&nbsp;
              <span
                dir="ltr"
                className="tabular-nums"
                style={{ textDecoration: 'line-through', opacity: 0.35 }}
              >
                ${undiscounted.toFixed(2)}
              </span>
            </p>
          )}
          <p style={{ color: '#8AADA6', fontWeight: 700, fontSize: '0.84rem', lineHeight: 1.3 }}>
            {isMonthly ? 'إجمالي ما يُدفع الآن' : `إجمالي ما يُدفع لـ ${periodLabel}`}
          </p>
        </div>

        {/* Left (RTL end): badge + price */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {discountPct > 0 && (
            <span
              className="rounded-full flex-shrink-0"
              style={{
                padding   : '0.22rem 0.65rem',
                background: 'rgba(16,185,129,0.12)',
                border    : '1px solid rgba(16,185,129,0.28)',
                color     : '#6EE7B7',
                fontSize  : '0.70rem',
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              <span dir="rtl" style={{ unicodeBidi: 'isolate' }}>
                وفّر&nbsp;<span dir="ltr">{discountPct}%</span>
              </span>
            </span>
          )}
          <motion.span
            key={grandTotal}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            dir="ltr"
            className="font-black tabular-nums"
            style={{
              color        : isMonthly ? '#00A896' : '#EAE4DF',
              fontSize     : 'clamp(1.75rem, 2.8vw, 2.25rem)',
              lineHeight   : 1,
              letterSpacing: '-0.03em',
            }}
          >
            ${grandTotal.toFixed(2)}
          </motion.span>
        </div>

      </div>
    </div>
  )
}

/* ─── Success screen ──────────────────────────────────────────────────── */
function SuccessScreen({ onHome }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.50, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center text-center px-6 gap-8"
      style={{ minHeight: '85vh' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.18, type: 'spring', stiffness: 190, damping: 16 }}
        className="rounded-full flex items-center justify-center"
        style={{
          width     : '100px',
          height    : '100px',
          background: 'rgba(106,189,178,0.10)',
          border    : '2px solid rgba(106,189,178,0.32)',
        }}
      >
        <CheckCircle2 size={46} style={{ color: '#6ABDB2' }} strokeWidth={1.4} />
      </motion.div>

      <div className="flex flex-col gap-4 max-w-md">
        <h2 className="font-black" style={{ color: '#EAE4DF', fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)' }}>
          تم استلام طلبك بنجاح!
        </h2>
        <p className="text-sm leading-[2.1]" style={{ color: '#7A9E96' }}>
          سنتواصل معك قريباً عبر الواتساب لإتمام تفعيل مركزك.
        </p>
      </div>

      {/* Affiliate hook — peak enthusiasm moment */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl px-6 py-5"
        style={{
          background: 'linear-gradient(135deg, rgba(0,168,150,0.07) 0%, rgba(2,115,104,0.12) 100%)',
          border    : '1px solid rgba(0,168,150,0.24)',
        }}
        dir="rtl"
      >
        <p className="font-black text-sm mb-1.5 text-right" style={{ color: '#EAE4DF' }}>
          هل تعرف مديراً آخر يستحق هذا النظام؟
        </p>
        <p className="text-xs leading-relaxed mb-4 text-right" style={{ color: '#5A8A7E' }}>
          بينما نُجهّز مركزك، أحِل أي زميل مدير واكسب 20% من اشتراكه الأول + 10% شهرياً مستمرة — بدون أي جهد إضافي.
        </p>
        <Link
          to="/affiliate"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
          style={{
            background    : 'rgba(106,189,178,0.13)',
            border        : '1px solid rgba(106,189,178,0.28)',
            color         : '#6ABDB2',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background  = 'rgba(106,189,178,0.22)'
            e.currentTarget.style.borderColor = 'rgba(106,189,178,0.50)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = 'rgba(106,189,178,0.13)'
            e.currentTarget.style.borderColor = 'rgba(106,189,178,0.28)'
          }}
        >
          <TrendingUp size={14} />
          انضم لبرنامج الشراكة واكسب
        </Link>
      </motion.div>

      <button
        onClick={onHome}
        className="rounded-xl px-8 py-3 text-sm font-bold cursor-pointer transition-all duration-200"
        style={{ background: 'transparent', border: '1px solid rgba(106,189,178,0.22)', color: '#5A8A78' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(106,189,178,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        العودة للرئيسية
      </button>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
   Reads `students` and `duration` from router state (sent by IhkaamPricing).
   Falls back to sensible defaults if the user lands here directly.
   ───────────────────────────────────────────────────────────────────────── */
export default function IhkaamCheckout() {
  const location = useLocation()
  const navigate = useNavigate()

  const students = location.state?.students ?? 150
  const duration = location.state?.duration ?? 1
  const tier     = getTier(students)

  const { baseFee, perStudent, discounts } = usePricingRates()

  /* Add-ons state — pre-populate from pricing page selections if available */
  const [storeFeatures,    setStoreFeatures]    = useState([])
  const [selectedFeatures] = useState(
    () => new Set(location.state?.selectedFeatureIds ?? [])
  )

  useEffect(() => {
    supabase
      .from('store_features')
      .select('id, name, description, price_usd_monthly')
      .eq('is_visible', true)
      .eq('is_deleted', false)
      .then(({ data }) => { if (data) setStoreFeatures(data) })
  }, [])

  const addonsMonthlyTotal = storeFeatures
    .filter(f => selectedFeatures.has(f.id))
    .reduce((sum, f) => sum + (f.price_usd_monthly || 0), 0)

  /* Math — all values computed from usePricingRates() with fallback */
  const discountFrac      = discounts[duration] ?? 0
  const multiplier        = duration * (1 - discountFrac)
  const monthlyBaseTotal  = baseFee + (students * perStudent)
  const periodBaseTotal   = monthlyBaseTotal * multiplier
  const periodAddonsTotal = addonsMonthlyTotal * multiplier
  const grandTotal        = periodBaseTotal + periodAddonsTotal

  /* Form state */
  const [form, setForm]               = useState({ schoolName: '', managerName: '', governorate: '', phone: '', email: '', countryCode: '+963', customCode: '' })
  const [formError,    setFormError]  = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess,    setIsSuccess]  = useState(false)

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    const { schoolName, managerName, governorate, phone, email, countryCode, customCode } = form
    const isSyria       = countryCode === '+963'
    const isOther       = countryCode === 'other'
    const effectiveCode = isOther ? customCode.trim() : countryCode

    if (!schoolName.trim() || !managerName.trim() || (isSyria && !governorate) || !phone.trim()) {
      setFormError('يرجى ملء جميع حقول معلومات المؤسسة.')
      return
    }
    if (!email.trim()) {
      setFormError('يرجى إدخال البريد الإلكتروني.')
      return
    }
    if (isOther && !effectiveCode) {
      setFormError('يرجى إدخال مفتاح دولتك (مثال: +44).')
      return
    }
    setFormError('')
    setIsSubmitting(true)
    try {
      const cleanedPhone   = phone.trim().replace(/^0+/, '')
      const formattedPhone = `${effectiveCode}${cleanedPhone}`

      const selectedFeatureObjects = storeFeatures
        .filter(f => selectedFeatures.has(f.id))
        .map(({ id, name, price_usd_monthly }) => ({ id, name, price_usd_monthly }))

      const payload = {
        institute_name     : schoolName,
        supervisor_name    : managerName,
        phone              : formattedPhone,
        requested_quota    : students,
        status             : 'pending',
        subscription_tier  : tier.name,
        billing_cycle      : duration === 1 ? 'monthly' : duration === 12 ? 'annual' : `${duration}_months`,
        total_amount       : grandTotal,
        requested_features : selectedFeatureObjects,
      }
      if (governorate.trim()) payload.governorate = governorate.trim()
      payload.email = email.trim()

      const refCode = getStoredRef()
      if (refCode) payload.referral_code = refCode

      const { error } = await supabase.from('tenant_requests').insert([payload])
      if (error) throw error

      /* Mark lead as converted if they previously subscribed via email capture */
      supabase
        .from('lead_magnet_subscribers')
        .update({ converted_at: new Date().toISOString() })
        .eq('email', email.trim().toLowerCase())
        .is('converted_at', null)
        .then(() => {})  // fire-and-forget, don't block success

      setForm({ schoolName: '', managerName: '', governorate: '', phone: '', email: '', countryCode: '+963', customCode: '' })
      setIsSuccess(true)
    } catch (err) {
      console.error('Lead submission error:', err)
      setFormError('حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return <SuccessScreen onHome={() => navigate('/')} />
  }

  /* ═══════════════════════════════════════════════════════════════════════
     STICKY RECEIPT LAYOUT
     12-col grid on desktop (lg):
       • Left  (col-span-8, order-2 in RTL auto-placement): Add-ons + Form
       • Right (col-span-4, order-1 in RTL auto-placement): Sticky Summary + CTA
     Mobile: single column — left col (order-1) on top, right col (order-2) below.
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="px-4 py-8 md:px-8 md:py-10" dir="rtl">
      <div className="max-w-6xl mx-auto">

        {/* Page eyebrow */}
        <div className="mb-12">
          {/* Back capsule — RTL start = visual right */}
          <div className="flex justify-start mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border    : '1px solid rgba(255,255,255,0.10)',
                color     : '#6ABDB2',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            >
              <span>العودة لتعديل الباقة</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="text-center">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.26em] mb-3"
              style={{ color: '#A6756A' }}
            >
              اشترك في إحكام
            </p>
            <h1
              className="font-black leading-tight"
              style={{ color: '#EAE4DF', fontSize: 'clamp(1.15rem, 2vw, 1.55rem)' }}
            >
              خطوة واحدة لتفعيل مؤسستك القرآنية
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

          {/* ═══════════════════════════════════════════════════════
              LEFT COLUMN (lg:col-span-8)
              Mobile: order-1 (top)   Desktop: visual left in RTL
              Add-ons section → Customer form
              ═══════════════════════════════════════════════════════ */}
          <div className="order-1 md:order-2 flex flex-col">

            {/* ── Customer Form ── */}
            <div
              className="rounded-[22px] px-6 py-8 md:px-8 flex flex-col gap-6 h-full"
              style={{ background: '#011A1A', border: '1px solid rgba(229,211,179,0.08)' }}
            >
              <div dir="rtl">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: '#A6756A' }}>
                  معلومات المؤسسة
                </p>
                <h2 className="font-black text-[0.98rem]" style={{ color: '#EAE4DF' }}>
                  بيانات المعهد والمشرف
                </h2>
              </div>

              <div className="flex flex-col gap-5">

                <Field label="اسم المعهد / المدرسة">
                  <input
                    type="text"
                    value={form.schoolName}
                    onChange={e => setField('schoolName', e.target.value)}
                    placeholder="مثال: معهد إقرأ لتحفيظ القرآن الكريم"
                    dir="rtl"
                    style={inputBase}
                    onFocus={iFocus}
                    onBlur={iBlur}
                  />
                </Field>

                <Field label="اسم المشرف الكامل">
                  <input
                    type="text"
                    value={form.managerName}
                    onChange={e => setField('managerName', e.target.value)}
                    placeholder="الاسم الكامل للمشرف"
                    dir="rtl"
                    style={inputBase}
                    onFocus={iFocus}
                    onBlur={iBlur}
                  />
                </Field>

                <Field label="رقم الواتساب">
                  <div className="flex gap-2">

                    {/* ── Country code: select OR custom text input ── */}
                    <div className="relative flex-shrink-0">
                      {form.countryCode === 'other' ? (
                        <>
                          <input
                            type="text"
                            value={form.customCode}
                            onChange={e => setField('customCode', e.target.value.replace(/[^\d+]/g, ''))}
                            placeholder="+XX"
                            dir="ltr"
                            maxLength={5}
                            style={{
                              ...inputBase,
                              width             : '5rem',
                              textAlign         : 'center',
                              background        : 'rgba(229,211,179,0.07)',
                              border            : '1px solid rgba(229,211,179,0.20)',
                              color             : '#E5D3B3',
                              fontWeight        : '700',
                              fontSize          : '0.82rem',
                              paddingInlineStart: '0.5rem',
                              paddingInlineEnd  : '0.5rem',
                            }}
                            onFocus={iFocus}
                            onBlur={iBlur}
                          />
                          <button
                            type="button"
                            onClick={() => { setField('countryCode', '+963'); setField('customCode', '') }}
                            className="absolute -bottom-[1.15rem] start-0 text-[10px] cursor-pointer whitespace-nowrap transition-colors duration-150"
                            style={{ color: '#5A8A78' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#6ABDB2')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#5A8A78')}
                          >
                            ← تغيير
                          </button>
                        </>
                      ) : (
                        <>
                          <select
                            value={form.countryCode}
                            onChange={e => {
                              setField('countryCode', e.target.value)
                              setField('governorate', '')
                            }}
                            style={{
                              ...inputBase,
                              appearance        : 'none',
                              WebkitAppearance  : 'none',
                              MozAppearance     : 'none',
                              cursor            : 'pointer',
                              width             : 'auto',
                              paddingInlineEnd  : '1.8rem',
                              paddingInlineStart: '0.75rem',
                              background        : 'rgba(2,89,81,0.18)',
                              border            : '1px solid rgba(2,115,104,0.22)',
                              color             : '#6ABDB2',
                              fontWeight        : '700',
                              fontSize          : '0.8rem',
                            }}
                            onFocus={iFocus}
                            onBlur={iBlur}
                          >
                            {ARAB_COUNTRIES.map(c => (
                              <option key={c.code} value={c.code} style={{ background: '#010D0D', color: '#EAE4DF', fontWeight: 'normal' }}>
                                {c.name} ({c.code})
                              </option>
                            ))}
                            <option value="other" style={{ background: '#010D0D', color: '#9A8A74', fontStyle: 'italic' }}>
                              🌍 دول أخرى...
                            </option>
                          </select>
                          <ChevronDown
                            size={12}
                            className="pointer-events-none absolute top-1/2 -translate-y-1/2"
                            style={{ color: '#5A8A78', insetInlineEnd: '0.45rem' }}
                          />
                        </>
                      )}
                    </div>

                    {/* ── Phone number ── */}
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setField('phone', e.target.value)}
                      placeholder={
                        form.countryCode === 'other'
                          ? 'XXXXXXXXX'
                          : (ARAB_COUNTRIES.find(c => c.code === form.countryCode)?.placeholder ?? 'XXXXXXXXX')
                      }
                      dir="ltr"
                      style={{ ...inputBase, textAlign: 'left' }}
                      onFocus={iFocus}
                      onBlur={iBlur}
                    />
                  </div>

                  {/* ── Hint note ── */}
                  <p className="text-[11px] leading-[1.7]" style={{ color: '#5A8A78' }} dir="rtl">
                    {form.countryCode === 'other'
                      ? 'اكتب مفتاح دولتك كاملاً مع الإشارة + (مثال: +44 بريطانيا، +1 أمريكا)'
                      : (() => {
                          const country = ARAB_COUNTRIES.find(c => c.code === form.countryCode)
                          return country
                            ? `أدخل رقم الواتساب ${country.hint} ومفتاح الدولة (${country.code})`
                            : 'أدخل رقم الواتساب بدون مفتاح الدولة'
                        })()
                    }
                  </p>
                </Field>

                <Field label="البريد الإلكتروني">
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    placeholder="example@domain.com"
                    dir="ltr"
                    required
                    style={{ ...inputBase, textAlign: 'left' }}
                    onFocus={iFocus}
                    onBlur={iBlur}
                  />
                </Field>

                {form.countryCode === '+963' ? (
                  <Field label="المحافظة">
                    <div className="relative">
                      <select
                        value={form.governorate}
                        onChange={e => setField('governorate', e.target.value)}
                        style={{
                          ...inputBase,
                          appearance      : 'none',
                          WebkitAppearance: 'none',
                          MozAppearance   : 'none',
                          cursor          : 'pointer',
                          paddingInlineEnd: '2.5rem',
                        }}
                        onFocus={iFocus}
                        onBlur={iBlur}
                      >
                        <option value="" disabled style={{ background: '#010D0D', color: '#3D5E55' }}>
                          اختر المحافظة
                        </option>
                        {GOVERNORATES.map(g => (
                          <option key={g} value={g} style={{ background: '#010D0D', color: '#EAE4DF' }}>
                            {g}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute top-1/2 -translate-y-1/2"
                        style={{ color: '#5A8A78', insetInlineEnd: '1rem' }}
                      />
                    </div>
                  </Field>
                ) : (
                  <Field label="المدينة / المنطقة (اختياري)">
                    <input
                      type="text"
                      value={form.governorate}
                      onChange={e => setField('governorate', e.target.value)}
                      placeholder="مثال: الرياض، دبي، القاهرة..."
                      dir="rtl"
                      style={inputBase}
                      onFocus={iFocus}
                      onBlur={iBlur}
                    />
                  </Field>
                )}

              </div>

            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════
              RIGHT COLUMN (lg:col-span-4) — STICKY RECEIPT
              Summary only — CTA + timeline are full-width below
              ═══════════════════════════════════════════════════════ */}
          <div className="order-2 md:order-1 flex flex-col">

            {/* ── Receipt card ── */}
            <div
              className="rounded-[22px] p-6 md:p-8 h-full flex flex-col"
              style={{ background: '#011A1A', border: '1px solid rgba(229,211,179,0.08)' }}
            >
              <OrderSummary
                tierName={tier.name}
                students={students}
                duration={duration}
                addonsMonthlyTotal={addonsMonthlyTotal}
                baseFee={baseFee}
                perStudent={perStudent}
                discounts={discounts}
              />
            </div>

          </div>

        </div>

        {/* ── Full-width activation CTA — anchors both columns below ── */}
        <div className="mt-8 mb-10 flex flex-col gap-3">
          <p className="text-[11px] text-center leading-[1.85]" style={{ color: '#3D5E55' }}>
            تأكيدك لطلب التفعيل يعني موافقتك على{' '}
            <Link
              to="/privacy"
              className="underline underline-offset-2 transition-colors duration-200"
              style={{ color: '#6ABDB2' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#A0D4CC')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6ABDB2')}
            >
              سياسة الخصوصية
            </Link>
            {' '}و{' '}
            <Link
              to="/terms"
              className="underline underline-offset-2 transition-colors duration-200"
              style={{ color: '#6ABDB2' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#A0D4CC')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6ABDB2')}
            >
              الشروط والأحكام
            </Link>
            .
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-xl py-4 font-black text-base flex items-center justify-center gap-2.5 disabled:opacity-55 cursor-pointer"
            style={{
              background   : '#059669',
              color        : '#ffffff',
              border       : 'none',
              outline      : 'none',
              letterSpacing: '0.02em',
              transition   : 'background 200ms ease, transform 150ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#10b981'
              e.currentTarget.style.transform  = 'scale(1.005)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#059669'
              e.currentTarget.style.transform  = 'scale(1)'
            }}
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            تأكيد وتفعيل المعهد
          </button>
          {formError && (
            <p className="text-[11px] font-semibold text-center" style={{ color: '#D9ACA3' }}>
              {formError}
            </p>
          )}
        </div>

        {/* ── Full-width horizontal timeline ── */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}
          dir="rtl"
        >
          <p
            className="text-[9px] font-bold uppercase tracking-[0.22em] mb-8 text-center"
            style={{ color: '#A6756A' }}
          >
            ماذا يحدث بعد الطلب؟
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-right">
            {NEXT_STEPS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="relative flex flex-col gap-3">

                {/* Connector guide-line between steps */}
                {i < NEXT_STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-5 h-px pointer-events-none"
                    style={{
                      insetInlineStart: '2.65rem',
                      width           : 'calc(100% - 0.5rem)',
                      background      : 'linear-gradient(to left, transparent, rgba(106,189,178,0.14))',
                    }}
                  />
                )}

                {/* Icon bubble + large ghost step number */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(2,115,104,0.16)',
                      border    : '1px solid rgba(106,189,178,0.18)',
                    }}
                  >
                    <Icon size={16} style={{ color: '#6ABDB2' }} strokeWidth={1.6} />
                  </div>
                  <span
                    className="font-black tabular-nums select-none"
                    style={{ color: 'rgba(106,189,178,0.20)', fontSize: '2rem', lineHeight: 1 }}
                  >
                    <span dir="ltr">{i + 1}</span>
                  </span>
                </div>

                <p className="text-sm leading-[1.9]" style={{ color: '#5A7A72' }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
