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

/* صورة مصغّرة موحّدة القياس لبطاقات القوائم */
export function ShotThumb({ shot, className = '' }) {
  if (!shot) return null
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
