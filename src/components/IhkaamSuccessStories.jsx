import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, MapPin, ShieldCheck } from 'lucide-react'
import { supabase } from '../config/supabaseClient'
import { useIsMobile } from '../hooks/useIsMobile'
import { useSwipe } from '../hooks/useSwipe'

const EXCLUDED     = ['demo', 'superadmin', 'ihkaam', 'ihkam']
const INTERVAL_MS  = 2000

// ---------------------------------------------------------------------------
// Country flags & color palette
// ---------------------------------------------------------------------------
const COUNTRY_FLAGS = {
  'سوريا':'🇸🇾','العراق':'🇮🇶','السعودية':'🇸🇦','الإمارات':'🇦🇪',
  'الأردن':'🇯🇴','الكويت':'🇰🇼','قطر':'🇶🇦','البحرين':'🇧🇭',
  'عُمان':'🇴🇲','مصر':'🇪🇬','تونس':'🇹🇳','الجزائر':'🇩🇿',
  'المغرب':'🇲🇦','ليبيا':'🇱🇾','السودان':'🇸🇩','لبنان':'🇱🇧',
}

const PALETTE = [
  '#6ABDB2','#C49A5A','#9A72C4','#6A8FC9',
  '#C46A9A','#7FC46A','#C47A6A','#6AC494',
]
function hashAccent(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return PALETTE[Math.abs(h) % PALETTE.length]
}
function getAccent(inst) {
  const raw = inst.theme_config?.accent_color
  return (raw && raw !== '#000000' && raw !== '#cfb761') ? raw : hashAccent(inst.institute_id)
}

// ---------------------------------------------------------------------------
// 3D card positions — 5 slots: -2 | -1 | 0 (center) | +1 | +2
// ---------------------------------------------------------------------------
const POS = {
  '-2': { x: -310, ry:  34, scale: 0.68, opacity: 0.32, z: 1 },
  '-1': { x: -178, ry:  19, scale: 0.84, opacity: 0.65, z: 3 },
   '0': { x:    0, ry:   0, scale: 1.00, opacity: 1.00, z: 5 },
   '1': { x:  178, ry: -19, scale: 0.84, opacity: 0.65, z: 3 },
   '2': { x:  310, ry: -34, scale: 0.68, opacity: 0.32, z: 1 },
}
const CARD_W  = 310
const CARD_H  = 460  // used for side cards; center is auto height

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

function pickSpecialty(d, rank) {
  const { growth, attPct, absPct, recs, students, avgGrade } = d
  // rank-0 gets the prestige label; others get metric-based
  if (rank === 0 && growth !== null && growth >= 80)  return { label: 'نمو + ريادة',         color: '#F0B429' }
  if (rank === 0)                                      return { label: 'الأعلى إنجازاً',      color: '#F0B429' }
  if (growth !== null && growth >= 150)                return { label: 'نشاط تضاعف',          color: '#6ABDB2' }
  if (growth !== null && growth >= 60)                 return { label: 'نمو متسارع',           color: '#6ABDB2' }
  if (attPct !== null && attPct >= 95)                 return { label: 'انتظام مثالي',         color: '#5FAD8E' }
  if (attPct !== null && attPct >= 88)                 return { label: 'حضور متميز',           color: '#5FAD8E' }
  if (absPct !== null && absPct < 4)                   return { label: 'شبه صفر غياب',         color: '#9A72C4' }
  if (recs >= 5000)                                    return { label: 'ريادة التسميع',        color: '#C49A5A' }
  if (recs >= 1000)                                    return { label: 'تسميع مكثّف',          color: '#C49A5A' }
  if (students >= 200)                                 return { label: 'قاعدة طلاب واسعة',    color: '#6A8FC9' }
  if (avgGrade !== null && avgGrade >= 8.5)            return { label: 'تفوق أكاديمي',         color: '#C46A9A' }
  if (students >= 50)                                  return { label: 'مجتمع نشط',            color: '#7FC46A' }
  return { label: 'تحول رقمي', color: '#6ABDB2' }
}

function scoreMetrics(d) {
  const { recs=0, students=0, groups=0, attPct=null, growth=null } = d
  return recs * 1.2 + students * 8 + groups * 4 + (attPct ?? 0) * 1.8 + Math.min(growth ?? 0, 5) * 60
}

function daysAgoStr(n) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]
}

// ---------------------------------------------------------------------------
// Rank Badge — circle above card showing #1 #2 #3 …
// ---------------------------------------------------------------------------
const RANK_COLORS = [
  { bg: 'linear-gradient(135deg,#F5C842 0%,#C49A3A 100%)', glow: 'rgba(240,180,40,0.55)' },  // gold
  { bg: 'linear-gradient(135deg,#C8D8E4 0%,#8898AA 100%)', glow: 'rgba(180,200,216,0.40)' },  // silver
  { bg: 'linear-gradient(135deg,#D48870 0%,#A85A48 100%)', glow: 'rgba(196,120,100,0.45)' },  // bronze
]
const RANK_DEFAULT = { bg: 'linear-gradient(135deg,#3A6A62 0%,#1E4A42 100%)', glow: 'rgba(58,106,98,0.30)' }

function RankBadge({ rank, size = 42 }) {
  const c    = rank < 3 ? RANK_COLORS[rank] : RANK_DEFAULT
  const fs   = size <= 34 ? '0.60rem' : '0.72rem'
  return (
    <div
      style={{
        position   : 'absolute',
        top        : -(size / 2),
        left       : '50%',
        transform  : 'translateX(-50%)',
        width      : size,
        height     : size,
        borderRadius: '50%',
        background : c.bg,
        display    : 'flex',
        alignItems : 'center',
        justifyContent: 'center',
        fontSize   : fs,
        fontWeight : 900,
        color      : '#fff',
        zIndex     : 10,
        direction  : 'ltr',
        letterSpacing: '-0.02em',
        boxShadow  : `0 4px 18px ${c.glow}, 0 0 0 2px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.22)`,
        userSelect : 'none',
      }}
    >
      #{rank + 1}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small helper sub-components
// ---------------------------------------------------------------------------
function MetricRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5">
      <span style={{ color: '#3A6058', fontSize: '0.59rem', fontWeight: 600 }}>{label}</span>
      <span style={{ color: accent ?? '#8ABDB4', fontSize: '0.65rem', fontWeight: 700 }}>{value}</span>
    </div>
  )
}
function BarRow({ label, pct, color, invert = false }) {
  const barPct = invert ? pct : pct
  const displayPct = Math.max(2, Math.min(100, barPct))
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span style={{ color: '#3A6058', fontSize: '0.60rem', fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontSize: '0.60rem', fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayPct}%` }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}70)` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CenterCard — full detail, spotlight
// ---------------------------------------------------------------------------
function CenterCard({ inst, metrics, rank }) {
  const accent    = getAccent(inst)
  const flag      = inst.country ? (COUNTRY_FLAGS[inst.country] ?? '🕌') : '🕌'
  const location  = [inst.city, inst.country].filter(Boolean).join('، ') || 'معهد قرآني'
  const d         = deriveMetrics(metrics)
  const hero      = pickHero(d)
  const supporting = pickSupporting(d, hero.label)
  const tagline   = buildTagline(d)
  const specialty = pickSpecialty(d, rank)

  return (
    <div
      className="w-full rounded-3xl flex flex-col overflow-hidden"
      style={{
        background  : 'rgba(3,16,16,0.96)',
        border      : `1px solid ${accent}35`,
        boxShadow   : `0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px ${accent}20, 0 0 80px ${accent}08`,
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}40, transparent)` }} />

      {/* Header */}
      <div className="px-5 pt-4 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{flag}</span>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <MapPin size={10} style={{ color: '#4A7A72' }} />
            <span className="text-[11px] font-bold truncate" style={{ color: '#7A9E96' }}>{location}</span>
          </div>
          <div
            className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(106,189,178,0.08)', border: '1px solid rgba(106,189,178,0.18)' }}
          >
            <ShieldCheck size={9} style={{ color: '#6ABDB2' }} />
            <span style={{ fontSize: '0.58rem', color: '#6ABDB2', fontWeight: 700 }}>موثّق</span>
          </div>
        </div>

        {/* Specialty badge — centered */}
        <div className="flex justify-center">
          <div
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black"
            style={{ background: `${specialty.color}18`, border: `1px solid ${specialty.color}35`, color: specialty.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: specialty.color }} />
            {specialty.label}
          </div>
        </div>
      </div>

      {/* Hero stat */}
      <div
        className="mx-5 rounded-2xl px-4 py-4 text-center mb-3"
        style={{ background: `linear-gradient(135deg, ${accent}16 0%, ${accent}06 100%)`, border: `1px solid ${accent}22` }}
      >
        <CountUp
          value={hero.value}
          className="font-black tabular-nums block mb-1"
          style={{ color: accent, fontSize: 'clamp(2rem,4.5vw,2.8rem)', lineHeight: 1 }}
        />
        <p className="text-[10px] font-semibold" style={{ color: '#8ABDB4', letterSpacing: '0.05em' }}>
          {hero.label}
        </p>
      </div>

      {/* Supporting stats */}
      {supporting.length > 0 && (
        <div className="flex gap-2 px-5 mb-3">
          {supporting.map((s, i) => (
            <div
              key={i}
              className="flex-1 rounded-xl py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.055)' }}
            >
              <CountUp value={s.v} className="font-bold block mb-0.5 tabular-nums" style={{ color: '#C4BCB4', fontSize: '0.82rem' }} />
              <p style={{ color: '#3A6058', fontSize: '0.60rem', fontWeight: 600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── القسم الثالث: إما تطور التسميع (إن وُجد نمو) أو إحصاءات المعهد ── */}
      {d.growth !== null && d.recentRec > 0 && d.earlyRec > 0 ? (
        <div className="mx-5 mb-2 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <p className="text-[9px] font-bold tracking-[0.1em] uppercase" style={{ color: '#2D5A52' }}>تطور التسميع</p>
            <span style={{ color: d.growth >= 0 ? '#5FAD8E' : '#C46A6A', fontSize: '0.65rem', fontWeight: 800 }}>
              {d.growth >= 0 ? `↑ ${d.growth}%` : `↓ ${Math.abs(d.growth)}%`}
            </span>
          </div>
          <div className="px-3 pb-2.5">
            <div className="flex gap-3 items-end mb-1.5" style={{ height: 38 }}>
              <div className="flex-1 flex flex-col items-center justify-end gap-1">
                <span style={{ color: '#3A6058', fontSize: '0.58rem', fontWeight: 600 }}>{d.earlyRec.toLocaleString('en-US')}</span>
                <div className="w-full rounded-t-sm" style={{ height: `${Math.max(10, d.earlyRec / Math.max(d.recentRec, d.earlyRec) * 30)}px`, background: 'rgba(106,189,178,0.22)' }} />
              </div>
              <div className="flex-1 flex flex-col items-center justify-end gap-1">
                <span style={{ color: accent, fontSize: '0.58rem', fontWeight: 700 }}>{d.recentRec.toLocaleString('en-US')}</span>
                <div className="w-full rounded-t-sm" style={{ height: `${Math.max(10, d.recentRec / Math.max(d.recentRec, d.earlyRec) * 30)}px`, background: accent, boxShadow: `0 0 6px ${accent}50` }} />
              </div>
            </div>
            <div className="flex gap-3 text-center">
              <p className="flex-1 text-[8.5px]" style={{ color: '#2A5048' }}>قبل شهرين</p>
              <p className="flex-1 text-[8.5px] font-bold" style={{ color: accent }}>آخر شهرين</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-5 mb-2 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between px-3 pt-2 pb-0.5">
            <p className="text-[9px] font-bold tracking-[0.1em] uppercase" style={{ color: '#2D5A52' }}>إحصاءات المعهد</p>
            <p className="text-[8.5px]" style={{ color: '#1E4035' }}>منذ بدء الاستخدام</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.035)' }}>
            {d.recsPerStudent !== null && (
              <MetricRow label="تسميع لكل طالب (متوسط)" value={`${d.recsPerStudent} جلسة`} accent={accent} />
            )}
            {d.studentsPerGroup !== null && (
              <MetricRow label="طلاب لكل حلقة (متوسط)" value={`${d.studentsPerGroup} طالب`} accent={accent} />
            )}
          </div>
        </div>
      )}

      {/* ── متوسط الدرجات ── */}
      {d.avgGrade !== null && (
        <div className="mx-5 mb-3">
          <BarRow
            label={`متوسط الدرجات  ${d.avgGrade.toFixed(1)}/10`}
            pct={d.avgGrade * 10}
            color="#C46A9A"
          />
        </div>
      )}

      {/* Tagline */}
      <div className="mx-5 mb-4 mt-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(106,189,178,0.04)', border: '1px solid rgba(106,189,178,0.08)' }}>
        <p className="text-[10px] leading-[1.8]" style={{ color: '#4A7A72' }}>{tagline}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SideCard — compact, peek from behind center
// ---------------------------------------------------------------------------
function SideCard({ inst, metrics, position }) {
  const accent   = getAccent(inst)
  const flag     = inst.country ? (COUNTRY_FLAGS[inst.country] ?? '🕌') : '🕌'
  const location = [inst.city, inst.country].filter(Boolean).join('، ') || 'معهد قرآني'
  const d        = deriveMetrics(metrics)
  const hero     = pickHero(d)
  const isOuter  = Math.abs(position) === 2

  return (
    <div
      className="w-full rounded-3xl flex flex-col overflow-hidden"
      style={{
        height    : CARD_H,
        background: 'rgba(3,14,14,0.82)',
        border    : '1px solid rgba(255,255,255,0.06)',
        cursor    : 'pointer',
      }}
    >
      <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}50, transparent)` }} />

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 text-center gap-5">
        {/* Flag + location */}
        {!isOuter && (
          <div>
            <span className="text-2xl block mb-1.5">{flag}</span>
            <p className="text-[10px] font-semibold" style={{ color: '#3D6058' }}>{location}</p>
          </div>
        )}

        {/* Hero stat — the main visual element */}
        <div
          className="w-full rounded-2xl px-4 py-6"
          style={{ background: `${accent}0E`, border: `1px solid ${accent}1A` }}
        >
          <CountUp
            value={hero.value}
            className="font-black tabular-nums block mb-1"
            style={{ color: accent, fontSize: isOuter ? '1.7rem' : '2rem', lineHeight: 1 }}
          />
          {!isOuter && (
            <p style={{ color: '#3A6058', fontSize: '0.62rem', fontWeight: 600, marginTop: 4 }}>
              {hero.label}
            </p>
          )}
        </div>

        {/* Prompt */}
        {!isOuter && (
          <p style={{ color: '#254A42', fontSize: '0.60rem', fontWeight: 700, letterSpacing: '0.06em' }}>
            اضغط للتفاصيل
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function IhkaamSuccessStories() {
  const [allCards,    setAllCards]    = useState([])
  const [ready,       setReady]       = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const timerRef = useRef(null)

  const isMobile = useIsMobile()
  const n       = allCards.length
  const goNext  = useCallback(() => setActiveIndex(i => (i + 1) % n), [n])
  const goPrev  = useCallback(() => setActiveIndex(i => (i - 1 + n) % n), [n])
  const goTo    = useCallback(idx  => setActiveIndex(idx), [])
  const swipe   = useSwipe(goNext, goPrev)

  // Auto-rotate — continuous, never pauses
  useEffect(() => {
    if (n < 2) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(goNext, INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [n, goNext])

  // 5 visible cards centred around activeIndex
  const visibleRange = useMemo(() => {
    if (!n) return []
    return [-2, -1, 0, 1, 2].map(offset => {
      const globalIndex = ((activeIndex + offset) % n + n) % n
      return { position: offset, globalIndex, card: allCards[globalIndex] }
    })
  }, [allCards, activeIndex, n])

  // ── Data fetch ──
  useEffect(() => {
    async function load() {
      const { data: settings } = await supabase
        .from('institute_settings')
        .select('institute_id, theme_config')
        .eq('is_deleted', false)
      if (!settings?.length) { setReady(true); return }

      const filtered = settings.filter(s => !EXCLUDED.includes(s.institute_id))
      const ids      = filtered.map(s => s.institute_id)

      const { data: locations } = await supabase
        .rpc('get_institute_locations', { p_ids: ids })

      const locMap = Object.fromEntries((locations || []).map(l => [l.id, l]))
      const d60    = daysAgoStr(60)
      const d120   = daysAgoStr(120)

      const enriched = await Promise.all(filtered.map(async s => {
        const id  = s.institute_id
        const loc = locMap[id] ?? {}
        const [rS, rG, rR, rRec, rEar, rAbs, rLate] = await Promise.all([
          supabase.from('students').select('*',{count:'exact',head:true}).eq('institute_id',id).eq('is_deleted',false),
          supabase.from('groups').select('*',{count:'exact',head:true}).eq('institute_id',id).eq('is_deleted',false),
          supabase.from('recitations').select('*',{count:'exact',head:true}).eq('institute_id',id),
          supabase.from('recitations').select('*',{count:'exact',head:true}).eq('institute_id',id).gte('record_date',d60),
          supabase.from('recitations').select('*',{count:'exact',head:true}).eq('institute_id',id).gte('record_date',d120).lt('record_date',d60),
          supabase.from('attendance').select('*',{count:'exact',head:true}).eq('institute_id',id).eq('record_type','غياب').eq('is_deleted',false),
          supabase.from('attendance').select('*',{count:'exact',head:true}).eq('institute_id',id).in('record_type',['تأخر','إذن تأخر دائم']).eq('is_deleted',false),
        ])
        let avgGrade = null
        try {
          const { data: gr } = await supabase.from('recitations').select('grade').eq('institute_id',id).not('grade','is',null).limit(200)
          if (gr?.length) {
            const nums = gr.map(r => parseFloat(r.grade)).filter(n => !isNaN(n) && n > 0 && n <= 10)
            if (nums.length >= 10) avgGrade = nums.reduce((a,b) => a+b, 0) / nums.length
          }
        } catch { /* avgGrade is a best-effort enhancement, safe to skip on failure */ }
        return {
          inst: { ...s, country: loc.country ?? null, city: loc.city ?? null },
          metrics: { students: rS.count??0, groups: rG.count??0, recs: rR.count??0, present:0, absent: rAbs.count??0, tardiness: rLate.count??0, recentRec: rRec.count??0, earlyRec: rEar.count??0, avgGrade },
        }
      }))

      const ranked = enriched
        .filter(({ metrics: m }) => m.students > 0 || m.recs > 0)
        .sort((a,b) => scoreMetrics(deriveMetrics(b.metrics)) - scoreMetrics(deriveMetrics(a.metrics)))

      setAllCards(ranked)
      setReady(true)
    }
    load()
  }, [])

  if (!ready || !allCards.length) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 pt-20 pb-10 overflow-hidden"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5" style={{ color:'#6ABDB2' }}>
            قصص نجاح حقيقية
          </span>
         <h2 className="font-black leading-tight mb-4" style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', color:'#EAE4DF' }}>
  معاهد تستخدم <span style={{ color:'#6ABDB2' }}>إحكام</span> 
</h2>

          <p className="text-sm leading-[2] mx-auto" style={{ color:'#7A9E96', maxWidth:'420px' }}>
            أرقام حقيقية، من معاهد حقيقية — كل بطاقة قصة تحول مختلفة
          </p>
        </div>

        {/* ── Carousel: single card on mobile, 3D fan on larger screens ── */}
        {isMobile ? (
          <div className="relative mx-auto max-w-[420px] pt-6" {...swipe}>
            <RankBadge rank={activeIndex} size={44} />
            <CenterCard
              inst={allCards[activeIndex].inst}
              metrics={allCards[activeIndex].metrics}
              rank={activeIndex}
            />
          </div>
        ) : (
          <div
            className="relative mx-auto"
            style={{ maxWidth: 900, height: 420, perspective: '1300px' }}
          >
            {visibleRange.map(({ position, globalIndex, card }) => {
              const p        = POS[String(position)]
              const isCenter = position === 0

              return (
                <motion.div
                  key={card.inst.institute_id}
                  style={{
                    position : 'absolute',
                    top      : '50%',
                    left     : '50%',
                    width    : CARD_W,
                    height   : isCenter ? 'auto' : CARD_H,
                    marginLeft : -CARD_W / 2,
                    zIndex   : p.z,
                    cursor   : isCenter ? 'default' : 'pointer',
                    overflow : 'visible',
                  }}
                  animate={{
                    x       : p.x,
                    y       : '-50%',
                    rotateY : p.ry,
                    scale   : p.scale,
                    opacity : p.opacity,
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => !isCenter && goTo(globalIndex)}
                >
                  <RankBadge rank={globalIndex} size={isCenter ? 44 : 34} />
                  {isCenter
                    ? <CenterCard inst={card.inst} metrics={card.metrics} rank={globalIndex} />
                    : <SideCard   inst={card.inst} metrics={card.metrics} position={position} rank={globalIndex} />
                  }
                </motion.div>
              )
            })}
          </div>
        )}

        {/* ── Controls ── */}
        <div className="flex items-center justify-center gap-6 mt-10" dir="ltr">
          <button
            onClick={goPrev}
            aria-label="السابق"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background:'rgba(106,189,178,0.08)', border:'1px solid rgba(106,189,178,0.22)', color:'#6ABDB2' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(106,189,178,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(106,189,178,0.08)'}
          >
            <ChevronLeft size={17} />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {allCards.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width      : i === activeIndex ? 20 : 6,
                  height     : 6,
                  borderRadius: 3,
                  background : i === activeIndex ? '#6ABDB2' : 'rgba(106,189,178,0.22)',
                  border     : 'none',
                  cursor     : 'pointer',
                  padding    : 0,
                  transition : 'width 300ms ease, background 300ms ease',
                }}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            aria-label="التالي"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background:'rgba(106,189,178,0.08)', border:'1px solid rgba(106,189,178,0.22)', color:'#6ABDB2' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(106,189,178,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(106,189,178,0.08)'}
          >
            <ChevronRight size={17} />
          </button>
        </div>

      </div>
    </motion.section>
  )
}
