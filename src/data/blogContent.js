/* ─────────────────────────────────────────────────────────────────
   مدونة إحكام — نقطة الدخول الوحيدة لبيانات المقالات.

   كل مقالٍ ملفٌّ مستقل في src/data/blog/<slug>.js يصدّر كائناً واحداً
   (export default). هذا الملف يجمعها ويصدّر الواجهة التي تقرؤها الصفحات
   (BlogList و BlogArticle) و entry-server (الوسوم والبيانات المنظمة وخريطة
   الموقع): BLOG_POSTS و BLOG_CATEGORIES و getPost و getCategoryById، ومعها
   BLOG_CLUSTERS و BLOG_DRAFTS و getRelatedPosts و featureHref و readTimeLabel.

   إضافة مقال: أنشئ الملف في ./blog بنسخ أي مقالٍ قائم، وانتهى (يُحمَّل وحده).
   متى يظهر: status ≠ 'draft' و date ≤ اليوم بتوقيت دمشق وقت البناء. فالمقال
   المكتمل بتاريخٍ مستقبلي «مجدول»: لا صفحة ولا خريطة ولا نص في حزمة JS حتى
   يوم نشره، ويُبنى الموقع صباح ذلك اليوم تلقائياً (docs/scheduled-publishing-proposal.md).
   المسودة (status: 'draft') لا تُنشر وحدها مهما كان تاريخها.

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

/* كل ملف في ./blog مقال: يُحمَّل تلقائياً، فلا قائمة تُحدَّث عند إضافة مقال.
   (scripts/lib/blog-schedule.mjs يشرح متى يظهر، و vite.config.js يُفرغ ما لم يحن موعده.) */
const MODULES = import.meta.glob('./blog/*.js', { eager: true, import: 'default' })

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

const ALL = Object.values(MODULES)

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

/* يظهر المقال حين لا يكون مسودة ويحين تاريخه (اليوم بتوقيت دمشق وقت البناء). */
const TODAY = typeof __SITE_TODAY__ === 'undefined' ? new Date().toISOString().slice(0, 10) : __SITE_TODAY__
const isLive = (p) => p.status !== 'draft' && p.date <= TODAY

export const BLOG_POSTS     = ALL.filter(isLive).map(normalize).sort(byDateDesc)
export const BLOG_DRAFTS    = ALL.filter(p => p.status === 'draft').map(normalize)
export const BLOG_SCHEDULED = ALL.filter(p => p.status !== 'draft' && !isLive(p)).map(normalize)

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
