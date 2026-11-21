/* مواصفة اقتطاعات شرح «نقل بيانات طلابك من الورق أو Excel إلى إحكام». الصيغة في رأس scripts/help-crops.mjs.
   تفتح نافذة «استيراد الطلاب من ملف» للمعاينة فقط (لا رفع ولا لصق ولا تأكيد) وتغلقها بزر X.
   تحذير خصوصية: تحت نموذج «تسجيل الطلاب» جدول فيه أسماء وأرقام هواتف، فلا تضف هدفاً تحت حقول النموذج. */

export default {
  slug: 'moving-student-data',
  screen: 'تسجيل الطلاب',
  title: 'تسجيل الطلاب',
  steps: {
    3: { targets: ['el:تسجيل طالب جديد', 'el:استيراد من ملف إكسل'], pad: [24, 5] },
    4: {
      targets: ['el:استيراد الطلاب من ملف', 'el:طابِق الأعمدة', 'el:راجع قبل الحفظ', 'el:تمّ الاستيراد'], pad: [64, 18],
      prepare: async (page) => {
        await page.getByText('استيراد من ملف إكسل').first().click()
        await page.waitForTimeout(1500)
      },
    },
    5: {
      targets: ['el:اسحب ملف الطلاب هنا أو اضغط للاختيار', 'el:الصق الأسماء مباشرة (من إكسل أو رسالة)'], pad: [24, 18],
      prepare: async (page) => {
        // يجعل المربع المنقّط كله هو المستطيل المعلَّم لا سطر النص وحده
        await page.evaluate(() => {
          const t = [...document.querySelectorAll('body *')].find(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim() === 'اسحب ملف الطلاب هنا أو اضغط للاختيار'))
          let p = t
          while (p && p !== document.body && !/dashed/.test(getComputedStyle(p).borderTopStyle)) p = p.parentElement
          if (p && p !== document.body) { p.setAttribute('role', 'tab'); if (t.tagName !== 'SPAN' && t.tagName !== 'P') { const s = document.createElement('span'); s.textContent = 'اسحب ملف الطلاب هنا أو اضغط للاختيار'; s.style.cssText = 'position:absolute;opacity:0;width:1px;height:1px;overflow:hidden'; p.appendChild(s) } }
        })
      },
    },
    6: { targets: ['el:لا حاجة لقالب جاهز.', 'el:حسابات أولياء الأمور تُنشأ تلقائياً عند أول دخول لهم برقم الهاتف، فلا شيء إضافي عليك.'], pad: [24, 14] },
    8: {
      targets: ['field:تعيين في حلقة'], pad: [24, 14],
      prepare: async (page) => {
        // إغلاق النافذة بزر X في ترويستها
        await page.locator('h3:has-text("استيراد الطلاب من ملف")').locator('xpath=ancestor::div[.//button][1]').locator('button').first().click()
        await page.waitForTimeout(900)
      },
    },
    9: { targets: ['field:ربط بعائلة مسجلة مسبقاً'], pad: [24, 14] },
  },
}
