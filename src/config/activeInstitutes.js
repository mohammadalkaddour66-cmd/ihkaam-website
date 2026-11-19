/* ══════════════════════════════════════════════════════════════════
   المعاهد الشريكة (2026-11-19، قرار المالك المعدَّل)

   «شريك» = كل معهدٍ عمل على المنصة شهراً فأكثر ببيانات حقيقية، ولو ترك
   بعدها: «خلي المعاهد اللي اشتغلت، اللي فعلاً اشتركت، ولو تركت… اسمه كان
   شريك». أي: بين أول نشاطٍ وآخره 30 يوماً فأكثر، و10 أيام عمل، والمعهد غير
   محذوف، دون التجريبي. تحكم العدّاد وشريط الشركاء وبطاقات المعاهد والأرقام.

   المصدر: الحقل ids في get_public_quran_stats (migration 20261119b)، يُخبز
   وقت البناء في كتلة landing-stats. هذه اللقطة احتياطٌ إن تعذّر الجلب.
   (القاعدة السابقة «يعمل الآن» في 20261119_active_institutes.sql أُلغيت.)
   ══════════════════════════════════════════════════════════════════ */
export const ACTIVE_SNAPSHOT_DATE = '2026-11-19'
export const ACTIVE_SNAPSHOT = [
  'baidar', 'ansarik', 'hasana', 'ansari', 'ayoubi', 'anwar', 'instu64tw',
  'instkc9aw', 'insts2hdx', 'instb3bf9', 'instbhwzy', 'inst52wch', 'inst7rxrz', 'instap5ew',
  'tawhid',
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
