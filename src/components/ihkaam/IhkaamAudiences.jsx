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
    img        : '/scenes/role-director.webp',
    sub        : 'قيادة المعهد واتخاذ القرار',
    bullets    : [
      'تقارير ومؤشرات أداء لحظية شاملة',
      'رصد جميع العمليات والكادر من مكان واحد',
      'قرارات مدعومة بالبيانات لا بالتخمين',
    ],
    accent     : '#1F6F52',
    bgGlow     : 'rgba(31, 111, 82, 0.12)',
    borderColor: 'rgba(31, 111, 82, 0.18)',
  },
  {
    icon       : UserCheck,
    num        : '02',
    title      : 'المعلم',
    img        : '/scenes/role-teacher.webp',
    sub        : 'إدارة الحلقة بكفاءة عالية',
    bullets    : [
      'تسميع وحضور وملاحظات بلمسة واحدة',
      'اختبارات ونتائج فورية بدون ورق',
      'وقته للتعليم — إحكام يتولى الباقي',
    ],
    accent     : '#1F6F52',
    bgGlow     : 'rgba(31, 111, 82, 0.12)',
    borderColor: 'rgba(31, 111, 82, 0.18)',
  },
  {
    icon       : ClipboardList,
    num        : '03',
    title      : 'المختبر',
    img        : '/scenes/role-examiner.webp',
    sub        : 'اختبارات الأجزاء والأحاديث',
    bullets    : [
      'اختبارات الأجزاء القرآنية والأحاديث النبوية',
      'توثيق نتائج كل اختبار وتاريخه تلقائياً',
      'نتائج الاختبارات تظهر في بوابة ولي الأمر فور تسجيلها'
    ],
    accent     : '#95612B',
    bgGlow     : 'rgba(149, 97, 43, 0.12)',
    borderColor: 'rgba(149, 97, 43, 0.18)',
  },
  {
    icon       : Users,
    num        : '04',
    title      : 'ولي الأمر',
    img        : '/scenes/role-parent.webp',
    sub        : 'متابعة فورية للأبناء',
    bullets    : [
      'تقدم الابن في الحفظ لحظة بلحظة',
      'معلومات الغياب والتأخير',
      'بوابة خاصة بخصوصية تامة — بلا مراسلات',
    ],
    accent     : '#427562',
    bgGlow     : 'rgba(66, 117, 98, 0.12)',
    borderColor: 'rgba(66, 117, 98, 0.18)',
  },
  {
    icon       : GraduationCap,
    num        : '05',
    title      : 'الطالب',
    img        : '/scenes/role-student.webp',
    sub        : 'بيئة تعليمية محفزة',
    bullets    : [
      'مساره الكامل في الحفظ في مكان واحد',
      'رصد أدائه وتقدمه في الحلقة أسبوعاً بأسبوع',
      'متابعة ملاحظات المعلم ونتائج الحصص من البوابة مباشرة',
    ],
    accent     : '#265C48',
    bgGlow     : 'rgba(38, 92, 72, 0.12)',
    borderColor: 'rgba(38, 92, 72, 0.18)',
  },
]

/* بطاقة الدور (2026-11-19 ج): مشهدٌ مصوَّر بهوية إحكام في رأسها (مولَّد،
   وشاشات الحاسوب والجوال فيه لقطاتٌ حقيقية من التطبيق) بدل الأيقونة في حلقتين.
   والنصوص بحجمٍ مقروء: كانت النقاط 12px والوسم 9px. */
function AudienceCard({ item, index, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      className={`aud-card group relative flex flex-col rounded-[24px] overflow-hidden bg-white ${className}`}
      style={{ boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9', background: '#F1ECDF' }}>
        <img src={item.img} alt="" aria-hidden width={1280} height={720} loading="lazy" decoding="async"
             className="aud-img absolute inset-0 w-full h-full object-cover" />
        <span className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold tabular-nums"
              style={{ background: 'linear-gradient(145deg,#ECC77D,#B8863A)', color: '#0B3B33', boxShadow: '0 6px 14px -6px rgba(0,0,0,0.4)' }}>
          {item.num}
        </span>
      </div>
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="font-bold text-xl" style={{ color: '#0B3B33' }}>{item.title}</h3>
          <span className="text-sm font-bold" style={{ color: '#8A6425' }}>{item.sub}</span>
        </div>
        <ul className="flex flex-col gap-2.5">
          {item.bullets.map(b => (
            <li key={b} className="flex items-start gap-2.5 text-[0.95rem]" style={{ color: 'var(--text-2)', lineHeight: 1.75 }}>
              <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(31,111,82,0.1)', color: '#1F6F52' }}>
                <Check size={12} strokeWidth={3} />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default function IhkaamAudiences() {
  return (
    <section className="relative z-10 pt-24 pb-8 px-6">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[280px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(31, 111, 82, 0.030) 0%, transparent 70%)' }}
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
          <span className="eyebrow">الفئات المستفيدة</span>
          <h2
            className="font-bold leading-tight mx-auto mt-5 mb-5"
            style={{ color: '#1A2E28', fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', maxWidth: '700px' }}
          >
            منصة واحدة <span className="title-mark">لكل أدوار المعهد</span>
          </h2>
          <p
            className="text-lg mx-auto"
            style={{ color: '#4A5D56', maxWidth: '560px', lineHeight: '1.9' }}
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
              background: 'rgba(31, 111, 82, 0.06)',
              border    : '1px solid rgba(31, 111, 82, 0.14)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1F6F52' }} />
            <p className="text-sm" style={{ color: '#5E6E67', lineHeight: '1.7' }}>
              جميع العمليات التعليمية والإدارية في مكان واحد — بواجهة تناسب كل مستخدم
            </p>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1F6F52' }} />
          </div>
        </motion.div>

      </div>
    </section>
  )
}
