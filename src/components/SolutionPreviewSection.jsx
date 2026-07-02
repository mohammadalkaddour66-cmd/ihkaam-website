import { motion } from 'framer-motion'
import { useTilt } from '../hooks/useTilt'

function TiltCard({ children, style, className }) {
  const { ref, rotateX, rotateY, scale, onMouseMove, onMouseEnter, onMouseLeave } = useTilt(7)
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

const SOLUTIONS = [
  {
    icon: '⚡',
    tag: 'الحضور والغياب',
    title: 'حضور رقمي فوري ',
    body: 'سجّل حضور الحلقة كاملاً بلمسة واحدة. كل غياب يظهر فوراً في بوابة ولي الأمر دون جهد إضافي.',
    color: '#6ABDB2',
  },
  {
    icon: '📊',
    tag: 'متابعة التسميع',
    title: 'كل جلسة تسميع — محفوظة للأبد',
    body: 'ماذا قرأ، وكم مرة كرّر، وماذا قال شيخه. لو سألك أحد عن أي طالب — الجواب أمامك في 3 ثوانٍ.',
    color: '#00A896',
  },
  {
    icon: '🔗',
    tag: 'تواصل الأسرة',
    title: 'أولياء الاأمور على متابعة دائمة',
    body: 'بوابة لأولياء الأمور تُظهر الحضور والمستوى والملاحظات. تُقلّل اتصالات الاستفسار 80% — وتبني ثقة أعمق بمعهدك.',
    color: '#5BA89E',
  },
]

const containerVariants = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden : { opacity: 0, y: 60, scale: 0.88, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)',
    transition: { duration: 0.70, ease: [0.22, 1, 0.36, 1] } },
}

export default function SolutionPreviewSection() {
  return (
    <section className="relative z-10 px-6 pt-6 pb-4" dir="rtl">
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
              background: 'rgba(106,189,178,0.08)',
              border    : '1px solid rgba(106,189,178,0.20)',
              color     : '#6ABDB2',
            }}
          >
            الجواب
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
          كل مشكلة ذكرتها — لها جواب في إحكام
        </motion.h2>
        <motion.p
          className="text-center text-sm mb-12 mx-auto"
          style={{ color: '#5A8A78', maxWidth: 440, lineHeight: 1.85 }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.10, ease: [0.22, 1, 0.36, 1] }}
        >
          ليس نظاماً عاماً أُعيد تسميته. إحكام بُني لمعهد التحفيظ تحديداً — من الحلقة للشيخ لولي الأمر.
        </motion.p>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {SOLUTIONS.map((s) => (
            <motion.div key={s.title} variants={itemVariants}>
            <TiltCard
              className="relative rounded-2xl p-6 flex flex-col gap-4 overflow-hidden h-full"
              style={{
                background: 'linear-gradient(145deg, rgba(1,28,28,0.75) 0%, rgba(1,16,16,0.95) 100%)',
                border    : `1px solid ${s.color}28`,
              }}
            >
              {/* Ambient glow top-right */}
              <div
                className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full"
                style={{ background: `radial-gradient(circle, ${s.color}12, transparent 70%)` }}
                aria-hidden
              />

              {/* Tag */}
              <span
                className="self-start text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{
                  background: `${s.color}12`,
                  border    : `1px solid ${s.color}25`,
                  color     : s.color,
                }}
              >
                {s.tag}
              </span>

              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${s.color}10`, border: `1px solid ${s.color}22` }}
              >
                {s.icon}
              </div>

              <h3 className="font-black text-base leading-snug" style={{ color: '#D4EAE7' }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5A8A78' }}>
                {s.body}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 right-0 left-0 h-[2px] rounded-b-2xl"
                style={{ background: `linear-gradient(to left, ${s.color}40, transparent)` }}
                aria-hidden
              />
            </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
