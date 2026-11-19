import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ShieldCheck, TrendingUp, BookOpenCheck, Users, Award, Building2, Lock } from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { fetchPartnerRows, cleanPartners } from '../../config/partners'
import { ACCENT, ACCENT_DEEP, GOLD, TEXT_2 } from '../../config/palette'

/* ══════════════════════════════════════════════════════════════════
   «أرقام كل معهد من سجلّاته» (إعادة تصميم 2026-11-19 ب)

   كان مروحةً ثلاثية الأبعاد من خمس بطاقات تدور كل ثانيتين، بخطوطٍ
   بين 8 و11 بكسل، وشارات مراتب (#1 #2…) وألوان hash، والمعهد بلا
   اسمٍ ولا شعار (موقعه فقط). رآه المالك «سيئاً جداً».

   صار سجلاً من عمودين:
   • قائمة المعاهد (ما يميّزها، مدينتها وحجمها، رقمها الأبرز).
   • لوحٌ داكن للمعهد المختار: رقمه البطل كبيراً بالذهب، وثلاثة
     أرقامٍ مساندة بخطٍّ مقروء، ومقارنة التسميع إن نما، وجملةٌ تلخّصه.
   يتبدّل المعهد كل 7 ثوانٍ ويقف حين يمرّ الزائر فوق القسم. لا مراتب
   مرقّمة: ترتيب المعاهد علناً يقرؤه المعهد الثامن على أنه «الأخير».

   بلا اسمٍ ولا شعار (قرار المالك: خصوصية المعهد). يُعرَّف كل معهد
   بمدينته وحجمه وما يميّزه («ريادة التسميع»…)، وعلامته أيقونةٌ تدلّ
   على رقمه الأبرز، لا شعاره.

   حساب الأرقام وقاعدة من يدخل القسم لم يتغيّرا (أدناه).
   ══════════════════════════════════════════════════════════════════ */

const INTERVAL_MS = 7000


const GOLD_L = '#E0B562'
const CREAM  = '#F8F5EC'
const INK    = '#0B3B33'

// ---------------------------------------------------------------------------
// CountUp
// ---------------------------------------------------------------------------
function parseVal(str) {
  if (typeof str !== 'string') return { ok: false }
  let s = str.trim()
  const prefix = s.startsWith('+') ? '+' : s.startsWith('-') ? '-' : ''
  if (prefix) s = s.slice(1)
  let suffix = ''
  if (s.endsWith('%'))      { suffix = '%';   s = s.slice(0, -1) }
  else if (s.endsWith('/10')) { suffix = '/10'; s = s.slice(0, -3) }
  const num = parseFloat(s.replace(/,/g, ''))
  if (isNaN(num)) return { ok: false }
  return { ok: true, prefix, target: num, suffix, comma: s.includes(','), decimal: s.includes('.') }
}
function fmtVal(n, { prefix, suffix, comma, decimal }) {
  const v = decimal ? n.toFixed(1) : comma ? Math.round(n).toLocaleString('en-US') : Math.round(n).toString()
  return `${prefix}${v}${suffix}`
}
function CountUp({ value, style, className }) {
  const info = useMemo(() => parseVal(value), [value])
  const [display, setDisplay] = useState(() => info.ok ? fmtVal(0, info) : value)
  const raf = useRef(null)
  useEffect(() => {
    if (!info.ok) return
    const t0 = performance.now()
    const dur = Math.min(1400, Math.max(700, info.target * 0.8))
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1)
      setDisplay(fmtVal(info.target * (1 - Math.pow(1 - p, 4)), info))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, info])
  return <span className={className} style={style}>{info.ok ? display : value}</span>
}

// ---------------------------------------------------------------------------
// Metrics helpers
// ---------------------------------------------------------------------------
function deriveMetrics(m) {
  const { students=0, groups=0, recs=0, absent=0, tardiness=0, recentRec=0, earlyRec=0, avgGrade=null } = m
  const raw    = earlyRec >= 15 ? Math.round((recentRec - earlyRec) / earlyRec * 100) : null
  const growth = (raw !== null && raw >= 40 && raw <= 600) ? raw : null
  // attendance: جدول attendance يحفظ الغياب/التأخر فقط — الحاضر لا يُخزَّن
  const absentPerGroup   = groups > 0 && absent > 0    ? Math.round(absent    / groups)   : null
  const tardyPerGroup    = groups > 0 && tardiness > 0  ? Math.round(tardiness / groups)   : null
  const absentPerStudent = students > 0 && absent > 0   ? +(absent    / students).toFixed(1) : null
  const tardyPerStudent  = students > 0 && tardiness > 0 ? +(tardiness / students).toFixed(1) : null
  // efficiency ratios (cumulative)
  const studentsPerGroup = groups > 0 && students > 0  ? Math.round(students / groups) : null
  const recsPerGroup     = groups > 0 && recs > 0      ? Math.round(recs / groups)     : null
  const recsPerStudent   = students > 0 && recs > 0    ? Math.round(recs / students)   : null
  return {
    students, groups, recs, absent, tardiness, recentRec, earlyRec,
    // attPct/absPct are null because حاضر isn't stored; use raw counts instead
    attPct: null, absPct: null, tardPct: null,
    absentPerGroup, tardyPerGroup, absentPerStudent, tardyPerStudent,
    studentsPerGroup, recsPerGroup, recsPerStudent,
    growth, avgGrade,
  }
}

function pickHero(d) {
  const { growth, attPct, absPct, recs, students, groups, avgGrade } = d
  if (growth !== null)                return { value: `+${growth}%`,  label: growth >= 150 ? 'نمو استثنائي في التسميع' : growth >= 80 ? 'تضاعف نشاط التسميع' : 'نمو ملموس في التسميع' }
  if (attPct !== null && attPct >= 85) return { value: `${attPct}%`,  label: 'معدل حضور الطلاب' }
  if (absPct !== null && absPct < 8)   return { value: `${absPct}%`,  label: 'فقط نسبة الغياب' }
  if (avgGrade !== null && avgGrade >= 7.5) return { value: `${avgGrade.toFixed(1)}/10`, label: 'متوسط درجات التسميع' }
  if (recs >= 100)     return { value: `+${recs.toLocaleString('en-US')}`, label: 'جلسة تسميع موثقة' }
  if (students >= 10)  return { value: `+${students}`, label: 'طالب نشط' }
  return { value: `${groups || recs || '✓'}`, label: groups ? 'حلقة مفعلة' : 'جلسة تسميع' }
}

function pickSupporting(d, heroLabel) {
  const { growth, attPct, absPct, recs, students, groups, avgGrade } = d
  const pool = []
  if (!heroLabel.includes('نمو')   && growth !== null)                    pool.push({ v:`+${growth}%`, l:'نمو التسميع' })
  if (!heroLabel.includes('حضور')  && attPct !== null && attPct >= 70)    pool.push({ v:`${attPct}%`,  l:'الحضور' })
  if (!heroLabel.includes('غياب')  && absPct !== null && absPct < 20 && attPct === null) pool.push({ v:`${absPct}%`, l:'الغياب' })
  if (!heroLabel.includes('جلسة')  && recs > 0)    pool.push({ v:`+${recs.toLocaleString('en-US')}`, l:'جلسة تسميع' })
  if (!heroLabel.includes('طالب')  && students > 0) pool.push({ v:`+${students}`, l:'طالب' })
  if (groups > 0)                                   pool.push({ v:`${groups}`, l: groups === 1 ? 'حلقة' : 'حلقات' })
  if (!heroLabel.includes('درجة')  && avgGrade !== null && avgGrade >= 7) pool.push({ v:`${avgGrade.toFixed(1)}/10`, l:'الدرجات' })
  return pool.slice(0, 3)
}

function buildTagline(d) {
  const { growth, attPct, absPct, recs, students, groups, avgGrade } = d
  if (growth !== null && attPct !== null && attPct >= 85) return `نمو ${growth}% في التسميع وحضور ${attPct}% — تحول رقمي حقيقي`
  if (growth !== null)          return `النشاط نما ${growth}% خلال شهرين — الالتزام يتضاعف حين يُقاس`
  if (attPct !== null && attPct >= 92) return `${attPct}% من الطلاب يحضرون بانتظام — الشفافية الفورية تصنع الفرق`
  if (attPct !== null && attPct >= 85) return `${attPct}% معدل حضور موثق تلقائياً — بدون جدول Excel واحد`
  if (absPct !== null && absPct < 5)   return `${absPct}% غياب فقط — الشفافية الرقمية تصنع الانضباط`
  if (recs >= 1000 && students >= 30)  return `${recs.toLocaleString('en-US')} جلسة لـ${students} طالب — كل واحدة محفوظة`
  if (recs >= 300)       return `${recs.toLocaleString('en-US')} جلسة تسميع — سجل رقمي لا يضيع`
  if (students >= 30)    return `${students} طالباً في ${groups} حلقة — يُتابَعون يومياً من لوحة واحدة`
  if (avgGrade !== null && avgGrade >= 8) return `متوسط ${avgGrade.toFixed(1)}/10 في الدرجات — المتابعة الدقيقة ترفع النتائج`
  if (students > 0 && recs > 0) return `${students} طالب و${recs} جلسة — بداية التحول مع إحكام`
  return `من الورقة إلى النظام — تحول ملموس يومياً`
}

/* شارة التخصّص: الذهب للقمّة وحدها (الأعلى إنجازاً، وريادة
   التسميع، والتفوّق الأكاديمي)، والتركوازي لكل ما دونها، والمحايد
   للانتظام — وهو التزامٌ لا تميّز.

   كانت ستّة ألوان على اثنتي عشرة حالة، ولا خطٌّ يفصل: «انتظام
   مثالي» ورديّ و«شبه صفر غياب» تانٌّ و«تفوق أكاديمي» نحاسيّ —
   ثلاث حالاتٍ متجاورة المعنى بثلاثة ألوانٍ متباعدة. فيقرأ الزائر
   لوناً يظنّه يعني درجةً، ولا يعني شيئاً. الذهب هنا يعني «الأعلى»،
   ولذلك لا يصحّ أن يناله من حضر بانتظام. */
function pickSpecialty(d, rank) {
  const { growth, attPct, absPct, recs, students, avgGrade } = d
  // rank-0 gets the prestige label; others get metric-based
  if (rank === 0 && growth !== null && growth >= 80)  return { label: 'نمو + ريادة',         color: GOLD }
  if (rank === 0)                                      return { label: 'الأعلى إنجازاً',      color: GOLD }
  if (growth !== null && growth >= 150)                return { label: 'نشاط تضاعف',          color: ACCENT }
  if (growth !== null && growth >= 40)                 return { label: 'نمو متسارع',           color: ACCENT }
  if (attPct !== null && attPct >= 95)                 return { label: 'انتظام مثالي',         color: TEXT_2 }
  if (attPct !== null && attPct >= 88)                 return { label: 'حضور متميز',           color: TEXT_2 }
  if (absPct !== null && absPct < 4)                   return { label: 'شبه صفر غياب',         color: TEXT_2 }
  /* بلا أسماء صار الوصف هو ما يميّز المعاهد في القائمة، فدرجات التسميع
     ثلاث بدل واحدة كي لا تتكرّر «ريادة التسميع» خمس مرات */
  if (students >= 500)                                 return { label: 'قاعدة طلاب واسعة',    color: ACCENT_DEEP }
  if (recs >= 20000)                                   return { label: 'ريادة التسميع',        color: GOLD }
  if (recs >= 10000)                                   return { label: 'تسميع غزير',           color: ACCENT }
  if (recs >= 5000)                                    return { label: 'تسميع منتظم',          color: ACCENT }
  if (recs >= 1000)                                    return { label: 'تسميع مكثّف',          color: ACCENT }
  if (students >= 200)                                 return { label: 'قاعدة طلاب واسعة',    color: ACCENT_DEEP }
  if (avgGrade !== null && avgGrade >= 8.5)            return { label: 'تفوق أكاديمي',         color: GOLD }
  if (students >= 50)                                  return { label: 'مجتمع نشط',            color: ACCENT_DEEP }
  return { label: 'تحول رقمي', color: ACCENT }
}

function scoreMetrics(d) {
  const { recs=0, students=0, groups=0, attPct=null, growth=null } = d
  return recs * 1.2 + students * 8 + groups * 4 + (attPct ?? 0) * 1.8 + Math.min(growth ?? 0, 5) * 60
}

// ---------------------------------------------------------------------------
// من يدخل القسم
// ---------------------------------------------------------------------------
/* كان الشرط «طالبٌ واحد أو جلسةٌ واحدة»، فدخلت الحسابات المفتوحة
   حديثاً: أربعُ بطاقاتٍ مكتوبٌ عليها «+1 طالب» و«حلقة مفعلة»،
   لكلٍّ منها مرتبةٌ مرقّمة وشارة «موثّق»، تقف في الصفّ نفسه مع
   معهدٍ فيه 17,654 جلسة. والزائر لا يقرأ البطاقة الضعيفة على أنها
   حسابٌ فُتح أمس، بل على أنها ما ينتظره هو.

   الأرضية تُخرج الحساب الذي لم يبدأ بعد، والإشارة تُخرج المعهد
   الذي بدأ ولم يصل. وهذا قسم قصص نجاح، فليدخله من له قصة. */
const FLOOR     = { students: 20, groups: 2, recs: 300 }
const MAX_CARDS = 8

function isStrong(d) {
  if (d.students < FLOOR.students) return false
  if (d.groups   < FLOOR.groups)   return false
  if (d.recs     < FLOOR.recs)     return false
  // وفوق الأرضية: إشارةٌ واحدةٌ على الأقل تستحقّ أن تُعرض
  return d.recs >= 1000
      || d.students >= 100
      || d.growth !== null
      || (d.avgGrade !== null && d.avgGrade >= 8)
}


// ---------------------------------------------------------------------------
// عرض
// ---------------------------------------------------------------------------
const anonTitle = (inst) => (inst.city ? `معهد في ${inst.city}` : 'معهد قرآني')
/* العدد مقرَّباً لا دقيقاً، وبلا عدد الحلقات: المدينة + «206 طلاب و9 حلقات»
   تكفي أهل المدينة ليعرفوا المعهد، فتسقط الخصوصية من باب آخر */
const sizeLine  = (d) => (d.students >= 50 ? `أكثر من ${Math.floor(d.students / 50) * 50} طالب` : '')

/* علامة مجهولة الهوية: أيقونةٌ تدلّ على أبرز ما في المعهد */
function AnonMark({ d, size, light = false }) {
  const Icon = d.growth !== null ? TrendingUp
             : d.recs >= 1000   ? BookOpenCheck
             : d.avgGrade !== null && d.avgGrade >= 8 ? Award
             : d.students >= 50 ? Users : Building2
  return (
    <span className="w-full h-full flex items-center justify-center rounded-full"
      style={light
        ? { background: 'rgba(224,181,98,0.12)', color: GOLD_L }
        : { background: 'radial-gradient(circle at 32% 26%, #1A5546 0%, #0B3B33 60%, #082C26 100%)', color: GOLD_L }}>
      <Icon size={Math.round(size * 0.44)} strokeWidth={1.8} />
    </span>
  )
}

/* صفٌّ في قائمة المعاهد */
function InstituteRow({ card, active, onPick, progressKey, paused }) {
  const { inst, d, hero, specialty } = card
  return (
    <button type="button" onClick={onPick} aria-pressed={active}
      className="relative w-full text-right flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-colors duration-300 overflow-hidden"
      style={{
        background: active ? '#FFFFFF' : 'transparent',
        boxShadow : active ? 'var(--shadow-sm), inset 0 0 0 1px rgba(184,134,58,0.45)' : 'inset 0 0 0 1px transparent',
      }}>
      <span className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 46, height: 46, boxShadow: '0 0 0 1px rgba(184,134,58,0.35)' }}>
        <AnonMark d={d} size={46} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-base font-bold truncate" style={{ color: 'var(--text-1)' }}>{specialty.label}</span>
        <span className="block text-sm truncate" style={{ color: 'var(--text-3)' }}>{[anonTitle(inst), sizeLine(d)].filter(Boolean).join(' · ')}</span>
      </span>
      <span className="flex-shrink-0 text-left">
        <span className="block text-base font-bold tabular-nums" dir="ltr" style={{ color: active ? '#8A6425' : INK }}>{hero.value}</span>
        <span className="block text-xs" style={{ color: 'var(--text-3)' }}>{hero.label}</span>
      </span>
      {active && !paused && (
        <motion.span key={progressKey} aria-hidden className="absolute bottom-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg,#B8863A,#E0B562)' }}
          initial={{ width: '0%' }} animate={{ width: '100%' }}
          transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }} />
      )}
    </button>
  )
}

/* لوح المعهد المختار */
function Spotlight({ card }) {
  const { inst, d, hero } = card
  const supporting = pickSupporting(d, hero.label)
  const tagline    = buildTagline(d)
  const { specialty } = card
  const showGrowth = d.growth !== null && d.recentRec > 0 && d.earlyRec > 0
  const maxRec     = Math.max(d.recentRec, d.earlyRec, 1)

  return (
    <motion.div key={inst.institute_id}
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-[1] h-full flex flex-col p-7 sm:p-10">

      {/* الرأس */}
      <div className="flex items-center gap-4">
        <span className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 64, height: 64, boxShadow: '0 0 0 1.5px rgba(224,181,98,0.6), 0 0 0 6px rgba(224,181,98,0.08)' }}>
          <AnonMark d={d} size={64} light />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold truncate" style={{ color: CREAM, fontSize: 'clamp(1.3rem, 2.4vw, 1.75rem)' }}>{anonTitle(inst)}{inst.country ? `، ${inst.country}` : ''}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm" style={{ color: 'rgba(248,245,236,0.7)' }}>
            {sizeLine(d) && <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {sizeLine(d)}</span>}
            <span className="inline-flex items-center gap-1.5"><Lock size={13} /> الاسم محجوب احتراماً لخصوصية المعهد</span>
            <span className="inline-flex items-center gap-1.5" style={{ color: '#A8D5BA' }}><ShieldCheck size={14} /> من قاعدة بيانات المعهد</span>
          </div>
        </div>
      </div>

      {/* الرقم البطل */}
      <div className="mt-9 sm:mt-11">
        <span className="inline-block rounded-full px-3.5 py-1 text-sm font-bold mb-4"
              style={{ background: 'rgba(224,181,98,0.12)', color: GOLD_L, boxShadow: 'inset 0 0 0 1px rgba(224,181,98,0.35)' }}>
          {specialty.label}
        </span>
        <div dir="ltr" className="text-right">
          <CountUp value={hero.value} className="font-bold tabular-nums leading-none"
                   style={{ color: GOLD_L, fontSize: 'clamp(3.2rem, 7vw, 5.2rem)' }} />
        </div>
        <div className="text-xl font-bold mt-3" style={{ color: CREAM }}>{hero.label}</div>
      </div>

      {/* الأرقام المساندة */}
      {supporting.length > 0 && (
        <div className={`grid gap-3 mt-8 ${supporting.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {supporting.map(s => (
            <div key={s.l} className="rounded-2xl px-4 py-4" style={{ background: 'rgba(248,245,236,0.06)', boxShadow: 'inset 0 0 0 1px rgba(248,245,236,0.12)' }}>
              <div dir="ltr" className="text-right">
                <CountUp value={s.v} className="font-bold tabular-nums" style={{ color: CREAM, fontSize: 'clamp(1.25rem, 2.4vw, 1.7rem)' }} />
              </div>
              <div className="text-sm mt-1" style={{ color: 'rgba(248,245,236,0.68)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* تطوّر التسميع */}
      {showGrowth && (
        <div className="mt-6 rounded-2xl px-5 py-4" style={{ background: 'rgba(248,245,236,0.04)', boxShadow: 'inset 0 0 0 1px rgba(248,245,236,0.1)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold" style={{ color: 'rgba(248,245,236,0.8)' }}>جلسات التسميع</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: '#A8D5BA' }}><TrendingUp size={15} /> {d.growth}%</span>
          </div>
          {[['قبل شهرين', d.earlyRec, 'rgba(248,245,236,0.28)'], ['آخر شهرين', d.recentRec, GOLD_L]].map(([l, v, c]) => (
            <div key={l} className="flex items-center gap-3 mb-2 last:mb-0">
              <span className="w-20 text-sm flex-shrink-0" style={{ color: 'rgba(248,245,236,0.68)' }}>{l}</span>
              <span className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,245,236,0.08)' }}>
                <motion.span className="block h-full rounded-full" style={{ background: c }}
                  initial={{ width: 0 }} animate={{ width: `${Math.max(4, v / maxRec * 100)}%` }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} />
              </span>
              <span className="w-14 text-sm font-bold tabular-nums text-left" style={{ color: CREAM }}>{v.toLocaleString('en-US')}</span>
            </div>
          ))}
        </div>
      )}

      {/* الخلاصة */}
      <p className="mt-auto pt-8 text-lg leading-[1.9]" style={{ color: 'rgba(248,245,236,0.88)' }}>
        <span className="font-bold" style={{ color: GOLD_L }}>«</span>{tagline}<span className="font-bold" style={{ color: GOLD_L }}>»</span>
      </p>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function IhkaamSuccessStories() {
  const [cards,  setCards]  = useState([])
  const [ready,  setReady]  = useState(false)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tick,   setTick]   = useState(0)
  const timer = useRef(null)
  const n = cards.length

  const pick = useCallback((i) => { setActive(i); setTick(t => t + 1) }, [])

  useEffect(() => {
    if (n < 2 || paused) return
    timer.current = setTimeout(() => pick((active + 1) % n), INTERVAL_MS)
    return () => clearTimeout(timer.current)
  }, [n, active, paused, pick, tick])

  // ── Data fetch ── (RPC واحد لكل المعاهد، لا N×8 طلبات)
  useEffect(() => {
    async function load() {
      // نفس صفوف شريط الشركاء ونفس ترشيحه (التجريبيّ والمكرَّر): config/partners.js (ISS-28/40)
      const filtered = cleanPartners(await fetchPartnerRows())
      const ids      = filtered.map(s => s.institute_id)
      if (!ids.length) { setReady(true); return }

      const [{ data: locations }, { data: metrics }] = await Promise.all([
        supabase.rpc('get_institute_locations', { p_ids: ids }),
        supabase.rpc('get_success_story_metrics', { p_ids: ids }),
      ])

      const locMap    = Object.fromEntries((locations || []).map(l => [l.id, l]))
      const metricMap = Object.fromEntries((metrics || []).map(m => [m.institute_id, m]))

      const ranked = filtered.map(s => {
        const id  = s.institute_id
        const loc = locMap[id] ?? {}
        const m   = metricMap[id]
        const d   = deriveMetrics({
          students : m?.students  ?? 0,
          groups   : m?.groups    ?? 0,
          recs     : m?.recs      ?? 0,
          absent   : m?.absent    ?? 0,
          tardiness: m?.tardiness ?? 0,
          recentRec: m?.recent_rec ?? 0,
          earlyRec : m?.early_rec  ?? 0,
          avgGrade : m?.avg_grade ?? null,
        })
        return { inst: { ...s, country: loc.country ?? null, city: loc.city ?? null }, d }
      })
        .filter(c => isStrong(c.d))
        .sort((a, b) => scoreMetrics(b.d) - scoreMetrics(a.d))
        .slice(0, MAX_CARDS)
        .map((c, rank) => ({ ...c, rank, hero: pickHero(c.d), specialty: pickSpecialty(c.d, rank) }))

      setCards(ranked)
      setReady(true)
    }
    load()
  }, [])

  const current = useMemo(() => cards[active] || null, [cards, active])

  if (!ready || !current) return null

  return (
    <section className="relative z-10 px-6 pt-24 pb-16" dir="rtl"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow">قصص نجاح حقيقية</span>
          <h2 className="font-bold mt-5 mb-4" style={{ fontSize: 'clamp(1.9rem,4vw,3.1rem)', color: 'var(--text-1)' }}>
            أرقام كل معهد <span className="title-mark">من سجلّاته</span>
          </h2>
          <p className="text-lg leading-[2] mx-auto" style={{ color: 'var(--text-2)', maxWidth: 580 }}>
            أنشط المعاهد على إحكام، وأرقامها محسوبةٌ الآن من قاعدة بيانات كل معهد، لا من استبيان.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* القائمة */}
          <div className="lg:col-span-5 order-1">
            {/* الجوال: شريط أفقي */}
            <div className="lg:hidden flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
              {cards.map((c, i) => (
                <button key={c.inst.institute_id} type="button" onClick={() => pick(i)} aria-pressed={i === active}
                  className="flex-shrink-0 inline-flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 text-sm font-bold"
                  style={{ background: i === active ? INK : '#FFFFFF', color: i === active ? CREAM : 'var(--text-1)', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                  <span className="rounded-full overflow-hidden" style={{ width: 30, height: 30 }}>
                    <AnonMark d={c.d} size={30} />
                  </span>
                  {c.specialty.label}
                </button>
              ))}
            </div>
            {/* الحاسوب: سجلّ عمودي */}
            <div className="hidden lg:flex flex-col gap-1.5 rounded-[26px] p-2.5" style={{ background: 'rgba(233,227,213,0.45)', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              {cards.map((c, i) => (
                <InstituteRow key={c.inst.institute_id} card={c} active={i === active}
                  onPick={() => pick(i)} progressKey={`${i}-${tick}`} paused={paused} />
              ))}
            </div>
          </div>

          {/* اللوح */}
          <div className="lg:col-span-7 order-2 section-dark relative rounded-[28px] overflow-hidden" style={{ minHeight: 480, boxShadow: 'var(--shadow-lg)' }}>
            <div className="pattern-layer pattern-khatam" aria-hidden />
            <AnimatePresence mode="wait">
              <Spotlight key={current.inst.institute_id} card={current} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
