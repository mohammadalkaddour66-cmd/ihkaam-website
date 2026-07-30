import profileImg from '../assets/profile.png.jpg'

export default function AboutSection() {
  return (
    <section id="about" className="relative z-10 py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/*
          RTL bento grid: first child → RIGHT, second → LEFT.
          [1fr_340px]: story text gets more space, photo is portrait frame.
          items-stretch: both boxes grow to equal height.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-stretch">

          {/* RIGHT: story text bento */}
          <div className="bento p-8 lg:p-10 flex flex-col text-start">

            <span
              className="text-xs font-semibold tracking-[0.22em] uppercase block mb-5"
              style={{ color: '#A6756A' }}
            >
              من أنا
            </span>

            <h2
              className="text-rose-grad font-black leading-snug mb-10"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
            >
              قصتي مع الفوضى والنظام.
            </h2>

            <div className="flex flex-col gap-7 text-start flex-1" style={{ color: '#96BCBE' }}>

              <p style={{ lineHeight: '2.1', fontSize: '0.95rem' }}>
                خلال دراستي للهندسة المدنية في جامعة حلب، وعملي الميداني لسنوات كمدرس
                للقرآن الكريم ومسؤول تقني وإعلامي في المدارس الخاصة، كنت شاهداً يومياً
                على استنزاف طاقات الكوادر. جداول ورقية متناثرة، عمليات إدخال بيانات
                يدوية مكررة، وتخبط إداري يسرق وقت المؤسسة بدلاً من التركيز على رسالتها
                وأهدافها.
              </p>

              <p style={{ lineHeight: '2.1', fontSize: '0.95rem' }}>
                أدركت حينها أن المشكلة ليست في الكوادر، بل في غياب{' '}
                <span style={{ color: '#D9ACA3', fontWeight: 700 }}>"الأنظمة"</span>.
                هنا قررت توجيه مهاراتي، لأبتكر أنظمة
                تقضي على هذه الفوضى، تمنح المؤسسات مكانتها الحقيقية{' '}
                <span style={{ color: '#D9ACA3', fontWeight: 700 }}>
                  (وكان نظام "إحكام" أول ثمارها)
                </span>.
              </p>

              <p style={{ lineHeight: '2.1', fontSize: '0.95rem' }}>
                اليوم، أتفرغ لتقديم حلول برمجية، تحرر المؤسسات
                التجارية والتعليمية من قيود العمل اليدوي، وتصميم هويات بصرية فاخرة
                تعكس قيمتها الحقيقية. كما أشارك هذه التجارب عبر صناعة المحتوى التقني
                لمساعدة الآخرين على اختصار الطريق.
              </p>

            </div>
          </div>

          {/* LEFT: photo bento — clean frame, image fills it */}
          <div
            className="bento relative overflow-hidden"
            style={{ minHeight: '440px' }}
          >
            <img
              src={profileImg}
              alt="محمد القدّور"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            {/* Subtle bottom fade to tie photo into the dark canvas */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(2,15,14,0.80) 0%, rgba(2,15,14,0.08) 55%, transparent 100%)',
              }}
              aria-hidden
            />
          </div>

        </div>

        <div className="divider mt-16" />

      </div>
    </section>
  )
}
