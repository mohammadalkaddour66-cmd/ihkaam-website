import { Link } from 'react-router-dom'
import { Mail, TrendingUp } from 'lucide-react'

/* ── Social SVG icons ─────────────────────────────────────────── */
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
  </svg>
)
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
)

/* ── Channel cards data ───────────────────────────────────────── */
const CHANNELS = [
  {
    id      : 'whatsapp',
    label   : 'واتساب',
    sublabel: 'تواصل معنا مباشرة',
    Icon    : WhatsAppIcon,
    color   : '#25D366',
    bg      : 'rgba(37,211,102,0.08)',
    border  : 'rgba(37,211,102,0.20)',
    href    : 'https://wa.me/963951590406?text=' + encodeURIComponent('السلام عليكم، أريد الاستفسار عن منصة إحكام'),
    soon    : false,
  },
  {
    id      : 'youtube',
    label   : 'يوتيوب',
    sublabel: 'قناتنا التعليمية',
    Icon    : YoutubeIcon,
    color   : '#FF0000',
    bg      : 'rgba(255,0,0,0.07)',
    border  : 'rgba(255,0,0,0.18)',
    href    : null, // ← ضع رابط القناة هنا
    soon    : true,
  },
  {
    id      : 'tiktok',
    label   : 'تيك توك',
    sublabel: 'محتوى قصير وسريع',
    Icon    : TikTokIcon,
    color   : '#69C9D0',
    bg      : 'rgba(105,201,208,0.07)',
    border  : 'rgba(105,201,208,0.18)',
    href    : null, // ← ضع رابط الحساب هنا
    soon    : true,
  },
  {
    id      : 'telegram',
    label   : 'تيليغرام',
    sublabel: 'قناة الأخبار والتحديثات',
    Icon    : TelegramIcon,
    color   : '#26A5E4',
    bg      : 'rgba(38,165,228,0.07)',
    border  : 'rgba(38,165,228,0.18)',
    href    : null, // ← ضع رابط القناة هنا
    soon    : true,
  },
  {
    id      : 'facebook',
    label   : 'فيسبوك',
    sublabel: 'صفحتنا الرسمية',
    Icon    : FacebookIcon,
    color   : '#1877F2',
    bg      : 'rgba(24,119,242,0.07)',
    border  : 'rgba(24,119,242,0.18)',
    href    : null, // ← ضع رابط الصفحة هنا
    soon    : true,
  },
  {
    id      : 'instagram',
    label   : 'انستغرام',
    sublabel: 'تابعنا على انستغرام',
    Icon    : InstagramIcon,
    color   : '#E1306C',
    bg      : 'rgba(225,48,108,0.07)',
    border  : 'rgba(225,48,108,0.18)',
    href    : null, // ← ضع رابط الحساب هنا
    soon    : true,
  },
]

/* ── Nav groups ───────────────────────────────────────────────── */
const navGroups = [
  {
    title: 'التنقل',
    links: [
      { label: 'الرئيسية',         to: '/'          },
      { label: 'منصة إحكام',       to: '/ihkaam'    },
      { label: 'تواصل معنا',       to: '/contact'   },
      { label: 'الدعم الفني',      to: '/help'      },
    ],
  },
  {
    title: 'المنصة',
    links: [
      { label: 'الميزات الأساسية', to: '/ihkaam#features' },
      { label: 'الوحدات الإضافية', to: '/ihkaam#addons'   },
      { label: 'الأسعار',          to: '/request'          },
      { label: 'الأسئلة الشائعة',  to: '/ihkaam#faq'      },
      { label: 'اترك تقييمك',      to: '/review'           },
    ],
  },
  {
    title: 'شركاء',
    links: [
      { label: 'التسويق بالعمولة', to: '/affiliate' },
      { label: 'المدونة',           to: '/blog'      },
    ],
  },
  {
    title: 'قانوني',
    links: [
      { label: 'سياسة الخصوصية', to: '/privacy' },
      { label: 'شروط الاستخدام', to: '/terms'   },
    ],
  },
]

const linkStyle = { color: '#3D5E55', transition: 'color 300ms' }

/* ── Channel card ─────────────────────────────────────────────── */
function ChannelCard({ ch }) {
  const Tag = ch.soon ? 'div' : 'a'
  const props = ch.soon
    ? {}
    : { href: ch.href, target: '_blank', rel: 'noopener noreferrer' }

  return (
    <Tag
      {...props}
      className="flex items-center gap-4 rounded-2xl px-5 py-4 group"
      style={{
        background     : ch.bg,
        border         : `1px solid ${ch.border}`,
        textDecoration : 'none',
        cursor         : ch.soon ? 'default' : 'pointer',
        transition     : 'all 0.22s ease',
        opacity        : ch.soon ? 0.55 : 1,
        position       : 'relative',
        overflow       : 'hidden',
      }}
      onMouseEnter={e => {
        if (!ch.soon) {
          e.currentTarget.style.background  = ch.bg.replace('0.08', '0.14').replace('0.07', '0.13')
          e.currentTarget.style.borderColor = ch.color + '55'
          e.currentTarget.style.transform   = 'translateY(-2px)'
          e.currentTarget.style.boxShadow   = `0 8px 28px ${ch.color}20`
        }
      }}
      onMouseLeave={e => {
        if (!ch.soon) {
          e.currentTarget.style.background  = ch.bg
          e.currentTarget.style.borderColor = ch.border
          e.currentTarget.style.transform   = 'translateY(0)'
          e.currentTarget.style.boxShadow   = 'none'
        }
      }}
    >
      {/* Icon */}
      <div style={{ color: ch.color, flexShrink: 0, lineHeight: 0 }}>
        <ch.Icon />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-0.5 text-right flex-1">
        <span style={{ color: '#EAE4DF', fontWeight: 700, fontSize: '0.88rem' }}>
          {ch.label}
        </span>
        <span style={{ color: '#5A8A78', fontSize: '0.72rem' }}>
          {ch.sublabel}
        </span>
      </div>

      {/* Soon badge or arrow */}
      {ch.soon ? (
        <span style={{
          background: 'rgba(229,211,179,0.10)',
          border    : '1px solid rgba(229,211,179,0.18)',
          color     : '#A6756A',
          fontSize  : '0.60rem',
          fontWeight: 700,
          padding   : '0.18rem 0.55rem',
          borderRadius: '999px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          قريباً
        </span>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={ch.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, opacity: 0.7 }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      )}
    </Tag>
  )
}

/* ── Main export ──────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer id="footer" className="relative z-10" style={{ borderTop: '1px solid rgba(2,115,104,0.15)' }}>
      <div style={{ background: 'rgba(1,20,20,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">

          {/* ── Social channels band ── */}
          <div className="mb-14">
            <p className="text-xs font-semibold tracking-[0.20em] uppercase text-center mb-6"
              style={{ color: '#3D5E55' }}>
              ابقَ على تواصل معنا
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3" dir="rtl">
              {CHANNELS.map(ch => <ChannelCard key={ch.id} ch={ch} />)}
            </div>
          </div>

          {/* Divider */}
          <div className="divider mb-10" />

          {/* ── Affiliate highlight ── */}
          <div className="mb-10">
            <Link
              to="/affiliate"
              className="flex items-center justify-between gap-4 rounded-2xl px-6 py-4"
              style={{
                background    : 'linear-gradient(135deg, rgba(0,168,150,0.08) 0%, rgba(2,115,104,0.13) 100%)',
                border        : '1px solid rgba(0,168,150,0.30)',
                textDecoration: 'none',
                transition    : 'border-color 220ms ease, background 220ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(0,168,150,0.55)'
                e.currentTarget.style.background  = 'linear-gradient(135deg, rgba(0,168,150,0.14) 0%, rgba(2,115,104,0.20) 100%)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(0,168,150,0.30)'
                e.currentTarget.style.background  = 'linear-gradient(135deg, rgba(0,168,150,0.08) 0%, rgba(2,115,104,0.13) 100%)'
              }}
            >
              <div dir="rtl" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,168,150,0.15)', border: '1px solid rgba(0,168,150,0.28)' }}>
                  <TrendingUp size={16} style={{ color: '#6ABDB2' }} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm" style={{ color: '#6ABDB2' }}>
                    برنامج شركاء إحكام (اربح معنا)
                  </span>
                  <span className="text-xs" style={{ color: '#5A8A78' }}>
                    انضم للبرنامج وابدأ بكسب عمولة على كل معهد تُحيله
                  </span>
                </div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#6ABDB2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, opacity: 0.8 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* ── Main footer grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">

            {/* Brand */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-md flex items-center justify-center text-[#012626] text-xs font-black"
                  style={{ background: '#6ABDB2' }}>
                  إ
                </span>
                <span className="text-sm font-bold tracking-wider" style={{ color: '#EAE4DF' }}>
                  إحكام
                </span>
              </Link>
              <p className="text-xs leading-relaxed mb-6 max-w-xs" style={{ color: '#5A8A78' }}>
                نظام سحابي لإدارة المعاهد القرآنية — يتولى الحضور والمحاسبة والجدولة والتقارير تلقائياً.
              </p>
              <a href="mailto:mohammadalkaddour66@gmail.com"
                className="flex items-center gap-2 text-xs transition-colors duration-300"
                style={{ color: '#5A8A78' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#D9ACA3')}
                onMouseLeave={e => (e.currentTarget.style.color = '#5A8A78')}>
                <Mail size={12} />
                mohammadalkaddour66@gmail.com
              </a>
            </div>

            {/* Link columns */}
            {navGroups.map(group => (
              <div key={group.title}>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-4"
                  style={{ color: '#A6756A' }}>
                  {group.title}
                </h4>
                <ul className="space-y-2.5">
                  {group.links.map(l => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-xs transition-colors duration-300"
                        style={linkStyle}
                        onMouseEnter={e => (e.currentTarget.style.color = '#D9ACA3')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#3D5E55')}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="divider mb-8" />

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px]" style={{ color: '#2E4A40' }}>
              © {new Date().getFullYear()} إحكام — جميع الحقوق محفوظة
            </p>
            {/* Social icon row */}
            <div className="flex items-center gap-2" dir="rtl">
              {CHANNELS.map(ch => {
                const Tag = ch.soon ? 'span' : 'a'
                const props = ch.soon ? {} : { href: ch.href, target: '_blank', rel: 'noopener noreferrer' }
                return (
                  <Tag key={ch.id} {...props}
                    aria-label={ch.label}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{
                      background : 'rgba(2,89,81,0.30)',
                      border     : '1px solid rgba(2,115,104,0.18)',
                      color      : ch.soon ? '#2A4A3A' : '#5A8A78',
                      cursor     : ch.soon ? 'default' : 'pointer',
                      opacity    : ch.soon ? 0.45 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!ch.soon) {
                        e.currentTarget.style.color       = ch.color
                        e.currentTarget.style.borderColor = ch.color + '55'
                        e.currentTarget.style.background  = ch.bg
                      }
                    }}
                    onMouseLeave={e => {
                      if (!ch.soon) {
                        e.currentTarget.style.color       = '#5A8A78'
                        e.currentTarget.style.borderColor = 'rgba(2,115,104,0.18)'
                        e.currentTarget.style.background  = 'rgba(2,89,81,0.30)'
                      }
                    }}>
                    <div style={{ transform: 'scale(0.55)', lineHeight: 0 }}>
                      <ch.Icon />
                    </div>
                  </Tag>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
