import { motion } from 'framer-motion'
import { ClipboardList, BellOff, Brain } from 'lucide-react'
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

/* ══════════════════════════════════════════════════════
   لونٌ واحد محايد للمشاكل الثلاث، والتمييز بالأيقونة — نفس ما
   استُقرّ عليه في قسم «الجواب» بعده.

   كانت ثلاثة ألوان لا يجمعها جامع: ‎#C4614E‎ أحمر برتقالي،
   و‎#B98A63‎ تانٌّ دافئ، و‎#6FA5A8‎ رماديٌّ تركوازي. يقرؤها الزائر
   تصنيفاً ثم لا يجد ما تصنّفه. وأسوأ: tint البطاقة الثالثة
   (127,174,151) لم يكن لون accent-ها أصلاً، ودرجته 150° — داخل
   المدى المحرَّم صراحةً في :root. اللون المرتجل يمرّ، ثم يمرّ
   خطأٌ في اللون المرتجل، ولا أحد يملك ما يقيس عليه.

   والحياد هنا دلالةٌ لا تنازل: هذا مشهد «قبل» — الورق والفوضى.
   خلوُّه من اللون هو ما يجعل تركوازَ «الجواب» بعده يقع في العين.
   ══════════════════════════════════════════════════════ */
const PAIN_TINT = '111,165,168'   /* = --text-3 #6FA5A8 */

/* الإيموجي ليست أيقونة: تُرسم بخطّ النظام فتختلف شكلاً ولوناً بين
   ويندوز وآبل وأندرويد، ولا تُورَّث لون النص، وقارئ الشاشة ينطقها
   بالاسم الكامل («ملف بطاقات»). lucide مثبّتة أصلاً في المشروع. */
const PAINS = [
  {
    Icon  : ClipboardList,
    title : 'الكشف الورقي يأكل وقتك كل يوم',
    body  : 'ثلاث ساعات أسبوعياً في تسجيل حضور يدوي — ثم الورقة تضيع وتبدأ من جديد. وقت كان ممكن أن يُعطى للطلاب والقرآن.',
  },
  {
    Icon  : BellOff,
    title : 'ولي الأمر لا يعلم — وسيُحاسبك',
    body  : 'غاب الطالب ثلاثة أيام وأنت لا تعلم، وولي الأمر لا يعلم. حين يعلم سيسألك: لماذا لم تخبرني؟ — وهذا سؤال لا جواب له.',
  },
  {
    Icon  : Brain,
    title : 'مستوى كل طالب — في ذاكرة الشيخ فقط',
    body  : 'لو سألك ولي أمر اليوم: "وين وصل ابني في الحفظ؟" — كم ثانية تحتاج للإجابة؟ وماذا لو اعتذر الشيخ واستُبدل؟',
  },
]

const containerVariants = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.05 } },
}

/* أُزيل filter:blur من الحركة: التمويه يُعاد حسابه على وحدة الرسم
   في كل إطار لكل بطاقة، والقاعدة صريحة — transform و opacity فقط.
   المسافة قُلّصت من 60px إلى 24px؛ الستّون كانت تُقحم البطاقة من
   خارج الشاشة فتبدو كقفزة لا كظهور. */
const cardVariants = {
  hidden : { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const headingVariants = {
  hidden : { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
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
          {/* كان color: var(--emerald-lit) — متغيّرٌ لا وجود له في
              الملف كلّه، بقيّةُ عهدٍ أخضر. فكان النصّ يرث لون body
              الأبيض على خلفيةٍ رماديةٍ (124,134,136) وحدودٍ وردية:
              ثلاثة ألوان، لا واحد منها من اللوحة. */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold tracking-widest uppercase"
            style={{
              background: `rgba(${PAIN_TINT},0.08)`,
              border    : `1px solid rgba(${PAIN_TINT},0.24)`,
              color     : 'var(--text-3)',
            }}
          >
            هل هذا يصفك؟
          </span>
        </motion.div>

        {/* Heading —
            الهرمية تجيء من فارقٍ حادّ بين العنوان وما تحته، لا من
            تثقيل كل شيء: العنوان 900 وقياسٌ أكبر، والنصّ تحته 300.
            كان العنوان 2.1rem والنصّ تحته 14px بوزنٍ عاديّ، فالفارق
            بينهما قياسٌ فقط — ومعه يُقرأ القسم كتلةً واحدة. */}
        <motion.h2
          className="text-center font-black mb-3"
          style={{ color: 'var(--text-1)', fontSize: 'clamp(1.9rem, 4vw, 3.1rem)', lineHeight: 1.28 }}
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          هذه مشاكل حقيقية — ولها حلول حقيقية
        </motion.h2>
        <motion.p
          className="text-center text-base mb-12 mx-auto"
          style={{ color: 'var(--text-2)', maxWidth: 620, lineHeight: 1.9, fontWeight: 300 }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: 0.10, ease: [0.22, 1, 0.36, 1] }}
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
          {PAINS.map(({ Icon, title, body }) => (
            <motion.div key={title} variants={cardVariants}>
              <TiltCard
                className="relative rounded-2xl p-6 flex flex-col gap-4 h-full overflow-hidden"
                style={{
                  /* كانت #011a15eb — أخضرُ مُعتِمٌ (168°) لا يوافق
                     أيّ سطحٍ في اللوحة. أسطح الصفحة أربعة، وهذا
                     أعمقها. */
                  background: 'rgba(2,15,14,0.92)',
                  border    : `1px solid rgba(${PAIN_TINT},0.16)`,
                }}
              >
                {/* Corner glow */}
                <div
                  className="pointer-events-none absolute top-0 right-0 w-36 h-36 rounded-bl-[80px]"
                  style={{ background: `radial-gradient(circle at top right, rgba(${PAIN_TINT},0.10), transparent 65%)` }}
                  aria-hidden
                />

                {/* Bottom accent line */}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] rounded-b-2xl"
                  style={{ background: `linear-gradient(to right, transparent, rgba(${PAIN_TINT},0.30), transparent)` }}
                  aria-hidden
                />

                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `rgba(${PAIN_TINT},0.08)`,
                    border    : `1px solid rgba(${PAIN_TINT},0.20)`,
                    color     : 'var(--text-3)',
                  }}
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                </div>

                <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--text-1)' }}>
                  {title}
                </h3>
                {/* كان #6A9C9E — رمادي مرتجل سابع. --text-3 مقيس على 5:1 */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
                  {body}
                </p>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
