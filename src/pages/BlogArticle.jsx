import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, ChevronLeft, ArrowLeft, BookOpen, Zap, Bell, Loader2, CheckCircle, Download } from 'lucide-react'
import { getPost, getCategoryById, getRelatedPosts, readTimeLabel, featureHref } from '../data/blogContent'
import { FEATURE_SEO } from '../config/seo'
import PageMeta from '../components/layout/PageMeta'
import { SITE, blogSeo } from '../config/seo'
import { supabase } from '../config/supabaseClient'
import { useFormGuard } from '../hooks/useFormGuard'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

/* ─── Sidebar email capture ──────────────────────────────── */
function SidebarEmailCapture({ catColor }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [focused, setFocused] = useState(false)

  const { honeypotProps, guardSubmit, markSubmitted } = useFormGuard('blog-subscribe')

  async function submit(e) {
    e.preventDefault()
    if (!email.trim()) return

    const gate = guardSubmit()
    if (!gate.ok) {
      setDone(true)   /* bot trap or cooldown — show success, write nothing */
      return
    }

    setLoading(true)
    try {
      const p = new URLSearchParams(window.location.search)
      await supabase.from('lead_magnet_subscribers').insert([{
        email      : email.trim().toLowerCase(),
        source_page: '/blog',
        variant    : 'blog',
        utm_source  : p.get('utm_source')   || null,
        utm_medium  : p.get('utm_medium')   || null,
        utm_campaign: p.get('utm_campaign') || null,
        referrer    : document.referrer     || null,
      }])
      markSubmitted()
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl p-5 border border-white/7 flex flex-col items-center gap-3 text-center"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <CheckCircle size={22} style={{ color: catColor }} />
        <p className="text-white/70 text-xs leading-relaxed">تم! ستصلك المقالات القادمة مباشرة.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-5 border border-white/7" style={{ background: 'rgba(255,255,255,0.025)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Bell size={13} style={{ color: catColor }} />
        <h3 className="text-white font-bold text-sm">لا تفوّتك المقالات القادمة</h3>
      </div>
      <p className="text-white/45 text-xs leading-relaxed mb-4">
        تصلك المقالات الجديدة على بريدك — مقالات عملية لمديري معاهد التحفيظ. بدون إعلانات.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-2">
        {/* Bot trap — invisible to humans */}
        <input {...honeypotProps} />
        <input
          type="email" required
          value={email}
          onChange={e => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="بريدك الإلكتروني..."
          style={{
            background  : 'rgba(255,255,255,0.04)',
            border      : focused ? `1px solid ${catColor}60` : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            color       : '#EAE4DF',
            fontSize    : '0.8rem',
            padding     : '0.65rem 0.875rem',
            outline     : 'none',
            direction   : 'ltr',
            textAlign   : 'right',
            fontFamily  : 'inherit',
            width       : '100%',
            transition  : 'border-color 250ms',
          }}
        />
        <button
          type="submit" disabled={loading}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-bold text-xs disabled:opacity-60"
          style={{ background: catColor, color: '#020F0E', cursor: 'pointer' }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Bell size={12} />}
          {loading ? 'جارٍ...' : 'اشترك مجاناً'}
        </button>
      </form>
    </div>
  )
}

/* ─── Sidebar ────────────────────────────────────────────── */
function Sidebar({ post }) {
  const catColor = post.coverColor
  const related  = getRelatedPosts(post)

  return (
    <aside className="space-y-5">

      {/* CTA card */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: catColor + '0c', borderColor: catColor + '30' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
          style={{ background: catColor + '20' }}
        >
          <Zap size={16} style={{ color: catColor }} />
        </div>
        <h3 className="text-white font-bold text-sm mb-2 leading-snug">
          هل تريد تطبيق هذا في مركزك؟
        </h3>
        <p className="text-white/50 text-xs leading-relaxed mb-4">
          إحكام تجمع كل ما يحتاجه مدير المركز في مكان واحد — تسميع، حضور، ماليات، وتقارير.
        </p>
        {post.relatedFeature && FEATURE_SEO[post.relatedFeature] && (
          <Link
            to={featureHref(post.relatedFeature)}
            className="block text-xs font-bold leading-relaxed mb-3 underline underline-offset-4"
            style={{ color: catColor }}
          >
            الميزة المرتبطة: {FEATURE_SEO[post.relatedFeature].title}
          </Link>
        )}
        <Link
          to="/ihkaam"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs"
          style={{ background: catColor, color: '#020F0E' }}
        >
          اكتشف إحكام
          <ArrowLeft size={13} />
        </Link>
      </div>

      {/* More articles */}
      <div
        className="rounded-2xl p-5 border border-white/7"
        style={{ background: 'rgba(255,255,255,0.025)' }}
      >
        <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <BookOpen size={12} />
          مقالات أخرى
        </h3>
        <div className="space-y-4">
          {related.map(p => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group flex gap-3 items-start"
            >
              <div
                className="w-1 rounded-full flex-shrink-0 mt-1"
                style={{ background: p.coverColor + '70', minHeight: '36px' }}
              />
              <div>
                <p className="text-white/65 text-xs leading-snug font-semibold group-hover:text-white transition-colors line-clamp-2">
                  {p.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock size={10} className="text-white/25" />
                  <span className="text-white/25 text-[10px]">{readTimeLabel(p.readTime)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Email capture */}
      <SidebarEmailCapture catColor={catColor} />

      {/* Back to blog */}
      <Link
        to="/blog"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
      >
        <ArrowRight size={13} />
        جميع المقالات
      </Link>
    </aside>
  )
}

/* ─── Inline formatting: **عريض** و [نص](/مسار) ─────────────── */
function inline(line) {
  return line
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g, (_, label, href) =>
      href.startsWith('/')
        ? `<a href="${href}" class="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white">${label}</a>`
        : `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white">${label}</a>`)
}

function TextLine({ line }) {
  const bullet = /^[-•]\s+/.test(line)
  const html   = inline(bullet ? line.replace(/^[-•]\s+/, '') : line)
  return bullet ? (
    <p className="text-white/68 text-base leading-relaxed mb-2 flex gap-2">
      <span className="text-white/30 flex-shrink-0">•</span>
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </p>
  ) : (
    <p className="text-white/68 text-base leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: html }} />
  )
}

/* تنزيل نموذجٍ كملفّ على جهاز الزائر (يُنشأ في المتصفح، بلا خادم).
   BOM في أوله حتى يقرأ Excel والمفكرة العربية صحيحةً. */
function downloadFile(name, content, type) {
  const blob = new Blob(['﻿' + content], { type: type + ';charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const fileName = (t) => String(t || 'نموذج').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 60) || 'نموذج'
const plainCell = (c) => String(c).replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
function tableToCsv(columns, rows) {
  const esc = (v) => '"' + plainCell(v).replace(/"/g, '""') + '"'
  return [columns, ...rows].map(r => r.map(esc).join(',')).join('\r\n')
}

/* نموذج جاهز: صندوق يُنسخ نصه بضغطة أو يُنزَّل ملفاً */
function TemplateBlock({ title, text, catColor }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }
  return (
    <div className="my-8 rounded-2xl border" style={{ borderColor: catColor + '30', background: 'rgba(255,255,255,0.025)' }}>
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b" style={{ borderColor: catColor + '20' }}>
        <span className="text-white font-bold text-sm">{title}</span>
        <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: catColor, cursor: 'pointer' }}
        >
          {copied ? <CheckCircle size={13} /> : <BookOpen size={13} />}
          {copied ? 'نُسخ' : 'انسخ النموذج'}
        </button>
        <button
          type="button"
          onClick={() => downloadFile(fileName(title) + '.txt', text, 'text/plain')}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: catColor, cursor: 'pointer' }}
        >
          <Download size={13} />
          تنزيل
        </button>
        </div>
      </div>
      <div className="px-5 py-4 text-white/75 text-sm leading-loose whitespace-pre-line">{text}</div>
    </div>
  )
}

/* ─── Sources ────────────────────────────────────────────── */
function ArticleSources({ sources, title }) {
  if (!sources?.length) return null
  return (
    <div className="mt-12 pt-6 border-t border-white/8">
      <h2 className="text-white/60 font-bold text-sm mb-3">مصادر مقال «{title}»</h2>
      <ol className="space-y-2 list-decimal pr-5">
        {sources.map((s, i) => (
          <li key={i} className="text-white/45 text-xs leading-relaxed">
            {s.url
              ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-white/20 hover:text-white/70">{s.title}</a>
              : s.title}
            {s.publisher ? ` — ${s.publisher}` : ''}
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ─── Article body ───────────────────────────────────────── */
function ArticleBody({ sections, catColor }) {
  return (
    <div>
      {sections.map((section, i) => {
        /* First section sits right under the hero — no extra top margin */
        const isFirst = i === 0

        if (section.type === 'heading') {
          return (
            <h2
              key={i}
              className={`text-white font-black text-xl mb-4 flex items-center gap-3 ${isFirst ? '' : 'mt-10'}`}
            >
              <span
                className="w-1 h-5 rounded-full flex-shrink-0"
                style={{ background: catColor }}
              />
              {section.text}
            </h2>
          )
        }

        if (section.type === 'opening') {
          return (
            <div
              key={i}
              className={`mb-8 rounded-2xl p-6 border-r-4 ${isFirst ? '' : 'mt-6'}`}
              style={{
                background      : catColor + '0c',
                borderRightColor: catColor + '60',
              }}
            >
              {section.text.split('\n\n').map((para, j) => (
                <p key={j} className="text-white/80 text-base leading-relaxed mb-3 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          )
        }

        if (section.type === 'subheading') {
          return (
            <h3 key={i} className="text-white font-bold text-lg mt-8 mb-3">{section.text}</h3>
          )
        }

        /* فقرة الإجابة المباشرة: تعريفٌ قابل للاقتباس في أعلى المقال */
        if (section.type === 'definition') {
          return (
            <div
              key={i}
              className={`mb-8 rounded-2xl p-6 border ${isFirst ? '' : 'mt-6'}`}
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: catColor + '30' }}
            >
              {section.term && (
                <p className="text-xs font-bold mb-2" style={{ color: catColor }}>{section.term}</p>
              )}
              <p
                className="text-white/85 text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: inline(section.text) }}
              />
            </div>
          )
        }

        if (section.type === 'table') {
          return (
            <figure key={i} className="my-8 overflow-x-auto rounded-2xl border border-white/8">
              <table className="w-full text-sm text-right border-collapse min-w-[480px]">
                <thead>
                  <tr style={{ background: catColor + '14' }}>
                    {section.columns.map((c, j) => (
                      <th key={j} scope="col" className="px-4 py-3 text-white font-bold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, r) => (
                    <tr key={r} className="border-t border-white/6">
                      {row.map((cell, c) => (
                        <td
                          key={c}
                          className="px-4 py-3 text-white/70 leading-relaxed align-top"
                          dangerouslySetInnerHTML={{ __html: inline(String(cell)) }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <figcaption className="flex items-center justify-between gap-3 px-4 py-2 text-white/40 text-xs border-t border-white/6">
                <span>{section.caption}</span>
                <button
                  type="button"
                  onClick={() => downloadFile(fileName(section.caption) + '.csv', tableToCsv(section.columns, section.rows), 'text/csv')}
                  className="flex items-center gap-1.5 font-semibold shrink-0"
                  style={{ color: catColor, cursor: 'pointer' }}
                >
                  <Download size={13} />
                  تنزيل Excel (CSV)
                </button>
              </figcaption>
            </figure>
          )
        }

        if (section.type === 'template') {
          return <TemplateBlock key={i} title={section.title} text={section.text} catColor={catColor} />
        }

        if (section.type === 'faq') {
          return (
            <div key={i} className="my-8 space-y-3">
              {section.items.map((it, j) => (
                <details key={j} className="rounded-xl border border-white/8 px-5 py-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <summary className="text-white font-bold text-sm cursor-pointer">{it.q}</summary>
                  <p
                    className="text-white/65 text-sm leading-relaxed mt-3"
                    dangerouslySetInnerHTML={{ __html: inline(it.a) }}
                  />
                </details>
              ))}
            </div>
          )
        }

        if (section.type === 'cta') {
          return (
            <div
              key={i}
              className="mt-12 rounded-2xl p-6 text-center"
              style={{ background: catColor + '10', border: `1px solid ${catColor}30` }}
            >
              <p className="text-white/70 text-sm mb-4 leading-relaxed">{section.text}</p>
              <Link
                to={section.to || '/ihkaam'}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: catColor, color: '#020F0E' }}
              >
                {section.label || 'اكتشف إحكام'}
                <ArrowLeft size={14} />
              </Link>
            </div>
          )
        }

        /* Default paragraph */
        const paras = section.text.split('\n\n')
        return (
          <div key={i}>
            {paras.map((para, j) => (
              <div key={j} className="mb-4">
                {para.split('\n').map((line, k) => (line.trim() ? <TextLine key={k} line={line} /> : null))}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────── */
export default function BlogArticle() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const post      = getPost(slug)
  const cat       = post ? getCategoryById(post.category) : null

  useEffect(() => {
    if (!post) navigate('/blog', { replace: true })
  }, [post, navigate])

  if (!post) return null

  const catColor = post.coverColor
  const seo = blogSeo(post)

  return (
    <div dir="rtl" style={{ background: '#020F0E', minHeight: '100vh' }}>
      <PageMeta
        title={seo.title}
        description={seo.description}
        image={seo.image}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              headline: post.title,
              description: seo.description,
              datePublished: post.date,
              dateModified: post.updated || post.date,
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

      {/* ─── Hero ───────────────────────────────────── */}
      <div
        className="relative pt-28 pb-8 md:pb-14 px-6 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -5%, ${catColor}14 0%, transparent 65%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(${catColor}04 1px, transparent 1px),
              linear-gradient(90deg, ${catColor}04 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="absolute top-0 inset-x-0 h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${catColor}, transparent)` }}
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/30 mb-6 flex-wrap">
            <Link to="/" className="hover:text-white/60 transition-colors">الرئيسية</Link>
            <ChevronLeft size={11} />
            <Link to="/blog" className="hover:text-white/60 transition-colors">المدونة</Link>
            <ChevronLeft size={11} />
            <span className="text-white/50">{post.title}</span>
          </nav>

          {cat && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-5"
              style={{ background: cat.color + '20', color: cat.color }}
            >
              {cat.label}
            </div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-white text-3xl md:text-4xl lg:text-5xl font-black mb-4 max-w-4xl"
            style={{ lineHeight: 1.2 }}
          >
            {post.title}
          </motion.h1>

          <p className="text-white/55 text-base md:text-lg leading-relaxed mb-6 max-w-2xl">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-white/30 text-xs">
            <span>{post.author}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{formatDate(post.date)}</span>
            {post.updated && post.updated !== post.date && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>حُدّث في {formatDate(post.updated)}</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1">
              <Clock size={12} />
              قراءة {readTimeLabel(post.readTime)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Two-column body ────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-28">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* Main article */}
          <main className="flex-1 min-w-0 pt-4 lg:pt-8">
            <ArticleBody sections={post.sections} catColor={catColor} />
            <ArticleSources sources={post.sources} title={post.title} />
          </main>

          {/* Sticky sidebar */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24 pt-8">
              <Sidebar post={post} />
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
