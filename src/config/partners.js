/* ══════════════════════════════════════════════════════════════════
   المعاهد التي تظهر في الموقع: شريط «شركاء النجاح» (IhkaamPartners) وبطاقات
   قصص النجاح (IhkaamSuccessStories). قاعدة الترشيح واحدة للاثنين (ISS-40)،
   فلا يظهر حسابٌ تجريبيّ أو مكرَّر في أحدهما ويغيب عن الآخر.

   مصدر الصفوف:
   • المنظر public_partners (ترحيل supabase/migrations/20260816_partners_paid_only.sql)
     يُسقط التجريبيّ من جهة القاعدة، لأن جدول الاشتراكات مقفلٌ أمام الزائر.
     لم يُطبَّق على الإنتاج بعد، والطلب عليه كان يعيد 404 في كل زيارة ثم
     يتبعه طلبٌ ثانٍ متسلسل (ISS-28). فلا يُطلب إلا إذا ضُبط
     VITE_PARTNERS_VIEW=1 في بيئة البناء — بعد تطبيق الترحيل.
   • وإلا: institute_settings بالاستعلام نفسه الذي تقرؤه الشهادات، فيُرسَل
     طلبٌ واحد يتشاركه الثلاثة (supabaseClient يوحّد الطلبات المتطابقة).
   ══════════════════════════════════════════════════════════════════ */
import { supabase } from './supabaseClient'
import { getActiveIds } from './activeInstitutes'

/* العَلَم نفسه يعني «طُبّقت ترحيلات القراءة العامة» (20260816 و20261120b):
   المنظر public_partners والدالة get_institute_logos (ISS-35). */
export const USE_VIEW = import.meta.env.VITE_PARTNERS_VIEW === '1'

export function fetchPartnerRows() {
  const settings = () => supabase
    .from('institute_settings')
    .select('institute_id, name, theme_config')
    .eq('is_deleted', false)
    .then(({ data }) => data || [])

  if (!USE_VIEW) return settings()
  return supabase
    .from('public_partners')
    .select('institute_id, name, theme_config')
    .then(({ data, error }) => (!error && data ? data : settings()))
}

export function normAr(s) {
  return s.replace(/[أإآٱ]/g, 'ا').replace(/[ً-ٰٟ]/g, '').toLowerCase().trim()
}

/* أسماءٌ تدلّ بنفسها على حسابٍ تجريبيّ أو اسمٍ لم يُكتب بعد. مأخوذة من
   البيانات الفعلية («تجربة»، «خاص»، «معهد» وحدها، وحرف واحد). */
const PLACEHOLDER_TITLES = new Set(['تجربه', 'تجربة', 'خاص', 'معهد', 'test', 'demo'])

export function titleOf(p) {
  return (p.theme_config?.app_title || p.name || p.institute_id || '').replace(/\s+/g, ' ').trim()
}

export function isExcluded(p) {
  const id    = (p.institute_id || '').toLowerCase().trim()
  const title = normAr(titleOf(p))
  if (['ihkam', 'demo', 'superadmin', 'test', 'system', 'showcase'].some(k => id.includes(k))) return true
  if (title.includes('احكام')) return true
  if (title.length < 3 || PLACEHOLDER_TITLES.has(title)) return true
  return false
}

/* المعهد الواحد قد يظهر بحسابين (اسمٌ مكرَّر حرفياً). نُبقي نسخةً واحدة،
   ويُقدَّم ما له شعار. */
export function dedupe(list) {
  const seen = new Map()
  for (const p of list) {
    const key = normAr(titleOf(p))
    const prev = seen.get(key)
    if (!prev || (!prev.theme_config?.logo_url && p.theme_config?.logo_url)) seen.set(key, p)
  }
  return [...seen.values()]
}

/* يظهر في الموقع المعهد الشريك وحده: عمل شهراً فأكثر ولو ترك (activeInstitutes.js) */
export const cleanPartners = (rows) => {
  const active = getActiveIds()
  return dedupe((rows || []).filter(p => !isExcluded(p) && active.has(p.institute_id)))
}
