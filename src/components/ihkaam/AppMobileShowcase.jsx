import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, UserCheck, Download } from 'lucide-react'
import { MOBILE_SHOTS, mobileSrc } from '../../data/appShots'

/* ══════════════════════════════════════════════════════════════════
   «على الجوال» (إعادة بناء 2026-11-19 د)

   كانت ثلاثة هواتف رمادية بلقطاتٍ صغيرة على خلفيةٍ فاتحة، بلا شرحٍ
   لما فيها («سيء جداً» كما قال المالك). صار قسماً داكناً: هاتفٌ كبير
   في الوسط بلقطةٍ حقيقية من نسخة العرض على عرض 390، وعلى جانبيه
   الشاشتان السابقة والتالية أصغر وأخفت، وتتبدّل كل 4.5 ثانية.
   وإلى جانبه عنوان الشاشة وشرحٌ يصف ما فيها، وقائمةٌ للتنقّل.
   ══════════════════════════════════════════════════════════════════ */

const INTERVAL = 4500
const ease = [0.22, 1, 0.36, 1]
const N = MOBILE_SHOTS.length

function Phone({ id, alt, size = 1 }) {
  const w = 270 * size
  return (
    <div style={{ width: w, borderRadius: 44 * size, padding: 9 * size,
      background: 'linear-gradient(145deg,#3E4642,#161A18 40%,#2E3431 62%,#101311)',
      boxShadow: '0 50px 80px -30px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
      {/* اللقطة 390×844 بلا شريط حالة، فيُرسم شريطٌ فوقها (46 من 890) كي لا
          تغطّي «الجزيرة» رأس التطبيق */}
      <div className="relative overflow-hidden bg-white" style={{ borderRadius: 36 * size, aspectRatio: '390 / 890' }}>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between font-bold" dir="ltr"
             style={{ height: '5.17%', padding: `0 ${22 * size}px`, fontSize: 11 * size, color: '#0B3B33' }}>
          <span>9:41</span>
          <span className="flex items-center gap-1" aria-hidden>
            <span style={{ width: 15 * size, height: 8 * size, borderRadius: 2, background: '#0B3B33' }} />
          </span>
        </div>
        <img src={mobileSrc(id)} alt={alt} width={600} height={1298} loading="lazy" decoding="async"
             className="absolute inset-x-0 bottom-0 w-full object-cover object-top" style={{ height: '94.83%' }} />
        <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black" style={{ top: 7 * size, width: 74 * size, height: 20 * size }} />
      </div>
    </div>
  )
}

export default function AppMobileShowcase() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setI(x => (x + 1) % N), INTERVAL)
    return () => clearTimeout(t)
  }, [i, paused])

  /* عرض الحاوية يحدّد مقاس الهاتف وبُعد الجارين عنه */
  const [small, setSmall] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const fn = () => setSmall(mq.matches)
    fn(); mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const shot = MOBILE_SHOTS[i]
  const go = (d) => setI(x => (x + d + N) % N)

  return (
    <section className="section-dark relative z-10 px-6 py-24 overflow-hidden" dir="rtl"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="pattern-layer pattern-khatam" aria-hidden />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* النص */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <span className="eyebrow">على الجوال</span>
          <h2 className="font-bold mt-5 mb-5" style={{ color: '#F8F5EC', fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', lineHeight: 1.35 }}>
            المعهد كلّه <span className="title-mark">في جيب المعلم</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(248,245,236,0.8)', lineHeight: 1.9 }}>
            يعمل إحكام من متصفّح أي هاتف، ويُثبَّت على الشاشة الرئيسية كتطبيق. هذه شاشاته كما تظهر على جوالٍ حقيقي.
          </p>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={shot.id} className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(248,245,236,0.06)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,0.3)' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease }}>
              <div className="text-xl font-bold mb-1.5" style={{ color: '#E0B562' }}>{shot.title}</div>
              <p className="text-base" style={{ color: 'rgba(248,245,236,0.85)', lineHeight: 1.85 }}>{shot.caption}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap gap-2 mb-8">
            {MOBILE_SHOTS.map((s, n) => (
              <button key={s.id} type="button" onClick={() => setI(n)} aria-pressed={n === i}
                className="rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300"
                style={{ background: n === i ? '#E0B562' : 'transparent', color: n === i ? '#0B3B33' : 'rgba(248,245,236,0.8)', boxShadow: n === i ? 'none' : 'inset 0 0 0 1px rgba(224,181,98,0.3)' }}>
                {s.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[[Smartphone, 'من المتصفّح', 'بلا متجر تطبيقات'], [Download, 'يُثبَّت كتطبيق', 'على الشاشة الرئيسية'], [UserCheck, 'حسابٌ لكل معلم', 'بصلاحياتٍ يحدّدها المدير']].map(([Icon, t, d]) => (
              <div key={t} className="rounded-xl p-3 text-center" style={{ background: 'rgba(248,245,236,0.04)', boxShadow: 'inset 0 0 0 1px rgba(248,245,236,0.1)' }}>
                <Icon size={18} className="mx-auto mb-1.5" style={{ color: '#E0B562' }} />
                <div className="text-sm font-bold" style={{ color: '#F8F5EC' }}>{t}</div>
                <div className="text-xs" style={{ color: 'rgba(248,245,236,0.6)' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* الهواتف */}
        {/* شريطٌ دوّار (2026-11-19 هـ): كانت الهواتف الثلاثة تختفي وتظهر
            بالتتابع، فيتحرّك الجانبيان ثم ينتظر الأوسط دوره. صارت كل الهواتف
            على مسارٍ واحد، وكلٌّ يعرف بُعده عن المختار، فتنزلق كلها معاً:
            التالي من اليسار إلى الوسط والحالي إلى اليمين. ويُسحب بالإصبع. */}
        <motion.div
          className="lg:col-span-7 order-1 lg:order-2 relative flex items-center justify-center select-none"
          style={{ minHeight: small ? 520 : 620, touchAction: 'pan-y' }}
          onPanEnd={(_, info) => { if (info.offset.x > 50) go(1); else if (info.offset.x < -50) go(-1) }}
        >
          <div aria-hidden className="absolute w-[460px] h-[460px] max-w-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(224,181,98,0.22), transparent 65%)' }} />
          {MOBILE_SHOTS.map((s, n) => {
            let d = n - i
            if (d > N / 2) d -= N
            if (d < -N / 2) d += N
            const ad = Math.abs(d)
            const step = small ? 150 : 235
            return (
              <motion.button
                key={s.id}
                type="button"
                tabIndex={ad === 1 ? 0 : -1}
                aria-label={ad === 0 ? s.title : `اعرض: ${s.title}`}
                onClick={() => ad && setI(n)}
                className="absolute"
                style={{ zIndex: 10 - ad, cursor: ad ? 'pointer' : 'default', pointerEvents: ad > 1 ? 'none' : 'auto' }}
                initial={false}
                animate={{
                  x: -d * step,
                  scale: ad === 0 ? 1 : ad === 1 ? 0.74 : 0.6,
                  rotate: ad === 0 ? 0 : d > 0 ? -7 : 7,
                  opacity: ad === 0 ? 1 : ad === 1 ? 0.5 : 0,
                  filter: ad === 0 ? 'brightness(1)' : 'brightness(0.7)',
                }}
                transition={{ type: 'spring', stiffness: 170, damping: 26, mass: 0.9 }}
              >
                <Phone id={s.id} alt={s.title} size={small ? 0.9 : 1.12} />
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
