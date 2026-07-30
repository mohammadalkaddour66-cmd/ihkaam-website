// كل أرقام الموقع تأتي من دالة تجميع واحدة (get_public_landing_stats) بدل
// عدّ الصفوف من المتصفح — الصفوف نفسها مقفلة على anon بعد تحصين RLS.
// الوعد مُخزَّن على مستوى الوحدة: الصفحة الواحدة قد تعرض HeroSection و
// IhkaamTrustStats و IhkaamByNumbers معاً، فتتشارك جميعها طلباً واحداً.
//
// supabaseClient يُستورد ديناميكياً داخل fetchLandingStats لا في أعلى الملف:
// ذاك الموديول يرمي عند التحميل إن غابت متغيرات البيئة، فاستيراده هنا كان
// يُسقط أي حزمة تضم IhkaamByNumbers أو IhkaamTrustStats — حتى لو لم يُطلب
// أي رقم. وكفائدة ثانية: مكتبة supabase (وهي ثقيلة) تخرج من المسار الحرج.

const EMPTY = {
  institutes: 0, students: 0, staff: 0, groups: 0,
  recitations: 0, recitationsQuran: 0, recitationsHadith: 0,
  recitations30d: 0, recitationsPrev30d: 0,
  tests: 0, stars: 0, subjects: 0,
  absences: 0, absences30d: 0,
}

let pending = null

export function fetchLandingStats() {
  if (pending) return pending

  pending = import('./supabaseClient')
    .then(({ supabase }) => supabase.rpc('get_public_landing_stats'))
    .catch((err) => {
      // إعدادات ناقصة أو فشل تحميل العميل — نفس معالجة خطأ الـ RPC أدناه:
      // نسجّل بصوت عالٍ ونعيد الأصفار بدل أن نُسقط الصفحة كلها.
      console.error('[landingStats] تعذّر تحميل عميل supabase', err)
      pending = null
      return { data: null, error: err }
    })
    .then(({ data, error }) => {
      if (error) {
        console.error('[landingStats] RPC failed — شغّل supabase/migrations/20260713_public_landing_stats.sql', error)
        pending = null            // اسمح بإعادة المحاولة عند إعادة التركيب
        return EMPTY
      }
      const r = Array.isArray(data) ? data[0] : data
      if (!r) return EMPTY

      return {
        institutes        : Number(r.institutes)           || 0,
        students          : Number(r.students)             || 0,
        staff             : Number(r.staff)                || 0,
        groups            : Number(r.groups)               || 0,
        recitations       : Number(r.recitations)          || 0,
        recitationsQuran  : Number(r.recitations_quran)    || 0,
        recitationsHadith : Number(r.recitations_hadith)   || 0,
        recitations30d    : Number(r.recitations_30d)      || 0,
        recitationsPrev30d: Number(r.recitations_prev_30d) || 0,
        tests             : Number(r.tests)                || 0,
        stars             : Number(r.stars)                || 0,
        subjects          : Number(r.subjects)             || 0,
        absences          : Number(r.absences)             || 0,
        absences30d       : Number(r.absences_30d)         || 0,
      }
    })

  return pending
}
