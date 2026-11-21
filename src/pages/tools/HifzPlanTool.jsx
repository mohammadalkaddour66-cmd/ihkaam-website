import { useMemo, useState } from 'react'
import { ChevronRight, ChevronLeft, Ruler, Scissors, BookMarked, Repeat2, ArrowUpFromLine, CalendarRange, Loader2, Settings2, Table2 } from 'lucide-react'
import ToolLayout from '../../components/tools/ToolLayout'
import { HifzVisual } from '../../components/tools/ToolVisuals'
import { Field, TextInput, NumberInput, DateInput, Select, Segmented, Chips, WeekdayPicker, Toggle, Panel, Stat, Step, MoreOptions, ResultBar, INK } from '../../components/tools/controls'
import { SurahAyahPicker, SurahSelect } from '../../components/tools/SurahPicker'
import { SURAHS } from '../../components/tools/surahs'
import { useQuranIndex, useDateField, usePrint } from '../../components/tools/hooks'
import { PrintPortal, PlanSheet, PrintFoot } from '../../components/tools/print'
import ResultActions from '../../components/tools/ResultActions'
import { drawListCard, safeFileName } from '../../components/tools/canvasKit'
import { count, dayName, gDate, hDate, spanLabel, pagesLabel } from '../../components/tools/format'
import { getTool } from '../../config/tools'
import { HIFZ_AMOUNTS, generateHifzPlan, formatPieces, daysBetween, WEEKDAYS_AR } from '../../tools/quran/index.js'

const tool = getTool('hifz-plan')

const pieceFrom = (p) => (p.whole ? p.name : `${p.name} ${p.fromAyah}`)
const pieceTo = (p) => (p.whole ? p.name : `${p.name} ${p.toAyah}`)

/* نوع الخطة: حفظ (للصغار في الحلقات) أو تلاوة (للكبار في أوراد القراءة).
   الحساب واحد، وتتغير العناوين في الجدول والطباعة وبطاقة الأسبوع. */
const KINDS = {
  hifz: {
    plan: 'خطة حفظ القرآن', eyebrow: 'خطة الحفظ لهذا الأسبوع', eyebrowN: 'خطة الحفظ', cardTitle: 'خطة الحفظ الأسبوعية',
    col: 'الحفظ الجديد', lastDay: 'آخر يوم حفظ', newDays: 'أيام حفظ جديد', recapDays: 'أيام تثبيت', recap: 'تثبيت', did: 'حفظه',
    who: 'اسم الطالب', fileName: 'خطة-الحفظ', toggle: 'يوم تثبيت أسبوعي',
    toggleHint: 'يوم بلا حفظ جديد، يعيد فيه الطالب كل ما حفظه منذ آخر تثبيت.',
  },
  tilawa: {
    plan: 'خطة تلاوة القرآن', eyebrow: 'خطة التلاوة لهذا الأسبوع', eyebrowN: 'خطة التلاوة', cardTitle: 'خطة التلاوة الأسبوعية',
    col: 'المقطع المقروء', lastDay: 'آخر يوم تلاوة', newDays: 'أيام تلاوة', recapDays: 'أيام مراجعة', recap: 'مراجعة', did: 'قرأه',
    who: 'اسم القارئ', fileName: 'خطة-التلاوة', toggle: 'يوم مراجعة أسبوعي',
    toggleHint: 'يوم بلا مقطع جديد، يعيد فيه القارئ ما قرأه منذ آخر مراجعة.',
  },
}

/* وصف يوم التثبيت: من أول ما حُفظ منذ آخر تثبيت إلى آخره */
function consolidationText(row, byIndex, K) {
  const a = byIndex.get(row.reviewOf[0])
  const b = byIndex.get(row.reviewOf[row.reviewOf.length - 1])
  if (!a || !b) return `${K.recap}: يعيد ما ${K.did} هذا الأسبوع`
  const first = a.pieces[0]
  const last = b.pieces[b.pieces.length - 1]
  const span = first.surah === last.surah
    ? (first.fromAyah === 1 && last.toAyah === SURAHS[first.surah - 1].ayat ? `${first.name} كاملة` : `${first.name} ${first.fromAyah}–${last.toAyah}`)
    : `من ${pieceFrom(first)} إلى ${pieceTo(last)}`
  return `${K.recap} بلا جديد: يعيد ${span}`
}

const DIRECTIONS = [
  { value: 'reverse', label: 'من الناس صعوداً', sub: 'بالسور، وكل سورة من أولها' },
  { value: 'forward', label: 'من البقرة نزولاً', sub: 'بترتيب المصحف' },
]
const DEFAULT_START = { reverse: { surah: 114, ayah: 1 }, forward: { surah: 2, ayah: 1 } }
const DEFAULT_TARGET_SURAH = { reverse: 78, forward: 2 }

export default function HifzPlanTool() {
  const { ix, error: loadError } = useQuranIndex()
  const [startDate, setStartDate] = useDateField()
  const [kind, setKind] = useState('hifz')
  const [direction, setDirection] = useState('reverse')
  const [start, setStart] = useState(DEFAULT_START.reverse)
  const [targetType, setTargetType] = useState('juzEnd')
  const [targetSurah, setTargetSurah] = useState(DEFAULT_TARGET_SURAH.reverse)
  const [targetPages, setTargetPages] = useState(20)
  const [amountId, setAmountId] = useState('l5')
  const [weekdays, setWeekdays] = useState([0, 1, 2, 3, 4])
  const [consolidate, setConsolidate] = useState(true)
  const [consolidationDay, setConsolidationDay] = useState(4)
  const [name, setName] = useState('')
  const [hijri, setHijri] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [week, setWeek] = useState(0)
  const [scope, setScope] = useState('all')
  const { printing, print } = usePrint()

  const K = KINDS[kind]
  const amount = HIFZ_AMOUNTS.find((a) => a.id === amountId)
  const cDay = consolidate && weekdays.includes(consolidationDay) ? consolidationDay : null

  function changeDirection(d) {
    setDirection(d)
    setStart(DEFAULT_START[d])
    setTargetSurah(DEFAULT_TARGET_SURAH[d])
    setWeek(0)
  }

  /* التلاوة تبدأ من البقرة بصفحة يومياً بلا يوم تثبيت؛ والحفظ من الناس بخمسة أسطر مع تثبيت */
  function changeKind(k) {
    setKind(k)
    setConsolidate(k === 'hifz')
    setAmountId(k === 'hifz' ? 'l5' : 'p1')
    changeDirection(k === 'hifz' ? 'reverse' : 'forward')
  }

  const startJuz = ix ? ix.ayat[ix.surahStart[start.surah] + (Number(start.ayah) || 1) - 1]?.j : null

  const result = useMemo(() => {
    if (!ix || !startDate) return null
    const target = targetType === 'surah' ? { type: 'surah', surah: targetSurah }
      : targetType === 'pages' ? { type: 'pages', pages: Number(targetPages) || 0 }
        : { type: targetType }
    try {
      const plan = generateHifzPlan(ix, {
        direction, start: { surah: start.surah, ayah: Number(start.ayah) || 1 }, target,
        amount, startDate, weekdays, consolidationDay: cDay,
      })
      return { plan }
    } catch (e) {
      return { error: e.message || 'تعذّر إنشاء الخطة' }
    }
  }, [ix, startDate, direction, start, targetType, targetSurah, targetPages, amount, weekdays, cDay])

  const plan = result?.plan
  const byIndex = useMemo(() => new Map((plan?.rows || []).filter((r) => r.type === 'new').map((r) => [r.index, r])), [plan])
  const weekOf = (date) => Math.floor(daysBetween(plan.summary.startDate, date) / 7)
  const weeksCount = plan ? weekOf(plan.rows[plan.rows.length - 1]?.date || plan.summary.startDate) + 1 : 0
  const curWeek = Math.min(week, Math.max(0, weeksCount - 1))
  const weekRowsList = plan ? plan.rows.filter((r) => weekOf(r.date) === curWeek) : []

  const rowText = (r) => (r.type === 'new' ? formatPieces(r.pieces) : consolidationText(r, byIndex, K))
  const dateCell = (date) => (
    <>
      <span className="font-bold">{dayName(date)}</span>{' '}
      <span className="text-[#5E6E67]">{gDate(date)}</span>
      {hijri && <span className="block text-[12px] text-[#8A6425]">{hDate(date)}</span>}
    </>
  )

  const printRows = !plan ? [] : scope === 'week' ? weekRowsList
    : scope === 'month' ? plan.rows.filter((r) => daysBetween(plan.summary.startDate, r.date) < 28) : plan.rows

  async function makeImage() {
    const rows = weekRowsList.map((r) => (r.type === 'new'
      ? { badge: dayName(r.date), badgeSub: gDate(r.date), text: formatPieces(r.pieces), sub: `${pagesLabel(r.pieces[0].fromPage, r.pieces[r.pieces.length - 1].toPage)} · ${count(r.lines, 'line')}` }
      : { badge: dayName(r.date), badgeSub: gDate(r.date), text: consolidationText(r, byIndex, K), soft: true }))
    const first = weekRowsList[0]?.date
    const last = weekRowsList[weekRowsList.length - 1]?.date
    return drawListCard({
      eyebrow: curWeek === 0 ? K.eyebrow : `${K.eyebrowN}: الأسبوع ${curWeek + 1}`,
      title: name ? `خطة ${name}` : K.cardTitle,
      range: first ? `${gDate(first)}${last && last !== first ? ` – ${gDate(last)}` : ''}` : '',
      rows,
      note: `${kind === 'hifz' ? 'المقدار اليومي' : 'الورد اليومي'}: ${amount.label} · ${K.lastDay}: ${gDate(plan.summary.endDate, true)}`,
    })
  }

  const s = plan?.summary
  const facts = s ? [
    { value: gDate(s.endDate, true), label: K.lastDay },
    { value: spanLabel(s.calendarDays), label: 'المدة' },
    { value: count(s.newDays, 'day'), label: K.newDays },
    ...(s.consolidationDays ? [{ value: count(s.consolidationDays, 'day'), label: K.recapDays }] : []),
    { value: `${s.totalPages} ص · ${count(s.totalLines, 'line')}`, label: 'المقدار كله' },
  ] : []

  const visibleRows = plan ? (showAll ? plan.rows : plan.rows.slice(0, 36)) : []

  return (
    <ToolLayout
      tool={tool}
      lead="اختر خطة حفظ لطلاب الحلقة أو خطة تلاوة لوردٍ تقرؤه، ثم من أين تبدأ، وإلى أين تصل، وكم في اليوم، وأيام الحلقة. تقسم الأداة المقدار على الأيام بالسطر في مصحف المدينة، وينتهي كل يوم عند نهاية آية، فتأخذ جدولاً بالتاريخ والسورة والآيات والصفحة."
      visual={<HifzVisual />}
      method={METHOD}
      faq={FAQ}
    >
      <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
        {/* ── المدخلات ── */}
        <Panel title="بيانات الخطة" icon={Settings2} className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <Step n={1} title="ما نوع الخطة؟" hint="اختر ما يناسبك، ويُضبط الباقي تلقائياً.">
            <Segmented value={kind} onChange={changeKind} size="sm"
              options={[{ value: 'hifz', label: 'خطة حفظ', sub: 'للطلاب في الحلقات' }, { value: 'tilawa', label: 'خطة تلاوة', sub: 'ورد قراءة للكبار' }]} />
            <Segmented label="من أين يسير؟" value={direction} onChange={changeDirection} options={DIRECTIONS} size="sm" />
          </Step>

          <Step n={2} title="من أين تبدأ وإلى أين تصل؟">
            <SurahAyahPicker label="يبدأ من" surah={start.surah} ayah={start.ayah} onChange={setStart} reverse={direction === 'reverse'} />
            <Field label="ويصل إلى" htmlFor="hp-target">
              <Select id="hp-target" value={targetType} onChange={setTargetType}>
                <option value="juzEnd">{direction === 'forward' ? `نهاية الجزء${startJuz ? ` ${startJuz}` : ''}` : `إتمام الجزء${startJuz ? ` ${startJuz}` : ''}`}</option>
                <option value="surah">سورة معيّنة (حتى آخرها)</option>
                <option value="all">{direction === 'forward' ? 'آخر المصحف' : 'الفاتحة: القرآن كاملاً'}</option>
                <option value="pages">عدد من الصفحات</option>
              </Select>
            </Field>
            {targetType === 'surah' && (
              <Field label="سورة الهدف" htmlFor="hp-tsurah">
                <SurahSelect id="hp-tsurah" value={targetSurah} onChange={setTargetSurah} reverse={direction === 'reverse'}
                  from={direction === 'forward' ? start.surah : 1} to={direction === 'forward' ? 114 : start.surah} />
              </Field>
            )}
            {targetType === 'pages' && (
              <Field label="عدد الصفحات" htmlFor="hp-tpages">
                <NumberInput id="hp-tpages" value={targetPages} min={1} max={604} onChange={setTargetPages} />
              </Field>
            )}
          </Step>

          <Step n={3} title={kind === 'hifz' ? 'كم يحفظ في اليوم؟' : 'كم يقرأ في اليوم؟'} hint="المقدار وأيام الحلقة في الأسبوع.">
            <Chips label={kind === 'hifz' ? 'المقدار اليومي' : 'الورد اليومي'} value={amountId} onChange={setAmountId} options={HIFZ_AMOUNTS.map((a) => ({ value: a.id, label: a.label }))} />
            <WeekdayPicker value={weekdays} onChange={setWeekdays} marked={cDay} markLabel={K.toggle} />
            <div className="rounded-2xl p-4 space-y-3" style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              <Toggle label={K.toggle} checked={consolidate} onChange={setConsolidate} hint={K.toggleHint} />
              {consolidate && (
                <Select aria-label={K.toggle} value={consolidationDay} onChange={(v) => setConsolidationDay(Number(v))}>
                  {weekdays.map((d) => <option key={d} value={d}>{WEEKDAYS_AR[d]}</option>)}
                </Select>
              )}
            </div>
          </Step>

          <Step n={4} title="متى تبدأ؟">
            <Field label="تاريخ البدء" htmlFor="hp-date">
              <DateInput id="hp-date" value={startDate} onChange={setStartDate} />
            </Field>
            <MoreOptions title="الاسم والتاريخ الهجري" hint="اختيارية: الاسم يظهر على الورقة المطبوعة">
              <Field label={K.who} htmlFor="hp-name">
                <TextInput id="hp-name" value={name} onChange={setName} placeholder="اختياري" maxLength={40} />
              </Field>
              <Toggle label="أظهر التاريخ الهجري" checked={hijri} onChange={setHijri} hint="بتقويم أم القرى، وقد يختلف يوماً عن رؤية بلدك." />
            </MoreOptions>
          </Step>
        </Panel>

        {/* ── النتيجة ── */}
        <div id="tool-result" className="min-w-0 space-y-5 scroll-mt-24">
          {!result && (
            <Panel>
              <div className="flex items-center gap-3 text-[15px] text-[#4A5D56] py-6 justify-center">
                {loadError ? <span className="text-[#9A3B2E] font-bold">{loadError}</span> : <><Loader2 size={18} className="animate-spin" /> يُجهّز بيانات المصحف…</>}
              </div>
            </Panel>
          )}
          {result?.error && (
            <Panel><p className="text-[15px] font-bold py-4 text-center" style={{ color: '#9A3B2E' }}>{result.error}</p></Panel>
          )}

          {plan && (
            <>
              <Panel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <Stat accent value={gDate(s.endDate, true)} label={hijri ? `${K.lastDay} · ${hDate(s.endDate, true)}` : K.lastDay} />
                  <Stat value={spanLabel(s.calendarDays)} label="المدة من أول يوم" />
                  <Stat value={count(s.newDays, 'day')} label={s.consolidationDays ? `${K.newDays}، و${count(s.consolidationDays, 'day')} ${K.recap}` : K.newDays} />
                  <Stat value={`${s.totalPages} صفحة`} label={`${count(s.totalLines, 'line')}، ${count(s.totalAyat, 'ayah')}`} />
                </div>
              </Panel>

              <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-[12.5px] font-bold text-[#8A6425]">{kind === 'hifz' ? 'صورة «خطة هذا الأسبوع» لولي الأمر' : 'صورة «خطة هذا الأسبوع» للمشاركة'}</div>
                    <div className="font-black text-[17px] text-[#1A2E28]">الأسبوع {curWeek + 1} من {weeksCount}</div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" aria-label="الأسبوع السابق" disabled={curWeek === 0} onClick={() => setWeek(curWeek - 1)}
                      className="w-11 h-11 rounded-xl grid place-items-center cursor-pointer disabled:opacity-40" style={{ background: '#F1ECDF', color: INK }}><ChevronRight size={18} /></button>
                    <button type="button" aria-label="الأسبوع التالي" disabled={curWeek >= weeksCount - 1} onClick={() => setWeek(curWeek + 1)}
                      className="w-11 h-11 rounded-xl grid place-items-center cursor-pointer disabled:opacity-40" style={{ background: '#F1ECDF', color: INK }}><ChevronLeft size={18} /></button>
                  </div>
                </div>
                <ul className="grid sm:grid-cols-2 gap-2 mb-5">
                  {weekRowsList.map((r) => (
                    <li key={r.date} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={r.type === 'new' ? { background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)' } : { background: '#FBF1DD', boxShadow: 'inset 0 0 0 1px rgba(184,134,58,.4)' }}>
                      <span className="w-16 shrink-0 rounded-lg py-1 text-center text-[12px] font-bold leading-tight"
                        style={r.type === 'new' ? { background: INK, color: '#F8F5EC' } : { background: '#E0B562', color: INK }}>
                        {dayName(r.date)}<span className="block font-medium opacity-80">{gDate(r.date)}</span>
                      </span>
                      <span className={`text-[14px] font-bold leading-snug ${r.type === 'new' ? 'text-[#1A2E28]' : 'text-[#8A6425]'}`}>{rowText(r)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-2 mb-3 text-[13px] font-bold text-[#4A5D56]">
                  <label htmlFor="hp-scope">ما يُطبع:</label>
                  <Select id="hp-scope" value={scope} onChange={setScope} style={{ width: 'auto', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                    <option value="all">الخطة كاملة ({count(plan.rows.length, 'day')})</option>
                    <option value="month">أول أربعة أسابيع</option>
                    <option value="week">الأسبوع المعروض فقط</option>
                  </Select>
                </div>
                <ResultActions
                  onPrint={() => print()}
                  makeImage={makeImage}
                  imageName={`${safeFileName(name, K.fileName)}-الأسبوع-${curWeek + 1}.png`}
                  imageLabel="صورة خطة الأسبوع"
                  shareText={K.eyebrow}
                />
              </Panel>

              <Panel title="الجدول كاملاً" icon={Table2}>
                <div className="sm:overflow-auto sm:max-h-[640px] rounded-[14px]">
                  <table className="tool-table">
                    <thead>
                      <tr><th>#</th><th>اليوم</th><th>{K.col}</th><th>الصفحة</th><th>الأسطر</th></tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((r, i) => {
                        const newWeek = i > 0 && weekOf(r.date) !== weekOf(visibleRows[i - 1].date)
                        return r.type === 'new' ? (
                          <tr key={r.date} className={newWeek ? 'is-week' : ''}>
                            <td className="num text-[#8A6425] font-bold" aria-label="الترتيب">{r.index}</td>
                            <td className="num">{dateCell(r.date)}</td>
                            <td className="font-bold">{formatPieces(r.pieces)}</td>
                            <td className="num" data-label="الصفحة">{pagesLabel(r.pieces[0].fromPage, r.pieces[r.pieces.length - 1].toPage)}</td>
                            <td className="num" data-label="الأسطر">{r.lines}</td>
                          </tr>
                        ) : (
                          <tr key={r.date} className={`is-soft${newWeek ? ' is-week' : ''}`}>
                            <td className="num">↺</td>
                            <td className="num">{dateCell(r.date)}</td>
                            <td colSpan={3} className="font-bold">{consolidationText(r, byIndex, K)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {plan.rows.length > visibleRows.length && (
                  <button type="button" onClick={() => setShowAll(true)} className="mt-4 w-full rounded-xl py-3 text-[14px] font-bold cursor-pointer"
                    style={{ background: '#F1ECDF', color: INK }}>
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
          <PlanSheet
            title={K.plan}
            subtitle={`${DIRECTIONS.find((d) => d.value === direction).label} · ${amount.label} يومياً · من ${gDate(s.startDate, true)}`}
            name={name}
            facts={facts}
          >
            <table className="print-table">
              <thead>
                <tr><th>#</th><th>اليوم</th><th>{K.col}</th><th>الصفحة</th><th>الأسطر</th><th className="check">تمّ</th></tr>
              </thead>
              <PrintFoot cols={6} />
              <tbody>
                {printRows.map((r, i) => {
                  const newWeek = i > 0 && weekOf(r.date) !== weekOf(printRows[i - 1].date)
                  const date = `${dayName(r.date)} ${gDate(r.date)}${hijri ? ` · ${hDate(r.date)}` : ''}`
                  return r.type === 'new' ? (
                    <tr key={r.date} className={newWeek ? 'is-week' : ''}>
                      <td className="num">{r.index}</td><td className="num">{date}</td><td><b>{formatPieces(r.pieces)}</b></td>
                      <td className="num">{pagesLabel(r.pieces[0].fromPage, r.pieces[r.pieces.length - 1].toPage)}</td><td className="num">{r.lines}</td><td className="check">☐</td>
                    </tr>
                  ) : (
                    <tr key={r.date} className={`is-soft${newWeek ? ' is-week' : ''}`}>
                      <td className="num">↺</td><td className="num">{date}</td><td colSpan={3}><b>{consolidationText(r, byIndex, K)}</b></td><td className="check">☐</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </PlanSheet>
        </PrintPortal>
      )}
      <ResultBar targetId="tool-result" label={s ? `${K.lastDay}` : ''} value={s ? `${gDate(s.endDate, true)} · ${spanLabel(s.calendarDays)}` : ''} cta="الخطة" />
    </ToolLayout>
  )
}

/* ── كيف تحسب الأداة: القواعد كما نُفّذت في src/tools/quran ── */
const METHOD = {
  title: 'كيف تقسم الأداة الحفظ والتلاوة على الأيام',
  intro: 'الأداة تقسم بالسطر المكتوب لا بالصفحة التقريبية. كل قاعدة أدناه مطبّقة في الحساب نفسه، ومختبرة على بيانات المصحف آيةً آية.',
  steps: [
    { icon: Ruler, t: 'تقيس بالسطر المكتوب', d: 'لكل آية وزن بعدد الأسطر التي تشغلها في مصحف المدينة. أسطر عناوين السور والبسملة لا تُحسب، والسطر المشترك بين آيتين يُقسَم بينهما.', example: 'الصفحة 15 سطراً، فخمسة أسطر ثلث صفحة تقريباً.' },
    { icon: Scissors, t: 'اليوم ينتهي عند نهاية آية', d: 'لا تُقطع آية بين يومين. تختار الأداة أقرب نهاية آية إلى المقدار المطلوب، ولذلك يزيد اليوم أو ينقص سطراً. ومقادير الصفحة الكاملة تنتهي عند آخر الصفحة.' },
    { icon: BookMarked, t: 'تحترم حدود السور', d: 'في الأسطر ونصف الصفحة والحفظ من الناس: لا يبدأ اليوم سورة جديدة بأقل من نصف المقدار، ولا يُترك من سورة ذيل أقل من ربعه، والسور القصيرة تجتمع في يوم واحد.', example: 'لا تجد يوماً مثل «نوح 24–28، الجن 1». وتجد «الفلق والإخلاص» معاً.' },
    { icon: Repeat2, t: 'يوم التثبيت الأسبوعي', d: 'في اليوم الذي تختاره لا حفظ جديد: يعيد الطالب كل ما حفظه منذ آخر يوم تثبيت. ولا يأتي يوم تثبيت قبل أي حفظ، فإن وافق أول يوم في الخطة يوم التثبيت بدأ الحفظ في اليوم الدراسي التالي.' },
    { icon: ArrowUpFromLine, t: 'الحفظ من الناس صعوداً', d: 'تتقدم الخطة بالسور من آخر المصحف إلى أوله، وكل سورة تُحفظ من أولها إلى آخرها. و«إتمام الجزء» في هذا الاتجاه يصل إلى أول سورة تبدأ في الجزء ويحفظها كاملة.', example: 'إتمام جزء عمّ من الناس ينتهي بسورة النبأ كاملة.' },
    { icon: CalendarRange, t: 'التواريخ على أيام حلقتك', d: 'كل يوم في الجدول يوم دراسة من الأيام التي اخترتها. والتاريخ الهجري بتقويم أم القرى كما يحسبه متصفحك، وقد يختلف يوماً عن رؤية بلدك.' },
  ],
}

const FAQ = [
  { q: 'ما الفرق بين خطة الحفظ وخطة التلاوة؟', a: 'الحساب واحد: مقاطع يومية بالسطر تنتهي عند نهاية آية. أما الفرق فيما تقترحه الأداة وما تكتبه. خطة الحفظ تبدأ من الناس صعوداً بخمسة أسطر مع يوم تثبيت، وتناسب الصغار في الحلقات. وخطة التلاوة تبدأ من البقرة بصفحة يومياً بلا يوم تثبيت، وتناسب وِرد القراءة للكبار، وتتغير عناوين الجدول وبطاقة الأسبوع بحسب اختيارك. ولختمة في مدة معينة جرّب حاسبة الختم.' },
  { q: 'كم يحفظ الطالب المبتدئ في اليوم؟', a: 'ابدأ بمقدار أخف مما تظن، ثلاثة أسطر أو خمسة للصغار والمبتدئين، وجرّبه أسبوعين. إن أتقن الطالب أسبوعين متتاليين فارفع المقدار درجة، وإن ضعف فاخفضه. ثم أنشئ الخطة من جديد من حيث وصل.' },
  { q: 'لماذا لا تتساوى مقادير الأيام تماماً؟', a: 'لأن اليوم ينتهي دائماً عند نهاية آية، والآيات تختلف طولاً، ولأن الأداة لا تقطع سورة بذيل صغير ولا تبدأ سورة جديدة بآية واحدة. لذلك يزيد بعض الأيام سطراً أو ينقص، ويبقى المجموع على المقدار الذي اخترته.' },
  { q: 'ما يوم التثبيت، وهل أحتاجه؟', a: 'يوم في الأسبوع بلا حفظ جديد، يعيد فيه الطالب ما حفظه منذ آخر تثبيت حتى يستقر قبل أن يبني عليه. يناسب أكثر الطلاب، ويمكنك إيقافه من النموذج فتصير كل أيام الحلقة حفظاً جديداً.' },
  { q: 'تغيّب الطالب أياماً، كيف أعدّل الخطة؟', a: 'اجعل نقطة البدء الآية التي وصل إليها فعلاً، وتاريخ البدء يوم عودته، فتحسب الأداة الخطة من جديد بتاريخ ختم محدّث. لا تحاول تعويض الغياب بمضاعفة المقدار.' },
  { q: 'هل يُرسَل اسم الطالب أو أي بيانات إلى إحكام؟', a: 'لا. الحساب كله يجري في متصفحك، واسم الطالب يبقى في الصفحة ولا يُرسَل إلى أي خادم. وإذا أغلقت الصفحة لا يُحفظ شيء.' },
  { q: 'أي مصحف تعتمد الأداة؟', a: 'مصحف المدينة النبوية برواية حفص، 604 صفحات و15 سطراً في الصفحة، وهو المعتاد في الحلقات. أرقام الصفحات والأسطر من بيانات quran.com، ومطابقة لبدايات الأجزاء في المصحف المطبوع.' },
]
