// Runs the screen-text audit over app/ + components/ and prints only the files
// that still carry dark text sites, so the report is actionable.
const { execFileSync } = require('child_process');
const path = require('path');
const out = execFileSync('node', [path.join(__dirname, 'audit-screen-text.cjs'), process.argv[2]], {
  encoding: 'utf8', maxBuffer: 1e8,
});
const blocks = out.split(/\n(?=== )/);
let total = 0;
for (const b of blocks) {
  const m = b.match(/=== (.+?) — (\d+) dark text site/);
  if (!m) continue;
  total += parseInt(m[2]);
  console.log(`\n${m[1]}  (${m[2]} sites)`);
  console.log(b.split('\n').slice(1).join('\n'));
}
console.log(`\nTOTAL dark text sites: ${total}`);
