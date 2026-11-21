import { useState } from 'react'
import { useParams, useLocation, Navigate, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, Plus, ListChecks, Lightbulb } from 'lucide-react'
import { FEATURES } from '../data/featureDetails'
import { FEATURE_VISUAL } from '../data/helpVisuals'
import { BrowserFrame, PhoneFrame } from '../components/help/ShotFrame'
import PageMeta from '../components/layout/PageMeta'
import { FEATURE_SEO, SITE } from '../config/seo'
import { BLOG_POSTS } from '../data/blogContent'
import { getArticle } from '../data/helpContent'
import FeatureLinksSection from '../components/sections/FeatureLinksSection'
import VideoCard from '../components/video/VideoCard'
import { featureVideos, helpOfVideo, CHANNEL_URL } from '../data/videos'

/* ══════════════════════════════════════════════════════════════════
   صفحة الميزة (إعادة تصميم 2026-11-20)

   كانت ثلاث تخطيطات (split / showcase / flow) من بطاقاتٍ نصيةٍ متشابهة
   بتدرّجات حمراء وخضراء. صارت تخطيطاً واحداً تُرتَّب أقسامه كما في بيانات
   كل ميزة (f.order) وتحمل عناوينها الفريدة (f.headings)، لأن اختلاف الترتيب
   بين الصفحات مقصودٌ للفهرسة. الجديد كله في الشكل:

   - الرأس: الشاشة الحقيقية للميزة كبيرةً بجانب العنوان (أو مشهدٌ مولَّد
     للوحدات التي لا شاشة لها في نسخة العرض).
   - قبل/مع إحكام: صفوفٌ مزدوجة يسير فيها السهم من الألم إلى حلّه.
   - القدرات: قائمة تحريرية مرقّمة بلا بطاقات.
   - خطوة بخطوة: خطٌّ زمني بمربعات ذهبية، كما في مركز المساعدة.
   - الأدوار: اختيار الدور يعرض صورته ونصه.
   - من الواقع: قسمٌ داكن بقصصٍ قصيرة.
   ══════════════════════════════════════════════════════════════════ */

const INK = '#0B3B33', GREEN = '#1F6F52', GOLD = '#B8863A', GOLD_TXT = '#8A6425'
const ease = [0.22, 1, 0.36, 1]
const H2 = { fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', lineHeight: 1.35 }

const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' }, transition: { duration: 0.55, ease, delay: i * 0.07 },
})

/* ─── ذرّات مشتركة ─── */
function Wrap({ children, className = '' }) {
  return <section className={`relative z-10 px-4 sm:px-6 pb-20 sm:pb-24 ${className}`}><div className="max-w-6xl mx-auto">{children}</div></section>
}

function Head({ eyebrow, title, center = false }) {
  return (
    <motion.div {...reveal()} className={`mb-10 ${center ? 'text-center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="font-bold text-[#1A2E28] mt-4 max-w-3xl" style={{ ...H2, marginInline: center ? 'auto' : 0 }}>{title}</h2>
    </motion.div>
  )
}

/* ─── الرأس ─── */
function Breadcrumb({ f }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] text-[#5E6E67] mb-7 flex-wrap" aria-label="مسار التنقل">
      <Link to="/ihkaam" className="hover:text-[#1A2E28]">منصة إحكام</Link>
      <ChevronLeft size={12} />
      <span>{f.type === 'addon' ? 'الوحدات الإضافية' : 'الميزات الأساسية'}</span>
      <ChevronLeft size={12} />
      <span className="text-[#1A2E28]">{f.title.split('.')[0].split('—')[0].trim()}</span>
    </nav>
  )
}

function HeroVisual({ visual }) {
  if (!visual) return null
  const { main, side } = visual
  return (
    /* hero-lift (CSS، إزاحة بلا شفافية): صورة الهيرو أكبر عنصر مرئي، فلا تُكتب
       في HTML المولَّد شفافةً تنتظر framer (ISS-25). */
    <div className="hero-lift" style={{ '--rise-delay': '0.15s' }}>
      <div className="relative rounded-[28px] overflow-hidden section-dark" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="pattern-layer pattern-khatam" aria-hidden />
        <div aria-hidden className="absolute -top-20 right-[-10%] w-[60%] h-[70%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgba(224,181,98,.22), transparent)', filter: 'blur(10px)' }} />
        {main.kind === 'scene' ? (
          <div className="relative aspect-[4/3] sm:aspect-[16/11]"><img src={main.src} alt="" className="absolute inset-0 w-full h-full object-cover" /></div>
        ) : (
          <div className="relative px-4 sm:px-7 pt-7 pb-6 flex justify-center">
            {main.kind === 'phone'
              ? <PhoneFrame shot={main} width={210} eager />
              : <div className="relative w-full"><BrowserFrame shot={main} eager />
                  {side && <div className="hidden sm:block absolute -bottom-3 -left-1"><PhoneFrame shot={side} width={92} /></div>}
                </div>}
          </div>
        )}
        {main.caption && (
          <p className="relative px-6 pb-6 text-center text-[13px] leading-[1.9]" style={{ color: 'rgba(248,245,236,.78)' }}>
            <span className="font-bold" style={{ color: '#E0B562' }}>{main.title}: </span>{main.caption}
          </p>
        )}
      </div>
    </div>
  )
}

function Hero({ f }) {
  const Icon = f.icon
  return (
    <header className="relative px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
      <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" aria-hidden
        style={{ opacity: 0.035, maskImage: 'radial-gradient(ellipse 60% 60% at 70% 20%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 70% 20%, #000, transparent 75%)' }} />
      <div className="relative max-w-6xl mx-auto">
        <Breadcrumb f={f} />
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-center">
          <div className="page-enter">
            <span className="eyebrow"><Icon size={14} /> {f.badge}</span>
            <h1 className="font-bold text-[#1A2E28] mt-5 mb-5" style={{ fontSize: 'clamp(2.1rem, 4.6vw, 3.4rem)', lineHeight: 1.2 }}>{f.title}</h1>
            <p className="text-[17px] sm:text-[18px] leading-[1.95] text-[#4A5D56] max-w-xl">{f.subtitle}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/request" className="btn-cta inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-bold text-[15px]">اختر باقة معهدك <ArrowLeft size={16} /></Link>
              <Link to="/ihkaam" className="btn-outline inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-[15px] border">جميع الميزات</Link>
            </div>
          </div>
          <HeroVisual visual={FEATURE_VISUAL[f.slug]} />
        </div>
      </div>
    </header>
  )
}

/* ─── «كيف يعمل؟»: ثلاث عُقد على خطٍّ واصل ─── */
function FlowStrip({ f }) {
  if (!f.flowSteps?.length) return null
  return (
    <Wrap>
      <Head eyebrow="كيف يعمل؟" title={f.headings?.flow || 'كيف يعمل؟'} />
      <ol className="relative grid md:grid-cols-3 gap-8 md:gap-6">
        <span aria-hidden className="hidden md:block absolute top-[22px] right-[8%] left-[8%] h-[2px]" style={{ background: 'linear-gradient(270deg, rgba(184,134,58,.55), rgba(184,134,58,.15))' }} />
        {f.flowSteps.map((s, i) => (
          <motion.li key={i} {...reveal(i)} className="relative flex md:flex-col gap-4 md:gap-0 md:items-center md:text-center">
            <span className="relative z-10 shrink-0 w-11 h-11 rounded-xl grid place-items-center font-bold text-[17px] md:mb-4"
              style={{ background: INK, color: '#E0B562', fontFamily: 'cairo-latin, inherit', boxShadow: '0 0 0 6px #F8F5EC, 0 8px 18px -8px rgba(8,44,38,.6)' }}>{s.num}</span>
            <div>
              <h3 className="font-bold text-[18px] text-[#1A2E28] mb-1.5">{s.label}</h3>
              <p className="text-[15px] leading-[1.9] text-[#4A5D56] md:max-w-[300px]">{s.desc}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </Wrap>
  )
}

/* ─── شريط الأرقام ─── */
function Stats({ f }) {
  if (!f.stats?.length) return null
  return (
    <Wrap>
      <motion.div {...reveal()} className="section-dark rounded-[26px] overflow-hidden grid sm:grid-cols-3" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="pattern-layer pattern-khatam" aria-hidden />
        {f.stats.map((s, i) => (
          <div key={i} className="relative px-6 py-8 text-center" style={{ borderTop: i ? '1px solid rgba(224,181,98,.18)' : 'none' }}>
            <div className="font-bold leading-tight mb-2" style={{ color: '#E0B562', fontSize: 'clamp(1.5rem, 2.6vw, 2rem)' }}>{s.value}</div>
            <div className="text-[14px] leading-snug" style={{ color: 'rgba(248,245,236,.8)' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>
    </Wrap>
  )
}

/* ─── قبل / مع إحكام ─── */
function ProblemSection({ f }) {
  const rows = f.problem.items.map((p, i) => [p, f.solution.items[i]])
  return (
    <Wrap>
      <Head eyebrow="الواقع والحل" title={f.headings?.problem || f.problem.label} />
      <motion.div {...reveal()} className="rounded-[26px] overflow-hidden" style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
        <div className="hidden md:grid grid-cols-[1fr_56px_1fr] text-[13px] font-bold" style={{ borderBottom: '1px solid var(--line-warm)' }}>
          <div className="px-7 py-3.5" style={{ color: '#8C5A4A', background: '#F6EEE8' }}>{f.problem.label}</div>
          <div style={{ background: '#F1ECDF' }} />
          <div className="px-7 py-3.5" style={{ color: '#F8F5EC', background: INK }}>{f.solution.label}</div>
        </div>
        {rows.map(([p, s], i) => (
          <motion.div key={i} {...reveal(i * 0.5)} className="grid md:grid-cols-[1fr_56px_1fr] items-stretch" style={{ borderTop: i ? '1px solid var(--line-warm)' : 'none' }}>
            <p className="px-6 md:px-7 pt-5 md:py-6 text-[15px] leading-[1.9] text-[#7A6A62]">
              <span className="md:hidden block text-[12px] font-bold mb-1" style={{ color: '#8C5A4A' }}>{f.problem.label}</span>{p}
            </p>
            <span aria-hidden className="grid place-items-center py-1 md:py-0" style={{ color: GOLD }}>
              <ArrowLeft size={20} className="rotate-[-90deg] md:rotate-0" />
            </span>
            <p className="px-6 md:px-7 pb-5 md:py-6 text-[15.5px] leading-[1.9] font-semibold text-[#1A2E28]">
              <span className="md:hidden block text-[12px] font-bold mb-1" style={{ color: GREEN }}>{f.solution.label}</span>{s}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Wrap>
  )
}

/* ─── لمن هذه الميزة؟ ─── */
function WhoUses({ f }) {
  const d = f.whoUses
  return (
    <Wrap>
      <Head eyebrow="لمن هذه الميزة؟" title={d.title} />
      <motion.div {...reveal()} className={`grid ${d.paras.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} rounded-[26px] overflow-hidden`}
        style={{ background: '#F1ECDF', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
        {d.paras.map((p, i) => (
          <div key={i} className={`relative p-7 sm:p-8 ${i ? 'border-t md:border-t-0 md:border-s' : ''}`} style={{ borderColor: 'rgba(184,134,58,.28)' }}>
            <span aria-hidden className="block w-2.5 h-2.5 rotate-45 mb-4" style={{ background: GOLD }} />
            <p className="text-[16px] leading-[2] text-[#2F4540]">{p}</p>
          </div>
        ))}
      </motion.div>
    </Wrap>
  )
}

/* ─── القدرات: قائمة تحريرية مرقّمة ─── */
function CapabilitiesSection({ f }) {
  return (
    <Wrap>
      <Head eyebrow="ماذا يفعل بالضبط؟" title={f.headings?.cap || 'ما تحمله هذه الميزة'} />
      <div className="grid md:grid-cols-2 gap-x-14">
        {f.capabilities.map((c, i) => {
          const Icon = c.icon
          return (
            <motion.div key={i} {...reveal((i % 2) * 0.6)} className="flex gap-5 py-7" style={{ borderTop: '1px solid var(--line-warm)' }}>
              <div className="shrink-0 flex flex-col items-center gap-3">
                <span className="w-12 h-12 rounded-xl grid place-items-center" style={{ background: INK, color: '#E0B562', boxShadow: '0 8px 18px -8px rgba(8,44,38,.6)' }}>
                  <Icon size={21} strokeWidth={1.7} />
                </span>
                <span className="text-[12px] font-bold tabular-nums" style={{ color: GOLD, fontFamily: 'cairo-latin, inherit' }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div>
                <h3 className="font-bold text-[19px] text-[#1A2E28] mb-2">{c.title}</h3>
                <p className="text-[15.5px] leading-[1.95] text-[#4A5D56]">{c.desc}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Wrap>
  )
}

/* ─── خطوة بخطوة: خطٌّ زمني ─── */
function Walkthrough({ f }) {
  const d = f.walkthrough
  return (
    <Wrap>
      <Head eyebrow="خطوة بخطوة في معهد قرآني" title={d.title} />
      {d.intro && <p className="text-[17px] leading-[1.95] text-[#4A5D56] max-w-3xl -mt-4 mb-10">{d.intro}</p>}
      <ol className="max-w-3xl">
        {d.steps.map((s, i) => {
          const last = i === d.steps.length - 1
          return (
            <motion.li key={i} {...reveal()} className="relative flex gap-4 sm:gap-6">
              <div className="flex flex-col items-center shrink-0">
                <span className="w-11 h-11 rounded-xl grid place-items-center font-bold text-[17px] tabular-nums"
                  style={{ background: INK, color: '#E0B562', fontFamily: 'cairo-latin, inherit', boxShadow: '0 8px 18px -8px rgba(8,44,38,.6)' }}>{i + 1}</span>
                {!last && <span className="flex-1 w-[2px] mt-2 rounded-full" style={{ background: 'linear-gradient(180deg, rgba(184,134,58,.55), rgba(184,134,58,.08))' }} />}
              </div>
              <div className={`flex-1 ${last ? '' : 'pb-9'}`}>
                <h3 className="font-bold text-[19px] text-[#1A2E28] mb-2 pt-1.5">{s.t}</h3>
                <p className="text-[16px] leading-[1.95] text-[#2F4540]">{s.d}</p>
              </div>
            </motion.li>
          )
        })}
      </ol>
      {d.outro && <p className="text-[16px] leading-[1.95] text-[#4A5D56] max-w-3xl mt-8">{d.outro}</p>}
    </Wrap>
  )
}

/* ─── من زاوية كل دور: الدور يختار صورته ─── */
const ROLE_IMG = [
  [/ولي|أولياء|الأهل|الأب/, '/scenes/role-parent.webp'],
  [/مختبر|مُختبر/, '/scenes/role-examiner.webp'],
  [/مالي|محاسب|الصندوق/, '/scenes/addon-finance.webp'],
  [/طالب/, '/scenes/role-student.webp'],
  [/معلم|مدرّس|مدرس/, '/scenes/role-teacher.webp'],
  [/مدير|مشرف|إداري|الإدارة/, '/scenes/role-director.webp'],
]
const roleImg = (role) => ROLE_IMG.find(([re]) => re.test(role))?.[1] || null

function Views({ f }) {
  const d = f.views
  const [i, setI] = useState(0)
  const it = d.items[i]
  const img = roleImg(it.role)
  return (
    <Wrap>
      <Head eyebrow="من زاوية كل دور" title={d.title} />
      <div role="tablist" className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6" style={{ scrollbarWidth: 'none' }}>
        {d.items.map((x, k) => {
          const on = k === i
          return (
            <button key={k} role="tab" aria-selected={on} type="button" onClick={() => setI(k)}
              className="relative shrink-0 rounded-full px-5 py-2.5 text-[14px] font-bold"
              style={{ color: on ? '#F8F5EC' : '#1A2E28', background: on ? 'transparent' : '#FDFBF7', boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line-warm)' }}>
              {on && <motion.span layoutId="role-pill" className="absolute inset-0 rounded-full" style={{ background: INK }} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative">{x.role}</span>
            </button>
          )
        })}
      </div>
      <div className={`grid ${img ? 'lg:grid-cols-[1.05fr_1fr]' : ''} rounded-[28px] overflow-hidden`}
        style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line-warm)' }}>
        {img && (
          <div className="relative min-h-[220px] lg:min-h-[320px] overflow-hidden" style={{ background: '#E9E3D5' }}>
            <AnimatePresence mode="wait">
              <motion.img key={img} src={img} alt="" className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease }} />
            </AnimatePresence>
          </div>
        )}
        <div className="p-7 sm:p-10 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
              <div className="text-[13px] font-bold mb-3" style={{ color: GOLD_TXT }}>ما يراه {it.role}</div>
              <p className="text-[18px] leading-[2] text-[#1A2E28]">{it.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Wrap>
  )
}

/* ─── من الواقع: قصصٌ قصيرة على خلفية داكنة ─── */
function ScenariosSection({ f }) {
  if (!f.scenarios?.length) return null
  return (
    <section className="relative z-10 px-4 sm:px-6 pb-20 sm:pb-24">
      <div className="section-dark max-w-6xl mx-auto rounded-[28px] overflow-hidden p-7 sm:p-12" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="pattern-layer pattern-khatam" aria-hidden />
        <div className="relative">
          <span className="eyebrow">من الواقع</span>
          <h2 className="font-bold mt-4 mb-9 max-w-2xl" style={{ ...H2, color: '#F8F5EC' }}>{f.headings?.scenarios || 'من واقع المعهد'}</h2>
          <div className={`grid ${f.scenarios.length > 1 ? 'md:grid-cols-2' : ''} gap-5`}>
            {f.scenarios.map((s, i) => (
              <motion.div key={i} {...reveal(i)} className="rounded-[22px] p-6 sm:p-7"
                style={{ background: 'rgba(248,245,236,.07)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.25)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-9 h-9 rounded-lg grid place-items-center font-bold tabular-nums" style={{ background: '#E0B562', color: INK, fontFamily: 'cairo-latin, inherit' }}>{i + 1}</span>
                  <h3 className="font-bold text-[18px]" style={{ color: '#F8F5EC' }}>{s.title}</h3>
                </div>
                <p className="text-[15.5px] leading-[2]" style={{ color: 'rgba(248,245,236,.84)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── الأسئلة ─── */
function FeatureFAQ({ f }) {
  const t = FEATURE_SEO[f.slug]?.title
  return (
    <section className="relative z-10 px-4 sm:px-6 pb-20 sm:pb-24">
      <div className="max-w-3xl mx-auto">
        <Head eyebrow="أسئلة شائعة" title={t ? `أسئلة عن ${t}` : 'أسئلة عن هذه الميزة'} center />
        <div className="space-y-2.5">
          {f.faqs.map((it, i) => (
            <details key={i} open={i === 0} className="group rounded-2xl px-5 py-4 open:pb-5"
              style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-[16px] leading-[1.8] text-[#1A2E28] [&::-webkit-details-marker]:hidden">
                {it.q}
                <span className="shrink-0 w-8 h-8 rounded-full grid place-items-center transition-transform group-open:rotate-45" style={{ background: '#F1ECDF', color: INK }}><Plus size={16} /></span>
              </summary>
              <p className="text-[15.5px] leading-[1.95] text-[#2F4540] mt-3">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── الدعوة الختامية ─── */
function CTABottom({ f }) {
  const addon = f.type === 'addon'
  return (
    <section className="relative z-10 px-4 sm:px-6 pb-20">
      <motion.div {...reveal()} className="section-dark max-w-6xl mx-auto rounded-[28px] overflow-hidden p-8 sm:p-14 text-center" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="pattern-layer pattern-khatam" aria-hidden />
        <div className="relative">
          <span className="eyebrow">جاهز للبدء؟</span>
          <h2 className="font-bold mt-5 mb-4 mx-auto" style={{ color: '#F8F5EC', fontSize: 'clamp(1.7rem, 3.2vw, 2.5rem)', maxWidth: 560, lineHeight: 1.3 }}>
            {f.headings?.cta || (addon ? 'أضف هذه الوحدة لنسختك' : 'ابدأ مع إحكام')}
          </h2>
          <p className="text-[16px] leading-[1.95] mx-auto mb-8" style={{ color: 'rgba(248,245,236,.8)', maxWidth: 460 }}>
            {addon
              ? 'وحدة اختيارية تُضاف فوق النسخة الأساسية، وتدخل في حساب اشتراك معهدك.'
              : 'هذه الميزة ضمن النسخة الأساسية دون رسوم إضافية، وتتوفر تجربة مجانية قبل أن تشترك.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/request" className="btn-cta inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-bold text-[15px]">اختر باقة معهدك <ArrowLeft size={16} /></Link>
            <Link to="/ihkaam" className="btn-outline inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-bold text-[15px] border">استكشف المنصة كاملة</Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ─── الشرح المصوّر (بند AI-03): فيديوهات القناة، تُحمَّل عند النقر فقط ─── */
function FeatureVideos({ slug }) {
  const vids = featureVideos(slug)
  if (!vids.length) return null
  return (
    <Wrap>
      <Head eyebrow="شرح مصوّر" title="شاهد الشرح مصوّراً" />
      <div className={vids.length === 1 ? 'max-w-3xl' : 'grid gap-x-8 gap-y-10 md:grid-cols-2'}>
        {vids.map(v => (
          <VideoCard
            key={v.key}
            video={v}
            links={helpOfVideo(v.key).map(getArticle).filter(Boolean).map(a => [`/help/${a.slug}`, `الشرح المكتوب: ${a.title}`])}
          />
        ))}
      </div>
      <p className="mt-8 text-[14px] text-[#5E6E67]">
        الفيديوهات من سلسلة «شرح إحكام» على <a href={CHANNEL_URL} target="_blank" rel="noopener" className="font-bold text-[#1F6F52] underline underline-offset-4">قناة إحكام في يوتيوب</a>.
      </p>
    </Wrap>
  )
}

/* ─── ترتيب الأقسام: من بيانات الميزة ─── */
const DEFAULT_ORDER = ['problem', 'whoUses', 'capabilities', 'walkthrough', 'views', 'scenarios', 'faq']

function Body({ f }) {
  const order = f.order || DEFAULT_ORDER
  const render = {
    problem     : () => <ProblemSection key="problem" f={f} />,
    whoUses     : () => f.whoUses     && <WhoUses key="whoUses" f={f} />,
    capabilities: () => <CapabilitiesSection key="cap" f={f} />,
    walkthrough : () => f.walkthrough && <Walkthrough key="walk" f={f} />,
    views       : () => f.views       && <Views key="views" f={f} />,
    scenarios   : () => <ScenariosSection key="scen" f={f} />,
    faq         : () => f.faqs?.length > 0 && <FeatureFAQ key="faq" f={f} />,
  }
  return <>{order.map(k => render[k]?.())}</>
}

/* ─── روابط داخلية ─── */
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

function LinkRows({ title, icon: Icon, items }) {
  return (
    <div>
      <h2 className="flex items-center gap-2.5 font-bold text-[#1A2E28] mb-4" style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)' }}>
        <Icon size={19} style={{ color: GOLD_TXT }} /> {title}
      </h2>
      <ul className="space-y-2.5">
        {items.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all hover:-translate-y-0.5"
              style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
              <span className="flex-1 text-[15px] font-bold leading-snug text-[#1A2E28] group-hover:text-[#1F6F52] transition-colors">{label}</span>
              <ChevronLeft size={16} className="text-[#5E6E67] shrink-0 transition-transform group-hover:-translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RelatedLinks({ slug, name }) {
  let posts = BLOG_POSTS.filter(p => p.relatedFeature === slug).slice(0, 4)
  if (posts.length === 0) posts = (FALLBACK_POSTS[slug] || []).map(s => BLOG_POSTS.find(p => p.slug === s)).filter(Boolean)
  const help = (HELP_FOR_FEATURE[slug] || []).map(getArticle).filter(Boolean)
  if (!posts.length && !help.length) return null
  return (
    <section dir="rtl" className="px-4 sm:px-6 pb-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        {help.length > 0 && <LinkRows title="شرح الاستخدام في مركز المساعدة" icon={ListChecks} items={help.map(a => [`/help/${a.slug}`, a.title])} />}
        {posts.length > 0 && <LinkRows title={name ? `مقالات عن ${name}` : 'مقالات تتصل بهذه الميزة'} icon={Lightbulb} items={posts.map(p => [`/blog/${p.slug}`, p.title])} />}
      </div>
    </section>
  )
}

/* ─── الصفحة ─── */
export default function FeatureDetailPage() {
  const { slug } = useParams()
  const { pathname } = useLocation()
  const f = FEATURES[slug]

  if (!f) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6 px-6" dir="rtl">
      <p className="font-bold text-3xl" style={{ color: '#1A2E28' }}>الصفحة غير موجودة</p>
      <Link to="/ihkaam" className="text-sm font-bold" style={{ color: '#1F6F52' }}>← العودة لمنصة إحكام</Link>
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
    <div dir="rtl" style={{ background: '#F8F5EC', minHeight: '100vh' }}>
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
      <Hero f={f} />
      <FlowStrip f={f} />
      <Stats f={f} />
      <Body f={f} />
      <FeatureVideos slug={slug} />
      <CTABottom f={f} />

      {/* روابط داخلية (ISS-10): شروح الميزة ومقالاتها، ثم باقي الميزات */}
      <RelatedLinks slug={slug} name={seo?.title} />
      <FeatureLinksSection exclude={slug} title={seo?.title ? `ميزات أخرى غير ${seo.title}` : 'ميزات أخرى في إحكام'} intro="" />
    </div>
  )
}
