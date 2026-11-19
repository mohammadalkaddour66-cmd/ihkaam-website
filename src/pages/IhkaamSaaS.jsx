import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import DemoRequestForm from '../components/forms/DemoRequestForm'
import AppScreensGallery    from '../components/ihkaam/AppScreensGallery'
import AppMobileShowcase    from '../components/ihkaam/AppMobileShowcase'
import IhkaamAudiences    from '../components/ihkaam/IhkaamAudiences'
import IhkaamCoreFeatures    from '../components/ihkaam/IhkaamCoreFeatures'
import IhkaamSmartInsights   from '../components/ihkaam/IhkaamSmartInsights'
import IhkaamSystemFeatures from '../components/ihkaam/IhkaamSystemFeatures'
import IhkaamConfigurator    from '../components/ihkaam/IhkaamConfigurator'
import IhkaamFAQ             from '../components/ihkaam/IhkaamFAQ'
import IhkaamByNumbers       from '../components/ihkaam/IhkaamByNumbers'
import LeadMagnetSection     from '../components/sections/LeadMagnetSection'

/* الشريطان معاً (الرئيسي 76px + الفرعي) ينتهيان قرب 132px */
const SCROLL_OFFSET = 140

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
  window.scrollTo({ top: top - SCROLL_OFFSET, behavior: 'smooth' })
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

/* الشريط الفرعي (2026-11-19 هـ): كان مثبّتاً على 64px تحت شريطٍ رئيسيّ
   ينتهي عند 76px، فيتراكبان. صار كبسولةً عائمة تحت الرئيسي، وحين ينزل
   الزائر يختفي الرئيسي ويصعد هذا مكانه (Navbar يقرأ data-subnav)،
   ويعود الرئيسي عند الصعود. على الجوال يتمرّر أفقياً ويُبقي القسم الحالي
   في الوسط. الحبّة الداكنة تنزلق بين الأزرار (layoutId). */
function SubNav() {
  const [active, setActive] = useState('overview')
  const track = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-subnav', '')
    return () => { root.removeAttribute('data-subnav'); root.removeAttribute('data-nav-hidden') }
  }, [])

  useEffect(() => {
    const t = track.current
    const b = t && t.querySelector(`[data-id="${active}"]`)
    if (!t || !b || t.scrollWidth <= t.clientWidth) return
    const tr = t.getBoundingClientRect(), br = b.getBoundingClientRect()
    t.scrollBy({ left: (br.left + br.width / 2) - (tr.left + tr.width / 2), behavior: 'smooth' })
  }, [active])

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
    <div className="subnav sticky z-40 px-3 sm:px-5 pointer-events-none" dir="rtl">
      <nav
        aria-label="أقسام الصفحة"
        className="nav-pill pointer-events-auto mx-auto w-fit max-w-full rounded-full p-1"
        style={{ boxShadow: '0 10px 28px -14px rgba(11, 59, 51, 0.30), 0 0 0 1px rgba(11, 59, 51, 0.10)' }}
      >
        <div ref={track} className="subnav-track flex items-center gap-0.5 overflow-x-auto">
          {SUB_NAV.map(({ label, id }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                data-id={id}
                type="button"
                onClick={() => scrollTo(id)}
                aria-current={isActive ? 'true' : undefined}
                className="relative rounded-full px-4 py-2 text-[13px] font-bold cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                {isActive && (
                  <motion.span
                    layoutId="subnav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: '#0B3B33' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <span className="relative transition-colors duration-300" style={{ color: isActive ? '#F8F5EC' : '#4A5D56' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
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

    /* الأقسام فوق الهدف (الأرقام، الشركاء، المعرض نفسه) تُجلب بياناتها بعد
       التحميل فيتغيّر طولها، فكان التمرير مرّتين بموعدين ثابتين يقف بعيداً
       عن الهدف (روابط «كل شاشات…» من الرئيسية). صار يلاحق موضع الهدف كل
       ربع ثانية لثلاث ثوانٍ حتى يثبت، ويتوقف فوراً إن مرّر الزائر بنفسه. */
    let stopped = false
    const stop = () => { stopped = true }
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', stop)

    let tries = 0
    const t = setInterval(() => {
      tries += 1
      const el = document.getElementById(id)
      if (stopped || tries > 12) { clearInterval(t); return }
      if (!el) return
      const target = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
      if (Math.abs(window.scrollY - target) > 6) window.scrollTo({ top: target, behavior: tries < 3 ? 'smooth' : 'auto' })
    }, 250)
    return () => {
      clearInterval(t)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
    }
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
      {/* الهيرو (2026-11-19 ج): كان نصاً في الوسط على خلفيةٍ فارغة. صار عمودين:
          النص، ومشهدٌ مصوَّر بهوية إحكام (حاسوب وجوال ومصحف على رحل) شاشتاه
          لقطتان حقيقيتان من التطبيق، تدخلهما عند القراءة بطاقتان عائمتان. */}
      <section
        id="overview"
        className="relative overflow-hidden px-6"
        style={{ paddingTop: 'clamp(2.75rem, 6vh, 4.5rem)', paddingBottom: 'clamp(3rem, 7vh, 5.5rem)' }}
      >
        <div className="pointer-events-none absolute inset-0 pattern-khatam-ink" style={{ opacity: 0.035 }} aria-hidden />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div className="lg:col-span-5 text-center lg:text-right" variants={heroContainer} initial="hidden" animate="visible">
            <motion.span variants={heroItem} className="eyebrow">نظام إحكام السحابي</motion.span>
            <motion.h1
              variants={heroItem}
              className="font-bold leading-[1.25] mt-6 mb-6"
              style={{ fontSize: 'clamp(2.2rem, 4.6vw, 3.8rem)', color: '#1A2E28' }}
            >
              كل ما يحتاجه معهدك، <span className="title-mark">في مكانٍ واحد.</span>
            </motion.h1>
            <motion.p
              variants={heroItem}
              className="text-lg mb-9 mx-auto lg:mx-0"
              style={{ color: '#4A5D56', lineHeight: 1.95, maxWidth: 520 }}
            >
              تسميعٌ موثّق، وحضورٌ يُسجَّل بلمسة، وأولياء أمورٍ على علمٍ دائم.
              إحكام يجمع يوم المعهد كلّه، فيبقى وقت الكادر لطلابه.
            </motion.p>
            <motion.div variants={heroItem} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link to="/request" className="btn-cta inline-flex items-center gap-2.5 rounded-full w-full sm:w-auto justify-center px-8 py-4" style={{ fontSize: '1rem' }}>
                احسب اشتراك معهدك <ArrowLeft size={17} strokeWidth={2.2} />
              </Link>
              <button onClick={() => scrollToSection('gallery')} className="btn-outline inline-flex items-center gap-2 rounded-full w-full sm:w-auto justify-center px-8 py-4" style={{ fontSize: '1rem' }}>
                تصفّح الواجهات <ArrowLeft size={17} strokeWidth={2.2} />
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-7 relative"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-[28px] overflow-hidden" style={{ boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }}>
              <img src="/scenes/platform-hero.webp" alt="شاشة لوحة التحكم في إحكام على حاسوب، وتفقّد الحضور على الجوال، بجانب مصحفٍ على رحل"
                   width={1280} height={720} fetchPriority="high" decoding="async" className="block w-full h-auto" />
            </div>
            <motion.div className="hidden sm:flex absolute -bottom-6 right-6 items-center gap-3 rounded-2xl bg-white px-4 py-3"
              style={{ boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ background: '#0B3B33', color: '#E0B562' }}>35+</span>
              <span className="text-sm font-bold leading-tight" style={{ color: '#0B3B33' }}>واجهة لكل<br />أدوار المعهد</span>
            </motion.div>
            <motion.div className="hidden sm:flex absolute -top-5 left-6 items-center gap-2 rounded-full px-4 py-2"
              style={{ background: '#0B3B33', color: '#F8F5EC', boxShadow: 'var(--shadow-md)' }}
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#A8D5BA' }} />
              <span className="text-sm font-bold">يعمل من المتصفح والجوال</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* الأرقام والشركاء أُزيلا من هنا (2026-11-19 ج): مكرّران من الرئيسية،
          والأرقام في «إحكام بالأرقام» أسفل الصفحة. */}


      {/* ════════════════════════════════════════════
          5 — GALLERY (Desktop screenshots)
          ════════════════════════════════════════════ */}
      <div id="gallery">
        <AppScreensGallery />
      </div>

      {/* ════════════════════════════════════════════
          5b — MOBILE SHOWCASE (Phone mockups)
          ════════════════════════════════════════════ */}
      <AppMobileShowcase />

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
            background: 'linear-gradient(135deg, rgba(31, 111, 82, 0.08) 0%, rgba(11, 59, 51, 0.14) 100%)',
            border    : '1px solid rgba(31, 111, 82, 0.28)',
          }}
        >
          <div className="text-right">
            <p className="font-black text-lg center mb-1" style={{ color: '#1A2E28' }}>
              رأيت كيف يخدم إحكام كل دور في معهدك؟
            </p>
            <p className="text-sm" style={{ color: '#4A5D56' }}>
              الخطوة التالية: احسب اشتراك معهدك، وفريقنا يرافقك من أول يوم.
            </p>
          </div>
          <Link
            to="/request"
            className="btn-cta flex-shrink-0 rounded-xl whitespace-nowrap"
            style={{ fontSize: '0.9rem', padding: '0.9rem 2rem' }}
          >
            احسب اشتراك معهدك
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
      <motion.div
        id="network"
        variants={sectionIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <IhkaamByNumbers titleLead="المعاهد التي تعمل على إحكام" titleAccent="بالأرقام" />
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
        {/* الدعوة الأخيرة (2026-11-19 ج): لوحٌ داكن خلفه قرّاءٌ في الجامع الأموي */}
        <div className="section-dark relative max-w-6xl mx-auto rounded-[32px] overflow-hidden px-6 py-20 sm:py-24 text-center" dir="rtl" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <img src="/photos/umayyad-readers.webp" alt="" aria-hidden width={1000} height={534} loading="lazy" decoding="async"
               className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.28, zIndex: -1 }} />
          <div className="absolute inset-0" aria-hidden style={{ zIndex: -1, background: 'linear-gradient(180deg, rgba(8,44,38,0.55), rgba(8,44,38,0.92))' }} />
          <span className="eyebrow">ابدأ اليوم</span>
          <h2 className="font-bold mt-6 mb-5 leading-snug" style={{ color: '#F8F5EC', fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>
            معهدك يستحقّ ذاكرةً <span className="title-mark">لا تنسى طالباً</span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'rgba(248,245,236,0.82)', lineHeight: 1.9 }}>
            أرسل طلبك، ويتواصل معك فريق إحكام لإعداد معهدك وتفعيله خلال 24 ساعة.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/request" className="btn-cta inline-flex items-center gap-3 rounded-full w-full sm:w-auto justify-center px-9 py-4" style={{ fontSize: '1rem' }}>
              احسب اشتراك معهدك <ArrowLeft size={18} strokeWidth={2} />
            </Link>
            <button onClick={() => setFormOpen(true)} className="btn-outline inline-flex items-center gap-2 rounded-full w-full sm:w-auto justify-center px-9 py-4" style={{ fontSize: '1rem' }}>
              اطلب تجربة مجانية
            </button>
          </div>
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
