import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const STEPS = [
  {
    num   : '01',
    icon  : '🚀',
    title : 'سجّل معهدك خلال 5 دقائق',
    body  : 'أدخل اسم معهدك، اختر باقتك، وفريقنا يتولى الإعداد معك .',
  },
  {
    num   : '02',
    icon  : '👥',
    title : 'أضف الشيوخ والطلاب والحلقات',
    body  : 'أدخل بيانات الشيوخ، وزّع الطلاب على حلقاتهم. كل شيء منظّم قبل أن تنتهي من قهوة الصباح.',
  },
  {
    num   : '03',
    icon  : '✅',
    title : 'شغّل المعهد رقمياً — من اليوم الأول',
    body  : 'حضور بضغطة. تسميع موثّق. النظام بديهي من أول استخدام — لا تدريب مطلوب.',
  },
]

const containerVariants = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden : { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export default function HowItWorksSection() {
  return (
    <section className="relative z-10 px-6 pt-16 pb-16" dir="rtl">
      <div className="max-w-5xl mx-auto">

        {/* Label */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold tracking-widest uppercase"
            style={{
              background: 'rgba(0,168,150,0.08)',
              border    : '1px solid rgba(0,168,150,0.20)',
              color     : '#00A896',
            }}
          >
            كيف يعمل
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="text-center font-black mb-3"
          style={{ color: '#EAE4DF', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', lineHeight: 1.35 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          ثلاث خطوات — وتبدأ في نفس اليوم
        </motion.h2>
        <motion.p
          className="text-center text-sm mb-14 mx-auto"
          style={{ color: '#5A8A78', maxWidth: 400, lineHeight: 1.85 }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.10, ease: [0.22, 1, 0.36, 1] }}
        >
          فريقنا يرافقك في كل خطوة. لا تحتاج خبرة تقنية — فقط قرار البداية.
        </motion.p>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              variants={itemVariants}
              className="relative flex flex-col gap-5"
            >
              {/* Connector line between cards (desktop only) */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-7 left-0 -translate-x-1/2 w-full h-px pointer-events-none"
                  style={{
                    background: 'linear-gradient(to left, transparent, rgba(0,168,150,0.20), transparent)',
                    zIndex: -1,
                  }}
                  aria-hidden
                />
              )}

              {/* Card */}
              <div
                className="relative rounded-2xl p-6 flex flex-col gap-4 h-full"
                style={{
                  background: 'linear-gradient(145deg, rgba(1,30,30,0.70) 0%, rgba(1,14,14,0.95) 100%)',
                  border    : '1px solid rgba(0,168,150,0.15)',
                }}
              >
                {/* Step number badge */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{
                      background: 'rgba(0,168,150,0.12)',
                      border    : '1px solid rgba(0,168,150,0.25)',
                      color     : '#00A896',
                    }}
                  >
                    {step.num}
                  </span>
                  <span className="text-xl">{step.icon}</span>
                </div>

                <h3 className="font-black text-base leading-snug" style={{ color: '#D4EAE7' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#5A8A78' }}>
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.20, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/request"
              className="inline-flex items-center gap-2.5 rounded-xl font-black px-8 py-4 transition-all duration-250"
              style={{
                background: 'linear-gradient(135deg, #00A896 0%, #027368 100%)',
                color     : '#EAE4DF',
                fontSize  : '0.92rem',
                boxShadow : '0 6px 28px rgba(0,168,150,0.25)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,168,150,0.38)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,168,150,0.25)')}
            >
              ابدأ الآن — صمّم باقتك
              <ArrowLeft size={16} strokeWidth={2.5} />
            </Link>

            <Link
              to="/ihkaam"
              className="inline-flex items-center gap-2.5 rounded-xl font-bold px-8 py-4 transition-all duration-250"
              style={{
                background: 'rgba(106,189,178,0.08)',
                border    : '1px solid rgba(106,189,178,0.28)',
                color     : '#6ABDB2',
                fontSize  : '0.92rem',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background   = 'rgba(106,189,178,0.14)'
                e.currentTarget.style.borderColor  = 'rgba(106,189,178,0.50)'
                e.currentTarget.style.boxShadow    = '0 0 0 3px rgba(106,189,178,0.10)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background   = 'rgba(106,189,178,0.08)'
                e.currentTarget.style.borderColor  = 'rgba(106,189,178,0.28)'
                e.currentTarget.style.boxShadow    = 'none'
              }}
            >
              اكتشف الميزات أولاً
              <ArrowLeft size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
