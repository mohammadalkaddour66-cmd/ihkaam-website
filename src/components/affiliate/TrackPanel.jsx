import { useState } from 'react'
import { Search, Users, BadgeCheck, Wallet, TrendingUp, Clock, Copy, Check, Link2 } from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { AFFILIATE_PCT, AFFILIATE_WINDOW_D, AFFILIATE_UPGRADE_D, affiliateLink } from '../../config/affiliate'

const INK = '#0B3B33'

const AFF_STATUS = {
  pending : { label: 'طلبك قيد المراجعة', note: 'يُفعَّل رمزك بعد موافقة الفريق.',        bg: 'rgba(184,134,58,.10)', fg: '#8A6425' },
  active  : { label: 'شريك فعّال',         note: 'رمزك يعمل، وكل معهد يشترك عبره يُسجَّل لك.', bg: 'rgba(31,111,82,.10)',  fg: '#1F6F52' },
  approved: { label: 'شريك فعّال',         note: 'رمزك يعمل، وكل معهد يشترك عبره يُسجَّل لك.', bg: 'rgba(31,111,82,.10)',  fg: '#1F6F52' },
  rejected: { label: 'لم يُقبل الطلب',     note: 'للاستفسار راسلنا من صفحة التواصل.',        bg: 'rgba(160,60,40,.08)',  fg: '#9A3B28' },
}
const REQ_STATUS = {
  pending : { label: 'قيد المعالجة', fg: '#8A6425', bg: 'rgba(184,134,58,.10)' },
  approved: { label: 'فُعّل',         fg: '#1F6F52', bg: 'rgba(31,111,82,.10)' },
  rejected: { label: 'لم يكتمل',      fg: '#9A3B28', bg: 'rgba(160,60,40,.08)' },
}

const isAnnual = (c) => ['annual', 'yearly', '12', '12_months'].includes(String(c ?? '').trim().toLowerCase())

/* حالة العمولة تأتي من الدالة في القاعدة (commission_state): أول اشتراك سنوي مدفوع فقط.
   الاحتياط أدناه لدالةٍ أقدم لا تُرجع الحقل: يُستنتج من الحالة والدورة. */
const stateOf = (r) => {
  if (r.commission_state) return r.commission_state
  if (r.status === 'rejected') return 'rejected'
  if (r.status !== 'approved') return 'pending'
  return isAnnual(r.billing_cycle) ? 'counted' : 'not_annual'
}
const STATE_NOTE = {
  counted         : '',
  awaiting_payment: 'بانتظار الدفع',
  not_annual      : 'لا عمولة على الشهري',
  repeat          : 'تجديد: لا عمولة',
  outside_window  : `ترقية بعد ${AFFILIATE_UPGRADE_D} يوماً: لا عمولة`,
  pending         : 'بانتظار الدفع',
  rejected        : 'لم يكتمل',
}
const money    = (n) => `${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}$`
const dateAr   = (d) => { try { return new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return '' } }

function Stat({ icon: Icon, label, value, tone = INK }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
      <span className="w-9 h-9 rounded-xl grid place-items-center mb-3" style={{ background: 'rgba(11,59,51,.06)' }}>
        <Icon size={17} color={tone} />
      </span>
      <div className="font-black text-[26px] leading-none" style={{ color: tone }}>{value}</div>
      <div className="text-[12.5px] font-bold mt-2 text-[#4A5D56]">{label}</div>
    </div>
  )
}

export default function TrackPanel({ prefill = '' }) {
  const [code,    setCode]    = useState(prefill)
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')
  const [res,     setRes]     = useState(null)
  const [copied,  setCopied]  = useState('')

  function copy(what, text) {
    const done = () => { setCopied(what); setTimeout(() => setCopied(''), 2200) }
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(text).then(done).catch(() => {}) }
  }

  /* رمزٌ جديد من الرابط يملأ الحقل: يُضبط أثناء التصيير لا في effect
     (النمط الذي توصي به React بدل setState متزامن داخل effect). */
  const [lastPrefill, setLastPrefill] = useState(prefill)
  if (prefill !== lastPrefill) {
    setLastPrefill(prefill)
    if (prefill) setCode(prefill)
  }

  async function lookup(e) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!clean) return
    setLoading(true); setErr(''); setRes(null)
    const { data, error } = await supabase.rpc('get_affiliate_stats', { p_code: clean })
    setLoading(false)
    if (error) {
      setErr('تعذّر الاتصال بالخدمة الآن. حاول بعد قليل، وإن استمر الأمر راسلنا من صفحة التواصل.')
      return
    }
    if (!data?.affiliate) {
      setErr('لم نجد هذا الرمز. تأكد من كتابته كما وصلك، مثل IHK-AB12CD.')
      return
    }
    setRes({ ...data, code: clean })
  }

  /* القاعدة الجارية: العمولة على أول اشتراك سنوي معتمد فقط. الدالة في القاعدة تحسب
     كل طلبٍ معتمد، فنُرشّح هنا بالدورة كي لا تظهر عمولةٌ على اشتراكٍ شهري. */
  const refs      = res?.referrals ?? []
  const counted   = refs.filter(r => stateOf(r) === 'counted')
  const earned    = counted.reduce((s, r) => s + Number(r.commission || 0), 0)
  const paid      = Number(res?.paid_out || 0)
  const remaining = Math.max(0, earned - paid)
  const aff       = res ? (AFF_STATUS[res.affiliate.status] ?? AFF_STATUS.pending) : null

  return (
    <div>
      <form onSubmit={lookup} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search size={17} className="absolute top-1/2 -translate-y-1/2 right-4 text-[#5E6E67] pointer-events-none" />
          <input value={code} onChange={e => setCode(e.target.value)} dir="ltr" autoComplete="off" spellCheck={false}
            placeholder="IHK-XXXXXX" aria-label="رمز الإحالة"
            className="w-full rounded-xl py-3.5 pe-4 ps-4 text-[15px] tracking-[0.08em] outline-none"
            style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)', color: '#1A2E28', fontFamily: 'inherit', textAlign: 'center' }} />
        </div>
        <button type="submit" disabled={loading || !code.trim()} className="btn-cta rounded-xl disabled:opacity-60" style={{ padding: '0.85rem 1.6rem' }}>
          {loading ? 'جاري البحث…' : 'اعرض إحالاتي'}
        </button>
      </form>

      {err && <p role="alert" className="text-center text-[14px] mt-4" style={{ color: '#8A6425' }}>{err}</p>}

      {res && (
        <div className="mt-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4"
            style={{ background: aff.bg, boxShadow: `inset 0 0 0 1px ${aff.fg}33` }}>
            <div>
              <div className="font-black text-[17px]" style={{ color: INK }}>أهلاً {res.affiliate.name}</div>
              <div className="text-[13px] mt-0.5" style={{ color: '#4A5D56' }}>{aff.note}</div>
            </div>
            <span className="rounded-full px-3.5 py-1.5 text-[12.5px] font-bold" style={{ background: '#FDFBF7', color: aff.fg }}>{aff.label}</span>
          </div>

          {/* رابط الشريك ورمزه حاضران دائماً في ملفه، مهما كانت حالة طلبه، ليجد ما ينسخه متى شاء */}
          <div className="rounded-2xl p-5" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-5">
              <div>
                <div className="text-[14px] font-black mb-1" style={{ color: INK }}>الرابط: للمشاركة مع غيرك</div>
                <p className="text-[12.5px] leading-[1.8] text-[#4A5D56] mb-3">
                  أرسله لمن يدير معهداً. كل من يفتحه ثم يطلب النظام يُسجَّل لك تلقائياً لمدة {AFFILIATE_WINDOW_D} يوماً، دون أن يكتب شيئاً.
                </p>
                <div dir="ltr" className="rounded-xl px-4 py-3 text-[13px] truncate select-all mb-2"
                  style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)', color: '#1A2E28' }}>{affiliateLink(res.code)}</div>
                <button type="button" onClick={() => copy('link', affiliateLink(res.code))}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold cursor-pointer w-full sm:w-auto"
                  style={{ background: INK, color: '#F8F5EC' }}>
                  {copied === 'link' ? <><Check size={14} /> نُسخ</> : <><Link2 size={14} /> نسخ الرابط</>}
                </button>
              </div>
              <div>
                <div className="text-[14px] font-black mb-1" style={{ color: INK }}>الرمز: مفتاح ملفك أنت</div>
                <p className="text-[12.5px] leading-[1.8] text-[#4A5D56] mb-3">
                  تكتبه في هذه الصفحة لتتابع إحالاتك وعمولتك. هو لك وحدك، فلا تعطه لأحد، وإن ضاع فراسلنا.
                </p>
                <div dir="ltr" className="rounded-xl px-4 py-3 text-[13px] font-black tracking-[0.1em] text-center select-all mb-2"
                  style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)', color: INK }}>{res.code}</div>
                <button type="button" onClick={() => copy('code', res.code)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold cursor-pointer w-full sm:w-auto"
                  style={{ background: '#F8F5EC', color: INK, boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                  {copied === 'code' ? <><Check size={14} /> نُسخ</> : <><Copy size={14} /> نسخ الرمز</>}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat icon={Users}     label="معاهد سجّلت برمزك"     value={res.total ?? refs.length} />
            <Stat icon={BadgeCheck} label="اشتراكات محتسبة لك" value={counted.length} tone="#1F6F52" />
            <Stat icon={TrendingUp} label="عمولتك المستحقة"       value={money(earned)} tone="#8A6425" />
            <Stat icon={Wallet}     label="المتبقي لك"            value={money(remaining)} tone="#8A6425" />
          </div>
          {paid > 0 && <p className="text-[13px] text-center text-[#4A5D56]">دُفع لك حتى الآن {money(paid)}.</p>}

          <div className="rounded-2xl overflow-hidden" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
            <div className="px-5 py-4 font-black text-[15px]" style={{ color: INK, borderBottom: '1px solid var(--line-warm)' }}>المعاهد التي أحلتها</div>
            {refs.length === 0 ? (
              <p className="px-5 py-8 text-center text-[14px] text-[#5E6E67]">لا إحالات بعد. شارك رابطك وستظهر هنا حين يطلب معهد النظام.</p>
            ) : (
              <ul>
                {refs.map(r => {
                  const st = REQ_STATUS[r.status] ?? REQ_STATUS.pending
                  const annual = isAnnual(r.billing_cycle)
                  return (
                    <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4" style={{ borderTop: '1px solid var(--line-warm)' }}>
                      <div className="flex-1 min-w-[180px]">
                        <div className="font-bold text-[15px] text-[#1A2E28]">{r.name}</div>
                        <div className="text-[12.5px] text-[#5E6E67]">
                          {r.tier || 'باقة'} · {annual ? 'سنوي' : 'شهري'} · {dateAr(r.date)}
                        </div>
                        {r.upgrade_by && (
                          <div className="text-[12.5px] font-bold mt-1" style={{ color: '#8A6425' }}>
                            إن رُقّي إلى سنوي قبل {dateAr(r.upgrade_by)} تُحتسب لك {AFFILIATE_PCT}%.
                          </div>
                        )}
                      </div>
                      <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: st.bg, color: st.fg }}>{st.label}</span>
                      <div className="min-w-[96px] text-end text-[14px] font-black" style={{ color: '#8A6425', unicodeBidi: 'plaintext' }}>
                        {stateOf(r) === 'counted'
                          ? `+${money(r.commission)}`
                          : <span className="font-bold text-[12px] text-[#5E6E67] inline-flex items-center gap-1">
                              {stateOf(r) === 'awaiting_payment' && <Clock size={12} />}{STATE_NOTE[stateOf(r)]}
                            </span>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <p className="text-[12.5px] text-center text-[#5E6E67]">العمولة {AFFILIATE_PCT}% من أول اشتراك سنوي، وتُحتسب بعد استلام الدفعة الفعلية. وإن بدأ المعهد شهرياً ثم دفع سنوياً وأكّدنا استلام دفعته خلال {AFFILIATE_UPGRADE_D} يوماً من تفعيل حسابه (وتدخل فيها أيام التجربة)، تُحتسب لك تلقائياً.</p>
        </div>
      )}
    </div>
  )
}
