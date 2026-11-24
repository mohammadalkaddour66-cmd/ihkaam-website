import { useState } from 'react'
import { Upload, Download, Trash2, Loader2, ClipboardPaste, X } from 'lucide-react'
import { TextArea, TextInput, Field } from '../controls'
import { saveBlob } from '../canvasKit'
import { parseStudentsFile, parseStudentsText, sampleXlsx, MAX_STUDENTS } from '../../../tools/files/bulk.js'
import { normVar, uniqueVars } from '../../../tools/files/template.js'
import { blankStudent, newStudentId, isBlank, ACH } from './model.js'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold cursor-pointer min-h-[46px] w-full'
const soft = { background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }

/* الخطوة الثانية: من هم الطلاب؟ في «شهادة واحدة» اسم وبيانات طالب واحد. وفي «التوليد الجماعي» قائمة من ملف أو لصق،
   ثم يُحرَّر الطالب المختار من الشريط تحت الشهادة. */
export default function StudentsPanel({ mode, aud, students, setStudents, cur, setCur, varNames, setVarNames, templates, onImported }) {
  const [paste, setPaste] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const bulk = mode === 'bulk'
  const firstTpl = templates[0].id
  const idx = bulk ? Math.min(cur, students.length - 1) : 0
  const s = students[idx]
  const real = students.filter((x) => !isBlank(x))
  const defGender = aud === 'f' ? 'f' : 'm'

  function take(res, replace) {
    const list = res.students
    if (!list.length) { setMsg('لم أجد أسماء. اكتب كل اسم في سطر، أو ضعه في العمود الأول.'); return }
    const added = list.map((x) => ({ ...x, id: newStudentId(), gender: x.gender || defGender, tpl: firstTpl }))
    const merged = (replace ? added : [...real, ...added]).slice(0, MAX_STUDENTS)
    setStudents(merged)
    setCur(replace ? 0 : real.length)
    const names = uniqueVars([ACH, ...(replace ? [] : varNames), ...(res.vars || [])])
    setVarNames(names)
    onImported?.(merged, names, varNames)
    const f = list.filter((x) => x.gender === 'f').length
    const part = f ? ` (${list.length - f} ${list.length - f === 1 ? 'طالب' : 'طلاب'} و${f} ${f === 1 ? 'طالبة' : 'طالبات'})` : ''
    setMsg(list.length + real.length > MAX_STUDENTS && !replace ? `أُخذ أول ${MAX_STUDENTS} طالباً. ولّد الباقي في دفعة ثانية.` : `قُرئ ${list.length} ${list.length === 1 ? 'اسم' : 'اسماً'}${part}.`)
  }

  async function onFile(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true); setMsg('')
    try { take(await parseStudentsFile(f, defGender), true) } catch (err) { setMsg(err.message || 'تعذّرت قراءة الملف') } finally { setBusy(false) }
  }

  const patch = (p) => setStudents(students.map((x, j) => (j === idx ? { ...x, ...p } : x)))
  const setVal = (k, v) => patch({ vars: { ...s.vars, [k]: v } })
  function remove() {
    const rest = students.filter((_, j) => j !== idx)
    setStudents(rest.length ? rest : [blankStudent(firstTpl, defGender)])
    setCur(Math.max(0, idx - 1))
  }
  function dropField(name) {
    setVarNames((v) => v.filter((x) => x !== name))
    setStudents(students.map((x) => ({ ...x, vars: Object.fromEntries(Object.entries(x.vars || {}).filter(([k]) => k !== name)) })))
  }

  return (
    <div className="space-y-5">
      {bulk && (
        <div className="space-y-2">
          <div className="text-[14px] font-black text-[#1A2E28]">{real.length > 1 ? `${real.length} طلاب في القائمة` : 'ارفع قائمة الأسماء'}</div>
          <div className="grid grid-cols-2 gap-2">
            <input type="file" id="cs-file" onChange={onFile} className="sr-only"
              accept=".xlsx,.xls,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain,application/octet-stream" />
            <label htmlFor="cs-file" className={btn + ' btn-cta'}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} ارفع ملف Excel</label>
            <button type="button" onClick={() => saveBlob(new Blob([sampleXlsx()], { type: XLSX_MIME }), 'نموذج-شهادات-إحكام.xlsx')} className={btn} style={soft}><Download size={16} /> الملف النموذجي</button>
          </div>
          {!showPaste ? (
            <button type="button" onClick={() => setShowPaste(true)} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0B3B33] underline underline-offset-4 cursor-pointer min-h-[40px]"><ClipboardPaste size={14} /> أو الصق الأسماء</button>
          ) : (
            <div className="space-y-2">
              <TextArea id="cs-paste" aria-label="الصق الأسماء" value={paste} onChange={setPaste} rows={4} maxLength={20000} placeholder={'كل اسم في سطر\nأو انسخ الأعمدة من Excel كما هي'} />
              <button type="button" disabled={!paste.trim()} onClick={() => { take(parseStudentsText(paste, defGender), false); setPaste(''); setShowPaste(false) }} className={btn + ' btn-cta disabled:opacity-50'}>أضف إلى القائمة</button>
            </div>
          )}
          <p className="text-[12.5px] leading-[1.7] text-[#5E6E67]">الملف ورقتان: «الطلاب» و«الطالبات». الاسم وحده إلزامي، وأي عمود تضيفه يصير حقلاً تدرجه في الجملة.</p>
          <p className="text-[13px] font-bold min-h-[1.4em]" style={{ color: '#8A6425' }} aria-live="polite">{msg}</p>
        </div>
      )}

      <div className="rounded-2xl p-3.5 space-y-3" style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
        <div className="flex items-center justify-between gap-2">
          <div className="text-[14px] font-black text-[#1A2E28]">{bulk && students.length > 1 ? `الطالب ${idx + 1} من ${students.length}` : 'بيانات الطالب'}</div>
          {bulk && students.length > 1 && (
            <button type="button" onClick={remove} aria-label={`احذف ${s.name || 'هذا الطالب'}`} className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#9A3B2E] cursor-pointer min-h-[36px]"><Trash2 size={14} /> احذف</button>
          )}
        </div>
        <Field label={s.gender === 'f' ? 'اسم الطالبة' : 'اسم الطالب'} htmlFor="cs-name">
          <TextInput id="cs-name" value={s.name} onChange={(v) => patch({ name: v })} placeholder="الاسم الثلاثي كما في سجل المعهد" maxLength={48} />
        </Field>
        {bulk && aud === 'both' && (
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="الجنس">
            {[['m', 'طالب'], ['f', 'طالبة']].map(([g, l]) => (
              <button key={g} type="button" role="radio" aria-checked={s.gender === g} onClick={() => patch({ gender: g })} className="rounded-xl min-h-[44px] text-[14px] font-bold cursor-pointer"
                style={s.gender === g ? { background: '#0B3B33', color: '#F8F5EC' } : soft}>{l}</button>
            ))}
          </div>
        )}
        {varNames.map((v) => {
          const isAch = normVar(v) === normVar(ACH)
          return (
            <Field key={v} label={v} htmlFor={`cs-v-${v}`}>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 min-w-0">
                  <TextInput id={`cs-v-${v}`} value={s.vars?.[v] || ''} onChange={(x) => setVal(v, x)} maxLength={90}
                    placeholder={isAch ? 'مثل: حفظ جزء عمّ، أو التميّز في التسميع' : ''} />
                </div>
                {!isAch && (
                  <button type="button" onClick={() => dropField(v)} aria-label={`احذف الحقل ${v}`} title="احذف هذا الحقل" className="w-10 h-10 shrink-0 rounded-lg grid place-items-center cursor-pointer" style={{ background: '#F1ECDF' }}><X size={15} /></button>
                )}
              </div>
            </Field>
          )
        })}
        {varNames.length === 1 && <p className="text-[12.5px] leading-[1.7] text-[#5E6E67]">لإضافة حقول أخرى (التقدير، الدرجة…) افتح خطوة «الصياغة» واضغط «حقل جديد».</p>}
      </div>
    </div>
  )
}
