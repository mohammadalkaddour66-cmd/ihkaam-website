import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

const fadeUp = {
  hidden : { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1] } },
}

export default function PrivacyPage() {
  return (
    <div
      className="relative min-h-screen"
      dir="rtl"
      style={{ background: '#020F0E' }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(26,148,155,0.07) 0%, transparent 70%)', zIndex: 0 }}
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
              background: 'rgba(26,148,155,0.15)',
              border    : '1px solid rgba(72,214,205,0.22)',
            }}
          >
            <ShieldCheck size={26} style={{ color: '#48D6CD' }} strokeWidth={1.5} />
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
            سياسة الخصوصية
          </h1>

          <p
            className="text-sm leading-relaxed"
            style={{ color: '#509492', maxWidth: '520px' }}
          >
            نلتزم بحماية خصوصيتك وبياناتك الشخصية. تشرح هذه الوثيقة كيفية جمع المعلومات واستخدامها وحمايتها.
          </p>

          <div
            className="mt-10"
            style={{ height: 1, background: 'linear-gradient(90deg, rgba(72,214,205,0.25) 0%, transparent 60%)' }}
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
              background: 'rgba(9,32,30,0.55)',
              border    : '1px solid rgba(229,211,179,0.08)',
              fontSize  : '0.93rem',
            }}
          >

            {/* مقدمة */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-2 mb-4">مقدمة سياسة الخصوصية</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              تشرح هذه السياسة طبيعة البيانات التي نجمعها، وكيفية معالجتها وحمايتها. باستخدامك المنصة، فإنك توافق على ما ورد في هذه الوثيقة وعلى الشروط والأحكام المرافقة لها.
            </p>

            {/* 1 */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">1. البيانات التي نجمعها</h2>

            <h3 className="text-base font-bold text-[#7FE3DA] mt-5 mb-2">1.1 بيانات المؤسسة (عند إنشاء الحساب)</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-300 pr-4 mb-4">
              <li>اسم المؤسسة القرآنية</li>
              <li>اسم المشرف المسؤول</li>
              <li>رقم الهاتف</li>
              <li>عنوان البريد الإلكتروني</li>
              <li>بيانات الموقع الجغرافي إن اقتضت الضرورة</li>
            </ul>
            <p className="mb-4 leading-relaxed text-slate-300">
              تُستخدَم هذه البيانات حصرًا لأغراض التواصل وإرسال الإشعارات التشغيلية وتفعيل الخدمة.
            </p>

            <h3 className="text-base font-bold text-[#7FE3DA] mt-5 mb-2">1.2 بيانات الاستخدام التقني</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-300 pr-4 mb-4">
              <li>عناوين IP وبلد الوصول</li>
              <li>نوع المتصفح ونظام التشغيل</li>
              <li>سجلات الجلسات وأوقات تسجيل الدخول</li>
            </ul>
            <p className="mb-4 leading-relaxed text-slate-300">
              تُستخدَم هذه البيانات لأغراض الأمان وتحسين الأداء حصرًا، ولن تُباع أو تُشارَك مع أي طرف ثالث.
            </p>

            <h3 className="text-base font-bold text-[#7FE3DA] mt-5 mb-2">1.3 البيانات التشغيلية للمؤسسة</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              تشمل بيانات الطلاب والمعلمين وجداول الحلقات والتقييمات وما تُدخله المؤسسة في لوحة التحكم. تُعدُّ هذه البيانات ملكًا حصريًا للمؤسسة، ولا تصل إليها إدارة المنصة إلا عند الضرورة الفنية القصوى وبعلم المؤسسة.
            </p>

            {/* 2 */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">2. تخزين البيانات وأمانها</h2>

            <h3 className="text-base font-bold text-[#7FE3DA] mt-5 mb-2">2.1 البنية التحتية</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              تُخزَّن بيانات المنصة لدى مزوّد بنية سحابية، وتُنقَل بين جهازك والمنصة عبر اتصال مشفّر (HTTPS/TLS). ولكل معهد صلاحيات منفصلة، فلا يرى معهدٌ بيانات معهدٍ آخر.
            </p>

            <h3 className="text-base font-bold text-[#7FE3DA] mt-5 mb-2">2.2 كلمات المرور</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              تُسلَّم كلمة المرور الأولية للمشرف عند التفعيل، وننصح بتغييرها عند أول دخول وعدم مشاركتها مع أحد. لا تطلب المنصة كلمة مرورك عبر أي قناة. في حالة فقدانها يُتاح إنشاء كلمة مرور جديدة بالتواصل مع مشرف المعهد أو فريق الدعم.
            </p>

            <h3 className="text-base font-bold text-[#7FE3DA] mt-5 mb-2">2.3 البيانات المحذوفة</h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              عند حذف أي بيانات من قِبَل المؤسسة المستفيدة من خلال لوحة التحكم، تُحذف نهائيًا ولا يمكن استرجاعها. وإن أرادت المؤسسة الاحتفاظ بنسخة لديها، فتستطيع تصدير تقاريرها بصيغتي PDF وExcel من لوحة التحكم.
            </p>

            {/* 3 */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">3. بيانات الدفع</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              لا تحتفظ منصة إحكام بأي بيانات مصرفية أو مالية. تتم معاملات السداد خارج المنصة عبر المحافظ الإلكترونية المعتمدة. يُرسَل إيصال التحويل عبر واتساب للتحقق من الدفع وتفعيل الحساب، ولا يُرفع إلى المنصة.
            </p>

            {/* 4 */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">4. ملفات الارتباط (Cookies)</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              نستخدم ملفات الارتباط لأغراض وظيفية فقط، تشمل: حفظ جلسة تسجيل الدخول وتذكر إعدادات العرض. تُحذف ملفات الارتباط المتعلقة بتسجيل الدخول فور انتهاء الجلسة. يمكنك ضبط متصفحك لرفض ملفات الارتباط، مع ملاحظة أن ذلك قد يؤثر في بعض وظائف المنصة.
            </p>

            {/* 5 */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">5. مسؤولية المؤسسة عن بيانات طلابها</h2>
            <p className="mb-3 leading-relaxed text-slate-300">
              تعمل منصة إحكام وفق مبدأ "المعالج بالنيابة" (Data Processor) لبيانات الطلاب، فيما تُعدُّ المؤسسة القرآنية هي "المتحكم في البيانات" (Data Controller). وبناءً عليه:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 pr-4 mb-4">
              <li>تتحمل المؤسسة المسؤولية الكاملة عن الحصول على الموافقات القانونية اللازمة لجمع بيانات الطلاب وذويهم</li>
              <li>تلتزم المؤسسة بعدم إدخال أي بيانات مُضلِّلة أو مُنتحَلة</li>
              <li>تبقى المسؤولية القانونية والأخلاقية كاملةً على المؤسسة في أي نزاع يتعلق ببيانات مستخدميها</li>
            </ul>

            {/* 6 */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">6. الإفصاح عن البيانات لأطراف ثالثة</h2>
            <p className="mb-3 leading-relaxed text-slate-300">
              لا تُباع بيانات المستخدمين ولا تُشارَك مع أطراف تجارية ثالثة. قد تُفصح المنصة عن بيانات في الحالتين الآتيتين فحسب:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 pr-4 mb-4">
              <li>بموجب أمر قانوني: إذا أُلزمنا بذلك بموجب حكم قضائي أو مطلب تنظيمي رسمي</li>
              <li>لمزوّدي الخدمات التقنية التي تعمل عليها المنصة، في حدود ما يقتضيه تشغيل الخدمة فقط</li>
            </ul>

            {/* 7 */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">7. بيانات الطلاب القاصرين</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              أغلب طلاب حلقات التحفيظ دون الثامنة عشرة. تُدخل المؤسسة بياناتهم بعد موافقة أولياء أمورهم، ونستخدمها لتشغيل حساب المعهد فقط: لا نعرضها للعامة، ولا نرسل للطلاب رسائل تسويقية، ولا نبيعها لأحد. يرى ولي الأمر بيانات ابنه من بوابة ولي الأمر، وإذا أراد تصحيحها أو حذفها فيطلب ذلك من إدارة المعهد.
            </p>

            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">8. حقوقك على بياناتك</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300 pr-4 mb-4">
              <li>الاطلاع: تعرض لوحة التحكم كل ما أدخلته المؤسسة من بيانات.</li>
              <li>التصحيح: تعدّل المؤسسة بياناتها مباشرة من لوحة التحكم.</li>
              <li>التصدير: تُصدَّر التقارير بصيغتي PDF وExcel في أي وقت خلال الاشتراك.</li>
              <li>الحذف: تحذف المؤسسة ما تريد من لوحة التحكم، أو تطلب منا ذلك عبر واتساب أو البريد.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">9. حالات انقطاع الخدمة</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              تبذل إدارة منصة إحكام جهدها لضمان استمرارية الخدمة، غير أنه قد تطرأ أحيانًا حالات صيانة مجدولة أو انقطاع غير متوقع. في هذه الحالات، يُبلَّغ المشتركون عبر قنوات التواصل المتاحة، ولا تتحمل المنصة أي مسؤولية عن الأضرار الناجمة عن انقطاع مؤقت غير متعمد.
            </p>

            {/* 8 */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">10. التواصل معنا</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              للاستفسار عن أي بند في هذه السياسة أو تقديم طلبات تتعلق ببياناتك، تواصل مع فريق منصة إحكام عبر واتساب على الرقم <span dir="ltr">+963 947 409 106</span> أو عبر البريد ihkaamapp@gmail.com.
            </p>

            {/* 9 */}
            <h2 className="text-xl font-bold text-[#48D6CD] mt-8 mb-4">11. التعديل على سياسة الخصوصية</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              يحق لمنصة إحكام تعديل هذه السياسة دوريًا. يُنشر التعديل على هذه الصفحة مع تحديث تاريخ السريان، ويُرسَل إشعار إلى المشتركين عبر البريد الإلكتروني أو لوحة التحكم. يُعدُّ الاستمرار في استخدام المنصة موافقةً على التعديلات المنشورة.
            </p>

          </div>
        </motion.article>

        {/* ── Last updated note ── */}
        <p
          className="mt-8 text-xs text-center"
          style={{ color: '#1C423A' }}
        >
          آخر تحديث: 13 نوفمبر 2026
        </p>

      </div>
    </div>
  )
}
