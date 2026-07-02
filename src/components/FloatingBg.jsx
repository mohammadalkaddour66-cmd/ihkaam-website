const PARTICLES = [
  { top: '10%',  left: '7%',  size: 5,  dur: '9s',  delay: '0s',   color: 'rgba(106,189,178,0.70)' },
  { top: '25%',  left: '91%', size: 4,  dur: '12s', delay: '1.5s', color: 'rgba(217,172,163,0.65)' },
  { top: '52%',  left: '4%',  size: 4,  dur: '7s',  delay: '3s',   color: 'rgba(106,189,178,0.55)' },
  { top: '68%',  left: '84%', size: 5,  dur: '11s', delay: '0.8s', color: 'rgba(217,172,163,0.60)' },
  { top: '38%',  left: '47%', size: 3,  dur: '14s', delay: '2s',   color: 'rgba(106,189,178,0.45)' },
  { top: '80%',  left: '21%', size: 4,  dur: '8s',  delay: '4s',   color: 'rgba(166,117,106,0.55)' },
  { top: '16%',  left: '63%', size: 3,  dur: '10s', delay: '1s',   color: 'rgba(106,189,178,0.50)' },
  { top: '88%',  left: '68%', size: 5,  dur: '13s', delay: '2.5s', color: 'rgba(217,172,163,0.50)' },
]

export default function FloatingBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* Warm rose orb — top-right */}
      <div
        className="orb-a absolute -top-1/3 -right-1/4 w-[900px] h-[900px] rounded-full"
        style={{ background: 'radial-gradient(circle at center, rgba(217,172,163,0.10) 0%, transparent 65%)' }}
      />

      {/* Teal depth orb — bottom-left */}
      <div
        className="orb-b absolute -bottom-1/3 -left-1/4 w-[750px] h-[750px] rounded-full"
        style={{ background: 'radial-gradient(circle at center, rgba(2,115,104,0.12) 0%, transparent 65%)' }}
      />

      {/* Turquoise mid orb — center */}
      <div
        className="orb-c absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle at center, rgba(106,189,178,0.06) 0%, transparent 70%)' }}
      />

      {/* Floating particles — fixed px units */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="particle absolute rounded-full"
          style={{
            top       : p.top,
            left      : p.left,
            width     : `${p.size}px`,
            height    : `${p.size}px`,
            background: p.color,
            boxShadow : `0 0 ${p.size * 4}px ${p.color}, 0 0 ${p.size * 8}px ${p.color}`,
            '--dur'   : p.dur,
            '--delay' : p.delay,
          }}
        />
      ))}

    </div>
  )
}
