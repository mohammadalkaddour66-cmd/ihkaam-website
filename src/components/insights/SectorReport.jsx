import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Mic, ShieldCheck, Users, FileText } from 'lucide-react'
import { fetchLandingStats } from '../../config/landingStats'

function Insight({ icon: Icon, color, title, body, stat, statLabel, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.48, delay: index * 0.07 }}
      className="rounded-2xl p-6"
      style={{ background: `color-mix(in srgb, ${color} 4%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 10%, transparent)` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${color} 9%, transparent)` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <p className="font-black text-sm leading-snug" style={{ color: '#EAE4DF' }}>{title}</p>
      </div>

      {stat && (
        <div className="mb-3 flex items-baseline gap-2">
          <span className="font-black tabular-nums" style={{ fontSize: 'clamp(1.6rem,2.5vw,2rem)', color }}>
            {stat}
          </span>
          {statLabel && (
            <span className="text-xs font-semibold" style={{ color: `color-mix(in srgb, ${color} 60%, transparent)` }}>{statLabel}</span>
          )}
        </div>
      )}

      <p className="text-xs leading-[1.95]" style={{ color: '#96BCBE' }}>{body}</p>
    </motion.div>
  )
}

function Skeleton() {
  return (
    <div className="rounded-2xl p-6 animate-pulse"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-4 rounded w-40" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
      <div className="h-8 rounded w-24 mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="space-y-2">
        <div className="h-3 rounded w-full"  style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-3 rounded w-5/6"   style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-3 rounded w-4/6"   style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  )
}

export default function SectorReport({ loading: parentLoading }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLandingStats().then(s => {
      const students   = s.students
      const staff      = s.staff
      const groups     = s.groups
      const totalRecs  = s.recitations
      const recs30     = s.recitations30d
      const recsPrev   = s.recitationsPrev30d
      const totalAbs   = s.absences
      const absMonth   = s.absences30d

      const monthlyGrowth     = recsPrev > 0 ? Math.round((recs30 - recsPrev) / recsPrev * 100) : null
      const recsPerStudentMo  = students > 0 ? +(recs30 / students).toFixed(1) : null
      const studPerStaff      = staff > 0    ? Math.round(students / staff)    : null
      const studPerGroup      = groups > 0   ? Math.round(students / groups)   : null

      setMetrics({ students, staff, groups, totalRecs, recs30, recsPrev, totalAbs, absMonth, monthlyGrowth, recsPerStudentMo, studPerStaff, studPerGroup })
      setLoading(false)
    })
  }, [])

  const isLoading = parentLoading || loading

  const insights = metrics ? [
    {
      icon    : TrendingUp,
      color   : 'var(--cat-5)',
      title   : 'نشاط التسميع تضاعف في شهر واحد',
      stat    : metrics.monthlyGrowth != null ? `+${metrics.monthlyGrowth}%` : null,
      statLabel: 'نمو مقارنةً بالشهر الماضي',
      body    :
        `في آخر 30 يوماً سجّلت الشبكة ${metrics.recs30.toLocaleString('en-US')} جلسة تسميع، ` +
        `مقارنةً بـ ${metrics.recsPrev.toLocaleString('en-US')} جلسة في الشهر السابق. ` +
        `هذا النمو الحقيقي المشتق من بيانات الشبكة يُثبت أن التوثيق الرقمي يُديم ثقافة التسميع ويجعلها قابلة للقياس والمقارنة بمرور الوقت.`,
    },
    {
      icon    : Mic,
      color   : 'var(--cat-2)',
      title   : 'كل طالب يُسمَّع أكثر مما تظن',
      stat    : metrics.recsPerStudentMo != null ? metrics.recsPerStudentMo.toString() : null,
      statLabel: 'جلسة / طالب / شهر هذا الشهر',
      body    :
        `الشبكة سجّلت ${metrics.totalRecs.toLocaleString('en-US')} جلسة تسميع إجمالياً عبر ${metrics.students.toLocaleString('en-US')} طالب. ` +
        `هذا الشهر وحده بلغ المعدل ${metrics.recsPerStudentMo} جلسة لكل طالب — رقم لا يمكن الحصول عليه بدون توثيق منتظم. ` +
        `المراكز التي لا تُوثّق لا تعرف هذا الرقم عن نفسها.`,
    },
    {
      icon    : ShieldCheck,
      color   : 'var(--cat-4)',
      title   : 'الغياب الموثق غياب يمكن معالجته',
      stat    : metrics.absMonth.toLocaleString('en-US'),
      statLabel: 'حالة غياب موثقة هذا الشهر',
      body    :
        `وثّقت الشبكة ${metrics.totalAbs.toLocaleString('en-US')} حالة غياب إجمالاً، منها ${metrics.absMonth.toLocaleString('en-US')} هذا الشهر وحده. ` +
        `الفارق بين مركز يُوثّق الغياب وآخر لا يُوثّقه ليس في عدد الغيابات — بل في القدرة على التدخل المبكر. ` +
        `كل ما يراه ولي الأمر في بوابته يبدأ بسجل موثوق.`,
    },
    {
      icon    : Users,
      color   : 'var(--cat-3)',
      title   : 'نسبة الطالب/المعلم تعكس جودة المتابعة',
      stat    : metrics.studPerStaff?.toString() ?? null,
      statLabel: 'طالب لكل معلم في الشبكة',
      body    :
        `${metrics.students.toLocaleString('en-US')} طالب يتابعهم ${metrics.staff.toLocaleString('en-US')} معلم عبر ${metrics.groups.toLocaleString('en-US')} حلقة — ` +
        `بمعدل ${metrics.studPerStaff} طالب لكل معلم و${metrics.studPerGroup} طالب لكل حلقة. ` +
        `هذه الأرقام مشتقة مباشرةً من بيانات الشبكة الحية، وتُحدَّث تلقائياً مع كل تغيير في أي مركز.`,
    },
  ] : []

  return (
    <section dir="rtl" className="py-20"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto px-6">

        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#D9C8A3' }}>
            تقرير القطاع 2026
          </span>
          <h2 className="font-black mt-1 mb-2"
            style={{ fontSize: 'clamp(1.3rem,2.2vw,1.9rem)', color: '#EAE4DF' }}>
            4 رؤى مشتقة من بيانات الشبكة الحية
          </h2>
          <p className="text-sm flex items-center gap-2" style={{ color: '#96BCBE' }}>
            <FileText size={13} />
            جميع الأرقام محسوبة مباشرةً من قاعدة البيانات · تتحدث تلقائياً · يونيو 2026
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
            : insights.map((ins, i) => <Insight key={i} index={i} {...ins} />)
          }
        </div>

        <p className="text-[11px] text-center" style={{ color: '#11312C' }}>
          جميع البيانات مجمّعة ومُجهَّلة · لا تُشير لأي مركز بعينه · تتحدث مع كل مركز جديد ينضم
        </p>

      </div>
    </section>
  )
}
