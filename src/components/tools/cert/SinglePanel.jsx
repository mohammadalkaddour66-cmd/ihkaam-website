import { Field, TextInput, TextArea, Segmented } from '../controls'
import { KickerField, TitleField, AutoLine, DateFields, SignatureFields } from './fields.jsx'
import { SINGLE_DEFAULT } from './model.js'

/* «شهادة واحدة»: كل ما تقوله الشهادة في لوحة واحدة، بترتيب ظهوره عليها من الأعلى إلى الأسفل.
   بلا حقول ولا قطع: يكتب المدير النص الذي يريده وينتهي. */
export default function SinglePanel({
  aud, setAud, single, setSingle, name, setName, autoLines, kicker, setKicker, text, setText,
  date, setDate, dateMode, setDateMode, place, setPlace, sigs,
}) {
  const set = (k) => (v) => setSingle((s) => ({ ...s, [k]: v }))
  const g = aud === 'f' ? 'f' : 'm'
  return (
    <div className="space-y-5">
      <Segmented label="الشهادة لـ" value={g} onChange={setAud} size="sm" options={[{ value: 'm', label: 'طالب' }, { value: 'f', label: 'طالبة' }]} />
      <KickerField kicker={kicker} setKicker={setKicker} />
      <TitleField value={single.title} onChange={set('title')} />
      <Field label={g === 'f' ? 'اسم الطالبة' : 'اسم الطالب'} htmlFor="f-name">
        <TextInput id="f-name" value={name} onChange={setName} placeholder="الاسم الثلاثي كما في سجل المعهد" maxLength={48} />
      </Field>
      <AutoLine id={`f-intro-${g}`} label="سطر المقدمة" value={single.intro} auto={autoLines[g].intro} onChange={set('intro')} max={90} />
      <Field label="جملة الشهادة" htmlFor={`f-body-${g}`} hint="اكتب ما أنجزه الطالب بصياغتك.">
        <TextArea id={`f-body-${g}`} value={single.body ?? SINGLE_DEFAULT[g]} onChange={set('body')} rows={3} maxLength={300} />
      </Field>
      <AutoLine id={`f-dua-${g}`} label="سطر الدعاء" hint="اتركه فارغاً لإخفائه." value={single.dua} auto={autoLines[g].dua} onChange={set('dua')} />
      <DateFields auto={autoLines.when} when={text.when} setWhen={(v) => setText((t) => ({ ...t, when: v }))}
        date={date} setDate={setDate} dateMode={dateMode} setDateMode={setDateMode} place={place} setPlace={setPlace} />
      <SignatureFields sigs={sigs} />
    </div>
  )
}
