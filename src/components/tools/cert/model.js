/* ══════════════════════════════════════════════════════════════════
   نموذج مساحة عمل الشهادات: الطالب، وخيارات شهادته، وحفظ إعدادات المعهد في المتصفح.
   لا واجهة هنا، فالمنطق كله قابل للاختبار بمعزل عن React.
   ══════════════════════════════════════════════════════════════════ */
import { valsOf, normVar, fillTemplate, finishBody, inspectTemplate, DEFAULT_TPL } from '../../../tools/files/template.js'
import { reasonPlain } from '../../../tools/files/reason.js'

export const ACH = 'الإنجاز'

/* جملة «شهادة واحدة» الجاهزة: نص حر يعدّله المدير كما يشاء (بلا حقول) */
export const SINGLE_DEFAULT = {
  m: 'هذه الشهادة تقديراً لحفظه جزء عمّ كاملاً',
  f: 'هذه الشهادة تقديراً لحفظها جزء عمّ كاملاً',
}
const ACH_KEY = normVar(ACH)

/* مثال يظهر في المعاينة قبل أن يكتب المدير شيئاً، فيرى الشهادة من أول لحظة */
export const SAMPLE_NAME = 'عبد الله محمد أحمد'
export const SAMPLE_VARS = { الإنجاز: 'حفظ جزء عمّ كاملاً', التقدير: 'امتياز', الدرجة: '98%' }

let sid = 0
export const newStudentId = () => `s${Date.now().toString(36)}${++sid}`
export const blankStudent = (tpl, gender = 'm') => ({ id: newStudentId(), name: '', gender, vars: {}, tpl })

export const isBlank = (s) => !s.name.trim() && !Object.values(s.vars || {}).some((v) => String(v).trim())

/* صيغة الطالب: المرتبطة به، فإن حُذفت فالأولى */
export const tplOf = (templates, s) => templates.find((t) => t.id === s.tpl) || templates[0]

/* خيارات شهادة طالب: المتن يُملأ من صيغته (للطلاب أو للطالبات بحسب جنسه) بقيم صفّه،
   وعنوان الشهادة من صيغته. base = إعدادات المعهد والتصميم المشتركة. */
export function studentOpts(base, s, templates) {
  const tp = tplOf(templates, s)
  const gender = s.gender === 'f' ? 'f' : 'm'
  const vals = valsOf(s.vars)
  const own = vals[ACH_KEY] ? reasonPlain(vals[ACH_KEY]) : ''
  if (own) vals[ACH_KEY] = own
  const terminal = base.datePos === 'inline' && base.date ? '،' : '.'
  const tpl = gender === 'f' ? tp.f : tp.m
  let body = finishBody(fillTemplate(tpl, vals), terminal)
  /* صيغة مخصصة بحقول ولم يبقَ منها شيء لهذا الطالب (كل خاناته فارغة): الجملة الجاهزة، فلا تخرج شهادة بلا متن */
  if (!body.trim() && inspectTemplate(tpl).used.size > 0) body = finishBody(DEFAULT_TPL[gender], terminal)
  return {
    ...base,
    name: s.name,
    gender,
    achievement: { type: 'custom', text: own },
    title: tp.title || 'شهادة تقدير',
    grade: '',
    text: { ...base.text, body, intro: gender === 'f' ? tp.fi : tp.mi, dua: gender === 'f' ? tp.fd : tp.md },
  }
}

/* هل ستُستعمل الجملة الجاهزة لهذا الطالب بدل صيغة المدير؟ (للتنبيه في خطوة التحميل) */
export function usesDefaultBody(s, templates) {
  const tp = tplOf(templates, s)
  const tpl = s.gender === 'f' ? tp.f : tp.m
  if (!inspectTemplate(tpl).used.size) return false
  return !finishBody(fillTemplate(tpl, valsOf(s.vars)), '.').trim()
}

/* ── إعدادات المعهد: تُحفظ في المتصفح فلا تُكتب في كل مرة ── */
const KEY = 'ihkaam-cert-studio-v1'
const LOGO_MAX = 350000 // حرفاً من dataURL: ما فوقه لا يُحفظ حتى لا يمتلئ التخزين

export function loadSettings() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {} } catch { return {} }
}
export function saveSettings(obj, logoSrc) {
  try {
    const out = { ...obj }
    if (logoSrc && logoSrc.length <= LOGO_MAX) out.logo = logoSrc
    localStorage.setItem(KEY, JSON.stringify(out))
  } catch { /* تخزين ممتلئ أو ممنوع: لا شيء */ }
}
