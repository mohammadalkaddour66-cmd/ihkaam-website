import { motion } from 'framer-motion'

/* ══════════════════════════════════════════════════════════════════
   «لماذا بنينا إحكام» بصور حقيقية (2026-11-19 ب)

   الصيغة الأولى (حديثٌ في العنوان ثم سطران) رآها المالك «حلوة الفكرة
   لكن غير مقنعة». صار القسم يروي المشكلة التي بُني لها إحكام: تاريخ
   الطالب محفوظ في ذاكرة الشيخ ودفتره، وهذا يعمل إلى أن يغيب الشيخ.
   ثم ثلاثة مواقف من يوم المعهد، ولكلٍّ ما يتغيّر فيه.

   الصور عربية حقيقية (كانت لطالبٍ من إندونيسيا): رجالٌ يقرؤون في
   الجامع الأموي بدمشق (CC0)، وكُتّابٌ يحفظ فيه الأطفال من الألواح
   (CC BY-SA 4.0). الإسناد ظاهرٌ أسفل القسم؛ التفصيل في
   public/photos/CREDITS.txt.
   ══════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1]

const FACTS = [
  { k: 'يعتذر المعلّم شهراً', v: 'فيكمل البديل من آخر آيةٍ سمّعها كل طالب' },
  { k: 'ينتقل الطالب إلى حلقةٍ أعلى', v: 'فينتقل معه تاريخه كاملاً' },
  { k: 'يسأل الأب: وين وصل ابني؟', v: 'فيجد الجواب على جواله قبل أن يسأل' },
]

function Framed({ src, alt, className, delay, rotate, w, h }) {
  return (
    <motion.figure
      className={`absolute overflow-hidden rounded-[22px] ${className}`}
      style={{ boxShadow: '0 30px 60px -24px rgba(0,0,0,0.7), 0 0 0 1px rgba(224,181,98,0.5), 0 0 0 8px rgba(11,59,51,0.6), 0 0 0 9px rgba(224,181,98,0.35)', rotate }}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease }}
    >
      <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" className="w-full h-full object-cover" />
    </motion.figure>
  )
}

export default function MissionPhotoSection() {
  return (
    <section className="relative z-10 overflow-hidden" dir="rtl" style={{ background: '#082C26' }}>
      {/* الخلفية الفوتوغرافية */}
      <img src="/photos/umayyad-mosque.webp" alt="" aria-hidden width={1600} height={1389} loading="lazy" decoding="async"
           className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.38 }} />
      <div className="absolute inset-0" aria-hidden
           style={{ background: 'linear-gradient(100deg, rgba(8,44,38,0.97) 0%, rgba(8,44,38,0.88) 45%, rgba(11,59,51,0.55) 100%)' }} />
      <div className="absolute inset-0 pattern-khatam" style={{ opacity: 0.06 }} aria-hidden />

      <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
        <motion.div className="lg:col-span-7"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease }}>
          <span className="eyebrow" style={{ color: '#E0B562', background: 'rgba(224,181,98,0.10)', borderColor: 'rgba(224,181,98,0.32)' }}>لماذا بنينا إحكام</span>

          <h2 className="mt-7 mb-7 font-bold" style={{ color: '#F8F5EC', fontSize: 'clamp(1.9rem, 3.8vw, 3.1rem)', lineHeight: 1.4 }}>
            في كل معهدٍ شيخٌ يحفظ تاريخ طلابه في رأسه.
            <br /><span className="title-mark">فماذا لو غاب؟</span>
          </h2>

          <p className="text-lg mb-5" style={{ color: 'rgba(248,245,236,0.85)', lineHeight: 2, maxWidth: 580 }}>
            أين وصل كل طالب، ومتى غاب، وما الذي يراجعه هذا الأسبوع: هذا كله في دفتر الشيخ وذاكرته.
            وهكذا تعمل أغلب الحلقات منذ سنين، وتعمل جيداً، إلى أن يمرض الشيخ أو يسافر أو يضيع الدفتر.
            عندها يبدأ الطالب من جديد، ولا أحد يعرف أين كان.
          </p>
          <p className="text-lg font-bold mb-10" style={{ color: '#E0B562', lineHeight: 1.9, maxWidth: 580 }}>
            بنينا إحكام ليبقى هذا التاريخ عند المعهد، لا عند شخصٍ واحد فيه.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FACTS.map((f, i) => (
              <motion.div key={f.k} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,0.25)' }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease }}>
                <div className="text-sm font-bold mb-2" style={{ color: 'rgba(248,245,236,0.62)', lineHeight: 1.7 }}>{f.k}</div>
                <div className="text-base font-bold" style={{ color: '#F8F5EC', lineHeight: 1.75 }}>{f.v}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* الصورتان */}
        <div className="lg:col-span-5 relative h-[400px] sm:h-[500px]">
          <Framed src="/photos/kuttab-halaqa.webp" alt="أطفالٌ في كُتّاب يحفظون القرآن من الألواح" w={900} h={729} className="w-[84%] aspect-[900/729] top-0 right-0" delay={0.1} rotate={2.5} />
          <Framed src="/photos/umayyad-readers.webp" alt="رجالٌ يقرؤون القرآن في الجامع الأموي بدمشق" w={1000} h={534} className="w-[80%] aspect-[1000/534] bottom-0 left-0" delay={0.3} rotate={-3} />
        </div>
      </div>

      <p className="relative text-center text-xs pb-5 px-6" style={{ color: 'rgba(248,245,236,0.45)' }}>
        صور: الجامع الأموي — seier+seier (CC BY 2.0) · قرّاءٌ في الجامع الأموي — Erik Albers (CC0) · كُتّابٌ في شمال المغرب — Dahbi Fatima Zahrae (CC BY-SA 4.0)، عبر Flickr وويكيميديا
      </p>
    </section>
  )
}
