import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { durationLabel } from '../../data/videos'

/* ══════════════════════════════════════════════════════════════════
   تضمين يوتيوب خفيف (Lazy YouTube Embed)

   قبل النقر: رابطٌ عاديّ إلى الفيديو على يوتيوب فيه غلافٌ مستضاف عندنا
   (public/video/*.webp) وزر تشغيل. لا iframe ولا طلب إلى يوتيوب ولا
   سكربت، فلا يمسّ LCP ولا CLS (للغلاف width وheight ونسبة ثابتة).
   وإن تعطّل JavaScript بقي رابطاً يفتح الفيديو على يوتيوب.

   عند النقر: يستبدل الرابطَ iframe من youtube-nocookie.com (لا يضع
   كوكيز قبل التشغيل) ويبدأ التشغيل فوراً، وينتقل التركيز إليه.
   السياسة CSP تسمح بهذا النطاق وحده (frame-src في public/_headers).

   data-video-id يقرؤه audit-seo.mjs: كل فيديو ظاهر له VideoObject.
   ══════════════════════════════════════════════════════════════════ */

const NOCOOKIE = 'https://www.youtube-nocookie.com/embed/'

export default function LiteYouTube({ video, className = '' }) {
  const [on, setOn] = useState(false)
  const frame = useRef(null)

  useEffect(() => { if (on) frame.current?.focus() }, [on])

  const label = `تشغيل الفيديو: ${video.name} (${durationLabel(video.seconds)})`

  return (
    <div
      data-video-id={video.id}
      className={`relative w-full overflow-hidden rounded-[22px] bg-[#0B3B33] ${className}`}
      style={{ aspectRatio: '16 / 9', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}
    >
      {on ? (
        <iframe
          ref={frame}
          src={`${NOCOOKIE}${video.id}?autoplay=1&rel=0&hl=ar&playsinline=1`}
          title={video.name}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <a
          href={video.watchUrl}
          target="_blank"
          rel="noopener"
          aria-label={label}
          onClick={(e) => {
            /* نقرة وسطى أو مع Ctrl/⌘ تفتح يوتيوب كما اعتاد الزائر */
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
            e.preventDefault()
            setOn(true)
          }}
          className="group absolute inset-0 block cursor-pointer"
        >
          <img
            src={video.poster}
            alt=""
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 grid h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20"
            style={{ background: '#0B3B33', color: '#E0B562', boxShadow: '0 12px 30px -8px rgba(8,44,38,0.55), 0 0 0 6px rgba(248,245,236,0.55)' }}
          >
            <Play size={30} fill="currentColor" strokeWidth={0} style={{ transform: 'translateX(3px)' }} />
          </span>
          <span
            className="absolute bottom-3 left-3 rounded-full px-3 py-1 text-[12px] font-bold tabular-nums"
            style={{ background: 'rgba(8,44,38,0.82)', color: '#F8F5EC' }}
          >
            {durationLabel(video.seconds)}
          </span>
        </a>
      )}
    </div>
  )
}
