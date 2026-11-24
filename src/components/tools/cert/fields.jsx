import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Field, TextInput, TextArea, Select, DateInput } from '../controls'
import { TITLES, KICKERS } from '../certificate'

/* حقول مشتركة بين «شهادة واحدة» و«التوليد الجماعي»: كلها بحسب ترتيبها على الشهادة من الأعلى إلى الأسفل. */

const resetBtn = 'inline-flex items-center gap-1 text-[12.5px] font-bold text-[#8A6425] cursor-pointer mt-1 min-h-[32px]'

/* نص في رأس الشهادة: بسملة أو آية أو حديث، أو نص من عند المدير نفسه */
export function KickerField({ kicker, setKicker }) {
  const preset = KICKERS.find((k) => k.text === kicker)
  const [custom, setCustom] = useState(!!kicker && !preset)
  const value = custom ? 'custom' : preset?.id || ''
  function pick(v) {
    if (v === 'custom') { setCustom(true); if (preset) setKicker(''); return }
    setCustom(false)
    setKicker(KICKERS.find((k) => k.id === v)?.text ?? '')
  }
  return (
    <Field label="نص في رأس الشهادة" htmlFor="f-kicker-sel">
      <Select id="f-kicker-sel" value={value} onChange={pick}>
        <option value="">بلا نص</option>
        {KICKERS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
        <option value="custom">نص من عندي…</option>
      </Select>
      {custom && <div className="mt-2"><TextArea id="f-kicker" aria-label="نص الرأس" value={kicker} onChange={setKicker} rows={2} maxLength={200} placeholder="اكتب ما تريد في رأس الشهادة" /></div>}
    </Field>
  )
}

/* عنوان الشهادة: من القائمة، أو عنوان آخر يكتبه */
export function TitleField({ value, onChange }) {
  const v = value || 'شهادة تقدير'
  const inList = TITLES.includes(v)
  return (
    <Field label="عنوان الشهادة" htmlFor="f-title">
      <Select id="f-title" value={inList ? v : '__other'} onChange={(x) => onChange(x === '__other' ? 'عنوان آخر' : x)}>
        {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
        <option value="__other">عنوان آخر…</option>
      </Select>
      {!inList && <div className="mt-2"><TextInput id="f-title2" aria-label="العنوان" value={value} onChange={onChange} maxLength={40} placeholder="اكتب العنوان" /></div>}
    </Field>
  )
}

/* سطر نصي له صيغة تلقائية (فارغ = التلقائي). onChange(null) يعيد التلقائي، و'' يخفي السطر. */
export function AutoLine({ id, label, hint, value, auto, onChange, max = 120 }) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <TextInput id={id} value={value != null ? value : auto} onChange={onChange} maxLength={max} />
      {value != null && <button type="button" onClick={() => onChange(null)} className={resetBtn}><RotateCcw size={13} /> أعد الصيغة الجاهزة</button>}
    </Field>
  )
}

/* سطر التاريخ وخياراته معاً: يُعدَّل السطر مباشرة، أو يُغيَّر التاريخ وطريقة كتابته فيتبعها السطر */
export function DateFields({ auto, when, setWhen, date, setDate, dateMode, setDateMode, place, setPlace }) {
  const follow = (fn) => (v) => { fn(v); setWhen(null) }
  return (
    <div className="space-y-3">
      <AutoLine id="f-when" label="سطر التاريخ" value={when} auto={auto} onChange={setWhen} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="التاريخ" htmlFor="f-date"><DateInput id="f-date" value={date} onChange={follow(setDate)} /></Field>
        <Field label="يُكتب" htmlFor="f-dmode">
          <Select id="f-dmode" value={dateMode} onChange={follow(setDateMode)}>
            <option value="both">هجري وميلادي</option><option value="hijri">هجري</option><option value="gregorian">ميلادي</option>
          </Select>
        </Field>
      </div>
      <Field label="مكان التحرير (اختياري)" htmlFor="f-place" hint="«حُرّر في الرياض بتاريخ…»">
        <TextInput id="f-place" value={place} onChange={follow(setPlace)} placeholder="الرياض" maxLength={30} />
      </Field>
    </div>
  )
}

/* التواقيع: الصفة والاسم لكل موقّع */
export function SignatureFields({ sigs }) {
  return (
    <div>
      <div className="text-[13.5px] font-bold text-[#1A2E28] mb-2">التواقيع (الصفة والاسم)</div>
      <div className="space-y-2.5">
        {sigs.map((g, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <TextInput id={`f-sig-${i + 1}`} aria-label={`الصفة ${i + 1}`} value={g.v.role} onChange={(x) => g.set({ ...g.v, role: x })} maxLength={30} placeholder={['المعلم', 'مدير المعهد', 'المشرف (اختياري)'][i]} />
            <TextInput aria-label={`اسم الموقّع ${i + 1}`} value={g.v.name} onChange={(x) => g.set({ ...g.v, name: x })} maxLength={40} placeholder="الاسم (اختياري)" />
          </div>
        ))}
      </div>
      <p className="text-[12.5px] text-[#5E6E67] mt-1.5">امسح الصفة والاسم معاً لإخفاء التوقيع. الثالث يظهر في الوسط بدل مكان الختم.</p>
    </div>
  )
}
