/* ══════════════════════════════════════════════════════════════════
   قائمة الطلاب للتوليد الجماعي: من ملف Excel/CSV أو من نص ملصوق (يُنسخ من
   Excel فيصل مفصولاً بالتبويب). الأعمدة: اسم الطالب، ثم الإنجاز (اختياري)،
   ثم الجنس (اختياري: طالب أو طالبة).
   ══════════════════════════════════════════════════════════════════ */
import { readXlsx, makeXlsx } from './xlsx.js'

export const MAX_STUDENTS = 200

export const SAMPLE_ROWS = [
  ['اسم الطالب', 'الإنجاز (اختياري)', 'طالب أم طالبة (اختياري)'],
  ['عبد الله محمد أحمد', 'حفظ جزء عمّ كاملاً', 'طالب'],
  ['مريم خالد يوسف', 'حفظ سورة الملك كاملة', 'طالبة'],
  ['يوسف إبراهيم حسن', '', 'طالب'],
  ['فاطمة عمر علي', 'التميّز في التسميع خلال الفصل الأول', 'طالبة'],
]

export function sampleXlsx() {
  return makeXlsx(SAMPLE_ROWS, { widths: [30, 42, 26] })
}

const HEADER = /^(اسم|الاسم|name)/i
const FEMALE = /^(طالبة|انثى|أنثى|بنت|f|female)$/i
const MALE = /^(طالب|ذكر|ولد|m|male)$/i

export function normalizeGender(v) {
  const t = String(v || '').trim()
  if (FEMALE.test(t)) return 'f'
  if (MALE.test(t)) return 'm'
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

/* صفوف خام ← طلاب. يُتجاوز صف الترويسة، وتُجمع الأسطر الفارغة. */
export function rowsToStudents(matrix) {
  const rows = matrix.filter((r) => r.some((c) => String(c || '').trim()))
  if (rows.length && HEADER.test(String(rows[0][0] || '').trim())) rows.shift()
  const seen = rows.map((r) => ({
    name: String(r[0] || '').trim(),
    ach: String(r[1] || '').trim(),
    gender: normalizeGender(r[2]),
  })).filter((s) => s.name)
  return seen
}

export function parseStudentsText(text) {
  return rowsToStudents(parseDelimited(text))
}

/* ملف مرفوع (File) ← طلاب. xlsx يُقرأ مباشرة؛ csv وtxt نصّاً. */
export async function parseStudentsFile(file) {
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.xls')) throw new Error('صيغة xls القديمة غير مدعومة. افتح الملف في Excel واحفظه بصيغة xlsx أو csv.')
  if (name.endsWith('.xlsx')) return rowsToStudents(await readXlsx(await file.arrayBuffer()))
  const buf = new Uint8Array(await file.arrayBuffer())
  /* Excel العربي القديم يحفظ CSV بترميز windows-1256 أحياناً */
  let text = new TextDecoder('utf-8').decode(buf)
  if (text.includes('�')) {
    try { text = new TextDecoder('windows-1256').decode(buf) } catch { /* يبقى كما هو */ }
  }
  return parseStudentsText(text)
}
