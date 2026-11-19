import { useState, useEffect } from 'react'
import { galleryImage } from '../../config/imageUrl'

/* ══════════════════════════════════════════════════════════════════
   علامة المعهد: شعاره إن رفعه، وإلا «طُغراء» نصّية (2026-11-19 ب)

   كان البديل نجمةً ثمانية بخطٍّ ذهبيّ والكلمة فوقها؛ فخطوط النجمة
   تقطع الحروف ويبدو الختم مزدحماً (ملاحظة المالك). صار قرصاً بالحبر
   الأخضر وحلقةٍ ذهبية رفيعة في داخله، والكلمة المميِّزة من الاسم
   بالكريمي وحدها في الوسط، لا شيء يمرّ فوقها. حجم الخط يتبع طول
   الكلمة فلا تنكسر على أكثر من سطرين.

   مشترك بين «شركاء النجاح» و«أرقام كل معهد».
   ══════════════════════════════════════════════════════════════════ */

const STORAGE_BASE = 'https://kulpesdycuwdemjwzjyx.supabase.co/storage'
const GENERIC = /^(معهد|جامع|مسجد|مركز|حلقة|حلقات|دار)\s+/

function resolveLogoUrl(url, width = 120) {
  return (url && url.startsWith(STORAGE_BASE)) ? galleryImage(url, width) : null
}

function sealWord(name) {
  let w = (name || '').replace(/\s+/g, ' ').trim()
  while (GENERIC.test(w)) w = w.replace(GENERIC, '')
  w = w.replace(/\(.*?\)/g, '').trim()
  const parts = w.split(' ')
  /* «بلال بن رباح» لا «بلال بن»: الكلمة الثانية نسبٌ فتؤخذ الثالثة معها */
  const take = /^(بن|ابن|أبي|ابي|أبو|ابو)$/.test(parts[1] || '') ? 3 : 2
  return parts.slice(0, take).join(' ')
}

function useLogo(src) {
  const [ok, setOk] = useState(false)
  const [last, setLast] = useState(src)
  if (src !== last) { setLast(src); setOk(false) }
  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.onload = () => setOk(true)
    img.onerror = () => setOk(false)
    img.src = src
  }, [src])
  return ok
}

/* size بالبكسل: القرص مربّع */
export default function InstituteMark({ name, logoUrl, size = 112 }) {
  const src = resolveLogoUrl(logoUrl, size > 80 ? 160 : 96)
  const ok  = useLogo(src)

  if (src && ok) {
    return <img src={src} alt={name} width={size} height={size} loading="lazy" decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  }

  const word = sealWord(name)
  const len  = word.replace(/\s/g, '').length
  const fs   = (len <= 4 ? 0.3 : len <= 7 ? 0.22 : len <= 10 ? 0.18 : 0.15) * size

  return (
    <span aria-label={name} role="img"
      style={{
        position: 'relative', width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', borderRadius: 999,
        background: 'radial-gradient(circle at 32% 26%, #1A5546 0%, #0B3B33 58%, #082C26 100%)',
      }}>
      <span aria-hidden style={{
        position: 'absolute', inset: size * 0.07, borderRadius: 999,
        boxShadow: 'inset 0 0 0 1px rgba(224,181,98,0.55)',
      }} />
      <span style={{
        position: 'relative', maxWidth: '68%', textAlign: 'center',
        fontSize: fs, lineHeight: 1.25, fontWeight: 700, color: '#F8F5EC',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {word}
      </span>
    </span>
  )
}
