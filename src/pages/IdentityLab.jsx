import { useState } from 'react'
import {
  ClipboardList, BellOff, Brain, ArrowLeft, Check,
  Users, Clock, TrendingUp, ShieldCheck,
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════════════
   IDENTITY LAB — صفحة معاينة معزولة. لا تُلمس :root ولا أيّ مكوّن
   حيّ. كل التوكِنات مُنطاقة تحت .ilab، فإن رُفض النظام حُذف الملف
   وسطرُ المسار ولا أثر يبقى.

   الأرقام المكتوبة هنا مقيسة لا مقدَّرة (WCAG contrast ratio).

   الكشف الذي بنى النظام: في هذه اللوحة #24735C تباينه 3.5:1 على
   #000D0C — لا يصلح نصّاً على الداكن. وتباينه 5.7:1 على الأبيض —
   يصلح نصّاً هناك. و#D9B29C معكوسه تماماً: 10.2:1 على الداكن،
   1.9:1 على الأبيض. فاللوحة ليست لوحةً واحدة، بل لوحةٌ تتبادل
   فيها الأدوار حسب الوسط:
     على الأبيض  → الأخضر لكنةٌ ونصّ،   والطينيّ سطحٌ وحشو
     على الداكن  → الطينيّ لكنةٌ ونصّ،  والأخضر سطحٌ وحشو فقط
   وبهذا لا يحمل الأخضر نصّاً على الداكن أبداً، فلا يقع في «الحشيش»:
   هو مساحةٌ عميقة يعلوها كريم — أي اللوغو نفسه.
   ══════════════════════════════════════════════════════════════════ */

const CSS = `
.ilab {
  --ease: cubic-bezier(0.22,1,0.36,1);

  /* ── العائلتان: قيمٌ ثابتة لا تتغيّر بالوضع، لأنها حشوٌ لا نصّ.
       المتغيّر بالوضع هو --accent وحده (أي: مَن يحمل النصّ). ── */
  --warm-lit : #EBD3C2;
  --warm     : #D9B29C;
  --warm-deep: #B98A63;
  --pine-lit : #41AA8C;
  --pine     : #24735C;
  --pine-deep: #0D4F41;
}

/* الهيكسات وأسماء التوكِنات لاتينيّة: تُعزَل عن سياق RTL وإلّا
   انقلبت الشرطة والمربّاع إلى آخر السلسلة (D9B29C# بدل #D9B29C). */
.ilab code, .ilab .ltr { direction: ltr; unicode-bidi: isolate; display: inline-block; }

/* ── داكن: الأسطح كما وردت في اللوحة (hue 168-175، تشبّع 94-100%) ── */
.ilab[data-mode="dark"][data-surf="asis"] {
  --c0: #000D0C; --c1: #012623; --c2: #024034; --c3: #0D4F41;
}
/* ── داكن: A مضبوطة. الدرجة تبقى في مدى اللوحة (168-176) فتبقى
     «الروح»، والتشبّع ينزل كلما كبرت المساحة — لأن الطغيان يجيء
     من التشبّع لا من الدرجة. الأخضرية المدرَكة على السطحين
     اللذين يغطّيان المساحة الفعلية نزلت 59% و44%. ── */
.ilab[data-mode="dark"][data-surf="tuned"] {
  --c0: #020F0E; --c1: #09201E; --c2: #11312C; --c3: #1C423A;
}
/* ── داكن: الأسطح مصحّحة إلى hue 196 وتشبّع ≤58% بنفس الإضاءة ── */
.ilab[data-mode="dark"][data-surf="fixed"] {
  --c0: #03080A; --c1: #08191F; --c2: #0E2A34; --c3: #143948;
}
.ilab[data-mode="dark"] {
  --accent     : #D9B29C;  /* 10.2:1 — اللكنة والنصّ المميّز */
  --accent-deep: #B98A63;  /*  6.5:1 — حدود، تمرير، تشديد ثانٍ */
  --accent-lit : #EBD3C2;  /* 13.8:1 — وهج وتدرّجات */
  --t1: #EAE4DF;  /* 15.7:1 */
  --t2: #C9BDB4;  /* 10.7:1 */
  --t3: #A89A90;  /*  7.2:1 */
  --bd     : rgba(36,115,92,0.30);
  --bd-warm: rgba(217,178,156,0.20);
  --glow   : rgba(217,178,156,0.10);
}

/* ── فاتح: وسط النظام من الداخل. اللوحة كما هي بلا تعديل ── */
.ilab[data-mode="light"] {
  --c0: #F4F7F6; --c1: #FFFFFF; --c2: #FFFFFF; --c3: #EDF2F0;
  --accent     : #24735C;  /*  5.7:1 على الأبيض — لكنةٌ ونصّ */
  --accent-deep: #024034;  /* 11.8:1 — العناوين والشريط الجانبيّ */
  --accent-lit : #41AA8C;
  --t1: #0D1F1B;  /* 17.1:1 */
  --t2: #3D524D;  /*  8.4:1 */
  --t3: #5C6B67;  /*  5.6:1 */
  --bd     : rgba(2,64,52,0.14);
  --bd-warm: rgba(185,138,99,0.30);
  --glow   : rgba(217,178,156,0.22);
}

.ilab { background: var(--c0); color: var(--t1); min-height: 100vh; }
.ilab .card {
  background: var(--c1);
  border    : 1px solid var(--bd);
  border-radius: 18px;
  transition: transform 400ms var(--ease), border-color 400ms var(--ease);
}
.ilab .card:hover { transform: translateY(-4px); border-color: var(--bd-warm); }
.ilab .chip {
  background: color-mix(in srgb, var(--pine) 18%, transparent);
  border    : 1px solid var(--bd);
  color     : var(--accent);
}
.ilab[data-mode="light"] .chip { color: var(--accent-deep); }

/* البطاقة الفاخرة: ثلاث طبقات لا لونٌ مصمت — نفس منطق .crystal-card */
.ilab .crystal { position: relative; isolation: isolate; border-radius: 22px;
  background: linear-gradient(158deg,
    rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.028) 38%,
    rgba(36,115,92,0.10) 72%, rgba(217,178,156,0.09) 100%), var(--c2);
  box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.10), 0 18px 48px rgba(0,0,0,0.34); }
.ilab[data-mode="light"] .crystal { box-shadow: 0 12px 32px rgba(2,64,52,0.10); }
.ilab .crystal::before { content:''; position:absolute; inset:0; border-radius:inherit;
  padding:1px; background: linear-gradient(150deg,
    rgba(255,255,255,0.30) 0%, rgba(36,115,92,0.30) 34%,
    rgba(255,255,255,0.05) 62%, rgba(217,178,156,0.34) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events:none; }

.ilab .tgl {
  display:flex; gap:4px; padding:4px; border-radius:999px;
  background: var(--c2); border: 1px solid var(--bd);
}
.ilab .tgl button {
  padding:6px 14px; border-radius:999px; font-size:12px; font-weight:800;
  border:none; cursor:pointer; background:none; color: var(--t3);
  transition: all 240ms var(--ease); white-space: nowrap;
}
.ilab .tgl button[data-on="true"] { background: var(--accent); color: var(--c0); }
`

/* المقياس التصنيفيّ: ستّ درجات من عائلتين — دفءٌ وصنوبر — تتمايز
   بالإضاءة لا بدرجةٍ جديدة. هذا ما كان ناقصاً فوُلد البنفسجيّ.
   والقاعدة معه: اللونُ في النقطة والحشو، والعنوانُ كريمٌ دائماً. */
const SCALE = [
  { v: 'var(--warm-lit)',  n: 'warm-lit',  hex: '#EBD3C2' },
  { v: 'var(--warm)',      n: 'warm',      hex: '#D9B29C' },
  { v: 'var(--warm-deep)', n: 'warm-deep', hex: '#B98A63' },
  { v: 'var(--pine-lit)',  n: 'pine-lit',  hex: '#41AA8C' },
  { v: 'var(--pine)',      n: 'pine',      hex: '#24735C' },
  { v: 'var(--pine-deep)', n: 'pine-deep', hex: '#0D4F41' },
]

const PAINS = [
  { Icon: ClipboardList, title: 'الكشف الورقي يأكل وقتك كل يوم',
    body: 'ثلاث ساعات أسبوعياً في تسجيل حضور يدوي — ثم الورقة تضيع وتبدأ من جديد.' },
  { Icon: BellOff, title: 'ولي الأمر لا يعلم — وسيُحاسبك',
    body: 'غاب الطالب ثلاثة أيام وأنت لا تعلم. حين يعلم سيسألك: لماذا لم تخبرني؟' },
  { Icon: Brain, title: 'مستوى كل طالب — في ذاكرة الشيخ فقط',
    body: 'لو سألك ولي أمر: وين وصل ابني؟ — كم ثانية تحتاج للإجابة؟' },
]

const STATS = [
  { Icon: Users,       v: '٤٨٠',  l: 'طالباً موثَّقاً'  },
  { Icon: Clock,       v: '٣ ساعات', l: 'تُوفَّر أسبوعياً' },
  { Icon: TrendingUp,  v: '٩٢٪',  l: 'معدّل التسميع'   },
  { Icon: ShieldCheck, v: '١٤',   l: 'حلقة تحت المتابعة' },
]

/* «الأخضرية» = فارق قناة G عن B مرجَّحاً بوزنها الإدراكي (0.7152).
   هي ما يجعل سطحاً بدرجة 175 يُقرأ أخضر رغم تقارب G وB عددياً،
   وهي المقياس الذي ضُبطت عليه اللوحة — لا الدرجة وحدها. */
const LADDERS = {
  tuned: [
    { hex: '#020F0E', role: 'أعتم سطح — خلفية الصفحة',  meta: 'hue 176° · تشبّع 72% · أخضرية 0.3' },
    { hex: '#09201E', role: 'سطح ثانٍ — واجهة البطاقة', meta: 'hue 174° · تشبّع 58% · أخضرية 0.6' },
    { hex: '#11312C', role: 'سطح مرتفع — لوحٌ داخليّ',   meta: 'hue 171° · تشبّع 48% · أخضرية 1.4' },
    { hex: '#1C423A', role: 'أعلى سطح — لوحٌ بارز',      meta: 'hue 168° · تشبّع 40% · أخضرية 2.2' },
  ],
  asis: [
    { hex: '#000D0C', role: 'أعتم سطح — خلفية الصفحة',  meta: 'hue 175° · تشبّع 100% · أخضرية 0.3' },
    { hex: '#012623', role: 'سطح ثانٍ — واجهة البطاقة', meta: 'hue 175° · تشبّع 95% · أخضرية 0.8' },
    { hex: '#024034', role: 'سطح مرتفع — لوحٌ داخليّ',   meta: 'hue 168° · تشبّع 94% · أخضرية 3.4' },
    { hex: '#0D4F41', role: 'أعلى سطح — لوحٌ بارز',      meta: 'hue 167° · تشبّع 72% · أخضرية 3.9' },
  ],
  fixed: [
    { hex: '#03080A', role: 'أعتم سطح — خلفية الصفحة',  meta: 'hue 196° · l 3%'  },
    { hex: '#08191F', role: 'سطح ثانٍ — واجهة البطاقة', meta: 'hue 196° · l 8%'  },
    { hex: '#0E2A34', role: 'سطح مرتفع — لوحٌ داخليّ',   meta: 'hue 196° · l 13%' },
    { hex: '#143948', role: 'أعلى سطح — لوحٌ بارز',      meta: 'hue 197° · l 18%' },
  ],
}

const CONSTANTS = [
  { hex: '#24735C', role: 'الصنوبر — حشوٌ وسطح، لا نصّ على الداكن', meta: '3.5:1 داكن · 5.7:1 أبيض' },
  { hex: '#D9B29C', role: 'الدفء — اللكنة والنصّ المميّز',          meta: '10.2:1 داكن · 1.9:1 أبيض' },
]

export default function IdentityLab() {
  const [mode, setMode] = useState('dark')
  const [surf, setSurf] = useState('tuned')
  const dark = mode === 'dark'

  return (
    <div className="ilab" data-mode={mode} data-surf={surf} dir="rtl">
      <style>{CSS}</style>

      {/* ── شريط التحكّم ── */}
      <div
        className="sticky top-0 z-30 px-5 py-3 flex flex-wrap items-center gap-4 justify-between backdrop-blur-xl"
        style={{ background: 'color-mix(in srgb, var(--c0) 82%, transparent)', borderBottom: '1px solid var(--bd)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-black text-sm" style={{ color: 'var(--t1)' }}>معمل الهوية</span>
          <span className="text-[11px]" style={{ color: 'var(--t3)' }}>معاينة معزولة — لا تمسّ الموقع</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="tgl">
            <button data-on={dark}  onClick={() => setMode('dark')}>داكن — الموقع</button>
            <button data-on={!dark} onClick={() => setMode('light')}>فاتح — النظام</button>
          </div>
          <div className="tgl" style={{ opacity: dark ? 1 : 0.35, pointerEvents: dark ? 'auto' : 'none' }}>
            <button data-on={surf === 'tuned'} onClick={() => setSurf('tuned')}>A مضبوطة</button>
            <button data-on={surf === 'asis'}  onClick={() => setSurf('asis')}>A كما هي</button>
            <button data-on={surf === 'fixed'} onClick={() => setSurf('fixed')}>ب — 196°</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-12 flex flex-col gap-16">

        {/* ── ١ · اللوحة والأدوار ── */}
        <section>
          <SecTitle n="١" t="اللوحة والأدوار"
                    s="الأربعة الأولى أسطحٌ تتبدّل بالمفتاح أعلاه. والأخيران ثابتان: هما اللوحة نفسها." />
          <div className="grid gap-2">
            {[...(dark ? LADDERS[surf] : LADDERS.tuned), ...CONSTANTS].map(({ hex, role, meta }) => (
              <div key={hex} className="card flex items-center gap-4 p-3">
                <div className="w-20 h-12 rounded-lg flex-shrink-0"
                     style={{ background: hex, border: '1px solid var(--bd)' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm" style={{ color: 'var(--t1)' }}>{role}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--t3)' }}>{meta}</p>
                </div>
                <code className="text-[11px] font-bold tracking-wider flex-shrink-0"
                      style={{ color: 'var(--accent)' }}>{hex}</code>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4 leading-loose" style={{ color: 'var(--t3)' }}>
            في الوضع الفاتح تنقلب الأدوار: <code style={{ color: 'var(--accent)', fontWeight: 800 }}>#24735C</code> يصير
            اللكنة والنصّ (5.7:1)، و<code style={{ color: 'var(--t2)', fontWeight: 800 }}>#D9B29C</code> يصير حشواً
            (1.9:1 لا يصلح نصّاً). بدّل الوضع من الأعلى لترى.
          </p>
        </section>

        {/* ── ٢ · قسم حقيقي ── */}
        <section>
          <SecTitle n="٢" t="قسم «هل هذا يصفك؟» بالهوية الجديدة" s="نفس نصّ القسم الحيّ ونفس تركيبه، بالتوكِنات أعلاه." />

          <div className="flex justify-center mb-8">
            <span className="chip inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold tracking-widest">
              هل هذا يصفك؟
            </span>
          </div>

          <h2 className="text-center font-black mb-3"
              style={{ color: 'var(--t1)', fontSize: 'clamp(1.5rem,3vw,2.1rem)', lineHeight: 1.35 }}>
            هذه مشاكل حقيقية — <span style={{ color: 'var(--accent)' }}>ولها حلول حقيقية</span>
          </h2>
          <p className="text-center text-sm mb-10 mx-auto"
             style={{ color: 'var(--t3)', maxWidth: 420, lineHeight: 1.85 }}>
            لا تحتاج أن تتأقلم مع الفوضى. كل واحدة من هذه المشاكل لها جواب واضح في إحكام.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PAINS.map(({ Icon, title, body }) => (
              <div key={title} className="card relative overflow-hidden p-6 flex flex-col gap-4">
                <div className="pointer-events-none absolute top-0 right-0 w-36 h-36"
                     style={{ background: 'radial-gradient(circle at top right, var(--glow), transparent 66%)' }}
                     aria-hidden />
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px]"
                     style={{ background: 'linear-gradient(to right, transparent, var(--bd-warm), transparent)' }}
                     aria-hidden />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'var(--pine)', color: dark ? '#EAE4DF' : '#FFFFFF' }}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="font-black text-base leading-snug" style={{ color: 'var(--t1)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--t3)' }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ٣ · العناصر ── */}
        <section>
          <SecTitle n="٣" t="الأزرار والأرقام والبطاقة الفاخرة" s="الأخضر يحمل الزرّ المصمت، والطينيّ يحمل الرقم والنصّ." />

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black"
                    style={{ background: 'var(--pine)', color: '#FFFFFF' }}>
              اطلب عرضاً <ArrowLeft size={16} aria-hidden />
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black"
                    style={{ background: 'var(--accent)', color: dark ? '#000D0C' : '#FFFFFF' }}>
              ابدأ الآن <Check size={16} aria-hidden />
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black"
                    style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--bd-warm)' }}>
              شاهد النظام
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {STATS.map(({ Icon, v, l }) => (
              <div key={l} className="card p-5 flex flex-col gap-2">
                <Icon size={18} strokeWidth={1.75} style={{ color: 'var(--pine-lit)' }} aria-hidden />
                <p className="font-black text-2xl leading-none" style={{ color: 'var(--accent)' }}>{v}</p>
                <p className="text-[11px]" style={{ color: 'var(--t3)' }}>{l}</p>
              </div>
            ))}
          </div>

          <div className="crystal p-7">
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--accent)' }}>الذاكرة المؤسّسية</p>
            <p className="font-black text-lg mb-2" style={{ color: 'var(--t1)' }}>
              الشيخ يمشي — والمعهد لا يفقد شيئاً
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--t2)' }}>
              كل ما في رأس المعلّم اليوم مكتوبٌ في مكانٍ لا يُنسى. البطاقة الفاخرة هنا ثلاثُ طبقات —
              شفافية وحافّة ولمعة — لا لونٌ مصمت.
            </p>
          </div>
        </section>

        {/* ── ٤ · المقياس التصنيفيّ ── */}
        <section>
          <SecTitle n="٤" t="المقياس التصنيفيّ — بديل البنفسجيّ"
                    s="ستّ درجات من عائلتين، تتمايز بالإضاءة. اللون في النقطة والحشو، والعنوان كريمٌ دائماً." />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-xs font-bold tracking-widest mb-4" style={{ color: 'var(--t3)' }}>مؤشّر الجودة</p>
              {[['استمرارية الحضور', 92], ['انتظام التسميع', 78], ['تواصل الأهالي', 64],
                ['استكمال الخطط', 55], ['دقّة التوثيق', 41], ['متابعة الضعف', 28]].map(([l, p], i) => (
                <div key={l} className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold" style={{ color: 'var(--t2)' }}>{l}</span>
                    <span className="text-xs font-black" style={{ color: 'var(--accent)' }}>{p}٪</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c3)' }}>
                    <div className="h-full rounded-full" style={{ width: `${p}%`, background: SCALE[i].v }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <p className="text-xs font-bold tracking-widest mb-4" style={{ color: 'var(--t3)' }}>الدرجات الستّ</p>
              <div className="flex flex-col gap-2">
                {SCALE.map(({ v, n, hex }) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg flex-shrink-0"
                          style={{ background: v, border: '1px solid var(--bd)' }} />
                    <code className="text-[11px] flex-1" style={{ color: 'var(--t2)' }}>--{n}</code>
                    <code className="text-[11px]" style={{ color: 'var(--t3)' }}>{hex}</code>
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-4 leading-relaxed" style={{ color: 'var(--t3)' }}>
                هذه تُغني عن <code style={{ color: '#B5A3D9' }}>#B5A3D9</code> و
                <code style={{ color: '#A3C4D9' }}>#A3C4D9</code> في المكوّنات الستّة التي وُلد فيها البنفسجيّ.
              </p>
            </div>
          </div>
        </section>

        <p className="text-center text-[11px] pb-8" style={{ color: 'var(--t3)' }}>
          للحذف: امسح هذا الملف وسطر <code>/identity</code> في App.jsx.
        </p>
      </div>
    </div>
  )
}

function SecTitle({ n, t, s }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: 'var(--pine)', color: '#FFFFFF' }}>{n}</span>
        <h2 className="font-black text-lg" style={{ color: 'var(--t1)' }}>{t}</h2>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--t3)', paddingInlineStart: 40 }}>{s}</p>
    </div>
  )
}
