import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Building, GraduationCap } from 'lucide-react'
import { supabase } from '../config/supabaseClient'
import { fetchLandingStats } from '../config/landingStats'
import { galleryImage } from '../config/imageUrl'
import { useIsMobile } from '../hooks/useIsMobile'
import { ACCENT, GOLD, TEXT_2 } from '../config/palette'
import DemoRequestForm from './DemoRequestForm'


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

/* ─────────────────────────────────────────
   Phone device chrome — reused for both the mobile in-flow
   placement and the desktop floating overlap placement
───────────────────────────────────────── */
function PhoneMockup({ phoneImg, phoneIdx, phoneImages, large = false }) {
  /* على الجوال يصير هذا الموك-أب هو الوحيد في الهيرو، فيكبر ليُقرأ.
     130px كان مقاس عنصرٍ مساعدٍ يطفو بجانب الشاشة، لا مقاس بطل المشهد. */
  const w = large ? 'w-[208px]' : 'w-[130px]'
  const h = large ? 'h-[416px]'  : 'h-[260px]'
  return (
    <div className={`relative ${w} bg-[#09201E] border-[4px] border-[color:var(--surface-2)] rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-black/50`}>
      {/* Top Notch (Dynamic Island style) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10" />

      {/* Screen — crossfade بين صور الهاتف */}
      <div className={`w-full ${h} bg-[#09201E] relative overflow-hidden pt-2`}>
        <AnimatePresence mode="wait">
          {phoneImg ? (
            <motion.img
              key={`phone-${phoneIdx}`}
              src={galleryImage(phoneImg.image_url, 400)}
              alt={phoneImg.title}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-top"
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          ) : (
            <motion.div
              key="phone-placeholder"
              className="absolute inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <PhonePlaceholderScreen />
            </motion.div>
          )}
        </AnimatePresence>

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
   Hero Mockup — الصور تتبدل كل 2 ثانية
───────────────────────────────────────── */
function HeroMockup({ liveStats }) {
  const isMobile = useIsMobile()
  const reduce   = useReducedMotion()
  const [laptopImages, setLaptopImages] = useState([])
  const [phoneImages,  setPhoneImages]  = useState([])
  const [laptopIdx,    setLaptopIdx]    = useState(0)
  const [phoneIdx,     setPhoneIdx]     = useState(0)

  /* خمس حلقات طفوٍ لا نهائية كانت تعمل معاً في هذا الموك-أب وحده
     (الشاشة، وثلاث بطاقات، والهاتف) — تُبقي الخيط الرئيس مشغولاً
     وترفع استهلاك البطارية ما دام الزائر في الصفحة. تُطفأ كاملةً
     عند طلب تقليل الحركة، وهي زينة لا تحمل معنى. */
  const float = (range, duration, delay = 0) => reduce ? {} : {
    animate    : { y: [-range, range, -range] },
    transition : { duration, repeat: Infinity, ease: 'easeInOut', delay },
  }

  /* استعلامان منفصلان لكل نوع بدل استعلام واحد بـ limit ثم فرزه: صور الهاتف
     ترتيبها 38+ في المعرض، فكان الـ limit(12) يلتقط صور الحاسوب وحدها ويترك
     موك-أب الهاتف بلا صورة إطلاقاً. الهيرو يعرض صورة واحدة بالتناوب، فبضع صور
     من كل نوع تكفي. */
  useEffect(() => {
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

  /* التبديل التلقائي كل 2 ثانية */
  useEffect(() => {
    const hasMultipleLaptop = laptopImages.length > 1
    const hasMultiplePhone  = phoneImages.length  > 1
    if (!hasMultipleLaptop && !hasMultiplePhone) return
    const timer = setInterval(() => {
      if (hasMultipleLaptop) setLaptopIdx(i => (i + 1) % laptopImages.length)
      if (hasMultiplePhone)  setPhoneIdx(i  => (i + 1) % phoneImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [laptopImages.length, phoneImages.length])

  const laptopImg = laptopImages[laptopIdx] ?? null
  const phoneImg  = phoneImages[phoneIdx]   ?? null

  return (
    <motion.div
      className="relative w-full select-none flex justify-center lg:justify-end mt-12 lg:mt-0"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
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
           الهاتف: لا يُقرأ منها حرف. تشغل 293px من ارتفاع الهيرو
           (الشاشة وحاملها) لتقول «يوجد منتج» ولا تقول شيئاً غيره —
           وهي فوق ذلك أثقل صورة في الصفحة.

           فتُطوى على الهاتف، ويرث مكانَها موك-أب الجوال: هو صورة
           التطبيق الحقيقي، ويُقرأ في قياسه الطبيعي لأنه صُوِّر
           على هاتف أصلاً. */}
        {!isMobile && (
        <>
        <motion.div
          className="relative bg-[#09201E] rounded-xl shadow-2xl border border-[color:var(--border)] overflow-hidden z-10"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          {...float(2, 6)}
        >
          {/* Browser Bar */}
          <div className="h-8 bg-[#09201E] border-b border-[color:var(--border)] flex items-center px-3 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#48D6CD]/80"></div>
            </div>
            {/* كان text-gray-500 — رماديّ tailwind مائلٌ إلى الأزرق
               (264°)، وهو اللون الوحيد من لوحة tailwind بقي في
               الرئيسية، وتباينه 2.2:1 فلا يُقرأ. وشريط العنوان في
               المحاكاة يُقرأ فعلاً: هو ما يقول للزائر إن هذا منتجٌ
               على الويب لا صورةً مرسومة. */}
            <div className="mx-auto bg-[#09201E] border border-[color:var(--border)] rounded text-[10px] px-16 py-0.5 font-mono" style={{ color: 'var(--text-3)' }}>
              ihkaam.app
            </div>
          </div>

          {/* Screen Content — crossfade بين الصور */}
          <div className="relative aspect-[16/10] bg-[#09201E] overflow-hidden">
            <AnimatePresence mode="wait">
              {laptopImg ? (
                <motion.img
                  key={`laptop-${laptopIdx}`}
                  /* شاشة الجوال لا تتجاوز ~380px عرضاً فعلياً — 800px عليها بايتات
                     مهدورة على أثقل صورة في الصفحة (وهي الـ LCP غالباً). */
                  src={galleryImage(laptopImg.image_url, isMobile ? 480 : 800)}
                  alt={laptopImg.title}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-contain object-left"
                  draggable={false}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              ) : (
                <motion.div
                  key="laptop-placeholder"
                  className="absolute inset-0 animate-pulse bg-[#11312C]/10"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

          </div>
        </motion.div>

        {/* ── Monitor Stand ── */}
        <div className="flex flex-col items-center relative z-0 -mt-1">
          {/* رقبة الشاشة */}
          <div className="w-16 h-12 bg-gradient-to-b from-[#09201E] to-[#11312C] border-x border-[color:var(--border)] shadow-inner"></div>
          {/* قاعدة الشاشة */}
          <div className="w-56 h-3 bg-[#11312C] rounded-t-xl border-t border-[color:var(--border)] shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-white/5 rounded-full"></div>
          </div>
        </div>
        </>
        )}

        {/* ── Mobile: الهاتف وحده، وبقياسٍ يُقرأ ── */}
        {isMobile && (
          <motion.div
            className="relative z-20 flex justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          >
            <PhoneMockup phoneImg={phoneImg} phoneIdx={phoneIdx} phoneImages={phoneImages} large />
          </motion.div>
        )}

        {/* ── Mobile: clean stat strip instead of floating/overlapping cards ── */}
        {isMobile && (
          <motion.div
            className="relative z-20 grid grid-cols-3 gap-2 mt-5"
            initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          >
            {[
              { icon: Users, label: 'إجمالي الطلاب', value: liveStats.students ? liveStats.students.toLocaleString() : '—' },
              { icon: Building, label: 'المعاهد النشطة', value: liveStats.institutes || '—' },
              { icon: GraduationCap, label: 'الكوادر التعليمية', value: liveStats.staff ? liveStats.staff.toLocaleString() : '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}
                className="bg-[#09201E]/90 backdrop-blur-md rounded-xl border border-[color:var(--border)] px-2 py-3 flex flex-col items-center gap-1 text-center"
              >
                <Icon size={14} style={{ color: 'var(--accent)' }} aria-hidden />
                <span className="text-base font-bold tabular-nums" style={{ color: 'var(--text-1)' }}>{value}</span>
                {/* كان 10px — دون حدّ القراءة، وهذه أصغر شاشة يُقرأ عليها */}
                <span className="text-xs leading-tight font-semibold" style={{ color: 'var(--text-2)' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Desktop/tablet: floating overlap cards + phone mockup ── */}
        {!isMobile && (
          <>
            {/* Card 1: Students */}
            <motion.div
              className="absolute z-20"
              style={{ top: '8%', right: '-8%' }}
              initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            >
              <motion.div
                {...float(4, 4, 0.2)}
                className="bg-[#09201E]/90 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(26, 148, 155,0.15)] border border-[color:var(--border)] p-3 flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-2 text-[#96BCBE] mb-1">
                  <Users size={14} className="text-[#48D6CD]" />
                  <span className="text-xs font-semibold">إجمالي الطلاب</span>
                </div>
                <span className="text-2xl font-bold text-white">{liveStats.students ? liveStats.students.toLocaleString() : '—'}</span>
                <svg className="w-16 h-4 mt-1 text-[#48D6CD]" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M0 15 Q 25 5, 50 10 T 100 5"/></svg>
              </motion.div>
            </motion.div>

            {/* Card 2: Institutes */}
            <motion.div
              className="absolute z-20"
              style={{ bottom: '25%', left: '-12%' }}
              initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
            >
              <motion.div
                {...float(3, 5, 0.5)}
                className="bg-[#09201E]/90 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(26, 148, 155,0.15)] border border-[color:var(--border)] p-3 flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-2 text-[#96BCBE] mb-1">
                  <Building size={14} className="text-[#48D6CD]" />
                  <span className="text-xs font-semibold">المعاهد النشطة</span>
                </div>
                <span className="text-2xl font-bold text-white">{liveStats.institutes || '—'}</span>
              </motion.div>
            </motion.div>

            {/* Card 3: Teachers */}
            <motion.div
              className="absolute z-20"
              style={{ top: '-5%', left: '10%' }}
              initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0 }}
            >
              <motion.div
                {...float(4, 4.5, 0.8)}
                className="bg-[#09201E]/90 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(26, 148, 155,0.15)] border border-[color:var(--border)] p-3 flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-2 text-[#96BCBE] mb-1">
                  <GraduationCap size={14} className="text-[#48D6CD]" />
                  <span className="text-xs font-semibold">الكوادر التعليمية</span>
                </div>
                <span className="text-xl font-bold text-white">{liveStats.staff ? liveStats.staff.toLocaleString() : '—'}</span>
              </motion.div>
            </motion.div>

            {/* ── 3. Phone (Bottom Right overlap) ──
               نفس PhoneMockup المستعمل في نسخة الجوال. كان مكرراً حرفياً هنا،
               والنسخة المكررة فقدت loading=eager و fetchPriority=high. */}
            <motion.div
              className="absolute z-30"
              style={{ bottom: '-5%', right: '8%' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div {...float(5, 5)}>
                <PhoneMockup phoneImg={phoneImg} phoneIdx={phoneIdx} phoneImages={phoneImages} />
              </motion.div>
            </motion.div>
          </>
        )}

      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Main HeroSection — Dark Mode, Side-by-Side
───────────────────────────────────────── */
export default function HeroSection() {
  const [liveStats, setLiveStats] = useState({ institutes: null, students: null, staff: null })
  const [formOpen,  setFormOpen]  = useState(false)

  useEffect(() => {
    fetchLandingStats().then(s => {
      setLiveStats({ institutes: s.institutes, students: s.students, staff: s.staff })
    })
  }, [])

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

      {/* الخطوط المنحنية — كانت تحرّك سمة d نفسها بلا نهاية.
         تحريك d يُجبر المتصفّح على إعادة تقسيم المسار وإعادة رسمه
         في كل إطار، على الخيط الرئيس، ما دامت الصفحة مفتوحة — وهذا
         أثقل ما في الهيرو مقابل حركةٍ لا يكاد أحد يلحظها خلف
         شفافية 20%. الشكل باقٍ، والحركة ذهبت. */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <path fill="none" stroke="var(--accent)" strokeWidth="0.2" d="M0,50 Q25,30 50,50 T100,50" />
        <path fill="none" stroke="var(--accent)" strokeWidth="0.1" d="M0,70 Q25,50 50,70 T100,70" />
      </svg>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 mt-0 lg:-mt-20" dir="rtl">

        {/* ════════════════════════════════════
            TEXT BLOCK (Right Column)
        ════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-right">

          {/* H1 — الذاكرة المؤسسية، لا قائمة الميزات.
             بناء §10.7 من وثيقة الهوية: وزن 900 + كلمة بالتدرّج + وزن 300
             في السطر نفسه. التدرّج على كلمة واحدة بـ nowrap — التدرّج
             المكسور على سطرين يبدو كخلل. */}
          <motion.h1
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
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
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay: 0.1 }}
            className="text-lg mb-10 max-w-xl"
            style={{ lineHeight: 1.9, color: 'var(--text-2)' }}
          >
            كل جلسة تسميع، وكل غياب، وكل ملاحظة — تُسجَّل في سجلّ الطالب وتبقى فيه.
            حين يغادر معلّم، لا يغادر معه تاريخ حلقته.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
          >
            <Link
              to="/request"
              className="btn-cta inline-flex items-center gap-2.5 rounded-xl"
              style={{ fontSize:'1rem', padding:'1rem 2.4rem' }}
            >
              اطلب نسخة
              <ArrowLeft size={17} />
            </Link>

            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="btn-outline inline-flex items-center gap-2 rounded-xl"
              style={{ fontSize:'1rem', padding:'1rem 2rem' }}
            >
              اطلب تجربة مجانية
            </button>
          </motion.div>
        </div>

        {/* ════════════════════════════════════
            MOCKUP BLOCK (Left Column)
        ════════════════════════════════════ */}
        <div className="w-full lg:w-1/2">
          <HeroMockup liveStats={liveStats} />
        </div>

      </div>

    </section>

    <AnimatePresence>
      {formOpen && <DemoRequestForm key="demo-form" onClose={() => setFormOpen(false)} />}
    </AnimatePresence>
    </>
  )
}
