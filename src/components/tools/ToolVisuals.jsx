import { CalendarDays, RefreshCcw, BookOpen, Award } from 'lucide-react'

/* رسوم الأدوات: كل أداة تُرى مخرَجاً قبل أن تُقرأ وصفاً (قاعدة «التصميم يشرح
   قبل النص»). الأمثلة فيها حسابٌ حقيقي من الأدوات نفسها على بيانات المصحف،
   لا أرقام مزخرفة:
   • خطة الحفظ: من الناس صعوداً، 5 أسطر، الأحد–الخميس والخميس تثبيت.
   • المراجعة: الأجزاء 28–30 بخمس صفحات يومياً على خمسة أيام = 13 يوم دراسة،
     أي تختم كل 17 يوماً.
   • الختم: رمضان 29 يوماً = 20 أو 21 صفحة يومياً. */

const INK = '#0B3B33'
const card = { background: '#FFFFFF', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }

const GLYPHS = {
  'hifz-plan': CalendarDays,
  'review-plan': RefreshCcw,
  'khatm-calculator': BookOpen,
  certificate: Award,
}

export function ToolGlyph({ slug, size = 'md' }) {
  const I = GLYPHS[slug] || BookOpen
  const box = size === 'lg' ? 'w-14 h-14 rounded-2xl' : 'w-11 h-11 rounded-xl'
  return (
    <span className={`${box} grid place-items-center`} style={{ background: INK, boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.35)' }} aria-hidden>
      <I size={size === 'lg' ? 26 : 20} color="#E0B562" />
    </span>
  )
}

/* ── خطة الأسبوع ── */
const WEEK = [
  ['الأحد', 'الناس (كاملة)', 'ص 604'],
  ['الاثنين', 'الفلق والإخلاص', 'ص 604'],
  ['الثلاثاء', 'المسد (كاملة)', 'ص 603'],
  ['الأربعاء', 'النصر (كاملة)', 'ص 603'],
]
export function HifzVisual({ compact = false }) {
  return (
    <div className={`rounded-[24px] overflow-hidden ${compact ? '' : 'rotate-[-1.5deg]'}`} style={card} aria-hidden>
      <div className="px-5 py-4 relative overflow-hidden" style={{ background: INK }}>
        <div className="absolute inset-0 pattern-khatam" style={{ opacity: 0.12 }} />
        <div className="relative text-[11.5px] font-bold" style={{ color: '#E0B562' }}>خطة الحفظ لهذا الأسبوع</div>
        <div className="relative font-black text-[17px] mt-0.5" style={{ color: '#F8F5EC' }}>5 أسطر يومياً، من الناس صعوداً</div>
      </div>
      <div className="p-3.5 space-y-2" style={{ background: '#F8F5EC' }}>
        {WEEK.map(([d, t, p]) => (
          <div key={d} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: '#FFFFFF', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
            <span className="w-[68px] shrink-0 rounded-lg py-1.5 text-center text-[12px] font-bold" style={{ background: INK, color: '#F8F5EC' }}>{d}</span>
            <span className="flex-1 font-bold text-[14px] text-[#1A2E28]">{t}</span>
            <span className="text-[12px] font-bold text-[#8A6425]">{p}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: '#FBF1DD', boxShadow: 'inset 0 0 0 1px rgba(184,134,58,.4)' }}>
          <span className="w-[68px] shrink-0 rounded-lg py-1.5 text-center text-[12px] font-bold" style={{ background: '#E0B562', color: INK }}>الخميس</span>
          <span className="flex-1 font-bold text-[14px] text-[#8A6425]">تثبيت: يعيد ما حفظه هذا الأسبوع</span>
        </div>
      </div>
    </div>
  )
}

/* ── دورة المراجعة ── */
export function ReviewVisual({ compact = false }) {
  const n = 13
  const R = 84
  return (
    <div className="rounded-[24px] p-6 flex items-center gap-6" style={card} aria-hidden>
      <svg viewBox="0 0 220 220" className={compact ? 'w-32 h-32 shrink-0' : 'w-44 h-44 shrink-0'}>
        {Array.from({ length: n }, (_, i) => {
          const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.04
          const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - 0.04
          const p = (a, r) => [110 + Math.cos(a) * r, 110 + Math.sin(a) * r]
          const [x0, y0] = p(a0, R)
          const [x1, y1] = p(a1, R)
          return <path key={i} d={`M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" strokeWidth="18" strokeLinecap="butt"
            stroke={i < 4 ? '#1F6F52' : i === 4 ? '#E0B562' : '#E9E3D5'} />
        })}
        <text x="110" y="104" textAnchor="middle" fontSize="40" fontWeight="800" fill={INK} fontFamily="Qomra, sans-serif">17</text>
        <text x="110" y="132" textAnchor="middle" fontSize="15" fontWeight="700" fill="#8A6425" fontFamily="Qomra, sans-serif">يوماً للدورة</text>
      </svg>
      <div>
        <div className="text-[12px] font-bold text-[#8A6425]">المحفوظ: الأجزاء 28 إلى 30</div>
        <div className="font-black text-[18px] leading-snug text-[#1A2E28] mt-1">تختم مراجعة محفوظك كل 17 يوماً</div>
        <div className="text-[13px] leading-[1.8] text-[#5E6E67] mt-2">5 صفحات في اليوم، على خمسة أيام في الأسبوع.</div>
        <div className="flex gap-1.5 mt-3 text-[11.5px] font-bold">
          <span className="rounded-full px-2.5 py-1" style={{ background: 'rgba(31,111,82,.1)', color: '#1F6F52' }}>رُوجع</span>
          <span className="rounded-full px-2.5 py-1" style={{ background: 'rgba(224,181,98,.22)', color: '#8A6425' }}>اليوم</span>
        </div>
      </div>
    </div>
  )
}

/* ── الختم في رمضان ── */
export function KhatmVisual({ compact = false }) {
  const days = 29
  return (
    <div className="rounded-[24px] p-6" style={card} aria-hidden>
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[12px] font-bold text-[#8A6425]">ختمة في رمضان (29 يوماً)</div>
          <div className="font-black text-[18px] text-[#1A2E28] mt-0.5">وردك 20 أو 21 صفحة يومياً</div>
        </div>
        <div className="font-black text-[30px] leading-none" style={{ color: '#B8863A' }}>604</div>
      </div>
      <div className={`grid grid-cols-7 ${compact ? 'gap-1' : 'gap-1.5'}`}>
        {Array.from({ length: days }, (_, i) => (
          <div key={i} className={`rounded-md grid place-items-center text-[10.5px] font-bold ${compact ? 'h-6' : 'h-8'}`}
            style={i < 9
              ? { background: INK, color: '#E0B562' }
              : i === 9 ? { background: '#E0B562', color: INK } : { background: '#F1ECDF', color: '#8F8370' }}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11.5px] font-bold text-[#5E6E67] mt-3">
        <span>اليوم 10: من صفحة 188</span>
        <span>الفجر · الظهر · العصر · المغرب · العشاء</span>
      </div>
    </div>
  )
}

/* ── الشهادة ── */
export function CertificateVisual() {
  return (
    <div className="rounded-[20px] p-3 rotate-[1.5deg]" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }} aria-hidden>
      <div className="relative rounded-[12px] aspect-[1.414] px-8 py-6 text-center flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#FFFDF8', boxShadow: 'inset 0 0 0 2px #B8863A, inset 0 0 0 7px #FFFDF8, inset 0 0 0 8px rgba(184,134,58,.55)' }}>
        <div className="absolute inset-0 pattern-khatam-ink" style={{ opacity: 0.04 }} />
        <div className="relative text-[11px] font-bold text-[#8A6425]">معهد النور لتحفيظ القرآن</div>
        <div className="relative font-black text-[28px] leading-tight mt-1" style={{ color: INK }}>شهادة تقدير</div>
        <div className="relative w-16 h-[2px] my-2" style={{ background: '#E0B562' }} />
        <div className="relative text-[11px] text-[#4A5D56]">يمنح المعهد الطالب</div>
        <div className="relative font-black text-[20px] mt-0.5" style={{ color: '#8A6425' }}>عبد الله محمد</div>
        <div className="relative text-[11px] leading-[1.8] text-[#4A5D56] mt-1 max-w-[80%]">هذه الشهادة تقديراً لحفظه جزء عمّ كاملاً، وهو الجزء الثلاثون</div>
        <div className="relative flex justify-between w-full mt-4 text-[9.5px] text-[#5E6E67]">
          <span>المعلم ـــــــــ</span><span>مدير المعهد ـــــــــ</span>
        </div>
      </div>
    </div>
  )
}

