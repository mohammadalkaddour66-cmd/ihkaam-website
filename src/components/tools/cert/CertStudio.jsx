import { useEffect, useRef, useState } from 'react'
import { Check, ChevronRight, ChevronLeft, Plus, ListChecks } from 'lucide-react'
import { Panel, Select, Segmented } from '../controls'
import { useDateField, usePrint, useCanShareFiles } from '../hooks'
import { PrintPortal } from '../print'
import { canvasToBlob, saveBlob, shareBlob, safeFileName } from '../canvasKit'
import {
  drawCertificate, loadImageFile, certificatePlainText, certificateLines, resolveTexts, preloadDesign, DEFAULT_COLOR, CERT_W, CERT_H,
} from '../certificate'
import { certificatesPdf } from '../certificatePdf'
import { DEFAULT_VARS, DEFAULT_TPL, extendDefault, newTemplate } from '../../../tools/files/template.js'
import {
  studentOpts, tplOf, isBlank, blankStudent, loadSettings, saveSettings, SAMPLE_NAME, SAMPLE_VARS, SINGLE_DEFAULT,
} from './model.js'
import StudentsPanel from './StudentsPanel.jsx'
import TextPanel from './TextPanel.jsx'
import SinglePanel from './SinglePanel.jsx'
import InstitutePanel from './InstitutePanel.jsx'
import LookPanel from './LookPanel.jsx'
import ExportPanel from './ExportPanel.jsx'

/* الصياغة أولاً: كل ما تقوله الشهادة وتاريخها وتواقيعها في لوحة واحدة. و«الطلاب» للتوليد الجماعي فقط. */
const STEP_DEFS = {
  text: { label: 'الصياغة', title: 'ماذا تقول الشهادة؟', hint: 'اكتب ما تريد، وهي جاهزة فلا تغيّرها إن أعجبتك. أو اضغط أي سطر على الشهادة لتعديله.' },
  students: { label: 'الطلاب', title: 'من هم الطلاب؟', hint: 'ارفع القائمة، وعدّل بيانات من تشاء.' },
  inst: { label: 'المعهد', title: 'من يمنح الشهادة؟', hint: 'تُحفظ في متصفحك فلا تكتبها مرة ثانية.' },
  look: { label: 'الشكل', title: 'كيف تبدو؟', hint: 'اختر الإطار واللون، والشهادة تتغير أمامك.' },
  export: { label: 'التحميل', title: 'حمّل شهاداتك', hint: 'ملف واحد جاهز للطباعة.' },
}
const STEPS_SINGLE = ['text', 'inst', 'look', 'export']
const STEPS_BULK = ['text', 'students', 'inst', 'look', 'export']

const softBtn = { background: '#FDFBF7', color: '#0B3B33', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }

/* مساحة عمل الشهادات: الشهادة كبيرة وحيّة دائماً، ولوحة بخطوة واحدة بجانبها، وشريط الطلاب تحتها (في الجماعي). */
export default function CertStudio() {
  const [saved] = useState(loadSettings)
  const [date, setDate] = useDateField()
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState('single') // single | bulk
  const [aud, setAudState] = useState('m') // m | f | both: لمن الشهادات
  const [students, setStudents] = useState(() => [blankStudent('')])
  const [cur, setCur] = useState(0)
  const [varNames, setVarNames] = useState(DEFAULT_VARS)
  const [templates, setTemplates] = useState(() => [newTemplate('الصيغة 1')])
  const [activeTpl, setActiveTpl] = useState('')
  const [selMode, setSelMode] = useState(false)
  const [sel, setSel] = useState(() => new Set())
  const [moveTo, setMoveTo] = useState('')

  const [institute, setInstitute] = useState(saved.institute || '')
  const [halaqa, setHalaqa] = useState(saved.halaqa || '')
  const [place, setPlace] = useState(saved.place || '')
  const [sig1, setSig1] = useState(saved.sig1 || { role: 'المعلم', name: '' })
  const [sig2, setSig2] = useState(saved.sig2 || { role: 'مدير المعهد', name: '' })
  const [sig3, setSig3] = useState(saved.sig3 || { role: '', name: '' })
  const [kicker, setKicker] = useState(saved.kicker || '')
  const [text, setText] = useState({ when: null })
  const [single, setSingle] = useState({ title: '', body: null, intro: null, dua: null }) // نصوص «شهادة واحدة»: null = الجاهز
  const [rects, setRects] = useState({})
  const [dateMode, setDateMode] = useState(saved.dateMode || 'both')
  const [datePos, setDatePos] = useState(saved.datePos || 'bottom')
  const [design, setDesign] = useState(saved.design || 'art-gold')
  const [spacing, setSpacing] = useState(saved.spacing || 'auto')
  const [colorLive, setColorLive] = useState(saved.color || DEFAULT_COLOR)
  const [color, setColor] = useState(saved.color && saved.color.toLowerCase() !== DEFAULT_COLOR.toLowerCase() ? saved.color : '')
  const [sealSpot, setSealSpot] = useState(saved.sealSpot ?? true)
  const [logo, setLogo] = useState(null)
  const [logoErr, setLogoErr] = useState('')
  const [printJob, setPrintJob] = useState(null)
  const [busy, setBusy] = useState('')
  const [progress, setProgress] = useState(null)
  const [msg, setMsg] = useState('')
  const canvasRef = useRef(null)
  const cancelRef = useRef(false)
  const { printing, print } = usePrint()
  const sharable = useCanShareFiles()

  const bulk = mode === 'bulk'
  const stepKeys = bulk ? STEPS_BULK : STEPS_SINGLE
  const stepIdx = Math.min(step, stepKeys.length - 1)
  /* في «شهادة واحدة» يُعتدّ بأول طالب وحده */
  const list = bulk ? students : students.slice(0, 1)
  const firstTpl = templates[0].id
  const idx = bulk ? Math.min(cur, students.length - 1) : 0
  const s = students[idx]
  const real = list.filter((x) => x.name.trim())
  const base = { halaqa, institute, sig1, sig2, sig3, kicker, text, date, dateMode, datePos, place, design, color, spacing, sealSpot, logo }

  /* قبل أن يكتب المدير شيئاً تُعرض شهادة مثال، فيرى النتيجة من أول لحظة */
  const sample = isBlank(s)
  const shown = sample ? { ...s, name: SAMPLE_NAME, vars: SAMPLE_VARS } : s
  /* «شهادة واحدة» صيغتها نص حر: الجاهز أو ما كتبه المدير، لكلا الجنسين */
  const singleTpl = { id: 'single', name: '', title: single.title, m: single.body ?? SINGLE_DEFAULT.m, f: single.body ?? SINGLE_DEFAULT.f, mi: single.intro, fi: single.intro, md: single.dua, fd: single.dua, fOk: true }
  const tpls = bulk ? templates : [singleTpl]
  const opts = studentOpts(base, shown, tpls)
  const optsKey = JSON.stringify({ ...opts, logo: logo ? logo.src.length : 0 })

  /* النصوص التلقائية لكل جنس (تتغير ضمائرها وحدها) وسطر التاريخ */
  const autoFor = (g) => certificateLines({ ...base, name: '', gender: g, achievement: { type: 'custom', text: '' }, text: {} })
  const autoLines = { m: autoFor('m'), f: autoFor('f') }
  autoLines.when = autoLines.m.when

  /* مثال الجملة لأول طالب (أو طالبة) في الصيغة، أو لمثال توضيحي إن لم يوجد */
  const sentenceFor = (tplId, g) => {
    const f = real.find((x) => tplOf(tpls, x).id === tplId && x.gender === g)
    const st = f || { id: 'ex', name: SAMPLE_NAME, gender: g, vars: SAMPLE_VARS, tpl: tplId }
    return { name: st.name, text: studentOpts(base, st, tpls).text.body }
  }
  const blocked = !bulk ? [] : templates.filter((t) => !t.fOk && real.some((x) => x.gender === 'f' && tplOf(templates, x).id === t.id))

  /* الشعار المحفوظ يُستعاد مرة واحدة */
  useEffect(() => {
    if (!saved.logo) return
    const img = new Image()
    img.onload = () => setLogo(img)
    img.src = saved.logo
  }, [saved])

  /* إعدادات المعهد تُحفظ بعد توقف التعديل لحظة */
  useEffect(() => {
    const t = setTimeout(() => saveSettings({ institute, halaqa, place, sig1, sig2, sig3, kicker, dateMode, datePos, design, spacing, sealSpot, color: colorLive }, logo?.src), 500)
    return () => clearTimeout(t)
  }, [institute, halaqa, place, sig1, sig2, sig3, kicker, dateMode, datePos, design, spacing, sealSpot, colorLive, logo])

  /* يُعاد الرسم بعد توقف الكتابة لحظة: الرسم بدقة الطباعة أثقل من أن يتبع كل حرف */
  useEffect(() => {
    if (!date || !canvasRef.current) return
    const t = setTimeout(() => { drawCertificate(canvasRef.current, opts).then((r) => r?.rects && setRects(r.rects)) }, 140)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optsKey])

  /* اللون المرسوم يلحق المنتقي بعد توقف حركته نحو ثلث ثانية */
  useEffect(() => {
    const target = colorLive.toLowerCase() === DEFAULT_COLOR.toLowerCase() ? '' : colorLive
    if (target === color) return
    const t = setTimeout(() => setColor(target), 320)
    return () => clearTimeout(t)
  }, [colorLive, color])

  async function onLogo(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { setLogo(await loadImageFile(f)); setLogoErr('') } catch (err) { setLogoErr(err.message) }
  }

  /* ── لمن الشهادات: طلاب أو طالبات أو الاثنان. وغير «الاثنين» يوحّد جنس كل الطلاب. ── */
  const setAud = (v) => {
    setAudState(v)
    if (v !== 'both') setStudents((ss) => ss.map((x) => ({ ...x, gender: v })))
  }
  const changeMode = (m) => {
    setMode(m)
    setStep(0)
    if (m === 'single' && aud === 'both') setAud('m')
    if (m === 'single') { setSelMode(false); setSel(new Set()) }
  }
  /* بعد استيراد قائمة: الجمهور من أجناسها، وتُوسَّع الجملة الجاهزة بأعمدة الملف (التقدير، الدرجة…) إن لم يغيّرها المدير */
  function onImported(merged, names, oldNames) {
    const hasF = merged.some((x) => x.gender === 'f')
    const hasM = merged.some((x) => x.gender !== 'f')
    setAudState(hasF && hasM ? 'both' : hasF ? 'f' : 'm')
    setTemplates((ts) => ts.map((t, i) => {
      const untouched = !t.fTouched && t.mi == null && t.md == null && t.fi == null && t.fd == null
        && t.m === extendDefault(DEFAULT_TPL.m, oldNames) && t.f === extendDefault(DEFAULT_TPL.f, oldNames)
      return i === 0 && untouched ? { ...t, m: extendDefault(DEFAULT_TPL.m, names), f: extendDefault(DEFAULT_TPL.f, names), fOk: true } : t
    }))
  }

  /* ── الصيغ ── */
  function newTpl(from) {
    const t = newTemplate(`الصيغة ${templates.length + 1}`, from)
    setTemplates([...templates, t])
    setActiveTpl(t.id)
    if (students.length === 1) setStudents(students.map((x) => ({ ...x, tpl: t.id }))) // طالب واحد: ينتقل إليها فوراً
    else { setSelMode(true); setSel(new Set()); setMoveTo(t.id) } // وإلا يعلّم المدير من يريد من الشريط
  }
  function removeTpl(id) {
    if (templates.length < 2) return
    const rest = templates.filter((t) => t.id !== id)
    setTemplates(rest)
    setActiveTpl(rest[0].id)
    setStudents((ss) => ss.map((x) => ((x.tpl || firstTpl) === id ? { ...x, tpl: rest[0].id } : x)))
  }
  function applyMove() {
    if (!moveTo || !sel.size) return
    setStudents(students.map((x) => (sel.has(x.id) ? { ...x, tpl: moveTo } : x)))
    setActiveTpl(moveTo)
    setSelMode(false); setSel(new Set())
  }

  /* ── التحميل ── */
  async function render(o) {
    const cv = document.createElement('canvas')
    const { link } = await drawCertificate(cv, o)
    return { cv, link }
  }
  const fileName = () => safeFileName(opts.name, 'تقدير')
  async function onPrint() {
    setBusy('print'); setMsg('')
    try { const { cv, link } = await render(opts); setPrintJob({ src: cv.toDataURL('image/png'), link }); print({ landscape: true }) } finally { setBusy('') }
  }
  async function onPng() {
    setBusy('png'); setMsg('')
    try {
      const { cv } = await render(opts)
      saveBlob(await canvasToBlob(cv, 'image/png'), `شهادة-${fileName()}.png`)
      setMsg('حُفظت صورة PNG بدقة الطباعة (2339×1654) في مجلد التنزيلات.')
    } catch { setMsg('تعذّر إنشاء الصورة. جرّب مرة أخرى.') } finally { setBusy('') }
  }
  async function onShare() {
    setBusy('share'); setMsg('')
    try {
      const { cv } = await render(opts)
      const blob = await canvasToBlob(cv, 'image/png')
      const T = resolveTexts(opts)
      const caption = [opts.name?.trim() ? `${T.title}: ${T.name}` : T.title, T.dua].filter((x) => x && x.trim()).join('\n')
      try { await shareBlob(blob, `شهادة-${fileName()}.png`, caption) } catch (e) { if (e?.name !== 'AbortError') saveBlob(blob, `شهادة-${fileName()}.png`) }
    } catch { setMsg('تعذّر إنشاء الصورة. جرّب مرة أخرى.') } finally { setBusy('') }
  }
  async function onPdf() {
    if (!real.length) return
    cancelRef.current = false
    setBusy('pdf'); setMsg(''); setProgress({ done: 0, total: real.length })
    try {
      const blob = await certificatesPdf(real.map((x) => studentOpts(base, x, tpls)), {
        scale: real.length > 1 ? 0.75 : 1, quality: real.length > 1 ? 0.9 : 0.93, title: real.length > 1 ? 'شهادات الطلاب' : 'شهادة تقدير',
        onProgress: (done, total) => setProgress({ done, total }),
        isCancelled: () => cancelRef.current,
      })
      saveBlob(blob, real.length > 1 ? `شهادات-${real.length}-طالب.pdf` : `شهادة-${safeFileName(real[0].name, 'تقدير')}.pdf`)
      setMsg(`حُفظ ملف PDF فيه ${real.length} ${real.length === 1 ? 'شهادة' : 'شهادات'} (${(blob.size / 1048576).toFixed(1)} م.ب.) بصفحة A4 أفقية لكل طالب، ورابط إحكام فيه قابل للنقر.`)
    } catch (e) {
      setMsg(e.message === 'cancelled' ? 'أُلغي التوليد.' : 'تعذّر توليد الملف. قلّل عدد الطلاب في الدفعة وأعد المحاولة.')
    } finally { setBusy(''); setProgress(null) }
  }

  const addStudent = () => {
    setStudents([...students, blankStudent(s.tpl || firstTpl, aud === 'f' ? 'f' : s.gender)])
    setCur(students.length)
    setStep(1)
  }
  const pickDesign = (id) => { preloadDesign(id); setDesign(id) }
  const toggleSel = (id) => setSel((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const sigs = [{ v: sig1, set: setSig1 }, { v: sig2, set: setSig2 }, { v: sig3, set: setSig3 }]
  const dateProps = { date, setDate, dateMode, setDateMode, place, setPlace }
  const PANELS = {
    text: bulk
      ? <TextPanel mode={mode} aud={aud} setAud={setAud} templates={templates} setTemplates={setTemplates} activeId={activeTpl} setActiveId={setActiveTpl}
        varNames={varNames} setVarNames={setVarNames} halaqa={halaqa} students={list} sentenceFor={sentenceFor} autoLines={autoLines}
        onNewTemplate={newTpl} onRemoveTemplate={removeTpl} text={text} setText={setText} kicker={kicker} setKicker={setKicker} sigs={sigs} {...dateProps} />
      : <SinglePanel aud={aud} setAud={setAud} single={single} setSingle={setSingle} name={students[0].name}
        setName={(v) => setStudents((ss) => ss.map((x, i) => (i === 0 ? { ...x, name: v } : x)))}
        autoLines={autoLines} kicker={kicker} setKicker={setKicker} text={text} setText={setText} sigs={sigs} {...dateProps} />,
    students: <StudentsPanel mode={mode} aud={aud} students={students} setStudents={setStudents} cur={idx} setCur={setCur} varNames={varNames} setVarNames={setVarNames}
      templates={templates} onImported={onImported} />,
    inst: <InstitutePanel institute={institute} setInstitute={setInstitute} halaqa={halaqa} setHalaqa={setHalaqa} logo={logo} onLogo={onLogo} clearLogo={() => setLogo(null)} logoErr={logoErr} />,
    look: <LookPanel design={design} pickDesign={pickDesign} colorLive={colorLive} setColorLive={setColorLive} colorSet={!!color}
      spacing={spacing} setSpacing={setSpacing} sealSpot={sealSpot} setSealSpot={setSealSpot} datePos={datePos} setDatePos={setDatePos} />,
    export: <ExportPanel count={real.length} blocked={blocked} busy={busy} progress={progress} onPdf={onPdf} onCancel={() => { cancelRef.current = true }}
      onPng={onPng} onPrint={onPrint} onShare={onShare} sharable={sharable} msg={msg} currentName={sample ? '' : s.name} />,
  }
  const info = STEP_DEFS[stepKeys[stepIdx]]
  const multi = templates.length > 1

  /* النقر على سطر في الشهادة يفتح خانته مباشرة: يُنتقل إلى خطوتها ويُركَّز عليها */
  const g = shown.gender === 'f' ? 'f' : 'm'
  const EDIT = {
    institute: ['inst', 'in-name'], title: ['text', 'f-title'], kicker: ['text', 'f-kicker'], intro: ['text', `f-intro-${g}`],
    name: bulk ? ['students', 'cs-name'] : ['text', 'f-name'], body: ['text', `f-body-${g}`], dua: ['text', `f-dua-${g}`], when: ['text', 'f-when'],
    sig1: ['text', 'f-sig-1'], sig2: ['text', 'f-sig-2'], sig3: ['text', 'f-sig-3'],
  }
  const LABEL = { institute: 'اسم المعهد', title: 'العنوان', kicker: 'نص الرأس', intro: 'المقدمة', name: 'الاسم', body: 'جملة الشهادة', dua: 'الدعاء', when: 'التاريخ', sig1: 'التوقيع الأول', sig2: 'التوقيع الثاني', sig3: 'التوقيع الثالث' }
  function editLine(key) {
    const [st, id] = EDIT[key]
    const i = stepKeys.indexOf(st)
    if (i < 0) return
    setStep(i)
    setTimeout(() => {
      const el = document.getElementById(id) || document.getElementById(`${id}-sel`)
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el?.focus({ preventScroll: true })
    }, 120)
  }

  return (
    <div className="space-y-4">
      <Segmented value={mode} onChange={changeMode} size="sm"
        options={[{ value: 'single', label: 'شهادة واحدة' }, { value: 'bulk', label: 'توليد جماعي للمعهد' }]} />

      {/* شريط الخطوات: يُنتقل بينها بحرية، والحالية مميّزة */}
      <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${stepKeys.length}, minmax(0, 1fr))` }} aria-label="خطوات إعداد الشهادات">
        {stepKeys.map((k, i) => {
          const on = i === stepIdx
          const done = i < stepIdx
          return (
            <li key={k}>
              <button type="button" onClick={() => setStep(i)} aria-current={on ? 'step' : undefined}
                className="w-full rounded-xl py-2 px-1 flex flex-col items-center gap-1 cursor-pointer min-h-[56px]"
                style={on ? { background: '#0B3B33', color: '#F8F5EC' } : { background: '#FDFBF7', color: '#1A2E28', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                <span className="w-6 h-6 rounded-full grid place-items-center text-[12px] font-black"
                  style={on ? { background: '#E0B562', color: '#0B3B33' } : done ? { background: '#1F6F52', color: '#fff' } : { background: '#F1ECDF', color: '#6B4C14' }}>
                  {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                </span>
                <span className="text-[11.5px] sm:text-[13px] font-bold leading-none">{STEP_DEFS[k].label}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="grid lg:grid-cols-[390px_minmax(0,1fr)] gap-4 items-start">
        {/* الشهادة وشريط الطلاب: تبقى ظاهرة أثناء العمل في اللوحة */}
        <div className="order-1 lg:order-2 sticky top-[76px] lg:top-24 z-20 min-w-0">
          <div className="rounded-[20px] p-2 sm:p-3 space-y-2" style={{ background: '#F8F5EC', boxShadow: 'var(--shadow-md), inset 0 0 0 1px var(--line-warm)' }}>
            <div className="relative mx-auto w-[72%] sm:w-[60%] lg:w-full rounded-[12px] overflow-hidden" style={{ background: '#EFE9DC' }}>
              <canvas ref={canvasRef} width={CERT_W} height={CERT_H} className="block w-full h-auto" role="img" aria-label={date ? certificatePlainText(opts) : 'معاينة الشهادة'} />
              {Object.entries(rects).map(([k, r]) => EDIT[k] && (
                <button key={k} type="button" onClick={() => editLine(k)} aria-label={`عدّل: ${LABEL[k]}`} title={`عدّل: ${LABEL[k]}`}
                  className="absolute rounded-md cursor-pointer hover:bg-[#E0B562]/25 hover:outline hover:outline-2 hover:outline-[#B8863A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B8863A]"
                  style={{ left: `${(r.x / CERT_W) * 100}%`, top: `${(r.y / CERT_H) * 100}%`, width: `${(r.w / CERT_W) * 100}%`, height: `${(r.h / CERT_H) * 100}%` }} />
              ))}
              {sample && <span className="absolute top-2 start-2 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: 'rgba(11,59,51,.85)', color: '#F8F5EC' }}>مثال توضيحي</span>}
            </div>

            {bulk && (
              <>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="listbox" aria-label="طلاب الدفعة">
                  <button type="button" onClick={addStudent} aria-label="أضف طالباً" title="أضف طالباً" className="shrink-0 w-10 h-10 rounded-xl grid place-items-center cursor-pointer" style={{ background: '#0B3B33', color: '#E0B562' }}><Plus size={18} /></button>
                  {students.map((x, i) => {
                    const on = i === idx
                    const checked = sel.has(x.id)
                    return (
                      <button key={x.id} type="button" role="option" aria-selected={on} onClick={() => (selMode ? toggleSel(x.id) : setCur(i))}
                        className="shrink-0 max-w-[150px] truncate rounded-xl px-3 min-h-[40px] text-[13px] font-bold cursor-pointer flex items-center gap-1.5"
                        style={selMode ? (checked ? { background: '#1F6F52', color: '#fff' } : softBtn) : on ? { background: '#E0B562', color: '#0B3B33' } : softBtn}>
                        {selMode && <span className="w-4 h-4 rounded grid place-items-center shrink-0" style={{ background: checked ? '#fff' : 'transparent', boxShadow: checked ? 'none' : 'inset 0 0 0 1.5px #8A6425' }}>{checked && <Check size={11} strokeWidth={4} color="#1F6F52" />}</span>}
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: x.gender === 'f' ? '#C2557F' : '#1F6F52' }} aria-hidden />
                        <span className="truncate">{x.name.trim() || 'طالب جديد'}</span>
                        {multi && <span className="text-[10.5px] opacity-70">{templates.findIndex((t) => t.id === tplOf(templates, x).id) + 1}</span>}
                      </button>
                    )
                  })}
                  {students.length > 1 && multi && (
                    <button type="button" onClick={() => { setSelMode((v) => !v); setSel(new Set()) }} aria-pressed={selMode}
                      className="shrink-0 inline-flex items-center gap-1 rounded-xl px-3 min-h-[40px] text-[13px] font-bold cursor-pointer" style={selMode ? { background: '#0B3B33', color: '#F8F5EC' } : softBtn}>
                      <ListChecks size={15} /> تحديد
                    </button>
                  )}
                </div>

                {selMode && (
                  <div className="rounded-xl p-2.5 space-y-2" style={{ background: 'rgba(224,181,98,.2)' }}>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] font-bold text-[#6B4C14]">
                      <span>علّم الطلاب ثم اختر الصيغة ({sel.size})</span>
                      <span className="flex items-center gap-3">
                        <button type="button" className="underline underline-offset-4 cursor-pointer min-h-[32px]" onClick={() => setSel(new Set(students.map((x) => x.id)))}>الكل</button>
                        <button type="button" className="underline underline-offset-4 cursor-pointer min-h-[32px]" onClick={() => { setSelMode(false); setSel(new Set()) }}>إلغاء</button>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <Select aria-label="انقل المحدّدين إلى صيغة" value={moveTo} onChange={setMoveTo}>
                          <option value="">انقلهم إلى…</option>
                          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </Select>
                      </div>
                      <button type="button" disabled={!moveTo || !sel.size} onClick={applyMove} className="rounded-xl px-4 min-h-[46px] text-[13.5px] font-bold cursor-pointer btn-cta disabled:opacity-50">انقل</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* لوحة الخطوة الحالية */}
        <div className="order-2 lg:order-1 min-w-0">
          <Panel>
            <div className="mb-5">
              <h2 className="font-black text-[18px] text-[#1A2E28]">{info.title}</h2>
              <p className="text-[13px] leading-[1.7] text-[#5E6E67] mt-0.5">{info.hint}</p>
            </div>
            {PANELS[stepKeys[stepIdx]]}
            <div className="flex items-center gap-2 mt-6 pt-4" style={{ borderTop: '1px solid var(--line-warm)' }}>
              {stepIdx > 0 && (
                <button type="button" onClick={() => setStep(stepIdx - 1)} className="inline-flex items-center gap-1 rounded-xl px-4 min-h-[46px] text-[14px] font-bold cursor-pointer" style={softBtn}><ChevronRight size={16} /> السابق</button>
              )}
              {stepIdx < stepKeys.length - 1 && (
                <button type="button" onClick={() => setStep(stepIdx + 1)} className="inline-flex items-center justify-center gap-1 rounded-xl px-5 min-h-[46px] text-[14px] font-bold cursor-pointer btn-cta flex-1">التالي: {STEP_DEFS[stepKeys[stepIdx + 1]].label} <ChevronLeft size={16} /></button>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <PrintPortal active={printing && !!printJob} landscape>
        {printJob && (
          <div className="print-cert-wrap">
            <img className="print-cert" src={printJob.src} alt="" width={CERT_W} height={CERT_H} />
            <a href="https://ihkaam.app" aria-label="ihkaam.app" className="print-cert-link"
              style={{ left: `${(printJob.link.x / CERT_W) * 100}%`, top: `${(printJob.link.y / CERT_H) * 100}%`, width: `${(printJob.link.w / CERT_W) * 100}%`, height: `${(printJob.link.h / CERT_H) * 100}%` }} />
          </div>
        )}
      </PrintPortal>
    </div>
  )
}
