import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function IhkaamCTABanner() {
  const reduce = useReducedMotion()
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
    {/* ثلاث حركاتٍ لا نهائية كانت تعمل على هذه اللوحة معاً: طفوٌ
       رأسي، ونبض في الإطار، وومضةٌ تمسح العرض كل أربع ثوانٍ.
       والقاعدة: عنصران متحرّكان في المشهد الواحد على الأكثر.
       اللوحة نداءٌ للفعل — والزرّ هو ما يجب أن تقع عليه العين،
       لا الإطارُ ينبض حوله. بقي الطفو وحده. */}
    <motion.div
      className="section-dark relative rounded-3xl overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}
      animate={reduce ? undefined : { y: [0, -6, 0] }}
      transition={{
        duration: 4.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
        delay: 0.7,
      }}
    >
      {/* لوحة داكنة (2026-11-19): الأخضر الحبريّ ونقش النجمة، بحدٍّ ذهبيّ رفيع */}
      <div className="pattern-layer pattern-khatam" aria-hidden />
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(224,181,98,0.30)' }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-14 py-14" dir="rtl">
        {/* Text */}
        <div className="flex flex-col gap-3 text-center md:text-right">
          <span className="eyebrow self-center md:self-start">الخطوة التالية</span>
          <h2
            className="font-bold"
            style={{ color: 'var(--text-1)', fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)' }}
          >
            معهدك يستحق نظاماً{' '}
            <span className="title-mark">يليق برسالته</span>
            <br className="hidden sm:block" />
            — ابدأ اليوم.
          </h2>
          <p className="text-base leading-[1.9]" style={{ color: 'var(--text-2)', maxWidth: '460px' }}>
            معاهد قرآنية اختارت إحكام اليوم.
            فريقنا يرافقك خطوة بخطوة — من أول يوم حتى تنطلق.
          </p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <Link
            to="/request"
            className="btn-cta inline-flex items-center gap-2.5 rounded-full whitespace-nowrap"
            style={{ fontSize: '1.05rem', padding: '1.05rem 2.6rem' }}
          >
            اختر باقة معهدك
            <ArrowLeft size={17} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </motion.div>
  </motion.div>
</section>
  )
}
