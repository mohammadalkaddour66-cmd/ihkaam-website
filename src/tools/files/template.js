/* ══════════════════════════════════════════════════════════════════
   صيغة الشهادة بالمتغيرات: يكتب المدير جملة المتن بصياغته، ويدرج فيها متغيرات بين قوسين
   مربعين مثل [الإنجاز] و[التقدير] و[الدرجة]. المتغيرات هي أعمدة ملفه: كل ترويسة (غير
   الاسم والجنس) متغير باسمها، ويضيف المدير ما شاء من الأعمدة بأي اسم. اسم الطالب لا
   متغير له: هو سطر بارز مستقل في الشهادة.

   المتغير الفارغ عند طالب لا يترك جملة ناقصة: يسقط ومعه الكلمات الملاصقة له قبله (حتى
   المتغير السابق أو أقرب فاصلة)، فـ«وبدرجة [الدرجة]» تختفي كلها عند من لا درجة له. وكذلك
   متغير لا عمود له في الملف أصلاً.

   وللطالبات صيغة يكتبها المدير بنفسه (تُعتمد قبل التوليد). تساعده الأداة بكلمات مقترحة
   تؤنَّث بنقرة واحدة، دون أن تعيد كتابة النص عنه.
   ══════════════════════════════════════════════════════════════════ */

/* المتغيرات المبدئية: ما يظهر قبل أن يرفع المدير ملفاً */
export const DEFAULT_VARS = ['الإنجاز', 'التقدير', 'الدرجة']

/* مفتاح المقارنة بين الأسماء: بلا تشكيل ولا تطويل، وهمزات الألف والتاء المربوطة والياء موحّدة،
   فيصح «الانجاز» و«الدرجه» كما يصح «الإنجاز» و«الدرجة» */
export function normVar(s) {
  return String(s || '')
    .replace(/ـ|[ً-ْ]|ٰ/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
}

/* ترويسة عمود ← اسم متغير نظيف: بلا «(اختياري)» ولا أقواس مربعة، حتى 24 حرفاً */
export function cleanVarName(h) {
  return String(h || '')
    .replace(/[[\]]/g, '')
    .replace(/[(（][^)）]*[)）]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24)
}

/* قيم طالب (بأسماء ترويستها) ← قيم بمفاتيح موحّدة للملء */
export function valsOf(vars) {
  const out = {}
  for (const [k, v] of Object.entries(vars || {})) {
    const t = String(v ?? '').trim()
    if (t) out[normVar(k)] = t
  }
  return out
}

/* قوائم أسماء بلا تكرار (بالمفتاح الموحّد) وبلا فارغ */
export function uniqueVars(list) {
  const seen = new Set()
  const out = []
  for (const n of list) {
    const c = cleanVarName(n)
    const k = normVar(c)
    if (!c || seen.has(k)) continue
    seen.add(k)
    out.push(c)
  }
  return out
}

/* الصيغتان الجاهزتان: تعملان فوراً دون أن يلمس المدير شيئاً */
export const DEFAULT_TPL = {
  m: 'هذه الشهادة تقديراً لإنجازه: [الإنجاز] بتقدير [التقدير] وبدرجة [الدرجة]',
  f: 'هذه الشهادة تقديراً لإنجازها: [الإنجاز] بتقدير [التقدير] وبدرجة [الدرجة]',
}

let uid = 0
export function newTemplate(name, from) {
  uid += 1
  return {
    id: `t${Date.now().toString(36)}${uid}`,
    name,
    title: from?.title ?? '', /* فارغ = العنوان العام */
    m: from?.m ?? DEFAULT_TPL.m,
    f: from?.f ?? DEFAULT_TPL.f,
    /* صيغة الطالبات: fTouched = كتبها المدير بنفسه (قبلها تتبع نص الطلاب نسخةً)، وfOk = اعتمدها */
    fTouched: from?.fTouched ?? false,
    fOk: from ? from.fOk : true,
  }
}

/* إدراج متغير عند المؤشر (أو مكان التحديد). يرجع النص الجديد وموضع المؤشر بعد القطعة. */
export function insertToken(text, start, end, label) {
  const t = String(text || '')
  const s = Math.max(0, Math.min(start ?? t.length, t.length))
  const e = Math.max(s, Math.min(end ?? s, t.length))
  const tok = `[${label}]`
  /* مسافة قبل القطعة وبعدها إن لاصقت حرفاً، فلا تلتصق بكلمة */
  const pre = s > 0 && !/\s/.test(t[s - 1]) ? ' ' : ''
  const post = e < t.length && !/[\s.،,؛:]/.test(t[e]) ? ' ' : ''
  const ins = pre + tok + post
  return { text: t.slice(0, s) + ins + t.slice(e), caret: s + pre.length + tok.length + post.length }
}

const REF_RE = /\[([^\]\n]{1,30})\]/g
const SPLIT_RE = /(\[[^\]\n]{1,30}\])/

/* ما تشير إليه الصيغة: المفاتيح الموحّدة المستعملة، وما لا عمود له في الملف (بأسمائها كما كُتبت) */
export function inspectTemplate(tpl, names = []) {
  const known = new Set(names.map(normVar))
  const used = new Set()
  const missing = []
  for (const m of String(tpl || '').matchAll(REF_RE)) {
    const k = normVar(m[1])
    used.add(k)
    if (!known.has(k) && !missing.includes(m[1])) missing.push(m[1])
  }
  return { used, missing }
}

const PUNCT = /[،,.؛:!؟?\n]/

/* ملء الصيغة لطالب. vals: { المفتاح_الموحّد: نص } من valsOf. */
export function fillTemplate(tpl, vals) {
  const parts = String(tpl || '').split(SPLIT_RE)
  /* parts: نص، متغير، نص، متغير، …، نص */
  const texts = []
  const keys = []
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) texts.push(parts[i])
    else keys.push(normVar(parts[i].slice(1, -1)))
  }
  const out = []
  let prevRemoved = false
  for (let i = 0; i < keys.length; i++) {
    let before = texts[i]
    const val = String(vals?.[keys[i]] ?? '').trim()
    if (val) {
      /* بعد متغير سقط: حرف العطف في أول هذه العبارة لا معنى له («وبدرجة» ← «بدرجة») */
      if (prevRemoved) before = before.replace(/^(\s*)و(?=ب)/, '$1').replace(/^(\s*)و\s+/, '$1')
      out.push(before, val)
      prevRemoved = false
    } else {
      /* تسقط الكلمات الملاصقة للمتغير قبله: ما بعد آخر فاصلة في النص السابق له */
      let cut = 0
      for (let j = before.length - 1; j >= 0; j--) if (PUNCT.test(before[j])) { cut = j + 1; break }
      out.push(before.slice(0, cut))
      prevRemoved = true
    }
  }
  out.push(texts[texts.length - 1])
  return out.join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+([،,.؛:!؟?])/g, '$1')
    .replace(/([،,؛:])\s*(?=[.،,؛:!؟?])/g, '')
    .trim()
}

/* خاتمة الجملة: تُزال علامات الختام التي كتبها المدير وتوضع نقطة، أو فاصلة إن كان التاريخ بعدها في المتن */
export function finishBody(text, terminal = '.') {
  const t = String(text || '').replace(/[\s.،,؛:]+$/u, '').trim()
  return t ? t + terminal : ''
}

/* ── تأنيث الكلمات: اقتراحات بنقرة، والمدير هو من يقرّر كل كلمة ── */

/* كلمات تنتهي بهاء لكنها ليست ضميراً */
const NOT_PRONOUN = new Set(['الله', 'هذه', 'الفقه', 'وجه', 'الوجه', 'التوجيه', 'التنبيه', 'التشبيه', 'التنزيه', 'الشبه', 'شبه', 'الفقيه', 'النزيه', 'السفيه', 'الوجيه', 'تنبيه', 'توجيه', 'الجاه', 'جاه', 'الكره'])

const FEM_WORDS = {
  له: 'لها', عليه: 'عليها', إليه: 'إليها', منه: 'منها', فيه: 'فيها', به: 'بها', عنه: 'عنها', معه: 'معها',
  هو: 'هي', الطالب: 'الطالبة', طالب: 'طالبة', ابنه: 'ابنتها',
  المتفوق: 'المتفوقة', المتميز: 'المتميزة', المجتهد: 'المجتهدة', المتقن: 'المتقنة', الحافظ: 'الحافظة',
  المثابر: 'المثابرة', النجيب: 'النجيبة', الملتزم: 'الملتزمة', المواظب: 'المواظبة', المبدع: 'المبدعة',
  الفائز: 'الفائزة', المتألق: 'المتألقة', المميز: 'المميزة', الأول: 'الأولى', الناجح: 'الناجحة',
}

const WORD_RE = /(?:[ء-ي]|[ً-ْ]|ٰ)+/g

/* كلمات الصيغة التي قد تحتاج تأنيثاً: [{ from, to }] بلا تكرار. لا تُفحص المتغيرات بين الأقواس. */
export function femaleSuggestions(text, max = 10) {
  const seen = new Map()
  for (const piece of String(text || '').split(SPLIT_RE)) {
    if (piece.startsWith('[')) continue
    for (const m of piece.matchAll(WORD_RE)) {
      const w = m[0]
      if (seen.has(w)) continue
      const to = suggestFemale(w)
      if (to) seen.set(w, to)
    }
  }
  return [...seen].slice(0, max).map(([from, to]) => ({ from, to }))
}

function suggestFemale(w) {
  const m = /^(و|ف)?(.*)$/.exec(w)
  const lead = m[1] || ''
  const base = m[2]
  if (FEM_WORDS[base]) return lead + FEM_WORDS[base]
  if (FEM_WORDS[w]) return FEM_WORDS[w]
  if (NOT_PRONOUN.has(w) || NOT_PRONOUN.has(base)) return ''
  /* ضمير الغائب المتصل: «لإتمامه» ← «لإتمامها» */
  if (w.length >= 4 && w.endsWith('اه')) return w + 'ا'
  if (w.length >= 4 && w.endsWith('ه')) return w.slice(0, -1) + 'ها'
  return ''
}

/* استبدال كلمة كاملة (لا جزء من كلمة أخرى) خارج المتغيرات. */
export function replaceWord(text, from, to) {
  return String(text || '').split(SPLIT_RE).map((piece) => {
    if (piece.startsWith('[')) return piece
    return piece.replace(WORD_RE, (w) => (w === from ? to : w))
  }).join('')
}
