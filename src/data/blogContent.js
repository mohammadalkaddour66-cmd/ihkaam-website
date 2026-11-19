/* ─────────────────────────────────────────────────────────────────
   مدونة إحكام — نقطة الدخول الوحيدة لبيانات المقالات.

   كل مقالٍ ملفٌّ مستقل في src/data/blog/<slug>.js يصدّر كائناً واحداً
   (export default). هذا الملف يجمعها ويصدّر الواجهة التي تقرؤها الصفحات
   (BlogList و BlogArticle) و entry-server (الوسوم والبيانات المنظمة وخريطة
   الموقع): BLOG_POSTS و BLOG_CATEGORIES و getPost و getCategoryById، ومعها
   BLOG_CLUSTERS و BLOG_DRAFTS و getRelatedPosts و featureHref و readTimeLabel.

   إضافة مقال: أنشئ الملف بنسخ أي مقالٍ قائم، ثم أضف سطر import وأدرجه في
   ALL أدناه. المسودة (status: 'draft') لا تظهر في الموقع ولا في الخريطة.

   ── شكل الملف ──────────────────────────────────────────────────
   slug           رابط المقال /blog/<slug>. لا يتغيّر بعد النشر (تغييره يحتاج
                  تحويل 301 في public/_redirects).
   status         'published' أو 'draft'.
   category       من BLOG_CATEGORIES (فلتر صفحة المدونة ولونها).
   cluster        من BLOG_CLUSTERS (عنقود الموضوع للربط الداخلي).
   targetQuery    عبارة البحث المستهدفة كما يكتبها الباحث.
   title          عنوان الصفحة (H1)، يبدأ بعبارة البحث أو يحتويها.
   seoTitle       عنوان نتيجة البحث، 60 حرفاً أو أقل. يغلب BLOG_SEO في seo.js.
   seoDescription وصف نتيجة البحث، 120 إلى 155 حرفاً، بلا رقمٍ لا مصدر له.
   excerpt        سطر أو سطران تحت العنوان وفي بطاقة المقال.
   author         'منصة إحكام' دائماً.
   date           تاريخ النشر الأول (YYYY-MM-DD). لا يُغيَّر ولا يُرجَّع.
   updatedAt      تاريخ آخر مراجعة جوهرية، أو null إن لم يُراجَع.
   relatedFeature slug من src/data/featureDetails.js، ورابطه featureHref(slug).
   relatedPosts   ثلاثة slugs مقالات يُقترح قراءتها بعده.
   sources        [{ title, publisher, url, accessed }] لكل رقمٍ أو حكمٍ منقول.
   coverColor     لون المقال (من ألوان BLOG_CATEGORIES، لا لون جديد).
   cover          صورة المشاركة /og/blog/<slug>.jpg، يولّدها scripts/make-og-covers.mjs.
   sections       متن المقال، وأنواع أقسامه:
     { type: 'opening', text }                      المشهد أو السؤال الافتتاحي
     { type: 'definition', term, text }             فقرة الإجابة المباشرة (جملتان أو ثلاث)
     { type: 'heading', text }                      عنوان فرعي H2
     { type: 'subheading', text }                   عنوان فرعي H3
     { text }                                       فقرة. تقبل **عريض** و [نص](/مسار)
                                                    والسطر الذي يبدأ بـ «- » بند قائمة
     { type: 'table', caption, columns: [], rows: [[]] }
     { type: 'template', title, text }              نموذج جاهز للنسخ أو الطباعة
     { type: 'faq', items: [{ q, a }] }             أسئلة شائعة
     { type: 'cta', text, to?, label? }             دعوة ختامية واحدة

   مدة القراءة لا تُكتب يدوياً: تُحسب هنا من عدد كلمات المتن.
────────────────────────────────────────────────────────────────── */

import { ADDONS } from './featureDetails'

import whyStudentsLeave          from './blog/why-students-leave'
import monthlyReportsTimeTrap    from './blog/monthly-reports-time-trap'
import financialChaosNotMoney    from './blog/financial-chaos-not-money'
import howToKnowTeacherIsWorking from './blog/how-to-know-teacher-is-working'
import angryParentTrustMoment    from './blog/angry-parent-trust-moment'
import organizingCirclesMedium   from './blog/organizing-circles-medium-center'
import handlingChronicAbsentees  from './blog/handling-chronic-absentees'
import fairRecitationSystem      from './blog/fair-recitation-system'
import weeklyMemorizationPlan    from './blog/weekly-memorization-plan'
import settingTuitionFees        from './blog/setting-tuition-fees'
import motivatingTeachers        from './blog/motivating-teachers'
import reputationAsMarketing     from './blog/reputation-as-marketing'
import readingRecitationData     from './blog/reading-recitation-data'
import digitalTransformation     from './blog/digital-transformation-quran-centers'
import deliveringBadNews         from './blog/delivering-bad-news-to-parents'
import whyCentersFailToScale     from './blog/why-centers-fail-to-scale'
import first90DaysDirector       from './blog/first-90-days-director'
import howLongToMemorizeQuran    from './blog/how-long-to-memorize-quran'
import quranReviewSchedule       from './blog/quran-review-schedule'
import attendanceRegisterTemplate from './blog/attendance-register-template'
import quranCertificateWording   from './blog/quran-certificate-wording'

export const BLOG_CATEGORIES = [
  { id: 'retention',   label: 'استبقاء الطلاب', color: '#1F6F52' },
  { id: 'operations',  label: 'إدارة العمليات',  color: '#8A6425' },
  { id: 'finance',     label: 'الشؤون المالية',  color: '#0B3B33' },
  { id: 'staff',       label: 'إدارة الكادر',    color: '#7A5A2E' },
  { id: 'growth',      label: 'النمو والتوسع',   color: '#B8863A' },
  { id: 'parents',     label: 'علاقة الأهل',     color: '#2E7A5A' },
  { id: 'daily',       label: 'المتابعة اليومية', color: '#2E7A5A' },
]

/* عناقيد الموضوعات، على تقسيم شيت «أفكار المقالات» في تقرير التحليل. */
export const BLOG_CLUSTERS = [
  { id: 'management', label: 'إدارة المركز والقيادة' },
  { id: 'teaching',   label: 'المعلم والحلقة' },
  { id: 'hifz',       label: 'الحفظ والمراجعة' },
  { id: 'parents',    label: 'أولياء الأمور والتحفيز' },
  { id: 'finance',    label: 'المال والتمويل' },
  { id: 'tech',       label: 'التقنية والقوالب' },
]

const ALL = [
  whyStudentsLeave,
  monthlyReportsTimeTrap,
  financialChaosNotMoney,
  howToKnowTeacherIsWorking,
  angryParentTrustMoment,
  organizingCirclesMedium,
  handlingChronicAbsentees,
  fairRecitationSystem,
  weeklyMemorizationPlan,
  settingTuitionFees,
  motivatingTeachers,
  reputationAsMarketing,
  readingRecitationData,
  digitalTransformation,
  deliveringBadNews,
  whyCentersFailToScale,
  first90DaysDirector,
  howLongToMemorizeQuran,
  quranReviewSchedule,
  attendanceRegisterTemplate,
  quranCertificateWording,
]

/* ── مدة القراءة من عدد الكلمات ───────────────────────────────── */
const WORDS_PER_MINUTE = 180

function sectionText(s) {
  const parts = [s.term, s.title, s.caption, s.text]
  if (Array.isArray(s.columns)) parts.push(...s.columns)
  if (Array.isArray(s.rows)) for (const r of s.rows) parts.push(...r)
  if (Array.isArray(s.items)) for (const it of s.items) parts.push(it.q, it.a)
  return parts.filter(v => typeof v === 'string').join(' ')
}

export function countWords(sections = []) {
  return sections
    .map(sectionText)
    .join(' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*#>|•—–-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

export function readTimeLabel(minutes) {
  if (minutes <= 1)  return 'دقيقة واحدة'
  if (minutes === 2) return 'دقيقتان'
  if (minutes <= 10) return `${minutes} دقائق`
  return `${minutes} دقيقة`
}

function normalize(post) {
  const wordCount = countWords(post.sections)
  const readTime  = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
  return {
    ...post,
    author   : post.author || 'منصة إحكام',
    updated  : post.updatedAt || null,   // الاسم الذي يقرؤه entry-server و BlogArticle
    wordCount,
    readTime,
  }
}

/* الأحدث أولاً. */
const byDateDesc = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)

export const BLOG_POSTS  = ALL.filter(p => p.status !== 'draft').map(normalize).sort(byDateDesc)
export const BLOG_DRAFTS = ALL.filter(p => p.status === 'draft').map(normalize)

/* ── Helpers ─────────────────────────────────────────────────── */
export function getPost(slug) {
  return BLOG_POSTS.find(p => p.slug === slug) || null
}

export function getCategoryById(id) {
  return BLOG_CATEGORIES.find(c => c.id === id) || null
}

export function getClusterById(id) {
  return BLOG_CLUSTERS.find(c => c.id === id) || null
}

/* مسار صفحة الميزة: الإضافات المدفوعة تحت /ihkaam/addons والباقي تحت
   /ihkaam/features، بحسب ADDONS في featureDetails.js. */
export function featureHref(slug) {
  if (!slug) return '/ihkaam'
  return ADDONS.includes(slug) ? `/ihkaam/addons/${slug}` : `/ihkaam/features/${slug}`
}

/* المقالات المقترحة: relatedPosts المنشورة أولاً، ثم من العنقود نفسه. */
export function getRelatedPosts(post, limit = 3) {
  const picked = (post.relatedPosts || []).map(getPost).filter(Boolean)
  for (const p of BLOG_POSTS) {
    if (picked.length >= limit) break
    if (p.slug !== post.slug && p.cluster === post.cluster && !picked.includes(p)) picked.push(p)
  }
  for (const p of BLOG_POSTS) {
    if (picked.length >= limit) break
    if (p.slug !== post.slug && !picked.includes(p)) picked.push(p)
  }
  return picked.slice(0, limit)
}
