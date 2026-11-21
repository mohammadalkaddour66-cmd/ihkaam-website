import { useState } from 'react'
import { PenLine, ShieldCheck, MessageSquareQuote, Check } from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { useFormGuard } from '../../hooks/useFormGuard'

const serviceOptions = [
  { value: '',                    label: 'اختر نوع الخدمة المنفذة' },
  { value: 'نظام إحكام السحابي', label: 'نظام إحكام السحابي'      },
]

const initialForm = {
  name:     '',
  role:     '',
  service:  '',
  feedback: '',
}

/* حقول الهوية الفاتحة: سطح بيجي على بطاقة كريمية بحدّ دافئ، لا زجاج ولا شفافية.
   التركيز بحلقة الأخضر الحبري نفسها المستعملة في بقية الموقع. */
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

/* اللوحة الجانبية تشرح مصير التقييم قبل أن يكتبه الزائر */
const STEPS = [
  { icon: PenLine,            t: 'تكتب تجربتك',          d: 'بكلماتك أنت، ولو بمثال واحد صغير من عملك اليومي.' },
  { icon: ShieldCheck,        t: 'نراجعها ولا نعدّلها',   d: 'نتأكد أنها من مستخدم فعلي، ونحفظ كلامك كما كتبته.' },
  { icon: MessageSquareQuote, t: 'تظهر في جدار الثقة',    d: 'يقرؤها مدير معهد آخر قبل أن يقرر.' },
]

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-2 text-start">
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-bold"
        style={{ color: '#1A2E28' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

/* headingLevel: في /review العنوانُ هو H1 الصفحة، وفي /about يبقى H2
   لأن للصفحة عنوانها الرئيسي. */
export default function ClientReviewForm({ headingLevel: Heading = 'h2' }) {
  const SubHeading = Heading === 'h1' ? 'h2' : 'h3'   // لا قفز في مستويات العناوين (ISS-16)
  const [form,    setForm]    = useState(initialForm)
  const [focused, setFocused] = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const { honeypotProps, guardSubmit, markSubmitted } = useFormGuard('client-review')

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    const gate = guardSubmit()
    if (!gate.ok) {
      if (gate.message) { setError(gate.message); return }
      setSent(true)   /* honeypot tripped — show success, write nothing */
      return
    }

    setError('')
    setLoading(true)
    try {
      const { error: dbError } = await supabase
        .from('testimonials')
        .insert([{
          client_name : form.name.trim(),
          client_role : form.role.trim(),
          service_type: form.service,
          content     : form.feedback.trim(),
          status      : 'pending',
        }])

      if (dbError) throw dbError
      markSubmitted()
      setSent(true)
    } catch (err) {
      setError(err?.message || 'حدث خطأ في الاتصال. يرجى المحاولة مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = (key) => ({
    ...inputBase,
    ...(focused === key ? inputFocus : {}),
  })

  return (
    <section id="client-review" className="relative z-10 py-24" dir="rtl">
      <style>{`.rv-field::placeholder { color: #66756E; opacity: 1; }`}</style>

      <div className="relative max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="eyebrow mb-5">جدار الثقة</span>
          <Heading
            className="font-black leading-tight mb-4 mx-auto"
            style={{ color: '#0B3B33', fontSize: 'clamp(1.7rem, 3.6vw, 2.6rem)' }}
          >
            شاركنا{' '}
            <span style={{ color: '#8A6425' }}>تجربة التحول الرقمي</span>
          </Heading>
          <p className="text-[15px] leading-[2] mx-auto" style={{ color: '#4A5D56', maxWidth: '520px' }}>
            رأيك هو المقياس الحقيقي لنجاح أنظمتنا. يسعدنا تدوين تجربتك في العمل معنا.
          </p>
        </div>

        <div
          className="grid lg:grid-cols-[1.35fr_1fr] rounded-[28px] overflow-hidden"
          style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }}
        >
          {/* ── النموذج ── */}
          <div className="p-6 sm:p-10">
            {sent ? (
              <div className="flex flex-col items-center justify-center gap-5 py-12 text-center h-full">
                <div
                  className="w-16 h-16 rounded-full grid place-items-center"
                  style={{ background: '#0B3B33', boxShadow: '0 0 0 6px rgba(184, 134, 58, 0.16)' }}
                >
                  <Check size={28} color="#E0B562" strokeWidth={2.75} />
                </div>
                <h3 className="text-xl font-black" style={{ color: '#0B3B33' }}>شكراً لك</h3>
                <p className="text-[15px] leading-[2] max-w-sm" style={{ color: '#4A5D56' }}>
                  تم استلام تقييمك بنجاح، وسيُضاف إلى جدار الثقة بعد المراجعة.
                </p>
                <button
                  onClick={() => { setSent(false); setForm(initialForm) }}
                  className="text-[13px] font-bold mt-1 cursor-pointer underline underline-offset-4"
                  style={{ color: '#1F6F52' }}
                >
                  إرسال تقييم آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

                {/* Bot trap — invisible to humans */}
                <input {...honeypotProps} />

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="الاسم الكريم" htmlFor="review-name">
                    <input
                      id="review-name"
                      type="text"
                      className="rv-field"
                      placeholder="الشيخ عبد الرحمن"
                      value={form.name}
                      required
                      onChange={e => update('name', e.target.value)}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused('')}
                      style={fieldStyle('name')}
                    />
                  </Field>

                  <Field label="المسمى الوظيفي والمؤسسة" htmlFor="review-role">
                    <input
                      id="review-role"
                      type="text"
                      className="rv-field"
                      placeholder="مدير مجمع إقرأ"
                      value={form.role}
                      required
                      onChange={e => update('role', e.target.value)}
                      onFocus={() => setFocused('role')}
                      onBlur={() => setFocused('')}
                      style={fieldStyle('role')}
                    />
                  </Field>
                </div>

                <Field label="نوع الخدمة المنفذة" htmlFor="review-service">
                  <select
                    id="review-service"
                    value={form.service}
                    required
                    onChange={e => update('service', e.target.value)}
                    onFocus={() => setFocused('service')}
                    onBlur={() => setFocused('')}
                    style={{
                      ...fieldStyle('service'),
                      appearance        : 'none',
                      WebkitAppearance  : 'none',
                      backgroundImage   : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231F6F52' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat  : 'no-repeat',
                      backgroundPosition: 'left 14px center',
                      paddingLeft       : '2.5rem',
                      cursor            : 'pointer',
                      color             : form.service ? '#1A2E28' : '#66756E',
                    }}
                  >
                    {serviceOptions.map(o => (
                      <option key={o.value} value={o.value} style={{ background: '#FFFFFF', color: '#1A2E28' }}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="كيف ساهمت حلولنا في تحسين سير العمل لديكم؟" htmlFor="review-feedback">
                  <textarea
                    id="review-feedback"
                    rows={5}
                    className="rv-field"
                    placeholder="شاركنا تجربتك بصدق وتفصيل، كلماتك ستلهم مؤسسات أخرى للتحول الرقمي..."
                    value={form.feedback}
                    required
                    onChange={e => update('feedback', e.target.value)}
                    onFocus={() => setFocused('feedback')}
                    onBlur={() => setFocused('')}
                    style={{
                      ...fieldStyle('feedback'),
                      resize    : 'vertical',
                      lineHeight: '1.85',
                      minHeight : '130px',
                    }}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-cta w-full rounded-xl mt-1 disabled:opacity-60"
                  style={{ padding: '0.95rem 1rem', fontSize: '0.95rem' }}
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </button>

                {error && (
                  <p
                    className="text-[13px] text-start rounded-xl px-4 py-3"
                    style={{ color: '#8A6425', background: 'rgba(184, 134, 58, 0.08)', border: '1px solid rgba(184, 134, 58, 0.22)' }}
                  >
                    {error}
                  </p>
                )}

                <p className="text-center text-[12px]" style={{ color: '#5E6E67' }}>
                  تقييمك سيُنشر كشهادة حقيقية بعد المراجعة
                </p>
              </form>
            )}
          </div>

          {/* ── ماذا يحدث لتقييمك ── */}
          <aside className="section-dark p-8 sm:p-10 flex flex-col justify-center" aria-label="كيف يُنشر تقييمك">
            <div className="pattern-layer pattern-khatam" aria-hidden />
            <SubHeading className="font-black text-[18px] mb-7" style={{ color: '#F8F5EC' }}>
              ماذا يحدث بعد الإرسال؟
            </SubHeading>
            <ol className="space-y-6">
              {STEPS.map((st, i) => (
                <li key={st.t} className="flex gap-4">
                  <span
                    className="shrink-0 w-11 h-11 rounded-xl grid place-items-center"
                    style={{ background: 'rgba(224, 181, 98, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(224, 181, 98, 0.32)' }}
                  >
                    <st.icon size={20} color="#E0B562" />
                  </span>
                  <div>
                    <div className="font-bold text-[15px]" style={{ color: '#F8F5EC' }}>
                      <span style={{ color: '#E0B562' }}>{i + 1}.</span> {st.t}
                    </div>
                    <p className="text-[13.5px] leading-[1.9] mt-0.5" style={{ color: 'rgba(248, 245, 236, 0.78)' }}>
                      {st.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </section>
  )
}
