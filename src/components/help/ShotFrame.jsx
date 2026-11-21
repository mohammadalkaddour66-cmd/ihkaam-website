/* إطار لقطة التطبيق: نافذة متصفّح للحاسوب، وهاتف للجوال، وصورة مشهد كما هي.
   small: النسخة المصغّرة للبطاقات. */
export function BrowserFrame({ shot, small = false, eager = false, className = '' }) {
  return (
    <div className={`rounded-[14px] overflow-hidden ${className}`}
      style={{ background: '#FDFBF7', boxShadow: '0 30px 60px -30px rgba(8,44,38,.55), 0 0 0 1px rgba(11,59,51,.10)' }}>
      <div className="flex items-center gap-1.5 px-3 h-7" style={{ background: '#F1ECDF', borderBottom: '1px solid var(--line-warm)' }} aria-hidden>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#D9CDB4' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#D9CDB4' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#D9CDB4' }} />
        <span className="mx-auto h-3.5 w-[38%] rounded-full" style={{ background: '#FDFBF7' }} />
      </div>
      <img src={small ? shot.srcSm : shot.src} alt={shot.title || ''} loading={eager ? 'eager' : 'lazy'} decoding="async"
        width={small ? 640 : 1600} height={small ? 400 : 1000} className="block w-full h-auto" />
    </div>
  )
}

export function PhoneFrame({ shot, width = 220, eager = false, className = '' }) {
  return (
    <div className={`rounded-[30px] overflow-hidden shrink-0 ${className}`}
      style={{ width, boxShadow: '0 30px 50px -24px rgba(8,44,38,.6), 0 0 0 7px #1A2E28, 0 0 0 8px rgba(224,181,98,.35)' }}>
      <img src={shot.src} alt={shot.title || ''} loading={eager ? 'eager' : 'lazy'} decoding="async"
        width="600" height="1298" className="block w-full h-auto" />
    </div>
  )
}

/* مخطط خطوات: دوائر مرقّمة بأيقونة وعنوان، لشرحٍ لا لقطة لشاشته.
   compact: شريط أيقونات صغير لبطاقات القوائم. */
export function FlowArt({ shot, compact = false }) {
  const { items } = shot
  if (compact) {
    return (
      <div className="absolute inset-0 pattern-khatam-ink grid place-items-center px-4" aria-hidden>
        <div className="flex items-center justify-center gap-1.5">
          {items.map(({ icon: I }, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="w-9 h-9 rounded-full grid place-items-center" style={{ background: '#0B3B33', color: '#E0B562', boxShadow: '0 8px 16px -8px rgba(8,44,38,.6)' }}><I size={17} /></span>
              {i < items.length - 1 && <span className="w-2 h-[2px] rounded-full" style={{ background: '#B8863A', opacity: 0.6 }} />}
            </span>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="relative rounded-[26px] overflow-hidden px-4 py-8 sm:px-8 sm:py-10" style={{ background: '#F1ECDF', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
      <div className="absolute inset-0 pattern-khatam-ink pointer-events-none" aria-hidden style={{ opacity: 0.06 }} />
      <ol className="relative grid grid-cols-3 sm:flex sm:flex-wrap sm:justify-center gap-x-3 gap-y-7 sm:gap-x-0">
        {items.map(({ icon: I, label }, i) => (
          <li key={i} className="flex flex-col items-center text-center sm:w-[132px] relative">
            {i > 0 && <span aria-hidden className="hidden sm:block absolute top-[27px] left-1/2 w-full h-[2px]" style={{ background: 'repeating-linear-gradient(270deg, #B8863A 0 6px, transparent 6px 11px)', opacity: 0.55 }} />}
            <span className="relative z-10 w-14 h-14 rounded-2xl grid place-items-center" style={{ background: '#0B3B33', color: '#E0B562', boxShadow: '0 14px 26px -14px rgba(8,44,38,.7)' }}>
              <I size={24} />
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full grid place-items-center text-[12px] font-bold tabular-nums" style={{ background: '#E0B562', color: '#0B3B33', fontFamily: 'cairo-latin, inherit' }}>{i + 1}</span>
            </span>
            <span className="mt-3 text-[13.5px] font-bold leading-snug text-[#1A2E28]">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* صورة مصغّرة موحّدة القياس لبطاقات القوائم */
export function ShotThumb({ shot, className = '' }) {
  if (!shot) return null
  if (shot.kind === 'flow') return <FlowArt shot={shot} compact />
  if (shot.kind === 'scene') {
    return <img src={shot.srcSm} alt="" loading="lazy" className={`w-full h-full object-cover ${className}`} />
  }
  if (shot.kind === 'phone') {
    return (
      <div className={`absolute inset-x-0 top-4 mx-auto w-[46%] max-w-[120px] rounded-[18px] overflow-hidden ${className}`}
        style={{ boxShadow: '0 16px 30px -14px rgba(8,44,38,.55), 0 0 0 4px #1A2E28' }}>
        <img src={shot.srcSm} alt="" loading="lazy" className="w-full" />
      </div>
    )
  }
  return (
    <div className={`absolute top-4 right-4 left-[-28%] rounded-t-xl overflow-hidden ${className}`}
      style={{ boxShadow: '0 16px 34px -16px rgba(8,44,38,.5), 0 0 0 1px rgba(11,59,51,.1)' }}>
      <img src={shot.srcSm} alt="" loading="lazy" className="w-full object-cover object-right-top" />
    </div>
  )
}
