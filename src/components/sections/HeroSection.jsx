import { useState, useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Building, GraduationCap } from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { fetchLandingStats, getBakedLandingStats } from '../../config/landingStats'
import { galleryImage } from '../../config/imageUrl'
import { ACCENT, GOLD, TEXT_2 } from '../../config/palette'

/* ══════════════════════════════════════════════════════════════════
   الهيرو — أول ما يُرسم في الموقع، فهو مبنيّ ليظهر من HTML وحده (ISS-25/26/27):

   • النص والصورة الأولى في HTML المُصيَّر مسبقاً. قائمة لقطات الهيرو تُجلب
     وقت البناء (scripts/prerender.mjs) وتُكتب في الصفحة كتلةَ بيانات
     <script id="hero-shots">، ومعها preload للصورة الأولى. فلا ينتظر الهيرو
     JavaScript ولا رحلةً إلى قاعدة البيانات. الجلب الحيّ احتياطٌ لبيئة
     التطوير أو لبناءٍ فشل فيه الجلب، ويجري بعد أول رسم.
   • الحركة كلها CSS (hero-float / hero-rise / hero-slide / hero-fade في
     index.css)، فلا يحتاج الهيرو مكتبة framer-motion، ونص العنوان لا يبدأ
     شفافاً: كان opacity:0 في HTML حتى يُقلع الـJS فيتأخر أكبر عنصر مرئي.
   • الجوال وسطح المكتب يُرسمان معاً ويُخفي CSS ما لا يخصّ الشاشة. كان
     الاختيار بـuseIsMobile، وهو لا يعرف العرض على الخادم، فيختلف HTML
     المُصيَّر مسبقاً عمّا يرسمه المتصفح على الجوال وتفشل التهيئة (hydration).
   ══════════════════════════════════════════════════════════════════ */

/* بكسل شفاف: مصدر صورة الحاسوب على الجوال، حيث الشاشة مخفية، فلا تُنزَّل. */
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const LAPTOP_W = 800
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


/* ─────────────────────────────────────────
   Phone placeholder screen - Dark Mode
───────────────────────────────────────── */
function PhonePlaceholderScreen() {
  return (
    <div className="bg-[#09201E] h-full w-full" style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ width:40, height:6, borderRadius:3, background:'var(--surface-2)' }} />
        <div style={{ width:24, height:6, borderRadius:3, background:'var(--surface-2)' }} />
      </div>
      {/* تركوازيّ ثم ذهبيّ ثم محايد — نفس النسبة التي تحكم الصفحة
         كلّها، مصغّرةً في ثلاثة صفوف. كانت وردياً وطينياً. */}
      {[{c:ACCENT,v:'94%'},{c:GOLD,v:'78'},{c:TEXT_2,v:'12'}].map((s,i) => (
        <div key={i} style={{ background:'#09201E', border:'1px solid #11312C', borderRadius:8, padding:'8px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ width:32, height:4, borderRadius:2, background:'var(--surface-2)', marginBottom:4 }} />
            <div style={{ fontSize:12, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
          <div style={{ width:20, height:20, borderRadius:6, background:s.c+'15' }} />
        </div>
      ))}
      {[1,2,3].map(i => (
        <div key={i} style={{ height:16, borderRadius:6, background:'#09201E', border:'1px solid #11312C' }} />
      ))}
    </div>
  )
}

/* حركة الطفو: CSS بمتغيّرات، تتوقف عند طلب تقليل الحركة (index.css). */
const floatStyle = (range, duration, delay = 0) => ({
  '--float-range': `${range}px`,
  '--float-dur'  : `${duration}s`,
  '--float-delay': `${delay}s`,
})
const riseStyle = (delay) => ({ '--rise-delay': `${delay}s` })

/* ─────────────────────────────────────────
   Phone device chrome — reused for both the mobile in-flow
   placement and the desktop floating overlap placement
───────────────────────────────────────── */
function PhoneMockup({ phoneImg, phoneIdx, phoneImages, fade, large = false }) {
  /* على الجوال يصير هذا الموك-أب هو الوحيد في الهيرو، فيكبر ليُقرأ.
     130px كان مقاس عنصرٍ مساعدٍ يطفو بجانب الشاشة، لا مقاس بطل المشهد. */
  /* الهاتف على الجوال أصغر قليلاً كي يبقى زرّا الدعوة في الشاشة الأولى (ISS-57). */
  const w = large ? 'w-[180px]' : 'w-[130px]'
  const h = large ? 'h-[360px]'  : 'h-[260px]'
  return (
    <div className={`relative ${w} bg-[#09201E] border-[4px] border-[color:var(--surface-2)] rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-black/50`}>
      {/* Top Notch (Dynamic Island style) */}
      <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-20 pointer-events-none">
        <div className="w-12 h-3.5 bg-black rounded-b-xl" />
      </div>

      <div className={`relative ${h} overflow-hidden`}>
        {phoneImg ? (
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
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0">
            <PhonePlaceholderScreen />
          </div>
        )}

        {/* نقاط مؤشر الهاتف */}
        {phoneImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {phoneImages.map((_, i) => (
              <div key={i} style={{
                width      : i === phoneIdx ? 12 : 4,
                height     : 4,
                borderRadius: 2,
                background : i === phoneIdx ? '#48D6CD' : 'rgba(72, 214, 205,0.30)',
                transition : 'width 300ms ease',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/30" />
    </div>
  )
}

/* ─────────────────────────────────────────
   Hero Mockup — الصور تتبدل كل 5 ثوانٍ
───────────────────────────────────────── */
function HeroMockup({ liveStats }) {
  const [laptopImages, setLaptopImages] = useState(() => getBakedHeroShots()?.laptop ?? [])
  const [phoneImages,  setPhoneImages]  = useState(() => getBakedHeroShots()?.phone  ?? [])
  const [laptopIdx,    setLaptopIdx]    = useState(0)
  const [phoneIdx,     setPhoneIdx]     = useState(0)
  /* الصورة الأولى تظهر بلا تلاشٍ: هي أكبر عنصر مرئي، ولا تبدأ شفافة. */
  const [rotated,      setRotated]      = useState(false)

  /* على الخادم: سجّل preload الصورة الأولى وقائمة اللقطات ليكتبهما
     prerender.mjs في <head> صفحة الرئيسية. لا شيء من هذا في المتصفح. */
  if (typeof document === 'undefined') {
    const store  = (globalThis.__PAGE_META__ ??= {})
    const shots  = getBakedHeroShots()
    store.heroShots = shots
    store.preloadImages = [
      laptopImages[0] && { href: galleryImage(laptopImages[0].image_url, LAPTOP_W), media: '(min-width: 640px)' },
      phoneImages[0]  && { href: galleryImage(phoneImages[0].image_url, PHONE_W),   media: '(max-width: 639px)' },
    ].filter(Boolean)
  }

  /* احتياط فقط: حين لا تكون اللقطات مخبوزة في الصفحة.
     استعلامان منفصلان لكل نوع بدل استعلام واحد بـ limit ثم فرزه: صور الهاتف
     ترتيبها 38+ في المعرض، فكان الـ limit(12) يلتقط صور الحاسوب وحدها ويترك
     موك-أب الهاتف بلا صورة إطلاقاً. نفس الاستعلامين في prerender.mjs. */
  useEffect(() => {
    if (getBakedHeroShots()) return
    const base = () => supabase.from('gallery_items')
      .select('id,image_url,title,category')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    Promise.all([
      base().neq('category', 'هاتف').limit(8),
      base().eq('category', 'هاتف').limit(8),
    ]).then(([laptop, phone]) => {
      if (laptop.data) setLaptopImages(laptop.data)
      if (phone.data)  setPhoneImages(phone.data)
    })
  }, [])

  /* التبديل يبدأ بأول تفاعل من الزائر (تمرير، لمس، نقر، لوحة مفاتيح).
     المتصفح يعدّ كل لقطة جديدة تُرسم «أكبر عنصر مرئي» جديداً حتى أول تفاعل،
     فلو بدأ التبديل بمؤقّت لصار زمن LCP هو زمن أول تبديل (5 ثوانٍ وأكثر بعد
     التحميل) لا زمن ظهور الهيرو. بعد أول تفاعل يُغلق القياس، فيتبدّل بأمان. */
  const [interacted, setInteracted] = useState(false)
  useEffect(() => {
    if (interacted) return
    const events = ['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart']
    const go = () => setInteracted(true)
    for (const e of events) window.addEventListener(e, go, { once: true, passive: true })
    return () => { for (const e of events) window.removeEventListener(e, go) }
  }, [interacted])

  /* التبديل التلقائي كل 5 ثوانٍ */
  useEffect(() => {
    const hasMultipleLaptop = laptopImages.length > 1
    const hasMultiplePhone  = phoneImages.length  > 1
    if (!interacted || (!hasMultipleLaptop && !hasMultiplePhone)) return
    const timer = setInterval(() => {
      setRotated(true)
      if (hasMultipleLaptop) setLaptopIdx(i => (i + 1) % laptopImages.length)
      if (hasMultiplePhone)  setPhoneIdx(i  => (i + 1) % phoneImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [interacted, laptopImages.length, phoneImages.length])

  const laptopImg = laptopImages[laptopIdx] ?? null
  const phoneImg  = phoneImages[phoneIdx]   ?? null

  const stats = [
    { icon: Users, label: 'إجمالي الطلاب', value: liveStats.students ? liveStats.students.toLocaleString('en-US') : '—' },
    { icon: Building, label: 'المعاهد النشطة', value: liveStats.institutes || '—' },
    { icon: GraduationCap, label: 'الكوادر التعليمية', value: liveStats.staff ? liveStats.staff.toLocaleString('en-US') : '—' },
  ]

  return (
    <div className="hero-slide relative w-full select-none flex justify-center lg:justify-end mt-12 lg:mt-0">
      {/* ── Background glow (Teal) ── */}
      <div className="absolute pointer-events-none" aria-hidden style={{
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '120%', height: '120%',
        background: 'radial-gradient(circle, rgba(26, 148, 155, 0.15) 0%, transparent 60%)',
        zIndex: 0,
      }} />

      <div className="relative w-full max-w-[600px]" style={{ zIndex: 1 }}>

        {/* ── 1. Main Monitor (Desktop Screen) — سطح المكتب واللوحي فقط ──

           لقطة لوحة تحكّم صُمّمت لعرض 1440px، مضغوطة في 342px على
           الهاتف: لا يُقرأ منها حرف. فتُطوى على الهاتف (hidden sm:block)،
           ويرث مكانَها موك-أب الجوال: هو صورة التطبيق الحقيقي، ويُقرأ في
           قياسه الطبيعي لأنه صُوِّر على هاتف أصلاً. وعلى الجوال يأخذ
           <picture> مصدراً فارغاً فلا تُنزَّل الصورة المخفية. */}
        <div className="hidden sm:block">
          <div
            className="hero-float relative bg-[#09201E] rounded-xl shadow-2xl border border-[color:var(--border)] overflow-hidden z-10"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', ...floatStyle(2, 6) }}
          >
            {/* Browser Bar */}
            <div className="h-8 bg-[#09201E] border-b border-[color:var(--border)] flex items-center px-3 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#48D6CD]/80"></div>
              </div>
              {/* شريط العنوان في المحاكاة يقول للزائر إن هذا منتجٌ على الويب
                 لا صورةً مرسومة. --text-3 مقيسٌ للقراءة. */}
              <div className="mx-auto bg-[#09201E] border border-[color:var(--border)] rounded text-[10px] px-16 py-0.5 font-mono" style={{ color: 'var(--text-3)' }}>
                ihkaam.app
              </div>
            </div>

            {/* Screen Content */}
            <div className="relative aspect-[16/10] bg-[#09201E] overflow-hidden">
              {laptopImg ? (
                <picture key={`laptop-${laptopIdx}`}>
                  <source media="(max-width: 639px)" srcSet={BLANK} />
                  <img
                    src={galleryImage(laptopImg.image_url, LAPTOP_W)}
                    alt={laptopImg.title}
                    width={LAPTOP_W}
                    height={LAPTOP_W * 10 / 16}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-contain object-left${rotated ? ' hero-fade' : ''}`}
                    draggable={false}
                  />
                </picture>
              ) : (
                <div className="absolute inset-0 animate-pulse bg-[#11312C]/10" />
              )}
            </div>
          </div>

          {/* ── Monitor Stand ── */}
          <div className="flex flex-col items-center relative z-0 -mt-1">
            {/* رقبة الشاشة */}
            <div className="w-16 h-12 bg-gradient-to-b from-[#09201E] to-[#11312C] border-x border-[color:var(--border)] shadow-inner"></div>
            {/* قاعدة الشاشة */}
            <div className="w-56 h-3 bg-[#11312C] rounded-t-xl border-t border-[color:var(--border)] shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-white/5 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* ── Mobile: الهاتف وحده، وبقياسٍ يُقرأ ── */}
        <div className="hero-lift relative z-20 flex justify-center sm:hidden" style={riseStyle(0.35)}>
          <PhoneMockup phoneImg={phoneImg} phoneIdx={phoneIdx} phoneImages={phoneImages} fade={rotated} large />
        </div>

        {/* ── Mobile: clean stat strip instead of floating/overlapping cards ── */}
        <div className="hero-rise relative z-20 grid grid-cols-3 gap-2 mt-5 sm:hidden" style={riseStyle(0.5)}>
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label}
              className="bg-[#09201E]/90 backdrop-blur-md rounded-xl border border-[color:var(--border)] px-2 py-3 flex flex-col items-center gap-1 text-center"
            >
              <Icon size={14} style={{ color: 'var(--accent)' }} aria-hidden />
              <span className="text-base font-bold tabular-nums" style={{ color: 'var(--text-1)' }}>{value}</span>
              {/* كان 10px — دون حدّ القراءة، وهذه أصغر شاشة يُقرأ عليها */}
              <span className="text-xs leading-tight font-semibold" style={{ color: 'var(--text-2)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Desktop/tablet: floating overlap cards + phone mockup ──
           hidden sm:block (ISS-57): على الجوال لا تطفو فوق المحتوى من أول رسم. */}

        {/* Card 1: Students */}
        <div className="hero-rise absolute z-20 hidden sm:block" style={{ top: '8%', right: '-8%', ...riseStyle(0.6) }}>
          <div
            className="hero-float bg-[#09201E]/90 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(26, 148, 155,0.15)] border border-[color:var(--border)] p-3 flex flex-col items-center gap-1"
            style={floatStyle(4, 4, 0.2)}
          >
            <div className="flex items-center gap-2 text-[#96BCBE] mb-1">
              <Users size={14} className="text-[#48D6CD]" />
              <span className="text-xs font-semibold">إجمالي الطلاب</span>
            </div>
            <span className="text-2xl font-bold text-white">{stats[0].value}</span>
            <svg className="w-16 h-4 mt-1 text-[#48D6CD]" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M0 15 Q 25 5, 50 10 T 100 5"/></svg>
          </div>
        </div>

        {/* Card 2: Institutes */}
        <div className="hero-rise absolute z-20 hidden sm:block" style={{ bottom: '25%', left: '-12%', ...riseStyle(0.8) }}>
          <div
            className="hero-float bg-[#09201E]/90 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(26, 148, 155,0.15)] border border-[color:var(--border)] p-3 flex flex-col items-center gap-1"
            style={floatStyle(3, 5, 0.5)}
          >
            <div className="flex items-center gap-2 text-[#96BCBE] mb-1">
              <Building size={14} className="text-[#48D6CD]" />
              <span className="text-xs font-semibold">المعاهد النشطة</span>
            </div>
            <span className="text-2xl font-bold text-white">{stats[1].value}</span>
          </div>
        </div>

        {/* Card 3: Teachers */}
        <div className="hero-rise absolute z-20 hidden sm:block" style={{ top: '-5%', left: '10%', ...riseStyle(1.0) }}>
          <div
            className="hero-float bg-[#09201E]/90 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(26, 148, 155,0.15)] border border-[color:var(--border)] p-3 flex flex-col items-center gap-1"
            style={floatStyle(4, 4.5, 0.8)}
          >
            <div className="flex items-center gap-2 text-[#96BCBE] mb-1">
              <GraduationCap size={14} className="text-[#48D6CD]" />
              <span className="text-xs font-semibold">الكوادر التعليمية</span>
            </div>
            <span className="text-xl font-bold text-white">{stats[2].value}</span>
          </div>
        </div>

        {/* ── 3. Phone (Bottom Right overlap) ──
           نفس PhoneMockup المستعمل في نسخة الجوال، بنفس رابط الصورة،
           فيُنزَّل الملف مرة واحدة. */}
        <div className="hero-rise absolute z-30 hidden sm:block" style={{ bottom: '-5%', right: '8%', '--rise-y': '30px', ...riseStyle(0.4) }}>
          <div className="hero-float" style={floatStyle(5, 5)}>
            <PhoneMockup phoneImg={phoneImg} phoneIdx={phoneIdx} phoneImages={phoneImages} fade={rotated} />
          </div>
        </div>

      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main HeroSection — Dark Mode, Side-by-Side
───────────────────────────────────────── */
export default function HeroSection() {
  const [liveStats, setLiveStats] = useState(() => {
    const b = getBakedLandingStats()   // أرقام البناء نفسها في كل صفحة (ISS-41)
    return { institutes: b?.institutes ?? null, students: b?.students ?? null, staff: b?.staff ?? null }
  })
  const [formOpen,   setFormOpen]   = useState(false)
  const [formLoaded, setFormLoaded] = useState(false)

  useEffect(() => {
    fetchLandingStats().then(s => {
      setLiveStats({ institutes: s.institutes, students: s.students, staff: s.staff })
    })
  }, [])

  const openForm = () => { setFormLoaded(true); setFormOpen(true) }

  return (
    <>
    {/* min-h-screen يساوي 100vh، وهي على الجوال تحسب الشاشة وشريط
       المتصفّح مخفيّاً — فيمتدّ القسم تحت الشريط ويُقصّ. dvh تتبع
       الشريط وهو يظهر ويختفي. */}
    {/* خلفية الهيرو أعتم سطحٍ في السلّم لا الثاني: البطاقات الطائرة
        داخله على --canvas-2، فلو تساوى القسم معها ذابت فيه. الفرق
        بين الإضاءتين (3.5% و8%) هو ما يعطيها ارتفاعها. */}
    <section id="home" className="relative w-full overflow-hidden bg-[color:var(--canvas)] min-h-dvh flex flex-col justify-center pt-24 pb-12">

      {/* ── Background Subtle Lines ── */}
      <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden style={{
        backgroundImage: 'linear-gradient(rgba(72, 214, 205, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(72, 214, 205, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* الخطوط المنحنية — ثابتة. تحريك سمة d كان يعيد رسم المسار في كل
         إطار على الخيط الرئيس مقابل حركةٍ لا يكاد أحد يلحظها. */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <path fill="none" stroke="var(--accent)" strokeWidth="0.2" d="M0,50 Q25,30 50,50 T100,50" />
        <path fill="none" stroke="var(--accent)" strokeWidth="0.1" d="M0,70 Q25,50 50,70 T100,70" />
      </svg>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 mt-0 lg:-mt-20" dir="rtl">

        {/* ════════════════════════════════════
            TEXT BLOCK (Right Column)
            ثابت في HTML بلا حركة دخول: هو أكبر عنصر مرئي على الجوال.
        ════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-right">

          {/* H1 — الذاكرة المؤسسية، لا قائمة الميزات.
             بناء §10.7 من وثيقة الهوية: وزن 900 + كلمة بالتدرّج + وزن 300
             في السطر نفسه. التدرّج على كلمة واحدة بـ nowrap — التدرّج
             المكسور على سطرين يبدو كخلل. */}
          <h1
            className="font-black text-white mb-6"
            style={{ fontSize:'clamp(2.2rem, 3vw, 3.5rem)', lineHeight: '1.35' }}
          >
            معهدك <span className="text-gold-grad" style={{ whiteSpace: 'nowrap' }}>يتذكّر</span>{' '}
            {/* nowrap على «كل طالب» كوحدة — بدونه ينكسر السطر على الجوال
               فتبقى «طالب» وحدها يتيمة في سطر. */}
            <span style={{ whiteSpace: 'nowrap' }}>كل طالب</span>
            {/* block لا <br> مشروط: مع hidden md:block كان الفاصل يختفي على الجوال
               بلا مسافة تعوّضه، فتقرأ «طالبحتى لو تغيّر الشيخ». */}
            <span style={{ display: 'block', fontWeight: 300, color: 'var(--text-2)' }}>
              حتى لو تغيّر الشيخ.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg mb-10 max-w-xl"
            style={{ lineHeight: 1.9, color: 'var(--text-2)' }}
          >
            كل جلسة تسميع، وكل غياب، وكل ملاحظة — تُسجَّل في سجلّ الطالب وتبقى فيه.
            حين يغادر معلّم، لا يغادر معه تاريخ حلقته.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link
              to="/request"
              className="btn-cta inline-flex items-center gap-2.5 rounded-xl"
              style={{ fontSize:'1rem', padding:'1rem 2.4rem' }}
            >
              احسب اشتراك معهدك
              <ArrowLeft size={17} />
            </Link>

            <button
              type="button"
              onClick={openForm}
              onPointerEnter={prefetchDemoForm}
              onFocus={prefetchDemoForm}
              className="btn-outline inline-flex items-center gap-2 rounded-xl"
              style={{ fontSize:'1rem', padding:'1rem 2rem' }}
            >
              اطلب تجربة مجانية
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════
            MOCKUP BLOCK (Left Column)
        ════════════════════════════════════ */}
        <div className="w-full lg:w-1/2">
          <HeroMockup liveStats={liveStats} />
        </div>

      </div>

    </section>

    {formLoaded && (
      <Suspense fallback={null}>
        <DemoFormPresence open={formOpen} onClose={() => setFormOpen(false)} />
      </Suspense>
    )}
    </>
  )
}
