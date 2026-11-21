/* ملف PDF للشهادات: صفحة A4 أفقية لكل شهادة، ورابط إحكام فيها قابل للنقر.
   الرسم في المتصفح كله. للدفعات الكبيرة تُصغَّر الصفحة إلى 150 نقطة في البوصة
   حتى لا يتضخم الملف (200 شهادة ≈ 40–50 م.ب. بدل 120). */
import { drawCertificate, CERT_W, CERT_H } from './certificate'
import { canvasToBlob } from './canvasKit'
import { buildPdf } from '../../tools/files/pdf.js'
import { TOOL_CREDIT_URL } from '../../config/tools'

const tick = () => new Promise((r) => setTimeout(r, 0))

export async function certificatesPdf(optsList, { scale = 1, quality = 0.9, title = 'شهادات', onProgress, isCancelled } = {}) {
  const work = document.createElement('canvas')
  const small = scale === 1 ? null : document.createElement('canvas')
  const pages = []
  for (let i = 0; i < optsList.length; i++) {
    if (isCancelled?.()) throw new Error('cancelled')
    const { link } = await drawCertificate(work, optsList[i])
    let cv = work
    if (small) {
      small.width = Math.round(CERT_W * scale)
      small.height = Math.round(CERT_H * scale)
      const sctx = small.getContext('2d')
      sctx.imageSmoothingQuality = 'high'
      sctx.drawImage(work, 0, 0, small.width, small.height)
      cv = small
    }
    const blob = await canvasToBlob(cv, 'image/jpeg', quality)
    const jpeg = new Uint8Array(await blob.arrayBuffer())
    pages.push({
      jpeg, width: cv.width, height: cv.height,
      links: [{ x: link.x * scale, y: link.y * scale, w: link.w * scale, h: link.h * scale, url: TOOL_CREDIT_URL }],
    })
    onProgress?.(i + 1, optsList.length)
    await tick()
  }
  return new Blob([buildPdf(pages, { title })], { type: 'application/pdf' })
}
