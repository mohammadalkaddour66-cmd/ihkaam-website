import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, UserCheck, Users, GraduationCap,
  ClipboardList, Check,
} from 'lucide-react'

/* ── Role data — each has its own visual identity ──────────────────── */
const AUDIENCES = [
  {
    icon       : LayoutDashboard,
    num        : '01',
    title      : 'الإدارة',
    sub        : 'قيادة المعهد واتخاذ القرار',
    bullets    : [
      'تقارير ومؤشرات أداء لحظية شاملة',
      'رصد جميع العمليات والكادر من مكان واحد',
      'قرارات مدعومة بالبيانات لا بالتخمين',
    ],
    accent     : '#4ABDB2',
    bgGlow     : 'rgba(74,189,178,0.12)',
    borderColor: 'rgba(74,189,178,0.18)',
  },
  {
    icon       : UserCheck,
    num        : '02',
    title      : 'المعلم',
    sub        : 'إدارة الحلقة بكفاءة عالية',
    bullets    : [
      'تسميع وحضور وملاحظات بلمسة واحدة',
      'اختبارات ونتائج فورية بدون ورق',
      'وقته للتعليم — إحكام يتولى الباقي',
    ],
    accent     : '#00C4AE',
    bgGlow     : 'rgba(0,196,174,0.12)',
    borderColor: 'rgba(0,196,174,0.18)',
  },
  {
    icon       : ClipboardList,
    num        : '03',
    title      : 'المختبر',
    sub        : 'اختبارات الأجزاء والأحاديث',
    bullets    : [
      'اختبارات الأجزاء القرآنية والأحاديث النبوية',
      'توثيق نتائج كل اختبار وتاريخه تلقائياً',
      'نتائج الاختبارات تظهر في بوابة ولي الأمر فور تسجيلها'
    ],
    accent     : '#D4A06A',
    bgGlow     : 'rgba(212,160,106,0.12)',
    borderColor: 'rgba(212,160,106,0.18)',
  },
  {
    icon       : Users,
    num        : '04',
    title      : 'ولي الأمر',
    sub        : 'متابعة فورية للأبناء',
    bullets    : [
      'تقدم الابن في الحفظ لحظة بلحظة',
      'معلومات الغياب والتأخير',
      'بوابة خاصة بخصوصية تامة — بلا مراسلات',
    ],
    accent     : '#8ABDB2',
    bgGlow     : 'rgba(138,189,178,0.12)',
    borderColor: 'rgba(138,189,178,0.18)',
  },
  {
    icon       : GraduationCap,
    num        : '05',
    title      : 'الطالب',
    sub        : 'بيئة تعليمية محفزة',
    bullets    : [
      'مساره الكامل في الحفظ في مكان واحد',
      'رصد أدائه وتقدمه في الحلقة أسبوعاً بأسبوع',
      'متابعة ملاحظات المعلم ونتائج الحصص من البوابة مباشرة',
    ],
    accent     : '#A3D9D3',
    bgGlow     : 'rgba(163,217,211,0.12)',
    borderColor: 'rgba(163,217,211,0.18)',
  },
]

function AudienceCard({ item, index, className = '' }) {
  const [hov, setHov] = useState(false)
  const Icon = item.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.60, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`relative flex flex-col rounded-[22px] overflow-hidden ${className}`}
      style={{
        background          : 'rgba(4,16,16,0.88)',
        border              : `1px solid ${hov ? item.borderColor : 'rgba(255,255,255,0.05)'}`,
        backdropFilter      : 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow           : hov
          ? `0 24px 56px rgba(0,0,0,0.55), 0 0 36px ${item.bgGlow}`
          : '0 4px 20px rgba(0,0,0,0.35)',
        transform : hov ? 'translateY(-7px)' : 'translateY(0)',
        transition: 'all 260ms ease',
      }}
    >
      {/* Radial light-leak from top — intensifies on hover */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-48"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${item.bgGlow} 0%, transparent 100%)`,
          opacity   : hov ? 1 : 0.5,
          transition: 'opacity 300ms ease',
        }}
        aria-hidden
      />

      {/* Top row: number + badge */}
      <div className="relative flex items-center justify-between px-6 pt-6 mb-2">
        <span
          className="font-black text-[10px] tracking-[0.16em]"
          style={{ color: `${item.accent}50` }}
        >
          {item.num}
        </span>
        <span
          className="text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full"
          style={{
            color     : item.accent,
            background: `${item.accent}14`,
            border    : `1px solid ${item.accent}30`,
          }}
        >
          {item.sub.split(' ').slice(0, 2).join(' ')}
        </span>
      </div>

      {/* Icon — double-ring frame */}
      <div className="relative flex items-center justify-center py-6">
        {/* Outer faint ring */}
        <div
          className="absolute rounded-full"
          style={{
            width : 88,
            height: 88,
            border: `1px solid ${item.accent}20`,
            opacity: hov ? 1 : 0.6,
            transition: 'opacity 300ms ease',
          }}
          aria-hidden
        />
        {/* Inner glow ring */}
        <div
          className="absolute rounded-full"
          style={{
            width    : 66,
            height   : 66,
            background: `radial-gradient(circle, ${item.bgGlow} 0%, transparent 70%)`,
            border   : `1px solid ${item.accent}35`,
          }}
          aria-hidden
        />
        {/* Icon itself */}
        <motion.div
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          animate={hov ? { scale: 1.10 } : { scale: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            background: `${item.accent}16`,
            border    : `1.5px solid ${item.accent}40`,
            boxShadow : hov ? `0 0 22px ${item.bgGlow}, 0 0 44px ${item.bgGlow}` : 'none',
            transition: 'box-shadow 300ms ease',
          }}
        >
          <Icon size={24} style={{ color: item.accent }} strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Title + sub */}
      <div className="px-6 mb-4 text-center">
        <h3
          className="font-black mb-1"
          style={{ color: '#EAE4DF', fontSize: 'clamp(1.1rem, 1.6vw, 1.25rem)' }}
        >
          {item.title}
        </h3>
        <span
          className="text-xs font-semibold"
          style={{ color: item.accent, letterSpacing: '0.02em' }}
        >
          {item.sub}
        </span>
      </div>

      {/* Divider */}
      <div
        className="mx-6 mb-5"
        style={{
          height    : 1,
          background: `linear-gradient(90deg, transparent, ${item.accent}30, transparent)`,
        }}
      />

      {/* Bullets */}
      <div className="flex flex-col gap-3 px-6 flex-1">
        {item.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: `${item.accent}16`,
                border    : `1px solid ${item.accent}35`,
              }}
            >
              <Check size={9} style={{ color: item.accent }} strokeWidth={3} />
            </div>
            <span className="text-xs leading-[1.80]" style={{ color: '#8AAFA8' }}>
              {b}
            </span>
          </div>
        ))}
      </div>

      <div className="pb-6" />

      {/* Bottom accent line */}
      <div
        style={{
          position  : 'absolute',
          bottom    : 0,
          left      : 0,
          right     : 0,
          height    : 2,
          background: `linear-gradient(90deg, transparent, ${item.accent}${hov ? '60' : '25'}, transparent)`,
          transition: 'all 300ms ease',
        }}
      />
    </motion.div>
  )
}

export default function IhkaamAudiences() {
  return (
    <section className="relative z-10 pt-24 pb-8 px-6">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[280px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(0,168,150,0.05) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
            style={{ color: '#A6756A' }}
          >
            الفئات المستفيدة
          </span>
          <h2
            className="font-black leading-tight mx-auto mb-5"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', maxWidth: '600px' }}
          >
            منصة واحدة لجميع أدوار المعهد القرآني
          </h2>
          <p
            className="text-sm mx-auto"
            style={{ color: '#5A8A7E', maxWidth: '460px', lineHeight: '2' }}
          >
            من الإدارة إلى الطالب — كل دور له واجهته المصممة خصيصاً داخل منظومة رقمية موحدة.
          </p>
        </motion.div>

        {/* Cards — 5 cards: 3 top + 2 bottom centered.
            The 3rd card would otherwise strand alone next to an empty gap
            at the sm 2-column breakpoint, so it spans both columns there. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {AUDIENCES.slice(0, 3).map((item, i) => (
            <AudienceCard
              key={item.title}
              item={item}
              index={i}
              className={i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:max-w-[66%] mx-auto">
          {AUDIENCES.slice(3).map((item, i) => (
            <AudienceCard key={item.title} item={item} index={i + 3} />
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.50, ease: [0.22, 1, 0.36, 1], delay: 0.20 }}
        >
          <div
            className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full"
            style={{
              background: 'rgba(0,168,150,0.06)',
              border    : '1px solid rgba(0,168,150,0.14)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00A896' }} />
            <p className="text-sm" style={{ color: '#5A8A7E', lineHeight: '1.7' }}>
              جميع العمليات التعليمية والإدارية في مكان واحد — بواجهة تناسب كل مستخدم
            </p>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00A896' }} />
          </div>
        </motion.div>

      </div>
    </section>
  )
}
