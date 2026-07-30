import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, BookOpen, UserCheck, Mic, BarChart3 } from 'lucide-react'

/* Rough percentile using normal approximation — σ ≈ 0.35μ */
function approxPct(value, mean, lowerIsBetter = false) {
  if (!mean || value <= 0) return 50
  const v = lowerIsBetter ? -value : value
  const m = lowerIsBetter ? -mean  : mean
  const z = (v - m) / (Math.abs(m) * 0.35)
  return Math.min(99, Math.max(1, Math.round(50 + z * 16.5)))
}

function MetricRow({ icon: Icon, label, ideal, unit, userVal, networkAvg, lowerIsBetter, color, desc }) {
  const pct = approxPct(userVal, networkAvg, lowerIsBetter)
  const hasVal = userVal > 0 && networkAvg > 0

  const statusLabel = hasVal
    ? (lowerIsBetter
        ? (userVal <= networkAvg * 0.9 ? 'أفضل من متوسط الشبكة' : userVal > networkAvg * 1.1 ? 'فوق المتوسط' : 'ضمن المتوسط')
        : (userVal >= networkAvg * 1.1 ? 'أفضل من متوسط الشبكة' : userVal < networkAvg * 0.9 ? 'دون المتوسط' : 'ضمن المتوسط'))
    : null

  const statusColor = !hasVal ? '#374D56'
    : (lowerIsBetter ? userVal <= networkAvg * 0.9 : userVal >= networkAvg * 1.1) ? '#48D6CD'
    : (lowerIsBetter ? userVal > networkAvg * 1.1 : userVal < networkAvg * 0.9) ? '#D9ACA3'
    : '#D9C8A3'

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(9,32,30,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${color} 9%, transparent)` }}>
            <Icon size={16} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none mb-0.5" style={{ color: '#C8B8B0' }}>{label}</p>
            <p className="text-[10px]" style={{ color: '#374D56' }}>المثالي: {ideal}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-black tabular-nums leading-none" style={{ fontSize: 18, color }}>
            {userVal > 0 ? userVal.toFixed(1) : '—'}
          </p>
          <p className="text-[10px]" style={{ color: '#374D56' }}>{unit}</p>
        </div>
      </div>

      {/* Comparison bar */}
      <div className="mb-1.5">
        <div className="relative h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {/* Network avg line */}
          <div className="absolute top-0 bottom-0 w-px"
            style={{ left: '50%', background: 'rgba(255,255,255,0.22)', zIndex: 2 }} />
          {/* User fill */}
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${color} 60%, transparent), ${color})`, maxWidth: '100%' }}
            initial={{ width: 0 }}
            animate={{ width: hasVal ? `${pct}%` : '0%' }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px]" style={{ color: '#1C423A' }}>
          <span>{lowerIsBetter ? 'أفضل' : 'أضعف'}</span>
          <span>شبكة إحكام: {networkAvg > 0 ? networkAvg.toFixed(1) : '…'} {unit}</span>
          <span>{lowerIsBetter ? 'أضعف' : 'أفضل'}</span>
        </div>
      </div>

      {/* Status */}
      {statusLabel && (
        <p className="text-xs font-semibold mt-2" style={{ color: statusColor }}>{statusLabel}</p>
      )}
      <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#374D56' }}>{desc}</p>
    </div>
  )
}

export default function BenchmarkCalculator({ raw }) {
  const [inputs, setInputs] = useState({ students: '', groups: '', staff: '', sessions: '' })
  const set = (k) => (e) => setInputs(p => ({ ...p, [k]: e.target.value }))

  const p = {
    students: parseInt(inputs.students) || 0,
    groups  : parseInt(inputs.groups)   || 0,
    staff   : parseInt(inputs.staff)    || 0,
    sessions: parseInt(inputs.sessions) || 0,
  }

  const ur = useMemo(() => ({
    studentsPerGroup   : p.groups   ? p.students / p.groups   : 0,
    studentsPerStaff   : p.staff    ? p.students / p.staff    : 0,
    sessionsPerStudent : p.students ? p.sessions / p.students : 0,
  }), [p.students, p.groups, p.staff, p.sessions])

  const nr = useMemo(() => ({
    studentsPerGroup  : raw.groups    && raw.students ? raw.students / raw.groups    : 0,
    studentsPerStaff  : raw.staff     && raw.students ? raw.students / raw.staff     : 0,
    sessionsPerStudent: 10, /* industry benchmark: ~10 sessions/student/month */
  }), [raw])

  const hasInput = p.students > 0

  return (
    <section dir="rtl" className="py-20"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto px-6">

        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase"
            style={{ color: '#D9ACA3' }}>
            مقارنة تفاعلية
          </span>
          <h2 className="font-black mt-1 mb-2"
            style={{ fontSize: 'clamp(1.3rem,2.2vw,1.9rem)', color: '#EAE4DF' }}>
            قارن مركزك بمراكز الشبكة
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#96BCBE', maxWidth: 520 }}>
            أدخل أرقام مركزك الأربعة في الحقول أدناه وستظهر لك على الفور مقارنة بمتوسطات شبكة إحكام —
            ترى أين أنت قوي وأين تحتاج تحسيناً. المقارنة تتم محلياً في متصفحك ولا يُحفظ أي شيء.
          </p>
        </div>

        {/* Input grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { key: 'students', label: 'عدد طلابك',          ph: '٨٠',   icon: Users     },
            { key: 'groups',   label: 'عدد الحلقات',        ph: '٨',    icon: BookOpen  },
            { key: 'staff',    label: 'عدد المعلمين',       ph: '٦',    icon: UserCheck },
            { key: 'sessions', label: 'جلسات تسميع / شهر', ph: '٣٢٠',  icon: Mic       },
          ].map(({ key, label, ph, icon: Icon }) => (
            <div key={key}>
              <label className="text-[11px] font-bold block mb-1.5" style={{ color: '#96BCBE' }}>
                {label}
              </label>
              <div className="relative">
                <Icon size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#374D56' }} />
                <input
                  type="number"
                  value={inputs[key]}
                  onChange={set(key)}
                  placeholder={ph}
                  min={0}
                  className="w-full rounded-xl py-2.5 pr-8 pl-3 text-sm font-bold tabular-nums text-right
                             appearance-none focus:outline-none"
                  style={{
                    background    : '#09201E',
                    border        : '1px solid rgba(255,255,255,0.09)',
                    color         : '#EAE4DF',
                    WebkitAppearance: 'none',
                    MozAppearance   : 'textfield',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {!hasInput ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl flex flex-col items-center justify-center gap-3 py-14"
              style={{ background: 'rgba(255,255,255,0.012)', border: '1px dashed rgba(255,255,255,0.07)' }}
            >
              <BarChart3 size={28} style={{ color: '#1C423A' }} />
              <p className="text-sm" style={{ color: '#1C423A' }}>
                أدخل بيانات مركزك أعلاه لرؤية مقارنتك بالشبكة
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <MetricRow
                icon={BookOpen}
                label="حجم الحلقة الواحدة"
                ideal="٦ — ١٥ طالب"
                unit="طالب/حلقة"
                userVal={ur.studentsPerGroup}
                networkAvg={nr.studentsPerGroup}
                lowerIsBetter={false}
                color="#48D6CD"
                desc="الحلقات بين 6-15 طالباً تُحقق أعلى نسب استكمال خطط الحفظ وفق بيانات الشبكة."
              />
              <MetricRow
                icon={UserCheck}
                label="نسبة الطالب / المعلم"
                ideal="أقل من ٢٠ طالب"
                unit="طالب/معلم"
                userVal={ur.studentsPerStaff}
                networkAvg={nr.studentsPerStaff}
                lowerIsBetter={true}
                color="#D9ACA3"
                desc="معيار الجودة الدولي يُوصي بـ 15-20 طالباً لكل معلم لضمان انتباه كافٍ لكل طالب."
              />
              <MetricRow
                icon={Mic}
                label="كثافة التسميع الشهري"
                ideal="٨ — ١٦ جلسة/طالب"
                unit="جلسة/طالب/شهر"
                userVal={ur.sessionsPerStudent}
                networkAvg={nr.sessionsPerStudent}
                lowerIsBetter={false}
                color="var(--cat-4)"
                desc="8+ جلسات/طالب/شهر تُشير إلى توثيق منتظم يُمكّن من رصد التقدم بدقة عالية."
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}
