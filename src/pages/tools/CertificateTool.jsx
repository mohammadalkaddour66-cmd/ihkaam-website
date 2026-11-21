import { useEffect, useRef, useState } from 'react'
import {
  ImagePlus, X, Settings2, BadgeCheck, CalendarDays, ScrollText, PenLine, Printer, FileDown, ImageDown, Share2, Loader2,
  PencilLine, Users, SlidersHorizontal, RotateCcw, Layers,
} from 'lucide-react'
import ToolLayout from '../../components/tools/ToolLayout'
import { CertificateVisual } from '../../components/tools/ToolVisuals'
import { Field, TextInput, TextArea, DateInput, Select, Segmented, Toggle, Panel } from '../../components/tools/controls'
import { SurahSelect } from '../../components/tools/SurahPicker'
import { surahName } from '../../components/tools/surahs'
import { useDateField, usePrint, useCanShareFiles } from '../../components/tools/hooks'
import { PrintPortal } from '../../components/tools/print'
import CertBulk from '../../components/tools/CertBulk'
import { canvasToBlob, saveBlob, shareBlob, safeFileName } from '../../components/tools/canvasKit'
import { juzLabel } from '../../components/tools/format'
import {
  drawCertificate, loadImageFile, certificatePlainText, certificateLines, preloadDesign,
  DESIGNS, TITLES, KICKERS, SPACINGS, CERT_W, CERT_H,
} from '../../components/tools/certificate'
import { certificatesPdf } from '../../components/tools/certificatePdf'
import { getTool } from '../../config/tools'

const tool = getTool('certificate')
const JUZ = Array.from({ length: 30 }, (_, i) => i + 1)

/* خيارات شهادة طالب واحد من القائمة الجماعية: اسمه، وإنجازه إن كتب له، وجنسه إن حُدِّد */
function studentOpts(base, s) {
  return {
    ...base,
    name: s.name,
    gender: s.gender || base.gender,
    achievement: s.ach ? { type: 'custom', text: s.ach } : base.achievement,
    text: s.ach ? { ...base.text, body: null } : base.text,
  }
}

/* زر «صيغة الأداة» يظهر حين يكتب المستخدم فوق النص المقترح */
function ResetLink({ show, onClick }) {
  if (!show) return null
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#8A6425] cursor-pointer mt-1.5 min-h-[32px]">
      <RotateCcw size={13} /> أعد صيغة الأداة
    </button>
  )
}

const actionBtn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-bold cursor-pointer transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed'
const softBtn = { background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }

export default function CertificateTool() {
  const [date, setDate] = useDateField()
  const [mode, setMode] = useState('single')
  const [gender, setGender] = useState('m')
  const [name, setName] = useState('')
  const [achType, setAchType] = useState('juz')
  const [juz, setJuz] = useState(30)
  const [juzFrom, setJuzFrom] = useState(28)
  const [juzTo, setJuzTo] = useState(30)
  const [surah, setSurah] = useState(67)
  const [custom, setCustom] = useState('')
  const [institute, setInstitute] = useState('')
  const [halaqa, setHalaqa] = useState('')
  const [sig1, setSig1] = useState({ role: 'المعلم', name: '' })
  const [sig2, setSig2] = useState({ role: 'مدير المعهد', name: '' })
  const [title, setTitle] = useState(TITLES[0])
  const [kicker, setKicker] = useState('')
  const [text, setText] = useState({ intro: null, body: null, when: null, dua: null })
  const [dateMode, setDateMode] = useState('both')
  const [design, setDesign] = useState('art-gold')
  const [spacing, setSpacing] = useState('auto')
  const [sealSpot, setSealSpot] = useState(true)
  const [logo, setLogo] = useState(null)
  const [logoErr, setLogoErr] = useState('')
  const [students, setStudents] = useState([])
  const [previewIdx, setPreviewIdx] = useState(0)
  const [printJob, setPrintJob] = useState(null) // { src, link }
  const [busy, setBusy] = useState('')
  const [progress, setProgress] = useState(null)
  const [msg, setMsg] = useState('')
  const canvasRef = useRef(null)
  const cancelRef = useRef(false)
  const { printing, print } = usePrint()
  const sharable = useCanShareFiles()

  const achievement = achType === 'juz' ? { type: 'juz', juz }
    : achType === 'juzRange' ? { type: 'juzRange', from: juzFrom, to: juzTo }
      : achType === 'surah' ? { type: 'surah', surahName: surahName(surah) }
        : achType === 'quran' ? { type: 'quran' } : { type: 'custom', text: custom }

  const base = { gender, achievement, institute, halaqa, sig1, sig2, title, kicker, text, date, dateMode, design, spacing, sealSpot, logo }
  const bulk = mode === 'bulk'
  const shown = bulk ? students[Math.min(previewIdx, students.length - 1)] : null
  const opts = bulk ? studentOpts(base, shown || { name: '', ach: '', gender: '' }) : { ...base, name }
  const auto = certificateLines({ ...opts, text: {} })
  const optsKey = JSON.stringify({ ...opts, logo: logo ? logo.src.length : 0 })

  /* يُعاد الرسم بعد توقف الكتابة لحظة: الرسم بدقة الطباعة أثقل من أن يتبع كل حرف */
  useEffect(() => {
    if (!date || !canvasRef.current) return
    const t = setTimeout(() => { drawCertificate(canvasRef.current, opts) }, 140)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optsKey])

  async function onLogo(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { setLogo(await loadImageFile(f)); setLogoErr('') } catch (err) { setLogoErr(err.message) }
  }

  const setT = (k) => (v) => setText((t) => ({ ...t, [k]: v }))
  const resetT = (k) => () => setText((t) => ({ ...t, [k]: null }))
  const shownT = (k) => (text[k] != null ? text[k] : auto[k])
  const pickDesign = (id) => { preloadDesign(id); setDesign(id) }

  async function render(o) {
    const cv = document.createElement('canvas')
    const { link } = await drawCertificate(cv, o)
    return { cv, link }
  }

  async function onPrint() {
    setBusy('print'); setMsg('')
    try {
      const { cv, link } = await render(opts)
      setPrintJob({ src: cv.toDataURL('image/png'), link })
      print({ landscape: true })
    } finally { setBusy('') }
  }

  async function onPng() {
    setBusy('png'); setMsg('')
    try {
      const { cv } = await render(opts)
      saveBlob(await canvasToBlob(cv, 'image/png'), `شهادة-${safeFileName(opts.name, 'تقدير')}.png`)
      setMsg('حُفظت صورة PNG بدقة الطباعة (2339×1654) في مجلد التنزيلات.')
    } catch { setMsg('تعذّر إنشاء الصورة. جرّب مرة أخرى.') } finally { setBusy('') }
  }

  async function onShare() {
    setBusy('share'); setMsg('')
    try {
      const { cv } = await render(opts)
      const blob = await canvasToBlob(cv, 'image/png')
      const fname = `شهادة-${safeFileName(opts.name, 'تقدير')}.png`
      try { await shareBlob(blob, fname, 'شهادة تقدير') } catch (e) { if (e?.name !== 'AbortError') saveBlob(blob, fname) }
    } catch { setMsg('تعذّر إنشاء الصورة. جرّب مرة أخرى.') } finally { setBusy('') }
  }

  async function onPdf() {
    setBusy('pdf'); setMsg('')
    try {
      const blob = await certificatesPdf([opts], { quality: 0.93, title: 'شهادة تقدير' })
      saveBlob(blob, `شهادة-${safeFileName(opts.name, 'تقدير')}.pdf`)
      setMsg('حُفظ ملف PDF بصفحة A4 أفقية، ورابط إحكام فيه قابل للنقر.')
    } catch { setMsg('تعذّر إنشاء PDF. جرّب مرة أخرى.') } finally { setBusy('') }
  }

  async function onBulkPdf() {
    const valid = students.filter((s) => s.name.trim())
    if (!valid.length) return
    cancelRef.current = false
    setBusy('bulk'); setMsg(''); setProgress({ done: 0, total: valid.length })
    try {
      const blob = await certificatesPdf(valid.map((s) => studentOpts(base, s)), {
        scale: 0.75, quality: 0.9, title: 'شهادات الطلاب',
        onProgress: (done, total) => setProgress({ done, total }),
        isCancelled: () => cancelRef.current,
      })
      const mb = (blob.size / 1048576).toFixed(1)
      saveBlob(blob, `شهادات-${valid.length}-طالب.pdf`)
      setMsg(`حُفظ ملف واحد فيه ${valid.length} شهادة (${mb} م.ب.)، صفحة A4 أفقية لكل طالب، جاهز للطباعة.`)
    } catch (e) {
      setMsg(e.message === 'cancelled' ? 'أُلغي التوليد.' : 'تعذّر توليد الملف. قلّل عدد الطلاب في الدفعة وأعد المحاولة.')
    } finally { setBusy(''); setProgress(null) }
  }

  const pct = progress ? Math.round((progress.done / progress.total) * 100) : 0
  const validCount = students.filter((s) => s.name.trim()).length

  return (
    <ToolLayout
      tool={tool}
      lead="اكتب اسم الطالب وما حفظه، وعدّل أي عبارة في الشهادة بحرية، واختر الإطار. تتغير الشهادة أمامك مع كل حرف، ثم تحمّلها PDF أو صورة PNG أو تطبعها. ولمعهدٍ فيه عشرات الطلاب: ارفع ملف Excel أو الصق الأسماء، فيخرج PDF واحد بصفحة لكل طالب."
      visual={<CertificateVisual />}
      method={METHOD}
      faq={FAQ}
    >
      <div className="grid lg:grid-cols-[400px_minmax(0,1fr)] gap-6 items-start">
        <div className="space-y-6">
          <Panel title="بيانات الشهادة" icon={Settings2}>
            <div className="space-y-5">
              <Segmented value={mode} onChange={setMode} size="sm"
                options={[{ value: 'single', label: 'شهادة واحدة' }, { value: 'bulk', label: 'توليد جماعي للمعهد' }]} />
              <Segmented value={gender} onChange={setGender} size="sm" options={[{ value: 'm', label: 'طالب' }, { value: 'f', label: 'طالبة' }]} />
              {!bulk && (
                <Field label={gender === 'm' ? 'اسم الطالب' : 'اسم الطالبة'} htmlFor="ct-name" hint="الاسم الثلاثي كما في سجل المعهد.">
                  <TextInput id="ct-name" value={name} onChange={setName} placeholder="عبد الله محمد أحمد" maxLength={48} />
                </Field>
              )}
              <Field label={bulk ? 'الإنجاز العام (لمن لا إنجاز مكتوباً له في الجدول)' : 'الإنجاز'} htmlFor="ct-ach">
                <Select id="ct-ach" value={achType} onChange={setAchType}>
                  <option value="juz">حفظ جزء</option>
                  <option value="juzRange">حفظ عدة أجزاء</option>
                  <option value="surah">حفظ سورة</option>
                  <option value="quran">ختم القرآن كاملاً</option>
                  <option value="custom">سبب آخر (أكتبه بنفسي)</option>
                </Select>
              </Field>
              {achType === 'juz' && (
                <Field label="الجزء" htmlFor="ct-juz">
                  <Select id="ct-juz" value={juz} onChange={(v) => setJuz(Number(v))}>{JUZ.map((j) => <option key={j} value={j}>{juzLabel(j)}</option>)}</Select>
                </Field>
              )}
              {achType === 'juzRange' && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="من الجزء" htmlFor="ct-jf"><Select id="ct-jf" value={juzFrom} onChange={(v) => setJuzFrom(Number(v))}>{JUZ.map((j) => <option key={j} value={j}>{j}</option>)}</Select></Field>
                  <Field label="إلى الجزء" htmlFor="ct-jt"><Select id="ct-jt" value={juzTo} onChange={(v) => setJuzTo(Number(v))}>{JUZ.map((j) => <option key={j} value={j}>{j}</option>)}</Select></Field>
                </div>
              )}
              {achType === 'surah' && (
                <Field label="السورة" htmlFor="ct-surah"><SurahSelect id="ct-surah" value={surah} onChange={setSurah} /></Field>
              )}
              {achType === 'custom' && (
                <Field label="تقديراً لـ…" htmlFor="ct-custom" hint="مثل: تميّزه في التسميع خلال الفصل الأول. اكتب ما يؤيده السجل.">
                  <TextInput id="ct-custom" value={custom} onChange={setCustom} placeholder={gender === 'm' ? 'تميّزه في التسميع خلال الفصل الأول' : 'تميّزها في التسميع خلال الفصل الأول'} maxLength={90} />
                </Field>
              )}
              <Field label="اسم المعهد" htmlFor="ct-inst" hint="يُكتب كما هو: «معهد النور لتحفيظ القرآن».">
                <TextInput id="ct-inst" value={institute} onChange={setInstitute} placeholder="معهد النور لتحفيظ القرآن" maxLength={60} />
              </Field>
              <Field label="الحلقة" htmlFor="ct-halaqa"><TextInput id="ct-halaqa" value={halaqa} onChange={setHalaqa} placeholder="اختياري" maxLength={40} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="التاريخ" htmlFor="ct-date"><DateInput id="ct-date" value={date} onChange={setDate} /></Field>
                <Field label="يُكتب" htmlFor="ct-dmode">
                  <Select id="ct-dmode" value={dateMode} onChange={setDateMode}>
                    <option value="both">هجري وميلادي</option><option value="hijri">هجري</option><option value="gregorian">ميلادي</option>
                  </Select>
                </Field>
              </div>

              <div>
                <div className="text-[13.5px] font-bold text-[#1A2E28] mb-1.5">شعار المعهد</div>
                <input type="file" accept="image/*" onChange={onLogo} className="sr-only" id="ct-logo" />
                {logo ? (
                  <div className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                    <img src={logo.src} alt="شعار المعهد" width="48" height="48" className="w-12 h-12 object-contain" />
                    <span className="flex-1 text-[13px] text-[#4A5D56]">يظهر الشعار في رأس الشهادة.</span>
                    <button type="button" onClick={() => setLogo(null)} aria-label="إزالة الشعار" className="w-10 h-10 rounded-lg grid place-items-center cursor-pointer" style={{ background: '#F1ECDF' }}><X size={16} /></button>
                  </div>
                ) : (
                  <label htmlFor="ct-logo" className="flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold cursor-pointer min-h-[46px]"
                    style={{ background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1.5px rgba(184,134,58,.45)', borderStyle: 'dashed' }}>
                    <ImagePlus size={17} /> ارفع الشعار (اختياري)
                  </label>
                )}
                <p className="text-[12px] text-[#5E6E67] mt-1.5">{logoErr || 'يبقى الشعار في جهازك ولا يُرفع إلى أي خادم. الأفضل PNG بخلفية شفافة.'}</p>
              </div>
            </div>
          </Panel>

          <Panel title="نصوص الشهادة: اكتب فوقها كما تشاء" icon={PencilLine}>
            <div className="space-y-5">
              <p className="text-[13px] leading-[1.8] text-[#5E6E67] -mt-2">الحقول مملوءة بصيغة الأداة. غيّر أي عبارة فتصير عبارتك هي المطبوعة، ويمكنك إعادة الصيغة الجاهزة في أي وقت. اترك الحقل فارغاً ليختفي سطره.</p>

              <Field label="نص في رأس الشهادة" htmlFor="ct-kicker">
                <TextArea id="ct-kicker" value={kicker} onChange={setKicker} rows={2} maxLength={200} placeholder="بسم الله الرحمن الرحيم" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {KICKERS.map((k) => (
                    <button key={k.id} type="button" onClick={() => setKicker(k.text)} className="rounded-full px-3 py-1.5 text-[12.5px] font-bold cursor-pointer min-h-[34px]" style={softBtn}>{k.label}</button>
                  ))}
                  {kicker && <button type="button" onClick={() => setKicker('')} className="rounded-full px-3 py-1.5 text-[12.5px] font-bold cursor-pointer min-h-[34px] text-[#9A3B2E]" style={{ background: '#FDFBF7' }}>بلا نص</button>}
                </div>
              </Field>

              <Field label="العنوان الرئيسي" htmlFor="ct-title">
                <TextInput id="ct-title" value={title} onChange={setTitle} maxLength={40} placeholder="شهادة تقدير" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TITLES.map((t) => (
                    <button key={t} type="button" onClick={() => setTitle(t)} aria-pressed={title === t} className="rounded-full px-3 py-1.5 text-[12.5px] font-bold cursor-pointer min-h-[34px]"
                      style={title === t ? { background: '#0B3B33', color: '#F8F5EC' } : softBtn}>{t}</button>
                  ))}
                </div>
              </Field>

              <Field label="سطر المقدمة" htmlFor="ct-intro">
                <TextInput id="ct-intro" value={shownT('intro')} onChange={setT('intro')} maxLength={90} />
                <ResetLink show={text.intro != null} onClick={resetT('intro')} />
              </Field>
              <Field label="نص المتن" htmlFor="ct-body">
                <TextArea id="ct-body" value={shownT('body')} onChange={setT('body')} rows={3} maxLength={300} />
                <ResetLink show={text.body != null} onClick={resetT('body')} />
              </Field>
              <Field label="سطر التاريخ" htmlFor="ct-when">
                <TextInput id="ct-when" value={shownT('when')} onChange={setT('when')} maxLength={120} />
                <ResetLink show={text.when != null} onClick={resetT('when')} />
              </Field>
              <Field label="سطر الدعاء" htmlFor="ct-dua">
                <TextInput id="ct-dua" value={shownT('dua')} onChange={setT('dua')} maxLength={120} />
                <ResetLink show={text.dua != null} onClick={resetT('dua')} />
              </Field>
              {bulk && <p className="text-[12.5px] leading-[1.7] text-[#8A6425] font-bold">في التوليد الجماعي: إن بقيت الحقول بصيغة الأداة تتغير لكل طالب (اسمه وجنسه وإنجازه). وإن كتبتَ فيها فكتابتك تسري على الجميع.</p>}

              <div>
                <div className="text-[13.5px] font-bold text-[#1A2E28] mb-2">التوقيعان (الصفة والاسم)</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="الصفة الأولى" htmlFor="ct-r1"><TextInput id="ct-r1" value={sig1.role} onChange={(v) => setSig1({ ...sig1, role: v })} maxLength={30} placeholder="المعلم" /></Field>
                  <Field label="الاسم" htmlFor="ct-n1"><TextInput id="ct-n1" value={sig1.name} onChange={(v) => setSig1({ ...sig1, name: v })} maxLength={40} placeholder="اختياري" /></Field>
                  <Field label="الصفة الثانية" htmlFor="ct-r2"><TextInput id="ct-r2" value={sig2.role} onChange={(v) => setSig2({ ...sig2, role: v })} maxLength={30} placeholder="مدير المعهد" /></Field>
                  <Field label="الاسم" htmlFor="ct-n2"><TextInput id="ct-n2" value={sig2.name} onChange={(v) => setSig2({ ...sig2, name: v })} maxLength={40} placeholder="اختياري" /></Field>
                </div>
                <p className="text-[12.5px] text-[#5E6E67] mt-1.5">امسح الصفة والاسم معاً لإخفاء التوقيع.</p>
              </div>
            </div>
          </Panel>

          {bulk && (
            <Panel title="قائمة الطلاب" icon={Users}>
              <CertBulk students={students} setStudents={setStudents} previewIdx={previewIdx} setPreviewIdx={setPreviewIdx} />
            </Panel>
          )}
        </div>

        <div className="min-w-0 space-y-5 lg:sticky lg:top-24">
          <Panel>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4" role="radiogroup" aria-label="تصميم الشهادة">
              {DESIGNS.map((d) => (
                <button key={d.id} type="button" role="radio" aria-checked={design === d.id} onClick={() => pickDesign(d.id)}
                  className="rounded-xl p-1.5 text-center cursor-pointer transition-shadow"
                  style={design === d.id ? { background: '#0B3B33', color: '#F8F5EC' } : { background: '#FDFBF7', color: '#1A2E28', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                  {d.thumb
                    ? <img src={d.thumb} alt="" width="360" height="255" loading="lazy" className="w-full h-auto rounded-md" />
                    : <DesignSwatch id={d.id} />}
                  <span className="block font-black text-[12px] mt-1.5 leading-tight">{d.label}</span>
                </button>
              ))}
            </div>
            <div className="rounded-[16px] overflow-hidden" style={{ boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)', background: '#EFE9DC' }}>
              <canvas ref={canvasRef} width={CERT_W} height={CERT_H} className="block w-full h-auto"
                role="img" aria-label={date ? certificatePlainText(opts) : 'معاينة الشهادة'} />
            </div>
            {bulk && shown && <p className="text-[12.5px] text-[#5E6E67] mt-2">المعاينة: شهادة «{shown.name}» ({Math.min(previewIdx, students.length - 1) + 1} من {students.length}). اختر طالباً آخر بزر العين في الجدول.</p>}
            <div className="grid sm:grid-cols-2 gap-4 mt-4 items-start">
              <Segmented label="التباعد العمودي بين النصوص" value={spacing} onChange={setSpacing} size="sm"
                options={SPACINGS.map((s) => ({ value: s.id, label: s.label }))} />
              <div className="sm:pt-7"><Toggle label="مكان لختم المعهد" checked={sealSpot} onChange={setSealSpot} hint="دائرة منقّطة بين التوقيعين." /></div>
            </div>
          </Panel>

          <Panel title={bulk ? 'ملف الشهادات' : 'حمّل شهادتك'} icon={bulk ? Layers : SlidersHorizontal}>
            {!bulk ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button type="button" disabled={!!busy} onClick={onPdf} className={actionBtn + ' btn-cta'}>
                    {busy === 'pdf' ? <Loader2 size={17} className="animate-spin" /> : <FileDown size={17} />} حمّل PDF
                  </button>
                  <button type="button" disabled={!!busy} onClick={onPng} className={actionBtn} style={softBtn}>
                    {busy === 'png' ? <Loader2 size={17} className="animate-spin" /> : <ImageDown size={17} />} حمّل صورة PNG
                  </button>
                  <button type="button" disabled={!!busy} onClick={onPrint} className={actionBtn} style={softBtn}>
                    {busy === 'print' ? <Loader2 size={17} className="animate-spin" /> : <Printer size={17} />} اطبع الشهادة
                  </button>
                </div>
                {sharable && (
                  <button type="button" disabled={!!busy} onClick={onShare} className={actionBtn + ' w-full mt-2'} style={softBtn}>
                    {busy === 'share' ? <Loader2 size={17} className="animate-spin" /> : <Share2 size={17} />} شارك الصورة (واتساب وغيره)
                  </button>
                )}
                <p className="text-[12.5px] text-[#5E6E67] mt-2.5 leading-[1.7]" aria-live="polite">
                  {msg || 'PDF بصفحة A4 أفقية جاهز للطباعة، والصورة PNG بدقة طباعة (2339×1654). رابط إحكام في أسفل الشهادة قابل للنقر داخل PDF.'}
                </p>
              </div>
            ) : (
              <div>
                <button type="button" disabled={!!busy || !validCount} onClick={onBulkPdf} className={actionBtn + ' btn-cta w-full'}>
                  {busy === 'bulk' ? <Loader2 size={17} className="animate-spin" /> : <FileDown size={17} />}
                  {validCount ? `ولّد PDF واحداً لـ ${validCount} ${validCount === 1 ? 'شهادة' : 'شهادات'}` : 'أضف أسماء الطلاب أولاً'}
                </button>
                {progress && (
                  <div className="mt-3">
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#F1ECDF' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#B8863A' }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-[12.5px] font-bold text-[#4A5D56]">
                      <span>يُرسَم {progress.done} من {progress.total}…</span>
                      <button type="button" onClick={() => { cancelRef.current = true }} className="text-[#9A3B2E] cursor-pointer min-h-[32px] px-2">إلغاء</button>
                    </div>
                  </div>
                )}
                <p className="text-[12.5px] text-[#5E6E67] mt-2.5 leading-[1.7]" aria-live="polite">
                  {msg || 'يُرسَم كل شيء في متصفحك: لا تُرسَل أسماء الطلاب إلى أي خادم. افتح الملف واطبعه على ورق A4 بوضع «أفقي» وحجم «فعلي».'}
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      <PrintPortal active={printing && !!printJob} landscape>
        {printJob && (
          <div className="print-cert-wrap">
            <img className="print-cert" src={printJob.src} alt="" width={CERT_W} height={CERT_H} />
            {/* رابط حقيقي فوق سطر إحكام: يبقى قابلاً للنقر في PDF المحفوظ من نافذة الطباعة */}
            <a href="https://ihkaam.app" aria-label="ihkaam.app" className="print-cert-link"
              style={{ left: `${(printJob.link.x / CERT_W) * 100}%`, top: `${(printJob.link.y / CERT_H) * 100}%`, width: `${(printJob.link.w / CERT_W) * 100}%`, height: `${(printJob.link.h / CERT_H) * 100}%` }} />
          </div>
        )}
      </PrintPortal>
    </ToolLayout>
  )
}

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

const METHOD = {
  eyebrow: 'نص الشهادة',
  title: 'ما تكتبه الأداة في الشهادة، ولماذا',
  intro: 'الشهادة تنجح حين تقول بدقة ما أنجزه الطالب ومتى، بعبارات قصيرة لا تتضخم. الصيغ هنا مبنية على هذه القاعدة، وكل عبارة منها لك أن تغيّرها.',
  steps: [
    { icon: BadgeCheck, t: 'خمسة عناصر لا تُترك', d: 'الجهة المانحة، واسم الطالب، والإنجاز بدقة، والتاريخ، والتوقيع. وكلها في النموذج، فلا تخرج شهادة ناقصة دون أن تنتبه.' },
    { icon: ScrollText, t: 'الإنجاز بالاسم والرقم', d: 'تكتب الأداة اسم الجزء ورقمه معاً حتى لا يلتبس على الأهل أي جزء تقصد، وعدد الأجزاء وحدودها، أو اسم السورة.', example: '«تقديراً لحفظه جزء عمّ كاملاً، وهو الجزء الثلاثون»' },
    { icon: PencilLine, t: 'كل نص تكتبه بنفسك', d: 'العنوان (تقدير، شكر، تفوّق، فخر، إتمام…)، ونص الرأس، والمقدمة، والمتن، والتاريخ، والدعاء، وصفة الموقّعين وأسماؤهم: كلها حقول حرة. تقترح الأداة صيغة وتبقى كتابتك هي الأصل.' },
    { icon: PenLine, t: 'بصيغة الطالب أو الطالبة', d: 'اختر «طالبة» فتتغير الضمائر كلها: «لحفظها»، «بارك الله لها في علمها وزادها حرصاً».' },
    { icon: CalendarDays, t: 'تباعد متوازن', d: 'تُحسب مساحة النص قبل رسمه ثم يتوسط بين أعلى الإطار والتوقيعين، فلا فراغ كبير فوق التوقيعين. وإن شئت اختر متقارباً أو متباعداً.' },
    { icon: Users, t: 'شهادات الحلقة كلها في ملف واحد', d: 'ارفع ملف Excel أو الصق الأسماء، فتخرج صفحة A4 أفقية لكل طالب في PDF واحد، واسم كل طالب وإنجازه وجنسه من جدولك. الرسم في متصفحك ولا يغادره اسم.' },
  ],
}

const FAQ = [
  { q: 'هل أكتب آية أو حديثاً في الشهادة؟', a: 'ليس ضرورياً. في حقل «نص في رأس الشهادة» أزرار جاهزة لآية سورة الحجر الآية 9 وحديث «خيركم من تعلّم القرآن وعلّمه» في صحيح البخاري برقم 5027 بلفظهما ومصدرهما. وإن كتبتَ نصاً آخر بنفسك فتحقق من لفظه من المصحف أو كتاب الحديث.' },
  { q: 'كيف أحصل على أفضل جودة طباعة؟', a: 'حمّل PDF واطبعه على ورق A4 بوضع أفقي وحجم فعلي (100%) بلا هوامش، أو أرسله إلى محل الطباعة. والصورة PNG بدقة 200 نقطة في البوصة (2339×1654) تكفي لأي طباعة على A4.' },
  { q: 'هل يُرفع شعار المعهد أو اسم الطالب إلى خادم؟', a: 'لا. الشعار والأسماء وملف Excel تُقرأ في متصفحك وتُرسم في الصفحة نفسها، ولا يُرسل منها شيء. إذا أغلقت الصفحة لا يبقى شيء.' },
  { q: 'ما الفرق بين شهادة التقدير والإجازة؟', a: 'شهادة التقدير يمنحها المعهد تكريماً لإنجاز في الحلقة، مثل حفظ جزء أو ختم القرآن. والإجازة يمنحها شيخ مُجاز بسند متصل ولها شروطها، فلا تُكتب في شهادة التقدير عبارة توحي بها.' },
  { q: 'عندي حلقة كاملة، كيف أولّد شهادات الجميع؟', a: 'اختر «توليد جماعي للمعهد»، ثم نزّل الملف النموذجي واملأه (اسم الطالب، والإنجاز اختياري، وطالب أو طالبة اختياري) وارفعه، أو الصق الأسماء مباشرة. اضبط التصميم والتوقيعين مرة واحدة، واضغط «ولّد PDF»: تأخذ ملفاً واحداً بصفحة A4 أفقية لكل طالب. الدفعة الواحدة حتى 200 طالب.' },
  { q: 'هل أستطيع كتابة إنجاز مختلف لكل طالب؟', a: 'نعم. في العمود الثاني من الجدول اكتب إنجاز الطالب بلا «ل» في أوله، مثل «حفظ سورة الملك كاملة» أو «التميّز في التسميع»، فتكتب الأداة «تقديراً لحفظ سورة الملك كاملة». ومن لا إنجاز مكتوباً له يأخذ الإنجاز العام الذي اخترته.' },
  { q: 'رابط ihkaam.app في أسفل الشهادة، هل أستطيع حذفه؟', a: 'يبقى سطر صغير في أسفل كل شهادة تصنعها الأداة: «صُنعت عبر أدوات إحكام المجانية»، ورابطه قابل للنقر في ملف PDF. هذا ما تأخذه إحكام مقابل أداة مجانية بلا تسجيل.' },
]
