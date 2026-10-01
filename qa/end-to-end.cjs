const { spawnSync } = require('node:child_process');
const path = require('node:path');

// Current encrypted-archive journeys. The earlier archive/gallery suites target
// the retired plaintext UI and are kept only as historical fixtures.
for (const suite of ['private-archive', 'privacy-failures', 'passphrase-recovery', 'media-sharing-locks', 'large-media', 'physical-interactions', 'ui-polish', 'help-guide', 'sound-state', 'room-motion', 'room-controls']) {
  console.log(`\nTesting ${suite}`);
  const result = spawnSync(process.execPath, [path.join(__dirname, `${suite}.cjs`)], { stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('\nPASS: all eleven end-to-end suites.');
