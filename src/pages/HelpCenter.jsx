import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ChevronLeft } from 'lucide-react'
import { CATEGORIES, getAllArticles } from '../data/helpContent'
import PageMeta from '../components/layout/PageMeta'
import { HELP_INDEX_SEO } from '../config/seo'

/* ─── animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden : { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
}

/* ─── Category card ──────────────────────────────────────── */
function CategoryCard({ cat, articleCount }) {
  const Icon = cat.icon
  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/help/category/${cat.id}`}
        className="group block rounded-2xl border border-[#0B3B33]/8 p-6 h-full"
        style={{ background: 'rgba(11, 59, 51, 0.03)', transition: 'border-color 0.25s, background 0.25s' }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = cat.color + '50'
          e.currentTarget.style.background   = cat.color + '08'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(11, 59, 51, 0.08)'
          e.currentTarget.style.background   = 'rgba(11, 59, 51, 0.03)'
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: cat.color + '18' }}
        >
          <Icon size={22} style={{ color: cat.color }} />
        </div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[#1A2E28] font-bold text-base">{cat.label}</h2>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: cat.color + '22', color: cat.color }}
          >
            {articleCount} مقالة
          </span>
        </div>
        <p className="text-[#1A2E28]/70 text-sm leading-relaxed">{cat.description}</p>
        <div className="mt-4 flex items-center gap-1.5" style={{ color: cat.color, opacity: 0.7 }}>
          <span className="text-xs font-semibold">استعرض المقالات</span>
          <ChevronLeft size={14} />
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Article row in search results ─────────────────────── */
function ArticleRow({ article, cat }) {
  const Icon = cat?.icon
  return (
    <Link
      to={`/help/${article.slug}`}
      className="flex items-center gap-4 p-4 rounded-xl border border-[#0B3B33]/6 hover:border-[#0B3B33]/15 hover:bg-[#0B3B33]/4 transition-all"
    >
      {Icon && (
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: (cat?.color || '#1F6F52') + '20' }}
        >
          <Icon size={16} style={{ color: cat?.color || '#1F6F52' }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[#1A2E28] font-semibold text-sm truncate">{article.title}</p>
        <p className="text-[#1A2E28]/70 text-xs truncate mt-0.5">{article.description}</p>
      </div>
      <ChevronLeft size={16} className="text-[#1A2E28]/60 flex-shrink-0" />
    </Link>
  )
}

/* ─── Main page ──────────────────────────────────────────── */
export default function HelpCenter() {
  const [query, setQuery] = useState('')

  const allArticles = useMemo(() => getAllArticles(), [])

  const catMap = useMemo(() => {
    const m = {}
    CATEGORIES.forEach(c => c.articles.forEach(s => { m[s] = c }))
    return m
  }, [])

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allArticles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.steps?.some(s => s.title.toLowerCase().includes(q))
    )
  }, [query, allArticles])

  const isSearching = query.trim().length > 0

  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>
      <PageMeta
        title={HELP_INDEX_SEO.title}
        description={HELP_INDEX_SEO.description}
      />

      {/* ─── Hero ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-28 pb-16 px-6"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(31, 111, 82, 0.072) 0%, transparent 70%)',
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(31, 111, 82, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(31, 111, 82, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[#1F6F52] text-sm font-bold tracking-widest uppercase mb-3">
              مركز التعلم
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-[#1A2E28] text-4xl md:text-5xl font-black mb-4" style={{ lineHeight: 1.2 }}>
              تعلّم إدارة معهدك بإتقان
            </motion.h1>
            <motion.p variants={fadeUp} className="text-[#1A2E28]/70 text-lg mb-8">
              دليل تفصيلي لكل ميزة في إحكام — وأفضل ممارسات إدارة مراكز التحفيظ خطوةً بخطوة
            </motion.p>

            {/* Search */}
            <motion.div variants={fadeUp} className="relative max-w-xl mx-auto">
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A2E28]/60"
              />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="ابحث عن ميزة أو سؤال... (مثال: تسجيل الحضور)"
                className="w-full bg-[#0B3B33]/8 border border-[#0B3B33]/12 rounded-2xl px-5 py-4 pr-12
                           text-[#1A2E28] placeholder-[#1A2E28]/35 text-sm outline-none
                           focus:border-[#1F6F52]/50 focus:bg-[#0B3B33]/10 transition-all"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Search results ───────────────────────────── */}
      {isSearching && (
        <section className="max-w-3xl mx-auto px-6 pb-10">
          {searchResults.length > 0 ? (
            <>
              <p className="text-[#1A2E28]/60 text-sm mb-4">
                {searchResults.length} نتيجة لـ "<span className="text-[#1A2E28]/70">{query}</span>"
              </p>
              <div className="flex flex-col gap-2">
                {searchResults.map(a => (
                  <ArticleRow key={a.slug} article={a} cat={catMap[a.slug]} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#1A2E28]/60 text-base">لم نجد نتائج لـ "<span className="text-[#1A2E28]/70">{query}</span>"</p>
              <p className="text-[#1A2E28]/60 text-sm mt-2">جرّب كلمات مختلفة أو تواصل معنا مباشرةً</p>
            </div>
          )}
        </section>
      )}

      {/* ─── Category overview cards (hidden during search) ─ */}
      {!isSearching && (
        <>
          <section className="max-w-6xl mx-auto px-6 pb-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {CATEGORIES.map(cat => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  articleCount={cat.articles.length}
                />
              ))}
            </motion.div>
          </section>

        </>
      )}

      {/* ─── CTA ──────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-20 pt-4">
        <div
          className="rounded-2xl border border-[#0B3B33]/10 p-10 text-center"
          style={{ background: 'rgba(11, 59, 51, 0.03)' }}
        >
          <h2 className="text-[#1A2E28] font-black text-2xl md:text-3xl mb-3" style={{ lineHeight: 1.35 }}>
            هل لديك مدرسة قرآنية وتريد تطويرها رقمياً ؟
          </h2>
          <p className="mb-7 text-sm" style={{ color: '#1F6F52' }}>
          نظام إحكام لإدارة جمعيات ومعاهد تحفيظ القرآن الكريم
          </p>
          <Link
            to="/ihkaam"
            className="inline-flex items-center px-7 py-3 rounded-xl font-bold text-sm"
            style={{ background: '#1F6F52', color: '#F8F5EC' }}
          >
           اكتشف نظام إحكام
          
          </Link>
          <p className="mt-6 text-sm" style={{ color: '#4A5D56' }}>
            تفضّل مقالات أطول عن إدارة الحلقات؟{' '}
            <Link to="/blog" className="font-bold underline underline-offset-4" style={{ color: '#1F6F52' }}>تصفّح مدونة إحكام</Link>
          </p>
        </div>
      </section>

    </div>
  )
}
