import { useState } from 'react'
import { Printer, FileDown, ImageDown, Share2, Loader2 } from 'lucide-react'
import { canvasToBlob, saveBlob, shareBlob } from './canvasKit'
import { useCanShareFiles } from './hooks'

/* أزرار المخرَج الثلاثة: طباعة A4، وPDF (نافذة الطباعة نفسها)، وصورة لواتساب.
   makeImage يعيد canvas؛ على الهاتف تُفتح المشاركة مباشرة، وعلى الحاسوب تُحمَّل. */
export default function ResultActions({ onPrint, makeImage, imageName, imageLabel = 'صورة لواتساب', printLabel = 'اطبع الجدول', shareText, disabled }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function image(share) {
    if (!makeImage || busy) return
    setBusy(true)
    setMsg('')
    try {
      const cv = await makeImage()
      const blob = await canvasToBlob(cv, 'image/png')
      if (share) {
        try { await shareBlob(blob, imageName, shareText) } catch (e) { if (e?.name !== 'AbortError') saveBlob(blob, imageName) }
      } else {
        saveBlob(blob, imageName)
        setMsg('حُفظت الصورة في مجلد التنزيلات.')
      }
    } catch {
      setMsg('تعذّر إنشاء الصورة. جرّب مرة أخرى.')
    } finally {
      setBusy(false)
    }
  }

  const sharable = useCanShareFiles()
  const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-bold cursor-pointer transition-colors min-h-[46px] disabled:opacity-50 disabled:cursor-not-allowed'
  const soft = { background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button type="button" disabled={disabled} onClick={onPrint} className={btn + ' btn-cta'}>
          <Printer size={17} /> {printLabel}
        </button>
        <button type="button" disabled={disabled} onClick={onPrint} className={btn} style={soft}
          title="في نافذة الطباعة اختر «حفظ بتنسيق PDF»">
          <FileDown size={17} /> احفظ PDF
        </button>
        {makeImage && (
          <button type="button" disabled={disabled || busy} onClick={() => image(sharable)} className={btn} style={soft}>
            {busy ? <Loader2 size={17} className="animate-spin" /> : sharable ? <Share2 size={17} /> : <ImageDown size={17} />}
            {imageLabel}
          </button>
        )}
      </div>
      <p className="text-[12.5px] text-[#5E6E67] mt-2 leading-[1.7]" aria-live="polite">
        {msg || 'لحفظ PDF: اختر «حفظ بتنسيق PDF» في نافذة الطباعة بدل الطابعة.'}
      </p>
    </div>
  )
}
