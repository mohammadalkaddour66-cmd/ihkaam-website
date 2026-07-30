import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, UsersRound, CircleCheck } from 'lucide-react'

const STEPS = [
  {
    num   : '01',
    Icon  : Building2,
    title : 'سجّل معهدك خلال 5 دقائق',
    body  : 'أدخل اسم معهدك، اختر باقتك، وفريقنا يتولى الإعداد معك.',
  },
  {
    num   : '02',
    Icon  : UsersRound,
    title : 'أضف الشيوخ والطلاب والحلقات',
    body  : 'أدخل بيانات الشيوخ، وزّع الطلاب على حلقاتهم. كل شيء منظّم قبل أن تنتهي من قهوة الصباح.',
  },
  {
    num   : '03',
    Icon  : CircleCheck,
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
              background: 'rgba(72, 214, 205,0.08)',
              border    : '1px solid rgba(72, 214, 205,0.20)',
              color     : 'var(--accent)',
            }}
          >
            كيف يعمل
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="text-center font-black mb-3"
          style={{ color: 'var(--text-1)', fontSize: 'clamp(1.9rem, 4vw, 3.1rem)', lineHeight: 1.28 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          ثلاث خطوات — وتبدأ في نفس اليوم
        </motion.h2>
        <motion.p
          className="text-center text-base mb-14 mx-auto"
          style={{ color: 'var(--text-2)', maxWidth: 600, lineHeight: 1.9, fontWeight: 300 }}
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
              {/* الخطّ الواصل بين البطاقات (سطح المكتب فقط).
                  كان zIndex:-1 يدفعه خلف خلفية القسم فيختفي أصلاً؛
                  والاتجاه left في صفحة RTL يشير للخطوة السابقة لا التالية. */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-[2.625rem] right-full w-6 h-px pointer-events-none"
                  style={{ background: 'linear-gradient(to left, rgba(72, 214, 205,0.30), transparent)' }}
                  aria-hidden
                />
              )}

              {/* Card */}
              <div
                className="relative rounded-2xl p-6 flex flex-col gap-4 h-full"
                style={{
                  background: 'linear-gradient(145deg, rgba(9,32,30,0.70) 0%, rgba(2,15,14,0.95) 100%)',
                  border    : '1px solid rgba(72, 214, 205,0.15)',
                }}
              >
                {/* Step number badge */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 tabular-nums"
                    style={{
                      background: 'rgba(72, 214, 205,0.12)',
                      border    : '1px solid rgba(72, 214, 205,0.25)',
                      color     : 'var(--accent)',
                    }}
                  >
                    {step.num}
                  </span>
                  <step.Icon size={20} strokeWidth={1.75} style={{ color: 'var(--text-2)' }} aria-hidden />
                </div>

                <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--text-1)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
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
              className="btn-cta inline-flex items-center gap-2.5 rounded-xl px-8 py-4"
              style={{ fontSize: '0.92rem' }}
            >
              اطلب نسخة
              <ArrowLeft size={16} strokeWidth={2.5} />
            </Link>

            <Link
              to="/ihkaam"
              className="btn-outline inline-flex items-center gap-2.5 rounded-xl px-8 py-4"
              style={{ fontSize: '0.92rem' }}
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
