import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ArrowLeft, X, LifeBuoy, ListChecks } from 'lucide-react'
import { CATEGORIES, getAllArticles, getArticle } from '../data/helpContent'
import { desktopSrc, mobileSrc } from '../data/appShots'
import { desk, phone } from '../data/helpVisuals'
import { BrowserFrame, PhoneFrame } from '../components/help/ShotFrame'
import PageMeta from '../components/layout/PageMeta'
import { HELP_INDEX_SEO } from '../config/seo'

/* مركز المساعدة: كل تصنيف بلقطةٍ حقيقية من شاشته (نسخة العرض)، واختيار
   الدور يعرض صورته ومقالاته، فيرى المستخدم أين سيذهب قبل أن يقرأ. */

const INK = '#0B3B33', GOLD = '#B8863A', GOLD_TXT = '#8A6425'
const ease = [0.22, 1, 0.36, 1]

/* صورة كل تصنيف: لقطة شاشته من public/app-shots، أو مشهد حين لا شاشة له */
const CAT_VISUAL = {
  'getting-started': { src: desktopSrc('dashboard', true) },
  students         : { src: desktopSrc('students', true) },
  daily            : { src: desktopSrc('attendance', true) },
  exams            : { src: desktopSrc('exams', true) },
  finance          : { src: desktopSrc('finance', true) },
  reports          : { src: desktopSrc('reports', true) },
  insights         : { src: desktopSrc('insights', true) },
  parents          : { src: mobileSrc('parent'), phone: true },
  staff            : { src: desktopSrc('staff-register', true) },
}

/* الأدوار: تُطابق نصوص whoFor في كل مقال. صورة كل دور هي الشاشة التي يفتحها
   أولاً (لقطة حقيقية من نسخة العرض)، لا صورة شخص مولّدة. */
const ROLES = [
  { id: 'director', label: 'مدير المعهد',   shot: desk('dashboard'),         match: /مدير|مشرف|الإداري/ },
  { id: 'teacher',  label: 'معلم الحلقة',   shot: phone('attendance'),       match: /المعلم/ },
  { id: 'examiner', label: 'المختبِر',       shot: desk('exams'),             match: /المُختبر/ },
  { id: 'finance',  label: 'المسؤول المالي', shot: desk('finance-tuitions'),  match: /مالي/ },
  { id: 'parent',   label: 'ولي الأمر',     shot: phone('parent'),           match: /أولياء/ },
]

const POPULAR = ['login', 'attendance-batch', 'daily-recitation', 'student-registration', 'parent-portal']

/* ─── بطاقة تصنيف بلقطة شاشته ─────────────────────────────── */
function CategoryCard({ cat, index }) {
  const v = CAT_VISUAL[cat.id] || {}
  const Icon = cat.icon
  return (
    <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease, delay: (index % 3) * 0.07 }}>
      <Link to={`/help/category/${cat.id}`}
        className="group flex flex-col h-full rounded-[22px] overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
        <div className="relative h-44 overflow-hidden" style={{ background: v.scene ? '#E9E3D5' : '#F1ECDF' }}>
          {v.phone ? (
            <div className="absolute inset-x-0 top-5 mx-auto w-[120px] rounded-[20px] overflow-hidden transition-transform duration-500 group-hover:-translate-y-2"
              style={{ boxShadow: '0 18px 36px -16px rgba(8,44,38,.55), 0 0 0 5px #1A2E28' }}>
              <img src={v.src} alt="" loading="lazy" className="w-full" />
            </div>
          ) : v.scene ? (
            <img src={v.src} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="absolute top-5 right-5 left-[-30%] rounded-tr-xl rounded-tl-xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-1.5"
              style={{ boxShadow: '0 16px 34px -16px rgba(8,44,38,.5), 0 0 0 1px rgba(11,59,51,.1)' }}>
              <img src={v.src} alt="" loading="lazy" className="w-full object-cover object-right-top" />
            </div>
          )}
          <span className="absolute bottom-3 right-3 w-10 h-10 rounded-xl grid place-items-center"
            style={{ background: INK, color: '#E0B562', boxShadow: '0 8px 18px -8px rgba(8,44,38,.7)' }}>
            <Icon size={18} />
          </span>
        </div>
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h2 className="font-bold text-[17px] text-[#1A2E28] group-hover:text-[#1F6F52] transition-colors">{cat.label}</h2>
            <span className="text-[11px] font-bold rounded-full px-2.5 py-1 shrink-0" style={{ background: '#F1ECDF', color: GOLD_TXT }}>
              {cat.articles.length === 1 ? 'شرح واحد' : cat.articles.length === 2 ? 'شرحان' : `${cat.articles.length} شروح`}
            </span>
          </div>
          <p className="text-[14px] text-[#4A5D56] leading-relaxed">{cat.description}</p>
          <ul className="mt-3 space-y-1">
            {cat.articles.slice(0, 3).map(s => {
              const a = getArticle(s)
              return a ? (
                <li key={s} className="flex items-center gap-2 text-[13px] text-[#2F4540]">
                  <span aria-hidden className="w-1.5 h-1.5 rotate-45 shrink-0" style={{ background: GOLD }} />
                  <span className="truncate">{a.title}</span>
                </li>
              ) : null
            })}
          </ul>
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── «أنا…»: اختيار الدور يعرض صورته ومقالاته ────────────── */
function RolePicker({ all }) {
  const [role, setRole] = useState(ROLES[0].id)
  const r = ROLES.find(x => x.id === role)
  const list = all.filter(a => (a.whoFor || []).some(w => r.match.test(w)))
  return (
    <section className="px-4 sm:px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center font-bold text-[#1A2E28] mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
          ابدأ من <span className="title-mark">دورك</span>
        </h2>
        <p className="text-center text-[15px] text-[#4A5D56] mb-7">كل دور يرى في إحكام شاشات مختلفة. اختر دورك لترى ما يخصّك.</p>
        <div role="tablist" className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center mb-6" style={{ scrollbarWidth: 'none' }}>
          {ROLES.map(x => {
            const on = x.id === role
            return (
              <button key={x.id} role="tab" aria-selected={on} type="button" onClick={() => setRole(x.id)}
                className="relative shrink-0 rounded-full px-4 py-2.5 text-[14px] font-bold"
                style={{ color: on ? '#F8F5EC' : '#1A2E28', background: on ? 'transparent' : '#FDFBF7', boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-warm)' }}>
                {on && <motion.span layoutId="role-pill" className="absolute inset-0 rounded-full" style={{ background: INK }} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="relative">أنا {x.label}</span>
              </button>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-[1.05fr_1fr] rounded-[28px] overflow-hidden"
          style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }}>
          <div className="relative section-dark overflow-hidden flex flex-col items-center justify-center px-5 sm:px-8 py-8 min-h-[300px] lg:min-h-[420px]">
            <div className="pattern-layer pattern-khatam" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.div key={r.id} className="relative w-full flex flex-col items-center"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease }}>
                {r.shot.kind === 'phone'
                  ? <PhoneFrame shot={r.shot} width={190} />
                  : <BrowserFrame shot={r.shot} className="w-full max-w-[560px]" />}
                <p className="mt-5 text-center text-[13px] leading-[1.85] max-w-[440px]" style={{ color: 'rgba(248,245,236,.78)' }}>
                  <span className="font-bold" style={{ color: '#E0B562' }}>{r.shot.title}: </span>{r.shot.caption}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4 text-[13px] font-bold" style={{ color: GOLD_TXT }}>
              <ListChecks size={16} /> {list.length} {list.length > 10 ? 'شرحاً' : 'شروح'} تخصّ {r.label}
            </div>
            <AnimatePresence mode="wait">
              <motion.ol key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
                className="space-y-1.5 max-h-[300px] overflow-y-auto pe-1">
                {list.map((a, i) => (
                  <li key={a.slug}>
                    <Link to={`/help/${a.slug}`} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F1ECDF]">
                      <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px] font-bold tabular-nums" style={{ background: '#F1ECDF', color: INK }}>{i + 1}</span>
                      <span className="flex-1 text-[14.5px] font-semibold text-[#1A2E28]">{a.title}</span>
                      <ChevronLeft size={15} className="text-[#5E6E67] transition-transform group-hover:-translate-x-1" />
                    </Link>
                  </li>
                ))}
              </motion.ol>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HelpCenter() {
  const [query, setQuery] = useState('')
  const all = useMemo(() => getAllArticles(), [])
  const catOf = useMemo(() => {
    const m = {}
    CATEGORIES.forEach(c => c.articles.forEach(s => { m[s] = c }))
    return m
  }, [])

  const q = query.trim().toLowerCase()
  const results = useMemo(() => !q ? [] : all.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q) ||
    a.steps?.some(s => s.title.toLowerCase().includes(q))
  ), [q, all])

  return (
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>
      <PageMeta title={HELP_INDEX_SEO.title} description={HELP_INDEX_SEO.description} />

      {/* ─── الرأس: بحث + أكثر الشروح طلباً، وخلفه شاشة التطبيق ─── */}
      <section className="relative pt-28 sm:pt-32 pb-14 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" aria-hidden
          style={{ opacity: 0.035, maskImage: 'radial-gradient(ellipse 60% 55% at 50% 15%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 15%, #000, transparent 75%)' }} />
        <div className="relative max-w-3xl mx-auto text-center page-enter">
          <span className="eyebrow"><LifeBuoy size={14} /> مركز المساعدة</span>
          <h1 className="font-bold text-[#1A2E28] mt-5 mb-4" style={{ fontSize: 'clamp(2rem, 4.6vw, 3.3rem)', lineHeight: 1.25 }}>
            كل شاشة في إحكام، <span className="title-mark">خطوة بخطوة</span>
          </h1>
          <p className="text-[17px] leading-[1.9] text-[#4A5D56] mb-8">
            {all.length} شرحاً مصوّراً للمدير والمعلم والمختبِر وولي الأمر.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search size={19} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#5E6E67]" />
            <input type="search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="ابحث: تسجيل الحضور، نقل طالب، كلمة المرور…" aria-label="ابحث في مركز المساعدة"
              className="w-full rounded-2xl pr-12 pl-12 py-4 text-[15px] outline-none transition-shadow"
              style={{ background: '#FDFBF7', color: '#1A2E28', fontFamily: 'inherit', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }} />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="مسح البحث"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full grid place-items-center" style={{ background: '#F1ECDF', color: INK }}>
                <X size={14} />
              </button>
            )}
          </div>

          {!q && (
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              <span className="text-[13px] text-[#5E6E67] self-center">الأكثر طلباً:</span>
              {POPULAR.map(s => getArticle(s)).filter(Boolean).map(a => (
                <Link key={a.slug} to={`/help/${a.slug}`} className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors hover:bg-[#F1ECDF]"
                  style={{ background: '#FDFBF7', color: INK, boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                  {a.title.replace(/^كيفية\s+/, '')}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── نتائج البحث ─── */}
      {q && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          {results.length > 0 ? (
            <>
              <p className="text-[14px] text-[#5E6E67] mb-4">{results.length} نتيجة لـ «{query}»</p>
              <div className="space-y-2.5">
                {results.map(a => {
                  const c = catOf[a.slug], Icon = c?.icon
                  return (
                    <Link key={a.slug} to={`/help/${a.slug}`} className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
                      style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
                      {Icon && <span className="shrink-0 w-11 h-11 rounded-xl grid place-items-center" style={{ background: '#F1ECDF', color: INK }}><Icon size={18} /></span>}
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold" style={{ color: GOLD_TXT }}>{c?.label}</div>
                        <div className="font-bold text-[15px] text-[#1A2E28] truncate">{a.title}</div>
                        <div className="text-[13px] text-[#4A5D56] truncate">{a.description}</div>
                      </div>
                      <ChevronLeft size={17} className="text-[#5E6E67] shrink-0 transition-transform group-hover:-translate-x-1" />
                    </Link>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center rounded-[24px] p-10" style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              <div className="font-bold text-[17px] text-[#1A2E28]">لم نجد شرحاً لـ «{query}»</div>
              <p className="text-[14px] text-[#4A5D56] mt-2 mb-5">جرّب كلمة أخرى، أو اسألنا مباشرة.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold" style={{ background: INK, color: '#F8F5EC' }}>
                اسأل فريق إحكام <ArrowLeft size={15} />
              </Link>
            </div>
          )}
        </section>
      )}

      {!q && (
        <>
          {/* ─── التصنيفات بلقطاتها ─── */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CATEGORIES.map((c, i) => <CategoryCard key={c.id} cat={c} index={i} />)}
            </div>
          </section>

          <RolePicker all={all} />
        </>
      )}

      {/* ─── لم تجد جوابك؟ ─── */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="section-dark max-w-6xl mx-auto rounded-[28px] overflow-hidden grid md:grid-cols-[1.2fr_1fr]" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="pattern-layer pattern-khatam" aria-hidden />
          <div className="p-7 sm:p-10 flex flex-col justify-center gap-4">
            <span className="eyebrow self-start">لم تجد جوابك؟</span>
            <h2 className="font-bold leading-tight" style={{ color: '#F8F5EC', fontSize: 'clamp(1.5rem, 2.6vw, 2rem)' }}>
              اسألنا، <span className="title-mark">ويردّ عليك شخص</span> من فريق إحكام
            </h2>
            <p className="text-[15px]" style={{ color: 'rgba(248,245,236,.78)' }}>على واتساب عادةً خلال 24 ساعة، أو عبر البريد خلال 48 ساعة.</p>
            <div className="flex flex-wrap gap-3 mt-1">
              <Link to="/contact" className="btn-cta inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-[14px]">تواصل معنا <ArrowLeft size={15} /></Link>
              <Link to="/blog" className="btn-outline inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-[14px] border">مقالات المدونة</Link>
            </div>
          </div>
          <div className="relative hidden md:block min-h-[280px]">
            <img src="/scenes/blog/angry-parent-trust-moment.webp" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(270deg, transparent 40%, rgba(8,44,38,1))' }} />
          </div>
        </div>
      </section>
    </div>
  )
}
