import { useState } from 'react'
import { Check, Copy, Link2, Send, ShieldCheck, Clock, KeyRound } from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { useFormGuard } from '../../hooks/useFormGuard'
import {
  AFFILIATE_PCT, AFFILIATE_UPGRADE_D, AFFILIATE_TERMS, AFFILIATE_TERMS_VERSION,
  generateAffiliateCode, affiliateLink,
} from '../../config/affiliate'

const INK = '#0B3B33'

const RELATIONS = [
  'مدير مركز تحفيظ (يستخدم إحكام)',
  'مدير مركز تحفيظ (لا يستخدم إحكام)',
  'معلم قرآن كريم',
  'مشرف أو مستشار تربوي',
  'صاحب محتوى إسلامي',
  'أخرى',
]

const inputBase = {
  background  : '#F8F5EC',
  boxShadow   : 'inset 0 0 0 1px var(--line-warm)',
  border      : 'none',
  borderRadius: '0.75rem',
  color       : '#1A2E28',
  fontSize    : '0.97rem',
  padding     : '0.85rem 1rem',
  width       : '100%',
  outline     : 'none',
  transition  : 'box-shadow 200ms ease, background 200ms ease',
  direction   : 'rtl',
  fontFamily  : 'inherit',
}
const inputFocus = {
  background: '#FFFFFF',
  boxShadow : 'inset 0 0 0 1.5px #1F6F52, 0 0 0 4px rgba(31, 111, 82, 0.12)',
}

function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="flex flex-col gap-2 text-start">
      <label htmlFor={htmlFor} className="text-[13px] font-bold" style={{ color: '#1A2E28' }}>
        {label}{hint && <span className="font-normal text-[#5E6E67]"> · {hint}</span>}
      </label>
      {children}
    </div>
  )
}

const ASIDE = [
  { icon: Send,        t: 'تقدّم بطلبك',      d: 'اسمك وبريدك وعلاقتك بالمجال، دقيقة واحدة.' },
  { icon: KeyRound,    t: 'يصلك رمزك فوراً',  d: 'تحصل عليه على الشاشة ورابطاً جاهزاً للمشاركة.' },
  { icon: ShieldCheck, t: 'نراجع الطلب',      d: 'يُفعَّل الرمز بعد موافقة الفريق، ثم تبدأ إحالاتك بالتسجيل لك.' },
]

export default function ApplyForm({ onCode }) {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', relation: '', note: '' })
  const [focused, setFocused] = useState('')
  const [status,  setStatus]  = useState('idle')   /* idle | loading | error | success */
  const [error,   setError]   = useState('')
  const [code,    setCode]    = useState('')
  const [copied,  setCopied]  = useState('')
  const [agree,   setAgree]   = useState(false)

  const { honeypotProps, guardSubmit, markSubmitted } = useFormGuard('affiliate-apply')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const fs  = (k) => ({ ...inputBase, ...(focused === k ? inputFocus : {}) })
  const bind = (k) => ({ onFocus: () => setFocused(k), onBlur: () => setFocused('') })

  const link = code ? affiliateLink(code) : ''
  const shareText =
    'السلام عليكم، أنصحك بنظام إحكام لإدارة معاهد وحلقات التحفيظ: حضور وتسميع وأقساط وتقارير في مكان واحد، وله تجربة مجانية. هذا رابطي:\n' + link

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.relation) {
      setError('الاسم والبريد وعلاقتك بالمجال حقول مطلوبة.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('اكتب بريداً إلكترونياً صحيحاً.')
      return
    }
    if (!agree) {
      setError('اقرأ شروط الشراكة أعلاه وأقرّ بها قبل إرسال الطلب.')
      return
    }
    const gate = guardSubmit()
    if (!gate.ok) {
      if (gate.message) { setError(gate.message); return }
      setStatus('success'); setCode(generateAffiliateCode()); return   /* فخّ البوتات: نجاحٌ شكلي بلا كتابة */
    }

    setStatus('loading')
    const newCode = generateAffiliateCode()
    const { error: dbError } = await supabase.from('affiliate_applications').insert([{
      full_name    : form.name.trim(),
      email        : form.email.trim().toLowerCase(),
      phone        : form.phone.trim() || null,
      relation     : form.relation,
      /* لا عمود للموافقة في الجدول: نختم الملاحظة بنسخة الشروط التي أقرّ بها، دليلاً عند أي خلاف */
      note         : [form.note.trim(), `[أقرّ بشروط الشراكة، نسخة ${AFFILIATE_TERMS_VERSION}]`].filter(Boolean).join('\n'),
      referral_code: newCode,
      status       : 'pending',
    }])
    if (dbError) {
      setStatus('error')
      setError('تعذّر إرسال الطلب. حاول مجدداً بعد قليل.')
      return
    }
    markSubmitted()
    setCode(newCode)
    setStatus('success')
    onCode?.(newCode)
  }

  function copy(what, text) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(what)
      setTimeout(() => setCopied(''), 2200)
    }).catch(() => {})
  }

  return (
    <div
      className="grid lg:grid-cols-[1.35fr_1fr] rounded-[28px] overflow-hidden"
      style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }}
    >
      <style>{`.af-field::placeholder { color: #66756E; opacity: 1; }`}</style>

      <div className="p-6 sm:p-10">
        {status === 'success' ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-full grid place-items-center" style={{ background: INK, boxShadow: '0 0 0 6px rgba(184,134,58,.16)' }}>
                <Check size={22} color="#E0B562" strokeWidth={2.75} />
              </span>
              <div>
                <h3 className="font-black text-xl" style={{ color: INK }}>وصلنا طلبك</h3>
                <p className="text-[13px] text-[#5E6E67]">هذا رمزك. احفظه الآن.</p>
              </div>
            </div>

            <div className="rounded-2xl p-5 text-center" style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              <div className="text-[12px] font-bold text-[#5E6E67] mb-2">رمز الإحالة الخاص بك</div>
              <div className="font-black tracking-[0.14em] text-[28px] sm:text-[34px]" dir="ltr" style={{ color: INK }}>{code}</div>
              <button type="button" onClick={() => copy('code', code)}
                className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold cursor-pointer"
                style={{ background: '#FDFBF7', color: INK, boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                {copied === 'code' ? <><Check size={14} /> نُسخ</> : <><Copy size={14} /> نسخ الرمز</>}
              </button>
            </div>

            <div>
              <div className="text-[13px] font-bold mb-2" style={{ color: '#1A2E28' }}>رابطك الجاهز للمشاركة</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div dir="ltr" className="flex-1 rounded-xl px-4 py-3 text-[13px] truncate"
                  style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)', color: '#1A2E28' }}>{link}</div>
                <button type="button" onClick={() => copy('link', link)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold cursor-pointer"
                  style={{ background: INK, color: '#F8F5EC' }}>
                  {copied === 'link' ? <><Check size={14} /> نُسخ</> : <><Link2 size={14} /> نسخ الرابط</>}
                </button>
              </div>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                className="btn-cta w-full rounded-xl mt-3" style={{ padding: '0.85rem 1rem', fontSize: '0.92rem' }}>
                أرسله على واتساب لمن تعرفه
              </a>
            </div>

            <p className="flex gap-2 text-[13px] leading-[1.9] rounded-xl px-4 py-3" style={{ background: 'rgba(184,134,58,.08)', color: '#6B4E1C', boxShadow: 'inset 0 0 0 1px rgba(184,134,58,.22)' }}>
              <Clock size={16} className="shrink-0 mt-1" />
              <span>الرمز لا يُحتسب لك إلا بعد أن يوافق الفريق على طلبك. احفظ رمزك في مكانٍ آمن: لا نرسله بالبريد، وإن ضاع فراسلنا من صفحة التواصل.</span>
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-5">
            <input {...honeypotProps} />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="الاسم الكريم" htmlFor="af-name">
                <input id="af-name" className="af-field" type="text" placeholder="الاسم كما تحب أن نناديك" value={form.name}
                  onChange={set('name')} {...bind('name')} style={fs('name')} />
              </Field>
              <Field label="البريد الإلكتروني" htmlFor="af-email">
                <input id="af-email" className="af-field" type="email" dir="ltr" placeholder="name@example.com" value={form.email}
                  onChange={set('email')} {...bind('email')} style={{ ...fs('email'), textAlign: 'right' }} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="رقم واتساب" htmlFor="af-phone" hint="اختياري">
                <input id="af-phone" className="af-field" type="tel" dir="ltr" placeholder="+963…" value={form.phone}
                  onChange={set('phone')} {...bind('phone')} style={{ ...fs('phone'), textAlign: 'right' }} />
              </Field>
              <Field label="علاقتك بالمجال" htmlFor="af-rel">
                <select id="af-rel" value={form.relation} onChange={set('relation')} {...bind('rel')}
                  style={{
                    ...fs('rel'), appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
                    backgroundImage   : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231F6F52' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat  : 'no-repeat', backgroundPosition: 'left 14px center', paddingLeft: '2.5rem',
                    color: form.relation ? '#1A2E28' : '#66756E',
                  }}>
                  <option value="" disabled>اختر…</option>
                  {RELATIONS.map(r => <option key={r} value={r} style={{ background: '#fff', color: '#1A2E28' }}>{r}</option>)}
                </select>
              </Field>
            </div>
            <Field label="كيف ستعرّف بإحكام؟" htmlFor="af-note" hint="اختياري">
              <textarea id="af-note" className="af-field" rows={4} value={form.note} onChange={set('note')} {...bind('note')}
                placeholder="مثلاً: أعرف عشرة معاهد في مدينتي، أو عندي قناة يتابعها معلمو القرآن…"
                style={{ ...fs('note'), resize: 'vertical', lineHeight: '1.85', minHeight: '110px' }} />
            </Field>

            {/* الشروط تُقرأ قبل الإرسال لا بعده: كل ما يحتمل خلافاً لاحقاً مكتوب هنا */}
            <section aria-labelledby="af-terms-h" className="rounded-2xl p-5"
              style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              <h4 id="af-terms-h" className="font-black text-[14.5px] mb-3" style={{ color: INK }}>شروط الشراكة قبل أن تقدّم</h4>
              <ol className="space-y-3">
                {AFFILIATE_TERMS.map((r, i) => (
                  <li key={r.t} className="flex gap-3 text-[13px] leading-[1.85]" style={{ color: '#2C423B' }}>
                    <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full grid place-items-center text-[11px] font-black"
                      style={{ background: INK, color: '#E0B562' }}>{i + 1}</span>
                    <span><b style={{ color: INK }}>{r.t}.</b> {r.d}</span>
                  </li>
                ))}
              </ol>
            </section>
            <label htmlFor="af-agree" className="flex items-start gap-3 text-[13.5px] leading-[1.8] cursor-pointer" style={{ color: '#1A2E28' }}>
              <input id="af-agree" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
                className="mt-1.5 w-4 h-4 shrink-0 accent-[#1F6F52]" />
              <span>قرأت الشروط أعلاه، وأفهم أن العمولة على أول دفعة سنوية فقط، وأن الترقية من الشهري تُحتسب إن أكّدنا دفعتها السنوية خلال {AFFILIATE_UPGRADE_D} يوماً من تفعيل المعهد.</span>
            </label>

            <button type="submit" disabled={status === 'loading'} className="btn-cta w-full rounded-xl mt-1 disabled:opacity-60"
              style={{ padding: '0.95rem 1rem', fontSize: '0.95rem' }}>
              {status === 'loading' ? 'جاري الإرسال…' : 'قدّم طلب الشراكة'}
            </button>

            {error && (
              <p role="alert" className="text-[13px] rounded-xl px-4 py-3"
                style={{ color: '#8A6425', background: 'rgba(184,134,58,.08)', border: '1px solid rgba(184,134,58,.22)' }}>{error}</p>
            )}
            <p className="text-center text-[12px]" style={{ color: '#5E6E67' }}>
              لا رسوم ولا التزام. عمولتك {AFFILIATE_PCT}% من أول اشتراك سنوي لكل معهد تُحيله، وفق الشروط أعلاه.
            </p>
          </form>
        )}
      </div>

      <aside className="section-dark p-8 sm:p-10 flex flex-col justify-center" aria-label="خطوات الانضمام">
        <div className="pattern-layer pattern-khatam" aria-hidden />
        <h3 className="font-black text-[18px] mb-7" style={{ color: '#F8F5EC' }}>ماذا يحدث بعد الإرسال؟</h3>
        <ol className="space-y-6">
          {ASIDE.map((s, i) => (
            <li key={s.t} className="flex gap-4">
              <span className="shrink-0 w-11 h-11 rounded-xl grid place-items-center"
                style={{ background: 'rgba(224,181,98,.12)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.32)' }}>
                <s.icon size={20} color="#E0B562" />
              </span>
              <div>
                <div className="font-bold text-[15px]" style={{ color: '#F8F5EC' }}>
                  <span style={{ color: '#E0B562' }}>{i + 1}.</span> {s.t}
                </div>
                <p className="text-[13.5px] leading-[1.9] mt-0.5" style={{ color: 'rgba(248,245,236,.78)' }}>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}
