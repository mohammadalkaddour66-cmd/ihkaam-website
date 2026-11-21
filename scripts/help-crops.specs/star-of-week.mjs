/* مواصفة اقتطاعات شرح «نجم الأسبوع». الشاشة من «معهد النموذج» (وضع العرض للقراءة فقط)؛ الوحدة غير مفعّلة في معهد العرض العادي.
   لا يُضغط «تتويج النجم وإرسال الإشعار»: تُقتطع المنطقة فقط. الأسماء الظاهرة (ثلاثة مرشحين) هي ما نُشر في لقطة الموقع. */
import { enterShowcase, hideFrame, overlay } from './smart-insights.mjs'

export default {
  slug: 'star-of-week',
  title: 'نجم الأسبوع',
  prepare: async (page, h) => {
    await enterShowcase(page)
    await page.waitForTimeout(3000)
    await h.openScreen('نجم الأسبوع')
    await hideFrame(page)
  },
  steps: {
    1: { targets: ['el:نجم الأسبوع', 'el:التتويج', 'el:سجل الأبطال'], pad: [40, 30] },
    2: { targets: ['el:اختر الحلقة للتحليل:', 'el:فترة التقييم:', 'el:آخر 7 أيام', 'el:تحديد مخصص'], pad: [30, 30] },
    3: { prepare: async (page) => { await page.getByRole('button', { name: 'تحديد مخصص' }).click(); await page.waitForTimeout(700) },
         targets: ['el:تحديد مخصص', 'el:من تاريخ:', 'el:إلى تاريخ:'], pad: [30, 30] },
    4: { prepare: async (page) => { await page.getByRole('button', { name: 'آخر 7 أيام' }).click(); await page.waitForTimeout(500) },
         targets: ['el:ابدأ التحليل والترشيح'], pad: [30, 24] },
    5: { prepare: async (page) => { await page.getByRole('button', { name: 'ابدأ التحليل والترشيح' }).click(); await page.waitForTimeout(5000)
                      await overlay(page, () => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() === 'نقطة'), 'نقطة') },
         targets: ['el:المرشحون الأوائل:', 'el:إلغاء التحليل', 'el:نقطة'], pad: [30, 44] },
    6: { prepare: async (page) => { await page.getByText('نقطة', { exact: true }).nth(2).click(); await page.waitForTimeout(900) },
         targets: ['el:الصفحات', 'el:معدل التسميع', 'el:الغياب'], pad: [60, 24] },
    7: { targets: ['field:تحديد بطل يدوياً (للدعم والتشجيع):'], pad: [30, 20] },
    8: { targets: ['el:الطالب المختار للتتويج:', 'el:إنجازات نجم الأسبوع', 'el:رسالة المعلم (ستظهر للأهل):', 'el:تتويج النجم وإرسال الإشعار'], pad: [30, 24] },
    10: { prepare: async (page) => { await page.getByRole('button', { name: 'سجل الأبطال' }).click(); await page.waitForTimeout(2500) },
          targets: ['el:أرشيف أبطال المعهد', 'el:تاريخ التتويج', 'el:الفترة المخصصة', 'el:اسم النجم والحلقة', 'el:إنجازاته (المعايير المفعَّلة)', 'el:النقاط', 'el:رسالة المعلم التشجيعية', 'el:الإجراءات'], pad: [30, 14] },
  },
}
