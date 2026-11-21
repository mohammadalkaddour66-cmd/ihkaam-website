/* ══════════════════════════════════════════════════════════════════
   باقات الاشتراك (2026-11-20، بقرار المالك)

   حلّت محلّ حاسبة «رسم ثابت + سعر لكل طالب». كل باقة سقفٌ من الطلاب النشطين
   بسعرٍ ثابت، والسنوي = عشرة أشهر (شهران مجاناً). الإضافات المدفوعة تبقى
   اختيارية فوق أي باقة مدفوعة، وسنويّها بالقاعدة نفسها.

   هذا الملف هو المصدر الوحيد للأسعار في الموقع: صفحة /request وصفحة الدفع
   تقرآن منه. جدول system_settings (base_platform_fee / per_student_fee) لم
   يعد يُقرأ في الموقع.
   ══════════════════════════════════════════════════════════════════ */

/* الأسماء تقول الحجم بكلمات المدير نفسه، و«حلقة» للمجانية لأنها حلقة واحدة حرفياً.
   ما فوق 500 طالب (أو جمعية، أو مكتب حلقات) عرضٌ خاص يبدأ من CUSTOM_FROM_USD، لا بطاقة. */
export const PLANS = [
  { id: 'halaqa', name: 'حلقة',       note: 'حلقة واحدة', max: 30,  monthly: 0,  annual: null, kind: 'free',
    pitch: 'لمعلمٍ واحد يبدأ مع طلاب حلقته.' },
  { id: 'small',  name: 'معهد صغير',  max: 100, monthly: 10, annual: 100,
    pitch: 'لمعهدٍ ناشئ أو حلقات مسجدٍ واحد.' },
  { id: 'medium', name: 'معهد متوسط', max: 250, monthly: 15, annual: 150, popular: true,
    pitch: 'لمعهدٍ بحلقاتٍ ومختبِرين وإدارة.' },
  { id: 'large',  name: 'معهد كبير',  max: 500, monthly: 25, annual: 250,
    pitch: 'لمعهدٍ بأقسام ذكور وإناث وعشرات الحلقات.' },
]

export const CUSTOM_FROM_USD = 35

/* تجربة مجانية قبل الدفع لكل باقة مدفوعة (قرار المالك 2026-11-20)، والدفع بعدها */
export const TRIAL_DAYS = 14
export const PAYMENT_METHOD = 'شام كاش'

import { PAID_ADDON_IDS, ADDONS_BUNDLE_USD } from './addons'

export const CYCLES = { monthly: { label: 'شهري', months: 1 }, annual: { label: 'سنوي', months: 12 } }

/* الإضافة السنوية بقاعدة الباقات نفسها: عشرة أشهر */
export const ANNUAL_MONTHS_CHARGED = 10

export const getPlan = (id) => PLANS.find(p => p.id === id) || null

export const isPaid = (p) => p && !p.kind

/* سعر الباقة للدورة المختارة؛ المجانية صفر والخاصة null */
export function planPrice(p, cycle) {
  if (!p || p.kind === 'custom') return null
  if (p.kind === 'free') return 0
  return cycle === 'annual' ? p.annual : p.monthly
}

export function addonPrice(monthlyUsd, cycle) {
  return (monthlyUsd || 0) * (cycle === 'annual' ? ANNUAL_MONTHS_CHARGED : 1)
}

/* مجموع الإضافات المختارة للدورة، والثلاث معاً بسعر الحزمة.
   يعيد { total, full } حيث full المجموع قبل الحزمة، ليُظهر الفرق. */
export function addonsTotal(selectedRows, cycle) {
  const full = selectedRows.reduce((s, f) => s + addonPrice(f.price_usd_monthly, cycle), 0)
  const all  = PAID_ADDON_IDS.every(id => selectedRows.some(f => f.id === id))
  return { full, total: all ? addonPrice(ADDONS_BUNDLE_USD, cycle) : full }
}

/* «15» لا «15.00»، و«12.5» حين يكون فيه كسر */
export const usd = (n) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`
