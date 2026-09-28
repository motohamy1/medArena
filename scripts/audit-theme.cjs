// Distinguishes intentional bright accents (fine on dark) from leftover light
// surfaces / light greys (breakage). A dark theme legitimately uses pale tints
// as chips, washes and block fills — that is the riso look. What it must never
// do is put a near-white *page* or *card* under dark text.
const fs = require('fs'), p = require('path');
const root = process.argv[2];
const dirs = ['app', 'components', 'lib', 'utils', 'constants', 'hooks', 'templates'];
const files = [];
(function w(ds) { for (const d of ds) { try { walk(p.join(root, d)); } catch {} } })(dirs);
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const f = p.join(d, e.name);
    if (/constants[/\\]Colors\.ts$/.test(f) || /scripts[/\\]/.test(f)) continue;
    if (e.isDirectory()) walk(f);
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(f);
  }
}

// Correct on a dark theme: pale accent tints used as chips/washes/blocks.
const OK = new Set(['#e6e6f8', '#f9e2de', '#d7f0db', '#fbefd4', '#f3c2ba', '#f6dda2', '#b0afeb', '#b4e2bc']);
// Breakage if found: light page/card surfaces or light greys under dark text.
const BAD_SURFACE = new Set(['#bfd2c4', '#fbfaf6', '#f0ede3', '#e3e0d3', '#f5f3ec', '#d3cfc1']);
const BAD_GREY = new Set(['#bfc5ca', '#dbe0e4', '#edf1f4']);

const badSurface = new Map(), badGrey = new Map(), okAccents = new Map();
for (const f of files) {
  const rel = f.replace(root + p.sep, '');
  const s = fs.readFileSync(f, 'utf8');
  s.split('\n').forEach((ln, i) => {
    for (const m of ln.matchAll(/#([0-9a-fA-F]{6})/g)) {
      const h = '#' + m[1].toLowerCase();
      if (BAD_SURFACE.has(h)) { const k = h + '  ' + rel + ':' + (i + 1); badSurface.set(k, (badSurface.get(k) || 0) + 1); }
      else if (BAD_GREY.has(h)) { const k = h + '  ' + rel + ':' + (i + 1); badGrey.set(k, (badGrey.get(k) || 0) + 1); }
      else if (OK.has(h)) { const k = h + '  ' + rel; okAccents.set(k, (okAccents.get(k) || 0) + 1); }
    }
  });
}
const dump = (t, m) => { console.log(`\n=== ${t} (${m.size}) ===`); for (const [k, v] of [...m.entries()].sort((a, b) => b[1] - a[1])) console.log('  ' + String(v).padStart(3) + '  ' + k); };
dump('BREAKAGE: light page/card surfaces', badSurface);
dump('BREAKAGE: light greys', badGrey);
console.log('\n=== intentional bright accents (correct on dark) ===');
console.log('  distinct hex: ' + [...new Set([...okAccents.keys()].map((k) => k.split('  ')[0]))].join(', '));
console.log('  total: ' + [...okAccents.values()].reduce((a, b) => a + b, 0));
console.log('\nfiles scanned: ' + files.length);
