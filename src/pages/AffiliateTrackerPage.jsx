import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, TrendingUp, Clock, CheckCircle2,
  DollarSign, AlertCircle, Users, Link as LinkIcon,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

/* ─── Status badge ────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    active  : { label: 'نشط',            bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.28)', color: '#6EE7B7' },
    pending : { label: 'معلق',            bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.28)', color: '#FCD34D' },
    rejected: { label: 'مرفوض',          bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.28)',  color: '#FCA5A5' },
    approved: { label: 'شريك معتمد',     bg: 'rgba(106,189,178,0.12)',border: 'rgba(106,189,178,0.28)',color: '#6ABDB2' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  )
}

/* ─── Stat card ───────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, accent = '#6ABDB2' }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <Icon size={16} style={{ color: accent }} />
      </div>
      <div>
        <p className="font-black text-2xl" style={{ color: accent, lineHeight: 1 }}>{value}</p>
        <p className="text-xs font-semibold mt-1" style={{ color: '#7A9E96' }}>{label}</p>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: '#3D5050' }}>{sub}</p>}
      </div>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────── */
export default function AffiliateTrackerPage() {
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')
  const [res,     setRes]     = useState(null)

  async function lookup(e) {
    e?.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!clean) return
    setLoading(true)
    setErr('')
    setRes(null)

    const { data, error } = await supabase.rpc('get_affiliate_stats', { p_code: clean })

    if (error || !data?.affiliate) {
      setErr('لم يُعثر على هذا الكود. تأكد من الكود وحاول مجدداً.')
      setLoading(false)
      return
    }
    setRes(data)
    setLoading(false)
  }

  const referrals = res?.referrals ?? []

  return (
    <div dir="rtl" className="min-h-screen px-5 py-20 md:py-28"
      style={{
        background: `
          radial-gradient(ellipse 70% 45% at 50% -5%, rgba(106,189,178,0.10) 0%, transparent 65%),
          #010D0D
        `,
      }}
    >
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6"
            style={{ background: 'rgba(106,189,178,0.10)', color: '#6ABDB2', border: '1px solid rgba(106,189,178,0.22)' }}>
            <TrendingUp size={13} />
            لوحة الشريك
          </div>
          <h1 className="font-black text-3xl md:text-4xl mb-3" style={{ color: '#EAE4DF' }}>
            تتبع إحالاتك
          </h1>
          <p className="text-sm" style={{ color: '#5A8A7E' }}>
            أدخل كود الإحالة الخاص بك لتعرف عدد التحويلات وعمولتك المحتسبة
          </p>
        </div>

        {/* ── Code input ── */}
        <form onSubmit={lookup}
          className="flex gap-3 mb-10 max-w-lg mx-auto"
        >
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="IHK-REF-XXXX"
            dir="ltr"
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold tracking-widest text-center"
            style={{
              background  : 'rgba(255,255,255,0.04)',
              border      : '1px solid rgba(106,189,178,0.25)',
              color       : '#EAE4DF',
              outline     : 'none',
              fontFamily  : 'monospace',
              letterSpacing: '0.12em',
            }}
            onFocus={e  => (e.target.style.borderColor = 'rgba(106,189,178,0.55)')}
            onBlur={e   => (e.target.style.borderColor = 'rgba(106,189,178,0.25)')}
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all duration-200 cursor-pointer"
            style={{ background: '#6ABDB2', color: '#010D0D', border: 'none' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#7ACCC2' }}
            onMouseLeave={e => (e.currentTarget.style.background = '#6ABDB2')}
          >
            <Search size={15} />
            {loading ? 'جاري...' : 'بحث'}
          </button>
        </form>

        {/* ── Error ── */}
        {err && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl px-5 py-4 mb-8 max-w-lg mx-auto"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}
          >
            <AlertCircle size={16} style={{ color: '#FCA5A5', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: '#FCA5A5' }}>{err}</p>
          </motion.div>
        )}

        {/* ── Results ── */}
        <AnimatePresence>
          {res && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-8"
            >

              {/* Affiliate info banner */}
              <div className="rounded-2xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
                style={{ background: 'rgba(106,189,178,0.05)', border: '1px solid rgba(106,189,178,0.16)' }}>
                <div>
                  <p className="font-black text-sm" style={{ color: '#EAE4DF' }}>{res.affiliate.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5A8A78' }}>
                    شريك منذ {new Date(res.affiliate.joined_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
                  </p>
                </div>
                <StatusBadge status={res.affiliate.status} />
              </div>

              {/* Pending notice */}
              {res.affiliate.status === 'pending' && (
                <div className="flex items-start gap-3 rounded-xl px-5 py-4"
                  style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.20)' }}>
                  <Clock size={15} style={{ color: '#FCD34D', flexShrink: 0, marginTop: 2 }} />
                  <p className="text-xs leading-relaxed" style={{ color: '#B89A3A' }}>
                    طلبك قيد المراجعة — العمولات المحتسبة أدناه ستُفعَّل فور قبول طلبك.
                  </p>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  label="مجموع الإحالات"
                  value={res.total}
                  accent="#6ABDB2"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="طلبات نشطة"
                  value={res.active}
                  sub="مدفوعة ومفعّلة"
                  accent="#10B981"
                />
                <StatCard
                  icon={Clock}
                  label="قيد المراجعة"
                  value={res.pending}
                  sub="بانتظار التفعيل"
                  accent="#F59E0B"
                />
                <StatCard
                  icon={DollarSign}
                  label="عمولة محتسبة"
                  value={`$${res.earned}`}
                  sub="20% من الطلبات النشطة"
                  accent="#D9C8A3"
                />
              </div>

              {/* Ongoing note */}
              {res.active > 0 && (
                <p className="text-xs text-center" style={{ color: '#3D5050' }}>
                  + 10% شهرياً مستمرة على كل طلب نشط — تُضاف تلقائياً كل دورة فوترة
                </p>
              )}

              {/* Referrals list */}
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-6 py-4 flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <LinkIcon size={14} style={{ color: '#6ABDB2' }} />
                  <p className="text-xs font-bold" style={{ color: '#7A9E96' }}>تفاصيل الإحالات</p>
                </div>

                {referrals.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm" style={{ color: '#3D5050' }}>
                      لا توجد إحالات بعد — شارك رابطك للبدء
                    </p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    {referrals.map((r, i) => (
                      <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: '#C4D8D4' }}>
                            {r.name}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: '#3D5050' }}>
                            {r.tier} · {new Date(r.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
