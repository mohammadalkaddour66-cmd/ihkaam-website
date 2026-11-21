/* ══════════════════════════════════════════════════════════════════
   قراءة xlsx وكتابته بلا مكتبة. يكفي الجدول البسيط الذي يرفعه مدير المعهد:
   ورقة واحدة، وخلايا نصية أو رقمية، من الصف الأول. لا صيغ ولا تنسيقات.

   القراءة: sharedStrings والنص المضمَّن (inlineStr) والأرقام. الكتابة: ورقة
   RTL بنصوص مضمَّنة (يفتحها Excel وGoogle Sheets وLibreOffice).
   ══════════════════════════════════════════════════════════════════ */
import { makeZip, readZip, decodeUtf8 } from './zip.js'

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
const unxml = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, g) => {
  if (g[0] === '#') {
    const code = g[1].toLowerCase() === 'x' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10)
    return Number.isFinite(code) ? String.fromCodePoint(code) : m
  }
  return ENT[g.toLowerCase()] ?? m
})
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* نصوص <t> داخل عنصر (تُهمل مقاطع النطق الصوتي rPh) */
function textOf(xml) {
  const clean = xml.replace(/<rPh[\s\S]*?<\/rPh>/g, '')
  let out = ''
  for (const m of clean.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) out += m[1]
  return unxml(out)
}

function colIndex(ref) {
  const letters = /^[A-Za-z]+/.exec(ref)?.[0] || 'A'
  let n = 0
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

export async function readXlsx(input) {
  const zip = readZip(input)
  const sheetName = [...zip.keys()]
    .filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10))[0]
  if (!sheetName) throw new Error('لم أجد ورقة بيانات في الملف')

  const shared = []
  if (zip.has('xl/sharedStrings.xml')) {
    const xml = decodeUtf8(await zip.get('xl/sharedStrings.xml')())
    for (const m of xml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)) shared.push(textOf(m[1]))
  }

  const xml = decodeUtf8(await zip.get(sheetName)())
  const rows = []
  let rowNo = 0
  for (const rm of xml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const rAttr = /\br="(\d+)"/.exec(rm[1])
    const r = rAttr ? parseInt(rAttr[1], 10) - 1 : rowNo
    rowNo = r + 1
    const cells = []
    for (const cm of (rm[2] || '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const ref = /\br="([A-Za-z]+\d+)"/.exec(cm[1])?.[1]
      const type = /\bt="(\w+)"/.exec(cm[1])?.[1]
      const body = cm[2] || ''
      let v
      if (type === 'inlineStr') v = textOf(body)
      else {
        const raw = /<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/.exec(body)?.[1] ?? ''
        v = type === 's' ? (shared[parseInt(raw, 10)] ?? '') : unxml(raw)
      }
      const c = ref ? colIndex(ref) : cells.length
      while (cells.length < c) cells.push('')
      cells[c] = String(v).trim()
    }
    while (rows.length < r) rows.push([])
    rows[r] = cells
  }
  return rows
}

/* rows: مصفوفة صفوف من نصوص. cols: عرض الأعمدة بالحروف. */
export function makeXlsx(rows, { sheet = 'الطلاب', widths = [] } = {}) {
  const colName = (i) => String.fromCharCode(65 + i)
  const cols = widths.length
    ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    : ''
  const body = rows.map((row, ri) => `<row r="${ri + 1}">${row.map((v, ci) => (v === '' || v == null
    ? ''
    : `<c r="${colName(ci)}${ri + 1}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`)).join('')}</row>`).join('')
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView rightToLeft="1" workbookViewId="0"/></sheetViews>${cols}<sheetData>${body}</sheetData></worksheet>`
  return makeZip([
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${esc(sheet)}" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>` },
    { name: 'xl/worksheets/sheet1.xml', data: sheetXml },
  ])
}
