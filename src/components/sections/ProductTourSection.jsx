import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, LayoutDashboard, BookOpenCheck, ClipboardCheck, FileBarChart, Trophy } from 'lucide-react'
import { supabase } from '../../config/supabaseClient'
import { galleryImage } from '../../config/imageUrl'

/* ══════════════════════════════════════════════════════════════════
   «جولة داخل إحكام» (2026-11-19)

   لقطات حقيقية من التطبيق (جدول gallery_items، نفس مصدر معرض صفحة
   المنصة)، مرتّبة بحسب من يستعملها: المدير، المعلم، المختبِر، ولي الأمر،
   ونظام التحفيز. الزائر يختار الدور فتتبدّل اللقطات في إطار متصفّح،
   ومعها هاتفٌ بلقطة الجوال. النصّ ثابت في HTML المُصيَّر، واللقطات تُجلب
   في المتصفّح لأن القسم تحت الطيّة.
   ══════════════════════════════════════════════════════════════════ */

const ROLES = [
  {
    id: 'admin', Icon: LayoutDashboard, label: 'المدير', title: 'المعهد كلّه في شاشة واحدة',
    cats: ['لوحة التحكم', 'إدارة الحلقات', 'إدارة الطلاب', 'إدارة الكادر', 'الإعدادات', 'الأرشفة'],
    points: ['إحصاءات الحضور والتسميع لكل حلقة', 'توزيع الطلاب على الحلقات بالسحب', 'صلاحيات لكل معلم ومشرف'],
  },
  {
    id: 'teacher', Icon: BookOpenCheck, label: 'المعلم', title: 'تفقّد الحلقة وتسميعها من الجوال',
    cats: ['واجهات المعلمين', 'سلوك الطلاب وتتبعه'],
    points: ['حضور الحلقة بلمسة', 'تسجيل التسميع بالآيات والدرجة', 'تقييم شهري لسلوك الطالب'],
  },
  {
    id: 'examiner', Icon: ClipboardCheck, label: 'المختبِر', title: 'يوم الاختبار بلا أوراق',
    cats: ['واجهات المختبِرين'],
    points: ['قائمة المرشّحين للاختبار', 'درجات الحفظ والتجويد', 'سجلّ الاختبارات لكل طالب'],
  },
  {
    id: 'reports', Icon: FileBarChart, label: 'التقارير وولي الأمر', title: 'تقرير يصل قبل أن يُسأل عنه',
    cats: ['بوابة التقارير', 'التنبيهات والإشعارات'],
    points: ['تقارير جاهزة بصيغة PDF', 'بوابة ولي الأمر بالحضور والحفظ', 'إشعارات فورية للإدارة'],
  },
  {
    id: 'motivation', Icon: Trophy, label: 'التحفيز', title: 'نجم الأسبوع ونقاط تحفّز الحلقة',
    cats: ['نظام التحفيز', 'المتجر'],
    points: ['نجم الحلقة كل أسبوع بمعايير واضحة', 'أوزان المعايير يحدّدها المعهد', 'بطاقات تكريم للطلاب'],
  },
]

const ease = [0.22, 1, 0.36, 1]

/* الهاتف يعرض الشاشة نفسها التي على الحاسوب، بنسختها على الجوال
   (2026-11-19 ب). كان يدور على كل لقطات الجوال بلا صلة بالدور، فيظهر
   «التسميع اليومي» على الحاسوب و«حركات الصندوق» على الهاتف. لقطةٌ
   ليس لها نظيرٌ على الجوال تُعرض وحدها، والهاتف يختفي. */
const norm = (t) => (t || '').replace(/\s+/g, ' ').trim()
const PHONE_PAIR = {
  'التسميع اليومي': 'تقارير تسميع الطلاب',
  'إحصائيات عامة + سجل (تسميع)': 'تقارير تسميع الطلاب',
  'تفقد الغياب والتأخر': 'تقارير الغياب والتأخر',
  'إحصائيات سريعة + سجل (تفقد)': 'تقارير الغياب والتأخر',
  'سجل تسميع طالب / طلاب': 'تقارير تسميع الطلاب',
  'سجل الغياب والتأخر': 'تقارير الغياب والتأخر',
  'إحصاء الطلاب الأيتام': 'إحصاء الطلاب الأيتام',
  'الأخوة المسجلين (عوائل)': 'تقرير الأخوة المسجلين',
  'المحصلة الشهرية للحلقة': 'تقارير المحصلة الشهرية للحلقة',
  'المواد الرديفة (المناهج والامتحانات)': 'تقارير علامات المواد الشرعية',
  'ملفات التقارير (PDF)': 'تصدير التقارير PDF / Excel',
  'زر طباعة PDF + تصدير Excel': 'تصدير التقارير PDF / Excel',
  'صلاحيات الكادر': 'إدارة صلاحيات الكادر',
  'حفظ وثائق المعهد': 'الأرشفة السحابية',
  'المظهر العام': 'إعدادات النظام',
}

function Browser({ shot }) {
  return (
    <div className="relative rounded-[18px] overflow-hidden bg-white" style={{ boxShadow: '0 40px 80px -30px rgba(0,0,0,0.6), 0 0 0 1px rgba(224,181,98,0.35)' }}>
      <div className="h-9 flex items-center gap-2 px-4" style={{ background: '#F3EEE2', borderBottom: '1px solid #E6DFCF' }} dir="ltr">
        <span className="w-2.5 h-2.5 rounded-full bg-[#E5867A]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#E9C46A]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#7FB89A]" />
        <span className="mx-auto text-xs font-bold px-10 py-1 rounded-md bg-white" style={{ color: '#5E6E67' }}>ihkaam.app</span>
      </div>
      <div className="relative bg-[#F8F5EC]" style={{ aspectRatio: '1366 / 702' }}>
        <AnimatePresence mode="popLayout">
          {shot && (
            <motion.img
              key={shot.id}
              src={galleryImage(shot.image_url, 1100)}
              alt={shot.title}
              width={1100}
              height={618}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 39%' }}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Phone({ shot }) {
  return (
    <div className="relative" style={{ width: 150 }}>
      <div style={{ borderRadius: 30, padding: 5, background: 'linear-gradient(145deg,#4A504C,#1C211F 40%,#3B413D 62%,#141816)', boxShadow: '0 30px 50px -20px rgba(0,0,0,0.7)' }}>
        <div className="relative overflow-hidden bg-[#0E1311]" style={{ borderRadius: 25, aspectRatio: '9/19.5' }}>
          <AnimatePresence mode="popLayout">
            {shot && (
              <motion.img
                key={shot.id}
                src={galleryImage(shot.image_url, 360)}
                alt={shot.title}
                width={360}
                height={780}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>
          <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-3.5 rounded-full bg-black z-10" />
        </div>
      </div>
    </div>
  )
}

export default function ProductTourSection() {
  const [shots, setShots] = useState([])
  const [role, setRole] = useState(0)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    let off = false
    supabase.from('gallery_items')
      .select('id,image_url,title,category')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .then(({ data }) => { if (!off && data) setShots(data) })
    return () => { off = true }
  }, [])

  const r = ROLES[role]
  const list = useMemo(() => shots.filter(s => r.cats.includes(s.category)), [shots, r])
  const phones = useMemo(() => shots.filter(s => s.category === 'هاتف'), [shots])

  /* اللقطات داخل الدور تتبدّل كل 4 ثوانٍ */
  useEffect(() => {
    if (list.length < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % list.length), 4000)
    return () => clearInterval(t)
  }, [list.length, role])

  const pickRole = (i) => { setRole(i); setIdx(0) }
  const shot = list[idx % Math.max(1, list.length)]
  const pairTitle = shot ? PHONE_PAIR[norm(shot.title)] : null
  const phone = pairTitle ? phones.find(p => norm(p.title) === pairTitle) || null : null

  return (
    <section className="section-dark relative z-10 px-6 py-24 overflow-hidden" dir="rtl">
      <div className="pattern-layer pattern-khatam" aria-hidden />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow">لقطات حقيقية من التطبيق</span>
          <h2 className="font-bold mt-5 mb-4" style={{ color: '#F8F5EC', fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            جولة <span className="title-mark">داخل إحكام</span>
          </h2>
          <p className="text-lg mx-auto" style={{ color: 'rgba(248,245,236,0.8)', maxWidth: 620 }}>
            اختر من أنت في المعهد، وشاهد الشاشات التي ستعمل عليها كل يوم.
          </p>
        </div>

        {/* الأدوار */}
        <div role="tablist" aria-label="الأدوار" className="flex flex-wrap justify-center gap-2.5 mb-10">
          {ROLES.map((x, i) => {
            const on = i === role
            return (
              <button key={x.id} type="button" role="tab" aria-selected={on} onClick={() => pickRole(i)}
                className="relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-bold transition-colors duration-300"
                style={{ color: on ? '#0B3B33' : 'rgba(248,245,236,0.82)', boxShadow: on ? 'none' : 'inset 0 0 0 1px rgba(224,181,98,0.3)' }}>
                {on && <motion.span layoutId="tour-pill" className="absolute inset-0 rounded-full -z-10" style={{ background: 'linear-gradient(145deg,#F0D08A,#B8863A)' }} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <x.Icon size={17} /> {x.label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* النص */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease }}>
                <h3 className="font-bold mb-5" style={{ color: '#F8F5EC', fontSize: 'clamp(1.5rem, 2.6vw, 2rem)' }}>{r.title}</h3>
                <ul className="flex flex-col gap-3.5 mb-8">
                  {r.points.map(p => (
                    <li key={p} className="flex items-center gap-3 text-lg" style={{ color: 'rgba(248,245,236,0.88)' }}>
                      <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(224,181,98,0.16)', color: '#E0B562' }}><Check size={15} strokeWidth={3} /></span>
                      {p}
                    </li>
                  ))}
                </ul>
                {shot && <p className="text-sm mb-6" style={{ color: 'rgba(248,245,236,0.6)' }}>الشاشة المعروضة: {shot.title}</p>}
                <Link to={`/ihkaam?cat=${encodeURIComponent(r.cats[0])}#gallery`} className="btn-cta inline-flex items-center gap-2.5 rounded-full px-7 py-3.5" style={{ fontSize: '1rem' }}>
                  كل شاشات {r.label === 'التقارير وولي الأمر' ? 'التقارير' : r.label} <ArrowLeft size={17} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* الأجهزة */}
          <div className="lg:col-span-8 order-1 lg:order-2 relative pb-10 sm:pb-0">
            <Browser shot={shot} />
            <AnimatePresence>
              {phone && (
                <motion.div key="phone" className="absolute -bottom-10 -left-8 hidden sm:block"
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.5, ease }}>
                  <Phone shot={phone} />
                  <span className="block text-center text-xs font-bold mt-2" style={{ color: 'rgba(248,245,236,0.7)' }}>والشاشة نفسها على الجوال</span>
                </motion.div>
              )}
            </AnimatePresence>
            {/* شريط اللقطات */}
            {list.length > 1 && (
              <div className="flex justify-center gap-2 mt-5">
                {list.map((s, i) => (
                  <button key={s.id} type="button" onClick={() => setIdx(i)} aria-label={s.title} className="flex items-center px-0.5">
                    <span className="block h-1.5 rounded-full transition-all duration-300"
                      style={{ width: i === idx % list.length ? 28 : 10, background: i === idx % list.length ? '#E0B562' : 'rgba(248,245,236,0.3)' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
