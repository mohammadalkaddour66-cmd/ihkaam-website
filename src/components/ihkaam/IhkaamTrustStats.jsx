import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { BookOpenCheck, Building2, Users, GraduationCap, LayoutGrid, TrendingUp } from 'lucide-react'
import { fetchLandingStats, getBakedLandingStats, formatStatsDate } from '../../config/landingStats'

const fmtStat = (n) => (n >= 1000 ? '+' + n.toLocaleString('en-US') : '+' + n)

function pickCounts(s) {
  return s
    ? { institutes: s.institutes, students: s.students, staff: s.staff, circles: s.groups, recitations: s.recitations, rec30: s.recitations30d, updatedAt: s.updatedAt }
    : { institutes: null, students: null, staff: null, circles: null, recitations: null, rec30: null, updatedAt: null }
}

/* ── Animated count-up ── */
function CountUp({ to, duration = 1800 }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    if (to == null) return
    const start = performance.now()
    const tick  = (now) => {
      const p      = Math.min((now - start) / duration, 1)
      const eased  = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(to * eased))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [to, duration])

  if (to == null) return (
    <span className="inline-block w-20 h-9 rounded-lg animate-pulse" style={{ background: 'rgba(31, 111, 82, 0.15)' }} />
  )
  return <>{fmtStat(val)}</>
}

/* ══════════════════════════════════════════════════════════════════
   شريط الأرقام (2026-11-19): كان شريطاً واحداً ملتصقاً بالهيرو بخمسة
   أرقامٍ متساوية. صار قسماً قائماً: رقمٌ بطلٌ واحد (جلسات التسميع) على
   لوحٍ داكن مع ما أُضيف في آخر 30 يوماً، وأربعة أرقامٍ بأيقوناتٍ ذهبية.
   «معهد نشط» = مفعّلٌ فعلاً (src/config/activeInstitutes.js).
   ══════════════════════════════════════════════════════════════════ */
const fmtPlain = (n) => (n == null ? '—' : n.toLocaleString('en-US'))

function Num({ value, inView, i }) {
  return inView ? <CountUp to={value} duration={1500 + i * 120} /> : <>{value == null ? '—' : fmtStat(value)}</>
}

export default function IhkaamTrustStats() {
  const [counts, setCounts] = useState(() => pickCounts(getBakedLandingStats()))
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    fetchLandingStats().then(s => setCounts(pickCounts(s)))
  }, [])

  const SMALL = [
    { key: 'institutes', Icon: Building2,     value: counts.institutes, label: 'معهد مفعّل',       note: 'يعمل منذ شهرٍ على الأقل' },
    { key: 'students',   Icon: Users,         value: counts.students,   label: 'طالب في السجلات',  note: 'لكل طالب سجلٌّ كامل' },
    { key: 'staff',      Icon: GraduationCap, value: counts.staff,      label: 'معلم ومشرف',       note: 'يسجّلون من جوالاتهم' },
    { key: 'circles',    Icon: LayoutGrid,    value: counts.circles,    label: 'حلقة',             note: 'حضورٌ وتسميعٌ يومي' },
  ]

  return (
    <section id="stats" className="relative z-10 px-6 pt-20 pb-6" dir="rtl">
      <div ref={ref} className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="eyebrow">من قاعدة البيانات مباشرة</span>
          <h2 className="font-bold mt-5" style={{ color: 'var(--text-1)', fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)' }}>
            أرقامٌ <span className="title-mark">تُسجَّل كل يوم</span> — لا تقديرات
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* الرقم البطل */}
          <motion.div
            className="section-dark lg:col-span-5 rounded-[28px] overflow-hidden p-8 sm:p-10 flex flex-col justify-between"
            style={{ boxShadow: 'var(--shadow-lg)', minHeight: 320 }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pattern-layer pattern-khatam" aria-hidden />
            <span className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(224,181,98,0.14)', color: '#E0B562', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,0.35)' }}>
              <BookOpenCheck size={26} />
            </span>
            <div>
              <div className="font-bold tabular-nums leading-none" style={{ color: '#F8F5EC', fontSize: 'clamp(3rem, 6vw, 4.6rem)' }}>
                <Num value={counts.recitations} inView={inView} i={0} />
              </div>
              <div className="text-xl font-bold mt-3" style={{ color: '#E0B562' }}>جلسة تسميع موثّقة</div>
              <p className="text-base mt-2" style={{ color: 'rgba(248,245,236,0.75)' }}>كل جلسة بتاريخها والآيات ودرجتها، في سجلّ الطالب.</p>
            </div>
            {counts.rec30 > 0 && (
              <div className="mt-6 inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-bold"
                   style={{ background: 'rgba(168,213,186,0.12)', color: '#A8D5BA', boxShadow: 'inset 0 0 0 1px rgba(168,213,186,0.3)' }}>
                <TrendingUp size={16} /> {fmtPlain(counts.rec30)} جلسة في آخر 30 يوماً
              </div>
            )}
          </motion.div>

          {/* الأرقام الأربعة */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-5">
            {SMALL.map(({ key, Icon, value, label, note }, i) => (
              <motion.div
                key={key}
                className="rounded-[22px] bg-white p-6 sm:p-7 flex flex-col gap-4"
                style={{ boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: 0.08 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(184,134,58,0.10)', color: '#8A6425', boxShadow: 'inset 0 0 0 1px rgba(184,134,58,0.25)' }}>
                  <Icon size={20} />
                </span>
                <div>
                  <div className="font-bold tabular-nums leading-none" style={{ color: '#0B3B33', fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)' }}>
                    <Num value={value} inView={inView} i={i + 1} />
                  </div>
                  <div className="text-base font-bold mt-2" style={{ color: 'var(--text-1)' }}>{label}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{note}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {formatStatsDate(counts.updatedAt) && (
          <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-3)' }}>
            آخر تحديث للأرقام: {formatStatsDate(counts.updatedAt)}
          </p>
        )}
      </div>
    </section>
  )
}
