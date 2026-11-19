import { useState, useEffect } from 'react'
import { fetchPartnerRows, cleanPartners, titleOf } from '../../config/partners'
import { galleryImage } from '../../config/imageUrl'
import { useIsMobile } from '../../hooks/useIsMobile'

/* Below this count, a marquee looks sparse/awkward (too few logos to feel
   like a continuous strip) — show them as a simple static row instead. */
const MARQUEE_MIN_PARTNERS = 7

const STORAGE_BASE = 'https://kulpesdycuwdemjwzjyx.supabase.co/storage'

/* الترشيح (تجريبيّ، مكرَّر) ومصدر الصفوف في config/partners.js، مشتركان مع
   قصص النجاح (ISS-40). */


// الشعارات تُعرض بحجم 56px لكن ملفاتها الأصلية تصل إلى 173KB — نطلبها مُصغّرة
// من الخادم (‎render/image‎) فتنزل إلى بضعة كيلوبايتات، وهي تتكرر عشرات المرات في
// شريط الشركاء المتحرك.
function resolveLogoUrl(url) {
  return (url && url.startsWith(STORAGE_BASE)) ? galleryImage(url, 120) : null
}

function PartnerCard({ partner, decorative = false }) {
  const name    = titleOf(partner)
  const logoSrc = resolveLogoUrl(partner.theme_config?.logo_url || '')
  const raw     = partner.theme_config?.accent_color
  const accent  = raw && raw !== '#000000' ? raw : '#48D6CD'
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

  /* المتغيّر كان يُسمّى --accent، فيحجب رمز الهوية نفسه داخل شجرة
     البطاقة بلونٍ يأتي من theme_config لمعهدٍ آخر — أي أنّ أيّ
     استعمالٍ لـvar(--accent) يُضاف هنا لاحقاً سيرث لون شريكٍ لا لون
     إحكام. اسمٌ خاصّ يمنع التصادم. */
  return (
    <div className="ihk-partner-card" style={{ '--partner-accent': accent }}>
      <div className="ihk-avatar" style={{ borderColor: `${accent}35`, background: `${accent}12` }}>
        {logoSrc && imgOk
          ? <img src={logoSrc} alt={decorative ? '' : name} width={40} height={40} loading="lazy" decoding="async" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:10 }} />
          : <span aria-hidden="true" style={{ color: accent, fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>{Array.from((name || '').trim())[0] || 'إ'}</span>
        }
      </div>
      <span className="ihk-partner-name" dir="rtl">{name}</span>
    </div>
  )
}

function MarqueeRow({ partners, direction }) {
  const items    = [...partners, ...partners, ...partners]
  const duration = Math.max(16, partners.length * 2.5)
  return (
    <div className="ihk-marquee-vp">
      <div
        className={`ihk-marquee-track ihk-${direction}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {items.map((p, i) => (i < partners.length
          ? <PartnerCard key={i} partner={p} />
          : <div key={i} aria-hidden="true" style={{ display: 'contents' }}><PartnerCard partner={p} decorative /></div>))}
      </div>
    </div>
  )
}

/* Too few partners to marquee nicely — just lay them out, centered, no animation. */
function StaticRow({ partners }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-6">
      {partners.map(p => <PartnerCard key={p.institute_id} partner={p} />)}
    </div>
  )
}

export default function IhkaamPartners() {
  const [partners, setPartners] = useState([])
  const isMobile = useIsMobile()

  useEffect(() => {
    /* المصدر (المنظر public_partners أو institute_settings) يقرّره
       config/partners.js — انظر رأسه. */
    let cancelled = false
    fetchPartnerRows().then((rows) => { if (!cancelled) setPartners(cleanPartners(rows)) })
    return () => { cancelled = true }
  }, [])

  if (!partners.length) return null

  const useMarquee = partners.length >= MARQUEE_MIN_PARTNERS
  const mid  = Math.ceil(partners.length / 2)
  const row1 = partners.slice(0, mid)
  const row2 = partners.slice(mid).length >= 2 ? partners.slice(mid) : [...partners].reverse()

  return (
    <section className="relative z-10 py-14 overflow-hidden">
      {/* كان #1A949B — درجةٌ سابعةٌ من التركوازي لا وجود لها في
          :root، وهي لونُ حدودٍ لا لونُ نصّ. --text-3 مقيسٌ على 5:1 */}
      <p className="text-xs text-center mb-10 font-semibold tracking-[0.22em] uppercase" style={{ color: 'var(--text-3)' }}>
        شركاء النجاح
      </p>

      {!useMarquee ? (
        <StaticRow partners={partners} />
      ) : (
        <div className="flex flex-col gap-4">
          <MarqueeRow partners={isMobile ? partners : row1} direction="left" />
          {!isMobile && <MarqueeRow partners={row2} direction="right" />}
        </div>
      )}

      <style>{`
        /* direction:ltr على الحاوية لا على المسار وحده.

           المسار عرضه max-content (5505px) داخل حاوية 390px، والصفحة
           كلها RTL. وفي RTL يُسنَد الفائض إلى اليسار: يبدأ المسار عند
           390−5505 = −5115px قبل أن تعمل الحركة أصلاً. ثم تدفعه الحركة
           translateX(−33.3%) زيادةً 1835px لليسار، فيخرج آخر ما بقي من
           البطاقات عن الشاشة — فيظهر الشريط فارغاً تماماً.

           كان direction:ltr على المسار، وهو يضبط انسياب محتواه لا
           موضعه هو؛ فالموضع تحكمه الحاوية. وضْعه هنا يجعل المسار
           يبدأ من الحافة اليسرى (x=0) فتعمل الحركة كما صُمّمت.
           قياساً: البطاقات الظاهرة على الجوال 1 من 27 → 3، وعلى
           سطح المكتب 10 → 15. */
        .ihk-marquee-vp {
          overflow: hidden;
          width: 100%;
          direction: ltr;
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
          border: 1px solid rgba(72, 214, 205,0.12);
          background: rgba(9,32,30,0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          flex-shrink: 0;
          white-space: nowrap;
          cursor: default;
          transition: border-color 250ms ease, transform 250ms ease, box-shadow 250ms ease;
        }
        .ihk-partner-card:hover {
          border-color: color-mix(in srgb, var(--partner-accent) 45%, transparent);
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
          color: var(--text-2);
          white-space: nowrap;
        }
      `}</style>
    </section>
  )
}
