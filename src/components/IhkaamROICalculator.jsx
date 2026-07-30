import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, DollarSign, TrendingUp, ArrowLeft, Zap } from 'lucide-react'

/* ── Calculation engine ── */
function calcROI(students) {
  const teachers = Math.ceil(students / 15)
  const groups   = Math.ceil(students / 8)

  // Minutes/week without ihkaam:
  // Attendance recording: 3 min × students per session × ~5 sessions/week but we track per week total
  // Recitation logging: 3 min × students
  // Parent notifications (manual WhatsApp): 2 min × students
  // Teacher admin + reports: 60 min × teachers
  // Finance tracking: 45 min flat
  // Scheduling & follow-up: 45 min flat
  const minPerWeek =
    students * (3 + 3 + 2)         // per-student manual work
    + teachers * 60                 // per-teacher admin
    + 90                            // flat overhead

  const hoursPerWeek  = Math.round(minPerWeek / 60)
  const hoursPerMonth = hoursPerWeek * 4
  const valueSAR      = hoursPerMonth * 35   // 35 SAR = conservative admin wage

  return { teachers, groups, hoursPerWeek, hoursPerMonth, valueSAR }
}

/* ── Animated counter ── */
function AnimCounter({ value, suffix = '', prefix = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const start   = display
    const end     = value
    const dur     = 600
    const step    = 16
    const steps   = Math.ceil(dur / step)
    let   current = 0

    const id = setInterval(() => {
      current++
      setDisplay(Math.round(start + (end - start) * (current / steps)))
      if (current >= steps) clearInterval(id)
    }, step)

    return () => clearInterval(id)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return <span ref={ref}>{prefix}{display.toLocaleString('en-US')}{suffix}</span>
}

/* ── Slider ── */
function Slider({ value, min, max, step = 1, onChange, color = '#48D6CD' }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="relative w-full" style={{ height: 28, display: 'flex', alignItems: 'center' }}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${color} 60%, transparent), ${color})` }}
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
        style={{ height: '100%' }}
      />
      {/* Thumb */}
      <div
        className="absolute w-4 h-4 rounded-full border-2 shadow-lg"
        style={{
          left             : `calc(${pct}% - 8px)`,
          background       : color,
          borderColor      : '#020F0E',
          boxShadow        : `0 0 0 3px color-mix(in srgb, ${color} 19%, transparent), 0 2px 8px rgba(0,0,0,0.5)`,
          pointerEvents    : 'none',
        }}
      />
    </div>
  )
}

/* ── Stat card ── */
function StatCard({ icon: Icon, value, suffix, prefix, label, color, animate }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: '#09201E', border: `1px solid color-mix(in srgb, ${color} 13%, transparent)` }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 8%, transparent)` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p
          className="font-black tabular-nums leading-none mb-1"
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color }}
        >
          {animate
            ? <AnimCounter value={value} suffix={suffix} prefix={prefix} />
            : <>{prefix}{value?.toLocaleString('en-US')}{suffix}</>
          }
        </p>
        <p className="text-xs font-medium" style={{ color: '#6FA5A8' }}>{label}</p>
      </div>
    </div>
  )
}

/* ── What-if block ── */
function WhatIf({ hoursPerMonth }) {
  const scenarios = [
    { threshold: 20,  text: 'جولة ميدانية لكل مدرسة زائرة هذا الشهر' },
    { threshold: 40,  text: 'ورشة تطوير كادر كاملة + بناء علاقات شراكة' },
    { threshold: 60,  text: 'تصميم منهج تحفيظ متكامل للعام القادم' },
    { threshold: 80,  text: 'فتح فرع جديد — كل الأعباء موثقة ومؤتمتة' },
    { threshold: 120, text: 'تحويل مركزك إلى مرجع إقليمي في التعليم القرآني' },
  ]
  const scenario = [...scenarios].reverse().find(s => hoursPerMonth >= s.threshold) ?? scenarios[0]

  return (
    <div
      className="rounded-2xl px-6 py-5 flex items-start gap-4"
      style={{ background: 'rgba(26,148,155,0.07)', border: '1px solid rgba(26,148,155,0.18)' }}
    >
      <Zap size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#48D6CD' }} />
      <div>
        <p className="text-xs font-bold mb-1" style={{ color: '#48D6CD' }}>
          ماذا ستفعل بـ {hoursPerMonth} ساعة إضافية شهرياً؟
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#C8B8B0' }}>{scenario.text}</p>
      </div>
    </div>
  )
}

/* ── Main component ── */
export default function IhkaamROICalculator() {
  const [students, setStudents] = useState(60)
  const [visible,  setVisible]  = useState(false)

  const roi = calcROI(students)

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      onViewportEnter={() => setVisible(true)}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 py-20"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-5"
            style={{ background: 'rgba(72,214,205,0.12)', border: '1px solid rgba(72,214,205,0.25)', color: '#48D6CD' }}
          >
            <TrendingUp size={12} />
            حاسبة العائد على الاستثمار
          </span>
          <h2
            className="font-black mb-3"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', color: '#EAE4DF', lineHeight: 1.22 }}
          >
            كم ساعة يستنزفها{' '}
            <span style={{ color: '#D9ACA3' }}>غياب النظام</span>
            {' '}من مركزك؟
          </h2>
          <p className="text-sm mx-auto" style={{ color: '#96BCBE', maxWidth: 500 }}>
            حرّك الشريط واكتشف الوقت والتكلفة التي تخسرها في العمليات اليدوية كل شهر
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">

          {/* ── Left: Inputs ── */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-8"
            style={{ background: '#09201E', border: '1px solid rgba(229,211,179,0.08)' }}
          >
            {/* Students slider */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-bold" style={{ color: '#EAE4DF' }}>عدد طلاب مركزك</span>
                <span
                  className="font-black text-lg tabular-nums px-3 py-1 rounded-xl"
                  style={{ color: '#48D6CD', background: 'rgba(72,214,205,0.10)', minWidth: 60, textAlign: 'center' }}
                >
                  {students}
                </span>
              </div>
              <Slider
                value={students}
                min={15}
                max={400}
                step={5}
                onChange={setStudents}
                color="#48D6CD"
              />
              <div className="flex justify-between mt-2.5 text-[10px]" style={{ color: '#6FA5A8' }}>
                <span>15</span>
                <span>400</span>
              </div>
            </div>

            {/* Derived values */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'معلمون', value: roi.teachers, color: 'var(--cat-2)' },
                { label: 'حلقات',  value: roi.groups,   color: 'var(--cat-4)' },
              ].map(d => (
                <div
                  key={d.label}
                  className="rounded-xl px-4 py-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid color-mix(in srgb, ${d.color} 9%, transparent)` }}
                >
                  <p className="font-black text-xl tabular-nums" style={{ color: d.color }}>
                    {visible ? <AnimCounter value={d.value} /> : d.value}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#6FA5A8' }}>{d.label}</p>
                </div>
              ))}
            </div>

            {/* Before/After breakdown */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold" style={{ color: '#96BCBE' }}>ما الذي يستغرق وقتك؟</p>
              {[
                { label: 'تسجيل الحضور يدوياً', mins: Math.round(students * 3), color: 'var(--cat-2)' },
                { label: 'توثيق جلسات التسميع', mins: Math.round(students * 3), color: 'var(--cat-4)' },
                { label: 'تواصل الأهالي (واتساب)', mins: Math.round(students * 2 + roi.teachers * 15), color: 'var(--cat-1)' },
                { label: 'تقارير وإدارة الكادر', mins: roi.teachers * 45 + 45, color: 'var(--cat-3)' },
              ].map(row => {
                const pct = Math.min(100, Math.round((row.mins / (roi.hoursPerWeek * 60)) * 100))
                return (
                  <div key={row.label}>
                    <div className="flex justify-between text-[11px] mb-1" style={{ color: '#6FA5A8' }}>
                      <span>{row.label}</span>
                      <span style={{ color: row.color }}>{Math.round(row.mins / 60 * 10) / 10} س/أسبوع</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `color-mix(in srgb, ${row.color} 56%, transparent)` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Right: Results ── */}
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={Clock}
                value={roi.hoursPerWeek}
                suffix=" س"
                label="توفيرها أسبوعياً"
                color="#48D6CD"
                animate={visible}
              />
              <StatCard
                icon={Clock}
                value={roi.hoursPerMonth}
                suffix=" س"
                label="توفيرها شهرياً"
                color="#D9ACA3"
                animate={visible}
              />
              <StatCard
                icon={DollarSign}
                value={roi.valueSAR}
                prefix="≈ "
                suffix=" ﷼"
                label="قيمة الوقت شهرياً"
                color="var(--cat-1)"
                animate={visible}
              />
            </div>

            {/* What-if */}
            <WhatIf hoursPerMonth={roi.hoursPerMonth} />

            {/* Comparison table */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(229,211,179,0.08)' }}
            >
              <div
                className="grid grid-cols-3 px-3 sm:px-5 py-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.03)', color: '#509492' }}
              >
                <span>المهمة</span>
                <span className="text-center">بدون إحكام</span>
                <span className="text-center" style={{ color: '#48D6CD' }}>مع إحكام</span>
              </div>
              {[
                { task: 'تسجيل الحضور',     before: `${Math.round(students * 3 / 60)}س/أسبوع`, after: 'تلقائي ٠' },
                { task: 'توثيق التسميع',    before: `${Math.round(students * 3 / 60)}س/أسبوع`, after: 'فوري ٠' },
                { task: 'تقارير الأهالي',   before: `${roi.teachers} س/أسبوع`,                  after: '< 10 د' },
                { task: 'إعداد التقارير',   before: '2-3 س/أسبوع',                              after: 'لحظي ٠' },
              ].map((row, i) => (
                <div
                  key={row.task}
                  className="grid grid-cols-3 px-3 sm:px-5 py-3.5 text-[11px] sm:text-xs items-center gap-1"
                  style={{
                    background    : i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                    borderTop     : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ color: '#C8B8B0' }}>{row.task}</span>
                  <span className="text-center" style={{ color: '#D9ACA3' }}>{row.before}</span>
                  <span className="text-center font-bold" style={{ color: '#48D6CD' }}>{row.after}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ background: 'rgba(26,148,155,0.08)', border: '1px solid rgba(26,148,155,0.20)' }}
            >
              <div>
                <p className="font-bold text-sm mb-0.5" style={{ color: '#EAE4DF' }}>
                  وفّر {roi.hoursPerMonth} ساعة من مركزك — الشهر القادم
                </p>
                <p className="text-xs" style={{ color: '#96BCBE' }}>
                  إعداد كامل خلال أسبوع واحد · دعم مستمر
                </p>
              </div>
              <Link
                to="/checkout"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1A949B 0%, #1C423A 100%)', color: '#E5D3B3', boxShadow: '0 8px 24px rgba(26,148,155,0.32)' }}
              >
                ابدأ الآن
                <ArrowLeft size={14} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </motion.section>
  )
}
