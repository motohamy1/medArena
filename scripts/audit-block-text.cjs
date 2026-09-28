// Finds class-based text colours that sit on a bright block, where white or a
// pale grey would be low contrast. In this theme bright blocks take INK text,
// so `bg-teal` + `text-white` is a bug even though white on the dark canvas is
// perfectly legible.
const fs = require('fs'), p = require('path');
const root = process.argv[2];
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function lum(h) { const r = h.replace('#', ''); return 0.2126 * lin(parseInt(r.slice(0, 2), 16) / 255) + 0.7152 * lin(parseInt(r.slice(2, 4), 16) / 255) + 0.0722 * lin(parseInt(r.slice(4, 6), 16) / 255); }
function contrast(a, b) { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); }

// every accent block fill a className can produce
const BLOCKS = {
  'bg-main': '#f05c4a', 'bg-accent': '#f05c4a', 'bg-primary': '#f05c4a', 'bg-turquoise': '#877bf4',
  'bg-teal': '#877bf4', 'bg-secondary': '#877bf4', 'bg-gold': '#f6c53c', 'bg-tertiary': '#f6c53c',
  'bg-success': '#4d9960', 'bg-info': '#877bf4', 'bg-danger': '#f05c4a', 'bg-warning': '#f6c53c',
  'bg-lime': '#f05c4a', 'bg-pink': '#eb988a', 'bg-lavender': '#b0afeb', 'bg-ice': '#f6dda2',
};
// text colours that are NOT legible on those blocks
const BAD_TEXT = ['text-white', 'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-paper', 'text-ice', 'text-inverse'];

const dirs = ['app', 'components'];
const files = [];
(function w(ds) { for (const d of ds) { try { walk(p.join(root, d)); } catch {} } })(dirs);
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const f = p.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(f);
  }
}
const found = new Map();
for (const f of files) {
  const rel = f.replace(root + p.sep, '');
  fs.readFileSync(f, 'utf8').split('\n').forEach((ln, i) => {
    const bgKey = Object.keys(BLOCKS).find((k) => ln.includes(k));
    if (!bgKey) return;
    const bad = BAD_TEXT.filter((t) => ln.includes(t));
    if (!bad.length) return;
    const r = contrast('#ffffff', BLOCKS[bgKey]);
    const k = `${bad.join('+')}  on  ${bgKey} (${BLOCKS[bgKey]}, white=${r.toFixed(2)}:1)`;
    if (!found.has(k)) found.set(k, []);
    found.get(k).push(`${rel}:${i + 1}`);
  });
}
console.log(`=== pale text on bright blocks (${found.size} patterns) ===`);
if (!found.size) console.log('  (none)');
for (const [k, sites] of [...found.entries()].sort()) {
  console.log(`  ${k}  x${sites.length}`);
  for (const s of sites.slice(0, 8)) console.log(`        ${s}`);
  if (sites.length > 8) console.log(`        ... +${sites.length - 8} more`);
}
if (process.argv.includes('--quiet')) {
  if (found.size) {
    console.error(`\n${[...found.values()].reduce((a, b) => a + b.length, 0)} pale-text-on-bright-block site(s).`);
    process.exit(1);
  }
  console.log('\nEvery bright block carries ink text.');
  process.exit(0);
}
