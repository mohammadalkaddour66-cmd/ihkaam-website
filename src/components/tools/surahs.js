import SURAHS from '../../data/quran/surahs.json'

/* قائمة السور (8 ك.ب.) تُحمَّل مع صفحة الأداة، فتعمل القوائم قبل وصول بيانات
   المصحف الكاملة. */
export { SURAHS }
export const surahName = (n) => SURAHS[n - 1]?.name
