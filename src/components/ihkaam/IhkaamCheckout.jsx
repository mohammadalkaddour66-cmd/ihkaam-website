import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Loader2, ChevronDown, AlertCircle, ExternalLink, Check,
  Server, MessageCircle, LayoutDashboard, ArrowRight,
} from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { useFormGuard } from '../../hooks/useFormGuard'
import { getStoredRef } from '../../hooks/useAffiliateRef'
import { readPricingDraft, writePricingDraft, clearPricingDraft } from '../../config/pricingDraft'
import { withSitePrices, ADDONS_BUNDLE_USD } from '../../config/addons'
import { PLANS, getPlan, isPaid, planPrice, addonPrice, addonsTotal, usd, TRIAL_DAYS, PAYMENT_METHOD } from '../../config/plans'
import { IHKAAM_WHATSAPP, waLink, orderMessage } from '../../config/whatsappOrder'


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

/* 2026-11-20: تجربة مجانية قبل الدفع، وواتساب يُفتح برسالة الطلب فور الإرسال */
const NEXT_STEPS = [
  { icon: MessageCircle,   text: 'يُفتح واتساب برسالة طلبك جاهزة، فأرسلها لنبدأ.' },
  { icon: Server,          text: `نفعّل معهدك خلال 24 ساعة، وتبدأ تجربتك المجانية ${TRIAL_DAYS} يوماً.` },
  { icon: LayoutDashboard, text: `في آخر التجربة تدفع عبر ${PAYMENT_METHOD} إن أردت الاستمرار، أو تتوقف بلا التزام.` },
]

/* ─── ألوان الصفحة (الهوية الفاتحة: كريمي + أخضر حبري + ذهب) ─────────── */
const INK = '#0B3B33', GOLD_TXT = '#8A6425'
const ease = [0.22, 1, 0.36, 1]

/* ─── Shared input styles ────────────────────────────────────────────────
   حقلٌ أكبر وأدفأ: خلفية بيج، وعند التركيز يبيضّ ويُحاط بهالةٍ خضراء ناعمة
   بدل تغيّر لون الحدّ وحده. */
const FIELD_BG = '#F6F1E6'
const inputBase = {
  background  : FIELD_BG,
  border      : '1px solid rgba(11, 59, 51, 0.12)',
  borderRadius: '14px',
  padding     : '0.95rem 1.1rem',
  color       : '#1A2E28',
  caretColor  : '#1F6F52',
  width       : '100%',
  outline     : 'none',
  fontSize    : '1rem',
  fontFamily  : 'Qomra, sans-serif',
  transition  : 'border-color 200ms ease, box-shadow 200ms ease, background 200ms ease',
  textAlign   : 'right',
}
const iFocus = e => {
  e.target.style.borderColor = '#1F6F52'
  e.target.style.boxShadow   = '0 0 0 4px rgba(31, 111, 82, 0.12)'
  e.target.style.background  = '#FFFFFF'
}
const iBlur = e => {
  e.target.style.borderColor = 'rgba(11, 59, 51, 0.12)'
  e.target.style.boxShadow   = 'none'
  e.target.style.background  = FIELD_BG
}

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
          background : 'rgba(241, 236, 223, 0.18)',
          borderColor: open ? 'rgba(31, 111, 82, 0.55)' : 'rgba(11, 59, 51, 0.22)',
        }}
      >
        {/* No flag emoji here: Windows has no regional-indicator glyphs, so 🇸🇾
            degrades to the bare letters "SY". The name carries the identity and
            width:auto guarantees it is never clipped. */}
        <span style={{ color: '#33463F', fontWeight: 600, fontSize: '0.85rem' }}>
          {current?.name ?? 'الدولة'}
        </span>
        <span dir="ltr" className="tabular-nums" style={{ color: '#1F6F52', fontWeight: 700, fontSize: '0.85rem' }}>
          {current?.code ?? '+'}
        </span>
        <ChevronDown
          size={13}
          style={{
            color     : '#5E6E67',
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
            background    : 'rgba(248, 245, 236, 0.97)',
            border        : '1px solid rgba(31, 111, 82, 0.18)',
            backdropFilter: 'blur(12px)',
            boxShadow     : '0 18px 44px -12px rgba(11, 59, 51, 0.225)',
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
                style={{ background: isActive ? 'rgba(31, 111, 82, 0.14)' : 'transparent', border: 'none' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(11, 59, 51, 0.05)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{c.flag}</span>
                <span
                  className="flex-1 text-right"
                  style={{ color: isActive ? '#1F6F52' : '#33463F', fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 }}
                >
                  {c.name}
                </span>
                <span dir="ltr" className="tabular-nums" style={{ color: '#5E6E67', fontSize: '0.75rem' }}>
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
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(11, 59, 51, 0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>🌍</span>
            <span className="flex-1 text-right" style={{ color: '#8B7B65', fontSize: '0.82rem' }}>
              دولة أخرى…
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Field label wrapper ─────────────────────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-baseline justify-between gap-3 text-[14px] font-bold" style={{ color: '#2F4540' }}>
        <span>{label}</span>
        {hint && <span className="text-[12.5px] font-semibold" style={{ color: '#7A8B84' }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

/* ─── ملخص الطلب ──────────────────────────────────────────────────────
   بطاقةٌ داكنة بنقش الختمة، كبطاقة «الأكثر اختياراً» في صفحة الباقات، فيربط
   العين بين اختيار الباقة وإتمام الطلب. الإضافات تُختار هنا، والتجربة تجعل
   «المستحق اليوم» صفراً: أكبر ما يوقف المدير هنا سؤال «هل سأدفع الآن؟». */
function OrderSummary({ plan, cycle, onCycle, features = [], selected, onToggle, grandTotal, bundleSaving = 0 }) {
  const paid     = isPaid(plan)
  const isAnnual = cycle === 'annual'
  const unit     = isAnnual ? 'سنوياً' : 'شهرياً'
  const CREAM    = '#F8F5EC'
  const MUTED    = 'rgba(248, 245, 236, 0.68)'
  const tile     = { background: 'rgba(248, 245, 236, 0.06)', boxShadow: 'inset 0 0 0 1px rgba(224, 181, 98, 0.20)' }

  return (
    <div className="relative section-dark rounded-[26px] overflow-hidden" dir="rtl" style={{ boxShadow: 'var(--shadow-lg)' }}>
      <div className="pattern-layer pattern-khatam" aria-hidden />
      <div aria-hidden className="absolute -top-20 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(224,181,98,.22), transparent)' }} />

      <div className="relative p-6 sm:p-7 flex flex-col gap-5">

        {/* الباقة وسعتها */}
        <div>
          <span className="text-[13px] font-bold" style={{ color: '#E0B562' }}>ملخص طلبك</span>
          <h2 className="font-bold text-[24px] mt-1.5" style={{ color: CREAM }}>باقة {plan.name}</h2>
          <p className="text-[15px] mt-1" style={{ color: MUTED }}>
            حتى <span className="font-bold tabular-nums" style={{ color: '#E0B562', fontFamily: 'cairo-latin, inherit' }}>{plan.max}</span> {plan.max % 100 >= 11 ? 'طالباً' : 'طالب'}
            {plan.note ? ` · ${plan.note}` : ''}
          </p>
        </div>

        {/* الدورة */}
        {paid && (
          <div className="grid grid-cols-2 gap-1 rounded-2xl p-1" style={{ background: 'rgba(248, 245, 236, 0.07)' }} role="group" aria-label="دورة الدفع">
            {[['monthly', 'شهري'], ['annual', 'سنوي · شهران مجاناً']].map(([id, label]) => {
              const on = cycle === id
              return (
                <button key={id} type="button" onClick={() => onCycle(id)} aria-pressed={on}
                  className="rounded-xl py-2.5 text-[14px] font-bold cursor-pointer transition-colors duration-200"
                  style={{ background: on ? '#E0B562' : 'transparent', color: on ? INK : 'rgba(248,245,236,.82)', border: 'none' }}>
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {/* سعر الباقة */}
        <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5" style={tile}>
          <span className="text-[15px]" style={{ color: MUTED }}>سعر الباقة</span>
          <span className="font-bold" style={{ color: CREAM }}>
            {paid ? (
              <>
                <span dir="ltr" className="text-[19px] tabular-nums" style={{ fontFamily: 'cairo-latin, inherit' }}>{usd(planPrice(plan, cycle))}</span>
                <span className="text-[13px] font-semibold" style={{ color: MUTED }}> {unit}</span>
              </>
            ) : 'مجاناً'}
          </span>
        </div>

        {/* الإضافات */}
        {paid && features.length > 0 && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-[14px] font-bold" style={{ color: CREAM }}>إضافات اختيارية</span>
              {bundleSaving > 0
                ? <span className="text-[12.5px] font-bold" style={{ color: '#E0B562' }}>سعر الثلاث معاً · وفّرت <span dir="ltr" className="tabular-nums">{usd(bundleSaving)}</span></span>
                : <span className="text-[12.5px]" style={{ color: MUTED }}>الثلاث معاً بـ <span dir="ltr" className="font-bold tabular-nums" style={{ color: '#E0B562' }}>{usd(addonPrice(ADDONS_BUNDLE_USD, cycle))}</span></span>}
            </div>
            <div className="flex flex-col gap-2">
              {features.map(f => {
                const on = selected.has(f.id)
                return (
                  <button key={f.id} type="button" onClick={() => onToggle(f.id)} aria-pressed={on}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 cursor-pointer text-right transition-colors duration-200"
                    style={{ ...tile, background: on ? 'rgba(224, 181, 98, 0.14)' : tile.background, boxShadow: on ? 'inset 0 0 0 1.5px rgba(224, 181, 98, 0.65)' : tile.boxShadow, border: 'none' }}>
                    <span className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-md grid place-items-center shrink-0 transition-colors duration-200"
                        style={{ background: on ? '#E0B562' : 'transparent', boxShadow: on ? 'none' : 'inset 0 0 0 1.5px rgba(248,245,236,.4)' }}>
                        {on && <Check size={13} strokeWidth={3} style={{ color: INK }} />}
                      </span>
                      <span className="text-[15px]" style={{ color: CREAM, fontWeight: on ? 700 : 500 }}>{f.name}</span>
                    </span>
                    <span dir="ltr" className="text-[14px] font-bold tabular-nums shrink-0" style={{ color: on ? '#E0B562' : MUTED }}>
                      +{usd(addonPrice(f.price_usd_monthly, cycle))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* الإجمالي */}
        <div className="pt-5" style={{ borderTop: '1px solid rgba(248, 245, 236, 0.14)' }}>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[14px] font-bold" style={{ color: CREAM }}>{paid ? 'الإجمالي بعد التجربة' : 'الإجمالي'}</div>
              {paid && isAnnual && <div className="text-[12.5px] mt-1" style={{ color: MUTED }}>تدفع عشرة أشهر وتحصل على سنة كاملة</div>}
            </div>
            <motion.div key={`${cycle}-${grandTotal}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className="flex items-baseline gap-1.5 shrink-0">
              <span dir={paid ? 'ltr' : 'rtl'} className="font-bold leading-none tabular-nums" style={{ color: '#E0B562', fontSize: '2.5rem', fontFamily: 'cairo-latin, inherit', letterSpacing: '-0.02em' }}>
                {paid ? usd(grandTotal) : 'مجاناً'}
              </span>
              {paid && <span className="text-[13px] font-semibold" style={{ color: MUTED }}>{unit}</span>}
            </motion.div>
          </div>

          {paid && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(224, 181, 98, 0.16)', boxShadow: 'inset 0 0 0 1px rgba(224, 181, 98, 0.45)' }}>
              <span className="flex items-center gap-2 text-[14.5px] font-bold" style={{ color: CREAM }}>
                <Check size={16} strokeWidth={3} style={{ color: '#E0B562' }} /> المستحق اليوم
              </span>
              <span dir="ltr" className="text-[20px] font-bold tabular-nums" style={{ color: '#E0B562', fontFamily: 'cairo-latin, inherit' }}>$0</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Success screen ──────────────────────────────────────────────────── */
function SuccessScreen({ onHome, order }) {
  return (
    <div className="px-4 sm:px-6 py-10 flex items-center justify-center" style={{ minHeight: '85vh' }} dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease }}
        className="relative section-dark w-full max-w-xl rounded-[28px] overflow-hidden text-center"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="pattern-layer pattern-khatam" aria-hidden />
        <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgba(224,181,98,.25), transparent)' }} />

        <div className="relative px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center gap-5">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 190, damping: 16 }}
            className="rounded-full grid place-items-center"
            style={{ width: 88, height: 88, background: 'rgba(224,181,98,.14)', boxShadow: 'inset 0 0 0 2px rgba(224,181,98,.55)' }}
          >
            <CheckCircle2 size={42} style={{ color: '#E0B562' }} strokeWidth={1.6} />
          </motion.div>

          <h2 className="font-bold" style={{ color: '#F8F5EC', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            تم استلام <span className="title-mark">طلبك</span>
          </h2>

          {order?.ref && (
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-bold"
              style={{ background: 'rgba(248,245,236,.08)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.35)', color: '#F8F5EC' }}>
              رقم الطلب
              <span dir="ltr" className="tabular-nums" style={{ color: '#E0B562' }}>{order.ref}</span>
            </span>
          )}

          <p className="text-[16px] leading-[2]" style={{ color: 'rgba(248,245,236,.82)', maxWidth: 440 }}>
            فتحنا لك واتساب برسالة طلبك، فأرسلها. نفعّل معهدك خلال 24 ساعة وتبدأ تجربتك المجانية {TRIAL_DAYS} يوماً،
            ولن تدفع شيئاً قبل نهايتها.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-1 w-full">
            {order?.wa && (
              <a href={order.wa} target="_blank" rel="noopener noreferrer"
                className="btn-cta inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-[15px]">
                <MessageCircle size={18} /> لم يُفتح واتساب؟ أرسلها من هنا
              </a>
            )}
            <button type="button" onClick={onHome}
              className="btn-outline inline-flex items-center justify-center rounded-xl px-6 py-3.5 font-bold text-[15px] border cursor-pointer">
              العودة للرئيسية
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
   Reads `planId` and `cycle` from router state (sent by IhkaamPricing),
   or from the saved draft after a reload. No plan at all → back to /request.
   ───────────────────────────────────────────────────────────────────────── */
export default function IhkaamCheckout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [draft] = useState(readPricingDraft)

  /* العرض الخاص (فوق 500 طالب) يذهب إلى /contact لا إلى هنا، وباقةٌ مفقودة تعود إلى «معهد متوسط» */
  const fromState = getPlan(location.state?.planId ?? draft?.planId)
  const plan      = isPaid(fromState) ? fromState : PLANS.find(p => p.popular)
  const paid      = isPaid(plan)

  const [cycleRaw, setCycle] = useState(() => location.state?.cycle ?? draft?.cycle ?? 'monthly')
  const cycle = paid && cycleRaw === 'annual' ? 'annual' : 'monthly'

  const [storeFeatures,    setStoreFeatures]    = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState(
    () => new Set(paid ? (location.state?.selectedFeatureIds ?? draft?.selectedFeatureIds ?? []) : [])
  )

  useEffect(() => {
    supabase
      .from('store_features')
      .select('id, name, description, price_usd_monthly')
      .eq('is_visible', true)
      .eq('is_deleted', false)
      /* ISS-46: الإضافات المدفوعة ثلاث فقط، مهما أعادت القاعدة. */
      .then(({ data }) => { if (data) setStoreFeatures(withSitePrices(data)) })
  }, [])

  /* المسوّدة تتبع كل تعديلٍ هنا، فالرجوع إلى /request ثم العودة لا يضيّعه */
  useEffect(() => {
    writePricingDraft({ planId: plan.id, cycle, selectedFeatureIds: [...selectedFeatures] })
  }, [plan.id, cycle, selectedFeatures])

  function toggleFeature(id) {
    setSelectedFeatures(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedFeatureList = paid ? storeFeatures.filter(f => selectedFeatures.has(f.id)) : []
  const addons      = addonsTotal(selectedFeatureList, cycle)
  const grandTotal  = (planPrice(plan, cycle) || 0) + addons.total

  /* Form state */
  const [form, setForm]               = useState({ schoolName: '', managerName: '', phone: '', email: '', countryCode: '+963', customCode: '' })
  const [formError,    setFormError]  = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess,    setIsSuccess]  = useState(false)
  const [order,        setOrder]      = useState(null)

  const { honeypotProps, guardSubmit, markSubmitted } = useFormGuard('tenant-request')

  const selectedCountry = findCountry(form.countryCode)
  const phoneCheck      = checkWhatsAppNumber(form.countryCode, form.phone, form.customCode)

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    const { schoolName, managerName, phone, email, countryCode, customCode } = form
    const isOther       = countryCode === 'other'
    const effectiveCode = isOther ? customCode.trim() : countryCode

    /* ثلاثة حقول إلزامية فقط (اسم المعهد والمشرف والواتساب)، والبريد اختياري.
       المحافظة حُذفت: كانت قائمةً سورية تطرد كل معهد خارج سوريا، ومفتاح
       الدولة في الرقم يكفي. */
    if (!schoolName.trim() || !managerName.trim() || !phone.trim()) {
      setFormError('اكتب اسم المعهد واسم المشرف ورقم الواتساب.')
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

    /* نافذة واتساب تُفتح الآن، داخل النقرة نفسها: لو فُتحت بعد انتظار الحفظ
       لحجبها المتصفح بوصفها نافذةً منبثقة. نوجّهها إلى الرسالة بعد الحفظ،
       ونغلقها إن فشل. */
    const waWin = window.open('', '_blank')

    setFormError('')
    setIsSubmitting(true)
    try {
      /* Store exactly the E.164 string the validator produced and the user
         saw next to the ✓ — not a re-derived one. */
      const formattedPhone = phoneCheck.e164

      const selectedFeatureObjects = selectedFeatureList
        .map(({ id, name, price_usd_monthly }) => ({ id, name, price_usd_monthly }))

      /* المعرّف يُولَّد هنا لا في القاعدة: الزائر لا يملك صلاحية قراءة الجدول،
         فلا يعود إليه المعرّف بعد الإدراج، ورقم الطلب في رسالة واتساب يُشتقّ منه. */
      const id  = crypto.randomUUID()
      const ref = 'IH-' + id.slice(0, 6).toUpperCase()

      const payload = {
        id,
        institute_name     : schoolName,
        supervisor_name    : managerName,
        phone              : formattedPhone,
        requested_quota    : plan.max,
        status             : 'pending',
        subscription_tier  : plan.name,
        billing_cycle      : cycle,
        total_amount       : grandTotal,
        requested_features : selectedFeatureObjects,
        notes              : `رقم الطلب ${ref} · تجربة مجانية ${TRIAL_DAYS} يوماً`,
      }
      if (email.trim()) payload.email = email.trim()
      /* رمز شريكٍ أحال هذا المعهد: محفوظ 30 يوماً من نقرته على رابطه */
      const refCode = getStoredRef()
      if (refCode) payload.referral_code = refCode

      const { error } = await supabase.from('tenant_requests').insert([payload])
      if (error) throw error
      markSubmitted()

      /* Conversion tracking is handled by the trigger_mark_lead_converted
         trigger on tenant_requests — anon has no UPDATE grant here, so doing
         it from the client silently failed. See
         supabase/migrations/20260727_fix_lead_conversion_tracking.sql */

      const wa = waLink(IHKAAM_WHATSAPP, orderMessage({
        ref, plan, cycle, features: selectedFeatureList, total: grandTotal,
        institute: schoolName.trim(), manager: managerName.trim(),
      }))
      if (waWin) waWin.location.href = wa

      setForm({ schoolName: '', managerName: '', phone: '', email: '', countryCode: '+963', customCode: '' })
      clearPricingDraft()   /* the plan is submitted — don't resurrect it later */
      setOrder({ ref, wa })
      setIsSuccess(true)
    } catch (err) {
      if (waWin) waWin.close()
      console.error('Lead submission error:', err)
      setFormError('حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return <SuccessScreen onHome={() => navigate('/')} order={order} />
  }

  /* ═══════════════════════════════════════════════════════════════════════
     تخطيط الصفحة (2026-11-20): بطاقتان. النموذج (يمين) وملخص الطلب الداكن (يسار،
     يلازم الشاشة عند التمرير). على الجوال يأتي الملخص أولاً كي يُختار كل شيء
     قبل ملء الحقول والضغط على الزر.
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative px-4 sm:px-6 pt-8 md:pt-12 pb-16" dir="rtl">
      <div className="absolute inset-x-0 top-0 h-[380px] pattern-khatam-ink pointer-events-none" aria-hidden
        style={{ opacity: 0.035, maskImage: 'radial-gradient(ellipse 60% 70% at 50% 0%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 50% 0%, #000, transparent 75%)' }} />

      <div className="relative max-w-6xl mx-auto">

        {/* الرأس */}
        <div className="mb-8 md:mb-11">
          <div className="flex justify-start mb-5">
            <button type="button" onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold cursor-pointer transition-colors duration-200 hover:bg-[#F1ECDF]"
              style={{ background: '#FDFBF7', color: INK, boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              <ArrowRight size={15} /> العودة لتعديل الباقة
            </button>
          </div>
          <div className="text-center">
            <span className="eyebrow">اشترك في إحكام</span>
            <h1 className="font-bold text-[#1A2E28] mt-4" style={{ fontSize: 'clamp(1.7rem, 3.6vw, 2.6rem)', lineHeight: 1.3 }}>
              خطوة واحدة <span className="title-mark">لتفعيل معهدك</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 items-start">

          {/* ── النموذج ── */}
          <div className="order-2 md:order-1 rounded-[26px] p-6 sm:p-8"
            style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
            <div className="mb-6">
              <h2 className="font-bold text-[22px] text-[#1A2E28]">بيانات معهدك</h2>
              <p className="text-[14.5px] text-[#4A5D56] mt-1">ثلاثة حقول فقط، ونكمل معك على واتساب.</p>
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
                            background        : 'rgba(184, 134, 58, 0.07)',
                            border            : '1px solid rgba(184, 134, 58, 0.20)',
                            color             : '#7A6440',
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
                          className="absolute -bottom-[1.25rem] start-0 text-[12px] cursor-pointer whitespace-nowrap transition-colors duration-150"
                          style={{ color: '#5E6E67' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#1F6F52')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#5E6E67')}
                        >
                          ← تغيير
                        </button>
                      </>
                    ) : (
                      <CountryPicker
                        value={form.countryCode}
                        onChange={code => setField('countryCode', code)}
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
                  <p className="text-[13px] leading-[1.7]" style={{ color: '#6B7C75' }} dir="rtl">
                    {form.countryCode === 'other'
                      ? 'اكتب مفتاح دولتك مع الإشارة + (مثال: +44)'
                      : (selectedCountry?.hint ?? 'بدون مفتاح الدولة')}
                  </p>
                )}

                {phoneCheck.state === 'invalid' && (
                  <p className="flex items-start gap-1.5 text-[13px] leading-[1.7]" style={{ color: '#8A6425' }} dir="rtl">
                    <AlertCircle size={14} className="flex-shrink-0 mt-[4px]" />
                    <span>{phoneCheck.message}</span>
                  </p>
                )}

                {phoneCheck.state === 'valid' && (
                  <div className="flex items-center justify-between gap-2 flex-wrap" dir="rtl">
                    <span className="flex items-center gap-1.5 text-[13px]" style={{ color: '#1F6F52' }}>
                      <CheckCircle2 size={14} className="flex-shrink-0" />
                      <span dir="ltr" className="tabular-nums font-bold">{phoneCheck.e164}</span>
                    </span>
                    <a
                      href={`https://wa.me/${phoneCheck.e164.replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[12.5px] font-bold rounded-full px-3 py-1.5 transition-colors duration-200"
                      style={{ background: 'rgba(31, 111, 82, 0.08)', boxShadow: 'inset 0 0 0 1px rgba(31, 111, 82, 0.25)', color: '#1F6F52' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(31, 111, 82, 0.16)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(31, 111, 82, 0.08)')}
                    >
                      <ExternalLink size={12} />
                      جرّب الرقم على واتساب
                    </a>
                  </div>
                )}
              </Field>

              {/* Bot trap — invisible to humans */}
              <input {...honeypotProps} />

              <Field label="البريد الإلكتروني" hint="اختياري">
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="example@domain.com"
                  dir="ltr"
                  style={{ ...inputBase, textAlign: 'left' }}
                  onFocus={iFocus}
                  onBlur={iBlur}
                />
              </Field>
            </div>

            {/* ── الزر ── */}
            <div className="mt-8 flex flex-col gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-cta w-full inline-flex items-center justify-center gap-2.5 rounded-xl py-4 font-bold text-[17px] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={19} />}
                ابدأ تجربتك المجانية {TRIAL_DAYS} يومًا
              </button>

              {formError && (
                <p className="flex items-start gap-2 rounded-xl px-4 py-3 text-[14px] font-semibold leading-[1.7]"
                  style={{ background: 'rgba(184, 134, 58, 0.10)', color: GOLD_TXT, boxShadow: 'inset 0 0 0 1px rgba(184, 134, 58, 0.30)' }}>
                  <AlertCircle size={16} className="shrink-0 mt-[3px]" /> {formError}
                </p>
              )}

              {/* أكبر ما يوقف المدير هنا سؤال «هل سأدفع الآن؟» — يُجاب قبل أن يتراجع */}
              <p className="flex items-start gap-2.5 text-[14.5px] leading-[1.9]" style={{ color: '#2F4540' }}>
                <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center mt-0.5" style={{ background: 'rgba(31,111,82,.12)', color: '#1F6F52' }}>
                  <Check size={14} strokeWidth={3} />
                </span>
                <span>لن تدفع شيئًا الآن. نفعّل معهدك خلال 24 ساعة، والدفع بعد التجربة عبر {PAYMENT_METHOD}.</span>
              </p>

              <p className="text-[12.5px] leading-[1.9] text-center" style={{ color: '#7A8B84' }}>
                بالضغط أنت توافق على{' '}
                <Link to="/privacy" className="underline underline-offset-4 hover:text-[#1F6F52]" style={{ color: '#4A5D56' }}>سياسة الخصوصية</Link>
                {' '}و{' '}
                <Link to="/terms" className="underline underline-offset-4 hover:text-[#1F6F52]" style={{ color: '#4A5D56' }}>الشروط والأحكام</Link>.
              </p>
            </div>
          </div>

          {/* ── ملخص الطلب ── */}
          <div className="order-1 md:order-2 md:sticky md:top-6">
            <OrderSummary
              plan={plan}
              cycle={cycle}
              onCycle={setCycle}
              features={storeFeatures}
              selected={selectedFeatures}
              onToggle={toggleFeature}
              grandTotal={grandTotal}
              bundleSaving={addons.full - addons.total}
            />
          </div>
        </div>

        {/* ── ماذا يحدث بعد الضغط؟ ── */}
        <div className="mt-14 md:mt-16">
          <h2 className="text-center font-bold text-[#1A2E28] mb-7" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.8rem)' }}>
            ماذا يحدث <span className="title-mark">بعد الضغط؟</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {NEXT_STEPS.map(({ icon: Icon, text }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                className="relative rounded-[22px] p-5 sm:p-6 flex md:flex-col items-start gap-4"
                style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                <div className="flex items-center justify-between md:w-full shrink-0">
                  <span className="w-12 h-12 rounded-2xl grid place-items-center" style={{ background: INK, color: '#E0B562' }}>
                    <Icon size={21} strokeWidth={1.8} />
                  </span>
                  <span aria-hidden className="hidden md:block font-bold tabular-nums select-none" style={{ color: 'rgba(184,134,58,.35)', fontSize: '2.4rem', lineHeight: 1, fontFamily: 'cairo-latin, inherit' }}>
                    {i + 1}
                  </span>
                </div>
                <p className="text-[15px] leading-[1.95]" style={{ color: '#2F4540' }}>{text}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
