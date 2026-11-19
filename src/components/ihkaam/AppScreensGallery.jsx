import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'
import { DESKTOP_SHOTS, CAT_TO_SHOT, desktopSrc } from '../../data/appShots'

/* ══════════════════════════════════════════════════════════════════
   «معرض لقطات النظام» (إعادة بناء 2026-11-19 د)

   كان شريطاً يعرض لقطتين صغيرتين من gallery_items (فيهما شريط ويندوز
   وعنوان النافذة) مع نقاطٍ للتنقّل. رآه المالك «غير احترافي أبداً».

   صار شاشةً كبيرة واحدة في إطار متصفّح بنسبة اللقطة نفسها (1440×900،
   فلا قصّ)، وإلى جانبها فهرس الشاشات مجمّعاً بالدور؛ لكلٍّ عنوانها
   وشرحٌ يصف ما في اللقطة بالضبط (src/data/appShots.js). تتبدّل كل
   6 ثوانٍ وتقف حين يمرّ الزائر فوقها، وتُكبَّر بالنقر.
   ‎?cat=‎ (من «جولة داخل إحكام» في الرئيسية) يفتح على شاشة الدور.
   ══════════════════════════════════════════════════════════════════ */

const INTERVAL = 6000
const ease = [0.22, 1, 0.36, 1]
const GROUPS = [...new Set(DESKTOP_SHOTS.map(s => s.group))]

export default function AppScreensGallery() {
  const [i, setI]           = useState(0)
  const [paused, setPaused] = useState(false)
  const [zoom, setZoom]     = useState(false)
  const [tick, setTick]     = useState(0)
  const timer = useRef(null)
  const shot  = DESKTOP_SHOTS[i]

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('cat')
    const id  = cat && CAT_TO_SHOT[cat]
    const at  = id ? DESKTOP_SHOTS.findIndex(s => s.id === id) : -1
    // eslint-disable-next-line react-hooks/set-state-in-effect -- قراءة الرابط مرة عند التحميل
    if (at > 0) setI(at)
  }, [])

  useEffect(() => {
    if (paused || zoom) return
    timer.current = setTimeout(() => setI(x => (x + 1) % DESKTOP_SHOTS.length), INTERVAL)
    return () => clearTimeout(timer.current)
  }, [i, paused, zoom, tick])

  const pick = (n) => { setI(n); setTick(t => t + 1) }

  useEffect(() => {
    if (!zoom) return
    const onKey = (e) => { if (e.key === 'Escape') setZoom(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  return (
    <section className="relative z-10 px-6 py-24" dir="rtl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow">لقطات من داخل النظام</span>
          <h2 className="font-bold mt-5 mb-4" style={{ color: '#1A2E28', fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)' }}>
            هكذا تبدو <span className="title-mark">شاشات إحكام</span>
          </h2>
          <p className="text-lg mx-auto" style={{ color: '#4A5D56', maxWidth: 600, lineHeight: 1.9 }}>
            لقطاتٌ حقيقية من نسخة العرض، بحساب مدير المعهد. اختر شاشة لتراها، أو اضغط عليها لتكبيرها.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* الفهرس */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            {/* الجوال: أزرار أفقية */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
              {DESKTOP_SHOTS.map((s, n) => (
                <button key={s.id} type="button" onClick={() => pick(n)} aria-pressed={n === i}
                  className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-bold"
                  style={{ background: n === i ? '#0B3B33' : '#FFFFFF', color: n === i ? '#F8F5EC' : '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                  {s.title}
                </button>
              ))}
            </div>
            {/* الحاسوب: فهرسٌ مجمّع بالدور */}
            <div className="hidden lg:flex flex-col gap-5">
              {GROUPS.map(g => (
                <div key={g}>
                  <div className="text-sm font-bold mb-2 px-3" style={{ color: '#8A6425' }}>{g}</div>
                  <div className="flex flex-col gap-1">
                    {DESKTOP_SHOTS.map((s, n) => s.group !== g ? null : (
                      <button key={s.id} type="button" onClick={() => pick(n)} aria-pressed={n === i}
                        className="relative text-right rounded-xl px-4 py-2.5 overflow-hidden transition-colors duration-300"
                        style={{ background: n === i ? '#FFFFFF' : 'transparent', boxShadow: n === i ? 'var(--shadow-sm), inset 0 0 0 1px rgba(184,134,58,0.45)' : 'none' }}>
                        <span className="block text-base font-bold" style={{ color: n === i ? '#0B3B33' : '#4A5D56' }}>{s.title}</span>
                        {n === i && !paused && !zoom && (
                          <motion.span key={`${i}-${tick}`} aria-hidden className="absolute bottom-0 right-0 h-[2px]"
                            style={{ background: 'linear-gradient(90deg,#B8863A,#E0B562)' }}
                            initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: INTERVAL / 1000, ease: 'linear' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الشاشة */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <button type="button" onClick={() => setZoom(true)} aria-label={`تكبير: ${shot.title}`}
              className="group block w-full text-right rounded-[18px] overflow-hidden bg-white"
              style={{ boxShadow: '0 40px 80px -36px rgba(8,44,38,0.55), 0 0 0 1px rgba(184,134,58,0.3)' }}>
              <div className="h-9 flex items-center gap-2 px-4" style={{ background: '#F3EEE2', borderBottom: '1px solid #E6DFCF' }} dir="ltr">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5867A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E9C46A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#7FB89A]" />
                <span className="mx-auto text-xs font-bold px-10 py-1 rounded-md bg-white" style={{ color: '#5E6E67' }}>demo.ihkaam.app</span>
                <Maximize2 size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: '#0B3B33' }} />
              </div>
              <div className="relative bg-[#F8F5EC]" style={{ aspectRatio: '1440 / 900' }}>
                <AnimatePresence mode="popLayout">
                  <motion.img key={shot.id} src={desktopSrc(shot.id)} alt={shot.title} width={1600} height={1000}
                    loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-contain"
                    initial={{ opacity: 0, scale: 1.015 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease }} />
                </AnimatePresence>
              </div>
            </button>
            <AnimatePresence mode="wait">
              <motion.div key={shot.id} className="mt-5 flex items-start gap-4"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease }}>
                <span className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold mt-1" style={{ background: 'rgba(184,134,58,0.12)', color: '#8A6425' }}>{shot.group}</span>
                <div>
                  <div className="text-xl font-bold" style={{ color: '#0B3B33' }}>{shot.title}</div>
                  <p className="text-base mt-1" style={{ color: 'var(--text-2)', lineHeight: 1.85 }}>{shot.caption}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* التكبير */}
      <AnimatePresence>
        {zoom && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10" role="dialog" aria-modal="true" aria-label={shot.title}
            style={{ background: 'rgba(4,26,23,0.88)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(false)}>
            <button type="button" aria-label="إغلاق" onClick={() => setZoom(false)}
              className="absolute top-5 left-5 w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'rgba(248,245,236,0.12)', color: '#F8F5EC' }}>
              <X size={20} />
            </button>
            <motion.img src={desktopSrc(shot.id)} alt={shot.title} className="max-w-full max-h-full rounded-xl"
              style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}
              initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} transition={{ duration: 0.3, ease }}
              onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
