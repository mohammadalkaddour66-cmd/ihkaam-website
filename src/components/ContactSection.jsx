import { Mail, ArrowLeft, Clock, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const WA_HREF = 'https://wa.me/963951590406'
const MAIL_HREF = 'mailto:mohammadalkaddour66@gmail.com?subject=' +
  encodeURIComponent('استفسار عن منصة إحكام') +
  '&body=' + encodeURIComponent('السلام عليكم،\n\nأريد الاستفسار عن...')

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function ContactSection() {
  return (
    <section
      id="contact"
      dir="rtl"
      className="relative z-10 min-h-screen flex items-center justify-center py-28 px-6"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div style={{ position:'absolute', bottom:0, right:0, width:480, height:480,
          background:'radial-gradient(circle at bottom right, rgba(2,115,104,0.10) 0%, transparent 65%)' }} />
        <div style={{ position:'absolute', top:0, left:0, width:380, height:380,
          background:'radial-gradient(circle at top left, rgba(166,117,106,0.07) 0%, transparent 65%)' }} />
      </div>

      <div className="relative w-full max-w-lg mx-auto text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
          style={{ background:'rgba(2,115,104,0.12)', border:'1px solid rgba(2,115,104,0.25)' }}>
          <MessageCircle size={26} style={{ color:'#6ABDB2' }} />
        </div>

        {/* Eyebrow */}
        <span className="text-xs font-semibold tracking-[0.22em] uppercase block mb-4"
          style={{ color:'#A6756A' }}>
          تواصل معنا
        </span>

        {/* Heading */}
        <h1 className="font-black leading-tight mb-5"
          style={{ color:'#F0E8E5', fontSize:'clamp(1.8rem,4vw,2.6rem)' }}>
          بماذا يمكن أن{' '}
          <span style={{ color:'#D9ACA3' }}>نخدمكم؟</span>
        </h1>

        {/* Sub */}
        <p className="text-sm leading-[1.9] mb-10 mx-auto"
          style={{ color:'#7A9E96', maxWidth:420 }}>
            لديكم سؤال عن المنصة؟
          فريقنا حاضر ويسعده التواصل معكم.
        </p>

        {/* ── Primary: WhatsApp ── */}
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full font-bold rounded-2xl transition-all duration-300"
          style={{
            padding   : '1.1rem 2rem',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color     : '#fff',
            fontSize  : '0.95rem',
            boxShadow : '0 4px 24px rgba(37,211,102,0.15)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 36px rgba(37,211,102,0.30)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,211,102,0.15)'
          }}
        >
          <WhatsAppIcon />
          راسلنا على واتساب 
        </a>

        {/* Response time badge */}
        <div className="flex items-center justify-center gap-1.5 mt-3 mb-8">
          <Clock size={11} style={{ color:'#2E6050' }} />
          <span className="text-xs" style={{ color:'#2E6050' }}>
           سيتم الرد عليكم في اقرب وقت ممكن (عادةً خلال 24 ساعة)
          </span>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ background:'rgba(2,115,104,0.15)' }} />
          <span className="text-xs" style={{ color:'#2E5050' }}>أو عبر البريد (ردّ خلال 48 ساعة)</span>
          <div className="flex-1 h-px" style={{ background:'rgba(2,115,104,0.15)' }} />
        </div>

        {/* ── Secondary: Email ── */}
        <a
          href={MAIL_HREF}
          className="flex items-center justify-center gap-2.5 w-full font-semibold rounded-2xl transition-all duration-300"
          style={{
            padding   : '0.9rem 2rem',
            background: 'rgba(217,172,163,0.06)',
            border    : '1px solid rgba(217,172,163,0.20)',
            color     : '#C4A898',
            fontSize  : '0.88rem',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background  = 'rgba(217,172,163,0.12)'
            e.currentTarget.style.borderColor = 'rgba(217,172,163,0.38)'
            e.currentTarget.style.transform   = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = 'rgba(217,172,163,0.06)'
            e.currentTarget.style.borderColor = 'rgba(217,172,163,0.20)'
            e.currentTarget.style.transform   = 'translateY(0)'
          }}
        >
          <Mail size={15} />
          مراسلتنا عبر البريد الإلكتروني
        </a>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px" style={{ background:'rgba(2,115,104,0.10)' }} />
          <span className="text-xs" style={{ color:'#2E5050' }}>أو</span>
          <div className="flex-1 h-px" style={{ background:'rgba(2,115,104,0.10)' }} />
        </div>

        {/* ── Tertiary: Explore ── */}
        <Link
          to="/ihkaam"
          className="flex items-center justify-center gap-2 w-full font-semibold text-sm rounded-2xl transition-all duration-300"
          style={{
            padding   : '0.9rem 2rem',
            border    : '1px solid rgba(2,115,104,0.28)',
            color     : '#6ABDB2',
            background: 'rgba(2,115,104,0.05)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(2,115,104,0.55)'
            e.currentTarget.style.background  = 'rgba(2,115,104,0.10)'
            e.currentTarget.style.transform   = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(2,115,104,0.28)'
            e.currentTarget.style.background  = 'rgba(2,115,104,0.05)'
            e.currentTarget.style.transform   = 'translateY(0)'
          }}
        >
          اكتشف منصة إحكام أولاً
          <ArrowLeft size={14} />
        </Link>

      </div>
    </section>
  )
}
