/* ملف بيانات لكل شرح في src/data/help-crops/<slug>.json (تكتبه scripts/help-crops.mjs) */
const FILES = import.meta.glob('../../data/help-crops/*.json', { eager: true, import: 'default' })
const crops = Object.fromEntries(Object.entries(FILES).map(([p, d]) => [p.split('/').pop().replace('.json', ''), d]))

/* اقتطاع من شاشة التطبيق لخطوة بعينها، تولّده scripts/help-crops.mjs من نسخة العرض.
   العلامات الذهبية تحيط بالعناصر التي تشرحها الخطوة، والتعليق مأخوذ من نصوصها الظاهرة
   في الشاشة نفسها، والسكربت يمنع أن يرد في الصورة عنصر لا يذكره نص الخطوة.
   لا يُعرض شيء إن لم يكن للخطوة اقتطاع. */
const GOLD = '#B8863A'

export default function StepShot({ slug, n }) {
  const c = crops[slug]?.[n]
  if (!c) return null
  const many = c.marks.length > 1
  const caption = `من شاشة «${c.screen}»`
  const alt = `${caption}: ${c.labels.map(l => `«${l}»`).join('، ')}`
  return (
    <figure className="mt-4 mb-1 rounded-2xl overflow-hidden bg-white w-full sm:w-[var(--shot-w)]"
      style={{ '--shot-w': `${Math.min(100, Math.round(c.w / 11))}%`, boxShadow: '0 18px 36px -22px rgba(8,44,38,.45), 0 0 0 1px rgba(11,59,51,.10)' }}>
      <div className="relative">
        <img src={c.src} alt={alt} width={c.w} height={c.h} loading="lazy" decoding="async" className="block w-full h-auto" />
        {c.marks.map((m, i) => (
          <span key={i} aria-hidden className="absolute rounded-[10px]"
            style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, height: `${m.h}%`, outline: `2px solid ${GOLD}`, outlineOffset: 3, background: 'rgba(184,134,58,.05)' }}>
            {many && (
              <span className="absolute -top-3.5 -left-3.5 w-6 h-6 rounded-full grid place-items-center text-[12px] font-bold tabular-nums"
                style={{ background: GOLD, color: '#fff', fontFamily: 'cairo-latin, inherit', boxShadow: '0 2px 6px rgba(0,0,0,.25)' }}>{i + 1}</span>
            )}
          </span>
        ))}
      </div>
      <figcaption className="px-4 py-2.5 text-[13px] leading-[1.8] text-[#5C6B66]" style={{ background: '#FBF9F3', borderTop: '1px solid rgba(11,59,51,.08)' }}>
        {caption}: {c.labels.map((l, i) => (
          <span key={i}>
            {many && <b className="tabular-nums" style={{ color: GOLD }}>{i + 1} </b>}«{l}»{i < c.labels.length - 1 ? '، ' : ''}{' '}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}
