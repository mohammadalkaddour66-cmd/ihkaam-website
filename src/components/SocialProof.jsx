/*
  SocialProof — Numbered stats bar below Hero.
  Instant trust-building: clear numbers, no ambiguity.
  Strategy: بناء ثقة فورية داحضة للشكوك (Human-First Architecture)
*/
const stats = [
  { value: '+1,800', label: 'طالب مُسجّل يُدار سحابياً' },
  { value: '+150',   label: 'كادر إداري وتعليمي'        },
  { value: '108',    label: 'حلقة قرآنية مؤتمتة بالكامل' },
  { value: '6',      label: 'معاهد ومؤسسات كبرى تثق بنا' },
]

export default function SocialProof() {
  return (
    <section id="social-proof" className="relative z-10 py-10">
      {/* Glass bar */}
      <div className="max-w-5xl mx-auto px-6">
        <div
          className="card-glass rounded-2xl px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className={`text-center ${
                /* Vertical divider between items on desktop */
                i < stats.length - 1
                  ? 'md:border-e md:border-e-[rgba(26,148,155,0.20)]'
                  : ''
              }`}
            >
              {/* Animated number — rose gradient */}
              <div
                className="text-rose-grad text-3xl md:text-4xl font-black mb-1"
              >
                {value}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: '#96BCBE' }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
