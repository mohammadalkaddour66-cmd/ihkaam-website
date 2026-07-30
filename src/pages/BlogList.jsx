import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ArrowLeft, BookOpen, ChevronDown, Check } from 'lucide-react'
import { BLOG_POSTS, BLOG_CATEGORIES, getCategoryById } from '../data/blogContent'
import PageMeta from '../components/PageMeta'

const fadeUp = {
  hidden : { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 },
  }),
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function PostCard({ post, index }) {
  const cat = getCategoryById(post.category)
  return (
    <motion.article
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group flex flex-col h-full rounded-2xl border border-white/8 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', transition: 'border-color 0.25s, background 0.25s' }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = post.coverColor + '50'
          e.currentTarget.style.background   = 'rgba(255,255,255,0.055)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.background   = 'rgba(255,255,255,0.03)'
        }}
      >
        {/* Cover strip */}
        <div
          className="h-2 w-full flex-shrink-0"
          style={{ background: `linear-gradient(90deg, ${post.coverColor}, ${post.coverColor}80)` }}
        />

        <div className="flex flex-col flex-1 p-6">
          {/* Category + read time */}
          <div className="flex items-center justify-between mb-4">
            {cat && (
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: cat.color + '20', color: cat.color }}
              >
                {cat.label}
              </span>
            )}
            <span className="flex items-center gap-1 text-white/30 text-xs">
              <Clock size={11} />
              {post.readTime} دقائق
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white font-black text-lg leading-snug mb-3 group-hover:text-[#48D6CD] transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-white/50 text-sm leading-relaxed flex-1 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-white/25 text-xs">{formatDate(post.date)}</span>
            <span
              className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: post.coverColor }}
            >
              اقرأ المقالة
              <ArrowLeft size={13} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

function CategoryFilter({ active, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKeyDown     = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const options = [
    { id: 'all', label: 'كل التصنيفات', color: '#48D6CD', count: BLOG_POSTS.length },
    ...BLOG_CATEGORIES
      .map(cat => ({ ...cat, count: BLOG_POSTS.filter(p => p.category === cat.id).length }))
      .filter(cat => cat.count > 0),
  ]
  const current = options.find(o => o.id === active) ?? options[0]

  return (
    <div ref={ref} className="relative w-full max-w-xs mx-auto" style={{ zIndex: 30 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors"
        style={{
          background  : open ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.035)',
          borderColor : open ? current.color + '55' : 'rgba(255,255,255,0.10)',
        }}
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: current.color }} />
        <span className="text-white text-sm font-bold flex-1 text-right">{current.label}</span>
        <span className="text-white/30 text-xs tabular-nums">{current.count}</span>
        <ChevronDown
          size={15}
          className="text-white/40 flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full inset-x-0 mt-2 p-1.5 rounded-2xl border overflow-hidden"
            style={{
              background     : 'rgba(4,26,25,0.92)',
              borderColor    : 'rgba(255,255,255,0.10)',
              backdropFilter : 'blur(14px)',
              boxShadow      : '0 18px 40px -12px rgba(0,0,0,0.7)',
            }}
          >
            {options.map(opt => {
              const isActive = opt.id === active
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => { onChange(opt.id); setOpen(false) }}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-right transition-colors"
                  style={{ background: isActive ? opt.color + '18' : 'transparent' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                  <span
                    className="text-xs font-semibold flex-1"
                    style={{ color: isActive ? opt.color : 'rgba(255,255,255,0.6)' }}
                  >
                    {opt.label}
                  </span>
                  <span className="text-white/25 text-[11px] tabular-nums">{opt.count}</span>
                  {isActive
                    ? <Check size={13} style={{ color: opt.color }} className="flex-shrink-0" />
                    : <span className="w-[13px] flex-shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function BlogList() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === activeCategory)

  return (
    <div dir="rtl" style={{ background: '#020F0E', minHeight: '100vh' }}>
      <PageMeta
        title="مدونة إحكام — رؤى لمدير المركز القرآني"
        description="مقالات معمّقة حول إدارة مراكز تحفيظ القرآن: استبقاء الطلاب، الشؤون المالية، إدارة الكادر، والنمو المستدام."
        keywords="مدونة إدارة مراكز التحفيظ, مقالات مدرسة قرآنية, نصائح مدير حلقة القرآن, إدارة معهد قرآني"
      />

      {/* ─── Hero ─────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-16 px-6 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(72,214,205,0.12) 0%, transparent 70%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(72,214,205,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(72,214,205,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-5"
              style={{ background: 'rgba(72,214,205,0.12)', color: '#48D6CD', border: '1px solid rgba(72,214,205,0.25)' }}
            >
              <BookOpen size={13} />
              مدونة إحكام
            </div>
            <h1 className="text-white text-4xl md:text-5xl font-black mb-4" style={{ lineHeight: 1.2 }}>
              رؤى لمدير المركز القرآني
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              مقالات معمّقة حول أكثر التحديات التي يواجهها مديرو مراكز التحفيظ — وكيف يتجاوزونها.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Category filter ─────────────────────────── */}
      <div className="relative max-w-6xl mx-auto px-6 mb-8" style={{ zIndex: 30 }}>
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* ─── Posts grid ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </div>
      </section>

    </div>
  )
}
