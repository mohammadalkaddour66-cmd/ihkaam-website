/* ══════════════════════════════════════════════════════════════════
   الأدوات المجانية — مرجعٌ واحد يقرؤه كل من يذكرها:
   صفحة /tools، وصفحة كل أداة، والترويسة والتذييل، وبطاقة «أداة مرتبطة» في
   المقالات، و entry-server (المسارات والبيانات المنظَّمة و llms.txt).

   أداةٌ تُضاف هنا تدخل الخريطة و llms.txt تلقائياً، ويبقى أن يُضاف مسارها
   في AppRoutes.jsx.

   قواعد النصوص كما في config/seo.js: العنوان ≤ 60 حرفاً مع « | إحكام» إن
   اتّسع، والوصف 121–155 حرفاً، بلا سعر وبلا رقمٍ لا مصدر له.
   ══════════════════════════════════════════════════════════════════ */

export const TOOLS_HUB = {
  path: '/tools',
  name: 'أدوات مجانية',
  seoTitle: 'أدوات مجانية لمعلمي القرآن ومديري حلقات التحفيظ',
  seoDescription:
    'أربع أدوات مجانية تعمل في متصفحك بلا تسجيل: خطة حفظ وتلاوة القرآن، وجدول المراجعة، وحاسبة الختم، وشهادات تقدير للحفظ، جاهزة للطباعة وواتساب.',
}

/* مقال لم يحن موعده (مجدول) لا يُربط به: __LIVE_POSTS__ من vite.config.js، وبلا vite
   (سكربتات node المباشرة) تُعدّ المقالات كلها ظاهرة. فيُكتب الربط مع الأداة مرة
   واحدة ويظهر وحده يوم نشر المقال. */
const isLivePost = (slug) => typeof __LIVE_POSTS__ === 'undefined' || __LIVE_POSTS__.includes(slug)

const ALL_TOOLS = [
  {
    slug: 'hifz-plan',
    path: '/tools/hifz-plan',
    name: 'مولّد خطة الحفظ والتلاوة',
    tagline: 'جدول حفظ أو تلاوة يومي بالتاريخ والسورة والآيات',
    short: 'اختر خطة حفظ أو تلاوة، ونقطة البدء والمقدار اليومي وأيام الحلقة، فتأخذ جدولاً يومياً بالآيات والصفحات وتاريخ الختم.',
    seoTitle: 'مولّد خطة حفظ وتلاوة القرآن: جدول يومي بالتاريخ',
    seoDescription:
      'أنشئ خطة حفظ أو تلاوة للقرآن مجاناً: اختر نقطة البدء والمقدار اليومي وأيام الحلقة، فتأخذ جدولاً بالتاريخ والسورة والآيات والصفحة، تطبعه أو ترسله.',
    posts: ['weekly-memorization-plan', 'how-long-to-memorize-quran', 'talqeen-method-quran-beginners', 'how-long-to-memorize-juz-amma', 'ramadan-quran-hifz-schedule', 'summer-quran-program-six-weeks', 'student-registration-form-quran-circle'],
    feature: 'academic',
    outputs: ['جدول A4', 'PDF', 'صورة «خطة الأسبوع»'],
  },
  {
    slug: 'review-plan',
    path: '/tools/review-plan',
    name: 'مولّد جدول المراجعة',
    tagline: 'دورة مراجعة تمرّ على المحفوظ كله',
    short: 'حدّد ما حفظه الطالب ومقدار المراجعة اليومي، فتعرف ما يراجعه كل يوم، وكل كم يوماً يختم مراجعة محفوظه.',
    seoTitle: 'جدول مراجعة حفظ القرآن: مولّد دورة المراجعة اليومية',
    seoDescription:
      'وزّع مراجعة محفوظ طالبك على أيام الحلقة: اختر الأجزاء المحفوظة ومقدار المراجعة اليومي، فتعرف ما يراجعه كل يوم وكم يوماً يحتاج ليختم مراجعة محفوظه.',
    posts: ['quran-review-schedule', 'how-long-to-memorize-juz-amma'],
    feature: 'daily',
    outputs: ['جدول A4', 'PDF', 'صورة «مراجعة الأسبوع»'],
  },
  {
    slug: 'khatm-calculator',
    path: '/tools/khatm-calculator',
    name: 'حاسبة الختم والورد اليومي',
    tagline: 'كم تقرأ كل يوم لتختم في المدة التي تريد',
    short: 'اختر المدة أو رمضان وعدد الختمات، فتأخذ وردك اليومي من صفحة إلى صفحة، مقسوماً على الصلوات إن شئت.',
    seoTitle: 'حاسبة ختم القرآن: الورد اليومي لختمة في أي مدة',
    seoDescription:
      'كم صفحة تقرأ في اليوم لتختم القرآن في شهر أو في رمضان أو في أي مدة؟ تحسب الأداة وردك اليومي من صفحة إلى صفحة، وتقسمه على الصلوات الخمس إن شئت.',
    posts: ['how-long-to-memorize-quran', 'ramadan-quran-hifz-schedule'],
    feature: 'library',
    outputs: ['جدول A4', 'PDF', 'بطاقة الورد'],
  },
  {
    slug: 'certificate',
    path: '/tools/certificate',
    name: 'مولّد شهادة حفظ',
    tagline: 'شهادة تقدير بدقة طباعة، باسم معهدك',
    short: 'اكتب اسم الطالب وما حفظه واسم المعهد وعدّل أي عبارة، فتحمّل شهادة PDF أو صورة، أو شهادات الحلقة كلها في ملف واحد.',
    seoTitle: 'مولّد شهادة تقدير لحفظ القرآن: اطبعها مجاناً',
    seoDescription:
      'أنشئ شهادة تقدير لحفظ القرآن بعباراتك واسم معهدك، أو ولّد شهادات الحلقة كلها من ملف Excel في PDF واحد بدقة طباعة A4، مجاناً وبلا تسجيل.',
    posts: ['reputation-as-marketing', 'quran-certificate-wording', 'ramadan-quran-competition', 'quran-graduation-ceremony-plan', 'motivating-students-quran-free-ideas'],
    feature: 'star',
    outputs: ['A4 أفقي', 'PDF', 'صورة PNG', 'دفعة من Excel'],
  },
]

export const TOOLS = ALL_TOOLS.map(t => ({ ...t, posts: t.posts.filter(isLivePost) }))

/* عناوين المقالات المرتبطة بالأدوات، مختصرة. هنا لا في blogContent.js حتى لا
   تحمل صفحة الأداة نصوص المدونة كلها لأجل ثلاثة روابط. */
export const POST_TITLES = {
  'weekly-memorization-plan': 'خطة حفظ القرآن الأسبوعية: ثلاثة جداول جاهزة',
  'how-long-to-memorize-quran': 'كم يستغرق حفظ القرآن كاملاً؟',
  'quran-review-schedule': 'جدول مراجعة الحفظ في الحلقة',
  'reputation-as-marketing': 'تسويق المعهد يبدأ من رضا الأهل',
  'quran-certificate-wording': 'شهادة تقدير حفظ القرآن: عبارات وصيغ جاهزة',
}

export const getTool =(slug) => TOOLS.find(t => t.slug === slug)

/* الأدوات التي ترتبط بمقال: تُعرض بطاقتها داخل المقال نفسه. */
export const toolsForPost = (postSlug) => TOOLS.filter(t => t.posts.includes(postSlug))

/* السطر الثابت أسفل كل مخرَج. قرار 2026-11-21: سطر واحد بلا شعار بارز، ورابطه
   قابل للنقر في PDF: مقطعان منفصلان حتى يعرف الرسم أين يضع منطقة الرابط.
   عُدّلت صياغته 2026-11-24: «صُنعت بواسطة أدوات إحكام المجانية · زوروا موقعنا»
   كانت تُحرج المعهد أمام أهالي الطلاب وقد تمنعه من استعمال الأداة، فصارت
   اسم المنتج فقط وأقصر، وصغّر حجمها في الشهادة لئلا تزاحم التوقيعين. */
export const TOOL_CREDIT_LEAD = 'نظام إحكام لإدارة المعاهد القرآنية'
export const TOOL_CREDIT_LINK = 'ihkaam.app'
export const TOOL_CREDIT_URL = 'https://ihkaam.app'
export const TOOL_CREDIT = `${TOOL_CREDIT_LEAD} ${TOOL_CREDIT_LINK}`

/* ذيل نص المشاركة على واتساب: يُلحق بكل صورة يشاركها المدير من أي أداة، فيصل الرابط
   مع الصورة نفسها إلى من يستلمها (الأهالي والمعلمون). قرار 2026-11-24. */
export const TOOL_SHARE_TAIL = `${TOOL_CREDIT_LEAD}\n${TOOL_CREDIT_URL}`
