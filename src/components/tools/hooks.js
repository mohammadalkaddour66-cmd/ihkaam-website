import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { loadQuranIndex, todayStr } from '../../tools/quran/index.js'
import { canShareFiles } from './canvasKit'

/* فهرس المصحف: يُحمَّل في المتصفح عند فتح الأداة (import ديناميكي، 436 ك.ب.)،
   ولا يُحمَّل في التوليد المسبق: الصفحة المولَّدة تحمل الشرح والنموذج، والحساب
   يبدأ بعد الإقلاع. */
export function useQuranIndex() {
  const [state, setState] = useState({ ix: null, error: null })
  useEffect(() => {
    let alive = true
    loadQuranIndex()
      .then((ix) => { if (alive) setState({ ix, error: null }) })
      .catch(() => { if (alive) setState({ ix: null, error: 'تعذّر تحميل بيانات المصحف. تحقّق من الاتصال ثم أعد تحميل الصفحة.' }) })
    return () => { alive = false }
  }, [])
  return state
}

/* تاريخ اليوم بتوقيت الزائر. null في التوليد المسبق وأثناء التهيئة، حتى لا
   يختلف HTML المولَّد يوم البناء عمّا يرسمه المتصفح يوم الزيارة. */
const noSubscribe = () => () => {}
export function useToday() {
  return useSyncExternalStore(noSubscribe, todayStr, () => null)
}

/* قيمة تبدأ بتاريخ اليوم عند الإقلاع، ويمكن للزائر تغييرها. */
export function useDateField() {
  const today = useToday()
  const [value, setValue] = useState(null)
  return [value ?? today, setValue, today]
}

/* هل يدعم الجهاز مشاركة ملف صورة (الهاتف غالباً)؟ false في التوليد المسبق. */
export function useCanShareFiles() {
  return useSyncExternalStore(noSubscribe, canShareFiles, () => false)
}

/* الطباعة: تُرسم الورقة في PrintPortal ثم تُفتح نافذة الطباعة، وتُزال بعدها. */
export function usePrint() {
  const [job, setJob] = useState(null) // { landscape } أثناء الطباعة

  useEffect(() => {
    if (!job) return
    let done = false
    const finish = () => { if (!done) { done = true; setJob(null) } }
    window.addEventListener('afterprint', finish)
    /* إطاران: الأول يرسم الورقة، والثاني يضمن أن الصور والخطوط جاهزة */
    const t = requestAnimationFrame(() => requestAnimationFrame(async () => {
      try { await document.fonts?.ready } catch { /* لا شيء */ }
      window.print()
    }))
    return () => { cancelAnimationFrame(t); window.removeEventListener('afterprint', finish) }
  }, [job])

  const print = useCallback((opts = {}) => setJob({ landscape: !!opts.landscape }), [])
  return { printing: !!job, landscape: !!job?.landscape, print }
}
