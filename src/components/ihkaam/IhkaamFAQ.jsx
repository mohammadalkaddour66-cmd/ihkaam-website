import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  /* ── إدارية وتشغيلية ── */
 
  /* ── مالية وتحقق ── */
  {
    id: 3,
    q : 'ما هي وسائل الدفع المعتمدة، وكيف يتم تفعيل حسابي？',
    a : 'الدفع تحويل يدوي عبر المحافظ الإلكترونية المعتمدة (مثل Sham Cash وما في حكمها). بعد التحويل ترسلون الإيصال على واتساب، فنتأكد منه ونجهّز لوحة التحكم الخاصة بمعهدكم خلال 24 ساعة.',
  },
  {
    id: 4,
    q : 'ماذا يحدث لبياناتنا ولوحة التحكم إذا تأخرنا عن تجديد الاشتراك؟',
    a : ' يتم تعليق الوصول مؤقتاً، مع ضمان حفظ بياناتكم بالكامل على الخوادم وعدم حذفها لتستطيعوا استئناف العمل فور السداد.'
  },
  /* ── تقنية وأمنية ── */
  {
    id: 5,
    q : 'من يملك البيانات المدخلة للطلاب والمعلمين، وهل يمكن لإدارة إحكام الاطلاع عليها؟',
    a : 'البيانات التشغيلية كاملة (بيانات طلاب، معلمين، تقييمات، حلقات) هي ملكٌ حصري ومطلق للمؤسسة القرآنية. تعمل منصة إحكام كـ "معالج بالنيابة" فقط، ولا تملك إدارة المنصة صلاحية الدخول لقاعدتكم أو الاطلاع عليها إلا في حالات الضرورة التقنية القصوى .',
  },
  {
    id: 6,
    q : 'ما هي الضمانات التقنية لحماية كلمات المرور وبيانات المعهد من الاختراق؟',
    a : 'تُخزن البيانات على خوادم سحابية وتنتقل عبر اتصال مشفّر HTTPS/TLS، وتُفصل بيانات كل معهد عن غيره بقواعد صلاحيات على مستوى قاعدة البيانات. وننصح كل مشرف بتغيير كلمة المرور الأولية عند أول دخول، وألّا يشاركها مع أحد.',
  },
  /* ── التجربة والإضافات (ISS-48 / ISS-46) ── */
  {
    id: 7,
    q : 'هل يمكن أن نجرّب النظام قبل الاشتراك؟',
    a : 'نعم، التجربة مجانية. اطلبوها عبر واتساب، ونجهّز لمعهدكم حساباً تجريبياً تعملون عليه قبل أن تقرروا.',
  },
  {
    id: 8,
    q : 'ما الإضافات المدفوعة، وما الذي يأتي مع النسخة الأساسية؟',
    a : 'الإضافات المدفوعة ثلاث: الإدارة المالية، والمواد الرديفة، ونجم الحلقة، وتختارون منها ما تحتاجونه في حاسبة الاشتراك. أما المكتبة الصوتية وطابور الاختبارات وملاحظات أولياء الأمور فتأتي مع النسخة الأساسية دون رسوم إضافية.',
  },
]

/* items / eyebrow / title: الرئيسية تعيد استعمال الأكورديون نفسه بأسئلتها هي
   (HomeFAQSection) — ومعه وسوم data-faq-* التي يبني منها entry-server FAQPage. */
export default function IhkaamFAQ({
  items   = FAQS,
  eyebrow = 'شائعاً',
  title   = 'أسئلة يسألها كل مدير قبل أن يبدأ',
}) {
  const [openId, setOpenId] = useState(null)

  function toggle(id) {
    setOpenId(prev => (prev === id ? null : id))
  }

  return (
    <section className="relative z-10 py-24 px-6">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[240px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(26,148,155,0.05) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-2xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-12">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
            style={{ color: '#A6756A' }}
          >
            {eyebrow}
          </span>
          <h2
            className="font-black leading-tight"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.4rem, 2.8vw, 2rem)' }}
          >
            {title}
          </h2>
        </div>

        {/* Accordion list */}
        <div className="flex flex-col gap-3">
          {items.map(faq => {
            const isOpen = openId === faq.id
            return (
              <div
                key={faq.id}
                data-faq-q={faq.q}
                data-faq-a={faq.a}
                className="rounded-[18px] overflow-hidden"
                style={{
                  background  : '#09201E',
                  border      : `1px solid ${isOpen ? 'rgba(72,214,205,0.28)' : 'rgba(229,211,179,0.09)'}`,
                  transition  : 'border-color 240ms ease',
                }}
              >
                {/* Question row */}
                <button
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${faq.id}`}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start cursor-pointer"
                >
                  <span
                    className="font-bold text-sm leading-snug"
                    style={{ color: isOpen ? '#EAE4DF' : '#B0CBC6' }}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    strokeWidth={2.2}
                    className="flex-shrink-0"
                    style={{
                      color    : '#48D6CD',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 280ms ease',
                    }}
                  />
                </button>

                {/* Answer — الجواب في الصفحة دائماً، مطويّاً بالـCSS لا محذوفاً:
                   نصّ FAQPage في البيانات المنظَّمة يجب أن يطابق نصاً موجوداً
                   في HTML المصيَّر (ISS-07)، والطيّ بـgrid-template-rows يُبقي
                   حركة الفتح نفسها دون أن يُزال الجواب من DOM. */}
                <div
                  id={`faq-a-${faq.id}`}
                  aria-hidden={!isOpen}
                  style={{
                    display         : 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    opacity         : isOpen ? 1 : 0,
                    transition      : 'grid-template-rows 280ms cubic-bezier(0.22,1,0.36,1), opacity 280ms ease',
                  }}
                >
                  <div style={{ overflow: 'hidden', minHeight: 0 }}>
                    <div
                      className="mx-6 mb-5"
                      style={{
                        borderTop : '1px solid rgba(72,214,205,0.12)',
                        paddingTop: '1rem',
                      }}
                    >
                      <p className="text-sm" style={{ color: '#96BCBE', lineHeight: '1.95' }}>
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom contact note */}
        <p className="text-center mt-10 text-sm" style={{ color: '#3C555F' }}>
         
          <a
            href="https://wa.me/963947409106"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold transition-colors duration-200"
            style={{ color: '#48D6CD' }}
            onMouseEnter={e => e.currentTarget.style.color = '#A3D9D3'}
            onMouseLeave={e => e.currentTarget.style.color = '#48D6CD'}
          >
            تواصل معنا مباشرة عبر الواتساب
          </a>
        </p>

      </div>
    </section>
  )
}
