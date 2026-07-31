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
import { writeFile } from 'node:fs/promises'
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

/* المقاسات التي تُحزَم داخل favicon.ico. الثمانيةُ والأربعون ليست ترفاً:
   وثيقة جوجل تشترط أن يكون مقاسُ الأيقونة مضاعفاً لـ48 لتُعرَض في صفحة
   النتائج، و16/32 للمتصفحات القديمة وشريط المفضّلة. */
const ICO_SIZES = [16, 32, 48]

/* قناعُ زوايا مدوّرة — SVG صغير يُركَّب بـ dest-in فيقصّ ما خرج عنه. */
const roundedMask = (size, radius) => Buffer.from(
  `<svg width="${size}" height="${size}">
     <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/>
   </svg>`
)

/* ── كاتب ICO ────────────────────────────────────────────────────
   sharp لا يُخرج ico، والصيغة أبسط من أن تُستقدَم لها اعتمادية: منذ
   ويندوز ڤيستا يقبل الملفُّ حمولةَ PNG كما هي، فلا يُرمَّز شيء — تُلصَق
   الصورُ ويُبنى لها فهرس.

   ICONDIR      : 6 بايتات — محجوز(2) + النوع(2)=1 + العدد(2)
   ICONDIRENTRY : 16 بايتاً لكل صورة، والعرض/الارتفاع بايتٌ واحد لكلٍّ
                  (لذلك 256 يُكتَب صفراً، وهو خارج مقاساتنا أصلاً).
   ───────────────────────────────────────────────────────────────── */
function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)              // reserved
  header.writeUInt16LE(1, 2)              // 1 = أيقونة (2 = مؤشّر)
  header.writeUInt16LE(images.length, 4)

  const dir = Buffer.alloc(16 * images.length)
  let offset = header.length + dir.length

  images.forEach(({ size, data }, i) => {
    const e = i * 16
    dir.writeUInt8(size % 256, e + 0)     // العرض
    dir.writeUInt8(size % 256, e + 1)     // الارتفاع
    dir.writeUInt8(0, e + 2)              // عدد ألوان اللوحة — 0 للألوان الكاملة
    dir.writeUInt8(0, e + 3)              // محجوز
    dir.writeUInt16LE(1,  e + 4)          // color planes
    dir.writeUInt16LE(32, e + 6)          // bits per pixel
    dir.writeUInt32LE(data.length, e + 8)
    dir.writeUInt32LE(offset,      e + 12)
    offset += data.length
  })

  return Buffer.concat([header, dir, ...images.map(i => i.data)])
}

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

/* favicon.ico — بلا زوايا مدوّرة: شريطُ التبويب وصفحةُ نتائج البحث
   يقصّان الأيقونة بأنفسهما، وتدويرُنا فوق تدويرهما يأكل حرف الشعار. */
const icoImages = []
for (const size of ICO_SIZES) {
  const inner = Math.round(size * 0.95)
  const logo = await sharp(trimmed)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  const data = await sharp({
    create: { width: size, height: size, channels: 4, background: CANVAS },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer()

  icoImages.push({ size, data })
}

const icoPath = join(root, 'public', 'favicon.ico')
await writeFile(icoPath, buildIco(icoImages))
console.log(`✓ favicon.ico  (${ICO_SIZES.join('، ')})`)
