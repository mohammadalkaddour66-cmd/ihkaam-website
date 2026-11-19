import { useState } from 'react'
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

const inputBase = {
  background          : 'rgba(11, 59, 51, 0.04)',
  borderWidth         : '1px',
  borderStyle         : 'solid',
  borderColor         : 'rgba(184, 134, 58, 0.18)',
  borderRadius        : '0.875rem',
  color               : '#1A2E28',
  fontSize            : '1rem',
  padding             : '0.9rem 1.125rem',
  width               : '100%',
  outline             : 'none',
  transition          : 'border-color 350ms ease, box-shadow 350ms ease',
  backdropFilter      : 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  direction           : 'rtl',
  fontFamily          : 'inherit',
}

const inputFocus = {
  borderColor: 'rgba(184, 134, 58, 0.55)',
  boxShadow  : '0 0 0 3px rgba(184, 134, 58, 0.08)',
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-2 text-start">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold"
        style={{ color: '#7A5A2E', letterSpacing: '0.07em' }}
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
    <section
      id="client-review"
      className="relative z-10 py-28"
      dir="rtl"
    >
      {/* Rose glow — top right */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[480px] h-[480px]"
        style={{
          background: 'radial-gradient(circle at top right, rgba(184, 134, 58, 0.07) 0%, transparent 65%)',
        }}
        aria-hidden
      />
      {/* Teal glow — bottom left */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[420px] h-[420px]"
        style={{
          background: 'radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.40) 0%, transparent 65%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
            style={{ color: '#7A5A2E' }}
          >
            جدار الثقة
          </span>
          <Heading
            className="font-black leading-tight mb-5 mx-auto"
            style={{
              color   : '#1A2E28',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
            }}
          >
            شاركنا{' '}
            <span style={{ color: '#8A6425' }}>تجربة التحول الرقمي</span>
          </Heading>
          <p
            className="text-sm leading-[2] mx-auto"
            style={{ color: '#4A5D56', maxWidth: '520px' }}
          >
            رأيك هو المقياس الحقيقي لنجاح أنظمتنا. يسعدنا تدوين تجربتك في العمل معنا.
          </p>
        </div>

        {/* Glassmorphism card */}
        <div
          className="rounded-[2rem] p-8 md:p-12"
          style={{
            background          : 'rgba(241, 236, 223, 0.15)',
            border              : '1px solid rgba(184, 134, 58, 0.14)',
            backdropFilter      : 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            boxShadow           : '0 8px 48px rgba(248, 245, 236, 0.35)',
          }}
        >
          {sent ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-5 py-10 text-center">
              {/* Animated check mark */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(184, 134, 58, 0.12)',
                  border    : '1px solid rgba(184, 134, 58, 0.30)',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A6425" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3
                className="text-xl font-black"
                style={{ color: '#1A2E28' }}
              >
                شكراً لك..
              </h3>
              <p
                className="text-sm leading-[2] max-w-sm"
                style={{ color: '#4A5D56' }}
              >
                تم استلام تقييمك بنجاح وسيتم إضافته لجدار الثقة قريباً.
              </p>
              <button
                onClick={() => { setSent(false); setForm(initialForm) }}
                className="text-xs font-semibold mt-2 cursor-pointer transition-colors duration-300"
                style={{ color: '#7A5A2E' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#8A6425')}
                onMouseLeave={e => (e.currentTarget.style.color = '#7A5A2E')}
              >
                إرسال تقييم آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

              {/* Bot trap — invisible to humans */}
              <input {...honeypotProps} />

              {/* Name */}
              <Field label="الاسم الكريم" htmlFor="review-name">
                <input
                  id="review-name"
                  type="text"
                  placeholder="الشيخ عبد الرحمن"
                  value={form.name}
                  required
                  onChange={e => update('name', e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  style={fieldStyle('name')}
                />
              </Field>

              {/* Role */}
              <Field label="المسمى الوظيفي والمؤسسة" htmlFor="review-role">
                <input
                  id="review-role"
                  type="text"
                  placeholder="مدير مجمع إقرأ"
                  value={form.role}
                  required
                  onChange={e => update('role', e.target.value)}
                  onFocus={() => setFocused('role')}
                  onBlur={() => setFocused('')}
                  style={fieldStyle('role')}
                />
              </Field>

              {/* Service select */}
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
                    appearance          : 'none',
                    WebkitAppearance    : 'none',
                    backgroundImage     : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A6756A' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat    : 'no-repeat',
                    backgroundPosition  : 'left 14px center',
                    paddingLeft         : '2.5rem',
                    cursor              : 'pointer',
                    color               : form.service ? '#1A2E28' : 'rgba(89, 128, 114, 0.65)',
                  }}
                >
                  {serviceOptions.map(o => (
                    <option
                      key={o.value}
                      value={o.value}
                      style={{ background: '#FFFFFF', color: '#1A2E28' }}
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Feedback textarea */}
              <Field label="كيف ساهمت حلولنا في تحسين سير العمل لديكم؟" htmlFor="review-feedback">
                <textarea
                  id="review-feedback"
                  rows={5}
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden font-bold rounded-xl mt-2 cursor-pointer transition-all duration-300 disabled:opacity-60"
                style={{
                  padding         : '1rem',
                  fontSize        : '0.92rem',
                  background      : 'linear-gradient(135deg, rgba(184, 134, 58, 0.90) 0%, rgba(122, 90, 46, 0.95) 100%)',
                  color           : '#FFFFFF',
                  border          : 'none',
                  letterSpacing   : '0.04em',
                }}
                onMouseEnter={e => {
                  if (loading) return
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(184, 134, 58, 0.35)'
                  e.currentTarget.style.animation = 'pulse-btn 0.7s ease-in-out infinite'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.animation = 'none'
                }}
              >
                {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>

              {error && (
                <p
                  className="text-xs text-start rounded-xl px-4 py-3"
                  style={{
                    color     : '#8A6425',
                    background: 'rgba(184, 134, 58, 0.08)',
                    border    : '1px solid rgba(184, 134, 58, 0.18)',
                  }}
                >
                  {error}
                </p>
              )}

              <p
                className="text-center text-[11px]"
                style={{ color: '#5E6E67' }}
              >
                تقييمك سيُنشر كشهادة حقيقية بعد المراجعة
              </p>

            </form>
          )}
        </div>
      </div>

      {/* Pulse keyframes injected inline */}
      <style>{`
        @keyframes pulse-btn {
          0%, 100% { box-shadow: 0 8px 32px rgba(184, 134, 58, 0.35); }
          50%       { box-shadow: 0 8px 48px rgba(184, 134, 58, 0.60); }
        }
      `}</style>
    </section>
  )
}
