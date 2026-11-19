import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useReducedMotion, useInView, animate } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCheck, Check, Star, CalendarCheck, BookOpen, Eye, X, ChevronsLeftRight } from 'lucide-react'

/* ══════════════════════════════════════════════════════════════════
   «من دفتر الشيخ إلى سجلٍّ لا يضيع» (2026-11-19)

   كان قسمان متتاليان: ثلاث بطاقات مشاكل ثم ثلاث بطاقات حلول، بالشكل
   نفسه، فيُقرآن قائمتين. صارا مشهداً واحداً يتبدّل: مكتبٌ مبعثر —
   كشف حضور ورقي، رسالة ولي أمر بلا ردّ، ورقة لاصقة، دفتر الشيخ —
   ينطوي فيصير سجلّ طالبٍ واحداً في إحكام. المشهد يتبدّل وحده كل
   ست ثوانٍ حتى يضغط الزائر أحد الزرّين.

   المقاسات بوحدة cqw (نسبةً لعرض المشهد)، فيصغر المشهد كلّه معاً
   على الجوال بدل أن تتكدّس عناصره.
   ══════════════════════════════════════════════════════════════════ */

const PAIRS = [
  { pain: 'الكشف الورقي يأكل وقتك، ثم يضيع', fix: 'حضور الحلقة كاملة بلمسة واحدة' },
  { pain: 'ولي الأمر يسأل ولا يجد جواباً', fix: 'يرى الحضور والتسميع فور تسجيله' },
  { pain: 'مستوى الطالب في ذاكرة الشيخ وحده', fix: 'سجلٌّ يبقى ولو تغيّر الشيخ' },
]

const ease = [0.22, 1, 0.36, 1]

/* ── قطع المكتب المبعثر ── */
function Piece({ children, className = '', rotate, i, reduce }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={reduce ? false : { opacity: 0, y: 30, rotate: rotate - 8 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 0.6, delay: i * 0.08, ease }}
    >
      {children}
    </motion.div>
  )
}

function PaperSheet() {
  const rows = [
    ['أحمد', '✓', '✓', '✗', '✓', '✓'],
    ['عمر', '✓', '✗', '✗', '؟', ''],
    ['يوسف', '✓', '✓', '✓', '✓', ''],
    ['خالد', '✗', '✓', '', '', ''],
    ['زيد', '✓', '', '', '', ''],
  ]
  return (
    <div className="ba-paper" style={{ width: 'calc(var(--u) * 27)', padding: 'calc(var(--u) * 1.6) calc(var(--u) * 1.8) calc(var(--u) * 2.2)' }}>
      <div className="font-bold" style={{ fontSize: 'calc(var(--u) * 1.45)', color: '#1E3A8A', marginBottom: 'calc(var(--u) * 0.8)' }}>كشف حضور — حلقة الفجر</div>
      <table className="w-full" style={{ fontSize: 'calc(var(--u) * 1.2)', color: '#1E3A8A', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid rgba(30,58,138,0.25)' }}>
              {r.map((c, ci) => (
                <td key={ci} style={{ padding: 'calc(var(--u) * 0.45) calc(var(--u) * 0.3)', textAlign: ci ? 'center' : 'start', color: c === '✗' ? '#B91C1C' : undefined, fontFamily: ci ? 'inherit' : undefined, textDecoration: ri === 3 && ci === 0 ? 'line-through' : undefined }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* أثر كوب الشاي */}
      <span aria-hidden className="absolute rounded-full" style={{ width: 'calc(var(--u) * 9)', height: 'calc(var(--u) * 9)', left: '-calc(var(--u) * 2)', bottom: '-calc(var(--u) * 2.5)', border: 'calc(var(--u) * 0.5) solid rgba(146, 92, 32, 0.18)' }} />
    </div>
  )
}

function ChatBubble() {
  return (
    <div className="ba-chat" style={{ width: 'calc(var(--u) * 25)' }}>
      <div className="flex items-center gap-[calc(var(--u)*0.8)]" style={{ background: '#075E54', color: '#fff', padding: 'calc(var(--u) * 0.9) calc(var(--u) * 1.2)', fontSize: 'calc(var(--u) * 1.25)' }}>
        <span className="rounded-full bg-white/25 flex items-center justify-center font-bold" style={{ width: 'calc(var(--u) * 2.6)', height: 'calc(var(--u) * 2.6)', fontSize: 'calc(var(--u) * 1.1)' }}>أ</span>
        <span className="font-bold">أبو أحمد — ولي أمر</span>
      </div>
      <div className="flex flex-col gap-[calc(var(--u)*0.7)]" style={{ background: '#ECE5DD', padding: 'calc(var(--u) * 1.2)' }}>
        {['السلام عليكم شيخنا، وين وصل أحمد بالحفظ؟', 'غاب أمس ولا ما وصلني شي؟', 'شيخنا؟ 🙏'].map((m, i) => (
          <div key={i} className="self-start bg-white rounded-lg" style={{ padding: 'calc(var(--u) * 0.7) calc(var(--u) * 1)', fontSize: 'calc(var(--u) * 1.2)', color: '#111', maxWidth: '92%', boxShadow: '0 1px 0 rgba(0,0,0,0.08)' }}>
            {m}
            <span className="flex items-center gap-[calc(var(--u)*0.3)] justify-end" style={{ fontSize: 'calc(var(--u) * 0.9)', color: '#8A8A8A', marginTop: 'calc(var(--u) * 0.2)' }}>
              {['9:41 م', '10:15 م', '11:02 م'][i]} <CheckCheck style={{ width: 'calc(var(--u) * 1.2)', height: 'calc(var(--u) * 1.2)' }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StickyNote() {
  return (
    <div className="ba-sticky" style={{ width: 'calc(var(--u) * 15)', padding: 'calc(var(--u) * 1.4)' }}>
      <div className="font-bold" style={{ fontSize: 'calc(var(--u) * 1.35)', color: '#3F2F0A', lineHeight: 1.6 }}>
        عمر: وقفنا عند…<br />الملك؟ <span style={{ textDecoration: 'line-through' }}>تبارك</span>؟<br />
        <span style={{ color: '#B91C1C' }}>اسأل الشيخ القديم!</span>
      </div>
    </div>
  )
}

function Notebook() {
  return (
    <div className="ba-notebook" style={{ width: 'calc(var(--u) * 20)', height: 'calc(var(--u) * 24)' }}>
      <div className="font-bold" style={{ fontSize: 'calc(var(--u) * 1.4)', color: '#F8F5EC', padding: 'calc(var(--u) * 1.4) calc(var(--u) * 1.6)' }}>دفتر الشيخ</div>
      <div className="mx-[calc(var(--u)*1.6)] bg-[#FBF6E9] rounded" style={{ height: 'calc(var(--u) * 17)', padding: 'calc(var(--u) * 1)', backgroundImage: 'repeating-linear-gradient(transparent 0 calc(var(--u) * 1.9), rgba(30,58,138,0.18) calc(var(--u) * 1.9) calc(var(--u) * 2))' }}>
        <div style={{ fontSize: 'calc(var(--u) * 1.15)', color: '#1E3A8A', lineHeight: 'calc(var(--u) * 2)' }}>
          يوسف: البقرة ٢٠٠ <br />
          <span style={{ textDecoration: 'line-through' }}>زيد: آل عمران</span><br />
          خالد: ؟؟ <br />
          تسميع الخميس…
        </div>
      </div>
    </div>
  )
}

function PainTag({ children, className = '', i, reduce }) {
  return (
    <motion.span
      className={`absolute flex items-center gap-[calc(var(--u)*0.6)] font-bold rounded-full ${className}`}
      style={{ background: '#FFF1F0', color: '#9F1D1D', boxShadow: '0 0 0 1px rgba(185,28,28,0.25), 0 8px 18px -8px rgba(185,28,28,0.35)', padding: 'max(4px,calc(var(--u) * 0.6)) max(9px,calc(var(--u) * 1.3))', fontSize: 'max(11px,calc(var(--u) * 1.25))' }}
      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.45, delay: 0.5 + i * 0.15, ease }}
    >
      <X style={{ width: 'calc(var(--u) * 1.4)', height: 'calc(var(--u) * 1.4)' }} strokeWidth={3} /> {children}
    </motion.span>
  )
}

function BeforeScene({ reduce }) {
  return (
    <div className="absolute inset-0 ba-wood">
      <Piece i={0} rotate={-6} reduce={reduce} className="right-[3%] top-[5%] sm:right-[8%] sm:top-[12%]"><PaperSheet /></Piece>
      <Piece i={1} rotate={4}  reduce={reduce} className="left-[3%] top-[38%] sm:left-[8%] sm:top-[8%]"><ChatBubble /></Piece>
      <Piece i={2} rotate={8}  reduce={reduce} className="z-10 right-[6%] top-[70%] sm:right-[24%] sm:top-[58%]"><StickyNote /></Piece>
      <Piece i={3} rotate={-9} reduce={reduce} className="left-[8%] top-[4%] sm:left-[36%] sm:top-[16%]"><Notebook /></Piece>
      <PainTag i={0} reduce={reduce} className="right-[4%] top-[31%] sm:right-[12%] sm:top-[72%]">ضاع الكشف مرة أخرى</PainTag>
      <PainTag i={1} reduce={reduce} className="left-[4%] top-[88%] sm:left-[10%] sm:top-[70%]">3 رسائل بلا ردّ</PainTag>
      <PainTag i={2} reduce={reduce} className="right-[40%] top-[60%] sm:right-auto sm:left-[38%] sm:top-[6%]">المستوى في ذاكرة الشيخ</PainTag>
    </div>
  )
}

/* ── سجلّ الطالب في إحكام ── */
function AfterScene({ reduce }) {
  const days = [1, 1, 1, 0, 1, 1, 1]
  const log = [
    { t: 'تسميع · سورة الملك 1–15', s: 'ممتاز', c: '#1F6F52' },
    { t: 'مراجعة · جزء عمّ', s: 'جيد جداً', c: '#2E7A5A' },
    { t: 'غياب بعذر · أُبلغ ولي الأمر', s: 'تم', c: '#8A6425' },
  ]
  const item = (d) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.25 + d * 0.1, ease },
  })
  return (
    <div className="section-dark flex items-center justify-center" style={{ position: 'absolute', inset: 0 }}>
      <div className="pattern-layer pattern-khatam" aria-hidden />
      <motion.div
        className="relative bg-white rounded-[calc(var(--u)*2)] overflow-hidden"
        style={{ width: 'min(92%, calc(var(--u) * 52))', boxShadow: '0 calc(var(--u) * 4) calc(var(--u) * 7) -calc(var(--u) * 3) rgba(8,44,38,0.45), 0 0 0 1px rgba(184,134,58,0.30)' }}
        initial={reduce ? false : { scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.6, ease }}
      >
        <div className="flex items-center gap-[calc(var(--u)*1.4)]" style={{ background: 'linear-gradient(135deg,#2E7A5A,#155E43)', padding: 'calc(var(--u) * 2) calc(var(--u) * 2.4)' }}>
          <span className="rounded-full flex items-center justify-center font-bold" style={{ width: 'calc(var(--u) * 5)', height: 'calc(var(--u) * 5)', fontSize: 'calc(var(--u) * 2)', background: 'linear-gradient(145deg,#ECC77D,#B8863A)', color: '#0B3B33' }}>أ</span>
          <span className="flex flex-col">
            <span className="font-bold" style={{ color: '#F8F5EC', fontSize: 'calc(var(--u) * 2)' }}>أحمد محمد</span>
            <span style={{ color: 'rgba(248,245,236,0.7)', fontSize: 'calc(var(--u) * 1.3)' }}>حلقة الفجر · الشيخ عبد الله</span>
          </span>
          <span className="ms-auto flex items-center gap-[calc(var(--u)*0.5)] rounded-full font-bold" style={{ background: 'rgba(224,181,98,0.16)', color: '#E0B562', padding: 'calc(var(--u) * 0.6) calc(var(--u) * 1.2)', fontSize: 'calc(var(--u) * 1.2)' }}>
            <Eye style={{ width: 'calc(var(--u) * 1.4)', height: 'calc(var(--u) * 1.4)' }} /> ولي الأمر اطّلع
          </span>
        </div>

        <div style={{ padding: 'calc(var(--u) * 2) calc(var(--u) * 2.4)' }}>
          <motion.div {...item(0)} className="grid grid-cols-3 gap-[calc(var(--u)*1.2)]">
            {[
              { I: CalendarCheck, k: 'الحضور', v: '96%' },
              { I: BookOpen, k: 'المحفوظ', v: '4 أجزاء' },
              { I: Star, k: 'آخر تقدير', v: 'ممتاز' },
            ].map(({ I, k, v }) => (
              <div key={k} className="rounded-[calc(var(--u)*1.2)]" style={{ background: '#F6F1E4', padding: 'calc(var(--u) * 1.2)' }}>
                <span className="flex items-center gap-[calc(var(--u)*0.5)] font-bold" style={{ color: '#5E6E67', fontSize: 'calc(var(--u) * 1.15)' }}><I style={{ width: 'calc(var(--u) * 1.3)', height: 'calc(var(--u) * 1.3)' }} /> {k}</span>
                <span className="block font-bold" style={{ color: '#0B3B33', fontSize: 'calc(var(--u) * 2.1)', marginTop: 'calc(var(--u) * 0.3)' }}>{v}</span>
              </div>
            ))}
          </motion.div>

          <motion.div {...item(1)} className="flex items-center justify-between" style={{ marginTop: 'calc(var(--u) * 1.8)' }}>
            <span className="font-bold" style={{ color: '#5E6E67', fontSize: 'calc(var(--u) * 1.2)' }}>آخر 7 أيام</span>
            <span className="flex gap-[calc(var(--u)*0.6)]">
              {days.map((d, i) => (
                <span key={i} className="rounded-full flex items-center justify-center" style={{ width: 'calc(var(--u) * 2.4)', height: 'calc(var(--u) * 2.4)', background: d ? '#1F6F52' : '#F1E3C8', color: d ? '#fff' : '#8A6425' }}>
                  {d ? <Check style={{ width: 'calc(var(--u) * 1.3)', height: 'calc(var(--u) * 1.3)' }} strokeWidth={3} /> : <span style={{ fontSize: 'calc(var(--u) * 1.1)', fontWeight: 700 }}>ع</span>}
                </span>
              ))}
            </span>
          </motion.div>

          <div style={{ marginTop: 'calc(var(--u) * 1.6)' }} className="flex flex-col gap-[calc(var(--u)*0.9)]">
            {log.map((l, i) => (
              <motion.div key={l.t} {...item(2 + i)} className="flex items-center gap-[calc(var(--u)*1)] rounded-[calc(var(--u)*1)]" style={{ boxShadow: 'inset 0 0 0 1px #EDE6D6', padding: 'calc(var(--u) * 1) calc(var(--u) * 1.2)' }}>
                <span className="rounded-full" style={{ width: 'calc(var(--u) * 0.9)', height: 'calc(var(--u) * 0.9)', background: l.c }} />
                <span className="font-bold" style={{ color: '#1A2E28', fontSize: 'calc(var(--u) * 1.35)' }}>{l.t}</span>
                <span className="ms-auto font-bold rounded-full" style={{ color: l.c, background: `${l.c}14`, padding: 'calc(var(--u) * 0.3) calc(var(--u) * 1)', fontSize: 'calc(var(--u) * 1.15)' }}>{l.s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* شارات خضراء حول السجلّ */}
      {[
        { t: 'كل جلسة محفوظة', c: 'right-[4%] top-[14%] sm:right-[6%] sm:top-[20%]' },
        { t: 'ولي الأمر يرى فوراً', c: 'left-[4%] top-[82%] sm:left-[5%] sm:top-[34%]' },
        { t: 'التاريخ لا يغادر مع المعلّم', c: 'right-[8%] top-[91%] sm:right-[4%] sm:top-[72%]' },
      ].map((b, i) => (
        <motion.span key={b.t} className={`absolute flex items-center gap-[calc(var(--u)*0.6)] font-bold rounded-full ${b.c}`}
          style={{ background: '#EAF4EE', color: '#155E43', boxShadow: '0 0 0 1px rgba(31,111,82,0.25), 0 8px 18px -8px rgba(31,111,82,0.4)', padding: 'max(4px,calc(var(--u) * 0.7)) max(9px,calc(var(--u) * 1.4))', fontSize: 'max(11px,calc(var(--u) * 1.3))' }}
          initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.7 + i * 0.15, ease }}>
          <Check style={{ width: 'calc(var(--u) * 1.4)', height: 'calc(var(--u) * 1.4)' }} strokeWidth={3} /> {b.t}
        </motion.span>
      ))}
    </div>
  )
}

/* ── مقارنة بالسحب: الزائر يسحب المقبض الذهبي بين «اليوم» و«مع إحكام» ──
   عند ظهور المشهد يتحرّك المقبض وحده مرّةً من أقصى «اليوم» إلى المنتصف
   ليدلّ على أنه يُسحب. ومعه حقل range خفيّ للوحة المفاتيح وقارئ الشاشة. */
export default function BeforeAfterSection() {
  const reduce = useReducedMotion()
  const stageRef = useRef(null)
  const inView = useInView(stageRef, { once: true, margin: '-120px' })
  const [pos, setPos] = useState(88)          // موضع المقبض من اليسار (%)
  const [dragging, setDragging] = useState(false)
  const touched = useRef(false)

  useEffect(() => {
    if (!inView || touched.current) return
    const c = animate(88, 50, { duration: reduce ? 0 : 1.8, delay: 0.4, ease: [0.65, 0, 0.35, 1], onUpdate: setPos })
    return () => c.stop()
  }, [inView, reduce])

  const fromEvent = useCallback((e) => {
    const r = stageRef.current.getBoundingClientRect()
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - r.left
    setPos(Math.max(3, Math.min(97, (x / r.width) * 100)))
  }, [])

  const onDown = (e) => { touched.current = true; setDragging(true); fromEvent(e); e.currentTarget.setPointerCapture?.(e.pointerId) }
  const onMove = (e) => { if (dragging) fromEvent(e) }
  const onUp   = () => setDragging(false)

  return (
    <section className="relative z-10 px-6 pt-20 pb-24" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="eyebrow">هل هذا يصفك؟</span>
          <h2 className="font-bold mt-5 mb-4" style={{ color: 'var(--text-1)', fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            من <span className="title-mark">دفتر الشيخ</span> إلى سجلٍّ لا يضيع
          </h2>
          <p className="text-lg mx-auto" style={{ color: 'var(--text-2)', maxWidth: 640, lineHeight: 1.9 }}>
            اسحب المقبض: على اليمين يوم المعهد اليوم، وعلى اليسار اليوم نفسه في إحكام.
          </p>
        </div>

        <div
          ref={stageRef}
          className="ba-stage relative rounded-[32px] overflow-hidden aspect-[3/4] sm:aspect-[16/9] select-none touch-pan-y"
          style={{ containerType: 'inline-size', boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(184,134,58,0.35)', cursor: dragging ? 'grabbing' : 'ew-resize' }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        >
          {/* مع إحكام — الطبقة السفلى كاملة */}
          <AfterScene reduce={reduce} />

          {/* اليوم — يُقصّ من اليسار حتى المقبض */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            <BeforeScene reduce={reduce} />
          </div>

          {/* الوسمان */}
          <span className="absolute top-4 right-4 z-30 rounded-full px-4 py-1.5 text-sm font-bold"
                style={{ background: 'rgba(255,241,240,0.95)', color: '#9F1D1D', boxShadow: '0 6px 16px -8px rgba(0,0,0,0.4)', opacity: pos < 18 ? 0 : 1, transition: 'opacity 200ms' }}>
            اليوم: ورقٌ وواتساب
          </span>
          <span className="absolute top-4 left-4 z-30 rounded-full px-4 py-1.5 text-sm font-bold"
                style={{ background: '#E0B562', color: '#0B3B33', boxShadow: '0 6px 16px -8px rgba(0,0,0,0.5)', opacity: pos > 82 ? 0 : 1, transition: 'opacity 200ms' }}>
            مع إحكام
          </span>

          {/* المقبض */}
          <div className="absolute inset-y-0 z-20 pointer-events-none" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
            <div className="h-full w-[3px] mx-auto" style={{ background: 'linear-gradient(to bottom, transparent, #E0B562 12%, #E0B562 88%, transparent)', boxShadow: '0 0 18px rgba(224,181,98,0.6)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(145deg,#F0D08A,#B8863A)', color: '#0B3B33', boxShadow: '0 0 0 6px rgba(224,181,98,0.25), 0 14px 30px -8px rgba(0,0,0,0.55)' }}>
              <ChevronsLeftRight size={24} strokeWidth={2.4} />
            </div>
          </div>

          <input
            type="range" min={3} max={97} value={Math.round(pos)} aria-label="قارن بين يوم المعهد اليوم ومع إحكام"
            onChange={(e) => { touched.current = true; setPos(Number(e.target.value)) }}
            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none focus-visible:pointer-events-auto"
          />
        </div>

        {/* الأزواج: المشكلة ← الجواب */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {PAIRS.map((p, i) => (
            <div key={p.pain} className="rounded-2xl bg-white p-6 flex gap-4" style={{ boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
              <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold" style={{ background: 'linear-gradient(145deg,#ECC77D,#B8863A)', color: '#0B3B33' }}>{i + 1}</span>
              <span className="flex flex-col gap-2">
                <span className="text-base" style={{ color: '#9F1D1D', textDecoration: 'line-through', textDecorationColor: 'rgba(159,29,29,0.5)' }}>{p.pain}</span>
                <span className="text-base font-bold" style={{ color: '#155E43' }}>{p.fix}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Link to="/ihkaam#features" className="btn-outline inline-flex items-center gap-2.5 rounded-full px-8 py-4" style={{ fontSize: '1rem' }}>
            شاهد كيف يعمل إحكام <ArrowLeft size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}
