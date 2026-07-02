import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Lightbulb, AlertTriangle, CheckCircle2, MessageCircle,
} from 'lucide-react'
import { getArticle, getCategoryForArticle, ARTICLES } from '../data/helpContent'

/* ─── Step card ──────────────────────────────────────────── */
function StepCard({ step, num, color }) {
  const lines = step.body.split('\n')
  return (
    <div className="relative flex gap-5">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
          style={{ background: color + '22', color, border: `2px solid ${color}40` }}
        >
          {num}
        </div>
        <div className="flex-1 w-px mt-2" style={{ background: color + '20' }} />
      </div>

      <div className="pb-8 flex-1 min-w-0">
        <h4 className="text-white font-bold text-base mb-2">{step.title}</h4>

        <div className="text-white/65 text-sm leading-relaxed space-y-1.5">
          {lines.map((line, i) => (
            <p key={i} className={line.startsWith('•') ? 'pr-2' : ''}>
              {line}
            </p>
          ))}
        </div>

        {step.note && (
          <div
            className="mt-3 rounded-xl px-4 py-3 flex gap-3 items-start"
            style={{ background: '#6ABDB2' + '14', border: '1px solid #6ABDB2' + '30' }}
          >
            <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#6ABDB2' }} />
            <p className="text-white/75 text-xs leading-relaxed">{step.note}</p>
          </div>
        )}

        {step.warning && (
          <div
            className="mt-3 rounded-xl px-4 py-3 flex gap-3 items-start"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-red-400" />
            <p className="text-white/75 text-xs leading-relaxed">{step.warning}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Sidebar ────────────────────────────────────────────── */
function HelpSidebar({ article, catColor }) {
  const related = article.related?.map(s => ARTICLES[s]).filter(Boolean) || []

  return (
    <aside className="space-y-5">

      {/* Steps overview */}
      <div
        className="rounded-2xl p-5 border border-white/7"
        style={{ background: 'rgba(255,255,255,0.025)' }}
      >
        <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">
          الخطوات ({article.steps.length})
        </h3>
        <ol className="space-y-2.5">
          {article.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                style={{ background: catColor + '20', color: catColor }}
              >
                {i + 1}
              </span>
              <span className="text-white/55 text-xs leading-snug">{step.title}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div
          className="rounded-2xl p-5 border border-white/7"
          style={{ background: 'rgba(255,255,255,0.025)' }}
        >
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">
            مقالات ذات صلة
          </h3>
          <div className="space-y-3">
            {related.map(a => {
              return (
                <Link
                  key={a.slug}
                  to={`/help/${a.slug}`}
                  className="group flex items-start gap-2.5"
                >
                  <ChevronLeft size={14} className="text-white/20 flex-shrink-0 mt-0.5 group-hover:text-white/50 transition-colors" />
                  <p className="text-white/60 text-xs leading-snug group-hover:text-white transition-colors">
                    {a.title}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Need help */}
      <div
        className="rounded-2xl p-5 border text-center"
        style={{ background: catColor + '08', borderColor: catColor + '25' }}
      >
        <MessageCircle size={20} className="mx-auto mb-2" style={{ color: catColor }} />
        <p className="text-white/60 text-xs leading-relaxed mb-3">
          المقالة لم تحل مشكلتك؟ تواصل مع الدعم مباشرة.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg"
          style={{ background: catColor + '20', color: catColor }}
        >
          تواصل معنا
        </Link>
      </div>
    </aside>
  )
}

/* ─── Main ───────────────────────────────────────────────── */
export default function HelpArticle() {
  const { slug } = useParams()
  const navigate  = useNavigate()
  const article   = getArticle(slug)
  const cat       = getCategoryForArticle(slug)

  useEffect(() => {
    if (!article) navigate('/help', { replace: true })
  }, [article, navigate])

  if (!article) return null

  const catColor = cat?.color || '#6ABDB2'
  const Icon     = cat?.icon

  return (
    <div dir="rtl" style={{ background: '#010D0D', minHeight: '100vh' }}>

      {/* ─── Hero ───────────────────────────────────── */}
      <div
        className="relative pt-28 pb-12 px-6 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -5%, ${catColor}14 0%, transparent 70%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(${catColor}05 1px, transparent 1px),
              linear-gradient(90deg, ${catColor}05 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="absolute top-0 inset-x-0 h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${catColor}80, transparent)` }}
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/35 mb-6 flex-wrap">
            <Link to="/help" className="hover:text-white/70 transition-colors">الدعم الفني</Link>
            <ChevronLeft size={12} />
            {cat && (
              <>
                <Link to={`/help/category/${cat.id}`} className="hover:text-white/70 transition-colors">
                  {cat.label}
                </Link>
                <ChevronLeft size={12} />
              </>
            )}
            <span className="text-white/55">{article.title}</span>
          </nav>

          {cat && Icon && (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
              style={{ background: catColor + '20', color: catColor }}
            >
              <Icon size={12} />
              {cat.label}
            </div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-white text-3xl md:text-4xl font-black mb-3 max-w-3xl"
            style={{ lineHeight: 1.25 }}
          >
            {article.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.08, duration: 0.5 } }}
            className="text-white/55 text-base leading-relaxed mb-5 max-w-2xl"
          >
            {article.description}
          </motion.p>

          {article.whoFor?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-white/35 text-xs self-center">مناسب لـ:</span>
              {article.whoFor.map(w => (
                <span
                  key={w}
                  className="text-xs px-2.5 py-1 rounded-full border font-medium"
                  style={{ borderColor: catColor + '40', color: catColor + 'cc', background: catColor + '0e' }}
                >
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Two-column body ────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-28">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* Main content */}
          <main className="flex-1 min-w-0 pt-10">
            <h2 className="text-white font-bold text-xl mb-8 flex items-center gap-3">
              <span
                className="w-1 h-6 rounded-full inline-block"
                style={{ background: catColor }}
              />
              الخطوات التفصيلية
            </h2>

            <div>
              {article.steps.map((step, i) => (
                <StepCard key={i} step={step} num={i + 1} color={catColor} />
              ))}
            </div>

            {/* Tips */}
            {article.tips?.length > 0 && (
              <div
                className="mt-10 rounded-2xl p-6"
                style={{ background: 'rgba(255,213,75,0.06)', border: '1px solid rgba(255,213,75,0.18)' }}
              >
                <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: '#FFD54B' }}>
                  <Lightbulb size={18} />
                  نصائح مفيدة
                </h3>
                <ul className="space-y-2.5">
                  {article.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm leading-relaxed">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ background: '#FFD54B' }}
                      />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </main>

          {/* Sticky sidebar */}
          <div className="lg:w-64 xl:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-24 pt-10">
              <HelpSidebar article={article} catColor={catColor} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
