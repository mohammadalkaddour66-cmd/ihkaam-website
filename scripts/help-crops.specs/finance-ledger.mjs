/* مواصفة اقتطاعات شرح «حركة الصندوق والتحليل المالي». من «معهد النموذج» (وضع العرض، قراءة فقط).
   لا يُضغط «إضافة حركة مالية»؛ جدول الحركات يُستثنى (فيه أسماء طلاب) فلا يدخل اقتطاعاً غير رأسه. */
import { enterShowcase, hideFrame, overlay } from './smart-insights.mjs'
const clickText = (page, text) => page.getByText(text, { exact: true }).first().click()
export default {
  slug: 'finance-ledger',
  title: 'حركة الصندوق',
  prepare: async (page, h) => {
    await enterShowcase(page)
    await h.openScreen('الإدارة المالية')
    await hideFrame(page)
    await clickText(page, 'حركة الصندوق')
    await page.waitForTimeout(2500)
  },
  steps: {
    1: { targets: ['el:التحليل المالي', 'el:حركة الصندوق', 'el:إدارة الأقساط'], pad: [24, 14] },
    2: { targets: ['el:إضافة حركة مالية جديدة', 'el:دخل (+)', 'el:مصروف (-)'], pad: [24, 12] },
    3: { targets: ['field:التصنيف', 'field:العملة', 'field:المبلغ', 'field:تاريخ العملية'], pad: [24, 8] },
    4: { prepare: async (page) => { await overlay(page, () => document.querySelector('input[placeholder*="سبب الدفع"]'), 'سبب الدفع أو القبض...') },
         targets: ['el:البيان / ملاحظات', 'el:سبب الدفع أو القبض...'], pad: [24, 12] },
    5: { targets: ['el:إضافة حركة مالية'], pad: [24, 14] },
    6: { targets: ['el:من تاريخ', 'el:إلى تاريخ', 'el:التاريخ', 'el:بواسطة', 'el:إجراء'], pad: [24, 10] },
    7: { prepare: async (page) => { await clickText(page, 'التحليل المالي'); await page.waitForTimeout(2500)
       await page.getByRole('button', { name: /^\$\s*دولار$/ }).first().click(); await page.waitForTimeout(600)
       await page.getByRole('button', { name: 'كل الأوقات' }).first().click(); await page.waitForTimeout(2000) },
         targets: ['el:العملة', 'el:الفترة', 'el:مخصص', 'el:واردات', 'el:مصاريف'], pad: [24, 56] },
  },
}
