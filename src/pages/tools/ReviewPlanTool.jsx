import { useMemo, useState } from 'react'
import { ChevronRight, ChevronLeft, Layers, ArrowDownUp, Clock3, Sparkle, CalendarCheck, Loader2, Settings2, Table2, Gauge } from 'lucide-react'
import ToolLayout from '../../components/tools/ToolLayout'
import { ReviewVisual } from '../../components/tools/ToolVisuals'
import { Field, TextInput, NumberInput, DateInput, Select, Segmented, Chips, WeekdayPicker, Toggle, Panel, Stat, INK } from '../../components/tools/controls'
import { useQuranIndex, useDateField, usePrint } from '../../components/tools/hooks'
import { PrintPortal, PlanSheet, PrintFoot } from '../../components/tools/print'
import ResultActions from '../../components/tools/ResultActions'
import { drawListCard, safeFileName } from '../../components/tools/canvasKit'
import { count, dayName, gDate, hDate, pagesLabel, juzLabel } from '../../components/tools/format'
import { getTool } from '../../config/tools'
import { REVIEW_AMOUNTS, generateReviewPlan, daysBetween } from '../../tools/quran/index.js'

const tool = getTool('review-plan')

/* 15 صفحة يومياً: المقدار الذي يقترحه مقال جدول المراجعة لمن حفظ 11–20 جزءاً */
const AMOUNTS = [
  ...REVIEW_AMOUNTS.filter((a) => a.unit === 'pages'),
  { id: 'p15', unit: 'pages', value: 15, label: '15 صفحة' },
  ...REVIEW_AMOUNTS.filter((a) => a.unit === 'juz'),
]

const ORDERS = [
  { value: 'desc', label: 'حفظ من الناس', sub: 'المراجعة تبدأ من آخر المصحف' },
  { value: 'asc', label: 'حفظ من البقرة', sub: 'المراجعة تبدأ من أول المحفوظ' },
]

const JUZ = Array.from({ length: 30 }, (_, i) => i + 1)

function reviewText(rv) {
  if (rv.juzFrom) {
    const j = rv.juzFrom === rv.juzTo ? juzLabel(rv.juzFrom).replace(/^\d+: /, '') : `الأجزاء ${rv.juzFrom}–${rv.juzTo}`
    return `${j} (${pagesLabel(rv.fromPage, rv.toPage)})`
  }
  return pagesLabel(rv.fromPage, rv.toPage)
}
const startText = (rv) => `يبدأ من ${rv.start.name} ${rv.start.ayah === 1 ? '(أولها)' : rv.start.ayah}`

export default function ReviewPlanTool() {
  const { ix, error: loadError } = useQuranIndex()
  const [startDate, setStartDate] = useDateField()
  const [rangeType, setRangeType] = useState('juz')
  const [juzFrom, setJuzFrom] = useState(28)
  const [juzTo, setJuzTo] = useState(30)
  const [pageFrom, setPageFrom] = useState(542)
  const [pageTo, setPageTo] = useState(604)
  const [order, setOrder] = useState('desc')
  const [amountId, setAmountId] = useState('p5')
  const [sabaqi, setSabaqi] = useState(false)
  const [sabaqiPages, setSabaqiPages] = useState(5)
  const [weekdays, setWeekdays] = useState([0, 1, 2, 3, 4])
  const [cycles, setCycles] = useState(1)
  const [name, setName] = useState('')
  const [hijri, setHijri] = useState(false)
  const [week, setWeek] = useState(0)
  const [scope, setScope] = useState('all')
  const { printing, print } = usePrint()

  const amount = AMOUNTS.find((a) => a.id === amountId)

  const result = useMemo(() => {
    if (!ix || !startDate) return null
    const range = rangeType === 'juz'
      ? { type: 'juz', from: juzFrom, to: juzTo }
      : { type: 'pages', from: Number(pageFrom) || 1, to: Number(pageTo) || 1 }
    try {
      const plan = generateReviewPlan(ix, {
        range, amount, order, sabaqiPages: sabaqi ? Number(sabaqiPages) || 0 : 0,
        startDate, weekdays, cycles: Number(cycles) || 1,
      })
      return { plan }
    } catch (e) {
      return { error: e.message || 'تعذّر إنشاء الجدول' }
    }
  }, [ix, startDate, rangeType, juzFrom, juzTo, pageFrom, pageTo, order, amount, sabaqi, sabaqiPages, weekdays, cycles])

  const plan = result?.plan
  const s = plan?.summary
  const weekOf = (date) => Math.floor(daysBetween(s.startDate, date) / 7)
  const weeksCount = plan ? weekOf(plan.rows[plan.rows.length - 1].date) + 1 : 0
  const curWeek = Math.min(week, Math.max(0, weeksCount - 1))
  const weekRowsList = plan ? plan.rows.filter((r) => weekOf(r.date) === curWeek) : []
  const sab = plan?.rows[0]?.sabaqi
  const memorizedLabel = s ? (s.memorized.juzFrom === s.memorized.juzTo ? `الجزء ${s.memorized.juzFrom}` : `الأجزاء ${s.memorized.juzFrom}–${s.memorized.juzTo}`) : ''

  const printRows = !plan ? [] : scope === 'week' ? weekRowsList : scope === 'cycle' ? plan.rows.filter((r) => r.cycle === 1) : plan.rows

  async function makeImage() {
    return drawListCard({
      eyebrow: curWeek === 0 ? 'جدول المراجعة لهذا الأسبوع' : `جدول المراجعة: الأسبوع ${curWeek + 1}`,
      title: name ? `مراجعة ${name}` : 'جدول المراجعة الأسبوعي',
      range: `${memorizedLabel} · ${amount.label} يومياً`,
      rows: weekRowsList.map((r) => ({ badge: dayName(r.date), badgeSub: gDate(r.date), text: reviewText(r.review), sub: startText(r.review) })),
      note: `تختم مراجعة محفوظك كل ${count(s.cycleCalendarDays, 'day')}${sab ? ` · والسبقي يومياً: ${pagesLabel(sab.fromPage, sab.toPage)}` : ''}`,
    })
  }

  const facts = s ? [
    { value: count(s.cycleCalendarDays, 'day'), label: 'تختم مراجعة المحفوظ كل' },
    { value: `${memorizedLabel} (${count(s.totalPages, 'page')})`, label: 'المحفوظ' },
    { value: count(s.cycleStudyDays, 'day'), label: 'أيام حلقة في الدورة' },
    ...(sab ? [{ value: `${pagesLabel(sab.fromPage, sab.toPage)} يومياً`, label: 'المراجعة القريبة (السبقي)' }] : []),
  ] : []

  return (
    <ToolLayout
      tool={tool}
      lead="حدّد ما حفظه الطالب، وكم يراجع منه في اليوم، وأيام الحلقة. توزّع الأداة المحفوظ على الأيام في دورة ثابتة تمرّ عليه كله، وتخبرك كل كم يوماً يختم الطالب مراجعة محفوظه، ومعها المراجعة القريبة إن شئت."
      visual={<ReviewVisual />}
      method={METHOD}
      faq={FAQ}
    >
      <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
        <Panel title="بيانات المراجعة" icon={Settings2} className="lg:sticky lg:top-24">
          <div className="space-y-5">
            <Segmented label="المحفوظ بـ" value={rangeType} onChange={setRangeType} size="sm"
              options={[{ value: 'juz', label: 'الأجزاء' }, { value: 'pages', label: 'الصفحات' }]} />
            {rangeType === 'juz' ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="من الجزء" htmlFor="rp-jf">
                  <Select id="rp-jf" value={juzFrom} onChange={(v) => setJuzFrom(Number(v))}>
                    {JUZ.map((j) => <option key={j} value={j}>{juzLabel(j)}</option>)}
                  </Select>
                </Field>
                <Field label="إلى الجزء" htmlFor="rp-jt">
                  <Select id="rp-jt" value={juzTo} onChange={(v) => setJuzTo(Number(v))}>
                    {JUZ.map((j) => <option key={j} value={j}>{juzLabel(j)}</option>)}
                  </Select>
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="من صفحة" htmlFor="rp-pf"><NumberInput id="rp-pf" value={pageFrom} min={1} max={604} onChange={setPageFrom} /></Field>
                <Field label="إلى صفحة" htmlFor="rp-pt"><NumberInput id="rp-pt" value={pageTo} min={1} max={604} onChange={setPageTo} /></Field>
              </div>
            )}
            <Segmented label="كيف حفظ الطالب؟" value={order} onChange={setOrder} options={ORDERS} size="sm" />
            <Chips label="مقدار المراجعة اليومي" value={amountId} onChange={setAmountId} options={AMOUNTS.map((a) => ({ value: a.id, label: a.label }))} />
            <div className="rounded-2xl p-4 space-y-3" style={{ background: '#F8F5EC', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
              <Toggle label="أضف المراجعة القريبة (السبقي)" checked={sabaqi} onChange={setSabaqi}
                hint="آخر ما حفظه الطالب يُراجَع كل يوم إلى جانب الدورة." />
              {sabaqi && (
                <Field label="عدد صفحات السبقي" htmlFor="rp-sab">
                  <NumberInput id="rp-sab" value={sabaqiPages} min={1} max={40} onChange={setSabaqiPages} />
                </Field>
              )}
            </div>
            <WeekdayPicker value={weekdays} onChange={setWeekdays} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="تاريخ البدء" htmlFor="rp-date"><DateInput id="rp-date" value={startDate} onChange={setStartDate} /></Field>
              <Field label="عدد الدورات" htmlFor="rp-cyc">
                <Select id="rp-cyc" value={cycles} onChange={(v) => setCycles(Number(v))}>
                  {[1, 2, 3, 4, 6].map((c) => <option key={c} value={c}>{c === 1 ? 'دورة واحدة' : c === 2 ? 'دورتان' : `${c} دورات`}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="اسم الطالب" htmlFor="rp-name"><TextInput id="rp-name" value={name} onChange={setName} placeholder="اختياري" maxLength={40} /></Field>
            <Toggle label="أظهر التاريخ الهجري" checked={hijri} onChange={setHijri} hint="بتقويم أم القرى، وقد يختلف يوماً عن رؤية بلدك." />
          </div>
        </Panel>

        <div className="min-w-0 space-y-5">
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
                  <Stat accent value={count(s.cycleCalendarDays, 'day')} label="تختم مراجعة محفوظك كل" />
                  <Stat value={count(s.totalPages, 'page')} label={memorizedLabel} />
                  <Stat value={count(s.cycleStudyDays, 'day')} label="أيام حلقة في الدورة" />
                  <Stat value={gDate(s.cycleEndDate, true)} label={hijri ? `نهاية الدورة الأولى · ${hDate(s.cycleEndDate)}` : 'نهاية الدورة الأولى'} />
                </div>
                {sab && (
                  <p className="mt-4 rounded-xl px-4 py-3 text-[14px] leading-[1.8] font-bold" style={{ background: '#FBF1DD', color: '#7A5A2E' }}>
                    ومعها كل يوم المراجعة القريبة (السبقي): {pagesLabel(sab.fromPage, sab.toPage)}، {startText(sab)}.
                  </p>
                )}
                {amount.unit === 'pages' && s.totalPages / amount.value > 30 && (
                  <p className="mt-3 text-[13px] leading-[1.8] text-[#5E6E67]">
                    <Gauge size={14} className="inline -mt-0.5" color="#8A6425" /> الدورة طويلة: سيعود الطالب إلى أول محفوظه بعد أكثر من شهر. فكّر في رفع المقدار اليومي.
                  </p>
                )}
              </Panel>

              <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-[12.5px] font-bold text-[#8A6425]">صورة «مراجعة هذا الأسبوع»</div>
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
                    <li key={r.date} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
                      <span className="w-16 shrink-0 rounded-lg py-1 text-center text-[12px] font-bold leading-tight" style={{ background: INK, color: '#F8F5EC' }}>
                        {dayName(r.date)}<span className="block font-medium opacity-80">{gDate(r.date)}</span>
                      </span>
                      <span className="leading-snug">
                        <span className="block text-[14px] font-bold text-[#1A2E28]">{reviewText(r.review)}</span>
                        <span className="block text-[12.5px] text-[#5E6E67]">{startText(r.review)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-2 mb-3 text-[13px] font-bold text-[#4A5D56]">
                  <label htmlFor="rp-scope">ما يُطبع:</label>
                  <Select id="rp-scope" value={scope} onChange={setScope} style={{ width: 'auto' }}>
                    <option value="all">الجدول كاملاً ({count(plan.rows.length, 'day')})</option>
                    {cycles > 1 && <option value="cycle">الدورة الأولى فقط</option>}
                    <option value="week">الأسبوع المعروض فقط</option>
                  </Select>
                </div>
                <ResultActions onPrint={() => print()} makeImage={makeImage}
                  imageName={`${safeFileName(name, 'جدول-المراجعة')}-الأسبوع-${curWeek + 1}.png`}
                  imageLabel="صورة مراجعة الأسبوع" shareText="جدول المراجعة لهذا الأسبوع" />
              </Panel>

              <Panel title="الجدول كاملاً" icon={Table2}>
                <div className="overflow-auto max-h-[640px] rounded-[14px]">
                  <table className="tool-table">
                    <thead><tr><th>#</th><th>اليوم</th><th>المراجعة</th><th>تبدأ من</th></tr></thead>
                    <tbody>
                      {plan.rows.map((r, i) => {
                        const sep = i > 0 && (weekOf(r.date) !== weekOf(plan.rows[i - 1].date) || r.cycle !== plan.rows[i - 1].cycle)
                        return (
                          <tr key={r.date} className={sep ? 'is-week' : ''}>
                            <td className="num text-[#8A6425] font-bold">{cycles > 1 ? `${r.cycle}/${r.index}` : r.index}</td>
                            <td className="num"><span className="font-bold">{dayName(r.date)}</span> <span className="text-[#5E6E67]">{gDate(r.date)}</span>{hijri && <span className="block text-[12px] text-[#8A6425]">{hDate(r.date)}</span>}</td>
                            <td className="font-bold">{reviewText(r.review)}</td>
                            <td>{r.review.start.name} {r.review.start.ayah}<span className="block text-[12px] text-[#5E6E67]">الجزء {r.review.start.juz}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>

      {plan && (
        <PrintPortal active={printing}>
          <PlanSheet title="جدول مراجعة الحفظ" subtitle={`${memorizedLabel} · ${amount.label} يومياً · من ${gDate(s.startDate, true)}`} name={name} facts={facts}>
            <table className="print-table">
              <thead><tr><th>#</th><th>اليوم</th><th>المراجعة</th><th>تبدأ من</th>{sab && <th className="check">السبقي</th>}<th className="check">تمّ</th></tr></thead>
              <PrintFoot cols={sab ? 6 : 5} />
              <tbody>
                {printRows.map((r, i) => {
                  const sep = i > 0 && (weekOf(r.date) !== weekOf(printRows[i - 1].date) || r.cycle !== printRows[i - 1].cycle)
                  return (
                    <tr key={r.date} className={sep ? 'is-week' : ''}>
                      <td className="num">{cycles > 1 ? `${r.cycle}/${r.index}` : r.index}</td>
                      <td className="num">{dayName(r.date)} {gDate(r.date)}{hijri ? ` · ${hDate(r.date)}` : ''}</td>
                      <td><b>{reviewText(r.review)}</b></td>
                      <td>{r.review.start.name} {r.review.start.ayah}</td>
                      {sab && <td className="check">☐</td>}
                      <td className="check">☐</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </PlanSheet>
        </PrintPortal>
      )}
    </ToolLayout>
  )
}

const METHOD = {
  title: 'كيف تبني الأداة دورة المراجعة',
  intro: 'المراجعة هنا هي المراجعة البعيدة: دورة تمرّ على المحفوظ كله بمقدار ثابت، حتى لا يبتعد الطالب عن أول ما حفظه أكثر من دورة واحدة.',
  steps: [
    { icon: Layers, t: 'المحفوظ يتحول إلى صفحات', d: 'تأخذ الأداة حدود الأجزاء من مصحف المدينة صفحةً صفحة. والجزء قد يبدأ في منتصف صفحة، فتُحسب الصفحة كاملة في المراجعة.', example: 'الأجزاء 28 إلى 30 = الصفحات 542 إلى 604، أي 63 صفحة.' },
    { icon: Clock3, t: 'مقدار ثابت كل يوم', d: 'خمس صفحات أو عشر أو خمس عشرة، أو جزء أو جزءان كاملان بحدودهما. وآخر يوم في الدورة يأخذ ما بقي ولو كان أقل.' },
    { icon: ArrowDownUp, t: 'الترتيب يتبع طريقة الحفظ', d: 'من حفظ من البقرة يبدأ مراجعته من أول محفوظه. ومن حفظ من الناس يبدأ من آخر المصحف صعوداً، فيراجع أقدم محفوظه أولاً.' },
    { icon: Sparkle, t: 'المراجعة القريبة (السبقي)', d: 'إن فعّلتها تُضاف كل يوم آخرُ الصفحات التي حفظها الطالب: آخر المحفوظ لمن يحفظ من البقرة، وأوله لمن يحفظ من الناس. وحدود السبقي تختلف بين المعاهد، فاختر العدد الذي يعتمده معهدك.' },
    { icon: CalendarCheck, t: '«تختم كل كذا يوماً» بالتقويم', d: 'الرقم أيام تقويمية من أول يوم في الدورة إلى آخر يوم فيها، وتدخل فيها أيام الإجازة. أما عدد أيام الحلقة في الدورة فتجده بجانبه.' },
  ],
}

const FAQ = [
  { q: 'كم يراجع الطالب من محفوظه كل يوم؟', a: 'كلما كبر المحفوظ كبرت المراجعة اليومية، وإلا طالت الدورة حتى يعود الطالب إلى أول ما حفظه بعد أشهر. اقتراح عملي: خمس صفحات لمن حفظ حتى ثلاثة أجزاء، وعشر صفحات حتى عشرة أجزاء، وخمس عشرة حتى عشرين جزءاً، وجزء كامل لما فوق ذلك، ثم يعدّل المعلم حسب قدرة الطالب.' },
  { q: 'ما الفرق بين السبقي والمراجعة البعيدة؟', a: 'السبقي هو المراجعة القريبة: ما حفظه الطالب في الأيام أو الأسابيع الأخيرة ولم يستقر بعد، فيُعاد كل يوم. والمراجعة البعيدة، وتسميها بعض الحلقات «المنزل»، هي الدورة التي تمرّ على المحفوظ القديم كله. هذه الأداة تبني الدورة، وتضيف السبقي إن طلبته.' },
  { q: 'لماذا يختلف «تختم كل كذا يوماً» عن عدد أيام الدورة؟', a: 'لأن الأول أيام تقويمية تدخل فيها أيام الإجازة، والثاني أيام الحلقة التي يراجع فيها الطالب فعلاً. فدورة من 13 يوم حلقة على خمسة أيام في الأسبوع تمتد 17 يوماً في التقويم.' },
  { q: 'هل أدمج هذا الجدول مع خطة الحفظ الجديد؟', a: 'نعم. أنشئ خطة الحفظ الجديد بمولّد خطة الحفظ، وجدول المراجعة هنا، واطبعهما معاً للطالب. ويوم التثبيت في خطة الحفظ يكمّل هذا الجدول ولا يغني عنه.' },
  { q: 'هل يُحفظ اسم الطالب أو جدوله عندكم؟', a: 'لا. الحساب في متصفحك ولا يُرسَل شيء إلى إحكام. اطبع الجدول أو احفظه PDF أو صورة قبل أن تغلق الصفحة.' },
]
