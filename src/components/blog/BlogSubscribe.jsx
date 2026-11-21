import { useState } from 'react'
import { Bell, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { useFormGuard } from '../../hooks/useFormGuard'

/* اشتراك بريدي في المدونة. dark: للقسم الداكن، وإلا بطاقة فاتحة. */
export default function BlogSubscribe({ dark = false, compact = false }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const { honeypotProps, guardSubmit, markSubmitted } = useFormGuard('blog-subscribe')

  async function submit(e) {
    e.preventDefault()
    if (!email.trim()) return
    const gate = guardSubmit()
    if (!gate.ok) { setDone(true); return }   /* فخّ الروبوت أو مهلة: نجاحٌ ظاهر بلا كتابة */
    setLoading(true)
    try {
      const p = new URLSearchParams(window.location.search)
      await supabase.from('lead_magnet_subscribers').insert([{
        email      : email.trim().toLowerCase(),
        source_page: '/blog',
        variant    : 'blog',
        utm_source  : p.get('utm_source')   || null,
        utm_medium  : p.get('utm_medium')   || null,
        utm_campaign: p.get('utm_campaign') || null,
        referrer    : document.referrer     || null,
      }])
      markSubmitted()
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  const fg = dark ? '#F8F5EC' : '#1A2E28'
  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-2xl px-5 py-4"
        style={{ background: dark ? 'rgba(255,255,255,.06)' : '#F1ECDF', color: fg }}>
        <CheckCircle size={20} style={{ color: dark ? '#E0B562' : '#1F6F52' }} />
        <span className="text-sm">تم. ستصلك المقالات القادمة على بريدك.</span>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={`flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-2 w-full`}>
      <input {...honeypotProps} />
      <input
        type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="بريدك الإلكتروني" aria-label="بريدك الإلكتروني"
        className="flex-1 min-w-0 rounded-xl px-4 py-3 text-sm outline-none transition-shadow"
        style={{
          direction: 'ltr', textAlign: 'right', fontFamily: 'inherit',
          background: dark ? 'rgba(255,255,255,.07)' : '#FDFBF7',
          color: fg,
          boxShadow: dark ? 'inset 0 0 0 1px rgba(224,181,98,.3)' : 'inset 0 0 0 1px var(--line-warm)',
        }}
      />
      <button type="submit" disabled={loading}
        className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-60 shrink-0"
        style={dark ? { background: '#E0B562', color: '#0B3B33' } : { background: '#0B3B33', color: '#F8F5EC' }}>
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
        {loading ? 'جارٍ الإرسال' : 'اشترك مجاناً'}
      </button>
    </form>
  )
}
