import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, CheckCircle2, ChevronDown } from 'lucide-react'
import { supabase } from '../config/supabaseClient'

/* ── Country codes ── */
const ARAB_COUNTRIES = [
  { code: '+963', flag: '🇸🇾', name: 'سوريا',       placeholder: '9XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+966', flag: '🇸🇦', name: 'السعودية',    placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات',    placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+20',  flag: '🇪🇬', name: 'مصر',         placeholder: '1XXXXXXXXX', hint: 'بدون الصفر الأول'   },
  { code: '+962', flag: '🇯🇴', name: 'الأردن',      placeholder: '7XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+965', flag: '🇰🇼', name: 'الكويت',      placeholder: 'XXXXXXXX',   hint: 'رقم الهاتف مباشرةً' },
  { code: '+974', flag: '🇶🇦', name: 'قطر',         placeholder: 'XXXXXXXX',   hint: 'رقم الهاتف مباشرةً' },
  { code: '+968', flag: '🇴🇲', name: 'عُمان',       placeholder: '9XXXXXXX',   hint: 'رقم الهاتف مباشرةً' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين',     placeholder: '3XXXXXXX',   hint: 'رقم الهاتف مباشرةً' },
  { code: '+964', flag: '🇮🇶', name: 'العراق',      placeholder: '7XXXXXXXXX', hint: 'بدون الصفر الأول'   },
  { code: '+967', flag: '🇾🇪', name: 'اليمن',       placeholder: '7XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+961', flag: '🇱🇧', name: 'لبنان',       placeholder: '7XXXXXXX',   hint: 'بدون الصفر الأول'   },
  { code: '+970', flag: '🇵🇸', name: 'فلسطين',      placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+212', flag: '🇲🇦', name: 'المغرب',      placeholder: '6XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+213', flag: '🇩🇿', name: 'الجزائر',     placeholder: '5XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+216', flag: '🇹🇳', name: 'تونس',        placeholder: '2XXXXXXX',   hint: 'رقم الهاتف مباشرةً' },
  { code: '+218', flag: '🇱🇾', name: 'ليبيا',       placeholder: '9XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+249', flag: '🇸🇩', name: 'السودان',     placeholder: '9XXXXXXXX',  hint: 'بدون الصفر الأول'   },
  { code: '+222', flag: '🇲🇷', name: 'موريتانيا',   placeholder: '2XXXXXXX',   hint: 'رقم الهاتف مباشرةً' },
  { code: '+252', flag: '🇸🇴', name: 'الصومال',     placeholder: '6XXXXXXX',   hint: 'رقم الهاتف مباشرةً' },
]

/* ── Shared input style ── */
const inputStyle = {
  background : 'rgba(1,28,28,0.80)',
  border     : '1px solid rgba(106,189,178,0.18)',
  color      : '#EAE4DF',
  caretColor : '#6ABDB2',
  borderRadius: 12,
  padding    : '0.75rem 1rem',
  fontSize   : '0.875rem',
  outline    : 'none',
  width      : '100%',
  fontFamily : 'inherit',
  transition : 'border-color 200ms ease',
}
const iFocus = e => (e.target.style.borderColor = 'rgba(106,189,178,0.55)')
const iBlur  = e => (e.target.style.borderColor = 'rgba(106,189,178,0.18)')

/* ── Text field ── */
function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold" style={{ color: '#8AAFA8' }}>{label}</label>
      {children}
    </div>
  )
}

/* ── Modal ── */
export default function DemoRequestForm({ onClose }) {
  const [name,        setName]        = useState('')
  const [institute,   setInstitute]   = useState('')
  const [phone,       setPhone]       = useState('')
  const [countryCode, setCountryCode] = useState('+963')
  const [customCode,  setCustomCode]  = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [done,        setDone]        = useState(false)

  const isOther       = countryCode === 'other'
  const effectiveCode = isOther ? customCode.trim() : countryCode
  const currentCountry = ARAB_COUNTRIES.find(c => c.code === countryCode)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !institute.trim() || !phone.trim()) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }
    if (isOther && !effectiveCode) {
      setError('يرجى إدخال مفتاح دولتك')
      return
    }
    setError('')
    setLoading(true)

    const formattedPhone = `${effectiveCode}${phone.trim().replace(/^0+/, '')}`

    try {
      const { error: dbError } = await supabase.from('demo_requests').insert([{
        name     : name.trim(),
        institute: institute.trim(),
        phone    : formattedPhone,
        page     : window.location.pathname,
        status   : 'pending',
      }])

      if (dbError) throw dbError
      setDone(true)
    } catch (err) {
      setError(err?.message || 'حدث خطأ في الاتصال. يرجى المحاولة مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        dir="rtl"
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{ background: 'linear-gradient(160deg,#0D2020 0%,#061414 100%)', border: '1px solid rgba(106,189,178,0.18)', boxShadow: '0 40px 100px rgba(0,0,0,0.70)' }}
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#6ABDB2' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          <X size={14} />
        </button>

        {done ? (
          /* ── Success ── */
          <div className="flex flex-col items-center text-center gap-5 py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(106,189,178,0.12)', border: '1px solid rgba(106,189,178,0.30)' }}>
              <CheckCircle2 size={32} style={{ color: '#6ABDB2' }} strokeWidth={1.4} />
            </div>
            <div>
              <h2 className="font-black text-lg mb-2" style={{ color: '#EAE4DF' }}>وصل طلبك — بارك الله في معهدك!</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#4A7A72' }}>
                سنتواصل معك قريباً على الواتساب لترتيب جرّب مجاناً.
              </p>
            </div>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-colors"
              style={{ background: 'rgba(106,189,178,0.10)', border: '1px solid rgba(106,189,178,0.25)', color: '#6ABDB2' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(106,189,178,0.20)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(106,189,178,0.10)')}>
              إغلاق
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-7">
              <span className="text-xs font-semibold tracking-[0.20em] uppercase block mb-2" style={{ color: '#6ABDB2' }}>
                جرّب مجاناً
              </span>
              <h2 className="font-black text-xl leading-snug" style={{ color: '#EAE4DF' }}>
                ابدأ تجربتك في إحكام
              </h2>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: '#4A7A72' }}>
                أرسل لنا بياناتك وسنفتح لك دخولاً خاصاً على الواتساب — خلال 24 ساعة بإذن الله.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Name */}
              <Field label="اسمك الكريم" htmlFor="demo-name">
                <input id="demo-name" type="text" dir="rtl" placeholder="محمد أحمد"
                  value={name} onChange={e => setName(e.target.value)}
                  style={inputStyle} onFocus={iFocus} onBlur={iBlur} />
              </Field>

              {/* Institute */}
              <Field label="اسم المعهد" htmlFor="demo-institute">
                <input id="demo-institute" type="text" dir="rtl" placeholder="معهد النور للتحفيظ"
                  value={institute} onChange={e => setInstitute(e.target.value)}
                  style={inputStyle} onFocus={iFocus} onBlur={iBlur} />
              </Field>

              {/* Phone with country code */}
              <Field label="رقم الواتساب" htmlFor="demo-phone">
                <div className="flex gap-2">

                  {/* Country selector / custom code */}
                  <div className="relative flex-shrink-0">
                    {isOther ? (
                      <>
                        <input
                          type="text"
                          value={customCode}
                          onChange={e => setCustomCode(e.target.value.replace(/[^\d+]/g, ''))}
                          placeholder="+XX"
                          dir="ltr"
                          maxLength={5}
                          style={{
                            ...inputStyle,
                            width      : '5rem',
                            textAlign  : 'center',
                            background : 'rgba(229,211,179,0.07)',
                            border     : '1px solid rgba(229,211,179,0.20)',
                            color      : '#E5D3B3',
                            fontWeight : 700,
                            padding    : '0.75rem 0.5rem',
                          }}
                          onFocus={iFocus} onBlur={iBlur}
                        />
                        <button
                          type="button"
                          onClick={() => { setCountryCode('+963'); setCustomCode('') }}
                          className="absolute -bottom-[1.1rem] start-0 text-[10px] cursor-pointer whitespace-nowrap transition-colors"
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
                          value={countryCode}
                          onChange={e => setCountryCode(e.target.value)}
                          style={{
                            ...inputStyle,
                            appearance        : 'none',
                            WebkitAppearance  : 'none',
                            width             : 'auto',
                            paddingInlineEnd  : '1.8rem',
                            paddingInlineStart: '0.75rem',
                            background        : 'rgba(2,89,81,0.18)',
                            border            : '1px solid rgba(2,115,104,0.22)',
                            color             : '#6ABDB2',
                            fontWeight        : 700,
                            cursor            : 'pointer',
                          }}
                          onFocus={iFocus} onBlur={iBlur}
                        >
                          {ARAB_COUNTRIES.map(c => (
                            <option key={c.code} value={c.code}
                              style={{ background: '#010D0D', color: '#EAE4DF', fontWeight: 'normal' }}>
                              {c.flag} {c.name} ({c.code})
                            </option>
                          ))}
                          <option value="other"
                            style={{ background: '#010D0D', color: '#9A8A74', fontStyle: 'italic' }}>
                            🌍 دول أخرى...
                          </option>
                        </select>
                        <ChevronDown size={12} className="pointer-events-none absolute top-1/2 -translate-y-1/2"
                          style={{ color: '#5A8A78', insetInlineEnd: '0.45rem' }} />
                      </>
                    )}
                  </div>

                  {/* Number input */}
                  <input
                    id="demo-phone"
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={isOther ? 'XXXXXXXXX' : (currentCountry?.placeholder ?? 'XXXXXXXXX')}
                    style={{ ...inputStyle, textAlign: 'left' }}
                    onFocus={iFocus} onBlur={iBlur}
                  />
                </div>

                {/* Hint */}
                <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: '#5A8A78' }}>
                  {isOther
                    ? 'اكتب مفتاح دولتك كاملاً مع + (مثال: +44)'
                    : currentCountry
                      ? `${currentCountry.hint} — مفتاح الدولة ${currentCountry.code}`
                      : 'أدخل الرقم بدون مفتاح الدولة'}
                </p>
              </Field>

              {error && (
                <p className="text-xs text-center" style={{ color: '#E07070' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2.5 w-full font-bold rounded-xl transition-all duration-200"
                style={{
                  padding   : '0.9rem',
                  background: loading ? 'rgba(0,168,150,0.30)' : 'linear-gradient(135deg,#00A896 0%,#027368 100%)',
                  color     : '#fff',
                  fontSize  : '0.9rem',
                  cursor    : loading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,168,150,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
              >
                {loading ? <Loader2 size={17} className="animate-spin" /> : 'أرسل الطلب'}
              </button>

            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
