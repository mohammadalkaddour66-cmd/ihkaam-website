import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import { CATEGORIES, ARTICLES } from '../data/helpContent'

const fadeUp = {
  hidden : { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 },
  }),
}

export default function HelpCategory() {
  const { catId }  = useParams()
  const navigate   = useNavigate()
  const cat        = CATEGORIES.find(c => c.id === catId)

  useEffect(() => {
    if (!cat) navigate('/help', { replace: true })
  }, [cat, navigate])

  if (!cat) return null

  const Icon     = cat.icon
  const articles = cat.articles.map(s => ARTICLES[s]).filter(Boolean)

  return (
    <div dir="rtl" style={{ background: '#010D0D', minHeight: '100vh' }}>

      {/* ─── Header ─────────────────────────────────── */}
      <div
        className="relative pt-28 pb-14 px-6 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% -5%, ${cat.color}14 0%, transparent 70%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(${cat.color}05 1px, transparent 1px),
              linear-gradient(90deg, ${cat.color}05 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/35 mb-6">
            <Link to="/help" className="hover:text-white/70 transition-colors">الدعم الفني</Link>
            <ChevronLeft size={12} />
            <span className="text-white/60">{cat.label}</span>
          </nav>

          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: cat.color + '20', border: `1px solid ${cat.color}30` }}
            >
              <Icon size={26} style={{ color: cat.color }} />
            </div>
            <div>
              <h1 className="text-white text-3xl md:text-4xl font-black">{cat.label}</h1>
              <p className="text-white/45 text-sm mt-1">{cat.description}</p>
            </div>
          </div>

          {/* Article count chip */}
          <span
            className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: cat.color + '20', color: cat.color }}
          >
            {articles.length} مقالة
          </span>
        </div>
      </div>

      {/* ─── Articles grid ───────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 gap-4">
          {articles.map((art, i) => (
            <motion.div
              key={art.slug}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <Link
                to={`/help/${art.slug}`}
                className="group flex flex-col h-full p-5 rounded-2xl border border-white/8
                           hover:border-white/20 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  transition: 'border-color 0.22s, background 0.22s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = cat.color + '08')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                {/* Step count badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: cat.color + '18', color: cat.color }}
                  >
                    {art.steps.length} خطوات
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-base mb-2 leading-snug group-hover:text-[#6ABDB2] transition-colors">
                  {art.title}
                </h3>

                {/* Description */}
                <p className="text-white/50 text-sm leading-relaxed flex-1 line-clamp-2">
                  {art.description}
                </p>

                {/* Who for chips */}
                {art.whoFor?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {art.whoFor.slice(0, 2).map(w => (
                      <span
                        key={w}
                        className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.40)' }}
                      >
                        {w}
                      </span>
                    ))}
                    {art.whoFor.length > 2 && (
                      <span className="text-[10px] text-white/25">+{art.whoFor.length - 2}</span>
                    )}
                  </div>
                )}

                {/* Read arrow */}
                <div
                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ color: cat.color }}
                >
                  <span>اقرأ المقالة</span>
                  <ChevronLeft size={13} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            to="/help"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowRight size={15} />
            العودة لجميع الأقسام
          </Link>
        </div>
      </div>

    </div>
  )
}
