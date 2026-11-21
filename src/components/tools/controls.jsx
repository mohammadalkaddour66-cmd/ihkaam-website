import { useEffect, useId, useState } from 'react'
import { ChevronDown, ArrowDown } from 'lucide-react'
import { WEEKDAYS_AR } from '../../tools/quran/dates.js'

/* عناصر نموذج الأدوات: ورقٌ أبيض بحدّ بيج، والمختار أخضر حبري. كلها بلمسة
   44px على الأقل، وبأسماء ظاهرة لقارئ الشاشة. */

export const INK = '#0B3B33'
export const GOLD = '#B8863A'
export const GOLD_TXT = '#8A6425'

const inputBase =
  'w-full rounded-xl px-3.5 py-2.5 min-h-[46px] text-[16px] text-[#1A2E28] bg-[#FDFBF7] outline-none transition-shadow focus:shadow-[inset_0_0_0_1.5px_#1F6F52]'
const inputRing = { boxShadow: 'inset 0 0 0 1px var(--line-warm)' }

export function Field({ label, hint, children, htmlFor, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-[13.5px] font-bold text-[#1A2E28] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[12.5px] leading-[1.7] text-[#5E6E67] mt-1.5">{hint}</p>}
    </div>
  )
}

export function TextInput({ id, value, onChange, placeholder, maxLength = 80, ...rest }) {
  return (
    <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      maxLength={maxLength} className={inputBase} style={inputRing} autoComplete="off" {...rest} />
  )
}

export function TextArea({ id, value, onChange, placeholder, rows = 3, maxLength = 300, ...rest }) {
  return (
    <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      maxLength={maxLength} className={inputBase + ' resize-y leading-[1.8]'} style={inputRing} {...rest} />
  )
}

export function NumberInput({ id, value, onChange, min, max, step = 1, ...rest }) {
  return (
    <input id={id} type="number" inputMode="numeric" dir="ltr" value={value ?? ''} min={min} max={max} step={step}
      onChange={(e) => {
        const v = e.target.value === '' ? '' : Number(e.target.value)
        onChange(v)
      }}
      className={inputBase + ' text-start tabular-nums'} style={inputRing} {...rest} />
  )
}

export function DateInput({ id, value, onChange, ...rest }) {
  return (
    <input id={id} type="date" value={value || ''} onChange={(e) => e.target.value && onChange(e.target.value)}
      className={inputBase} style={inputRing} {...rest} />
  )
}

export function Select({ id, value, onChange, children, className = '', style, ...rest }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
      className={inputBase + ' cursor-pointer appearance-none pe-9 ' + className} {...rest}
      style={{
        ...style,
        ...inputRing,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A6425' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left 0.9rem center',
      }}>
      {children}
    </select>
  )
}

/* مجموعة اختيار واحد بأزرار (اتجاه الحفظ، نمط الحساب…) */
export function Segmented({ label, value, onChange, options, size = 'md' }) {
  const id = useId()
  return (
    <div>
      {label && <div id={id} className="text-[13.5px] font-bold text-[#1A2E28] mb-1.5">{label}</div>}
      <div role="radiogroup" aria-labelledby={label ? id : undefined}
        className="flex flex-wrap gap-1.5 rounded-2xl p-1.5" style={{ background: '#F1ECDF' }}>
        {options.map((o) => {
          const on = o.value === value
          return (
            <button key={String(o.value)} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
              className={`flex-1 min-w-fit rounded-xl ${size === 'sm' ? 'px-3 py-2 text-[13px]' : 'px-3.5 py-2.5 text-[14px]'} font-bold cursor-pointer transition-colors min-h-[44px]`}
              style={on
                ? { background: INK, color: '#F8F5EC', boxShadow: '0 6px 16px -10px rgba(11,59,51,.7)' }
                : { background: 'transparent', color: '#4A5D56' }}>
              {o.label}
              {o.sub && <span className="block text-[11.5px] font-medium mt-0.5" style={{ opacity: on ? 0.75 : 0.85 }}>{o.sub}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* رقائق اختيار واحد (المقدار اليومي) */
export function Chips({ label, value, onChange, options }) {
  const id = useId()
  return (
    <div>
      {label && <div id={id} className="text-[13.5px] font-bold text-[#1A2E28] mb-1.5">{label}</div>}
      <div role="radiogroup" aria-labelledby={label ? id : undefined} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.value === value
          return (
            <button key={String(o.value)} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
              className="rounded-full px-4 py-2 text-[13.5px] font-bold cursor-pointer transition-colors min-h-[40px]"
              style={on
                ? { background: INK, color: '#F8F5EC' }
                : { background: '#FDFBF7', color: '#1A2E28', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* أيام الأسبوع تبدأ بالسبت كما في التقويم المدرسي العربي. */
const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5]

export function WeekdayPicker({ label = 'أيام الحلقة', value, onChange, marked = null, markLabel }) {
  const id = useId()
  const toggle = (d) => onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort((a, b) => a - b))
  return (
    <div>
      <div id={id} className="text-[13.5px] font-bold text-[#1A2E28] mb-1.5">{label}</div>
      <div role="group" aria-labelledby={id} className="grid grid-cols-7 gap-1.5">
        {WEEK_ORDER.map((d) => {
          const on = value.includes(d)
          const isMark = on && marked === d
          return (
            <button key={d} type="button" aria-pressed={on} onClick={() => toggle(d)}
              title={isMark ? markLabel : undefined}
              className="rounded-xl py-2 text-[12.5px] font-bold cursor-pointer transition-colors min-h-[44px] relative"
              style={on
                ? { background: isMark ? '#E0B562' : INK, color: isMark ? INK : '#F8F5EC' }
                : { background: '#FDFBF7', color: '#5E6E67', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              {WEEKDAYS_AR[d].replace('ال', '')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Toggle({ label, checked, onChange, hint }) {
  const id = useId()
  return (
    <div className="flex items-start gap-3">
      <button id={id} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className="relative shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors mt-0.5"
        style={{ background: checked ? '#1F6F52' : '#D9D1C0' }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
          style={{ insetInlineStart: checked ? '1.375rem' : '0.125rem', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-[14px] font-bold text-[#1A2E28]">{label}</span>
        {hint && <span className="block text-[12.5px] leading-[1.7] text-[#5E6E67] mt-0.5">{hint}</span>}
      </label>
    </div>
  )
}

/* بطاقة النموذج: ورقة بيضاء فيها حقول الأداة */
export function Panel({ children, className = '', title, icon: Icon, id }) {
  return (
    <div id={id} className={`rounded-[24px] p-5 sm:p-6 scroll-mt-24 ${className}`}
      style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
      {title && (
        <div className="flex items-center gap-2.5 mb-5">
          {Icon && <span className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: 'rgba(184,134,58,.12)' }}><Icon size={18} color={GOLD_TXT} /></span>}
          <h2 className="font-black text-[17px] text-[#1A2E28]">{title}</h2>
        </div>
      )}
      {children}
    </div>
  )
}

/* رقمٌ في الملخص: قيمة كبيرة وتحتها اسمها */
export function Stat({ value, label, accent = false }) {
  return (
    <div className="rounded-2xl px-4 py-3.5" style={{ background: accent ? INK : '#FDFBF7', boxShadow: accent ? 'none' : 'inset 0 0 0 1px var(--line-warm)' }}>
      <div className="font-black leading-tight text-[19px] sm:text-[21px]" style={{ color: accent ? '#E0B562' : '#1A2E28' }}>{value}</div>
      <div className="text-[12.5px] font-bold mt-1" style={{ color: accent ? 'rgba(248,245,236,.75)' : '#5E6E67' }}>{label}</div>
    </div>
  )
}

/* خطوة مرقّمة في نموذج الأداة: الرقم ثم السؤال الذي تجيب عنه حقول الخطوة،
   فيعرف الزائر على الهاتف ماذا يملأ أولاً وما التالي. */
export function Step({ n, title, hint, children }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="tool-step">
      <div className="flex items-start gap-3 mb-4">
        <span aria-hidden className="shrink-0 w-8 h-8 rounded-full grid place-items-center font-black text-[15px] tabular-nums" style={{ background: INK, color: '#E0B562' }}>{n}</span>
        <div className="min-w-0 pt-0.5">
          <h3 id={id} className="font-black text-[16px] leading-snug text-[#1A2E28]">{title}</h3>
          {hint && <p className="text-[13px] leading-[1.7] text-[#5E6E67] mt-0.5">{hint}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

/* خيارات ثانوية مطويّة حتى لا تزدحم الشاشة بما لا يحتاجه أغلب الزوار */
export function MoreOptions({ title = 'خيارات إضافية', hint = 'اختيارية، يمكنك تجاهلها', children }) {
  return (
    <details className="group rounded-2xl" style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
      <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none min-h-[48px] [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-[14px] font-bold text-[#1A2E28]">{title}</span>
          {hint && <span className="block text-[12.5px] text-[#5E6E67] mt-0.5">{hint}</span>}
        </span>
        <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" color={GOLD} />
      </summary>
      <div className="px-4 pb-4 pt-1 space-y-4">{children}</div>
    </details>
  )
}

/* شريط سفلي على الهاتف: يلخّص النتيجة ويقفز إليها ما دامت تحت الشاشة.
   النتيجة تُحسب حيّة وتظهر أسفل النموذج، فبلا هذا الشريط لا يعرف الزائر أنها وُلدت. */
export function ResultBar({ targetId, label, value, cta = 'اعرض النتيجة' }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    /* يظهر حين يبلغ الزائر النموذج والنتيجة ما زالت تحت الشاشة، لا قبل ذلك */
    const check = () => {
      const res = document.getElementById(targetId)
      const form = document.getElementById('tool')
      if (!res || !form) return
      const vh = window.innerHeight
      setShow(form.getBoundingClientRect().top < vh * 0.55 && res.getBoundingClientRect().top > vh * 0.8)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [targetId])
  const on = show && !!value
  useEffect(() => {
    const root = document.documentElement
    if (on) root.style.setProperty('--wa-lift', '6rem')
    return () => root.style.removeProperty('--wa-lift')
  }, [on])
  if (!on) return null
  return (
    <div className="lg:hidden fixed inset-x-3 bottom-3 z-[900] flex items-center gap-3 rounded-2xl ps-4 pe-2 py-2"
      style={{ background: INK, color: '#F8F5EC', boxShadow: '0 18px 40px -12px rgba(8,44,38,.7)' }} role="status">
      <div className="min-w-0 flex-1">
        <div className="text-[11.5px] opacity-75 leading-tight">{label}</div>
        <div className="font-black text-[15px] leading-snug truncate" style={{ color: '#E0B562' }}>{value}</div>
      </div>
      <button type="button" onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        className="btn-cta shrink-0 inline-flex items-center gap-1.5 rounded-xl px-4 min-h-[44px] text-[14px] font-bold cursor-pointer">
        {cta} <ArrowDown size={15} />
      </button>
    </div>
  )
}
