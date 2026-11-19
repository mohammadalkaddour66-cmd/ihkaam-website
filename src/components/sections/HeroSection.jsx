import { useState, useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Star, BellRing, CalendarCheck } from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { galleryImage } from '../../config/imageUrl'

/* ══════════════════════════════════════════════════════════════════
   الهيرو — أول ما يُرسم في الموقع، فهو مبنيّ ليظهر من HTML وحده (ISS-25/26/27):

   • النص والصورة الأولى في HTML المُصيَّر مسبقاً. قائمة لقطات الهيرو تُجلب
     وقت البناء (scripts/prerender.mjs) وتُكتب في الصفحة كتلةَ بيانات
     <script id="hero-shots">، ومعها preload للصورة الأولى. الجلب الحيّ
     احتياطٌ لبيئة التطوير أو لبناءٍ فشل فيه الجلب، ويجري بعد أول رسم.
   • الحركة كلها CSS (hero-float / hero-rise / hero-slide / hero-fade)،
     فلا يحتاج الهيرو مكتبة framer-motion، ونص العنوان لا يبدأ شفافاً.
   • الجوال وسطح المكتب يُرسمان معاً ويُخفي CSS ما لا يخصّ الشاشة، حتى
     يطابق HTML المُصيَّر مسبقاً ما يرسمه المتصفح فلا تفشل التهيئة.

   الشكل (2026-11-19): قسمٌ داكن بالأخضر الحبريّ ونقش النجمة الثُّمانية،
   وموك-أب أجهزة: حاسوبٌ محمول بمنظورٍ خفيف، وهاتفٌ بإطارٍ معدنيّ أمامه،
   وكتلةٌ عضوية متدرّجة من الذهب إلى الأخضر خلفهما. اللقطات نفسها لم تتغيّر.
   ══════════════════════════════════════════════════════════════════ */

const PHONE_W  = 400

/* لقطات البناء: على الخادم من prerender.mjs، وفي المتصفح من كتلة البيانات. */
function getBakedHeroShots() {
  if (typeof document === 'undefined') return globalThis.__HERO_SHOTS__ ?? null
  try {
    const el = document.getElementById('hero-shots')
    return el ? JSON.parse(el.textContent) : null
  } catch {
    return null
  }
}

/* نموذج طلب التجربة ومكتبة الحركة التي يحتاجها لا يُحمَّلان إلا عند الحاجة. */
const loadDemoForm = () => Promise.all([import('framer-motion'), import('../forms/DemoRequestForm')])
const prefetchDemoForm = () => { loadDemoForm().catch(() => {}) }
const DemoFormPresence = lazy(() => loadDemoForm().then(([{ AnimatePresence }, { default: DemoRequestForm }]) => ({
  default: function DemoFormPresence({ open, onClose }) {
    return (
      <AnimatePresence>
        {open && <DemoRequestForm key="demo-form" onClose={onClose} />}
      </AnimatePresence>
    )
  },
})))

/* حركة الطفو: CSS بمتغيّرات، تتوقف عند طلب تقليل الحركة (index.css). */
const floatStyle = (range, duration, delay = 0) => ({
  '--float-range': `${range}px`,
  '--float-dur'  : `${duration}s`,
  '--float-delay': `${delay}s`,
})
const riseStyle = (delay) => ({ '--rise-delay': `${delay}s` })

/* ─────────────────────────────────────────
   الكتلة العضوية خلف الأجهزة — ذهبٌ إلى أخضر
───────────────────────────────────────── */
function HeroBlob({ className = '' }) {
  return (
    <svg className={`absolute pointer-events-none ${className}`} viewBox="0 0 600 520" aria-hidden>
      <defs>
        <linearGradient id="hero-blob-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#E0B562" />
          <stop offset="55%"  stopColor="#B8863A" />
          <stop offset="100%" stopColor="#2E7A5A" />
        </linearGradient>
        <radialGradient id="hero-blob-shine" cx="30%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M318 18C420 6 540 64 576 170c36 106-6 214-86 280s-208 78-312 44S8 382 20 262 120 86 196 48c40-20 80-26 122-30Z"
        fill="url(#hero-blob-g)"
      />
      <path
        d="M318 18C420 6 540 64 576 170c36 106-6 214-86 280s-208 78-312 44S8 382 20 262 120 86 196 48c40-20 80-26 122-30Z"
        fill="url(#hero-blob-shine)"
      />
      <path
        d="M330 4C452-6 588 66 594 196c6 128-74 236-190 286"
        fill="none" stroke="#E0B562" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round"
      />
    </svg>
  )
}

/* ─────────────────────────────────────────
   موك-أب اليد والهاتف (2026-11-19)
   صورة يدٍ حقيقية تحمل هاتفاً (CC0، public/mockup/CREDITS.txt) قُصّت
   خلفيتها وشاشتها، فتجلس لقطة التطبيق الحقيقية خلف الإطار تماماً.
   مستطيل الشاشة مقيس من الصورة: 336,92 → 704,882 من 1024.
───────────────────────────────────────── */
const SCREEN = { left: 336 / 1024, top: 92 / 1024, width: 368 / 1024, height: 790 / 1024 }
const pct = (v) => `${(v * 100).toFixed(2)}%`

function HandPhone({ phoneImg, phoneIdx, phoneImages, fade }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
      {/* ظلّ الهاتف على الكتلة — عنصرٌ مستقلّ لا filter: drop-shadow على صورةٍ شفّافة
         يجعل كروم يرسمها طبقةً معتمة تغطّي فتحة الشاشة فتختفي اللقطة */}
      <div aria-hidden className="absolute pointer-events-none" style={{ left: '30%', top: '14%', width: '44%', height: '82%', borderRadius: '30%', background: 'rgba(0,0,0,0.45)', filter: 'blur(40px)', transform: 'translate(6%, 5%)' }} />

      {/* لقطة التطبيق: خلف صورة اليد، داخل مستطيل الشاشة */}
      <div
        className="absolute overflow-hidden bg-[#F8F5EC]"
        style={{ left: pct(SCREEN.left), top: pct(SCREEN.top), width: pct(SCREEN.width), height: pct(SCREEN.height), borderRadius: '11% / 5.2%' }}
      >
        {phoneImg && (
          <img
            key={`phone-${phoneIdx}`}
            src={galleryImage(phoneImg.image_url, PHONE_W)}
            alt={phoneImg.title}
            width={PHONE_W}
            height={PHONE_W * 2}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover object-top${fade ? ' hero-fade' : ''}`}
            style={{ paddingTop: '9%' }}
            draggable={false}
          />
        )}
        {phoneImages.length > 1 && (
          <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {phoneImages.map((_, i) => (
              <span key={i} style={{
                width: i === phoneIdx ? 12 : 4, height: 4, borderRadius: 2,
                background: i === phoneIdx ? '#0B3B33' : 'rgba(11, 59, 51, 0.30)',
                transition: 'width 300ms ease',
              }} />
            ))}
          </div>
        )}
        {/* انعكاس الزجاج */}
        <div aria-hidden className="absolute inset-0 pointer-events-none"
             style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 26%, transparent 42%)' }} />
      </div>

      {/* اليد والإطار فوق اللقطة */}
      <img
        src="/mockup/hand-phone.webp"
        alt=""
        aria-hidden
        width={900}
        height={900}
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        draggable={false}
      />
    </div>
  )
}

/* ── أدوات عائمة: مقاطع من واجهة إحكام تظهر واحدةً بعد الأخرى ── */
function Widget({ children, style, delay, range = 4, dur = 5 }) {
  return (
    <div className="hero-rise absolute z-20" style={{ ...style, ...riseStyle(delay) }}>
      <div
        className="hero-float rounded-2xl bg-white"
        style={{ boxShadow: '0 24px 48px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(184,134,58,0.28)', ...floatStyle(range, dur, delay) }}
      >
        {children}
      </div>
    </div>
  )
}

function RecitationWidget() {
  return (
    <div className="px-4 py-3 flex items-center gap-3" style={{ minWidth: 230 }}>
      <span className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(145deg,#ECC77D,#B8863A)', color: '#0B3B33' }}>ع</span>
      <span className="flex flex-col leading-tight gap-1">
        <span className="text-xs font-bold" style={{ color: '#5E6E67' }}>تسميع جديد · سورة الملك</span>
        <span className="text-sm font-bold" style={{ color: '#0B3B33' }}>عبد الرحمن — الآيات 1 إلى 15</span>
      </span>
      <span className="ms-auto flex flex-col items-center gap-0.5">
        <span className="flex text-[#B8863A]">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={10} fill="currentColor" strokeWidth={0} />)}</span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(31,111,82,0.10)', color: '#1F6F52' }}>ممتاز</span>
      </span>
    </div>
  )
}

function AttendanceWidget() {
  const r = 22, c = 2 * Math.PI * r, done = 28 / 30
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="#EFE9DB" strokeWidth="6" />
        <circle cx="28" cy="28" r={r} fill="none" stroke="#1F6F52" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${c * done} ${c}`} transform="rotate(-90 28 28)" className="hero-ring" style={{ '--ring-len': c }} />
        <text x="28" y="33" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0B3B33">93%</text>
      </svg>
      <span className="flex flex-col leading-tight gap-1">
        <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#5E6E67' }}><CalendarCheck size={12} /> حضور اليوم</span>
        <span className="text-lg font-bold tabular-nums" style={{ color: '#0B3B33' }}>28 من 30</span>
      </span>
    </div>
  )
}

function ParentWidget() {
  return (
    <div className="px-4 py-3 flex items-center gap-3" style={{ maxWidth: 260 }}>
      <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#0B3B33', color: '#E0B562' }}>
        <BellRing size={16} />
      </span>
      <span className="flex flex-col leading-tight gap-1">
        <span className="text-sm font-bold" style={{ color: '#0B3B33' }}>وصل تقرير الأسبوع لولي الأمر</span>
        <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#1F6F52' }}><Check size={12} strokeWidth={3} /> قُرئ قبل دقيقتين</span>
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────
   موك-أب الهيرو — لقطات الهاتف تتبدّل كل 5 ثوانٍ
───────────────────────────────────────── */
function HeroMockup() {
  const [phoneImages, setPhoneImages] = useState(() => getBakedHeroShots()?.phone ?? [])
  const [phoneIdx,    setPhoneIdx]    = useState(0)
  /* الصورة الأولى تظهر بلا تلاشٍ: هي أكبر عنصر مرئي، ولا تبدأ شفافة. */
  const [rotated,     setRotated]     = useState(false)

  /* على الخادم: سجّل preload الصورة الأولى وقائمة اللقطات ليكتبهما
     prerender.mjs في <head> صفحة الرئيسية. */
  if (typeof document === 'undefined') {
    const store = (globalThis.__PAGE_META__ ??= {})
    store.heroShots = getBakedHeroShots()
    store.preloadImages = [
      { href: '/mockup/hand-phone.webp' },
      phoneImages[0] && { href: galleryImage(phoneImages[0].image_url, PHONE_W) },
    ].filter(Boolean)
  }

  /* احتياط فقط: حين لا تكون اللقطات مخبوزة في الصفحة. */
  useEffect(() => {
    if (getBakedHeroShots()) return
    supabase.from('gallery_items')
      .select('id,image_url,title,category')
      .eq('is_active', true)
      .eq('category', 'هاتف')
      .order('order_index', { ascending: true })
      .limit(8)
      .then(({ data }) => { if (data) setPhoneImages(data) })
  }, [])

  /* التبديل يبدأ بأول تفاعل من الزائر: قبله يعدّ المتصفح كل لقطة جديدة
     «أكبر عنصر مرئي»، فلو بدأ بمؤقّت لصار زمن LCP زمن أول تبديل. */
  const [interacted, setInteracted] = useState(false)
  useEffect(() => {
    if (interacted) return
    const events = ['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart']
    const go = () => setInteracted(true)
    for (const e of events) window.addEventListener(e, go, { once: true, passive: true })
    return () => { for (const e of events) window.removeEventListener(e, go) }
  }, [interacted])

  useEffect(() => {
    if (!interacted || phoneImages.length < 2) return
    const timer = setInterval(() => {
      setRotated(true)
      setPhoneIdx(i => (i + 1) % phoneImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [interacted, phoneImages.length])

  const phoneImg = phoneImages[phoneIdx] ?? null

  return (
    <div className="hero-slide relative w-full select-none flex justify-center lg:justify-end">
      <div className="relative w-full max-w-[600px] mx-auto">
        <HeroBlob className="w-[86%] top-[6%] left-[7%] opacity-95" />
        {/* حلقة ذهبية رفيعة حول الكتلة */}
        <div aria-hidden className="absolute rounded-full pointer-events-none" style={{ inset: '4% 10% 10% 10%', border: '1px dashed rgba(224,181,98,0.35)' }} />

        <div className="relative z-10 w-[88%] mx-auto">
          <HandPhone phoneImg={phoneImg} phoneIdx={phoneIdx} phoneImages={phoneImages} fade={rotated} />
        </div>

        {/* الأدوات العائمة — سطح المكتب واللوحي */}
        <div className="hidden sm:block">
          <Widget style={{ top: '14%', left: '-6%' }} delay={0.7} range={4} dur={5}><RecitationWidget /></Widget>
          <Widget style={{ top: '46%', right: '-4%' }} delay={1.0} range={3} dur={5.6}><AttendanceWidget /></Widget>
          <Widget style={{ top: '70%', left: '-2%' }} delay={1.3} range={4} dur={4.8}><ParentWidget /></Widget>
        </div>
      </div>
    </div>
  )
}

const TRUST_POINTS = ['يعمل من المتصفح على الحاسوب والجوال', 'واجهة عربية بالكامل', 'فريقنا يرافقك في الإعداد']

/* ─────────────────────────────────────────
   الهيرو — قسم داكن، نصٌّ يمين وموك-أب يسار
───────────────────────────────────────── */
export default function HeroSection() {
  const [formOpen,   setFormOpen]   = useState(false)
  const [formLoaded, setFormLoaded] = useState(false)

  const openForm = () => { setFormLoaded(true); setFormOpen(true) }

  return (
    <>
    {/* min-h-dvh لا min-h-screen: dvh تتبع شريط المتصفّح على الجوال وهو يظهر ويختفي. */}
    <section id="home" className="section-dark relative w-full overflow-hidden flex flex-col justify-center pt-28 pb-24 lg:pb-28 min-h-[min(100dvh,940px)]">
      <div className="pattern-layer pattern-khatam" aria-hidden />

      <div className="relative z-10 container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-14" dir="rtl">

        {/* ════ النص — ثابت في HTML بلا حركة دخول: هو أكبر عنصر مرئي على الجوال ════ */}
        <div className="w-full lg:w-[48%] flex flex-col items-center text-center lg:items-start lg:text-right">

          <span className="eyebrow mb-6">نظام إدارة المعاهد والحلقات القرآنية</span>

          {/* H1 — الذاكرة المؤسسية، لا قائمة الميزات */}
          <h1 className="font-bold mb-6" style={{ color: '#F8F5EC', fontSize: 'clamp(2.5rem, 3.7vw, 3.9rem)' }}>
            معهدك <span className="title-mark">يتذكّر</span>{' '}
            <span style={{ whiteSpace: 'nowrap' }}>كل طالب</span>
            {/* block لا <br> مشروط، كي لا يلتصق السطران على الجوال */}
            <span style={{ display: 'block', fontWeight: 300, color: 'rgba(248,245,236,0.78)' }}>
              حتى لو تغيّر الشيخ.
            </span>
          </h1>

          <p className="text-lg mb-9 max-w-xl" style={{ lineHeight: 1.95, color: 'rgba(248,245,236,0.82)' }}>
            كل جلسة تسميع، وكل غياب، وكل ملاحظة — تُسجَّل في سجلّ الطالب وتبقى فيه.
            حين يغادر معلّم، لا يغادر معه تاريخ حلقته.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link
              to="/request"
              className="btn-cta inline-flex items-center gap-2.5 rounded-full"
              style={{ fontSize: '1.05rem', padding: '1rem 2.4rem' }}
            >
              احسب اشتراك معهدك
              <ArrowLeft size={18} />
            </Link>
            <button
              type="button"
              onClick={openForm}
              onPointerEnter={prefetchDemoForm}
              onFocus={prefetchDemoForm}
              className="btn-outline inline-flex items-center gap-2 rounded-full"
              style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}
            >
              اطلب تجربة مجانية
            </button>
          </div>

          <ul className="mt-9 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2.5">
            {TRUST_POINTS.map(t => (
              <li key={t} className="flex items-center gap-2 text-sm font-bold" style={{ color: 'rgba(248,245,236,0.78)' }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(224,181,98,0.16)', color: '#E0B562' }}>
                  <Check size={12} strokeWidth={3} aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* ════ الموك-أب ════ */}
        <div className="w-full lg:w-[52%]">
          <HeroMockup />
        </div>
      </div>

      {/* حافّة القسم: موجةٌ كريمية تُسلِّم إلى القسم الفاتح التالي */}
      <svg className="absolute bottom-[-1px] inset-x-0 w-full h-14 lg:h-20 pointer-events-none" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path d="M0 80V40C240 8 480 0 720 22s480 42 720 8v50Z" fill="#F8F5EC" />
        <path d="M0 40C240 8 480 0 720 22s480 42 720 8" fill="none" stroke="#B8863A" strokeOpacity="0.55" strokeWidth="1.5" />
      </svg>
    </section>

    {formLoaded && (
      <Suspense fallback={null}>
        <DemoFormPresence open={formOpen} onClose={() => setFormOpen(false)} />
      </Suspense>
    )}
    </>
  )
}
