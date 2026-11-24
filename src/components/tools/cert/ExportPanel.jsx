import { Loader2, FileDown, ImageDown, Printer, Share2, AlertTriangle } from 'lucide-react'

const big = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-bold cursor-pointer min-h-[50px] disabled:opacity-50 disabled:cursor-not-allowed w-full'
const soft = { background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }

/* الخطوة 5: التحميل. ملف واحد لكل الشهادات، وأدوات الشهادة المعروضة وحدها (صورة، طباعة، مشاركة). */
export default function ExportPanel({ count, blocked, busy, progress, onPdf, onCancel, onPng, onPrint, onShare, sharable, msg, currentName }) {
  const pct = progress ? Math.round((progress.done / progress.total) * 100) : 0
  return (
    <div className="space-y-5">
      <div>
        <button type="button" disabled={!!busy || !count || blocked.length > 0} onClick={onPdf} className={big + ' btn-cta'}>
          {busy === 'pdf' ? <Loader2 size={17} className="animate-spin" /> : <FileDown size={17} />}
          {!count ? 'اكتب اسم طالب أولاً' : blocked.length ? 'اعتمد صيغة الطالبات أولاً' : count === 1 ? 'حمّل الشهادة PDF' : `حمّل ${count} شهادات في ملف PDF واحد`}
        </button>
        {blocked.length > 0 && (
          <p className="flex items-start gap-1.5 text-[12.5px] leading-[1.7] font-bold text-[#8A4B14] mt-2">
            <AlertTriangle size={14} className="mt-1 shrink-0" />
            نص الطالبات ينتظر «تمام» في خطوة الصياغة، حتى لا تُطبع شهادة طالبة بضمير الطلاب.
          </p>
        )}
        {progress && (
          <div className="mt-3">
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#F1ECDF' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#B8863A' }} />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[12.5px] font-bold text-[#4A5D56]">
              <span>يُرسَم {progress.done} من {progress.total}…</span>
              <button type="button" onClick={onCancel} className="text-[#9A3B2E] cursor-pointer min-h-[32px] px-2">إلغاء</button>
            </div>
          </div>
        )}
        <p className="text-[12.5px] leading-[1.7] text-[#5E6E67] mt-2.5" aria-live="polite">
          {msg || 'صفحة A4 أفقية لكل طالب، جاهزة للطباعة. يُرسَم كل شيء في متصفحك ولا تُرسَل الأسماء إلى أي خادم.'}
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-[13.5px] font-bold text-[#1A2E28]">الشهادة المعروضة{currentName ? ` (${currentName})` : ''}</div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={!!busy} onClick={onPng} className={big} style={soft}>{busy === 'png' ? <Loader2 size={17} className="animate-spin" /> : <ImageDown size={17} />} صورة PNG</button>
          <button type="button" disabled={!!busy} onClick={onPrint} className={big} style={soft}>{busy === 'print' ? <Loader2 size={17} className="animate-spin" /> : <Printer size={17} />} اطبعها</button>
        </div>
        {sharable && <button type="button" disabled={!!busy} onClick={onShare} className={big} style={soft}>{busy === 'share' ? <Loader2 size={17} className="animate-spin" /> : <Share2 size={17} />} شارك الصورة (واتساب وغيره)</button>}
      </div>
    </div>
  )
}
