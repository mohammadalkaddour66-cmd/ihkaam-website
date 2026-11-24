import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Upload, Loader2, ClipboardPaste, X, Plus, Info, Maximize2, Minimize2 } from 'lucide-react'
import { TextArea, Segmented } from '../controls'
import { parseStudentsFile, parseStudentsText, MAX_STUDENTS } from '../../../tools/files/bulk.js'
import { normVar, uniqueVars, cleanVarName } from '../../../tools/files/template.js'
import { blankStudent, newStudentId, isBlank } from './model.js'

const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold cursor-pointer min-h-[46px] w-full'
const soft = { background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }
const ring = { boxShadow: 'inset 0 0 0 1px var(--line-warm)' }
const cellIn = 'w-full bg-transparent outline-none text-[13.5px] text-[#1A2E28] py-2 px-2.5 min-h-[44px] focus:shadow-[inset_0_0_0_1.5px_#1F6F52] rounded-lg'

/* جدول الطلاب (التوليد الجماعي): صف لكل طالب وعمود لكل بيان. العمود الجديد يصير متغيراً يُدرجه المدير في جملة الشهادة
   في الخطوة التالية. تُكتب الخلايا مباشرة، أو تُلصق أسماء، أو يُرفع ملف Excel لمن عنده. والضغط على صف يعرض شهادته. */
export default function StudentsTable({ aud, setAud, students, setStudents, cur, setCur, varNames, setVarNames, templates, onImported }) {
  const [paste, setPaste] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [addingCol, setAddingCol] = useState(false)
  const [colName, setColName] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [full, setFull] = useState(false)
  const colDone = useRef(false) // العمود أُنجز (أُضيف أو أُلغي): لا يُعاد بحدث blur بعد إغلاق الخانة
  const firstTpl = templates[0].id
  const defGender = aud === 'f' ? 'f' : 'm'
  const real = students.filter((x) => !isBlank(x))

  function take(res, replace) {
    const list = res.students
    if (!list.length) { setMsg('لم أجد أسماء. اكتب كل اسم في سطر، أو ضعه في العمود الأول.'); return }
    const added = list.map((x) => ({ ...x, id: newStudentId(), gender: x.gender || defGender, tpl: firstTpl }))
    const merged = (replace ? added : [...real, ...added]).slice(0, MAX_STUDENTS)
    setStudents(merged)
    setCur(replace ? 0 : real.length)
    const names = uniqueVars([...(replace ? [] : varNames), ...(res.vars || [])])
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

  const patch = (i, p) => setStudents(students.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const setVal = (i, k, v) => setStudents(students.map((x, j) => (j === i ? { ...x, vars: { ...x.vars, [k]: v } } : x)))
  const addRow = () => { setStudents([...students, blankStudent(students[cur]?.tpl || firstTpl, defGender)]); setCur(students.length) }
  function removeRow(i) {
    const rest = students.filter((_, j) => j !== i)
    setStudents(rest.length ? rest : [blankStudent(firstTpl, defGender)])
    setCur(Math.max(0, Math.min(cur, rest.length - 1)))
  }
  function addColNamed(raw) {
    const n = cleanVarName(raw)
    if (!n) return
    colDone.current = true
    if (varNames.some((v) => normVar(v) === normVar(n))) { setMsg(`العمود «${n}» موجود.`); setColName(''); setAddingCol(false); return }
    const next = [...varNames, n]
    setVarNames(next)
    setColName(''); setAddingCol(false)
    setMsg(`أُضيف العمود «${n}». ستجده في خطوة «الصياغة» لتدرجه في الجملة حيث تشاء.`)
  }
  function dropCol(name) {
    const next = varNames.filter((x) => x !== name)
    setVarNames(next)
    setStudents(students.map((x) => ({ ...x, vars: Object.fromEntries(Object.entries(x.vars || {}).filter(([k]) => k !== name)) })))
  }

  const th = 'px-2 py-2 text-[12.5px] font-black text-[#6B4C14] text-start whitespace-nowrap bg-[#F8F5EC]'
  /* ملء الشاشة: طبقة فوق الصفحة. يُغلق بـ Esc، ولا تتحرك الصفحة خلفه. */
  useEffect(() => {
    if (!full) return
    const onKey = (e) => { if (e.key === 'Escape') setFull(false) }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [full])

  const view = (
    <div className={full ? 'fixed inset-0 z-[1100] overflow-auto p-4 sm:p-6 space-y-4' : 'space-y-4'} style={full ? { background: '#FDFBF7' } : undefined}
      role={full ? 'dialog' : undefined} aria-modal={full ? 'true' : undefined} aria-label={full ? 'جدول الطلاب بملء الشاشة' : undefined}>
      <Segmented label="الشهادات لـ" value={aud} onChange={setAud} size="sm"
        options={[{ value: 'm', label: 'طلاب' }, { value: 'f', label: 'طالبات' }, { value: 'both', label: 'الاثنين' }]} />

      <div className="flex items-start gap-2 rounded-xl p-3 text-[13px] leading-[1.8] text-[#6B4C14]" style={{ background: 'rgba(224,181,98,.2)' }}>
        <Info size={16} className="mt-1 shrink-0" />
        <p>اكتب الأسماء في الجدول. وإن أردت أن يظهر في شهادة كل طالب شيء يخصه، فأضف له عموداً باسم تختاره. كل عمود تضيفه يصير <b>متغيراً</b> تدرجه بنفسك في جملة الشهادة في الخطوة التالية «الصياغة»، فالجملة بصياغتك أنت.</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-[14px] font-black text-[#1A2E28]">{real.length > 1 ? `${real.length} طلاب` : 'الجدول'}</div>
        <button type="button" onClick={() => setFull((v) => !v)} aria-pressed={full}
          className="inline-flex items-center gap-1 text-[13px] font-bold text-[#0B3B33] cursor-pointer min-h-[40px] px-2.5 rounded-lg" style={soft}>
          {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {full ? 'إغلاق ملء الشاشة' : 'ملء الشاشة'}
        </button>
      </div>

      <div className={`overflow-auto rounded-2xl bg-white ${full ? 'max-h-[calc(100vh-230px)]' : 'max-h-[60vh]'}`} style={ring}>
        <table className="w-full min-w-max border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className={th + ' w-8'}>#</th>
              <th className={th + ' min-w-[150px]'}>الاسم</th>
              {aud === 'both' && <th className={th}>الجنس</th>}
              {varNames.map((v) => (
                <th key={v} className={th + ' min-w-[96px]'}>
                  <span className="inline-flex items-center gap-1">{v}
                    <button type="button" onClick={() => dropCol(v)} aria-label={`احذف العمود ${v}`} title="احذف العمود" className="w-6 h-6 grid place-items-center rounded-full cursor-pointer"><X size={12} /></button>
                  </span>
                </th>
              ))}
              <th className={th + ' min-w-[130px]'}>
                {addingCol ? (
                  <input autoFocus id="cs-newcol" aria-label="اسم العمود الجديد" value={colName} maxLength={24} placeholder="اسم العمود ثم Enter"
                    onChange={(e) => setColName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColNamed(colName) } else if (e.key === 'Escape') { e.stopPropagation(); colDone.current = true; setColName(''); setAddingCol(false) } }}
                    onBlur={() => { if (colDone.current) return; if (colName.trim()) addColNamed(colName); else setAddingCol(false) }}
                    className="w-full bg-white rounded-lg px-2 min-h-[34px] text-[13px] font-bold outline-none shadow-[inset_0_0_0_1.5px_#1F6F52]" />
                ) : (
                  <button type="button" onClick={() => { colDone.current = false; setAddingCol(true) }} className="inline-flex items-center gap-1 text-[#0B3B33] font-black cursor-pointer min-h-[34px]"><Plus size={13} /> عمود جديد</button>
                )}
              </th>
              <th className={th + ' w-10'} />
            </tr>
          </thead>
          <tbody>
            {students.map((x, i) => {
              const on = i === cur
              return (
                <tr key={x.id} onClick={() => setCur(i)} style={{ background: on ? 'rgba(224,181,98,.16)' : undefined, borderTop: '1px solid #EFE9DC' }}>
                  <td className="px-2 text-[12px] text-[#8A6425] font-bold tabular-nums">{i + 1}</td>
                  <td><input id={on ? 'cs-name' : undefined} aria-label={`اسم الطالب ${i + 1}`} className={cellIn + ' font-bold'} value={x.name} placeholder="الاسم" maxLength={48} onChange={(e) => patch(i, { name: e.target.value })} onFocus={() => setCur(i)} /></td>
                  {aud === 'both' && (
                    <td className="px-1">
                      <button type="button" onClick={() => patch(i, { gender: x.gender === 'f' ? 'm' : 'f' })} aria-label={`${x.gender === 'f' ? 'طالبة' : 'طالب'}: اضغط للتبديل`}
                        className="rounded-full px-3 min-h-[34px] text-[12.5px] font-bold cursor-pointer whitespace-nowrap"
                        style={x.gender === 'f' ? { background: '#F6E3EC', color: '#7A2E4E' } : { background: '#E4EEE9', color: '#1F4F3C' }}>{x.gender === 'f' ? 'طالبة' : 'طالب'}</button>
                    </td>
                  )}
                  {varNames.map((v) => (
                    <td key={v}><input aria-label={`${v}، الطالب ${i + 1}`} className={cellIn} value={x.vars?.[v] || ''} maxLength={90} onChange={(e) => setVal(i, v, e.target.value)} onFocus={() => setCur(i)} /></td>
                  ))}
                  <td className="px-1">{students.length > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); removeRow(i) }} aria-label={`احذف ${x.name || 'الصف'}`} title="احذف" className="w-8 h-8 grid place-items-center rounded-lg cursor-pointer text-[#9A3B2E]"><X size={14} /></button>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className={btn} style={soft}><Plus size={15} /> أضف طالباً</button>

      {/* بدائل للإدخال اليدوي، لمن عنده قائمة جاهزة */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <button type="button" onClick={() => setShowPaste((v) => !v)} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0B3B33] underline underline-offset-4 cursor-pointer min-h-[40px]"><ClipboardPaste size={14} /> عندي قائمة أسماء، ألصقها</button>
          <input type="file" id="cs-file" onChange={onFile} className="sr-only"
            accept=".xlsx,.xls,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain,application/octet-stream" />
          <label htmlFor="cs-file" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0B3B33] underline underline-offset-4 cursor-pointer min-h-[40px]">{busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} أو ارفع ملف Excel</label>
        </div>
        {showPaste && (
          <div className="space-y-2">
            <TextArea id="cs-paste" aria-label="الصق الأسماء" value={paste} onChange={setPaste} rows={4} maxLength={20000} placeholder={'كل اسم في سطر\nأو انسخ الأعمدة من Excel كما هي'} />
            <button type="button" disabled={!paste.trim()} onClick={() => { take(parseStudentsText(paste, defGender), false); setPaste(''); setShowPaste(false) }} className={btn + ' btn-cta disabled:opacity-50'}>أضف إلى الجدول</button>
          </div>
        )}
        <p className="text-[13px] font-bold min-h-[1.4em]" style={{ color: '#8A6425' }} aria-live="polite">{msg}</p>
      </div>
    </div>
  )
  /* ملء الشاشة عبر بوابة إلى body: أب الصفحة له سياق تراكب خاص، فبقيت الطبقة تحت شريط التنقل وزر واتساب */
  return full ? createPortal(view, document.body) : view
}
