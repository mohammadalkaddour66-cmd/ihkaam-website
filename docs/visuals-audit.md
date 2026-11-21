# جرد الصور في الموقع وخطة تقويتها

كُتب: 2026-11-21. جرد قراءة فقط (لم يُغيَّر شيء في الكود). الهدف: صور تشرح وتجذب بدل لقطات متشابهة.

## ما في الموقع اليوم

| النوع | العدد | أين |
|---|---|---|
| لقطات التطبيق الحقيقية (`public/app-shots`) | 28 لقطة فريدة (46 ملفاً بنسخ -sm)، 1.3 م.ب | معرض `/ihkaam`، وصفحات الميزات، ومركز المساعدة |
| مشاهد مولّدة للمنصة (`public/scenes`) | 13 | الأدوار الخمسة، وثلاث إضافات، وثلاث ميزات، وهيرو المنصة |
| مشاهد المقالات (`public/scenes/blog`) | 39 مقالاً بنسختين (lg وsm)، 14 منها نسخ مؤقتة تنتظر صورك | غلاف كل مقال وبطاقاته |
| رسوم «الفكرة في لمحة» (كود) | رسم لكل مقال | تحت غلاف المقال |
| صور حقيقية للمالك والمعهد (`public/photos`, `public/about`) | 4 | «رسالة إحكام» و«من نحن» |

## الصفحات: ما فيها وما ينقصها

| الصفحة | ما فيها | الفجوة | المقترح | الأولوية |
|---|---|---|---|---|
| مركز المساعدة: 24 شرحاً (142 خطوة) | لقطة واحدة كاملة الشاشة لكل شرح (22 شرحاً)، و«signup» و«payment» بلا لقطة | اللقطة لا تربط بالخطوة، و`dashboard` يتكرر 3 مرات و`insights` و`exams` 4 مرات | لقطة **مقتطَعة ومشروحة** لكل خطوة رئيسية (سهم وتسمية)، وتنوّع اقتطاع كل موضع | عالية |
| صفحات الميزات (12) | لقطة حقيقية في ترويسة 9 منها، ومشهد في 3 | الترويسة لقطة معقدة، لا مدخل بصري يشرح الفكرة | مشهد في الترويسة (6 جديدة)، ثم «قبل/بعد» مرسوم بالكود، ثم اللقطة المقتطعة | عالية |
| الرئيسية | هيرو بلقطات، وقبل/بعد وخطوات بالكود، وجولة بلقطات من Supabase، وصور حقيقية للرسالة | «قبل/بعد» بلا مشهد يلمسه الزائر | مشهدان: مكتب قبل ومكتب بعد | عالية |
| `/ihkaam` | معرض لقطات المكتب والجوال (7+5)، وأدوار بمشاهد | معرض كامل الشاشة متشابه | عنوان يشرح كل لقطة، واقتطاع يبرز عنصراً واحداً | متوسطة |
| تواصل | مشهد `feat-messages` (مكرر) | ليس خاصاً بالصفحة | مشهد خاص | متوسطة |
| طلب النسخة `/request` والتقييم `/review` | لا شيء | صفحات جافة | مشهد دافئ لكل منهما | متوسطة |
| من نحن | صورة المؤسس وملف PDF، ومعرض | كافية | لا تغيير | — |
| الشراكة `/affiliate` | 4 صور (لقطة ومشاهد مكررة) | تكرار | لا أولوية | منخفضة |
| الأدوات `/tools` | رسوم SVG برمجية | جيدة | لا تغيير | — |
| 404 | لا شيء | فرصة | مشهد هادئ بمساحة فارغة | منخفضة |
| الشروط والخصوصية | لا شيء | لا حاجة | لا تغيير | — |

## قرار سابق يتعارض مع الطلب الجديد

في `src/data/helpVisuals.js` (2026-11-20): «لا مشاهد مولّدة في مركز المساعدة، والشرح الذي لا لقطة لشاشته يبقى بلا صورة». أقترح تعديله هكذا:
- **خطوات الشرح** تبقى لقطات حقيقية، لكن مقتطَعة ومشروحة، ولا مشاهد مولّدة فيها.
- **ترويسات التصنيفات التسعة** يجوز أن تأخذ مشاهد مولّدة (اختيارية).
- شرحا `signup` و`payment` يأخذان رسماً توضيحياً بالكود (خطوات مرقّمة) لا لقطة.

## ما أنفذه أنا بالكود (بلا رصيد)

1. مكوّن `ShotCrop`: اقتطاع منطقة من لقطة موجودة مع سهم وتسمية، يقرأ إحداثياتها من ملف بيانات. أبدأ بأكثر ستة شروحاً زيارة: `login`، `dashboard-overview`، `student-registration`، `daily-recitation`، `attendance-batch`، `parent-portal`.
2. إزالة التكرار: كل موضع يأخذ اقتطاعاً مختلفاً من اللقطة نفسها.
3. «قبل/بعد» مرسوم لكل ميزة من بيانات `problem`/`solution` الموجودة في `featureDetails.js`.
4. رسم خطوات مرقّم لـ`signup` و`payment`.
5. نص بديل وصفي (alt) للصور المزخرفة التي تحمل معنى، وفحص الأبعاد والتحميل الكسول.
6. قياس وزن الصفحة قبل الإضافة وبعدها (بنود LCP وTBT 25 و26).

## ما تولّده أنت: 12 مشهداً أولوية، و9 اختيارية

التكلفة: 12 × 190 = 2,280 رصيداً (الاختيارية 1,710). الأسلوب نفسه: 16:9، بلا نص ووجوه ولا واجهات تطبيق مزيفة، على كريمي وأخضر غامق وذهبي خافت. **التنويع مقصود:** كل مشهد في بيئة مختلفة (مكتب مدير، قاعة حلقة، صالة بيت، رف) حتى لا يتكرر القلم النحاسي والمسبحة.

الجملة الختامية المشتركة (تُلصق في آخر كل برومبت):

```
Palette: cream, deep green, muted gold only. Shallow depth of field, calm, premium. No text, no letters, no numbers, no people, no faces, no logos, no device screens showing interface.
```

### الأولوية

1. `home-before` (الرئيسية، قسم قبل)
```
Photorealistic editorial still life, 16:9 landscape, a director's wooden desk in muted dim warm light covered in disorder: stacked paper registers, loose sheets, binders spilling, scattered blank sticky notes, a tangled phone charger, a half-open drawer, a brass lamp casting a tired glow. Cream and deep green tones with muted gold accents only.
```

2. `home-after` (الرئيسية، قسم بعد)
```
Photorealistic editorial still life, 16:9 landscape, the same kind of wooden desk now calm and ordered in bright morning light: three aligned deep-green folders with gold edges, a closed slim laptop, one open ledger with blank lined pages, a tidy brass pen tray, a small plant, a brass lamp turned off.
```

3. `feature-admin` (ميزة الإدارة)
```
Photorealistic editorial interior, 16:9 landscape, a quiet director's office: a wooden desk with a blank brass nameplate, a wall shelf behind with rows of deep-green archive boxes with gold edges and blank labels, a window with sheer curtains and soft daylight, a leather chair, no people.
```

4. `feature-academic` (ميزة الإدارة الأكاديمية)
```
Photorealistic editorial interior, 16:9 landscape, a bright empty learning room with a cream carpet and carved wooden Quran stands arranged in two neat circles, each holding a closed deep-green mushaf, arched window with geometric screen and golden daylight, no people.
```

5. `feature-daily` (ميزة المتابعة اليومية)
```
Photorealistic editorial still life, 16:9 landscape, early morning light on a low wooden shelf: a row of small blank wooden name tags standing in a line, one tilted forward, a closed mushaf on a carved stand beside them, a brass pointer pen, a green pot plant softly blurred.
```

6. `feature-parents` (ميزة بوابة ولي الأمر)
```
Photorealistic editorial still life, 16:9 landscape, a cozy living room low table in warm evening lamp light: a smartphone lying face-down, a small cup of tea on a patterned saucer, a closed leather mushaf, dark green prayer beads, a soft cream cushion behind. Home atmosphere, no people.
```

7. `feature-reports` (ميزة التقارير)
```
Photorealistic editorial still life, 16:9 landscape, soft daylight on a cream desk: a neat stack of bound report folders with deep-green spines and gold edges, a brass magnifying glass, a printed blank chart sheet with thin green and gold bars (no numbers, no letters), a brass paper clip, a pen.
```

8. `feature-insights` (ميزة التحليل الذكي)
```
Photorealistic editorial still life, 16:9 landscape, soft daylight on a cream desk: a printed blank line chart sheet with two thin lines in deep green and gold trending apart (no axis labels, no numbers), a brass compass lying on it, a brass magnifying glass, a small closed notebook.
```

9. `page-contact` (تواصل)
```
Photorealistic editorial still life, 16:9 landscape, soft window light on a cream desk: a classic brass desk telephone, a small cup of tea, a blank cream notepad with a pen, a sealed cream envelope with a green wax seal, a potted plant.
```

10. `page-request` (طلب النسخة)
```
Photorealistic editorial still life, 16:9 landscape, soft daylight on a cream folder with a deep-green ribbon, a small brass key resting on top, a blank welcome card with a thin gold border, a brass pen, light spilling from an open door softly blurred in the background.
```

11. `page-review` (التقييم)
```
Photorealistic editorial still life, 16:9 landscape, soft daylight on a cream desk: a blank cream thank-you card with a thin gold border standing upright, an olive branch in a small ceramic vase, a brass pen, a closed leather book with gold edges.
```

12. `page-404`
```
Photorealistic editorial still life, 16:9 landscape, a quiet empty wooden bookshelf niche with a single closed deep-green mushaf and a brass lantern, large areas of calm negative space on the right, soft warm light.
```

### اختيارية: ترويسات تصنيفات المساعدة (بعد قرارك)

كل واحدة 16:9 بالأسلوب نفسه، بيئة مختلفة، وتتبع الجملة الختامية المشتركة:

- `help-getting-started`: a cream doorway with an open wooden door and a brass key on a small table inside.
- `help-students`: a row of low wooden school desks with closed green notebooks, empty, soft morning light.
- `help-daily`: a teacher's lectern with a clipboard and a brass pointer pen beside a carved Quran stand.
- `help-exams`: an examiner's table with two chairs, a brass bell and a sand timer, a closed mushaf.
- `help-finance`: a closed green ledger, a small brass scale, and a stack of cream envelopes with a green wax seal.
- `help-reports`: a printer tray with a neat sheaf of blank pages and a brass stapler, soft light.
- `help-insights`: a brass magnifying glass over a blank line chart sheet with thin green and gold lines.
- `help-parents`: a living room armchair corner with a lamp, a tea cup and a closed mushaf.
- `help-staff`: a coat rack with a deep-green cloak and a cream scarf beside a blank name board.

## الترتيب المقترح

1. ارتكاب ودفع العمل الحالي (لا يُخلط بغيره).
2. أنفّذ بنود الكود (1 إلى 6) على الفرع نفسه.
3. تولّد أنت المشاهد الاثني عشر، فأدمجها في الصفحات.
4. بعد قرارك بشأن ترويسات التصنيفات، نكمل الاختيارية وبقية شروح المساعدة.
