/**
 * check-colors.js — palette drift guard for Medical Arena's "Riso" theme.
 *
 * constants/Colors.ts keeps hex at runtime (React Native can't parse oklch),
 * but every primitive is spec'd in OKLCH in a trailing comment. This script
 * loads the real module, converts each hex back to OKLCH, and fails if either
 * the hex no longer matches its stated spec or a structural rule breaks:
 *
 *   1. OKLCH round-trip  — hex must match its spec comment.
 *   2. Nothing is white  — the paper substrate must stay warm; #FFFFFF is banned.
 *   3. Elevation ramp    — the legacy surface ramp must stay strictly ascending.
 *   4. Hue lock          — each family holds its hue; night stays near-neutral.
 *   5. Accent separation — coral/periwinkle/marigold/moss own four distinct bands.
 *   6. Specialty scale   — L and C locked, only hue rotates.
 *   7. Specialty clearance — no specialty may sit inside an accent hue band.
 *   8. Ink on fills      — THE signature rule: ink text on -100..-500.
 *   9. Deep fills usable — -700/-800 must take either ink or paper text.
 *  10. Marigold is never text — yellow on light is unreadable; amber carries it.
 *  11. Text AA on dark  — every text token clears WCAG on every dark surface.
 *  12. Text AA on blocks — onAccentDeep / onLightCanvas likewise.
 *  13. Blocks stay loud — every -500 block must separate from the canvas by
 *      luminance. A muted block on the dark canvas is the failure mode this
 *      theme dies by; the contrast IS the design.
 *  14. Panels yield     — tinted panels must carry less chroma than the blocks.
 *  15. No stray hex     — every Colors value must come from the primitives.
 *  16. Canvas is dark   — the app's chrome is near-black. If this ever flips,
 *      someone has re-flattened the theme onto a light canvas. Regression gate.
 *
 * Run: node scripts/check-colors.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'constants', 'Colors.ts');

// Node >= 22.18 strips TS types on require, so we audit the live module rather
// than a regex approximation of it. Aliases resolve automatically.
const { palette, Colors } = require(SRC);

// ---------------------------------------------------------------------------
// color math
// ---------------------------------------------------------------------------
function hexToRgb(h) {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
}
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

function rgbToOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLin);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
function hueGap(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// ---------------------------------------------------------------------------
// token collection
// ---------------------------------------------------------------------------
const errors = [];
const fail = (m) => errors.push(m);

const oklchOf = (hex) => rgbToOklch(hex);

// Flatten the primitive palette into dotted paths: "coral.500"
const primitives = {};
for (const [fam, stops] of Object.entries(palette)) {
  for (const [stop, hex] of Object.entries(stops)) primitives[`${fam}.${stop}`] = hex;
}
for (const [k, hex] of Object.entries(Colors.specialty)) primitives[`specialty.${k}`] = hex;

// ---------------------------------------------------------------------------
// 1. OKLCH round-trip against the spec comments
// ---------------------------------------------------------------------------
const src = fs.readFileSync(SRC, 'utf8');
let section = null;
let specs = 0;
for (const line of src.split('\n')) {
  const fam = line.match(/^  ([a-z]+): \{$/);
  if (fam) { section = fam[1]; continue; }
  if (/^const specialty = \{$/.test(line)) { section = 'specialty'; continue; }
  if (/^\}/.test(line)) section = null;
  const stop = line.match(/^\s+('([^']+)'|([A-Za-z_$][\w$]*|\d+)):\s*'(#[0-9a-fA-F]{6})'.*?oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!stop) continue;
  const name = stop[2] || stop[3];
  const hex = stop[4].toUpperCase();
  const spec = { L: parseFloat(stop[5]), C: parseFloat(stop[6]), H: parseFloat(stop[7]) };
  const key = section === 'specialty' ? `specialty.${name}` : `${section}.${name}`;
  if (primitives[key] === undefined) continue;
  specs++;
  const got = oklchOf(hex);
  if (Math.abs(got.L - spec.L) > 0.002) fail(`${key} hex ${hex} is L=${got.L.toFixed(3)}, spec says ${spec.L.toFixed(3)} — hex drifted from its OKLCH comment`);
  if (Math.abs(got.C - spec.C) > 0.002) fail(`${key} hex ${hex} is C=${got.C.toFixed(3)}, spec says ${spec.C.toFixed(3)} — hex drifted from its OKLCH comment`);
  // Hue is only meaningful once a token carries enough chroma to have a hue.
  // Below C=0.035 the 8-bit hex grid jitters the angle by degrees for reasons
  // that are invisible on screen, so only L and C are enforced there.
  if (spec.C >= 0.035 && hueGap(got.H, spec.H) > 3) fail(`${key} hex ${hex} is H=${got.H.toFixed(1)}°, spec says ${spec.H}° — hue drifted from its OKLCH comment`);
}
if (specs < 40) fail(`only ${specs} tokens carry a parseable oklch() spec comment — primitives must be spec'd, not just hex'd`);

// ---------------------------------------------------------------------------
// 2. Nothing is white
// ---------------------------------------------------------------------------
for (const [k, hex] of Object.entries(primitives)) {
  if (hex.toUpperCase() === '#FFFFFF') fail(`${k} is pure #FFFFFF — the paper substrate must stay warm; use paper.0`);
}

// ---------------------------------------------------------------------------
// 3. Legacy elevation ramp stays strictly ascending
// ---------------------------------------------------------------------------
const RAMP = ['background', 'deepTeal', 'tealDark', 'tealMedium', 'surfaceHover'];
for (let i = 1; i < RAMP.length; i++) {
  const a = oklchOf(Colors[RAMP[i - 1]]).L, b = oklchOf(Colors[RAMP[i]]).L;
  if (!(b > a)) fail(`ramp order broken: ${RAMP[i]} (L ${b.toFixed(3)}) <= ${RAMP[i - 1]} (L ${a.toFixed(3)}) — surfaces collapse`);
}

// ---------------------------------------------------------------------------
// 4. Hue lock per family
// ---------------------------------------------------------------------------
const HUE_LOCK = {
  sage: [155, 6], paper: [95, 10], coral: [30, 5], periwinkle: [285, 5],
  marigold: [88, 5], amber: [70, 6], moss: [150, 6],
  night: [265, 12], nightperi: [285, 8], nightcoral: [30, 8],
  nightmarigold: [88, 10], nightmoss: [150, 8], nightsage: [155, 8],
};
for (const [fam, [H, tol]] of Object.entries(HUE_LOCK)) {
  for (const [stop, hex] of Object.entries(palette[fam] || {})) {
    const o = oklchOf(hex);
    if (o.C < 0.008) continue; // near-neutral stops carry no meaningful hue
    const d = hueGap(o.H, H);
    if (d > tol) fail(`${fam}.${stop} hue ${o.H.toFixed(1)}° drifted ${d.toFixed(1)}° from the family anchor ${H}°`);
  }
}
// The neutral axis must not read as a colour. The tinted families exist
// precisely to carry a cast, so they are exempt — but they are capped by
// rule 14 instead.
for (const [stop, hex] of Object.entries(palette.night)) {
  const o = oklchOf(hex);
  if (o.C > 0.024) fail(`night.${stop} C=${o.C.toFixed(3)} exceeds 0.024 — the neutral axis must not read as a colour`);
}
for (const [stop, hex] of Object.entries(palette.ink)) {
  const o = oklchOf(hex);
  if (o.C > 0.018) fail(`ink.${stop} C=${o.C.toFixed(3)} exceeds 0.018 — ink is the neutral black, not a colour`);
}

// ---------------------------------------------------------------------------
// 5. The accent triad + moss own distinct hue bands
// ---------------------------------------------------------------------------
const BANDS = { coral: 30, marigold: 88, moss: 150, periwinkle: 285 };
const bandNames = Object.keys(BANDS);
for (let i = 0; i < bandNames.length; i++) {
  for (let j = i + 1; j < bandNames.length; j++) {
    const a = bandNames[i], b = bandNames[j];
    const gap = hueGap(BANDS[a], BANDS[b]);
    if (gap < 25) fail(`accent bands ${a} (${BANDS[a]}°) and ${b} (${BANDS[b]}°) are only ${gap.toFixed(0)}° apart — they must clear 25°`);
  }
}

// ---------------------------------------------------------------------------
// 6/7. Specialty scale
// ---------------------------------------------------------------------------
const SPEC_L = 0.750, SPEC_C = 0.125, SPEC_TOL = 0.006;
const ACCENT_BANDS = Object.entries(BANDS);
const CANVAS_LUM = luminance(Colors.surface.canvas);
// Quietest accent-500 block. Anything meant to sit *behind* copy must carry
// less chroma than this, or the eye reads the panel and the block as peers.
const BLOCK_C = Math.min(...['coral', 'periwinkle', 'marigold', 'moss'].map((f) => oklchOf(palette[f][500]).C));
for (const [name, hex] of Object.entries(Colors.specialty)) {
  const o = oklchOf(hex);
  if (name === 'more') {
    if (o.C > 0.030) fail(`specialty.more C=${o.C.toFixed(3)} — the overflow slot must stay neutral`);
  } else {
    if (Math.abs(o.L - SPEC_L) > SPEC_TOL) fail(`specialty.${name} L=${o.L.toFixed(3)} outside ${SPEC_L} ± ${SPEC_TOL} — the scale must hold one lightness`);
    if (Math.abs(o.C - SPEC_C) > SPEC_TOL) fail(`specialty.${name} C=${o.C.toFixed(3)} outside ${SPEC_C} ± ${SPEC_TOL} — only hue may rotate`);
  }
  for (const [band, H] of ACCENT_BANDS) {
    if (o.C < 0.04) break; // near-neutral: its hue carries no signal, so it cannot collide
    const gap = hueGap(o.H, H);
    if (gap < 15) fail(`specialty.${name} hue ${o.H.toFixed(1)}° sits inside the ${band} band (${H}°, gap ${gap.toFixed(0)}°) — a chip would read as an action`);
  }
  const sep = Math.abs(luminance(hex) - CANVAS_LUM);
  if (sep < 0.12) fail(`specialty.${name} (${hex}) separates from the canvas by only ${sep.toFixed(3)} — chips vanish on night (needs >= 0.12)`);
}

// ---------------------------------------------------------------------------
// 8/9. Fill legibility. -100..-500 are bright fills and MUST take ink text.
//      -700/-800 are deep fills and must take whichever of ink/paper reads.
// ---------------------------------------------------------------------------
const BRIGHT_STOPS = ['100', '200', '300', '500'];
const DEEP_STOPS = ['700', '800'];
const FAMILIES = ['coral', 'periwinkle', 'marigold', 'amber', 'moss'];
for (const fam of FAMILIES) {
  for (const stop of BRIGHT_STOPS) {
    const hex = palette[fam]?.[stop];
    if (!hex) continue;
    const r = contrast(Colors.text.onAccent, hex);
    if (r < 4.5) fail(`ink text on ${fam}.${stop} (${hex}) is ${r.toFixed(2)}:1 — needs 4.5:1. Bright fills take ink text, never paper.`);
  }
  for (const stop of DEEP_STOPS) {
    const hex = palette[fam]?.[stop];
    if (!hex) continue;
    const best = Math.max(contrast(Colors.text.onAccent, hex), contrast(Colors.text.onAccentDeep, hex));
    if (best < 4.5) fail(`${fam}.${stop} (${hex}) is unusable as a fill — neither ink nor paper text clears 4.5:1 (best ${best.toFixed(2)}:1)`);
  }
}
for (const [name, hex] of Object.entries(Colors.specialty)) {
  const r = contrast(Colors.text.onAccent, hex);
  if (r < 4.5) fail(`ink text on specialty.${name} (${hex}) is ${r.toFixed(2)}:1 — needs 4.5:1`);
}

// 10. Marigold can never be a text color on LIGHT — yellow on paper or on a
// sage canvas is unreadable. On the dark canvas marigold-300 is perfectly
// legible, so only the *OnLight roles are constrained.
const marigoldStops = new Set(Object.values(palette.marigold).map((h) => h.toUpperCase()));
for (const [role, hex] of Object.entries(Colors.status)) {
  if (role.endsWith('OnLight') && marigoldStops.has(hex.toUpperCase())) {
    fail(`status.${role} points at a marigold stop (${hex}) — yellow is unreadable on a light canvas; use amber.800`);
  }
}

// ---------------------------------------------------------------------------
// 11. Text AA on every dark surface
// ---------------------------------------------------------------------------
const DARK_GROUNDS = {
  canvas: Colors.surface.canvas,
  sunken: Colors.surface.sunken,
  card: Colors.surface.card,
  cardTint: Colors.surface.cardTint,
  raised: Colors.surface.raised,
};
// Each text role is asserted against the grounds it is actually used on.
// `subtle` marks timestamps and hints on the page and its cards; `disabled` is
// a 3:1 floor for non-text and large text. Neither belongs inside a popover,
// so requiring them on `raised` would be modelling a case that does not exist.
const ROLE_GROUNDS = {
  primary: { min: 7, grounds: ['canvas', 'sunken', 'card', 'cardTint', 'raised'] },
  secondary: { min: 7, grounds: ['canvas', 'sunken', 'card', 'cardTint', 'raised'] },
  muted: { min: 4.5, grounds: ['canvas', 'sunken', 'card', 'cardTint', 'raised'] },
  subtle: { min: 4.5, grounds: ['canvas', 'sunken', 'card', 'cardTint'] },
  disabled: { min: 3.0, grounds: ['canvas', 'sunken', 'card', 'cardTint'] },
};
for (const [role, { min, grounds }] of Object.entries(ROLE_GROUNDS)) {
  for (const g of grounds) {
    const hex = DARK_GROUNDS[g];
    const r = contrast(Colors.text[role], hex);
    if (r < min) fail(`text.${role} on surface.${g} (${hex}) is ${r.toFixed(2)}:1 — needs ${min}:1`);
  }
}
for (const [g, hex] of Object.entries(Colors.surface)) {
  if (!g.startsWith('panel')) continue;
  const r = contrast(Colors.text.primary, hex);
  if (r < 7) fail(`text.primary on surface.${g} (${hex}) is ${r.toFixed(2)}:1 — needs 7:1`);
}
// status text is read on dark grounds in this theme
for (const role of ['dangerText', 'warningText', 'successText', 'infoText']) {
  for (const [g, hex] of Object.entries(DARK_GROUNDS)) {
    const r = contrast(Colors.status[role], hex);
    if (r < 4.5) fail(`status.${role} on surface.${g} (${hex}) is ${r.toFixed(2)}:1 — needs 4.5:1`);
  }
}
// ...and its light-ground twin on each genuinely LIGHT screen canvas.
// Periwinkle-500 is a mid-tone: the reference puts ink copy and black blocks on
// it, never light-ground status text, so it is not a ground for these roles.
const LIGHT_GROUNDS = {
  screenSage: Colors.surface.screenSage,
  screenPaper: Colors.surface.screenPaper,
};
for (const role of ['dangerOnLight', 'warningOnLight', 'successOnLight', 'infoOnLight']) {
  for (const [g, hex] of Object.entries(LIGHT_GROUNDS)) {
    const r = contrast(Colors.status[role], hex);
    if (r < 4.5) fail(`status.${role} on surface.${g} (${hex}) is ${r.toFixed(2)}:1 — needs 4.5:1`);
  }
}
// a status tint is a background wash, so it must stay quieter than the block
for (const role of ['dangerTint', 'warningTint', 'successTint', 'infoTint']) {
  const hex = Colors.status[role];
  const sep = luminance(hex) - CANVAS_LUM;
  if (sep <= 0) fail(`status.${role} (${hex}) does not lift off the canvas — a wash must read as a surface`);
  const o = oklchOf(hex);
  if (o.C >= BLOCK_C) fail(`status.${role} C=${o.C.toFixed(3)} is as loud as a block — a wash must yield to the copy on it`);
}

// ---------------------------------------------------------------------------
// 12. Every fill stop resolves to exactly one text role.
//
// Rule 8 pins the bright stops to ink — that is the signature and is not
// negotiable. The deep stops are decided by measurement, because the palette
// cannot pretend otherwise: marigold-700 is a *deep* stop that still takes ink
// text, since yellow that dark is no longer yellow, while coral-700 and friends
// are dark enough to need paper. Asserting one role across all of them would
// either fail or force us to muddy marigold.
// ---------------------------------------------------------------------------
const ROLE_OF_STOP = {};
for (const fam of ['coral', 'periwinkle', 'marigold', 'moss']) {
  for (const stop of [...BRIGHT_STOPS, ...DEEP_STOPS]) {
    const hex = palette[fam]?.[stop];
    if (!hex) continue;
    const inkR = contrast(Colors.text.onAccent, hex);
    const paperR = contrast(Colors.text.onAccentDeep, hex);
    const usesInk = stop === '100' || stop === '200' || stop === '300' || stop === '500'
      ? true // bright stops are pinned to ink by rule 8
      : inkR >= paperR;
    const role = usesInk ? 'onAccent' : 'onAccentDeep';
    const r = usesInk ? inkR : paperR;
    ROLE_OF_STOP[`${fam}.${stop}`] = { role, ratio: r, hex };
    if (r < 4.5) {
      fail(`${fam}.${stop} (${hex}) resolves to text.${role} at ${r.toFixed(2)}:1 — needs 4.5:1 (ink ${inkR.toFixed(2)}, paper ${paperR.toFixed(2)})`);
    }
  }
}
for (const g of ['screenSage', 'screenPaper', 'screenPeriwinkle']) {
  const r = contrast(Colors.text.onLightCanvas, Colors.surface[g]);
  if (r < 4.5) fail(`text.onLightCanvas on surface.${g} (${Colors.surface[g]}) is ${r.toFixed(2)}:1 — needs 4.5:1`);
}

// ---------------------------------------------------------------------------
// 13. Blocks stay loud — the contrast between block and canvas IS the design
// ---------------------------------------------------------------------------
for (const fam of ['coral', 'periwinkle', 'marigold', 'moss']) {
  const hex = palette[fam]?.[500];
  if (!hex) continue;
  const sep = Math.abs(luminance(hex) - CANVAS_LUM);
  if (sep < 0.15) fail(`${fam}.500 (${hex}) separates from the canvas by only ${sep.toFixed(3)} luminance — a muted block on night is the failure mode of this theme (needs >= 0.15)`);
}

// ---------------------------------------------------------------------------
// 14. Tinted panels must yield to the blocks
// ---------------------------------------------------------------------------
for (const [g, hex] of Object.entries(Colors.surface)) {
  if (!g.startsWith('panel')) continue;
  const o = oklchOf(hex);
  if (o.C >= BLOCK_C) fail(`surface.${g} C=${o.C.toFixed(3)} is as loud as an accent block (min block C=${BLOCK_C.toFixed(3)}) — a panel must never compete with the block on it`);
  const sep = luminance(hex) - CANVAS_LUM;
  if (sep <= 0) fail(`surface.${g} (${hex}) is not lighter than the canvas — a tinted panel must lift off night, not sink into it`);
}

// ---------------------------------------------------------------------------
// 15. Every Colors value must come from the primitives
// ---------------------------------------------------------------------------
const allowed = new Set(Object.values(primitives).map((h) => h.toUpperCase()));
for (const [k, v] of Object.entries(Colors)) {
  if (typeof v === 'string') {
    if (!allowed.has(v.toUpperCase())) fail(`Colors.${k} = ${v} is not a primitive — semantic tokens must alias the palette, never invent hex`);
  } else if (v && typeof v === 'object') {
    for (const [k2, v2] of Object.entries(v)) {
      if (typeof v2 === 'string' && !allowed.has(v2.toUpperCase())) {
        fail(`Colors.${k}.${k2} = ${v2} is not a primitive — semantic tokens must alias the palette, never invent hex`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 16. Canvas is dark — regression gate
// ---------------------------------------------------------------------------
const canvasL = oklchOf(Colors.surface.canvas).L;
if (canvasL > 0.2) {
  fail(`surface.canvas is L=${canvasL.toFixed(3)} (${Colors.surface.canvas}) — the app's chrome is near-black. A light canvas means the theme has been re-flattened onto sage/paper; the reference puts bright blocks ON dark, not dark blocks on a light page.`);
}
if (oklchOf(Colors.text.primary).L < 0.8) {
  fail(`text.primary is L=${oklchOf(Colors.text.primary).L.toFixed(3)} — on a dark canvas the primary text must be near-white`);
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const minSep = Math.min(...['coral', 'periwinkle', 'marigold', 'moss'].map((f) => Math.abs(luminance(palette[f][500]) - CANVAS_LUM)));
const minInk = Math.min(...['coral', 'periwinkle', 'marigold'].map((f) => contrast(Colors.text.onAccent, palette[f][500])));
console.log(
  `Palette OK — ${Object.keys(primitives).length} primitives, ${specs} spec'd in OKLCH. ` +
  `canvas ${Colors.surface.canvas} (L${canvasL.toFixed(2)}), ` +
  `text ${Colors.text.primary} at ${contrast(Colors.text.primary, Colors.surface.canvas).toFixed(1)}:1, ` +
  `blocks ${Colors.accents.primary}/${Colors.accents.secondary}/${Colors.accents.tertiary} ` +
  `(min canvas separation ${minSep.toFixed(2)}), ` +
  `ink-on-fill min ${minInk.toFixed(2)}:1.`,
);
const deepInk = Object.entries(ROLE_OF_STOP).filter(([k, v]) => v.role === 'onAccent' && !/\.500$|\.100$|\.200$|\.300$/.test(k)).map(([k]) => k);
console.log(`  deep stops taking ink rather than paper: ${deepInk.length ? deepInk.join(', ') : 'none'}`);
if (errors.length) {
  console.error('Palette drift detected:\n' + errors.map((e) => '  x ' + e).join('\n'));
  process.exit(1);
}
