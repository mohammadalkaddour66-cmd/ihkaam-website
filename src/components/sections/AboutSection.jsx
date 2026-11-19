/* ISS-44: الصفحة تتكلم بلسان «فريق منصة إحكام». لا اسم شخص ولا صورة ولا
   سيرة ولا كيان قانوني (قرار المالك)، والبريد يبقى كما هو. */
const WHATSAPP_URL = 'https://wa.me/963947409106'
const EMAIL        = 'ihkaamapp@gmail.com'

export default function AboutSection() {
  return (
    <section id="about" className="relative z-10 py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/*
          RTL bento grid: first child → RIGHT, second → LEFT.
          [1fr_340px]: story text gets more space, contact card beside it.
          items-stretch: both boxes grow to equal height.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-stretch">

          {/* RIGHT: story text bento */}
          <div className="bento p-8 lg:p-10 flex flex-col text-start">

            <span
              className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
              style={{ color: '#7A5A2E' }}
            >
              من نحن
            </span>

            <h1
              className="text-rose-grad font-black leading-snug mb-10"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
            >
              فريق منصة إحكام
            </h1>

            <div className="flex flex-col gap-7 text-start flex-1" style={{ color: '#4A5D56' }}>

              <p style={{ lineHeight: '2.1', fontSize: '0.95rem' }}>
                بدأت إحكام من داخل حلقات التحفيظ. كان المعلم يكتب درجات التسميع
                على ورقة، ثم ينقلها إلى دفتر، وفي آخر الشهر يسأله المدير عن طالب
                فلا يجد الورقة. المشكلة لم تكن في المعلمين، كان ينقصهم{' '}
                <span style={{ color: '#8A6425', fontWeight: 700 }}>نظام</span>{' '}
                يحفظ ما يكتبونه.
              </p>

              <p style={{ lineHeight: '2.1', fontSize: '0.95rem' }}>
                فبنينا إحكام: سجل واحد للمعهد فيه الطلاب والحلقات والتسميع والحضور
                والاختبارات، ويبقى في مكانه إذا تغيّر المعلم أو المشرف. يعمل من
                المتصفح على أي جهاز، ولا يحتاج تثبيت شيء.
              </p>

              <p style={{ lineHeight: '2.1', fontSize: '0.95rem' }}>
                نتعامل مع كل معهد مباشرة. نستقبل طلبك، ونجهّز حساب المعهد بأنفسنا،
                ونبقى معك على واتساب بعد التشغيل لأي سؤال أو تعديل.
              </p>

            </div>
          </div>

          {/* LEFT: contact bento — مكان الصورة سابقاً */}
          <div className="bento p-8 flex flex-col justify-center gap-6 text-start">
            <span
              className="text-xs font-semibold tracking-[0.22em] uppercase block"
              style={{ color: '#7A5A2E' }}
            >
              تواصل معنا
            </span>

            <div className="flex flex-col gap-2">
              <span className="text-sm" style={{ color: '#4A5D56' }}>واتساب</span>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="font-bold text-start"
                style={{ color: '#8A6425' }}
              >
                +963 947 409 106
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm" style={{ color: '#4A5D56' }}>البريد</span>
              <a
                href={`mailto:${EMAIL}`}
                dir="ltr"
                className="font-bold text-start break-all"
                style={{ color: '#8A6425' }}
              >
                {EMAIL}
              </a>
            </div>
          </div>

        </div>

        <div className="divider mt-16" />

      </div>
    </section>
  )
}
