import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Clock, ArrowLeft, CheckCircle, Copy, Download, Plus, ListOrdered, Printer } from 'lucide-react'
import { getPost, getCategoryById, getRelatedPosts, readTimeLabel, featureHref } from '../data/blogContent'
import { BLOG_COVER, BLOG_VISUALS } from '../data/blogVisuals'
import { FEATURE_SEO, SITE, blogSeo } from '../config/seo'
import PageMeta from '../components/layout/PageMeta'
import Crumbs from '../components/layout/Crumbs'
import GlanceVisual from '../components/blog/GlanceVisual'
import BlogSubscribe from '../components/blog/BlogSubscribe'
import { ToolGlyph } from '../components/tools/ToolVisuals'
import { toolsForPost } from '../config/tools'

const INK = '#0B3B33', GREEN = '#1F6F52', GOLD = '#B8863A', GOLD_TXT = '#8A6425'
const ease = [0.22, 1, 0.36, 1]

function formatDate(d) {
  return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
}

/* ─── تنسيق داخل السطر: **عريض** و [نص](/مسار) ─────────────── */
const LINK_CLS = 'font-semibold text-[#1F6F52] underline underline-offset-4 decoration-[#B8863A]/50 hover:decoration-[#1F6F52]'
function inline(line) {
  return line
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#1A2E28] font-bold">$1</strong>')
    .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g, (_, label, href) =>
      href.startsWith('/')
        ? `<a href="${href}" class="${LINK_CLS}">${label}</a>`
        : `<a href="${href}" target="_blank" rel="noopener noreferrer" class="${LINK_CLS}">${label}</a>`)
}

/* تنزيل نموذجٍ كملفّ على جهاز الزائر. BOM في أوله ليقرأه Excel والمفكرة عربياً. */
function downloadFile(name, content, type) {
  const blob = new Blob(['﻿' + content], { type: type + ';charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const fileName  = (t) => String(t || 'نموذج').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 60) || 'نموذج'
const plainCell = (c) => String(c).replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
function tableToCsv(columns, rows) {
  const esc = (v) => '"' + plainCell(v).replace(/"/g, '""') + '"'
  return [columns, ...rows].map(r => r.map(esc).join(',')).join('\r\n')
}

/* ─── فقرة: الأسطر التي تبدأ بـ «- » بنود قائمة ─────────────── */
function Paragraphs({ text }) {
  return text.split('\n\n').map((para, j) => {
    const lines = para.split('\n').filter(l => l.trim())
    const bullets = lines.every(l => /^[-•]\s+/.test(l))
    if (bullets) {
      return (
        <ul key={j} className="my-5 space-y-2.5">
          {lines.map((l, k) => (
            <li key={k} className="flex gap-3 text-[17px] leading-[1.95] text-[#2F4540]">
              <span aria-hidden className="mt-[0.75em] w-2 h-2 rotate-45 shrink-0" style={{ background: GOLD }} />
              <span dangerouslySetInnerHTML={{ __html: inline(l.replace(/^[-•]\s+/, '')) }} />
            </li>
          ))}
        </ul>
      )
    }
    /* فقرة تبدأ بعنوانٍ عريض مرقّم «**1. …**» تصير خطوةً مرقّمة */
    const step = para.match(/^\*\*(\d+)\.\s*(.+?)\*\*\s*([\s\S]*)$/)
    if (step) {
      return (
        <div key={j} className="relative my-5 ps-14">
          <span className="absolute right-0 top-0 w-10 h-10 rounded-xl grid place-items-center font-bold"
            style={{ background: INK, color: '#E0B562' }}>{step[1]}</span>
          <h3 className="font-bold text-[17px] text-[#1A2E28] mb-1">{step[2]}</h3>
          <p className="text-[17px] leading-[1.95] text-[#2F4540]" dangerouslySetInnerHTML={{ __html: inline(step[3]) }} />
        </div>
      )
    }
    return lines.map((l, k) => (
      /^[-•]\s+/.test(l)
        ? <p key={`${j}-${k}`} className="flex gap-3 text-[17px] leading-[1.95] text-[#2F4540] mb-2">
            <span aria-hidden className="mt-[0.75em] w-2 h-2 rotate-45 shrink-0" style={{ background: GOLD }} />
            <span dangerouslySetInnerHTML={{ __html: inline(l.replace(/^[-•]\s+/, '')) }} />
          </p>
        : <p key={`${j}-${k}`} className="text-[17px] leading-[1.95] text-[#2F4540] mb-5" dangerouslySetInnerHTML={{ __html: inline(l) }} />
    ))
  })
}

/* ─── نموذج جاهز: الرسائل فقاعة محادثة، والباقي ورقة مسطّرة ───── */
function TemplateBlock({ title, text }) {
  const [copied, setCopied] = useState(false)
  const isMessage = /رسالة|دعوة/.test(title)
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {})
  }
  const actions = (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={copy}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors"
        style={{ background: copied ? GREEN : INK, color: '#F8F5EC' }}>
        {copied ? <CheckCircle size={13} /> : <Copy size={13} />}{copied ? 'نُسخ' : 'انسخ'}
      </button>
      <button type="button" onClick={() => downloadFile(fileName(title) + '.txt', text, 'text/plain')}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
        style={{ background: '#FDFBF7', color: INK, boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
        <Download size={13} /> تنزيل
      </button>
    </div>
  )

  if (isMessage) {
    return (
      <figure className="my-9 rounded-[22px] overflow-hidden" style={{ background: '#E9E3D5', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
        <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: INK }}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: 'rgba(224,181,98,.18)' }}>
              <img src="/ihkaam-logo-light-sm.png" alt="" className="w-6 h-6 object-contain" onError={e => { e.currentTarget.style.display = 'none' }} />
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[#F8F5EC] truncate">{title}</div>
              <div className="text-[11px]" style={{ color: 'rgba(248,245,236,.6)' }}>نموذج رسالة جاهز للنسخ</div>
            </div>
          </div>
          {actions}
        </div>
        <div className="relative p-4 sm:p-6 pattern-khatam-ink" style={{ backgroundColor: '#EFE9DC', backgroundBlendMode: 'normal' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(239,233,220,.94)' }} />
          <div className="relative max-w-[92%] sm:max-w-[80%] ms-auto rounded-2xl rounded-tl-md px-5 py-4 text-[15px] leading-[2] whitespace-pre-line text-[#1A2E28]"
            style={{ background: '#FDFBF7', boxShadow: '0 6px 16px -10px rgba(11,59,51,.4)' }}>
            {text}
            <div className="text-[11px] text-[#5E6E67] text-left mt-1">✓✓</div>
          </div>
        </div>
      </figure>
    )
  }

  return (
    <figure className="my-9 relative">
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[20px]" style={{ background: '#E9E3D5' }} aria-hidden />
      <div className="relative rounded-[20px] overflow-hidden" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid var(--line-warm)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <Printer size={16} style={{ color: GOLD_TXT }} className="shrink-0" />
            <span className="font-bold text-[14px] text-[#1A2E28] truncate">{title}</span>
          </div>
          {actions}
        </div>
        <div className="px-5 sm:px-7 py-5 text-[15px] text-[#1A2E28] whitespace-pre-line"
          style={{ lineHeight: '32px', backgroundImage: 'repeating-linear-gradient(transparent 0 31px, rgba(184,134,58,.18) 31px 32px)', backgroundPosition: '0 20px' }}>
          {text}
        </div>
      </div>
    </figure>
  )
}

/* ─── جدول: جدولٌ على الشاشة الواسعة، وبطاقاتٌ على الجوال ─────── */
function TableBlock({ section }) {
  const { columns, rows, caption } = section
  const csv = (
    <button type="button"
      onClick={() => downloadFile(fileName(caption) + '.csv', tableToCsv(columns, rows), 'text/csv')}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold shrink-0"
      style={{ background: INK, color: '#F8F5EC' }}>
      <Download size={13} /> Excel
    </button>
  )
  return (
    <figure className="my-9 rounded-[22px] overflow-hidden" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
      <figcaption className="flex items-center justify-between gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid var(--line-warm)' }}>
        <span className="font-bold text-[14px] text-[#1A2E28]">{caption}</span>
        {csv}
      </figcaption>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[14px] text-right border-collapse">
          <thead>
            <tr style={{ background: '#F1ECDF' }}>
              {columns.map((c, j) => <th key={j} scope="col" className="px-5 py-3 font-bold text-[#1A2E28] whitespace-nowrap">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="transition-colors hover:bg-[#F8F5EC]" style={{ borderTop: '1px solid var(--line-warm)' }}>
                {row.map((cell, c) => (
                  <td key={c} className={`px-5 py-3.5 leading-relaxed align-top ${c === 0 ? 'font-bold text-[#1A2E28]' : 'text-[#2F4540]'}`}
                    dangerouslySetInnerHTML={{ __html: inline(String(cell)) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden p-3 space-y-2.5">
        {rows.map((row, r) => (
          <div key={r} className="rounded-xl p-4" style={{ background: '#F8F5EC' }}>
            <div className="font-bold text-[15px] text-[#1A2E28] mb-2" dangerouslySetInnerHTML={{ __html: inline(String(row[0])) }} />
            <dl className="space-y-1.5">
              {row.slice(1).map((cell, c) => (
                <div key={c} className="grid gap-x-3 text-[13.5px] leading-relaxed" style={{ gridTemplateColumns: 'minmax(80px, 38%) 1fr' }}>
                  <dt className="text-[#5E6E67]">{columns[c + 1]}</dt>
                  <dd className="text-[#1A2E28]" dangerouslySetInnerHTML={{ __html: inline(String(cell)) }} />
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </figure>
  )
}

/* ─── متن المقال ────────────────────────────────────────── */
function ArticleBody({ sections }) {
  let chapter = 0
  return sections.map((s, i) => {
    if (s.type === 'heading') {
      chapter += 1
      return (
        <h2 key={i} id={`h-${chapter}`} className="scroll-mt-28 flex items-baseline gap-4 mt-14 mb-5">
          <span className="shrink-0 font-bold tabular-nums" style={{ fontSize: 15, color: GOLD_TXT, fontFamily: 'cairo-latin, inherit' }}>
            {String(chapter).padStart(2, '0')}
          </span>
          <span className="font-bold text-[#1A2E28]" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.7rem)', lineHeight: 1.35 }}>{s.text}</span>
        </h2>
      )
    }
    if (s.type === 'subheading') {
      return <h3 key={i} className="font-bold text-[19px] text-[#1A2E28] mt-9 mb-3 flex items-center gap-2.5">
        <span aria-hidden className="w-1.5 h-5 rounded-full" style={{ background: GOLD }} />{s.text}
      </h3>
    }
    if (s.type === 'opening') {
      const [first, ...rest] = s.text.split('\n\n')
      return (
        <div key={i} className="mb-8">
          <p className="text-[20px] sm:text-[21px] leading-[1.9] text-[#1A2E28] font-medium mb-5">{first}</p>
          {rest.map((p, j) => <p key={j} className="text-[17px] leading-[1.95] text-[#2F4540] mb-5">{p}</p>)}
        </div>
      )
    }
    if (s.type === 'definition') {
      return (
        <aside key={i} className="relative my-9 rounded-[22px] p-6 sm:p-7 overflow-hidden"
          style={{ background: '#F1ECDF', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
          <span aria-hidden className="absolute inset-y-0 right-0 w-1.5" style={{ background: `linear-gradient(180deg, ${GOLD}, ${GREEN})` }} />
          <div className="relative flex items-center gap-2 mb-3">
            <span className="text-[12px] font-bold rounded-full px-3 py-1" style={{ background: INK, color: '#E0B562' }}>باختصار</span>
            {s.term && <span className="font-bold text-[15px]" style={{ color: GOLD_TXT }}>{s.term}</span>}
          </div>
          <p className="relative text-[18px] leading-[1.9] text-[#1A2E28]" dangerouslySetInnerHTML={{ __html: inline(s.text) }} />
        </aside>
      )
    }
    if (s.type === 'table')    return <TableBlock key={i} section={s} />
    if (s.type === 'template') return <TemplateBlock key={i} title={s.title} text={s.text} />
    if (s.type === 'faq') {
      return (
        <section key={i} className="mt-14">
          <h2 className="font-bold text-[#1A2E28] mb-5" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.7rem)' }}>أسئلة شائعة</h2>
          <div className="space-y-2.5">
            {s.items.map((it, j) => (
              <details key={j} className="group rounded-2xl px-5 py-4 open:pb-5"
                style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-[16px] text-[#1A2E28] [&::-webkit-details-marker]:hidden">
                  {it.q}
                  <span className="shrink-0 w-8 h-8 rounded-full grid place-items-center transition-transform group-open:rotate-45"
                    style={{ background: '#F1ECDF', color: INK }}><Plus size={16} /></span>
                </summary>
                <p className="text-[15.5px] leading-[1.9] text-[#2F4540] mt-3" dangerouslySetInnerHTML={{ __html: inline(it.a) }} />
              </details>
            ))}
          </div>
        </section>
      )
    }
    if (s.type === 'cta') {
      return (
        <div key={i} className="section-dark mt-14 rounded-[24px] p-7 sm:p-9 overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <p className="text-[17px] leading-[1.9] mb-6" style={{ color: 'rgba(248,245,236,.88)' }}>{s.text}</p>
          <Link to={s.to || '/ihkaam'} className="btn-cta inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-[15px]">
            {s.label || 'اكتشف إحكام'} <ArrowLeft size={16} />
          </Link>
        </div>
      )
    }
    return <div key={i}><Paragraphs text={s.text} /></div>
  })
}

/* ─── فهرس المقال مع تتبّع القسم الظاهر ─────────────────────── */
function useActiveHeading(count) {
  const [active, setActive] = useState(1)
  useEffect(() => {
    if (!count) return
    const els = Array.from({ length: count }, (_, i) => document.getElementById(`h-${i + 1}`)).filter(Boolean)
    const io = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) setActive(Number(vis[0].target.id.slice(2)))
    }, { rootMargin: '-15% 0px -70% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [count])
  return active
}

function Toc({ headings, active }) {
  return (
    <nav aria-label="في هذا المقال">
      <div className="flex items-center gap-2 mb-3 text-[13px] font-bold" style={{ color: GOLD_TXT }}>
        <ListOrdered size={15} /> في هذا المقال
      </div>
      <ol className="relative space-y-0.5" style={{ borderInlineStart: '2px solid var(--line-warm)' }}>
        {headings.map((h, i) => {
          const on = active === i + 1
          return (
            <li key={i}>
              <a href={`#h-${i + 1}`} className="relative block ps-4 py-1.5 text-[13.5px] leading-snug transition-colors"
                style={{ color: on ? INK : '#5E6E67', fontWeight: on ? 700 : 500 }}>
                {on && <motion.span layoutId="toc-bar" className="absolute top-0 bottom-0 w-[2px]" style={{ insetInlineStart: -2, background: GOLD }} />}
                {h}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ─── المقال ────────────────────────────────────────────── */
export default function BlogArticle() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const post      = getPost(slug)
  const cat       = post ? getCategoryById(post.category) : null

  useEffect(() => { if (!post) navigate('/blog', { replace: true }) }, [post, navigate])

  const headings = useMemo(() => post ? post.sections.filter(s => s.type === 'heading').map(s => s.text) : [], [post])
  const active   = useActiveHeading(headings.length)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 })

  if (!post) return null

  const seo      = blogSeo(post)
  const related  = getRelatedPosts(post)
  const visual   = BLOG_VISUALS[post.slug]
  const feature  = post.relatedFeature && FEATURE_SEO[post.relatedFeature]
  const updated  = post.updatedAt && post.updatedAt !== post.date ? post.updatedAt : null

  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>
      <PageMeta
        title={seo.title} description={seo.description} image={seo.image} type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              headline: post.title,
              description: seo.description,
              image: SITE.origin + BLOG_COVER(post.slug),
              datePublished: post.date,
              dateModified: post.updatedAt || post.date,
              inLanguage: 'ar',
              mainEntityOfPage: SITE.origin + '/blog/' + post.slug,
              author: { '@id': SITE.origin + '/#organization' },
              publisher: { '@id': SITE.origin + '/#organization' },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE.origin + '/' },
                { '@type': 'ListItem', position: 2, name: 'المدونة', item: SITE.origin + '/blog' },
                { '@type': 'ListItem', position: 3, name: post.title },
              ],
            },
          ],
        }}
      />

      {/* شريط تقدّم القراءة */}
      <motion.div aria-hidden className="fixed top-0 inset-x-0 h-[3px] z-[60] origin-right"
        style={{ scaleX: progress, background: `linear-gradient(270deg, ${GOLD}, #E0B562)` }} />

      {/* ─── الرأس ─── */}
      <header className="relative pt-28 sm:pt-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Crumbs size="text-[12px]" items={[{ to: '/', label: 'الرئيسية' }, { to: '/blog', label: 'المدونة' }, ...(cat ? [{ label: cat.label }] : [])]} />
          <div className="max-w-4xl page-enter">
            {cat && <span className="eyebrow mb-5">{cat.label}</span>}
            <h1 className="font-bold text-[#1A2E28] mt-5 mb-5" style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3.1rem)', lineHeight: 1.25 }}>
              {post.title}
            </h1>
            <p className="text-[17px] sm:text-[19px] leading-[1.85] text-[#4A5D56] max-w-3xl">{post.excerpt}</p>
            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-[13px] text-[#5E6E67] mt-6">
              <span className="flex items-center gap-2">
                <img src="/ihkaam-logo-light-sm.png" alt="" className="w-6 h-6 object-contain" />
                {post.author}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#0B3B33]/25" />
              <span>{formatDate(post.date)}</span>
              {updated && <><span className="w-1 h-1 rounded-full bg-[#0B3B33]/25" /><span>حُدّث في {formatDate(updated)}</span></>}
              <span className="w-1 h-1 rounded-full bg-[#0B3B33]/25" />
              <span className="flex items-center gap-1"><Clock size={13} /> قراءة {readTimeLabel(post.readTime)}</span>
            </div>
          </div>
        </div>

        {/* الغلاف، ورسم «الفكرة في لمحة» يتراكب على حافته */}
        <div className="max-w-6xl mx-auto mt-10">
          <div className="relative rounded-[28px] overflow-hidden aspect-[16/9] sm:aspect-[21/9] hero-lift" style={{ boxShadow: 'var(--shadow-lg)', background: '#E9E3D5' }}>
            <img src={BLOG_COVER(post.slug)} alt="" fetchPriority="high" decoding="async" width="1280" height="720" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(248,245,236,.55), transparent 35%)' }} />
          </div>
          {visual && (
            <div className="relative -mt-16 sm:-mt-24 mx-2 sm:mx-10 lg:mx-24 z-10">
              <GlanceVisual visual={visual} />
            </div>
          )}
        </div>
      </header>

      {/* ─── المتن ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-10 lg:gap-16">
          <main className="min-w-0 max-w-[720px]">
            {headings.length > 2 && (
              <details className="lg:hidden mb-8 rounded-2xl px-5 py-4" style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                <summary className="cursor-pointer font-bold text-[14px] flex items-center gap-2" style={{ color: INK }}>
                  <ListOrdered size={16} /> في هذا المقال ({headings.length} أقسام)
                </summary>
                <ol className="mt-3 space-y-2">
                  {headings.map((h, i) => (
                    <li key={i}><a href={`#h-${i + 1}`} className="flex gap-3 text-[14px] text-[#2F4540]">
                      <span className="tabular-nums font-bold" style={{ color: GOLD_TXT }}>{String(i + 1).padStart(2, '0')}</span>{h}
                    </a></li>
                  ))}
                </ol>
              </details>
            )}

            <ArticleBody sections={post.sections} />

            {/* أداة مجانية تطبّق المقال (src/config/tools.js: posts) */}
            {toolsForPost(post.slug).map(t => (
              <Link key={t.slug} to={t.path} className="group mt-10 flex items-center gap-4 rounded-[22px] p-5 sm:p-6 transition-transform hover:-translate-y-0.5"
                style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1.5px rgba(184,134,58,.45)' }}>
                <ToolGlyph slug={t.slug} size="lg" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[12px] font-bold" style={{ color: GOLD_TXT }}>أداة مجانية من إحكام</span>
                  <span className="block font-black text-[17px] text-[#1A2E28] group-hover:text-[#1F6F52] transition-colors">{t.name}</span>
                  <span className="block text-[13.5px] leading-[1.8] text-[#4A5D56] mt-0.5">{t.short}</span>
                </span>
                <ArrowLeft size={18} color={GOLD} className="shrink-0" />
              </Link>
            ))}

            {post.sources?.length > 0 && (
              <div className="mt-14 pt-6" style={{ borderTop: '1px solid var(--line-warm)' }}>
                <h2 className="font-bold text-[14px] text-[#5E6E67] mb-3">المصادر</h2>
                <ol className="space-y-2 list-decimal pr-5 text-[13px] text-[#4A5D56]">
                  {post.sources.map((s, i) => (
                    <li key={i}>
                      {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{s.title}</a> : s.title}
                      {s.publisher ? ` — ${s.publisher}` : ''}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </main>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {headings.length > 0 && <Toc headings={headings} active={active} />}
              <div className="section-dark rounded-[20px] p-5 overflow-hidden">
                <div className="pattern-layer pattern-khatam" aria-hidden />
                <div className="text-[15px] font-bold mb-2" style={{ color: '#F8F5EC' }}>طبّق هذا في معهدك</div>
                <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'rgba(248,245,236,.75)' }}>
                  إحكام يحفظ التسميع والحضور والرسوم في سجل واحد.
                </p>
                {feature && (
                  <Link to={featureHref(post.relatedFeature)} className="block text-[13px] font-bold mb-3 underline underline-offset-4" style={{ color: '#E0B562' }}>
                    {feature.title}
                  </Link>
                )}
                <Link to="/ihkaam" className="btn-cta flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold">
                  اكتشف إحكام <ArrowLeft size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ─── اقرأ بعده ─── */}
      {related.length > 0 && (
        <section className="px-4 sm:px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-bold text-[#1A2E28] mb-6" style={{ fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)' }}>
              اقرأ <span className="title-mark">بعده</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map((p, i) => (
                <motion.div key={p.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, ease, delay: i * 0.08 }}>
                  <Link to={`/blog/${p.slug}`} className="group block rounded-[20px] overflow-hidden h-full transition-transform hover:-translate-y-1"
                    style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                    <div className="aspect-[16/9] overflow-hidden" style={{ background: '#E9E3D5' }}>
                      <img src={BLOG_COVER(p.slug, 'sm')} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <div className="text-[11px] font-bold mb-1.5" style={{ color: GOLD_TXT }}>{getCategoryById(p.category)?.label}</div>
                      <div className="font-bold text-[15px] leading-snug text-[#1A2E28] group-hover:text-[#1F6F52] transition-colors">{p.title}</div>
                      <div className="flex items-center gap-1 text-[12px] text-[#5E6E67] mt-3"><Clock size={12} /> {readTimeLabel(p.readTime)}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── اشتراك ─── */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="max-w-6xl mx-auto rounded-[24px] p-6 sm:p-8 grid md:grid-cols-[1fr_1.1fr] gap-5 items-center"
          style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
          <div>
            <div className="font-bold text-[18px] text-[#1A2E28]">لا يفوتك المقال القادم</div>
            <p className="text-[14px] text-[#4A5D56] mt-1">مقالات عملية لمديري معاهد التحفيظ، تصلك على بريدك. بلا إعلانات.</p>
          </div>
          <BlogSubscribe />
        </div>
      </section>
    </div>
  )
}
