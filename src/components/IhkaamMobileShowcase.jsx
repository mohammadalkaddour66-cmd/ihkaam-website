import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../config/supabaseClient'
import { useIsMobile } from '../hooks/useIsMobile'
import { useSwipe } from '../hooks/useSwipe'

const PHONE_W = 220

/* ── Phone card ── */
function PhoneCard({ item, onClick, isCenter }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flexShrink:0, width:PHONE_W, cursor:'pointer', transform:`translateY(${isCenter?-18:0}px) scale(${hov?1.04:isCenter?1.06:1})`, transition:'transform 320ms cubic-bezier(0.22,1,0.36,1)', zIndex:isCenter?2:1 }}
    >
      <div style={{ position:'relative', borderRadius:'3rem', background:hov?'linear-gradient(160deg,#243A3A 0%,#112828 100%)':isCenter?'linear-gradient(160deg,#1F3535 0%,#102424 100%)':'linear-gradient(160deg,#1A2E2E 0%,#0D1E1E 100%)', border:`2.5px solid ${hov?'rgba(106,189,178,0.65)':isCenter?'rgba(106,189,178,0.40)':'rgba(106,189,178,0.22)'}`, boxShadow:isCenter?'0 0 0 1px rgba(0,0,0,0.65),0 40px 80px rgba(0,0,0,0.80),0 0 60px rgba(106,189,178,0.08)':'0 0 0 1px rgba(0,0,0,0.65),0 20px 48px rgba(0,0,0,0.60)', padding:'14px 10px 18px', transition:'border-color 280ms ease,box-shadow 280ms ease,background 280ms ease' }}>
        {/* Dynamic island */}
        <div style={{ position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',width:78,height:22,borderRadius:12,background:'#050A0A',zIndex:10 }} />
        {/* Power button */}
        <div style={{ position:'absolute',top:90,right:-4,width:4,height:44,borderRadius:'0 3px 3px 0',background:'rgba(106,189,178,0.20)' }} />
        {/* Volume buttons */}
        <div style={{ position:'absolute',top:72,left:-4,width:4,height:30,borderRadius:'3px 0 0 3px',background:'rgba(106,189,178,0.20)' }} />
        <div style={{ position:'absolute',top:110,left:-4,width:4,height:30,borderRadius:'3px 0 0 3px',background:'rgba(106,189,178,0.20)' }} />
        {/* Speaker */}
        <div style={{ position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',display:'flex',gap:4 }}>
          {Array.from({length:7}).map((_,i) => <div key={i} style={{ width:4,height:4,borderRadius:'50%',background:'rgba(106,189,178,0.22)' }} />)}
        </div>
        {/* Screen */}
        <div style={{ borderRadius:'2.3rem',overflow:'hidden',background:'#000',aspectRatio:'9/19.5',position:'relative' }}>
          {/* Status bar */}
          <div style={{ position:'absolute',top:0,insetInline:0,height:28,background:'rgba(0,0,0,0.55)',zIndex:5,display:'flex',alignItems:'flex-end',justifyContent:'space-between',padding:'0 14px 4px' }}>
            <span style={{ color:'rgba(255,255,255,0.75)',fontSize:'0.60rem',fontWeight:700 }}>9:41</span>
            <div style={{ display:'flex',gap:3,alignItems:'center' }}>
              {[3,5,7,9].map((h,i) => <div key={i} style={{ width:3,height:h,borderRadius:1,background:i<3?'rgba(255,255,255,0.75)':'rgba(255,255,255,0.25)' }} />)}
              <div style={{ width:14,height:7,borderRadius:2,border:'1px solid rgba(255,255,255,0.50)',marginLeft:3,position:'relative' }}>
                <div style={{ width:'70%',height:'100%',background:'rgba(106,189,178,0.90)',borderRadius:1 }} />
              </div>
            </div>
          </div>
          <img src={item.image_url} alt={item.title} loading="lazy" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
          {/* Hover overlay */}
          <div style={{ position:'absolute',inset:0,background:'rgba(1,26,26,0.62)',opacity:hov?1:0,transition:'opacity 200ms ease',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none' }}>
            <span style={{ color:'#E5D3B3',fontSize:'0.80rem',fontWeight:700,letterSpacing:'0.06em' }}>تكبير</span>
          </div>
        </div>
      </div>
      <p style={{ textAlign:'center',fontSize:'0.75rem',fontWeight:isCenter?700:600,marginTop:14,color:hov?'#6ABDB2':isCenter?'#9ECFC8':'#4A7A72',transition:'color 220ms ease' }}>
        {item.title}
      </p>
    </div>
  )
}

/* ── Arrow ── */
function Arrow({ icon: Icon, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-11 h-11 sm:w-[52px] sm:h-[52px]"
      style={{ borderRadius:'50%',border:`1px solid ${disabled?'rgba(106,189,178,0.08)':'rgba(106,189,178,0.35)'}`,background:disabled?'rgba(255,255,255,0.02)':'rgba(106,189,178,0.10)',color:disabled?'rgba(106,189,178,0.20)':'#6ABDB2',display:'flex',alignItems:'center',justifyContent:'center',cursor:disabled?'not-allowed':'pointer',flexShrink:0,transition:'all 200ms ease' }}
      onMouseEnter={e => { if(!disabled){ e.currentTarget.style.background='rgba(106,189,178,0.22)'; e.currentTarget.style.borderColor='rgba(106,189,178,0.60)' }}}
      onMouseLeave={e => { if(!disabled){ e.currentTarget.style.background='rgba(106,189,178,0.10)'; e.currentTarget.style.borderColor='rgba(106,189,178,0.35)' }}}
    >
      <Icon size={24} strokeWidth={2} />
    </button>
  )
}

/* ── Lightbox nav arrow ── */
function NavBtn({ dir, canGo, onClick }) {
  return (
    <button onClick={onClick} disabled={!canGo}
      style={{ flexShrink:0,width:44,height:44,borderRadius:'50%',border:`1px solid ${canGo?'rgba(106,189,178,0.40)':'rgba(255,255,255,0.08)'}`,background:canGo?'rgba(106,189,178,0.12)':'rgba(255,255,255,0.03)',color:canGo?'#6ABDB2':'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',cursor:canGo?'pointer':'not-allowed',transition:'all 180ms ease' }}
      onMouseEnter={e => canGo && (e.currentTarget.style.background='rgba(106,189,178,0.24)')}
      onMouseLeave={e => canGo && (e.currentTarget.style.background='rgba(106,189,178,0.12)')}
    >
      {dir === -1 ? <ChevronRight size={20} strokeWidth={2} /> : <ChevronLeft size={20} strokeWidth={2} />}
    </button>
  )
}

/* ── Lightbox ── */
function MobileLightbox({ items, index, onClose, onNav }) {
  const item    = items[index]
  const canPrev = index > 0
  const canNext = index < items.length - 1
  const swipe   = useSwipe(() => canNext && onNav(1), () => canPrev && onNav(-1))

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') canPrev && onNav(-1)
      if (e.key === 'ArrowLeft')  canNext && onNav(1)
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose, onNav, canPrev, canNext])

  return (
    <motion.div className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background:'rgba(0,0,0,0.93)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)' }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}
      onClick={onClose}
    >
      <motion.div className="flex flex-col items-center gap-5"
        initial={{ opacity:0,scale:0.88,y:30 }} animate={{ opacity:1,scale:1,y:0 }}
        exit={{ opacity:0,scale:0.94 }} transition={{ duration:0.30,ease:[0.22,1,0.36,1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top row: close + counter */}
        <div style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <span style={{ color:'rgba(229,211,179,0.35)',fontSize:'0.78rem',fontWeight:600 }}>
            {index + 1} / {items.length}
          </span>
          <button onClick={onClose} style={{ width:38,height:38,borderRadius:'50%',border:'1px solid rgba(229,211,179,0.20)',background:'rgba(1,38,38,0.65)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#EAE4DF' }}>
            <X size={15} />
          </button>
        </div>

        {/* Nav + phone */}
        <div style={{ display:'flex',alignItems:'center',gap:20 }} {...swipe}>
          <NavBtn dir={-1} canGo={canPrev} onClick={() => canPrev && onNav(-1)} />
          <div style={{ width:'min(240px,60vw)' }}>
            <AnimatePresence mode="wait">
              <motion.div key={item.id}
                initial={{ opacity:0, x:0, scale:0.96 }}
                animate={{ opacity:1, x:0, scale:1 }}
                exit={{ opacity:0, scale:0.96 }}
                transition={{ duration:0.20 }}
              >
                <PhoneCard item={item} isCenter onClick={() => {}} />
              </motion.div>
            </AnimatePresence>
          </div>
          <NavBtn dir={1} canGo={canNext} onClick={() => canNext && onNav(1)} />
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Main ── */
export default function IhkaamMobileShowcase() {
  const [items,   setItems]   = useState([])
  const [idx,     setIdx]     = useState(0)
  const [dir,     setDir]     = useState(1)
  const [lbIndex, setLbIndex] = useState(null)
  const isMobile = useIsMobile()
  const VISIBLE = isMobile ? 1 : 3

  const maxIdx = Math.max(0, items.length - VISIBLE)
  const go = (delta) => {
    setDir(delta)
    setIdx(i => Math.min(maxIdx, Math.max(0, i + delta)))
  }
  const swipe = useSwipe(() => go(1), () => go(-1))

  useEffect(() => {
    supabase.from('gallery_items').select('id,title,category,image_url,order_index')
      .eq('is_active', true).eq('category', 'هاتف').order('order_index', { ascending:true })
      .then(({ data }) => { if (data?.length) setItems(data) })
  }, [])

  if (!items.length) return null

  /* Always show exactly VISIBLE phones; pad with null at end if needed */
  const visible = items.slice(idx, idx + VISIBLE)
  while (visible.length < VISIBLE) visible.push(null)

  return (
    <>
      <section className="relative z-10 py-28 overflow-hidden" dir="rtl">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
          style={{ background:'radial-gradient(ellipse at top, rgba(106,189,178,0.065) 0%, transparent 70%)' }} aria-hidden />

        {/* Header */}
        <motion.div className="text-center mb-16 px-6"
          initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
        >
          <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:'#6ABDB2' }}>تطبيق الجوال</span>
          <h2 className="font-black leading-tight mx-auto mb-5" style={{ color:'#EAE4DF',fontSize:'clamp(1.6rem,3.2vw,2.4rem)',maxWidth:560 }}>
            يعمل في جيبك — في كل مكان
          </h2>
          <p className="text-sm mx-auto leading-[2]" style={{ color:'#7A9E96',maxWidth:'440px' }}>
            المعلم يسمّع من هاتفه، والإداري يتابع من أي مكان. التطبيق يعمل على أندرويد وآيفون.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="flex flex-col items-center gap-10">

          <div className="flex items-center gap-3 sm:gap-6">
            {/* RTL: right arrow = prev */}
            <Arrow icon={ChevronRight} onClick={() => go(-1)} disabled={idx <= 0} />

            {/* Phones */}
            <div style={{ overflow:'hidden', paddingBlock:32 }} {...swipe}>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={idx}
                  custom={dir}
                  variants={{
                    enter : d => ({ opacity:0, x: d > 0 ? -100 : 100 }),
                    center: ()  => ({ opacity:1, x:0 }),
                    exit  : d => ({ opacity:0, x: d > 0 ? 100  : -100 }),
                  }}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration:0.42, ease:[0.22,1,0.36,1] }}
                  style={{ display:'flex', gap:32, alignItems:'flex-end' }}
                >
                  {visible.map((item, i) =>
                    item
                      ? <PhoneCard key={item.id} item={item} isCenter={i === Math.floor(VISIBLE / 2)} onClick={() => setLbIndex(items.indexOf(item))} />
                      : <div key={`ph-${i}`} style={{ flexShrink:0, width:PHONE_W }} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RTL: left arrow = next */}
            <Arrow icon={ChevronLeft} onClick={() => go(1)} disabled={idx >= maxIdx} />
          </div>

          {/* Dots */}
          {maxIdx > 0 && (
            <div className="flex gap-2">
              {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                <button key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i) }}
                  style={{ width:i===idx?22:7,height:7,borderRadius:4,background:i===idx?'#6ABDB2':'rgba(106,189,178,0.20)',border:'none',cursor:'pointer',transition:'width 300ms ease, background 300ms ease',padding:0 }} />
              ))}
            </div>
          )}

        </div>
      </section>

      <AnimatePresence>
        {lbIndex !== null && (
          <MobileLightbox
            key="mlb"
            items={items}
            index={lbIndex}
            onClose={() => setLbIndex(null)}
            onNav={(d) => setLbIndex(i => Math.min(items.length - 1, Math.max(0, i + d)))}
          />
        )}
      </AnimatePresence>
    </>
  )
}
