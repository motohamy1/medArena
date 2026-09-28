// Verifies the Tailwind bridge in tailwind.config.js resolves every name the
// app can legally use. Fails CI if a role is published with a malformed value,
// if a default-scale override has holes, or if a documented name went missing.
//
// tailwind.config.js does `require("./constants/Colors")` with no extension,
// which works under Tailwind's jiti loader but not under plain Node. The shim
// below teaches this script the same resolution so the config can be audited.
const Module = require('module');
const fs = require('fs');
const path = require('path');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  try {
    return origResolve.call(this, request, parent, ...rest);
  } catch (err) {
    if (request.startsWith('.') && parent && parent.filename) {
      const candidate = path.resolve(path.dirname(parent.filename), request + '.ts');
      if (fs.existsSync(candidate)) return candidate;
    }
    throw err;
  }
};

const cfg = require('../tailwind.config.js');
const c = cfg.theme.colors, e = cfg.theme.extend;

const flat = Object.entries(c).filter(([, v]) => typeof v === 'string');
const bad = flat.filter(([, v]) => !/^#[0-9a-fA-F]{6}$|^(transparent|currentColor|inherit)$/.test(v));
console.log('string colors: ' + flat.length + '   malformed: ' + bad.length);
for (const [k, v] of bad) console.log('   ! ' + k + ' = ' + JSON.stringify(v));

const undef = Object.entries(c).flatMap(([k, v]) =>
  v && typeof v === 'object' ? Object.entries(v).filter(([, v2]) => !v2).map(([k2]) => k + '.' + k2) : []);
console.log('undefined scale entries: ' + (undef.length ? undef.join(', ') : 'none'));

const NEED = [
  // surfaces
  'canvas', 'sunken', 'card', 'card-tint', 'raised', 'hairline', 'hairline-strong',
  'outline', 'block', 'panel-info', 'panel-danger', 'panel-warning', 'panel-success',
  'panel-quiet', 'screen-sage', 'screen-paper', 'screen-periwinkle',
  // accent blocks
  'primary', 'primary-deep', 'primary-tint', 'primary-text',
  'secondary', 'secondary-deep', 'secondary-tint', 'secondary-text',
  'tertiary', 'tertiary-deep', 'tertiary-tint',
  // status (dark-ground + light-ground pairs)
  'danger', 'danger-text', 'danger-tint', 'danger-on-light',
  'warning', 'warning-text', 'warning-tint', 'warning-on-light',
  'success', 'success-text', 'success-tint', 'success-on-light',
  'info', 'info-text', 'info-tint', 'info-on-light',
  // text
  'text-primary', 'text-secondary', 'text-muted', 'text-subtle', 'text-disabled',
  'text-on-accent', 'text-on-accent-deep', 'text-on-light',
  // raw families (charts, one-off fills)
  'sage', 'paper', 'night', 'coral', 'periwinkle', 'marigold', 'moss', 'specialty',
  // legacy names the existing call sites speak
  'background', 'deep-teal', 'teal-dark', 'teal-medium', 'surface-hover',
  'main', 'accent', 'accent-bright', 'accent-deep', 'ice', 'turquoise', 'lime',
  'lavender', 'pink', 'gold', 'terracotta', 'terracotta-deep', 'charcoal', 'ink',
  'gray-dark', 'gray-muted', 'gray-subtle', 'medicine-bg', 'medicine-card', 'island',
];
const missing = NEED.filter((n) => !c[n]);
console.log('missing expected names: ' + (missing.length ? missing.join(', ') : 'none'));

// Default-scale overrides must be complete or a stray `text-gray-800` silently
// resolves to nothing.
const SCALE = ['gray', 'slate', 'zinc', 'neutral', 'stone'];
const ASCALE = ['red', 'rose', 'orange', 'amber', 'yellow', 'green', 'emerald',
  'cyan', 'sky', 'blue', 'violet', 'purple', 'fuchsia', 'indigo'];
const holes = [
  ...SCALE.flatMap((s) => [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].filter((n) => !c[s] || !c[s][n]).map((n) => s + '-' + n)),
  ...ASCALE.flatMap((s) => [50, 100, 200, 300, 400, 500, 700, 800, 900, 950].filter((n) => !c[s] || !c[s][n]).map((n) => s + '-' + n)),
];
console.log('scale holes: ' + (holes.length ? holes.join(', ') : 'none'));

console.log('fonts:   ' + Object.keys(e.fontFamily).join(', '));
console.log('shadows: ' + Object.keys(e.boxShadow).join(', '));
console.log('radii:   ' + Object.keys(e.borderRadius).join(', '));

const failures = [
  ...bad.map(([k, v]) => `malformed color ${k} = ${JSON.stringify(v)}`),
  ...undef.map((k) => `undefined scale entry ${k}`),
  ...missing.map((k) => `missing expected name ${k}`),
  ...holes.map((k) => `scale hole ${k}`),
];
if (failures.length) {
  console.error('\nTheme bridge incomplete:\n' + failures.map((f) => '  x ' + f).join('\n'));
  process.exit(1);
}
console.log('\nTheme bridge OK — every published name resolves.');
