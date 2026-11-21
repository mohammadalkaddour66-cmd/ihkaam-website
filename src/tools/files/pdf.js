/* ══════════════════════════════════════════════════════════════════
   كاتب PDF صغير: كل صفحة صورة JPEG بملء الصفحة، وفوقها مناطق رابط قابلة
   للنقر (Link annotation). لا مكتبة: الشهادة مرسومة أصلاً على canvas بخط
   الموقع، فيكفي أن نضعها في صفحة A4 ونرسم فوق سطر «ihkaam.app» رابطاً حقيقياً.

   pages: [{ jpeg: Uint8Array, width, height (بكسل الصورة),
             links: [{ x, y, w, h, url }]  ← بكسل الصورة، الأصل أعلى اليسار }]
   pageSize: { w, h } بالنقطة (A4 أفقي = 841.89 × 595.28)
   ══════════════════════════════════════════════════════════════════ */
import { concat } from './zip.js'

export const A4_LANDSCAPE = { w: 841.89, h: 595.28 }
const enc = new TextEncoder()
const num = (n) => (Math.round(n * 100) / 100).toString()
const pdfString = (s) => '(' + String(s).replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7e]/g, '') + ')'

export function buildPdf(pages, { pageSize = A4_LANDSCAPE, title = '' } = {}) {
  const parts = []
  const offsets = []
  let size = 0
  const push = (x) => { const u = typeof x === 'string' ? enc.encode(x) : x; parts.push(u); size += u.length }
  const obj = (id, body) => { offsets[id] = size; push(`${id} 0 obj\n`); push(body); push('\nendobj\n') }

  push('%PDF-1.4\n')
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a])) // سطر تعليق ثنائي: يُعلم الأدوات أن الملف ثنائي

  /* المعرّفات: 1 الفهرس، 2 الصفحات، 3 المعلومات، ثم لكل صفحة: صفحة + محتوى + صورة + روابطها */
  let next = 4
  const pageIds = []
  const layout = pages.map((p) => {
    const ids = { page: next++, content: next++, image: next++, links: (p.links || []).map(() => next++) }
    pageIds.push(ids.page)
    return ids
  })
  const total = next

  obj(1, '<< /Type /Catalog /Pages 2 0 R >>')
  obj(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pageIds.map((i) => `${i} 0 R`).join(' ')}] >>`)
  obj(3, `<< /Producer (ihkaam.app tools)${title ? ` /Title ${pdfString(title)}` : ''} >>`)

  pages.forEach((p, i) => {
    const ids = layout[i]
    const { w: PW, h: PH } = pageSize
    const kx = PW / p.width
    const ky = PH / p.height
    obj(ids.page, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(PW)} ${num(PH)}] /Resources << /XObject << /Im0 ${ids.image} 0 R >> >> /Contents ${ids.content} 0 R${ids.links.length ? ` /Annots [${ids.links.map((l) => `${l} 0 R`).join(' ')}]` : ''} >>`)
    const content = `q ${num(PW)} 0 0 ${num(PH)} 0 0 cm /Im0 Do Q`
    obj(ids.content, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    /* الصورة: ترويسة ثم البايتات الخام */
    offsets[ids.image] = size
    push(`${ids.image} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`)
    push(p.jpeg)
    push('\nendstream\nendobj\n')
    ;(p.links || []).forEach((l, j) => {
      const x1 = l.x * kx
      const x2 = (l.x + l.w) * kx
      const y2 = PH - l.y * ky
      const y1 = PH - (l.y + l.h) * ky
      obj(ids.links[j], `<< /Type /Annot /Subtype /Link /Rect [${num(x1)} ${num(y1)} ${num(x2)} ${num(y2)}] /Border [0 0 0] /A << /S /URI /URI ${pdfString(l.url)} >> >>`)
    })
  })

  const xrefAt = size
  let xref = `xref\n0 ${total}\n0000000000 65535 f \n`
  for (let id = 1; id < total; id++) xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  push(xref)
  push(`trailer\n<< /Size ${total} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`)
  return concat(parts)
}
