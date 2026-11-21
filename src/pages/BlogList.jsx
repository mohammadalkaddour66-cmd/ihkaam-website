import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ArrowLeft, FileText, Table2, BookOpen } from 'lucide-react'
import { BLOG_POSTS, BLOG_CATEGORIES, getCategoryById, readTimeLabel } from '../data/blogContent'
import { BLOG_COVER, BLOG_HERO_IMAGE } from '../data/blogVisuals'
import PageMeta from '../components/layout/PageMeta'
import BlogSubscribe from '../components/blog/BlogSubscribe'
import { BLOG_INDEX_SEO } from '../config/seo'

const ease = [0.22, 1, 0.36, 1]
const INK = '#0B3B33', GOLD_TXT = '#8A6425'

const countOf = (post, type) => post.sections.filter(s => s.type === type).length
const lastTouched = (p) => p.updatedAt || p.date


/* شارات ما في المقال من أدوات جاهزة: يراها المدير قبل أن يقرأ العنوان */
function ToolBadges({ post, onDark = false }) {
  const tpl = countOf(post, 'template'), tbl = countOf(post, 'table')
  const style = onDark
    ? { background: 'rgba(255,255,255,.08)', color: '#F8F5EC' }
    : { background: '#F1ECDF', color: '#4A5D56' }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tpl > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold" style={style}>
          <FileText size={11} /> {tpl === 1 ? 'نموذج جاهز' : tpl === 2 ? 'نموذجان جاهزان' : `${tpl} نماذج جاهزة`}
        </span>
      )}
      {tbl > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold" style={style}>
          <Table2 size={11} /> {tbl === 1 ? 'جدول للتنزيل' : tbl === 2 ? 'جدولان للتنزيل' : `${tbl} جداول للتنزيل`}
        </span>
      )}
    </div>
  )
}

function CategoryTag({ post, floating = false }) {
  const cat = getCategoryById(post.category)
  if (!cat) return null
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${floating ? 'absolute top-3 right-3' : ''}`}
      style={{ background: 'rgba(253,251,247,.92)', color: INK, boxShadow: '0 4px 12px -6px rgba(11,59,51,.35)', backdropFilter: 'blur(6px)' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
      {cat.label}
    </span>
  )
}

/* ── بطاقة مقال ─────────────────────────────────────────── */
function PostCard({ post, index }) {
  return (
    <motion.article layout
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, ease, delay: Math.min(index, 8) * 0.04 }}>
      <Link to={`/blog/${post.slug}`}
        className="group flex flex-col h-full rounded-[22px] overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md), inset 0 0 0 1px rgba(184,134,58,.45)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
        <div className="relative aspect-[16/9] overflow-hidden" style={{ background: '#E9E3D5' }}>
          <img src={BLOG_COVER(post.slug, 'sm')} alt="" loading="lazy" decoding="async" width="640" height="360"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
          <CategoryTag post={post} floating />
        </div>
        <div className="flex flex-col flex-1 p-5 sm:p-6">
          <h2 className="font-bold text-[17px] leading-snug text-[#1A2E28] mb-2 group-hover:text-[#1F6F52] transition-colors">
            {post.title}
          </h2>
          <p className="text-[14px] leading-relaxed text-[#4A5D56] line-clamp-2 mb-4">{post.excerpt}</p>
          <div className="mt-auto flex items-end justify-between gap-3">
            <ToolBadges post={post} />
            <span className="shrink-0 flex items-center gap-1 text-[12px] text-[#5E6E67]">
              <Clock size={12} /> {readTimeLabel(post.readTime)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

/* ── المقال المميَّز: آخر ما نُشر أو حُدّث ──────────────────── */
function FeaturedPost({ post }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, ease }}>
      <Link to={`/blog/${post.slug}`}
        className="group section-dark grid lg:grid-cols-[1.15fr_1fr] rounded-[28px] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="relative min-h-[240px] lg:min-h-[400px] overflow-hidden lg:order-2">
          <img src={BLOG_COVER(post.slug)} alt="" decoding="async" width="1280" height="720"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]" />
          <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(0deg, rgba(8,44,38,.55), transparent 55%)' }} />
        </div>
        <div className="relative p-7 sm:p-10 flex flex-col justify-center gap-5 lg:order-1">
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <div className="flex items-center gap-3 flex-wrap">
            <span className="eyebrow">أحدث مقال</span>
            <span className="text-[13px]" style={{ color: 'rgba(248,245,236,.7)' }}>{getCategoryById(post.category)?.label}</span>
          </div>
          <h2 className="font-bold leading-tight" style={{ color: '#F8F5EC', fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)' }}>
            {post.title}
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(248,245,236,.8)' }}>{post.excerpt}</p>
          <ToolBadges post={post} onDark />
          <span className="inline-flex items-center gap-2 font-bold text-[15px] mt-1" style={{ color: '#E0B562' }}>
            اقرأ المقال <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── فلتر التصنيفات: شرائح ظاهرة بدل قائمة منسدلة ─────────── */
function CategoryPills({ active, onChange }) {
  const options = [
    { id: 'all', label: 'الكل', count: BLOG_POSTS.length },
    ...BLOG_CATEGORIES
      .map(c => ({ ...c, count: BLOG_POSTS.filter(p => p.category === c.id).length }))
      .filter(c => c.count > 0),
  ]
  return (
    <div role="tablist" aria-label="تصنيفات المدونة"
      className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center"
      style={{ scrollbarWidth: 'none' }}>
      {options.map(o => {
        const on = o.id === active
        return (
          <button key={o.id} type="button" role="tab" aria-selected={on} onClick={() => onChange(o.id)}
            className="relative shrink-0 flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-bold transition-colors"
            style={{ color: on ? '#F8F5EC' : '#1A2E28', background: on ? 'transparent' : '#FDFBF7', boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-warm)' }}>
            {on && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full" style={{ background: INK }} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="relative">{o.label}</span>
            <span className="relative text-[12px] tabular-nums rounded-full px-1.5"
              style={{ background: on ? 'rgba(224,181,98,.22)' : '#F1ECDF', color: on ? '#E0B562' : GOLD_TXT }}>{o.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function BlogList() {
  const [active, setActive] = useState('all')

  const sorted = useMemo(() => [...BLOG_POSTS].sort((a, b) => lastTouched(b).localeCompare(lastTouched(a))), [])
  const featured = sorted[0]
  const teaser   = sorted[1]
  const list = (active === 'all' ? sorted.slice(1) : sorted.filter(p => p.category === active))

  const totals = useMemo(() => ({
    posts    : BLOG_POSTS.length,
    templates: BLOG_POSTS.reduce((n, p) => n + countOf(p, 'template'), 0),
    tables   : BLOG_POSTS.reduce((n, p) => n + countOf(p, 'table'), 0),
  }), [])

  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>
      <PageMeta title={BLOG_INDEX_SEO.title} description={BLOG_INDEX_SEO.description} />

      {/* ─── الهيرو: صورة مكتب المدير تشرح «هذا مكان عملك» ─── */}
      <section className="relative pt-28 sm:pt-32 pb-14 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" aria-hidden
          style={{ opacity: 0.035, maskImage: 'radial-gradient(ellipse 70% 60% at 70% 30%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 70% 30%, #000, transparent 75%)' }} />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
          <div className="page-enter">
            <span className="eyebrow"><BookOpen size={14} /> مدونة إحكام</span>
            <h1 className="font-bold text-[#1A2E28] mt-5 mb-5" style={{ fontSize: 'clamp(2.1rem, 4.6vw, 3.4rem)', lineHeight: 1.2 }}>
              دليل عملي <br className="hidden sm:block" />لمدير <span className="title-mark">المعهد القرآني</span>
            </h1>
            <p className="text-[17px] leading-[1.9] text-[#4A5D56] max-w-[520px]">
              مقالات تخرج منها بشيء تستعمله غداً: جدول تطبعه، أو رسالة ترسلها لولي الأمر، أو قاعدة تتفق عليها مع معلميك.
            </p>
            <dl className="grid grid-cols-3 gap-3 mt-8 max-w-[460px]">
              {[
                { n: totals.posts, l: 'مقالاً' },
                { n: totals.templates, l: 'نموذجاً للنسخ' },
                { n: totals.tables, l: 'جدولاً للتنزيل' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl px-4 py-3" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                  <dt className="sr-only">{s.l}</dt>
                  <dd className="font-bold tabular-nums leading-none" style={{ fontSize: 28, color: INK, fontFamily: 'cairo-latin, inherit' }}>{s.n}</dd>
                  <dd className="text-[12px] text-[#5E6E67] mt-1.5">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hero-lift">
            <div className="relative rounded-[28px] overflow-hidden aspect-[16/11]" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <img src={BLOG_HERO_IMAGE} alt="" fetchPriority="high" decoding="async" width="1280" height="720" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(200deg, transparent 50%, rgba(8,44,38,.35))' }} />
            </div>
            {/* بطاقة طافية: عيّنة مما في المدونة */}
            <Link to={`/blog/${teaser.slug}`}
              className="hero-rise absolute -bottom-6 right-4 sm:-right-6 w-[78%] sm:w-[300px] rounded-2xl p-4 flex gap-3 items-center"
              style={{ '--rise-delay': '0.35s', background: '#FDFBF7', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
              <img src={BLOG_COVER(teaser.slug, 'sm')} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-bold" style={{ color: GOLD_TXT }}>من المدونة</div>
                <div className="text-[13px] font-bold text-[#1A2E28] leading-snug line-clamp-2">{teaser.title}</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── أحدث مقال ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <FeaturedPost post={featured} />
      </section>

      {/* ─── كل المقالات ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-8">
          <h2 className="font-bold text-[#1A2E28] mb-6" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
            اختر ما يشغلك <span className="title-mark">اليوم</span>
          </h2>
          <CategoryPills active={active} onChange={setActive} />
        </div>
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => <PostCard key={p.slug} post={p} index={i} />)}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ─── اشتراك + مركز المساعدة ─── */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="section-dark max-w-6xl mx-auto rounded-[28px] overflow-hidden grid md:grid-cols-[1.2fr_1fr] items-stretch" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <div className="p-7 sm:p-10 flex flex-col justify-center gap-4">
            <span className="eyebrow self-start">مقال جديد كل فترة</span>
            <h2 className="font-bold leading-tight" style={{ color: '#F8F5EC', fontSize: 'clamp(1.5rem, 2.6vw, 2rem)' }}>
              يصلك المقال التالي <span className="title-mark">على بريدك</span>
            </h2>
            <p className="text-[15px]" style={{ color: 'rgba(248,245,236,.78)' }}>مقالات عملية لمديري معاهد التحفيظ. بلا إعلانات.</p>
            <BlogSubscribe dark />
            <p className="text-[13px]" style={{ color: 'rgba(248,245,236,.66)' }}>
              تبحث عن شرح خطوة بخطوة داخل النظام؟{' '}
              <Link to="/help" className="font-bold underline underline-offset-4" style={{ color: '#E0B562' }}>افتح مركز المساعدة</Link>
            </p>
          </div>
          <div className="relative hidden md:block min-h-[300px]">
            <img src={BLOG_COVER('reputation-as-marketing')} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(270deg, transparent 40%, rgba(8,44,38,1))' }} />
          </div>
        </div>
      </section>
    </div>
  )
}
