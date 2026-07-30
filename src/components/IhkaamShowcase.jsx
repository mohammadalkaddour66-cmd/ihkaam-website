import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'
import { galleryImage } from '../config/imageUrl'
import { fetchLandingStats } from '../config/landingStats'

/* ─── Stats Banner data ───────────────────────────────────────────
   الأرقام تُجلب حيّة من قاعدة البيانات (get_public_landing_stats) بدل
   قيم مكتوبة يدوياً كانت تتقادم: كانت تعرض 1,800 طالباً و6 معاهد بينما
   الواقع تجاوزها. الصيغ أدناه تُبنى من الأرقام الفعلية. */
const STAT_LABELS = [
  { key: 'students',   label: 'طالب مُسجّل يُدار سحابياً',   accent: '#D9ACA3' },
  { key: 'staff',      label: 'كادر إداري وتعليمي',           accent: '#48D6CD' },
  { key: 'groups',     label: 'حلقة قرآنية مؤتمتة بالكامل',   accent: '#D9ACA3' },
  { key: 'institutes', label: 'معاهد ومؤسسات كبرى تثق بنا',   accent: '#A6756A' },
]

/* ─── Stats Banner component ───────────────────────────────────── */
function StatsBanner() {
  const [stats, setStats] = useState(null)

  useEffect(() => { fetchLandingStats().then(setStats) }, [])

  const STATS = STAT_LABELS.map(s => ({
    ...s,
    number: stats ? stats[s.key].toLocaleString('en-US') : '—',
  }))

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 mb-14 rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(26,148,155,0.18)' }}
    >
      {STATS.map((s, i) => (
        <div
          key={s.key}
          className="flex flex-col items-center justify-center text-center px-5 py-7 gap-2"
          style={{
            background  : 'rgba(17,49,44,0.12)',
            backdropFilter: 'blur(10px)',
            /* Divider between cells */
            borderRight : i < STATS.length - 1 ? '1px solid rgba(26,148,155,0.14)' : 'none',
            borderBottom: i < 2 ? '1px solid rgba(26,148,155,0.14)' : 'none', /* mobile row separator */
          }}
        >
          <p
            className="font-black leading-none"
            style={{
              color    : s.accent,
              fontSize : 'clamp(1.7rem, 3.5vw, 2.4rem)',
              letterSpacing: '-0.02em',
            }}
          >
            {s.number}
          </p>
          <p
            className="text-xs leading-[1.7]"
            style={{ color: '#96BCBE', maxWidth: '110px' }}
          >
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}

/* ─── CSS Mockup: MacBook ──────────────────────────────────────── */
function LaptopMockup({ imageUrl, title }) {
  return (
    <div className="relative w-full" style={{ maxWidth: '640px' }}>
      {/* Lid — image fills edge-to-edge, no fake bar */}
      <div className="relative rounded-t-2xl overflow-hidden"
        style={{
          background  : 'rgba(2,15,14,0.97)',
          border      : '1px solid rgba(26,148,155,0.32)',
          borderBottom: 'none',
        }}
      >
        {/* Screen */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          {/* Scanline */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.018]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, #D9ACA3 0px, #D9ACA3 1px, transparent 1px, transparent 4px)' }}
            aria-hidden />
        </div>
      </div>

      {/* Base chin */}
      <div className="rounded-b-xl"
        style={{
          height    : '12px',
          background: 'linear-gradient(180deg, rgba(2,15,14,0.97) 0%, rgba(2,15,14,0.85) 100%)',
          border    : '1px solid rgba(26,148,155,0.22)',
          borderTop : 'none',
        }}
      />
      {/* Stand */}
      <div className="mx-auto"
        style={{
          width       : '34%', height: '16px',
          background  : 'rgba(2,15,14,0.90)',
          borderLeft  : '1px solid rgba(26,148,155,0.16)',
          borderRight : '1px solid rgba(26,148,155,0.16)',
          borderBottom: '1px solid rgba(26,148,155,0.16)',
          borderRadius: '0 0 6px 6px',
        }}
      />
      {/* Base plate */}
      <div className="mx-auto rounded-full"
        style={{ width: '54%', height: '5px', background: 'rgba(2,15,14,0.88)', border: '1px solid rgba(26,148,155,0.14)' }}
      />
    </div>
  )
}

/* ─── CSS Mockup: iPhone ───────────────────────────────────────── */
function PhoneMockup({ imageUrl, title }) {
  return (
    <div className="relative flex-shrink-0"
      style={{
        width        : '200px',
        background   : 'rgba(2,15,14,0.97)',
        border       : '10px solid rgba(2,15,14,0.99)',
        borderRadius : '40px',
        boxShadow    : '0 24px 64px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(26,148,155,0.28)',
      }}
    >
      {/* Side buttons */}
      <div className="absolute -right-3 rounded-l-full"
        style={{ top: '80px', width: '5px', height: '40px', background: 'rgba(17,49,44,0.55)' }} />
      <div className="absolute -left-3 rounded-r-full"
        style={{ top: '72px', width: '5px', height: '30px', background: 'rgba(17,49,44,0.55)' }} />
      <div className="absolute -left-3 rounded-r-full"
        style={{ top: '116px', width: '5px', height: '30px', background: 'rgba(17,49,44,0.55)' }} />

      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
        style={{ width: '72px', height: '26px', background: 'rgba(2,15,14,0.99)', borderRadius: '0 0 18px 18px' }}
      />

      {/* Screen — scrollable so tall mobile screenshots are not cropped */}
      <div
        className="overflow-y-auto"
        style={{
          borderRadius : '31px',
          maxHeight    : '380px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(26,148,155,0.30) transparent',
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Home indicator */}
      <div className="mx-auto mt-1.5 mb-1 rounded-full"
        style={{ width: '52px', height: '4px', background: 'rgba(17,49,44,0.40)' }}
      />
    </div>
  )
}

/* ─── Main Component ─── */

export default function IhkaamShowcase() {
  const [activeId,      setActiveId]      = useState(null)
  const [dbInterfaces,  setDbInterfaces]  = useState([])
  const [dbLoading,     setDbLoading]     = useState(true)

  useEffect(() => {
    supabase
      .from('ihkaam_interfaces')
      .select('id, title, description, desktop_image, mobile_image, order_index')
      .order('order_index', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data?.length > 0) {
          setDbInterfaces(data)
          setActiveId(data[0].id)
        }
        setDbLoading(false)
      })
  }, [])

  if (dbLoading || dbInterfaces.length === 0) return null

  const active = dbInterfaces.find(t => t.id === activeId) ?? dbInterfaces[0]

  return (
    <section className="relative z-10 py-24 px-6">

      {/* Teal ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(26,148,155,0.25), transparent)' }}
        aria-hidden />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(26,148,155,0.07) 0%, transparent 70%)' }}
        aria-hidden />

      <div className="max-w-6xl mx-auto">

        {/* [NEW] Stats Banner — يظهر قبل قسم "شاهد كيف ننهي الفوضى" */}
        <StatsBanner />

        {/* Header — تم تحديث النص */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
            style={{ color: '#A6756A' }}>
            واجهات النظام
          </span>
          <h2 className="font-black leading-tight mx-auto"
            style={{ color: '#D9ACA3', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', maxWidth: '600px' }}>
            شاهد كيف ننهي الفوضى..{' '}
            <span style={{ color: '#EAE4DF' }}>بساطة الواجهات وقوة الأداء</span>
          </h2>
        </div>

        {/* Two-column layout */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(17,49,44,0.12)',
            border: '1px solid rgba(26,148,155,0.18)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">

            {/* RIGHT — Tab list */}
            <div
              className="flex flex-row lg:flex-col gap-0 lg:border-e border-b lg:border-b-0"
              style={{ borderColor: 'rgba(26,148,155,0.18)' }}
            >
              {/* Panel header */}
              <div className="hidden lg:flex items-center px-6 py-5 border-b"
                style={{ borderColor: 'rgba(26,148,155,0.18)' }}>
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: '#3C555F' }}>
                  اختر الواجهة
                </span>
              </div>

              {/* Tab buttons — DB-driven */}
              {dbInterfaces.map(item => {
                const isActive = item.id === activeId
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className="flex-1 lg:flex-none flex flex-col lg:flex-row items-center lg:items-start gap-1.5 lg:gap-3 px-4 lg:px-6 py-4 lg:py-5 text-center lg:text-right transition-all duration-300 cursor-pointer relative"
                    style={{
                      background  : isActive ? 'rgba(26,148,155,0.22)' : 'transparent',
                      borderBottom: isActive ? 'none' : '1px solid rgba(26,148,155,0.08)',
                    }}
                  >
                    {isActive && (
                      <span className="absolute end-0 top-0 bottom-0 w-0.5 hidden lg:block rounded-full"
                        style={{ background: '#D9ACA3' }} />
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 h-0.5 lg:hidden"
                        style={{ background: '#D9ACA3' }} />
                    )}
                    <span className="text-xs font-bold leading-snug"
                      style={{ color: isActive ? '#D9ACA3' : '#6FA5A8' }}>
                      {item.title}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* LEFT — Screen display */}
            <div className="p-6 md:p-10 flex flex-col gap-6">

              {/* Description */}
              <div className="text-right">
                <p className="text-sm leading-[1.9]" style={{ color: '#96BCBE' }}>
                  {active.description}
                </p>
              </div>

              {/* Mockup area — 100% DB-driven */}
              <div
                key={activeId}
                style={{ animation: 'fadeInScreen 350ms ease forwards' }}
              >
                <div
                  className="relative mx-auto"
                  style={{
                    maxWidth     : '640px',
                    paddingBottom: active?.mobile_image ? '70px' : '0',
                    paddingLeft  : active?.mobile_image ? '55px' : '0',
                  }}
                >
                  {active?.desktop_image && (
                    <LaptopMockup imageUrl={galleryImage(active.desktop_image, 800)} title={active.title} />
                  )}
                  {active?.mobile_image && (
                    <div
                      className="absolute"
                      style={{
                        bottom: '-10px',
                        left  : '-10px',
                        zIndex: 10,
                        filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.65))',
                      }}
                    >
                      <PhoneMockup imageUrl={galleryImage(active.mobile_image, 450)} title={active.title} />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Fade-in keyframe via inline style tag */}
      <style>{`
        @keyframes fadeInScreen {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
