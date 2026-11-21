import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronDown, ArrowLeft, ShieldCheck, Gift, BookOpenText, Sparkles } from 'lucide-react'
import PageMeta from '../layout/PageMeta'
import { SITE, FEATURE_SEO } from '../../config/seo'
import { TOOLS, TOOLS_HUB, POST_TITLES } from '../../config/tools'
import { featureHrefOf } from './toolLinks'
import { ToolGlyph } from './ToolVisuals'

/* إطار صفحة الأداة: مسار التنقل، ثم رأسٌ قصير (الأداة نفسها هي ما جاء الزائر
   من أجله، فتظهر في الشاشة الأولى)، ثم مساحة العمل، ثم «كيف تحسب الأداة»
   والأسئلة الشائعة وروابط القراءة والأدوات الأخرى.

   الأسئلة <details> ظاهرة في HTML المولَّد، فيقرؤها entry-server ويكتب منها
   FAQPage حرفاً بحرف. */

const INK = '#0B3B33'
const GOLD_TXT = '#8A6425'

export function TrustChips({ dark = false }) {
  const items = [
    { icon: Gift, t: 'مجانية بلا تسجيل' },
    { icon: ShieldCheck, t: 'الحساب في جهازك، لا يُرسَل اسم ولا بيانات' },
    { icon: BookOpenText, t: 'مصحف المدينة: 604 صفحات، 15 سطراً' },
  ]
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-bold" style={{ color: dark ? 'rgba(248,245,236,.8)' : '#4A5D56' }}>
      {items.map(({ icon: I, t }) => (
        <li key={t} className="inline-flex items-center gap-1.5"><I size={15} color={dark ? '#E0B562' : '#1F6F52'} /> {t}</li>
      ))}
    </ul>
  )
}

function Faq({ items }) {
  return (
    <div className="rounded-[22px] px-5 sm:px-7" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
      {items.map((f) => (
        <details key={f.q} className="group border-b last:border-0" style={{ borderColor: 'var(--line-warm)' }}>
          <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none font-bold text-[16px] text-[#1A2E28] [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" color="#B8863A" />
          </summary>
          <p className="pb-5 -mt-1 text-[15px] leading-[2] text-[#4A5D56]">{f.a}</p>
        </details>
      ))}
    </div>
  )
}

export default function ToolLayout({ tool, lead, visual, children, method, faq }) {
  const others = TOOLS.filter((t) => t.slug !== tool.slug)
  const feature = FEATURE_SEO[tool.feature]

  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>
      <PageMeta title={tool.seoTitle} description={tool.seoDescription} image={`${SITE.origin}/og/tools/${tool.slug}.jpg`} />

      {/* ─── الرأس ─── */}
      <section className="relative pt-28 sm:pt-32 pb-8 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" aria-hidden
          style={{ opacity: 0.035, maskImage: 'radial-gradient(ellipse 60% 60% at 70% 0%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 70% 0%, #000, transparent 75%)' }} />
        <div className="relative max-w-6xl mx-auto">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-[#5E6E67] mb-6 flex-wrap" aria-label="مسار التنقل">
            <Link to="/" className="hover:text-[#1A2E28]">الرئيسية</Link>
            <ChevronLeft size={12} />
            <Link to={TOOLS_HUB.path} className="hover:text-[#1A2E28]">{TOOLS_HUB.name}</Link>
            <ChevronLeft size={12} />
            <span className="text-[#1A2E28] font-bold">{tool.name}</span>
          </nav>
          <div className="grid lg:grid-cols-[1.25fr_1fr] gap-8 lg:gap-12 items-center">
            <div className="page-enter">
              <span className="eyebrow"><Sparkles size={14} /> أداة مجانية من إحكام</span>
              <h1 className="font-bold text-[#1A2E28] mt-5 mb-4" style={{ fontSize: 'clamp(1.85rem, 3.8vw, 2.75rem)', lineHeight: 1.3 }}>
                {tool.name}: <span className="title-mark">{tool.tagline}</span>
              </h1>
              <p className="text-[16.5px] leading-[1.95] text-[#4A5D56] max-w-2xl mb-6">{lead}</p>
              <TrustChips />
            </div>
            <div className="hidden lg:block">{visual}</div>
          </div>
        </div>
      </section>

      {/* ─── مساحة العمل ─── */}
      <section id="tool" className="px-4 sm:px-6 pb-16 scroll-mt-24">
        <div className="max-w-6xl mx-auto">{children}</div>
      </section>

      {/* ─── كيف تحسب ─── */}
      {method && (
        <section className="px-4 sm:px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-10">
              <span className="eyebrow">{method.eyebrow || 'كيف تعمل الأداة'}</span>
              <h2 className="font-bold text-[#1A2E28] mt-5 mb-3" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)', lineHeight: 1.3 }}>{method.title}</h2>
              {method.intro && <p className="text-[16px] leading-[1.95] text-[#4A5D56]">{method.intro}</p>}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {method.steps.map((s, i) => (
                <article key={s.t} className="rounded-[22px] p-6" style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-xl grid place-items-center font-black text-[16px]" style={{ background: INK, color: '#E0B562' }}>{i + 1}</span>
                    {s.icon && <s.icon size={20} color={GOLD_TXT} />}
                  </div>
                  <h3 className="font-black text-[17px] text-[#1A2E28] mb-2">{s.t}</h3>
                  <p className="text-[14.5px] leading-[1.95] text-[#4A5D56]">{s.d}</p>
                  {s.example && (
                    <div className="mt-4 rounded-xl px-4 py-3 text-[13.5px] leading-[1.8]" style={{ background: '#F8F5EC', color: '#1A2E28', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                      {s.example}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── اقرأ أيضاً + الأدوات الأخرى ─── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-6">
          <div className="rounded-[24px] p-6 sm:p-7" style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
            <h2 className="font-black text-[19px] text-[#1A2E28] mb-4">اقرأ قبل أن تخطط</h2>
            <ul className="space-y-1">
              {tool.posts.map((slug) => (
                <li key={slug}>
                  <Link to={`/blog/${slug}`} className="flex items-center justify-between gap-3 py-3 border-b text-[15px] font-bold text-[#1A2E28] hover:text-[#1F6F52]" style={{ borderColor: 'var(--line-warm)' }}>
                    {POST_TITLES[slug] || slug}
                    <ArrowLeft size={15} color="#B8863A" className="shrink-0" />
                  </Link>
                </li>
              ))}
              {feature && (
                <li>
                  <Link to={featureHrefOf(tool.feature)} className="flex items-center justify-between gap-3 py-3 text-[15px] font-bold text-[#1A2E28] hover:text-[#1F6F52]">
                    في إحكام: {feature.title}
                    <ArrowLeft size={15} color="#B8863A" className="shrink-0" />
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h2 className="font-black text-[19px] text-[#1A2E28] mb-4">أدوات أخرى مجانية</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {others.map((t) => (
                <Link key={t.slug} to={t.path} className="group rounded-[20px] p-5 block transition-transform hover:-translate-y-1"
                  style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                  <ToolGlyph slug={t.slug} />
                  <div className="font-black text-[15px] text-[#1A2E28] mt-3 group-hover:text-[#1F6F52]">{t.name}</div>
                  <div className="text-[12.5px] leading-[1.7] text-[#5E6E67] mt-1">{t.tagline}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── الأسئلة ─── */}
      {faq?.length > 0 && (
        <section className="px-4 sm:px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-bold text-[#1A2E28] text-center mb-8" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)' }}>أسئلة عن {tool.name}</h2>
            <Faq items={faq} />
          </div>
        </section>
      )}

      {/* ─── من الأداة إلى النظام ─── */}
      <section className="px-4 sm:px-6 pt-4 pb-24">
        <div className="max-w-6xl mx-auto section-dark rounded-[28px] p-8 sm:p-12 overflow-hidden">
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <span className="eyebrow">حين تكبر الحلقة</span>
              <h2 className="font-bold mt-5 mb-3" style={{ color: '#F8F5EC', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', lineHeight: 1.35 }}>
                حين يكثر الطلاب، <span className="title-mark">يتابع إحكام الخطة عنك</span>
              </h2>
              <p className="text-[15.5px] leading-[1.95]" style={{ color: 'rgba(248,245,236,.8)' }}>
                في إحكام يسجّل المعلم تسميع كل طالب وحضوره في دقائق، ويرى المدير من تأخر عن خطته قبل نهاية الشهر، ويتابع ولي الأمر حفظ ابنه من هاتفه.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link to="/ihkaam" className="btn-cta rounded-xl gap-2 px-8 py-3.5 text-[15px]">تعرّف على إحكام <ArrowLeft size={16} /></Link>
              <Link to={TOOLS_HUB.path} className="btn-outline rounded-xl px-8 py-3.5 text-[15px]">كل الأدوات المجانية</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
