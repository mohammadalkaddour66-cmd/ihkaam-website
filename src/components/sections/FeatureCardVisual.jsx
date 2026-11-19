import { galleryImage } from '../../config/imageUrl'
import { desktopSrc, mobileSrc } from '../../data/appShots'

/* ══════════════════════════════════════════════════════════════════
   صورة كل بطاقة في «ما الذي ستجده داخل إحكام» (2026-11-19 ب)

   كانت البطاقة تأخذ أي لقطةٍ من «فئة» قريبة وتقصّها بـobject-cover،
   فتظهر «الإشعارات» على بطاقة «رسائل أولياء الأمور»، واللقطة مقطوعةٌ
   يميناً ويساراً (ملاحظة المالك). صار لكل ميزةٍ شاشتها بالاسم من
   gallery_items، وتُعرض كاملةً داخل إطار متصفّح بنسبتها الأصلية
   (1366×768)، أو داخل هاتف إن كانت لقطة جوال (1080×2340). يُقصّ من
   لقطة الحاسوب شريطا ويندوز فقط: عنوان النافذة (26px) وشريط المهام
   (40px)، فتبقى 1366×702 ولا يُمسّ عرضها.
   والميزتان اللتان لا لقطة لهما (بوابة ولي الأمر والرسائل) لهما مشهدٌ
   مرسومٌ بالهوية نفسها.

   لاستبدال أيٍّ منها بصورةٍ مصمّمة: { img: '/features/<slug>.webp' }.
   ══════════════════════════════════════════════════════════════════ */
const VISUAL = {
  admin:    { shot: 'إحصائيات عامة' },
  academic: { shot: 'فرز الحلقات والطلاب' },
  daily:    { shot: 'التسميع اليومي' },
  /* لقطتان حقيقيتان من «معهد النموذج» في نسخة العرض (2026-11-19 هـ):
     شاشة التحليل الذكي نفسها، وبوابة ولي الأمر كما تظهر على هاتفه. */
  insights: { app: 'insights' },
  parents:  { appPhone: 'parent' },
  reports:  { shot: 'ملفات التقارير (PDF)' },
  library:  { shot: 'حفظ وثائق المعهد' },
  exams:    { shot: 'اختبار الطلاب' },
  messages: { mock: 'messages' },
  finance:  { phone: 'لوحة التحكم (الإدارة المالية)' },
  subjects: { shot: 'المواد الرديفة (المناهج والامتحانات)' },
  star:     { shot: 'نجم الأسبوع (pro)' },
}

const norm  = (t) => (t || '').replace(/\s+/g, ' ').trim()
const GOLD  = '#E0B562'
const CREAM = '#F8F5EC'
const INK   = '#0B3B33'

function findShot(shots, title) {
  return title ? shots.find(x => norm(x.title) === norm(title)) || null : null
}

/* بوابة ولي الأمر: بطاقة الطالب كما تصل إلى هاتف الأب، وإشعاران */
function ParentsMock() {
  const rows = [
    ['الحضور هذا الشهر', '19 من 20'],
    ['آخر تسميع', 'سورة الملك · 9/10'],
    ['الاختبار القادم', 'جزء تبارك'],
  ]
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 px-5" dir="rtl">
      <div className="feat-shot w-[50%] rounded-2xl p-3" style={{ background: CREAM, boxShadow: '0 20px 40px -18px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: INK, color: GOLD }}>ع</span>
          <div className="leading-tight">
            <div className="text-[11px] font-bold" style={{ color: INK }}>عبد الله</div>
            <div className="text-[9px]" style={{ color: '#5E6E67' }}>حلقة الإمام نافع</div>
          </div>
        </div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between items-center gap-2 py-1.5 text-[9.5px]" style={{ borderTop: '1px solid #E9E3D5' }}>
            <span style={{ color: '#5E6E67' }}>{k}</span><span className="font-bold" style={{ color: INK }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="w-[38%] flex flex-col gap-2">
        {[['حضر عبد الله اليوم', 'الآن'], ['سمّع عبد الله صفحتين', 'قبل ساعة']].map(([t, w]) => (
          <div key={t} className="rounded-xl px-3 py-2" style={{ background: 'rgba(248,245,236,0.1)', boxShadow: 'inset 0 0 0 1px rgba(224,181,98,0.3)' }}>
            <div className="text-[9.5px] font-bold" style={{ color: CREAM }}>{t}</div>
            <div className="text-[8.5px]" style={{ color: 'rgba(248,245,236,0.6)' }}>{w}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* الرسائل: محادثةٌ خاصّة بين ولي الأمر والإدارة */
function MessagesMock() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-5" dir="rtl">
      <div className="feat-shot w-[80%] rounded-2xl p-3 flex flex-col gap-2" style={{ background: CREAM, boxShadow: '0 20px 40px -18px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid #E9E3D5' }}>
          <span className="text-[10.5px] font-bold" style={{ color: INK }}>والد الطالب أحمد</span>
          <span className="text-[8.5px] rounded-full px-2 py-0.5 font-bold" style={{ background: 'rgba(31,111,82,0.1)', color: '#1F6F52' }}>خاصّ</span>
        </div>
        <div className="self-start max-w-[82%] rounded-xl px-3 py-1.5 text-[9.5px] leading-relaxed" style={{ background: '#E9E3D5', color: '#1A2E28' }}>
          أحمد مسافر يوم الخميس، هل يمكن تقديم تسميعه؟
        </div>
        <div className="self-end max-w-[82%] rounded-xl px-3 py-1.5 text-[9.5px] leading-relaxed" style={{ background: INK, color: CREAM }}>
          نعم، أبلغنا شيخ الحلقة ليسمّع له الأربعاء.
        </div>
        <div className="self-end text-[8px]" style={{ color: '#5E6E67' }}>تمّت القراءة · 4:12 م</div>
      </div>
    </div>
  )
}

export default function FeatureCardVisual({ slug, shots }) {
  const v = VISUAL[slug] || {}

  if (v.img) return <img src={v.img} alt="" loading="lazy" decoding="async" className="feat-shot absolute inset-0 w-full h-full object-cover" />
  if (v.mock === 'parents')  return <ParentsMock />
  if (v.mock === 'messages') return <MessagesMock />

  if (v.appPhone) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="feat-shot" style={{ height: '88%', aspectRatio: '600 / 1298', borderRadius: 20, padding: 4, background: 'linear-gradient(145deg,#4A504C,#1C211F 40%,#3B413D 62%,#141816)', boxShadow: '0 20px 40px -16px rgba(0,0,0,0.7)' }}>
          <div className="w-full h-full overflow-hidden bg-white" style={{ borderRadius: 16 }}>
            <img src={mobileSrc(v.appPhone)} alt="بوابة ولي الأمر على الجوال: سجل الطالب ونجم الحلقة وأرقام تسميعه" width={600} height={1298} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
          </div>
        </div>
      </div>
    )
  }

  if (v.app) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="feat-shot w-[88%] rounded-lg overflow-hidden" style={{ background: CREAM, boxShadow: '0 20px 40px -16px rgba(0,0,0,0.6)' }}>
          <div className="h-[14px] flex items-center gap-1 px-2" style={{ background: '#F3EEE2', borderBottom: '1px solid #E6DFCF' }} dir="ltr">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5867A]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#E9C46A]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#7FB89A]" />
          </div>
          <div style={{ aspectRatio: '1366 / 702' }}>
            <img src={desktopSrc(v.app)} srcSet={`${desktopSrc(v.app, true)} 640w, ${desktopSrc(v.app)} 1600w`} sizes="(min-width: 768px) 560px, 90vw"
                 alt="شاشة التحليل الذكي: حكم الحلقة وسببه ومؤشراتها مقارنةً بماضيها" width={1600} height={1000} loading="lazy" decoding="async"
                 className="w-full h-full object-cover object-top" />
          </div>
        </div>
      </div>
    )
  }

  if (v.phone) {
    const p = findShot(shots, v.phone)
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="feat-shot" style={{ height: '86%', aspectRatio: '1080 / 2340', borderRadius: 18, padding: 3.5, background: 'linear-gradient(145deg,#4A504C,#1C211F 40%,#3B413D 62%,#141816)', boxShadow: '0 20px 40px -16px rgba(0,0,0,0.7)' }}>
          <div className="w-full h-full overflow-hidden" style={{ borderRadius: 15, background: '#0E1311' }}>
            {p && <img src={galleryImage(p.image_url, 300)} alt={p.title} width={300} height={650} loading="lazy" decoding="async" className="w-full h-full object-contain" />}
          </div>
        </div>
      </div>
    )
  }

  const shot = findShot(shots, v.shot)
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="feat-shot w-[88%] rounded-lg overflow-hidden" style={{ background: CREAM, boxShadow: '0 20px 40px -16px rgba(0,0,0,0.6)' }}>
        <div className="h-[14px] flex items-center gap-1 px-2" style={{ background: '#F3EEE2', borderBottom: '1px solid #E6DFCF' }} dir="ltr">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5867A]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#E9C46A]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#7FB89A]" />
        </div>
        <div style={{ aspectRatio: '1366 / 702' }}>
          {shot && <img src={galleryImage(shot.image_url, 700)} alt={shot.title} width={700} height={394} loading="lazy" decoding="async" className="w-full h-full object-cover" style={{ objectPosition: '50% 39%' }} />}
        </div>
      </div>
    </div>
  )
}
