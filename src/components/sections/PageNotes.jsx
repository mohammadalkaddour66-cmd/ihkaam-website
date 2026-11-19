/* فقرة شرحٍ قصيرة أسفل الصفحات التي يغلب عليها النموذج (تواصل، تقييم، طلب)،
   حتى يفهم الزائر ما يحدث بعد الإرسال وماذا يكتب. الألوان من اللوحة الحالية. */
export default function PageNotes({ title, items }) {
  return (
    <section dir="rtl" className="px-6 pb-20">
      <div className="max-w-3xl mx-auto rounded-2xl p-6 sm:p-8"
        style={{ background: 'rgba(11, 59, 51, 0.03)', border: '1px solid rgba(11, 59, 51, 0.07)' }}>
        <h2 className="font-black text-xl mb-5" style={{ color: '#1A2E28' }}>{title}</h2>
        <div className="space-y-4">
          {items.map(it => (
            <div key={it.q}>
              <h3 className="font-bold text-base mb-1.5" style={{ color: '#1A2E28' }}>{it.q}</h3>
              <p className="text-sm leading-loose" style={{ color: 'rgba(26, 46, 40, 0.72)' }}>{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
