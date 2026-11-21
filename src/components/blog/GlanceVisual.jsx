import { motion } from 'framer-motion'

/* «الفكرة في لمحة»: يرسم خلاصة المقال قبل نصه. البيانات في src/data/blogVisuals.js */

const INK = '#0B3B33', GREEN = '#1F6F52', GOLD = '#B8863A', GOLD_TXT = '#8A6425'
const ease = [0.22, 1, 0.36, 1]
const rise = (i = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease, delay: 0.06 * i },
})

/* ── خطوات مرقّمة على خطٍّ واحد ───────────────────────────── */
function Steps({ items }) {
  return (
    <ol className="relative flex flex-col gap-4 sm:grid sm:gap-4 glance-steps" style={{ '--cols': items.length }}>
      <span aria-hidden className="sm:hidden absolute top-4 bottom-4 right-[21px] w-px" style={{ background: `repeating-linear-gradient(180deg, ${GOLD}88 0 6px, transparent 6px 12px)` }} />
      <span aria-hidden className="hidden sm:block absolute top-[22px] inset-x-[8%] h-px"
        style={{ background: `repeating-linear-gradient(90deg, ${GOLD}88 0 6px, transparent 6px 12px)` }} />
      {items.map((s, i) => (
        <motion.li key={i} {...rise(i)} className="relative flex sm:flex-col items-start sm:items-center gap-3 sm:text-center">
          <span className="relative z-10 shrink-0 w-11 h-11 rounded-full grid place-items-center font-bold text-base"
            style={{ background: i === items.length - 1 ? INK : '#FDFBF7', color: i === items.length - 1 ? '#E0B562' : INK,
              boxShadow: `0 0 0 1px ${GOLD}55, 0 6px 16px -8px rgba(11,59,51,.35)` }}>
            {i + 1}
          </span>
          <div className="min-w-0">
            {s.who && <div className="text-[11px] font-bold mb-0.5" style={{ color: GOLD_TXT }}>{s.who}</div>}
            <div className="font-bold text-[15px] text-[#1A2E28] leading-snug">{s.title}</div>
            <div className="text-[13px] text-[#4A5D56] leading-relaxed mt-0.5">{s.text}</div>
          </div>
        </motion.li>
      ))}
    </ol>
  )
}

/* ── جانبان متقابلان ──────────────────────────────────────── */
function Compare({ a, b }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 relative">
      {[a, b].map((side, k) => (
        <motion.div key={k} {...rise(k)} className="rounded-2xl p-5"
          style={k === 0
            ? { background: '#F1ECDF', border: '1px dashed rgba(11,59,51,.18)' }
            : { background: INK, color: '#F8F5EC', boxShadow: '0 14px 30px -16px rgba(8,44,38,.6)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full grid place-items-center text-xs font-bold"
              style={k === 0 ? { background: 'rgba(11,59,51,.08)', color: '#5E6E67' } : { background: '#E0B562', color: INK }}>
              {k === 0 ? '✕' : '✓'}
            </span>
            <span className="font-bold text-sm" style={{ color: k === 0 ? '#4A5D56' : '#E0B562' }}>{side.label}</span>
          </div>
          <ul className="space-y-2">
            {side.items.map((t, i) => (
              <li key={i} className="text-[14px] leading-relaxed flex gap-2"
                style={{ color: k === 0 ? '#5E6E67' : 'rgba(248,245,236,.88)', textDecoration: k === 0 && side.strike ? 'line-through' : 'none' }}>
                <span aria-hidden style={{ color: k === 0 ? 'rgba(11,59,51,.3)' : '#E0B562' }}>•</span>{t}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
      <span aria-hidden className="hidden sm:grid absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full place-items-center text-sm font-bold"
        style={{ background: '#FDFBF7', color: GOLD_TXT, boxShadow: `0 0 0 1px ${GOLD}66` }}>←</span>
    </div>
  )
}

/* ── أعمدة أفقية ─────────────────────────────────────────── */
function Bars({ items, note }) {
  const max = Math.max(...items.map(i => i.value))
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="grid items-center gap-3" style={{ gridTemplateColumns: '72px 1fr' }}>
          <span className="text-[13px] font-bold text-[#1A2E28]">{it.label}</span>
          <div className="relative h-9 rounded-xl overflow-hidden" style={{ background: '#F1ECDF' }}>
            <motion.div className="absolute inset-y-0 right-0 rounded-xl"
              style={{ background: i === items.length - 1 ? `linear-gradient(270deg, ${INK}, ${GREEN})` : `linear-gradient(270deg, ${GOLD}, #D4A65A)` }}
              initial={{ width: 0 }} whileInView={{ width: `${Math.max(14, (it.value / max) * 100)}%` }}
              viewport={{ once: true }} transition={{ duration: 0.9, ease, delay: 0.1 * i }} />
            <span className="absolute inset-y-0 right-3 flex items-center text-[13px] font-bold" style={{ color: '#FDFBF7' }}>
              {it.text}
            </span>
          </div>
        </div>
      ))}
      {note && <p className="text-xs text-[#5E6E67] pt-1">{note}</p>}
    </div>
  )
}

/* ── شريط مقسّم بنسب ──────────────────────────────────────── */
const STACK_COLORS = [INK, GREEN, GOLD, '#D4A65A', '#7A8F86']
function Stack({ items, total }) {
  const sum = items.reduce((a, b) => a + b.value, 0)
  return (
    <div>
      <div className="flex h-14 rounded-2xl overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px rgba(11,59,51,.08)' }}>
        {items.map((it, i) => (
          <motion.div key={i} className="h-full grid place-items-center text-[12px] font-bold"
            style={{ flex: `${it.value} 1 0`, minWidth: 0, background: STACK_COLORS[i % STACK_COLORS.length], color: i >= 2 && i <= 3 ? INK : '#F8F5EC', borderInlineStart: i ? '2px solid #FDFBF7' : 'none' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.5, ease, delay: 0.08 * i }}>
            {it.value / sum > 0.08 ? it.text : ''}
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
        {items.map((it, i) => (
          <span key={i} className="flex items-center gap-2 text-[13px] text-[#1A2E28]">
            <span className="w-3 h-3 rounded" style={{ background: STACK_COLORS[i % STACK_COLORS.length] }} />
            {it.label} <b className="tabular-nums" style={{ color: GOLD_TXT }}>{it.text}</b>
          </span>
        ))}
        {total && <span className="text-[13px] text-[#5E6E67] ms-auto">المجموع: {total}</span>}
      </div>
    </div>
  )
}

/* ── معادلة ───────────────────────────────────────────────── */
function Equation({ parts, ops, note }) {
  return (
    <div>
      <div className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-3">
        {parts.map((p, i) => (
          <div key={i} className="contents">
            <motion.div {...rise(i)} className="rounded-2xl px-5 py-4 text-center min-w-[112px]"
              style={i === parts.length - 1
                ? { background: INK, color: '#F8F5EC', boxShadow: '0 14px 30px -16px rgba(8,44,38,.6)' }
                : { background: '#F1ECDF' }}>
              <div className="font-bold leading-none tabular-nums" dir="ltr"
                style={{ fontSize: 'clamp(1.7rem, 4vw, 2.3rem)', color: i === parts.length - 1 ? '#E0B562' : INK }}>{p.value}</div>
              <div className="text-[12px] mt-2" style={{ color: i === parts.length - 1 ? 'rgba(248,245,236,.8)' : '#4A5D56' }}>{p.label}</div>
            </motion.div>
            {ops[i] && <span className="self-center text-2xl font-bold px-1" style={{ color: GOLD }}>{ops[i]}</span>}
          </div>
        ))}
      </div>
      {note && <p className="text-xs text-[#5E6E67] text-center mt-4">{note}</p>}
    </div>
  )
}

/* ── درجات ───────────────────────────────────────────────── */
function Ladder({ items }) {
  return (
    <div className="grid gap-2">
      {items.map((it, i) => (
        <motion.div key={i} {...rise(i)} className="flex items-center gap-3 rounded-xl p-2.5 pe-4"
          style={{ background: '#F1ECDF', marginInlineEnd: `${i * 6}%` }}>
          <span className="shrink-0 rounded-lg px-3 py-2 text-[13px] font-bold tabular-nums min-w-[78px] text-center"
            style={{ background: [INK, GREEN, GOLD, '#C9BFA8'][i] ?? INK, color: i < 2 ? '#F8F5EC' : INK }}>{it.range}</span>
          <span className="font-bold text-[15px] text-[#1A2E28]">{it.label}</span>
          <span className="text-[13px] text-[#4A5D56] ms-auto text-left hidden sm:inline">{it.text}</span>
          <span className="text-[12px] text-[#4A5D56] sm:hidden">{it.text}</span>
        </motion.div>
      ))}
    </div>
  )
}

/* ── رموز ────────────────────────────────────────────────── */
function Chips({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {items.map((c, i) => (
        <motion.div key={i} {...rise(i)} className="rounded-2xl p-4 text-center" style={{ background: '#F1ECDF' }}>
          <div className="mx-auto w-12 h-12 rounded-xl grid place-items-center text-2xl font-bold mb-2"
            style={{ background: i === 1 ? INK : '#FDFBF7', color: i === 1 ? '#E0B562' : INK, boxShadow: `0 0 0 1px ${GOLD}55` }}>{c.sym}</div>
          <div className="font-bold text-sm text-[#1A2E28]">{c.label}</div>
          <div className="text-[12px] text-[#4A5D56] leading-relaxed mt-1">{c.text}</div>
        </motion.div>
      ))}
    </div>
  )
}

/* ── أركان ───────────────────────────────────────────────── */
function Pillars({ items }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${items.length > 4 ? 130 : 160}px, 1fr))` }}>
      {items.map((p, i) => (
        <motion.div key={i} {...rise(i)} className="relative rounded-2xl p-5 overflow-hidden" style={{ background: '#F1ECDF' }}>
          <span aria-hidden className="absolute -top-3 -left-1 font-bold leading-none select-none"
            style={{ fontSize: 72, color: 'rgba(184,134,58,.16)' }}>{i + 1}</span>
          <span className="block w-8 h-1 rounded-full mb-3" style={{ background: i % 2 ? GOLD : GREEN }} />
          <div className="relative font-bold text-[15px] text-[#1A2E28]">{p.title}</div>
          <div className="relative text-[13px] text-[#4A5D56] leading-relaxed mt-1">{p.text}</div>
        </motion.div>
      ))}
    </div>
  )
}

/* ── خطّان عبر الزمن ─────────────────────────────────────── */
function Trend({ labels, series, caption }) {
  const all = series.flatMap(s => s.values)
  const lo = Math.min(...all) - 4, hi = Math.max(...all) + 4
  const W = 560, H = 220, P = 40
  const x = i => W - P - (i * (W - 2 * P)) / (labels.length - 1)   /* RTL: الزمن يجري من اليمين */
  const y = v => H - P - ((v - lo) / (hi - lo)) * (H - 2 * P)
  const colors = [GOLD, INK]
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-[240px]" role="img" aria-label={caption}>
        {labels.map((l, i) => (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={P - 10} y2={H - P} stroke="rgba(11,59,51,.08)" />
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="12" fill="#5E6E67">{l}</text>
          </g>
        ))}
        {series.map((s, k) => (
          <g key={k}>
            <polyline fill="none" stroke={colors[k]} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
              />
            {s.values.map((v, i) => (
              <g key={i}>
                <circle cx={x(i)} cy={y(v)} r="6" fill="#FDFBF7" stroke={colors[k]} strokeWidth="3" />
                <text x={x(i)} y={y(v) - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill={colors[k]}>{v}</text>
              </g>
            ))}
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
        {series.map((s, k) => (
          <span key={k} className="flex items-center gap-2 text-[13px] text-[#1A2E28]">
            <span className="w-4 h-1 rounded-full" style={{ background: colors[k] }} />
            <b>{s.name}</b> <span className="text-[#4A5D56]">{s.note}</span>
          </span>
        ))}
      </div>
      {caption && <figcaption className="text-xs text-[#5E6E67] mt-3">{caption}</figcaption>}
    </figure>
  )
}

const RENDER = { steps: Steps, compare: Compare, bars: Bars, stack: Stack, equation: Equation, ladder: Ladder, chips: Chips, pillars: Pillars, trend: Trend }

export default function GlanceVisual({ visual }) {
  if (!visual) return null
  const Body = RENDER[visual.type]
  if (!Body) return null
  return (
    <section aria-label="الفكرة في لمحة" className="rounded-[22px] p-5 sm:p-7"
      style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
        <span className="eyebrow" style={{ padding: '.3rem .8rem', fontSize: '.75rem', whiteSpace: 'nowrap' }}>الفكرة في لمحة</span>
        <h2 className="font-bold text-[17px] sm:text-lg text-[#1A2E28]">{visual.title}</h2>
      </div>
      <Body {...visual} />
    </section>
  )
}
