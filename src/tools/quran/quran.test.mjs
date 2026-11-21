// اختبارات منطق الأدوات على بيانات المصحف الحقيقية. التشغيل: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildIndex, ayahIndex, rangeSeq, chunkSequence, describeChunk, formatPieces, isBlockEnd,
  pageStart, splitSeqEvenly, TOTAL_PAGES, EPS,
} from './core.js'
import {
  addDays, weekday, daysBetween, hijriParts, hijriMonth, nextRamadan, formatHijri, formatGregorian, parseDate,
} from './dates.js'
import { HIFZ_AMOUNTS, buildHifzSequence, generateHifzPlan, weekRows } from './hifzPlan.js'
import { generateReviewPlan, reviewChunks, memorizedPages } from './reviewPlan.js'
import { generateKhatmPlan } from './khatm.js'

const load = (f) => JSON.parse(readFileSync(new URL(`../../data/quran/${f}`, import.meta.url), 'utf8'))
const ix = buildIndex(load('ayat-lines.json'), load('surahs.json'))
const SUN_THU = [0, 1, 2, 3, 4]
const ALL_WEEK = [0, 1, 2, 3, 4, 5, 6]
const sumW = (w, seq, a, b) => { let s = 0; for (let k = a; k <= b; k++) s += w[seq[k]]; return s }

// ───────────── البيانات والفهرس ─────────────

test('البيانات: 6236 آية، 114 سورة، 604 صفحات', () => {
  assert.equal(ix.N, 6236)
  assert.equal(ix.surahs.filter(Boolean).length, 114)
  for (let p = 1; p <= TOTAL_PAGES; p++) assert.ok(ix.pageFirst[p] >= 0, `صفحة ${p} بلا آيات`)
  let ayat = 0
  for (let s = 1; s <= 114; s++) ayat += ix.surahs[s].ayat
  assert.equal(ayat, 6236)
})

test('وزن كل صفحة بالصفحات = 1 تماماً، والمجموع 604 صفحة و8820 سطراً مكتوباً', () => {
  let totalP = 0
  let totalL = 0
  for (let p = 1; p <= TOTAL_PAGES; p++) {
    let w = 0
    for (let i = ix.pageFirst[p]; i <= ix.pageLast[p]; i++) w += ix.wPages[i]
    assert.ok(Math.abs(w - 1) < 1e-9, `صفحة ${p} وزنها ${w}`)
    totalP += w
  }
  for (let i = 0; i < ix.N; i++) totalL += ix.wLines[i]
  assert.ok(Math.abs(totalP - 604) < 1e-6)
  assert.ok(Math.abs(totalL - 8820) < 1e-6)
})

test('بدايات الأجزاء مطابقة للمصحف', () => {
  const pages = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282,
    302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582]
  for (let j = 1; j <= 30; j++) assert.equal(ix.ayat[ix.juzFirst[j]].p, pages[j - 1], `الجزء ${j}`)
  const x = (s, a) => ix.ayat[ayahIndex(ix, s, a)]
  assert.equal(x(2, 142).p, 22)
  assert.equal(x(78, 1).p, 582)
  assert.equal(x(114, 6).lp, 604)
  assert.equal(x(114, 6).ll, 15)
})

test('أسماء السور بالإملاء المعتاد', () => {
  assert.equal(ix.surahs[14].name, 'إبراهيم')
  assert.equal(ix.surahs[34].name, 'سبأ')
  assert.equal(ix.surahs[76].name, 'الإنسان')
  assert.equal(ix.surahs[78].name, 'النبأ')
  assert.equal(ix.surahs[82].name, 'الانفطار')
  assert.equal(ix.surahs[84].name, 'الانشقاق')
})

test('ayahIndex يرفض المدخلات الخاطئة', () => {
  assert.throws(() => ayahIndex(ix, 115, 1), { code: 'BAD_SURAH' })
  assert.throws(() => ayahIndex(ix, 1, 8), { code: 'BAD_AYAH' })
  assert.throws(() => ayahIndex(ix, 2, 0), { code: 'BAD_AYAH' })
  assert.equal(ayahIndex(ix, 114, 6), 6235)
})

test('pageStart: بداية الصفحة 22 هي البقرة 142 في الجزء 2', () => {
  assert.deepEqual(pageStart(ix, 22), { page: 22, surah: 2, name: 'البقرة', ayah: 142, juz: 2, hizb: 3 })
  assert.throws(() => pageStart(ix, 605), { code: 'BAD_PAGE' })
})

// ───────────── التقسيم: ثوابت على كل التوليفات ─────────────

function checkChunks(seq, chunks, label) {
  assert.ok(chunks.length > 0, label)
  assert.equal(chunks[0].start, 0, label)
  assert.equal(chunks[chunks.length - 1].end, seq.length - 1, label)
  for (let c = 0; c < chunks.length; c++) {
    assert.ok(chunks[c].end >= chunks[c].start, `${label}: مقطع فارغ ${c}`)
    if (c > 0) assert.equal(chunks[c].start, chunks[c - 1].end + 1, `${label}: فجوة أو تداخل عند ${c}`)
  }
}

const STARTS = [
  { direction: 'forward', start: { surah: 1 }, target: { type: 'all' } },
  { direction: 'forward', start: { surah: 2, ayah: 100 }, target: { type: 'juzEnd' } },
  { direction: 'forward', start: { surah: 18 }, target: { type: 'surah', surah: 25 } },
  { direction: 'forward', start: { surah: 67 }, target: { type: 'all' } },
  { direction: 'forward', start: { surah: 36, ayah: 13 }, target: { type: 'pages', pages: 37 } },
  { direction: 'reverse', start: { surah: 114 }, target: { type: 'all' } },
  { direction: 'reverse', start: { surah: 114 }, target: { type: 'juzEnd' } },
  { direction: 'reverse', start: { surah: 77, ayah: 20 }, target: { type: 'surah', surah: 67 } },
]

for (const s of STARTS) {
  for (const amt of HIFZ_AMOUNTS) {
    for (const surahAware of [false, true]) {
      const label = `${s.direction} ${s.start.surah}:${s.start.ayah || 1} ${s.target.type} ${amt.label} surahAware=${surahAware}`
      test(`تقسيم: ${label}`, () => {
        const seq = buildHifzSequence(ix, s)
        const T = amt.value
        const w = amt.unit === 'pages' ? ix.wPages : ix.wLines
        const chunks = chunkSequence(ix, seq, { unit: amt.unit, amount: T, surahAware })
        checkChunks(seq, chunks, label)
        // المتوسط قريب من المقدار المطلوب (آخر يوم قد يكون أقصر)
        const total = sumW(w, seq, 0, seq.length - 1)
        if (chunks.length > 4) {
          const avg = total / chunks.length
          assert.ok(avg > T * 0.6 && avg < T * 1.3, `${label}: المتوسط ${avg.toFixed(2)} بعيد عن ${T}`)
        }
        for (const c of chunks) {
          const cw = sumW(w, seq, c.start, c.end)
          // لا يتجاوز المقطع ضعف المقدار إلا إذا كانت فيه آية واحدة طويلة أو أكمل سورة
          if (cw > 2 * T + EPS) {
            const single = c.end === c.start
            const tailOrWhole = isBlockEnd(ix, seq, c.end)
            assert.ok(single || tailOrWhole, `${label}: مقطع ${cw.toFixed(2)} أكبر من ضعف ${T}`)
          }
          if (surahAware) {
            // لا ينتهي يوم بمطلع سورة جديدة أقل من نصف المقدار
            const d = describeChunk(ix, seq, c.start, c.end)
            if (d.pieces.length > 1) {
              const lastP = d.pieces[d.pieces.length - 1]
              if (!lastP.whole && lastP.fromAyah === 1) {
                let k = c.end
                while (k > c.start && !isBlockEnd(ix, seq, k - 1)) k--
                const after = sumW(w, seq, k, c.end)
                assert.ok(after >= 0.5 * T - EPS, `${label}: ${formatPieces(d.pieces)} ينتهي بمطلع صغير`)
              }
            }
          }
        }
      })
    }
  }
}

test('صفحة يومياً من الفاتحة: 604 يوماً، كل يوم صفحة كاملة واحدة', () => {
  const seq = rangeSeq(0, ix.N - 1)
  const chunks = chunkSequence(ix, seq, { unit: 'pages', amount: 1 })
  assert.equal(chunks.length, 604)
  chunks.forEach((c, i) => {
    const d = describeChunk(ix, seq, c.start, c.end)
    assert.equal(d.pieces[0].fromPage, i + 1)
    assert.equal(d.pieces[d.pieces.length - 1].toPage, i + 1)
    assert.equal(seq[c.end], ix.pageLast[i + 1])
  })
})

test('صفحتان يومياً: 302 يوماً على حدود الصفحات الزوجية', () => {
  const seq = rangeSeq(0, ix.N - 1)
  const chunks = chunkSequence(ix, seq, { unit: 'pages', amount: 2 })
  assert.equal(chunks.length, 302)
  chunks.forEach((c, i) => assert.equal(seq[c.end], ix.pageLast[2 * (i + 1)]))
})

test('صفحة ونصف: تتناوب نهايات الأيام بين منتصف صفحة ونهايتها، والمجموع 403 يوماً تقريباً', () => {
  const seq = rangeSeq(0, ix.N - 1)
  const chunks = chunkSequence(ix, seq, { unit: 'pages', amount: 1.5 })
  assert.ok(Math.abs(chunks.length - 403) <= 3, `${chunks.length}`)
})

test('الاتجاه العكسي: السور من الناس نزولاً، وكل سورة من أولها بترتيب آياتها', () => {
  const seq = buildHifzSequence(ix, { direction: 'reverse', start: { surah: 114 }, target: { type: 'juzEnd' } })
  assert.equal(ix.ayat[seq[0]].s, 114)
  assert.equal(ix.ayat[seq[0]].a, 1)
  assert.equal(ix.ayat[seq[seq.length - 1]].s, 78)
  assert.equal(ix.ayat[seq[seq.length - 1]].a, 40)
  let prevS = 115
  for (let k = 0; k < seq.length; k++) {
    const x = ix.ayat[seq[k]]
    if (x.s !== prevS) { assert.equal(x.s, prevS - 1); assert.equal(x.a, 1); prevS = x.s } else assert.equal(x.a, ix.ayat[seq[k - 1]].a + 1)
  }
  assert.equal(seq.length, 564) // آيات جزء عمّ
})

test('العكسي لإتمام جزء يبدأ وسط سورة: تُحفظ السورة كاملة (الذاريات في الجزء 27)', () => {
  const seq = buildHifzSequence(ix, { direction: 'reverse', start: { surah: 57 }, target: { type: 'juzEnd' } })
  const last = ix.ayat[seq[seq.length - 1]]
  const firstOfLastSurah = seq.find((i) => ix.ayat[i].s === 51)
  assert.equal(last.s, 51)
  assert.equal(ix.ayat[firstOfLastSurah].a, 1)
})

test('أهداف خاطئة تُرفض', () => {
  assert.throws(() => buildHifzSequence(ix, { direction: 'forward', start: { surah: 10 }, target: { type: 'surah', surah: 5 } }), { code: 'BAD_TARGET' })
  assert.throws(() => buildHifzSequence(ix, { direction: 'reverse', start: { surah: 10 }, target: { type: 'surah', surah: 50 } }), { code: 'BAD_TARGET' })
  assert.throws(() => buildHifzSequence(ix, { direction: 'up', start: { surah: 1 }, target: { type: 'all' } }), { code: 'BAD_DIRECTION' })
  assert.throws(() => chunkSequence(ix, [0, 1], { unit: 'lines', amount: 0 }), { code: 'BAD_AMOUNT' })
})

test('هدف عدد صفحات: 20 صفحة من بداية البقرة تنتهي بنهاية الصفحة 21', () => {
  const seq = buildHifzSequence(ix, { direction: 'forward', start: { surah: 2 }, target: { type: 'pages', pages: 20 } })
  assert.equal(seq[seq.length - 1], ix.pageLast[21])
})

test('حالات معروفة: لا «نوح 24–28، الجن 1»، والناس والفلق معاً', () => {
  const half = generateHifzPlan(ix, {
    start: { surah: 67 }, target: { type: 'juzEnd' }, amount: { unit: 'pages', value: 0.5 },
    startDate: '2026-11-22', weekdays: SUN_THU,
  })
  const labels = half.rows.map((r) => formatPieces(r.pieces))
  assert.ok(!labels.some((l) => /الجن 1$/.test(l)), labels.join(' | '))
  assert.ok(labels.includes('الملك 27–30'))
  const rev = generateHifzPlan(ix, {
    direction: 'reverse', start: { surah: 114 }, target: { type: 'juzEnd' }, amount: { unit: 'lines', value: 7 },
    startDate: '2026-11-22', weekdays: SUN_THU,
  })
  assert.equal(formatPieces(rev.rows[0].pieces), 'الناس (كاملة)، الفلق (كاملة)')
})

test('describeChunk: عدد الأسطر من الأوزان، ومدى الأسطر الملموسة منفصل', () => {
  const seq = rangeSeq(ayahIndex(ix, 2, 1), ayahIndex(ix, 2, 5))
  const d = describeChunk(ix, seq, 0, seq.length - 1)
  assert.equal(d.pages, 1)
  assert.equal(d.pieces[0].fromPage, 2)
  assert.equal(d.lines, 6)
  assert.equal(formatPieces(d.pieces), 'البقرة 1–5')
  const one = describeChunk(ix, [ayahIndex(ix, 2, 282)], 0, 0)
  assert.equal(formatPieces(one.pieces), 'البقرة 282')
  assert.equal(one.pieces[0].lineSpan, 15)
})

test('splitSeqEvenly: خمسة أجزاء غير فارغة متصلة ومتقاربة', () => {
  const seq = rangeSeq(ix.pageFirst[3], ix.pageLast[6])
  const parts = splitSeqEvenly(ix, seq, 5)
  assert.equal(parts.length, 5)
  checkChunks(seq, parts, 'split')
  for (const p of parts) {
    const w = sumW(ix.wPages, seq, p.start, p.end)
    assert.ok(w > 0.4 && w < 1.3, `${w}`)
  }
  // تسلسل أقصر من عدد الأجزاء
  const tiny = splitSeqEvenly(ix, [0, 1, 2], 5)
  checkChunks([0, 1, 2], tiny, 'tiny')
})

// ───────────── التواريخ ─────────────

test('التواريخ: أيام الأسبوع وحساب الفروق والسنة الكبيسة', () => {
  assert.equal(weekday('2026-11-22'), 0) // الأحد
  assert.equal(addDays('2028-02-28', 1), '2028-02-29')
  assert.equal(addDays('2026-12-31', 1), '2027-01-01')
  assert.equal(daysBetween('2026-11-22', '2027-11-22'), 365)
  assert.throws(() => parseDate('2026-02-30'), { code: 'BAD_DATE' })
  assert.throws(() => parseDate('22/11/2026'), { code: 'BAD_DATE' })
})

test('الهجري أم القرى: رمضان 1448 يبدأ 8 فبراير 2027 ومدته 29 يوماً', () => {
  assert.deepEqual(hijriMonth(1448, 9), { start: '2027-02-08', days: 29 })
  assert.deepEqual(hijriParts('2027-02-08'), { y: 1448, m: 9, d: 1 })
  assert.deepEqual(nextRamadan('2026-11-21'), { year: 1448, start: '2027-02-08', days: 29 })
  assert.equal(nextRamadan('2027-03-20').year, 1449)
  assert.equal(formatHijri('2027-02-08'), '1 رمضان 1448هـ')
  assert.equal(formatGregorian('2027-02-08'), '8 فبراير 2027')
})

// ───────────── خطة الحفظ ─────────────

test('خطة الحفظ: صفحة يومياً للبقرة من الأحد إلى الخميس', () => {
  const plan = generateHifzPlan(ix, {
    start: { surah: 2 }, target: { type: 'surah', surah: 2 }, amount: { unit: 'pages', value: 1 },
    startDate: '2026-11-22', weekdays: SUN_THU,
  })
  assert.equal(plan.summary.newDays, 48) // الصفحات 2–49
  assert.equal(plan.summary.totalPages, 48)
  assert.equal(plan.rows[0].date, '2026-11-22')
  for (const r of plan.rows) assert.ok(SUN_THU.includes(r.weekday))
  // 48 يوماً دراسياً = 9 أسابيع كاملة + 3 أيام → ينتهي الثلاثاء
  assert.equal(plan.summary.endDate, addDays('2026-11-22', 9 * 7 + 2))
  assert.equal(plan.rows[47].pieces[0].toPage, 49)
})

test('خطة الحفظ: يوم التثبيت الأسبوعي بلا جديد، ويراجع ما حُفظ في أسبوعه', () => {
  const plan = generateHifzPlan(ix, {
    start: { surah: 78 }, target: { type: 'all' }, amount: { unit: 'lines', value: 5 },
    startDate: '2026-11-26', weekdays: SUN_THU, consolidationDay: 4,
  })
  // البدء يوم خميس (تثبيت) بلا حفظ سابق: لا يُكتب يوم تثبيت فارغ
  assert.equal(plan.rows[0].type, 'new')
  assert.equal(plan.rows[0].date, '2026-11-29')
  const cons = plan.rows.filter((r) => r.type === 'consolidate')
  assert.ok(cons.length > 0)
  for (const r of cons) {
    assert.equal(r.weekday, 4)
    assert.equal(r.reviewOf.length, 4)
  }
  for (const r of plan.rows.filter((x) => x.type === 'new')) assert.notEqual(r.weekday, 4)
  assert.equal(plan.summary.newDays + plan.summary.consolidationDays, plan.rows.length)
})

test('خطة الحفظ: يوم التثبيت وحده لا يكفي', () => {
  assert.throws(() => generateHifzPlan(ix, {
    start: { surah: 1 }, target: { type: 'all' }, amount: { unit: 'pages', value: 1 },
    startDate: '2026-11-22', weekdays: [5], consolidationDay: 5,
  }), { code: 'NO_DAYS' })
})

test('weekRows: أسبوع واحد من الخطة', () => {
  const plan = generateHifzPlan(ix, {
    start: { surah: 2 }, target: { type: 'juzEnd' }, amount: { unit: 'lines', value: 7 },
    startDate: '2026-11-22', weekdays: SUN_THU,
  })
  const w = weekRows(plan, '2026-11-29')
  assert.equal(w.length, 5)
  assert.equal(w[0].date, '2026-11-29')
})

// ───────────── المراجعة ─────────────

test('المراجعة: جزء يومياً للقرآن كله = 30 يوماً، كل يوم بلا انقطاع', () => {
  const plan = generateReviewPlan(ix, {
    range: { type: 'juz', from: 1, to: 30 }, amount: { unit: 'juz', value: 1 },
    startDate: '2026-11-22', weekdays: ALL_WEEK,
  })
  assert.equal(plan.summary.cycleStudyDays, 30)
  assert.equal(plan.summary.cycleCalendarDays, 30)
  assert.equal(plan.rows[1].review.fromPage, 22)
  assert.equal(plan.rows[29].review.toPage, 604)
})

test('المراجعة: 10 صفحات يومياً للقرآن = 61 يوماً دراسياً (آخرها 4 صفحات)', () => {
  const chunks = reviewChunks(ix, { type: 'pages', from: 1, to: 604 }, { unit: 'pages', value: 10 })
  assert.equal(chunks.length, 61)
  assert.equal(chunks[60].pages, 4)
  assert.equal(chunks.reduce((n, c) => n + c.pages, 0), 604)
})

test('المراجعة العكسية والسبقي: لمن حفظ من الناس، الأحدث في أول النطاق', () => {
  const plan = generateReviewPlan(ix, {
    range: { type: 'juz', from: 30, to: 26 }, amount: { unit: 'pages', value: 10 }, order: 'desc',
    sabaqiPages: 3, startDate: '2026-11-22', weekdays: SUN_THU,
  })
  assert.deepEqual(plan.summary.memorized, { from: 502, to: 604, juzFrom: 26, juzTo: 30 })
  assert.equal(plan.rows[0].review.fromPage, 595)
  assert.equal(plan.rows[0].review.toPage, 604)
  assert.equal(plan.rows[0].sabaqi.fromPage, 502)
  assert.equal(plan.rows[0].sabaqi.toPage, 504)
  const asc = generateReviewPlan(ix, {
    range: { type: 'pages', from: 1, to: 101 }, amount: { unit: 'pages', value: 5 }, sabaqiPages: 4,
    startDate: '2026-11-22', weekdays: SUN_THU, cycles: 2,
  })
  assert.equal(asc.rows[0].sabaqi.fromPage, 98)
  assert.equal(asc.summary.cycleStudyDays, 21)
  assert.equal(asc.rows.length, 42)
  assert.equal(asc.rows[21].cycle, 2)
  assert.equal(asc.rows[21].review.fromPage, 1)
})

test('المراجعة بالأجزاء على نطاق صفحات: الحدود لا تخرج عن المحفوظ', () => {
  const m = memorizedPages(ix, { type: 'pages', from: 30, to: 70 })
  assert.equal(m.juzFrom, 2)
  assert.equal(m.juzTo, 4)
  const chunks = reviewChunks(ix, { type: 'pages', from: 30, to: 70 }, { unit: 'juz', value: 1 })
  assert.equal(chunks[0].fromPage, 30)
  assert.equal(chunks[chunks.length - 1].toPage, 70)
  assert.throws(() => memorizedPages(ix, { type: 'juz', from: 0, to: 3 }), { code: 'BAD_RANGE' })
})

// ───────────── الختم ─────────────

test('ختم في 30 يوماً: كل يوم جزء كامل من أول آية فيه', () => {
  const k = generateKhatmPlan(ix, { mode: 'duration', days: 30, startDate: '2027-02-08' })
  assert.equal(k.summary.unit, 'juz')
  assert.equal(k.rows.length, 30)
  k.rows.forEach((r, i) => {
    assert.deepEqual(r.juz, { from: i + 1, to: i + 1 })
    assert.equal(r.start.juz, i + 1)
  })
  assert.deepEqual([k.rows[1].start.surah, k.rows[1].start.ayah], [2, 142])
  assert.equal(k.rows[29].endsKhatma, 1)
  assert.equal(k.summary.endDate, '2027-03-09')
})

test('ختم رمضان 29 يوماً: صفحات كاملة 20–21، مجموعها 604 بلا فجوة', () => {
  const r = nextRamadan('2026-11-21')
  const k = generateKhatmPlan(ix, { mode: 'duration', days: r.days, startDate: r.start })
  assert.equal(k.summary.unit, 'pages')
  assert.equal(k.rows.length, 29)
  assert.equal(k.rows.reduce((n, x) => n + x.pages, 0), 604)
  let next = 1
  for (const x of k.rows) {
    assert.equal(x.runs[0].fromPage, next)
    assert.ok(x.pages >= 20 && x.pages <= 21)
    next = x.endPage + 1
  }
  assert.equal(k.summary.endDate, '2027-03-08')
})

test('ختمتان في 29 يوماً: يوم يعبر من الختمة الأولى إلى الثانية', () => {
  const k = generateKhatmPlan(ix, { mode: 'duration', days: 29, khatmas: 2 })
  assert.equal(k.rows.reduce((n, x) => n + x.pages, 0), 1208)
  const cross = k.rows.find((x) => x.runs.length === 2)
  assert.ok(cross)
  assert.equal(cross.runs[0].toPage, 604)
  assert.equal(cross.runs[1].fromPage, 1)
  assert.equal(cross.endsKhatma, null)
  assert.equal(k.rows.filter((x) => x.endsKhatma).length, 1) // الثانية تنتهي في آخر يوم
  assert.equal(k.rows[28].endsKhatma, 2)
})

test('ختم في 20 يوماً: 3 أحزاب يومياً', () => {
  const k = generateKhatmPlan(ix, { mode: 'duration', days: 20 })
  assert.equal(k.summary.unit, 'hizb')
  assert.deepEqual(k.rows[1].hizb, { from: 4, to: 6 })
  assert.equal(k.rows[1].start.hizb, 4)
})

test('ختمتان في 30 يوماً: جزءان يومياً', () => {
  const k = generateKhatmPlan(ix, { mode: 'duration', days: 30, khatmas: 2 })
  assert.equal(k.summary.unit, 'juz')
  assert.deepEqual(k.rows[15].juz, { from: 1, to: 2 })
  assert.equal(k.rows[14].endsKhatma, 1)
})

test('ختم بتاريخ انتهاء، وبالوتيرة: 20 صفحة يومياً = 31 يوماً آخرها 4 صفحات', () => {
  const k = generateKhatmPlan(ix, { mode: 'duration', startDate: '2026-12-01', endDate: '2027-02-28' })
  assert.equal(k.rows.length, 90)
  assert.equal(k.summary.unit, 'pages') // 90 لا تنقسم عليها الأجزاء ولا الأحزاب
  assert.equal(k.rows[89].date, '2027-02-28')
  const p = generateKhatmPlan(ix, { mode: 'pace', pagesPerDay: 20 })
  assert.equal(p.rows.length, 31)
  assert.equal(p.rows[30].pages, 4)
  assert.equal(p.rows[30].endsKhatma, 1)
})

test('تقسيم الورد على الصلوات: صفحات كاملة إن كانت 5 فأكثر، وبالآيات إن قلّت', () => {
  const k = generateKhatmPlan(ix, { mode: 'duration', days: 29, prayers: true })
  for (const r of k.rows) {
    assert.equal(r.prayers.length, 5)
    assert.equal(r.prayers.reduce((n, x) => n + x.pages, 0), r.pages)
    assert.equal(r.prayers[0].runs[0].fromPage, r.runs[0].fromPage)
  }
  const slow = generateKhatmPlan(ix, { mode: 'duration', days: 300, prayers: true })
  const day = slow.rows[0] // صفحتان: الفاتحة وأول البقرة
  assert.equal(day.prayers.length, 5)
  assert.equal(day.prayers[0].pieces[0].name, 'الفاتحة')
  const total = day.prayers.reduce((n, x) => n + x.pages, 0)
  assert.ok(Math.abs(total - day.pages) < 0.05, `${total}`)
  const juz = generateKhatmPlan(ix, { mode: 'duration', days: 30, prayers: true })
  const first = juz.rows[1].prayers[0].pieces[0]
  assert.deepEqual([first.surah, first.fromAyah], [2, 142])
})

test('الختم: مدخلات خاطئة', () => {
  assert.throws(() => generateKhatmPlan(ix, { mode: 'duration', days: 700 }), { code: 'TOO_LONG' })
  assert.throws(() => generateKhatmPlan(ix, { mode: 'duration', days: 0 }), { code: 'BAD_DAYS' })
  assert.throws(() => generateKhatmPlan(ix, { mode: 'pace', pagesPerDay: 0 }), { code: 'BAD_PACE' })
  assert.throws(() => generateKhatmPlan(ix, { mode: 'duration', days: 30, khatmas: 0 }), { code: 'BAD_KHATMAS' })
  assert.throws(() => generateKhatmPlan(ix, { mode: 'duration', endDate: '2027-01-01' }), { code: 'BAD_DATE' })
})
