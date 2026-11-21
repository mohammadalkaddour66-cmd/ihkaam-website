import { useRef, useState } from 'react'
import { FileSpreadsheet, Upload, Download, Plus, Trash2, Eye, ClipboardPaste, Loader2 } from 'lucide-react'
import { TextArea, Select } from './controls'
import { saveBlob } from './canvasKit'
import { parseStudentsFile, parseStudentsText, sampleXlsx, MAX_STUDENTS } from '../../tools/files/bulk.js'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const cell = 'w-full bg-transparent outline-none text-[14px] text-[#1A2E28] py-2 px-2 rounded-lg focus:shadow-[inset_0_0_0_1.5px_#1F6F52]'
const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold cursor-pointer min-h-[44px] disabled:opacity-50'
const soft = { background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }

/* التوليد الجماعي: قائمة الطلاب من ملف Excel/CSV أو لصق، ثم جدول يُعدَّل مباشرة.
   students: [{ name, ach, gender }] — gender: '' (يتبع الاختيار العام) أو 'm' أو 'f'. */
export default function CertBulk({ students, setStudents, previewIdx, setPreviewIdx }) {
  const [paste, setPaste] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  function addStudents(list, replace = false) {
    if (!list.length) { setMsg('لم أجد أسماء. اكتب كل اسم في سطر، أو ضعه في العمود الأول.'); return }
    const merged = replace ? list : [...students, ...list]
    const cut = merged.slice(0, MAX_STUDENTS)
    setStudents(cut)
    setMsg(merged.length > MAX_STUDENTS
      ? `أُخذ أول ${MAX_STUDENTS} طالباً من ${merged.length}. ولّد الباقي في دفعة ثانية.`
      : `${replace ? 'قُرئ' : 'أُضيف'} ${list.length} ${list.length === 1 ? 'اسم' : 'اسماً'}.`)
  }

  async function onFile(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    setMsg('')
    try { addStudents(await parseStudentsFile(f), true) } catch (err) { setMsg(err.message || 'تعذّرت قراءة الملف') } finally { setBusy(false) }
  }

  function onSample() {
    saveBlob(new Blob([sampleXlsx()], { type: XLSX_MIME }), 'نموذج-شهادات-إحكام.xlsx')
  }

  const patch = (i, p) => setStudents(students.map((s, j) => (j === i ? { ...s, ...p } : s)))
  const remove = (i) => {
    setStudents(students.filter((_, j) => j !== i))
    if (previewIdx >= i && previewIdx > 0) setPreviewIdx(previewIdx - 1)
  }

  return (
    <div className="space-y-5">
      <ol className="space-y-2 text-[13.5px] leading-[1.8] text-[#4A5D56]">
        <li><b className="text-[#1A2E28]">1.</b> نزّل الملف النموذجي أو افتح ملفك. العمود الأول: اسم الطالب. والثاني اختياري: الإنجاز (مثل «حفظ جزء عمّ كاملاً»، بلا «ل» في أوله). والثالث اختياري: طالب أو طالبة.</li>
        <li><b className="text-[#1A2E28]">2.</b> ارفع الملف (xlsx أو csv)، أو الصق الأسماء في الصندوق، فتظهر في الجدول لتعدّلها.</li>
        <li><b className="text-[#1A2E28]">3.</b> اضبط الإنجاز العام والتصميم والتوقيعين، ثم ولّد ملف PDF واحداً بصفحة لكل طالب.</li>
      </ol>

      <div className="grid sm:grid-cols-2 gap-2">
        <button type="button" onClick={onSample} className={btn} style={soft}><Download size={16} /> الملف النموذجي (Excel)</button>
        <div>
          <input ref={fileRef} type="file" id="cb-file" accept=".xlsx,.csv,.tsv,.txt" onChange={onFile} className="sr-only" />
          <label htmlFor="cb-file" className={btn + ' w-full'} style={{ ...soft, boxShadow: 'inset 0 0 0 1.5px rgba(184,134,58,.5)' }}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} ارفع ملف Excel أو CSV
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="cb-paste" className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#1A2E28] mb-1.5">
          <ClipboardPaste size={15} color="#8A6425" /> أو الصق الأسماء هنا
        </label>
        <TextArea id="cb-paste" value={paste} onChange={setPaste} rows={4} maxLength={20000}
          placeholder={'عبد الله محمد\nمريم خالد\nيوسف إبراهيم\n\nأو انسخ الأعمدة من Excel كما هي'} />
        <div className="flex items-center gap-3 mt-2">
          <button type="button" disabled={!paste.trim()} onClick={() => { addStudents(parseStudentsText(paste)); setPaste('') }} className={btn + ' btn-cta'}>
            <Plus size={16} /> أضف إلى الجدول
          </button>
          <span className="text-[12.5px] text-[#5E6E67]">حتى {MAX_STUDENTS} طالباً في الدفعة الواحدة.</span>
        </div>
      </div>

      <p className="text-[13px] font-bold min-h-[1.5em]" style={{ color: '#8A6425' }} aria-live="polite">{msg}</p>

      {students.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[14px] font-black text-[#1A2E28]">
              <FileSpreadsheet size={16} color="#8A6425" /> {students.length} {students.length === 1 ? 'طالب' : 'طلاب'}
            </div>
            <button type="button" onClick={() => { setStudents([]); setMsg(''); setPreviewIdx(0) }} className="text-[12.5px] font-bold text-[#9A3B2E] cursor-pointer min-h-[36px] px-2">مسح القائمة</button>
          </div>
          <ul className="rounded-2xl overflow-auto max-h-[420px] divide-y" style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)', '--tw-divide-color': '#EFE9DC' }}>
            {students.map((s, i) => (
              <li key={i} className="p-2.5 space-y-1.5" style={{ background: i === previewIdx ? 'rgba(224,181,98,.14)' : undefined }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-6 shrink-0 text-center text-[12px] text-[#8A6425] font-bold tabular-nums">{i + 1}</span>
                  <input aria-label={`اسم الطالب ${i + 1}`} className={cell + ' font-bold flex-1 min-w-0'} value={s.name} placeholder="اسم الطالب" onChange={(e) => patch(i, { name: e.target.value })} maxLength={48} />
                  <button type="button" aria-label={`معاينة شهادة ${s.name}`} title="معاينة" onClick={() => setPreviewIdx(i)} className="w-10 h-10 shrink-0 rounded-lg grid place-items-center cursor-pointer" style={{ background: i === previewIdx ? '#E0B562' : '#F1ECDF' }}><Eye size={15} /></button>
                  <button type="button" aria-label={`حذف ${s.name}`} title="حذف" onClick={() => remove(i)} className="w-10 h-10 shrink-0 rounded-lg grid place-items-center cursor-pointer" style={{ background: '#F1ECDF' }}><Trash2 size={15} /></button>
                </div>
                <div className="flex items-center gap-1.5 ps-7">
                  <input aria-label={`إنجاز الطالب ${i + 1}`} className={cell + ' flex-1 min-w-0 text-[13px]'} value={s.ach} placeholder="الإنجاز: من الإنجاز العام" onChange={(e) => patch(i, { ach: e.target.value })} maxLength={90} />
                  <div className="w-[104px] shrink-0">
                    <Select aria-label={`جنس الطالب ${i + 1}`} value={s.gender} onChange={(v) => patch(i, { gender: v })} style={{ padding: '6px 8px', fontSize: 13, background: 'transparent' }}>
                      <option value="">الجنس: عام</option><option value="m">طالب</option><option value="f">طالبة</option>
                    </Select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[12.5px] leading-[1.7] text-[#5E6E67] mt-2">الإنجاز المكتوب لطالب في الجدول يحلّ محلّ الإنجاز العام ونص المتن لشهادته وحده. «عام» في الجنس يتبع اختيار «طالب/طالبة» أعلاه.</p>
        </div>
      )}
    </div>
  )
}
