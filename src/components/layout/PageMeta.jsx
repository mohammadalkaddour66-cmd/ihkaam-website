import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE, buildTitle, clampDescription, canonicalFor } from '../../config/seo'

/* ══════════════════════════════════════════════════════════════════
   وسوم الصفحة الواحدة — تعمل في موضعين من مصدرٍ واحد:

   ١) في المتصفح: useEffect يكتب الوسوم في <head> (كما كانت).
   ٢) عند التوليد المسبق (scripts/prerender.mjs): لا document ولا
      effects على الخادم، فيُسجِّل المكوّنُ وسومَه أثناء التصيير في
      globalThis.__PAGE_META__ ويقرؤها السكربت ويحقنها في <head> ملفِّ
      HTML الذي يُنتجه. هكذا تبقى الصفحةُ وحدها مصدرَ حقيقةِ وسومها —
      لا جدولَ ثانياً يُخزَّن فيه العنوان والوصف مرتين فيتباعدان.

   الترتيب مضمون في الحالتين: RouteMeta يسبق <Outlet/> فتكتب الصفحةُ
   بعده وتغلب (الأخصّ يفوز) — وهذا ما يفعله Object.assign أدناه.

   النسخة السابقة كانت تكتفي بـ querySelector ثم `if (desc)` — تُعدّل
   الوسم الموجود ولا تُنشئه. فلمّا حُذف <meta name="description"> من
   index.html صارت كل أوصاف الصفحات تسقط صامتةً: لا خطأ في الطرفية،
   ولا فرق ظاهر في المتصفح، وفقط محرك البحث يرى الفرق. لذلك تُنشئ
   الدوالُّ أدناه الوسمَ إن غاب بدل تخطّيه.

   ولا تنظيف عند الإفلات (كانت تُعيد document.title): الصفحة التالية
   تكتب وسومها بنفسها، وإعادةُ الضبط عند الإفلات كانت تتسابق مع كتابة
   الصفحة الجديدة — والترتيب بينهما غير مضمون.

   meta keywords حُذف عمداً: لا وزن له عند جوجل ولا بينگ منذ سنين
   (تقرير التحليل ISS-24).

   وما يكتبه التوليد المسبق لا يُمَسّ عند أول تحميل: entry-server.jsx يُكمل
   الوسوم من ملفات البيانات (بيانات منظَّمة لكل نوع صفحة، صورة غلاف المقال،
   الأسئلة الشائعة الظاهرة) وهي أغنى مما تمرّره الصفحة هنا. فلو أعاد
   المتصفح كتابتها عند الإقلاع لحذف ما يراه جوجل بعد تشغيل JavaScript.
   لذلك يتحقق التأثير أولاً: إن كان <head> مولَّداً لهذا المسار نفسه تركه.
   ══════════════════════════════════════════════════════════════════ */

function ensure(selector, create) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

function setMeta(attr, key, content) {
  if (!content) return
  ensure(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement('meta')
    m.setAttribute(attr, key)
    return m
  }).setAttribute('content', content)
}

function setCanonical(href) {
  ensure('link[rel="canonical"]', () => {
    const l = document.createElement('link')
    l.setAttribute('rel', 'canonical')
    return l
  }).setAttribute('href', href)
}

/* robots: تُضاف للصفحات غير المفهرسة وتُزال حين تُفهرَس الصفحة التالية. */
function setRobots(noindex) {
  const el = document.head.querySelector('meta[name="robots"]')
  if (noindex) {
    ensure('meta[name="robots"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'robots')
      return m
    }).setAttribute('content', 'noindex, follow')
  } else if (el) {
    el.remove()
  }
}

/* بياناتٌ منظَّمة خاصة بالصفحة (مقال/ميزة/مساعدة). المخطّط العام للموقع
   (Organization/WebSite) باقٍ في index.html ولا يُلمَس هنا. */
const LD_ATTR = 'data-page-ld'

/* هل <head> الحاليّ خرج من التوليد المسبق لهذا المسار بعينه؟
   العلامة: سكربت البيانات المنظَّمة يحمل data-ssr، والرابط المعياري يطابق
   المسار. بعد أول تنقّل داخل الموقع يُستبدل السكربت فتزول العلامة. */
function isPrerenderedFor(url) {
  const ld    = document.head.querySelector(`script[${LD_ATTR}][data-ssr]`)
  const canon = document.head.querySelector('link[rel="canonical"]')
  return Boolean(ld) && canon?.getAttribute('href') === url
}

function setPageJsonLd(jsonLd) {
  const old = document.head.querySelector(`script[${LD_ATTR}]`)
  if (old) old.remove()
  if (!jsonLd) return
  const s = document.createElement('script')
  s.type = 'application/ld+json'
  s.setAttribute(LD_ATTR, '')
  s.textContent = JSON.stringify(jsonLd)
  document.head.appendChild(s)
}

export default function PageMeta({
  title,
  description,
  image  = SITE.ogImage,
  type   = 'website',
  noindex = false,
  jsonLd,
}) {
  const { pathname } = useLocation()

  const fullTitle = title ? buildTitle(title) : undefined
  const desc      = clampDescription(description)
  const url       = canonicalFor(pathname)

  /* على الخادم: سجِّل فقط. لا يُسجَّل شيءٌ في المتصفح. */
  if (typeof document === 'undefined') {
    const store = (globalThis.__PAGE_META__ ??= {})
    Object.assign(store, {
      ...(fullTitle ? { title: fullTitle } : {}),
      ...(desc ? { description: desc } : {}),
      url, image, type, noindex,
      jsonLd: jsonLd ?? null,
    })
  }

  const ldKey = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    if (isPrerenderedFor(url)) return

    if (fullTitle) document.title = fullTitle

    setMeta('name', 'description', desc)

    setMeta('property', 'og:title',       fullTitle ?? document.title)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url',         url)
    setMeta('property', 'og:type',        type)
    setMeta('property', 'og:image',       image)

    /* تويتر/إكس لا يرث og:title متى وُجد twitter:card، فيُكتبان معاً. */
    setMeta('name', 'twitter:title',       fullTitle ?? document.title)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image',       image)

    setCanonical(url)
    setRobots(noindex)
    setPageJsonLd(ldKey ? JSON.parse(ldKey) : null)
  }, [fullTitle, desc, image, type, url, noindex, ldKey])

  return null
}
