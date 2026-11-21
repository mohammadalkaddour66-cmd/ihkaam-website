import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronDown, Sparkles, Printer, FileDown, ImageDown, ShieldCheck, BookOpenText, HeartHandshake } from 'lucide-react'
import PageMeta from '../components/layout/PageMeta'
import { TrustChips } from '../components/tools/ToolLayout'
import { HifzVisual, ReviewVisual, KhatmVisual, CertificateVisual, ToolGlyph } from '../components/tools/ToolVisuals'
import { SITE } from '../config/seo'
import { TOOLS, TOOLS_HUB, TOOL_CREDIT } from '../config/tools'

/* صفحة الأدوات المجانية: كل أداة تُعرض بمخرَجها قبل وصفها. */


const TOOL_VISUALS = {
  'hifz-plan': HifzVisual,
  'review-plan': ReviewVisual,
  'khatm-calculator': KhatmVisual,
  certificate: CertificateVisual,
}

const SHARE_TEXT = `أدوات مجانية لمعلمي القرآن ومديري الحلقات: خطة الحفظ، وجدول المراجعة، وحاسبة الختم، وشهادة الحفظ.\n${SITE.origin}${TOOLS_HUB.path}`

const WHY = [
  { icon: ShieldCheck, t: 'لا يغادر شيء جهازك', d: 'لا تسجيل ولا إنشاء حساب. كل العمليات تجري في متصفحك، واسم الطالب وشعار المعهد لا يُرسلان إلى أي خادم.' },
  { icon: BookOpenText, t: 'على المصحف نفسه', d: 'مصحف المدينة النبوية، 604 صفحات و15 سطراً، بأرقام صفحات وأسطر متحقَّق منها آيةً آية. لا تقريب بالجزء والصفحة.' },
  { icon: HeartHandshake, t: 'من أسئلة الحلقات نفسها', d: 'بُنيت الأدوات على أسئلة تتكرر بين المعلمين والمديرين: كم يحفظ الطالب في اليوم؟ متى يختم؟ كيف أكتب الشهادة؟' },
]

const FAQ = [
  { q: 'هل الأدوات مجانية فعلاً؟', a: 'نعم، كلها مجانية بلا تسجيل ولا حدّ لعدد المرات. في أسفل كل جدول أو صورة أو شهادة سطر صغير يذكر أنها أُعدّت بأداة من إحكام، ولا شيء غيره.' },
  { q: 'هل تعمل على الهاتف؟', a: 'نعم. افتح الأداة من متصفح الهاتف، وزر الصورة يفتح المشاركة مباشرة فترسلها على واتساب. والطباعة وPDF تعمل من الحاسوب والهاتف معاً.' },
  { q: 'هل تُحفظ خططي لأعود إليها؟', a: 'لا تُحفظ، لأن شيئاً لا يُرسَل إلينا أصلاً. اطبع الجدول أو احفظه PDF أو صورة. وإن أردت سجلاً يحفظ خطة كل طالب وتسميعه يوماً بيوم، فهذا ما يفعله نظام إحكام.' },
  { q: 'وجدت خطأ في آية أو صفحة، ماذا أفعل؟', a: 'راسلنا من صفحة التواصل بالأداة والمدخلات التي استعملتها، ونراجع الحساب على المصحف ونصلحه.' },
]

function OutputChips({ items }) {
  const icons = [Printer, FileDown, ImageDown]
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t, i) => {
        const I = icons[i] || ImageDown
        return (
          <li key={t} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold" style={{ background: '#F1ECDF', color: '#4A5D56' }}>
            <I size={12} /> {t}
          </li>
        )
      })}
    </ul>
  )
}

export default function ToolsHub() {
  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>
      <PageMeta title={TOOLS_HUB.seoTitle} description={TOOLS_HUB.seoDescription} image={`${SITE.origin}/og/tools/tools.jpg`} />

      {/* ─── الرأس ─── */}
      <section className="relative pt-28 sm:pt-32 pb-12 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" aria-hidden
          style={{ opacity: 0.04, maskImage: 'radial-gradient(ellipse 65% 60% at 50% 0%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 65% 60% at 50% 0%, #000, transparent 75%)' }} />
        <div className="relative max-w-6xl mx-auto">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-[#5E6E67] mb-6" aria-label="مسار التنقل">
            <Link to="/" className="hover:text-[#1A2E28]">الرئيسية</Link>
            <ChevronLeft size={12} />
            <span className="text-[#1A2E28] font-bold">{TOOLS_HUB.name}</span>
          </nav>
          <div className="max-w-3xl page-enter">
            <span className="eyebrow"><Sparkles size={14} /> مجانية، بلا تسجيل</span>
            <h1 className="font-bold text-[#1A2E28] mt-5 mb-5" style={{ fontSize: 'clamp(2rem, 4.4vw, 3.1rem)', lineHeight: 1.28 }}>
              أدوات مجانية <span className="title-mark">لمعلم القرآن ومدير الحلقة</span>
            </h1>
            <p className="text-[17px] leading-[1.95] text-[#4A5D56] mb-6">
              خطة حفظ بالتاريخ والآيات، وجدول مراجعة يمرّ على المحفوظ كله، وحاسبة للختم والورد اليومي، وشهادة تقدير باسم معهدك. كل أداة تعطيك جدولاً تطبعه، أو PDF، أو صورة ترسلها لولي الأمر على واتساب.
            </p>
            <TrustChips />
          </div>
        </div>
      </section>

      {/* ─── الأدوات ─── */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {TOOLS.map((t) => {
            const V = TOOL_VISUALS[t.slug]
            return (
              <Link key={t.slug} to={t.path} className="group feat-card rounded-[28px] overflow-hidden flex flex-col"
                style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                <div className="relative px-6 sm:px-10 pt-8 pb-6 overflow-hidden" style={{ background: 'linear-gradient(170deg, #F1ECDF, #F8F5EC)' }}>
                  <div className="absolute inset-0 pattern-khatam-ink" style={{ opacity: 0.035 }} aria-hidden />
                  <div className="relative max-w-[420px] mx-auto min-h-[250px] flex flex-col justify-center transition-transform duration-500 group-hover:-translate-y-1"><V compact /></div>
                </div>
                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <ToolGlyph slug={t.slug} />
                    <h2 className="font-black text-[21px] text-[#1A2E28] group-hover:text-[#1F6F52] transition-colors">{t.name}</h2>
                  </div>
                  <p className="text-[15px] leading-[1.95] text-[#4A5D56] mb-4">{t.short}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    <OutputChips items={t.outputs} />
                    <span className="inline-flex items-center gap-1.5 font-bold text-[14.5px]" style={{ color: '#1F6F52' }}>افتح الأداة <ArrowLeft size={15} /></span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ─── لماذا ─── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto section-dark rounded-[28px] p-8 sm:p-12 overflow-hidden">
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <div className="max-w-2xl mb-10">
            <span className="eyebrow">قبل أن تبدأ</span>
            <h2 className="font-bold mt-5" style={{ color: '#F8F5EC', fontSize: 'clamp(1.6rem, 3.4vw, 2.4rem)', lineHeight: 1.3 }}>
              تعمل في متصفحك، <span className="title-mark">على مصحف المدينة</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {WHY.map((w) => (
              <div key={w.t} className="card-on-dark p-6">
                <span className="w-11 h-11 rounded-xl grid place-items-center mb-4" style={{ background: 'rgba(224,181,98,.12)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.32)' }}>
                  <w.icon size={20} color="#E0B562" />
                </span>
                <h3 className="font-bold text-[17px] mb-2" style={{ color: '#F8F5EC' }}>{w.t}</h3>
                <p className="text-[14.5px] leading-[1.9]" style={{ color: 'rgba(248,245,236,.78)' }}>{w.d}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] mt-8" style={{ color: 'rgba(248,245,236,.6)' }}>السطر الوحيد الذي تضيفه الأدوات إلى ما تطبعه: «{TOOL_CREDIT}».</p>
        </div>
      </section>

      {/* ─── شاركها ─── */}
      <section className="px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 justify-between"
          style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
          <div>
            <div className="font-black text-[19px] text-[#1A2E28]">تعرف معلماً يحتاجها؟</div>
            <p className="text-[14.5px] text-[#4A5D56] mt-1">أرسل له رابط الصفحة على واتساب، والأدوات تعمل عنده مباشرة.</p>
          </div>
          <a href={`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`} target="_blank" rel="noopener noreferrer"
            className="btn-cta rounded-xl px-7 py-3.5 text-[15px] gap-2 shrink-0">أرسلها على واتساب <ArrowLeft size={16} /></a>
        </div>
      </section>

      {/* ─── الأسئلة ─── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bold text-[#1A2E28] text-center mb-8" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)' }}>أسئلة عن الأدوات</h2>
          <div className="rounded-[22px] px-5 sm:px-7" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b last:border-0" style={{ borderColor: 'var(--line-warm)' }}>
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none font-bold text-[16px] text-[#1A2E28] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" color="#B8863A" />
                </summary>
                <p className="pb-5 -mt-1 text-[15px] leading-[2] text-[#4A5D56]">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="text-center text-[14px] text-[#5E6E67] mt-6">
            وتجد شرح الخطط نفسها في <Link to="/blog/weekly-memorization-plan" className="font-bold" style={{ color: '#1F6F52' }}>خطة الحفظ الأسبوعية</Link> و<Link to="/blog/quran-review-schedule" className="font-bold" style={{ color: '#1F6F52' }}>جدول المراجعة</Link> في المدونة.
          </p>
        </div>
      </section>

      {/* ─── إحكام ─── */}
      <section className="px-4 sm:px-6 pt-4 pb-24">
        <div className="max-w-6xl mx-auto rounded-[28px] p-8 sm:p-10 grid lg:grid-cols-[1.4fr_1fr] gap-6 items-center"
          style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
          <div>
            <h2 className="font-bold text-[#1A2E28] mb-2" style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', lineHeight: 1.35 }}>
              حين تصير الخطط عشرات الطلاب، <span className="title-mark">يحفظها لك إحكام</span>
            </h2>
            <p className="text-[15px] leading-[1.95] text-[#4A5D56]">تسميع كل طالب وحضوره وخطته في سجل واحد، وتقارير تُصدَّر PDF، وبوابة يتابع منها ولي الأمر.</p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link to="/ihkaam" className="btn-cta rounded-xl gap-2 px-8 py-3.5 text-[15px]">تعرّف على إحكام <ArrowLeft size={16} /></Link>
            <Link to="/ihkaam/features/academic" className="btn-outline rounded-xl px-8 py-3.5 text-[15px]">الحلقات وتوزيع الطلاب</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

