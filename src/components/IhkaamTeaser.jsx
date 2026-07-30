import { motion } from 'framer-motion'
import { Link }   from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const outcomes = [
  { stat: 'صفر',   desc: 'أوراق حضور يدوية — كل شيء يُسجَّل تلقائياً'        },
  { stat: '٣×',    desc: 'أسرع في تحصيل الرسوم وتتبع المستحقات'              },
  { stat: 'لحظي',  desc: 'تقارير ولي الأمر — يعرف تقدم ابنه في أي وقت'       },
]

export default function IhkaamTeaser() {
  return (
    <section className="relative z-10 py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.70, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] overflow-hidden"
          style={{
            background  : '#09201E',
            border      : '1px solid rgba(229,211,179,0.10)',
            borderRadius: '20px',
          }}
        >

          {/* ── TEXT BLOCK ── */}
          <div className="p-8 lg:p-12 flex flex-col justify-center text-start">

            {/* Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: '#48D6CD', boxShadow: '0 0 6px rgba(72,214,205,0.50)' }}
              />
              <span
                className="text-xs font-semibold tracking-[0.20em] uppercase"
                style={{ color: '#48D6CD' }}
              >
                منصتنا الرائدة
              </span>
            </div>

            {/* Headline */}
            <h2
              className="font-black leading-tight mb-5"
              style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.5rem)', color: '#EAE4DF' }}
            >
              معهدك يستحق نظاماً
              <br />
              <span className="text-rose-grad">يعمل بدلاً عن الأوراق</span>
            </h2>

            {/* Subtext */}
            <p
              className="leading-[1.95] mb-10"
              style={{ color: '#96BCBE', fontSize: '0.88rem', maxWidth: '460px' }}
            >
              المعاهد التي تعمل على إحكام لا تعود للأوراق. الحضور، المحاسبة،
              التقارير، والتواصل مع الأهالي — تحدث وحدها بينما يركّز الكادر على التعليم.
            </p>

            {/* Outcomes */}
            <div className="flex flex-col gap-3 mb-10">
              {outcomes.map(o => (
                <div
                  key={o.stat}
                  className="flex items-center gap-4 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(72,214,205,0.05)', border: '1px solid rgba(72,214,205,0.10)' }}
                >
                  <span
                    className="font-black text-xl w-12 shrink-0 text-center"
                    style={{ color: '#48D6CD' }}
                  >
                    {o.stat}
                  </span>
                  <span style={{ color: '#C8B8B0', fontSize: '0.84rem', lineHeight: 1.6 }}>
                    {o.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/ihkaam"
              className="btn-cta inline-flex items-center gap-2.5 rounded-xl self-start"
              style={{ fontSize: '0.875rem', padding: '0.875rem 2rem' }}
            >
             اكتشف قوة إحكام
              <ArrowLeft size={16} />
            </Link>

          </div>

          {/* ── LOGO COLUMN ── */}
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              minHeight  : '400px',
              background : 'linear-gradient(160deg, #020F0E 0%, #020F0E 60%, #09201E 100%)',
              borderRight: '1px solid rgba(229,211,179,0.07)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(26,148,155,0.18) 0%, transparent 70%)',
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 320, height: 320,
                border: '1px solid rgba(197,169,95,0.08)',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 420, height: 420,
                border: '1px solid rgba(197,169,95,0.04)',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              aria-hidden
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <img
                src="/ihkaam-logo.png"
                alt="نظام إحكام"
                loading="lazy"
                decoding="async"
                style={{
                  width    : '100%',
                  height   : '100%',
                  objectFit: 'cover',
                  filter   : 'drop-shadow(0 8px 40px rgba(0,0,0,0.60)) drop-shadow(0 0 28px rgba(26,148,155,0.22))',
                }}
                draggable={false}
              />
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}
