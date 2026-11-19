/* ══════════════════════════════════════════════════════════════════
   المعاهد المفعّلة (2026-11-19)

   «مفعّل» = مضى على أول نشاطٍ له (تسميع أو حضور) شهرٌ على الأقل، وله
   نشاطٌ خلال آخر 30 يوماً. لا كل معهد مسجّل: كثيرٌ من المسجّلين تجريبيّ.

   المصدر: الدالة get_active_institute_ids في
   supabase/migrations/20261119_active_institutes.sql. إلى أن تُطبَّق على
   الإنتاج يستعمل الموقع هذه اللقطة (محسوبة من القاعدة بالتعريف نفسه يوم
   ACTIVE_SNAPSHOT_DATE). بعد تطبيق الترحيل تُجلب القائمة حيّةً وقت البناء
   وفي المتصفح، وتبقى اللقطة احتياطاً.
   ══════════════════════════════════════════════════════════════════ */
export const ACTIVE_SNAPSHOT_DATE = '2026-11-19'
export const ACTIVE_SNAPSHOT = [
  'baidar', 'ansarik', 'hasana', 'ansari', 'ayoubi', 'anwar', 'instu64tw',
  'instkc9aw', 'insts2hdx', 'instb3bf9', 'instbhwzy', 'inst52wch', 'inst7rxrz', 'instap5ew',
]

/* قائمة البناء (prerender.mjs) أو كتلة البيانات في الصفحة، وإلا اللقطة */
export function getActiveIds() {
  const live = globalThis.__ACTIVE_IDS__
    ?? (typeof document !== 'undefined' ? readBlock() : null)
  return new Set(Array.isArray(live) && live.length ? live : ACTIVE_SNAPSHOT)
}

function readBlock() {
  try {
    const el = document.getElementById('landing-stats')
    return el ? JSON.parse(el.textContent).active_ids ?? null : null
  } catch { return null }
}
