import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, ChevronLeft, ArrowLeft, BookOpen, Zap, Bell, Loader2, CheckCircle } from 'lucide-react'
import { getPost, getCategoryById, BLOG_POSTS } from '../data/blogContent'
import PageMeta from '../components/PageMeta'
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
        نشرة أسبوعية — مقالات عملية لمديري مراكز التحفيظ. بدون إعلانات.
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
  const related  = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 3)

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
                  <span className="text-white/25 text-[10px]">{p.readTime} دقائق</span>
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

        if (section.type === 'cta') {
          return (
            <div
              key={i}
              className="mt-12 rounded-2xl p-6 text-center"
              style={{ background: catColor + '10', border: `1px solid ${catColor}30` }}
            >
              <p className="text-white/70 text-sm mb-4 leading-relaxed">{section.text}</p>
              <Link
                to="/ihkaam"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: catColor, color: '#020F0E' }}
              >
                اكتشف إحكام
                <ArrowLeft size={14} />
              </Link>
            </div>
          )
        }

        /* Default paragraph */
        const paras = section.text.split('\n\n')
        return (
          <div key={i}>
            {paras.map((para, j) => {
              const lines = para.split('\n')
              return (
                <div key={j} className="mb-4">
                  {lines.map((line, k) => {
                    if (!line.trim()) return null
                    return (
                      <p
                        key={k}
                        className="text-white/68 text-base leading-relaxed mb-2"
                        dangerouslySetInnerHTML={{
                          __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                        }}
                      />
                    )
                  })}
                </div>
              )
            })}
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

  return (
    <div dir="rtl" style={{ background: '#020F0E', minHeight: '100vh' }}>
      <PageMeta
        title={post.title}
        description={post.excerpt}
        keywords={`إدارة مراكز التحفيظ, مدرسة قرآنية, ${getCategoryById(post.category)?.label || ''}, إحكام`}
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

          <div className="flex items-center gap-4 text-white/30 text-xs">
            <span>{formatDate(post.date)}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {post.readTime} دقائق قراءة
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
