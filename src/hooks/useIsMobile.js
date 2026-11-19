import { useSyncExternalStore } from 'react'

const QUERY = '(max-width: 639px)'

/* useSyncExternalStore لا useState(() => matchMedia…): الصفحات مُصيَّرة مسبقاً
   على الخادم حيث لا شاشة، فالخادم يرسمها بفرع سطح المكتب. لو قرأ المتصفح
   العرض في أول تصيير لاختلف ما يرسمه على الجوال عن HTML الخادم وفشلت
   التهيئة (hydration mismatch) فيُعاد رسم الصفحة من الصفر. هنا يأخذ أول
   تصيير في المتصفح قيمة الخادم (false)، ثم يصحّحها React فوراً بعد التهيئة. */
function subscribe(onChange) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
const getSnapshot       = () => window.matchMedia(QUERY).matches
const getServerSnapshot = () => false

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
