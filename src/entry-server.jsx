import { StaticRouter } from 'react-router-dom'
import { prerenderToNodeStream } from 'react-dom/static'
import AppRoutes from './AppRoutes'
import { SITE, ROUTE_SEO, buildTitle, clampDescription, blogSeo } from './config/seo'
import { BLOG_POSTS, BLOG_CATEGORIES, countWords } from './data/blogContent'
import { FEATURES, CORE, ADDONS } from './data/featureDetails'
import { CATEGORIES, ARTICLES } from './data/helpContent'
import { TOOLS, TOOLS_HUB, getTool } from './config/tools'
import { ADDON_FEATURES, videosForPath, isoDuration } from './data/videos'

/* ══════════════════════════════════════════════════════════════════
   مدخل الخادم — يُستعمل وقت البناء فقط (scripts/prerender.mjs).

   render(url) يُصيّر الصفحةَ إلى HTML ويُعيد معه الوسوم التي سجّلها
   PageMeta أثناء التصيير. prerenderToNodeStream (React 19) ينتظر حتى
   تنحلّ كل حدود Suspense — أي حتى تُحمَّل الصفحات الكسولة (lazy) —
   فيخرج HTML كاملاً لا هيكلَ تحميل.

   getRoutes() يعدّد كل مسارٍ يُولَّد من نفس مصادر البيانات التي تقرؤها
   الصفحات (المدونة، الميزات، المساعدة) فلا قائمةَ ثانية تتباعد عنها.

   finalizeMeta() يُكمل وسوم الصفحة من البيانات نفسها بعد التصيير: بياناتٌ
   منظَّمة لكل نوع صفحة (ISS-07) وصورة غلاف المقال (ISS-08). مكانها هنا لا في
   seo.js لأن هذا الملف لا يدخل حزمة المتصفح، فلا يُحمَّل نصُّ المدونة والمساعدة
   كلُّه مع كل صفحة لأجل وسومٍ يقرؤها الزاحف من HTML الخام.
   ══════════════════════════════════════════════════════════════════ */

async function streamToString(readable) {
  const decoder = new TextDecoder()
  let out = ''
  for await (const chunk of readable) out += decoder.decode(chunk, { stream: true })
  return out + decoder.decode()
}

export async function render(url) {
  globalThis.__PAGE_META__ = {}
  /* أيّ خطأٍ أثناء التصيير يُجمَع ويُرمى بعده: React يُسقط الحدّ المتأثّر
     إلى «تصيير في المتصفح» بصمت ويكمل، فيخرج HTML ناقصاً دون أن يعلم أحد. */
  const errors = []
  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>,
    {
      onError: (err) => { errors.push(err) },
      /* بلا حدّ للحجم: React يُخرج حدَّ Suspense الكبير المكتمل خارج مكانه
         (<template> ثم <script>$RC(…)</script> ينقله)، وهذا ما كان يضع عشرة
         سكربتات مضمَّنة في الرئيسية تحجبها CSP حين تُفرض (ISS-34). كل الحدود
         مكتملة حين يُكتب HTML المولَّد مسبقاً، فتُكتب في مكانها بلا سكربت. */
      progressiveChunkSize: Number.MAX_SAFE_INTEGER,
    },
  )
  const html = await streamToString(prelude)
  if (errors.length) {
    const e = errors[0]
    throw new Error(`خطأ أثناء تصيير ${url}: ${e?.message || e}`, { cause: e })
  }
  const meta = globalThis.__PAGE_META__
  globalThis.__PAGE_META__ = undefined
  return { html, meta: finalizeMeta(url, meta, html) }
}

/* ── البيانات المنظَّمة ──────────────────────────────────────────────
   القواعد (قرار المالك + تقرير التحليل ISS-07):
   • لا سعر ولا offers ولا تقييم نجوم: لا يُكتب في المخطط ما لا تراه العين
     في الصفحة.
   • الكاتب والناشر جهةٌ واحدة: Organization «منصة إحكام». لا شخص.
   • FAQPage لا يُكتب إلا من أسئلةٍ ظاهرة فعلاً في HTML الصفحة المصيَّرة،
     فيتبع نصَّها حرفاً بحرف ولو تغيّر.
   المخطط العام (Organization / WebSite / SoftwareApplication) في index.html
   ويُشار إليه هنا بمعرّفاته. */
const O        = SITE.origin
const ORG_REF  = { '@id': `${O}/#organization` }
const SITE_REF = { '@id': `${O}/#website` }
const APP_REF  = { '@id': `${O}/ihkaam#software` }
const ORG_FULL = { '@type': 'Organization', ...ORG_REF, name: SITE.orgName, url: `${O}/` }

const abs   = (path) => O + (path === '/' ? '/' : path)
const bare  = (title = '') => title.replace(/\s*\|\s*إحكام\s*$/, '')
const plain = (s = '') => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()

function crumbs(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: abs(path),
    })),
  }
}

function webPage(type, path, meta, extra = {}) {
  return {
    '@type': type,
    '@id': `${abs(path)}#webpage`,
    url: abs(path),
    name: bare(meta.title),
    description: meta.description,
    inLanguage: 'ar',
    isPartOf: SITE_REF,
    ...extra,
  }
}

/* الأسئلة الظاهرة في الصفحة. صيغتان مقبولتان:
   • عنصرٌ يحمل data-faq-q و data-faq-a (الأكورديون: الجواب يُرسم عند الفتح،
     فيحمله العنصر في السمة ليصل إلى هنا).
   • <details><summary>سؤال</summary>جواب</details>. */
const unesc = (s) => s
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
const textOf = (h) => plain(unesc(h.replace(/<[^>]+>/g, ' ')))

function extractFaq(html) {
  const found = []
  for (const m of html.matchAll(/<[a-z0-9]+\b[^>]*\bdata-faq-q="([^"]*)"[^>]*>/g)) {
    const a = m[0].match(/\bdata-faq-a="([^"]*)"/)
    if (a) found.push([plain(unesc(m[1])), plain(unesc(a[1]))])
  }
  for (const m of html.matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)) {
    found.push([textOf(m[1]), textOf(m[2])])
  }
  const seen = new Set()
  return found.filter(([q, a]) => {
    if (!q || !a || seen.has(q)) return false
    seen.add(q)
    return true
  })
}

function faqLd(path, pairs) {
  return {
    '@type': 'FAQPage',
    '@id': `${abs(path)}#faq`,
    mainEntity: pairs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

function postLd(post, meta) {
  const cat   = BLOG_CATEGORIES.find(c => c.id === post.category)
  /* العدد نفسه الذي تحسب به الصفحة زمن القراءة (countWords)، لا نصّ الفقرات وحده. */
  const words = post.wordCount || countWords(post.sections || [])
  return {
    '@type': 'BlogPosting',
    '@id': `${O}/blog/${post.slug}#article`,
    headline: post.title,
    description: meta.description,
    image: meta.image,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: 'ar',
    ...(cat?.label ? { articleSection: cat.label } : {}),
    ...(words ? { wordCount: words } : {}),
    mainEntityOfPage: `${O}/blog/${post.slug}`,
    isPartOf: { '@id': `${O}/blog#blog` },
    author: ORG_FULL,
    publisher: ORG_FULL,
  }
}

/* فيديو يوتيوب ظاهر في الصفحة (LiteYouTube). الغلاف مستضاف عندنا، فيقرؤه
   الزاحف بلا طلب إلى يوتيوب. لا contentUrl: رابط المشاهدة ليس ملف وسائط،
   وGoogle يكتفي بـ embedUrl لما يُضمَّن. */
function videoLd(path, v) {
  return {
    '@type': 'VideoObject',
    '@id': `${abs(path)}#video-${v.key}`,
    name: v.name,
    description: v.desc,
    thumbnailUrl: `${O}${v.poster}`,
    uploadDate: v.uploaded,
    duration: isoDuration(v.seconds),
    embedUrl: v.embedUrl,
    inLanguage: 'ar',
    publisher: ORG_REF,
  }
}

if (ADDON_FEATURES.join() !== ADDONS.join()) {
  throw new Error('ADDON_FEATURES في videos.js لا تطابق ADDONS في featureDetails.js: حدّثهما معاً')
}

const HOME = ['الرئيسية', '/']

function pageGraph(path, meta) {
  if (path === '/') return [webPage('WebPage', path, meta, { about: ORG_REF })]

  if (path === '/ihkaam') return [
    webPage('WebPage', path, meta, { mainEntity: APP_REF }),
    crumbs([HOME, ['منصة إحكام', path]]),
  ]

  if (ROUTE_SEO[path]) {
    const type  = path === '/about' ? 'AboutPage' : path === '/contact' ? 'ContactPage' : 'WebPage'
    const extra = type === 'WebPage' ? {} : { mainEntity: ORG_REF }
    return [webPage(type, path, meta, extra), crumbs([HOME, [bare(meta.title), path]])]
  }

  if (path === '/blog') return [
    {
      '@type': 'Blog',
      '@id': `${O}/blog#blog`,
      url: `${O}/blog`,
      name: bare(meta.title),
      description: meta.description,
      inLanguage: 'ar',
      publisher: ORG_REF,
      blogPost: BLOG_POSTS.map(p => ({
        '@type': 'BlogPosting',
        '@id': `${O}/blog/${p.slug}#article`,
        headline: p.title,
        url: `${O}/blog/${p.slug}`,
        datePublished: p.date,
      })),
    },
    crumbs([HOME, ['المدونة', path]]),
  ]

  let m
  if ((m = path.match(/^\/blog\/([^/]+)$/))) {
    const post = BLOG_POSTS.find(p => p.slug === m[1])
    if (!post) return null
    return [postLd(post, meta), crumbs([HOME, ['المدونة', '/blog'], [post.title, path]])]
  }

  if ((m = path.match(/^\/ihkaam\/(features|addons)\/([^/]+)$/))) {
    if (!FEATURES[m[2]]) return null
    return [
      webPage('WebPage', path, meta, { about: APP_REF }),
      crumbs([HOME, ['منصة إحكام', '/ihkaam'], [bare(meta.title), path]]),
    ]
  }

  /* الأدوات المجانية: الصفحة الجامعة قائمةٌ بها، وكل أداة WebApplication
     مجاني بلا سعر ولا offers (قاعدة المخطط أعلاه)، يعمل في المتصفح. */
  if (path === TOOLS_HUB.path) return [
    webPage('CollectionPage', path, meta, {
      publisher: ORG_REF,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: TOOLS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: abs(t.path) })),
      },
    }),
    crumbs([HOME, [TOOLS_HUB.name, path]]),
  ]

  if ((m = path.match(/^\/tools\/([^/]+)$/))) {
    const t = getTool(m[1])
    if (!t) return null
    return [
      webPage('WebPage', path, meta, { mainEntity: { '@id': `${abs(path)}#app` } }),
      {
        '@type': 'WebApplication',
        '@id': `${abs(path)}#app`,
        name: t.name,
        url: abs(path),
        description: meta.description,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        inLanguage: 'ar',
        image: meta.image,
        publisher: ORG_REF,
      },
      crumbs([HOME, [TOOLS_HUB.name, TOOLS_HUB.path], [t.name, path]]),
    ]
  }

  if (path === '/help') return [
    webPage('CollectionPage', path, meta, { about: APP_REF }),
    crumbs([HOME, ['مركز المساعدة', path]]),
  ]

  if ((m = path.match(/^\/help\/category\/([^/]+)$/))) {
    const cat = CATEGORIES.find(c => c.id === m[1])
    if (!cat) return null
    const items = cat.articles.map(s => ARTICLES[s]).filter(Boolean)
    return [
      webPage('CollectionPage', path, meta, {
        about: APP_REF,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: items.map((a, i) => ({
            '@type': 'ListItem', position: i + 1, name: a.title, url: `${O}/help/${a.slug}`,
          })),
        },
      }),
      crumbs([HOME, ['مركز المساعدة', '/help'], [cat.label, path]]),
    ]
  }

  if ((m = path.match(/^\/help\/([^/]+)$/))) {
    const a = ARTICLES[m[1]]
    if (!a) return null
    const cat   = CATEGORIES.find(c => c.articles.includes(a.slug))
    const steps = (a.steps || []).filter(s => s.title && s.body)
    /* مقالة المساعدة شرحٌ بخطواتٍ مرقّمة ظاهرة في الصفحة: HowTo يصفها كما هي. */
    const article = steps.length >= 2
      ? {
          '@type': 'HowTo',
          '@id': `${abs(path)}#howto`,
          name: a.title,
          description: meta.description,
          inLanguage: 'ar',
          mainEntityOfPage: abs(path),
          publisher: ORG_REF,
          step: steps.map((s, i) => ({
            '@type': 'HowToStep', position: i + 1, name: s.title, text: plain(s.body.replace(/^\s*•\s*/gm, '')),
          })),
        }
      : webPage('WebPage', path, meta, { about: APP_REF })
    return [
      article,
      crumbs([
        HOME, ['مركز المساعدة', '/help'],
        ...(cat ? [[cat.label, `/help/category/${cat.id}`]] : []),
        [a.title, path],
      ]),
    ]
  }

  return null
}

export function finalizeMeta(url, meta, html) {
  const path = url.replace(/[?#].*$/, '').replace(/\/+$/, '') || '/'
  const out  = { ...meta }

  /* المقال: عنوان البحث ووصفه وصورته من بيانات المقال نفسه (blogSeo)، فلا
     يسقط مقالٌ جديد أو مدموج إلى عنوان العرض الطويل لغياب مدخله في جدول. */
  const post = BLOG_POSTS.find(p => `/blog/${p.slug}` === path)
  if (post) {
    const seo = blogSeo(post)
    out.title       = buildTitle(seo.title)
    out.description = clampDescription(seo.description)
    out.image       = seo.image
    out.imageAlt    = seo.imageAlt
    out.type        = 'article'
  }

  if (!out.title || !out.description) return out

  const graph = pageGraph(path, out)
  if (!graph) return out

  const faq = extractFaq(html)
  if (faq.length >= 2) graph.push(faqLd(path, faq))

  /* الفيديوهات الظاهرة في الصفحة (data/videos.js هو مصدر الصفحة والبيانات معاً).
     يُربط كلٌّ منها بالصفحة نفسها (WebPage أو HowTo) بخاصية video. */
  const videos = videosForPath(path)
  if (videos.length) {
    const nodes = videos.map(v => videoLd(path, v))
    graph[0] = { ...graph[0], video: nodes.map(n => ({ '@id': n['@id'] })) }
    graph.push(...nodes)
  }

  out.jsonLd = { '@context': 'https://schema.org', '@graph': graph }
  return out
}

/* المسارات التي تُولَّد. كلها من ملفات البيانات: مقالٌ يُضاف أو يُدمج، أو
   ميزةٌ تنتقل من الإضافات إلى الأساسية، تتبعه الخريطة دون تعديل هنا.
   ما يدخل الخريطة يقرّره وسم noindex الذي تكتبه الصفحة نفسها، لا هذه
   القائمة. و'seed' تاريخٌ معروف لآخر تعديل (تاريخ المقال) تبدأ منه
   الخريطة، ثم يتولّى prerender.mjs تتبّع تغيّر المحتوى. */
export function getRoutes() {
  const routes = []

  for (const path of Object.keys(ROUTE_SEO)) {
    routes.push({ path, priority: path === '/' ? 1.0 : path === '/ihkaam' ? 0.9 : 0.6 })
  }

  routes.push({ path: '/blog', priority: 0.8 })
  for (const p of BLOG_POSTS) {
    routes.push({ path: `/blog/${p.slug}`, seed: p.updated || p.date, priority: 0.7 })
  }

  for (const [kind, slugs] of [['features', CORE], ['addons', ADDONS]]) {
    for (const slug of slugs) {
      if (FEATURES[slug]) routes.push({ path: `/ihkaam/${kind}/${slug}`, priority: 0.8 })
    }
  }

  routes.push({ path: TOOLS_HUB.path, priority: 0.8 })
  for (const t of TOOLS) routes.push({ path: t.path, priority: 0.8 })

  routes.push({ path: '/help', priority: 0.6 })
  for (const c of CATEGORIES) {
    routes.push({ path: `/help/category/${c.id}`, priority: 0.4 })
  }
  for (const slug of Object.keys(ARTICLES)) {
    routes.push({ path: `/help/${slug}`, priority: 0.5 })
  }

  return routes
}

/* مادة llms.txt: تُقرأ من البيانات نفسها حتى لا يذكر الملف ميزةً أو إضافةً
   أو مقالاً ليس في الموقع (ISS-23). */
export function getSiteOutline() {
  return {
    core  : CORE.filter(s => FEATURES[s]).map(s => `/ihkaam/features/${s}`),
    addons: ADDONS.filter(s => FEATURES[s]).map(s => `/ihkaam/addons/${s}`),
    blog  : BLOG_POSTS.map(p => `/blog/${p.slug}`),
    help  : Object.keys(ARTICLES).map(s => `/help/${s}`),
    tools : TOOLS.map(t => t.path),
  }
}
