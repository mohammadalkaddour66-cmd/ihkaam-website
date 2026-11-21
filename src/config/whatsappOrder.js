/* ══════════════════════════════════════════════════════════════════
   رسالة الطلب على واتساب (2026-11-20)

   بعد حفظ الطلب يُفتح واتساب إحكام برسالةٍ جاهزة فيها رقم الطلب والباقة
   والإضافات والمجموع، فتبدأ المحادثة والمدير متحمّس بدل أن ينتظر اتصالنا.
   و«ابدأ مجاناً» لباقة «حلقة» يفتح واتساب مباشرةً بلا استمارة.
   ══════════════════════════════════════════════════════════════════ */
import { PAID_ADDON_IDS } from './addons'
import { usd, TRIAL_DAYS } from './plans'

export const IHKAAM_WHATSAPP = '963947409106'

export const waLink = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`

/* «معهد متوسط + الحزمة الكاملة» أو «معهد صغير + الإدارة المالية ونجم الحلقة» */
function planLine(plan, features) {
  if (!features.length) return plan.name
  const all = PAID_ADDON_IDS.every(id => features.some(f => f.id === id))
  if (all) return `${plan.name} + الحزمة الكاملة (${features.map(f => f.name).join('، ')})`
  return `${plan.name} + ${features.map(f => f.name).join(' و')}`
}

export function orderMessage({ ref, plan, cycle, features = [], total, institute, manager }) {
  const unit = cycle === 'annual' ? 'سنوياً' : 'شهرياً'
  return [
    `السلام عليكم، طلب رقم ${ref}: ${planLine(plan, features)}، ${usd(total)} ${unit}.`,
    `اسم المعهد: ${institute}`,
    `المشرف: ${manager}`,
    `أريد بدء التجربة المجانية ${TRIAL_DAYS} يوماً.`,
  ].join('\n')
}

export const FREE_PLAN_MESSAGE = [
  'السلام عليكم، أريد تفعيل باقة «حلقة» المجانية في إحكام (حلقة واحدة حتى 30 طالباً).',
  'اسم الحلقة أو المسجد: ',
].join('\n')

