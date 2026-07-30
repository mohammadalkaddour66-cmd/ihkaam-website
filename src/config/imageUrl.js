// صور المعرض تُرفع بحجمها الكامل (‎~400KB للصورة الواحدة، ~1.5s لتحميلها)، والصفحة
// تعرض عشرات منها — فتظهر بطيئة. Supabase Storage يوفّر تحويلاً على الخادم يُصغّر
// الصورة قبل إرسالها: نفس الصورة بعرض 400px وجودة 70 تنزل من 433KB إلى 54KB (تصغير 8×).
//
// نحوّل رابط ‎/object/public/‎ إلى ‎/render/image/public/‎ مع عرض مناسب لمكان العرض.
// لو تغيّر شكل الرابط (صورة خارجية مثلاً) نُعيده كما هو دون لمس.

export function galleryImage(url, width, quality = 72) {
  if (!url || !url.includes('/storage/v1/object/public/')) return url
  const base = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
  return `${base}?width=${width}&quality=${quality}&resize=contain`
}
