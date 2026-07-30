import { motion } from 'framer-motion'
import { Zap, BookOpenCheck, Users } from 'lucide-react'
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

/* كانت البطاقات الثلاث بثلاثة تيلات متقاربة (#48D6CD / #48D6CD / #D9ACA3) —
   فرقٌ لا يُقرأ كنيّة، بل كخطأ في أخذ اللون. لونٌ واحد، والتمييز بالأيقونة. */
const SOLUTIONS = [
  {
    Icon: Zap,
    tag: 'الحضور والغياب',
    title: 'حضور رقمي فوري',
    body: 'سجّل حضور الحلقة كاملاً بلمسة واحدة. كل غياب يظهر فوراً في بوابة ولي الأمر دون جهد إضافي.',
  },
  {
    Icon: BookOpenCheck,
    tag: 'متابعة التسميع',
    title: 'كل جلسة تسميع — محفوظة للأبد',
    body: 'ماذا قرأ، وكم مرة كرّر، وماذا قال شيخه. لو سألك أحد عن أي طالب — الجواب أمامك في 3 ثوانٍ.',
  },
  {
    Icon: Users,
    tag: 'تواصل الأسرة',
    title: 'أولياء الأمور على متابعة دائمة',
    body: 'بوابة لأولياء الأمور تُظهر الحضور والمستوى والملاحظات. تُقلّل اتصالات الاستفسار 80% — وتبني ثقة أعمق بمعهدك.',
  },
]

const containerVariants = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden : { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
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
              background: 'rgba(72, 214, 205,0.08)',
              border    : '1px solid rgba(72, 214, 205,0.20)',
              color     : 'var(--accent)',
            }}
          >
            الجواب
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
          كل مشكلة ذكرتها — لها جواب في إحكام
        </motion.h2>
        <motion.p
          className="text-center text-base mb-12 mx-auto"
          style={{ color: 'var(--text-2)', maxWidth: 640, lineHeight: 1.9, fontWeight: 300 }}
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
          {SOLUTIONS.map(({ Icon, tag, title, body }) => (
            <motion.div key={title} variants={itemVariants}>
            <TiltCard
              className="relative rounded-2xl p-6 flex flex-col gap-4 overflow-hidden h-full"
              style={{
                background: 'linear-gradient(145deg, rgba(9,32,30,0.75) 0%, rgba(2,15,14,0.95) 100%)',
                border    : '1px solid rgba(72, 214, 205,0.16)',
              }}
            >
              {/* Ambient glow top-right */}
              <div
                className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(72, 214, 205,0.07), transparent 70%)' }}
                aria-hidden
              />

              {/* الأيقونة والشارة في صفٍّ واحد.
                  كانتا سطرين مستقلّين، فتأكلان ~45px من ارتفاع كل
                  بطاقة بلا معنى يقابله — والشارة تسمّي ما تصوّره
                  الأيقونة، فاجتماعهما أصحّ دلالةً كذلك. */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(72, 214, 205,0.07)',
                    border    : '1px solid rgba(72, 214, 205,0.16)',
                    color     : 'var(--accent)',
                  }}
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                </div>

                {/* كان 10px، وهو دون حدّ القراءة (12px) */}
                <span
                  className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(72, 214, 205,0.08)',
                    border    : '1px solid rgba(72, 214, 205,0.18)',
                    color     : 'var(--accent)',
                  }}
                >
                  {tag}
                </span>
              </div>

              <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--text-1)' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
                {body}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 right-0 left-0 h-[2px] rounded-b-2xl"
                style={{ background: 'linear-gradient(to left, rgba(72, 214, 205,0.25), transparent)' }}
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
