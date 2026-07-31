import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE } from '../config/seo'

/* ══════════════════════════════════════════════════════════════════
   وسوم الصفحة الواحدة.

   النسخة السابقة كانت تكتفي بـ querySelector ثم `if (desc)` — تُعدّل
   الوسم الموجود ولا تُنشئه. فلمّا حُذف <meta name="description"> من
   index.html صارت كل أوصاف الصفحات تسقط صامتةً: لا خطأ في الطرفية،
   ولا فرق ظاهر في المتصفح، وفقط محرك البحث يرى الفرق. لذلك تُنشئ
   الدوالُّ أدناه الوسمَ إن غاب بدل تخطّيه.

   ولا تنظيف عند الإفلات (كانت تُعيد document.title): الصفحة التالية
   تكتب وسومها بنفسها، وإعادةُ الضبط عند الإفلات كانت تتسابق مع كتابة
   الصفحة الجديدة — والترتيب بينهما غير مضمون.
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

/* الرابط المعياري: أصلٌ واحد ثابت + المسار بلا شرطة ختامية ولا معطيات
   استعلام. بدونه يُفهرَس المسار الواحد بأكثر من عنوان (بشرطة وبلا،
   وبكل ?utm_ يُلصَق به في حملة) فيتوزّع وزنه على نسخٍ من نفسه. */
function canonicalFor(pathname) {
  const clean = pathname.replace(/\/+$/, '')
  return SITE.origin + (clean || '/')
}

export default function PageMeta({
  title,
  description,
  keywords,
  image = SITE.ogImage,
  type  = 'website',
}) {
  const { pathname } = useLocation()

  useEffect(() => {
    /* العلامة تُذيَّل إلا إن كان العنوان يحملها أصلاً — فعنوان الصفحة
       الرئيسية «إحكام — نظام إدارة المعاهد والحلقات القرآنية» لا يصحّ
       أن يصير «… | إحكام». */
    const fullTitle = !title
      ? document.title
      : title.includes(SITE.brand)
        ? title
        : `${title} | ${SITE.brand}`

    const url = canonicalFor(pathname)

    if (title) document.title = fullTitle

    setMeta('name', 'description', description)
    setMeta('name', 'keywords',    keywords)

    setMeta('property', 'og:title',       fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url',         url)
    setMeta('property', 'og:type',        type)
    setMeta('property', 'og:image',       image)

    /* تويتر/إكس لا يرث og:title متى وُجد twitter:card، فيُكتبان معاً. */
    setMeta('name', 'twitter:title',       fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image',       image)

    setCanonical(url)
  }, [title, description, keywords, image, type, pathname])

  return null
}
