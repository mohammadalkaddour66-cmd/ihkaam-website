import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingBg  from './FloatingBg'
import Navbar      from './Navbar'
import Footer      from './Footer'
import { useIsMobile } from '../hooks/useIsMobile'

/* Pages that render their own persistent mobile bottom action bar —
   the WhatsApp button needs to lift above it there so they don't overlap. */
const PAGES_WITH_MOBILE_STICKY_BAR = ['/request']

/* Scroll to top on route change — skip when hash present */
function ScrollReset() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    /* Hash navigation: wait for page-enter animation (300ms) then scroll */
    const id = hash.replace('#', '')
    const t = setTimeout(() => {
      const el = document.getElementById(id)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 90
      window.scrollTo({ top, behavior: 'smooth' })
    }, 320)
    return () => clearTimeout(t)
  }, [pathname, hash])
  return null
}

const WA_NUMBER = '963951590406'
const WA_MESSAGE = encodeURIComponent('السلام عليكم، أريد الاستفسار عن منصة إحكام')

function WhatsAppButton() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isMobile = useIsMobile()
  const { pathname } = useLocation()
  const liftForStickyBar = isMobile && PAGES_WITH_MOBILE_STICKY_BAR.includes(pathname)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position  : 'fixed',
        bottom    : liftForStickyBar ? '5.5rem' : '1.75rem',
        left      : '1.75rem',
        zIndex    : 999,
        display   : 'flex',
        alignItems: 'center',
        gap       : '0.6rem',
        borderRadius: '999px',
        padding   : hovered ? '0.72rem 1.1rem 0.72rem 0.72rem' : '0.72rem',
        background: '#25D366',
        boxShadow : hovered
          ? '0 8px 32px rgba(37,211,102,0.50), 0 2px 8px rgba(0,0,0,0.25)'
          : '0 4px 20px rgba(37,211,102,0.38), 0 2px 8px rgba(0,0,0,0.22)',
        opacity   : visible ? 1 : 0,
        transform : visible ? 'scale(1)' : 'scale(0.7)',
        transition: 'all 0.30s cubic-bezier(0.22,1,0.36,1)',
        textDecoration: 'none',
        overflow  : 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {/* WhatsApp SVG icon */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>

      {/* Tooltip label — slides in on hover */}
      <span style={{
        maxWidth  : hovered ? '140px' : '0px',
        opacity   : hovered ? 1 : 0,
        overflow  : 'hidden',
        transition: 'max-width 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease',
        color     : 'white',
        fontWeight: 700,
        fontSize  : '0.82rem',
        direction : 'rtl',
      }}>
        تواصل معنا
      </span>
    </a>
  )
}

export default function Layout() {
  const location = useLocation()

  return (
    <div className="relative" style={{ overflowX: 'hidden' }}>
      <FloatingBg />
      <ScrollReset />
      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname}
            className="relative z-10 min-h-screen"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
      <WhatsAppButton />
    </div>
  )
}
