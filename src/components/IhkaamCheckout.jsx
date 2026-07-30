import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Loader2, ChevronDown, AlertCircle, ExternalLink,
  Server, MessageCircle, LayoutDashboard, ArrowRight,
} from 'lucide-react'
import { supabase } from '../config/supabaseClient'
import { usePricingRates } from '../hooks/usePricingRates'
import { useFormGuard } from '../hooks/useFormGuard'
import { readPricingDraft, clearPricingDraft } from '../config/pricingDraft'

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

/* `lengths` = allowed national-number lengths (after stripping the trunk 0).
   `starts`  = allowed first digits for a mobile line in that country.
   Together these catch the mistakes that actually break a wa.me link:
   a missing digit, a pasted trunk zero, or a landline. */
const ARAB_COUNTRIES = [
  { code: '+963', flag: '🇸🇾', name: 'سوريا',       placeholder: '9XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['9']           },
  { code: '+966', flag: '🇸🇦', name: 'السعودية',    placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['5']           },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات',    placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['5']           },
  { code: '+20',  flag: '🇪🇬', name: 'مصر',         placeholder: '1XXXXXXXXX', hint: 'بدون الصفر الأول',   lengths: [10],    starts: ['1']           },
  { code: '+962', flag: '🇯🇴', name: 'الأردن',      placeholder: '7XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['7']           },
  { code: '+965', flag: '🇰🇼', name: 'الكويت',      placeholder: 'XXXXXXXX',   hint: 'رقم الهاتف مباشرةً', lengths: [8],     starts: ['5','6','9']   },
  { code: '+974', flag: '🇶🇦', name: 'قطر',         placeholder: 'XXXXXXXX',   hint: 'رقم الهاتف مباشرةً', lengths: [8],     starts: ['3','5','6','7'] },
  { code: '+968', flag: '🇴🇲', name: 'عُمان',       placeholder: '9XXXXXXX',   hint: 'رقم الهاتف مباشرةً', lengths: [8],     starts: ['7','9']       },
  { code: '+973', flag: '🇧🇭', name: 'البحرين',     placeholder: '3XXXXXXX',   hint: 'رقم الهاتف مباشرةً', lengths: [8],     starts: ['3','6']       },
  { code: '+964', flag: '🇮🇶', name: 'العراق',      placeholder: '7XXXXXXXXX', hint: 'بدون الصفر الأول',   lengths: [10],    starts: ['7']           },
  { code: '+967', flag: '🇾🇪', name: 'اليمن',       placeholder: '7XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['7']           },
  { code: '+961', flag: '🇱🇧', name: 'لبنان',       placeholder: '7XXXXXXX',   hint: 'بدون الصفر الأول',   lengths: [7, 8],  starts: ['3','7','8']   },
  { code: '+970', flag: '🇵🇸', name: 'فلسطين',      placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['5']           },
  { code: '+212', flag: '🇲🇦', name: 'المغرب',      placeholder: '6XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['6','7']       },
  { code: '+213', flag: '🇩🇿', name: 'الجزائر',     placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['5','6','7']   },
  { code: '+216', flag: '🇹🇳', name: 'تونس',        placeholder: '2XXXXXXX',   hint: 'رقم الهاتف مباشرةً', lengths: [8],     starts: ['2','4','5','9'] },
  { code: '+218', flag: '🇱🇾', name: 'ليبيا',       placeholder: '9XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['9']           },
  { code: '+249', flag: '🇸🇩', name: 'السودان',     placeholder: '9XXXXXXXX',  hint: 'بدون الصفر الأول',   lengths: [9],     starts: ['9','1']       },
  { code: '+222', flag: '🇲🇷', name: 'موريتانيا',   placeholder: '2XXXXXXX',   hint: 'رقم الهاتف مباشرةً', lengths: [8],     starts: ['2','3','4']   },
  { code: '+252', flag: '🇸🇴', name: 'الصومال',     placeholder: '6XXXXXXX',   hint: 'رقم الهاتف مباشرةً', lengths: [8, 9],  starts: ['6','7']       },
  { code: '+253', flag: '🇩🇯', name: 'جيبوتي',      placeholder: '7XXXXXXX',   hint: 'رقم الهاتف مباشرةً', lengths: [8],     starts: ['7']           },
  { code: '+269', flag: '🇰🇲', name: 'جزر القمر',   placeholder: '3XXXXXXX',   hint: 'رقم الهاتف مباشرةً', lengths: [7],     starts: ['3','4']       },
]

const findCountry = code => ARAB_COUNTRIES.find(c => c.code === code)

/* ─── WhatsApp number check ───────────────────────────────────────────────
   WhatsApp has no public "is this number registered?" endpoint — nothing
   client-side can confirm an account exists without messaging it. What this
   does confirm is that the number is *well-formed for its country*, which is
   what breaks wa.me links in practice. The "جرّب على واتساب" link that appears
   once the shape is valid is the definitive check: WhatsApp itself answers.
   ───────────────────────────────────────────────────────────────────────── */
function checkWhatsAppNumber(countryCode, rawPhone, customCode) {
  const digits = (rawPhone || '').replace(/\D/g, '')
  if (!digits) return { state: 'empty' }

  /* A pasted trunk zero (0944…) or a re-typed country code (963944…) are the
     two most common inputs; strip them rather than scold the user. */
  let national = digits.replace(/^0+/, '')

  if (countryCode === 'other') {
    const cc = (customCode || '').replace(/\D/g, '')
    if (!cc) return { state: 'invalid', message: 'أدخل مفتاح دولتك أولاً (مثال: +44).' }
    if (national.startsWith(cc)) national = national.slice(cc.length)
    if (national.length < 6 || national.length > 13) {
      return { state: 'invalid', message: 'طول الرقم غير معقول — تأكد أنك كتبته بدون مفتاح الدولة.' }
    }
    return { state: 'valid', e164: `+${cc}${national}`, national }
  }

  const country = findCountry(countryCode)
  if (!country) return { state: 'invalid', message: 'اختر الدولة أولاً.' }

  const bareCode = country.code.replace('+', '')
  if (national.startsWith(bareCode) && national.length > Math.max(...country.lengths)) {
    national = national.slice(bareCode.length).replace(/^0+/, '')
  }

  const expected = country.lengths.join(' أو ')
  if (!country.lengths.includes(national.length)) {
    return {
      state  : 'invalid',
      message: `رقم ${country.name} يجب أن يكون ${expected} أرقام — كتبت ${national.length}.`,
    }
  }
  if (!country.starts.includes(national[0])) {
    return {
      state  : 'invalid',
      message: `أرقام الموبايل في ${country.name} تبدأ بـ ${country.starts.join(' أو ')} — وليس ${national[0]}.`,
    }
  }

  return { state: 'valid', e164: `${country.code}${national}`, national }
}

const NEXT_STEPS = [
  { icon: Server,          text: 'نتلقى طلبك ونحجز اسم مؤسستك في خوادمنا.' },
  { icon: MessageCircle,   text: 'نتواصل معك عبر الواتساب لتأكيد الباقة والتفاصيل.' },
  { icon: LayoutDashboard, text: 'نسلمك لوحة التحكم الخاصة بك لتبدأ العمل فوراً.' },
]

/* ─── Shared input styles ────────────────────────────────────────────── */
const inputBase = {
  background  : '#020F0E',
  border      : '1px solid rgba(26,148,155,0.22)',
  borderRadius: '12px',
  padding     : '0.82rem 1rem',
  color       : '#EAE4DF',
  caretColor  : '#48D6CD',
  width       : '100%',
  outline     : 'none',
  fontSize    : '1rem',
  fontFamily  : 'Cairo, sans-serif',
  transition  : 'border-color 200ms ease',
  textAlign   : 'right',
}
const iFocus = e => (e.target.style.borderColor = 'rgba(72,214,205,0.55)')
const iBlur  = e => (e.target.style.borderColor = 'rgba(26,148,155,0.22)')

/* ─── Country picker ─────────────────────────────────────────────────────
   A native <select> can't show a long option in a narrow box — it just
   ellipsises ("سور..."). This trigger carries the flag + dial code, which
   always fit, and the open panel shows every name in full.
   ───────────────────────────────────────────────────────────────────────── */
function CountryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey  = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = findCountry(value)

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={current ? `الدولة: ${current.name} ${current.code}` : 'اختر الدولة'}
        className="flex items-center gap-1.5 cursor-pointer"
        style={{
          ...inputBase,
          width      : 'auto',
          whiteSpace : 'nowrap',
          paddingLeft: '0.5rem', paddingRight: '0.7rem',
          background : 'rgba(17,49,44,0.18)',
          borderColor: open ? 'rgba(72,214,205,0.55)' : 'rgba(26,148,155,0.22)',
        }}
      >
        {/* No flag emoji here: Windows has no regional-indicator glyphs, so 🇸🇾
            degrades to the bare letters "SY". The name carries the identity and
            width:auto guarantees it is never clipped. */}
        <span style={{ color: '#C4D8D4', fontWeight: 600, fontSize: '0.85rem' }}>
          {current?.name ?? 'الدولة'}
        </span>
        <span dir="ltr" className="tabular-nums" style={{ color: '#48D6CD', fontWeight: 700, fontSize: '0.85rem' }}>
          {current?.code ?? '+'}
        </span>
        <ChevronDown
          size={13}
          style={{
            color     : '#6FA5A8',
            flexShrink: 0,
            transform : open ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-40 mt-2 rounded-xl overflow-y-auto"
          /* insetInlineStart in RTL = the panel's right edge meets the
             trigger's right edge and it grows leftward, into the page.
             Pinning the *end* pushed it off the right of the screen. */
          style={{
            top             : '100%',
            insetInlineStart: 0,
            width           : '14rem',
            maxHeight       : '15rem',
            background    : 'rgba(4,26,25,0.97)',
            border        : '1px solid rgba(72,214,205,0.18)',
            backdropFilter: 'blur(12px)',
            boxShadow     : '0 18px 44px -12px rgba(0,0,0,0.75)',
            padding       : '0.3rem',
          }}
        >
          {ARAB_COUNTRIES.map(c => {
            const isActive = c.code === value
            return (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => { onChange(c.code); setOpen(false) }}
                className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-right cursor-pointer"
                style={{ background: isActive ? 'rgba(72,214,205,0.14)' : 'transparent', border: 'none' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{c.flag}</span>
                <span
                  className="flex-1 text-right"
                  style={{ color: isActive ? '#48D6CD' : '#C4D8D4', fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 }}
                >
                  {c.name}
                </span>
                <span dir="ltr" className="tabular-nums" style={{ color: '#6FA5A8', fontSize: '0.75rem' }}>
                  {c.code}
                </span>
              </button>
            )
          })}
          <button
            type="button"
            role="option"
            aria-selected={value === 'other'}
            onClick={() => { onChange('other'); setOpen(false) }}
            className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-right cursor-pointer"
            style={{ background: 'transparent', border: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>🌍</span>
            <span className="flex-1 text-right" style={{ color: '#9A8A74', fontSize: '0.82rem' }}>
              دولة أخرى…
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Field label wrapper ─────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: '#509492' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

/* ─── Invoice-style line item row ────────────────────────────────────── */
function SummaryRow({ label, value, suffix, labelColor = '#96BCBE', valueColor = '#C4D8D4', className = '' }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.025)' }}
    >
      <span style={{ color: labelColor, fontSize: '0.80rem', lineHeight: 1.4 }}>{label}</span>
      <div className="flex items-baseline gap-1.5 flex-shrink-0">
        <span dir="ltr" className="tabular-nums font-bold" style={{ color: valueColor, fontSize: '0.88rem' }}>
          {value}
        </span>
        {suffix && <span style={{ color: '#364C54', fontSize: '0.65rem' }}>{suffix}</span>}
      </div>
    </div>
  )
}

/* ─── Order Summary block ─────────────────────────────────────────────── */
const CHECKOUT_PERIOD_LABEL = { 1: 'شهر', 3: '3 أشهر', 6: '6 أشهر', 12: 'سنة' }

function OrderSummary({
  tierName, students, duration, addonsMonthlyTotal = 0, baseFee, perStudent, discounts,
  selectedFeatureList = [],
}) {
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

      {/* ── HEADER: title + badges. The eyebrow said "ملخص الطلب" and the
           title said "تفاصيل باقة الاشتراك" — same sentence twice. ── */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-black" style={{ color: '#EAE4DF', fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)' }}>
            ملخص الطلب
          </h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: !isMonthly ? 'rgba(229,211,179,0.09)' : 'rgba(17,49,44,0.18)',
                border    : `1px solid ${!isMonthly ? 'rgba(229,211,179,0.22)' : 'rgba(26,148,155,0.22)'}`,
                color     : !isMonthly ? '#E5D3B3' : '#48D6CD',
              }}
            >
              {periodLabel}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: 'rgba(72,214,205,0.10)', border: '1px solid rgba(72,214,205,0.28)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#48D6CD', boxShadow: '0 0 6px rgba(72,214,205,0.65)' }}
              />
              <span className="text-xs font-bold" style={{ color: '#48D6CD' }}>{tierName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE: what the subscription covers — scope, not a price breakdown.
           The "مدة الاشتراك" row is gone: the period badge above states it, and
           the total's own label repeats it ("إجمالي ما يُدفع لـ 6 أشهر"). ── */}
      <div className="flex-1 flex flex-col gap-2 py-4">
        <SummaryRow
          label="سعة الطلاب النشطين"
          value={students}
          suffix="طالب"
          valueColor="#48D6CD"
        />
        {/* Itemised add-ons. Each amount is that feature's own share of the
            grand total — monthly price × الفترة × (1 − الخصم) — so the lines
            sum to the number at the bottom. Name and price only. */}
        {selectedFeatureList.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)' }}>
            <div className="flex items-center justify-between gap-3 px-4 pt-2.5 pb-2">
              <span style={{ color: '#96BCBE', fontSize: '0.80rem', lineHeight: 1.4 }}>
                الميزات المتقدمة
              </span>
              <span dir="ltr" className="tabular-nums" style={{ color: '#3D6B6B', fontSize: '0.68rem' }}>
                {selectedFeatureList.length}
              </span>
            </div>
            {selectedFeatureList.map(f => (
              <div
                key={f.id}
                className="flex items-start justify-between gap-3 px-4 py-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.045)' }}
              >
                <span style={{ color: '#7FB8B4', fontSize: '0.75rem', lineHeight: 1.5 }}>
                  {f.name}
                </span>
                <span
                  dir="ltr"
                  className="tabular-nums flex-shrink-0"
                  style={{ color: '#48D6CD', fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.5 }}
                >
                  ${((f.price_usd_monthly || 0) * duration * (1 - discountFrac)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER: grand total. Stacked until lg — side by side, the long
           multi-month labels ("إجمالي ما يُدفع لـ 6 أشهر") wrapped into the
           price and the two collided. ── */}
      <div
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4 pt-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >

        {/* Right (RTL start): stacked text labels */}
        <div className="flex flex-col gap-1 min-w-0">
          {discountPct > 0 && (
            <p style={{ color: '#364C54', fontSize: '0.70rem', lineHeight: 1.4 }}>
              قبل الخصم:&nbsp;
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
            {isMonthly ? 'إجمالي ما يُدفع الآن' : `الإجمالي لـ ${periodLabel}`}
          </p>
        </div>

        {/* Left (RTL end): badge + price */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {discountPct > 0 && (
            <span
              className="rounded-full flex-shrink-0"
              style={{
                padding   : '0.22rem 0.65rem',
                background: 'rgba(22,179,174,0.12)',
                border    : '1px solid rgba(22,179,174,0.28)',
                color     : '#6EE7E3',
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
              color        : isMonthly ? '#48D6CD' : '#EAE4DF',
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
          background: 'rgba(72,214,205,0.10)',
          border    : '2px solid rgba(72,214,205,0.32)',
        }}
      >
        <CheckCircle2 size={46} style={{ color: '#48D6CD' }} strokeWidth={1.4} />
      </motion.div>

      <div className="flex flex-col gap-4 max-w-md">
        <h2 className="font-black" style={{ color: '#EAE4DF', fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)' }}>
          تم استلام طلبك بنجاح!
        </h2>
        <p className="text-sm leading-[2.1]" style={{ color: '#96BCBE' }}>
          سنتواصل معك قريباً عبر الواتساب لإتمام تفعيل مركزك.
        </p>
      </div>

      {/* كانت هنا دعوة لبرنامج التسويق بالعمولة عند لحظة الحماس بعد
         الطلب. أُلغي البرنامج بالكامل: اسم إحكام لا يُقدَّم إلا ممن
         نعرفه، والسمعة عند المدراء أغلى من اشتراك يُشترى بعمولة. */}

      <button
        onClick={onHome}
        className="rounded-xl px-8 py-3 text-sm font-bold cursor-pointer transition-all duration-200"
        style={{ background: 'transparent', border: '1px solid rgba(72,214,205,0.22)', color: '#6FA5A8' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(72,214,205,0.06)')}
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

  /* Router state is the primary source; the saved draft covers a reload of
     /checkout, which would otherwise silently reprice the order at defaults. */
  const [draft] = useState(readPricingDraft)

  const students = location.state?.students ?? draft?.students ?? 150
  const tier     = getTier(students)

  const { baseFee, perStudent, discounts, enabledDurations } = usePricingRates()

  /* المدة تصل من حالة الموجّه أو من مسوّدةٍ محفوظة — وكلاهما قد يحمل مدةً
     عطّلها السوبر أدمن بعد أن بناها الزائر. بلا هذا الحدّ يمرّ الطلب بمدةٍ
     لم تعد تُباع، ويُكتب billing_cycle عليها في السطر أدناه.
     مشتقٌّ لا حالة: يُعاد حسابه حين يصل الإعداد بعد أول رسم. */
  const rawDuration = location.state?.duration ?? draft?.duration ?? 1
  const duration    = enabledDurations.includes(rawDuration)
    ? rawDuration
    : (enabledDurations[0] ?? 1)

  /* Add-ons state — pre-populate from pricing page selections if available */
  const [storeFeatures,    setStoreFeatures]    = useState([])
  const [selectedFeatures] = useState(
    () => new Set(location.state?.selectedFeatureIds ?? draft?.selectedFeatureIds ?? [])
  )

  useEffect(() => {
    supabase
      .from('store_features')
      .select('id, name, description, price_usd_monthly')
      .eq('is_visible', true)
      .eq('is_deleted', false)
      .then(({ data }) => { if (data) setStoreFeatures(data) })
  }, [])

  const selectedFeatureList = storeFeatures.filter(f => selectedFeatures.has(f.id))

  const addonsMonthlyTotal = selectedFeatureList
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

  const { honeypotProps, guardSubmit, markSubmitted } = useFormGuard('tenant-request')

  const selectedCountry = findCountry(form.countryCode)
  const phoneCheck      = checkWhatsAppNumber(form.countryCode, form.phone, form.customCode)

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
    /* A malformed number means no WhatsApp contact, which means a dead lead.
       Block here rather than discover it after the sale. */
    if (phoneCheck.state !== 'valid') {
      setFormError(phoneCheck.message ?? 'يرجى إدخال رقم واتساب صحيح.')
      return
    }

    const gate = guardSubmit()
    if (!gate.ok) {
      if (gate.message) { setFormError(gate.message); return }
      setIsSuccess(true)   /* honeypot tripped — show success, write nothing */
      return
    }

    setFormError('')
    setIsSubmitting(true)
    try {
      /* Store exactly the E.164 string the validator produced and the user
         saw next to the ✓ — not a re-derived one. */
      const formattedPhone = phoneCheck.e164

      const selectedFeatureObjects = selectedFeatureList
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

      const { error } = await supabase.from('tenant_requests').insert([payload])
      if (error) throw error
      markSubmitted()

      /* Conversion tracking is handled by the trigger_mark_lead_converted
         trigger on tenant_requests — anon has no UPDATE grant here, so doing
         it from the client silently failed. See
         supabase/migrations/20260727_fix_lead_conversion_tracking.sql */

      setForm({ schoolName: '', managerName: '', governorate: '', phone: '', email: '', countryCode: '+963', customCode: '' })
      clearPricingDraft()   /* the plan is submitted — don't resurrect it later */
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
    <div className="px-4 py-6 md:px-8 md:py-10" dir="rtl">
      <div className="max-w-6xl mx-auto">

        {/* Page eyebrow */}
        <div className="mb-7 md:mb-12">
          {/* Back capsule — RTL start = visual right */}
          <div className="flex justify-start mb-4 md:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border    : '1px solid rgba(255,255,255,0.10)',
                color     : '#48D6CD',
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
              className="hidden md:block text-[10px] font-bold uppercase tracking-[0.26em] mb-3"
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
              className="rounded-[22px] px-5 py-6 md:px-8 md:py-8 flex flex-col gap-5 md:gap-6 h-full"
              style={{ background: '#09201E', border: '1px solid rgba(229,211,179,0.08)' }}
            >
              {/* Eyebrow dropped — "معلومات المؤسسة" and "بيانات المعهد
                  والمشرف" were the same label stacked on itself. */}
              <h2 className="font-black text-[0.98rem]" style={{ color: '#EAE4DF' }} dir="rtl">
                بيانات المعهد والمشرف
              </h2>

              <div className="flex flex-col gap-4 md:gap-5">

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
                              fontSize          : '1rem',
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
                            style={{ color: '#6FA5A8' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#48D6CD')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#6FA5A8')}
                          >
                            ← تغيير
                          </button>
                        </>
                      ) : (
                        <CountryPicker
                          value={form.countryCode}
                          onChange={code => {
                            setField('countryCode', code)
                            setField('governorate', '')
                          }}
                        />
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
                      style={{ ...inputBase, textAlign: 'left', flex: '1 1 0%', minWidth: 0 }}
                      onFocus={iFocus}
                      onBlur={iBlur}
                    />
                  </div>

                  {/* ── Live status: the country's full name lives here (where
                       there's room for it), then the shape check, then the
                       wa.me test link once the number is well-formed. ── */}
                  {phoneCheck.state === 'empty' && (
                    <p className="text-[11px] leading-[1.7]" style={{ color: '#6FA5A8' }} dir="rtl">
                      {form.countryCode === 'other'
                        ? 'اكتب مفتاح دولتك مع الإشارة + (مثال: +44)'
                        : (selectedCountry?.hint ?? 'بدون مفتاح الدولة')}
                    </p>
                  )}

                  {phoneCheck.state === 'invalid' && (
                    <p
                      className="flex items-start gap-1.5 text-[11px] leading-[1.7]"
                      style={{ color: '#D9ACA3' }}
                      dir="rtl"
                    >
                      <AlertCircle size={12} className="flex-shrink-0 mt-[3px]" />
                      <span>{phoneCheck.message}</span>
                    </p>
                  )}

                  {phoneCheck.state === 'valid' && (
                    <div className="flex items-center justify-between gap-2 flex-wrap" dir="rtl">
                      <span
                        className="flex items-center gap-1.5 text-[11px]"
                        style={{ color: '#48D6CD' }}
                      >
                        <CheckCircle2 size={12} className="flex-shrink-0" />
                        <span dir="ltr" className="tabular-nums font-bold">{phoneCheck.e164}</span>
                      </span>
                      <a
                        href={`https://wa.me/${phoneCheck.e164.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 transition-colors duration-200"
                        style={{
                          background: 'rgba(72,214,205,0.10)',
                          border    : '1px solid rgba(72,214,205,0.28)',
                          color     : '#48D6CD',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(72,214,205,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(72,214,205,0.10)')}
                      >
                        <ExternalLink size={11} />
                        جرّب الرقم على واتساب
                      </a>
                    </div>
                  )}
                </Field>

                {/* Bot trap — invisible to humans */}
                <input {...honeypotProps} />

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
                        <option value="" disabled style={{ background: '#020F0E', color: '#3C555F' }}>
                          اختر المحافظة
                        </option>
                        {GOVERNORATES.map(g => (
                          <option key={g} value={g} style={{ background: '#020F0E', color: '#EAE4DF' }}>
                            {g}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute top-1/2 -translate-y-1/2"
                        style={{ color: '#6FA5A8', insetInlineEnd: '1rem' }}
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
          {/* self-start + sticky: the receipt is short by design, so stretching
              it to the form's height only opened a void between the rows and
              the total. It now hugs its content and follows the scroll. */}
          <div className="order-2 md:order-1 flex flex-col md:self-start md:sticky md:top-6">

            {/* ── Receipt card ── */}
            <div
              className="rounded-[22px] p-5 md:p-7 flex flex-col"
              style={{ background: '#09201E', border: '1px solid rgba(229,211,179,0.08)' }}
            >
              <OrderSummary
                tierName={tier.name}
                students={students}
                duration={duration}
                addonsMonthlyTotal={addonsMonthlyTotal}
                selectedFeatureList={selectedFeatureList}
                baseFee={baseFee}
                perStudent={perStudent}
                discounts={discounts}
              />
            </div>

          </div>

        </div>

        {/* ── Full-width activation CTA — anchors both columns below ── */}
        <div className="mt-5 mb-7 md:mt-8 md:mb-10 flex flex-col gap-3">
          <p className="text-[11px] text-center leading-[1.85]" style={{ color: '#3C555F' }}>
            بتأكيد الطلب أنت توافق على{' '}
            <Link
              to="/privacy"
              className="underline underline-offset-2 transition-colors duration-200"
              style={{ color: '#48D6CD' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#A0D4CC')}
              onMouseLeave={e => (e.currentTarget.style.color = '#48D6CD')}
            >
              سياسة الخصوصية
            </Link>
            {' '}و{' '}
            <Link
              to="/terms"
              className="underline underline-offset-2 transition-colors duration-200"
              style={{ color: '#48D6CD' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#A0D4CC')}
              onMouseLeave={e => (e.currentTarget.style.color = '#48D6CD')}
            >
              الشروط والأحكام
            </Link>
            .
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-xl py-4 font-black text-base flex items-center justify-center gap-2.5 disabled:opacity-55 cursor-pointer"
            /* Brand primary action — same treatment as "فعّل مركزك الآن" */
            style={{
              background   : '#48D6CD',
              color        : '#09201E',
              border       : 'none',
              outline      : 'none',
              letterSpacing: '0.02em',
              boxShadow    : '0 8px 24px rgba(72,214,205,0.18)',
              transition   : 'box-shadow 200ms ease, transform 150ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(72,214,205,0.30)'
              e.currentTarget.style.transform = 'scale(1.005)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(72,214,205,0.18)'
              e.currentTarget.style.transform = 'scale(1)'
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
        {/* Each step used to stack a 40px bubble, a 2rem ghost numeral and the
            text — three rows deep, ×3 steps. On a phone they now read as one
            compact line each; the ghost numeral stays where there's room. */}
        <div
          className="rounded-2xl p-5 md:p-8"
          style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}
          dir="rtl"
        >
          <p
            className="text-[9px] font-bold uppercase tracking-[0.22em] mb-5 md:mb-8 text-center"
            style={{ color: '#A6756A' }}
          >
            ماذا يحدث بعد الطلب؟
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start text-right">
            {NEXT_STEPS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="relative flex flex-row md:flex-col items-center md:items-stretch gap-3">

                {/* Connector guide-line between steps */}
                {i < NEXT_STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-5 h-px pointer-events-none"
                    style={{
                      insetInlineStart: '2.65rem',
                      width           : 'calc(100% - 0.5rem)',
                      background      : 'linear-gradient(to left, transparent, rgba(72,214,205,0.14))',
                    }}
                  />
                )}

                {/* Icon bubble + ghost step number (desktop only) */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div
                    className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(26,148,155,0.16)',
                      border    : '1px solid rgba(72,214,205,0.18)',
                    }}
                  >
                    <Icon size={16} style={{ color: '#48D6CD' }} strokeWidth={1.6} />
                  </div>
                  <span
                    className="hidden md:block font-black tabular-nums select-none"
                    style={{ color: 'rgba(72,214,205,0.20)', fontSize: '2rem', lineHeight: 1 }}
                  >
                    <span dir="ltr">{i + 1}</span>
                  </span>
                </div>

                <p className="text-[0.8rem] md:text-sm leading-[1.7] md:leading-[1.9]" style={{ color: '#4A8A88' }}>
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
