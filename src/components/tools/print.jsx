import { createPortal } from 'react-dom'
import { TOOL_CREDIT_LEAD, TOOL_CREDIT_LINK, TOOL_CREDIT_URL } from '../../config/tools'

/* ══════════════════════════════════════════════════════════════════
   الطباعة وPDF من مصدرٍ واحد: ورقة A4 تُرسم في عنصرٍ مستقل تحت <body>
   (.print-root) لحظة الطباعة فقط (usePrint في hooks.js)، وأنماط @media print
   في index.css تُخفي كل ما سواه. «حفظ PDF» هو خيار الحفظ في نافذة الطباعة
   نفسها، فلا مكتبة PDF.

   لماذا لحظة الطباعة فقط: خطة ختمٍ كاملة بثلاثة أسطر يومياً تبلغ آلاف
   الصفوف، ورسمها مخفيةً طوال الوقت يثقل الصفحة بلا فائدة.
   ══════════════════════════════════════════════════════════════════ */

export function PrintPortal({ active, landscape = false, children }) {
  /* active لا يصير true إلا بنقرة في المتصفح، فلا يُلمس document في التوليد المسبق */
  if (!active || typeof document === 'undefined') return null
  return createPortal(
    <div className={'print-root' + (landscape ? ' print-landscape' : '')} dir="rtl">{children}</div>,
    document.body,
  )
}

/* السطر الثابت في تذييل الجدول: <tfoot> يتكرر أسفل كل صفحة مطبوعة.
   (position: fixed كان يطبع السطر فوق رأس الجدول في الصفحة الثانية.) */
export function PrintFoot({ cols }) {
  return (
    <tfoot>
      <tr>
        <td colSpan={cols} className="print-credit">
          <span className="print-credit-pill">
            {TOOL_CREDIT_LEAD}{' '}
            {/* رابط حقيقي: يبقى قابلاً للنقر في ملف PDF المحفوظ من نافذة الطباعة */}
            <a href={TOOL_CREDIT_URL} className="print-credit-link">{TOOL_CREDIT_LINK}</a>
          </span>
        </td>
      </tr>
    </tfoot>
  )
}

/* ورقة الخطة: ترويسة صغيرة، ثم الملخص، ثم الجدول (وفي تذييله السطر الثابت). */
export function PlanSheet({ title, subtitle, name, facts = [], children }) {
  return (
    <div className="print-sheet">
      <header className="print-head">
        <div>
          <div className="print-title">{title}</div>
          {subtitle && <div className="print-sub">{subtitle}</div>}
        </div>
        {name && <div className="print-name">{name}</div>}
      </header>
      {facts.length > 0 && (
        <div className="print-facts">
          {facts.map((f) => (
            <div key={f.label}><b>{f.value}</b><span>{f.label}</span></div>
          ))}
        </div>
      )}
      {children}
    </div>
  )
}
