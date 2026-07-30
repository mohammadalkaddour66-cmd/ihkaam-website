const STATS = [
  {
    number: '100%',
    label : 'حلول برمجية وتصاميم مفصلة على مقاسك',
    symbol: '✦',
    accent: '#D9ACA3',
    bg    : 'rgba(217,172,163,0.07)',
    border: 'rgba(217,172,163,0.16)',
    hoverBorder: 'rgba(217,172,163,0.38)',
    hoverBg    : 'rgba(217,172,163,0.11)',
    glow  : 'rgba(217,172,163,0.06)',
  },
  {
    number: '+1 M',
    label : 'مشاهدة لأعمالي ومحتواي التقني على السوشيال ميديا',
    symbol: '◉',
    accent: '#48D6CD',
    bg    : 'rgba(26,148,155,0.08)',
    border: 'rgba(26,148,155,0.20)',
    hoverBorder: 'rgba(72,214,205,0.42)',
    hoverBg    : 'rgba(26,148,155,0.14)',
    glow  : 'rgba(26,148,155,0.06)',
  },
  {
    number: '+5,500',
    label : 'صديق ومتابع لرحلتي في عالم الأتمتة والتصميم',
    symbol: '❋',
    accent: '#A6756A',
    bg    : 'rgba(166,117,106,0.07)',
    border: 'rgba(166,117,106,0.18)',
    hoverBorder: 'rgba(166,117,106,0.38)',
    hoverBg    : 'rgba(166,117,106,0.12)',
    glow  : 'rgba(166,117,106,0.06)',
  },
  {
    number: '+3',
    label : 'سنوات من الخبرة',
    symbol: '◈',
    accent: '#D9ACA3',
    bg    : 'rgba(217,172,163,0.07)',
    border: 'rgba(217,172,163,0.16)',
    hoverBorder: 'rgba(217,172,163,0.38)',
    hoverBg    : 'rgba(217,172,163,0.11)',
    glow  : 'rgba(217,172,163,0.06)',
  },
]

function StatCard({ stat }) {
  return (
    <div
      className="relative flex flex-col items-center text-center gap-4 rounded-3xl px-6 py-8 transition-all duration-500"
      style={{
        background          : stat.bg,
        border              : `1px solid ${stat.border}`,
        backdropFilter      : 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform   = 'translateY(-5px)'
        el.style.background  = stat.hoverBg
        el.style.borderColor = stat.hoverBorder
        el.style.boxShadow   = `0 20px 50px ${stat.glow}, 0 0 0 1px ${stat.hoverBorder}`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform   = 'translateY(0)'
        el.style.background  = stat.bg
        el.style.borderColor = stat.border
        el.style.boxShadow   = 'none'
      }}
    >
      {/* Accent symbol */}
      <span
        className="text-lg leading-none select-none"
        style={{ color: stat.accent, opacity: 0.55 }}
        aria-hidden
      >
        {stat.symbol}
      </span>

      {/* Number */}
      <p
        className="font-black leading-none"
        style={{
          color     : stat.accent,
          fontSize  : 'clamp(2.2rem, 4.5vw, 3rem)',
          letterSpacing: '-0.02em',
        }}
      >
        {stat.number}
      </p>

      {/* Label */}
      <p
        className="text-sm leading-[1.85]"
        style={{ color: '#96BCBE', maxWidth: '200px' }}
      >
        {stat.label}
      </p>
    </div>
  )
}

export default function StatsSection() {
  return (
    <section id="stats" className="relative z-10 py-16">

      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(26,148,155,0.04) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* Eyebrow label */}
        <div className="text-center mb-10">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase"
            style={{ color: '#A6756A' }}
          >
            بالأرقام
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <StatCard key={stat.number} stat={stat} />
          ))}
        </div>

      </div>
    </section>
  )
}
