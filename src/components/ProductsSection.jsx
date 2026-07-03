import { Check, X, BookOpen, ArrowLeft, BarChart2, Calculator, Ticket, FileSpreadsheet, Users } from 'lucide-react'

/*
  ProductsSection — نظام "إحكام" السحابي.
  Copywriting: coffee-shop tone + Bold Disqualification.
  Pricing: annual billing only (4 tiers).
  DB note: inserts directly into custom Supabase tables —
  NO Supabase Auth user creation.
*/

/* ── System features — 5 items ── */
const features = [
  {
    icon: BarChart2,
    title: 'لوحة التحكم اللحظية',
    body: 'إحصائيات حية للطلاب والانضباط.',
  },
  {
    icon: Calculator,
    title: 'المحاسب الرقمي',
    body: 'أتمتة القيود والأقساط المتأخرة.',
  },
  {
    icon: Ticket,
    title: 'طابور الاختبارات',
    body: 'تذاكر رقمية تنهي فوضى التسميع.',
  },
  {
    icon: FileSpreadsheet,
    title: 'المحصلات الذكية',
    body: 'ملخصات وتقارير ديناميكية بضغطة زر.',
  },
  {
    icon: Users,
    title: 'بوابة أولياء الأمور',
    body: 'متابعة لحظية لسلوك وإنجاز الطالب.',
  },
]

/* ── Pricing plans — annual billing only ── */
const plans = [
  {
    name: 'الباقة التأسيسية',
    capacity: 'حتى 200 طالب',
    monthly: '10',
    annual: '120',
    highlight: false,
  },
  {
    name: 'باقة النمو',
    capacity: '200 – 500 طالب',
    monthly: '16.6',
    annual: '200',
    highlight: true,
    badge: 'الأكثر اختياراً',
  },
  {
    name: 'الباقة المتقدمة',
    capacity: '500 – 800 طالب',
    monthly: '25',
    annual: '300',
    highlight: false,
  },
  {
    name: 'باقة المجمعات',
    capacity: '+800 طالب',
    monthly: '37.5',
    annual: '450',
    highlight: false,
  },
]

/* ── Bold Disqualification ── */
const notFor = [
  'المؤسسات التي تبحث عن مسكنات ورقية مؤقتة',
  'من يرى الإدارة عبئاً ثانوياً لا يستحق الاستثمار',
  'من يريد رقعة لأزمة اليوم لا نظاماً للمستقبل',
]
const isFor = [
  'المعاهد الكبرى الساعية لإنهاء الفوضى الإدارية نهائياً',
  'من يريد حماية بيانات مؤسسته سحابياً بأعلى معايير الأمان',
  'من يؤمن ببناء جسر شفافية حقيقي مع أولياء الأمور',
]

export default function ProductsSection() {
  return (
    <section id="products" className="relative z-10 py-28">

      {/* Rose glow — top left */}
      <div
        className="pointer-events-none absolute top-0 left-0 w-[600px] h-[600px]"
        style={{
          background: 'radial-gradient(circle at top left, rgba(166,117,106,0.07) 0%, transparent 65%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* ── Section header ── */}
        <div className="mb-16 text-center">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-4"
            style={{ color: '#A6756A' }}
          >
            منتجاتي الرقمية
          </span>
          <h2
            className="font-black leading-tight mb-5"
            style={{ color: '#F0E8E5', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            نظام إحكام السحابي..
            <br />
            <span className="text-rose-grad">الإدارة المؤتمتة للمعاهد القرآنية</span>
          </h2>
          <p
            className="max-w-2xl mx-auto leading-[1.95] text-sm"
            style={{ color: '#7A9E96' }}
          >
            لم يُصمَّم "إحكام" للمؤسسات التي تبحث عن مسكنات ورقية مؤقتة، بل صُنع خصيصاً
            للمعاهد الكبرى التي تسعى لإنهاء الفوضى الإدارية، حماية بياناتها سحابياً،
            وبناء جسر من الشفافية مع أولياء الأمور.
          </p>
        </div>

        {/* ── Main product card ── */}
        <div
          className="rounded-[2rem] overflow-hidden mb-8"
          style={{
            background: 'rgba(2,89,81,0.28)',
            border: '1px solid rgba(2,115,104,0.22)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="p-8 md:p-12">

            {/* Product identity row */}
            <div className="flex items-center gap-3 mb-10 flex-wrap">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#D9ACA3', color: '#012626' }}
              >
                <BookOpen size={18} />
              </div>
              <div>
                <span className="font-black text-xl" style={{ color: '#F0E8E5' }}>إحكام</span>
                <span className="text-xs block" style={{ color: '#7A9E96' }}>
                  نظام إدارة المعاهد القرآنية السحابي
                </span>
              </div>
              <span
                className="me-auto text-[10px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{
                  background: 'rgba(217,172,163,0.12)',
                  color: '#D9ACA3',
                  border: '1px solid rgba(217,172,163,0.22)',
                }}
              >
                ● متاح الآن
              </span>
            </div>

            {/* ── Coffee-shop explanation + stats ── */}
            <div className="grid md:grid-cols-2 gap-12 mb-10">
              <div className="text-start">
                <h3
                  className="font-black leading-snug mb-5"
                  style={{ color: '#F0E8E5', fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)' }}
                >
                  ما هو إحكام؟
                  <br />
                  <span className="text-rose-grad">دقيقة واحدة تكفي</span>
                </h3>
                <p className="text-sm leading-[2] mb-3" style={{ color: '#8FA89E' }}>
                  تخيّل أنك جالس في مقهى وزميلك مدير معهد يسألك:{' '}
                  <em style={{ color: '#D9ACA3' }}>"ما هو إحكام بكلمتين؟"</em>
                </p>
                <p className="text-sm leading-[2] mb-3" style={{ color: '#8FA89E' }}>
                  الجواب:{' '}
                  <strong style={{ color: '#F0E8E5' }}>
                    المدير الإداري الذي لا يتعب ولا ينسى.
                  </strong>
                </p>
                <p className="text-sm leading-[2]" style={{ color: '#8FA89E' }}>
                  بدل ما يضيع وقت كادرك في الأوراق والجداول — إحكام يتولى الحضور،
                  المحاسبة، جدولة الاختبارات، والتقارير، كلها تلقائياً، بينما يركّز
                  فريقك على ما يهم:{' '}
                  <strong style={{ color: '#D9ACA3' }}>التعليم والأثر.</strong>
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 content-start">
                {[
                  { v: '+1,800', l: 'طالب' },
                  { v: '108',    l: 'حلقة مؤتمتة' },
                  { v: '6',      l: 'مؤسسات' },
                ].map(({ v, l }) => (
                  <div
                    key={l}
                    className="rounded-2xl p-2.5 sm:p-4 text-center transition-all duration-500 ease-out cursor-default"
                    style={{
                      background: 'rgba(1,38,38,0.55)',
                      border: '1px solid rgba(2,115,104,0.18)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(2,115,104,0.45)'
                      e.currentTarget.style.transform   = 'translateY(-3px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(2,115,104,0.18)'
                      e.currentTarget.style.transform   = 'translateY(0)'
                    }}
                  >
                    <div className="text-rose-grad text-base sm:text-xl font-black">{v}</div>
                    <div className="text-[9px] sm:text-[10px] mt-0.5" style={{ color: '#7A9E96' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider mb-10" />

            {/* ── Features list ── */}
            <div className="mb-10">
              <p
                className="text-xs font-semibold tracking-[0.18em] uppercase mb-6 text-start"
                style={{ color: '#A6756A' }}
              >
                ما الذي يفعله إحكام؟
              </p>
              {/* 5 features: 3 top row + 2 bottom row centered on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {features.slice(0, 3).map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="rounded-2xl p-5 text-start transition-all duration-500 ease-out"
                    style={{
                      background: 'rgba(1,38,38,0.45)',
                      border: '1px solid rgba(2,115,104,0.15)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(217,172,163,0.30)'
                      e.currentTarget.style.transform   = 'translateY(-3px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(2,115,104,0.15)'
                      e.currentTarget.style.transform   = 'translateY(0)'
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 me-auto"
                      style={{ background: 'rgba(217,172,163,0.12)', color: '#D9ACA3' }}
                    >
                      <Icon size={15} />
                    </div>
                    <p className="text-xs font-bold mb-1" style={{ color: '#F0E8E5' }}>{title}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: '#7A9E96' }}>{body}</p>
                  </div>
                ))}
              </div>
              {/* Bottom 2 — centered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-2/3 lg:mx-auto">
                {features.slice(3).map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="rounded-2xl p-5 text-start transition-all duration-500 ease-out"
                    style={{
                      background: 'rgba(1,38,38,0.45)',
                      border: '1px solid rgba(2,115,104,0.15)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(217,172,163,0.30)'
                      e.currentTarget.style.transform   = 'translateY(-3px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(2,115,104,0.15)'
                      e.currentTarget.style.transform   = 'translateY(0)'
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 me-auto"
                      style={{ background: 'rgba(217,172,163,0.12)', color: '#D9ACA3' }}
                    >
                      <Icon size={15} />
                    </div>
                    <p className="text-xs font-bold mb-1" style={{ color: '#F0E8E5' }}>{title}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: '#7A9E96' }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider mb-10" />

            {/* ── Bold Disqualification ── */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div
                className="rounded-2xl p-6 text-start"
                style={{
                  background: 'rgba(1,38,38,0.55)',
                  border: '1px solid rgba(166,117,106,0.15)',
                }}
              >
                <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#A6756A' }}>
                  ⊘ إحكام ليس لك إذا…
                </p>
                <ul className="space-y-3">
                  {notFor.map(t => (
                    <li key={t} className="flex items-start gap-2.5 text-xs" style={{ color: '#6A8A82' }}>
                      <X size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#7A2535' }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-2xl p-6 text-start"
                style={{
                  background: 'rgba(2,89,81,0.30)',
                  border: '1px solid rgba(2,115,104,0.25)',
                }}
              >
                <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#D9ACA3' }}>
                  ✓ إحكام لك إذا…
                </p>
                <ul className="space-y-3">
                  {isFor.map(t => (
                    <li key={t} className="flex items-start gap-2.5 text-xs" style={{ color: '#8FA89E' }}>
                      <Check size={13} className="flex-shrink-0 mt-0.5" strokeWidth={3} style={{ color: '#D9ACA3' }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="divider mb-10" />

            {/* ── Pricing ── */}
            <div>

              {/* Free setup note */}
              <div
                className="flex items-center justify-center gap-2 mb-7 py-2.5 px-5 rounded-full w-fit mx-auto"
                style={{
                  background: 'rgba(217,172,163,0.08)',
                  border: '1px solid rgba(217,172,163,0.20)',
                }}
              >
                <span className="text-xs font-semibold" style={{ color: '#D9ACA3' }}>
                  ✦ رسوم التأسيس والسيرفرات: 0$ (مجاناً)
                </span>
              </div>

              {/* 4-column plan grid — 2 cols on mobile, 4 on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {plans.map(p => (
                  <div
                    key={p.name}
                    className="rounded-2xl p-5 flex flex-col text-start transition-all duration-500 ease-out cursor-default"
                    style={
                      p.highlight
                        ? {
                            background: 'rgba(217,172,163,0.10)',
                            border: '2px solid rgba(217,172,163,0.40)',
                            boxShadow: '0 0 28px rgba(217,172,163,0.08)',
                          }
                        : {
                            background: 'rgba(1,38,38,0.55)',
                            border: '1px solid rgba(2,115,104,0.18)',
                          }
                    }
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    {/* Badge */}
                    {p.badge && (
                      <span
                        className="text-[9px] font-bold tracking-wider block mb-2"
                        style={{ color: '#D9ACA3' }}
                      >
                        ✦ {p.badge}
                      </span>
                    )}

                    {/* Plan name */}
                    <p className="font-bold text-sm mb-1" style={{ color: '#F0E8E5' }}>{p.name}</p>

                    {/* Capacity */}
                    <p className="text-[11px] mb-4" style={{ color: '#7A9E96' }}>{p.capacity}</p>

                    {/* Price block */}
                    <div className="flex-1">
                      <div className="flex items-end gap-1 mb-1">
                        <span
                          className="text-3xl font-black"
                          style={{ color: p.highlight ? '#D9ACA3' : '#F0E8E5' }}
                        >
                          {p.monthly}$
                        </span>
                        <span className="text-[10px] mb-1.5" style={{ color: '#7A9E96' }}>/شهر</span>
                      </div>
                      {/* Annual total */}
                      <p className="text-[11px]" style={{ color: '#5A8A78' }}>
                        يُدفع سنوياً{' '}
                        <span style={{ color: p.highlight ? '#D9ACA3' : '#8FA89E', fontWeight: 600 }}>
                          {p.annual}$
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advanced services note */}
              <p
                className="text-xs text-center leading-relaxed mb-8"
                style={{ color: '#5A8A78' }}
              >
                الخدمات المتقدمة المخصصة (مثل المحاسب الذكي ونجم الأسبوع) متاحة برسوم إعداد
                تُدفع لمرة واحدة — اطلب تفاصيلها في استشارتك.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#contact"
                  className="btn-cta flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl"
                  style={{ boxShadow: '0 4px 22px rgba(217,172,163,0.20)' }}
                >
                  احجز تجربة مجانية لمدة 14 يوماً
                  <ArrowLeft size={15} />
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* More products teaser */}
        <div
          className="text-center rounded-2xl py-9 px-6"
          style={{ border: '1px dashed rgba(166,117,106,0.18)' }}
        >
          <p className="text-sm" style={{ color: '#5A8A78' }}>
            منتجات أخرى قيد البناء — ترقّبوا الإطلاق قريباً ✦
          </p>
        </div>

      </div>
    </section>
  )
}
