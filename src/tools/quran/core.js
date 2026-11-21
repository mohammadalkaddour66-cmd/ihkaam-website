// منطق المقاطع المشترك لأدوات إحكام المجانية (خطة الحفظ، المراجعة، الختم).
// كله حساب في المتصفح على بيانات مصحف المدينة (604 صفحات، 15 سطراً للصفحة).
//
// وحدة القياس: السطر المكتوب. أسطر عناوين السور والبسملة لا تُحسب.
// لكل آية «وزن» = مجموع الأسطر التي تشغلها، والسطر المشترك بين آيتين يُقسَم بينهما.
// فمجموع أوزان آيات أي مقطع ≈ عدد أسطره، ومجموع أوزان الصفحة الواحدة بالصفحات = 1 تماماً
// (الصفحات في هذا المصحف تنتهي دائماً عند نهاية آية).

export const LINES_PER_PAGE = 15
export const TOTAL_PAGES = 604
export const EPS = 1e-6

export class QuranToolError extends Error {
  constructor(code, message) {
    super(message || code)
    this.code = code
  }
}

const gpos = (page, line) => (page - 1) * LINES_PER_PAGE + line

/**
 * يبني فهرساً من ملفي البيانات. يُستدعى مرة واحدة بعد التحميل.
 * @param {Array} ayat  محتوى ayat-lines.json
 * @param {Array} surahs محتوى surahs.json
 */
export function buildIndex(ayat, surahs) {
  const N = ayat.length
  const G = TOTAL_PAGES * LINES_PER_PAGE
  const owners = new Uint16Array(G + 1) // كم آية تلمس كل سطر
  const first = new Int32Array(N)
  const last = new Int32Array(N)
  for (let i = 0; i < N; i++) {
    const x = ayat[i]
    first[i] = gpos(x.fp, x.fl)
    last[i] = gpos(x.lp, x.ll)
    for (let g = first[i]; g <= last[i]; g++) owners[g]++
  }
  // الأسطر المكتوبة في كل صفحة، والمجموع التراكمي للأسطر المكتوبة على المواضع العامة
  const textLinesOnPage = new Uint8Array(TOTAL_PAGES + 1)
  const coveredPrefix = new Int32Array(G + 1)
  for (let g = 1; g <= G; g++) {
    const c = owners[g] > 0 ? 1 : 0
    coveredPrefix[g] = coveredPrefix[g - 1] + c
    if (c) textLinesOnPage[Math.ceil(g / LINES_PER_PAGE)]++
  }
  const wLines = new Float64Array(N)
  const wPages = new Float64Array(N)
  for (let i = 0; i < N; i++) {
    let wl = 0
    let wp = 0
    for (let g = first[i]; g <= last[i]; g++) {
      wl += 1 / owners[g]
      wp += 1 / (owners[g] * textLinesOnPage[Math.ceil(g / LINES_PER_PAGE)])
    }
    wLines[i] = wl
    wPages[i] = wp
  }

  const surahStart = new Int32Array(115)
  const surahEnd = new Int32Array(115)
  const pageFirst = new Int32Array(TOTAL_PAGES + 1).fill(-1)
  const pageLast = new Int32Array(TOTAL_PAGES + 1)
  const juzFirst = new Int32Array(31).fill(-1)
  const juzLast = new Int32Array(31)
  for (let i = 0; i < N; i++) {
    const x = ayat[i]
    if (x.a === 1) surahStart[x.s] = i
    surahEnd[x.s] = i
    if (pageFirst[x.p] < 0) pageFirst[x.p] = i
    pageLast[x.p] = i
    if (juzFirst[x.j] < 0) juzFirst[x.j] = i
    juzLast[x.j] = i
  }
  const surahByNumber = new Array(115)
  for (const s of surahs) surahByNumber[s.n] = s

  return {
    ayat, surahs: surahByNumber, N,
    first, last, wLines, wPages, coveredPrefix, textLinesOnPage,
    surahStart, surahEnd, pageFirst, pageLast, juzFirst, juzLast,
  }
}

/** فهرس الآية (سورة، آية) في ترتيب المصحف. */
export function ayahIndex(ix, surah, ayah = 1) {
  const s = ix.surahs[surah]
  if (!s) throw new QuranToolError('BAD_SURAH', `سورة غير موجودة: ${surah}`)
  if (!(ayah >= 1 && ayah <= s.ayat)) throw new QuranToolError('BAD_AYAH', `الآية ${ayah} خارج سورة ${s.name}`)
  return ix.surahStart[surah] + ayah - 1
}

/** عدد الأسطر المكتوبة فعلاً من أول آية إلى آخر آية في مدى متصل من المصحف. */
export function linesBetween(ix, i, j) {
  return ix.coveredPrefix[ix.last[j]] - ix.coveredPrefix[ix.first[i] - 1]
}

/** تسلسل متصل من المصحف [i..j] كمصفوفة فهارس. */
export function rangeSeq(i, j) {
  const out = new Array(j - i + 1)
  for (let k = 0; k <= j - i; k++) out[k] = i + k
  return out
}

/** هل الموضع k في التسلسل آخرُ آية قبل انتقال إلى سورة أخرى أو قفزة؟ */
export function isBlockEnd(ix, seq, k) {
  if (k >= seq.length - 1) return true
  const a = seq[k]
  const b = seq[k + 1]
  return b !== a + 1 || ix.ayat[a].s !== ix.ayat[b].s
}

/**
 * يقسم تسلسلاً من الآيات إلى مقاطع يومية، كل مقطع ينتهي عند نهاية آية.
 * @param {object} ix
 * @param {number[]} seq فهارس الآيات بترتيب القراءة
 * @param {object} opt
 * @param {'lines'|'pages'} opt.unit
 * @param {number} opt.amount المقدار اليومي بالوحدة
 * @param {boolean} [opt.surahAware] احترام نهايات السور (التوقف عندها، وعدم ترك ذيل صغير)
 * @returns {Array<{start:number,end:number}>} مواضع في seq (شاملة)
 */
export function chunkSequence(ix, seq, { unit, amount, surahAware = false }) {
  if (!(amount > 0)) throw new QuranToolError('BAD_AMOUNT', 'المقدار اليومي يجب أن يكون أكبر من صفر')
  const w = unit === 'pages' ? ix.wPages : ix.wLines
  const T = amount
  const oneLine = unit === 'pages' ? 1 / LINES_PER_PAGE : 1
  const tailLimit = Math.max(0.25 * T, oneLine)
  const L = seq.length
  const chunks = []
  let i = 0
  while (i < L) {
    // 1) أقرب نهاية آية إلى المقدار المطلوب
    let cum = 0
    let j = i
    for (; j < L; j++) {
      cum += w[seq[j]]
      if (cum >= T - EPS) break
    }
    if (j >= L) {
      j = L - 1
    } else if (j > i) {
      const prev = cum - w[seq[j]]
      if (T - prev < cum - T - EPS) j--
    }

    if (surahAware) {
      // 2) إن عبر المقطع إلى سورة جديدة ولم يأخذ منها نصف المقدار، يتوقف عند نهاية السابقة
      //    (لا «نوح 24–28، الجن 1»). أما بقية سورة قصيرة مع مطلع التالية فمقبول.
      let lastBoundary = -1
      for (let k = i; k < j; k++) if (isBlockEnd(ix, seq, k)) lastBoundary = k
      let after = 0
      if (lastBoundary >= 0) for (let k = lastBoundary + 1; k <= j; k++) after += w[seq[k]]
      // سورة قصيرة تكتمل داخل المقطع ليست «جزءاً صغيراً»، فتبقى (الناس والفلق في يوم)
      if (lastBoundary >= 0 && after < 0.5 * T - EPS && !isBlockEnd(ix, seq, j)) {
        j = lastBoundary
      } else if (!isBlockEnd(ix, seq, j)) {
        // 3) لا يُترك من السورة ذيل صغير لليوم التالي
        let tail = 0
        let e = j + 1
        for (; e < L; e++) {
          tail += w[seq[e]]
          if (tail > tailLimit + EPS) break
          if (isBlockEnd(ix, seq, e)) break
        }
        if (e < L && tail <= tailLimit + EPS && isBlockEnd(ix, seq, e)) j = e
      }
    }
    chunks.push({ start: i, end: j })
    i = j + 1
  }
  return chunks
}

/**
 * يصف مقطعاً (مواضع start..end في seq) بأجزاء متصلة داخل كل سورة.
 */
export function describeChunk(ix, seq, start, end) {
  const pieces = []
  let runStart = start
  for (let k = start; k <= end; k++) {
    if (k === end || isBlockEnd(ix, seq, k)) {
      const a = seq[runStart]
      const b = seq[k]
      const A = ix.ayat[a]
      const B = ix.ayat[b]
      const s = ix.surahs[A.s]
      pieces.push({
        surah: A.s,
        name: s.name,
        fromAyah: A.a,
        toAyah: B.a,
        whole: A.a === 1 && B.a === s.ayat,
        fromPage: A.p,
        toPage: B.p,
        lines: Math.round(sumW(ix.wLines, seq, runStart, k)),
        // الأسطر التي يلمسها المقطع (يشمل السطر المشترك مع اليوم السابق أو التالي)
        lineSpan: linesBetween(ix, a, b),
      })
      runStart = k + 1
    }
  }
  const pages = sumW(ix.wPages, seq, start, end)
  const firstA = ix.ayat[seq[start]]
  return {
    pieces,
    lines: Math.round(sumW(ix.wLines, seq, start, end)),
    ayat: end - start + 1,
    pages: Math.round(pages * 100) / 100,
    juz: firstA.j,
    hizb: firstA.h,
  }
}

function sumW(w, seq, start, end) {
  let s = 0
  for (let k = start; k <= end; k++) s += w[seq[k]]
  return s
}

/** نص مختصر للمقطع: «البقرة 1–5» أو «الإخلاص (كاملة)، الفلق (كاملة)». */
export function formatPieces(pieces) {
  return pieces
    .map((p) => {
      if (p.whole) return `${p.name} (كاملة)`
      if (p.fromAyah === p.toAyah) return `${p.name} ${p.fromAyah}`
      return `${p.name} ${p.fromAyah}–${p.toAyah}`
    })
    .join('، ')
}

/** موضع بداية الصفحة: أول آية فيها والسورة والجزء. */
export function pageStart(ix, page) {
  if (!(page >= 1 && page <= TOTAL_PAGES)) throw new QuranToolError('BAD_PAGE', `صفحة غير موجودة: ${page}`)
  const x = ix.ayat[ix.pageFirst[page]]
  return { page, surah: x.s, name: ix.surahs[x.s].name, ayah: x.a, juz: x.j, hizb: x.h }
}

/** يقسم تسلسلاً إلى n أجزاء متقاربة الوزن (بالصفحات)، كل جزء ينتهي عند نهاية آية. */
export function splitSeqEvenly(ix, seq, n) {
  const w = ix.wPages
  let total = 0
  for (const a of seq) total += w[a]
  const parts = []
  let i = 0
  let cum = 0 // وزن ما قبل i
  for (let q = 1; q <= n && i < seq.length; q++) {
    if (q === n) { parts.push({ start: i, end: seq.length - 1 }); break }
    const target = (total * q) / n
    let j = i
    let c = cum
    for (; j < seq.length; j++) {
      c += w[seq[j]]
      if (c >= target - EPS) break
    }
    if (j >= seq.length) j = seq.length - 1
    else if (j > i) {
      const prev = c - w[seq[j]]
      if (target - prev < c - target - EPS) j--
    }
    // اترك آية واحدة على الأقل لكل جزء باقٍ إن أمكن
    const remainingParts = n - q
    if (seq.length - 1 - j < remainingParts) j = Math.max(i, seq.length - 1 - remainingParts)
    parts.push({ start: i, end: j })
    for (let k = i; k <= j; k++) cum += w[seq[k]]
    i = j + 1
  }
  return parts
}
