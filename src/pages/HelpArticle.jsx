import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import { ChevronLeft, ArrowLeft, Lightbulb, AlertTriangle, CheckCircle2, ListOrdered, Plus, MessageCircle, Clock } from 'lucide-react'
import { getArticle, getCategoryForArticle, ARTICLES } from '../data/helpContent'
import { ARTICLE_VISUAL } from '../data/helpVisuals'
import { BrowserFrame, PhoneFrame } from '../components/help/ShotFrame'
import StepShot from '../components/help/StepShot'
import PageMeta from '../components/layout/PageMeta'
import { SITE, composeDescription, FEATURE_SEO } from '../config/seo'
import VideoCard from '../components/video/VideoCard'
import { helpVideos, featuresOfVideo, featurePath } from '../data/videos'

const INK = '#0B3B33', GREEN = '#1F6F52', GOLD = '#B8863A', GOLD_TXT = '#8A6425'

/* يحوّل نص الخطوة إلى كتل: أسطر «•» المتتالية قائمة واحدة، وما عداها فقرات */
function parseBody(body) {
  const blocks = []
  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('•')) {
      const text = line.replace(/^•\s*/, '')
      if (blocks.at(-1)?.type === 'list') blocks.at(-1).items.push(text)
      else blocks.push({ type: 'list', items: [text] })
    } else blocks.push({ type: 'text', text: line })
  }
  return blocks
}

/* ─── خطوة: رقمٌ كبير على خطٍّ واصل، ثم النص ─── */
function Step({ step, num, isLast, slug }) {
  const blocks = parseBody(step.body)
  return (
    <div id={`s-${num}`} className="relative flex gap-4 sm:gap-6 scroll-mt-28">
      <div className="flex flex-col items-center shrink-0">
        <span className="w-11 h-11 rounded-xl grid place-items-center font-bold text-[17px] tabular-nums"
          style={{ background: INK, color: '#E0B562', fontFamily: 'cairo-latin, inherit', boxShadow: '0 8px 18px -8px rgba(8,44,38,.6)' }}>{num}</span>
        {!isLast && <span className="flex-1 w-[2px] mt-2 rounded-full" style={{ background: 'linear-gradient(180deg, rgba(184,134,58,.55), rgba(184,134,58,.08))' }} />}
      </div>
      <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-9'}`}>
        <h3 className="font-bold text-[19px] leading-snug text-[#1A2E28] mb-2.5 pt-1.5">{step.title}</h3>
        <div className="space-y-3 text-[16.5px] leading-[1.95] text-[#2F4540]">
          {blocks.map((b, i) => b.type === 'text'
            ? <p key={i}>{b.text}</p>
            : (
              <ul key={i} className="space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden className="mt-[0.75em] w-2 h-2 rotate-45 shrink-0" style={{ background: GOLD }} />
                    <span className="flex-1">{it}</span>
                  </li>
                ))}
              </ul>
            ))}
        </div>
        <StepShot slug={slug} n={num} />
        {step.note && (
          <div className="mt-4 rounded-2xl px-4 py-3.5 flex gap-3 items-start" style={{ background: 'rgba(31,111,82,.08)', boxShadow: 'inset 0 0 0 1px rgba(31,111,82,.22)' }}>
            <CheckCircle2 size={17} className="shrink-0 mt-0.5" style={{ color: GREEN }} />
            <p className="text-[14.5px] leading-[1.85] text-[#1A2E28]">{step.note}</p>
          </div>
        )}
        {step.warning && (
          <div className="mt-4 rounded-2xl px-4 py-3.5 flex gap-3 items-start" style={{ background: 'rgba(192,57,43,.07)', boxShadow: 'inset 0 0 0 1px rgba(192,57,43,.22)' }}>
            <AlertTriangle size={17} className="shrink-0 mt-0.5 text-[#C0392B]" />
            <p className="text-[14.5px] leading-[1.85] text-[#1A2E28]">{step.warning}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── فهرس الخطوات مع تتبّع الخطوة الظاهرة ─── */
function useActiveStep(count) {
  const [active, setActive] = useState(1)
  useEffect(() => {
    if (!count) return
    const els = Array.from({ length: count }, (_, i) => document.getElementById(`s-${i + 1}`)).filter(Boolean)
    const io = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) setActive(Number(vis[0].target.id.slice(2)))
    }, { rootMargin: '-15% 0px -70% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [count])
  return active
}

function StepsToc({ steps, active }) {
  return (
    <nav aria-label="خطوات الشرح">
      <div className="flex items-center gap-2 mb-3 text-[13px] font-bold" style={{ color: GOLD_TXT }}>
        <ListOrdered size={15} /> خطوات الشرح
      </div>
      <ol className="space-y-0.5" style={{ borderInlineStart: '2px solid var(--line-warm)' }}>
        {steps.map((s, i) => {
          const on = active === i + 1
          return (
            <li key={i}>
              <a href={`#s-${i + 1}`} className="relative flex gap-2.5 ps-4 py-1.5 text-[13.5px] leading-snug transition-colors"
                style={{ color: on ? INK : '#5E6E67', fontWeight: on ? 700 : 500 }}>
                {on && <motion.span layoutId="step-bar" className="absolute top-0 bottom-0 w-[2px]" style={{ insetInlineStart: -2, background: GOLD }} />}
                <span className="tabular-nums" style={{ color: GOLD_TXT }}>{i + 1}</span>{s.title}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ─── صورة الشرح: الشاشة الحقيقية، وهاتفها يتراكب على حافتها ─── */
function ArticleVisual({ visual }) {
  if (!visual) return null
  const { main, side } = visual
  return (
    <div className="relative max-w-4xl mx-auto mt-10">
      {main.kind === 'phone' ? (
        <div className="flex justify-center"><PhoneFrame shot={main} width={240} eager /></div>
      ) : main.kind === 'scene' ? (
        <div className="rounded-[26px] overflow-hidden aspect-[21/9]" style={{ boxShadow: 'var(--shadow-lg)', background: '#E9E3D5' }}>
          <img src={main.src} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <>
          <BrowserFrame shot={main} eager />
          {side && (
            <div className="hidden sm:block absolute -bottom-8 left-[-2%] md:left-[-5%]">
              <PhoneFrame shot={side} width={128} />
            </div>
          )}
        </>
      )}
      {main.caption && (
        <p className="text-[13px] leading-relaxed text-[#5E6E67] text-center max-w-xl mx-auto mt-5">{main.caption}</p>
      )}
    </div>
  )
}

function MiniCard({ a }) {
  const v = ARTICLE_VISUAL[a.slug]?.main
  return (
    <Link to={`/help/${a.slug}`} className="group flex items-center gap-3 rounded-2xl p-3 transition-all hover:-translate-y-0.5"
      style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
      {v && (
        <span className="shrink-0 w-16 h-12 rounded-lg overflow-hidden" style={{ background: '#F1ECDF' }}>
          <img src={v.srcSm} alt="" loading="lazy" className="w-full h-full object-cover" style={{ objectPosition: v.kind === 'phone' ? 'top' : 'right top' }} />
        </span>
      )}
      <span className="flex-1 text-[14px] font-bold leading-snug text-[#1A2E28] group-hover:text-[#1F6F52] transition-colors">{a.title}</span>
      <ChevronLeft size={15} className="text-[#5E6E67] shrink-0 transition-transform group-hover:-translate-x-1" />
    </Link>
  )
}

/* ─── الصفحة ─── */
export default function HelpArticle() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const article   = getArticle(slug)
  const cat       = getCategoryForArticle(slug)

  useEffect(() => { if (!article) navigate('/help', { replace: true }) }, [article, navigate])

  const stepCount = article?.steps.length || 0
  const active    = useActiveStep(stepCount)
  const { scrollYProgress } = useScroll()
  const progress  = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 })

  const more = useMemo(() => {
    if (!article) return []
    const related = (article.related || []).map(s => ARTICLES[s]).filter(Boolean)
    const siblings = Object.values(ARTICLES).filter(a => a.category === article.category && a.slug !== article.slug && !related.includes(a))
    const all = Object.values(ARTICLES)
    const at = all.findIndex(a => a.slug === article.slug)
    const next = [1, 2, 3].map(n => all[(at + n) % all.length])
      .filter(a => a && a.slug !== article.slug && !related.includes(a) && !siblings.includes(a))
    return [...related, ...siblings, ...next].slice(0, 6)
  }, [article])

  if (!article) return null

  const Icon   = cat?.icon
  const visual = ARTICLE_VISUAL[article.slug]
  const faq    = article.faq || []
  const videos = helpVideos(slug)

  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>
      <PageMeta
        title={article.seoTitle || article.title}
        description={article.seoDescription || composeDescription([
          article.description,
          `شرح من ${article.steps.length} خطوات`,
          article.whoFor?.length ? `لـ${article.whoFor.join('، ')}` : null,
          'في مركز مساعدة نظام إحكام',
          'ضمن دليل استخدام النظام لمعاهد التحفيظ',
        ])}
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE.origin + '/' },
                { '@type': 'ListItem', position: 2, name: 'مركز المساعدة', item: SITE.origin + '/help' },
                { '@type': 'ListItem', position: 3, name: article.title },
              ],
            },
            ...(faq.length ? [{
              '@type': 'FAQPage',
              mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            }] : []),
          ],
        }}
      />

      <motion.div aria-hidden className="fixed top-0 inset-x-0 h-[3px] z-[60] origin-right"
        style={{ scaleX: progress, background: `linear-gradient(270deg, ${GOLD}, #E0B562)` }} />

      {/* ─── الرأس ─── */}
      <header className="relative pt-28 sm:pt-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-1.5 text-[12px] text-[#5E6E67] mb-6 flex-wrap" aria-label="مسار التنقل">
            <Link to="/help" className="hover:text-[#1A2E28]">مركز المساعدة</Link>
            <ChevronLeft size={12} />
            {cat && <><Link to={`/help/category/${cat.id}`} className="hover:text-[#1A2E28]">{cat.label}</Link><ChevronLeft size={12} /></>}
            <span className="text-[#1A2E28]">{article.title}</span>
          </nav>
          <div className="max-w-4xl page-enter">
            {cat && <span className="eyebrow">{Icon && <Icon size={14} />} {cat.label}</span>}
            <h1 className="font-bold text-[#1A2E28] mt-5 mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.9rem)', lineHeight: 1.25 }}>{article.title}</h1>
            <p className="text-[17px] sm:text-[19px] leading-[1.85] text-[#4A5D56] max-w-3xl">{article.description}</p>
            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-[13px] text-[#5E6E67] mt-6">
              <span className="flex items-center gap-1.5 font-bold" style={{ color: GOLD_TXT }}><Clock size={14} /> {article.steps.length} خطوات</span>
              {article.whoFor?.length > 0 && <>
                <span className="w-1 h-1 rounded-full bg-[#0B3B33]/25" />
                <span>لـ {article.whoFor.join('، ')}</span>
              </>}
            </div>
          </div>
        </div>
        <div className="pb-6"><ArticleVisual visual={visual} /></div>
      </header>

      {/* ─── المتن ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-10 lg:gap-16">
          <main className="min-w-0 max-w-[720px]">
            {article.intro && <p className="text-[19px] leading-[1.95] text-[#1A2E28] font-medium mb-10">{article.intro}</p>}

            {videos.length > 0 && (
              <section className="mb-12" aria-labelledby="watch-h">
                <h2 id="watch-h" className="font-bold text-[#1A2E28] mb-5" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.7rem)' }}>
                  شاهد الشرح <span className="title-mark">مصوّراً</span>
                </h2>
                <div className="space-y-10">
                  {videos.map(v => (
                    <VideoCard
                      key={v.key}
                      video={v}
                      links={featuresOfVideo(v.key).filter(f => FEATURE_SEO[f]).map(f => [featurePath(f), `عن الميزة: ${FEATURE_SEO[f].title}`])}
                    />
                  ))}
                </div>
              </section>
            )}

            <details className="lg:hidden mb-8 rounded-2xl px-5 py-4" style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              <summary className="cursor-pointer font-bold text-[14px] flex items-center gap-2" style={{ color: INK }}>
                <ListOrdered size={16} /> الخطوات ({article.steps.length})
              </summary>
              <ol className="mt-3 space-y-2">
                {article.steps.map((s, i) => (
                  <li key={i}><a href={`#s-${i + 1}`} className="flex gap-3 text-[14px] text-[#2F4540]">
                    <span className="tabular-nums font-bold" style={{ color: GOLD_TXT }}>{i + 1}</span>{s.title}
                  </a></li>
                ))}
              </ol>
            </details>

            <div>
              {article.steps.map((s, i) => <Step key={i} step={s} num={i + 1} isLast={i === article.steps.length - 1} slug={article.slug} />)}
            </div>

            {article.tips?.length > 0 && (
              <aside className="relative mt-12 rounded-[22px] p-6 sm:p-7 overflow-hidden" style={{ background: '#F1ECDF', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                <span aria-hidden className="absolute inset-y-0 right-0 w-1.5" style={{ background: `linear-gradient(180deg, ${GOLD}, ${GREEN})` }} />
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3 py-1" style={{ background: INK, color: '#E0B562' }}>
                    <Lightbulb size={13} /> نصائح
                  </span>
                </div>
                <ul className="space-y-3">
                  {article.tips.map((t, i) => (
                    <li key={i} className="flex gap-3 text-[16px] leading-[1.9] text-[#1A2E28]">
                      <span aria-hidden className="mt-[0.75em] w-2 h-2 rotate-45 shrink-0" style={{ background: GOLD }} />{t}
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {faq.length > 0 && (
              <section className="mt-14">
                <h2 className="font-bold text-[#1A2E28] mb-5" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.7rem)' }}>أسئلة شائعة</h2>
                <div className="space-y-2.5">
                  {faq.map((f, i) => (
                    <details key={i} className="group rounded-2xl px-5 py-4 open:pb-5" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-[16px] text-[#1A2E28] [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <span className="shrink-0 w-8 h-8 rounded-full grid place-items-center transition-transform group-open:rotate-45" style={{ background: '#F1ECDF', color: INK }}><Plus size={16} /></span>
                      </summary>
                      <p className="text-[15.5px] leading-[1.9] text-[#2F4540] mt-3">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <StepsToc steps={article.steps} active={active} />
              <div className="section-dark rounded-[20px] p-5 overflow-hidden">
                <div className="pattern-layer pattern-khatam" aria-hidden />
                <MessageCircle size={20} className="relative mb-2" style={{ color: '#E0B562' }} />
                <div className="relative text-[15px] font-bold mb-1.5" style={{ color: '#F8F5EC' }}>لم يحلّ الشرح مشكلتك؟</div>
                <p className="relative text-[13px] leading-relaxed mb-4" style={{ color: 'rgba(248,245,236,.75)' }}>اسأل فريق إحكام مباشرةً.</p>
                <Link to="/contact" className="btn-cta relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold">
                  تواصل معنا <ArrowLeft size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ─── شروح أخرى ─── */}
      {more.length > 0 && (
        <section className="px-4 sm:px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-bold text-[#1A2E28] mb-6" style={{ fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)' }}>
              اقرأ <span className="title-mark">بعده</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {more.map(a => <MiniCard key={a.slug} a={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* شريط تواصل للجوال (الجانب مخفيّ هناك) */}
      <section className="lg:hidden px-4 sm:px-6 pb-20">
        <div className="section-dark rounded-[22px] p-6 overflow-hidden">
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <div className="relative font-bold text-[17px] mb-1.5" style={{ color: '#F8F5EC' }}>لم يحلّ الشرح مشكلتك؟</div>
          <p className="relative text-[14px] mb-4" style={{ color: 'rgba(248,245,236,.75)' }}>اسأل فريق إحكام مباشرةً.</p>
          <Link to="/contact" className="btn-cta relative inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold">تواصل معنا <ArrowLeft size={15} /></Link>
        </div>
      </section>
    </div>
  )
}
