import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabaseClient'
import { galleryImage } from '../../config/imageUrl'
import { USE_VIEW } from '../../config/partners'

/* التمييز بين البطاقات بالإضاءة داخل عائلةٍ واحدة، لا بدرجةٍ لونية
   جديدة لكل بطاقة.

   كانت الدورة ثلاث درجاتٍ لونية في شبكةٍ واحدة — تركوازي، ذهبي،
   تركوازي غامق. يقرؤها الزائر تصنيفاً ثم لا يجد ما تصنّفه: الوسم
   يحمل نوع الخدمة، ولونُه لا يدلّ عليه بشيء. وهي نفس العلّة التي
   عُلّقت على بطاقات قسم «قبل» فاستُقرّ فيها على لونٍ واحد.

   ثم صارت عائلة الدفء (--warm-*). والدفء فوق سطحٍ درجتُه 174°
   يشدّ الأخضر إلى الأمام: اللونان متقابلان تقريباً على العجلة،
   فكلٌّ منهما يزيد الآخر تشبّعاً في العين. فعادت العائلة تركوازية
   — نفس عائلة بطاقة «كيف يعمل» التي طلبها المستخدم — بثلاث درجات
   إضاءة من اللكنة الواحدة: 0B3B33 / 1F6F52 / 2E7A5A.
   وكلّها ≥7:1 على --canvas، فتصلح للنصّ لا للحشو وحده. */
const RUNGS = ['var(--accent-hover)', 'var(--accent)', 'var(--accent-deep)']

/* Map a DB row → card shape */
function toCard(row, idx) {
  return {
    name : row.client_name  || '—',
    role : row.client_role  || '—',
    tag  : row.service_type || '—',
    text : row.content      || '—',
    rung : RUNGS[idx % RUNGS.length],
  }
}

/* ─── شعار معهد صاحب الشهادة ───────────────────────────────────────
   جدول `testimonials` لا يحمل عمود معهد؛ صفةُ صاحب الشهادة
   (client_role) هي الموضع الوحيد الذي يُذكر فيه اسمُ معهده. فنطابقها
   على معرّفات المعاهد ونأخذ الشعار من `institute_settings.theme_config`
   — نفس المصدر الذي يقرؤه شريطُ الشركاء.

   الترتيب مقصود وأولُ مطابقةٍ تفوز: «الأنصاري» معهدان — واحدٌ في سيف
   الدولة وآخرُ في المشهد — فتُجرَّب الكلمةُ الأخصُّ أولاً، وإلّا وقع
   شعارُ أحدهما على شهادة الآخر. */
const INSTITUTE_HINTS = [
  { id: 'ansarik', keys: ['سيف الدولة'] },
  { id: 'ansari',  keys: ['الانصاري'] },
  { id: 'anwar',   keys: ['الانوار'] },
  { id: 'baidar',  keys: ['البيدر'] },
  { id: 'tawhid',  keys: ['التوحيد'] },
  { id: 'ayoubi',  keys: ['الايوبي', 'سليمان'] },
  { id: 'hasana',  keys: ['حسنة'] },
]

/* الهمزات تُكتب على أوجهٍ عدّة والتشكيل يجيء ولا يجيء — فالمطابقة على
   النصّ الخام تسقط على فرقٍ لا يراه القارئ */
function normAr(s) {
  return (s || '').replace(/[أإآٱ]/g, 'ا').replace(/[ً-ٰٟ]/g, '').trim()
}

function instituteIdFor(role) {
  const r = normAr(role)
  const hit = INSTITUTE_HINTS.find(h => h.keys.some(k => r.includes(k)))
  return hit ? hit.id : null
}

/* ─── Author logo tile ─────────────────────────────────────────────
   كان الحرفين الأوّلين من الاسم على شريحةِ صنوبر. صار شعارَ المعهد
   نفسه، وإن لم يُعرف المعهد أو سقط تحميلُ شعاره فشعارُ إحكام بديلاً.

   والشريحة على وصفة شارة الرقم في بطاقة «كيف يعمل» بالضبط: حشوٌ
   تركوازي 10% وحدٌّ 25%. كانت `--pine` — و#1F6F52 درجتُه 162°، أي
   داخل النطاق المحرَّم (70–166) أصلاً، وهي التي كانت تُرى خلف كل
   شعارٍ فيه شفافية. والظلُّ السفليّ يرفع الشريحة عن السطح فتُقرأ
   قطعةً موضوعةً عليه لا رقعةً مطبوعةً فيه. */
const IHKAAM_LOGO = '/ihkaam-app.png'

function AuthorLogo({ src, rung, big = false }) {
  /* نحفظ *أيَّ* رابطٍ سقط لا مجرّد أنّ سقوطاً حصل: فلو تغيّر الشعار
     لاحقاً جُرّب الجديدُ من تلقائه دون تصفيرٍ في effect */
  const [failedSrc, setFailedSrc] = useState(null)

  const own = Boolean(src) && failedSrc !== src
  return (
    <div
      className={`${big ? 'w-16 h-16 rounded-full' : 'w-12 h-12 rounded-xl'} overflow-hidden flex-shrink-0 flex items-center justify-center bg-white`}
      style={{
        background: `color-mix(in srgb, ${rung} 10%, transparent)`,
        border    : `1px solid color-mix(in srgb, ${rung} 25%, transparent)`,
        boxShadow : big ? '0 0 0 4px rgba(224,181,98,0.18)' : '0 4px 12px rgba(11, 59, 51, 0.084)',
      }}
    >
      {/* alt فارغ: الشعار مجاورٌ لاسم صاحبه وصفته نصّاً، فنُطقه تكرار */}
      <img
        src={own ? src : IHKAAM_LOGO}
        alt=""
        width={44}
        height={44}
        loading="lazy"
        decoding="async"
        onError={() => setFailedSrc(src)}
        style={{ width: '100%', height: '100%', objectFit: own ? 'cover' : 'contain' }}
      />
    </div>
  )
}

/* ─── Inline quote SVG ─────────────────────────────────────────── */
/* fill يُمرّر عبر style لا عبر السمة: سمات SVG التقديمية لا تقبل
   var()، فـ fill="var(--warm)" يسقط صامتاً ويعود اللون أسود. */
const QuoteIcon = ({ color, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ fill: color }} aria-hidden>
    <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.95.78-3 .53-.79 1.17-1.44 1.91-1.95L8.29 6.53C7.13 7.28 6.17 8.25 5.4 9.44c-.78 1.2-1.17 2.47-1.17 3.83 0 1.32.43 2.4 1.3 3.22.86.82 1.9 1.23 3.1 1.23 1.06 0 1.94-.34 2.64-1.02.7-.68 1.05-1.54 1.05-2.6l-.14.64zm8.56 0c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.95.78-3 .53-.79 1.17-1.44 1.91-1.95l-1.03-1.52c-1.16.75-2.12 1.72-2.89 2.91-.78 1.2-1.17 2.47-1.17 3.83 0 1.32.43 2.4 1.3 3.22.86.82 1.9 1.23 3.1 1.23 1.06 0 1.94-.34 2.64-1.02.7-.68 1.05-1.54 1.05-2.6l-.14.64z"/>
  </svg>
)

/* ─── عرض الشهادات: «منصّة» واحدة كبيرة + فهرس جانبي (2026-11-19) ────────
   كانت تسع بطاقاتٍ متشابهة في شبكة، فتُقرأ كصفحة جريدة. الآن شهادةٌ واحدة
   تتصدّر بخطٍّ كبير على لوحٍ داكن، وبجانبها فهرسٌ بأصحاب الشهادات يُختار
   منه، والتبديل تلقائيّ كل 9 ثوانٍ مع شريط تقدّم، ويتوقّف عند التمرير فوقه. */
const ROTATE_MS = 9000

function Spotlight({ cards, logos }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = cards.length
  const go = useCallback((i) => setActive(((i % n) + n) % n), [n])

  useEffect(() => {
    if (paused || n < 2) return
    const t = setTimeout(() => go(active + 1), ROTATE_MS)
    return () => clearTimeout(t)
  }, [active, paused, n, go])

  const t = cards[active]
  const logo = logos[instituteIdFor(t.role)] || null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
         onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

      {/* المنصّة */}
      <article className="section-dark lg:col-span-7 rounded-[28px] overflow-hidden p-8 sm:p-11 flex flex-col"
               style={{ boxShadow: 'var(--shadow-lg)', minHeight: 440 }} aria-live="polite">
        <div className="pattern-layer pattern-khatam" aria-hidden />
        <div className="flex items-center justify-between mb-6">
          <QuoteIcon color="#E0B562" size={54} />
          <span className="text-sm font-bold tabular-nums" style={{ color: 'rgba(248,245,236,0.6)' }}>
            {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
        </div>

        <p key={active} className="testi-in flex-1 font-bold"
           style={{ color: '#F8F5EC', fontSize: t.text.length > 260 ? '1.15rem' : t.text.length > 140 ? '1.35rem' : '1.6rem', lineHeight: 1.9 }}>
          {t.text}
        </p>

        <div className="mt-8 flex items-center gap-4">
          <AuthorLogo src={logo} rung="#E0B562" big />
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold" style={{ color: '#E0B562' }}>{t.name}</span>
            <span className="text-sm" style={{ color: 'rgba(248,245,236,0.72)' }}>{t.role}</span>
          </div>
          <div className="ms-auto flex gap-2">
            <button type="button" onClick={() => go(active - 1)} aria-label="الشهادة السابقة"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
                    style={{ border: '1px solid rgba(224,181,98,0.4)', color: '#E0B562' }}>
              <ChevronRight size={18} />
            </button>
            <button type="button" onClick={() => go(active + 1)} aria-label="الشهادة التالية"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: '#E0B562', color: '#0B3B33' }}>
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* شريط التقدّم */}
        <div className="mt-7 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(248,245,236,0.12)' }}>
          <div key={`${active}-${paused}`} className={paused ? '' : 'testi-progress'}
               style={{ height: '100%', background: '#E0B562', width: paused ? '0%' : undefined, '--testi-ms': `${ROTATE_MS}ms` }} />
        </div>
      </article>

      {/* الجوال: شريط شعارات أفقي بدل الفهرس الطويل */}
      <div className="lg:hidden flex gap-2.5 overflow-x-auto pb-2 testi-list" style={{ scrollSnapType: 'x mandatory' }}>
        {cards.map((c, i) => (
          <button key={c.name + i} type="button" onClick={() => go(i)} aria-label={c.name}
                  className="flex-shrink-0 rounded-2xl p-1.5 transition-all duration-300"
                  style={{ scrollSnapAlign: 'start', background: '#fff', boxShadow: i === active ? 'inset 0 0 0 2px #B8863A' : 'inset 0 0 0 1px var(--line-warm)', opacity: i === active ? 1 : 0.7 }}>
            <AuthorLogo src={logos[instituteIdFor(c.role)] || null} rung="#B8863A" />
          </button>
        ))}
      </div>

      {/* الفهرس */}
      <ul className="hidden lg:flex lg:col-span-5 flex-col gap-2.5 lg:max-h-[560px] lg:overflow-y-auto lg:pe-1 testi-list">
        {cards.map((c, i) => {
          const on = i === active
          return (
            <li key={c.name + i}>
              <button type="button" onClick={() => go(i)}
                      className="w-full text-start rounded-2xl p-4 flex items-start gap-3.5 transition-all duration-300"
                      style={{
                        background: on ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                        boxShadow : on ? 'var(--shadow-md), inset 0 0 0 1.5px rgba(184,134,58,0.55)' : 'inset 0 0 0 1px var(--line-warm)',
                        transform : on ? 'translateX(-4px)' : 'none',
                      }}>
                <AuthorLogo src={logos[instituteIdFor(c.role)] || null} rung="#B8863A" />
                <span className="flex flex-col gap-1 min-w-0">
                  <span className="text-base font-bold" style={{ color: on ? '#0B3B33' : 'var(--text-1)' }}>{c.name}</span>
                  <span className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{c.role}</span>
                  <span className="text-sm line-clamp-2 mt-0.5" style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>{c.text}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ─── Loading skeleton ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-[28px] p-8 flex flex-col gap-4 bg-white" style={{ boxShadow: 'var(--shadow-sm)', minHeight: 440 }}>
      {[92, 80, 87, 65].map(w => (
        <div key={w} className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(11, 59, 51, 0.07)', width: `${w}%` }} />
      ))}
    </div>
  )
}

/* ─── Section ──────────────────────────────────────────────────── */
/* العنوان يختلف بين الرئيسية وصفحة «من نحن» حتى لا يتكرر H2 واحد في صفحتين (ISS-16). */
export default function TestimonialsSection({ titleLead = 'شركاء النجاح..', titleAccent = 'شهادات تصنع الفارق' } = {}) {
  const [cards,   setCards]   = useState([])
  const [loading, setLoading] = useState(true)
  const [logos,   setLogos]   = useState({})

  useEffect(() => {
    async function fetchApproved() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('client_name, client_role, service_type, content')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })

        if (error) throw error
        setCards(data ? data.map(toCard) : [])
      } catch {
        setCards([])
      } finally {
        setLoading(false)
      }
    }
    fetchApproved()
  }, [])

  /* الشعارات في طلبٍ منفصل: البطاقات لا تنتظرها — تُرسم بشعار إحكام ثم
     يحلُّ شعارُ المعهد مكانه حين يجيء. وتُطلب مُصغّرةً من الخادم لأن
     ملفاتها الأصلية بحجم الشاشة والشريحةُ 44px. */
  /* ISS-35: بعد تطبيق ترحيل 20261120b (والبناء بـVITE_PARTNERS_VIEW=1) تأتي
     الشعارات من الدالة get_institute_logos لمعرّفات المعاهد المعروفة هنا فقط،
     لا من قراءة الجدول كله. قبله يبقى الاستعلام المشترك مع الشركاء (ISS-28). */
  useEffect(() => {
    const toMap = (rows, pick) => {
      const map = {}
      for (const row of rows || []) {
        const url = pick(row)
        if (url) map[row.institute_id] = galleryImage(url, 96)
      }
      setLogos(map)
    }
    const fromTable = () => supabase
      .from('institute_settings')
      .select('institute_id, name, theme_config')
      .eq('is_deleted', false)
      .then(({ data }) => toMap(data, r => r.theme_config?.logo_url))
    if (!USE_VIEW) { fromTable(); return }
    supabase
      .rpc('get_institute_logos', { p_ids: INSTITUTE_HINTS.map(h => h.id) })
      .then(({ data, error }) => (error ? fromTable() : toMap(data, r => r.logo_url)))
  }, [])

  if (!loading && cards.length === 0) return null

  return (
    <section id="testimonials" className="relative z-10 py-28">

      <div className="relative max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          {/* عنوانُ القسم على هيئة شارة «كيف يعمل» نفسها: نصٌّ عارٍ
             كان يقف بلا سطحٍ فوق شبكةٍ كلُّ بطاقةٍ فيها محدودة */}
          <span className="eyebrow">شهادات العملاء</span>
          <h2
            className="font-bold mt-5 mb-5 mx-auto"
            style={{
              color   : 'var(--text-1)',
              fontSize: 'clamp(1.9rem, 3.6vw, 2.9rem)',
              maxWidth: '680px',
            }}
          >
            {titleLead}{' '}
            <span className="title-mark">{titleAccent}</span>
          </h2>
          <p
            className="text-lg leading-[2] mx-auto"
            style={{ color: 'var(--text-2)', maxWidth: '560px' }}
          >
            قصص حقيقية لمؤسسات استردت وقتها ومالها وتحولت إلى الأنظمة الرقمية الذكية.
          </p>
        </div>

        {loading
          ? <div className="grid grid-cols-1 lg:grid-cols-12 gap-6"><div className="lg:col-span-7"><SkeletonCard /></div><div className="lg:col-span-5"><SkeletonCard /></div></div>
          : <Spotlight cards={cards} logos={logos} />}

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>
            هل استفدت من نظام إحكام؟
          </p>
          {/* كان زراً بلونٍ دافئ وثلاثة معالجات hover بالـinline style.
              و‍.btn-outline هو نفس زرّ «اكتشف الميزات أولاً» في قسم
              «كيف يعمل» — نفس اللكنة ونفس الحركة، بلا JS */}
          <Link
            to="/review"
            className="btn-outline inline-flex items-center gap-2.5 rounded-full px-8 py-4"
            style={{ fontSize: '0.9rem' }}
          >
            شاركنا تجربتك
          </Link>
        </div>

      </div>
    </section>
  )
}
