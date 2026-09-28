// Resolves every text colour in a file — class names, tokens, and raw hex — to
// a hex value, then checks it against the dark canvas. Reports anything below
// 4.5:1 WITH the line, so the surface is visible. This is the audit that should
// have existed before: it does not exempt ink, because `text-ink` on a dark
// surface is just as invisible as any other dark colour.
const Module = require('module');
const fs = require('fs'), path = require('path');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  try { return origResolve.call(this, request, parent, ...rest); }
  catch (err) {
    if (request.startsWith('.') && parent && parent.filename) {
      const c = path.resolve(path.dirname(parent.filename), request + '.ts');
      if (fs.existsSync(c)) return c;
    }
    throw err;
  }
};
const root = process.argv[2];
const targets = process.argv.slice(3);
const { Colors, palette } = require(path.join(root, 'constants', 'Colors.ts'));
const cfg = require(path.join(root, 'tailwind.config.js'));
const C = cfg.theme.colors;
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => { const r = h.replace('#', ''); return 0.2126 * lin(parseInt(r.slice(0, 2), 16) / 255) + 0.7152 * lin(parseInt(r.slice(2, 4), 16) / 255) + 0.0722 * lin(parseInt(r.slice(4, 6), 16) / 255); };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const CANVAS = '#08090B';

// resolve a text-* class to a hex
function resolveClass(name) {
  const bare = name.replace(/^text-/, '');
  if (C[bare] && typeof C[bare] === 'string') return C[bare];
  const m = bare.match(/^(\w+)-(\d{2,3})$/);
  if (m && C[m[1]] && typeof C[m[1]] === 'object') return C[m[1]][m[2]];
  if (bare === 'white') return '#ffffff';
  if (bare === 'black') return '#000000';
  if (C.specialty && C.specialty[bare]) return C.specialty[bare];
  return null;
}
// resolve Colors.X to a hex
function resolveToken(t) {
  const parts = t.split('.');
  let v = Colors;
  for (const p of parts) { if (v == null) return null; v = v[p]; }
  return typeof v === 'string' ? v : null;
}

const files = targets.length
  ? targets.map((t) => path.join(root, t)).filter((f) => fs.existsSync(f))
  : (() => {
      // no targets: walk the whole app + components tree
      const out = [];
      for (const d of ['app', 'components']) {
        const base = path.join(root, d);
        if (!fs.existsSync(base)) continue;
        (function walk(dir) {
          for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const f = path.join(dir, e.name);
            if (e.isDirectory()) walk(f);
            else if (/\.(ts|tsx)$/.test(e.name)) out.push(f);
          }
        })(base);
      }
      return out;
    })();
for (const f of files) {
  const rel = f.replace(root + path.sep, '');
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  const out = [];
  lines.forEach((ln, i) => {
    const hits = [];
    for (const m of ln.matchAll(/\btext-([a-z][a-z0-9-]*)\b/g)) {
      if (/^(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|center|left|right|justify|uppercase|lowercase|capitalize|italic|font|leading|tracking|opacity|clip|wrap|balance|pretty|ellipsis|nowrap|underline|overline|line-through|no-underline|shadow|align|baseline|top|middle|bottom|transform|bold|semibold|medium|normal|light|extrabold|black|xs-|sm-|lg-|xl-)/.test(m[1])) continue;
      const hex = resolveClass(m[1]);
      if (hex) hits.push([`text-${m[1]}`, hex]);
    }
    for (const m of ln.matchAll(/\btext-\[#([0-9a-fA-F]{6})\]/g)) hits.push([`text-[#${m[1]}]`, '#' + m[1].toLowerCase()]);
    for (const m of ln.matchAll(/color=\{Colors\.([A-Za-z.$\w]+)\}/g)) { const h = resolveToken(m[1]); if (h) hits.push([`Colors.${m[1]}`, h]); }
    for (const m of ln.matchAll(/color:\s*Colors\.([A-Za-z.$\w]+)/g)) { const h = resolveToken(m[1]); if (h) hits.push([`Colors.${m[1]}`, h]); }
    for (const m of ln.matchAll(/color=\{["']#([0-9a-fA-F]{6})["']\}/g)) hits.push([`color=`, '#' + m[1].toLowerCase()]);
    for (const m of ln.matchAll(/color:\s*["']#([0-9a-fA-F]{6})["']/g)) hits.push(['color:', '#' + m[1].toLowerCase()]);
    for (const [label, hex] of hits) {
      const r = contrast(hex, CANVAS), rc = contrast(hex, C.card);
      if (r >= 4.5 || rc >= 4.5) continue;
      out.push(`  ${rel}:${i + 1}  ${label} = ${hex}   canvas=${r.toFixed(2)}:1 card=${rc.toFixed(2)}:1`);
      out.push(`      ${ln.trim().slice(0, 145)}`);
    }
  });
  if (out.length) console.log(`\n=== ${rel} — ${out.filter((l) => l.startsWith('  ')).length / 2} dark text site(s) ===\n${out.join('\n')}`);
  else console.log(`\n=== ${rel} — OK ===`);
}
