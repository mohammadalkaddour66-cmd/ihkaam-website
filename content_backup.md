# Comprehensive Content & Flow Report
**Project:** Portfolio & SaaS Landing Page  
**Date:** 2026-06-13  
**Purpose:** Pre-redesign content lock. Do not alter any string below until the new design is approved.

---

## 1. SECTION FLOW — HomePage.jsx Render Order

```
HomePage
├── <FloatingBg />               — fixed z-0, 3 animated radial-gradient orbs
└── <div relative z-10>
    ├── <Navbar />               — sticky top-0 z-50, glassmorphic on scroll
    └── <main>
        │
        ├──  1. <HeroSection />
        ├──  2. <VideoSalesLetter />
        ├──  3. <AboutSection />
        ├──  4. <StatsSection />
        ├──  5. <ServicesSection />
        ├──  6. <PortfolioSection />
        ├──  7. <TestimonialsSection />
        ├──  8. <IhkaamShowcase />        ← includes its own StatsBanner sub-component
        ├──  9. <IhkaamDetailedFeatures />
        ├── 10. <IhkaamPricing />
        ├── 11. <LeadMagnetSection />
        ├── 12. <ClientReviewForm />
        └── 13. <ContactSection />
    └── <Footer />
```

> NOTE: `SocialProof` and `ProductsSection` are imported in older file headers but are NOT
> rendered in the current HomePage.jsx. The stats data from SocialProof is duplicated inside
> IhkaamShowcase as a StatsBanner sub-component.

---

## 2. COPYWRITING EXTRACTION — Section by Section

---

### 2.1 Navbar (Navbar.jsx)

```
Logo mark     : م  (Arabic initial, on rose badge #D9ACA3)
Logo wordmark : محمد القدّور

Nav link 1 : الرئيسية   → #home
Nav link 2 : من أنا      → #about
Nav link 3 : خدماتي     → #services
Nav link 4 : منتجاتي    → #products
Nav link 5 : تواصل معي  → #contact

Desktop CTA button : تواصل معي → #contact
```

Behavior: transparent on load, glassmorphic (blur + border) after 50px scroll.

---

### 2.2 Hero Section (HeroSection.jsx) — id="home"

```
EYEBROW BADGE:
  •  أتمتة ذكية  •  مواقع وتطبيقات . حلول برمجية 

H1 HEADLINE (two parts — second part carries class "text-rose-grad"):
  Part 1 (plain)  : لا تكن مجرد مؤسسة أخرى..
  Part 2 (gradient): تحوّل إلى كيان رقمي يعمل بكفاءة ذاتية
  Part 3 (plain)  : وهوية تعبر عنك

SUPPORTING PARAGRAPH:
  أدرك تماماً معاناة المؤسسات أو المشاريع التجارية مع الفوضى التنظيمية والبصرية.
  لذلك، وضعت خبرتي في التصميم والبرمجة والذكاء الاصطناعي لإنشاء أنظمة سحابية
  (مثل نظام إحكام) [bold rose span]
  تحل المشاكل من جذورها وتقديم هويات بصرية احترافية تستردّان لك وقتك ومالك
  وتمنح علامتك التجارية هيبتها.

CTA 1 (primary btn-cta) : تصفح أعمالي ومنتجاتي  → href="#products"
CTA 2 (btn-outline)     : احجز استشارتك التقنية  → href="#contact"

SCROLL INDICATOR:
  Label  : تمرير
  Target : #social-proof
  Icon   : ChevronDown (animate-bounce)
```

---

### 2.3 Video Sales Letter (VideoSalesLetter.jsx)

```
EYEBROW         : رسالة المهندس

H2:
  Part 1 (plain)    : شاهد كيف
  Part 2 (gradient) : ننهي الفوضى الإدارية
  Part 3 (plain)    : ونهندس الأنظمة.

SUBTEXT:
  رسالة قصيرة من المهندس محمد القدور حول منهجية التحول الرقمي والأتمتة.

VIDEO PLACEHOLDER WATERMARK : محمد القدّور — رؤية سينمائية

CAPTION BELOW VIDEO : مدة الفيديو · 3 دقائق فقط · لا تسجيل مطلوب

VIDEO_SRC = null  →  clicking play opens Coming Soon modal

COMING SOON MODAL:
  Heading : قريباً جداً
  Body    : سيتم إدراج الفيديو السينمائي قريباً. ترقّب التجربة.
  CTA btn : حسناً، سأنتظر
```

---

### 2.4 About Section (AboutSection.jsx) — id="about"

```
EYEBROW LABEL : من أنا

H2 : قصتي مع الفوضى والنظام.

PARAGRAPH 1:
  خلال دراستي للهندسة المدنية في جامعة حلب، وعملي الميداني لسنوات كمدرس
  للقرآن الكريم ومسؤول تقني وإعلامي في المدارس الخاصة، كنت شاهداً يومياً
  على استنزاف طاقات الكوادر. جداول ورقية متناثرة، عمليات إدخال بيانات
  يدوية مكررة، وتخبط إداري يسرق وقت المؤسسة بدلاً من التركيز على رسالتها
  وأهدافها.

PARAGRAPH 2:
  أدركت حينها أن المشكلة ليست في الكوادر، بل في غياب "الأنظمة". [bold rose]
  هنا قررت توجيه مهاراتي كصانع حلول رقمية ومصمم هويات بصرية، لأبتكر أنظمة
  تقضي على هذه الفوضى، وهويات بصرية تمنح المؤسسات مكانتها الحقيقية
  (وكان نظام "إحكام" أول ثمارها). [bold rose]

PARAGRAPH 3:
  اليوم، أتفرغ لتقديم حلول برمجية وهويات بصرية، تحرر المؤسسات
  التجارية والتعليمية من قيود العمل اليدوي، وتصميم هويات بصرية فاخرة
  تعكس قيمتها الحقيقية. كما أشارك هذه التجارب عبر صناعة المحتوى التقني
  لمساعدة الآخرين على اختصار الطريق.

IMAGE: src/assets/profile.png.jpg
  alt="محمد القدّور"
  object-cover, object-top
```

---

### 2.5 Stats Section — Personal Brand (StatsSection.jsx)

```
EYEBROW : بالأرقام

STAT CARDS (4 cards):
  [1] number: 100%     label: حلول برمجية وتصاميم مفصلة على مقاسك
  [2] number: +1 M     label: مشاهدة لأعمالي ومحتواي التقني على السوشيال ميديا
  [3] number: +5,500   label: صديق ومتابع لرحلتي في عالم الأتمتة والتصميم
  [4] number: +3       label: سنوات من الخبرة
```

---

### 2.6 Services Section (ServicesSection.jsx) — id="services"

```
EYEBROW : خدماتي

H2:
  Line 1           : كيف أساعد مؤسستك
  Line 2 (gradient): فعلياً؟

SIDE PARAGRAPH:
  عملي يتركز في ثلاثة مجالات واضحة: أصمم هويتك البصرية لتليق بك، أبرمج
  أنظمتك لتنهي الفوضى، وأُؤتمت مهامك الروتينية لنوفر وقت فريقك.

--- SERVICE CARD 1 ---
  number : ٠١
  title  : برمجة وتطوير الأنظمة
  body   : أصمم وأبرمج لك منصات إدارية مخصصة تنهي تماماً فوضى الورق وجداول
           الإكسل المشتتة. أبني لك نظاماً خاصاً (SaaS) يحفظ بياناتك بأمان
           ويجعل إدارة مؤسستك أسهل وأسرع، من أي جهاز وفي أي وقت.
  tags   : SaaS Architecture · Supabase · React · AI Integration

--- SERVICE CARD 2 ---
  number : ٠٢
  title  : تصميم الهويات البصرية والإخراج الفني
  body   : أبتكر لمؤسستك هوية بصرية فاخرة وهادئة تعكس قيمتها الحقيقية في
           السوق. وإذا كان لديك محتوى نصي جاف أو مناهج معقدة، أقوم بإعادة
           إخراجها وتحويلها إلى كتب بصرية تفاعلية ومريحة للعين.
  tags   : Art Direction · Visual Identity · Interactive Books

--- SERVICE CARD 3 ---
  number : ٠٣
  title  : أتمتة المهام اليومية
  body   : أربط التطبيقات التي تستخدمها يومياً ببعضها لتعمل معاً دون تدخل
           بشري. أقوم ببرمجة مسارات تنفذ المهام الروتينية المتكررة وإدخال
           البيانات تلقائياً، لنوفر وقت فريقك ليتفرغ للمهام الأهم.
  tags   : Business Automation · Workflow · Efficiency
```

---

### 2.7 Portfolio Section (PortfolioSection.jsx) — id="portfolio"

```
EYEBROW : معرض الأعمال

H2:
  Line 1           : معرض الأعمال
  Line 2 (gradient): والإخراج الفني

SIDE PARAGRAPH:
  تحويل الرؤى والأفكار إلى تجارب بصرية فاخرة وهويات تعبر عنك.

FILTER TABS (first tab is always static, rest derived from DB):
  الكل           (always first)
  تحويل الكتب النصية  → accent #6ABDB2
  هويات بصرية         → accent #D9ACA3
  تصاميم إعلانية      → accent #7AABD9

MODAL GALLERY DIVIDER LABEL : معرض تفاصيل المشروع

EMPTY STATE (no DB items at all):
  Icon    : 🖼
  Heading : المعرض في انتظار أول مشروع
  Body    : ارفع أعمالك من لوحة التحكم لتظهر هنا.

EMPTY STATE (filter has no matches):
  لا توجد مشاريع في هذه الفئة بعد.
```

---

### 2.8 Testimonials Section (TestimonialsSection.jsx)

```
EYEBROW : شهادات العملاء

H2:
  Part 1 (plain)    : شركاء النجاح..
  Part 2 (gradient) : شهادات تصنع الفارق

SUBTEXT:
  قصص حقيقية لمؤسسات استردت وقتها ومالها وتحولت إلى الأنظمة الرقمية الذكية.

--- FALLBACK TESTIMONIAL 1 (shown when DB has 0 approved rows) ---
  name : الشيخ عبد الرحمن
  role : مدير مجمع إقرأ التعليمي
  tag  : نظام إحكام السحابي
  text : نظام إحكام نقل المجمع من فوضى الجداول الورقية والتخبط الإداري إلى
         الأتمتة السحابية الكاملة. النظام وفر علينا مئات الساعات من العمل
         اليدوي، ومنح أولياء الأمور شفافية ومتابعة لحظية لأبنائهم لم نعهدها
         من قبل.

--- FALLBACK TESTIMONIAL 2 ---
  name : أ. أحمد السليم
  role : المشرف التقني بمدرسة البراء الخاصة
  tag  : الإخراج الفني والهويات
  text : المهندس محمد يمتلك رؤية سينمائية نادرة في الإخراج الفني. لم يقدم لنا
         مجرد تصاميم عادية، بل أخرج لنا هوية بصرية فاخرة، وحوّل ملازمنا
         ومناهجنا النصية المعقدة إلى كتب مصورة تفاعلية ومبهرة للطلاب.

--- FALLBACK TESTIMONIAL 3 ---
  name : أ. خالد العمر
  role : المدير التنفيذي لمنصة تجارية
  tag  : أتمتة العمليات التجارية
  text : كنا نحرق طاقة فريقنا في إدخال البيانات ومتابعة العمليات يدوياً.
         بفضل مسارات الأتمتة الذكية والربط البرمجي الذي صممه محمد، أصبحت
         دورتنا المستندية تدار ذاتياً وبصمت، مما خفض الأخطاء البشرية ووفر
         ميزانيتنا.
```

---

### 2.9 Ihkaam Showcase (IhkaamShowcase.jsx)

```
STATS BANNER (inside this section, 4 cells):
  1,800+  →  طالب مُسجّل يُدار سحابياً
  150+    →  كادر إداري وتعليمي
  108     →  حلقة قرآنية مؤتمتة بالكامل
  6       →  معاهد ومؤسسات كبرى تثق بنا

EYEBROW : واجهات النظام

H2:
  Part 1 (rose) : شاهد كيف ننهي الفوضى..
  Part 2 (white): بساطة الواجهات وقوة الأداء

TAB PANEL HEADER (desktop sidebar) : اختر الواجهة

NOTE: All tab titles and interface descriptions are 100% DB-driven from the
ihkaam_interfaces table. No static copy exists inside the component.
If table is empty or still loading → entire section returns null (renders nothing).
```

---

### 2.10 Lead Magnet Section (LeadMagnetSection.jsx)

```
BADGE (pill) : ملف PDF مجاني

H2:
  Part 1 (white) : لا تدع الإدارة اليدوية تستنزف ميزانيتك..
  Part 2 (rose)  : احصل على دليل "الأتمتة الذكية" مجاناً.

SUBTEXT:
  وضعت خلاصة خبرتي الهندسية والتقنية في هذا الدليل الشامل. اكتشف كيف تختار
  الأنظمة السحابية المناسبة لمؤسستك، وتتخلص من المعاملات الورقية، وتوفر مئات
  الساعات شهرياً بخطوات عملية.

FORM:
  Email input placeholder : بريدك الإلكتروني...
  Submit button (idle)    : أرسل لي الدليل الآن
  Submit button (loading) : جاري الإرسال...
  Privacy note            : لا رسائل مزعجة · بريدك آمن تماماً

SUCCESS STATE:
  Heading : تم التسجيل بنجاح!
  CTA link: اضغط هنا لتحميل الدليل
  Note    : الملف سيُتاح قريباً — سنُبلغك فور النشر

DB SIDE-EFFECT: Inserts into `consultations` table with
  client_name      = "مشترك الدليل"
  service_requested = "طلب دليل الأتمتة"
  (No dedicated lead_magnet_subscribers table exists yet.)
```

---

### 2.11 Client Review Form (ClientReviewForm.jsx) — id="client-review"

```
EYEBROW : جدار الثقة

H2:
  Part 1 (white): شاركنا
  Part 2 (rose) : تجربة التحول الرقمي

SUBTEXT:
  رأيك هو المقياس الحقيقي لنجاح أنظمتنا. يسعدنا تدوين تجربتك في العمل معنا.

FORM FIELDS:
  Field 1: label="الاسم الكريم"                           placeholder="الشيخ عبد الرحمن"
  Field 2: label="المسمى الوظيفي والمؤسسة"                placeholder="مدير مجمع إقرأ"
  Field 3: label="نوع الخدمة المنفذة"                    (select dropdown)
  Field 4: label="كيف ساهمت حلولنا في تحسين سير العمل لديكم؟"
           placeholder="شاركنا تجربتك بصدق وتفصيل، كلماتك ستلهم مؤسسات أخرى للتحول الرقمي..."

SERVICE DROPDOWN OPTIONS (value → display label):
  ""           → اختر نوع الخدمة المنفذة
  "ihkam"      → نظام إحكام السحابي
  "automation" → أتمتة العمليات
  "visual"     → الإخراج الفني والهويات

SUBMIT BUTTON : إرسال التقييم
LOADING STATE : جاري الإرسال...
PRIVACY NOTE  : تقييمك سيُنشر كشهادة حقيقية بعد المراجعة

SUCCESS STATE:
  Heading : شكراً لك..
  Body    : تم استلام تقييمك بنجاح وسيتم إضافته لجدار الثقة قريباً.
  Reset   : إرسال تقييم آخر
```

---

### 2.12 Contact Section (ContactSection.jsx) — id="contact"

```
EYEBROW : تواصل معي

H2:
  Line 1 (white): جاهز لإنهاء الفوضى الإدارية
  Line 2 (rose) : والانتقال بمؤسستك إلى السحابة؟

SUBTEXT:
  احجز جلستك الاستكشافية الآن. سواء كنت ترغب في تجربة نظام "إحكام"، أو تبحث
  عن استشارة لأتمتة عملياتك التجارية، أو تحتاج إلى تصميم هوية بصرية فاخرة..
  دعنا نناقش كيف يمكنني توفير مئات الساعات من وقت فريقك.

FORM FIELDS:
  Field 1: label="الاسم الكريم"              placeholder="محمد عبدالله..."
  Field 2: label="البريد الإلكتروني"          placeholder="example@domain.com"
  Field 3: label="اسم المؤسسة / المشروع"     placeholder="معهد النور القرآني..."
  Field 4: label="نوع الخدمة المطلوبة"       (select dropdown)

SERVICE DROPDOWN OPTIONS (value → display label):
  ""                   → اختر نوع الخدمة المطلوبة
  "ihkam_trial"        → تجربة نظام إحكام مجاناً
  "automation_consult" → استشارة أتمتة وتحول رقمي
  "visual_identity"    → تصميم هوية بصرية وإخراج فني

SUBMIT BUTTON : احجز الاستشارة الآن
PRIVACY NOTE  : لا رسائل مزعجة · يُرد على جميع الطلبات خلال 24 ساعة

VALIDATION ERROR (no service selected):
  يرجى اختيار نوع الخدمة المطلوبة.

SUCCESS STATE:
  Heading : تم استلام طلبك بنجاح!
  Body    : سأتواصل معك في أقرب وقت لتحديد موعد الجلسة الاستكشافية.
  Reset   : إرسال طلب آخر
```

---

### 2.13 Footer (Footer.jsx)

```
LOGO MARK     : م  (on rose badge)
LOGO WORDMARK : محمد القدّور

BRAND TAGLINE:
  مطوّر منصات · مخرج سينمائي · مصمم هويات · خبير أتمتة أعمال.
  أبني ما يدوم ويُحدث فرقاً.

EMAIL : mohammadalkaddour66@gmail.com

LINK COLUMNS:
  Column: التنقل
    الرئيسية · من أنا · خدماتي · منتجاتي

  Column: المنتجات
    نور — المعاهد القرآنية · منتجات قادمة

  Column: التواصل
    تواصل معي · سياسة الخصوصية · شروط الاستخدام

SOCIAL ICONS (not yet wired to real URLs, all href="#"):
  إكس · يوتيوب · لينكدإن

COPYRIGHT LINE (dynamic year):
  © {year} محمد القدّور — جميع الحقوق محفوظة
```

---

## 3. IHKAAM SAAS ECOSYSTEM — Full Data Arrays

---

### 3.1 Pricing Plans — PLANS array (IhkaamPricing.jsx)

```
PAGE EYEBROW : باقات الاشتراك
PAGE H2      : ابدأ مجاناً.. وكبِّر مع مؤسستك
BILLING TOGGLE LABELS : شهري / سنوي
SAVINGS BADGE on yearly: وفر شهرين!

=== PLAN 1 ===
id       : "founder"
name     : المؤسس
sub      : Starter — Free
monthly  : 0  (displayed as: مجاني)
yearly   : 0
capacity : حتى 30 طالب
tag      : null  (no featured badge)
cta      : ابدأ مجاناً
perks:
  - الميزات الأساسية كاملة
  - حلقتان كحد أقصى
  - تقارير للعرض فقط
  - مستخدم إداري واحد

=== PLAN 2 ===
id       : "core"
name     : الحلقة
sub      : Core
monthly  : 19$
yearly   : 190$
capacity : حتى 100 طالب
tag      : null
cta      : اشترك الآن
perks:
  - النسخة التشغيلية الكاملة
  - فرع واحد
  - تصدير PDF وExcel
  - دعم فني أساسي

=== PLAN 3 (featured) ===
id       : "pro"
name     : المعهد
sub      : Pro
monthly  : 39$
yearly   : 390$
capacity : حتى 300 طالب
tag      : ★ الأكثر اختياراً
cta      : اشترك الآن
perks:
  - كل ما في باقة الحلقة
  - بوابة ولي الأمر مجاناً
  - حتى 3 فروع
  - دعم فني متقدم

=== PLAN 4 ===
id       : "institute"
name     : المجمع
sub      : Institute
monthly  : 89$
yearly   : 890$
capacity : حتى 800 طالب
tag      : null
cta      : اشترك الآن
perks:
  - كل ما في باقة المعهد
  - المحاسب المالي مدمج
  - حتى 8 فروع
  - مدير حساب مخصص

=== ENTERPRISE BANNER (below the 4 cards) ===
sub-label : Enterprise / الشبكة
body      : فروع غير محدودة، علامة بيضاء كاملة، ومدير حساب مخصص.
starts at : 199$
note      : تفاوضي
cta btn   : تواصل معنا
```

---

### 3.2 Core System Accordion — CORE_SYSTEM array (IhkaamPricing.jsx)

```
SECTION LABEL : ما تحصل عليه
SECTION TITLE : مكونات النسخة الأساسية — كل ما يحتاجه معهدك يومياً

ID: dashboard | TITLE: لوحة التحكم | COUNT: 5
  إحصائيات الطلاب
  إحصائيات الحلقات
  إحصائيات الكادر
  مؤشرات التسميع
  مؤشرات الحضور والانضباط

ID: students | TITLE: إدارة الطلاب والكادر | COUNT: 7
  تسجيل الطلاب
  تعديل وحذف
  البحث والفرز
  نقل الطلاب بين الحلقات
  السجل التاريخي
  إدارة المعلمين والمشرفين
  صلاحيات أساسية

ID: circles | TITLE: إدارة الحلقات | COUNT: 5
  إنشاء الحلقات
  توزيع الطلاب
  معلم رئيسي/مساعد
  فصل الذكور والإناث
  إعادة التوزيع

ID: recitation | TITLE: نظام التسميع اليومي | COUNT: 7
  حفظ
  مراجعة
  تثبيت
  تسجيل الصفحات
  تقييمات
  ملاحظات
  سجل تاريخي

ID: attendance | TITLE: الحضور والغياب | COUNT: 5
  حضور
  غياب
  تأخر
  مدة التأخير
  نسبة المواظبة

ID: exams | TITLE: الاختبارات الأساسية | COUNT: 4
  نتائج الاختبارات
  درجات الطلاب
  نسب النجاح
  أرشفة النتائج

ID: reports | TITLE: التقارير الأساسية | COUNT: 5
  تقارير الطلاب
  تقارير الحلقات
  تقارير التسميع
  PDF
  Excel

ID: archiving | TITLE: الأرشفة السحابية | COUNT: 3
  حفظ الملفات
  حفظ السجلات
  رفع المستندات الأساسية

ID: parents | TITLE: بوابة ولي الأمر الأساسية | COUNT: 4
  متابعة التسميع
  الحضور
  الاختبارات
  ملاحظات المعلم

ID: tech | TITLE: البنية التقنية | COUNT: 5
  Offline-First
  مزامنة ذكية
  PWA
  Responsive
  Role-Based Access

ID: settings | TITLE: الإعدادات | COUNT: 3
  شعار المعهد
  إعدادات بسيطة
  إدارة الحسابات
```

---

### 3.3 Premium Add-ons — ADDONS array (IhkaamPricing.jsx) — 7 items

```
SECTION LABEL : منصة + وحدات توسعة
SECTION TITLE : الخدمات المخصصة — Premium Add-ons

=== ADDON 1 ===
id    : "finance"
title : النظام المالي المتكامل
price : +9$/شهر
note  : مضمّن مجاناً في باقة المجمع
features:
  الواردات والمصاريف
  القيود المالية
  الأقساط
  المتأخرات
  الكفالات
  الخصومات
  لوحة الميزانية

=== ADDON 2 ===
id    : "subjects"
title : المواد الرديفة والمناهج
price : +7$/شهر
note  : +60$ سنوي
features:
  الفقه
  السيرة
  الحديث
  المناهج
  كشف العلامات
  تقييم المواد

=== ADDON 3 ===
id    : "smartreports"
title : المحصلات الذكية والسلوك
price : +6$/شهر
note  : null
features:
  الجلاءات الذكية
  المحصلات الشهرية
  تقارير السلوك
  تجميع البيانات تلقائياً

=== ADDON 4 ===
id    : "queue"
title : طابور الاختبارات الذكي
price : +7$/شهر
note  : null
features:
  التذاكر الرقمية
  الختم الزمني
  ترتيب الأسبقية
  لوحة المختبر
  تنبيهات التأخير

=== ADDON 5 ===
id    : "star"
title : نجم الأسبوع
price : +5$/شهر
note  : null
features:
  نظام النقاط
  اختيار تلقائي
  شهادات تكريم
  لوحة الشرف

=== ADDON 6 ===
id    : "eteacher"
title : المعلم الإلكتروني
price : +4$/شهر
note  : null
features:
  ربط الفيديوهات
  التحضير المنزلي
  المقاطع التعليمية

=== ADDON 7 ===
id    : "library"
title : المكتبة الصوتية والمصادر
price : +4$/شهر
note  : null
features:
  تلاوات
  كتب
  مواد تعليمية
  مركز تحميل
```

---

### 3.4 Payment & Regional Pricing Banners (IhkaamPricing.jsx)

```
SECTION LABEL : الدعم والشراكة
SECTION TITLE : قنوات الدفع — والدفتر السعري الإقليمي

=== PAYMENT CHANNELS CARD ===
sub-label : قنوات الدفع
heading   : دفع مرن — بلا تعقيدات بنكية
body      : ندعم قنوات دفع متعددة لتسهيل الاشتراك — تحويلات بنكية، USDT،
            وكلاء قبض، ودفع سنوي مسبق — مع عدم الاعتماد حصراً على البطاقات البنكية.
chips     : تحويل بنكي · USDT · وكلاء قبض · دفع سنوي

=== REGIONAL PRICING CARD ===
sub-label : الدفتر السعري الإقليمي
heading   : تسعير عادل — يراعي الواقع
body      : نعتمد تسعيراً إقليمياً عادلاً — أسعار مخفضة ومدروسة لسوريا والدول
            الضعيفة، وأسعار تتناسب مع الخليج والمهجر.
chip 1    : سوريا والدول الضعيفة  →  39$
chip 2    : الخليج والمهجر        →  99$
```

---

### 3.5 Detailed Features Panel — SECTIONS array (IhkaamDetailedFeatures.jsx) — All 16

```
PAGE EYEBROW   : المزايا الشاملة
PAGE H2        : ١٦ منظومة متكاملة تُغطي كل جانب من إدارة التعليم القرآني
PAGE SUBTEXT   : اختر قسماً لاستعراض كافة التفاصيل الدقيقة
SIDEBAR HEADER : الأقسام (١٦)

=== SECTION 1 ===
id     : "core"
number : ١
label  : المزايا الجوهرية الأساسية
sub    : Core System Features
accent : #6ABDB2

GROUP: نظام إدارة المعاهد القرآنية بالكامل
  إدارة المعاهد والحلقات القرآنية
  إدارة الطلاب
  إدارة الكادر الإداري والتعليمي
  إدارة المشرفين
  إدارة المعلمين
  إدارة المختبرين
  إدارة الحلقات والصفوف
  إدارة الاختبارات
  إدارة المواد التعليمية
  إدارة الحضور والغياب
  إدارة السلوك والانضباط
  إدارة الأرشفة
  إدارة التقارير
  إدارة الصلاحيات
  إدارة الفروع/المجمعات

=== SECTION 2 ===
id     : "tech"
number : ٢
label  : البنية التقنية المتقدمة
sub    : Advanced Technical Infrastructure
accent : #D9ACA3

GROUP 1: تقنية Offline-First
  النظام يعمل بالكامل بدون إنترنت
  حفظ البيانات محلياً عند انقطاع الشبكة
  مزامنة تلقائية عند عودة الإنترنت
  طابور ذكي للمزامنة
  عدم فقدان أي بيانات أثناء الانقطاع
  استمرار عمل المعلمين بشكل طبيعي أثناء الانقطاع
  التقارير تعمل حتى بدون إنترنت

GROUP 2: تطبيق ويب تقدمي PWA
  تثبيت كتطبيق على iPhone و Android و iPad و Desktop
  لا يحتاج متاجر التطبيقات
  يعمل كتطبيق مستقل
  سريع وخفيف

GROUP 3: نظام صلاحيات متقدم (RBAC)
  المدير يرى كل شيء
  المعلم يرى حلقته فقط
  حماية خصوصية الحلقات الأخرى
  صلاحيات دقيقة حسب الدور
  صلاحيات للمشرف والمختبر وولي الأمر

=== SECTION 3 ===
id     : "dashboard"
number : ٣
label  : لوحة التحكم الذكية
sub    : Smart Dashboard
accent : #6ABDB2

GROUP 1: الإحصائيات اللحظية
  إجمالي الطلاب
  عدد الذكور والإناث
  الأيتام
  عدد الحلقات للذكور والإناث
  حجم الكادر الإداري
  حجم الكادر التعليمي
  إحصائيات متكاملة في لحظتها

GROUP 2: المخططات البيانية
  مخططات الانضباط والاختبارات
  كثافة الطلاب داخل الحلقات
  حصاد التسميع اليومي
  نسب الحضور والنجاح
  مؤشرات الأداء

=== SECTION 4 ===
id     : "students"
number : ٤
label  : نظام إدارة الطلاب والكادر
sub    : Student & Staff Management
accent : #A6756A

GROUP 1: بيانات الطلاب
  الاسم
  اسم الأب والأم
  السكن
  أرقام الهواتف
  تاريخ الميلاد
  الحالة (يتيم/غير يتيم)

GROUP 2: الأرشفة الرقمية
  رفع صورة شخصية
  دفتر العائلة
  ضغط الصور تلقائياً
  حفظ المستندات إدارياً

GROUP 3: أدوات الإدارة
  بحث فوري
  فرز متقدم
  نقل الطلاب
  فصل الطلاب
  إعادة توزيع الطلاب
  الاحتفاظ بالسجل التاريخي
  فلاتر للحالات الخاصة كالأيتام

=== SECTION 5 ===
id     : "circles"
number : ٥
label  : إدارة الحلقات والتوزيع الذكي
sub    : Circles & Smart Distribution
accent : #6ABDB2

GROUP 1: إنشاء الحلقات
  عدد غير محدود من الحلقات
  معلم رئيسي ومساعد

GROUP 2: نظام التوزيع الذكي
  فصل الذكور والإناث
  قوائم غير الموزعين
  ترتيب أبجدي
  بحث سريع
  توزيع بضغطة زر
  نقل الطالب مع الحفاظ على السجل

=== SECTION 6 ===
id     : "recitation"
number : ٦
label  : نظام التسميع اليومي
sub    : Daily Recitation Tracking
accent : #D9ACA3

GROUP 1: أنواع التسميع
  حفظ جديد
  مراجعة
  تثبيت

GROUP 2: تفاصيل التسجيل
  الصفحة
  المقطع
  عدد الصفحات
  التقييم النصي
  الدرجة الرقمية /100
  ملاحظات المعلم
  تسجيل كامل ودقيق

GROUP 3: لوحة إنجاز المعلم
  إجمالي الصفحات المسمعة
  عدد الطلاب الذين سمعوا
  تحفيز المعلمين
  قياس الأداء

=== SECTION 7 ===
id     : "attendance"
number : ٧
label  : نظام الحضور والغياب والتأخر
sub    : Attendance & Tardiness System
accent : #6ABDB2

GROUP 1: تسجيل الحضور
  تسجيل حضور سريع
  غياب
  تأخر

GROUP 2: إدارة التأخر
  مدة التأخير بالدقائق
  إذن تأخر دائم
  ظروف خاصة

GROUP 3: مؤشر المواظبة
  نسبة الحضور المئوية
  إجمالي الغياب والتأخير
  إحصائيات رسومية

=== SECTION 8 ===
id     : "exams"
number : ٨
label  : نظام الاختبارات والسبر
sub    : Exams & Assessment System
accent : #A6756A

GROUP 1: أنواع الاختبارات
  سبر أجزاء
  اختبارات دورية
  نهاية مستوى
  اختبارات مواد

GROUP 2: الإحصائيات
  متوسط درجات الحلقة
  نسبة النجاح العامة
  تقييم أداء المعلم والطلاب

=== SECTION 9 ===
id     : "queue"
number : ٩
label  : نظام طابور الاختبارات الذكي
sub    : Smart Exam Queue System
accent : #D9ACA3

GROUP 1: نظام التذاكر الرقمية
  تحويل الطالب إلى "جاهز للاختبار"
  حفظ الدور تلقائياً
  منع الفوضى

GROUP 2: الختم الزمني
  تسجيل الدقيقة والساعة
  حفظ أسبقية الطالب
  منع الجدل

GROUP 3: لوحة المختبر
  قائمة انتظار لحظية
  تحديث Real-time
  ترتيب حسب الأسبقية
  تسجيل النتيجة وإخراج الطالب

GROUP 4: نظام الرقابة الذكي
  عداد انتظار
  تنبيه بعد 3 أيام
  تنبيهات حمراء
  إشعار للمشرف الإداري

GROUP 5: البنية الخلفية
  جداول انتظار
  ربط المعلمين بالمختبرين
  تخزين السجلات وحفظ الاختبارات المنجزة

=== SECTION 10 ===
id     : "gamification"
number : ١٠
label  : المحصلات ونظام نجم الأسبوع
sub    : Reports & Gamification
accent : #6ABDB2

GROUP 1: منشئ تقارير ديناميكي
  دمج بيانات التسميع
  بيانات الغياب
  بيانات التأخير
  بيانات السلوك وأخلاق المنزل

GROUP 2: الجلاءات الذكية
  اختيار الأعمدة
  تخصيص كامل
  تصدير احترافي

GROUP 3: نظام نجم الأسبوع (Gamification)
  نظام نقاط لتحفيز الطلاب
  محرك أوزان — نقاط الحفظ
  محرك أوزان — الحضور
  محرك أوزان — السلوك وخصم الغياب

GROUP 4: أتمتة كاملة
  اختيار الفائز تلقائياً
  إنشاء شهادة جاهزة
  بطاقة تكريم جاهزة للنشر
  لوحة الشرف وبوابة ولي الأمر

=== SECTION 11 ===
id     : "subjects"
number : ١١
label  : إدارة المواد الرديفة والمناهج
sub    : Supplementary Subjects & Curriculum
accent : #A6756A

GROUP 1: المواد
  فقه
  سيرة
  حديث
  مواد مخصصة
  ربط بحلقات محددة

GROUP 2: نظام العلامات
  رصد درجات
  حالات نجاح/رسوب
  تلوين ذكي للحالات
  كشوف علامات للحلقة وفردية

=== SECTION 12 ===
id     : "finance"
number : ١٢
label  : النظام المالي (المحاسب الرقمي)
sub    : Financial Management System
accent : #D9ACA3

GROUP 1: الإدارة المالية
  الواردات
  المصاريف
  الميزانية
  القيود المالية

GROUP 2: الأقساط
  إدارة الأقساط
  المتأخرات
  فلترة ذكية

GROUP 3: الحالات الخاصة
  الكفالات
  العفو
  الخصومات

GROUP 4: محاكاة المحاسب البشري
  أتمتة مالية
  إدارة مترابطة ومتكاملة

=== SECTION 13 ===
id     : "parents"
number : ١٣
label  : بوابة أولياء الأمور
sub    : Parent Portal
accent : #6ABDB2

GROUP 1: متابعة لحظية
  التسميع اليومي
  الحضور
  الغياب
  التأخر
  السلوك
  الاختبارات
  المحصلة الشهرية
  لوحات الشرف
  متابعة كاملة في الوقت الفعلي

GROUP 2: واجهة تفاعلية
  منحنيات بيانية
  إحصائيات ومؤشرات تقدم
  سهولة وصول من الهاتف عبر رابط مباشر

=== SECTION 14 ===
id     : "teacher"
number : ١٤
label  : المعلم الإلكتروني والمكتبة
sub    : E-Teacher & Digital Library
accent : #A6756A

GROUP 1: مقاطع التحضير
  ربط الصفحات القرآنية بفيديوهات وصوتيات للتحضير المنزلي
  تقليل العبء على المعلم

GROUP 2: المكتبة الصوتية
  البحث برقم الصفحة أو التلاوات (الحصري، أيمن سويد)
  محتوى مناهج وكتب

=== SECTION 15 ===
id     : "reports"
number : ١٥
label  : التقارير والإحصائيات
sub    : Reports & Analytics — درة التاج
accent : #D9ACA3

GROUP 1: منشئ تقارير مرن
  تخصيص كامل
  فلاتر (طالب، حلقة، فترة)

GROUP 2: PDF احترافي
  ترويسة
  ختم
  توقيع
  اسم المدير والتاريخ
  تصدير Excel

GROUP 3: الأرشفة السحابية
  ملفات الطلاب
  الكادر
  التعاميم والقرارات

=== SECTION 16 ===
id     : "ux"
number : ١٦
label  : تجربة المستخدم والواجهة
sub    : UX / UI Design
accent : #6ABDB2

GROUP 1: التصميم
  عصري وألوان هادئة للبيئة القرآنية
  متجاوب (Mobile, Tablet, Desktop)
  واجهة RTL عربية أصيلة

GROUP 2: سهولة الاستخدام
  بحث فوري
  Auto-scroll
  تنقل سلس
```

---

## 4. DYNAMIC DATA REQUIREMENTS — Supabase-Driven Sections

```
The following sections hit Supabase on mount. Each MUST have
a loading state and an empty/error state in the new design.

╔══════════════════════════╦══════════════════════════════╦═════════════════════════╦═══════════════════════════════╗
║ Section                  ║ Table / Bucket               ║ Loading UI              ║ Empty / Error Fallback        ║
╠══════════════════════════╬══════════════════════════════╬═════════════════════════╬═══════════════════════════════╣
║ PortfolioSection         ║ table: portfolio             ║ 6 skeleton cards        ║ Empty state (icon + 2 lines)  ║
║                          ║ bucket: portfolio/covers/    ║ animate-pulse, 4/3 AR   ║ or "no items in filter" msg  ║
║                          ║         portfolio/gallery/   ║                         ║                               ║
╠══════════════════════════╬══════════════════════════════╬═════════════════════════╬═══════════════════════════════╣
║ TestimonialsSection      ║ table: testimonials          ║ 3 skeleton cards        ║ Falls back to FALLBACK array  ║
║                          ║ filter: status = 'approved'  ║ animate-pulse           ║ (3 hardcoded testimonials)    ║
╠══════════════════════════╬══════════════════════════════╬═════════════════════════╬═══════════════════════════════╣
║ IhkaamShowcase           ║ table: ihkaam_interfaces     ║ Section returns null    ║ Section returns null          ║
║                          ║ bucket: showcase_images/     ║ (renders nothing)       ║ (renders nothing if empty)    ║
║                          ║         desktop/ mobile/     ║                         ║                               ║
╠══════════════════════════╬══════════════════════════════╬═════════════════════════╬═══════════════════════════════╣
║ ContactSection           ║ table: consultations (INSERT)║ Spinner on submit btn   ║ Inline error message          ║
╠══════════════════════════╬══════════════════════════════╬═════════════════════════╬═══════════════════════════════╣
║ LeadMagnetSection        ║ table: consultations (INSERT)║ "جاري الإرسال..." btn   ║ Inline error message          ║
╠══════════════════════════╬══════════════════════════════╬═════════════════════════╬═══════════════════════════════╣
║ ClientReviewForm         ║ table: testimonials (INSERT) ║ "جاري الإرسال..." btn   ║ Inline error message          ║
╚══════════════════════════╩══════════════════════════════╩═════════════════════════╩═══════════════════════════════╝

SUPABASE CLIENTS:
  src/config/supabaseClient.js  — auth-enabled (used for all public + admin queries)
  src/lib/supabase.js           — auth-disabled alternative (not currently used in public pages)

AUTH FLOW:
  Route /admin/login     → AdminLogin.jsx   (Supabase signInWithPassword)
  Route /admin/dashboard → AdminDashboard.jsx (guarded by ProtectedRoute)
  ProtectedRoute checks supabase.auth.getSession() → redirects to /admin/login if null
```

---

## 5. CRITICAL ENUM VALUES — Do NOT Change During Redesign

```
These string values are persisted in the Supabase database.
Any new form components must use these exact values or DB queries will break.

--- testimonials.service_type (ClientReviewForm) ---
"ihkam"       → نظام إحكام السحابي
"automation"  → أتمتة العمليات
"visual"      → الإخراج الفني والهويات

--- consultations.service_requested (ContactSection) ---
"ihkam_trial"         → تجربة نظام إحكام مجاناً
"automation_consult"  → استشارة أتمتة وتحول رقمي
"visual_identity"     → تصميم هوية بصرية وإخراج فني

--- consultations.service_requested (LeadMagnetSection) ---
"طلب دليل الأتمتة"   → lead magnet opt-in (also sets client_name = "مشترك الدليل")

--- portfolio.category (filter tabs + accent color map) ---
"تحويل الكتب النصية"  → accent #6ABDB2
"هويات بصرية"         → accent #D9ACA3
"تصاميم إعلانية"      → accent #7AABD9

--- testimonials.status (read filter in TestimonialsSection) ---
"approved"  → shown publicly
"pending"   → held for admin review (inserted by ClientReviewForm)
```

---

## 6. CURRENT COLOR PALETTE (for reference during redesign transition)

```
DARK THEME PALETTE (current — being replaced):
  Dark Teal BG      : #012626
  Accent Teal       : #6ABDB2
  Rose/Mauve        : #D9ACA3
  Dusty Rose        : #A6756A
  Cream Text        : #F0E8E5
  Muted Green Text  : #7A9E96 / #8FA89E / #4A7060
  Dark Teal Glass   : rgba(2,89,81,0.10–0.35)
  Rose Glass        : rgba(217,172,163,0.06–0.15)

CSS CLASSES (defined in index.css):
  .text-rose-grad → rose gradient text (used on headline spans)
  .card-glass     → glassmorphism card with hover lift
  .btn-cta        → primary rose-gradient button
  .btn-outline    → ghost button with teal border
  .divider        → 1px subtle horizontal rule

ANIMATION KEYFRAMES (index.css):
  @keyframes orb-a, orb-b, orb-c → FloatingBg three orbs
  @keyframes fadeInFeature        → IhkaamDetailedFeatures + IhkaamPricing panel transitions
  @keyframes fadeInScreen         → IhkaamShowcase mockup transitions
  @keyframes pulse-btn            → ClientReviewForm submit button hover
```

---

*End of content_backup.md — all data extracted directly from source files as of 2026-06-13.*
*No new designs or CSS introduced. Safe to begin redesign.*
