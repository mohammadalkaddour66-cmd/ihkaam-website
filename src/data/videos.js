/* ══════════════════════════════════════════════════════════════════
   فيديوهات قناة إحكام على يوتيوب (youtube.com/@ihkaam_app)

   مصدر واحد لما يلي، فلا تتباعد الصفحة عن بياناتها المنظَّمة:
   - الصفحات (/ihkaam وصفحات الميزات ومقالات المساعدة) تقرأ منه ما تعرضه.
   - entry-server.jsx يكتب منه VideoObject لكل فيديو ظاهر في الصفحة.
   - audit-seo.mjs يتحقق أن كل فيديو ظاهر له VideoObject، والعكس.

   الحقل:
     id        معرّف الفيديو على يوتيوب.
     name      الاسم الذي نعرضه ونكتبه في VideoObject. عناوين يوتيوب الأصلية
               أطول أو مبهمة (مثل «٢٦ سبتمبر ٢٠٢٦»)، فالاسم هنا هو ما يراه الزائر.
     desc      جملة واحدة تصف ما في الفيديو فعلاً. لا نصف ما لم نره فيه.
     seconds   المدة بالثواني (من صفحة الفيديو).
     uploaded  تاريخ الرفع بصيغة ISO كما ورد من يوتيوب.
     poster    الغلاف /video/<المفتاح>.webp، يُولَّد بـ scripts/make-video-posters.mjs
               (لقطات يوتيوب التلقائية تظهر فيها لوحة مفاتيح الهاتف ووجهٌ صغير،
               فنرسم لكل فيديو غلافاً بهوية الموقع بدلاً منها).

   الفيديو لا يُحمَّل من يوتيوب إلا عند النقر عليه (LiteYouTube)، فلا أثر
   له على LCP ولا على حجم الصفحة.

   الحلقة 8 من سلسلة «شرح إحكام» غير منشورة على القناة بعد، فلا مكان لها هنا.
   ══════════════════════════════════════════════════════════════════ */

export const CHANNEL_URL = 'https://www.youtube.com/@ihkaam_app'

const SERIES = 'من سلسلة «شرح إحكام»'

export const VIDEOS = {
  intro: {
    id: 'BTLfBENlISs',
    name: 'لديك معهد قرآني وأعداد طلابك في ازدياد؟',
    desc: 'عرض مصوّر قصير يقدّم إحكام لمعهد يزداد عدد طلابه، ويتابع فيه أولياء الأمور إنجازات أبنائهم.',
    seconds: 81, uploaded: '2026-09-26T23:02:14-07:00',
  },
  retention: {
    id: 'LI-V3TwhmcY',
    name: 'هل يمكن تدارك طالب القرآن قبل أن يتراجع وينقطع؟',
    desc: 'كيف تقارن الإدارة مسار كل طالب بتاريخه، فتلحظ التغيّر في وتيرة التسميع والمراجعة مبكراً.',
    seconds: 148, uploaded: '2026-09-28T03:54:34-07:00',
  },
  mobile: {
    id: 'CuDmHLBjYfI',
    name: 'شرح لوحة التحكم على الهاتف',
    desc: 'جولة في لوحة تحكم إحكام كما تظهر على شاشة الهاتف.',
    seconds: 409, uploaded: '2026-10-11T23:54:29-07:00',
  },
  ep1: {
    id: 'UOiCKDoHWFE',
    name: 'الحلقة 1: لوحة التحكم لمديري المعاهد ومشرفيها',
    desc: `${SERIES}: لوحة التحكم ومؤشرات المعهد التي يراها المدير والمشرف.`,
    seconds: 528, uploaded: '2026-09-08T06:24:11-07:00',
  },
  ep2: {
    id: 'AwBsTYjBnuY',
    name: 'الحلقة 2: إدخال بيانات الطلاب والكادر',
    desc: `${SERIES}: إضافة الطلاب والمعلمين والإداريين إلى النظام.`,
    seconds: 392, uploaded: '2026-09-08T06:28:48-07:00',
  },
  ep3: {
    id: '6OUbL6jFraA',
    name: 'الحلقة 3: إنشاء الحلقات وتوزيع الطلاب والمعلمين',
    desc: `${SERIES}: إنشاء الحلقات وتوزيع الطلاب والمعلمين عليها.`,
    seconds: 417, uploaded: '2026-09-08T06:31:28-07:00',
  },
  ep4: {
    id: 'y61D3S-tsW0',
    name: 'الحلقة 4: التسميع اليومي، القسم الأول',
    desc: `${SERIES}: تسجيل التسميع للقرآن والقراءة التمهيدية والحديث، الجزء الأول.`,
    seconds: 608, uploaded: '2026-09-08T06:33:15-07:00',
  },
  ep5: {
    id: '1FYT_faMQOU',
    name: 'الحلقة 5: التسميع اليومي، القسم الثاني',
    desc: `${SERIES}: تسجيل التسميع للقرآن والقراءة التمهيدية والحديث، الجزء الثاني.`,
    seconds: 452, uploaded: '2026-09-08T06:34:13-07:00',
  },
  ep6: {
    id: 'E7lgF8Ja7EQ',
    name: 'الحلقة 6: تفقّد الحضور والغياب والتأخر',
    desc: `${SERIES}: تسجيل الحضور والغياب والتأخر للطلاب.`,
    seconds: 324, uploaded: '2026-09-08T06:37:14-07:00',
  },
  ep7: {
    id: 'PvXOyM51PVk',
    name: 'الحلقة 7: بوابة الاختبارات',
    desc: `${SERIES}: بوابة الاختبارات لمختبري الحلقات ومشرفيها.`,
    seconds: 271, uploaded: '2026-09-08T06:38:05-07:00',
  },
  ep9: {
    id: 'bzxrinzi5NY',
    name: 'الحلقة 9: بوابة التحليل الذكي',
    desc: `${SERIES}: بوابة التحليل الذكي لإدارة الحلقات ومشرفيها ومعلميها.`,
    seconds: 356, uploaded: '2026-09-08T06:41:45-07:00',
  },
  ep10: {
    id: 'HKYS9PXYOyM',
    name: 'الحلقة 10: بوابة نجم الحلقة',
    desc: `${SERIES}: بوابة نجم الحلقة لإدارة الحلقات ومشرفيها ومعلميها.`,
    seconds: 451, uploaded: '2026-09-08T06:42:30-07:00',
  },
  ep11: {
    id: 'ipJ_9aXEWqE',
    name: 'الحلقة 11: بوابة أولياء الأمور',
    desc: `${SERIES}: ما يراه ولي الأمر في بوابته وكيف يتابع ابنه.`,
    seconds: 914, uploaded: '2026-09-08T06:43:48-07:00',
  },
  ep12: {
    id: 'cQoG0kMaI4k',
    name: 'الحلقة 12: إدارة المواد الشرعية والرديفة',
    desc: `${SERIES}: إدارة المواد الشرعية والرديفة في المعهد.`,
    seconds: 455, uploaded: '2026-09-08T06:44:45-07:00',
  },
}

for (const [key, v] of Object.entries(VIDEOS)) {
  v.key = key
  v.poster = `/video/${key}.webp`
  v.watchUrl = `https://www.youtube.com/watch?v=${v.id}`
  v.embedUrl = `https://www.youtube.com/embed/${v.id}`
}

/* الفيديو التعريفي في صفحة المنصة /ihkaam (بند UX-03). */
export const INTRO_VIDEO = 'intro'

/* ميزة ← فيديوهاتها (بند AI-03). المفتاح هو slug الميزة في featureDetails.js. */
export const FEATURE_VIDEOS = {
  admin   : ['ep1', 'ep2'],
  academic: ['ep3'],
  daily   : ['ep4', 'ep5', 'ep6'],
  exams   : ['ep7'],
  insights: ['ep9', 'retention'],
  star    : ['ep10'],
  parents : ['ep11'],
  subjects: ['ep12'],
}

/* مقال مساعدة ← فيديوهاته. المفتاح هو slug المقال في helpContent.js. */
export const HELP_VIDEOS = {
  'dashboard-overview'  : ['ep1', 'mobile'],
  'student-registration': ['ep2'],
  'staff-management'    : ['ep2'],
  'groups-management'   : ['ep3'],
  'daily-recitation'    : ['ep4', 'ep5'],
  'attendance-batch'    : ['ep6'],
  'tests'               : ['ep7'],
  'exam-queue'          : ['ep7'],
  'smart-insights'      : ['ep9'],
  'insights-metrics'    : ['ep9'],
  'star-of-week'        : ['ep10'],
  'parent-portal'       : ['ep11'],
}

/* الميزات المدفوعة (تُخدَم من /ihkaam/addons). نسخةٌ من ADDONS في
   featureDetails.js حتى لا يستورد مقال المساعدة بيانات الميزات كلها؛
   entry-server.jsx يتحقق عند البناء أنهما متطابقتان. */
export const ADDON_FEATURES = ['finance', 'subjects', 'star']

export const featurePath = (slug) => `/ihkaam/${ADDON_FEATURES.includes(slug) ? 'addons' : 'features'}/${slug}`

const pick = (keys = []) => keys.map(k => VIDEOS[k]).filter(Boolean)
export const featureVideos = (slug) => pick(FEATURE_VIDEOS[slug])
export const helpVideos    = (slug) => pick(HELP_VIDEOS[slug])

/* الصفحات التي تعرض الفيديو نفسه، لروابط «الشرح المكتوب» و«عن هذه الميزة». */
export const featuresOfVideo = (key) => Object.keys(FEATURE_VIDEOS).filter(s => FEATURE_VIDEOS[s].includes(key))
export const helpOfVideo     = (key) => Object.keys(HELP_VIDEOS).filter(s => HELP_VIDEOS[s].includes(key))

/* «٨:٤٨» — بأرقام الموقع الغربية كما في بقية الواجهة. */
export function durationLabel(seconds) {
  const m = Math.floor(seconds / 60), s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/* مدة ISO 8601 لـ VideoObject: 93 ← PT1M33S. */
export function isoDuration(seconds) {
  const m = Math.floor(seconds / 60), s = seconds % 60
  return `PT${m ? `${m}M` : ''}${s ? `${s}S` : ''}`
}

/* الفيديوهات الظاهرة في مسارٍ ما. يقرؤها entry-server لكتابة VideoObject،
   فتتبع الصفحةَ بالتعريف: ما يُعرض هناك هو ما يُكتب هنا. */
export function videosForPath(path) {
  let m
  if (path === '/ihkaam') return pick([INTRO_VIDEO])
  if ((m = path.match(/^\/ihkaam\/(?:features|addons)\/([^/]+)$/))) return featureVideos(m[1])
  if ((m = path.match(/^\/help\/([^/]+)$/))) return helpVideos(m[1])
  return []
}
