import { useRef } from 'react'
import { Check, RotateCcw, AlertTriangle } from 'lucide-react'
import { TextArea, Select } from '../controls'
import { KickerField, TitleField, AutoLine, DateFields, SignatureFields } from './fields.jsx'
import { DEFAULT_TPL, insertToken, inspectTemplate, femaleSuggestions, replaceWord } from '../../../tools/files/template.js'

const ring = { boxShadow: 'inset 0 0 0 1px var(--line-warm)' }
const btn = 'inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold cursor-pointer min-h-[42px]'
const KEYS = { m: { body: 'm', intro: 'mi', dua: 'md' }, f: { body: 'f', intro: 'fi', dua: 'fd' } }

/* جملة الشهادة مع أزرار حقولها. المؤشر يُتتبَّع هنا، فتُدرج القطعة حيث يقف دون أن يفقد المربع تركيزه. */
function SentenceBox({ id, aria, value, onChange, fields, example }) {
  const ta = useRef(null)
  const caret = useRef(null)
  const info = inspectTemplate(value, fields)
  const remember = () => { if (ta.current) caret.current = { s: ta.current.selectionStart, e: ta.current.selectionEnd } }
  function put(n) {
    const c = caret.current
    const r = insertToken(value, c?.s ?? value.length, c?.e ?? c?.s ?? value.length, n)
    onChange(r.text)
    caret.current = { s: r.caret, e: r.caret }
    requestAnimationFrame(() => { if (ta.current && document.activeElement === ta.current) ta.current.setSelectionRange(r.caret, r.caret) })
  }
  return (
    <div className="space-y-2">
      <div className="text-[12.5px] font-bold text-[#5E6E67]">{fields.length ? 'أعمدة جدولك. اضغط عموداً لإدراجه في الجملة:' : 'الجملة نفسها لكل الطلاب. وإن أضفت أعمدة في خطوة «الطلاب» ظهرت هنا لتدرجها.'}</div>
      <div className="flex flex-wrap gap-1.5">
        {fields.map((v) => (
          <button key={v} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => put(v)}
            className="rounded-lg px-3 py-1.5 text-[13px] font-black cursor-pointer min-h-[38px]"
            style={{ background: 'rgba(224,181,98,.28)', color: '#6B4C14', boxShadow: 'inset 0 0 0 1px rgba(184,134,58,.45)' }}>+ {v}</button>
        ))}
      </div>
      <TextArea ref={ta} id={id} value={value} onChange={onChange} rows={3} maxLength={300} aria-label={aria}
        onSelect={remember} onKeyUp={remember} onClick={remember} onBlur={remember} />
      {info.missing.length > 0 && (
        <p className="flex items-start gap-1.5 text-[12.5px] leading-[1.7] text-[#8A4B14]">
          <AlertTriangle size={14} className="mt-1 shrink-0" />
          {info.missing.map((m) => `[${m}]`).join(' و')} ليس عموداً في جدولك، فسيُحذف من الشهادات.
        </p>
      )}
      {example && (
        <p className="text-[13.5px] leading-[1.9] text-[#1A2E28] rounded-xl p-2.5" style={{ background: '#FDFBF7', ...ring }}>
          <span className="block text-[11.5px] font-bold text-[#8A6425]">هكذا تظهر لـ «{example.name}»</span>
          {example.text || '— فارغ —'}
        </p>
      )}
    </div>
  )
}

/* شرح الأعمدة (المتغيرات) لمن لم يستعملها قبل: ما هي، وكيف تُدرج، وماذا يحدث عند كل طالب. بلا أعمدة يدعو إلى إضافتها. */
function VarsGuide({ fields, onAddColumns }) {
  const v = fields[0]
  const tok = (t) => <b className="rounded px-1 text-[#6B4C14]" style={{ background: 'rgba(224,181,98,.35)' }}>[{t}]</b>
  return (
    <div className="rounded-2xl p-3.5 space-y-2.5" style={{ background: 'rgba(224,181,98,.16)' }}>
      <div className="text-[14px] font-black text-[#1A2E28]">{v ? 'كيف تستعمل أعمدتك في الجملة؟' : 'تريد جزءاً من الجملة يختلف بين طالب وآخر؟'}</div>
      {v ? (
        <>
          <ol className="space-y-1.5 text-[13px] leading-[1.8] text-[#3A4A44]">
            <li><b>١.</b> اضغط زر العمود (مثل «+ {v}») تحت جملة الشهادة، فيُدرج في الجملة عند مؤشرك بين قوسين: {tok(v)}.</li>
            <li><b>٢.</b> اكتب حوله ما تشاء من كلام. مثلاً: «تقديراً لحفظه {tok(v)}».</li>
            <li><b>٣.</b> في كل شهادة تُستبدل القطعة بما كتبته لذلك الطالب في الجدول. والمثال تحت الجملة يريك النتيجة.</li>
          </ol>
          <p className="text-[12.5px] leading-[1.8] text-[#6B4C14]">إن تركتَ خانة طالب فارغة سقطت القطعة وكلماتها الملاصقة من شهادته، فلا تخرج جملة ناقصة.</p>
        </>
      ) : (
        <>
          <p className="text-[13px] leading-[1.8] text-[#3A4A44]">الجملة الآن واحدة لكل الطلاب. وإن أردت أن يظهر في شهادة كل طالب شيء يخصه (كإنجازه أو درجته)، فأضف عموداً في خطوة «الطلاب» ثم عُد هنا لتدرجه في الجملة.</p>
          {onAddColumns && <button type="button" onClick={onAddColumns} className="inline-flex items-center gap-1 rounded-xl px-4 min-h-[42px] text-[13px] font-bold cursor-pointer" style={{ background: '#FDFBF7', color: '#0B3B33', ...ring }}>أضف أعمدة في خطوة «الطلاب»</button>}
        </>
      )}
    </div>
  )
}

/* كلمات الطالبات المقترحة للتأنيث: قائمة منسدلة واحدة، تُطبَّق كلمة كلمة أو كلها */
function FemaleWords({ texts, onReplace }) {
  const sugg = femaleSuggestions(texts.join('\n'), 20)
  if (!sugg.length) return null
  return (
    <Select aria-label="كلمات قد تحتاج تأنيثاً" value="" onChange={(v) => {
      if (v === '*') sugg.forEach((x) => onReplace(x.from, x.to))
      else { const x = sugg.find((y) => y.from === v); if (x) onReplace(x.from, x.to) }
    }}>
      <option value="">كلمات قد تحتاج تأنيثاً ({sugg.length}) ▾</option>
      {sugg.map((x) => <option key={x.from} value={x.from}>{x.from} ← {x.to}</option>)}
      {sugg.length > 1 && <option value="*">أنّث كل الكلمات أعلاه</option>}
    </Select>
  )
}

/* الخطوة الأولى: ماذا تقول الشهادة؟ لكل جنس مقدمته وجملته ودعاؤه، فلا يتشارك الطلاب والطالبات نصاً بضمير واحد. */
export default function TextPanel({
  aud, templates, setTemplates, varNames, onAddColumns, sentenceFor, autoLines,
  text, setText, kicker, setKicker,
  date, setDate, dateMode, setDateMode, place, setPlace, sigs,
}) {
  const tp = templates[0] /* صيغة واحدة لكل الطلاب: البساطة أولى */
  const fields = varNames
  /* الجملة الجاهزة تشمل أعمدة ملفه (التقدير، الدرجة…) */
  const ready = { m: DEFAULT_TPL.m, f: DEFAULT_TPL.f }
  const groups = aud === 'both' ? ['m', 'f'] : [aud]

  const upd = (fn) => setTemplates((ts) => ts.map((t) => (t.id === tp.id ? fn(t) : t)))
  /* تعديل نص الطلاب ما دام نص الطالبات لم يُكتب: يُنسخ إليهنّ وينتظر مراجعة المدير. وإن عاد إلى الجاهز عادت الطالبات إليه. */
  function setField(g, kind, v) {
    upd((t) => {
      if (g === 'f') return { ...t, [KEYS.f[kind]]: v, fTouched: true, fOk: false }
      let n = { ...t, [KEYS.m[kind]]: v }
      if (!t.fTouched) {
        const back = n.m === ready.m && n.mi == null && n.md == null
        n = back ? { ...n, f: ready.f, fi: null, fd: null, fOk: true } : { ...n, [KEYS.f[kind]]: v, fOk: false }
      }
      return n
    })
  }
  const replaceInFemale = (from, to) => upd((t) => ({
    ...t, fTouched: true, fOk: false,
    f: replaceWord(t.f, from, to),
    fi: t.fi == null ? t.fi : replaceWord(t.fi, from, to),
    fd: t.fd == null ? t.fd : replaceWord(t.fd, from, to),
  }))

  const line = (g, kind, label, hint) => (
    <AutoLine id={`f-${kind}-${g}`} label={label} hint={hint} value={tp[KEYS[g][kind]]} auto={autoLines[g][kind]}
      onChange={(v) => setField(g, kind, v)} max={kind === 'intro' ? 90 : 120} />
  )

  return (
    <div className="space-y-5">
      <KickerField kicker={kicker} setKicker={setKicker} />
      <TitleField value={tp.title} onChange={(v) => upd((t) => ({ ...t, title: v }))} />

      <VarsGuide fields={fields} onAddColumns={onAddColumns} />

      {groups.map((g) => (
        <div key={g} className="space-y-3 rounded-2xl p-3.5" style={{ background: '#F8F5EC', ...ring }}>
          {aud === 'both' && <div className="text-[14px] font-black text-[#1A2E28]">{g === 'm' ? 'للطلاب' : 'للطالبات'}</div>}
          {line(g, 'intro', 'سطر المقدمة')}
          <div>
            <div className="text-[13.5px] font-bold text-[#1A2E28] mb-1.5">جملة الشهادة</div>
            <SentenceBox id={`f-body-${g}`} aria={g === 'm' ? 'جملة الشهادة للطلاب' : 'جملة الشهادة للطالبات'} value={tp[KEYS[g].body]} onChange={(v) => setField(g, 'body', v)}
              fields={fields} example={sentenceFor(tp.id, g)} />
          </div>
          {line(g, 'dua', 'سطر الدعاء', 'اتركه فارغاً لإخفائه.')}
          {g === 'f' && !tp.fOk && (
            <div className="rounded-xl p-3 space-y-2.5" style={{ background: 'rgba(224,181,98,.25)' }}>
              <p className="text-[13px] font-bold leading-[1.7] text-[#6B4C14]">نسخنا نص الطلاب إلى هنا. غيّر ما يخص المذكر ثم اضغط «تمام».</p>
              <FemaleWords texts={[tp.f, tp.fi ?? '', tp.fd ?? '']} onReplace={replaceInFemale} />
              <button type="button" onClick={() => upd((t) => ({ ...t, fOk: true, fTouched: true }))} className={btn + ' btn-cta w-full'}><Check size={15} /> تمام، نص الطالبات سليم</button>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => upd((t) => ({ ...t, m: ready.m, f: ready.f, mi: null, fi: null, md: null, fd: null, fTouched: false, fOk: true }))}
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#8A6425] cursor-pointer min-h-[36px]"><RotateCcw size={13} /> أعد كل النصوص الجاهزة</button>
      </div>

      <DateFields auto={autoLines.when} when={text.when} setWhen={(v) => setText((t) => ({ ...t, when: v }))}
        date={date} setDate={setDate} dateMode={dateMode} setDateMode={setDateMode} place={place} setPlace={setPlace} />
      <SignatureFields sigs={sigs} />
    </div>
  )
}
