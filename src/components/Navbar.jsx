import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import DemoRequestForm from './DemoRequestForm'

/* Primary nav — for prospects discovering the product */
const PRIMARY_LINKS = [
  { label: 'الرئيسية',  to: '/'        },
  { label: 'المنصة',   to: '/ihkaam'  },
  { label: 'المدونة',  to: '/blog'    },
  { label: 'الأسعار',   to: '/request' },
  { label: 'تواصل بنا', to: '/contact' },
  { label: 'الدعم',     to: '/help'    },
]

function LiveDot() {
  return (
    <span className="relative flex w-1.5 h-1.5 flex-shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
        style={{ background: '#6ABDB2' }} />
      <span className="relative inline-flex rounded-full w-1.5 h-1.5"
        style={{ background: '#6ABDB2' }} />
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
  const [formOpen,   setFormOpen]   = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

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
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        background          : scrolled ? 'rgba(1,13,13,0.88)' : 'rgba(1,13,13,0.55)',
        backdropFilter      : 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom        : scrolled
          ? '1px solid rgba(2,115,104,0.18)'
          : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── Logo ────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src="/ihkaam-logo.png"
            alt="إحكام"
            className="h-14 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(106,189,178,0.30))' }}
          />
          <div className="flex flex-col leading-tight" dir="rtl">
            <span className="font-black text-sm tracking-wide" style={{ color: '#EAE4DF' }}>منصة إحكام</span>
            <span className="text-[10px] font-medium tracking-widest" style={{ color: '#4A7A6A' }}>لإدارة المعاهد القرآنية</span>
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
                  color     : isActive(l.to) ? '#EAE4DF' : '#7A9E96',
                  fontWeight: isActive(l.to) ? '600'     : '500',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#EAE4DF')}
                onMouseLeave={e => {
                  if (!isActive(l.to)) e.currentTarget.style.color = '#7A9E96'
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
          <button
            onClick={() => setFormOpen(true)}
            className="btn-cta text-xs px-5 py-2 rounded-xl whitespace-nowrap cursor-pointer"
          >
            اطلب تجربة مجانية
          </button>
        </div>

        {/* ── Mobile burger ───────────────────────────── */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          className="md:hidden cursor-pointer transition-colors duration-300 -m-2.5 p-2.5 flex items-center justify-center"
          style={{ color: '#7A9E96' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#EAE4DF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#7A9E96')}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {createPortal(
        <AnimatePresence>
          {formOpen && <DemoRequestForm key="demo-form" onClose={() => setFormOpen(false)} />}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Mobile drawer ───────────────────────────────── */}
      {open && (
        <div
          className="md:hidden px-6 py-5 flex flex-col gap-3"
          style={{
            background: 'rgba(1,13,13,0.97)',
            borderTop : '1px solid rgba(2,115,104,0.18)',
          }}
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
                color     : isActive(l.to) ? '#EAE4DF' : '#7A9E96',
                fontWeight: isActive(l.to) ? '600'     : '500',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#EAE4DF')}
              onMouseLeave={e => {
                if (!isActive(l.to)) e.currentTarget.style.color = '#7A9E96'
              }}
            >
              {l.label}
              {l.live && <LiveDot />}
            </Link>
            )
          })}

          <button
            onClick={() => { setFormOpen(true); setOpen(false) }}
            className="btn-cta text-sm py-2.5 rounded-xl text-center mt-1 w-full cursor-pointer"
          >
            اطلب تجربة مجانية
          </button>
        </div>
      )}
    </header>
  )
}
