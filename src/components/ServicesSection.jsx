import { Code2, Bot } from 'lucide-react'

const services = [
  {
    icon    : Code2,
    number  : '٠١',
    title   : 'برمجة وتطوير الأنظمة',
    body    : 'أصمم وأبرمج لك منصات إدارية مخصصة تنهي تماماً فوضى الورق وجداول الإكسل المشتتة. أبني لك نظاماً خاصاً (SaaS) يحفظ بياناتك بأمان ويجعل إدارة مؤسستك أسهل وأسرع، من أي جهاز وفي أي وقت.',
    tags    : ['SaaS Architecture', 'Supabase', 'React', 'AI Integration'],
    tagBg   : 'rgba(217,172,163,0.10)',
    tagColor: '#D9ACA3',
    iconBg  : 'rgba(217,172,163,0.08)',
  },
  {
    icon    : Bot,
    number  : '٠٢',
    title   : 'أتمتة المهام اليومية',
    body    : 'أربط التطبيقات التي تستخدمها يومياً ببعضها لتعمل معاً دون تدخل بشري. أقوم ببرمجة مسارات تنفذ المهام الروتينية المتكررة وإدخال البيانات تلقائياً، لنوفر وقت فريقك ليتفرغ للمهام الأهم.',
    tags    : ['Business Automation', 'Workflow', 'Efficiency'],
    tagBg   : 'rgba(26,148,155,0.14)',
    tagColor: '#48D6CD',
    iconBg  : 'rgba(26,148,155,0.10)',
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="relative z-10 py-24">

      {/* Ambient glow — bottom-right */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px]"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(26,148,155,0.07) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span
              className="text-xs font-semibold tracking-[0.22em] uppercase block mb-4"
              style={{ color: '#A6756A' }}
            >
              خدماتي
            </span>
            <h2
              className="font-black leading-tight"
              style={{ color: '#EAE4DF', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              كيف أساعد مؤسستك
              <br />
              <span className="text-rose-grad">فعلياً؟</span>
            </h2>
          </div>
          <p
            className="text-sm leading-relaxed max-w-xs text-start"
            style={{ color: '#96BCBE' }}
          >
            عملي يتركز في مجالين رئيسيين: أبرمج أنظمتك لتنهي الفوضى،
            وأُؤتمت مهامك الروتينية لنوفر وقت فريقك.
          </p>
        </div>

        {/* Bento cards — 3 equal columns */}
        <div className="grid md:grid-cols-2 gap-4">
          {services.map(({ icon: Icon, number, title, body, tags, tagBg, tagColor, iconBg }) => (
            <div
              key={number}
              className="bento p-7 flex flex-col cursor-default text-start"
            >
              {/* Number + icon row */}
              <div className="flex items-start justify-between mb-6">
                <span
                  className="font-black select-none leading-none"
                  style={{
                    fontSize: '4.5rem',
                    color   : 'rgba(26,148,155,0.18)',
                    lineHeight: 1,
                  }}
                >
                  {number}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: iconBg, border: `1px solid ${tagColor}22` }}
                >
                  <Icon size={19} strokeWidth={1.7} style={{ color: tagColor }} />
                </div>
              </div>

              {/* Title */}
              <h3
                className="font-bold text-base mb-3 leading-snug"
                style={{ color: '#EAE4DF' }}
              >
                {title}
              </h3>

              {/* Body */}
              <p
                className="text-sm leading-relaxed mb-6 flex-1"
                style={{ color: '#96BCBE' }}
              >
                {body}
              </p>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span
                    key={t}
                    className="text-[10px] font-medium rounded-full px-3 py-1"
                    style={{ background: tagBg, color: tagColor }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
