import { useId } from 'react'
import { SURAHS } from './surahs'
import { Select, NumberInput } from './controls'
import { count } from './format'


export function SurahSelect({ id, value, onChange, from = 1, to = 114, reverse = false }) {
  const list = SURAHS.filter((s) => s.n >= from && s.n <= to)
  if (reverse) list.reverse()
  return (
    <Select id={id} value={value} onChange={(v) => onChange(Number(v))}>
      {list.map((s) => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
    </Select>
  )
}

/* سورة وآية: الآية تُقيَّد بعدد آيات السورة */
export function SurahAyahPicker({ label, surah, ayah, onChange, reverse = false }) {
  const id = useId()
  const max = SURAHS[surah - 1]?.ayat || 1
  return (
    <div>
      <label htmlFor={id} className="block text-[13.5px] font-bold text-[#1A2E28] mb-1.5">{label}</label>
      <div className="grid grid-cols-[1fr_6.5rem] gap-2">
        <SurahSelect id={id} value={surah} reverse={reverse} onChange={(s) => onChange({ surah: s, ayah: 1 })} />
        <div className="relative">
          <NumberInput aria-label="رقم الآية" value={ayah} min={1} max={max}
            onChange={(v) => onChange({ surah, ayah: v === '' ? '' : Math.max(1, Math.min(max, Math.round(v))) })} />
          <span className="absolute top-1/2 -translate-y-1/2 start-3 text-[12px] font-bold text-[#8A6425] pointer-events-none">آية</span>
        </div>
      </div>
      <p className="text-[12px] text-[#5E6E67] mt-1.5">سورة {SURAHS[surah - 1]?.name}: {count(max, 'ayah')}، تبدأ في صفحة {SURAHS[surah - 1]?.pages[0]}.</p>
    </div>
  )
}
