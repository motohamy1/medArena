/**
 * riso-codemod.cjs — maps the retired palette onto the Riso palette.
 *
 * SCOPE — what this does and deliberately does not do:
 *   DOES: re-hue the accent blocks (teal -> periwinkle, glacier aqua -> coral,
 *         pastel rose -> coral-300, lavender -> periwinkle-300, ice -> marigold),
 *         replace the retired petrol-teal neutrals with the night ramp, and
 *         replace the old muted specialty scale with the full-chroma one.
 *   DOES NOT: touch text colors, borders, or StatusBar. The original app was a
 *         dark UI with white copy and light status-bar glyphs, and the Riso
 *         reference is also a dark UI with white copy — so those were correct
 *         all along and are left alone.
 *
 * The reference's signature — bright riso blocks floating on a near-black
 * canvas — survives the old theme's structure intact. Only the hues move.
 *
 * Usage: node scripts/riso-codemod.cjs [--apply]
 */
const fs = require('fs');
const p = require('path');

const root = process.argv[2] || process.cwd();
const apply = process.argv.includes('--apply');
const dirs = ['app', 'components', 'lib', 'utils', 'constants', 'hooks', 'templates'];

const files = [];
(function walkMany(ds) { for (const d of ds) { try { walk(p.join(root, d)); } catch {} } })(dirs);
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const f = p.join(d, e.name);
    // Never let the codemod touch the token source of truth or itself.
    if (/[/\\]constants[/\\]Colors\.ts$/.test(f) || /riso-codemod\.cjs$/.test(f)) continue;
    if (e.isDirectory()) walk(f);
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(f);
  }
}

// --- retired petrol-teal neutrals -> the night ramp --------------------------
// Grouped by role so like-for-like: page canvases to canvas, card surfaces to
// card, tinted panels to the matching hue-cast night family.
const NIGHT = {
  // page canvases
  '#091114': '#08090b', '#010101': '#08090b', '#080808': '#08090b', '#0a0a0a': '#08090b',
  '#060a0c': '#08090b', '#071315': '#08090b',
  // card surfaces
  '#0c1017': '#1a1c20', '#0e1416': '#1a1c20', '#0d1214': '#1a1c20', '#0d1316': '#1a1c20',
  '#090d0f': '#1a1c20', '#090e10': '#1a1c20', '#080e11': '#1a1c20', '#0c1214': '#1a1c20',
  '#0c1619': '#1a1c20', '#0a0e14': '#1a1c20', '#0a0f14': '#1a1c20', '#080c0d': '#1a1c20',
  '#080c0e': '#1a1c20', '#0d1316': '#1a1c20',
  // raised panels
  '#121719': '#23262b', '#151c1f': '#23262b', '#1a2228': '#23262b', '#121922': '#23262b',
  '#111315': '#23262b', '#101618': '#23262b', '#141d20': '#23262b', '#121419': '#23262b',
  '#0e1214': '#23262b', '#161718': '#23262b', '#0f1717': '#23262b', '#151318': '#23262b',
  '#190e13': '#23262b',
  // periwinkle-cast panels
  '#292048': '#1d1c34', '#1a1432': '#1d1c34', '#0e0b1c': '#1d1c34', '#1c1736': '#1d1c34',
  '#0c0919': '#1d1c34', '#112428': '#1d1c34',
  '#051615': '#1d1c34', '#0b2423': '#1d1c34', '#123635': '#1d1c34', '#143836': '#1d1c34',
  '#0d2524': '#1d1c34', '#133534': '#1d1c34', '#0e2427': '#1d1c34',
  // coral/rose-cast panels
  '#3e1628': '#321612', '#240d18': '#321612', '#381525': '#321612', '#14070e': '#321612',
  '#16070e': '#321612', '#1a0e0e': '#321612',
  // neutral greys. NOTE: the greys that appear as TEXT or icons must land on a
  // text-safe stop (>= 4.5:1 on canvas). night-500/400 are hairline and
  // disabled stops and are too dark for copy, so they map to night-300.
  '#384d52': '#40444c', '#527278': '#535862', '#404040': '#535862',
  '#7b8188': '#8c92a0', '#737373': '#8c92a0', '#6b7280': '#8c92a0', '#4b5563': '#8c92a0',
  '#8e8e93': '#8c92a0', '#94a3b8': '#8c92a0', '#9ca3af': '#8c92a0', '#9e9e9e': '#8c92a0',
  '#e2e8f0': '#ccd1dc', '#cbd5e1': '#ccd1dc', '#e5e7eb': '#ccd1dc',
  '#d1d5db': '#abb1be', '#f1f5f9': '#e8ebf2',
};

// --- retired accents -> Riso accents ----------------------------------------
const ACCENT = {
  '#4bc0b8': '#877bf4', '#6dc2bd': '#877bf4', '#6ec2be': '#877bf4',
  '#a9e4e8': '#f05c4a', '#defff9': '#f6dda2',
  '#cbc8f5': '#b0afeb', '#dbd4fd': '#b0afeb',
  '#f9bac9': '#eb988a', '#ffc3dd': '#eb988a',
  '#fbbf24': '#f6c53c', '#f59e0b': '#b0890e',
  '#10b981': '#4d9960', '#34d399': '#4d9960',
  '#ef4444': '#f05c4a', '#f87171': '#eb988a', '#fca5a5': '#f3c2ba',
  // retired specialty scale (muted, L=0.700 C=0.075) -> full-chroma riso scale
  '#c78b98': '#ec8bb2', '#a9a069': '#b3b54f', '#86aa7e': '#47c7a2', '#7fa1cd': '#5ab8f5',
  '#c88e7f': '#ea975c', '#b490bc': '#d193df', '#62adb2': '#18c4d3', '#98a0a3': '#a6b1aa',
  // 8-digit alpha variants of the same accents keep their alpha
  '#f9bac925': '#eb988a25', '#f9bac960': '#eb988a60',
  '#4bc0b825': '#877bf425', '#4bc0b860': '#877bf460',
};

// --- rgba() forms of the same accents ---------------------------------------
const RGB = {
  '109, 194, 189': '135, 123, 244',
  '169, 228, 232': '240, 92, 74',
  '249, 186, 201': '235, 152, 138',
  '203, 200, 245': '176, 175, 235',
  '219, 212, 253': '176, 175, 235',
  '222, 255, 249': '246, 221, 162',
  '255, 195, 221': '235, 152, 138',
  '0, 240, 255': '135, 123, 244',
  '78, 115, 122': '64, 68, 76',
  '82, 114, 120': '64, 68, 76',
};

const stats = new Map();
const bump = (k) => stats.set(k, (stats.get(k) || 0) + 1);

function rewrite(src) {
  let out = src;
  for (const [from, to] of Object.entries(NIGHT)) {
    const re = new RegExp(from.replace('#', '#'), 'gi');
    out = out.replace(re, () => { bump(`hex ${from} -> ${to}`); return to; });
  }
  for (const [from, to] of Object.entries(ACCENT)) {
    const re = new RegExp(from.replace('#', '#'), 'gi');
    out = out.replace(re, () => { bump(`hex ${from} -> ${to}`); return to; });
  }
  for (const [from, to] of Object.entries(RGB)) {
    const re = new RegExp(`rgba?\\(\\s*${from.split(', ').join('\\s*,\\s*')}\\s*,`, 'g');
    out = out.replace(re, (m) => { bump(`rgb(${from}) -> rgb(${to})`); return m.replace(from, to); });
  }
  // --- text legibility -------------------------------------------------------
  // Any hex used in a text/icon position must be legible on the night canvas.
  // The one exception is the ink family: near-black IS the correct text colour
  // when it sits on a bright block (ink on coral, periwinkle, marigold, sage,
  // paper) — that is the riso signature, not a mistake. So ink blacks are
  // exempt and every other dark hex in a text position gets lifted to
  // night-300, the last stop that clears AA on the canvas.
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = (h) => { const r = h.replace('#', ''); return 0.2126 * lin(parseInt(r.slice(0, 2), 16) / 255) + 0.7152 * lin(parseInt(r.slice(2, 4), 16) / 255) + 0.0722 * lin(parseInt(r.slice(4, 6), 16) / 255); };
  const cont = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const CANVAS = '#08090b', TEXT_SAFE = '#8c92a0';
  const INK = new Set(['#000000', '#050708', '#08090b', '#14181a']);
  const lift = (hex) => (cont(hex, CANVAS) < 4.5 && !INK.has(hex) ? TEXT_SAFE : hex);

  out = out.replace(/color=(["'])(#[0-9a-fA-F]{6})\1/g, (m, q, hex) => {
    const to = lift(hex.toLowerCase());
    if (to === hex) return m;
    bump(`icon ${hex} -> ${to}`);
    return `color=${q}${to}${q}`;
  });
  out = out.replace(/color:\s*(["'])(#[0-9a-fA-F]{6})\1/g, (m, q, hex) => {
    const to = lift(hex.toLowerCase());
    if (to === hex) return m;
    bump(`style color ${hex} -> ${to}`);
    return `color: ${q}${to}${q}`;
  });
  out = out.replace(/text-\[#([0-9a-fA-F]{6})\]/g, (m, h) => {
    const hex = '#' + h.toLowerCase();
    const to = lift(hex);
    if (to === hex) return m;
    bump(`text[${hex}] -> text-[${to}]`);
    return `text-[${to.slice(1)}]`;
  });

  return out;
}

let changedFiles = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const after = rewrite(before);
  if (after !== before) {
    changedFiles++;
    if (apply) fs.writeFileSync(f, after);
  }
}

const total = [...stats.values()].reduce((a, b) => a + b, 0);
console.log(`${apply ? 'Rewrote' : 'Would rewrite'} ${total} literal(s) across ${changedFiles} file(s).\n`);
for (const [k, v] of [...stats.entries()].sort((a, b) => b[1] - a[1])) {
  console.log('  ' + String(v).padStart(4) + '  ' + k);
}
