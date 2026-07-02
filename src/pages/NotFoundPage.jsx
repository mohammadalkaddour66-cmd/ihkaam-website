import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <section
      className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 text-center"
      dir="rtl"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]"
        style={{ background: 'radial-gradient(ellipse, rgba(2,115,104,0.07) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-6">

        {/* 404 number */}
        <span
          className="font-black select-none"
          style={{
            fontSize  : 'clamp(6rem, 18vw, 11rem)',
            lineHeight: 1,
            color     : 'transparent',
            WebkitTextStroke: '2px rgba(2,115,104,0.35)',
            letterSpacing   : '0.05em',
          }}
        >
          404
        </span>

        {/* Label chip */}
        <span
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold tracking-widest uppercase"
          style={{
            background: 'rgba(217,172,163,0.10)',
            border    : '1px solid rgba(217,172,163,0.28)',
            color     : '#D9ACA3',
          }}
        >
          الصفحة غير موجودة
        </span>

        <h1
          className="font-black"
          style={{
            color   : '#EAE4DF',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          }}
        >
          يبدو أن هذا الرابط لا يؤدي لمكان
        </h1>

        <p
          className="text-sm max-w-sm"
          style={{ color: '#5A8A78', lineHeight: 1.9 }}
        >
          الصفحة التي تبحث عنها ربما حُذفت أو تغيّر عنوانها. يمكنك العودة للرئيسية أو التواصل معنا.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            to="/"
            className="btn-cta inline-flex items-center gap-2.5 rounded-xl"
            style={{ fontSize: '0.95rem', padding: '0.85rem 2rem' }}
          >
            العودة للرئيسية
            <ArrowLeft size={15} />
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-colors duration-300"
            style={{
              color     : '#7A9E96',
              background: 'rgba(2,89,81,0.18)',
              border    : '1px solid rgba(2,115,104,0.22)',
              padding   : '0.85rem 1.6rem',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#EAE4DF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#7A9E96')}
          >
            تواصل معنا
          </Link>
        </div>

      </div>
    </section>
  )
}
