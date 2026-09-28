// Confirms the utilities the app actually uses generate CSS with the right values.
// Only classes present in the source are required here — a missing rule for an
// unused class is not a failure.
const fs = require('fs'), path = require('path');
const css = fs.readFileSync(process.env.COMMANDCODE_SCRATCHPAD + '/out2.css', 'utf8');

// every generated rule must carry a value that exists in the theme
const RULES = {
  '.bg-teal': '135 123 244',      // periwinkle-500
  '.text-teal': '135 123 244',
  '.bg-turquoise': '135 123 244',
  '.text-white': '255 255 255',
  '.text-ink': '5 7 8',           // ink-900
  '.text-gray-400': '140 146 160', // night-300
  '.text-gray-500': '129 134 146', // night-400
  '.text-gray-muted': '171 177 190', // night-200
  '.bg-gold': '246 197 60',       // marigold-500
  '.text-gold': '246 197 60',
};
let bad = 0;
for (const [sel, expect] of Object.entries(RULES)) {
  const i = css.indexOf(sel + ' {');
  if (i < 0) { console.log(`  MISSING  ${sel}`); bad++; continue; }
  const rule = css.slice(css.lastIndexOf('}', i) + 1, css.indexOf('}', i) + 1).replace(/\s+/g, ' ');
  const ok = rule.includes(expect);
  if (!ok) bad++;
  console.log(`  ${ok ? 'ok ' : 'BAD'}  ${sel.padEnd(18)} ${rule.replace(/^\.?\S+ \{ | \}$/g, '').slice(0, 70)}`);
}
console.log(bad ? `\n${bad} rule(s) wrong or missing.` : '\nAll required utilities generated with theme values.');
process.exit(bad ? 1 : 0);
