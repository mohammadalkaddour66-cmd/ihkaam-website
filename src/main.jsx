import { StrictMode, startTransition } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* الصفحات التسويقية مُصيَّرة مسبقاً (scripts/prerender.mjs): #root فيه HTML
   الصفحة كاملاً، فيُهيَّأ (hydrate) كما هو بدل أن يُمسح ويُرسم من جديد.
   createRoot كان يرمي ما رسمه المتصفح ويعيد رسمه بعد تحميل الـJS، فأكبر
   عنصر مرئي يُرسم مرتين والخيط الرئيس يُحجب بتصيير الصفحة كلها دفعةً
   واحدة (ISS-26).

   startTransition يجعل التهيئة قابلة للتقطيع: React يعمل على دفعات قصيرة
   ويترك الخيط الرئيس بينها، فلا تصير مهمّة واحدة طويلة تحجب اللمس والتمرير.
   الصفحة مرئية من HTML أصلاً، فلا شيء ينتظر انتهاءها.

   المسارات غير المُصيَّرة (لوحة الإدارة، الدفع) جذرها فارغ فتُرسم في
   المتصفح كما كانت. */
/* الصفحة المولَّدة تحمل أنماطها في <style> بالرأس، والورقة الكاملة مؤجَّلة
   بـmedia="print" حتى لا تحجب الرسم (ISS-31، scripts/critical-css.mjs).
   تُفعَّل هنا قبل التهيئة: يحتاجها ما يرسمه React وحده (القوائم والتنقّل). */
for (const link of document.querySelectorAll('link[data-full-css]')) link.media = 'all'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (root.firstElementChild) startTransition(() => { hydrateRoot(root, app) })
else createRoot(root).render(app)
