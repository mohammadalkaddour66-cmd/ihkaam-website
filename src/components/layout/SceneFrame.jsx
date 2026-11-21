/* إطار الهوية للمشاهد الكبيرة: إطار ذهبي رفيع، وعلامة «ربع الحزب» ۞ مرسومة على الإطار،
   وسطر عربي اختياري يُكتب فوق تدرّج داكن من جهة اليمين.

   المشهد نفسه زخرفي (alt فارغ وaria-hidden): لا يشرح شيئاً ولا يدّعيه. والسطر المكتوب فوقه
   يُؤخذ من نص الصفحة ذاتها (أرقام الميزة وأسبابها)، لا من محتوى الصورة، فلا تُوصَف الصورة
   بما ليس فيها. أما الشرح فتتحمله لقطات التطبيق المقتطعة والرسوم. */
const GOLD = '#E0B562'

function RubElHizb({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={GOLD} strokeWidth="1.5" aria-hidden>
      <rect x="5.5" y="5.5" width="13" height="13" rx="0.6" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="0.6" transform="rotate(45 12 12)" />
      <circle cx="12" cy="12" r="2.1" fill={GOLD} stroke="none" />
    </svg>
  )
}

export default function SceneFrame({ src, line, sub, aspect = 'aspect-[21/9]', className = '', eager = false }) {
  return (
    <figure className={`relative overflow-hidden rounded-[26px] ${className}`}
      style={{ boxShadow: '0 30px 60px -34px rgba(8,44,38,.55), 0 0 0 1px rgba(11,59,51,.10)' }} aria-hidden>
      <div className={`relative ${aspect}`}>
        <img src={src} alt="" width={1280} height={720} loading={eager ? 'eager' : 'lazy'} decoding="async"
          className="absolute inset-0 w-full h-full object-cover" />
        {line && <span className="absolute inset-0" style={{ background: 'linear-gradient(270deg, rgba(8,44,38,.82) 0%, rgba(8,44,38,.5) 34%, rgba(8,44,38,0) 66%)' }} />}
        <span className="absolute inset-3 sm:inset-4 rounded-[18px] pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(224,181,98,.55)' }} />
        <span className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full"
          style={{ background: '#0B3B33', boxShadow: '0 0 0 1px rgba(224,181,98,.55)' }}>
          <RubElHizb />
        </span>
        {line && (
          <figcaption className="absolute right-6 sm:right-10 bottom-6 sm:bottom-9 max-w-[62%] sm:max-w-[46%]" style={{ color: '#F8F5EC' }}>
            <span className="block font-bold leading-snug" style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.7rem)', textShadow: '0 2px 14px rgba(0,0,0,.35)' }}>{line}</span>
            {sub && <span className="block mt-1.5 text-[13px] sm:text-[14px] leading-[1.8]" style={{ color: 'rgba(248,245,236,.82)' }}>{sub}</span>}
          </figcaption>
        )}
      </div>
    </figure>
  )
}
