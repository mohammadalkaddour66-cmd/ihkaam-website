/* مواصفة اقتطاعات شرح «أرشفة ملفات المعهد». الصيغة في رأس scripts/help-crops.mjs.
   الخطوة 4 تختار ملفاً وهمياً في الذاكرة داخل المتصفح فقط (يملأ حالة الشاشة المحلية؛ لا رفع قبل «حفظ ورفع»، ولا يُضغط). */
export default {
    slug: 'archiving',
    screen: 'الأرشفة',
    title: 'الأرشفة الإلكترونية السحابية',
    steps: {
      1: { targets: ['el:الأرشفة الإلكترونية السحابية', 'el:سعة التخزين (1 جيجا)'], pad: [24, 24] },
      2: { targets: ['el:ملفات الطلاب', 'el:ملفات الكادر', 'el:تعاميم وقرارات', 'el:غير ذلك'], pad: [20, 58] },
      3: { targets: ['el:رفع ملف جديد', 'field:تصنيف الملف'], pad: [24, 16] },
      4: { targets: ['el:اضغط لاختيار ملف', 'el:يتم ضغط الصور تلقائياً لتوفير المساحة'], pad: [40, 62] },
      5: {
        targets: ['field:قم بتسمية الملف'], pad: [24, 18],
        prepare: async (page, h) => {
          await page.locator('input[type=file]').setInputFiles({ name: 'تعميم.pdf', mimeType: 'application/pdf', buffer: Buffer.from('x') })
          await h.sleep(800)
        },
      },
      6: { targets: ['el:حفظ ورفع', 'el:إلغاء'], pad: [24, 24] },
      7: { targets: ['el:أحدث الملفات المرفوعة', 'el:اسم الملف', 'el:إجراءات'], pad: [60, 12] },
    },
}
