/* ══════════════════════════════════════════════════════════════════
   أنماط الصفحة مضمَّنة في رأسها (ISS-31) — يستعمله scripts/prerender.mjs.

   المشكلة: ورقة أنماط واحدة (~74 KB خام) حاجبة للرسم في كل صفحة؛ لا يُرسم
   شيء حتى تصل كاملة، وأغلبها قواعد لصفحات أخرى.

   الحل: لكل صفحة مولَّدة تُستخرج من الورقة القواعدُ التي تطابق عناصر HTML
   تلك الصفحة فقط، وتُكتب في <style> في الرأس. والورقة الكاملة تبقى رابطاً
   لكن media="print" فلا تحجب الرسم، ويقلبها main.jsx إلى all بعد الإقلاع
   (لا onload مضمَّن: CSP تمنع معالجات الأحداث المضمَّنة). تحتاجها الصفحة
   بعدها لما يرسمه React في المتصفح وحده (قائمة الجوال، التنقّل بين الصفحات).

   المطابقة محافظة: القاعدة تُستبقى ما لم يُعرف يقيناً أنها لا تطابق. كل صنفٍ
   (class) ومعرّفٍ (id) ووسمٍ في المحدِّد يجب أن يظهر في الصفحة؛ والأشباه
   (:hover و ::before و :not(...) ...) ومحدِّدات السمات لا تُسقط قاعدة.
   ══════════════════════════════════════════════════════════════════ */
import postcss from 'postcss'

const BS = '\\'

/* يحذف الأشباه (:hover و ::before) والدالّية منها بأقواسها المتوازنة
   (:not(...) :where(...) :is(...) :has(...))، ومحدِّدات السمات [..]. يمسح
   الحروف واحداً واحداً لأن أسماء أصناف Tailwind تحمل نقطتين وأقواساً مهرَّبة
   (مثل lg:mb-4 و text-[10px]) يجب ألا تُقرأ أشباهاً أو سمات. */
function stripPseudo(sel) {
  let out = ''
  for (let i = 0; i < sel.length;) {
    const c = sel[i]
    if (c === BS) { out += c + (sel[i + 1] ?? ''); i += 2; continue }
    if (c === '[') {
      i++
      while (i < sel.length && sel[i] !== ']') i += sel[i] === BS ? 2 : 1
      i++
      out += ' '
      continue
    }
    if (c === ':') {
      i++
      if (sel[i] === ':') i++
      while (i < sel.length && /[a-zA-Z-]/.test(sel[i])) i++
      if (sel[i] === '(') {
        let depth = 1
        i++
        while (i < sel.length && depth) {
          if (sel[i] === BS) { i += 2; continue }
          if (sel[i] === '(') depth++
          else if (sel[i] === ')') depth--
          i++
        }
      }
      out += ' '
      continue
    }
    out += c
    i++
  }
  return out
}

const unescapeCss = (s) => s
  .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/\\(.)/g, '$1')

/* يقسم قائمة المحدِّدات عند الفواصل العليا (لا داخل الأقواس). */
function splitList(list) {
  const parts = []
  let depth = 0
  let cur = ''
  for (let i = 0; i < list.length; i++) {
    const c = list[i]
    if (c === BS) { cur += c + (list[i + 1] ?? ''); i++; continue }
    if (c === '(') depth++
    else if (c === ')') depth--
    if (c === ',' && !depth) { parts.push(cur); cur = '' } else cur += c
  }
  parts.push(cur)
  return parts
}

const NAME     = String.raw`(?:[a-zA-Z0-9_-]|\\[0-9a-fA-F]{1,6}\s?|\\.)+`
const CLASS_RE = new RegExp(String.raw`\.(${NAME})`, 'g')
const ID_RE    = new RegExp(String.raw`#(${NAME})`, 'g')
const TAG_RE   = /(?:^|[\s>+~])([a-zA-Z][a-zA-Z0-9-]*)/g

function selectorMatches(sel, page) {
  const s = stripPseudo(sel)
  for (const m of s.matchAll(CLASS_RE)) {
    if (!page.classes.has(unescapeCss(m[1]))) return false
  }
  for (const m of s.matchAll(ID_RE)) {
    if (!page.ids.has(unescapeCss(m[1]))) return false
  }
  /* الوسوم: كلمة في أول المحدِّد المركَّب، بعد حذف الأصناف والمعرّفات. */
  const rest = s.replace(CLASS_RE, ' ').replace(ID_RE, ' ')
  for (const m of rest.matchAll(TAG_RE)) {
    if (!page.tags.has(m[1].toLowerCase())) return false
  }
  return true
}

const unescapeHtml = (s) => s
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

function collect(html) {
  const classes = new Set()
  const ids     = new Set()
  const tags    = new Set(['html', 'body', 'head'])
  for (const m of html.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)/g)) tags.add(m[1].toLowerCase())
  for (const m of html.matchAll(/\sclass="([^"]*)"/g)) {
    for (const c of unescapeHtml(m[1]).split(/\s+/)) if (c) classes.add(c)
  }
  for (const m of html.matchAll(/\sid="([^"]*)"/g)) ids.add(unescapeHtml(m[1]))
  return { classes, ids, tags }
}

const KEYFRAMES = /keyframes$/i

/* يعيد دالةً تأخذ HTML الصفحة وتعيد نصّ CSS الذي تحتاجه. */
export function makeCriticalCss(fullCss) {
  const root = postcss.parse(fullCss)

  return function forPage(html) {
    const page = collect(html)
    const out  = root.clone()

    out.walkRules((rule) => {
      /* قواعد داخل @keyframes (from / to / 50%) ليست محدِّدات. */
      if (rule.parent?.type === 'atrule' && KEYFRAMES.test(rule.parent.name)) return
      const all  = splitList(rule.selector)
      const keep = all.filter(sel => selectorMatches(sel, page))
      if (!keep.length) rule.remove()
      else if (keep.length !== all.length) rule.selector = keep.join(',')
    })

    /* كتلٌ صارت فارغة (@media / @supports / @layer بلا قواعد). */
    let changed = true
    while (changed) {
      changed = false
      out.walkAtRules((at) => {
        if (at.nodes && at.nodes.length === 0) { at.remove(); changed = true }
      })
    }

    /* الحركات: تبقى @keyframes التي تذكرها تصريحاتٌ باقية أو HTML الصفحة. */
    const used = new Set()
    out.walkDecls((d) => {
      for (const w of d.value.split(/[\s,]+/)) used.add(w)
    })
    out.walkAtRules(KEYFRAMES, (at) => {
      const name = at.params.trim()
      if (!used.has(name) && !html.includes(name)) at.remove()
    })

    return out.toString()
  }
}
