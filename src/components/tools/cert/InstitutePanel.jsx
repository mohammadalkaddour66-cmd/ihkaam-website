import { ImagePlus, X } from 'lucide-react'
import { Field, TextInput } from '../controls'

const ring = { boxShadow: 'inset 0 0 0 1px var(--line-warm)' }

/* من يمنح الشهادة؟ اسم المعهد وحلقته وشعاره فقط. تُحفظ في المتصفح فلا تُكتب مرة ثانية. */
export default function InstitutePanel({ institute, setInstitute, halaqa, setHalaqa, logo, onLogo, clearLogo, logoErr }) {
  return (
    <div className="space-y-5">
      <Field label="اسم المعهد" htmlFor="in-name" hint="يُكتب كما هو: «معهد النور لتحفيظ القرآن».">
        <TextInput id="in-name" value={institute} onChange={setInstitute} placeholder="معهد النور لتحفيظ القرآن" maxLength={60} />
      </Field>

      <Field label="اسم الحلقة (اختياري)" htmlFor="in-halaqa" hint="تُضاف «في حلقة …» إلى جملة الشهادة.">
        <TextInput id="in-halaqa" value={halaqa} onChange={setHalaqa} placeholder="مثال: حلقة الشيخ أحمد" maxLength={40} />
      </Field>

      <div>
        <div className="text-[13.5px] font-bold text-[#1A2E28] mb-1.5">شعار المعهد (اختياري)</div>
        <input type="file" accept="image/*" onChange={onLogo} className="sr-only" id="in-logo" />
        {logo ? (
          <div className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: '#FDFBF7', ...ring }}>
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
    </div>
  )
}
