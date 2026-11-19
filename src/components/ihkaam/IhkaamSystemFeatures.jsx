import { motion } from 'framer-motion'

/* ══════════════════════════════════════════════════════════════════
   «خصائص النظام» (إعادة تصميم 2026-11-19 ج)

   كانت ستة صفوفٍ نصّية بأيقونةٍ صغيرة. صار قسماً داكناً بستّ بطاقات،
   لكلٍّ رسمةٌ خطّية بالذهب تُرسم أمام الزائر حين تظهر (pathLength من
   0 إلى 1)، ثم تبقى ساكنة: الأجهزة الثلاثة، يدٌ تنقر، درعٌ وقفل، سهما
   التحديث، ورقة تنزل منها نسخة، وشجرة صلاحيات.
   ══════════════════════════════════════════════════════════════════ */

const GOLD = '#E0B562'

const draw = (d = 0) => ({
  hidden : { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { pathLength: { delay: d, duration: 1.1, ease: 'easeInOut' }, opacity: { delay: d, duration: 0.2 } } },
})

function P({ d, delay = 0, ...rest }) {
  return <motion.path d={d} variants={draw(delay)} fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest} />
}
function R({ delay = 0, ...rest }) {
  return <motion.rect variants={draw(delay)} fill="none" stroke={GOLD} strokeWidth={2} strokeLinejoin="round" {...rest} />
}
function C({ delay = 0, ...rest }) {
  return <motion.circle variants={draw(delay)} fill="none" stroke={GOLD} strokeWidth={2} {...rest} />
}

/* كل رسمة في مربّع 160×100 */
const ART = {
  devices: (
    <>
      <R x={30} y={18} width={78} height={50} rx={4} />
      <P d="M20 76h98l-6 6H26z" delay={0.3} />
      <R x={112} y={34} width={30} height={48} rx={4} delay={0.5} />
      <C cx={127} cy={76} r={1.5} delay={0.9} />
      <R x={8} y={40} width={22} height={40} rx={4} delay={0.7} />
      <P d="M44 32h40M44 42h28M44 52h34" delay={0.9} strokeOpacity={0.6} />
    </>
  ),
  easy: (
    <>
      <C cx={92} cy={38} r={10} delay={0.6} strokeOpacity={0.5} />
      <C cx={92} cy={38} r={20} delay={0.8} strokeOpacity={0.3} />
      <P d="M70 90V52a6 6 0 0 1 12 0v22l18 4a8 8 0 0 1 6 9l-2 10" />
      <P d="M82 62a6 6 0 0 1 12 0v12M94 66a6 6 0 0 1 12 0v10" delay={0.3} />
    </>
  ),
  security: (
    <>
      <P d="M80 10l34 12v26c0 22-16 36-34 44C62 84 46 70 46 48V22z" />
      <R x={66} y={46} width={28} height={22} rx={4} delay={0.5} />
      <P d="M72 46v-6a8 8 0 0 1 16 0v6" delay={0.7} />
      <C cx={80} cy={56} r={2.5} delay={0.9} />
    </>
  ),
  updates: (
    <>
      <P d="M112 46a32 32 0 0 0-58-16" />
      <P d="M50 18l4 12 12-3" delay={0.4} />
      <P d="M48 54a32 32 0 0 0 58 16" delay={0.2} />
      <P d="M110 82l-4-12-12 3" delay={0.6} />
      <C cx={80} cy={50} r={8} delay={0.8} />
    </>
  ),
  export: (
    <>
      <P d="M50 10h40l18 18v62H50z" />
      <P d="M90 10v18h18" delay={0.3} />
      <P d="M60 40h34M60 50h34M60 60h22" delay={0.5} strokeOpacity={0.6} />
      <P d="M124 44v34M114 68l10 10 10-10" delay={0.8} />
    </>
  ),
  roles: (
    <>
      <C cx={80} cy={18} r={9} />
      <P d="M80 27v14M34 41h92M34 41v12M80 41v12M126 41v12" delay={0.4} />
      <C cx={34} cy={64} r={8} delay={0.7} />
      <C cx={80} cy={64} r={8} delay={0.8} />
      <C cx={126} cy={64} r={8} delay={0.9} />
      <P d="M22 90a12 12 0 0 1 24 0M68 90a12 12 0 0 1 24 0M114 90a12 12 0 0 1 24 0" delay={1} strokeOpacity={0.6} />
    </>
  ),
}

const FEATURES = [
  { art: 'devices',  title: 'يعمل على جميع الأجهزة',     desc: 'من المتصفح على الحاسوب أو الجهاز اللوحي أو الهاتف، دون تثبيت تطبيق.' },
  { art: 'easy',     title: 'سهل الاستخدام',             desc: 'لا يحتاج خبرة تقنية. يتعلمه المعلم في دقائق ويستخدمه كل يوم دون تعقيد.' },
  { art: 'security', title: 'الأمن والحماية',            desc: 'بيانات مشفّرة وصلاحيات محكمة، ولكل معهدٍ بياناته لا يراها غيره.' },
  { art: 'updates',  title: 'تحديثات مستمرة',            desc: 'كل تحديثٍ جديد يصل إلى معهدك تلقائياً، دون أي تدخّل منك.' },
  { art: 'export',   title: 'تقارير قابلة للتصدير',       desc: 'غياب، تسميع، اختبارات، مالية: بصيغة PDF أو Excel بضغطة، مصفّاةً بالحلقة أو الطالب أو الفترة.' },
  { art: 'roles',    title: 'صلاحيات متعددة المستويات',  desc: 'سبع صفات جاهزة من المدير إلى المشرف المالي، ولكل موظف صلاحياته تبويبةً تبويبة.' },
]

export default function IhkaamSystemFeatures() {
  return (
    <section className="section-dark relative z-10 py-24 px-6 overflow-hidden" dir="rtl">
      <div className="pattern-layer pattern-khatam" aria-hidden />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="eyebrow">المنصة التقنية</span>
          <h2 className="font-bold leading-tight mx-auto mt-5 mb-5" style={{ color: '#F8F5EC', fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', maxWidth: 700 }}>
            مبنيّ ليبقى <span className="title-mark">سنواتٍ لا موسماً</span>
          </h2>
          <p className="text-lg mx-auto" style={{ color: 'rgba(248,245,236,0.8)', maxWidth: 560, lineHeight: 1.9 }}>
            ستّ خصائص تقنية تجعل إحكام موثوقاً وسهلاً وآمناً، يوم تشغيله وبعده بسنوات.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.art} className="card-on-dark p-7 flex flex-col gap-4"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] } } }}>
              <svg viewBox="0 0 160 100" className="w-full h-auto max-w-[220px] mx-auto" aria-hidden
                   style={{ filter: 'drop-shadow(0 0 6px rgba(224,181,98,0.25))' }}>
                {ART[f.art]}
              </svg>
              <h3 className="font-bold text-xl" style={{ color: '#F8F5EC' }}>{f.title}</h3>
              <p className="text-base" style={{ color: 'rgba(248,245,236,0.78)', lineHeight: 1.85 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
