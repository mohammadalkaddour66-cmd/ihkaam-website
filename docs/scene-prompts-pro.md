# برومتات المشاهد الاحترافية: 12 أولوية و9 اختيارية

كُتب: 2026-11-21. تحلّ محل برومتات `docs/visuals-audit.md`. الأربع عشرة الأولى (`docs/scene-prompts.md`) مولَّدة ولا تُعاد.

## نظام الأسلوب (لتبقى العائلة كلها منسجمة)

كل برومبت = وصف المشهد + الجملة الختامية المشتركة (S) في آخره. الجملة S تثبّت اللوحة (كريمي `#F8F5EC`، وأخضر حبري `#0B3B33` و`#1F6F52`، وذهبي نحاسي `#B8863A`) وخامات مطفأة وإضاءة نافذة طبيعية، وتمنع النص والوجوه والأيدي وواجهات الشاشات.

```
S = Premium editorial photograph, natural directional window light, warm 4500K, full-frame look, subtle film grain, generous negative space, 16:9. Palette strictly cream #F8F5EC, deep ink-green #0B3B33/#1F6F52, muted brass-gold #B8863A, natural walnut. Matte materials. No readable or pseudo text (no Arabic, Latin letters or numerals), no logos, no people, no hands, no faces, no screens showing interfaces, no neon, no plastic, no glossy stock look.
```

## ملاحظات التوليد

- 16:9 بدقة 1280×720 أو أعلى، وأحوّلها أنا. وإن وُلّدت صورتان لكل مشهد فاختر الأوضح.
- **صور الميزات (3 إلى 8) تُقتطع في الصفحة إلى 4:3**: لذلك كل مادة مهمة داخل الـ70% الوسطى من الإطار.
- **زوج الرئيسية (1 و2):** وَلِّد الأولى، ثم اجعلها مرجعاً (reference) للثانية بنموذج يدعم التعديل، حتى تبقى الغرفة والنافذة وزاوية الكاميرا هي نفسها وتتغير الحال فقط. الزاوية الثابتة ضرورية لأن القسم يعرضهما متقابلين.
- **أعد التوليد** إن ظهر أي حرف أو رقم أو واجهة على شاشة أو يد أو وجه. أكثر المواضع عرضة: الأوراق الفارغة والمخططات (7 و8) وسند الإيصالات.
- المشاهد **زخرفية**: تُعرض بلا شرح يدّعي ما فيها، وبـ`alt` فارغ. التفسير يتحمله اللقطة الحقيقية المشروحة والرسم، لا المشهد.

## الأولوية (12)

1. `home-before`
```
Eye-level 35mm, locked-off tripod shot across a director's walnut desk in disorder, low tired amber light from a window on the left in late afternoon. Stacks of paper registers leaning, blank sheets fanned and curling, three open binders, a drawer half pulled with folders spilling, blank cream sticky notes scattered, a tangled charger cable, a brass lamp slightly tilted, a cold tea glass. Heavy, muted mood. Desk edge on the lower third, window on the left, all key props inside the central 70% of the frame.
```

2. `home-after` (باستعمال الأولى مرجعاً)
```
Edit the reference image. Keep the exact same camera position, lens, framing, walnut desk and window. Change only the state and the light: bright clear morning light from the left, the desk now calm and orderly. Three aligned ink-green folders with gold edges, one closed slim laptop in a cream sleeve, one open ledger with blank ruled pages, a brass pen tray, a small olive plant, the brass lamp upright and switched off, nothing else on the desk.
```

3. `feature-admin`
```
Wide 28mm, a quiet director's office at mid-morning: a walnut desk at the center with a blank brass nameplate and one closed leather folder, behind it a wall shelf of ink-green archive boxes with gold edges and blank labels in a perfect grid, a leather chair, a tall window with sheer curtains. Symmetrical composition with the desk in the central third.
```

4. `feature-academic`
```
Wide 24mm, symmetrical: a bright empty learning room with a cream wool carpet and carved walnut Quran stands arranged in two concentric arcs, each holding a closed ink-green mushaf, a tall arched window with a geometric mashrabiya screen casting patterned light across the floor, golden late-morning light. Leading lines toward the window, calm and ordered.
```

5. `feature-daily`
```
Early morning side light, 85mm at f/2: a long low walnut shelf with a row of seven small blank wooden name tags standing evenly, the fourth tilted slightly forward as if just called, a closed mushaf on a carved stand at the right, a brass pointer pen, a softly blurred plant behind. Rhythm and order.
```

6. `feature-parents`
```
Intimate 50mm at f/2, a living-room low table at dusk in warm lamp light: a smartphone lying face-down in a cream leather case on a linen runner, a small tea glass on a patterned saucer, a closed leather mushaf, ink-green prayer beads, a cream cushion and drawn curtains softly blurred behind. Domestic warmth, nobody present.
```

7. `feature-reports`
```
45-degree top view, 50mm, soft north light on a cream desk: a neat stack of bound report folders with ink-green spines and brass edging, a brass magnifying glass, a printed blank bar-chart sheet with five thin horizontal bars in green and gold and no axes or labels, a brass paper clip, a fountain pen.
```

8. `feature-insights`
```
Low-angle 50mm at f/2.8, raking light from the right on a cream desk: a printed blank line-chart sheet with two thin lines (ink-green and brass-gold) gradually diverging and no axes or numbers, a brass compass resting on the sheet, a brass magnifying glass leaning on a closed notebook, long soft shadows.
```

9. `page-contact`
```
35mm window-lit still life on a cream desk: a brass service bell, a small tea glass, an unopened cream envelope with an ink-green wax seal, a blank notepad with a pen, a potted plant at the edge. Warm and welcoming, with open space on the left side of the frame for overlay text.
```

10. `page-request`
```
50mm at f/2, bright doorway light creating a luminous soft bokeh in the background: a cream linen folder tied with an ink-green ribbon, a small brass key resting on top, a blank welcome card with a thin gold border. A sense of beginning and welcome.
```

11. `page-review`
```
Afternoon window light, 85mm at f/2: a blank cream card with a thin gold border standing upright, an olive branch in a small ceramic vase, a brass pen, a closed leather book with gold edges. Soft, grateful, quiet.
```

12. `page-404`
```
Architectural minimal 35mm: an empty walnut bookshelf niche in a cream plaster wall holding a single closed ink-green mushaf and a brass lantern on the left half, the right half left as calm negative space, soft warm light grazing the wall.
```

## اختيارية: ترويسات تصنيفات مركز المساعدة (9)

13. `help-getting-started`
```
35mm, a cream interior doorway with an open walnut door spilling bright light, a small console table just inside holding a brass key and a closed ink-green folder. Inviting and bright.
```

14. `help-students`
```
50mm, a row of low walnut school desks in soft morning light, each with a closed ink-green notebook and a brass pencil holder, receding into soft focus. Nobody present.
```

15. `help-daily`
```
50mm, a walnut lectern with a clipboard sheet of empty checkboxes and a brass pointer pen beside a carved Quran stand, soft window light from the left.
```

16. `help-exams`
```
35mm, an examiner's walnut table with two empty chairs, a brass service bell and a small sand timer, a closed mushaf, soft north light.
```

17. `help-finance`
```
50mm, a closed ink-green ledger, a small brass balance scale and a fan of cream envelopes with ink-green wax seals on a walnut desk, warm side light.
```

18. `help-reports`
```
Overhead 35mm, a printer output tray holding a neat sheaf of blank pages with a brass stapler beside it on a cream desk, soft diffused light.
```

19. `help-insights`
```
Macro 85mm at f/2, a brass magnifying glass hovering over a blank line-chart sheet with two thin ink-green and brass-gold lines, very shallow depth of field.
```

20. `help-parents`
```
50mm, an armchair corner with a standing lamp glowing, a tea glass on a small side table and a closed leather mushaf resting on the arm, warm dusk light.
```

21. `help-staff`
```
35mm, a walnut coat rack holding a deep ink-green cloak and a cream scarf beside a blank wooden name board, soft side light on a plaster wall.
```

## تسمية الملفات

أرسل كل صورة مع الاسم الذي بعد الرقم (مثلاً `feature-admin`). أحوّلها إلى `public/scenes/<name>.webp` (1280×720) و`<name>-sm.webp` (640×360). مشاهد المقالات الأربعة عشر تُرسَل بأسماء slugs المقالات كما في `docs/scene-prompts.md`.
