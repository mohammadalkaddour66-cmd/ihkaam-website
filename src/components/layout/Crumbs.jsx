import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ArrowRight } from 'lucide-react'

/* مسار التنقل. على الشاشات العريضة: المسار الكامل بفواصل. على الهاتف يلتفّ المسار
   الطويل على أسطر متباعدة فتبدو كلماته طالعةً ونازلة، فيُستبدل برابط رجوع واحد
   إلى أقرب صفحة أعلى منها. العناصر: [{ to?, label }] والأخير هو الصفحة الحالية. */
export default function Crumbs({ items, className = 'mb-6', size = 'text-[12.5px]' }) {
  const back = [...items].reverse().find((i) => i.to)
  return (
    <>
      <nav className={`hidden sm:flex items-center gap-1.5 flex-wrap ${size} text-[#5E6E67] ${className}`} aria-label="مسار التنقل">
        {items.map((it, i) => (
          <Fragment key={i}>
            {i > 0 && <ChevronLeft size={12} className="shrink-0" />}
            {it.to
              ? <Link to={it.to} className="hover:text-[#1A2E28]">{it.label}</Link>
              : <span className={i === items.length - 1 ? 'text-[#1A2E28] font-bold' : ''}>{it.label}</span>}
          </Fragment>
        ))}
      </nav>
      {back && (
        <Link to={back.to} className="sm:hidden inline-flex items-center gap-2 mb-5 rounded-full ps-3 pe-4 min-h-[42px] text-[14px] font-bold text-[#1A2E28]"
          style={{ background: '#FDFBF7', boxShadow: 'inset 0 0 0 1px var(--line-warm)' }}>
          <ArrowRight size={16} color="#8A6425" className="shrink-0" /> {back.label}
        </Link>
      )}
    </>
  )
}
