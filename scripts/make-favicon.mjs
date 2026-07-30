/* ══════════════════════════════════════════════════════════════════
   توليد أيقونات التبويب من شعار إحكام.

   الأيقونة السابقة (public/favicon.svg) كانت شعاراً بنفسجياً موروثاً
   من قالبٍ جاهز — لا صلة له بالعلامة، وبقي منذ أول التزام.

   وشعارُ إحكام لا يصلح أيقونةً كما هو، لسببين:

   1) خلفيته بيضاء. وشريطُ التبويب داكنٌ عند أكثر المستخدمين، فيظهر
      الشعارُ مربّعاً أبيض ناصعاً يقطع الشريط. فنضعه على --canvas
      (#020F0E) ليُقرأ على الشريطين الفاتح والداكن معاً.

   2) حوله هامشٌ أبيض واسع. وعند 32px يأكل الهامشُ نصفَ المساحة
      فيبقى الشعارُ نقطة. فنقصّه أولاً (trim) ثم نُكبّره في الإطار.

   التشغيل:  node scripts/make-favicon.mjs
   ══════════════════════════════════════════════════════════════════ */

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root   = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(root, 'public', 'ihkaam-logo.png')

const CANVAS = { r: 2, g: 15, b: 14, alpha: 1 }   // #020F0E — لوحة الموقع

/* نسبةُ الشعار من الإطار — تختلف بالمقاس عن قصد.
   الشعار طوليّ (290×381 بعد القصّ)، فحين يُحصَر في مربّع يحكمه ارتفاعُه
   ويبقى نحوُ ربعِ العرض فارغاً. عند 192px لا يضرّ ذلك، أما عند 32px
   فكل بكسل محسوب: هناك نملأ الإطار (0.95) ولا نُدوّر الزوايا، لأن
   شريطَ التبويب لا يقصّ الأيقونة الصغيرة أصلاً. والمقاسات الكبيرة
   تُقصّ زواياها فتحتاج الهامش كي لا يُؤكَل حرفُ الشعار. */
const OUTPUTS = [
  { size: 32,  name: 'favicon-32.png',       radius: 0,  inset: 0.95 },
  { size: 192, name: 'favicon-192.png',      radius: 38, inset: 0.78 },
  { size: 180, name: 'apple-touch-icon.png', radius: 0,  inset: 0.78 }, // آبل تقصّ الزوايا بنفسها
]

/* قناعُ زوايا مدوّرة — SVG صغير يُركَّب بـ dest-in فيقصّ ما خرج عنه. */
const roundedMask = (size, radius) => Buffer.from(
  `<svg width="${size}" height="${size}">
     <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/>
   </svg>`
)

const trimmed = await sharp(SOURCE)
  // عتبة 12 لأن «الأبيض» في الملف ليس ffffff تماماً — فيه ضجيج ضغط،
  // والقصُّ بعتبة صفر لا يزيل شيئاً.
  .trim({ threshold: 12 })
  .toBuffer()

const meta = await sharp(trimmed).metadata()
console.log(`الشعار بعد القصّ: ${meta.width}×${meta.height}`)

for (const { size, name, radius, inset } of OUTPUTS) {
  const inner = Math.round(size * inset)

  const logo = await sharp(trimmed)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  let img = sharp({
    create: { width: size, height: size, channels: 4, background: CANVAS },
  }).composite([{ input: logo, gravity: 'center' }])

  if (radius > 0) {
    img = sharp(await img.png().toBuffer())
      .composite([{ input: roundedMask(size, radius), blend: 'dest-in' }])
  }

  const out = join(root, 'public', name)
  await img.png({ compressionLevel: 9 }).toFile(out)
  console.log(`✓ ${name}  (${size}×${size})`)
}
