import { motion } from 'framer-motion'
import { ScrollText } from 'lucide-react'

const fadeUp = {
  hidden : { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1] } },
}

export default function TermsPage() {
  return (
    <div
      className="relative min-h-screen"
      dir="rtl"
      style={{ background: '#010D0D' }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(2,115,104,0.07) 0%, transparent 70%)', zIndex: 0 }}
        aria-hidden
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">

        {/* ── Page header ── */}
        <motion.div
          className="mb-14"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-7"
            style={{
              background: 'rgba(2,115,104,0.15)',
              border    : '1px solid rgba(106,189,178,0.22)',
            }}
          >
            <ScrollText size={26} style={{ color: '#6ABDB2' }} strokeWidth={1.5} />
          </div>

          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-4"
            style={{ color: '#A6756A' }}
          >
            الوثائق القانونية
          </span>

          <h1
            className="font-black leading-tight mb-5"
            style={{ color: '#EAE4DF', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
          >
            شروط الاستخدام
          </h1>

          <p
            className="text-sm leading-relaxed"
            style={{ color: '#5A8A7E', maxWidth: '520px' }}
          >
            يُرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا. باستخدامك للمنصة فأنت توافق على الالتزام بهذه الشروط.
          </p>

          <div
            className="mt-10"
            style={{ height: 1, background: 'linear-gradient(90deg, rgba(106,189,178,0.25) 0%, transparent 60%)' }}
          />
        </motion.div>

        {/* ── Content area ── */}
        <motion.article
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{ transitionDelay: '0.12s' }}
        >
          <div
            className="rounded-[20px] p-8 md:p-12"
            style={{
              background: 'rgba(1,26,26,0.55)',
              border    : '1px solid rgba(229,211,179,0.08)',
              fontSize  : '0.93rem',
            }}
          >

            {/* مقدمة */}
            <h2 className="text-xl font-bold text-emerald-400 mt-2 mb-4">مقدمة</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              بدخولك إلى منصة إحكام أو استخدامها، فإنك تقرّ بقراءة هذه الشروط والأحكام وفهمها والموافقة الكاملة عليها. تُمثّل هذه الوثيقة عقدًا قانونيًا مُلزمًا بينك بوصفك "المؤسسة المستفيدة" وبين فريق تطوير منصة إحكام بوصفها "مزوّد الخدمة".
            </p>

            {/* 1 */}
            <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4">1. تعريف المنصة وطبيعة الخدمة</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              منصة إحكام هي حلٌّ برمجي سحابي يُقدَّم وفق نموذج "البرمجيات كخدمة" (SaaS)، مُصمَّمٌ خصيصًا لتمكين المؤسسات القرآنية من إدارة عملياتها التشغيلية بصورة كاملة ومتكاملة، وتشمل الخدمة: إدارة الطلاب، جداول الحلقات، التقييمات، والخدمات الإضافية الاختيارية.
            </p>
            <p className="mb-4 leading-relaxed text-slate-300">
              تتولى المنصة إدارة كافة التفاصيل التقنية من بنية تحتية وقواعد بيانات وأمان وتحديثات مستمرة، مما يُعفي المؤسسة من أي عبء تقني.
            </p>

            {/* 2 */}
            <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4">2. نموذج الاشتراك والتسعير</h2>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">2.1 هيكل الاشتراك</h3>
            <p className="mb-3 leading-relaxed text-slate-300">
              تعتمد منصة إحكام نموذج تسعير قائمًا على حصة الطلاب (Student Quota)، ويُتاح الاشتراك بخيارَين:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 pr-4 mb-4">
              <li>اشتراك شهري يُجدَّد كل شهر ميلادي</li>
              <li>اشتراك سنوي يُجدَّد كل اثني عشر شهرًا ميلاديًا</li>
            </ul>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">2.2 الخدمات الإضافية (Add-ons)</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              تُقدِّم المنصة مجموعةً من الميزات الاختيارية المدفوعة، تشمل على سبيل المثال لا الحصر: الإدارة المالية، الطابور الذكي، وغيرها. تُحتسب هذه الخدمات ضمن قيمة الاشتراك الشهري أو السنوي المختار، ولا تُباع بأي شكل من أشكال الدفع الفردي أو الدائم.
            </p>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">2.3 الحد الأقصى للطلاب</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              ترتبط الباقة المختارة بسقف محدد من الطلاب النشطين. في حال رغبت المؤسسة في تجاوز هذا السقف، يتعيّن عليها الترقية إلى الباقة الملائمة قبل إضافة طلاب جدد.
            </p>

            {/* 3 */}
            <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4">3. آلية الدفع</h2>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">3.1 طريقة السداد المعتمدة</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              لا تُعالِج منصة إحكام أي معاملات مالية إلكترونية مباشرة. يتم السداد عبر التحويل اليدوي إلى المحافظ الإلكترونية المعتمدة (مثل Sham Cash وما في حكمها وفق ما يُعلَن رسميًا على المنصة).
            </p>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">3.2 إجراء التفعيل</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              بعد إتمام التحويل، تُرسِل المؤسسة إيصال الدفع إلى فريق الدعم. يقوم المشرف العام (Super Admin) بالتحقق من الإيصال يدويًا ثم تفعيل لوحة التحكم أو تجديدها. لا يُعدُّ الاشتراك نافذًا إلا بعد تأكيد التفعيل من الفريق.
            </p>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">3.3 المسؤولية عن التحويل</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              تتحمل المؤسسة كامل المسؤولية عن صحة بيانات التحويل ودقتها. لا تتحمل منصة إحكام أي مسؤولية عن تأخر التفعيل الناجم عن خطأ في بيانات التحويل أو تأخر إرسال إيصال الدفع.
            </p>

            {/* 4 */}
            <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4">4. التزويد وإنشاء الحساب (Zero-Touch Provisioning)</h2>
            <p className="mb-3 leading-relaxed text-slate-300">
              عند الموافقة على طلب الاشتراك وإتمام الدفع، تقوم المنصة تلقائيًا بتوليد:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 pr-4 mb-4">
              <li>معرّف المؤسسة (Institute ID) وهو معرّف فريد ودائم</li>
              <li>رابط لوحة التحكم الخاص بالمؤسسة</li>
              <li>بيانات الدخول الأولية للمشرف الرئيسي</li>
            </ul>
            <p className="mb-4 leading-relaxed text-slate-300">
              هذه المعطيات ثابتة ونهائية ولا يمكن تعديلها بعد الإنشاء. تقع على عاتق المؤسسة مسؤولية حفظ هذه البيانات وصونها.
            </p>

            {/* 5 */}
            <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4">5. تجديد الاشتراك وفترة السماح</h2>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">5.1 التنبيه المسبق</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              تُرسل المنصة إشعارات تذكيرية قبل انتهاء الاشتراك بوقت كافٍ عبر القنوات المتاحة (البريد الإلكتروني أو لوحة التحكم).
            </p>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">5.2 فترة السماح</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              عند انتهاء الاشتراك دون تجديد، تدخل المؤسسة في فترة سماح مدتها ثلاثة (3) أيام، تحتفظ خلالها بإمكانية الوصول الكامل إلى لوحة التحكم.
            </p>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">5.3 تعليق الخدمة</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              بعد انقضاء فترة السماح دون تجديد، يحق لمنصة إحكام تعليق الوصول إلى لوحة التحكم بصورة كاملة إلى حين استلام إيصال التجديد وتأكيده. لا تُحذف البيانات فور التعليق وتظل محفوظة وفق السياسة المعتمدة.
            </p>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">5.4 إنهاء الاشتراك</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              تحق للمؤسسة إنهاء اشتراكها بعدم التجديد. لا تُسترد رسوم الاشتراك عن الفترة المتبقية في أي من الحالتين الشهرية أو السنوية.
            </p>

            {/* 6 */}
            <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4">6. مسؤولية المحتوى والبيانات</h2>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">6.1 دور إحكام</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              منصة إحكام هي مزوّد خدمة برمجية (SaaS) فحسب. لا تتولى المنصة أي رقابة أو مراجعة للمحتوى الذي تُدخله المؤسسة أو تديره.
            </p>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">6.2 مسؤولية المؤسسة</h3>
            <p className="mb-3 leading-relaxed text-slate-300">
              تتحمل المؤسسة المستفيدة المسؤولية القانونية والأخلاقية الكاملة والحصرية تجاه:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 pr-4 mb-4">
              <li>بيانات طلابها وذويهم</li>
              <li>المحتوى التعليمي والإداري المُدخَل في المنصة</li>
              <li>صحة المعلومات المُسجَّلة وتوافقها مع الأنظمة والقوانين المحلية النافذة</li>
              <li>ضمان الحصول على الموافقات اللازمة عند جمع بيانات القاصرين</li>
            </ul>

            <h3 className="text-base font-bold text-emerald-300 mt-5 mb-2">6.3 المحتوى المحظور</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              يُحظر تحت أي ظرف استخدام المنصة في نشر أو تخزين أي محتوى يُحرّض على الكراهية أو العنف أو التطرف، أو ما يُخالف أحكام الشريعة الإسلامية أو الأنظمة القانونية المعمول بها. يحق لمنصة إحكام تعليق أي حساب تثبت مخالفته لهذا البند فورًا وبلا إنذار مسبق.
            </p>

            {/* 7 */}
            <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4">7. تعليق الحسابات وإيقافها</h2>
            <p className="mb-3 leading-relaxed text-slate-300">
              تحتفظ منصة إحكام بحق تعليق أي حساب أو إيقافه بصورة مؤقتة أو دائمة في الحالات الآتية:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 pr-4 mb-4">
              <li>انتهاء الاشتراك وعدم التجديد خلال فترة السماح</li>
              <li>الاشتباه في الاستخدام غير المشروع أو غير المناسب</li>
              <li>انتهاك أي من بنود هذه الشروط</li>
            </ul>
            <p className="mb-4 leading-relaxed text-slate-300">
              في حالات الإيقاف الأمني، يحق للمنصة طلب وثائق إثبات الهوية من المسؤول عن الحساب قبل البت في إعادة تفعيله.
            </p>

            {/* 8 */}
            <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4">8. تعديل الشروط والأحكام</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              يحق لمنصة إحكام تعديل هذه الشروط في أي وقت. تُنشر التعديلات على هذه الصفحة مع تحديث تاريخ السريان، ويُرسَل إشعار رسمي إلى المؤسسات المشتركة. يُعدُّ الاستمرار في استخدام المنصة بعد نشر التعديلات موافقةً ضمنية عليها.
            </p>

          </div>
        </motion.article>

        {/* ── Last updated note ── */}
        <p
          className="mt-8 text-xs text-center"
          style={{ color: '#2E4A40' }}
        >
          آخر تحديث: 26 يونيو 2026
        </p>

      </div>
    </div>
  )
}
