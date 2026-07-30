import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import DemoRequestForm from '../components/DemoRequestForm'
import IhkaamGallery         from '../components/IhkaamGallery'
import IhkaamMobileShowcase from '../components/IhkaamMobileShowcase'
import IhkaamTrustStats   from '../components/IhkaamTrustStats'
import IhkaamPartners     from '../components/IhkaamPartners'
import IhkaamAudiences    from '../components/IhkaamAudiences'
import IhkaamCoreFeatures    from '../components/IhkaamCoreFeatures'
import IhkaamSmartInsights   from '../components/IhkaamSmartInsights'
import IhkaamSystemFeatures from '../components/IhkaamSystemFeatures'
import IhkaamConfigurator    from '../components/IhkaamConfigurator'
import IhkaamFAQ             from '../components/IhkaamFAQ'
import IhkaamByNumbers       from '../components/IhkaamByNumbers'
import LeadMagnetSection     from '../components/LeadMagnetSection'

/* ── Shared scroll helper — uses offsetTop to avoid transform skew ── */
function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  // offsetTop gives the layout position, unaffected by CSS transforms
  let top = 0
  let node = el
  while (node) {
    top += node.offsetTop || 0
    node = node.offsetParent
  }
  window.scrollTo({ top: top - 112, behavior: 'smooth' })
}

/* ── Internal nav items ── */
const SUB_NAV = [
  { label: 'نظرة عامة',    id: 'overview'  },
  { label: 'المعرض',       id: 'gallery'   },
  { label: 'الميزات',      id: 'features'  },
  { label: 'التحليل الذكي', id: 'insights'  },
  { label: 'الإضافات',     id: 'addons'    },
  { label: 'إحكام بالأرقام', id: 'network'  },
  { label: 'الأسئلة',      id: 'faq'       },
]

function SubNav() {
  const [active, setActive] = useState('overview')

  useEffect(() => {
    const observers = []
    SUB_NAV.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  function scrollTo(id) { scrollToSection(id) }

  return (
    <div
      className="sticky z-40 overflow-x-auto"
      style={{
        top             : '64px',
        background      : 'rgba(2,15,14,0.92)',
        backdropFilter  : 'blur(16px)',
        borderBottom    : '1px solid rgba(26,148,155,0.18)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-1 h-11">
        {SUB_NAV.map(({ label, id }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="relative px-4 h-full text-xs font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
              style={{ color: isActive ? '#D9ACA3' : '#6FA5A8' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#96BCBE' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#6FA5A8' }}
            >
              {label}
              {isActive && (
                <span
                  className="absolute bottom-0 inset-x-2 h-0.5 rounded-full"
                  style={{ background: '#D9ACA3' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const sectionIn = {
  hidden : { opacity: 0, y: 40 },
  visible: {
    opacity   : 1,
    y         : 0,
    transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1] },
  },
}

const heroContainer = {
  hidden : {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.10 } },
}
const heroItem = {
  hidden : { opacity: 0, y: 24 },
  visible: {
    opacity   : 1,
    y         : 0,
    transition: { duration: 0.70, ease: [0.22, 1, 0.36, 1] },
  },
}


export default function IhkaamSaaS() {
  const { hash } = useLocation()
  const [formOpen, setFormOpen] = useState(false)

  /* scroll to hash — fires on mount AND on hash change */
  useEffect(() => {
    const id = hash.slice(1)
    if (!id) return

    const doScroll = () => {
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      /* nudge up to clear the fixed navbar + subnav (112px) */
      setTimeout(() => window.scrollBy({ top: -112, behavior: 'smooth' }), 50)
    }

    /* first attempt: after initial render */
    const t1 = setTimeout(doScroll, 400)
    /* second attempt: after images & animations finish loading */
    const t2 = setTimeout(doScroll, 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [hash])

  return (
    <div className="relative">

      <AnimatePresence>
        {formOpen && <DemoRequestForm key="demo-form" onClose={() => setFormOpen(false)} />}
      </AnimatePresence>

      <SubNav />

      {/* ════════════════════════════════════════════
          1 — HERO
          ════════════════════════════════════════════ */}
      <section
        id="overview"
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ paddingTop: 'clamp(7rem, 14vh, 10rem)', paddingBottom: 'clamp(4rem, 8vh, 7rem)' }}
      >
        <div
          className="pointer-events-none absolute top-0 right-0 w-[650px] h-[650px]"
          style={{ background: 'radial-gradient(circle at top right, rgba(217,172,163,0.07) 0%, transparent 60%)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-[450px] h-[450px]"
          style={{ background: 'radial-gradient(circle at bottom left, rgba(26,148,155,0.08) 0%, transparent 65%)' }}
          aria-hidden
        />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-6"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={heroItem}
            className="text-rose-grad font-black text-sm tracking-[0.24em] uppercase mb-7"
          >
            نظام إحكام السحابي
          </motion.p>

          <motion.h1
            variants={heroItem}
            className="font-black leading-[1.14] mb-8"
            style={{ fontSize: 'clamp(2rem, 5.2vw, 4.2rem)', color: '#EAE4DF' }}
          >
            كل ما يحتاجه معهدك —
            <br className="hidden md:block" />
            في مكان واحد.
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="leading-[2] mb-11 mx-auto"
            style={{ color: '#96BCBE', fontSize: 'clamp(0.9rem, 1.6vw, 1.05rem)', maxWidth: '640px' }}
          >
            تسميع موثّق. حضور تلقائي. أولياء أمور دائماً على علم.
            إحكام يجمع كل هذا — لأن وقت كادرك أثمن من أن يضيع في الشاشات.
          </motion.p>

          <motion.div
            variants={heroItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
          >
            {/* الترتيب كان مقلوباً: التمرير للمعرض كان يلبس زي الـ CTA الأساسي
               والتحويل الفعلي كان الزر الباهت. */}
            <Link
              to="/request"
              className="btn-cta inline-flex items-center gap-2.5 rounded-xl w-full sm:w-auto justify-center"
              style={{ fontSize: '0.9rem', padding: '0.9rem 2.2rem' }}
            >
              اطلب نسخة
              <ArrowLeft size={16} strokeWidth={2} />
            </Link>

            <button
              onClick={() => scrollToSection('gallery')}
              className="btn-outline inline-flex items-center gap-2 rounded-xl w-full sm:w-auto justify-center"
              style={{ fontSize: '0.9rem', padding: '0.9rem 2.2rem' }}
            >
              تصفّح الواجهات
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          2 — TRUST STATS
          ════════════════════════════════════════════ */}
      <IhkaamTrustStats />

      {/* ════════════════════════════════════════════
          3 — PARTNERS MARQUEE
          ════════════════════════════════════════════ */}
      <IhkaamPartners />

      {/* ════════════════════════════════════════════
          5 — GALLERY (Desktop screenshots)
          ════════════════════════════════════════════ */}
      <div id="gallery">
        <IhkaamGallery />
      </div>

      {/* ════════════════════════════════════════════
          5b — MOBILE SHOWCASE (Phone mockups)
          ════════════════════════════════════════════ */}
      <IhkaamMobileShowcase />

      {/* ════════════════════════════════════════════
          6 — AUDIENCES
          ════════════════════════════════════════════ */}
      <motion.div
        variants={sectionIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <IhkaamAudiences />
      </motion.div>


      {/* ── Mid-page CTA ── */}
      <div className="relative z-10 px-6 py-10">
        <div
          dir="rtl"
          className="max-w-3xl mx-auto rounded-2xl px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{
            background: 'linear-gradient(135deg, rgba(72,214,205,0.08) 0%, rgba(26,148,155,0.14) 100%)',
            border    : '1px solid rgba(72,214,205,0.28)',
          }}
        >
          <div className="text-right">
            <p className="font-black text-lg center mb-1" style={{ color: '#EAE4DF' }}>
              رأيت كيف يخدم إحكام كل دور في معهدك؟
            </p>
            <p className="text-sm" style={{ color: '#96BCBE' }}>
              الخطوة التالية بسيطة — اطلب نسختك وفريقنا يرافقك من أول يوم.
            </p>
          </div>
          <Link
            to="/request"
            className="btn-cta flex-shrink-0 rounded-xl whitespace-nowrap"
            style={{ fontSize: '0.9rem', padding: '0.9rem 2rem' }}
          >
            اطلب نسخة
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          7 — CORE FEATURES (what's in every plan)
          ════════════════════════════════════════════ */}
      <motion.div
        id="features"
        style={{ scrollMarginTop: '90px' }}
        variants={sectionIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <IhkaamCoreFeatures />
      </motion.div>

      {/* ════════════════════════════════════════════
          7a — SMART INSIGHTS (the flagship core feature)
          يقع مباشرةً بعد شبكة الميزات لأنه امتدادها لا إضافة
          مستقلة — وقبل الخصائص التقنية كي يبقى الحديث عن
          القيمة قبل الحديث عن البنية.
          ════════════════════════════════════════════ */}
      <IhkaamSmartInsights />

      {/* ════════════════════════════════════════════
          7b — SYSTEM FEATURES (technical characteristics)
          ════════════════════════════════════════════ */}
      <motion.div
        variants={sectionIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <IhkaamSystemFeatures />
      </motion.div>

      {/* ════════════════════════════════════════════
          8 — ADD-ONS CATALOG (informational)
          ════════════════════════════════════════════ */}
      <motion.div
        id="addons"
        style={{ scrollMarginTop: '90px' }}
        variants={sectionIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <IhkaamConfigurator />
      </motion.div>

      {/* ════════════════════════════════════════════
          8.5 — NETWORK INTELLIGENCE
          ════════════════════════════════════════════ */}
      <div id="network" style={{ scrollMarginTop: '120px' }} />
      <motion.div
        variants={sectionIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <IhkaamByNumbers />
      </motion.div>



      {/* ════════════════════════════════════════════
          10 — FAQ
          ════════════════════════════════════════════ */}
      <motion.div
        id="faq"
        style={{ scrollMarginTop: '90px' }}
        variants={sectionIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <IhkaamFAQ />
      </motion.div>

      {/* ════════════════════════════════════════════
          11 — CLOSING CTA
          ════════════════════════════════════════ */}
      <motion.div
        variants={sectionIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="px-4 py-24"
      >
        <div className="max-w-3xl mx-auto text-center" dir="rtl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
            style={{ background: 'rgba(72,214,205,0.10)', border: '1px solid rgba(72,214,205,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#48D6CD' }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: '#48D6CD' }}>
              الآن — ابدأ تجربتك المجانية
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-black mb-4 leading-snug" style={{ color: '#EAE4DF' }}>
            جاهز لتحويل معهدك القرآني
            <br />
            <span style={{ color: '#48D6CD' }}>إلى منظومة رقمية متكاملة؟</span>
          </h2>

          <p className="text-base mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: '#96BCBE' }}>
            أرسل لنا طلبك الآن وسيتواصل معك فريق إحكام 
          </p>

          {/* الزوج القياسي: شراء ذاتي أساسي + مسار بشري ثانوي.
             قبلها كان زراً واحداً وتحته وعد بجلسة مجانية — وعدان وباب واحد. */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/request"
              className="btn-cta inline-flex items-center gap-3 rounded-2xl w-full sm:w-auto justify-center"
              style={{ fontSize: '1rem', padding: '1rem 2.5rem', textDecoration: 'none' }}
            >
              اطلب نسخة
              <ArrowLeft size={18} strokeWidth={2} />
            </Link>

            <button
              onClick={() => setFormOpen(true)}
              className="btn-outline inline-flex items-center gap-2 rounded-2xl w-full sm:w-auto justify-center"
              style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}
            >
 اطلب تجربة مجانية            </button>
          </div>

          {/* Trust note */}
          
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════
          12 — SOFT EMAIL CAPTURE (لمن لم يقرر بعد)
          ════════════════════════════════════════ */}
      <motion.div
        variants={sectionIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <LeadMagnetSection sourcePage="/ihkaam" variant="ihkaam" />
      </motion.div>

    </div>
  )
}
