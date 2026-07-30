import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { supabase } from '../config/supabaseClient'

/* ─── Tab definitions ─────────────────────────────────────────── */
const tabs = [
  { id: 'demo_requests',  label: 'طلبات التجربة',     icon: '🎯' },
  { id: 'tenants',        label: 'طلبات التفعيل',     icon: '🏛' },
  { id: 'testimonials',   label: 'تقييمات العملاء',   icon: '⭐' },
  { id: 'subscribers',    label: 'المشتركون بالبريد', icon: '📧' },
  { id: 'affiliates',     label: 'طلبات الشراكة',     icon: '🤝' },
  { id: 'interfaces',     label: 'واجهات النظام',     icon: '🖥' },
]

/* ─── Shared helpers ──────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div
        className="w-10 h-10 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(217,172,163,0.35)', borderTopColor: '#D9ACA3' }}
      />
      <p className="text-sm" style={{ color: '#96BCBE' }}>جاري جلب البيانات...</p>
    </div>
  )
}

function ErrorBanner({ msg }) {
  return (
    <div
      className="rounded-xl px-5 py-4 text-sm text-right"
      style={{
        background: 'rgba(217,172,163,0.08)',
        border    : '1px solid rgba(217,172,163,0.22)',
        color     : '#D9ACA3',
      }}
    >
      ⚠️ {msg}
    </div>
  )
}

function EmptyState({ msg }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border    : '1px dashed rgba(217,172,163,0.12)',
      }}
    >
      <p className="text-sm" style={{ color: '#6FA5A8' }}>{msg}</p>
    </div>
  )
}

/* ─── Stats row ───────────────────────────────────────────────── */
function StatsRow({ testimonials, subscriberCount, convertedCount, affiliateCount }) {
  const pending = testimonials.filter(t => t.status === 'pending').length
  const pendingAff = affiliateCount ?? 0
  const stats = [
    { label: 'تقييمات بانتظار النشر', value: pending,                accent: '#D9ACA3' },
    { label: 'مشتركو البريد',          value: subscriberCount ?? '—', accent: 'var(--cat-4)' },
    { label: 'تحوّلوا إلى طلب',        value: convertedCount ?? '—',  accent: '#48D6CD' },
    { label: 'طلبات شراكة معلّقة',     value: pendingAff,             accent: 'var(--cat-1)' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map(s => (
        <div
          key={s.label}
          className="rounded-2xl px-5 py-5 text-right"
          style={{
            background          : 'rgba(255,255,255,0.03)',
            border              : '1px solid rgba(217,172,163,0.10)',
            backdropFilter      : 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <p className="text-2xl font-black mb-1" style={{ color: s.accent }}>{s.value}</p>
          <p className="text-xs" style={{ color: '#96BCBE' }}>{s.label}</p>
        </div>
      ))}
    </div>
  )
}

/* ─── Subscribers Tab ─────────────────────────────────────────── */
const VARIANT_LABELS = {
  pdf     : 'دليل PDF',
  insights: 'تقرير المعايير',
  blog    : 'نشرة المدونة',
  ihkaam  : 'متابعة إحكام',
}
const VARIANT_COLORS = {
  pdf     : '#48D6CD',
  insights: 'var(--cat-4)',
  blog    : '#D9C8A3',
  ihkaam  : 'var(--cat-1)',
}

function SubscribersTab() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    supabase
      .from('lead_magnet_subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message)
        else setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner />
  if (error)   return <ErrorBanner msg={error} />

  const convertedCount = rows.filter(r => r.converted_at).length

  const filtered =
    filter === 'all'       ? rows
    : filter === 'converted' ? rows.filter(r => r.converted_at)
    : rows.filter(r => r.variant === filter)

  return (
    <div className="flex flex-col gap-5">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'converted', 'pdf', 'insights', 'blog', 'ihkaam'].map(v => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: filter === v ? 'rgba(72,214,205,0.20)' : 'rgba(255,255,255,0.04)',
              border    : `1px solid ${filter === v ? 'rgba(72,214,205,0.40)' : 'rgba(255,255,255,0.08)'}`,
              color     : filter === v ? '#48D6CD' : '#96BCBE',
            }}
          >
            {v === 'all'       ? `الكل (${rows.length})`
             : v === 'converted' ? `محوّل (${convertedCount})`
             : (VARIANT_LABELS[v] ?? v)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState msg="لا يوجد مشتركون بعد — ستظهر هنا فور وصول أول اشتراك." />
      ) : (
        <>
          {/* Header */}
          <div
            className="hidden md:grid gap-3 px-5 py-3 rounded-xl text-xs font-semibold"
            style={{
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.9fr',
              color              : '#A6756A',
              background         : 'rgba(217,172,163,0.05)',
              letterSpacing      : '0.06em',
            }}
          >
            <span>البريد الإلكتروني</span>
            <span>المصدر</span>
            <span>النوع</span>
            <span>UTM Source</span>
            <span>التاريخ</span>
            <span>الحالة</span>
          </div>

          {filtered.map((r, i) => (
            <div
              key={r.id ?? i}
              className="grid gap-3 px-5 py-4 rounded-2xl text-sm"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.9fr',
                background         : 'color-mix(in srgb, var(--cat-4) 7.000000000000001%, transparent)',
                border             : '1px solid color-mix(in srgb, var(--cat-4) 14.000000000000002%, transparent)',
                alignItems         : 'center',
              }}
            >
              <span className="font-semibold truncate" style={{ color: '#EAE4DF', direction: 'ltr', textAlign: 'right' }}>
                {r.email}
              </span>
              <span className="text-xs truncate" style={{ color: '#96BCBE' }}>
                {r.source_page || '—'}
              </span>
              <span
                className="text-[11px] px-2.5 py-1 rounded-full w-fit font-bold"
                style={{
                  background: (VARIANT_COLORS[r.variant] ?? '#48D6CD') + '18',
                  color     : VARIANT_COLORS[r.variant] ?? '#48D6CD',
                }}
              >
                {VARIANT_LABELS[r.variant] ?? r.variant ?? '—'}
              </span>
              <span className="text-xs" style={{ color: '#6FA5A8' }}>
                {r.utm_source || '—'}
              </span>
              <span className="text-xs" style={{ color: '#6FA5A8' }}>
                {formatDate(r.created_at)}
              </span>
              {r.converted_at ? (
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full w-fit font-bold"
                  style={{ background: 'rgba(72,214,205,0.15)', color: '#48D6CD' }}
                  title={`تحوّل إلى طلب اشتراك — ${formatDate(r.converted_at)}`}
                >
                  محوّل
                </span>
              ) : (
                <span className="text-xs" style={{ color: '#6FA5A8' }}>—</span>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

/* ─── Demo Requests Tab ──────────────────────────────────────── */
const DEMO_STATUS_LABEL = { pending: 'معلّق', approved: 'تمت الموافقة', rejected: 'مرفوض' }
const DEMO_STATUS_COLOR = { pending: '#D9C8A3', approved: '#48D6CD',   rejected: '#D9ACA3' }

function DemoRequestsTab() {
  const [rows,     setRows]    = useState([])
  const [loading,  setLoading] = useState(true)
  const [error,    setError]   = useState('')
  const [updating, setUpdating]= useState(null)
  const [filter,   setFilter]  = useState('pending')
  const [waModal,  setWaModal] = useState(null) // { row, msg }

  useEffect(() => {
    supabase
      .from('demo_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message)
        else   setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  async function approve(row) {
    setUpdating(row.id)
    const { error: e } = await supabase
      .from('demo_requests').update({ status: 'approved' }).eq('id', row.id)
    if (!e) {
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: 'approved' } : r))
      const msg = `السلام عليكم ${row.name} من معهد ${row.institute} 🌿\n\nشكراً لاهتمامك بمنصة إحكام.\nيسعدنا دعوتك لتجربة المنصة — إليك رابط الدخول:\n[أضف الرابط هنا]\n\nنحن بانتظار ملاحظاتك، لا تتردد بالتواصل.`
      setWaModal({ row, msg })
    }
    setUpdating(null)
  }

  async function reject(id) {
    setUpdating(id)
    const { error: e } = await supabase
      .from('demo_requests').update({ status: 'rejected' }).eq('id', id)
    if (!e) setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    setUpdating(null)
  }

  if (loading) return <Spinner />
  if (error)   return <ErrorBanner msg={error} />

  const counts = {
    all     : rows.length,
    pending : rows.filter(r => (r.status ?? 'pending') === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    rejected: rows.filter(r => r.status === 'rejected').length,
  }
  const filtered = filter === 'all'
    ? rows
    : rows.filter(r => (r.status ?? 'pending') === filter)

  return (
    <div className="flex flex-col gap-5">

      {/* ── WhatsApp compose modal ── */}
      {waModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)' }}
          onClick={() => setWaModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: '#09201E', border: '1px solid rgba(37,211,102,0.28)' }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#25D366' }}>
                رسالة واتساب
              </p>
              <p className="font-black text-sm" style={{ color: '#EAE4DF' }}>
                {waModal.row.name}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#6FA5A8', direction: 'ltr' }}>
                {waModal.row.phone}
              </p>
            </div>

            <textarea
              value={waModal.msg}
              onChange={e => setWaModal(p => ({ ...p, msg: e.target.value }))}
              rows={8}
              dir="rtl"
              className="w-full rounded-xl p-3 text-sm resize-none outline-none"
              style={{
                background : 'rgba(255,255,255,0.04)',
                border     : '1px solid rgba(37,211,102,0.22)',
                color      : '#EAE4DF',
                fontFamily : 'inherit',
                lineHeight : 1.75,
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setWaModal(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#96BCBE' }}
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  const num = waModal.row.phone.replace(/\D/g, '')
                  window.open(`https://wa.me/${num}?text=${encodeURIComponent(waModal.msg)}`, '_blank', 'noopener,noreferrer')
                  setWaModal(null)
                }}
                className="flex-[2] py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff' }}
              >
                ✓ فتح واتساب وإرسال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الطلبات',    value: counts.all,       accent: 'var(--cat-4)' },
          { label: 'بانتظار المراجعة',  value: counts.pending,   accent: '#D9C8A3' },
          { label: 'تمت الموافقة',      value: counts.approved,  accent: '#48D6CD' },
          { label: 'مرفوضة',            value: counts.rejected,  accent: '#D9ACA3' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 text-right"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-black text-xl mb-0.5" style={{ color: s.accent }}>{s.value}</p>
            <p className="text-[11px]" style={{ color: '#6FA5A8' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter ── */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all',      label: 'الكل'   },
          { id: 'pending',  label: 'معلّق'  },
          { id: 'approved', label: 'موافَق' },
          { id: 'rejected', label: 'مرفوض' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: filter === f.id ? 'color-mix(in srgb, var(--cat-4) 20%, transparent)' : 'rgba(255,255,255,0.04)',
              border    : `1px solid ${filter === f.id ? 'color-mix(in srgb, var(--cat-4) 40%, transparent)' : 'rgba(255,255,255,0.08)'}`,
              color     : filter === f.id ? 'var(--cat-4)' : '#96BCBE',
            }}>
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      {/* ── Cards ── */}
      {filtered.length === 0 ? (
        <EmptyState msg="لا يوجد طلبات في هذه الفئة." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map(r => {
            const status = r.status ?? 'pending'
            const color  = DEMO_STATUS_COLOR[status] ?? '#D9C8A3'
            return (
              <div key={r.id} className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'color-mix(in srgb, var(--cat-4) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--cat-4) 14.000000000000002%, transparent)' }}>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-sm" style={{ color: '#EAE4DF' }}>{r.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#96BCBE' }}>{r.institute}</p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: '#6FA5A8', direction: 'ltr' }}>{r.phone}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: `color-mix(in srgb, ${color} 9%, transparent)`, color }}>
                    {DEMO_STATUS_LABEL[status]}
                  </span>
                </div>

                {r.notes && (
                  <p className="text-xs leading-relaxed" style={{ color: '#509492' }}>{r.notes}</p>
                )}

                <p className="text-[11px]" style={{ color: '#6FA5A8' }}>{formatDate(r.created_at)}</p>

                {status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(r)}
                      disabled={updating === r.id}
                      className="flex-[2] py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                      style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.30)', color: '#25D366' }}>
                      {updating === r.id ? '...' : '✓ موافقة وإرسال واتساب'}
                    </button>
                    <button
                      onClick={() => reject(r.id)}
                      disabled={updating === r.id}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                      style={{ background: 'rgba(217,172,163,0.10)', border: '1px solid rgba(217,172,163,0.22)', color: '#D9ACA3' }}>
                      {updating === r.id ? '...' : '✕ رفض'}
                    </button>
                  </div>
                )}

                {status === 'approved' && (
                  <button
                    onClick={() => {
                      const msg = `السلام عليكم ${r.name} من معهد ${r.institute} 🌿\n\nشكراً لاهتمامك بمنصة إحكام.\nيسعدنا دعوتك لتجربة المنصة — إليك رابط الدخول:\n[أضف الرابط هنا]\n\nنحن بانتظار ملاحظاتك، لا تتردد بالتواصل.`
                      setWaModal({ row: r, msg })
                    }}
                    className="py-2 rounded-xl text-xs font-bold cursor-pointer"
                    style={{ background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.18)', color: '#25D366' }}>
                    إعادة إرسال واتساب
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Tenants Tab ────────────────────────────────────────────── */
const TENANT_STATUS = { pending: 'معلّق', active: 'نشط', rejected: 'مرفوض' }
const TENANT_COLOR  = { pending: '#D9C8A3', active: '#48D6CD', rejected: '#D9ACA3' }

function TenantsTab() {
  const [rows,     setRows]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    supabase
      .from('tenant_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message)
        else setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  async function updateStatus(id, status) {
    setUpdating(id)
    const { error: e } = await supabase.from('tenant_requests').update({ status }).eq('id', id)
    if (!e) setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setUpdating(null)
  }

  if (loading) return <Spinner />
  if (error)   return <ErrorBanner msg={error} />
  if (!rows.length) return <EmptyState msg="لا يوجد طلبات تفعيل بعد." />

  const pending = rows.filter(r => r.status === 'pending').length
  const active  = rows.filter(r => r.status === 'active').length
  const revenue = rows.filter(r => r.status === 'active').reduce((s, r) => s + (r.total_amount || 0), 0)

  return (
    <div className="flex flex-col gap-6">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'بانتظار المراجعة', value: pending,              accent: '#D9C8A3' },
          { label: 'مراكز نشطة',       value: active,               accent: '#48D6CD' },
          { label: 'إجمالي الإيرادات', value: `$${revenue.toFixed(2)}`, accent: '#D9ACA3' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 text-right"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-black text-xl mb-0.5" style={{ color: s.accent }}>{s.value}</p>
            <p className="text-[11px]" style={{ color: '#6FA5A8' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {rows.map(r => (
          <div key={r.id} className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'rgba(72,214,205,0.04)', border: '1px solid rgba(72,214,205,0.14)' }}>

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-sm" style={{ color: '#EAE4DF' }}>{r.institute_name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#96BCBE' }}>{r.supervisor_name}</p>
                {r.email && (
                  <p className="text-xs" style={{ color: '#6FA5A8', direction: 'ltr' }}>{r.email}</p>
                )}
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: (TENANT_COLOR[r.status] ?? '#D9C8A3') + '18', color: TENANT_COLOR[r.status] ?? '#D9C8A3' }}>
                {TENANT_STATUS[r.status] ?? r.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {r.phone && (
                <span className="text-xs font-mono px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#96BCBE', direction: 'ltr' }}>
                  {r.phone}
                </span>
              )}
              {r.subscription_tier && (
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(72,214,205,0.08)', color: '#48D6CD' }}>
                  {r.subscription_tier}
                </span>
              )}
              {r.billing_cycle && (
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--cat-4)' }}>
                  {r.billing_cycle}
                </span>
              )}
              {r.referral_code && (
                <span className="text-xs font-mono px-2.5 py-1 rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--cat-1) 10%, transparent)', color: 'var(--cat-1)' }}>
                  via {r.referral_code}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-black" style={{ color: '#D9C8A3' }}>
                ${(r.total_amount ?? 0).toFixed(2)}
              </p>
              <p className="text-[11px]" style={{ color: '#6FA5A8' }}>
                {formatDate(r.created_at)}
              </p>
            </div>

            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(r.id, 'active')} disabled={updating === r.id}
                  className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                  style={{ background: 'rgba(72,214,205,0.15)', border: '1px solid rgba(72,214,205,0.30)', color: '#48D6CD', cursor: 'pointer' }}>
                  {updating === r.id ? '...' : '✓ تفعيل'}
                </button>
                <button onClick={() => updateStatus(r.id, 'rejected')} disabled={updating === r.id}
                  className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                  style={{ background: 'rgba(217,172,163,0.10)', border: '1px solid rgba(217,172,163,0.22)', color: '#D9ACA3', cursor: 'pointer' }}>
                  {updating === r.id ? '...' : '✕ رفض'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Affiliates Tab ──────────────────────────────────────────── */
const AFF_STATUS = { pending: 'معلّق', approved: 'مقبول', rejected: 'مرفوض' }
const AFF_COLOR  = { pending: '#D9C8A3', approved: '#48D6CD', rejected: '#D9ACA3' }

function AffMiniStat({ label, value, accent }) {
  return (
    <div className="rounded-xl px-4 py-3 text-right"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="font-black text-xl mb-0.5" style={{ color: accent }}>{value}</p>
      <p className="text-[11px]" style={{ color: '#6FA5A8' }}>{label}</p>
    </div>
  )
}

function AffiliatesTab() {
  const [rows,      setRows]     = useState([])
  const [tenantMap, setTenantMap] = useState({}) // { referral_code: [tenant, ...] }
  const [loading,   setLoading]  = useState(true)
  const [error,     setError]    = useState('')
  const [updating,  setUpdating] = useState(null)
  const [expanded,  setExpanded] = useState(null)

  useEffect(() => {
    async function load() {
      const [
        { data: affs,    error: e1 },
        { data: tenants, error: e2 },
      ] = await Promise.all([
        supabase.from('affiliate_applications').select('*').order('created_at', { ascending: false }),
        supabase
          .from('tenant_requests')
          .select('institute_name,status,total_amount,subscription_tier,billing_cycle,created_at,referral_code')
          .not('referral_code', 'is', null),
      ])
      if (e1) { setError(e1.message); setLoading(false); return }
      if (e2) { setError(e2.message); setLoading(false); return }
      /* group tenants by referral_code */
      const map = {}
      ;(tenants ?? []).forEach(t => {
        if (!map[t.referral_code]) map[t.referral_code] = []
        map[t.referral_code].push(t)
      })
      setRows(affs ?? [])
      setTenantMap(map)
      setLoading(false)
    }
    load()
  }, [])

  async function updateStatus(id, status) {
    setUpdating(id)
    const { error: e } = await supabase.from('affiliate_applications').update({ status }).eq('id', id)
    if (!e) setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setUpdating(null)
  }

  if (loading) return <Spinner />
  if (error)   return <ErrorBanner msg={error} />
  if (!rows.length) return <EmptyState msg="لا يوجد طلبات شراكة بعد." />

  /* ── Summary ── */
  const approvedCount  = rows.filter(r => r.status === 'approved').length
  const allTenants     = Object.values(tenantMap).flat()
  const activeTenants  = allTenants.filter(t => t.status === 'active')
  const totalCommission = activeTenants.reduce((s, t) => s + (t.total_amount || 0) * 0.20, 0)

  return (
    <div className="flex flex-col gap-7">

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AffMiniStat label="إجمالي الشركاء"    value={rows.length}             accent="var(--cat-1)" />
        <AffMiniStat label="شركاء مقبولون"     value={approvedCount}           accent="#48D6CD" />
        <AffMiniStat label="تحويلات نشطة"      value={activeTenants.length}    accent="#16B3AE" />
        <AffMiniStat label="عمولات محتسبة"     value={`$${totalCommission.toFixed(2)}`} accent="#D9C8A3" />
      </div>

      {/* ── Affiliate cards ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {rows.map(r => {
          const tenants = tenantMap[r.referral_code] ?? []
          const active  = tenants.filter(t => t.status === 'active')
          const earned  = active.reduce((s, t) => s + (t.total_amount || 0) * 0.20, 0)
          const isOpen  = expanded === r.id

          return (
            <div
              key={r.id}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: 'color-mix(in srgb, var(--cat-1) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--cat-1) 16%, transparent)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-sm" style={{ color: '#EAE4DF' }}>{r.full_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#96BCBE', direction: 'ltr' }}>{r.email}</p>
                  {r.phone && <p className="text-xs" style={{ color: '#6FA5A8', direction: 'ltr' }}>{r.phone}</p>}
                </div>
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: (AFF_COLOR[r.status] ?? '#D9C8A3') + '18', color: AFF_COLOR[r.status] ?? '#D9C8A3' }}
                >
                  {AFF_STATUS[r.status] ?? r.status}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--cat-1)' }}>
                  {r.relation || '—'}
                </span>
                {r.referral_code && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full" style={{ background: 'rgba(72,214,205,0.08)', color: '#48D6CD' }}>
                    {r.referral_code}
                  </span>
                )}
              </div>

              {/* Conversion stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'إحالات',  value: tenants.length, color: 'var(--cat-1)' },
                  { label: 'نشطة',    value: active.length,  color: '#16B3AE' },
                  { label: 'عمولة',   value: `$${earned.toFixed(0)}`, color: '#D9C8A3' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl px-3 py-2.5 text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="font-black text-base leading-none mb-1" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: '#374D56' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Expand referrals */}
              {tenants.length > 0 && (
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="text-xs font-bold py-2 rounded-xl w-full transition-colors"
                  style={{
                    background: isOpen ? 'rgba(72,214,205,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isOpen ? 'rgba(72,214,205,0.20)' : 'rgba(255,255,255,0.07)'}`,
                    color: isOpen ? '#48D6CD' : '#96BCBE',
                    cursor: 'pointer',
                  }}
                >
                  {isOpen ? '▲ إخفاء' : `▼ عرض ${tenants.length} إحالة`}
                </button>
              )}

              {/* Referrals list */}
              {isOpen && (
                <div className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  {tenants.map((t, i) => (
                    <div key={i}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                      style={{ borderBottom: i < tenants.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#C4D8D4' }}>
                          {t.institute_name}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#374D56' }}>
                          {t.subscription_tier} · ${(t.total_amount ?? 0).toFixed(2)} · {formatDate(t.created_at).split('،')[0]}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: t.status === 'active' ? 'rgba(22,179,174,0.12)' : 'rgba(251,191,36,0.10)',
                          border    : `1px solid ${t.status === 'active' ? 'rgba(22,179,174,0.28)' : 'rgba(251,191,36,0.25)'}`,
                          color     : t.status === 'active' ? '#6EE7E3' : '#FCD34D',
                        }}
                      >
                        {t.status === 'active' ? 'نشط' : 'معلق'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {r.note && (
                <p className="text-xs leading-relaxed" style={{ color: '#96BCBE' }}>{r.note}</p>
              )}

              {/* Approve / Reject */}
              {r.status === 'pending' && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => updateStatus(r.id, 'approved')}
                    disabled={updating === r.id}
                    className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                    style={{ background: 'rgba(72,214,205,0.15)', border: '1px solid rgba(72,214,205,0.30)', color: '#48D6CD', cursor: 'pointer' }}
                  >
                    {updating === r.id ? '...' : '✓ قبول'}
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, 'rejected')}
                    disabled={updating === r.id}
                    className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                    style={{ background: 'rgba(217,172,163,0.10)', border: '1px solid rgba(217,172,163,0.22)', color: '#D9ACA3', cursor: 'pointer' }}
                  >
                    {updating === r.id ? '...' : '✕ رفض'}
                  </button>
                </div>
              )}

              <p className="text-[11px] mt-auto" style={{ color: '#6FA5A8' }}>{formatDate(r.created_at)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Testimonials Tab ────────────────────────────────────────── */
function TestimonialsTab({ data, loading, error, onApprove, approving }) {
  if (loading) return <Spinner />
  if (error)   return <ErrorBanner msg={error} />
  if (!data.length) return <EmptyState msg="لا توجد تقييمات بعد — ستظهر هنا فور وصول أول تقييم من العملاء." />

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {data.map((t, i) => {
        const isPending   = t.status !== 'approved'
        const isApproving = approving === t.id

        return (
          <div
            key={t.id ?? i}
            className="flex flex-col gap-4 rounded-2xl p-6"
            style={{
              background          : isPending ? 'rgba(217,172,163,0.06)' : 'rgba(17,49,44,0.14)',
              border              : isPending ? '1px solid rgba(217,172,163,0.16)' : '1px solid rgba(26,148,155,0.20)',
              backdropFilter      : 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-black text-sm" style={{ color: '#EAE4DF' }}>
                  {t.client_name || '—'}
                </span>
                <span className="text-xs" style={{ color: '#96BCBE' }}>
                  {t.client_role || '—'}
                </span>
              </div>

              {isPending ? (
                <button
                  onClick={() => onApprove(t.id)}
                  disabled={isApproving}
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-250 disabled:opacity-60"
                  style={{
                    background: isApproving ? 'rgba(217,172,163,0.10)' : 'rgba(217,172,163,0.15)',
                    border    : '1px solid rgba(217,172,163,0.30)',
                    color     : '#D9ACA3',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!isApproving) e.currentTarget.style.background = 'rgba(217,172,163,0.28)' }}
                  onMouseLeave={e => { if (!isApproving) e.currentTarget.style.background = 'rgba(217,172,163,0.15)' }}
                >
                  {isApproving ? '...' : '✓ موافقة ونشر'}
                </button>
              ) : (
                <span
                  className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(26,148,155,0.18)',
                    border    : '1px solid rgba(26,148,155,0.28)',
                    color     : '#48D6CD',
                  }}
                >
                  ✓ تم النشر
                </span>
              )}
            </div>

            <span
              className="self-end text-[10px] font-semibold px-3 py-1 rounded-full w-fit"
              style={{ background: 'rgba(166,117,106,0.12)', color: '#A6756A' }}
            >
              {t.service_type || '—'}
            </span>

            <p className="text-sm leading-[1.9]" style={{ color: '#B0CBC6' }}>
              {t.content || '—'}
            </p>

            <p className="text-[11px] mt-auto" style={{ color: '#6FA5A8' }}>
              {formatDate(t.created_at)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Interfaces Tab ─────────────────────────────────────────── */
const pInputBase = {
  background          : 'rgba(255,255,255,0.04)',
  borderWidth         : '1px',
  borderStyle         : 'solid',
  borderColor         : 'rgba(217,172,163,0.18)',
  borderRadius        : '0.875rem',
  color               : '#EAE4DF',
  fontSize            : '0.875rem',
  padding             : '0.875rem 1.125rem',
  width               : '100%',
  outline             : 'none',
  transition          : 'border-color 350ms ease, box-shadow 350ms ease',
  direction           : 'rtl',
  fontFamily          : 'inherit',
}
const pInputFocus = {
  borderColor: 'rgba(217,172,163,0.55)',
  boxShadow  : '0 0 0 3px rgba(217,172,163,0.08)',
}

/* ── File input helper (used by InterfacesTab) ── */
function FileInput({ label, icon, name, onFile, fileName }) {
  return (
    <PField label={label}>
      <label
        className="flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 transition-all duration-300"
        style={{
          background  : 'rgba(255,255,255,0.03)',
          border      : `1px solid ${fileName ? 'rgba(72,214,205,0.40)' : 'rgba(217,172,163,0.18)'}`,
          borderRadius: '0.875rem',
        }}
      >
        <span style={{ color: fileName ? '#48D6CD' : '#D9ACA3', fontSize: '1.05rem' }}>{icon}</span>
        <span className="text-sm flex-1 text-right truncate"
          style={{ color: fileName ? '#48D6CD' : 'rgba(127, 163, 166,0.65)' }}>
          {fileName || `اختر صورة ${name} (JPG, PNG, WEBP)`}
        </span>
        <input type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      </label>
    </PField>
  )
}

function PField({ label, children }) {
  return (
    <div className="flex flex-col gap-2 text-right">
      <label className="text-xs font-semibold" style={{ color: '#A6756A', letterSpacing: '0.07em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function InterfacesTab() {
  const [form,           setForm]          = useState({ title: '', description: '', order_index: '0' })
  const [desktopFile,    setDesktopFile]   = useState(null)
  const [desktopName,    setDesktopName]   = useState('')
  const [mobileFile,     setMobileFile]    = useState(null)
  const [mobileName,     setMobileName]    = useState('')
  const [focused,        setFocused]       = useState('')
  const [saving,         setSaving]        = useState(false)
  const [formError,      setFormError]     = useState('')
  const [formOk,         setFormOk]        = useState(false)

  /* Edit mode */
  const [editingId,      setEditingId]     = useState(null)
  const [editingOriginal,setEditingOriginal]= useState(null)

  const [interfaces,   setInterfaces]  = useState([])
  const [loadingList,  setLoadingList]  = useState(true)
  const [listError,    setListError]    = useState('')
  const [deletingId,   setDeletingId]   = useState(null)

  useEffect(() => { loadInterfaces() }, [])

  async function loadInterfaces() {
    setLoadingList(true); setListError('')
    try {
      const { data, error } = await supabase
        .from('ihkaam_interfaces')
        .select('*')
        .order('order_index', { ascending: true })
      if (error) throw error
      setInterfaces(data ?? [])
    } catch (err) {
      setListError(err?.message || 'فشل جلب الواجهات.')
    } finally {
      setLoadingList(false)
    }
  }

  const fs     = (key) => ({ ...pInputBase, ...(focused === key ? pInputFocus : {}) })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  /* رفع ملف إلى bucket showcase_images */
  async function uploadFile(file, pathPrefix) {
    const ext  = file.name.split('.').pop()
    const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('showcase_images')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (upErr) {
      console.error(`[InterfacesTab] Storage error → showcase_images/${path}: ${upErr.message}`, upErr)
      throw upErr
    }
    const { data: { publicUrl } } = supabase.storage.from('showcase_images').getPublicUrl(path)
    return publicUrl
  }

  const storagePath = (url) =>
    url?.split('/storage/v1/object/public/showcase_images/')?.[1] ?? null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(''); setFormOk(false)
    if (!form.title.trim()) return setFormError('يرجى إدخال عنوان الواجهة.')
    if (!desktopFile)       return setFormError('يرجى اختيار صورة سطح المكتب على الأقل.')

    setSaving(true)
    try {
      const desktopUrl = await uploadFile(desktopFile, 'desktop')
      const mobileUrl  = mobileFile ? await uploadFile(mobileFile, 'mobile') : null

      const { error: dbErr } = await supabase
        .from('ihkaam_interfaces')
        .insert([{
          title        : form.title.trim(),
          description  : form.description.trim(),
          desktop_image: desktopUrl,
          mobile_image : mobileUrl,
          order_index  : parseInt(form.order_index, 10) || 0,
        }])
      if (dbErr) throw dbErr

      setFormOk(true)
      setTimeout(() => setFormOk(false), 5000)
      resetForm()
      await loadInterfaces()
    } catch (err) {
      setFormError(err?.message || 'حدث خطأ أثناء رفع الواجهة.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (iface) => {
    setDeletingId(iface.id)
    try {
      const { error: dbErr } = await supabase
        .from('ihkaam_interfaces').delete().eq('id', iface.id)
      if (dbErr) throw dbErr

      const paths = [storagePath(iface.desktop_image), storagePath(iface.mobile_image)].filter(Boolean)
      if (paths.length) await supabase.storage.from('showcase_images').remove(paths)

      setInterfaces(prev => prev.filter(i => i.id !== iface.id))
    } catch (err) {
      console.error('[InterfacesTab] Delete error:', err?.message)
    } finally {
      setDeletingId(null)
    }
  }

  function resetForm() {
    setForm({ title: '', description: '', order_index: '0' })
    setDesktopFile(null); setDesktopName('')
    setMobileFile(null);  setMobileName('')
    setFormError('');     setFormOk(false)
    setEditingId(null);   setEditingOriginal(null)
  }

  function startEdit(iface) {
    setForm({
      title      : iface.title       ?? '',
      description: iface.description ?? '',
      order_index: String(iface.order_index ?? 0),
    })
    setDesktopFile(null); setDesktopName(iface.desktop_image ? '(صورة حالية محفوظة)' : '')
    setMobileFile(null);  setMobileName(iface.mobile_image  ? '(صورة حالية محفوظة)' : '')
    setFormError('');     setFormOk(false)
    setEditingId(iface.id)
    setEditingOriginal(iface)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpdateInterface = async (e) => {
    e.preventDefault()
    setFormError(''); setFormOk(false)
    if (!form.title.trim()) return setFormError('يرجى إدخال عنوان الواجهة.')

    setSaving(true)
    try {
      /* Upload new images only if the user selected new files */
      const desktopUrl = desktopFile
        ? await uploadFile(desktopFile, 'desktop')
        : editingOriginal.desktop_image

      const mobileUrl = mobileFile
        ? await uploadFile(mobileFile, 'mobile')
        : editingOriginal.mobile_image ?? null

      const { error: dbErr } = await supabase
        .from('ihkaam_interfaces')
        .update({
          title        : form.title.trim(),
          description  : form.description.trim(),
          desktop_image: desktopUrl,
          mobile_image : mobileUrl,
          order_index  : parseInt(form.order_index, 10) || 0,
        })
        .eq('id', editingId)
      if (dbErr) throw dbErr

      setFormOk(true)
      setTimeout(() => setFormOk(false), 4000)
      resetForm()
      await loadInterfaces()
    } catch (err) {
      setFormError(err?.message || 'حدث خطأ أثناء تحديث الواجهة.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">

      {/* ── Add / Edit form ── */}
      <div className="rounded-2xl p-7"
        style={{
          background          : editingId ? 'rgba(72,214,205,0.05)' : 'rgba(217,172,163,0.05)',
          border              : editingId ? '1px solid rgba(72,214,205,0.22)' : '1px solid rgba(217,172,163,0.14)',
          backdropFilter      : 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black text-base text-right" style={{ color: '#EAE4DF' }}>
            {editingId ? 'تعديل الواجهة' : 'إضافة واجهة جديدة'}
          </h4>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-250"
              style={{ background: 'rgba(72,214,205,0.10)', border: '1px solid rgba(72,214,205,0.25)', color: '#48D6CD' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(72,214,205,0.20)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(72,214,205,0.10)'}
            >
              ✕ إلغاء التعديل
            </button>
          )}
        </div>

        <form onSubmit={editingId ? handleUpdateInterface : handleSubmit} className="flex flex-col gap-5" noValidate>

          {/* Title */}
          <PField label="عنوان الواجهة / القسم">
            <input type="text" placeholder="مثال: لوحة الإدارة — Dashboard"
              value={form.title} required
              onChange={e => update('title', e.target.value)}
              onFocus={() => setFocused('title')} onBlur={() => setFocused('')}
              style={fs('title')} />
          </PField>

          {/* Description */}
          <PField label="وصف مختصر (يظهر أسفل اسم التبويب)">
            <textarea rows={2} placeholder="وصف ما تعرضه هذه الواجهة للمستخدم..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
              onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
              style={{ ...fs('desc'), resize: 'vertical', lineHeight: '1.85', minHeight: '72px' }} />
          </PField>

          {/* Order */}
          <PField label="ترتيب العرض (رقم — الأصغر يظهر أولاً)">
            <input type="number" min="0" placeholder="0"
              value={form.order_index}
              onChange={e => update('order_index', e.target.value)}
              onFocus={() => setFocused('order')} onBlur={() => setFocused('')}
              style={{ ...fs('order'), width: '120px' }} />
          </PField>

          {/* Desktop image */}
          <FileInput label="صورة سطح المكتب (Desktop — مطلوبة)"
            icon="🖥" name="Desktop"
            fileName={desktopName}
            onFile={f => { setDesktopFile(f); setDesktopName(f.name) }} />

          {/* Mobile image */}
          <FileInput label="صورة الهاتف (Mobile — اختياري)"
            icon="📱" name="Mobile"
            fileName={mobileName}
            onFile={f => { setMobileFile(f); setMobileName(f.name) }} />

          {/* Feedback */}
          {formError && (
            <p className="text-xs text-right rounded-xl px-4 py-3"
              style={{ color: '#D9ACA3', background: 'rgba(217,172,163,0.08)', border: '1px solid rgba(217,172,163,0.18)' }}>
              {formError}
            </p>
          )}
          {formOk && (
            <p className="text-xs text-right rounded-xl px-4 py-3"
              style={{ color: '#48D6CD', background: 'rgba(26,148,155,0.08)', border: '1px solid rgba(26,148,155,0.20)' }}>
              {editingId ? '✓ تم تحديث الواجهة بنجاح.' : '✓ تم رفع الواجهة بنجاح.'}
            </p>
          )}

          {/* Submit */}
          <button type="submit" disabled={saving}
            className="font-bold rounded-xl py-3 cursor-pointer transition-all duration-300 disabled:opacity-60"
            style={{
              background: saving
                ? 'rgba(217,172,163,0.12)'
                : editingId
                  ? 'linear-gradient(135deg, rgba(72,214,205,0.85) 0%, rgba(26,148,155,0.90) 100%)'
                  : 'linear-gradient(135deg, rgba(217,172,163,0.85) 0%, rgba(166,117,106,0.90) 100%)',
              color      : saving ? '#D9ACA3' : '#09201E',
              borderWidth: '1px', borderStyle: 'solid',
              borderColor: saving ? 'rgba(217,172,163,0.25)' : 'transparent',
              fontSize   : '0.9rem',
            }}
          >
            {saving
              ? (editingId ? 'جارٍ التحديث...' : 'جارٍ الرفع...')
              : (editingId ? '✦ تحديث الواجهة' : '✦ إضافة الواجهة')}
          </button>
        </form>
      </div>

      {/* ── List ── */}
      <div>
        <h4 className="font-black text-base mb-5 text-right" style={{ color: '#D9ACA3' }}>
          الواجهات المضافة
          {interfaces.length > 0 && (
            <span className="mr-2 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(217,172,163,0.12)', color: '#A6756A' }}>
              {interfaces.length}
            </span>
          )}
        </h4>
        <div className="h-px mb-5" style={{ background: 'rgba(217,172,163,0.10)' }} />

        {loadingList ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(217,172,163,0.20)', borderTopColor: '#D9ACA3' }} />
          </div>
        ) : listError ? (
          <ErrorBanner msg={listError} />
        ) : interfaces.length === 0 ? (
          <EmptyState msg="لا توجد واجهات بعد — أضف أول واجهة من النموذج أعلاه." />
        ) : (
          <div className="flex flex-col gap-3">
            {interfaces.map(iface => (
              <div key={iface.id}
                className="flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-250"
                style={{ background: 'rgba(17,49,44,0.12)', border: '1px solid rgba(26,148,155,0.14)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(17,49,44,0.20)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(17,49,44,0.12)'}
              >
                {/* Desktop thumbnail */}
                <div className="w-20 h-12 rounded-lg flex-shrink-0 overflow-hidden"
                  style={{ background: 'rgba(217,172,163,0.08)' }}>
                  {iface.desktop_image
                    ? <img src={iface.desktop_image} alt={iface.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">🖥</div>
                  }
                </div>

                {/* Mobile thumbnail */}
                {iface.mobile_image && (
                  <div className="w-7 h-12 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{ background: 'rgba(72,214,205,0.08)', border: '1px solid rgba(72,214,205,0.15)' }}>
                    <img src={iface.mobile_image} alt="mobile" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-bold text-sm truncate" style={{ color: '#EAE4DF' }}>{iface.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6FA5A8' }}>
                    ترتيب: {iface.order_index}
                    {iface.mobile_image && <span className="mr-2" style={{ color: '#48D6CD' }}>· 📱 يوجد صورة هاتف</span>}
                  </p>
                </div>

                {/* Edit */}
                <button
                  onClick={() => startEdit(iface)}
                  disabled={!!deletingId}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-250 disabled:opacity-40"
                  style={{ background: 'rgba(72,214,205,0.08)', border: '1px solid rgba(72,214,205,0.22)', color: '#48D6CD' }}
                  onMouseEnter={e => { if (!deletingId) e.currentTarget.style.background = 'rgba(72,214,205,0.18)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(72,214,205,0.08)' }}
                >
                  <Pencil size={12} strokeWidth={2} />
                  تعديل
                </button>

                {/* Delete */}
                <button onClick={() => handleDelete(iface)} disabled={deletingId === iface.id}
                  className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-250 disabled:opacity-50"
                  style={{ background: 'rgba(217,172,163,0.08)', border: '1px solid rgba(217,172,163,0.18)', color: '#A6756A' }}
                  onMouseEnter={e => { if (deletingId !== iface.id) e.currentTarget.style.background = 'rgba(217,172,163,0.18)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(217,172,163,0.08)' }}
                >
                  {deletingId === iface.id ? '...' : 'حذف'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Sidebar ─────────────────────────────────────────────────── */
function Sidebar({ active, onChange, onLogout }) {
  return (
    <aside
      className="flex flex-col gap-2 p-5 min-h-screen"
      style={{
        width               : '260px',
        flexShrink          : 0,
        background          : 'rgba(2,15,14,0.75)',
        borderLeft          : '1px solid rgba(217,172,163,0.10)',
        backdropFilter      : 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      dir="rtl"
    >
      <div className="mb-8 px-2 pt-2">
        <p
          className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1"
          style={{ color: '#A6756A' }}
        >
          غرفة القيادة
        </p>
        <h1 className="text-lg font-black leading-tight" style={{ color: '#EAE4DF' }}>
          لوحة التحكم
        </h1>
      </div>

      <nav className="flex flex-col gap-1">
        {tabs.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-right transition-all duration-250 cursor-pointer w-full"
              style={{
                background: isActive ? 'rgba(217,172,163,0.12)' : 'transparent',
                color     : isActive ? '#D9ACA3'                : '#96BCBE',
                border    : isActive
                  ? '1px solid rgba(217,172,163,0.22)'
                  : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#EAE4DF' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#96BCBE' }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div
        className="mt-auto px-2 pt-4 flex flex-col gap-3 border-t"
        style={{ borderColor: 'rgba(217,172,163,0.08)' }}
      >
        <p className="text-[11px]" style={{ color: '#6FA5A8' }}>
          نظام المهندس محمد — v1.0
        </p>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-250 cursor-pointer"
          style={{
            background: 'rgba(217,172,163,0.06)',
            border    : '1px solid rgba(217,172,163,0.14)',
            color     : '#96BCBE',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(217,172,163,0.12)'
            e.currentTarget.style.color      = '#D9ACA3'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(217,172,163,0.06)'
            e.currentTarget.style.color      = '#96BCBE'
          }}
        >
          <span style={{ fontSize: '0.85rem' }}>⏻</span>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}

/* ─── Main ────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab,       setActiveTab]       = useState('demo_requests')
  const [testimonials,    setTestimonials]    = useState([])
  const [subscriberCount, setSubscriberCount] = useState(null)
  const [convertedCount,  setConvertedCount]  = useState(null)
  const [affiliateCount,  setAffiliateCount]  = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [fetchError,      setFetchError]      = useState('')
  const [approving,       setApproving]       = useState(null)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      setFetchError('')
      try {
        const [
          { data: tests, error: e1 },
          { count: subC, error: e2 },
          { count: convC, error: e3 },
          { count: affC, error: e4 },
        ] = await Promise.all([
          supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
          supabase.from('lead_magnet_subscribers').select('*', { count: 'exact', head: true }),
          supabase.from('lead_magnet_subscribers').select('*', { count: 'exact', head: true }).not('converted_at', 'is', null),
          supabase.from('affiliate_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ])
        if (e1) throw e1
        if (e2) throw e2
        if (e3) throw e3
        if (e4) throw e4
        setTestimonials(tests ?? [])
        setSubscriberCount(subC ?? 0)
        setConvertedCount(convC ?? 0)
        setAffiliateCount(affC ?? 0)
      } catch (err) {
        setFetchError(err?.message || 'فشل جلب البيانات. تحقق من الاتصال وإعدادات Supabase.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  const handleApproveTestimonial = async (id) => {
    setApproving(id)
    try {
      const { error: dbError } = await supabase
        .from('testimonials')
        .update({ status: 'approved' })
        .eq('id', id)
      if (dbError) throw dbError
      setTestimonials(prev =>
        prev.map(t => t.id === id ? { ...t, status: 'approved' } : t)
      )
    } catch (err) {
      console.error('[AdminDashboard] Approve error:', err?.message)
    } finally {
      setApproving(null)
    }
  }

  const activeLabel = tabs.find(t => t.id === activeTab)?.label ?? ''

  return (
    <div
      className="flex min-h-screen"
      dir="rtl"
      style={{ background: '#09201E', fontFamily: 'inherit' }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(26,148,155,0.07) 0%, transparent 70%)',
          zIndex    : 0,
        }}
        aria-hidden
      />

      {/* Sidebar */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Sidebar active={activeTab} onChange={setActiveTab} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <main
        className="flex-1 p-8 md:p-10 overflow-y-auto relative"
        style={{ zIndex: 10, minWidth: 0 }}
      >
        {/* Welcome banner */}
        <div
          className="rounded-2xl px-8 py-7 mb-8 flex items-center gap-5"
          style={{
            background          : 'rgba(217,172,163,0.07)',
            border              : '1px solid rgba(217,172,163,0.14)',
            backdropFilter      : 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: 'rgba(217,172,163,0.13)', border: '1px solid rgba(217,172,163,0.25)' }}
          >
            ⚙️
          </div>
          <div>
            <h2 className="font-black text-lg mb-0.5" style={{ color: '#EAE4DF' }}>
              مرحباً مهندس محمد، هذه غرفة القيادة الخاصة بك.
            </h2>
            <p className="text-sm" style={{ color: '#96BCBE' }}>
              تحكّم بكامل محتوى الموقع من هنا بعيداً عن أعين الزوار.
            </p>
          </div>
        </div>

        {/* Stats */}
        {!loading && !fetchError && (
          <StatsRow
            testimonials={testimonials}
            subscriberCount={subscriberCount}
            convertedCount={convertedCount}
            affiliateCount={affiliateCount}
          />
        )}

        {/* Global fetch error */}
        {fetchError && (
          <div className="mb-6"><ErrorBanner msg={fetchError} /></div>
        )}

        {/* Tab heading */}
        <div className="mb-6">
          <h3 className="text-xl font-black" style={{ color: '#D9ACA3' }}>{activeLabel}</h3>
          <div className="mt-2 h-px w-16" style={{ background: 'rgba(217,172,163,0.25)' }} />
        </div>

        {/* Tab body */}
        {activeTab === 'demo_requests' && <DemoRequestsTab />}
        {activeTab === 'tenants'       && <TenantsTab />}
        {activeTab === 'testimonials' && (
          <TestimonialsTab
            data={testimonials}
            loading={loading}
            error={fetchError}
            onApprove={handleApproveTestimonial}
            approving={approving}
          />
        )}
        {activeTab === 'subscribers' && <SubscribersTab />}
        {activeTab === 'affiliates'  && <AffiliatesTab />}
        {activeTab === 'interfaces'  && <InterfacesTab />}
      </main>
    </div>
  )
}
