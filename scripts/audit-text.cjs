// Finds every place a colour is used as TEXT and checks whether it is legible
// on the dark canvas. A dark text colour is only legitimate when it sits on a
// bright block (ink on coral, periwinkle, marigold, sage, paper) — that is the
// riso signature. Everywhere else it is invisible copy.
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
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function lum(h) { const r = h.replace('#', ''); return 0.2126 * lin(parseInt(r.slice(0, 2), 16) / 255) + 0.7152 * lin(parseInt(r.slice(2, 4), 16) / 255) + 0.0722 * lin(parseInt(r.slice(4, 6), 16) / 255); }
function contrast(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
const CANVAS = '#08090B', CARD = '#1A1C20', RAISED = '#30333A';
// bright blocks: a dark text colour is allowed if the surface under it is one of these
const BRIGHT = ['#f05c4a', '#877bf4', '#f6c53c', '#4d9960', '#bfd2c4', '#fbfaf6', '#b0afeb', '#eb988a', '#f3c2ba', '#f6dda2', '#89d298', '#f9cf62', '#ec8bb2', '#ea975c', '#b3b54f', '#47c7a2', '#18c4d3', '#5ab8f5', '#d193df'];
const isBright = (h) => BRIGHT.includes(h) || lum(h) > 0.35;
// The ink family is the palette's designated text-on-bright-block colour. It is
// exempt here because the surface under it is usually a prop or a variable
// (backgroundColor: specialty.color, a LinearGradient) that this static audit
// cannot resolve. Its correctness is asserted by check-colors.js rule 8, which
// pins ink to every bright stop. Everything else that is dark in a text
// position is a bug: on a night canvas it is invisible copy.
const INK = new Set(['#000000', '#050708', '#08090b', '#14181a']);

const invisible = new Map(); // hex -> {count, sites[]}
const okInk = new Map();
for (const f of files) {
  const rel = f.replace(root + p.sep, '');
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((ln, i) => {
    // gather candidate text colours on this line
    const hits = [];
    for (const m of ln.matchAll(/text-\[#([0-9a-fA-F]{6})\]/g)) hits.push('#' + m[1].toLowerCase());
    for (const m of ln.matchAll(/color=(["'])#([0-9a-fA-F]{6})\1/g)) hits.push('#' + m[2].toLowerCase());
    for (const m of ln.matchAll(/color:\s*["']#([0-9a-fA-F]{6})["']/g)) hits.push('#' + m[1].toLowerCase());
    if (!hits.length) return;

    // the surface it sits on: a bg in the same className/style block if present
    const bg = (ln.match(/bg-\[#([0-9a-fA-F]{6})\]/) || [])[1];
    const bgStyle = (ln.match(/backgroundColor:\s*["']#([0-9a-fA-F]{6})["']/) || [])[1];
    const surface = bg || bgStyle ? '#' + (bg || bgStyle).toLowerCase() : null;

    for (const h of [...new Set(hits)]) {
      if (INK.has(h)) continue; // ink on a bright block — verified separately
      const onCanvas = contrast(h, CANVAS), onCard = contrast(h, CARD);
      const legibleOnDark = onCanvas >= 4.5 || onCard >= 4.5;
      const onBright = surface ? isBright(surface) : false;
      const key = h;
      const store = legibleOnDark || onBright ? okInk : invisible;
      if (!store.has(key)) store.set(key, { count: 0, sites: [] });
      const e = store.get(key);
      e.count++;
      e.sites.push(`${rel}:${i + 1}${surface ? ` on ${surface}` : ''}`);
    }
  });
}

const dump = (t, m) => {
  console.log(`\n=== ${t} ===`);
  if (!m.size) { console.log('  (none)'); return; }
  for (const [h, { count, sites }] of [...m.entries()].sort((a, b) => b.count - a.count)) {
    console.log(`  ${h}  x${count}`);
    for (const s of sites.slice(0, 6)) console.log(`        ${s}`);
    if (sites.length > 6) console.log(`        ... +${sites.length - 6} more`);
  }
};
dump('INVISIBLE text colours (dark on dark, not ink, not on a bright block)', invisible);
if (process.argv.includes('--quiet')) {
  if (invisible.size) {
    console.error(`\n${[...invisible.values()].reduce((a, b) => a + b.count, 0)} invisible text colour(s) across ${invisible.size} hex value(s).`);
    process.exit(1);
  }
  console.log('\nEvery text colour is legible on the night canvas.');
  process.exit(0);
}
console.log('\nfiles scanned: ' + files.length);
