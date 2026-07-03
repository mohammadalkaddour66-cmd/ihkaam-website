import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Building, GraduationCap } from 'lucide-react'
import { supabase } from '../config/supabaseClient'
import { useIsMobile } from '../hooks/useIsMobile'
import DemoRequestForm from './DemoRequestForm'


/* ─────────────────────────────────────────
   Phone placeholder screen - Dark Mode
───────────────────────────────────────── */
function PhonePlaceholderScreen() {
  return (
    <div className="bg-[#060D0D] h-full w-full" style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ width:40, height:6, borderRadius:3, background:'#1A2E2E' }} />
        <div style={{ width:24, height:6, borderRadius:3, background:'#1A2E2E' }} />
      </div>
      {[{c:'#6ABDB2',v:'94%'},{c:'#D9ACA3',v:'78'},{c:'#A6756A',v:'12'}].map((s,i) => (
        <div key={i} style={{ background:'#0A1414', border:'1px solid #132323', borderRadius:8, padding:'8px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ width:32, height:4, borderRadius:2, background:'#1A2E2E', marginBottom:4 }} />
            <div style={{ fontSize:12, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
          <div style={{ width:20, height:20, borderRadius:6, background:s.c+'15' }} />
        </div>
      ))}
      {[1,2,3].map(i => (
        <div key={i} style={{ height:16, borderRadius:6, background:'#0A1414', border:'1px solid #132323' }} />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────
   Phone device chrome — reused for both the mobile in-flow
   placement and the desktop floating overlap placement
───────────────────────────────────────── */
function PhoneMockup({ phoneImg, phoneIdx, phoneImages }) {
  return (
    <div className="relative w-[130px] bg-[#060D0D] border-[4px] border-[#2A3A3A] rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-black/50">
      {/* Top Notch (Dynamic Island style) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10" />

      {/* Screen — crossfade بين صور الهاتف */}
      <div className="w-full h-[260px] bg-[#060D0D] relative overflow-hidden pt-2">
        <AnimatePresence mode="wait">
          {phoneImg ? (
            <motion.img
              key={`phone-${phoneIdx}`}
              src={phoneImg.image_url}
              alt={phoneImg.title}
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
                background : i === phoneIdx ? '#6ABDB2' : 'rgba(106,189,178,0.30)',
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
  const [laptopImages, setLaptopImages] = useState([])
  const [phoneImages,  setPhoneImages]  = useState([])
  const [laptopIdx,    setLaptopIdx]    = useState(0)
  const [phoneIdx,     setPhoneIdx]     = useState(0)

  /* جلب جميع الصور دفعة واحدة ثم تصنيفها */
  useEffect(() => {
    supabase.from('gallery_items')
      .select('id,image_url,title,category')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        if (!data) return
        setLaptopImages(data.filter(d => d.category !== 'هاتف'))
        setPhoneImages(data.filter(d => d.category === 'هاتف'))
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
        background: 'radial-gradient(circle, rgba(2, 115, 104, 0.15) 0%, transparent 60%)',
        zIndex: 0,
      }} />

      <div className="relative w-full max-w-[600px]" style={{ zIndex: 1 }}>

        {/* ── 1. Main Monitor (Desktop Screen) ── */}
        <motion.div
          className="relative bg-[#0A1414] rounded-xl shadow-2xl border border-[#1A2E2E] overflow-hidden z-10"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Browser Bar */}
          <div className="h-8 bg-[#060D0D] border-b border-[#1A2E2E] flex items-center px-3 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
            <div className="mx-auto bg-[#0A1414] border border-[#1A2E2E] rounded text-[10px] text-gray-500 px-16 py-0.5 font-mono">
              app.ihkaam.sa
            </div>
          </div>

          {/* Screen Content — crossfade بين الصور */}
          <div className="relative aspect-[16/10] bg-[#060D0D] overflow-hidden">
            <AnimatePresence mode="wait">
              {laptopImg ? (
                <motion.img
                  key={`laptop-${laptopIdx}`}
                  src={laptopImg.image_url}
                  alt={laptopImg.title}
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
                  className="absolute inset-0 animate-pulse bg-teal-900/10"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

          </div>
        </motion.div>

        {/* ── Monitor Stand ── */}
        <div className="flex flex-col items-center relative z-0 -mt-1">
          {/* رقبة الشاشة */}
          <div className="w-16 h-12 bg-gradient-to-b from-[#0A1414] to-[#132323] border-x border-[#1A2E2E] shadow-inner"></div>
          {/* قاعدة الشاشة */}
          <div className="w-56 h-3 bg-[#132323] rounded-t-xl border-t border-[#1A2E2E] shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* ── Mobile: phone mockup below the laptop, centered, no overlap ── */}
        {isMobile && (
          <motion.div
            className="relative z-20 flex justify-center mt-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          >
            <PhoneMockup phoneImg={phoneImg} phoneIdx={phoneIdx} phoneImages={phoneImages} />
          </motion.div>
        )}

        {/* ── Mobile: clean stat strip instead of floating/overlapping cards ── */}
        {isMobile && (
          <motion.div
            className="relative z-20 grid grid-cols-3 gap-2 mt-5"
            initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          >
            {[
              { icon: Users, label: 'إجمالي الطلاب', value: liveStats.students ? liveStats.students.toLocaleString() : '1,800' },
              { icon: Building, label: 'المعاهد النشطة', value: liveStats.institutes || '96' },
              { icon: GraduationCap, label: 'الكوادر التعليمية', value: '+100' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}
                className="bg-[#0A1414]/90 backdrop-blur-md rounded-xl border border-[#1A2E2E] px-2 py-3 flex flex-col items-center gap-1 text-center"
              >
                <Icon size={14} className="text-[#6ABDB2]" />
                <span className="text-base font-bold text-white">{value}</span>
                <span className="text-[10px] leading-tight font-semibold text-[#7A9E96]">{label}</span>
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
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="bg-[#0A1414]/90 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(2,115,104,0.15)] border border-[#1A2E2E] p-3 flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-2 text-[#7A9E96] mb-1">
                  <Users size={14} className="text-[#6ABDB2]" />
                  <span className="text-xs font-semibold">إجمالي الطلاب</span>
                </div>
                <span className="text-2xl font-bold text-white">{liveStats.students ? liveStats.students.toLocaleString() : '1,800'}</span>
                <svg className="w-16 h-4 mt-1 text-[#6ABDB2]" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M0 15 Q 25 5, 50 10 T 100 5"/></svg>
              </motion.div>
            </motion.div>

            {/* Card 2: Institutes */}
            <motion.div
              className="absolute z-20"
              style={{ bottom: '25%', left: '-12%' }}
              initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
            >
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="bg-[#0A1414]/90 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(2,115,104,0.15)] border border-[#1A2E2E] p-3 flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-2 text-[#7A9E96] mb-1">
                  <Building size={14} className="text-[#6ABDB2]" />
                  <span className="text-xs font-semibold">المعاهد النشطة</span>
                </div>
                <span className="text-2xl font-bold text-white">{liveStats.institutes || '96'}</span>
              </motion.div>
            </motion.div>

            {/* Card 3: Teachers */}
            <motion.div
              className="absolute z-20"
              style={{ top: '-5%', left: '10%' }}
              initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0 }}
            >
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="bg-[#0A1414]/90 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(2,115,104,0.15)] border border-[#1A2E2E] p-3 flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-2 text-[#7A9E96] mb-1">
                  <GraduationCap size={14} className="text-[#6ABDB2]" />
                  <span className="text-xs font-semibold">الكوادر التعليمية</span>
                </div>
                <span className="text-xl font-bold text-white">+100</span>
              </motion.div>
            </motion.div>

            {/* ── 3. Phone (Bottom Right overlap) ── */}
            <motion.div
              className="absolute z-30"
              style={{ bottom: '-5%', right: '8%' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[130px] bg-[#060D0D] border-[4px] border-[#2A3A3A] rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-black/50"
              >
                {/* Top Notch (Dynamic Island style) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10" />

                {/* Screen — crossfade بين صور الهاتف */}
                <div className="w-full h-[260px] bg-[#060D0D] relative overflow-hidden pt-2">
                  <AnimatePresence mode="wait">
                    {phoneImg ? (
                      <motion.img
                        key={`phone-${phoneIdx}`}
                        src={phoneImg.image_url}
                        alt={phoneImg.title}
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
                          background : i === phoneIdx ? '#6ABDB2' : 'rgba(106,189,178,0.30)',
                          transition : 'width 300ms ease',
                        }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/30" />
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
  const [liveStats, setLiveStats] = useState({ institutes: null, students: null })
  const [formOpen,  setFormOpen]  = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('institutes').select('*', { count:'exact', head:true }).eq('is_deleted', false),
      supabase.from('students').select('*',   { count:'exact', head:true }).eq('is_deleted', false),
    ]).then(([r1, r2]) => {
      setLiveStats({ institutes: r1.count, students: r2.count })
    })
  }, [])

  return (
    <>
    <section id="home" className="relative w-full overflow-hidden bg-[#060D0D] min-h-screen flex flex-col justify-center pt-24 pb-12">

      {/* ── Background Subtle Lines ── */}
      <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden style={{
        backgroundImage: 'linear-gradient(rgba(106, 189, 178, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(106, 189, 178, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Curved abstract background lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          fill="none" stroke="#6ABDB2" strokeWidth="0.2"
          initial={{ d: "M0,50 Q25,25 50,50 T100,50" }}
          animate={{ d: ["M0,50 Q25,25 50,50 T100,50", "M0,50 Q25,35 50,50 T100,50", "M0,50 Q25,25 50,50 T100,50"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          fill="none" stroke="#6ABDB2" strokeWidth="0.1"
          initial={{ d: "M0,70 Q25,45 50,70 T100,70" }}
          animate={{ d: ["M0,70 Q25,45 50,70 T100,70", "M0,70 Q25,55 50,70 T100,70", "M0,70 Q25,45 50,70 T100,70"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 mt-0 lg:-mt-20" dir="rtl">

        {/* ════════════════════════════════════
            TEXT BLOCK (Right Column)
        ════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-right">

          {/* H1 */}
          <motion.h1
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
            className="font-black text-white mb-6"
            style={{ fontSize:'clamp(2.2rem, 3vw, 3.5rem)', lineHeight: '1.35' }}
          >
            النظام الشامل لإدارة المعاهد القرآنية <span className="text-[#EAE4DF]">.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay: 0.1 }}
            className="text-[#7A9E96] text-lg leading-relaxed mb-10 max-w-xl"
          >
            صُمِّم خصيصاً لمديري مراكز التحفيظ. تخلّص من فوضى الأوراق، تابع إنجاز التسميع، وأصدر التقارير الفورية بمرونة تامة.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
          >
            <Link
              to="/request"
              className="btn-cta flex items-center gap-2.5 rounded-xl"
              style={{ fontSize:'1rem', padding:'1rem 2.4rem' }}
            >
              ابدأ بتطوير مركزك الآن
              <ArrowLeft size={17} />
            </Link>

            <button
              onClick={() => setFormOpen(true)}
              className="text-[#EAE4DF] hover:text-white font-semibold py-3 px-6 rounded-xl border border-[#1A2E2E] bg-[#0A1414] hover:bg-[#132323] transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              جرّب مجاناً
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
