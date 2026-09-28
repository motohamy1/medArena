// Fails if any colour-position utility used in the source does not resolve in
// the Tailwind theme. An unresolved class does NOT fall back — it silently
// generates nothing, which is how `bg-teal` buttons lost their fill and their
// ink text ended up invisible on the canvas.
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
const root = process.argv[2] || process.cwd();
const cfg = require(path.join(root, 'tailwind.config.js'));
const C = cfg.theme.colors;

// every colour-carrying utility prefix Tailwind has
const COLOR_PREFIX = ['text', 'bg', 'border', 'from', 'via', 'to', 'ring', 'fill', 'stroke', 'divide', 'placeholder', 'caret', 'accent', 'decoration'];
// suffixes under those prefixes that are NOT colours
const NON_COLOR = new Set([
  // text-
  'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl',
  'left', 'center', 'right', 'justify', 'start', 'end',
  'uppercase', 'lowercase', 'capitalize', 'normal-case',
  'italic', 'not-italic', 'underline', 'overline', 'line-through', 'no-underline',
  'truncate', 'ellipsis', 'clip', 'wrap', 'nowrap', 'balance', 'pretty',
  'opacity', 'transform', 'reset',
  // bg-
  'cover', 'contain', 'fixed', 'local', 'scroll', 'transparent', 'none', 'auto',
  'repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'round', 'space',
  'bottom', 'top', 'center', 'left', 'right',
  // border-
  'solid', 'dashed', 'dotted', 'double', 'hidden', 'collapse', 'separate', 'spacing', 'slate',
  // border sides
  't', 'r', 'b', 'l', 'x', 'y', 's', 'e',
]);
const isNumber = (s) => /^\d+(\.\d+)?$/.test(s);

// resolve a bare utility name to a colour value. The /opacity modifier is
// stripped first: `border-white/10` resolves against `white`, so a modifier
// must never make a valid class look unresolved.
function resolve(bare) {
  const base = bare.split('/')[0];
  if (C[base] !== undefined) return typeof C[base] === 'string' ? C[base] : 'scale';
  const m = base.match(/^([a-z-]+)-(\d{2,3})$/);
  if (m && C[m[1]] && typeof C[m[1]] === 'object') return C[m[1]][m[2]];
  if (C.specialty && C.specialty[base] !== undefined) return C.specialty[base];
  return null;
}

const files = [];
for (const d of ['app', 'components']) {
  const base = path.join(root, d);
  if (!fs.existsSync(base)) continue;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) walk(f);
      else if (/\.(ts|tsx)$/.test(e.name)) files.push(f);
    }
  })(base);
}

const missing = new Map();
for (const f of files) {
  const rel = f.replace(root + path.sep, '');
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\b(text|bg|border|from|via|to|ring|fill|stroke|divide|placeholder|caret|accent|decoration)-([a-zA-Z0-9][a-zA-Z0-9/-]*)(?=[\s"'`}])/g)) {
    const prefix = m[1], bare = m[2];
    if (bare.startsWith('[')) continue;              // arbitrary value — explicit
    if (NON_COLOR.has(bare)) continue;
    if (isNumber(bare)) continue;                    // border-2, ring-1, z-index-less
    if (/^(gradient|conic|linear|radial)/.test(bare)) continue;
    const hex = resolve(bare);
    if (hex) continue;
    const key = `${prefix}-${bare}`;
    if (!missing.has(key)) missing.set(key, { n: 0, sites: [] });
    const e = missing.get(key);
    e.n++;
    if (e.sites.length < 4) e.sites.push(rel);
  }
}

console.log(`=== unresolved colour utilities (${missing.size}) ===`);
if (!missing.size) { console.log('  (none) — every colour class resolves'); process.exit(0); }
for (const [k, { n, sites }] of [...missing.entries()].sort((a, b) => b[1].n - a[1].n)) {
  console.log(`  ${k}  x${n}   ${sites.join(', ')}`);
}
process.exit(1);
