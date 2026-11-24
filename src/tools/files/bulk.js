/* ══════════════════════════════════════════════════════════════════
   قائمة الطلاب للتوليد الجماعي: من ملف Excel/CSV أو من نص ملصوق (يُنسخ من
   Excel فيصل مفصولاً بالتبويب). كل صف طالب، وعمود «الاسم» وحده إلزامي. وكل عمود
   آخر متغير باسم ترويسته (الإنجاز، التقدير، الدرجة، أو أي اسم يضيفه المدير)
   يدرجه في صيغة الشهادة بين قوسين مربعين. جنس الطالب من اسم الورقة (الطلاب أو
   الطالبات)، أو من عمود «طالب أم طالبة» في الملفات القديمة.
   ══════════════════════════════════════════════════════════════════ */
import { readXlsxSheets, makeWorkbook } from './xlsx.js'
import { cleanVarName, uniqueVars, normVar } from './template.js'

/* أسماء الأعمدة المعروفة: تُوحَّد إملاءاتها، وهي ترتيب لصق بلا ترويسة */
const KNOWN_VARS = ['الإنجاز', 'التقدير', 'الدرجة']

export const MAX_STUDENTS = 200

export const FIELD_MAX = { name: 48, value: 90 }

/* الملف النموذجي: ورقتان (الطلاب والطالبات) بأعمدة الاسم والإنجاز والتقدير والدرجة.
   الأخضر أساسي، والرمادي اختياري، ويضيف المدير بعد ذلك أي عمود يشاء فيصير متغيراً. */
export const SAMPLE_HEADER = ['الاسم', 'الإنجاز', 'التقدير', 'الدرجة']
export const SAMPLE_MALE = [
  ['عبد الله محمد أحمد', 'حفظ جزء عمّ كاملاً', 'امتياز', '98%'],
  ['يوسف إبراهيم حسن', 'التميّز في التسميع خلال الفصل الأول', 'جيد جداً', '91%'],
  ['عمر خالد سعيد', 'ختم القرآن الكريم حفظاً', 'امتياز', ''],
]
export const SAMPLE_FEMALE = [
  ['مريم خالد يوسف', 'حفظ سورة الملك كاملة', 'امتياز', '97%'],
  ['فاطمة عمر علي', 'المواظبة على الحلقة طوال العام', '', ''],
]

export function sampleXlsx() {
  const common = {
    widths: [30, 40, 18, 14],
    colStyles: ['basic', 'basic', 'optional', 'optional'],
    padRows: 30,
    dropdowns: [{ col: 2, list: ['امتياز', 'جيد جداً', 'جيد', 'مقبول'] }],
  }
  return makeWorkbook([
    { name: 'الطلاب', rows: [SAMPLE_HEADER, ...SAMPLE_MALE], ...common },
    { name: 'الطالبات', rows: [SAMPLE_HEADER, ...SAMPLE_FEMALE], ...common },
  ])
}

/* «اسم» أو «الاسم» أو «اسم الطالب»، لا «أسماء» (اسم شخص قد يُكتب بلا همزة) */
const NAME_HEAD = /^(اسم|الاسم|name)(?![ء-يa-z])/i
const GENDER_HEAD = /(طالب\s*أم|طالب\s*ام|جنس|gender)/i
const FEMALE = /^(طالبة|انثى|أنثى|بنت|f|female)$/i
const MALE = /^(طالب|ذكر|ولد|m|male)$/i

export function normalizeGender(v) {
  const t = String(v || '').trim()
  if (FEMALE.test(t)) return 'f'
  if (MALE.test(t)) return 'm'
  return ''
}

/* اسم الورقة ← الجنس: «الطالبات» أنثى، و«الطلاب» ذكر، وغيرها لا يُعرف */
export function sheetGender(name) {
  const t = String(name || '')
  if (/(طالبات|بنات|إناث|اناث|female|girls)/i.test(t)) return 'f'
  if (/(طلاب|طالب|بنين|ذكور|male|boys)/i.test(t)) return 'm'
  return ''
}

/* نص ← مصفوفة صفوف. الفاصل: تبويب إن وُجد، وإلا فاصلة أو فاصلة منقوطة أو «،» */
export function parseDelimited(text) {
  const raw = String(text)
  const lines = (raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw).split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return []
  const sample = lines.slice(0, 5).join('\n')
  const delim = sample.includes('\t') ? '\t' : /[;؛]/.test(sample) ? /[;؛]/ : /[,،]/.test(sample) ? /[,،]/ : null
  return lines.map((l) => (delim ? splitCsvLine(l, delim) : [l]).map((c) => c.trim()))
}

/* يحترم النص بين علامتي اقتباس مزدوجتين (CSV من Excel) */
function splitCsvLine(line, delim) {
  if (delim === '\t' || !line.includes('"')) return line.split(delim)
  const out = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ } else if (ch === '"') q = false
      else cur += ch
    } else if (ch === '"') q = true
    else if (delim.test(ch)) { out.push(cur); cur = '' } else cur += ch
  }
  out.push(cur)
  return out
}

/* صفوف خام ← { students: [{ name, gender, vars }], vars: [أسماء المتغيرات] }.
   بترويسة (صف فيه عمود «اسم…»): كل عمود غير الاسم والجنس متغير باسم ترويسته، فلا يضرّ تغيير
   الترتيب أو حذف عمود. بلا ترويسة: الاسم ثم الإنجاز والتقدير والدرجة بهذا الترتيب، وإن بدت
   خلية كلمة «طالب» أو «طالبة» فهي الجنس. الأسطر الفارغة تُجمع. */
export function rowsToStudents(matrix, defaultGender = '') {
  const rows = matrix.filter((r) => r.some((c) => String(c || '').trim()))
  let nameCol = 0
  let genderCol = -1
  let cols = KNOWN_VARS.map((v, i) => ({ i: i + 1, name: v })) // الأعمدة المتغيرة
  let headless = true
  if (rows.length && rows[0].some((c) => NAME_HEAD.test(String(c || '').trim()))) {
    headless = false
    const head = rows.shift()
    nameCol = head.findIndex((c) => NAME_HEAD.test(String(c || '').trim()))
    genderCol = head.findIndex((c, i) => i !== nameCol && GENDER_HEAD.test(String(c || '').trim()))
    cols = []
    const taken = new Set()
    head.forEach((c, i) => {
      if (i === nameCol || i === genderCol) return
      const clean = cleanVarName(c)
      const k = normVar(clean)
      if (!clean || taken.has(k)) return
      /* «الانجاز» و«الدرجه» تُوحَّدان مع «الإنجاز» و«الدرجة»، فلا يتكرر المتغير بإملاءين */
      const bare = (x) => normVar(x).replace(/^ال(?=.)/, '')
      const name = KNOWN_VARS.find((d) => bare(d) === bare(clean)) || clean
      taken.add(k)
      cols.push({ i, name })
    })
  }
  const students = []
  for (const r of rows) {
    const name = String(r[nameCol] ?? '').trim().slice(0, FIELD_MAX.name)
    if (!name) continue
    let gender = genderCol >= 0 ? normalizeGender(r[genderCol]) : ''
    const vars = {}
    for (const c of cols) {
      const v = String(r[c.i] ?? '').trim()
      if (headless && !gender && normalizeGender(v)) { gender = normalizeGender(v); continue }
      if (v) vars[c.name] = v.slice(0, FIELD_MAX.value)
    }
    students.push({ name, gender: gender || defaultGender, vars })
  }
  return { students, vars: cols.map((c) => c.name) }
}

export function parseStudentsText(text, defaultGender = '') {
  return rowsToStudents(parseDelimited(text), defaultGender)
}

/* مصنف Excel ← طلاب. إن سُمّيت ورقة «الطلاب» أو «الطالبات» قُرئت بجنسها، وتُهمل غيرها (ملاحظات
   مثلاً). وإن لم تُسمَّ ورقة بذلك قُرئت الأولى وحدها، وجنسها الافتراضي defaultGender. */
export async function parseWorkbook(buf, defaultGender = '') {
  const sheets = await readXlsxSheets(buf)
  const named = sheets.filter((s) => sheetGender(s.name))
  const picked = named.length ? named : [sheets[0]]
  const students = []
  let vars = []
  for (const sh of picked) {
    const res = rowsToStudents(sh.rows, sheetGender(sh.name) || defaultGender)
    students.push(...res.students)
    vars = uniqueVars([...vars, ...res.vars])
  }
  return { students, vars }
}

/* ملف مرفوع (File) ← طلاب. xlsx يُقرأ مباشرة؛ csv وtxt نصّاً. */
export async function parseStudentsFile(file, defaultGender = '') {
  const buf = new Uint8Array(await file.arrayBuffer())
  /* يُحكم على الملف بمحتواه لا باسمه: الجوال والتنزيلات قد تغيّر الامتداد أو تُسقطه.
     «PK» = ZIP (xlsx)، وD0 CF 11 E0 = Excel القديم (xls)، وغير ذلك نصّ (csv). */
  const isZip = buf[0] === 0x50 && buf[1] === 0x4b
  const isOldXls = buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0
  if (isOldXls) throw new Error('هذا ملف Excel بصيغة xls القديمة وهي غير مدعومة. افتحه في Excel واحفظه باسم جديد بصيغة xlsx (مصنف Excel) أو csv، ثم ارفعه.')
  if (isZip) {
    try {
      return await parseWorkbook(buf, defaultGender)
    } catch (e) {
      /* رسائلنا العربية تُعرض كما هي؛ أما خطأ المتصفح الخام (فكّ الضغط وغيره) فيُستبدل برسالة مفهومة */
      if (/[؀-ۿ]/.test(e?.message || '')) throw e
      throw new Error('تعذّرت قراءة ملف Excel. افتحه في Excel واحفظه بصيغة CSV (القيم مفصولة بفاصلة) ثم ارفع ملف CSV، أو انسخ الأسماء والصقها في الصندوق.', { cause: e })
    }
  }
  /* Excel العربي القديم يحفظ CSV بترميز windows-1256 أحياناً */
  let text = new TextDecoder('utf-8').decode(buf)
  if (text.includes('�')) {
    try { text = new TextDecoder('windows-1256').decode(buf) } catch { /* يبقى كما هو */ }
  }
  return parseStudentsText(text, defaultGender)
}
