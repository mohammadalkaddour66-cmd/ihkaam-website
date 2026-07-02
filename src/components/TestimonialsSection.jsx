import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../config/supabaseClient'

/* Colour palette cycled over DB rows (no colour stored in DB) */
const PALETTE = [
  { tagColor: 'rgba(2,115,104,0.18)',   tagText: '#6ABDB2', accentBorder: 'rgba(2,115,104,0.22)'   },
  { tagColor: 'rgba(217,172,163,0.12)', tagText: '#D9ACA3', accentBorder: 'rgba(217,172,163,0.20)' },
  { tagColor: 'rgba(166,117,106,0.12)', tagText: '#A6756A', accentBorder: 'rgba(166,117,106,0.20)' },
]

/* Map a DB row → card shape */
function toCard(row, idx) {
  const palette = PALETTE[idx % PALETTE.length]
  return {
    name        : row.client_name  || '—',
    role        : row.client_role  || '—',
    tag         : row.service_type || '—',
    text        : row.content      || '—',
    ...palette,
  }
}

/* ─── Inline quote SVG ─────────────────────────────────────────── */
const QuoteIcon = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.95.78-3 .53-.79 1.17-1.44 1.91-1.95L8.29 6.53C7.13 7.28 6.17 8.25 5.4 9.44c-.78 1.2-1.17 2.47-1.17 3.83 0 1.32.43 2.4 1.3 3.22.86.82 1.9 1.23 3.1 1.23 1.06 0 1.94-.34 2.64-1.02.7-.68 1.05-1.54 1.05-2.6l-.14.64zm8.56 0c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.95.78-3 .53-.79 1.17-1.44 1.91-1.95l-1.03-1.52c-1.16.75-2.12 1.72-2.89 2.91-.78 1.2-1.17 2.47-1.17 3.83 0 1.32.43 2.4 1.3 3.22.86.82 1.9 1.23 3.1 1.23 1.06 0 1.94-.34 2.64-1.02.7-.68 1.05-1.54 1.05-2.6l-.14.64z"/>
  </svg>
)

/* ─── Initials avatar ──────────────────────────────────────────── */
function Avatar({ name }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black select-none flex-shrink-0"
      style={{ background: 'rgba(217,172,163,0.15)', color: '#D9ACA3', border: '1px solid rgba(217,172,163,0.25)' }}
    >
      {initials}
    </div>
  )
}

/* ─── Card ─────────────────────────────────────────────────────── */
function TestimonialCard({ t }) {
  return (
    <div
      className="relative rounded-3xl p-8 flex flex-col gap-6 text-start shadow-xl transition-all duration-500"
      style={{
        background          : 'rgba(2,89,81,0.18)',
        border              : `1px solid ${t.accentBorder}`,
        backdropFilter      : 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform   = 'translateY(-4px)'
        e.currentTarget.style.boxShadow   = '0 20px 60px rgba(1,10,10,0.45)'
        e.currentTarget.style.borderColor = t.tagText + '44'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = 'translateY(0)'
        e.currentTarget.style.boxShadow   = ''
        e.currentTarget.style.borderColor = t.accentBorder
      }}
    >
      {/* Quote icon */}
      <div className="absolute top-7 start-7 opacity-25">
        <QuoteIcon color={t.tagText} />
      </div>

      {/* Tag */}
      <span
        className="self-end text-[10px] font-semibold px-3 py-1 rounded-full"
        style={{ background: t.tagColor, color: t.tagText }}
      >
        {t.tag}
      </span>

      {/* Quote text */}
      <p
        className="text-sm leading-[2.1] flex-1"
        style={{ color: '#daffde' }}
      >
        {t.text}
      </p>

      {/* Divider */}
      <div className="divider" />

      {/* Author */}
      <div className="flex items-center gap-4">
        <Avatar name={t.name} />
        <div className="flex flex-col gap-0.5 text-start">
          <span className="text-sm font-bold" style={{ color: '#D9ACA3' }}>
            {t.name}
          </span>
          <span className="text-xs" style={{ color: '#5A8A78' }}>
            {t.role}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Loading skeleton ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="rounded-3xl p-8 flex flex-col gap-6"
      style={{
        background: 'rgba(2,89,81,0.10)',
        border    : '1px solid rgba(2,115,104,0.10)',
      }}
    >
      <div className="self-end h-5 w-28 rounded-full animate-pulse" style={{ background: 'rgba(217,172,163,0.10)' }} />
      <div className="flex flex-col gap-2.5 flex-1">
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', width: '92%' }} />
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', width: '80%' }} />
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', width: '87%' }} />
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', width: '65%' }} />
      </div>
      <div className="h-px" style={{ background: 'rgba(217,172,163,0.08)' }} />
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full animate-pulse" style={{ background: 'rgba(217,172,163,0.10)' }} />
        <div className="flex flex-col gap-1.5 text-start">
          <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: 'rgba(217,172,163,0.10)' }} />
          <div className="h-2.5 w-32 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Section ──────────────────────────────────────────────────── */
export default function TestimonialsSection() {
  const [cards,   setCards]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApproved() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('client_name, client_role, service_type, content')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })

        if (error) throw error
        setCards(data ? data.map(toCard) : [])
      } catch {
        setCards([])
      } finally {
        setLoading(false)
      }
    }
    fetchApproved()
  }, [])

  if (!loading && cards.length === 0) return null

  return (
    <section id="testimonials" className="relative z-10 py-28">

      {/* Teal glow — top right */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px]"
        style={{
          background: 'radial-gradient(circle at top right, rgba(2,115,104,0.08) 0%, transparent 65%)',
        }}
        aria-hidden
      />
      {/* Rose glow — bottom left */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px]"
        style={{
          background: 'radial-gradient(circle at bottom left, rgba(166,117,106,0.07) 0%, transparent 65%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
            style={{ color: '#A6756A' }}
          >
            شهادات العملاء
          </span>
          <h2
            className="font-black leading-tight mb-5 mx-auto"
            style={{
              color   : '#F0E8E5',
              fontSize: 'clamp(1.7rem, 3.5vw, 2.7rem)',
              maxWidth: '680px',
            }}
          >
            شركاء النجاح..{' '}
            <span className="text-rose-grad">شهادات تصنع الفارق</span>
          </h2>
          <p
            className="text-sm leading-[2] mx-auto"
            style={{ color: '#7A9E96', maxWidth: '560px' }}
          >
            قصص حقيقية لمؤسسات استردت وقتها ومالها وتحولت إلى الأنظمة الرقمية الذكية.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading
            ? [0, 1].map(i => <SkeletonCard key={i} />)
            : cards.map((t, i) => <TestimonialCard key={t.name + i} t={t} />)
          }
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-sm mb-5" style={{ color: '#5A8A78' }}>
            هل استفدت من نظام إحكام؟
          </p>
          <Link
            to="/review"
            className="inline-flex items-center gap-2.5 rounded-xl font-bold transition-all duration-250"
            style={{
              fontSize  : '0.9rem',
              padding   : '0.85rem 2rem',
              color     : '#D9ACA3',
              background: 'rgba(217,172,163,0.08)',
              border    : '1px solid rgba(217,172,163,0.22)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = 'rgba(217,172,163,0.14)'
              e.currentTarget.style.borderColor = 'rgba(217,172,163,0.40)'
              e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(217,172,163,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = 'rgba(217,172,163,0.08)'
              e.currentTarget.style.borderColor = 'rgba(217,172,163,0.22)'
              e.currentTarget.style.boxShadow   = 'none'
            }}
          >
            شاركنا تجربتك
          </Link>
        </div>

      </div>
    </section>
  )
}
