/* ISS-46: الإضافات المدفوعة ثلاث فقط: الإدارة المالية، المواد الرديفة، نجم الحلقة.
   المعرّفات من جدول store_features. كل ما سواها جزء من النسخة الأساسية. */
export const PAID_ADDON_IDS = ['finance', 'radif', 'star_of_week']

/* أسعار الإضافات الشهرية في الموقع (2026-11-20، بقرار المالك). تحلّ محلّ
   price_usd_monthly في جدول store_features، فالجدول ما زال على 10$ لكلٍّ منها.
   والثلاث معاً بسعر حزمة أقل من مجموعها. */
export const ADDON_PRICE_USD = { finance: 6, radif: 4, star_of_week: 3 }
export const ADDONS_BUNDLE_USD = 10

/* سطرٌ واحد لكل إضافة في صفحة الباقات (أوصاف القاعدة فقرات طويلة لا تُقرأ
   في بطاقة سعر)، ورابط صفحتها /ihkaam/addons/:slug لمن يريد التفاصيل. */
export const ADDON_INFO = {
  finance     : { slug: 'finance',  line: 'الأقساط والصندوق والمصاريف، ومن تأخّر عن الدفع، في شاشة واحدة.' },
  radif       : { slug: 'subjects', line: 'الفقه والعقيدة وغيرهما من المواد، بمناهجها ودرجاتها، بجانب التسميع.' },
  star_of_week: { slug: 'star',     line: 'يرشّح النظام أفضل طلاب الأسبوع بالنقاط، وتصل شهادة التكريم لأهله.' },
}

/* يُطبَّق على صفوف store_features بعد جلبها */
export const withSitePrices = (rows) => rows
  .filter(f => PAID_ADDON_IDS.includes(f.id))
  .map(f => ({ ...f, price_usd_monthly: ADDON_PRICE_USD[f.id] ?? f.price_usd_monthly }))

export const INCLUDED_IN_BASE_NOTE =
  'المكتبة الصوتية وطابور الاختبارات وملاحظات أولياء الأمور ضمن النسخة الأساسية دون رسوم إضافية.'
