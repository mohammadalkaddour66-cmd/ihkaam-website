import test from 'node:test'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import { makeZip, readZip, decodeUtf8, crc32 } from './zip.js'
import { makeXlsx, readXlsx } from './xlsx.js'
import { buildPdf } from './pdf.js'
import { parseStudentsText, rowsToStudents, sampleXlsx, SAMPLE_ROWS, normalizeGender } from './bulk.js'

test('crc32 يطابق قيمة معروفة', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926)
})

test('zip: كتابة ثم قراءة', async () => {
  const z = makeZip([{ name: 'a.txt', data: 'مرحبا' }, { name: 'b/c.txt', data: 'x' }])
  const m = readZip(z)
  assert.deepEqual([...m.keys()], ['a.txt', 'b/c.txt'])
  assert.equal(decodeUtf8(await m.get('a.txt')()), 'مرحبا')
})

test('xlsx: كتابة ثم قراءة تحفظ العربية والخلايا الفارغة', async () => {
  const rows = await readXlsx(sampleXlsx())
  assert.equal(rows.length, SAMPLE_ROWS.length)
  assert.deepEqual(rows[1], SAMPLE_ROWS[1])
  assert.deepEqual(rows[3], ['يوسف إبراهيم حسن', '', 'طالب'])
})

test('xlsx: يقرأ ملفاً مضغوطاً بنمط Excel (sharedStrings وdeflate وأعمدة متروكة)', async () => {
  const sheet = `<worksheet><sheetData>
<row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1" t="s"><v>1</v></c></row>
<row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2"><v>12</v></c><c r="C2" t="inlineStr"><is><t>a &amp; b</t></is></c></row>
</sheetData></worksheet>`
  const sst = `<sst><si><t>اسم</t></si><si><r><t>جنس</t></r><r><t> الطالب</t></r></si><si><t>سلمى</t></si></sst>`
  // zip حقيقي بضغط deflate: نبنيه يدوياً بنفس بنية Excel
  const files = [['xl/worksheets/sheet1.xml', sheet], ['xl/sharedStrings.xml', sst]]
  const parts = []; const central = []; let off = 0
  for (const [name, text] of files) {
    const nm = Buffer.from(name); const raw = Buffer.from(text); const def = zlib.deflateRawSync(raw)
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(8, 8)
    lh.writeUInt32LE(0, 14); lh.writeUInt32LE(0, 18); lh.writeUInt32LE(0, 22); lh.writeUInt16LE(nm.length, 26) // أحجام صفرية كأن بعدها data descriptor
    parts.push(lh, nm, def)
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(8, 10)
    ch.writeUInt32LE(def.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42)
    central.push(ch, nm)
    off += 30 + nm.length + def.length
  }
  const cd = Buffer.concat(central)
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(2, 8); end.writeUInt16LE(2, 10)
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16)
  const zip = new Uint8Array(Buffer.concat([...parts, cd, end]))
  const rows = await readXlsx(zip)
  assert.deepEqual(rows[0], ['اسم', '', 'جنس الطالب'])
  assert.deepEqual(rows[1], ['سلمى', '12', 'a & b'])
})

test('bulk: لصق من Excel (تبويب) وCSV وأسطر مفردة', () => {
  const tsv = 'اسم الطالب\tالإنجاز\tالجنس\nعلي أحمد\tحفظ جزء عمّ\tطالب\nهدى سعيد\t\tطالبة\n'
  assert.deepEqual(parseStudentsText(tsv), [
    { name: 'علي أحمد', ach: 'حفظ جزء عمّ', gender: 'm' },
    { name: 'هدى سعيد', ach: '', gender: 'f' },
  ])
  assert.deepEqual(parseStudentsText('أ ب\nج د\n\n'), [{ name: 'أ ب', ach: '', gender: '' }, { name: 'ج د', ach: '', gender: '' }])
  assert.deepEqual(parseStudentsText('"أحمد، علي","حفظ ""الملك"""\n'), [{ name: 'أحمد، علي', ach: 'حفظ "الملك"', gender: '' }])
  assert.equal(parseStudentsText('﻿اسم,إنجاز\nزيد,سورة\n')[0].name, 'زيد')
  assert.equal(rowsToStudents([[], ['', ''], ['زيد']]).length, 1)
  assert.equal(normalizeGender('أنثى'), 'f')
  assert.equal(normalizeGender('x'), '')
})

test('pdf: بنية صحيحة، وxref يشير إلى الكائنات، ورابط URI بإحداثيات صحيحة', () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
  const pdf = buildPdf([
    { jpeg, width: 2339, height: 1654, links: [{ x: 1000, y: 1500, w: 300, h: 60, url: 'https://ihkaam.app' }] },
    { jpeg, width: 2339, height: 1654, links: [] },
  ])
  const s = Buffer.from(pdf).toString('latin1')
  assert.ok(s.startsWith('%PDF-1.4'))
  assert.ok(s.trimEnd().endsWith('%%EOF'))
  assert.match(s, /\/Count 2/)
  assert.match(s, /\/URI \(https:\/\/ihkaam\.app\)/)
  const startxref = Number(/startxref\n(\d+)/.exec(s)[1])
  assert.ok(s.slice(startxref).startsWith('xref'))
  const entries = [...s.slice(startxref).matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]))
  entries.forEach((off, i) => assert.ok(s.slice(off).startsWith(`${i + 1} 0 obj`), `object ${i + 1}`))
  // x: 1000 * 841.89/2339 = 360 ؛ y أعلى = 595.28 - 1500*595.28/1654 = 55.4
  const rect = /\/Rect \[([\d. ]+)\]/.exec(s)[1].split(' ').map(Number)
  assert.ok(Math.abs(rect[0] - 360) < 0.1)
  assert.ok(Math.abs(rect[3] - 55.4) < 0.2)
})
