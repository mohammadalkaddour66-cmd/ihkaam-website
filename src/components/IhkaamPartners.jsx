import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'

const STORAGE_BASE = 'https://kulpesdycuwdemjwzjyx.supabase.co/storage'

function normAr(s) {
  return s.replace(/[أإآٱ]/g, 'ا').replace(/[ً-ٰٟ]/g, '').toLowerCase().trim()
}

function isExcluded(p) {
  const id    = (p.institute_id || '').toLowerCase().trim()
  const title = normAr(p.theme_config?.app_title || p.name || p.institute_id || '')
  if (['ihkam', 'demo', 'superadmin', 'test', 'system'].some(k => id.includes(k))) return true
  if (title.includes('احكام')) return true
  return false
}

function resolveLogoUrl(url) {
  return (url && url.startsWith(STORAGE_BASE)) ? url : null
}

function getInitials(t) {
  if (!t) return '؟'
  const w = t.trim().split(/\s+/).filter(Boolean)
  return w.length === 1 ? w[0][0] : w[0][0] + w[w.length - 1][0]
}

function PartnerCard({ partner }) {
  const name    = partner.theme_config?.app_title || partner.name || partner.institute_id
  const logoSrc = resolveLogoUrl(partner.theme_config?.logo_url || '')
  const raw     = partner.theme_config?.accent_color
  const accent  = raw && raw !== '#000000' ? raw : '#00A896'
  const [imgOk, setImgOk] = useState(false)

  /* reset the "loaded" flag when the logo url changes (adjusting state during render) */
  const [lastLogoSrc, setLastLogoSrc] = useState(logoSrc)
  if (logoSrc !== lastLogoSrc) {
    setLastLogoSrc(logoSrc)
    setImgOk(false)
  }

  useEffect(() => {
    if (!logoSrc) return
    const img = new Image()
    img.onload  = () => setImgOk(true)
    img.onerror = () => setImgOk(false)
    img.src = logoSrc
  }, [logoSrc])

  return (
    <div className="ihk-partner-card" style={{ '--accent': accent }}>
      <div className="ihk-avatar" style={{ borderColor: `${accent}35`, background: `${accent}12` }}>
        {logoSrc && imgOk
          ? <img src={logoSrc} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:10 }} />
          : <span style={{ color: accent, fontWeight: 900, fontSize: '1rem' }}>{getInitials(name)}</span>
        }
      </div>
      <span className="ihk-partner-name" dir="rtl">{name}</span>
    </div>
  )
}

function MarqueeRow({ partners, direction }) {
  const items    = [...partners, ...partners, ...partners]
  const duration = Math.max(30, partners.length * 4)
  return (
    <div className="ihk-marquee-vp">
      <div
        className={`ihk-marquee-track ihk-${direction}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {items.map((p, i) => <PartnerCard key={i} partner={p} />)}
      </div>
    </div>
  )
}

export default function IhkaamPartners() {
  const [partners, setPartners] = useState([])

  useEffect(() => {
    supabase
      .from('institute_settings')
      .select('institute_id, name, theme_config')
      .eq('is_deleted', false)
      .then(({ data }) => {
        if (!data) return
        setPartners(data.filter(p => !isExcluded(p)))
      })
  }, [])

  if (!partners.length) return null

  const mid  = Math.ceil(partners.length / 2)
  const row1 = partners.slice(0, mid)
  const row2 = partners.slice(mid).length >= 2 ? partners.slice(mid) : [...partners].reverse()

  return (
    <section className="relative z-10 py-14 overflow-hidden">
      <p className="text-xs text-center mb-10 font-semibold tracking-[0.22em] uppercase" style={{ color: '#4A7A72' }}>
        شركاء النجاح
      </p>

      <div className="flex flex-col gap-4">
        <MarqueeRow partners={row1} direction="left"  />
        <MarqueeRow partners={row2} direction="right" />
      </div>

      <style>{`
        .ihk-marquee-vp {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .ihk-marquee-track {
          display: flex;
          direction: ltr;
          width: max-content;
          will-change: transform;
          gap: 12px;
          padding: 4px 0;
        }
        .ihk-marquee-vp:hover .ihk-marquee-track { animation-play-state: paused; }

        @keyframes ihk-scroll-left  { from { transform: translateX(0); }        to { transform: translateX(-33.333%); } }
        @keyframes ihk-scroll-right { from { transform: translateX(-33.333%); } to { transform: translateX(0); } }

        .ihk-left  { animation: ihk-scroll-left  linear infinite; }
        .ihk-right { animation: ihk-scroll-right linear infinite; }

        .ihk-partner-card {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.72rem 1.1rem;
          border-radius: 16px;
          border: 1px solid rgba(106,189,178,0.12);
          background: rgba(1,26,26,0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          flex-shrink: 0;
          white-space: nowrap;
          cursor: default;
          transition: border-color 250ms ease, transform 250ms ease, box-shadow 250ms ease;
        }
        .ihk-partner-card:hover {
          border-color: color-mix(in srgb, var(--accent) 45%, transparent);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.28);
        }

        .ihk-avatar {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 10px;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .ihk-partner-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #C8B8B0;
          white-space: nowrap;
        }
      `}</style>
    </section>
  )
}
