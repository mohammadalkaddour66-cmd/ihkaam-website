import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText } from 'lucide-react'

/* ══════════════════════════════════════════════════════════════════
   «إحكام في ملف واحد» (2026-11-20)

   ملف عرض المنتج (19 شريحة، 10 ميغا) يُقرأ هنا شريحةً شريحة بلا تحميل:
   الصفحات مرسومة صوراً خفيفة (public/showcase)، لأن عرض PDF داخل الصفحة
   لا يعمل على أكثر الجوالات. ومن أراده كاملاً حمّله، أو فتحه في صفحة مستقلة.
   الشرائح من الملف نفسه (public/downloads/ihkaam-product-showcase.pdf)،
   فإن تغيّر الملف أُعيد رسمها.
   ══════════════════════════════════════════════════════════════════ */

export const SHOWCASE_PDF  = '/downloads/ihkaam-product-showcase.pdf'
const PDF_DOWNLOAD_NAME    = 'إحكام-عرض-المنتج.pdf'
const INK = '#0B3B33'
const ease = [0.22, 1, 0.36, 1]

const SLIDES = [
  'إحكام: نظام سحابي لإدارة المعاهد القرآنية',
  'ست عشرة وحدة تعمل معاً',
  'المعهد كله في شاشة واحدة',
  'تسجيل الطلاب والكادر',
  'الحلقات والأفواج والكادر',
  'تسميع يومي بلا دفاتر ورقية',
  'حضور الحلقة بنقرة واحدة',
  'سلوك الطلاب شهرياً',
  'اختبارات وتقارير جاهزة للطباعة',
  'تحليل يُنبّهك قبل أن يتفاقم التراجع',
  'وكل طالب يُقرأ على حدة',
  'ترشيح الأفضل بالنقاط وتكريمه',
  'فقه وعقيدة وسيرة، بمنهج وعلامات',
  'أموال المعهد بلا ضياع',
  'الأقساط وحركة الصندوق',
  'وليّ الأمر يرى ما يحدث في الحلقة وقت حدوثه',
  'تحديد الشاشات التي تظهر لكل موظف',
  'تفاصيل تجعله جاهزاً للتشغيل اليومي',
  'إحكام: ذاكرة المعهد القرآني',
]
const N = SLIDES.length
const src = (i, sm) => `/showcase/s${String(i + 1).padStart(2, '0')}${sm ? '-sm' : ''}.webp`

export default function ShowcaseViewer() {
  const [i, setI] = useState(0)
  const go = useCallback((d) => setI(x => Math.min(N - 1, Math.max(0, x + d))), [])

  /* الشريحة التالية تُحمَّل قبل أن يطلبها الزائر */
  useEffect(() => {
    if (i < N - 1) { const im = new Image(); im.src = src(i + 1) }
  }, [i])

  /* الأسهم: في صفحةٍ عربية يمين = السابق، يسار = التالي */
  const onKey = (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(1) }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(-1) }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start" dir="rtl">

      {/* ── العارض ── */}
      <div className="min-w-0">
        <div
          tabIndex={0} onKeyDown={onKey} role="group" aria-roledescription="عارض شرائح" aria-label="ملف عرض إحكام"
          className="relative rounded-[24px] overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-[rgba(31,111,82,.25)]"
          style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)', aspectRatio: '16 / 9', touchAction: 'pan-y' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={i} src={src(i)} alt={`الشريحة ${i + 1} من ${N}: ${SLIDES[i]}`}
              width={1152} height={648} decoding="async"
              className="absolute inset-0 w-full h-full object-cover select-none"
              initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12}
              onDragEnd={(_, info) => { if (info.offset.x > 60) go(-1); else if (info.offset.x < -60) go(1) }}
            />
          </AnimatePresence>

          {/* السابق يمين، التالي يسار */}
          <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="الشريحة السابقة"
            className="absolute top-1/2 -translate-y-1/2 right-3 w-11 h-11 rounded-full grid place-items-center cursor-pointer transition-opacity disabled:opacity-0"
            style={{ background: 'rgba(11,59,51,.82)', color: '#F8F5EC', boxShadow: '0 8px 20px -8px rgba(0,0,0,.5)' }}>
            <ChevronRight size={22} />
          </button>
          <button type="button" onClick={() => go(1)} disabled={i === N - 1} aria-label="الشريحة التالية"
            className="absolute top-1/2 -translate-y-1/2 left-3 w-11 h-11 rounded-full grid place-items-center cursor-pointer transition-opacity disabled:opacity-0"
            style={{ background: 'rgba(11,59,51,.82)', color: '#F8F5EC', boxShadow: '0 8px 20px -8px rgba(0,0,0,.5)' }}>
            <ChevronLeft size={22} />
          </button>

          <span className="absolute bottom-3 left-3 text-[12.5px] font-bold tabular-nums rounded-full px-3 py-1"
            style={{ background: 'rgba(11,59,51,.82)', color: '#F8F5EC' }} dir="ltr" aria-hidden>
            {i + 1} / {N}
          </span>
        </div>

        <div className="mt-4 text-center text-[15px] font-bold" style={{ color: '#2F4540' }} aria-live="polite">{SLIDES[i]}</div>

        {/* الشرائح المصغّرة */}
        <div className="mt-4 flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
          {SLIDES.map((t, n) => {
            const on = n === i
            return (
              <button key={n} type="button" onClick={() => setI(n)} aria-label={`اذهب إلى الشريحة ${n + 1}: ${t}`} aria-current={on}
                className="shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-200"
                style={{ width: 112, aspectRatio: '16 / 9', opacity: on ? 1 : 0.62, boxShadow: on ? `0 0 0 2.5px ${INK}` : 'inset 0 0 0 1px var(--line-warm)', background: '#FDFBF7' }}>
                <img src={src(n, true)} alt="" loading="lazy" width={320} height={180} className="w-full h-full object-cover" />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── بطاقة الملف ── */}
      <div className="rounded-[24px] p-6 section-dark relative overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="pattern-layer pattern-khatam" aria-hidden />
        <div className="relative flex flex-col gap-4">
          <span className="w-12 h-12 rounded-2xl grid place-items-center" style={{ background: 'rgba(224,181,98,.16)', color: '#E0B562', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.4)' }}>
            <FileText size={22} />
          </span>
          <div>
            <h3 className="font-bold text-[20px]" style={{ color: '#F8F5EC' }}>إحكام في ملف واحد</h3>
            <p className="text-[14.5px] leading-[1.9] mt-1.5" style={{ color: 'rgba(248,245,236,.78)' }}>
              {N} شريحة تشرح كل شاشة في النظام كما يراها المدير والمعلم وولي الأمر، لتعرضها على مجلس إدارة معهدك أو تقرأها على مهل.
            </p>
          </div>
          <a href={SHOWCASE_PDF} download={PDF_DOWNLOAD_NAME}
            className="btn-cta inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-[15px]">
            <Download size={18} /> حمّل الملف
            <span className="text-[12.5px] font-semibold opacity-75" dir="ltr">PDF · 10 MB</span>
          </a>
          <a href={SHOWCASE_PDF} target="_blank" rel="noopener noreferrer"
            className="btn-outline inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-[14.5px] border">
            <ExternalLink size={16} /> افتحه في صفحة مستقلة
          </a>
          <p className="text-[12.5px] leading-[1.8]" style={{ color: 'rgba(248,245,236,.6)' }}>
            الشاشات في الشرائح من النسخة التجريبية لإحكام (demo.ihkaam.app).
          </p>
        </div>
      </div>
    </div>
  )
}
