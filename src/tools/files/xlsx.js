/* ══════════════════════════════════════════════════════════════════
   قراءة xlsx وكتابته بلا مكتبة. يكفي الجدول البسيط الذي يرفعه مدير المعهد:
   خلايا نصية أو رقمية، من الصف الأول. لا صيغ.

   القراءة: sharedStrings والنص المضمَّن (inlineStr) والأرقام، لكل أوراق المصنف
   بأسمائها (readXlsxSheets) أو للورقة الأولى (readXlsx). الكتابة: أوراق RTL بنصوص
   مضمَّنة (يفتحها Excel وGoogle Sheets وLibreOffice)، ولها تنسيق اختياري (colStyles):
   أعمدة «أساسية» بأخضر وأعمدة «اختيارية» برمادي، ليشرح الملف نفسه بالألوان دون نص.
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

async function loadShared(zip) {
  const shared = []
  if (zip.has('xl/sharedStrings.xml')) {
    const xml = decodeUtf8(await zip.get('xl/sharedStrings.xml')())
    for (const m of xml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)) shared.push(textOf(m[1]))
  }
  return shared
}

/* أنماط الخلايا المنسّقة نسبةً مئوية: خلية «98%» يخزّنها Excel رقماً 0.98، فلا بد أن نعرف
   تنسيقها لنعيد قراءتها «98%» لا «0.98». الفهرس هو رقم النمط s في الخلية. */
async function loadPercentStyles(zip) {
  const pct = new Set()
  if (!zip.has('xl/styles.xml')) return pct
  const xml = decodeUtf8(await zip.get('xl/styles.xml')())
  const custom = new Set()
  for (const m of xml.matchAll(/<numFmt\b([^>]*?)\/?>/g)) {
    const id = /\bnumFmtId="(\d+)"/.exec(m[1])?.[1]
    const code = /\bformatCode="([^"]*)"/.exec(m[1])?.[1] || ''
    if (id && code.includes('%')) custom.add(id)
  }
  const xfs = /<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(xml)?.[1] || ''
  let i = 0
  for (const m of xfs.matchAll(/<xf\b([^>]*?)(?:\/>|>[\s\S]*?<\/xf>)/g)) {
    const id = /\bnumFmtId="(\d+)"/.exec(m[1])?.[1]
    if (id === '9' || id === '10' || custom.has(id)) pct.add(i)
    i++
  }
  return pct
}

function parseSheetXml(xml, shared, pct = new Set()) {
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
        /* رقم منسّق نسبةً: 0.98 ← «98%» (مع تقريب كسور الفاصلة العائمة) */
        const sIdx = /\bs="(\d+)"/.exec(cm[1])?.[1]
        if ((type == null || type === 'n') && sIdx != null && pct.has(Number(sIdx)) && raw !== '' && Number.isFinite(Number(raw))) {
          v = `${Math.round(Number(raw) * 10000) / 100}%`
        }
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

/* كل أوراق المصنف بترتيبها وأسمائها: [{ name, rows }]. الاسم من workbook.xml، فإن غاب
   (ملف مبسّط) سُمّيت الأوراق «ورقة 1…» بترتيب ملفاتها. */
export async function readXlsxSheets(input) {
  const zip = readZip(input)
  const files = [...zip.keys()]
    .filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10))
  if (!files.length) throw new Error('لم أجد ورقة بيانات في الملف')

  let ordered = []
  if (zip.has('xl/workbook.xml')) {
    const wb = decodeUtf8(await zip.get('xl/workbook.xml')())
    const rels = zip.has('xl/_rels/workbook.xml.rels') ? decodeUtf8(await zip.get('xl/_rels/workbook.xml.rels')()) : ''
    const target = {}
    for (const m of rels.matchAll(/<Relationship\b([^>]*?)\/?>/g)) {
      const id = /\bId="([^"]*)"/.exec(m[1])?.[1]
      const t = /\bTarget="([^"]*)"/.exec(m[1])?.[1]
      if (id && t) target[id] = t.startsWith('/') ? t.slice(1) : `xl/${t.replace(/^\.?\//, '')}`
    }
    for (const m of wb.matchAll(/<sheet\b([^>]*?)\/?>/g)) {
      const name = /\bname="([^"]*)"/.exec(m[1])?.[1]
      const rid = /\br:id="([^"]*)"/.exec(m[1])?.[1]
      const file = target[rid]
      if (name != null && file && zip.has(file)) ordered.push({ name: unxml(name), file })
    }
  }
  if (!ordered.length) ordered = files.map((file, i) => ({ name: `ورقة ${i + 1}`, file }))

  const shared = await loadShared(zip)
  const pct = await loadPercentStyles(zip)
  const out = []
  for (const { name, file } of ordered) out.push({ name, rows: parseSheetXml(decodeUtf8(await zip.get(file)()), shared, pct) })
  return out
}

/* الورقة الأولى وحدها (الملفات القديمة بورقة واحدة) */
export async function readXlsx(input) {
  return (await readXlsxSheets(input))[0].rows
}

/* أنماط الخلايا (cellXfs): 1 ترويسة أساسية خضراء، 2 ترويسة اختيارية رمادية،
   3 خلية أساسية بخلفية خضراء فاتحة، 4 خلية اختيارية بخلفية رمادية فاتحة. */
const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF5A5A55"/><name val="Calibri"/></font></fonts>
<fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F6F52"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE2E0DA"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF3EE"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF5F4F1"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD6D3CB"/></left><right style="thin"><color rgb="FFD6D3CB"/></right><top style="thin"><color rgb="FFD6D3CB"/></top><bottom style="thin"><color rgb="FFD6D3CB"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`

/* ورقة واحدة: rows مصفوفة صفوف من نصوص. الخيارات:
   widths: عرض الأعمدة بالحروف.
   colStyles: لكل عمود 'basic' (أخضر) أو 'optional' (رمادي): يُلوَّن الصف الأول وأعمدته.
   padRows: عدد الصفوف الملوَّنة الفارغة بعد البيانات (تدعو إلى الكتابة فيها).
   dropdowns: [{ col, list }] قائمة منسدلة لعمود (من الصف الثاني)، أو { col, ref } قائمة
   تُؤخذ من نطاق في ورقة أخرى (مثل 'المسارات'!$A$2:$A$40) فتتبع ما يكتبه المستخدم فيها. */
function sheetXml({ rows, widths = [], colStyles = null, padRows = 0, dropdowns = [] }) {
  const colName = (i) => String.fromCharCode(65 + i)
  const styled = !!colStyles
  const cols = widths.length
    ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    : ''
  const nCols = styled ? colStyles.length : 0
  const styleOf = (ri, ci) => (!styled ? 0 : ri === 0 ? (colStyles[ci] === 'basic' ? 1 : 2) : (colStyles[ci] === 'basic' ? 3 : 4))
  const total = styled ? Math.max(rows.length, rows.length + padRows) : rows.length
  let body = ''
  for (let ri = 0; ri < total; ri++) {
    const row = rows[ri] || []
    const n = styled ? nCols : row.length
    let cells = ''
    for (let ci = 0; ci < n; ci++) {
      const v = row[ci]
      const s = styleOf(ri, ci)
      const sAttr = s ? ` s="${s}"` : ''
      cells += v === '' || v == null
        ? (s ? `<c r="${colName(ci)}${ri + 1}"${sAttr}/>` : '')
        : `<c r="${colName(ci)}${ri + 1}"${sAttr} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`
    }
    const ht = styled && ri === 0 ? ' ht="36" customHeight="1"' : ''
    body += `<row r="${ri + 1}"${ht}>${cells}</row>`
  }
  const view = styled
    ? '<sheetView rightToLeft="1" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView>'
    : '<sheetView rightToLeft="1" workbookViewId="0"/>'
  const dv = dropdowns.length
    ? `<dataValidations count="${dropdowns.length}">${dropdowns.map((d) => `<dataValidation type="list" allowBlank="1" showErrorMessage="0" sqref="${colName(d.col)}2:${colName(d.col)}${Math.max(total, 201)}"><formula1>${d.ref ? esc(d.ref) : `"${esc(d.list.join(','))}"`}</formula1></dataValidation>`).join('')}</dataValidations>`
    : ''
  return {
    styled,
    xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews>${view}</sheetViews>${cols}<sheetData>${body}</sheetData>${dv}</worksheet>`,
  }
}

/* مصنف بعدة أوراق: sheets = [{ name, rows, widths, colStyles, padRows, dropdowns }] */
export function makeWorkbook(sheets) {
  const built = sheets.map(sheetXml)
  const styled = built.some((b) => b.styled)
  const n = sheets.length
  const ct = built.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
  const stylesCT = styled ? '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' : ''
  const sheetRels = built.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
  const stylesRel = styled ? `<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` : ''
  const sheetList = sheets.map((s, i) => `<sheet name="${esc(s.name || `ورقة ${i + 1}`)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')
  const files = [
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${ct}${stylesCT}</Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetList}</sheets></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRels}${stylesRel}</Relationships>` },
    ...built.map((b, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: b.xml })),
  ]
  if (styled) files.push({ name: 'xl/styles.xml', data: STYLES_XML })
  return makeZip(files)
}

/* ورقة واحدة (الاستعمال القديم) */
export function makeXlsx(rows, { sheet = 'الطلاب', ...opts } = {}) {
  return makeWorkbook([{ name: sheet, rows, ...opts }])
}
