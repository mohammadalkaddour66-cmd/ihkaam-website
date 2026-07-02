import { motion } from 'framer-motion'
import { useTilt } from '../hooks/useTilt'

function TiltCard({ children, style, className }) {
  const { ref, rotateX, rotateY, scale, onMouseMove, onMouseEnter, onMouseLeave } = useTilt(8)
  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, scale, perspective: 800, ...style }}
      className={className}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  )
}

const PAINS = [
  {
    icon  : '📋',
    title : 'الكشف الورقي يأكل وقتك كل يوم',
    body  : 'ثلاث ساعات أسبوعياً في تسجيل حضور يدوي — ثم الورقة تضيع وتبدأ من جديد. وقت كان ممكن أن يُعطى للطلاب والقرآن.',
    accent: '#D9ACA3',
  },
  {
    icon  : '📵',
    title : 'ولي الأمر لا يعلم — وسيُحاسبك',
    body  : 'غاب الطالب ثلاثة أيام وأنت لا تعلم، وولي الأمر لا يعلم. حين يعلم سيسألك: لماذا لم تخبرني؟ — وهذا سؤال لا جواب له.',
    accent: '#A3C4D9',
  },
  {
    icon  : '🗂️',
    title : 'مستوى كل طالب — في ذاكرة الشيخ فقط',
    body  : 'لو سألك ولي أمر اليوم: "وين وصل ابني في الحفظ؟" — كم ثانية تحتاج للإجابة؟ وماذا لو اعتذر الشيخ واستُبدل؟',
    accent: '#D9C8A3',
  },
]

const containerVariants = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.05 } },
}

const cardVariants = {
  hidden : { opacity: 0, y: 60, scale: 0.88, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.70, ease: [0.22, 1, 0.36, 1] },
  },
}

const headingVariants = {
  hidden : { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

export default function PainSection() {
  return (
    <section className="relative z-10 px-6 pt-20 pb-4" dir="rtl">
      <div className="max-w-5xl mx-auto">

        {/* Label */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold tracking-widest uppercase"
            style={{
              background: 'rgba(217,172,163,0.10)',
              border    : '1px solid rgba(217,172,163,0.30)',
              color     : '#D9ACA3',
            }}
          >
            هل هذا يصفك؟
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="text-center font-black mb-3"
          style={{ color: '#EAE4DF', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', lineHeight: 1.35 }}
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          هذه مشاكل حقيقية — ولها حلول حقيقية
        </motion.h2>
        <motion.p
          className="text-center text-sm mb-12 mx-auto"
          style={{ color: '#5A8A78', maxWidth: 420, lineHeight: 1.85 }}
          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          لا تحتاج أن تتأقلم مع الفوضى. كل واحدة من هذه المشاكل لها جواب واضح في إحكام.
        </motion.p>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {PAINS.map((p) => (
            <motion.div key={p.title} variants={cardVariants}>
              <TiltCard
                className="relative rounded-2xl p-6 flex flex-col gap-4 h-full overflow-hidden"
                style={{
                  background: 'rgba(1,20,18,0.92)',
                  border    : `1px solid ${p.accent}28`,
                }}
              >
                {/* Corner glow */}
                <div
                  className="pointer-events-none absolute top-0 right-0 w-36 h-36 rounded-bl-[80px]"
                  style={{ background: `radial-gradient(circle at top right, ${p.accent}1A, transparent 65%)` }}
                  aria-hidden
                />

                {/* Bottom accent line */}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] rounded-b-2xl"
                  style={{ background: `linear-gradient(to right, transparent, ${p.accent}55, transparent)` }}
                  aria-hidden
                />

                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: `${p.accent}12`,
                    border    : `1px solid ${p.accent}30`,
                  }}
                >
                  {p.icon}
                </div>

                <h3 className="font-black text-base leading-snug" style={{ color: '#E5D3B3' }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6A9A88' }}>
                  {p.body}
                </p>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
