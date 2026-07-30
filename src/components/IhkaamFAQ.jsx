import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  /* ── إدارية وتشغيلية ── */
 
  /* ── مالية وتحقق ── */
  {
    id: 3,
    q : 'ما هي وسائل الدفع المعتمدة، وكيف يتم تفعيل حسابي？',
    a : 'نعتمد آلية السداد اليدوي المريح عبر المحافظ الإلكترونية المعتمدة (مثل Sham Cash وما في حكمها). بعد تحويل المبلغ، يتم إرسال الإيصال رقمياً ليقوم الفريق  بتأكيد العملية وتفعيل لوحة التحكم الخاصة بمعهدكم بشكل فوري ومباشر.',
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
    a : 'تُخزن جميع البيانات على بنية تحتية سحابية عالمية مشفرة (خوادم Supabase) باستخدام بروتوكولات نقل آمنة HTTPS/TLS. علاوة على ذلك، يتم تشفير كافة كلمات المرور رياضياً عبر خوارزميات أحادية الاتجاه غير قابلة للعكس (SHA-256)؛ مما يعني أنه لا يمكن لأي شخص —بمن فيهم مسؤولو المنصة— معرفة كلمة المرور الخاصة بكم أو كشفها.',
  },
]

export default function IhkaamFAQ() {
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
            شائعاً
          </span>
          <h2
            className="font-black leading-tight"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.4rem, 2.8vw, 2rem)' }}
          >
            أسئلة يسألها كل مدير قبل أن يبدأ
          </h2>
        </div>

        {/* Accordion list */}
        <div className="flex flex-col gap-3">
          {FAQS.map(faq => {
            const isOpen = openId === faq.id
            return (
              <div
                key={faq.id}
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

                {/* Answer — animated expand/collapse */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
