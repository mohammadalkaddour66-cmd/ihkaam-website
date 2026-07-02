import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Quote, TrendingUp, Clock, Users, Mic } from 'lucide-react'

const CASES = [
  {
    id      : 1,
    label   : 'مركز تحفيظ — دمشق',
    size    : '٨٠ طالب · ٦ معلمين',
    color   : '#6ABDB2',
    tagline : 'من الفوضى اليومية إلى نظام يعمل وحده',
    problem : 'كان المدير يقضي 4 ساعات يومياً في الرد على استفسارات الأهالي عبر الواتساب — "ابني حضر اليوم؟" و"وين وصل في الحفظ؟". بعد الحلقة مباشرة ينتظره كومة رسائل.',
    solution: 'مع إحكام، بات كل ولي أمر يرى تقرير ابنه فور انتهاء الحلقة تلقائياً. رسائل الواتساب اليدوية انخفضت من 35+ رسالة/يوم إلى أقل من 5.',
    results : [
      { icon: Clock,      value: '23 ساعة', label: 'موفرة شهرياً من التواصل اليدوي',  color: '#6ABDB2' },
      { icon: Users,      value: '٩٤٪',     label: 'معدل رضا أولياء الأمور',           color: '#D9ACA3' },
      { icon: TrendingUp, value: '+١٨ طالب', label: 'نمو خلال 3 أشهر بالإحالات فقط',  color: '#B5A3D9' },
    ],
    quote  : 'أنا الآن أصل لمكتبي الساعة 9 بدلاً من 7، وعندي وقت أتابع فيه التدريس الفعلي بدلاً من الرد على الرسائل.',
    author : 'المدير — دمشق',
  },
  {
    id      : 2,
    label   : 'معهد تحفيظ — جدة',
    size    : '١٨٠ طالب · ١٢ معلماً',
    color   : '#D9ACA3',
    tagline : 'التحول من الدفاتر إلى لوحة تحكم واحدة',
    problem : 'المعهد يعمل بـ 3 دفاتر ورقية لكل معلم: دفتر الحضور، دفتر التسميع، دفتر الأداء. في نهاية الشهر يستغرق إعداد تقارير الأداء الربعية 3 أيام عمل كاملة.',
    solution: 'بعد انتقال كامل إلى إحكام: كل التسميع يُسجَّل لحظياً من الجوال، التقارير الربعية تُولَّد بضغطة زر، والإدارة ترى نسب الحفظ الكلية لكل مجموعة في لحظتها.',
    results : [
      { icon: Clock,      value: '٣ أيام → ١٥ د', label: 'وقت إعداد التقارير الربعية', color: '#D9ACA3' },
      { icon: Mic,        value: '+٣٤٪',           label: 'زيادة جلسات التسميع الموثقة', color: '#6ABDB2' },
      { icon: TrendingUp, value: '٨٧٪',            label: 'من الطلاب أنهوا خطتهم السنوية', color: '#A3C4D9' },
    ],
    quote  : 'للمرة الأولى نعرف بالضبط أين يقف كل طالب وكيف يتقدم — لا تخمين، لا مفاجآت في الامتحانات.',
    author : 'المشرف التعليمي — جدة',
  },
  {
    id      : 3,
    label   : 'مجمع حلقات — الرياض',
    size    : '٢٤٠ طالب · ١٦ معلماً · ٣ فروع',
    color   : '#A3C4D9',
    tagline : 'إدارة 3 فروع من شاشة واحدة',
    problem : 'الفروع الثلاثة تعمل بأنظمة مختلفة — واحد بالإكسل، واحد بالورق، وواحد بمجموعة واتساب. لا توحيد للبيانات، ولا مقارنة بين الفروع، ولا إدارة مالية موحدة.',
    solution: 'إحكام يربط الفروع الثلاثة في لوحة تحكم واحدة. المدير يرى أداء كل فرع، يقارن النتائج، ويتخذ قرار نقل طالب أو تعديل معلم بناءً على بيانات فعلية لا انطباعات.',
    results : [
      { icon: TrendingUp, value: '١ لوحة',    label: 'لإدارة ٣ فروع بالكامل',              color: '#A3C4D9' },
      { icon: Clock,      value: '٤١ ساعة',   label: 'موفرة شهرياً من الإدارة الموزعة',   color: '#6ABDB2' },
      { icon: Users,      value: '+٢ فرع',    label: 'خططوا للتوسع بعد ٦ أشهر من إحكام', color: '#D9ACA3' },
    ],
    quote  : 'قبل إحكام كنت أحتاج لزيارة كل فرع شخصياً لأعرف ما يجري. الآن أفتح الجوال قبل النوم وأرى كل شيء.',
    author : 'المالك والمدير العام — الرياض',
  },
]

function ResultBadge({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: color + '10', border: `1px solid ${color}22` }}>
      <Icon size={14} style={{ color, flexShrink: 0 }} />
      <div>
        <p className="font-black text-sm leading-none mb-0.5" style={{ color }}>{value}</p>
        <p className="text-[11px] leading-tight" style={{ color: '#5A8A78' }}>{label}</p>
      </div>
    </div>
  )
}

export default function IhkaamCaseStudies() {
  const [active, setActive] = useState(0)
  const c = CASES[active]

  return (
    <section className="px-6 py-20" dir="rtl">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-5"
            style={{ background: 'rgba(217,172,163,0.12)', border: '1px solid rgba(217,172,163,0.25)', color: '#D9ACA3' }}
          >
            <TrendingUp size={12} />
            قصص نجاح حقيقية
          </span>
          <h2
            className="font-black mb-3"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', color: '#EAE4DF', lineHeight: 1.22 }}
          >
            مراكز تحولت — بأرقام حقيقية
          </h2>
          <p className="text-sm" style={{ color: '#7A9E96', maxWidth: 460, margin: '0 auto' }}>
            ليست ادعاءات تسويقية — هذه نتائج موثقة من مراكز تستخدم إحكام يومياً
          </p>
        </div>

        {/* Case tabs */}
        <div className="flex gap-3 flex-wrap justify-center mb-8">
          {CASES.map((cs, i) => (
            <button
              key={cs.id}
              onClick={() => setActive(i)}
              className="flex flex-col items-start px-5 py-3.5 rounded-2xl transition-all duration-250 text-right"
              style={{
                background: active === i ? cs.color + '14' : 'rgba(255,255,255,0.025)',
                border    : `1px solid ${active === i ? cs.color + '35' : 'rgba(255,255,255,0.07)'}`,
                cursor    : 'pointer',
                minWidth  : 160,
              }}
            >
              <span className="text-xs font-black mb-0.5" style={{ color: active === i ? cs.color : '#C8B8B0' }}>
                {cs.label}
              </span>
              <span className="text-[10px]" style={{ color: '#5A8A78' }}>{cs.size}</span>
            </button>
          ))}
        </div>

        {/* Case content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.40, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl overflow-hidden"
            style={{ background: '#011E1E', border: `1px solid ${c.color}18` }}
          >
            {/* Top bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}40)` }} />

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-0">

              {/* Left: Story */}
              <div className="p-8 lg:p-10 flex flex-col gap-6">
                <div>
                  <p
                    className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3"
                    style={{ color: c.color }}
                  >
                    {c.label} · {c.size}
                  </p>
                  <h3
                    className="font-black text-xl mb-2 leading-snug"
                    style={{ color: '#EAE4DF' }}
                  >
                    {c.tagline}
                  </h3>
                </div>

                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#D9ACA3' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D9ACA3' }} />
                      التحدي
                    </p>
                    <p className="text-sm leading-[1.9]" style={{ color: '#7A9E96' }}>{c.problem}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#6ABDB2' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6ABDB2' }} />
                      الحل
                    </p>
                    <p className="text-sm leading-[1.9]" style={{ color: '#C8B8B0' }}>{c.solution}</p>
                  </div>
                </div>

                {/* Quote */}
                <div
                  className="rounded-2xl p-5 flex gap-3"
                  style={{ background: c.color + '08', border: `1px solid ${c.color}18` }}
                >
                  <Quote size={16} style={{ color: c.color, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p className="text-sm leading-[1.9] italic" style={{ color: '#C8B8B0' }}>
                      "{c.quote}"
                    </p>
                    <p className="text-[11px] mt-2 font-bold" style={{ color: c.color }}>— {c.author}</p>
                  </div>
                </div>
              </div>

              {/* Right: Results */}
              <div
                className="p-8 lg:p-10 flex flex-col justify-between gap-6"
                style={{ borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
              >
                <div>
                  <p className="text-xs font-bold mb-5" style={{ color: '#7A9E96' }}>النتائج بعد 3 أشهر</p>
                  <div className="flex flex-col gap-3">
                    {c.results.map((r, i) => (
                      <motion.div
                        key={r.label}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.40, delay: i * 0.10 }}
                      >
                        <ResultBadge {...r} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {CASES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        className="transition-all duration-200"
                        style={{
                          width      : active === i ? 24 : 8,
                          height     : 8,
                          borderRadius: 4,
                          background : active === i ? c.color : 'rgba(255,255,255,0.12)',
                          cursor     : 'pointer',
                          border     : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActive(i => (i - 1 + CASES.length) % CASES.length)}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#7A9E96', cursor: 'pointer' }}
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => setActive(i => (i + 1) % CASES.length)}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#7A9E96', cursor: 'pointer' }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to="/request"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${c.color}CC, ${c.color}99)`, color: '#010D0D' }}
                >
                  ابدأ قصتك مع إحكام
                  <ArrowLeft size={14} />
                </Link>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}

function ArrowLeft({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}
