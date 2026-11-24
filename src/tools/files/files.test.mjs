import test from 'node:test'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import { makeZip, readZip, decodeUtf8, crc32 } from './zip.js'
import { makeXlsx, readXlsx, readXlsxSheets } from './xlsx.js'
import { buildPdf } from './pdf.js'
import { reasonWithLam, reasonPlain } from './reason.js'
import { parseStudentsText, parseStudentsFile, rowsToStudents, sampleXlsx, SAMPLE_HEADER, SAMPLE_MALE, SAMPLE_FEMALE, normalizeGender, sheetGender } from './bulk.js'
import { fillTemplate, finishBody, insertToken, inspectTemplate, femaleSuggestions, replaceWord, normVar, valsOf, DEFAULT_TPL, newTemplate } from './template.js'

const S = (o) => ({ name: '', gender: '', vars: {}, ...o })

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
  const sheets = await readXlsxSheets(sampleXlsx())
  assert.deepEqual(sheets.map((s) => s.name), ['الطلاب', 'الطالبات'])
  const rows = sheets[0].rows
  assert.equal(rows.length >= SAMPLE_MALE.length + 1, true) // وبعدها صفوف ملوَّنة فارغة للكتابة
  assert.deepEqual(rows[0], SAMPLE_HEADER)
  assert.deepEqual(rows[2].slice(0, 4), SAMPLE_MALE[1])
  assert.deepEqual(rows[3].slice(0, 3), SAMPLE_MALE[2].slice(0, 3)) // الدرجة الفارغة تبقى فارغة
  assert.deepEqual(sheets[1].rows[1].slice(0, 4), SAMPLE_FEMALE[0])
  assert.deepEqual((await readXlsx(sampleXlsx()))[0], SAMPLE_HEADER) // readXlsx: الورقة الأولى
})

test('xlsx: خلية منسّقة نسبةً مئوية تُقرأ «98%» لا 0.98', async () => {
  const styles = '<styleSheet><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="9" applyNumberFormat="1"/></cellXfs></styleSheet>'
  const sheet = '<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>درجة</t></is></c></row>'
    + '<row r="2"><c r="A2" s="1"><v>0.98</v></c></row><row r="3"><c r="A3"><v>0.98</v></c></row><row r="4"><c r="A4" s="1"><v>0.915</v></c></row></sheetData></worksheet>'
  const zip = makeZip([{ name: 'xl/worksheets/sheet1.xml', data: sheet }, { name: 'xl/styles.xml', data: styles }])
  const rows = await readXlsx(zip)
  assert.deepEqual(rows.map((r) => r[0]), ['درجة', '98%', '0.98', '91.5%'])
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
  const r = parseStudentsText(tsv)
  assert.deepEqual(r.students, [
    S({ name: 'علي أحمد', vars: { الإنجاز: 'حفظ جزء عمّ' }, gender: 'm' }),
    S({ name: 'هدى سعيد', gender: 'f' }),
  ])
  assert.deepEqual(r.vars, ['الإنجاز']) // الجنس ليس متغيراً
  assert.deepEqual(parseStudentsText('أ ب\nج د\n\n').students, [S({ name: 'أ ب' }), S({ name: 'ج د' })])
  assert.deepEqual(parseStudentsText('أ ب\nج د').vars, []) // أسماء وحدها: لا أعمدة
  assert.equal(parseStudentsText('أ ب').students[0].gender, '')
  assert.equal(parseStudentsText('أ ب', 'f').students[0].gender, 'f') // الجنس الافتراضي لمن لا جنس له
  assert.deepEqual(parseStudentsText('"أحمد، علي","حفظ ""الملك"""\n').students, [S({ name: 'أحمد، علي' })]) // بلا ترويسة: الاسم وحده
  assert.equal(parseStudentsText('﻿اسم,إنجاز\nزيد,سورة\n').students[0].name, 'زيد')
  assert.equal(rowsToStudents([[], ['', ''], ['زيد']]).students.length, 1)
  assert.equal(normalizeGender('أنثى'), 'f')
  assert.equal(normalizeGender('x'), '')
  assert.equal(sheetGender('الطالبات'), 'f')
  assert.equal(sheetGender('الطلاب'), 'm')
  assert.equal(sheetGender('ملاحظات'), '')
})

test('bulk: بلا ترويسة: الاسم وحده بلا أعمدة افتراضية، و«طالب/طالبة» في خلية تُقرأ جنساً', () => {
  const r = rowsToStudents([['علي', 'سورة الملك', 'امتياز', '98%'], ['هدى', 'جزء عمّ', 'طالبة']])
  assert.deepEqual(r.students[0].vars, {})
  assert.deepEqual(r.vars, [])
  assert.equal(r.students[1].gender, 'f')
  assert.deepEqual(r.students[1].vars, {})
  /* اسم شخص يبدأ بـ«اسم…» ليس ترويسة */
  assert.equal(rowsToStudents([['اسماء خالد', 'سورة']]).students.length, 1)
})

test('bulk: الملف النموذجي ورقتان، والجنس من اسم الورقة', async () => {
  const f = { name: 'نموذج.xlsx', arrayBuffer: async () => sampleXlsx().buffer.slice(0) }
  const { students, vars } = await parseStudentsFile(f)
  assert.equal(students.length, SAMPLE_MALE.length + SAMPLE_FEMALE.length)
  assert.deepEqual(vars, ['الإنجاز', 'التقدير', 'الدرجة'])
  assert.deepEqual(students.map((s) => s.gender), ['m', 'm', 'm', 'f', 'f'])
  assert.equal(students[0].vars['الإنجاز'], 'حفظ جزء عمّ كاملاً')
  assert.equal(students[0].vars['الدرجة'], '98%')
  assert.equal(students[2].vars['الدرجة'], undefined) // خلية فارغة: لا متغير
  assert.equal(students[4].vars['التقدير'], undefined)
})

test('bulk: كل عمود متغير باسم ترويسته، وتغيير الترتيب وحذف عمود لا يضرّان', () => {
  const tsv = 'الدرجه\tاسم الطالب\tالترتيب (اختياري)\tالانجاز\n98\tعلي\tالأول\tسورة الملك\n\tهدى\t\t\n'
  const { students, vars } = parseStudentsText(tsv)
  assert.deepEqual(vars, ['الدرجة', 'الترتيب', 'الإنجاز']) // الإملاء يُوحَّد مع الأسماء المعروفة، و«(اختياري)» تُحذف
  assert.deepEqual(students[0].vars, { الدرجة: '98', الترتيب: 'الأول', الإنجاز: 'سورة الملك' })
  assert.deepEqual(students[1].vars, {})
})

test('bulk: مصنف بورقة «ملاحظات» تُهمل، ومصنف بلا أسماء أوراق معروفة تُقرأ أول ورقة', async () => {
  const sheetXml = (rows) => `<worksheet><sheetData>${rows.map((r, i) => `<row r="${i + 1}">${r.map((v, j) => `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t>${v}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`
  const book = (names, sheets) => makeZip([
    { name: 'xl/workbook.xml', data: `<workbook xmlns:r="r"><sheets>${names.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', data: `<Relationships>${names.map((_, i) => `<Relationship Id="rId${i + 1}" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}</Relationships>` },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s) })),
  ])
  const file = (zip) => ({ arrayBuffer: async () => zip.buffer.slice(0) })
  const a = await parseStudentsFile(file(book(['الطلاب', 'ملاحظات'], [[['الاسم', 'الإنجاز'], ['علي', 'س']], [['الاسم'], ['لا يُقرأ']]])))
  assert.deepEqual(a.students.map((s) => s.name), ['علي'])
  const b = await parseStudentsFile(file(book(['Sheet1', 'Sheet2'], [[['الاسم'], ['زيد']], [['الاسم'], ['عمرو']]])), 'f')
  assert.deepEqual(b.students.map((s) => [s.name, s.gender]), [['زيد', 'f']])
})

test('bulk: الملف يُحكم عليه بمحتواه لا باسمه (xlsx بامتداد خاطئ، وxls القديم، وcsv)', async () => {
  const asXls = { name: 'نموذج.xls', arrayBuffer: async () => sampleXlsx().buffer.slice(0) }
  assert.equal((await parseStudentsFile(asXls)).students.length, 5)
  const old = { name: 'قديم.xls', arrayBuffer: async () => new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0, 0]).buffer }
  await assert.rejects(() => parseStudentsFile(old), /xls القديمة/)
  const csv = { name: 'a.csv', arrayBuffer: async () => new TextEncoder().encode('اسم,إنجاز\nزيد,سورة').buffer }
  assert.equal((await parseStudentsFile(csv)).students[0].vars['الإنجاز'], 'سورة')
})

const fill = (tpl, vars) => fillTemplate(tpl, valsOf(vars))

test('template: ملء الصيغة، وسقوط المتغير الفارغ مع كلماته الملاصقة', () => {
  const T = 'هذه الشهادة تقديراً لإنجازه: [الإنجاز] بتقدير [التقدير] وبدرجة [الدرجة]'
  const A = 'حفظ جزء عمّ'
  assert.equal(fill(T, { الإنجاز: A, التقدير: 'امتياز', الدرجة: '98%' }), `هذه الشهادة تقديراً لإنجازه: ${A} بتقدير امتياز وبدرجة 98%`)
  assert.equal(fill(T, { الإنجاز: A, التقدير: 'امتياز' }), `هذه الشهادة تقديراً لإنجازه: ${A} بتقدير امتياز`) // لا درجة: يسقط «وبدرجة»
  assert.equal(fill(T, { الإنجاز: A, الدرجة: '98%' }), `هذه الشهادة تقديراً لإنجازه: ${A} بدرجة 98%`) // لا تقدير: يسقط «بتقدير» ويُحذف عطف «وبدرجة»
  assert.equal(fill(T, { الإنجاز: A }), `هذه الشهادة تقديراً لإنجازه: ${A}`)
  assert.equal(fill('نال [الترتيب] من بين [العدد]', { الترتيب: 'الأول' }), 'نال الأول') // لا عمود للعدد أصلاً: يسقط ومعه «من بين»
  /* الفاصلة تحدّ ما يسقط */
  assert.equal(fill('حفظ [الإنجاز]، ونال بدرجة [الدرجة]، بارك الله فيه', { الإنجاز: 'جزء عمّ' }), 'حفظ جزء عمّ، بارك الله فيه')
  /* أسماء المتغيرات تُقارن بلا اعتبار للهمزة والتاء المربوطة */
  assert.equal(fill('[الانجاز] [الدرجه]', { الإنجاز: 'أ', الدرجة: 'ب' }), 'أ ب')
  assert.equal(normVar('الإنجاز'), normVar('الانجاز'))
  /* طالب بلا إنجاز: تسقط المقدمة «تقديراً لإنجازه:» كلها فلا تبقى معلّقة */
  assert.equal(fill('هذه الشهادة تقديراً لإنجازه: [الإنجاز] بتقدير [التقدير]', {}), '')
  assert.equal(fill('هذه الشهادة تقديراً لإنجازه: [الإنجاز] بتقدير [التقدير]', { التقدير: 'امتياز' }), 'بتقدير امتياز')
})

test('template: الجملة الجاهزة بلا حقول ولا عبارات مرتبطة بأعمدة', () => {
  assert.ok(!DEFAULT_TPL.m.includes('[') && !DEFAULT_TPL.f.includes('['))
  assert.ok(!/إنجاز|تقدير|درجة/.test(DEFAULT_TPL.m.replace('تقديراً', '')))
})

test('template: خاتمة الجملة نقطة، أو فاصلة إن كان التاريخ بعدها', () => {
  assert.equal(finishBody('نال امتيازاً.', '.'), 'نال امتيازاً.')
  assert.equal(finishBody('نال امتيازاً،،', '،'), 'نال امتيازاً،')
  assert.equal(finishBody('   ', '.'), '')
  assert.equal(reasonPlain('تقديراً لحفظ جزء عمّ.'), 'لحفظ جزء عمّ')
})

test('template: إدراج المتغير عند المؤشر بمسافات سليمة، وفحص ما لا عمود له', () => {
  assert.deepEqual(insertToken('نال', 3, 3, 'الدرجة'), { text: 'نال [الدرجة]', caret: 12 })
  assert.equal(insertToken('نال بدرجة ', 10, 10, 'الدرجة').text, 'نال بدرجة [الدرجة]')
  assert.equal(insertToken('ab', 1, 1, 'س').text, 'a [س] b')
  assert.equal(insertToken('نال.', 3, 3, 'س').text, 'نال [س].')
  const { used, missing } = inspectTemplate('[الإنجاز] و[الدرجه] و[الترتيب]', ['الإنجاز', 'الدرجة'])
  assert.deepEqual([...used].sort(), [normVar('الإنجاز'), normVar('الترتيب'), normVar('الدرجة')].sort())
  assert.deepEqual(missing, ['الترتيب'])
})

test('template: اقتراحات التأنيث: كلمات يقرّرها المدير واحدة واحدة، لا إعادة كتابة', () => {
  const sg = femaleSuggestions('هذه الشهادة تقديراً لإنجازه [الإنجاز] والله يبارك له، المتفوق عند معلمه')
  const map = Object.fromEntries(sg.map((x) => [x.from, x.to]))
  assert.equal(map['لإنجازه'], 'لإنجازها')
  assert.equal(map['له'], 'لها')
  assert.equal(map['المتفوق'], 'المتفوقة')
  assert.equal(map['معلمه'], 'معلمها')
  assert.equal(map['الله'], undefined) // ليست ضميراً
  assert.equal(map['هذه'], undefined)
  assert.equal(map['الإنجاز'], undefined) // المتغيرات لا تُفحص
  assert.equal(replaceWord('له وله الحمد، ولهم [له]', 'له', 'لها'), 'لها وله الحمد، ولهم [له]') // كلمة كاملة فقط، وخارج المتغيرات
})

test('template: نص الطلاب ينسخ إلى الطالبات حتى يكتبها المدير، والصيغة الجديدة تنسخ سابقتها', () => {
  const a = newTemplate('الصيغة 1')
  assert.equal(a.fOk, true)
  assert.equal(a.f, DEFAULT_TPL.f)
  const b = newTemplate('الصيغة 2', { ...a, m: 'س', fTouched: true, fOk: false })
  assert.equal(b.m, 'س')
  assert.equal(b.fOk, false)
  assert.notEqual(a.id, b.id)
})

test('reason: اللام والتقدير والنقطة تُضبط بالكود فلا يحفظ المستخدم قاعدة', () => {
  const ok = 'لحفظ جزء عمّ كاملاً'
  for (const t of ['حفظ جزء عمّ كاملاً', 'لحفظ جزء عمّ كاملاً', 'تقديراً لحفظ جزء عمّ كاملاً', 'هذه الشهادة تقديراً لحفظ جزء عمّ كاملاً.', '  حفظ جزء عمّ كاملاً،  ', 'تقديرا حفظ جزء عمّ كاملاً']) {
    assert.equal(reasonWithLam(t), ok, t)
  }
  assert.equal(reasonWithLam('التميّز في التسميع.'), 'للتميّز في التسميع')
  assert.equal(reasonWithLam('للتميّز في التسميع'), 'للتميّز في التسميع')
  assert.equal(reasonWithLam('تميّزه في الحلقة'), 'لتميّزه في الحلقة')
  assert.equal(reasonWithLam('لغته العربية الفصيحة'), 'للغته العربية الفصيحة') // «لغته» كلمة تبدأ باللام أصلاً فتُضاف لها لام جر
  assert.equal(reasonWithLam('  '), '')
  assert.equal(reasonWithLam('تقديراً'), '')
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
