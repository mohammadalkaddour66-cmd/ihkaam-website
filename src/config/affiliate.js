/* ══════════════════════════════════════════════════════════════════
   برنامج الشراكة (2026-11-20، بقرار المالك)

   العمولة: 20% من أول اشتراك سنوي يدفعه المعهد، مرةً واحدة. لا عمولة على
   الاشتراك الشهري (مبلغه صغير لا يحرّك أحداً) ولا على الباقة المجانية ولا
   على التجديد. تُحتسب بعد استلام الدفعة الفعلية لا عند التسجيل أو التجربة.

   أرقام الأمثلة في الصفحة تُحسب من plans.js (المصدر الوحيد للأسعار)، فلا
   يبقى رقمٌ قديم إن تغيّر سعر باقة.

   تنبيه: النسبة المخزّنة في platform_settings (commission_first_rate) هي
   التي يحسب بها التطبيق ولوحة الشريك ما يُدفع فعلاً. يجب أن تُضبط على 20
   من لوحة السوبر أدمن كي يطابق الصرفُ ما تعِد به هذه الصفحة.
   ══════════════════════════════════════════════════════════════════ */

import { PLANS, isPaid } from './plans'

export const AFFILIATE_PCT      = 20
export const AFFILIATE_WINDOW_D = 30      /* أيام بقاء رمز الإحالة بعد نقرة الرابط */
export const AFFILIATE_ORIGIN   = 'https://ihkaam.app'

/* أمثلة العمولة لكل باقة سنوية مدفوعة */
export const AFFILIATE_EXAMPLES = PLANS.filter(p => isPaid(p) && p.annual).map(p => ({
  id    : p.id,
  name  : p.name,
  max   : p.max,
  annual: p.annual,
  earn  : Math.round((p.annual * AFFILIATE_PCT) / 100),
  popular: !!p.popular,
}))

/* رمز بحروف لاتينية وأرقام بلا ما يلتبس (0/O و1/I): يصلح رابطاً وكلاماً */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function generateAffiliateCode() {
  const bytes = new Uint32Array(6)
  crypto.getRandomValues(bytes)
  return 'IHK-' + Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')
}

export const affiliateLink = (code) => `${AFFILIATE_ORIGIN}/?ref=${code}`
