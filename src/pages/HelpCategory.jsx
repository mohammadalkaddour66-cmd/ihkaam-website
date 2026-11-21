import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowLeft, ListChecks } from 'lucide-react'
import { CATEGORIES, ARTICLES } from '../data/helpContent'
import { CAT_VISUAL, ARTICLE_VISUAL } from '../data/helpVisuals'
import { BrowserFrame, PhoneFrame, ShotThumb } from '../components/help/ShotFrame'
import PageMeta from '../components/layout/PageMeta'
import { composeDescription } from '../config/seo'

const INK = '#0B3B33', GOLD = '#B8863A', GOLD_TXT = '#8A6425'
const ease = [0.22, 1, 0.36, 1]

/* صورة رأس التصنيف: لقطة شاشته، أو هاتف، أو مشهد */
function CategoryHero({ shot }) {
  if (!shot) return null
  if (shot.kind === 'phone') {
    return <div className="flex justify-center"><PhoneFrame shot={shot} width={230} eager /></div>
  }
  if (shot.kind === 'scene') {
    return (
      <div className="rounded-[26px] overflow-hidden aspect-[4/3]" style={{ boxShadow: 'var(--shadow-lg)', background: '#E9E3D5' }}>
        <img src={shot.src} alt="" className="w-full h-full object-cover" />
      </div>
    )
  }
  return <BrowserFrame shot={shot} eager />
}

export default function HelpCategory() {
  const { catId } = useParams()
  const navigate  = useNavigate()
  const cat       = CATEGORIES.find(c => c.id === catId)

  useEffect(() => { if (!cat) navigate('/help', { replace: true }) }, [cat, navigate])
  if (!cat) return null

  const Icon     = cat.icon
  const articles = cat.articles.map(s => ARTICLES[s]).filter(Boolean)
  const shot     = CAT_VISUAL[cat.id]
  const others   = CATEGORIES.filter(c => c.id !== cat.id)
  const steps    = articles.reduce((n, a) => n + a.steps.length, 0)

  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>
      <PageMeta
        title={`${cat.label} — مركز المساعدة`}
        description={composeDescription([
          cat.description,
          `${articles.length} شروحات خطوة بخطوة`,
          articles.slice(0, 3).map(a => a.title).join('، '),
          'في مركز مساعدة نظام إحكام',
        ])}
        noindex
      />

      {/* ─── الرأس: العنوان والمقدمة، وبجانبهما شاشة القسم ─── */}
      <section className="relative pt-28 sm:pt-32 pb-14 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" aria-hidden
          style={{ opacity: 0.035, maskImage: 'radial-gradient(ellipse 60% 60% at 70% 20%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 70% 20%, #000, transparent 75%)' }} />
        <div className="relative max-w-6xl mx-auto">
          <nav className="flex items-center gap-1.5 text-[12px] text-[#5E6E67] mb-7" aria-label="مسار التنقل">
            <Link to="/help" className="hover:text-[#1A2E28]">مركز المساعدة</Link>
            <ChevronLeft size={12} />
            <span>{cat.label}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
            <div className="page-enter">
              <span className="eyebrow"><Icon size={14} /> {cat.label}</span>
              <h1 className="font-bold text-[#1A2E28] mt-5 mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.9rem)', lineHeight: 1.25 }}>
                {cat.description}
              </h1>
              {cat.intro && <p className="text-[16.5px] leading-[1.95] text-[#4A5D56] max-w-xl">{cat.intro}</p>}
              <div className="flex items-center gap-3 mt-6 text-[13px] font-bold" style={{ color: GOLD_TXT }}>
                <span className="rounded-full px-3.5 py-1.5" style={{ background: '#F1ECDF' }}>{articles.length} شروح</span>
                <span className="rounded-full px-3.5 py-1.5" style={{ background: '#F1ECDF' }}>{steps} خطوة مصوّرة</span>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.1 }}>
              <CategoryHero shot={shot} />
              {shot?.caption && <p className="text-[13px] leading-relaxed text-[#5E6E67] mt-4 text-center max-w-md mx-auto">{shot.caption}</p>}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── قبل أن تبدأ ─── */}
      {cat.points?.length > 0 && (
        <section className="px-4 sm:px-6 pb-12">
          <div className="max-w-6xl mx-auto rounded-[24px] p-6 sm:p-8"
            style={{ background: '#F1ECDF', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
            <div className="flex items-center gap-2 mb-4 font-bold text-[15px]" style={{ color: INK }}>
              <ListChecks size={18} /> قبل أن تبدأ في {cat.label}
            </div>
            <ul className="grid md:grid-cols-3 gap-4">
              {cat.points.map((p, i) => (
                <li key={i} className="flex gap-3 text-[14.5px] leading-[1.85] text-[#2F4540]">
                  <span aria-hidden className="mt-[0.7em] w-2 h-2 rotate-45 shrink-0" style={{ background: GOLD }} />{p}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── الشروح: صورة الشاشة قبل العنوان ─── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-[#1A2E28] mb-6" style={{ fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)' }}>
            شروح <span className="title-mark">{cat.label}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a, i) => {
              const v = ARTICLE_VISUAL[a.slug]?.main
              return (
                <motion.div key={a.slug} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, ease, delay: (i % 3) * 0.07 }}>
                  <Link to={`/help/${a.slug}`}
                    className="group flex flex-col h-full rounded-[22px] overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                    <div className="relative h-40 overflow-hidden" style={{ background: v?.kind === 'scene' ? '#E9E3D5' : '#F1ECDF' }}>
                      {v ? <ShotThumb shot={v} className="transition-transform duration-500 group-hover:-translate-y-1.5" />
                        : <div className="absolute inset-0 grid place-items-center pattern-khatam-ink" style={{ color: INK }}><Icon size={38} style={{ opacity: .55 }} /></div>}
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-7 h-7 rounded-lg grid place-items-center text-[12px] font-bold tabular-nums" style={{ background: INK, color: '#E0B562' }}>{i + 1}</span>
                        <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: '#F1ECDF', color: GOLD_TXT }}>{a.steps.length} خطوات</span>
                      </div>
                      <h3 className="font-bold text-[16.5px] leading-snug text-[#1A2E28] group-hover:text-[#1F6F52] transition-colors mb-2">{a.title}</h3>
                      <p className="text-[14px] leading-relaxed text-[#4A5D56] flex-1 line-clamp-3">{a.description}</p>
                      {a.whoFor?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {a.whoFor.slice(0, 3).map(w => (
                            <span key={w} className="text-[11px] px-2.5 py-0.5 rounded-full text-[#4A5D56]" style={{ boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>{w}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-1.5 text-[13px] font-bold" style={{ color: INK }}>
                        اقرأ الشرح <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── بقية الأقسام ─── */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-[#1A2E28] mb-5" style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)' }}>أقسام أخرى</h2>
          <div className="flex flex-wrap gap-2.5">
            {others.map(c => {
              const CI = c.icon
              return (
                <Link key={c.id} to={`/help/category/${c.id}`}
                  className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors hover:bg-[#F1ECDF]"
                  style={{ background: '#FDFBF7', color: INK, boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                  <CI size={15} style={{ color: GOLD_TXT }} /> {c.label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── لم تجد جوابك؟ ─── */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="section-dark max-w-6xl mx-auto rounded-[24px] p-7 sm:p-9 overflow-hidden flex flex-wrap items-center justify-between gap-5" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <div className="relative">
            <div className="font-bold text-[20px]" style={{ color: '#F8F5EC' }}>شرحٌ ناقص أو سؤالٌ لم تجده؟</div>
            <p className="text-[14.5px] mt-1" style={{ color: 'rgba(248,245,236,.78)' }}>اسأل فريق إحكام، ويردّ عليك شخص.</p>
          </div>
          <Link to="/contact" className="btn-cta relative inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-[14px]">
            تواصل معنا <ArrowLeft size={15} />
          </Link>
        </div>
      </section>
    </div>
  )
}
