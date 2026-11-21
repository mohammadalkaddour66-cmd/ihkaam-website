import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Copy, Check, Clock, ArrowLeft, LifeBuoy, Send, PenLine, PhoneCall, MonitorPlay } from 'lucide-react'
import AffiliateInvite from '../components/sections/AffiliateInvite'

/* صفحة التواصل: الزائر يبني رسالته الأولى بالنقر، فيرى ما يفيدنا أن نعرفه
   قبل أن يكتب، ثم يرسلها على واتساب جاهزة. القنوات وأوقات الرد كما كانت. */

const WA_NUMBER = '963947409106'
const MAIL_ADDR = 'ihkaamapp@gmail.com'
const INK = '#0B3B33', GOLD = '#B8863A', GOLD_TXT = '#8A6425'
const ease = [0.22, 1, 0.36, 1]

const SIZES = ['أقل من 50 طالباً', 'من 50 إلى 150', 'من 150 إلى 400', 'أكثر من 400']
const NEEDS = [
  'الحضور والتسميع',
  'التواصل مع الأهل',
  'الرسوم والأقساط',
  'الاختبارات',
  'التقارير',
  'أريد عرضاً للنظام',
]

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function Chip({ on, children, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className="rounded-full px-3.5 py-2 text-[13px] font-bold transition-all"
      style={on
        ? { background: INK, color: '#F8F5EC', boxShadow: '0 6px 14px -8px rgba(11,59,51,.6)' }
        : { background: '#FDFBF7', color: '#1A2E28', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
      {on && <Check size={12} className="inline -mt-0.5 me-1" />}{children}
    </button>
  )
}

/* ─── منشئ الرسالة: اختيارات ← فقاعة رسالة حيّة ← واتساب ─── */
function MessageBuilder() {
  const [name, setName]   = useState('')
  const [size, setSize]   = useState(SIZES[1])
  const [needs, setNeeds] = useState(['الحضور والتسميع'])

  const toggle = (n) => setNeeds(v => v.includes(n) ? v.filter(x => x !== n) : [...v, n])

  const text = useMemo(() => {
    const lines = ['السلام عليكم،']
    lines.push(name.trim() ? `معكم إدارة ${name.trim()}.` : 'أدير معهداً لتحفيظ القرآن.')
    lines.push(`عدد الطلاب عندنا: ${size}.`)
    if (needs.length) lines.push(`أريد أن أبدأ بترتيب: ${needs.join('، ')}.`)
    lines.push('كيف يمكن أن يساعدنا إحكام؟')
    return lines.join('\n')
  }, [name, size, needs])

  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`

  return (
    <div className="grid lg:grid-cols-[1fr_1.05fr] gap-0 rounded-[28px] overflow-hidden"
      style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }}>
      {/* الاختيارات */}
      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full grid place-items-center text-[12px] font-bold" style={{ background: INK, color: '#E0B562' }}>1</span>
            <label htmlFor="inst" className="font-bold text-[15px] text-[#1A2E28]">اسم المعهد</label>
            <span className="text-[12px] text-[#5E6E67]">(اختياري)</span>
          </div>
          <input id="inst" value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً: معهد النور لتحفيظ القرآن"
            className="mt-2 w-full rounded-xl px-4 py-3 text-[14px] outline-none"
            style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)', color: '#1A2E28', fontFamily: 'inherit' }} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full grid place-items-center text-[12px] font-bold" style={{ background: INK, color: '#E0B562' }}>2</span>
            <span className="font-bold text-[15px] text-[#1A2E28]">كم طالباً عندكم تقريباً؟</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SIZES.map(s => <Chip key={s} on={size === s} onClick={() => setSize(s)}>{s}</Chip>)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full grid place-items-center text-[12px] font-bold" style={{ background: INK, color: '#E0B562' }}>3</span>
            <span className="font-bold text-[15px] text-[#1A2E28]">ماذا تريد أن ترتّب أولاً؟</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {NEEDS.map(n => <Chip key={n} on={needs.includes(n)} onClick={() => toggle(n)}>{n}</Chip>)}
          </div>
        </div>
      </div>

      {/* المعاينة */}
      <div className="relative p-6 sm:p-8 flex flex-col" style={{ background: '#EFE9DC' }}>
        <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" style={{ opacity: 0.05 }} aria-hidden />
        <div className="relative flex items-center gap-3 pb-4 mb-5" style={{ borderBottom: '1px solid rgba(11,59,51,.1)' }}>
          <span className="w-10 h-10 rounded-full grid place-items-center" style={{ background: INK }}>
            <img src="/ihkaam-logo-light-sm.png" alt="" className="w-7 h-7 object-contain" />
          </span>
          <div>
            <div className="font-bold text-[14px] text-[#1A2E28]">فريق منصة إحكام</div>
            <div className="text-[12px] text-[#5E6E67] flex items-center gap-1"><Clock size={11} /> الرد عادةً خلال 24 ساعة</div>
          </div>
        </div>
        <motion.div key={text} initial={{ opacity: 0.6, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className="relative ms-auto max-w-[92%] rounded-2xl rounded-tl-md px-5 py-4 text-[15px] leading-[1.95] whitespace-pre-line text-[#1A2E28]"
          style={{ background: '#FDFBF7', boxShadow: '0 8px 20px -12px rgba(11,59,51,.45)' }}>
          {text}
          <div className="text-[11px] text-[#5E6E67] text-left mt-1">رسالتك</div>
        </motion.div>
        <div className="relative mt-auto pt-6">
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full rounded-2xl py-4 font-bold text-[15px] transition-transform hover:-translate-y-0.5"
            style={{ background: INK, color: '#F8F5EC', boxShadow: '0 14px 30px -14px rgba(8,44,38,.7)' }}>
            <WhatsAppIcon /> أرسلها على واتساب
          </a>
          <p className="text-[12px] text-[#5E6E67] text-center mt-2.5">تُفتح المحادثة والرسالة مكتوبة فيها، وتعدّلها قبل الإرسال.</p>
        </div>
      </div>
    </div>
  )
}

const AFTER = [
  { icon: Send,        title: 'ترسل رسالتك',          text: 'من واتساب أو البريد، بلا التزام ولا خصم.' },
  { icon: PhoneCall,   title: 'نرد ونسأل عن معهدك',   text: 'عدد الطلاب والحلقات، وما الذي يتعبك اليوم.' },
  { icon: MonitorPlay, title: 'نريك النظام على حالتك', text: 'كيف يعمل على حلقات مثل حلقاتك، ثم تقرر أنت.' },
]

export default function ContactPage() {
  const [copied, setCopied] = useState(false)
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(MAIL_ADDR); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* العنوان ظاهر نصّاً */ }
  }
  const mailHref = `mailto:${MAIL_ADDR}?subject=${encodeURIComponent('استفسار عن منصة إحكام')}&body=${encodeURIComponent('السلام عليكم،\n\nأريد الاستفسار عن...')}`

  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>

      {/* ─── الرأس + منشئ الرسالة ─── */}
      <section className="relative pt-28 sm:pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" aria-hidden
          style={{ opacity: 0.035, maskImage: 'radial-gradient(ellipse 60% 50% at 50% 10%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 10%, #000, transparent 75%)' }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 page-enter">
            <span className="eyebrow">تواصل معنا</span>
            <h1 className="font-bold text-[#1A2E28] mt-5 mb-4" style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)', lineHeight: 1.25 }}>
              رسالتك الأولى <span className="title-mark">جاهزة بثلاث نقرات</span>
            </h1>
            <p className="text-[17px] leading-[1.9] text-[#4A5D56]">
              اختر ما ينطبق على معهدك، فنفهم حالتك من أول رسالة ويكون ردّنا مفيداً من أول سطر.
            </p>
          </div>
          <MessageBuilder />
        </div>
      </section>

      {/* ─── قنوات أخرى ─── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {/* البريد */}
          <div className="md:col-span-2 grid sm:grid-cols-[1fr_200px] rounded-[24px] overflow-hidden"
            style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
            <div className="p-6 sm:p-7 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[13px] font-bold" style={{ color: GOLD_TXT }}><Mail size={15} /> البريد الإلكتروني</div>
              <div className="font-bold text-[20px] text-[#1A2E28]">تفضّل الكتابة المطوّلة؟</div>
              <p className="text-[14px] text-[#4A5D56] leading-relaxed">أرسل لنا ما تريد بالتفصيل، ونرد خلال 48 ساعة.</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <a href={mailHref} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold" style={{ background: INK, color: '#F8F5EC' }}>
                  <Mail size={14} /> اكتب لنا
                </a>
                <button type="button" onClick={copyEmail} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold"
                  style={{ background: '#F1ECDF', color: INK }} dir="ltr">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'نُسخ' : MAIL_ADDR}
                </button>
              </div>
            </div>
            <div className="relative hidden sm:block">
              <img src="/scenes/page-contact.webp" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
          {/* الدعم الفني */}
          <Link to="/help" className="group section-dark rounded-[24px] p-6 sm:p-7 flex flex-col gap-3 overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="pattern-layer pattern-khatam" aria-hidden />
            <div className="flex items-center gap-2 text-[13px] font-bold" style={{ color: '#E0B562' }}><LifeBuoy size={15} /> تستخدم إحكام الآن؟</div>
            <div className="font-bold text-[20px]" style={{ color: '#F8F5EC' }}>جواب سؤالك غالباً في مركز المساعدة</div>
            <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(248,245,236,.75)' }}>شرح كل شاشة خطوة بخطوة: الحضور والتسميع والاختبارات والمالية.</p>
            <span className="mt-auto inline-flex items-center gap-2 font-bold text-[14px]" style={{ color: '#E0B562' }}>
              افتح مركز المساعدة <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* ─── بعد رسالتك ─── */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center font-bold text-[#1A2E28] mb-10" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
            ماذا يحدث <span className="title-mark">بعد رسالتك؟</span>
          </h2>
          <ol className="relative grid md:grid-cols-3 gap-5">
            <span aria-hidden className="hidden md:block absolute top-[34px] inset-x-[16%] h-px"
              style={{ background: `repeating-linear-gradient(90deg, ${GOLD}88 0 6px, transparent 6px 12px)` }} />
            {AFTER.map((s, i) => (
              <motion.li key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.1 }} className="relative text-center px-4">
                <span className="relative z-10 mx-auto w-[68px] h-[68px] rounded-2xl grid place-items-center mb-4"
                  style={{ background: i === 2 ? INK : '#FDFBF7', color: i === 2 ? '#E0B562' : INK, boxShadow: `var(--shadow-md), inset 0 0 0 1px ${GOLD}44` }}>
                  <s.icon size={26} />
                </span>
                <div className="text-[12px] font-bold mb-1" style={{ color: GOLD_TXT }}>الخطوة {i + 1}</div>
                <div className="font-bold text-[18px] text-[#1A2E28] mb-1">{s.title}</div>
                <p className="text-[14px] text-[#4A5D56] leading-relaxed">{s.text}</p>
              </motion.li>
            ))}
          </ol>
          <div className="mt-12 grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { icon: PenLine, q: 'من يقرأ رسالتك؟', a: 'فريق منصة إحكام مباشرة، ولا تُستعمل لغير الرد عليك.' },
              { icon: Check,   q: 'هل يلزمك قرار قبل التواصل؟', a: 'لا. كثير من المديرين يراسلوننا وهم في مرحلة السؤال فقط.' },
            ].map((n, i) => (
              <div key={i} className="flex gap-4 rounded-2xl p-5" style={{ background: '#F1ECDF' }}>
                <span className="shrink-0 w-10 h-10 rounded-xl grid place-items-center" style={{ background: '#FDFBF7', color: INK }}><n.icon size={18} /></span>
                <div>
                  <div className="font-bold text-[15px] text-[#1A2E28]">{n.q}</div>
                  <p className="text-[14px] text-[#4A5D56] leading-relaxed mt-0.5">{n.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AffiliateInvite />
    </div>
  )
}
