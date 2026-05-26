#!/usr/bin/env node
/**
 * check-prereqs.js
 * Verifies that all required development tools are available on PATH.
 * Run with: node scripts/check-prereqs.js
 */

const { execSync } = require('child_process');

const tools = [
  { cmd: 'node --version', name: 'Node.js', hint: 'https://nodejs.org' },
  { cmd: 'npm --version', name: 'npm', hint: 'Included with Node.js' },
  { cmd: 'ng version --skip-confirmation', name: 'Angular CLI', hint: 'npm install -g @angular/cli' },
  { cmd: 'dotnet --version', name: '.NET SDK', hint: 'https://dotnet.microsoft.com/download' },
];

let allOk = true;

for (const { cmd, name, hint } of tools) {
  try {
    const version = execSync(cmd, { stdio: 'pipe' }).toString().trim().split('\n')[0];
    console.log(`  ✅  ${name.padEnd(14)} ${version}`);
  } catch {
    console.error(`  ❌  ${name.padEnd(14)} NOT FOUND — install from: ${hint}`);
    allOk = false;
  }
}

if (!allOk) {
  console.error('\n[ERROR] One or more prerequisites are missing. Please install them and retry.');
  process.exit(1);
}

console.log('\nAll prerequisites are present. Run `npm start` to launch the dev servers.');
