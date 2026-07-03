import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, CheckCircle2, XCircle, Star, Headphones } from 'lucide-react'
import { FEATURES } from '../data/featureDetails'

/* ═══════════════════════════════════════════════
   SHARED ATOMS
═══════════════════════════════════════════════ */
const fadeUp = {
  hidden : { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.22,1,0.36,1] } },
}
const stagger = (d = 0) => ({
  hidden : {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: d } },
})

function Breadcrumb({ f }) {
  return (
    <motion.nav initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.35 }}
      className="flex items-center gap-2 mb-10 text-xs font-semibold flex-wrap" style={{ color:'#5A8A78' }}>
      <Link to="/ihkaam" className="flex items-center gap-1.5 hover:text-teal-400 transition-colors">
        <ArrowRight size={12} strokeWidth={2.5} /> منصة إحكام
      </Link>
      <span>/</span>
      <span style={{ color: f.color }}>{f.badge === 'النسخة الأساسية' ? 'الميزات الأساسية' : 'الوحدات الإضافية'}</span>
      <span>/</span>
      <span style={{ color:'#7A9E96' }}>{f.title.split('.')[0].split('—')[0].trim()}</span>
    </motion.nav>
  )
}

function StatsBand({ stats, color }) {
  return (
    <motion.div variants={stagger()} initial="hidden" whileInView="visible"
      viewport={{ once:true, margin:'-50px' }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-0 rounded-2xl overflow-hidden"
      style={{ border:`1px solid ${color}18`, background:'rgba(1,18,18,0.60)' }}>
      {stats.map((s, i) => (
        <motion.div key={i} variants={fadeUp}
          className={`flex flex-col items-center justify-center py-7 px-4 text-center${i < stats.length-1 ? ' border-b sm:border-b-0 sm:border-l border-white/5' : ''}`}>
          <span className="font-black text-2xl sm:text-3xl mb-2 leading-none" style={{ color }}>{s.value}</span>
          <span className="text-xs leading-snug" style={{ color:'#4A7A72' }}>{s.label}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}

function ProblemSolution({ f }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <motion.div variants={fadeUp}
        className="rounded-3xl p-8 flex flex-col gap-5"
        style={{ background:'rgba(60,8,8,0.22)', border:'1px solid rgba(220,50,50,0.13)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:'rgba(220,50,50,0.15)', border:'1px solid rgba(220,50,50,0.20)' }}>
            <XCircle size={14} style={{ color:'#EF6464' }} strokeWidth={2} />
          </div>
          <h3 className="font-black text-xs tracking-[0.18em] uppercase" style={{ color:'#EF6464' }}>
            {f.problem.label}
          </h3>
        </div>
        <ul className="flex flex-col gap-3.5">
          {f.problem.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-[1.80]" style={{ color:'#A07070' }}>
              <span className="font-black text-red-400 mt-0.5 flex-shrink-0">×</span>{item}
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.div variants={fadeUp}
        className="rounded-3xl p-8 flex flex-col gap-5"
        style={{ background:`rgba(1,32,26,0.45)`, border:`1px solid ${f.color}22` }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:`${f.color}18`, border:`1px solid ${f.color}30` }}>
            <CheckCircle2 size={14} style={{ color:f.color }} strokeWidth={2} />
          </div>
          <h3 className="font-black text-xs tracking-[0.18em] uppercase" style={{ color:f.color }}>
            {f.solution.label}
          </h3>
        </div>
        <ul className="flex flex-col gap-3.5">
          {f.solution.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-[1.80]" style={{ color:'#7AB8AE' }}>
              <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" style={{ color:f.color }} strokeWidth={2.5} />{item}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}

function CapCard({ cap }) {
  const Icon = cap.icon
  return (
    <motion.div variants={fadeUp}
      className="rounded-2xl p-6 flex flex-col gap-4 h-full"
      style={{ background:'rgba(1,22,22,0.70)', border:'1px solid rgba(229,211,179,0.07)' }}
      whileHover={{ y:-4, borderColor:`${cap.color}28`, boxShadow:`0 12px 40px rgba(0,0,0,0.28)` }}
      transition={{ duration:0.22 }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background:`${cap.color}14`, border:`1px solid ${cap.color}28` }}>
        <Icon size={20} style={{ color:cap.color }} strokeWidth={1.6} />
      </div>
      <h4 className="font-black text-sm" style={{ color:'#EAE4DF' }}>{cap.title}</h4>
      <p className="text-sm leading-[1.9] flex-1" style={{ color:'#6A9490' }}>{cap.desc}</p>
    </motion.div>
  )
}

function CTABottom({ f }) {
  return (
    <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
      className="rounded-3xl px-10 py-16 text-center relative overflow-hidden"
      style={{ background:'linear-gradient(135deg,rgba(1,38,38,0.95) 0%,rgba(1,22,22,0.98) 100%)', border:`1px solid ${f.color}20` }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background:`radial-gradient(ellipse 60% 60% at 50% 0%, ${f.color}10 0%, transparent 65%)` }} aria-hidden />
      <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:f.color }}>
        جاهز للبدء؟
      </span>
      <h2 className="font-black leading-tight mb-6 mx-auto"
        style={{ color:'#EAE4DF', fontSize:'clamp(1.6rem,3vw,2.4rem)', maxWidth:500 }}>
        {f.type === 'addon' ? 'أضف هذه الوحدة لنسختك من إحكام' : 'طلب نسختك من إحكام الآن'}
      </h2>
      <p className="text-sm leading-[2] mb-10 mx-auto" style={{ color:'#5A8A7E', maxWidth:380 }}>
        {f.type === 'addon'
          ? 'تُضاف هذه الوحدة بسهولة لأي خطة — أثناء إتمام الطلب أو في أي وقت لاحق.'
          : 'ابدأ اليوم. لا رسوم تركيب، لا عقود معقدة، دعم كامل من أول يوم.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/request"
          className="inline-flex items-center gap-2.5 rounded-xl font-black px-8 py-4 text-sm transition-all duration-250"
          style={{ background:`linear-gradient(135deg,${f.color} 0%,${f.color}cc 100%)`, color:f.color==='#6ABDB2'?'#011A1A':'#1A0A0A', boxShadow:`0 6px 28px ${f.color}35` }}
          onMouseEnter={e => e.currentTarget.style.boxShadow=`0 10px 40px ${f.color}55`}
          onMouseLeave={e => e.currentTarget.style.boxShadow=`0 6px 28px ${f.color}35`}>
          طلب نسخة <ArrowLeft size={16} strokeWidth={2.5} />
        </Link>
        <Link to="/ihkaam"
          className="inline-flex items-center gap-2 rounded-xl font-semibold px-7 py-4 text-sm transition-all duration-200"
          style={{ color:'#5A8A7E', border:'1px solid rgba(229,211,179,0.10)', background:'rgba(255,255,255,0.02)' }}
          onMouseEnter={e => { e.currentTarget.style.color='#EAE4DF'; e.currentTarget.style.borderColor='rgba(229,211,179,0.22)' }}
          onMouseLeave={e => { e.currentTarget.style.color='#5A8A7E'; e.currentTarget.style.borderColor='rgba(229,211,179,0.10)' }}>
          استكشف المنصة كاملة
        </Link>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   LAYOUT A — SPLIT
   Hero: text left | visual dashboard right
   Used for: admin, finance, reports
═══════════════════════════════════════════════ */
function DashboardVisual({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto">
      {items.map((item, i) => (
        <motion.div key={i}
          initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.50, delay:0.2 + i*0.09, ease:[0.22,1,0.36,1] }}
          className="rounded-2xl px-4 py-4 flex flex-col gap-1.5"
          style={{ background:'rgba(1,26,26,0.80)', border:`1px solid ${item.color}22`, backdropFilter:'blur(8px)' }}>
          <span className="text-[10px] font-semibold" style={{ color:'#5A8A78' }}>{item.label}</span>
          <span className="font-black text-lg leading-none" style={{ color:item.color }}>{item.value}</span>
        </motion.div>
      ))}
    </div>
  )
}

function SplitLayout({ f }) {
  return (
    <div className="relative min-h-screen" style={{ background:'#010D0D' }} dir="rtl">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[55vh] z-0"
        style={{ background:`radial-gradient(ellipse 50% 50% at 70% 0%, ${f.color}08 0%, transparent 70%)` }} aria-hidden />

      {/* HERO — 2 column */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <Breadcrumb f={f} />
          <motion.div variants={stagger(0.06)} initial="hidden" animate="visible">
            <motion.span variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-black tracking-[0.20em] uppercase px-4 py-2 rounded-full mb-8 block w-fit"
              style={{ background:`${f.color}14`, border:`1px solid ${f.color}30`, color:f.color }}>
              <f.icon size={13} strokeWidth={2} />
              {f.badge}
              {f.type==='addon' && <span className="mr-1" style={{ color:'#D9ACA3' }}>✦ Premium</span>}
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-black leading-[1.08] mb-7"
              style={{ color:'#EAE4DF', fontSize:'clamp(2rem,4.5vw,3.8rem)' }}>
              {f.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="leading-[2] mb-10 max-w-xl"
              style={{ color:'#7A9E96', fontSize:'clamp(0.9rem,1.4vw,1rem)' }}>
              {f.subtitle}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/request"
                className="inline-flex items-center gap-2 rounded-xl font-black px-7 py-3.5 text-sm transition-all"
                style={{ background:`linear-gradient(135deg,${f.color},${f.color}cc)`, color:f.color==='#6ABDB2'?'#011A1A':'#1A0A0A', boxShadow:`0 6px 24px ${f.color}30` }}>
                طلب نسخة <ArrowLeft size={14} strokeWidth={2.5} />
              </Link>
              <Link to="/ihkaam"
                className="inline-flex items-center gap-2 rounded-xl font-semibold px-6 py-3.5 text-sm transition-all"
                style={{ color:'#5A8A7E', border:'1px solid rgba(229,211,179,0.12)', background:'rgba(255,255,255,0.03)' }}
                onMouseEnter={e => e.currentTarget.style.color='#EAE4DF'}
                onMouseLeave={e => e.currentTarget.style.color='#5A8A7E'}>
                جميع الميزات
              </Link>
            </motion.div>
          </motion.div>
        </div>
        {/* visual panel */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-0 rounded-3xl" style={{ background:`radial-gradient(circle at center, ${f.color}12, transparent 70%)` }} />
            <div className="relative rounded-3xl p-6" style={{ background:'rgba(1,22,22,0.85)', border:`1px solid ${f.color}18`, backdropFilter:'blur(12px)' }}>
              <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom:'1px solid rgba(229,211,179,0.06)' }}>
                <span className="text-xs font-black tracking-widest uppercase" style={{ color:'#5A8A78' }}>لوحة التحكم</span>
                <div className="flex gap-1.5">{['#EF4444','#F59E0B','#22C55E'].map((c,i)=><div key={i} style={{ width:8,height:8,borderRadius:'50%',background:c,opacity:0.6 }} />)}</div>
              </div>
              {f.heroVisualItems && <DashboardVisual items={f.heroVisualItems} />}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        {f.stats && <StatsBand stats={f.stats} color={f.color} />}
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-50px' }}>
          <ProblemSolution f={f} />
        </motion.div>
      </section>

      {/* CAPABILITIES — 3-col masonry */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.55 }}
          className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:'#5A8A78' }}>ماذا يفعل بالضبط؟</span>
          <h2 className="font-black" style={{ color:'#EAE4DF', fontSize:'clamp(1.4rem,2.8vw,2rem)', maxWidth:520, margin:'0 auto' }}>كل ما تحتاجه — داخل هذه الوحدة</h2>
        </motion.div>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-50px' }}>
          {f.capabilities.map((cap, i) => <CapCard key={i} cap={cap} />)}
        </motion.div>
      </section>

      {/* SCENARIOS */}
      {f.scenarios?.length > 0 && (
        <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
          <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.55 }}
            className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:'#5A8A78' }}>سيناريوهات حقيقية</span>
            <h2 className="font-black" style={{ color:'#EAE4DF', fontSize:'clamp(1.3rem,2.5vw,1.8rem)', maxWidth:460, margin:'0 auto' }}>
              يحدث هذا كل يوم في المعاهد التي تستخدم إحكام
            </h2>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5"
            variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-40px' }}>
            {f.scenarios.map((s, i) => (
              <motion.div key={i} variants={fadeUp}
                className="rounded-2xl p-7 flex flex-col gap-4"
                style={{ background:i%2===0?'rgba(1,30,30,0.65)':'rgba(1,20,20,0.45)', border:`1px solid ${f.color}18` }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background:`${f.color}18`, color:f.color, border:`1px solid ${f.color}28` }}>{i+1}</div>
                  <h4 className="font-black text-sm" style={{ color:'#EAE4DF' }}>{s.title}</h4>
                </div>
                <p className="text-sm leading-[2]" style={{ color:'#7A9E96' }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <CTABottom f={f} />
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   LAYOUT B — SHOWCASE
   Hero: centered + unique visual below fold
   Used for: parents, star, library, subjects
═══════════════════════════════════════════════ */

/* phone notification mockup */
function PhoneShowcase({ f }) {
  return (
    <motion.div initial={{ opacity:0, y:30, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:0.70, delay:0.3, ease:[0.22,1,0.36,1] }}
      className="mx-auto" style={{ width:260, position:'relative' }}>
      {/* phone */}
      <div style={{ borderRadius:'2.8rem', background:'linear-gradient(160deg,#1F3535,#0D1E1E)', border:'2.5px solid rgba(217,172,163,0.35)', padding:'14px 10px 20px', boxShadow:'0 40px 80px rgba(0,0,0,0.85)' }}>
        <div style={{ position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',width:78,height:22,borderRadius:12,background:'#050A0A',zIndex:10 }} />
        <div style={{ borderRadius:'2.2rem', overflow:'hidden', background:'#011A1A', minHeight:320, display:'flex', flexDirection:'column', gap:8, padding:'36px 12px 16px' }}>
          {/* header */}
          <div style={{ textAlign:'center', padding:'8px 0 12px', borderBottom:'1px solid rgba(217,172,163,0.10)' }}>
            <p style={{ color:'rgba(217,172,163,0.50)', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.15em' }}>بوابة أولياء الأمور</p>
            <p style={{ color:'#EAE4DF', fontSize:'0.85rem', fontWeight:900, marginTop:4 }}>أحمد السالم</p>
          </div>
          {/* notifications */}
          {f.phoneNotifications?.map((n, i) => (
            <motion.div key={i} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5+i*0.15, duration:0.45 }}
              style={{ background:'rgba(1,38,30,0.60)', borderRadius:12, padding:'8px 10px', display:'flex', alignItems:'flex-start', gap:8, border:'1px solid rgba(217,172,163,0.08)' }}>
              <span style={{ fontSize:'0.80rem' }}>{n.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:'#EAE4DF', fontSize:'0.58rem', fontWeight:700, lineHeight:1.5 }}>{n.text}</p>
                <p style={{ color:'#5A8A78', fontSize:'0.52rem', marginTop:2 }}>{n.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* certificate mockup */
function CertificateShowcase({ f }) {
  const cp = f.certificatePreview
  return (
    <motion.div initial={{ opacity:0, y:30, rotate:-2 }} animate={{ opacity:1, y:0, rotate:0 }}
      transition={{ duration:0.70, delay:0.3, ease:[0.22,1,0.36,1] }}
      className="mx-auto max-w-sm">
      <div className="rounded-3xl p-8 text-center relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#1A0E00,#2A1800)', border:'1px solid rgba(217,172,163,0.30)', boxShadow:'0 40px 80px rgba(0,0,0,0.85)' }}>
        <div className="absolute inset-0" style={{ background:'radial-gradient(circle at 50% 30%, rgba(217,172,163,0.07),transparent 65%)' }} />
        {/* stars */}
        <div className="flex justify-center gap-1.5 mb-5">
          {[...Array(5)].map((_,i) => <Star key={i} size={16} style={{ color:'#D9ACA3', opacity:i<4?1:0.4 }} fill="#D9ACA3" />)}
        </div>
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background:'rgba(217,172,163,0.12)', border:'1px solid rgba(217,172,163,0.22)' }}>🏆</div>
        <p style={{ color:'rgba(217,172,163,0.55)', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.22em', marginBottom:8 }}>نجم الحلقة</p>
        <h3 style={{ color:'#EAE4DF', fontWeight:900, fontSize:'1.1rem', marginBottom:4 }}>{cp?.name}</h3>
        <p style={{ color:'rgba(217,172,163,0.60)', fontSize:'0.68rem' }}>{cp?.group}</p>
        <div className="mt-6 rounded-2xl py-3 px-4" style={{ background:'rgba(217,172,163,0.08)', border:'1px solid rgba(217,172,163,0.12)' }}>
          <span style={{ color:'#D9ACA3', fontSize:'0.65rem', fontWeight:700 }}>{cp?.week}</span>
          <span className="block font-black text-xl mt-1" style={{ color:'#D9ACA3' }}>{cp?.score}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* audio library mockup */
function AudioShowcase({ f }) {
  return (
    <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.65, delay:0.3, ease:[0.22,1,0.36,1] }}
      className="mx-auto max-w-sm">
      <div className="rounded-3xl p-6 flex flex-col gap-3"
        style={{ background:'rgba(1,22,22,0.90)', border:'1px solid rgba(106,189,178,0.18)', boxShadow:'0 40px 80px rgba(0,0,0,0.85)' }}>
        <div className="flex items-center justify-between mb-2 pb-3" style={{ borderBottom:'1px solid rgba(106,189,178,0.08)' }}>
          <span style={{ color:'#5A8A78', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.15em' }}>المكتبة الصوتية</span>
          <Headphones size={14} style={{ color:'#6ABDB2' }} />
        </div>
        {f.audioItems?.map((item, i) => (
          <motion.div key={i} initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.45+i*0.12, duration:0.40 }}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:14, background:'rgba(106,189,178,0.06)', border:'1px solid rgba(106,189,178,0.10)' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(106,189,178,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:'0.65rem', fontWeight:900, color:'#6ABDB2' }}>▶</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'#EAE4DF', fontSize:'0.68rem', fontWeight:700 }}>{item.page} — {item.surah}</p>
              <p style={{ color:'#5A8A78', fontSize:'0.58rem', marginTop:2 }}>{item.reader}</p>
            </div>
            {/* mini waveform */}
            <div style={{ display:'flex', alignItems:'center', gap:1.5 }}>
              {item.bars.map((h, bi) => (
                <motion.div key={bi}
                  animate={{ scaleY: i===0 ? [1, (h/6), 1] : 1 }}
                  transition={{ duration:0.8, repeat:i===0?Infinity:0, delay:bi*0.08 }}
                  style={{ width:2, height:h, borderRadius:2, background:i===0?'#6ABDB2':'rgba(106,189,178,0.25)', transformOrigin:'bottom' }} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* subjects grid mockup */
function SubjectsShowcase({ f }) {
  return (
    <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.65, delay:0.3, ease:[0.22,1,0.36,1] }}
      className="mx-auto max-w-xs">
      <div className="rounded-3xl p-6 flex flex-col gap-3"
        style={{ background:'rgba(1,22,22,0.90)', border:'1px solid rgba(106,189,178,0.15)', boxShadow:'0 40px 80px rgba(0,0,0,0.85)' }}>
        <p style={{ color:'#5A8A78', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.18em', marginBottom:4 }}>ملف الطالب — المواد الرديفة</p>
        {f.subjectCards?.map((sub, i) => (
          <motion.div key={i} initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.45+i*0.10 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background:'rgba(106,189,178,0.05)', border:'1px solid rgba(106,189,178,0.10)' }}>
            <span style={{ fontSize:'1rem' }}>{sub.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#EAE4DF', fontSize:'0.72rem', fontWeight:700 }}>{sub.name}</span>
                <span style={{ color:'#6ABDB2', fontSize:'0.62rem', fontWeight:700 }}>{sub.grade}</span>
              </div>
              <div style={{ marginTop:6, height:4, borderRadius:2, background:'rgba(106,189,178,0.12)', overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${sub.progress}%` }} transition={{ duration:0.8, delay:0.6+i*0.10 }}
                  style={{ height:'100%', borderRadius:2, background:'linear-gradient(90deg,#6ABDB2,#4A9D94)' }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function getShowcaseVisual(f) {
  if (f.phoneNotifications) return <PhoneShowcase f={f} />
  if (f.certificatePreview)  return <CertificateShowcase f={f} />
  if (f.audioItems)          return <AudioShowcase f={f} />
  if (f.subjectCards)        return <SubjectsShowcase f={f} />
  return null
}

function ShowcaseLayout({ f }) {
  const visual = getShowcaseVisual(f)
  return (
    <div className="relative min-h-screen" style={{ background:'#010D0D' }} dir="rtl">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[70vh] z-0"
        style={{ background:`radial-gradient(ellipse 70% 55% at 50% -5%, ${f.color}0A 0%, transparent 65%)` }} aria-hidden />

      {/* HERO — centered */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-4 text-center">
        <div className="text-right mb-8 max-w-xs">
          <Breadcrumb f={f} />
        </div>
        <motion.div variants={stagger(0.07)} initial="hidden" animate="visible">
          <motion.span variants={fadeUp}
            className="inline-flex items-center gap-2 text-xs font-black tracking-[0.20em] uppercase px-4 py-2 rounded-full mb-7"
            style={{ background:`${f.color}14`, border:`1px solid ${f.color}30`, color:f.color }}>
            <f.icon size={13} strokeWidth={2} />{f.badge}
            {f.type==='addon' && <span style={{ color:'#D9ACA3', marginRight:4 }}>✦ Premium</span>}
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-black leading-[1.08] mb-6 mx-auto"
            style={{ color:'#EAE4DF', fontSize:'clamp(2.2rem,5vw,4rem)', maxWidth:680 }}>
            {f.title}
          </motion.h1>
          <motion.p variants={fadeUp} className="leading-[2] mb-10 mx-auto"
            style={{ color:'#7A9E96', fontSize:'clamp(0.9rem,1.5vw,1rem)', maxWidth:560 }}>
            {f.subtitle}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center mb-16">
            <Link to="/request"
              className="inline-flex items-center gap-2 rounded-xl font-black px-7 py-3.5 text-sm transition-all"
              style={{ background:`linear-gradient(135deg,${f.color},${f.color}cc)`, color:f.color==='#6ABDB2'?'#011A1A':'#1A0A0A', boxShadow:`0 6px 24px ${f.color}30` }}>
              طلب نسخة <ArrowLeft size={14} strokeWidth={2.5} />
            </Link>
            <Link to="/ihkaam"
              className="inline-flex items-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all"
              style={{ color:'#5A8A7E', border:'1px solid rgba(229,211,179,0.12)', background:'rgba(255,255,255,0.03)' }}
              onMouseEnter={e => e.currentTarget.style.color='#EAE4DF'}
              onMouseLeave={e => e.currentTarget.style.color='#5A8A7E'}>
              جميع الميزات
            </Link>
          </motion.div>
        </motion.div>
        {/* BIG VISUAL */}
        {visual && (
          <div className="relative pb-16">
            <div className="absolute inset-x-0 bottom-0 h-32 z-10"
              style={{ background:'linear-gradient(to bottom, transparent, #010D0D)' }} aria-hidden />
            {visual}
          </div>
        )}
      </section>

      {/* STATS */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        {f.stats && <StatsBand stats={f.stats} color={f.color} />}
      </section>

      {/* PROBLEM / SOLUTION — stacked */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-50px' }}>
          <ProblemSolution f={f} />
        </motion.div>
      </section>

      {/* CAPABILITIES — 2-col large cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.55 }}
          className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:'#5A8A78' }}>ماذا يفعل بالضبط؟</span>
          <h2 className="font-black" style={{ color:'#EAE4DF', fontSize:'clamp(1.4rem,2.8vw,2rem)', maxWidth:520, margin:'0 auto' }}>
            كل ما تحتاجه — داخل هذه الوحدة
          </h2>
        </motion.div>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-50px' }}>
          {f.capabilities.map((cap, i) => <CapCard key={i} cap={cap} />)}
        </motion.div>
      </section>

      {/* SCENARIOS — full-width quote style */}
      {f.scenarios?.length > 0 && (
        <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
          <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.55 }}
            className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:'#5A8A78' }}>من الواقع</span>
            <h2 className="font-black" style={{ color:'#EAE4DF', fontSize:'clamp(1.3rem,2.5vw,1.8rem)', maxWidth:440, margin:'0 auto' }}>
              سيناريوهات يعيشها المعهد يومياً
            </h2>
          </motion.div>
          <div className="flex flex-col gap-5">
            {f.scenarios.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true, margin:'-30px' }} transition={{ duration:0.50, delay:i*0.08 }}
                className="rounded-3xl p-8 flex gap-6 items-start"
                style={{ background:`rgba(1,22,22,0.55)`, border:`1px solid ${f.color}15` }}>
                <div className="text-4xl font-black leading-none flex-shrink-0 opacity-15" style={{ color:f.color }}>
                  {i===0?'"':''}
                </div>
                <div>
                  <h4 className="font-black text-base mb-3" style={{ color:'#EAE4DF' }}>{s.title}</h4>
                  <p className="text-sm leading-[2]" style={{ color:'#7A9E96' }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <CTABottom f={f} />
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   LAYOUT C — FLOW
   Hero: bold centered, then process steps
   Used for: daily, academic, exams, messages
═══════════════════════════════════════════════ */
function FlowSteps({ steps, color }) {
  return (
    <div className="relative">
      {/* connector line */}
      <div className="absolute top-8 right-8 bottom-8 w-px hidden md:block"
        style={{ background:`linear-gradient(to bottom, transparent, ${color}30, transparent)` }} />
      <div className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <motion.div key={i} variants={fadeUp}
            className="flex items-start gap-5 rounded-2xl p-6"
            style={{ background:`rgba(1,22,22,0.65)`, border:`1px solid ${color}${i===1?'28':'10'}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background:`${color}${i===1?'22':'10'}`, border:`1px solid ${color}${i===1?'35':'18'}`, color }}>
              {step.num}
            </div>
            <div>
              <h4 className="font-black text-sm mb-1" style={{ color:'#EAE4DF' }}>{step.label}</h4>
              <p className="text-xs leading-[1.8]" style={{ color:'#5A8A7E' }}>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function FlowLayout({ f }) {
  return (
    <div className="relative min-h-screen" style={{ background:'#010D0D' }} dir="rtl">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[50vh] z-0"
        style={{ background:`radial-gradient(ellipse 55% 40% at 30% 0%, ${f.color}08 0%, transparent 70%)` }} aria-hidden />

      {/* HERO — bold left aligned */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-6">
        <Breadcrumb f={f} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* LEFT: text */}
          <motion.div variants={stagger(0.06)} initial="hidden" animate="visible">
            <motion.span variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-black tracking-[0.20em] uppercase px-4 py-2 rounded-full mb-8"
              style={{ background:`${f.color}14`, border:`1px solid ${f.color}30`, color:f.color }}>
              <f.icon size={13} strokeWidth={2} />{f.badge}
              {f.type==='addon' && <span style={{ color:'#D9ACA3', marginRight:4 }}>✦ Premium</span>}
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-black leading-[1.08] mb-7"
              style={{ color:'#EAE4DF', fontSize:'clamp(2rem,4.2vw,3.6rem)' }}>
              {f.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="leading-[2] mb-10"
              style={{ color:'#7A9E96', fontSize:'clamp(0.9rem,1.4vw,1rem)', maxWidth:520 }}>
              {f.subtitle}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/request"
                className="inline-flex items-center gap-2 rounded-xl font-black px-7 py-3.5 text-sm transition-all"
                style={{ background:`linear-gradient(135deg,${f.color},${f.color}cc)`, color:f.color==='#6ABDB2'?'#011A1A':'#1A0A0A', boxShadow:`0 6px 24px ${f.color}30` }}>
                طلب نسخة <ArrowLeft size={14} strokeWidth={2.5} />
              </Link>
              <Link to="/ihkaam"
                className="inline-flex items-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all"
                style={{ color:'#5A8A7E', border:'1px solid rgba(229,211,179,0.12)', background:'rgba(255,255,255,0.03)' }}
                onMouseEnter={e => e.currentTarget.style.color='#EAE4DF'}
                onMouseLeave={e => e.currentTarget.style.color='#5A8A7E'}>
                جميع الميزات
              </Link>
            </motion.div>
          </motion.div>
          {/* RIGHT: flow steps */}
          {f.flowSteps && (
            <motion.div variants={stagger(0.10)} initial="hidden" animate="visible">
              <motion.p variants={fadeUp}
                className="text-xs font-semibold tracking-[0.22em] uppercase mb-6" style={{ color:'#5A8A78' }}>
                كيف يعمل؟
              </motion.p>
              <FlowSteps steps={f.flowSteps} color={f.color} />
            </motion.div>
          )}
        </div>
      </section>

      {/* STATS — full bleed */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {f.stats && <StatsBand stats={f.stats} color={f.color} />}
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-50px' }}>
          <ProblemSolution f={f} />
        </motion.div>
      </section>

      {/* CAPABILITIES — vertical list style */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.55 }}
          className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:'#5A8A78' }}>ماذا يفعل بالضبط؟</span>
          <h2 className="font-black" style={{ color:'#EAE4DF', fontSize:'clamp(1.4rem,2.8vw,2rem)', maxWidth:520, margin:'0 auto' }}>
            كل ما تحتاجه — داخل هذه الوحدة
          </h2>
        </motion.div>
        {/* Two columns of 3 */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-50px' }}>
          {f.capabilities.map((cap, i) => <CapCard key={i} cap={cap} />)}
        </motion.div>
      </section>

      {/* SCENARIOS — horizontal cards */}
      {f.scenarios?.length > 0 && (
        <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
          <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.55 }}
            className="mb-12">
            <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-4" style={{ color:'#5A8A78' }}>من الواقع</span>
            <h2 className="font-black" style={{ color:'#EAE4DF', fontSize:'clamp(1.3rem,2.5vw,1.8rem)', maxWidth:440 }}>
              سيناريوهات من حياة المعهد اليومية
            </h2>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5"
            variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-40px' }}>
            {f.scenarios.map((s, i) => (
              <motion.div key={i} variants={fadeUp}
                className="rounded-2xl p-7 flex flex-col gap-4 border-r-4"
                style={{ background:'rgba(1,22,22,0.55)', borderColor:f.color, borderRightWidth:3, borderTopColor:'transparent', borderBottomColor:'transparent', borderLeftColor:'transparent' }}>
                <h4 className="font-black text-sm" style={{ color:'#EAE4DF' }}>{s.title}</h4>
                <p className="text-sm leading-[2]" style={{ color:'#7A9E96' }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <CTABottom f={f} />
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════ */
export default function FeatureDetailPage() {
  const { slug } = useParams()
  const f = FEATURES[slug]

  if (!f) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6 px-6" dir="rtl">
      <p className="font-black text-3xl" style={{ color:'#EAE4DF' }}>الصفحة غير موجودة</p>
      <Link to="/ihkaam" className="text-sm font-bold" style={{ color:'#6ABDB2' }}>← العودة لمنصة إحكام</Link>
    </div>
  )

  if (f.layout === 'split')    return <SplitLayout f={f} />
  if (f.layout === 'showcase') return <ShowcaseLayout f={f} />
  return <FlowLayout f={f} />
}
