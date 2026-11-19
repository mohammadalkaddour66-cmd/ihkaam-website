/* فقرة شرحٍ قصيرة أسفل الصفحات التي يغلب عليها النموذج (تواصل، تقييم، طلب)،
   حتى يفهم الزائر ما يحدث بعد الإرسال وماذا يكتب. الألوان من اللوحة الحالية. */
export default function PageNotes({ title, items }) {
  return (
    <section dir="rtl" className="px-6 pb-20">
      <div className="max-w-3xl mx-auto rounded-2xl p-6 sm:p-8"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="font-black text-xl mb-5" style={{ color: '#EAE4DF' }}>{title}</h2>
        <div className="space-y-4">
          {items.map(it => (
            <div key={it.q}>
              <h3 className="font-bold text-base mb-1.5" style={{ color: '#EAE4DF' }}>{it.q}</h3>
              <p className="text-sm leading-loose" style={{ color: 'rgba(234,228,223,0.72)' }}>{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
