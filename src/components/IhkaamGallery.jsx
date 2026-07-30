import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, ChevronLeft, ChevronRight, Layers, ZoomIn, ZoomOut, RotateCcw, RotateCw } from 'lucide-react'
import { supabase } from '../config/supabaseClient'
import { useIsMobile } from '../hooks/useIsMobile'
import { useSwipe } from '../hooks/useSwipe'
import { galleryImage } from '../config/imageUrl'

/* ── media query تفاعلي (يتحدّث فور قلب الجهاز) ──
   useSyncExternalStore لا useState+useEffect: matchMedia مصدرٌ خارجي، وقراءته
   بأثرٍ كانت تفرض رسمةً ثانية على كل تركيب — والمعرض يُركَّب داخل مشهدٍ فيه
   حركة، فالرسمة الزائدة تُرى. تقرأ الآن أثناء الرسم لا بعده. */
function useMedia(query) {
  const subscribe = useCallback((onChange) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,               // لا نافذة أثناء التصيير على الخادم
  )
}

/* ── Browser chrome bar ── */
function ChromeBar({ dark = false }) {
  return (
    <div style={{
      background   : dark ? '#09201E' : '#09201E',
      padding      : '9px 14px',
      display      : 'flex',
      alignItems   : 'center',
      gap          : 6,
      borderBottom : '1px solid rgba(255,255,255,0.05)',
      flexShrink   : 0,
    }}>
      {['#FF5F57','#FFBD2E','#28C8C3'].map((c,i) => (
        <div key={i} style={{ width:10,height:10,borderRadius:'50%',background:c,opacity:0.75 }} />
      ))}
      <div style={{
        flex:'1',height:18,borderRadius:8,
        background:'rgba(255,255,255,0.06)',
        marginInlineStart:8,
        display:'flex',alignItems:'center',justifyContent:'center',
      }}>
        <span style={{ fontSize:'0.6rem',color:'rgba(255,255,255,0.20)',fontFamily:'monospace',letterSpacing:'0.04em' }}>
          ihkaam.app
        </span>
      </div>
    </div>
  )
}

/* ── Lightbox nav arrow ── */
function NavBtn({ dir, canGo, zoom, onClick, size = 52 }) {
  const iconSize = size <= 40 ? 18 : 22
  return (
    <button
      onClick={onClick}
      disabled={!canGo && zoom === 1}
      style={{
        flexShrink:0, width:size, height:size, borderRadius:'50%',
        border:`1px solid ${(canGo||zoom>1)?'rgba(72,214,205,0.45)':'rgba(255,255,255,0.06)'}`,
        background:(canGo||zoom>1)?'rgba(72,214,205,0.14)':'rgba(255,255,255,0.02)',
        color:(canGo||zoom>1)?'#48D6CD':'rgba(255,255,255,0.12)',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:(canGo||zoom>1)?'pointer':'not-allowed', transition:'all 180ms ease',
      }}
      onMouseEnter={e => (canGo||zoom>1) && (e.currentTarget.style.background='rgba(72,214,205,0.28)')}
      onMouseLeave={e => (canGo||zoom>1) && (e.currentTarget.style.background='rgba(72,214,205,0.14)')}
    >
      {dir === -1 ? <ChevronRight size={iconSize} strokeWidth={2}/> : <ChevronLeft size={iconSize} strokeWidth={2}/>}
    </button>
  )
}

/* ── Lightbox zoom control button ── */
function ZoomBtn({ icon: Icon, onClick: handle, disabled: dis }) {
  return (
    <button onClick={handle} disabled={dis} style={{
      width:34, height:34, borderRadius:'50%', border:'none',
      background: dis ? 'rgba(255,255,255,0.04)' : 'rgba(72,214,205,0.14)',
      color: dis ? 'rgba(255,255,255,0.20)' : '#48D6CD',
      display:'flex', alignItems:'center', justifyContent:'center',
      cursor: dis ? 'not-allowed' : 'pointer', transition:'background 180ms ease',
    }}
      onMouseEnter={e => { if(!dis) e.currentTarget.style.background='rgba(72,214,205,0.28)' }}
      onMouseLeave={e => { if(!dis) e.currentTarget.style.background='rgba(72,214,205,0.14)' }}
    >
      <Icon size={15} strokeWidth={2}/>
    </button>
  )
}

/* ── Lightbox ── */
function Lightbox({ items, index, onClose, onNav }) {
  const item      = items[index]
  const canPrev   = index > 0
  const canNext   = index < items.length - 1
  const isMobile  = useIsMobile()

  /* اتجاه الجهاز — لنقترح القلب الأفقي فقط وقت ما يفيد فعلاً */
  const isPortrait = useMedia('(orientation: portrait)')

  /* ملء الشاشة: الهاتف بالوضع الأفقي.
     لا نعتمد على useIsMobile هنا — عتبته max-width:639px، والهاتف أفقياً
     عرضه ~740px فما كان ينطبق عليه أصلاً. القيد الحقيقي هو قِصَر الارتفاع،
     وهو ما يميّز الهاتف الأفقي عن شاشة المكتب. */
  const full = useMedia('(orientation: landscape) and (max-height: 560px)')

  /* واجهة مضغوطة: أسهم طافية وقياسات أصغر */
  const compact = isMobile || full

  const [zoom,     setZoom]     = useState(1)
  const [pan,      setPan]      = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const didDrag    = useRef(false)
  const imgWrap    = useRef(null)

  const resetZoom = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [])

  /* reset zoom/pan when the displayed image changes (adjusting state during render) */
  const [lastIndex, setLastIndex] = useState(index)
  if (index !== lastIndex) {
    setLastIndex(index)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  /* keyboard */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape')      { if (zoom > 1) resetZoom(); else onClose() }
      if (e.key === 'ArrowRight' && zoom === 1) canPrev && onNav(-1)
      if (e.key === 'ArrowLeft'  && zoom === 1) canNext && onNav(1)
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(4, +(z + 0.5).toFixed(1)))
      if (e.key === '-')                  setZoom(z => { const n = Math.max(1, +(z - 0.5).toFixed(1)); if (n === 1) setPan({x:0,y:0}); return n })
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose, onNav, canPrev, canNext, zoom, resetZoom])

  /* wheel zoom */
  useEffect(() => {
    const el = imgWrap.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.25 : -0.25
      setZoom(z => {
        const n = Math.min(4, Math.max(1, +(z + delta).toFixed(2)))
        if (n === 1) setPan({ x: 0, y: 0 })
        return n
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  /* drag pan */
  const onMouseDown = (e) => {
    if (zoom <= 1) return
    e.preventDefault()
    didDrag.current = false
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
    setDragging(true)
  }
  const onMouseMove = (e) => {
    if (!dragging) return
    const dx = e.clientX - dragOrigin.current.mx
    const dy = e.clientY - dragOrigin.current.my
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true
    setPan({ x: dragOrigin.current.px + dx, y: dragOrigin.current.py + dy })
  }
  const onMouseUp = () => setDragging(false)

  /* click: toggle 1x ↔ 2x when not dragging */
  const onImgClick = () => {
    if (didDrag.current) return
    if (zoom > 1) resetZoom()
    else setZoom(2)
  }

  const cursor = zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in'

  const swipe = useSwipe(
    () => { if (zoom === 1) canNext && onNav(1) },
    () => { if (zoom === 1) canPrev && onNav(-1) }
  )

  /* Portal إلى <body> — بدونه يبقى الـoverlay حبيس سياق تكديس الصفحة
     (Layout يضع المحتوى داخل div بـzIndex:10) فيطفو فوقه زر واتساب z-999 */
  return createPortal(
    <motion.div className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background:'rgba(0,0,0,0.94)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)' }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <motion.div dir="rtl"
        className={full ? 'relative w-full h-full' : 'relative mx-2 sm:mx-4 w-full max-w-4xl'}
        initial={{ opacity:0, scale: full ? 0.97 : 0.90, y: full ? 0 : 32 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95 }} transition={{ duration:0.30, ease:[0.22,1,0.36,1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top bar ── ملء الشاشة: يطفو فوق الصورة بدل ما يقتطع من ارتفاعها */}
        <div style={full
          ? { position:'absolute', top:10, insetInline:12, zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between' }
          : compact
            ? { position:'relative', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between' }
            : { position:'absolute', top:-52, inset:'auto 0 auto 0', display:'flex', alignItems:'center', justifyContent:'space-between' }
        }>
          {/* العدّاد — انظر .num-seq في index.css */}
          <span className="num-seq" style={{ color:'rgba(229,211,179,0.35)', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.06em', lineHeight:'40px' }}>
            {index+1} / {items.length}
          </span>

          {/* Zoom controls */}
          <div style={{ display:'flex', alignItems:'center', gap:6,
            background:'rgba(2,15,14,0.80)', borderRadius:24, padding:'4px 10px',
            border:'1px solid rgba(72,214,205,0.18)' }}>
            <ZoomBtn icon={ZoomOut} onClick={() => setZoom(z => { const n=Math.max(1,+(z-0.5).toFixed(1)); if(n===1)setPan({x:0,y:0}); return n })} disabled={zoom<=1}/>
            <span style={{ color: zoom>1?'#6AFFF5':'rgba(229,211,179,0.30)', fontSize:'0.70rem', fontWeight:800,
              minWidth:36, textAlign:'center', letterSpacing:'0.04em', transition:'color 200ms ease' }}>
              {Math.round(zoom*100)}%
            </span>
            <ZoomBtn icon={ZoomIn}  onClick={() => setZoom(z => Math.min(4,+(z+0.5).toFixed(1)))} disabled={zoom>=4}/>
            {zoom > 1 && (
              <ZoomBtn icon={RotateCcw} onClick={resetZoom} disabled={false}/>
            )}
          </div>

          {/* Close */}
          <button onClick={onClose} style={{
            width:40, height:40, borderRadius:'50%',
            border:'1px solid rgba(229,211,179,0.18)', background:'rgba(9,32,30,0.70)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#EAE4DF',
          }}>
            <X size={16}/>
          </button>
        </div>

        {/* ── Nav + image ──
             على الموبايل الأسهم تطفو فوق الصورة بدل ما تاكل من عرضها */}
        <div style={{ display:'flex', alignItems:'center', gap: compact ? 0 : 16, position:'relative',
          height: full ? '100%' : undefined }} {...swipe}>
          <div style={compact
            ? { position:'absolute', insetInlineStart:6, top:'50%', transform:'translateY(-50%)', zIndex:5 }
            : undefined}>
            <NavBtn dir={-1} canGo={canPrev} zoom={zoom} size={compact ? 38 : 52} onClick={() => { if (zoom > 1) resetZoom(); else canPrev && onNav(-1) }}/>
          </div>

          <div ref={imgWrap} style={full ? {
            flex:1, height:'100%', overflow:'hidden', userSelect:'none', background:'#020F0E',
          } : {
            flex:1, borderRadius:18, overflow:'hidden',
            border:`1px solid ${zoom>1?'rgba(72,214,205,0.25)':'rgba(229,211,179,0.08)'}`,
            boxShadow: zoom>1 ? '0 60px 140px rgba(0,0,0,0.80), 0 0 0 1px rgba(72,214,205,0.15)' : '0 60px 140px rgba(0,0,0,0.80)',
            transition:'border 250ms ease, box-shadow 250ms ease',
            userSelect:'none',
          }}>
            {/* شريط المتصفح زخرفة — يُحذف بملء الشاشة لصالح البكسلات */}
            {!full && <ChromeBar dark />}
            {/* Overflow viewport */}
            <div style={{ overflow:'hidden', position:'relative', background:'#020F0E',
              ...(full ? { height:'100%', display:'flex', alignItems:'center', justifyContent:'center' } : null) }}>
              <AnimatePresence mode="wait">
                <motion.div key={item.id}
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  transition={{ duration:0.20 }}
                  style={{
                    transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
                    transformOrigin:'center center',
                    transition: dragging ? 'none' : 'transform 220ms cubic-bezier(0.22,1,0.36,1)',
                    cursor,
                    willChange:'transform',
                  }}
                  onMouseDown={onMouseDown}
                  onClick={onImgClick}
                >
                  {/* svh يستثني أشرطة المتصفح المتحركة — مهم بالوضع الأفقي */}
                  <img src={item.image_url} alt={item.title} draggable={false}
                    style={full ? {
                      width:'100vw', height:'100svh', display:'block', pointerEvents:'none',
                      objectFit:'contain',
                    } : {
                      width:'100%', height:'auto', display:'block', pointerEvents:'none',
                      maxHeight: isPortrait ? 'calc(100svh - 190px)' : 'calc(100svh - 230px)',
                      objectFit:'contain', margin:'0 auto',
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* تلميح — على الموبايل الطولي ننصح بقلب الجهاز، لأن اللقطة 16:9 */}
              {zoom === 1 && (
                <div style={{
                  position:'absolute', bottom: full ? 48 : 10, left:'50%', transform:'translateX(-50%)',
                  background:'rgba(0,0,0,0.60)', borderRadius:20, padding:'4px 12px',
                  color:'rgba(255,255,255,0.42)', fontSize: compact ? '0.6rem' : '0.65rem', fontWeight:600,
                  pointerEvents:'none', whiteSpace:'nowrap', letterSpacing:'0.04em',
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  {isPortrait
                    ? <><RotateCw size={11}/> أدر جهازك أفقياً لعرض أوضح</>
                    : compact
                      ? 'انقر للتكبير · اسحب للتنقل'
                      : 'انقر للتكبير · اسحب عجلة الماوس للزوم'}
                </div>
              )}
            </div>
          </div>

          <div style={compact
            ? { position:'absolute', insetInlineEnd:6, top:'50%', transform:'translateY(-50%)', zIndex:5 }
            : undefined}>
            <NavBtn dir={1} canGo={canNext} zoom={zoom} size={compact ? 38 : 52} onClick={() => { if (zoom > 1) resetZoom(); else canNext && onNav(1) }}/>
          </div>
        </div>

        {/* ── Meta ── بملء الشاشة يطفو فوق أسفل الصورة على تدرّج، لا يزيحها */}
        <div style={full ? {
          position:'absolute', insetInline:0, bottom:0, zIndex:10,
          display:'flex', alignItems:'center', gap:10, padding:'28px 16px 10px',
          background:'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
          pointerEvents:'none',
        } : {
          marginTop: compact ? 10 : 20, display:'flex', alignItems:'center', gap:10,
          paddingInline: compact ? 8 : 68,
        }}>
          <span style={{
            background:'rgba(72,214,205,0.15)', border:'1px solid rgba(72,214,205,0.30)',
            color:'#48D6CD', fontSize:'0.68rem', fontWeight:700, padding:'3px 12px',
            borderRadius:20, whiteSpace:'nowrap',
          }}>{item.category}</span>
          <h3 style={{ color:'#EAE4DF', fontWeight:800, fontSize: full ? '0.9rem' : 'clamp(0.95rem,2vw,1.2rem)', margin:0 }}>
            {item.title}
          </h3>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

/* ── Gallery card ── */
function GalleryCard({ item, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex-1 flex flex-col"
      animate={{ y: hov ? -8 : 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        borderRadius: 18,
        overflow    : 'hidden',
        background  : '#020F0E',
        border      : `1px solid ${hov ? 'rgba(72,214,205,0.50)' : 'rgba(255,255,255,0.07)'}`,
        cursor      : 'pointer',
        boxShadow   : hov
          ? '0 32px 72px rgba(0,0,0,0.65), 0 0 40px rgba(72,214,205,0.12)'
          : '0 8px 32px rgba(0,0,0,0.40)',
        transition  : 'border 220ms ease, box-shadow 220ms ease',
      }}
    >
      <ChromeBar />

      {/* Image */}
      <div style={{ position:'relative', aspectRatio:'16/9', overflow:'hidden', background:'#020F0E' }}>
        <img
          src={galleryImage(item.image_url, 600)} alt={item.title} loading="lazy" decoding="async"
          style={{
            width:'100%', height:'100%', objectFit:'cover', display:'block',
            transform: hov ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 380ms ease',
          }}
        />
        {/* Hover overlay */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to top, rgba(2,15,14,0.85) 0%, rgba(2,15,14,0.20) 60%, transparent 100%)',
          opacity: hov ? 1 : 0, transition:'opacity 220ms ease', pointerEvents:'none',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          <div style={{
            width:52, height:52, borderRadius:'50%',
            background:'rgba(72,214,205,0.20)', border:'1px solid rgba(72,214,205,0.50)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Maximize2 size={20} style={{ color:'#6AFFF5' }}/>
          </div>
          <span style={{ color:'#E5D3B3', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.10em' }}>
            عرض مكبّر
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding:'14px 18px', display:'flex', alignItems:'center', gap:10,
        background: hov ? 'rgba(72,214,205,0.05)' : 'transparent',
        transition:'background 220ms ease',
        borderTop:'1px solid rgba(255,255,255,0.04)',
      }}>
        <span style={{
          background:'rgba(72,214,205,0.13)', border:'1px solid rgba(72,214,205,0.25)',
          color:'#48D6CD', fontSize:'0.62rem', fontWeight:700,
          padding:'2px 10px', borderRadius:20, flexShrink:0, whiteSpace:'nowrap',
        }}>{item.category}</span>
        <span style={{
          color: hov ? '#EAE4DF' : '#B0C8C4',
          fontSize:'0.83rem', fontWeight:600,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          transition:'color 200ms ease',
        }}>{item.title}</span>
      </div>
    </motion.div>
  )
}

/* ── Arrow button ── */
function Arrow({ icon: Icon, onClick, disabled }) {
  const isMobile = useIsMobile()
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-8 h-8 sm:w-[52px] sm:h-[52px]"
      style={{
      borderRadius:'50%', flexShrink:0,
      border:`1px solid ${disabled ? 'rgba(255,255,255,0.05)' : 'rgba(72,214,205,0.40)'}`,
      background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(72,214,205,0.10)',
      color: disabled ? 'rgba(255,255,255,0.15)' : '#48D6CD',
      display:'flex', alignItems:'center', justifyContent:'center',
      cursor: disabled ? 'not-allowed' : 'pointer', transition:'all 200ms ease',
    }}
      onMouseEnter={e => { if(!disabled){
        e.currentTarget.style.background='rgba(72,214,205,0.24)'
        e.currentTarget.style.borderColor='rgba(72,214,205,0.70)'
        e.currentTarget.style.boxShadow='0 0 20px rgba(72,214,205,0.20)'
      }}}
      onMouseLeave={e => { if(!disabled){
        e.currentTarget.style.background='rgba(72,214,205,0.10)'
        e.currentTarget.style.borderColor='rgba(72,214,205,0.40)'
        e.currentTarget.style.boxShadow='none'
      }}}
    >
      <Icon size={isMobile ? 15 : 22} strokeWidth={2}/>
    </button>
  )
}

/* ── Main ── */
export default function IhkaamGallery() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [idx,     setIdx]     = useState(0)
  const [dir,     setDir]     = useState(1)
  const [lbIndex, setLbIndex] = useState(null)
  const isMobile = useIsMobile()
  const VISIBLE = isMobile ? 1 : 2

  const pageCount   = Math.ceil(items.length / VISIBLE)
  const currentPage = Math.floor(idx / VISIBLE)

  const go = (delta) => {
    const nextPage = Math.max(0, Math.min(pageCount - 1, currentPage + delta))
    setDir(delta)
    setIdx(nextPage * VISIBLE)
  }

  const swipe = useSwipe(() => go(1), () => go(-1))

  useEffect(() => {
    supabase.from('gallery_items').select('id,title,category,image_url,order_index')
      .eq('is_active', true).order('order_index', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setItems(data.filter(d => d.category !== 'هاتف'))
        setLoading(false)
      })
  }, [])

  if (loading || !items.length) return null

  const visible = items.slice(idx, idx + VISIBLE)
  while (visible.length < VISIBLE && items.length > VISIBLE) visible.push(null)

  /* "أكثر من X" — round down to nearest 5 for "wow" framing */
  const displayCount = Math.floor(items.length / 5) * 5

  return (
    <>
      <section
        className="relative z-10 py-24 overflow-hidden"
        style={{ background:'#020F0E' }}
        dir="rtl"
      >
        {/* Top ambient */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px]"
          style={{ background:'radial-gradient(ellipse at top, rgba(72,214,205,0.06) 0%, transparent 70%)' }} aria-hidden/>

        {/* ── Header ── */}
        <div className="max-w-6xl mx-auto px-6 mb-14">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 text-center md:text-right">

            {/* Left: text */}
            <div>
              <span className="block text-xs font-semibold tracking-[0.22em] uppercase mb-4"
                style={{ color:'#48D6CD' }}>
                معرض لقطات النظام
              </span>
              <h2 className="font-black leading-tight mb-3"
                style={{ color:'#EAE4DF', fontSize:'clamp(1.6rem,3.2vw,2.4rem)' }}>
                كل واجهة صُممت بعناية فائقة
              </h2>
              <p className="leading-[1.9] mx-auto md:mx-0"
                style={{ color:'#96BCBE', fontSize:'clamp(0.82rem,1.3vw,0.92rem)', maxWidth:420 }}>
                استعرض واجهات النظام التي يتعامل معها الإداريون والمعلمون يومياً.
              </p>
            </div>

            {/* Right: big stat */}
            <motion.div
              initial={{ opacity:0, scale:0.85, y:20 }}
              whileInView={{ opacity:1, scale:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.55, ease:[0.22,1,0.36,1], delay:0.15 }}
              className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-5 py-3 sm:px-8 sm:py-5 self-center md:self-auto"
              style={{
                background:'linear-gradient(135deg, rgba(72,214,205,0.10) 0%, rgba(9,32,30,0.80) 100%)',
                border:'1px solid rgba(72,214,205,0.28)',
                boxShadow:'0 0 40px rgba(72,214,205,0.08)',
              }}
            >
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-black" style={{ fontSize:'clamp(1.8rem,7vw,3.2rem)', color:'#6AFFF5', lineHeight:1 }}>
                  +{displayCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={13} style={{ color:'#48D6CD' }}/>
                <span className="text-xs font-bold tracking-wide" style={{ color:'#96BCBE' }}>
                 واجهة لخدمة أهل القرآن
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Carousel ── */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-5 w-full mb-8">
            <Arrow icon={ChevronRight} onClick={() => go(-1)} disabled={currentPage <= 0}/>

            <div className="flex-1 overflow-hidden" {...swipe}>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={idx}
                  custom={dir}
                  variants={{
                    enter : d => ({ opacity:0, x: d > 0 ? -90 : 90 }),
                    center: ()  => ({ opacity:1, x:0 }),
                    exit  : d => ({ opacity:0, x: d > 0 ? 90 : -90 }),
                  }}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration:0.38, ease:[0.22,1,0.36,1] }}
                  className="flex gap-5"
                >
                  {visible.map((item, i) =>
                    item
                      ? <GalleryCard key={item.id} item={item} onClick={() => setLbIndex(items.indexOf(item))}/>
                      : <div key={`empty-${i}`} className="flex-1"/>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <Arrow icon={ChevronLeft} onClick={() => go(1)} disabled={currentPage >= pageCount - 1}/>
          </div>

          {/* ── Page dots + counter ── */}
          <div className="flex items-center justify-center gap-3 mt-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button key={i}
                onClick={() => { setDir(i > currentPage ? 1 : -1); setIdx(i * VISIBLE) }}
                style={{
                  width: i === currentPage ? 28 : 7,
                  height: 7,
                  borderRadius: 4,
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  background: i === currentPage
                    ? 'linear-gradient(90deg, #48D6CD, #6AFFF5)'
                    : 'rgba(72,214,205,0.18)',
                  transition: 'width 300ms cubic-bezier(0.22,1,0.36,1), background 300ms ease',
                  outline: 'none',
                }}
              />
            ))}
            {/* num-seq: يمنع انقلاب «1/37» إلى «37/1» في صفحة RTL */}
            <span className="num-seq" style={{
              color:'rgba(72,214,205,0.35)', fontSize:'0.68rem', fontWeight:700,
              marginInlineStart:8, letterSpacing:'0.06em',
            }}>
              {currentPage + 1}/{pageCount}
            </span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lbIndex !== null && (
          <Lightbox key="lb" items={items} index={lbIndex}
            onClose={() => setLbIndex(null)}
            onNav={(d) => setLbIndex(i => Math.min(items.length-1, Math.max(0, i+d)))}
          />
        )}
      </AnimatePresence>
    </>
  )
}
