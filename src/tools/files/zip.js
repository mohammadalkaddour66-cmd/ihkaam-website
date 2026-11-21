/* ══════════════════════════════════════════════════════════════════
   ZIP بلا اعتماديات: قراءة (للـxlsx الذي يرفعه المستخدم) وكتابة (للملف
   النموذجي). JavaScript خالص يعمل في المتصفح وفي Node للاختبار.

   القراءة تعتمد على الدليل المركزي (central directory) لا على الترويسات
   المحلية، لأن Excel يكتب الأحجام بعد البيانات (data descriptor) في بعض
   الملفات. الفكّ بـDecompressionStream('deflate-raw') المدمج في المتصفحات.
   الكتابة بلا ضغط (stored): الملف النموذجي صغير جداً.
   ══════════════════════════════════════════════════════════════════ */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

export function crc32(u8) {
  let c = 0xffffffff
  for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const enc = new TextEncoder()
const dec = new TextDecoder('utf-8')

/* files: [{ name, data: Uint8Array | string }] ← Uint8Array لملف zip */
export function makeZip(files) {
  const parts = []
  const central = []
  let offset = 0
  for (const f of files) {
    const name = enc.encode(f.name)
    const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data
    const crc = crc32(data)

    const lh = new DataView(new ArrayBuffer(30))
    lh.setUint32(0, 0x04034b50, true)
    lh.setUint16(4, 20, true)
    lh.setUint16(6, 0x0800, true) // أسماء UTF-8
    lh.setUint16(8, 0, true)
    lh.setUint16(10, 0, true)
    lh.setUint16(12, 0x21, true) // 1980-01-01
    lh.setUint32(14, crc, true)
    lh.setUint32(18, data.length, true)
    lh.setUint32(22, data.length, true)
    lh.setUint16(26, name.length, true)
    parts.push(new Uint8Array(lh.buffer), name, data)

    const ch = new DataView(new ArrayBuffer(46))
    ch.setUint32(0, 0x02014b50, true)
    ch.setUint16(4, 20, true)
    ch.setUint16(6, 20, true)
    ch.setUint16(8, 0x0800, true)
    ch.setUint16(12, 0, true)
    ch.setUint16(14, 0x21, true)
    ch.setUint32(16, crc, true)
    ch.setUint32(20, data.length, true)
    ch.setUint32(24, data.length, true)
    ch.setUint16(28, name.length, true)
    ch.setUint32(42, offset, true)
    central.push(new Uint8Array(ch.buffer), name)
    offset += 30 + name.length + data.length
  }
  const cdSize = central.reduce((n, p) => n + p.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, files.length, true)
  end.setUint16(10, files.length, true)
  end.setUint32(12, cdSize, true)
  end.setUint32(16, offset, true)
  return concat([...parts, ...central, new Uint8Array(end.buffer)])
}

export function concat(arrs) {
  const total = arrs.reduce((n, a) => n + a.length, 0)
  const out = new Uint8Array(total)
  let o = 0
  for (const a of arrs) { out.set(a, o); o += a.length }
  return out
}

async function inflateRaw(u8) {
  if (typeof DecompressionStream === 'undefined') throw new Error('هذا المتصفح قديم لقراءة ملفات Excel. احفظ الملف بصيغة CSV وارفعه.')
  const stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/* يقرأ zip ويعيد Map: اسم الملف ← دالة غير متزامنة تعيد بياناته */
export function readZip(input) {
  const u8 = input instanceof Uint8Array ? input : new Uint8Array(input)
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength)
  let eocd = -1
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 22 - 65535); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('الملف ليس بصيغة xlsx صالحة')
  const count = dv.getUint16(eocd + 10, true)
  let p = dv.getUint32(eocd + 16, true)
  const entries = new Map()
  for (let n = 0; n < count; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('الملف تالف')
    const method = dv.getUint16(p + 10, true)
    const csize = dv.getUint32(p + 20, true)
    const nameLen = dv.getUint16(p + 28, true)
    const extraLen = dv.getUint16(p + 30, true)
    const commentLen = dv.getUint16(p + 32, true)
    const local = dv.getUint32(p + 42, true)
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nameLen))
    entries.set(name, async () => {
      const lnLen = dv.getUint16(local + 26, true)
      const leLen = dv.getUint16(local + 28, true)
      const start = local + 30 + lnLen + leLen
      const raw = u8.subarray(start, start + csize)
      if (method === 0) return raw
      if (method === 8) return inflateRaw(raw)
      throw new Error('طريقة ضغط غير مدعومة في الملف')
    })
    p += 46 + nameLen + extraLen + commentLen
  }
  return entries
}

export const decodeUtf8 = (u8) => dec.decode(u8)
