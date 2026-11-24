import { useState } from 'react'
import { Upload, Download, Trash2, Eye, Loader2 } from 'lucide-react'
import { TextArea, Segmented } from './controls'
import { saveBlob } from './canvasKit'
import CertTemplates from './CertTemplates'
import { parseStudentsFile, parseStudentsText, sampleXlsx, MAX_STUDENTS } from '../../tools/files/bulk.js'
import { normVar, uniqueVars } from '../../tools/files/template.js'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const cell = 'w-full bg-transparent outline-none text-[14px] text-[#1A2E28] py-2 px-2 rounded-lg focus:shadow-[inset_0_0_0_1.5px_#1F6F52]'
const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold cursor-pointer min-h-[44px] disabled:opacity-50'
const soft = { background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }
const ring = { boxShadow: 'inset 0 0 0 1px var(--line-warm)' }

let sid = 0
const newId = () => `s${Date.now().toString(36)}${++sid}`

/* التوليد الجماعي في مسار واحد: ارفع الملف ← راجع القائمة ← جملة الشهادة (تحتها مباشرة).
   students: [{ id, name, gender: 'm'|'f', vars: { اسم المتغير: قيمة }, tpl }]. */
export default function CertBulk({ students, setStudents, previewIdx, setPreviewIdx, varNames, setVarNames, templates, setTemplates, activeTpl, setActiveTpl, globalTitle, sentenceFor, onPreview }) {
  const [paste, setPaste] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [pasteGender, setPasteGender] = useState('m')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const firstTpl = templates[0]?.id
  const multi = templates.length > 1

  function addStudents(res, replace = false) {
    const list = res.students
    if (!list.length) { setMsg('لم أجد أسماء. اكتب كل اسم في سطر، أو ضعه في العمود الأول.'); return }
    const withIds = list.map((s) => ({ ...s, id: newId(), gender: s.gender || pasteGender, tpl: firstTpl }))
    const merged = replace ? withIds : [...students, ...withIds]
    setStudents(merged.slice(0, MAX_STUDENTS))
    /* «الإنجاز» دائماً أول متغير: له إنجاز عام يملأ من لا إنجاز له */
    setVarNames((cur) => uniqueVars(['الإنجاز', ...(replace ? [] : cur), ...(res.vars || [])]))
    if (replace) setPreviewIdx(0)
    const f = list.filter((s) => s.gender === 'f').length
    const part = f ? ` (${list.length - f} ${list.length - f === 1 ? 'طالب' : 'طلاب'} و${f} ${f === 1 ? 'طالبة' : 'طالبات'})` : ''
    setMsg(merged.length > MAX_STUDENTS
      ? `أُخذ أول ${MAX_STUDENTS} طالباً من ${merged.length}. ولّد الباقي في دفعة ثانية.`
      : `قُرئ ${list.length} ${list.length === 1 ? 'اسم' : 'اسماً'}${part}.`)
  }

  async function onFile(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    setMsg('')
    try { addStudents(await parseStudentsFile(f, pasteGender), true) } catch (err) { setMsg(err.message || 'تعذّرت قراءة الملف') } finally { setBusy(false) }
  }

  const onSample = () => saveBlob(new Blob([sampleXlsx()], { type: XLSX_MIME }), 'نموذج-شهادات-إحكام.xlsx')

  const patch = (i, p) => setStudents(students.map((s, j) => (j === i ? { ...s, ...p } : s)))
  const setVal = (i, k, v) => setStudents(students.map((s, j) => (j === i ? { ...s, vars: { ...s.vars, [k]: v } } : s)))
  const remove = (i) => {
    setStudents(students.filter((_, j) => j !== i))
    if (previewIdx >= i && previewIdx > 0) setPreviewIdx(previewIdx - 1)
  }

  const fileInput = (
    <input type="file" id="cb-file" accept=".xlsx,.xls,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain,application/octet-stream" onChange={onFile} className="sr-only" />
  )
  const uploadLabel = (text, strong) => (
    <label htmlFor="cb-file" className={btn + (strong ? ' btn-cta w-full' : ' w-full')} style={strong ? undefined : soft}>
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {text}
    </label>
  )

  return (
    <div className="space-y-5">
      {fileInput}

      {!students.length ? (
        <div className="space-y-4">
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-[13px] font-black" style={{ background: '#E0B562', color: '#0B3B33' }}>1</span>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="text-[14px] font-black text-[#1A2E28]">حمّل الملف واملأه</div>
                <p className="text-[13px] leading-[1.75] text-[#4A5D56]">فيه ورقة للطلاب وورقة للطالبات. الاسم وحده إلزامي، وأضف أي عمود تريده.</p>
                <button type="button" onClick={onSample} className={btn + ' w-full'} style={soft}><Download size={16} /> الملف النموذجي (Excel)</button>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-[13px] font-black" style={{ background: '#F1ECDF', color: '#6B4C14' }}>2</span>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="text-[14px] font-black text-[#1A2E28]">ارفعه هنا</div>
                {uploadLabel('ارفع الملف', true)}
              </div>
            </li>
          </ol>
          {!showPaste ? (
            <button type="button" onClick={() => setShowPaste(true)} className="text-[13px] font-bold text-[#0B3B33] underline underline-offset-4 cursor-pointer min-h-[40px]">أو الصق الأسماء بدل الملف</button>
          ) : (
            <div className="space-y-2">
              <TextArea id="cb-paste" aria-label="الصق الأسماء" value={paste} onChange={setPaste} rows={4} maxLength={20000}
                placeholder={'عبد الله محمد\nيوسف إبراهيم\n\nكل اسم في سطر، أو انسخ الأعمدة من Excel كما هي'} />
              <Segmented label="هؤلاء" value={pasteGender} onChange={setPasteGender} size="sm" options={[{ value: 'm', label: 'طلاب' }, { value: 'f', label: 'طالبات' }]} />
              <button type="button" disabled={!paste.trim()} onClick={() => { addStudents(parseStudentsText(paste, pasteGender), true); setPaste('') }} className={btn + ' btn-cta w-full'}>أضف إلى القائمة</button>
            </div>
          )}
          <p className="text-[13px] font-bold min-h-[1.5em]" style={{ color: '#8A6425' }} aria-live="polite">{msg}</p>
        </div>
      ) : (
        <>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="text-[14px] font-black text-[#1A2E28]">
                {students.length} {students.length === 1 ? 'طالب' : 'طلاب'}
                <span className="text-[12.5px] font-bold text-[#8A6425]" aria-live="polite"> · {msg || 'راجع القائمة وعدّل ما تشاء'}</span>
              </div>
              <div className="flex items-center gap-1">
                <label htmlFor="cb-file" className="text-[12.5px] font-bold text-[#0B3B33] underline underline-offset-4 cursor-pointer min-h-[36px] px-2 inline-flex items-center">ارفع ملفاً آخر</label>
                <button type="button" onClick={() => { setStudents([]); setMsg(''); setPreviewIdx(0) }} className="text-[12.5px] font-bold text-[#9A3B2E] cursor-pointer min-h-[36px] px-2">مسح القائمة</button>
              </div>
            </div>

            <ul className="rounded-2xl overflow-auto max-h-[420px] divide-y" style={{ background: '#FDFBF7', ...ring, '--tw-divide-color': '#EFE9DC' }}>
              {students.map((s, i) => (
                <li key={s.id || i} className="p-2.5 space-y-1.5" style={{ background: i === previewIdx ? 'rgba(224,181,98,.14)' : undefined }}>
                  <div className="flex items-center gap-1.5">
                    <input aria-label={`اسم الطالب ${i + 1}`} className={cell + ' font-bold flex-1 min-w-0'} value={s.name} placeholder="الاسم" onChange={(e) => patch(i, { name: e.target.value })} maxLength={48} />
                    <button type="button" aria-label={`${s.gender === 'f' ? 'طالبة' : 'طالب'}: اضغط للتبديل`} title="اضغط للتبديل بين طالب وطالبة"
                      onClick={() => patch(i, { gender: s.gender === 'f' ? 'm' : 'f' })}
                      className="shrink-0 rounded-full px-3 min-h-[36px] text-[12.5px] font-bold cursor-pointer"
                      style={s.gender === 'f' ? { background: '#F6E3EC', color: '#7A2E4E' } : { background: '#E4EEE9', color: '#1F4F3C' }}>
                      {s.gender === 'f' ? 'طالبة' : 'طالب'}
                    </button>
                    <button type="button" aria-label={`معاينة شهادة ${s.name}`} title="معاينة" onClick={() => setPreviewIdx(i)} className="w-10 h-10 shrink-0 rounded-lg grid place-items-center cursor-pointer" style={{ background: i === previewIdx ? '#E0B562' : '#F1ECDF' }}><Eye size={15} /></button>
                    <button type="button" aria-label={`حذف ${s.name}`} title="حذف" onClick={() => remove(i)} className="w-10 h-10 shrink-0 rounded-lg grid place-items-center cursor-pointer" style={{ background: '#F1ECDF' }}><Trash2 size={15} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {varNames.map((v) => {
                      const isAch = normVar(v) === normVar('الإنجاز')
                      return (
                        <input key={v} aria-label={`${v}، الطالب ${i + 1}`} className={cell + ' text-[13px] ' + (isAch ? 'col-span-2' : '')} style={ring}
                          value={s.vars?.[v] || ''} maxLength={90} placeholder={v}
                          onChange={(e) => setVal(i, v, e.target.value)} />
                      )
                    })}
                  </div>
                  {multi && <div className="text-[11.5px] font-bold text-[#8A6425]">الصيغة: {(templates.find((t) => t.id === s.tpl) || templates[0]).name}</div>}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-5" style={{ borderColor: '#EFE9DC' }}>
            <CertTemplates templates={templates} setTemplates={setTemplates} activeId={activeTpl} setActiveId={setActiveTpl}
              varNames={varNames} students={students} setStudents={setStudents} globalTitle={globalTitle}
              sentenceFor={sentenceFor} onPreview={onPreview} />
          </div>
        </>
      )}
    </div>
  )
}
