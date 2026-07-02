import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, BookOpen, Mic, UserCheck, ArrowLeft, Activity } from 'lucide-react'
import { supabase } from '../config/supabaseClient'

const fadeUp = {
  hidden : { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.09 },
  }),
}

function BenchmarkCard({ icon: Icon, value, unit, label, desc, color, index, loading }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      variants={fadeUp}
      className="relative flex flex-col gap-3 rounded-2xl p-5"
      style={{
        background  : 'rgba(1,38,38,0.45)',
        border      : `1px solid ${color}22`,
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '16' }}>
        <Icon size={17} style={{ color }} />
      </div>

      <div>
        {loading || value == null ? (
          <div className="h-9 w-20 rounded-lg animate-pulse" style={{ background: color + '20' }} />
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="font-black tabular-nums leading-none"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color }}>
              {value.toLocaleString('en-US')}
            </span>
            <span className="text-xs font-semibold" style={{ color: color + 'aa' }}>{unit}</span>
          </div>
        )}
        <p className="text-sm font-bold mt-1" style={{ color: '#C8B8B0' }}>{label}</p>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: '#5A8A78' }}>{desc}</p>

      <div className="absolute top-0 left-0 w-12 h-12 rounded-br-[40px] pointer-events-none"
        style={{ background: `radial-gradient(circle at top left, ${color}12, transparent 70%)` }} />
    </motion.div>
  )
}

export default function NetworkBenchmarks() {
  const [raw, setRaw] = useState({ institutes: null, students: null, staff: null, groups: null, recitations: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('institutes').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('students').select('*',   { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('staff').select('*',      { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('groups').select('*',     { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('recitations').select('*',{ count: 'exact', head: true }),
    ]).then(([r1, r2, r3, r4, r5]) => {
      setRaw({ institutes: r1.count, students: r2.count, staff: r3.count, groups: r4.count, recitations: r5.count })
      setLoading(false)
    })
  }, [])

  const { institutes, students, staff, groups, recitations } = raw

  const benchmarks = [
    {
      icon    : Users,
      value   : institutes && students ? Math.round(students / institutes) : null,
      unit    : 'طالب',
      label   : 'متوسط حجم المركز',
      desc    : 'متوسط عدد الطلاب في كل مركز ضمن الشبكة — مؤشر على الحجم الصحي لمركز ناجح',
      color   : '#6ABDB2',
    },
    {
      icon    : BookOpen,
      value   : institutes && groups ? Math.round(groups / institutes) : null,
      unit    : 'حلقة',
      label   : 'متوسط الحلقات للمركز',
      desc    : 'كم حلقة يدير المركز المتوسط — يساعدك في تقييم هيكلتك الحالية',
      color   : '#D9ACA3',
    },
    {
      icon    : Mic,
      value   : students && recitations ? Math.round(recitations / students) : null,
      unit    : 'جلسة',
      label   : 'متوسط جلسات التسميع للطالب',
      desc    : 'عدد مرات تسميع الطالب الواحد في الشبكة — كلما ارتفع الرقم دل على توثيق منتظم وحفظ أقوى',
      color   : '#A3C4D9',
    },
    {
      icon    : UserCheck,
      value   : students && staff ? Math.round(students / staff) : null,
      unit    : 'طالب',
      label   : 'نسبة الطالب/المعلم',
      desc    : 'كم طالب يتابعه كل معلم في الشبكة — مؤشر جودة الانتباه الفردي',
      color   : '#D9C8A3',
    },
  ]

  return (
    <section dir="rtl" className="relative py-20 overflow-hidden" style={{ background: '#010D0D' }}>

      <div className="pointer-events-none absolute inset-0" aria-hidden style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(2,115,104,0.07) 0%, transparent 70%)',
      }} />

      <div className="max-w-6xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.60, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-bold"
            style={{ background: 'rgba(106,189,178,0.10)', border: '1px solid rgba(106,189,178,0.22)', color: '#6ABDB2' }}>
            <Activity size={12} />
            مرصد شبكة إحكام
          </div>
          <h2 className="font-black mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#EAE4DF', lineHeight: 1.2 }}>
            البيانات تُحوّل مركزك من{' '}
            <span style={{ color: '#6ABDB2' }}>شعور إلى معرفة</span>
          </h2>
          <p className="mx-auto text-sm leading-relaxed" style={{ color: '#7A9E96', maxWidth: 500 }}>
            هذه الأرقام مشتقة حياً من{' '}
            <span style={{ color: '#D9ACA3', fontWeight: 700 }}>
              {loading ? '…' : `+${institutes?.toLocaleString('en-US') ?? '٩٦'}`}
            </span>{' '}
            مركز في الشبكة — معايير صناعة حقيقية يمكنك مقارنة مركزك بها
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {benchmarks.map((b, i) => (
            <BenchmarkCard key={i} index={i} loading={loading} {...b} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          style={{ background: 'rgba(2,115,104,0.07)', border: '1px solid rgba(2,115,104,0.18)' }}
        >
          <div>
            <p className="font-bold text-sm mb-1" style={{ color: '#EAE4DF' }}>
              كلما نمت الشبكة، ازدادت المعايير دقةً
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#7A9E96', maxWidth: 440 }}>
              كل مركز ينضم لإحكام يُضيف بيانات جديدة تُحسّن المعايير لجميع المراكز الأخرى — هذا هو تأثير الشبكة الذي يجعل القيمة تتراكم تلقائياً بدون أي جهد إضافي منك.
            </p>
          </div>
          <Link
            to="/insights"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold flex-shrink-0"
            style={{ background: 'rgba(106,189,178,0.12)', border: '1px solid rgba(106,189,178,0.28)', color: '#6ABDB2' }}
          >
            اطّلع على تقرير الشبكة
            <ArrowLeft size={14} />
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
