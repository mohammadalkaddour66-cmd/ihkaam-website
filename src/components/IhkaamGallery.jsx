import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, ChevronLeft, ChevronRight, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { supabase } from '../config/supabaseClient'
import { useIsMobile } from '../hooks/useIsMobile'
import { useSwipe } from '../hooks/useSwipe'

/* ── Browser chrome bar ── */
function ChromeBar({ dark = false }) {
  return (
    <div style={{
      background   : dark ? '#011E1E' : '#012626',
      padding      : '9px 14px',
      display      : 'flex',
      alignItems   : 'center',
      gap          : 6,
      borderBottom : '1px solid rgba(255,255,255,0.05)',
      flexShrink   : 0,
    }}>
      {['#FF5F57','#FFBD2E','#28C840'].map((c,i) => (
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
        border:`1px solid ${(canGo||zoom>1)?'rgba(0,168,150,0.45)':'rgba(255,255,255,0.06)'}`,
        background:(canGo||zoom>1)?'rgba(0,168,150,0.14)':'rgba(255,255,255,0.02)',
        color:(canGo||zoom>1)?'#6ABDB2':'rgba(255,255,255,0.12)',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:(canGo||zoom>1)?'pointer':'not-allowed', transition:'all 180ms ease',
      }}
      onMouseEnter={e => (canGo||zoom>1) && (e.currentTarget.style.background='rgba(0,168,150,0.28)')}
      onMouseLeave={e => (canGo||zoom>1) && (e.currentTarget.style.background='rgba(0,168,150,0.14)')}
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
      background: dis ? 'rgba(255,255,255,0.04)' : 'rgba(0,168,150,0.14)',
      color: dis ? 'rgba(255,255,255,0.20)' : '#6ABDB2',
      display:'flex', alignItems:'center', justifyContent:'center',
      cursor: dis ? 'not-allowed' : 'pointer', transition:'background 180ms ease',
    }}
      onMouseEnter={e => { if(!dis) e.currentTarget.style.background='rgba(0,168,150,0.28)' }}
      onMouseLeave={e => { if(!dis) e.currentTarget.style.background='rgba(0,168,150,0.14)' }}
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

  return (
    <motion.div className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background:'rgba(0,0,0,0.94)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)' }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <motion.div className="relative mx-4 w-full max-w-4xl" dir="rtl"
        initial={{ opacity:0, scale:0.90, y:32 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95 }} transition={{ duration:0.30, ease:[0.22,1,0.36,1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div style={isMobile
          ? { position:'relative', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }
          : { position:'absolute', top:-52, inset:'auto 0 auto 0', display:'flex', alignItems:'center', justifyContent:'space-between' }
        }>
          {/* Counter */}
          <span style={{ color:'rgba(229,211,179,0.35)', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.06em', lineHeight:'40px' }}>
            {index+1} / {items.length}
          </span>

          {/* Zoom controls */}
          <div style={{ display:'flex', alignItems:'center', gap:6,
            background:'rgba(1,22,22,0.80)', borderRadius:24, padding:'4px 10px',
            border:'1px solid rgba(0,168,150,0.18)' }}>
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
            border:'1px solid rgba(229,211,179,0.18)', background:'rgba(1,38,38,0.70)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#EAE4DF',
          }}>
            <X size={16}/>
          </button>
        </div>

        {/* ── Nav + image ── */}
        <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 8 : 16 }} {...swipe}>
          <NavBtn dir={-1} canGo={canPrev} zoom={zoom} size={isMobile ? 40 : 52} onClick={() => { if (zoom > 1) resetZoom(); else canPrev && onNav(-1) }}/>

          <div ref={imgWrap} style={{
            flex:1, borderRadius:18, overflow:'hidden',
            border:`1px solid ${zoom>1?'rgba(0,168,150,0.25)':'rgba(229,211,179,0.08)'}`,
            boxShadow: zoom>1 ? '0 60px 140px rgba(0,0,0,0.80), 0 0 0 1px rgba(0,168,150,0.15)' : '0 60px 140px rgba(0,0,0,0.80)',
            transition:'border 250ms ease, box-shadow 250ms ease',
            userSelect:'none',
          }}>
            <ChromeBar dark />
            {/* Overflow viewport */}
            <div style={{ overflow:'hidden', position:'relative', background:'#010E0E' }}>
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
                  <img src={item.image_url} alt={item.title} draggable={false}
                    style={{ width:'100%', height:'auto', display:'block', pointerEvents:'none' }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Zoom hint — shows briefly on first open */}
              {zoom === 1 && (
                <div style={{
                  position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)',
                  background:'rgba(0,0,0,0.55)', borderRadius:20, padding:'4px 14px',
                  color:'rgba(255,255,255,0.35)', fontSize:'0.65rem', fontWeight:600,
                  pointerEvents:'none', whiteSpace:'nowrap', letterSpacing:'0.04em',
                }}>
                  انقر للتكبير · اسحب عجلة الماوس للزوم
                </div>
              )}
            </div>
          </div>

          <NavBtn dir={1} canGo={canNext} zoom={zoom} size={isMobile ? 40 : 52} onClick={() => { if (zoom > 1) resetZoom(); else canNext && onNav(1) }}/>
        </div>

        {/* ── Meta ── */}
        <div style={{ marginTop:20, display:'flex', alignItems:'center', gap:12, paddingInline: isMobile ? 8 : 68 }}>
          <span style={{
            background:'rgba(0,168,150,0.15)', border:'1px solid rgba(0,168,150,0.30)',
            color:'#00A896', fontSize:'0.68rem', fontWeight:700, padding:'3px 12px',
            borderRadius:20, whiteSpace:'nowrap',
          }}>{item.category}</span>
          <h3 style={{ color:'#EAE4DF', fontWeight:800, fontSize:'clamp(0.95rem,2vw,1.2rem)', margin:0 }}>
            {item.title}
          </h3>
        </div>
      </motion.div>
    </motion.div>
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
        background  : '#010E0E',
        border      : `1px solid ${hov ? 'rgba(0,168,150,0.50)' : 'rgba(255,255,255,0.07)'}`,
        cursor      : 'pointer',
        boxShadow   : hov
          ? '0 32px 72px rgba(0,0,0,0.65), 0 0 40px rgba(0,168,150,0.12)'
          : '0 8px 32px rgba(0,0,0,0.40)',
        transition  : 'border 220ms ease, box-shadow 220ms ease',
      }}
    >
      <ChromeBar />

      {/* Image */}
      <div style={{ position:'relative', aspectRatio:'16/9', overflow:'hidden', background:'#010E0E' }}>
        <img
          src={item.image_url} alt={item.title} loading="lazy"
          style={{
            width:'100%', height:'100%', objectFit:'cover', display:'block',
            transform: hov ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 380ms ease',
          }}
        />
        {/* Hover overlay */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to top, rgba(1,14,14,0.85) 0%, rgba(1,14,14,0.20) 60%, transparent 100%)',
          opacity: hov ? 1 : 0, transition:'opacity 220ms ease', pointerEvents:'none',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          <div style={{
            width:52, height:52, borderRadius:'50%',
            background:'rgba(0,168,150,0.20)', border:'1px solid rgba(0,168,150,0.50)',
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
        background: hov ? 'rgba(0,168,150,0.05)' : 'transparent',
        transition:'background 220ms ease',
        borderTop:'1px solid rgba(255,255,255,0.04)',
      }}>
        <span style={{
          background:'rgba(0,168,150,0.13)', border:'1px solid rgba(0,168,150,0.25)',
          color:'#00A896', fontSize:'0.62rem', fontWeight:700,
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
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:52, height:52, borderRadius:'50%', flexShrink:0,
      border:`1px solid ${disabled ? 'rgba(255,255,255,0.05)' : 'rgba(0,168,150,0.40)'}`,
      background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(0,168,150,0.10)',
      color: disabled ? 'rgba(255,255,255,0.15)' : '#6ABDB2',
      display:'flex', alignItems:'center', justifyContent:'center',
      cursor: disabled ? 'not-allowed' : 'pointer', transition:'all 200ms ease',
    }}
      onMouseEnter={e => { if(!disabled){
        e.currentTarget.style.background='rgba(0,168,150,0.24)'
        e.currentTarget.style.borderColor='rgba(0,168,150,0.70)'
        e.currentTarget.style.boxShadow='0 0 20px rgba(0,168,150,0.20)'
      }}}
      onMouseLeave={e => { if(!disabled){
        e.currentTarget.style.background='rgba(0,168,150,0.10)'
        e.currentTarget.style.borderColor='rgba(0,168,150,0.40)'
        e.currentTarget.style.boxShadow='none'
      }}}
    >
      <Icon size={22} strokeWidth={2}/>
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
        style={{ background:'#010D0D' }}
        dir="rtl"
      >
        {/* Top ambient */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px]"
          style={{ background:'radial-gradient(ellipse at top, rgba(0,168,150,0.06) 0%, transparent 70%)' }} aria-hidden/>

        {/* ── Header ── */}
        <div className="max-w-6xl mx-auto px-6 mb-14">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">

            {/* Left: text */}
            <div>
              <span className="block text-xs font-semibold tracking-[0.22em] uppercase mb-4"
                style={{ color:'#00A896' }}>
                معرض لقطات النظام
              </span>
              <h2 className="font-black leading-tight mb-3"
                style={{ color:'#EAE4DF', fontSize:'clamp(1.6rem,3.2vw,2.4rem)' }}>
                كل واجهة صُممت بعناية فائقة
              </h2>
              <p className="leading-[1.9]"
                style={{ color:'#7A9E96', fontSize:'clamp(0.82rem,1.3vw,0.92rem)', maxWidth:420 }}>
                استعرض واجهات النظام التي يتعامل معها الإداريون والمعلمون يومياً.
              </p>
            </div>

            {/* Right: big stat */}
            <motion.div
              initial={{ opacity:0, scale:0.85, y:20 }}
              whileInView={{ opacity:1, scale:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.55, ease:[0.22,1,0.36,1], delay:0.15 }}
              className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-8 py-5"
              style={{
                background:'linear-gradient(135deg, rgba(0,168,150,0.10) 0%, rgba(1,26,26,0.80) 100%)',
                border:'1px solid rgba(0,168,150,0.28)',
                boxShadow:'0 0 40px rgba(0,168,150,0.08)',
                minWidth:180,
              }}
            >
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-black" style={{ fontSize:'clamp(2.4rem,5vw,3.2rem)', color:'#6AFFF5', lineHeight:1 }}>
                  +{displayCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={13} style={{ color:'#00A896' }}/>
                <span className="text-xs font-bold tracking-wide" style={{ color:'#7A9E96' }}>
                 واجهة لخدمة أهل القرآن
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Carousel ── */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-5 w-full mb-8">
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
                    ? 'linear-gradient(90deg, #00A896, #6AFFF5)'
                    : 'rgba(0,168,150,0.18)',
                  transition: 'width 300ms cubic-bezier(0.22,1,0.36,1), background 300ms ease',
                  outline: 'none',
                }}
              />
            ))}
            <span style={{
              color:'rgba(0,168,150,0.35)', fontSize:'0.68rem', fontWeight:700,
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
