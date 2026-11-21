/* مواصفة اقتطاعات شرح «تسجيل طالب جديد». الصيغة في رأس scripts/help-crops.mjs. */
export default {
    slug: 'student-registration',
    screen: 'تسجيل الطلاب',
    title: 'تسجيل طالب جديد',
    steps: {
      1: { targets: ['el:الطلاب الحاليون', 'el:المُزالون وغير الموزَّعين', 'el:تسجيل طالب جديد'], pad: [24, 36] },
      2: { targets: ['field:ربط بعائلة مسجلة مسبقاً'] },
      3: { targets: ['field:الاسم الكامل', 'field:اسم الأب'] },
      4: { targets: ['field:اسم الأم', 'field:الجنس'] },
      5: { targets: ['field:تاريخ ومكان الولادة', 'field:السكن الحالي'] },
      6: { targets: ['field:رقم الهاتف', 'field:مهنة الوالد'] },
      7: { targets: ['field:تاريخ التسجيل', 'field:تعيين في حلقة'] },
      8: { targets: ['field:هل الطالب يتيم؟', 'field:صورة شخصية', 'field:صورة دفتر العائلة'] },
      9: { targets: ['el:حفظ البيانات', 'el:إلغاء'], pad: [24, 24] },
    },
}
