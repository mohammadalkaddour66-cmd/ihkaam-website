import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, UsersRound, CircleCheck } from 'lucide-react'

const STEPS = [
  {
    num   : '01',
    Icon  : Building2,
    title : 'أرسل طلبك واختر باقتك',
    body  : 'أدخل اسم معهدك واحسب اشتراكك، وفريقنا يتواصل معك لإتمام الإعداد وتفعيل المعهد خلال 24 ساعة من تأكيد الدفع.',
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
    title : 'شغّل المعهد رقمياً — من أول يوم بعد التفعيل',
    body  : 'حضور بضغطة. تسميع موثّق. النظام بديهي من أول استخدام — لا تدريب مطلوب.',
  },
]

/* تسلسل الخطوات (2026-11-19 ج): تظهر الدائرة 1، ثم يُرسم الخطّ منها
   إلى 2 فتظهر 2، ثم إلى 3. كل خطوة بعد سابقتها بـSTEP ثانية، والبطاقة
   تلحق دائرتها. حركةٌ واحدة عند الدخول، لا حلقة لا نهائية. */
const STEP = 0.85
const ease = [0.22, 1, 0.36, 1]
const circleV = {
  hidden : { opacity: 0, scale: 0.4 },
  visible: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * STEP, type: 'spring', stiffness: 320, damping: 18 } }),
}
const cardV = {
  hidden : { opacity: 0, y: 22 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * STEP + 0.15, duration: 0.55, ease } }),
}
const lineV = {
  hidden : { scaleX: 0 },
  visible: (i) => ({ scaleX: 1, transition: { delay: i * STEP + 0.3, duration: STEP - 0.3, ease: 'easeInOut' } }),
}

/* قسمٌ داكن (2026-11-19): يكسر رتابة الكريمي بعد قسمي المشكلة والحل.
   الخطوات دوائر ذهبية مرقّمة يصلها خطٌّ منقّط، والبطاقات زجاجٌ معتم. */
export default function HowItWorksSection() {
  return (
    <section className="section-dark relative z-10 px-6 py-24 overflow-hidden" dir="rtl">
      <div className="pattern-layer pattern-khatam" aria-hidden />
      <div className="max-w-6xl mx-auto">

        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">كيف يعمل</span>
        </motion.div>

        <motion.h2
          className="text-center font-bold mb-4"
          style={{ color: 'var(--text-1)', fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          ثلاث خطوات — ويعمل معهدك <span className="title-mark">خلال 24 ساعة</span>
        </motion.h2>
        <motion.p
          className="text-center text-lg mb-16 mx-auto"
          style={{ color: 'var(--text-2)', maxWidth: 620, lineHeight: 1.9 }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.10, ease: [0.22, 1, 0.36, 1] }}
        >
          فريقنا يرافقك في كل خطوة. لا تحتاج خبرة تقنية — فقط قرار البداية.
        </motion.p>

        <motion.div
          className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {/* الخطّ الواصل — سطح المكتب: أثرٌ منقّط خافت، وفوقه قطعتان ذهبيتان تُرسمان
              من دائرةٍ إلى التالية (RTL: الخطوة الأولى يميناً، فالرسم من اليمين) */}
          <div
            className="hidden md:block absolute top-7 h-px pointer-events-none"
            style={{ right: '16.67%', left: '16.67%', backgroundImage: 'linear-gradient(to left, rgba(224,181,98,0.35) 50%, transparent 50%)', backgroundSize: '10px 1px' }}
            aria-hidden
          />
          {[0, 1].map(i => (
            <motion.div key={i} custom={i} variants={lineV} aria-hidden
              className="hidden md:block absolute top-[27px] h-[3px] rounded-full pointer-events-none"
              style={{ right: i === 0 ? '16.67%' : '50%', width: '33.33%', transformOrigin: 'right center',
                       background: 'linear-gradient(to left, #ECC77D, #B8863A)', boxShadow: '0 0 12px rgba(224,181,98,0.55)' }} />
          ))}
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              <motion.span custom={i} variants={circleV}
                className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold tabular-nums mb-6"
                style={{
                  background: 'linear-gradient(145deg, #ECC77D, #B8863A)',
                  color     : '#0B3B33',
                  boxShadow : '0 0 0 6px rgba(224,181,98,0.12), 0 12px 24px -10px rgba(0,0,0,0.5)',
                }}
              >
                {step.num}
              </motion.span>
              <motion.div custom={i} variants={cardV} className="card-on-dark p-7 flex flex-col items-center gap-3 h-full w-full">
                <step.Icon size={26} strokeWidth={1.6} style={{ color: '#E0B562' }} aria-hidden />
                <h3 className="font-bold text-xl leading-snug" style={{ color: 'var(--text-1)' }}>{step.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>{step.body}</p>
              </motion.div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.20, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/request" className="btn-cta inline-flex items-center gap-2.5 rounded-full px-8 py-4" style={{ fontSize: '1rem' }}>
              احسب اشتراك معهدك
              <ArrowLeft size={17} strokeWidth={2.5} />
            </Link>
            <Link to="/ihkaam#features" className="btn-outline inline-flex items-center gap-2.5 rounded-full px-8 py-4" style={{ fontSize: '1rem' }}>
              اكتشف الميزات أولاً
              <ArrowLeft size={17} strokeWidth={2.5} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
