import { RotateCcw, ImagePlus, X } from 'lucide-react'
import { Segmented, Toggle, Select, Field } from '../controls'
import { DESIGNS, DEFAULT_COLOR, SPACINGS } from '../certificate'

/* مصغّر التصاميم المرسومة بالكود */
function DesignSwatch({ id }) {
  const bg = id === 'ink' ? '#0B3B33' : '#FBF7EE'
  const line = id === 'ink' ? '#E0B562' : '#B8863A'
  return (
    <div className="relative w-full rounded-md overflow-hidden" style={{ aspectRatio: '1.414', background: bg }}>
      {id === 'band'
        ? <><div className="absolute inset-y-0 right-0 w-[22%]" style={{ background: '#0B3B33' }} /><div className="absolute inset-[7%] end-[26%]" style={{ boxShadow: `inset 0 0 0 1px ${line}` }} /></>
        : <div className="absolute inset-[6%]" style={{ boxShadow: `inset 0 0 0 1.5px ${line}` }} />}
    </div>
  )
}

/* الخطوة 4: شكل الشهادة. الإطار واللون، وأدناهما التباعد والختم. */
export default function LookPanel({ logo, onLogo, clearLogo, logoErr, design, pickDesign, colorLive, setColorLive, colorSet, spacing, setSpacing, sealSpot, setSealSpot, datePos, setDatePos }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[13.5px] font-bold text-[#1A2E28] mb-1.5">شعار المعهد (اختياري)</div>
        <input type="file" accept="image/*" onChange={onLogo} className="sr-only" id="in-logo" />
        {logo ? (
          <div className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
            <img src={logo.src} alt="شعار المعهد" width="48" height="48" className="w-12 h-12 object-contain" />
            <span className="flex-1 text-[13px] text-[#4A5D56]">يظهر في رأس الشهادة.</span>
            <button type="button" onClick={clearLogo} aria-label="إزالة الشعار" className="w-10 h-10 rounded-lg grid place-items-center cursor-pointer" style={{ background: '#F1ECDF' }}><X size={16} /></button>
          </div>
        ) : (
          <label htmlFor="in-logo" className="flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold cursor-pointer min-h-[46px]"
            style={{ background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1.5px rgba(184,134,58,.45)', borderStyle: 'dashed' }}>
            <ImagePlus size={17} /> ارفع الشعار
          </label>
        )}
        <p className="text-[12px] text-[#5E6E67] mt-1.5">{logoErr || 'يبقى في جهازك ولا يُرفع إلى أي خادم. الأفضل PNG بخلفية شفافة.'}</p>
      </div>

      <div>
        <div className="text-[13.5px] font-bold text-[#1A2E28] mb-2">الإطار</div>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="تصميم الشهادة">
          {DESIGNS.map((d) => (
            <button key={d.id} type="button" role="radio" aria-checked={design === d.id} onClick={() => pickDesign(d.id)}
              className="rounded-xl p-1.5 text-center cursor-pointer transition-shadow"
              style={design === d.id ? { background: '#0B3B33', color: '#F8F5EC' } : { background: '#FDFBF7', color: '#1A2E28', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              {d.thumb ? <img src={d.thumb} alt="" width="360" height="255" loading="lazy" className="w-full h-auto rounded-md" /> : <DesignSwatch id={d.id} />}
              <span className="block font-black text-[12px] mt-1.5 leading-tight">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="lk-color" className="block text-[13.5px] font-bold text-[#1A2E28] mb-1.5">لون الشهادة</label>
        <div className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
          <input id="lk-color" type="color" value={colorLive} onChange={(e) => setColorLive(e.target.value)} className="w-12 h-10 shrink-0 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
          <span className="flex-1 text-[13px] text-[#4A5D56]">لون معهدك: يلوّن الإطار والعنوان والزخارف، ويبقى الذهب.</span>
          {colorSet && (
            <button type="button" onClick={() => setColorLive(DEFAULT_COLOR)} className="shrink-0 inline-flex items-center gap-1 text-[12.5px] font-bold text-[#8A6425] cursor-pointer min-h-[36px] px-2"><RotateCcw size={13} /> الأصلي</button>
          )}
        </div>
      </div>

      <Field label="مكان التاريخ" htmlFor="lk-dpos">
        <Select id="lk-dpos" value={datePos} onChange={setDatePos}>
          <option value="bottom">أسفل الشهادة فوق التوقيعين</option><option value="inline">داخل جملة الشهادة</option>
        </Select>
      </Field>

      <Segmented label="التباعد بين النصوص" value={spacing} onChange={setSpacing} size="sm" options={SPACINGS.map((s) => ({ value: s.id, label: s.label }))} />
      <Toggle label="مكان لختم المعهد" checked={sealSpot} onChange={setSealSpot} hint="دائرة منقّطة بين التوقيعين." />
    </div>
  )
}
