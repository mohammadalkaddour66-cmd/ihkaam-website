import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function IhkaamCTABanner() {
  return (
    <section className="relative z-10 px-6 pt-6 pb-16">
  {/* Entry fade-in wrapper */}
  <motion.div
    className="max-w-5xl mx-auto"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.60, ease: [0.22, 1, 0.36, 1] }}
  >
    {/* Continuous float — starts after entry delay */}
    <motion.div
      className="relative rounded-3xl overflow-hidden"
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 4.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
        delay: 0.7,
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #013D38 0%, #012A27 50%, #011A1A 100%)',
        }}
      />

      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,168,150,0.18) 0%, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(217,172,163,0.10) 0%, transparent 70%)' }}
        aria-hidden
      />

      {/* Pulsing border glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
        style={{
          border: '1px solid rgba(0,168,150,0.30)',
          boxShadow: 'inset 0 0 28px rgba(0,168,150,0.07)',
        }}
        aria-hidden
      />

      {/* Shimmer sweep — light bar travelling right to left */}
      <motion.div
        className="pointer-events-none absolute top-0 bottom-0"
        style={{
          width: '40%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
          transform: 'skewX(-20deg)',
          willChange: 'transform',
        }}
        animate={{ x: ['150%', '-100%'] }}
        transition={{
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 2.5,
          delay: 0.5
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-12" dir="rtl">
        {/* Text */}
        <div className="flex flex-col gap-3 text-center md:text-right">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase" style={{ color: '#00A896' }}>
            الخطوة التالية
          </p>
          <h2
            className="font-black leading-[1.3]"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.3rem, 2.8vw, 2rem)' }}
          >
            معهدك يستحق نظاماً{' '}
            <span className="text-rose-grad">يليق برسالته</span>
            <br className="hidden sm:block" />
            — ابدأ اليوم.
          </h2>
          <p className="text-sm leading-[1.9]" style={{ color: '#6A9490', maxWidth: '440px' }}>
            معاهد قرآنية اختارت إحكام اليوم.
            فريقنا يرافقك خطوة بخطوة — من أول يوم حتى تنطلق.
          </p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <Link
            to="/request"
            className="btn-cta inline-flex items-center gap-2.5 rounded-xl whitespace-nowrap"
            style={{ fontSize: '0.95rem', padding: '1rem 2.4rem' }}
          >
            صمّم باقتك الآن
            <ArrowLeft size={17} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </motion.div>
  </motion.div>
</section>
  )
}
