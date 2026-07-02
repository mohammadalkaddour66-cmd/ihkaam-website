import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Wallet, Award, CheckCircle2 } from 'lucide-react';

// تجميع وتكثيف المنظومات الـ 16 إلى 4 ركائز كبرى فاخرة
const PILLARS = [
  {
    id: "recitation_circles",
    title: "منظومة التسميع والحلقات الذكية",
    subtitle: "Recitation & Smart Circles",
    icon: BookOpen,
    groups: [
      {
        title: "إدارة الحلقات والتسميع اليومي",
        features: [
          "إنشاء عدد غير محدود من الحلقات مع فصل مرن للذكور والإناث.",
          "تسجيل مسارات الحفظ الجديد، المراجعة، والتثبيت بدقة.",
          "رصد الدرجات الرقمية /100 والتقييمات النصية وملاحظات المعلمين تلقائياً.",
          "لوحة إنجاز المعلم اللحظية لقياس حصاد الصفحات المسمعة وتحفيز الكادر."
        ]
      },
      {
        title: "طابور الاختبارات الذكي والسبر",
        features: [
          "تحويل الطالب إلى وضع 'جاهز للاختبار' بضغطة زر وإصدار تذكرة رقمية.",
          "حفظ أسبقية الدور بالختم الزمني الدقيق لمنع الجدل والتخبط التنظيمي.",
          "لوحة مختبر ذكية بـ Real-time تحديث لمتابعة قوائم الانتظار ورصد النتائج.",
          "عداد الرقابة الذكي لإشعار الإدارة والمشرفين عند تأخر أي طالب في الانتظار."
        ]
      }
    ]
  },
  {
    id: "students_attendance",
    title: "شؤون الطلاب والكادر والانضباط",
    subtitle: "Students, Staff & Attendance",
    icon: Users,
    groups: [
      {
        title: "الهوية والأرشفة الرقمية المعقدة",
        features: [
          "ملفات رقمية متكاملة للطلاب شاملة السكن، أرقام التواصل، والحالات كالأيتام.",
          "أرشفة مستندات سحابية لرفع الصور ودفاتر العائلة مع ضغط تلقائي للملفات.",
          "السجل التاريخي الشامل لتتبع مسار الطالب الإداري والتعليمي لسنوات.",
          "نظام صلاحيات متقدم (RBAC) يضمن العزل التام وحماية خصوصية حلقات الإناث."
        ]
      },
      {
        title: "منظومة الحضور والمواظبة الذكية",
        features: [
          "تسجيل حضور، غياب، وتأخر سريع بلمسة واحدة متوافق بالكامل مع الهواتف.",
          "حساب رصد دقائق التأخر وإدارة طلبات الأذونات الدائمة والظروف الخاصة.",
          "محرك مئوي ذكي يحسب نسبة مواظبة الطالب الكلية وإجمالي سجل غيابه.",
          "مخططات بيانية لحظية توضح كثافة الطلاب داخل الحلقات ونسب الانضباط العامة."
        ]
      }
    ]
  },
  {
    id: "digital_finance",
    title: "المحاسب الرقمي والإدارة المالية",
    subtitle: "Digital Accountant & Finance",
    icon: Wallet,
    groups: [
      {
        title: "المحاسبة الإدارية والقيود",
        features: [
          "تقييد كافة الواردات والمصاريف وإصدار القيود المالية أوتوماتيكياً.",
          "لوحة ميزانية عامة متكاملة توضح التدفقات النقدية وتحاكي دقة المحاسب البشري.",
          "ربط الحسابات وتخزين السجلات السحابية الآمنة لسهولة الجرد والتدقيق الإداري."
        ]
      },
      {
        title: "إدارة الأقساط والمنح والخصومات",
        features: [
          "متابعة دورية لأقساط الطلاب مع فلاتر ذكية لعزل المتأخرات وجدولتها.",
          "منظومة كفالات الأيتام المستقلة وربطها بالصرف الإداري السليم.",
          "إدارة حالات العفو والخصومات المخصصة للمنح الدراسية أو الأخوة."
        ]
      }
    ]
  },
  {
    id: "parents_gamification",
    title: "بوابة أولياء الأمور ونظام التحفيز",
    subtitle: "Parent Portal & Gamification",
    icon: Award,
    groups: [
      {
        title: "محرك التحفيز ونجم الأسبوع",
        features: [
          "محرك أوزان متطور يدمج نقاط الحفظ، الحضور، والسلوك لترشيح المتفوقين.",
          "أتمتة اختيار فائز 'نجم الأسبوع' وتوليد بطاقات تكريم جاهزة للنشر فوراً.",
          "لوحة شرف رقمية مدمجة تزيد من حماس الطلاب وتنافسهم الإيجابي."
        ]
      },
      {
        title: "شفافية المتابعة وبناء التقارير",
        features: [
          "بوابة تفاعلية مخصصة لولي الأمر عبر رابط مباشر سريع ومثالي للهواتف.",
          "منحنيات بيانية توضح لولي الأمر مستوى تقدم ابنه اللحظي في الحفظ والانضباط.",
          "منشئ تقارير مرن لتصدير المحصلات الشهرية وملاحظات السلوك كـ PDF أو Excel برؤوس رسمية."
        ]
      }
    ]
  }
];

export default function IhkaamDetailedFeatures() {
  const [activeTab, setActiveTab] = useState(PILLARS[0].id);

  const currentPillar = PILLARS.find(p => p.id === activeTab);
  const IconComponent = currentPillar.icon;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#012626] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* العناوين الرئيسية التايبوغرافية الراقية */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-[#00A896] uppercase bg-[#00A896]/10 px-3 py-1 rounded-full">
            المزايا الشاملة
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F0E8E5] leading-tight">
            ٤ منظومات كبرى <span className="bg-gradient-to-l from-[#D9ACA3] to-[#A6756A] bg-clip-text text-transparent">تُغطي كل جانب</span> من إدارة التعليم
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#7A9E96] max-w-2xl mx-auto">
            اختر ركيزة لاستعراض تفاصيل الحلول البرمجية والهندسية التي يقدمها نظام إحكام لإنهاء الفوضى الإدارية.
          </p>
        </div>

        {/* الحاوية الرئيسية الكبرى بأسلوب الـ Bento Box الفاخر */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#011F1F] border border-[#E5D3B3]/10 rounded-3xl p-6 lg:p-8 backdrop-blur-sm shadow-2xl">
          
          {/* القائمة الجانبية للتنقل - تظهر كأزرار عريضة فخمة */}
          <div className="lg:col-span-4 flex flex-col gap-3 border-b lg:border-b-0 lg:border-l border-[#E5D3B3]/10 pb-6 lg:pb-0 lg:pl-6">
            <span className="text-xs font-bold text-[#7A9E96]/60 tracking-wider mb-2 block px-4">
              الركائز الأساسية ({PILLARS.length})
            </span>
            {PILLARS.map((pillar, index) => {
              const TabIcon = pillar.icon;
              const isActive = pillar.id === activeTab;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActiveTab(pillar.id)}
                  className={`group relative flex items-center gap-4 text-right p-4 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#012626] border border-[#E5D3B3]/10 shadow-lg' 
                      : 'hover:bg-[#012626]/40 border border-transparent'
                  }`}
                >
                  {/* خط التركواز الجانبي المؤشر للقسم النشط */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute right-0 top-4 bottom-4 w-1 bg-[#00A896] rounded-l-full"
                    />
                  )}

                  {/* الأيقونة التفاعلية */}
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-[#00A896]/20 text-[#00A896]' : 'bg-white/5 text-[#7A9E96] group-hover:text-[#F0E8E5]'
                  }`}>
                    <TabIcon className="w-5 h-5" />
                  </div>

                  {/* النصوص وعنوان القسم الرقمي الشفاف في الخلفية */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold transition-all duration-300 ${
                      isActive ? 'text-transparent bg-clip-text bg-gradient-to-l from-[#D9ACA3] to-[#A6756A]' : 'text-[#C8B8B0] group-hover:text-[#F0E8E5]'
                    }`}>
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#7A9E96]/60 mt-0.5 truncate uppercase tracking-wider">
                      {pillar.subtitle}
                    </p>
                  </div>

                  {/* الرقم الشفاف الفاخر */}
                  <span className={`text-2xl font-black font-sans select-none transition-all duration-300 opacity-10 ${
                    isActive ? 'text-[#00A896] opacity-25' : 'text-[#7A9E96]'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* مسرح العرض الرئيسي التفاعلي المزود بـ AnimatePresence لمنع قفزات المحتوى */}
          <div className="lg:col-span-8 flex flex-col justify-between min-h-[420px] lg:pr-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {currentPillar.groups.map((group, groupIdx) => (
                  <div 
                    key={groupIdx} 
                    className="bg-[#012626]/40 border border-[#E5D3B3]/5 rounded-2xl p-5 hover:border-[#E5D3B3]/10 transition-all duration-300"
                  >
                    {/* ترويسة بطاقة البينتو الداخلية المدمجة */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00A896] shadow-[0_0_8px_#00A896]" />
                      <h4 className="text-base font-bold text-[#00A896]">
                        {group.title}
                      </h4>
                    </div>

                    {/* الميزات منسقة بنقاط أيقونية احترافية بدلاً من الكتل النصية المملة */}
                    <ul className="flex flex-col gap-3">
                      {group.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-start gap-2.5 text-sm text-[#C8B8B0] leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-[#E5D3B3]/40 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* الفوتر السفلي الخفيف للمستند لتعزيز الطابع المعماري النظيف */}
            <div className="mt-8 pt-4 border-t border-[#E5D3B3]/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A9E96]/50">
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-[#00A896]/40" />
                <span className="uppercase tracking-widest">{currentPillar.id.replace('_', ' ')} architecture locked</span>
              </div>
              <span>نظام إحكام لإدارة المعاهد والمنصات التعليمية · ٢٠٢٦</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}