import { useMemo, useState } from 'react'
import { Divide, BookOpenCheck, MoonStar, Sunrise, Repeat, CalendarClock, Loader2, Settings2, Table2, CheckCircle2 } from 'lucide-react'
import ToolLayout from '../../components/tools/ToolLayout'
import { KhatmVisual } from '../../components/tools/ToolVisuals'
import { Field, NumberInput, DateInput, Select, Segmented, Toggle, Panel, Stat, Step, MoreOptions, ResultBar } from '../../components/tools/controls'
import { useQuranIndex, useDateField, useToday, usePrint } from '../../components/tools/hooks'
import { PrintPortal, PlanSheet, PrintFoot } from '../../components/tools/print'
import ResultActions from '../../components/tools/ResultActions'
import { drawGridCard } from '../../components/tools/canvasKit'
import { count, dayName, gDate, hDate, pagesLabel } from '../../components/tools/format'
import { getTool } from '../../config/tools'
import { generateKhatmPlan, nextRamadan, formatPieces } from '../../tools/quran/index.js'

const tool = getTool('khatm-calculator')

/* ── نصوص الورد ── */
function unitRange(u, from, to, many) {
  const [one, plural] = u === 'juz' ? ['الجزء', 'الأجزاء'] : ['الحزب', 'الأحزاب']
  if (from === to) return `${one} ${from}`
  if (from < to) return `${plural} ${from}–${to}`
  return `${plural} ${from}–${many} ثم 1–${to}`
}
function wirdText(r, unit) {
  if (unit === 'juz' || unit === 'hizb') return unitRange(unit, r[unit].from, r[unit].to, unit === 'juz' ? 30 : 60)
  return r.runs.map((x, i) => `${pagesLabel(x.fromPage, x.toPage)}${i > 0 ? ` (الختمة ${x.khatma})` : ''}`).join('، ثم ')
}
const wirdShort = (r, unit) => (unit === 'pages' ? r.runs.map((x) => `${x.fromPage}–${x.toPage}`).join(' + ') : wirdText(r, unit))
const startText = (r) => `${r.start.name} ${r.start.ayah === 1 ? '(أولها)' : r.start.ayah} · الجزء ${r.start.juz}`
const prayerText = (p) => (p.runs ? p.runs.map((x) => pagesLabel(x.fromPage, x.toPage)).join('، ') : formatPieces(p.pieces))

function dailyLabel(s) {
  if (s.unit === 'juz') {
    const step = (30 * s.khatmas) / s.days
    return step === 1 ? 'جزء كل يوم' : `${count(step, 'juz')} كل يوم`
  }
  if (s.unit === 'hizb') {
    const step = (60 * s.khatmas) / s.days
    return `${count(step, 'hizb')} كل يوم`
  }
  return s.minPagesPerDay === s.maxPagesPerDay ? `${count(s.minPagesPerDay, 'page')} كل يوم` : `${s.minPagesPerDay} أو ${s.maxPagesPerDay} صفحة كل يوم`
}

export default function KhatmTool() {
  const { ix, error: loadError } = useQuranIndex()
  const today = useToday()
  const [ownStart, setOwnStart] = useDateField()
  const [mode, setMode] = useState('duration')
  const [durKind, setDurKind] = useState('ramadan')
  const [days, setDays] = useState(30)
  const [endDate, setEndDate] = useState('')
  const [pagesPerDay, setPagesPerDay] = useState(20)
  const [khatmas, setKhatmas] = useState(1)
  const [prayers, setPrayers] = useState(false)
  const [hijri, setHijri] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [scope, setScope] = useState('all')
  const { printing, print } = usePrint()

  const ramadan = useMemo(() => (today ? nextRamadan(today) : null), [today])
  const useRamadan = mode === 'duration' && durKind === 'ramadan'
  const startDate = useRamadan ? ramadan?.start : ownStart

  const result = useMemo(() => {
    if (!ix || !startDate) return null
    let input
    if (mode === 'pace') input = { mode: 'pace', pagesPerDay: Math.round(Number(pagesPerDay)) }
    else if (durKind === 'ramadan') input = { mode: 'duration', days: ramadan.days }
    else if (durKind === 'endDate') {
      if (!endDate) return { error: 'اختر تاريخ الانتهاء' }
      input = { mode: 'duration', endDate }
    } else input = { mode: 'duration', days: Math.round(Number(days)) }
    try {
      return { plan: generateKhatmPlan(ix, { ...input, khatmas: Number(khatmas) || 1, startDate, prayers }) }
    } catch (e) {
      return { error: e.message || 'تعذّر الحساب' }
    }
  }, [ix, startDate, mode, durKind, ramadan, days, endDate, pagesPerDay, khatmas, prayers])

  const plan = result?.plan
  const s = plan?.summary
  const unit = s?.unit
  const daily = s ? dailyLabel(s) : ''
  const title = useRamadan && ramadan ? `ختمة رمضان ${ramadan.year}هـ` : s?.khatmas > 1 ? `${count(s.khatmas, 'khatma')} في ${count(s.days, 'day')}` : `ختمة في ${count(s?.days || 0, 'day')}`
  const visibleRows = plan ? (showAll ? plan.rows : plan.rows.slice(0, 31)) : []
  const printRows = !plan ? [] : scope === 'month' ? plan.rows.slice(0, 30) : plan.rows

  async function makeImage() {
    return drawGridCard({
      eyebrow: 'جدول الورد اليومي',
      title,
      headline: `وردك: ${daily}`,
      cells: plan.rows.slice(0, 30).map((r) => ({
        top: `اليوم ${r.day}`,
        main: wirdShort(r, unit),
        sub: r.date ? `${dayName(r.date)} ${gDate(r.date)}` : '',
        done: !!r.endsKhatma,
      })),
      note: plan.rows.length > 30
        ? `أول 30 يوماً من ${count(plan.rows.length, 'day')} · بقية الجدول في النسخة المطبوعة`
        : `من ${gDate(s.startDate, true)} إلى ${gDate(s.endDate, true)}`,
    })
  }

  const facts = s ? [
    { value: daily, label: 'الورد اليومي' },
    { value: count(s.days, 'day'), label: 'المدة' },
    { value: `${gDate(s.startDate, true)} – ${gDate(s.endDate, true)}`, label: 'من – إلى' },
    ...(s.khatmas > 1 ? [{ value: count(s.khatmas, 'khatma'), label: 'عدد الختمات' }] : []),
  ] : []

  return (
    <ToolLayout
      tool={tool}
      lead="اختر المدة التي تريد أن تختم فيها، أو رمضان القادم، أو عدد الصفحات التي تقرؤها كل يوم. تحسب الأداة وردك اليومي من صفحة إلى صفحة، وتجعله أجزاءً كاملة حين تنقسم المدة عليها، وتقسمه على الصلوات الخمس إن شئت."
      visual={<KhatmVisual />}
      method={METHOD}
      faq={FAQ}
    >
      <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
        <Panel title="بيانات الختمة" icon={Settings2} className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <Step n={1} title="ماذا تعرف؟" hint="اختر ما تعرفه، وتحسب الأداة الباقي.">
            <Segmented value={mode} onChange={setMode} size="sm" options={[
              { value: 'duration', label: 'المدة', sub: 'فاحسب الورد' },
              { value: 'pace', label: 'الورد اليومي', sub: 'فاحسب المدة' },
            ]} />
            {mode === 'duration' ? (
              <>
                <Segmented label="أريد أن أختم في" value={durKind} onChange={setDurKind} size="sm" options={[
                  { value: 'ramadan', label: 'رمضان' },
                  { value: 'days', label: 'عدد أيام' },
                  { value: 'endDate', label: 'حتى تاريخ' },
                ]} />
                {durKind === 'ramadan' && (
                  <p className="rounded-xl px-4 py-3 text-[13.5px] leading-[1.8]" style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)', color: '#1A2E28' }}>
                    {ramadan
                      ? <>رمضان {ramadan.year}هـ يبدأ نحو <b>{gDate(ramadan.start, true)}</b>، و{count(ramadan.days, 'day')} بتقويم أم القرى. إن أردت جزءاً كاملاً كل يوم فاختر «عدد أيام» واكتب 30.</>
                      : 'يُحسب موعد رمضان القادم…'}
                  </p>
                )}
                {durKind === 'days' && (
                  <Field label="عدد الأيام" htmlFor="kh-days" hint="30 أو 15 أو 10 أيام تعطي أجزاءً كاملة كل يوم.">
                    <NumberInput id="kh-days" value={days} min={1} max={6040} onChange={setDays} />
                  </Field>
                )}
                {durKind === 'endDate' && (
                  <Field label="أختم في يوم" htmlFor="kh-end"><DateInput id="kh-end" value={endDate} onChange={setEndDate} min={startDate || undefined} /></Field>
                )}
              </>
            ) : (
              <Field label="أقرأ كل يوم (صفحة)" htmlFor="kh-ppd" hint="الجزء نحو 20 صفحة في مصحف المدينة.">
                <NumberInput id="kh-ppd" value={pagesPerDay} min={1} max={604} onChange={setPagesPerDay} />
              </Field>
            )}
          </Step>

          <Step n={2} title="كم ختمة، ومتى تبدأ؟">
            <Field label="عدد الختمات" htmlFor="kh-k">
              <Select id="kh-k" value={khatmas} onChange={(v) => setKhatmas(Number(v))}>
                {[1, 2, 3, 4, 5, 10].map((k) => <option key={k} value={k}>{count(k, 'khatma')}</option>)}
              </Select>
            </Field>
            {!useRamadan && (
              <Field label="أبدأ في" htmlFor="kh-start"><DateInput id="kh-start" value={ownStart} onChange={setOwnStart} /></Field>
            )}
          </Step>

          <Step n={3} title="تفصيل إضافي">
            <MoreOptions title="الصلوات والتاريخ الهجري">
              <Toggle label="قسّم ورد اليوم على الصلوات الخمس" checked={prayers} onChange={setPrayers}
                hint="خمسة أجزاء متقاربة، كل واحد ينتهي عند نهاية آية أو صفحة." />
              <Toggle label="أظهر التاريخ الهجري" checked={hijri} onChange={setHijri} />
            </MoreOptions>
          </Step>
        </Panel>

        <div id="tool-result" className="min-w-0 space-y-5 scroll-mt-24">
          {!result && (
            <Panel>
              <div className="flex items-center gap-3 text-[15px] text-[#4A5D56] py-6 justify-center">
                {loadError ? <span className="text-[#9A3B2E] font-bold">{loadError}</span> : <><Loader2 size={18} className="animate-spin" /> يُجهّز بيانات المصحف…</>}
              </div>
            </Panel>
          )}
          {result?.error && <Panel><p className="text-[15px] font-bold py-4 text-center" style={{ color: '#9A3B2E' }}>{result.error}</p></Panel>}

          {plan && (
            <>
              <Panel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <Stat accent value={daily} label="وردك اليومي" />
                  <Stat value={count(s.days, 'day')} label={s.khatmas > 1 ? count(s.khatmas, 'khatma') : `${s.totalPages} صفحة`} />
                  <Stat value={gDate(s.startDate, true)} label={hijri ? `البداية · ${hDate(s.startDate, true)}` : 'البداية'} />
                  <Stat value={gDate(s.endDate, true)} label={hijri ? `الختم · ${hDate(s.endDate, true)}` : 'يوم الختم'} />
                </div>
                {unit !== 'pages' && (
                  <p className="mt-4 text-[13.5px] leading-[1.8] text-[#4A5D56]">
                    المدة تنقسم على {unit === 'juz' ? 'الأجزاء' : 'الأحزاب'}، فكل يوم يبدأ من أول {unit === 'juz' ? 'جزء' : 'حزب'} كما في المصحف، وعدد صفحاته بين {s.minPagesPerDay} و{s.maxPagesPerDay}.
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-5 mb-3 text-[13px] font-bold text-[#4A5D56]">
                  <label htmlFor="kh-scope">ما يُطبع:</label>
                  <Select id="kh-scope" value={scope} onChange={setScope} style={{ width: 'auto' }}>
                    <option value="all">الجدول كاملاً ({count(plan.rows.length, 'day')})</option>
                    {plan.rows.length > 30 && <option value="month">أول 30 يوماً</option>}
                  </Select>
                </div>
                <ResultActions onPrint={() => print()} makeImage={makeImage}
                  imageName={`جدول-الورد-${s.days}-يوما.png`} imageLabel="بطاقة الورد" shareText={`${title}: ${daily}`} />
              </Panel>

              <Panel title="الورد يوماً بيوم" icon={Table2}>
                <div className="sm:overflow-auto sm:max-h-[680px] rounded-[14px]">
                  <table className="tool-table">
                    <thead><tr><th>اليوم</th><th>التاريخ</th><th>الورد</th><th>يبدأ من</th></tr></thead>
                    <tbody>
                      {visibleRows.map((r) => (
                        <tr key={r.day} className={r.endsKhatma ? 'is-soft' : ''}>
                          <td className="num font-bold text-[#8A6425]" aria-label="اليوم">{r.day}</td>
                          <td className="num"><span className="font-bold">{dayName(r.date)}</span> <span className="text-[#5E6E67]">{gDate(r.date)}</span>{hijri && <span className="block text-[12px] text-[#8A6425]">{hDate(r.date)}</span>}</td>
                          <td>
                            <span className="font-bold">{wirdText(r, unit)}</span>
                            <span className="text-[12.5px] text-[#5E6E67]"> · {count(r.pages, 'page')}</span>
                            {r.endsKhatma && <span className="block text-[12.5px] font-bold text-[#1F6F52]"><CheckCircle2 size={13} className="inline -mt-0.5" /> تتم الختمة {r.endsKhatma > 1 || s.khatmas > 1 ? r.endsKhatma : ''}</span>}
                            {r.prayers && (
                              <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-[#4A5D56]">
                                {r.prayers.map((p) => <li key={p.prayer}><b className="text-[#1A2E28]">{p.prayer}:</b> {prayerText(p)}</li>)}
                              </ul>
                            )}
                          </td>
                          <td data-label="يبدأ من">{startText(r)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {plan.rows.length > visibleRows.length && (
                  <button type="button" onClick={() => setShowAll(true)} className="mt-4 w-full rounded-xl py-3 text-[14px] font-bold cursor-pointer" style={{ background: '#F1ECDF', color: '#0B3B33' }}>
                    اعرض كل الأيام ({count(plan.rows.length, 'day')})
                  </button>
                )}
              </Panel>
            </>
          )}
        </div>
      </div>

      {plan && (
        <PrintPortal active={printing}>
          <PlanSheet title={`جدول الورد: ${title}`} subtitle={`وردك ${daily}`} facts={facts}>
            <table className="print-table">
              <thead><tr><th>اليوم</th><th>التاريخ</th><th>الورد</th><th>يبدأ من</th><th className="check">تمّ</th></tr></thead>
              <PrintFoot cols={5} />
              <tbody>
                {printRows.map((r) => (
                  <tr key={r.day} className={r.endsKhatma ? 'is-soft' : ''}>
                    <td className="num">{r.day}</td>
                    <td className="num">{dayName(r.date)} {gDate(r.date)}{hijri ? ` · ${hDate(r.date)}` : ''}</td>
                    <td>
                      <b>{wirdText(r, unit)}</b>{r.endsKhatma ? ' · تتم الختمة' : ''}
                      {r.prayers && <div style={{ fontSize: '8.5pt', color: '#4A5D56' }}>{r.prayers.map((p) => `${p.prayer}: ${prayerText(p)}`).join(' · ')}</div>}
                    </td>
                    <td>{startText(r)}</td>
                    <td className="check">☐</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PlanSheet>
        </PrintPortal>
      )}
      <ResultBar targetId="tool-result" label={s ? `${title} · الختم ${gDate(s.endDate, true)}` : ''} value={s ? daily : ''} cta="الجدول" />
    </ToolLayout>
  )
}

const METHOD = {
  title: 'كيف تحسب الأداة وردك',
  intro: 'الحساب على صفحات مصحف المدينة كاملة: 604 صفحات لكل ختمة، ولا يُقطع اليوم في منتصف صفحة.',
  steps: [
    { icon: Divide, t: 'صفحات كاملة موزعة بالتساوي', d: 'تقسم الأداة الصفحات على الأيام، فلا يزيد يوم على آخر أكثر من صفحة واحدة.', example: 'ختمة في 29 يوماً: 20 أو 21 صفحة كل يوم.' },
    { icon: BookOpenCheck, t: 'أجزاء كاملة حين تنقسم المدة', d: 'إن انقسمت المدة على الأجزاء (30 أو 15 أو 10 أيام…) أو على الأحزاب (20 أو 60 يوماً…) صار كل يوم أجزاءً أو أحزاباً كاملة تبدأ من أول آية فيها كما في المصحف.', example: '30 يوماً: الجزء 2 يبدأ من البقرة 142.' },
    { icon: MoonStar, t: 'رمضان بتقويم أم القرى', d: 'يحسب المتصفح بداية رمضان القادم وعدد أيامه بتقويم أم القرى. وقد يختلف يوماً عن رؤية بلدك، فعدّل تاريخ البدء إن لزم.' },
    { icon: Sunrise, t: 'القسمة على الصلوات', d: 'إن طلبتها يُقسم ورد اليوم خمسة أجزاء متقاربة: بالصفحات إن كان الورد خمس صفحات فأكثر، وإلا بالآيات، وكل جزء ينتهي عند نهاية آية.' },
    { icon: Repeat, t: 'أكثر من ختمة', d: 'اختر عدد الختمات، فتمتد الصفحات عبرها ويُعلَّم اليوم الذي تتم فيه كل ختمة.' },
    { icon: CalendarClock, t: 'أو ابدأ من الورد', d: 'إن كنت تعرف كم تقرأ كل يوم، اختر «الورد اليومي» فتعرف كم يوماً تحتاج ومتى تختم.' },
  ],
}

const FAQ = [
  { q: 'كم صفحة أقرأ في اليوم لأختم القرآن في رمضان؟', a: 'إن كان الشهر 30 يوماً فجزء كل يوم، أي نحو 20 صفحة. وإن كان 29 يوماً فـ20 أو 21 صفحة كل يوم. وإن قسّمت ورد الختمة الواحدة على الصلوات الخمس صار نحو أربع صفحات بعد كل صلاة، ولختمتين ضاعف الورد.' },
  { q: 'لماذا تظهر لي أجزاء كاملة مرة وصفحات مرة؟', a: 'حين تنقسم المدة على الأجزاء أو الأحزاب تعطيك الأداة أجزاءً كاملة تبدأ من أول آية في الجزء، وهذا ما ينتظره من يختم «جزءاً كل يوم». وفي غير ذلك توزّع الصفحات بالتساوي، فيكون الفرق بين يوم وآخر صفحة واحدة على الأكثر.' },
  { q: 'هل موعد رمضان في الأداة نهائي؟', a: 'هو حساب تقويم أم القرى كما يعرضه متصفحك، ورمضان 1448 فيه يبدأ نحو 8 فبراير 2027. أما بداية الصيام في بلدك فتتبع إعلانها، فإن اختلفت يوماً فاختر «عدد أيام» وعدّل تاريخ البدء.' },
  { q: 'هل تصلح الحاسبة لختمة الحلقة الجماعية؟', a: 'نعم. اطبع الجدول، ووزّع الأيام أو الأجزاء على الطلاب، أو أرسل بطاقة الورد في مجموعة الحلقة ليقرأ كل واحد ورد يومه.' },
  { q: 'هل يُحفظ شيء من بياناتي؟', a: 'لا. الحساب كله في متصفحك، ولا تُرسَل المدة ولا التواريخ إلى أي خادم.' },
]
