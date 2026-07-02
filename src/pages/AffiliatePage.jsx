import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users, TrendingUp, Share2, DollarSign, CheckCircle2,
  ChevronDown, ChevronUp, Star, Copy, Check,
  Search, Clock, AlertCircle, Link as LinkIcon, Mail, KeyRound,
} from 'lucide-react'
import { supabase } from '../config/supabaseClient'

function generateCode(name = '') {
  const prefix = name.trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z؀-ۿ]/g, '').slice(0, 4)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `IHK-${prefix || 'REF'}-${suffix}`
}

const fadeUp = {
  hidden : { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
}

/* ─── Shared sub-components ──────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/7 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-right text-sm font-semibold text-white/75 hover:text-white transition-colors"
      >
        {q}
        {open
          ? <ChevronUp   size={15} className="flex-shrink-0 text-[#6ABDB2]" />
          : <ChevronDown size={15} className="flex-shrink-0 text-white/30" />}
      </button>
      {open && <div className="pb-5 text-sm text-white/50 leading-relaxed">{a}</div>}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    active  : { label: 'نشط',     bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.28)', color: '#6EE7B7' },
    pending : { label: 'معلق',    bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.28)', color: '#FCD34D' },
    rejected: { label: 'مرفوض',  bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.28)',  color: '#FCA5A5' },
    approved: { label: 'معتمد',  bg: 'rgba(106,189,178,0.12)',border: 'rgba(106,189,178,0.28)',color: '#6ABDB2' },
    expired : { label: 'منتهي',  bg: 'rgba(100,100,120,0.12)',border: 'rgba(100,100,120,0.28)',color: '#9CA3AF' },
    cancelled:{ label: 'ملغى',   bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.20)',  color: '#F87171' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  )
}

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
        <p className="text-xs font-semibold mt-1"  style={{ color: '#7A9E96' }}>{label}</p>
        {sub && <p className="text-[11px] mt-0.5"  style={{ color: '#3D5050' }}>{sub}</p>}
      </div>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function AffiliatePage() {
  const [activeTab, setActiveTab] = useState('apply')

  /* ── Commission rates — direct from platform_settings ─────── */
  const [rates, setRates] = useState({ first: 20, recurring: 10, loading: true })
  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', ['commission_first_rate', 'commission_recurring_rate'])
      .then(({ data }) => {
        if (data?.length) {
          const map = Object.fromEntries(data.map(r => [r.key, parseFloat(r.value)]))
          setRates({
            first    : map['commission_first_rate']     ?? 20,
            recurring: map['commission_recurring_rate'] ?? 10,
            loading  : false,
          })
        } else {
          /* fallback to RPC if direct read blocked by RLS */
          supabase.rpc('get_current_commission_rate').then(({ data: d }) => {
            if (d?.[0]) setRates({
              first    : Number(d[0].first_commission_pct),
              recurring: Number(d[0].recurring_commission_pct),
              loading  : false,
            })
            else setRates(r => ({ ...r, loading: false }))
          })
        }
      })
  }, [])

  /* ── Apply tab ─────────────────────────────────────────────── */
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', relation: '', note: '' })
  const [status,  setStatus]  = useState('idle')
  const [refCode, setRefCode] = useState('')
  const [copied,  setCopied]  = useState(false)

  /* ── Track tab ─────────────────────────────────────────────── */
  const [trackCode,    setTrackCode]    = useState('')
  const [trackLoading, setTrackLoading] = useState(false)
  const [trackErr,     setTrackErr]     = useState('')
  const [trackRes,     setTrackRes]     = useState(null)
  const [payoutsList,  setPayoutsList]  = useState([])

  /* ── Code recovery ─────────────────────────────────────────── */
  const [showRecovery,       setShowRecovery]       = useState(false)
  const [recoveryEmail,      setRecoveryEmail]      = useState('')
  const [recoveryLoading,    setRecoveryLoading]    = useState(false)
  const [recoveryResult,     setRecoveryResult]     = useState(null)
  const [recoveryLinkCopied, setRecoveryLinkCopied] = useState(false)
  const [trackLinkCopied,   setTrackLinkCopied]   = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  /* ── Handlers ──────────────────────────────────────────────── */
  function copyLink(code = refCode) {
    const link = `${window.location.origin}/?ref=${code}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    })
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.relation) return
    setStatus('loading')
    const code = generateCode(form.name)
    setRefCode(code)
    const { error } = await supabase.from('affiliate_applications').insert([{
      full_name    : form.name.trim(),
      email        : form.email.trim().toLowerCase(),
      phone        : form.phone.trim() || null,
      relation     : form.relation,
      note         : form.note.trim() || null,
      referral_code: code,
      status       : 'pending',
    }])
    setStatus(error ? 'error' : 'success')
  }

  async function lookupCode(codeOverride) {
    const clean = (codeOverride ?? trackCode).trim().toUpperCase()
    if (!clean) return
    setTrackLoading(true)
    setTrackErr('')
    setTrackRes(null)

    const [{ data, error }, { data: payRows }] = await Promise.all([
      supabase.rpc('get_affiliate_stats', { p_code: clean }),
      supabase
        .from('affiliate_payouts')
        .select('id, amount, currency, notes, paid_at')
        .ilike('referral_code', clean)
        .order('paid_at', { ascending: false }),
    ])

    if (error || !data?.affiliate) {
      setTrackErr('لم يُعثر على هذا الكود. تأكد من الكود وحاول مجدداً.')
      setTrackLoading(false)
      return
    }

    setPayoutsList(payRows ?? [])

    /* If paid_out missing from RPC (old version), compute from fetched rows */
    let result = data
    if (result.paid_out == null) {
      const paid = (payRows ?? []).reduce((s, r) => s + Number(r.amount), 0)
      result = {
        ...result,
        paid_out       : paid,
        pending_payout : Math.max(0, (result.earned ?? 0) - paid),
      }
    }

    setTrackRes(result)
    setTrackLoading(false)
  }

  async function recoverCode(e) {
    e?.preventDefault()
    const email = recoveryEmail.trim().toLowerCase()
    if (!email) return
    setRecoveryLoading(true)
    setRecoveryResult(null)
    const { data, error } = await supabase.rpc('get_affiliate_code_by_email', { p_email: email })
    if (error || !data) {
      setRecoveryResult({ found: false })
    } else {
      setRecoveryResult(data)
      if (data.found && data.code) setTrackCode(data.code)
    }
    setRecoveryLoading(false)
  }

  function copyRecoveredAndSearch(code) {
    const link = `${window.location.origin}/?ref=${code}`
    navigator.clipboard.writeText(link).then(() => {
      setRecoveryLinkCopied(true)
      setTimeout(() => setRecoveryLinkCopied(false), 2500)
    })
    setShowRecovery(false)
    setTrackCode(code)
    lookupCode(code)
  }

  const [expandedClient, setExpandedClient] = useState(null)

  /* Translate billing_cycle to Arabic label */
  const billingLabel = (cycle) => {
    if (!cycle) return null
    if (cycle === 'monthly')               return 'شهري'
    if (cycle === 'annual' || cycle === 'yearly') return 'سنوي (١٢ شهراً)'
    const n = parseInt(cycle, 10)
    if (!isNaN(n)) {
      if (n === 1)  return 'شهري'
      if (n === 3)  return 'ربع سنوي (٣ أشهر)'
      if (n === 6)  return 'نصف سنوي (٦ أشهر)'
      if (n === 12) return 'سنوي (١٢ شهراً)'
      return `${n} أشهر`
    }
    return cycle
  }

  /* ── Subscription timeline helpers ────────────────────────── */
  const billingMonths = (cycle) => {
    if (!cycle) return null
    if (cycle === 'monthly') return 1
    if (cycle === 'annual' || cycle === 'yearly') return 12
    const n = parseInt(cycle, 10)
    return isNaN(n) ? null : n
  }

  const calcExpiry = (startDate, cycle) => {
    const months = billingMonths(cycle)
    if (!months || !startDate) return null
    const d = new Date(startDate)
    d.setMonth(d.getMonth() + months)
    return d
  }

  const daysLeft = (expiry) => {
    if (!expiry) return null
    return Math.ceil((expiry - new Date()) / 86400000)
  }

  const expiryStyle = (days) => {
    if (days === null) return null
    if (days > 60)  return { color: '#10B981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.22)' }
    if (days > 30)  return { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.22)' }
    if (days > 0)   return { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.28)' }
    return            { color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)' }
  }

  /* Group flat referral events by institute name */
  const clientGroups = useMemo(() => {
    const referrals = trackRes?.referrals ?? []
    const map = new Map()
    referrals.forEach(r => {
      const key = r.name  /* group by institute name */
      if (!map.has(key)) {
        map.set(key, { key, name: r.name, events: [], latestStatus: r.status, latestDate: r.date, totalCommission: 0 })
      }
      const g = map.get(key)
      g.events.push(r)
      if (r.commission) g.totalCommission += Number(r.commission)
      if (new Date(r.date) > new Date(g.latestDate)) {
        g.latestDate   = r.date
        g.latestStatus = r.status
      }
    })
    /* sort events within each group newest first; mark first vs renewal */
    map.forEach(g => {
      g.events.sort((a, b) => new Date(a.date) - new Date(b.date))
      g.events.forEach((ev, i) => { ev._isRenewal = i > 0 })
      g.events.reverse() /* show newest first in UI */
    })
    return Array.from(map.values())
  }, [trackRes])

  /* ── Shared input base style ───────────────────────────────── */
  const inputBase = {
    background : 'rgba(255,255,255,0.04)',
    border     : '1px solid rgba(106,189,178,0.25)',
    color      : '#EAE4DF',
    outline    : 'none',
  }

  /* ──────────────────────────────────────────────────────────── */
  return (
    <div dir="rtl" style={{ background: '#010D0D', minHeight: '100vh' }}>

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section
        className="relative pt-32 pb-14 px-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 75% 55% at 50% -5%, rgba(106,189,178,0.13) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(106,189,178,0.04) 0%, transparent 60%)
          `,
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(106,189,178,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(106,189,178,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '52px 52px',
        }} />
        <div className="absolute top-0 inset-x-0 h-1"
          style={{ background: 'linear-gradient(90deg, transparent, #6ABDB2, transparent)' }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6"
              style={{ background: 'rgba(106,189,178,0.12)', color: '#6ABDB2', border: '1px solid rgba(106,189,178,0.25)' }}>
              <Share2 size={13} /> برنامج الشراكة
            </div>
          </motion.div>
          <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp}
            className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-5" style={{ lineHeight: 1.15 }}>
            شارك إحكام واربح<br />
            <span style={{ color: '#6ABDB2' }}>عمولة مستمرة</span>
          </motion.h1>
          <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp}
            className="text-white/55 text-lg max-w-xl mx-auto leading-relaxed">
            إذا كنت مدير مركز تحفيظ أو معلم قرآن أو صاحب تأثير في هذا المجال — توصيتك تساوي أكثر مما تتخيل.
          </motion.p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STICKY TAB BAR
      ════════════════════════════════════════════════════════ */}
      <div className="sticky top-16 z-30 px-6 py-3"
        style={{ background: 'rgba(1,13,13,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(106,189,178,0.10)' }}>
        <div className="max-w-xl mx-auto">
          <div className="flex rounded-2xl p-1 gap-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { id: 'apply', icon: Users,       label: 'شريك جديد'              },
              { id: 'track', icon: TrendingUp,  label: 'تتبع إنجازاتي وأرباحي' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={activeTab === id
                  ? { background: '#6ABDB2', color: '#010D0D' }
                  : { color: 'rgba(255,255,255,0.38)' }}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{id === 'apply' ? 'شريك جديد' : 'تتبع أرباحي'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          TAB 1 — APPLY (new partner)
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'apply' && (
        <div>

          {/* Numbers */}
          <section className="max-w-5xl mx-auto px-6 py-12">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {[
                { value: rates.loading ? '...' : `${rates.first}%`,     label: 'عمولة الاشتراك الأول', sub: 'عند كل تحويل ناجح' },
                { value: rates.loading ? '...' : `${rates.recurring}%`, label: 'عمولة شهرية مستمرة',   sub: 'طالما العميل مشترك' },
                { value: 'صفر', label: 'تكلفة مسبقة عليك',             sub: 'لا رسوم تسجيل'            },
              ].map((stat, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="text-center p-5 md:p-8 rounded-2xl border border-white/7"
                  style={{ background: 'rgba(255,255,255,0.025)' }}>
                  <div className="text-3xl md:text-5xl font-black mb-2" style={{ color: '#6ABDB2' }}>{stat.value}</div>
                  <div className="text-white text-sm md:text-base font-bold mb-1">{stat.label}</div>
                  <div className="text-white/35 text-xs">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Why */}
          <section className="max-w-5xl mx-auto px-6 py-8 mb-6">
            <div className="rounded-2xl p-8 md:p-10 border border-[#6ABDB2]/20" style={{ background: 'rgba(106,189,178,0.04)' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'rgba(106,189,178,0.15)' }}>
                  <Star size={18} style={{ color: '#6ABDB2' }} />
                </div>
                <div>
                  <h2 className="text-white font-black text-xl mb-3">لماذا توصيتك تساوي أكثر؟</h2>
                  <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
                    مدير المركز القرآني لا يتأثر بإعلان ولا بمسوّق خارجي. يتأثر بمَن يثق به من زملائه ومعارفه في المجال.
                    إذا كنت تستخدم إحكام أو تعمل في هذا الميدان — توصيتك تُغلق صفقات لا يستطيع إغلاقها أي إعلان.
                    ولهذا نمنحك عمولة أعلى مما يقدّمه أي برنامج تسويق تقليدي.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="how" className="max-w-5xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-white font-black text-3xl mb-3">كيف يعمل؟</h2>
              <p className="text-white/40 text-sm">ثلاث خطوات بسيطة</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { num: '١', icon: Users,      title: 'سجّل حسابك',    body: 'أرسل طلبك عبر النموذج أدناه. سنراجعه خلال 48 ساعة ونرسل لك رابطك الخاص.' },
                { num: '٢', icon: Share2,      title: 'شارك رابطك',    body: 'شارك رابطك مع مدراء المراكز والمعلمين الذين تعرفهم — عبر الواتساب أو أي قناة تراها مناسبة.' },
                { num: '٣', icon: DollarSign, title: 'استلم عمولتك',  body: `عند اشتراك أي شخص عبر رابطك تحصل على ${rates.first}% فوراً + ${rates.recurring}% شهرياً طوال فترة اشتراكه.` },
              ].map((step, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp}
                  className="relative p-6 rounded-2xl border border-white/7 overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.025)' }}>
                  <div className="absolute -top-4 -left-2 text-8xl font-black pointer-events-none select-none"
                    style={{ color: 'rgba(106,189,178,0.06)' }}>{step.num}</div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 relative"
                    style={{ background: 'rgba(106,189,178,0.12)' }}>
                    <step.icon size={20} style={{ color: '#6ABDB2' }} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 relative">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed relative">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Who is it for */}
          <section className="max-w-5xl mx-auto px-6 py-8 mb-4">
            <div className="text-center mb-10">
              <h2 className="text-white font-black text-2xl mb-2">من يستفيد من البرنامج؟</h2>
              <p className="text-white/40 text-sm">نحن نبحث عن أصحاب مصداقية حقيقية في المجال</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { emoji: '🕌',  title: 'مدراء مراكز التحفيظ',    body: 'تجربتك الحقيقية مع إحكام هي أقوى أداة تسويقية.' },
                { emoji: '📖',  title: 'معلمو القرآن الكريم',     body: 'شبكة علاقاتك مع المدراء تفتح أبواباً لا تُعدّ.' },
                { emoji: '🎙️', title: 'أصحاب المحتوى الإسلامي',  body: 'جمهورك من المهتمين بالتعليم القرآني مناسب تماماً.' },
                { emoji: '🏢',  title: 'المستشارون والمشرفون',     body: 'تعمل مع مؤسسات متعددة؟ ضاعف عمولتك.' },
              ].map((card, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }} variants={fadeUp}
                  className="p-5 rounded-xl border border-white/7 hover:border-white/15 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-2xl mb-3">{card.emoji}</div>
                  <h3 className="text-white font-bold text-sm mb-1.5">{card.title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Apply form */}
          <section id="apply" className="max-w-3xl mx-auto px-6 py-16">
            <div className="rounded-3xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="px-8 py-7 border-b border-white/7" style={{ background: 'rgba(106,189,178,0.05)' }}>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-3"
                  style={{ background: 'rgba(106,189,178,0.12)', color: '#6ABDB2' }}>
                  <TrendingUp size={12} /> انضم للبرنامج
                </div>
                <h2 className="text-white font-black text-2xl">أنشئ حسابك التسويقي</h2>
                <p className="text-white/45 text-sm mt-1.5">سنراجع طلبك خلال 48 ساعة ونرسل لك رابطك الخاص.</p>
              </div>

              <div className="p-8">
                {status === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(106,189,178,0.15)' }}>
                      <CheckCircle2 size={32} style={{ color: '#6ABDB2' }} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">تم استلام طلبك!</h3>
                    <p className="text-white/50 text-sm mb-6 leading-relaxed">
                      شكراً لانضمامك. سنراجع طلبك ونتواصل معك على بريدك الإلكتروني خلال 48 ساعة.
                    </p>

                    <div className="rounded-2xl p-5 mb-6 text-right"
                      style={{ background: 'rgba(106,189,178,0.07)', border: '1px solid rgba(106,189,178,0.22)' }}>
                      <p className="text-xs font-bold mb-3" style={{ color: '#6ABDB2' }}>
                        رمز الإحالة الخاص بك — ابدأ الكسب الآن
                      </p>
                      <div className="flex items-center gap-2 p-3 rounded-xl"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(106,189,178,0.15)' }}>
                        <span className="flex-1 font-black text-sm tracking-widest"
                          style={{ color: '#6ABDB2', direction: 'ltr', fontFamily: 'monospace' }}>
                          {refCode}
                        </span>
                        <button onClick={() => copyLink(refCode)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-all"
                          style={{
                            background: copied ? 'rgba(106,189,178,0.25)' : 'rgba(106,189,178,0.12)',
                            color: copied ? '#6ABDB2' : '#7A9E96',
                            border: '1px solid rgba(106,189,178,0.25)',
                          }}>
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          {copied ? 'تم النسخ' : 'نسخ الرابط'}
                        </button>
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#5A8A78' }}>
                        شارك هذا الرابط — كل مركز يشترك عبره يمنحك عمولتك تلقائياً
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={() => { setTrackCode(refCode); setActiveTab('track'); lookupCode(refCode) }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold"
                        style={{ background: '#6ABDB2', color: '#010D0D' }}
                      >
                        <TrendingUp size={14} /> تتبع إحالاتي
                      </button>
                      <Link to="/"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)' }}>
                        الرئيسية
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-white/55 text-xs font-semibold mb-2">الاسم الكامل *</label>
                        <input required value={form.name} onChange={set('name')} placeholder="محمد أحمد"
                          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 border border-white/8 focus:border-[#6ABDB2]/50 focus:outline-none transition-colors"
                          style={{ background: 'rgba(255,255,255,0.04)' }} />
                      </div>
                      <div>
                        <label className="block text-white/55 text-xs font-semibold mb-2">البريد الإلكتروني *</label>
                        <input required type="email" value={form.email} onChange={set('email')} placeholder="example@email.com"
                          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 border border-white/8 focus:border-[#6ABDB2]/50 focus:outline-none transition-colors"
                          style={{ background: 'rgba(255,255,255,0.04)' }} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-white/55 text-xs font-semibold mb-2">رقم الهاتف (اختياري)</label>
                        <input value={form.phone} onChange={set('phone')} placeholder="+966 5x xxx xxxx"
                          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 border border-white/8 focus:border-[#6ABDB2]/50 focus:outline-none transition-colors"
                          style={{ background: 'rgba(255,255,255,0.04)' }} />
                      </div>
                      <div>
                        <label className="block text-white/55 text-xs font-semibold mb-2">علاقتك بالمجال *</label>
                        <select required value={form.relation} onChange={set('relation')}
                          className="w-full px-4 py-3 rounded-xl text-sm border border-white/8 focus:border-[#6ABDB2]/50 focus:outline-none transition-colors appearance-none"
                          style={{ background: '#010D0D', color: form.relation ? 'white' : 'rgba(255,255,255,0.2)' }}>
                          <option value="" disabled>اختر...</option>
                          <option value="مدير مركز تحفيظ (يستخدم إحكام)">مدير مركز تحفيظ — أستخدم إحكام</option>
                          <option value="مدير مركز تحفيظ (لا يستخدم إحكام)">مدير مركز تحفيظ — لا أستخدم إحكام بعد</option>
                          <option value="معلم قرآن كريم">معلم قرآن كريم</option>
                          <option value="مشرف أو مستشار تربوي">مشرف أو مستشار تربوي</option>
                          <option value="صاحب محتوى إسلامي">صاحب محتوى إسلامي</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/55 text-xs font-semibold mb-2">كيف ستروّج لإحكام؟ (اختياري)</label>
                      <textarea rows={3} value={form.note} onChange={set('note')}
                        placeholder="أخبرنا عن شبكة علاقاتك وخطتك لمشاركة الرابط..."
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 border border-white/8 focus:border-[#6ABDB2]/50 focus:outline-none transition-colors resize-none"
                        style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                    <p className="text-white/25 text-xs leading-relaxed">
                      بإرسال هذا الطلب توافق على شروط برنامج الشراكة. سيتم مراجعة طلبك من فريق إحكام قبل تفعيله.
                    </p>
                    {status === 'error' && (
                      <p className="text-red-400 text-xs">حدث خطأ، يرجى المحاولة مجدداً أو التواصل معنا مباشرة.</p>
                    )}
                    <button type="submit" disabled={status === 'loading'}
                      className="w-full py-3.5 rounded-xl font-bold text-sm transition-opacity disabled:opacity-60"
                      style={{ background: '#6ABDB2', color: '#010D0D' }}>
                      {status === 'loading' ? 'جارٍ الإرسال...' : 'أرسل طلب الانضمام'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-3xl mx-auto px-6 pb-24">
            <h2 className="text-white font-black text-2xl mb-8 text-center">أسئلة شائعة</h2>
            <div className="rounded-2xl border border-white/7 px-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
              {[
                { q: 'هل يمكن لأي شخص الانضمام؟',
                  a: 'نفضّل المنتسبين الذين لديهم صلة حقيقية بمجال تحفيظ القرآن — مديرون، معلمون، أو أصحاب تأثير في هذا الميدان. ليس شرطاً أن تكون مستخدماً لإحكام، لكن سيُعطى الأولوية لمن يستخدمه فعلاً.' },
                { q: 'متى وكيف أستلم العمولة؟',
                  a: 'تُحسب العمولة شهرياً وتُحوَّل إلى حسابك عبر الطريقة التي تحددها (تحويل بنكي / محفظة إلكترونية) بعد التحقق من الاشتراكات النشطة.' },
                { q: `هل العمولة ${rates.recurring}% مستمرة للأبد؟`,
                  a: 'نعم، طالما بقي العميل الذي جلبته مشتركاً في إحكام، تستمر حصتك الشهرية بالنسبة المحددة وقت اشتراكه. إذا انتهى اشتراكه توقفت العمولة.' },
                { q: 'كيف أتتبع من اشترك عبر رابطي؟',
                  a: 'من تبويب "تتبع إنجازاتي وأرباحي" في هذه الصفحة — أدخل كودك وستظهر لك كل الإحصائيات فوراً.' },
                { q: 'هل يوجد حد أدنى للعمولة قبل السحب؟',
                  a: 'نعم، الحد الأدنى للسحب 100 ريال سعودي (أو ما يعادلها).' },
              ].map((item, i) => <FaqItem key={i} {...item} />)}
            </div>
          </section>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB 2 — TRACK (tracker + code recovery)
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'track' && (
        <div className="max-w-3xl mx-auto px-5 py-14">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-5"
              style={{ background: 'rgba(106,189,178,0.10)', color: '#6ABDB2', border: '1px solid rgba(106,189,178,0.22)' }}>
              <TrendingUp size={13} /> لوحة الشريك
            </div>
            <p className="text-sm" style={{ color: '#5A8A7E' }}>
              أدخل كود الإحالة الخاص بك لتعرف عدد التحويلات وعمولتك المحتسبة
            </p>
          </div>

          {/* ── Code input ───────────────────────────────────────── */}
          <form onSubmit={(e) => { e.preventDefault(); lookupCode() }}
            className="flex gap-3 max-w-lg mx-auto">
            <input
              value={trackCode}
              onChange={e => { setTrackCode(e.target.value); setTrackErr('') }}
              placeholder="IHK-REF-XXXX"
              dir="ltr"
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold tracking-widest text-center"
              style={{ ...inputBase, fontFamily: 'monospace', letterSpacing: '0.12em' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(106,189,178,0.55)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(106,189,178,0.25)')}
            />
            <button
              type="submit"
              disabled={trackLoading || !trackCode.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all duration-200"
              style={{ background: '#6ABDB2', color: '#010D0D' }}
            >
              <Search size={15} />
              {trackLoading ? 'جاري...' : 'بحث'}
            </button>
          </form>

          {/* ── Forgot code link ─────────────────────────────────── */}
          <div className="text-center mt-3 mb-2">
            <button
              onClick={() => { setShowRecovery(v => !v); setRecoveryResult(null); setRecoveryEmail('') }}
              className="text-xs transition-colors"
              style={{ color: showRecovery ? '#6ABDB2' : 'rgba(255,255,255,0.22)' }}
            >
              {showRecovery ? '✕ إغلاق' : 'نسيت كود الإحالة الخاص بك؟'}
            </button>
          </div>

          {/* ── Recovery panel ───────────────────────────────────── */}
          <AnimatePresence>
            {showRecovery && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="max-w-lg mx-auto mb-8"
              >
                <div className="rounded-2xl p-5 mt-1"
                  style={{ background: 'rgba(106,189,178,0.04)', border: '1px solid rgba(106,189,178,0.15)' }}>

                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound size={14} style={{ color: '#6ABDB2' }} />
                    <p className="text-xs font-bold" style={{ color: '#6ABDB2' }}>استرداد كود الإحالة عبر البريد الإلكتروني</p>
                  </div>

                  <form onSubmit={recoverCode} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail size={14} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'rgba(255,255,255,0.2)', right: '12px' }} />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={e => { setRecoveryEmail(e.target.value); setRecoveryResult(null) }}
                        placeholder="بريدك الإلكتروني المسجّل"
                        dir="ltr"
                        className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm"
                        style={{ ...inputBase }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(106,189,178,0.55)')}
                        onBlur={e  => (e.target.style.borderColor = 'rgba(106,189,178,0.25)')}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={recoveryLoading || !recoveryEmail.trim()}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0 disabled:opacity-50 transition-all"
                      style={{ background: 'rgba(106,189,178,0.15)', color: '#6ABDB2', border: '1px solid rgba(106,189,178,0.25)' }}
                    >
                      {recoveryLoading ? '...' : 'بحث'}
                    </button>
                  </form>

                  {/* Recovery result */}
                  <AnimatePresence>
                    {recoveryResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-4"
                      >
                        {recoveryResult.found ? (
                          <div className="rounded-xl p-4"
                            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.20)' }}>
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle2 size={14} style={{ color: '#6EE7B7' }} />
                              <p className="text-xs font-bold" style={{ color: '#6EE7B7' }}>
                                وجدنا حسابك! مرحباً {recoveryResult.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3"
                              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(16,185,129,0.18)' }}>
                              <span className="flex-1 text-sm font-black tracking-widest"
                                style={{ color: '#6EE7B7', fontFamily: 'monospace', direction: 'ltr' }}>
                                {recoveryResult.code}
                              </span>
                            </div>
                            <button
                              onClick={() => copyRecoveredAndSearch(recoveryResult.code)}
                              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                              style={{ background: recoveryLinkCopied ? 'rgba(16,185,129,0.30)' : 'rgba(16,185,129,0.18)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.28)' }}
                            >
                              {recoveryLinkCopied ? <Check size={13} /> : <Copy size={13} />}
                              {recoveryLinkCopied ? 'تم نسخ الرابط — تحميل إحصائياتك...' : 'نسخ رابط الإحالة والدخول للوحتي'}
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl p-4 flex items-start gap-3"
                            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.20)' }}>
                            <AlertCircle size={14} style={{ color: '#FCA5A5', flexShrink: 0, marginTop: 1 }} />
                            <p className="text-xs leading-relaxed" style={{ color: '#FCA5A5' }}>
                              هذا البريد الإلكتروني غير مسجل لدينا كشريك.{' '}
                              <button
                                onClick={() => setActiveTab('apply')}
                                className="underline font-bold"
                                style={{ color: '#FCA5A5' }}
                              >
                                سجّل الآن
                              </button>
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Lookup error ─────────────────────────────────────── */}
          {trackErr && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl px-5 py-4 mb-8 max-w-lg mx-auto"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}
            >
              <AlertCircle size={16} style={{ color: '#FCA5A5', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: '#FCA5A5' }}>{trackErr}</p>
            </motion.div>
          )}

          {/* ── Results ──────────────────────────────────────────── */}
          <AnimatePresence>
            {trackRes && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-8 mt-8"
              >
                {/* Affiliate banner */}
                <div className="rounded-2xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
                  style={{ background: 'rgba(106,189,178,0.05)', border: '1px solid rgba(106,189,178,0.16)' }}>
                  <div>
                    <p className="font-black text-sm" style={{ color: '#EAE4DF' }}>{trackRes.affiliate.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#5A8A78' }}>
                      شريك منذ {new Date(trackRes.affiliate.joined_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <StatusBadge status={trackRes.affiliate.status} />
                </div>

                {/* ── Referral link card ── */}
                {(() => {
                  const refLink = `${window.location.origin}/?ref=${trackCode.trim().toUpperCase()}`
                  return (
                    <div className="rounded-2xl overflow-hidden"
                      style={{ border: '1px solid rgba(106,189,178,0.28)', background: 'rgba(106,189,178,0.04)' }}>

                      {/* Header */}
                      <div className="px-5 py-3 flex items-center gap-2"
                        style={{ background: 'rgba(106,189,178,0.08)', borderBottom: '1px solid rgba(106,189,178,0.14)' }}>
                        <LinkIcon size={13} style={{ color: '#6ABDB2' }} />
                        <p className="text-xs font-bold" style={{ color: '#6ABDB2' }}>رابط الإحالة الخاص بك</p>
                        <span className="text-[10px] mr-auto px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(106,189,178,0.12)', color: '#4A8A7A', border: '1px solid rgba(106,189,178,0.20)' }}>
                          شاركه مع المدراء
                        </span>
                      </div>

                      <div className="px-5 py-4 flex flex-col gap-3">
                        {/* Full link row */}
                        <div>
                          <p className="text-[10px] mb-1.5 font-semibold" style={{ color: '#3D5E55' }}>الرابط الكامل</p>
                          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                            style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(106,189,178,0.15)' }}>
                            <span className="flex-1 text-xs truncate"
                              style={{ color: '#6ABDB2', direction: 'ltr', fontFamily: 'monospace' }}>
                              {refLink}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(refLink)
                                setTrackLinkCopied(true)
                                setTimeout(() => setTrackLinkCopied(false), 2500)
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-all"
                              style={{
                                background: trackLinkCopied ? 'rgba(106,189,178,0.25)' : 'rgba(106,189,178,0.12)',
                                color     : trackLinkCopied ? '#6ABDB2' : '#7A9E96',
                                border    : '1px solid rgba(106,189,178,0.25)',
                              }}>
                              {trackLinkCopied ? <Check size={12} /> : <Copy size={12} />}
                              {trackLinkCopied ? 'تم النسخ!' : 'نسخ'}
                            </button>
                          </div>
                        </div>

                        {/* How it works note */}
                        <p className="text-[11px] leading-relaxed" style={{ color: '#2E4A40' }}>
                          أي شخص يفتح هذا الرابط ويشترك في إحكام سيُسجَّل تلقائياً تحت كودك — حتى لو اشترك لاحقاً من نفس المتصفح.
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* Pending notice */}
                {trackRes.affiliate.status === 'pending' && (
                  <div className="flex items-start gap-3 rounded-xl px-5 py-4"
                    style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.20)' }}>
                    <Clock size={15} style={{ color: '#FCD34D', flexShrink: 0, marginTop: 2 }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#B89A3A' }}>
                      طلبك قيد المراجعة — العمولات المحتسبة أدناه ستُفعَّل فور قبول طلبك.
                    </p>
                  </div>
                )}

                {/* Stats — 3 cards only */}
                <div className="grid grid-cols-3 gap-4">
                  <StatCard icon={Users}        label="مجموع العملاء"  value={clientGroups.length}      accent="#6ABDB2" />
                  <StatCard icon={CheckCircle2} label="اشتراكات نشطة"  value={trackRes.active}  sub="مفعّلة ومدفوعة" accent="#10B981" />
                  <StatCard icon={Clock}        label="قيد المراجعة"   value={trackRes.pending} sub="بانتظار التفعيل"  accent="#F59E0B" />
                </div>

                {/* Commission Summary */}
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(212,188,150,0.18)', background: 'rgba(212,188,150,0.03)' }}>
                  <div className="px-6 py-3.5 flex items-center gap-2"
                    style={{ background: 'rgba(212,188,150,0.06)', borderBottom: '1px solid rgba(212,188,150,0.12)' }}>
                    <DollarSign size={14} style={{ color: '#D9C8A3' }} />
                    <p className="text-xs font-bold" style={{ color: '#D9C8A3' }}>ملخص العمولات</p>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="px-6 py-3.5 flex items-center justify-between gap-4">
                      <span className="text-xs" style={{ color: '#7A9E96' }}>إجمالي مستحق</span>
                      <span className="text-sm font-black" style={{ color: '#D9C8A3', fontFamily: 'monospace' }}>
                        ${Number(trackRes.earned ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="px-6 py-3.5 flex items-center justify-between gap-4">
                      {/* paid_out comes from affiliate_payouts table — recorded by admin on each payout */}
                      <span className="text-xs" style={{ color: '#7A9E96' }}>مدفوع للشريك</span>
                      <span className="text-sm font-black" style={{ color: '#EAE4DF', fontFamily: 'monospace' }}>
                        ${Number(trackRes.paid_out ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="px-6 py-3.5 flex items-center justify-between gap-4 rounded-b-2xl"
                      style={{ background: 'rgba(239,68,68,0.06)' }}>
                      <span className="text-xs font-bold" style={{ color: '#FCA5A5' }}>متبقي للصرف</span>
                      <span className="text-sm font-black" style={{ color: '#FCA5A5', fontFamily: 'monospace' }}>
                        ${Number(trackRes.pending_payout ?? trackRes.earned ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payout history — shown only when there are payouts */}
                {payoutsList.length > 0 && (
                  <div className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid rgba(212,188,150,0.18)' }}>
                    <div className="px-6 py-3.5 flex items-center gap-2"
                      style={{ background: 'rgba(212,188,150,0.06)', borderBottom: '1px solid rgba(212,188,150,0.12)' }}>
                      <DollarSign size={14} style={{ color: '#D9C8A3' }} />
                      <p className="text-xs font-bold" style={{ color: '#D9C8A3' }}>سجل التحويلات</p>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {payoutsList.map(p => (
                        <div key={p.id} className="px-6 py-3.5 flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold" style={{ color: '#EAE4DF' }}>
                              {p.notes || 'دفعة عمولة'}
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: '#3D5050' }}>
                              {new Date(p.paid_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <span className="text-sm font-black flex-shrink-0" style={{ color: '#6EE7B7', fontFamily: 'monospace' }}>
                            +{Number(p.amount).toFixed(2)} {p.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Client list — grouped + expandable */}
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="px-6 py-4 flex items-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <LinkIcon size={14} style={{ color: '#6ABDB2' }} />
                    <p className="text-xs font-bold" style={{ color: '#7A9E96' }}>
                      عملاؤك — {clientGroups.length} {clientGroups.length === 1 ? 'عميل' : 'عملاء'}
                    </p>
                  </div>

                  {clientGroups.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <p className="text-sm" style={{ color: '#3D5050' }}>لا توجد إحالات بعد — شارك رابطك للبدء</p>
                    </div>
                  ) : (
                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {clientGroups.map(g => {
                        const isOpen = expandedClient === g.key
                        const renewalCount = g.events.filter(e => e._isRenewal).length
                        return (
                          <div key={g.key}>
                            {/* ── Client summary row (clickable) ── */}
                            <button
                              onClick={() => setExpandedClient(isOpen ? null : g.key)}
                              className="w-full px-6 py-4 flex items-center justify-between gap-4 text-right transition-colors duration-150"
                              style={{ background: isOpen ? 'rgba(106,189,178,0.04)' : 'transparent' }}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p className="text-sm font-semibold" style={{ color: '#C4D8D4' }}>{g.name}</p>
                                  {renewalCount > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                      style={{ background: 'rgba(139,92,246,0.12)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.20)' }}>
                                      {renewalCount} تجديد
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px]" style={{ color: '#3D5050' }}>
                                  {g.events.length} {g.events.length === 1 ? 'اشتراك' : 'اشتراكات'} · آخر نشاط{' '}
                                  {new Date(g.latestDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' })}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <StatusBadge status={g.latestStatus} />
                                {g.totalCommission > 0 && (
                                  <span className="text-sm font-black" style={{ color: '#D9C8A3', fontFamily: 'monospace' }}>
                                    ${g.totalCommission.toFixed(2)}
                                  </span>
                                )}
                                {isOpen
                                  ? <ChevronUp  size={14} style={{ color: '#6ABDB2' }} />
                                  : <ChevronDown size={14} style={{ color: '#3D5050' }} />
                                }
                              </div>
                            </button>

                            {/* ── Expanded subscription detail ── */}
                            {isOpen && (
                              <div className="px-4 pb-4 pt-3"
                                style={{ background: 'rgba(106,189,178,0.025)', borderTop: '1px solid rgba(106,189,178,0.08)' }}>

                                <p className="text-[10px] font-bold tracking-widest mb-3 px-2"
                                  style={{ color: '#3D5E55' }}>
                                  سجل الاشتراكات ({g.events.length})
                                </p>

                                <div className="flex flex-col gap-2.5">
                                  {g.events.map((ev, ei) => {
                                    const isRenewal      = ev._isRenewal
                                    const accentColor    = isRenewal ? '#A78BFA' : '#10B981'
                                    const duration       = billingLabel(ev.billing_cycle)
                                    const planName       = ev.tier ?? null
                                    // Use frozen rate stored in the row; fall back to global for old rows
                                    const commissionRate = ev.commission_rate != null
                                      ? Number(ev.commission_rate)
                                      : (isRenewal ? rates.recurring : rates.first)
                                    const computedCommission = ev.commission != null
                                      ? Number(ev.commission)
                                      : ev.order_amount != null
                                        ? Math.round(Number(ev.order_amount) * commissionRate) / 100
                                        : null
                                    const expiry   = calcExpiry(ev.date, ev.billing_cycle)
                                    const days     = ev.status === 'approved' ? daysLeft(expiry) : null
                                    const eStyle   = expiryStyle(days)

                                    return (
                                      <div key={ei} className="rounded-xl overflow-hidden"
                                        style={{ border: `1px solid ${isRenewal ? 'rgba(139,92,246,0.20)' : 'rgba(16,185,129,0.18)'}` }}>

                                        {/* ── Card header ── */}
                                        <div className="flex items-center justify-between gap-3 px-4 py-2.5"
                                          style={{ background: isRenewal ? 'rgba(139,92,246,0.08)' : 'rgba(16,185,129,0.07)' }}>
                                          <div className="flex items-center gap-2">
                                            {/* dot */}
                                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                              style={{ background: accentColor }} />
                                            <span className="text-xs font-bold" style={{ color: accentColor }}>
                                              {isRenewal ? `تجديد ${ei + 1 - g.events.filter((e,j) => j < ei && !e._isRenewal).length}` : 'الاشتراك الأول'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px]" style={{ color: '#3D5E55' }}>
                                              {new Date(ev.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                            <StatusBadge status={ev.status} />
                                          </div>
                                        </div>

                                        {/* ── Card body ── */}
                                        <div className="px-4 py-3"
                                          style={{ background: 'rgba(0,0,0,0.20)' }}>

                                          {/* Plan name + duration badges */}
                                          <div className="flex items-center gap-2 flex-wrap mb-3">
                                            {planName && (
                                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                                                style={{ background: 'rgba(255,255,255,0.05)', color: '#C4D8D4', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                {planName}
                                              </span>
                                            )}
                                            {duration && (
                                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                                                style={{ background: 'rgba(106,189,178,0.10)', color: '#6ABDB2', border: '1px solid rgba(106,189,178,0.20)' }}>
                                                ⏱ {duration}
                                              </span>
                                            )}
                                            {!planName && !duration && (
                                              <span className="text-xs" style={{ color: '#3D5050' }}>—</span>
                                            )}
                                          </div>

                                          {/* Timeline row — start → expiry + days remaining */}
                                          <div className="rounded-lg px-3 py-2.5 mb-3 flex items-center gap-3 flex-wrap"
                                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>

                                            {/* Start date */}
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[9px] font-semibold" style={{ color: '#3D5E55' }}>تاريخ الاشتراك</span>
                                              <span className="text-xs font-bold" style={{ color: '#7A9E96' }}>
                                                {new Date(ev.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                                              </span>
                                            </div>

                                            {/* Arrow */}
                                            {expiry && (
                                              <span className="text-[10px]" style={{ color: '#2E4A40' }}>←</span>
                                            )}

                                            {/* Expiry + countdown */}
                                            {expiry ? (
                                              <div className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-semibold" style={{ color: '#3D5E55' }}>تاريخ الانتهاء</span>
                                                <span className="text-xs font-bold" style={{ color: eStyle?.color ?? '#7A9E96' }}>
                                                  {expiry.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="text-[10px]" style={{ color: '#2E4A40' }}>مدة الانتهاء غير محددة</span>
                                            )}

                                            {/* Days pill */}
                                            {days !== null && eStyle && (
                                              <span className="mr-auto text-[10px] font-black px-2 py-1 rounded-full"
                                                style={{ background: eStyle.bg, color: eStyle.color, border: `1px solid ${eStyle.border}` }}>
                                                {days > 0 ? `${days} يوم متبقٍ` : days === 0 ? 'ينتهي اليوم!' : 'منتهٍ'}
                                              </span>
                                            )}
                                          </div>

                                          {/* Financial row */}
                                          <div className="grid grid-cols-2 gap-3">
                                            {/* Subscription value */}
                                            <div className="rounded-lg px-3 py-2.5"
                                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                              <p className="text-[10px] mb-1" style={{ color: '#3D5E55' }}>قيمة الاشتراك</p>
                                              <p className="text-base font-black"
                                                style={{ color: '#C4D8D4', fontFamily: 'monospace', lineHeight: 1 }}>
                                                {ev.order_amount != null
                                                  ? `$${Number(ev.order_amount).toFixed(2)}`
                                                  : <span style={{ color: '#2E4A40', fontSize: '0.7rem' }}>غير محدد</span>
                                                }
                                              </p>
                                            </div>

                                            {/* Commission */}
                                            <div className="rounded-lg px-3 py-2.5"
                                              style={{ background: isRenewal ? 'rgba(139,92,246,0.08)' : 'rgba(16,185,129,0.08)',
                                                       border: `1px solid ${isRenewal ? 'rgba(139,92,246,0.18)' : 'rgba(16,185,129,0.18)'}` }}>
                                              <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-[10px]" style={{ color: '#3D5E55' }}>عمولتك</p>
                                                {!rates.loading && (
                                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                                    style={{
                                                      background: `${accentColor}22`,
                                                      color     : accentColor,
                                                      border    : `1px solid ${accentColor}44`,
                                                    }}>
                                                    {commissionRate}%
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-base font-black"
                                                style={{ color: accentColor, fontFamily: 'monospace', lineHeight: 1 }}>
                                                {computedCommission != null
                                                  ? `+$${computedCommission.toFixed(2)}`
                                                  : ev.status !== 'approved'
                                                    ? <span style={{ fontSize: '0.65rem', fontFamily: 'inherit' }}>بانتظار التفعيل</span>
                                                    : <span style={{ color: '#2E4A40', fontSize: '0.7rem' }}>غير محدد</span>
                                                }
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* Renewal nudge */}
                                {(g.latestStatus === 'rejected' || g.latestStatus === 'expired' || g.latestStatus === 'cancelled') && (
                                  <div className="mt-3 flex items-start gap-2 rounded-xl px-4 py-3"
                                    style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)' }}>
                                    <AlertCircle size={13} style={{ color: '#FCD34D', flexShrink: 0, marginTop: 1 }} />
                                    <p className="text-[11px] leading-relaxed" style={{ color: '#B89A3A' }}>
                                      اشتراك هذا العميل منتهٍ — تواصل معه وذكّره بمزايا التجديد، تجديده يمنحك عمولة إضافية.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  )
}
