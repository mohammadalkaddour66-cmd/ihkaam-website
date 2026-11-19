/* ══════════════════════════════════════════════════════
   الخلفية الثابتة — طبقتا وهجٍ وحبيباتُ فيلم.

   كانت ثلاثة أوهاجٍ وثمانيَ نقاطٍ طافية: أي **إحدى عشرة حلقة
   حركةٍ لا نهائية** تعمل ما دام الزائر في الصفحة، فوق ما في
   الهيرو من خمس. والنقاط الملوّنة المتناثرة هي أكثر ما يقول
   «قالب» في التصميم الداكن، وكانت تحمل ألواناً (الورديّ والطينيّ)
   خرجت من الرئيسية أصلاً.

   وحلّ محلّها ما يعطي العمقَ بلا حركة: حبيباتُ فيلم ساكنة.
   الأسود الرقميّ المسطّح هو ما يجعل السطحَ الداكن يبدو رخيصاً،
   والحبيباتُ تكسره فيُقرأ «مادّةً» — بلا إطارِ رسمٍ واحد.
   ══════════════════════════════════════════════════════ */

/* ضجيجٌ رماديّ مولَّد في SVG — لا ملفَّ صورةٍ يُحمَّل، ولا طلبَ شبكة.
   feTurbulence بترددٍ عالٍ (0.85) يعطي حبيبةً ناعمة لا نقشاً ظاهراً،
   وfeColorMatrix يجرّده من اللون فلا يزاحم اللوحة. */
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E" +
  "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' " +
  "stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E" +
  "%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E"

export default function FloatingBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* وهجٌ ذهبيّ — أعلى اليمين.
          كان ورديّاً (D9ACA3): لونٌ موروثٌ خرج من الرئيسية، فبقي
          يصبغ خلفيتها وحده. الذهب هو ثانويّ اللوحة المعتمد. */}
      <div
        className="orb-a absolute -top-1/3 -right-1/4 w-[900px] h-[900px] rounded-full"
        style={{ background: 'radial-gradient(circle at center, rgba(227,169,63,0.07) 0%, transparent 65%)' }}
      />

      {/* وهجٌ تركوازيّ — أسفل اليسار */}
      <div
        className="orb-b absolute -bottom-1/3 -left-1/4 w-[750px] h-[750px] rounded-full"
        style={{ background: 'radial-gradient(circle at center, rgba(26,148,155,0.12) 0%, transparent 65%)' }}
      />

      {/* الحبيبات — ساكنة تماماً. 3% هو الحدّ الذي يُحَسّ ولا يُرى:
          فوقه يصير «تشويشاً»، وتحته لا يفعل شيئاً. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${GRAIN}")`,
          backgroundSize : '160px 160px',
          opacity        : 0.03,
        }}
      />
    </div>
  )
}
