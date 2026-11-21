/* رابط صفحة الميزة دون تحميل featureDetails.js (62 ك.ب.) في صفحات الأدوات.
   القائمة نفسها ADDONS في src/data/featureDetails.js: إن انتقلت ميزة بين
   الأساسية والإضافية تُعدَّل هنا أيضاً (audit-links يكشف الرابط المكسور). */
const ADDON_SLUGS = ['finance', 'subjects', 'star']

export const featureHrefOf = (slug) =>
  ADDON_SLUGS.includes(slug) ? `/ihkaam/addons/${slug}` : `/ihkaam/features/${slug}`
