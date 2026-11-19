import { useParams, useLocation, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, CheckCircle2, XCircle, Star, Headphones, Brain } from 'lucide-react'
import { FEATURES } from '../data/featureDetails'
import PageMeta from '../components/layout/PageMeta'
import { FEATURE_SEO, SITE } from '../config/seo'
import { BLOG_POSTS } from '../data/blogContent'
import { getArticle } from '../data/helpContent'
import FeatureLinksSection from '../components/sections/FeatureLinksSection'

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
      className="flex items-center gap-2 mb-10 text-xs font-semibold flex-wrap" style={{ color:'#5E6E67' }}>
      <Link to="/ihkaam" className="flex items-center gap-1.5 hover:text-[#1F6F52] transition-colors">
        <ArrowRight size={12} strokeWidth={2.5} /> منصة إحكام
      </Link>
      <span>/</span>
      <span style={{ color: f.color }}>{f.type === 'addon' ? 'الوحدات الإضافية' : 'الميزات الأساسية'}</span>
      <span>/</span>
      <span style={{ color:'#4A5D56' }}>{f.title.split('.')[0].split('—')[0].trim()}</span>
    </motion.nav>
  )
}

function StatsBand({ stats, color }) {
  return (
    <motion.div variants={stagger()} initial="hidden" whileInView="visible"
      viewport={{ once:true, margin:'-50px' }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-0 rounded-2xl overflow-hidden"
      style={{ border:`1px solid ${color}18`, background:'rgba(248, 245, 236, 0.60)' }}>
      {stats.map((s, i) => (
        <motion.div key={i} variants={fadeUp}
          className={`flex flex-col items-center justify-center py-7 px-4 text-center${i < stats.length-1 ? ' border-b sm:border-b-0 sm:border-l border-[#0B3B33]/5' : ''}`}>
          <span className="font-black text-2xl sm:text-3xl mb-2 leading-none" style={{ color }}>{s.value}</span>
          <span className="text-xs leading-snug" style={{ color:'#5E6E67' }}>{s.label}</span>
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
        style={{ background:'rgba(233, 209, 209, 0.22)', border:'1px solid rgba(220,50,50,0.13)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:'rgba(220,50,50,0.15)', border:'1px solid rgba(220,50,50,0.20)' }}>
            <XCircle size={14} style={{ color:'#C0392B' }} strokeWidth={2} />
          </div>
          <h3 className="font-black text-xs tracking-[0.18em] uppercase" style={{ color:'#C0392B' }}>
            {f.problem.label}
          </h3>
        </div>
        <ul className="flex flex-col gap-3.5">
          {f.problem.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-[1.80]" style={{ color:'#8F5F5F' }}>
              <span className="font-black text-[#C0392B] mt-0.5 flex-shrink-0">×</span>{item}
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.div variants={fadeUp}
        className="rounded-3xl p-8 flex flex-col gap-5"
        style={{ background:`rgba(255, 255, 255, 0.45)`, border:`1px solid ${f.color}22` }}>
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
            <li key={i} className="flex gap-3 text-sm leading-[1.80]" style={{ color:'#47856E' }}>
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
      style={{ background:'rgba(248, 245, 236, 0.70)', border:'1px solid rgba(184, 134, 58, 0.07)' }}
      whileHover={{ y:-4, borderColor:`${cap.color}28`, boxShadow:`0 12px 40px rgba(11, 59, 51, 0.084)` }}
      transition={{ duration:0.22 }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background:`${cap.color}14`, border:`1px solid ${cap.color}28` }}>
        <Icon size={20} style={{ color:cap.color }} strokeWidth={1.6} />
      </div>
      <h3 className="font-black text-sm" style={{ color:'#1A2E28' }}>{cap.title}</h3>
      <p className="text-sm leading-[1.9] flex-1" style={{ color:'#5E6E67' }}>{cap.desc}</p>
    </motion.div>
  )
}

function CTABottom({ f }) {
  return (
    <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
      className="rounded-3xl px-10 py-16 text-center relative overflow-hidden"
      style={{ background:'linear-gradient(135deg,rgba(255, 255, 255, 0.95) 0%,rgba(248, 245, 236, 0.98) 100%)', border:`1px solid ${f.color}20` }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background:`radial-gradient(ellipse 60% 60% at 50% 0%, ${f.color}10 0%, transparent 65%)` }} aria-hidden />
      <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:f.color }}>
        جاهز للبدء؟
      </span>
      <h2 className="font-black leading-tight mb-6 mx-auto"
        style={{ color:'#1A2E28', fontSize:'clamp(1.6rem,3vw,2.4rem)', maxWidth:500 }}>
        {f.headings?.cta || (f.type === 'addon' ? 'أضف هذه الوحدة لنسختك' : 'ابدأ مع إحكام')}
      </h2>
      <p className="text-sm leading-[2] mb-10 mx-auto" style={{ color:'#5E6E67', maxWidth:380 }}>
        {f.type === 'addon'
          ? 'وحدة اختيارية تُضاف فوق النسخة الأساسية، وتدخل في حساب اشتراك معهدك.'
          : 'هذه الميزة ضمن النسخة الأساسية دون رسوم إضافية، وتتوفر تجربة مجانية قبل أن تشترك.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/request"
          className="inline-flex items-center gap-2.5 rounded-xl font-black px-8 py-4 text-sm transition-all duration-250"
          style={{ background:`linear-gradient(135deg,${f.color} 0%,${f.color}cc 100%)`, color:f.color==='#1F6F52'?'#FFFFFF':'#F3E7E7', boxShadow:`0 6px 28px ${f.color}35` }}
          onMouseEnter={e => e.currentTarget.style.boxShadow=`0 10px 40px ${f.color}55`}
          onMouseLeave={e => e.currentTarget.style.boxShadow=`0 6px 28px ${f.color}35`}>
          احسب اشتراك معهدك <ArrowLeft size={16} strokeWidth={2.5} />
        </Link>
        <Link to="/ihkaam"
          className="inline-flex items-center gap-2 rounded-xl font-semibold px-7 py-4 text-sm transition-all duration-200"
          style={{ color:'#5E6E67', border:'1px solid rgba(184, 134, 58, 0.10)', background:'rgba(11, 59, 51, 0.02)' }}
          onMouseEnter={e => { e.currentTarget.style.color='#1A2E28'; e.currentTarget.style.borderColor='rgba(184, 134, 58, 0.22)' }}
          onMouseLeave={e => { e.currentTarget.style.color='#5E6E67'; e.currentTarget.style.borderColor='rgba(184, 134, 58, 0.10)' }}>
          استكشف المنصة كاملة
        </Link>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   BODY SECTIONS — مشتركة بين التخطيطات الثلاثة.
   كل قسم عنوانه H2 فريد لهذه الصفحة (f.headings)،
   وما تحته H3. الترتيب يأتي من f.order فيختلف بين الصفحات.
═══════════════════════════════════════════════ */
const DEFAULT_ORDER = ['problem', 'whoUses', 'capabilities', 'walkthrough', 'views', 'scenarios', 'faq']
const H2_STYLE = { color:'#1A2E28', fontSize:'clamp(1.35rem,2.6vw,1.9rem)', maxWidth:560 }

function SectionHead({ eyebrow, title, center = true }) {
  return (
    <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:'-60px' }} transition={{ duration:0.55 }}
      className={`mb-12${center ? ' text-center' : ''}`}>
      {eyebrow && <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:'#5E6E67' }}>{eyebrow}</span>}
      <h2 className="font-black leading-snug" style={{ ...H2_STYLE, margin: center ? '0 auto' : 0 }}>{title}</h2>
    </motion.div>
  )
}

function WhoUses({ f, w }) {
  const d = f.whoUses
  return (
    <section className={`relative z-10 ${w} mx-auto px-6 pb-24`}>
      <SectionHead eyebrow="لمن هذه الميزة؟" title={d.title} />
      <div className={`grid grid-cols-1 ${d.paras.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-5`}>
        {d.paras.map((p, i) => (
          <p key={i} className="text-sm leading-[2.05] rounded-2xl p-7"
            style={{ color:'#4A5D56', background:'rgba(248, 245, 236, 0.55)', border:`1px solid ${f.color}15` }}>{p}</p>
        ))}
      </div>
    </section>
  )
}

function Walkthrough({ f, w, variant }) {
  const d = f.walkthrough
  return (
    <section className={`relative z-10 ${w} mx-auto px-6 pb-28`}>
      <SectionHead eyebrow="خطوة بخطوة في معهد قرآني" title={d.title} center={variant === 'timeline'} />
      {d.intro && <p className="text-sm leading-[2] mb-8 -mt-6" style={{ color:'#5E6E67' }}>{d.intro}</p>}
      {variant === 'timeline' ? (
        <ol className="flex flex-col gap-4 relative">
          {d.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-5 rounded-2xl p-6"
              style={{ background:'rgba(248, 245, 236, 0.65)', border:`1px solid ${f.color}14` }}>
              <span className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{ background:`${f.color}14`, border:`1px solid ${f.color}28`, color:f.color }}>{i + 1}</span>
              <div>
                <h3 className="font-black text-sm mb-1.5" style={{ color:'#1A2E28' }}>{s.t}</h3>
                <p className="text-sm leading-[1.95]" style={{ color:'#5E6E67' }}>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {d.steps.map((s, i) => (
            <li key={i} className="rounded-2xl p-6 flex flex-col gap-3"
              style={{ background:'rgba(248, 245, 236, 0.60)', border:`1px solid ${f.color}15` }}>
              <span className="font-black text-2xl leading-none" style={{ color:f.color, opacity:0.55 }}>{i + 1}</span>
              <h3 className="font-black text-sm" style={{ color:'#1A2E28' }}>{s.t}</h3>
              <p className="text-sm leading-[1.95]" style={{ color:'#5E6E67' }}>{s.d}</p>
            </li>
          ))}
        </ol>
      )}
      {d.outro && <p className="text-sm leading-[2] mt-8" style={{ color:'#5E6E67' }}>{d.outro}</p>}
    </section>
  )
}

function Views({ f, w, variant }) {
  const d = f.views
  return (
    <section className={`relative z-10 ${w} mx-auto px-6 pb-28`}>
      <SectionHead eyebrow="من زاوية كل دور" title={d.title} center={variant === 'cols'} />
      {variant === 'cols' ? (
        <div className={`grid grid-cols-1 ${d.items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-5`}>
          {d.items.map((it, i) => (
            <div key={i} className="rounded-2xl p-6 flex flex-col gap-3"
              style={{ background:'rgba(255, 255, 255, 0.45)', border:`1px solid ${f.color}1c` }}>
              <h3 className="font-black text-sm" style={{ color:f.color }}>{it.role}</h3>
              <p className="text-sm leading-[1.95]" style={{ color:'#4A5D56' }}>{it.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {d.items.map((it, i) => (
            <div key={i} className="rounded-2xl p-6 flex flex-col sm:flex-row gap-3 sm:gap-8 sm:items-start"
              style={{ background:'rgba(248, 245, 236, 0.55)', borderRight:`3px solid ${f.color}` }}>
              <h3 className="font-black text-sm sm:w-36 flex-shrink-0" style={{ color:f.color }}>{it.role}</h3>
              <p className="text-sm leading-[1.95]" style={{ color:'#4A5D56' }}>{it.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function FeatureFAQ({ f }) {
  const t = FEATURE_SEO[f.slug]?.title
  return (
    <section className="relative z-10 max-w-3xl mx-auto px-6 pb-28">
      <SectionHead eyebrow="أسئلة شائعة" title={t ? `أسئلة عن ${t}` : 'أسئلة عن هذه الميزة'} />
      <div className="flex flex-col gap-3">
        {f.faqs.map((it, i) => (
          <details key={i} open className="rounded-2xl p-6"
            style={{ background:'rgba(248, 245, 236, 0.60)', border:`1px solid ${f.color}18` }}>
            <summary className="font-black text-sm cursor-pointer leading-[1.9]" style={{ color:'#1A2E28' }}>{it.q}</summary>
            <p className="text-sm leading-[2] mt-3" style={{ color:'#4A5D56' }}>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function ProblemSection({ f, w }) {
  return (
    <section className={`relative z-10 ${w} mx-auto px-6 pb-24`}>
      <SectionHead eyebrow="الواقع والحل" title={f.headings?.problem || f.problem.label} />
      <motion.div variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-50px' }}>
        <ProblemSolution f={f} />
      </motion.div>
    </section>
  )
}

function CapabilitiesSection({ f, w, grid }) {
  return (
    <section className={`relative z-10 ${w} mx-auto px-6 pb-28`}>
      <SectionHead eyebrow="ماذا يفعل بالضبط؟" title={f.headings?.cap || 'ما تحمله هذه الميزة'} />
      <motion.div className={`grid grid-cols-1 ${grid} gap-5`}
        variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-50px' }}>
        {f.capabilities.map((cap, i) => <CapCard key={i} cap={cap} />)}
      </motion.div>
    </section>
  )
}

function ScenariosSection({ f, w, style }) {
  if (!f.scenarios?.length) return null
  const title = f.headings?.scenarios || 'من واقع المعهد'
  return (
    <section className={`relative z-10 ${w} mx-auto px-6 pb-28`}>
      <SectionHead eyebrow="من الواقع" title={title} center={style !== 'rail'} />
      {style === 'quote' ? (
        <div className="flex flex-col gap-5">
          {f.scenarios.map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-30px' }} transition={{ duration:0.50, delay:i*0.08 }}
              className="rounded-3xl p-8 flex gap-6 items-start"
              style={{ background:'rgba(248, 245, 236, 0.55)', border:`1px solid ${f.color}15` }}>
              <div className="text-4xl font-black leading-none flex-shrink-0 opacity-15" style={{ color:f.color }} aria-hidden>{i===0?'"':''}</div>
              <div>
                <h3 className="font-black text-base mb-3" style={{ color:'#1A2E28' }}>{s.title}</h3>
                <p className="text-sm leading-[2]" style={{ color:'#4A5D56' }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={stagger()} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-40px' }}>
          {f.scenarios.map((s, i) => style === 'rail' ? (
            <motion.div key={i} variants={fadeUp} className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background:'rgba(248, 245, 236, 0.55)', borderRight:`3px solid ${f.color}` }}>
              <h3 className="font-black text-sm" style={{ color:'#1A2E28' }}>{s.title}</h3>
              <p className="text-sm leading-[2]" style={{ color:'#4A5D56' }}>{s.desc}</p>
            </motion.div>
          ) : (
            <motion.div key={i} variants={fadeUp} className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background:i%2===0?'rgba(255, 255, 255, 0.65)':'rgba(248, 245, 236, 0.45)', border:`1px solid ${f.color}18` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background:`${f.color}18`, color:f.color, border:`1px solid ${f.color}28` }}>{i+1}</div>
                <h3 className="font-black text-sm" style={{ color:'#1A2E28' }}>{s.title}</h3>
              </div>
              <p className="text-sm leading-[2]" style={{ color:'#4A5D56' }}>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}

/* cfg لكل تخطيط: عرض الحاوية، شبكة القدرات، شكل السيناريوهات والسير والأدوار. */
const BODY_CFG = {
  split   : { w:'max-w-6xl', statsW:'max-w-6xl', statsPad:'pb-20', grid:'sm:grid-cols-2 lg:grid-cols-3', scen:'grid',  walk:'timeline', views:'cols' },
  showcase: { w:'max-w-5xl', statsW:'max-w-5xl', statsPad:'pb-20', grid:'sm:grid-cols-2',               scen:'quote', walk:'cards',    views:'rows' },
  flow    : { w:'max-w-6xl', statsW:'max-w-6xl', statsPad:'py-16', grid:'sm:grid-cols-2 lg:grid-cols-3', scen:'rail',  walk:'cards',    views:'cols' },
}

function Body({ f }) {
  const c = BODY_CFG[f.layout] || BODY_CFG.flow
  const order = f.order || DEFAULT_ORDER
  const render = {
    problem     : () => <ProblemSection key="problem" f={f} w={c.w} />,
    whoUses     : () => f.whoUses     && <WhoUses key="whoUses" f={f} w={c.w} />,
    capabilities: () => <CapabilitiesSection key="cap" f={f} w={c.w} grid={c.grid} />,
    walkthrough : () => f.walkthrough && <Walkthrough key="walk" f={f} w={c.w} variant={c.walk} />,
    views       : () => f.views       && <Views key="views" f={f} w={c.w} variant={c.views} />,
    scenarios   : () => <ScenariosSection key="scen" f={f} w={c.w} style={c.scen} />,
    faq         : () => f.faqs?.length > 0 && <FeatureFAQ key="faq" f={f} />,
  }
  return (
    <>
      <section className={`relative z-10 ${c.statsW} mx-auto px-6 ${c.statsPad}`}>
        {f.stats && <StatsBand stats={f.stats} color={f.color} />}
      </section>
      {order.map(k => render[k]?.())}
    </>
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
          style={{ background:'rgba(255, 255, 255, 0.80)', border:`1px solid ${item.color}22`, backdropFilter:'blur(8px)' }}>
          <span className="text-[10px] font-semibold" style={{ color:'#5E6E67' }}>{item.label}</span>
          <span className="font-black text-lg leading-none" style={{ color:item.color }}>{item.value}</span>
        </motion.div>
      ))}
    </div>
  )
}

function SplitLayout({ f }) {
  return (
    <div className="relative min-h-screen" style={{ background:'#F8F5EC' }} dir="rtl">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[55vh] z-0"
        style={{ background:`radial-gradient(ellipse 50% 50% at 70% 0%, ${f.color}08 0%, transparent 70%)` }} aria-hidden />

      {/* HERO — 2 column */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 sm:pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <Breadcrumb f={f} />
          <motion.div variants={stagger(0.06)} initial="hidden" animate="visible">
            <motion.span variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-black tracking-[0.20em] uppercase px-4 py-2 rounded-full mb-8 block w-fit"
              style={{ background:`${f.color}14`, border:`1px solid ${f.color}30`, color:f.color }}>
              <f.icon size={13} strokeWidth={2} />
              {f.badge}
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-black leading-[1.08] mb-7"
              style={{ color:'#1A2E28', fontSize:'clamp(2rem,4.5vw,3.8rem)' }}>
              {f.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="leading-[2] mb-10 max-w-xl"
              style={{ color:'#4A5D56', fontSize:'clamp(0.9rem,1.4vw,1rem)' }}>
              {f.subtitle}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/request"
                className="inline-flex items-center gap-2 rounded-xl font-black px-7 py-3.5 text-sm transition-all"
                style={{ background:`linear-gradient(135deg,${f.color},${f.color}cc)`, color:f.color==='#1F6F52'?'#FFFFFF':'#F3E7E7', boxShadow:`0 6px 24px ${f.color}30` }}>
                احسب اشتراك معهدك <ArrowLeft size={14} strokeWidth={2.5} />
              </Link>
              <Link to="/ihkaam"
                className="inline-flex items-center gap-2 rounded-xl font-semibold px-6 py-3.5 text-sm transition-all"
                style={{ color:'#5E6E67', border:'1px solid rgba(184, 134, 58, 0.12)', background:'rgba(11, 59, 51, 0.03)' }}
                onMouseEnter={e => e.currentTarget.style.color='#1A2E28'}
                onMouseLeave={e => e.currentTarget.style.color='#5E6E67'}>
                جميع الميزات
              </Link>
            </motion.div>
          </motion.div>
        </div>
        {/* visual panel */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-0 rounded-3xl" style={{ background:`radial-gradient(circle at center, ${f.color}12, transparent 70%)` }} />
            <div className="relative rounded-3xl p-6" style={{ background:'rgba(248, 245, 236, 0.85)', border:`1px solid ${f.color}18`, backdropFilter:'blur(12px)' }}>
              <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom:'1px solid rgba(184, 134, 58, 0.06)' }}>
                <span className="text-xs font-black tracking-widest uppercase" style={{ color:'#5E6E67' }}>لوحة التحكم</span>
                <div className="flex gap-1.5">{['#EF4444','#F59E0B','#2E7A5A'].map((c,i)=><div key={i} style={{ width:8,height:8,borderRadius:'50%',background:c,opacity:0.6 }} />)}</div>
              </div>
              {f.heroVisualItems && <DashboardVisual items={f.heroVisualItems} />}
            </div>
          </div>
        </div>
      </section>

      <Body f={f} />

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
      <div style={{ borderRadius:'2.8rem', background:'linear-gradient(160deg,#E9E3D5,#FFFFFF)', border:'2.5px solid rgba(184, 134, 58, 0.35)', padding:'14px 10px 20px', boxShadow:'0 40px 80px rgba(0,0,0,0.85)' }}>
        <div style={{ position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',width:78,height:22,borderRadius:12,background:'#F8F5EC',zIndex:10 }} />
        <div style={{ borderRadius:'2.2rem', overflow:'hidden', background:'#FFFFFF', minHeight:320, display:'flex', flexDirection:'column', gap:8, padding:'36px 12px 16px' }}>
          {/* header */}
          <div style={{ textAlign:'center', padding:'8px 0 12px', borderBottom:'1px solid rgba(184, 134, 58, 0.10)' }}>
            <p style={{ color:'rgba(184, 134, 58, 0.50)', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.15em' }}>بوابة أولياء الأمور</p>
            <p style={{ color:'#1A2E28', fontSize:'0.85rem', fontWeight:900, marginTop:4 }}>أحمد السالم</p>
          </div>
          {/* notifications */}
          {f.phoneNotifications?.map((n, i) => (
            <motion.div key={i} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5+i*0.15, duration:0.45 }}
              style={{ background:'rgba(255, 255, 255, 0.60)', borderRadius:12, padding:'8px 10px', display:'flex', alignItems:'flex-start', gap:8, border:'1px solid rgba(184, 134, 58, 0.08)' }}>
              <span style={{ fontSize:'0.80rem' }}>{n.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:'#1A2E28', fontSize:'0.58rem', fontWeight:700, lineHeight:1.5 }}>{n.text}</p>
                <p style={{ color:'#5E6E67', fontSize:'0.52rem', marginTop:2 }}>{n.time}</p>
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
        style={{ background:'linear-gradient(135deg,#F7F2ED,#F1EBE3)', border:'1px solid rgba(184, 134, 58, 0.30)', boxShadow:'0 40px 80px rgba(0,0,0,0.85)' }}>
        <div className="absolute inset-0" style={{ background:'radial-gradient(circle at 50% 30%, rgba(184, 134, 58, 0.07),transparent 65%)' }} />
        {/* stars */}
        <div className="flex justify-center gap-1.5 mb-5">
          {[...Array(5)].map((_,i) => <Star key={i} size={16} style={{ color:'#8A6425', opacity:i<4?1:0.4 }} fill="#8A6425" />)}
        </div>
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background:'rgba(184, 134, 58, 0.12)', border:'1px solid rgba(184, 134, 58, 0.22)' }}>🏆</div>
        <p style={{ color:'rgba(184, 134, 58, 0.55)', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.22em', marginBottom:8 }}>نجم الحلقة</p>
        <p style={{ color:'#1A2E28', fontWeight:900, fontSize:'1.1rem', marginBottom:4 }}>{cp?.name}</p>
        <p style={{ color:'rgba(184, 134, 58, 0.60)', fontSize:'0.68rem' }}>{cp?.group}</p>
        <div className="mt-6 rounded-2xl py-3 px-4" style={{ background:'rgba(184, 134, 58, 0.08)', border:'1px solid rgba(184, 134, 58, 0.12)' }}>
          <span style={{ color:'#8A6425', fontSize:'0.65rem', fontWeight:700 }}>{cp?.week}</span>
          <span className="block font-black text-xl mt-1" style={{ color:'#8A6425' }}>{cp?.score}</span>
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
        style={{ background:'rgba(248, 245, 236, 0.90)', border:'1px solid rgba(31, 111, 82, 0.18)', boxShadow:'0 40px 80px rgba(0,0,0,0.85)' }}>
        <div className="flex items-center justify-between mb-2 pb-3" style={{ borderBottom:'1px solid rgba(31, 111, 82, 0.08)' }}>
          <span style={{ color:'#5E6E67', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.15em' }}>المكتبة الصوتية</span>
          <Headphones size={14} style={{ color:'#1F6F52' }} />
        </div>
        {f.audioItems?.map((item, i) => (
          <motion.div key={i} initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.45+i*0.12, duration:0.40 }}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:14, background:'rgba(31, 111, 82, 0.06)', border:'1px solid rgba(31, 111, 82, 0.10)' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(31, 111, 82, 0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:'0.65rem', fontWeight:900, color:'#1F6F52' }}>▶</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'#1A2E28', fontSize:'0.68rem', fontWeight:700 }}>{item.page} — {item.surah}</p>
              <p style={{ color:'#5E6E67', fontSize:'0.58rem', marginTop:2 }}>{item.reader}</p>
            </div>
            {/* mini waveform */}
            <div style={{ display:'flex', alignItems:'center', gap:1.5 }}>
              {item.bars.map((h, bi) => (
                <motion.div key={bi}
                  animate={{ scaleY: i===0 ? [1, (h/6), 1] : 1 }}
                  transition={{ duration:0.8, repeat:i===0?Infinity:0, delay:bi*0.08 }}
                  style={{ width:2, height:h, borderRadius:2, background:i===0?'#1F6F52':'rgba(31, 111, 82, 0.25)', transformOrigin:'bottom' }} />
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
        style={{ background:'rgba(248, 245, 236, 0.90)', border:'1px solid rgba(31, 111, 82, 0.15)', boxShadow:'0 40px 80px rgba(0,0,0,0.85)' }}>
        <p style={{ color:'#5E6E67', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.18em', marginBottom:4 }}>ملف الطالب — المواد الرديفة</p>
        {f.subjectCards?.map((sub, i) => (
          <motion.div key={i} initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.45+i*0.10 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background:'rgba(31, 111, 82, 0.05)', border:'1px solid rgba(31, 111, 82, 0.10)' }}>
            <span style={{ fontSize:'1rem' }}>{sub.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#1A2E28', fontSize:'0.72rem', fontWeight:700 }}>{sub.name}</span>
                <span style={{ color:'#1F6F52', fontSize:'0.62rem', fontWeight:700 }}>{sub.grade}</span>
              </div>
              <div style={{ marginTop:6, height:4, borderRadius:2, background:'rgba(31, 111, 82, 0.12)', overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${sub.progress}%` }} transition={{ duration:0.8, delay:0.6+i*0.10 }}
                  style={{ height:'100%', borderRadius:2, background:'linear-gradient(90deg,#1F6F52,#63B496)' }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* smart-insights verdict card — mirrors the real screen: a verdict, then the
   metric rows that produced it. The "from → to" is the whole point, so it is
   the only thing rendered at full contrast. */
const VERDICT_TONE = {
  down: { fg: '#661E1E', bg: 'rgba(192, 57, 43, 0.10)', bd: 'rgba(192, 57, 43, 0.24)' },
  up  : { fg: '#3A8A68', bg: 'rgba(58, 138, 104, 0.10)',  bd: 'rgba(58, 138, 104, 0.24)'  },
  flat: { fg: '#5E6E67', bg: 'rgba(31, 111, 82, 0.05)',  bd: 'rgba(31, 111, 82, 0.10)'  },
}

function InsightsShowcase({ f }) {
  const v = f.insightVerdict
  return (
    <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.65, delay:0.3, ease:[0.22,1,0.36,1] }}
      className="mx-auto w-full max-w-md">
      <div className="rounded-3xl p-5 sm:p-6 flex flex-col gap-3"
        style={{ background:'rgba(248, 245, 236, 0.92)', border:'1px solid rgba(31, 111, 82, 0.16)', boxShadow:'0 40px 80px rgba(0,0,0,0.85)' }}>

        {/* circle header */}
        <div className="flex items-center justify-between gap-3 pb-3"
          style={{ borderBottom:'1px solid rgba(31, 111, 82, 0.08)' }}>
          <div className="text-right min-w-0">
            <p style={{ color:'#1A2E28', fontSize:'0.78rem', fontWeight:800 }}>{v.circle}</p>
            <p style={{ color:'#5E6E67', fontSize:'0.6rem', marginTop:3 }}>{v.teacher}</p>
          </div>
          <Brain size={15} style={{ color:'#1F6F52', flexShrink:0 }} />
        </div>

        {/* the verdict + why */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
          className="rounded-2xl px-3.5 py-3"
          style={{ background:VERDICT_TONE.down.bg, border:`1px solid ${VERDICT_TONE.down.bd}` }}>
          <p style={{ color:VERDICT_TONE.down.fg, fontSize:'0.72rem', fontWeight:800 }}>{v.status}</p>
          <p style={{ color:'#4A5D56', fontSize:'0.62rem', lineHeight:1.9, marginTop:6 }}>{v.reason}</p>
        </motion.div>

        {/* metric rows */}
        {v.metrics.map((m, i) => {
          const t = VERDICT_TONE[m.tone]
          return (
            <motion.div key={m.label} initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.55 + i*0.09, duration:0.40 }}
              className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5"
              style={{ background:'rgba(31, 111, 82, 0.04)', border:'1px solid rgba(31, 111, 82, 0.09)' }}>
              <span style={{ color:'#1A2E28', fontSize:'0.66rem', fontWeight:700, whiteSpace:'nowrap' }}>{m.label}</span>
              <div className="flex items-center gap-2 min-w-0">
                {/* ltr: the eye sweeps right-to-left, so it meets the old value
                    first and the arrow leads it to the new one — "كان كذا وصار كذا" */}
                <span dir="ltr" style={{ color:'#5E6E67', fontSize:'0.6rem', whiteSpace:'nowrap' }}>
                  {m.to} ← {m.from}
                </span>
                <span className="rounded-full px-2 py-0.5" style={{
                  color:t.fg, background:t.bg, border:`1px solid ${t.bd}`,
                  fontSize:'0.53rem', fontWeight:800, whiteSpace:'nowrap',
                }}>{m.chip}</span>
              </div>
            </motion.div>
          )
        })}

        <p style={{ color:'#7FB19F', fontSize:'0.55rem', textAlign:'center', marginTop:2 }}>
          {v.metrics[0].unit && `الوحدة: ${v.metrics[0].unit} · `}المقارنة بماضي الحلقة نفسها
        </p>
      </div>
    </motion.div>
  )
}

function getShowcaseVisual(f) {
  if (f.phoneNotifications) return <PhoneShowcase f={f} />
  if (f.certificatePreview)  return <CertificateShowcase f={f} />
  if (f.audioItems)          return <AudioShowcase f={f} />
  if (f.subjectCards)        return <SubjectsShowcase f={f} />
  if (f.insightVerdict)      return <InsightsShowcase f={f} />
  return null
}

function ShowcaseLayout({ f }) {
  const visual = getShowcaseVisual(f)
  return (
    <div className="relative min-h-screen" style={{ background:'#F8F5EC' }} dir="rtl">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[70vh] z-0"
        style={{ background:`radial-gradient(ellipse 70% 55% at 50% -5%, ${f.color}0A 0%, transparent 65%)` }} aria-hidden />

      {/* HERO — centered */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 sm:pt-28 pb-4 text-center">
        <div className="text-right mb-8 max-w-xs">
          <Breadcrumb f={f} />
        </div>
        <motion.div variants={stagger(0.07)} initial="hidden" animate="visible">
          <motion.span variants={fadeUp}
            className="inline-flex items-center gap-2 text-xs font-black tracking-[0.20em] uppercase px-4 py-2 rounded-full mb-7"
            style={{ background:`${f.color}14`, border:`1px solid ${f.color}30`, color:f.color }}>
            <f.icon size={13} strokeWidth={2} />{f.badge}
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-black leading-[1.08] mb-6 mx-auto"
            style={{ color:'#1A2E28', fontSize:'clamp(2.2rem,5vw,4rem)', maxWidth:680 }}>
            {f.title}
          </motion.h1>
          <motion.p variants={fadeUp} className="leading-[2] mb-10 mx-auto"
            style={{ color:'#4A5D56', fontSize:'clamp(0.9rem,1.5vw,1rem)', maxWidth:560 }}>
            {f.subtitle}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center mb-16">
            <Link to="/request"
              className="inline-flex items-center gap-2 rounded-xl font-black px-7 py-3.5 text-sm transition-all"
              style={{ background:`linear-gradient(135deg,${f.color},${f.color}cc)`, color:f.color==='#1F6F52'?'#FFFFFF':'#F3E7E7', boxShadow:`0 6px 24px ${f.color}30` }}>
              احسب اشتراك معهدك <ArrowLeft size={14} strokeWidth={2.5} />
            </Link>
            <Link to="/ihkaam"
              className="inline-flex items-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all"
              style={{ color:'#5E6E67', border:'1px solid rgba(184, 134, 58, 0.12)', background:'rgba(11, 59, 51, 0.03)' }}
              onMouseEnter={e => e.currentTarget.style.color='#1A2E28'}
              onMouseLeave={e => e.currentTarget.style.color='#5E6E67'}>
              جميع الميزات
            </Link>
          </motion.div>
        </motion.div>
        {/* BIG VISUAL */}
        {visual && (
          <div className="relative pb-16">
            <div className="absolute inset-x-0 bottom-0 h-32 z-10"
              style={{ background:'linear-gradient(to bottom, transparent, #F8F5EC)' }} aria-hidden />
            {visual}
          </div>
        )}
      </section>

      <Body f={f} />

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
            style={{ background:`rgba(248, 245, 236, 0.65)`, border:`1px solid ${color}${i===1?'28':'10'}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background:`${color}${i===1?'22':'10'}`, border:`1px solid ${color}${i===1?'35':'18'}`, color }}>
              {step.num}
            </div>
            <div>
              <h3 className="font-black text-sm mb-1" style={{ color:'#1A2E28' }}>{step.label}</h3>
              <p className="text-xs leading-[1.8]" style={{ color:'#5E6E67' }}>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function FlowLayout({ f }) {
  return (
    <div className="relative min-h-screen" style={{ background:'#F8F5EC' }} dir="rtl">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[50vh] z-0"
        style={{ background:`radial-gradient(ellipse 55% 40% at 30% 0%, ${f.color}08 0%, transparent 70%)` }} aria-hidden />

      {/* HERO — bold left aligned */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 sm:pt-28 pb-6">
        <Breadcrumb f={f} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* LEFT: text */}
          <motion.div variants={stagger(0.06)} initial="hidden" animate="visible">
            <motion.span variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-black tracking-[0.20em] uppercase px-4 py-2 rounded-full mb-8"
              style={{ background:`${f.color}14`, border:`1px solid ${f.color}30`, color:f.color }}>
              <f.icon size={13} strokeWidth={2} />{f.badge}
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-black leading-[1.08] mb-7"
              style={{ color:'#1A2E28', fontSize:'clamp(2rem,4.2vw,3.6rem)' }}>
              {f.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="leading-[2] mb-10"
              style={{ color:'#4A5D56', fontSize:'clamp(0.9rem,1.4vw,1rem)', maxWidth:520 }}>
              {f.subtitle}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/request"
                className="inline-flex items-center gap-2 rounded-xl font-black px-7 py-3.5 text-sm transition-all"
                style={{ background:`linear-gradient(135deg,${f.color},${f.color}cc)`, color:f.color==='#1F6F52'?'#FFFFFF':'#F3E7E7', boxShadow:`0 6px 24px ${f.color}30` }}>
                احسب اشتراك معهدك <ArrowLeft size={14} strokeWidth={2.5} />
              </Link>
              <Link to="/ihkaam"
                className="inline-flex items-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all"
                style={{ color:'#5E6E67', border:'1px solid rgba(184, 134, 58, 0.12)', background:'rgba(11, 59, 51, 0.03)' }}
                onMouseEnter={e => e.currentTarget.style.color='#1A2E28'}
                onMouseLeave={e => e.currentTarget.style.color='#5E6E67'}>
                جميع الميزات
              </Link>
            </motion.div>
          </motion.div>
          {/* RIGHT: flow steps */}
          {f.flowSteps && (
            <motion.div variants={stagger(0.10)} initial="hidden" animate="visible">
              <motion.h2 variants={fadeUp}
                className="text-xs font-semibold tracking-[0.22em] uppercase mb-6" style={{ color:'#5E6E67' }}>
                {f.headings?.flow || 'كيف يعمل؟'}
              </motion.h2>
              <FlowSteps steps={f.flowSteps} color={f.color} />
            </motion.div>
          )}
        </div>
      </section>

      <Body f={f} />

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <CTABottom f={f} />
      </section>
    </div>
  )
}

/* ميزاتٌ لا تملك مقالاً مربوطاً بها مباشرةً تأخذ مقالاتٍ قريبة من موضوعها. */
const FALLBACK_POSTS = {
  library : ['weekly-memorization-plan', 'quran-review-schedule', 'organizing-circles-medium-center'],
  exams   : ['fair-recitation-system', 'how-long-to-memorize-quran', 'quran-certificate-wording'],
  subjects: ['organizing-circles-medium-center', 'weekly-memorization-plan', 'first-90-days-director'],
}

/* مقالات مركز المساعدة التي تشرح كل ميزة خطوةً بخطوة. */
const HELP_FOR_FEATURE = {
  layout  : ['dashboard-overview', 'login'],
  admin   : ['dashboard-overview', 'staff-management'],
  academic: ['groups-management', 'student-registration'],
  daily   : ['daily-recitation', 'attendance-batch'],
  parents : ['parent-portal'],
  reports : ['reports-overview', 'archiving'],
  insights: ['smart-insights', 'insights-metrics'],
  finance : ['finance-tuitions', 'finance-ledger'],
  subjects: ['groups-management'],
  star    : ['star-of-week'],
  library : ['daily-recitation'],
  exams   : ['tests', 'exam-queue'],
  messages: ['parent-portal', 'attendance-staff'],
}

function HelpLinks({ slug }) {
  const items = (HELP_FOR_FEATURE[slug] || []).map(getArticle).filter(Boolean)
  if (items.length === 0) return null
  return (
    <section dir="rtl" className="px-6 pt-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-black text-xl mb-4" style={{ color:'#1A2E28' }}>شرح الاستخدام في مركز المساعدة</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {items.map(a => (
            <li key={a.slug}>
              <Link to={`/help/${a.slug}`}
                className="block rounded-xl px-4 py-3 text-sm font-bold leading-relaxed transition-colors hover:text-[#1F6F52]"
                style={{ color:'#1A2E28', background:'rgba(11, 59, 51, 0.03)', border:'1px solid rgba(11, 59, 51, 0.07)' }}>
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function RelatedArticles({ slug, name }) {
  let posts = BLOG_POSTS.filter(p => p.relatedFeature === slug).slice(0, 4)
  if (posts.length === 0) posts = (FALLBACK_POSTS[slug] || []).map(s => BLOG_POSTS.find(p => p.slug === s)).filter(Boolean)
  if (posts.length === 0) return null
  return (
    <section dir="rtl" className="px-6 pt-14">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-black text-2xl mb-5" style={{ color:'#1A2E28' }}>{name ? `مقالات عن ${name}` : 'مقالات تتصل بهذه الميزة'}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {posts.map(p => (
            <li key={p.slug}>
              <Link to={`/blog/${p.slug}`}
                className="block rounded-xl px-4 py-3 text-sm font-bold leading-relaxed transition-colors hover:text-[#1F6F52]"
                style={{ color:'#1A2E28', background:'rgba(11, 59, 51, 0.03)', border:'1px solid rgba(11, 59, 51, 0.07)' }}>
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════ */
export default function FeatureDetailPage() {
  const { slug } = useParams()
  const { pathname } = useLocation()
  const f = FEATURES[slug]

  if (!f) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6 px-6" dir="rtl">
      <p className="font-black text-3xl" style={{ color:'#1A2E28' }}>الصفحة غير موجودة</p>
      <Link to="/ihkaam" className="text-sm font-bold" style={{ color:'#1F6F52' }}>← العودة لمنصة إحكام</Link>
    </div>
  )

  /* الميزة الأساسية تُخدَم من /features والإضافة المدفوعة من /addons فقط؛
     أي رابط قديم بالنوع الآخر يُحوَّل إلى عنوانه الصحيح فلا يتكرر المحتوى. */
  const kind = f.type === 'addon' ? 'addons' : 'features'
  if (!pathname.startsWith(`/ihkaam/${kind}/`)) return <Navigate to={`/ihkaam/${kind}/${slug}`} replace />

  /* عناوين الفهرسة مفصولةٌ عن عناوين العرض عن قصد: f.title خطافٌ يجذب
     من وصل الصفحة («كل شيء تحت السيطرة.»)، وهو في صفحة النتائج بلا
     دلالة. أما f.subtitle فيصلح وصفاً احتياطياً إن غاب مدخل الـslug. */
  const seo = FEATURE_SEO[slug]

  return (
    <>
      <PageMeta
        title={seo?.title || f.title}
        description={seo?.description || f.subtitle}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE.origin + '/' },
            { '@type': 'ListItem', position: 2, name: 'منصة إحكام', item: SITE.origin + '/ihkaam' },
            { '@type': 'ListItem', position: 3, name: seo?.title || f.title },
          ],
        }}
      />
      {f.layout === 'split'    ? <SplitLayout f={f} />
       : f.layout === 'showcase' ? <ShowcaseLayout f={f} />
       : <FlowLayout f={f} />}

      {/* روابط داخلية (ISS-10): مقالات الميزة، ثم باقي الميزات */}
      <RelatedArticles slug={slug} name={seo?.title} />
      <HelpLinks slug={slug} />
      <FeatureLinksSection exclude={slug} title={seo?.title ? `ميزات أخرى غير ${seo.title}` : 'ميزات أخرى في إحكام'} intro="" />
    </>
  )
}
