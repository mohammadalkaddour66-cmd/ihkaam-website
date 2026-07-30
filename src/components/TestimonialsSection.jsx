import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../config/supabaseClient'
import { galleryImage } from '../config/imageUrl'

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
   إضاءة من اللكنة الواحدة: 6FE7DE / 48D6CD / 2FAEB4.
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
   تركوازي 10% وحدٌّ 25%. كانت `--pine` — و#24735C درجتُه 162°، أي
   داخل النطاق المحرَّم (70–166) أصلاً، وهي التي كانت تُرى خلف كل
   شعارٍ فيه شفافية. والظلُّ السفليّ يرفع الشريحة عن السطح فتُقرأ
   قطعةً موضوعةً عليه لا رقعةً مطبوعةً فيه. */
const IHKAAM_LOGO = '/ihkaam-app.png'

function AuthorLogo({ src, rung }) {
  /* نحفظ *أيَّ* رابطٍ سقط لا مجرّد أنّ سقوطاً حصل: فلو تغيّر الشعار
     لاحقاً جُرّب الجديدُ من تلقائه دون تصفيرٍ في effect */
  const [failedSrc, setFailedSrc] = useState(null)

  const own = Boolean(src) && failedSrc !== src
  return (
    <div
      className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{
        background: `color-mix(in srgb, ${rung} 10%, transparent)`,
        border    : `1px solid color-mix(in srgb, ${rung} 25%, transparent)`,
        boxShadow : '0 4px 12px rgba(0,0,0,0.28)',
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

/* ─── Card ─────────────────────────────────────────────────────── */
function TestimonialCard({ t, logo }) {
  return (
    <article className="testimonial-card ps-9 pe-7 py-7 flex flex-col gap-5 text-start">

      {/* وهجُ الزاوية — نفس ما في بطاقات باقي الموقع */}
      <div
        className="pointer-events-none absolute top-0 end-0 w-36 h-36"
        style={{ background: `radial-gradient(circle at top left, color-mix(in srgb, ${t.rung} 11%, transparent), transparent 66%)` }}
        aria-hidden
      />

      {/* علامةُ الاقتباس زخرفةٌ خلف النصّ لا أيقونةٌ فوقه: شفافيةٌ
          واطئة جداً فلا تزاحم القراءة، و aria-hidden فلا تُنطق */}
      <div className="pointer-events-none absolute -top-1 start-6 opacity-[0.07]" aria-hidden>
        <QuoteIcon color={t.rung} size={92} />
      </div>

      {/* Tag */}
      <span
        className="relative self-end text-[10px] font-bold px-3 py-1 rounded-full"
        style={{
          background: `color-mix(in srgb, ${t.rung} 12%, transparent)`,
          color     : t.rung,
          border    : `1px solid color-mix(in srgb, ${t.rung} 26%, transparent)`,
        }}
      >
        {t.tag}
      </span>

      {/* Quote text */}
      <p className="relative text-sm leading-[2.1] flex-1" style={{ color: 'var(--text-1)' }}>
        {t.text}
      </p>

      <div className="divider-testimonial" />

      {/* Author */}
      <div className="relative flex items-center gap-3.5">
        <AuthorLogo src={logo} rung={t.rung} />
        <div className="flex flex-col gap-0.5 text-start">
          <span className="text-sm font-bold" style={{ color: t.rung }}>
            {t.name}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {t.role}
          </span>
        </div>
      </div>
    </article>
  )
}

/* ─── Loading skeleton ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="testimonial-card ps-9 pe-7 py-7 flex flex-col gap-5">
      <div className="self-end h-5 w-28 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="flex flex-col gap-2.5 flex-1">
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: '92%' }} />
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: '80%' }} />
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: '87%' }} />
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: '65%' }} />
      </div>
      <div className="divider-testimonial" />
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="flex flex-col gap-1.5 text-start">
          <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-2.5 w-32 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Section ──────────────────────────────────────────────────── */
export default function TestimonialsSection() {
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
  useEffect(() => {
    supabase
      .from('institute_settings')
      .select('institute_id, theme_config')
      .eq('is_deleted', false)
      .then(({ data }) => {
        if (!data) return
        const map = {}
        for (const row of data) {
          const url = row.theme_config?.logo_url
          if (url) map[row.institute_id] = galleryImage(url, 96)
        }
        setLogos(map)
      })
  }, [])

  if (!loading && cards.length === 0) return null

  return (
    <section id="testimonials" className="relative z-10 py-28">

      {/* وهجا القسم — مصدرا الضوء. كان الثاني --pine (162°) وهو
          الأخضر الذي كان يصبغ أسفل القسم كلّه */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px]"
        style={{
          background: 'radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 9%, transparent) 0%, transparent 65%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px]"
        style={{
          background: 'radial-gradient(circle at bottom left, color-mix(in srgb, var(--accent-deep) 12%, transparent) 0%, transparent 65%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          {/* عنوانُ القسم على هيئة شارة «كيف يعمل» نفسها: نصٌّ عارٍ
             كان يقف بلا سطحٍ فوق شبكةٍ كلُّ بطاقةٍ فيها محدودة */}
          <span
            className="inline-flex items-center rounded-full px-5 py-2 text-xs font-bold tracking-[0.22em] uppercase mb-5"
            style={{
              background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
              border    : '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
              color     : 'var(--accent)',
            }}
          >
            شهادات العملاء
          </span>
          <h2
            className="font-black leading-tight mb-5 mx-auto"
            style={{
              color   : 'var(--text-1)',
              fontSize: 'clamp(1.7rem, 3.5vw, 2.7rem)',
              maxWidth: '680px',
            }}
          >
            شركاء النجاح..{' '}
            <span style={{ color: 'var(--accent)' }}>شهادات تصنع الفارق</span>
          </h2>
          <p
            className="text-sm leading-[2] mx-auto"
            style={{ color: 'var(--text-2)', maxWidth: '560px' }}
          >
            قصص حقيقية لمؤسسات استردت وقتها ومالها وتحولت إلى الأنظمة الرقمية الذكية.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading
            ? [0, 1].map(i => <SkeletonCard key={i} />)
            : cards.map((t, i) => (
                <TestimonialCard
                  key={t.name + i}
                  t={t}
                  logo={logos[instituteIdFor(t.role)] || null}
                />
              ))
          }
        </div>

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
            className="btn-outline inline-flex items-center gap-2.5 rounded-xl px-8 py-4"
            style={{ fontSize: '0.9rem' }}
          >
            شاركنا تجربتك
          </Link>
        </div>

      </div>
    </section>
  )
}
