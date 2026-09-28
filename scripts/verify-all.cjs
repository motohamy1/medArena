// Runs the full theme verification suite and prints one line per gate.
const { execSync, spawnSync } = require('child_process');
const ROOT = process.cwd();

const run = (label, cmd) => {
  const r = spawnSync(cmd, { cwd: ROOT, encoding: 'utf8', shell: true, maxBuffer: 1e8 });
  const out = (r.stdout || '') + (r.stderr || '');
  return { label, out, code: r.status };
};

const gates = [
  ['palette', 'node scripts/check-colors.js'],
  ['bridge', 'node scripts/verify-theme.js'],
  ['class-resolution', 'node scripts/audit-classes.cjs'],
  ['text-legibility', 'node scripts/audit-text.cjs --quiet'],
  ['block-text', 'node scripts/audit-block-text.cjs --quiet'],
  // Compiles the real stylesheet then asserts the utilities the app uses carry
  // theme values. This is the gate that would have caught `bg-teal` and
  // `text-white` generating nothing.
  ['css', `npx tailwindcss -i app/global.css -o "${process.env.COMMANDCODE_SCRATCHPAD}/out2.css" && node scripts/check-css.cjs`],
];

let failed = 0;
for (const [label, cmd] of gates) {
  const { out, code } = run(label, cmd);
  const errors = (out.match(/^  x /gm) || []).length;
  const ok = code === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${errors ? `  (${errors} violations)` : ''}`);
  console.log('      ' + (out.split('\n').filter((l) => l.trim() && !l.startsWith('      '))[0] || '').trim());
  if (!ok) console.log(out.split('\n').filter((l) => l.startsWith('  x ')).slice(0, 12).map((l) => '      ' + l).join('\n'));
}

// tsc
{
  const r = spawnSync('npx', ['tsc', '--noEmit'], { cwd: ROOT, encoding: 'utf8', shell: true });
  const n = ((r.stdout || '') + (r.stderr || '')).match(/error TS/g);
  const ok = !n;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  tsc${n ? `  (${n.length} errors)` : ''}`);
  if (!ok) console.log('      ' + ((r.stdout || '').split('\n').filter((l) => /error TS/.test(l)).slice(0, 8).join('\n      ')));
}

// eslint
{
  const r = spawnSync('npx', ['eslint', 'app', 'components', 'constants', 'utils', 'hooks', '--ext', '.ts,.tsx'], { cwd: ROOT, encoding: 'utf8', shell: true });
  const t = (r.stdout || '') + (r.stderr || '');
  const errs = (t.match(/\s(\d+)\s+error/g) || []).map((x) => parseInt(x.trim().split(/\s+/)[0])).reduce((a, b) => a + b, 0);
  const warns = (t.match(/\s(\d+)\s+warning/g) || []).map((x) => parseInt(x.trim().split(/\s+/)[0])).reduce((a, b) => a + b, 0);
  const ok = errs === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  eslint  (${errs} errors, ${warns} warnings)`);
  if (!ok) console.log('      ' + t.split('\n').filter((l) => /  error  /.test(l)).slice(0, 8).join('\n      '));
}

// Anton wiring — the display font is useless if it is never loaded
{
  const s = require('fs').readFileSync(ROOT + '/app/_layout.tsx', 'utf8');
  const wired = /import \{ Anton_400Regular \} from ["']@expo-google-fonts\/anton["']/.test(s) && /Anton_400Regular,/.test(s);
  if (!wired) failed++;
  console.log(`${wired ? 'PASS' : 'FAIL'}  anton  (imported and registered in app/_layout.tsx)`);
}

// dark canvas — rule 16 lives here too so a regression fails the whole gate
{
  const hexToRgb = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255);
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lum = (h) => { const [r, g, b] = hexToRgb(h).map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const { Colors } = require(ROOT + '/constants/Colors.ts');
  const dark = lum(Colors.surface.canvas) < 0.09;
  if (!dark) failed++;
  console.log(`${dark ? 'PASS' : 'FAIL'}  canvas  (${Colors.surface.canvas} is near-black)`);
}

console.log(failed === 0 ? '\nAll gates green.' : `\n${failed} gate(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
