const fs = require('fs')
const s = fs.readFileSync('' + require('path').resolve(__dirname, '..', 'src/data/helpContent.js') + '', 'utf8')
const slugs = [...s.matchAll(/^\s{4}slug\s*:\s*'([a-z0-9-]+)'/gm)].map(m => m[1])
const only = process.argv.slice(2)
for (const slug of slugs) {
  if (only.length && !only.includes(slug)) continue
  const i = s.indexOf("slug    : '" + slug + "'")
  const a = s.indexOf('steps   : [', i)
  const j = s.indexOf('tips', a)
  const blk = s.slice(a, j)
  const title = (s.slice(i, a).match(/title\s*:\s*'([^']*)'/) || [])[1]
  console.log('\n## ' + slug + ' — ' + title)
  const re = /title:\s*'((?:[^'\\]|\\.)*)',\s*body\s*:\s*'((?:[^'\\]|\\.)*)'/g
  let m, k = 0
  while ((m = re.exec(blk))) { k++; console.log(k + '. ' + m[1] + ' | ' + m[2].replace(/\\n/g, ' / ')) }
}
