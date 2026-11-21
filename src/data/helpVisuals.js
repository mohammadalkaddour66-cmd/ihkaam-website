/* ══════════════════════════════════════════════════════════════════
   صور مركز المساعدة (2026-11-20)

   كل تصنيف وكل شرح يُربط بلقطةٍ حقيقية من نسخة العرض (public/app-shots)
   حين تكون الشاشة التي يشرحها مصوَّرة. لا مشاهد مولّدة في مركز المساعدة (2026-11-20 ب):
   المالية ونجم الأسبوع صُوّرت من وضع العرض «معهد النموذج».
   الشرح الذي لا لقطة لشاشته يبقى بلا صورة: لا نضع لقطة شاشةٍ أخرى مكانها.
   التعليق تحت اللقطة يُؤخذ حرفياً من appShots.js (قاعدة لقطات العرض).
   ══════════════════════════════════════════════════════════════════ */
import { DESKTOP_SHOTS, HELP_SHOTS, MOBILE_SHOTS, desktopSrc, mobileSrc } from './appShots'

export const desk  = (id) => { const s = [...DESKTOP_SHOTS, ...HELP_SHOTS].find(x => x.id === id); return { kind: 'desktop', id, src: desktopSrc(id), srcSm: desktopSrc(id, true), title: s.title, caption: s.caption } }
export const phone = (id) => { const s = [...MOBILE_SHOTS, ...HELP_SHOTS].find(x => x.id === id);  return { kind: 'phone', id, src: mobileSrc(id), srcSm: mobileSrc(id), title: s.title, caption: s.caption } }
export const scene = (src) => ({ kind: 'scene', src, srcSm: src })

export const CAT_VISUAL = {
  'getting-started': desk('dashboard'),
  students         : desk('students'),
  daily            : desk('attendance'),
  exams            : desk('exams'),
  finance          : desk('finance'),
  reports          : desk('reports'),
  insights         : desk('insights'),
  parents          : phone('parent'),
  staff            : desk('staff-register'),
}

/* اللقطة الرئيسية لكل شرح، ولقطة جوال مرافقة حين توجد للشاشة نفسها */
export const ARTICLE_VISUAL = {
  'attendance-staff'    : { main: desk('attendance-staff') },
  login                 : { main: phone('login') },
  'staff-management'    : { main: desk('staff-register') },
  'dashboard-overview'  : { main: desk('dashboard'),  side: phone('dashboard') },
  'install-home-screen' : { main: phone('dashboard') },
  'moving-student-data' : { main: desk('register') },
  'student-registration': { main: desk('register') },
  'groups-management'   : { main: desk('circles'),    side: phone('circles') },
  'student-transfer'    : { main: desk('circles') },
  'attendance-batch'    : { main: desk('attendance'), side: phone('attendance') },
  'daily-recitation'    : { main: desk('recite'),     side: phone('recite') },
  tests                 : { main: desk('exams') },
  'exam-queue'          : { main: desk('exams'),      side: phone('exams') },
  'monthly-eval'        : { main: desk('behavior'),   side: phone('behavior') },
  'finance-tuitions'    : { main: desk('finance-tuitions') },
  'finance-ledger'      : { main: desk('finance-ledger') },
  'reports-overview'    : { main: desk('reports'),    side: phone('reports') },
  archiving             : { main: desk('archive'),    side: phone('archive') },
  'parent-portal'       : { main: phone('parent') },
  'star-of-week'        : { main: desk('star-of-week') },
  'smart-insights'      : { main: desk('insights') },
  'insights-metrics'    : { main: desk('insights') },
}

/* صورة صفحة كل ميزة (/ihkaam/features و/addons): لقطةٌ حقيقية، ولقطة جوال مرافقة،
   أو مشهدٌ مولَّد للوحدات التي لا شاشة لها في نسخة العرض. */
export const FEATURE_VISUAL = {
  admin   : { main: desk('dashboard'),  side: phone('dashboard') },
  academic: { main: desk('circles'),    side: phone('circles') },
  daily   : { main: desk('recite'),     side: phone('recite') },
  parents : { main: phone('parent') },
  reports : { main: desk('reports'),    side: phone('reports') },
  insights: { main: desk('insights') },
  exams   : { main: desk('exams'),      side: phone('exams') },
  finance : { main: desk('finance') },
  subjects: { main: scene('/scenes/addon-subjects.webp') },
  star    : { main: desk('star-of-week') },
  library : { main: scene('/scenes/feat-library.webp') },
  messages: { main: scene('/scenes/feat-messages.webp') },
}
