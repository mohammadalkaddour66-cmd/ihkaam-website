import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

/* Primary nav — for prospects discovering the product */
const PRIMARY_LINKS = [
  { label: 'الرئيسية',  to: '/'        },
  { label: 'المنصة',   to: '/ihkaam'  },
  { label: 'من نحن',   to: '/about'   },
  { label: 'المدونة',  to: '/blog'    },
  { label: 'الأسعار',   to: '/request' },
  { label: 'تواصل بنا', to: '/contact' },
  { label: 'الدعم',     to: '/help'    },
]

function LiveDot() {
  return (
    <span className="relative flex w-1.5 h-1.5 flex-shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
        style={{ background: '#1F6F52' }} />
      <span className="relative inline-flex rounded-full w-1.5 h-1.5"
        style={{ background: '#1F6F52' }} />
    </span>
  )
}

function scrollToHash(hash) {
  const id = hash.replace('#', '')
  const el = document.getElementById(id)
  if (!el) return false
  const top = el.getBoundingClientRect().top + window.scrollY - 112
  window.scrollTo({ top, behavior: 'smooth' })
  return true
}

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [open,       setOpen]       = useState(false)
  const { pathname } = useLocation()

  /* الصفحات ذات الشريط الفرعي (صفحة المنصة) تعلّم <html data-subnav>.
     فيها يختفي الشريط الرئيسي حين ينزل الزائر، فيصعد الفرعي مكانه، ويعود
     الرئيسي عند أول صعود. كان الاثنان مثبّتين معاً فيتراكبان (2026-11-19 هـ). */
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let lastY = window.scrollY
    const fn = () => {
      const y = window.scrollY
      setScrolled(y > 50)
      const hasSub = document.documentElement.hasAttribute('data-subnav')
      if (!hasSub || y < 140) setHidden(false)
      else if (y > lastY + 6) setHidden(true)
      else if (y < lastY - 6) setHidden(false)
      if (Math.abs(y - lastY) > 6) lastY = y
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const navHidden = hidden && !open
  useEffect(() => {
    const el = document.documentElement
    if (navHidden) el.setAttribute('data-nav-hidden', '')
    else el.removeAttribute('data-nav-hidden')
  }, [navHidden])

  /* close mobile menu when the route changes (adjusting state during render) */
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  /* Active check — pricing hash link shouldn't activate /ihkaam */
  const isActive = (to) => {
    if (to.includes('#')) return false
    return to === '/' ? pathname === '/' : pathname.startsWith(to)
  }

  return (
    /* شريط عائم بشكل كبسولة (2026-11-19): سطحٌ كريميّ بحدّ وظلّ ناعم،
       فيُقرأ فوق الأقسام الداكنة والفاتحة معاً دون تبديل ألوانه. */
    <header
      className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5 pt-3"
      style={{ transform: navHidden ? 'translateY(-110%)' : 'none', transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      <div
        className="nav-pill max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between rounded-2xl transition-shadow duration-500"
        style={{ boxShadow: scrolled ? '0 12px 32px -14px rgba(11, 59, 51, 0.28), 0 0 0 1px rgba(11, 59, 51, 0.10)' : '0 6px 20px -12px rgba(11, 59, 51, 0.22), 0 0 0 1px rgba(11, 59, 51, 0.08)' }}
      >

        {/* ── Logo ────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          {/* نسخة 128px لا 512px: هنا يُرسم الشعار بـ 56px، والملف الكبير كان
              يُنزَّل على كل صفحة في المسار الحرج. width/height صريحان كي لا
              يقفز الناڤبار قبل وصول الصورة. */}
          <img
            src="/ihkaam-logo-light-sm.png"
            alt="شعار منصة إحكام"
            width={56}
            height={56}
            fetchPriority="high"
            decoding="async"
            className="h-12 w-auto object-contain"
            
          />
          <div className="flex flex-col leading-tight" dir="rtl">
            <span className="font-black text-sm tracking-wide" style={{ color: '#1A2E28' }}>منصة إحكام</span>
            <span className="text-xs font-medium" style={{ color: '#5E6E67' }}>لإدارة المعاهد القرآنية</span>
          </div>
        </Link>

        {/* ── Desktop nav ─────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-6">
          {PRIMARY_LINKS.map(l => {
            const [linkPath, linkHash] = l.to.split('#')
            const alreadyOnPage = linkHash && pathname === linkPath

            const handleClick = alreadyOnPage
              ? (e) => { e.preventDefault(); scrollToHash('#' + linkHash) }
              : undefined

            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={handleClick}
                className="text-sm transition-colors duration-300 whitespace-nowrap flex items-center gap-1.5"
                style={{
                  color     : isActive(l.to) ? '#1A2E28' : '#4A5D56',
                  fontWeight: isActive(l.to) ? '600'     : '500',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1A2E28')}
                onMouseLeave={e => {
                  if (!isActive(l.to)) e.currentTarget.style.color = '#4A5D56'
                }}
              >
                {l.label}
                {l.live && <LiveDot />}
              </Link>
            )
          })}
        </nav>

        {/* ── Right cluster: CTA ──────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/request"
            className="btn-cta text-xs px-5 py-2 rounded-xl whitespace-nowrap"
          >
            احسب اشتراك معهدك
          </Link>
        </div>

        {/* ── Mobile burger ───────────────────────────── */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          className="md:hidden cursor-pointer transition-colors duration-300 -m-2.5 p-2.5 flex items-center justify-center"
          style={{ color: '#4A5D56' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1A2E28')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4A5D56')}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────── */}
      {open && (
        <div
          className="nav-pill md:hidden max-w-6xl mx-auto mt-2 px-6 py-5 flex flex-col gap-3 rounded-2xl"
          style={{ boxShadow: '0 18px 40px -16px rgba(11, 59, 51, 0.30), 0 0 0 1px rgba(11, 59, 51, 0.10)' }}
        >
          {PRIMARY_LINKS.map(l => {
            const [linkPath, linkHash] = l.to.split('#')
            const alreadyOnPage = linkHash && pathname === linkPath
            const handleClick = alreadyOnPage
              ? (e) => { e.preventDefault(); scrollToHash('#' + linkHash); setOpen(false) }
              : () => setOpen(false)

            return (
            <Link
              key={l.to}
              to={l.to}
              onClick={handleClick}
              className="py-3 transition-colors duration-300 text-sm flex items-center gap-1.5"
              style={{
                color     : isActive(l.to) ? '#1A2E28' : '#4A5D56',
                fontWeight: isActive(l.to) ? '600'     : '500',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1A2E28')}
              onMouseLeave={e => {
                if (!isActive(l.to)) e.currentTarget.style.color = '#4A5D56'
              }}
            >
              {l.label}
              {l.live && <LiveDot />}
            </Link>
            )
          })}

          <Link
            to="/request"
            onClick={() => setOpen(false)}
            className="btn-cta text-sm py-2.5 rounded-xl text-center mt-1 w-full block"
          >
            احسب اشتراك معهدك
          </Link>
        </div>
      )}
    </header>
  )
}
