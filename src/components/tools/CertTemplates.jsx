import { useRef } from 'react'
import { Plus, Trash2, Check, RotateCcw, AlertTriangle } from 'lucide-react'
import { TextArea } from './controls'
import { TITLES } from './certificate'
import { DEFAULT_TPL, newTemplate, insertToken, inspectTemplate, femaleSuggestions, replaceWord } from '../../tools/files/template.js'

const ring = { boxShadow: 'inset 0 0 0 1px var(--line-warm)' }
const soft = { background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }
const pill = 'rounded-full px-3 py-1.5 text-[12.5px] font-bold cursor-pointer min-h-[36px]'
const btn = 'inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold cursor-pointer min-h-[40px]'

/* صندوق نص مع قطعه: يتتبّع مؤشره بنفسه، فتُدرج القطعة حيث يقف المؤشر دون أن يفقد التركيز */
function TplBox({ label, aria, value, onChange, varNames, example }) {
  const ta = useRef(null)
  const caret = useRef(null)
  const info = inspectTemplate(value, varNames)
  const remember = () => { if (ta.current) caret.current = { s: ta.current.selectionStart, e: ta.current.selectionEnd } }
  function put(name) {
    const c = caret.current
    const r = insertToken(value, c?.s ?? value.length, c?.e ?? c?.s ?? value.length, name)
    onChange(r.text)
    caret.current = { s: r.caret, e: r.caret }
    requestAnimationFrame(() => { if (ta.current && document.activeElement === ta.current) ta.current.setSelectionRange(r.caret, r.caret) })
  }
  return (
    <div className="space-y-2">
      {label && <div className="text-[13.5px] font-black text-[#1A2E28]">{label}</div>}
      <div className="flex flex-wrap gap-1.5">
        {varNames.map((v) => (
          <button key={v} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => put(v)}
            className="rounded-lg px-3 py-1.5 text-[13px] font-black cursor-pointer min-h-[38px]"
            style={{ background: 'rgba(224,181,98,.28)', color: '#6B4C14', boxShadow: 'inset 0 0 0 1px rgba(184,134,58,.45)' }}>
            + {v}
          </button>
        ))}
      </div>
      <TextArea ref={ta} value={value} onChange={onChange} rows={3} maxLength={300} aria-label={aria}
        onSelect={remember} onKeyUp={remember} onClick={remember} onBlur={remember} />
      {info.missing.length > 0 && (
        <p className="flex items-start gap-1.5 text-[12.5px] leading-[1.7] text-[#8A4B14]">
          <AlertTriangle size={14} className="mt-1 shrink-0" />
          {info.missing.map((m) => `[${m}]`).join(' و')} ليس عموداً في ملفك، فسيُحذف من الشهادات.
        </p>
      )}
      {example && (
        <p className="text-[13.5px] leading-[1.9] text-[#1A2E28] rounded-xl p-2.5" style={{ background: '#fff', ...ring }}>
          <span className="block text-[11.5px] font-bold text-[#8A6425]">هكذا تظهر لـ «{example.name}»</span>
          {example.text || '— فارغ —'}
        </p>
      )}
    </div>
  )
}

/* نص الشهادة: صندوق واحد للطلاب، وصندوق للطالبات إن وُجدن، وفوق كل صندوق قطعه. الصيغ المتعددة
   (لمجموعات مختلفة من الطلاب) مخفية خلف رابط، فلا يراها من لا يحتاجها. */
export default function CertTemplates({ templates, setTemplates, activeId, setActiveId, varNames, students, setStudents, globalTitle, sentenceFor, onPreview }) {
  const tp = templates.find((t) => t.id === activeId) || templates[0]
  const firstId = templates[0].id
  const multi = templates.length > 1
  const showTabs = multi
  const isFirst = tp.id === firstId
  const blockRef = useRef(null)

  const upd = (fn) => setTemplates((ts) => ts.map((t) => (t.id === tp.id ? fn(t) : t)))
  const count = (id, g) => students.filter((s) => (s.tpl || firstId) === id && s.gender === g).length
  const hasF = count(tp.id, 'f') > 0
  const hasM = count(tp.id, 'm') > 0 || !hasF

  /* نص الطلاب: ما دام المدير لم يكتب نص الطالبات بنفسه فهو نسخة منه تنتظر مراجعته */
  const setM = (v) => upd((t) => {
    if (t.fTouched) return { ...t, m: v }
    return v === DEFAULT_TPL.m ? { ...t, m: v, f: DEFAULT_TPL.f, fOk: true } : { ...t, m: v, f: v, fOk: false }
  })
  const setF = (v) => upd((t) => ({ ...t, f: v, fTouched: true, fOk: false }))
  
  function addTemplate() {
    const t = newTemplate(`الصيغة ${templates.length + 1}`, tp)
    setTemplates([...templates, t])
    setActiveId(t.id)
    /* تظهر أدوات الصيغة الجديدة أمام المدير فوراً: لا يبحث عنها بالتمرير */
    setTimeout(() => blockRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60)
  }
  const move = (ids, to) => setStudents((ss) => ss.map((x) => (ids.has(x.id) ? { ...x, tpl: to } : x)))
  function removeTemplate() {
    if (!multi) return
    const rest = templates.filter((t) => t.id !== tp.id)
    setTemplates(rest)
    setActiveId(rest[0].id)
    setStudents((ss) => ss.map((s) => ((s.tpl || firstId) === tp.id ? { ...s, tpl: rest[0].id } : s)))
  }

  const sugg = hasF && !tp.fOk ? femaleSuggestions(tp.f) : []

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[14px] font-black text-[#1A2E28]">جملة الشهادة</div>
        <p className="text-[12.5px] leading-[1.7] text-[#5E6E67]">جاهزة فعلاً، فلا تغيّرها إن أعجبتك. وإن أردت صياغة أخرى فاكتبها، واضغط الأزرار الذهبية لإدراج بيانات كل طالب. وما كان فارغاً عند طالب يُحذف وحده.</p>
      </div>

      {showTabs && (
        <div ref={blockRef} className="scroll-mt-28 space-y-3 rounded-2xl p-3" style={{ background: 'rgba(224,181,98,.12)' }}>
          <div className="text-[13.5px] font-black text-[#1A2E28]">صيغ مختلفة لمجموعات مختلفة</div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="صيغ الشهادة">
            {templates.map((t) => {
              const n = students.filter((s) => (s.tpl || firstId) === t.id).length
              const on = t.id === tp.id
              return (
                <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => { setActiveId(t.id); onPreview(t.id) }}
                  className="rounded-xl px-3.5 py-2 text-[13px] font-bold cursor-pointer min-h-[44px] text-start"
                  style={on ? { background: '#0B3B33', color: '#F8F5EC' } : soft}>
                  {t.name}<span className="block text-[11.5px] font-medium opacity-80">{n} {n === 1 ? 'طالب' : 'طلاب'}</span>
                </button>
              )
            })}
            <button type="button" onClick={addTemplate} className={btn} style={{ ...soft, boxShadow: 'inset 0 0 0 1.5px rgba(184,134,58,.5)' }}><Plus size={15} /> صيغة جديدة</button>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label htmlFor="tp-name" className="block text-[12.5px] font-bold text-[#1A2E28] mb-1">1. اسم الصيغة</label>
              <input id="tp-name" value={tp.name} maxLength={30} onChange={(e) => upd((t) => ({ ...t, name: e.target.value }))}
                className="w-full rounded-xl px-3 py-2 min-h-[44px] text-[15px] bg-white outline-none" style={ring} />
            </div>
            <div>
              <label htmlFor="tp-title" className="block text-[12.5px] font-bold text-[#1A2E28] mb-1">2. عنوان الشهادة</label>
              <input id="tp-title" value={tp.title} maxLength={40} placeholder={globalTitle || 'شهادة تقدير'}
                onChange={(e) => upd((t) => ({ ...t, title: e.target.value }))}
                className="w-full rounded-xl px-3 py-2 min-h-[44px] text-[15px] bg-white outline-none" style={ring} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TITLES.map((x) => (
              <button key={x} type="button" aria-pressed={tp.title === x} onClick={() => upd((t) => ({ ...t, title: x }))} className={pill}
                style={tp.title === x ? { background: '#0B3B33', color: '#F8F5EC' } : soft}>{x}</button>
            ))}
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="text-[12.5px] font-bold text-[#1A2E28]">3. من تُطبع شهادته بهذه الصيغة؟</span>
              {!isFirst && (
                <span className="flex items-center gap-3 text-[12.5px] font-bold text-[#0B3B33]">
                  <button type="button" className="underline underline-offset-4 cursor-pointer min-h-[32px]" onClick={() => move(new Set(students.map((x) => x.id)), tp.id)}>الكل</button>
                  <button type="button" className="underline underline-offset-4 cursor-pointer min-h-[32px]" onClick={() => move(new Set(students.filter((x) => (x.tpl || firstId) === tp.id).map((x) => x.id)), firstId)}>لا أحد</button>
                </span>
              )}
            </div>
            {isFirst ? (
              <p className="text-[12.5px] leading-[1.7] text-[#6B4C14]">هذه الصيغة الأساسية: تضم كل طالب لم تنقله إلى صيغة أخرى. ولنقل طلاب إلى صيغة مختلفة افتح تبويبها بالأعلى وضع علامة أمام أسمائهم.</p>
            ) : (
              <ul className="rounded-xl overflow-auto max-h-60 divide-y bg-white" style={{ ...ring, '--tw-divide-color': '#EFE9DC' }}>
                {students.map((x) => {
                  const cur = templates.find((t) => t.id === x.tpl) || templates[0]
                  const here = cur.id === tp.id
                  return (
                    <li key={x.id}>
                      <label className="flex items-center gap-3 px-3 min-h-[46px] cursor-pointer">
                        <input type="checkbox" checked={here} onChange={() => move(new Set([x.id]), here ? firstId : tp.id)} className="w-5 h-5 shrink-0 accent-[#1F6F52]" />
                        <span className="flex-1 min-w-0 text-[14px] font-bold text-[#1A2E28] truncate">{x.name}</span>
                        {!here && <span className="shrink-0 text-[11.5px] font-bold text-[#8A8F88]">{cur.name}</span>}
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <p className="text-[12.5px] leading-[1.7] text-[#6B4C14]">4. اكتب جملة هذه الصيغة في الصندوق أدناه.</p>
        </div>
      )}

      {hasM && <TplBox label={hasF ? 'نص شهادات الطلاب' : ''} aria="نص الشهادة للطلاب" value={tp.m} onChange={setM} varNames={varNames} example={sentenceFor(tp.id, 'm')} />}

      {hasF && (
        <div className="space-y-2">
          <TplBox label="نص شهادات الطالبات" aria="نص الشهادة للطالبات" value={tp.f} onChange={setF} varNames={varNames} example={sentenceFor(tp.id, 'f')} />
          {!tp.fOk && (
            <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(224,181,98,.2)' }}>
              <p className="text-[13px] font-bold leading-[1.7] text-[#6B4C14]">نسخنا نص الطلاب هنا. غيّر ما يخص المذكر (مثل «لإنجازه»)، ثم اضغط «تمام».</p>
              {sugg.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sugg.map((x) => (
                    <button key={x.from} type="button" onClick={() => setF(replaceWord(tp.f, x.from, x.to))} className={pill} style={soft}>
                      {x.from} ← <b>{x.to}</b>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => upd((t) => ({ ...t, fOk: true, fTouched: true }))} className={btn + ' btn-cta'}><Check size={15} /> تمام، نص الطالبات سليم</button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => upd((t) => ({ ...t, m: DEFAULT_TPL.m, f: DEFAULT_TPL.f, fTouched: false, fOk: true }))}
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#8A6425] cursor-pointer min-h-[36px]"><RotateCcw size={13} /> أعد الجملة الجاهزة</button>
        {!multi && (
          <button type="button" onClick={addTemplate} className="text-[12.5px] font-bold text-[#0B3B33] underline underline-offset-4 cursor-pointer min-h-[36px]">
            شهادة بصيغة مختلفة لبعض الطلاب؟
          </button>
        )}
        {multi && <button type="button" onClick={removeTemplate} className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#9A3B2E] cursor-pointer min-h-[36px] ms-auto"><Trash2 size={13} /> احذف هذه الصيغة</button>}
      </div>
    </div>
  )
}
